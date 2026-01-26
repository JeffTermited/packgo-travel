import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { extractTourInfoWithManus } from "./manusApi";
import { quickExtractTourInfo } from "./webScraper";
import { sendBookingConfirmationEmail } from "./email";
import * as auth from "./auth";
import { createToken } from "./jwt";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  
  // Authentication router (Email/Password + Google OAuth)
  auth: router({
    // Get current user
    me: publicProcedure.query(opts => opts.ctx.user),
    
    // Register with email/password
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          await auth.createUser(input.email, input.password, input.name);
          
          // Auto login after registration
          const user = await auth.authenticateUser(input.email, input.password);
          
          // Create JWT token
          const token = createToken({
            userId: user.id,
            email: user.email,
            name: user.name || undefined,
            role: user.role,
          });
          
          // Set cookie
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, token, { 
            ...cookieOptions, 
            maxAge: 365 * 24 * 60 * 60 * 1000 
          });
          
          return { success: true, user: { id: user.id, email: user.email, name: user.name } };
        } catch (error: any) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message || 'Registration failed',
          });
        }
      }),
    
    // Login with email/password
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
        rememberMe: z.boolean().optional().default(false),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const user = await auth.authenticateUser(input.email, input.password);
          
          // Determine token expiry based on rememberMe option
          // rememberMe: true -> 30 days, false -> 7 days
          const maxAge = input.rememberMe 
            ? 30 * 24 * 60 * 60 * 1000  // 30 days
            : 7 * 24 * 60 * 60 * 1000;  // 7 days
          
          // Create JWT token with expiry
          const token = createToken(
            {
              userId: user.id,
              email: user.email,
              name: user.name || undefined,
              role: user.role,
            },
            input.rememberMe ? '30d' : '7d'
          );
          
          // Set cookie
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, token, { 
            ...cookieOptions, 
            maxAge 
          });
          
          return { success: true, user: { id: user.id, email: user.email, name: user.name } };
        } catch (error: any) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: error.message || 'Login failed',
          });
        }
      }),
    
    // Request password reset
    requestPasswordReset: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        try {
          const result = await auth.requestPasswordReset(input.email);
          // TODO: Send reset email with token
          // For now, return token in response (in production, send via email)
          return result;
        } catch (error: any) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message || 'Password reset request failed',
          });
        }
      }),
    
    // Reset password with token
    resetPassword: publicProcedure
      .input(z.object({
        token: z.string(),
        newPassword: z.string().min(8),
      }))
      .mutation(async ({ input }) => {
        try {
          await auth.resetPassword(input.token, input.newPassword);
          return { success: true };
        } catch (error: any) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message || 'Password reset failed',
          });
        }
      }),
    
    // Logout
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    
    // Update user profile
    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().min(2).max(50).optional(),
          phone: z.string().max(20).optional(),
          address: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const updated = await db.updateUserProfile(ctx.user.id, input);
        if (!updated) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update profile",
          });
        }
        return updated;
      }),
    
    // Upload avatar
    uploadAvatar: protectedProcedure
      .input(
        z.object({
          avatarUrl: z.string().url(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const updated = await db.updateUserAvatar(ctx.user.id, input.avatarUrl);
        if (!updated) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to upload avatar",
          });
        }
        return updated;
      }),
    
    // Delete avatar
    deleteAvatar: protectedProcedure
      .mutation(async ({ ctx }) => {
        const updated = await db.updateUserAvatar(ctx.user.id, null);
        if (!updated) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete avatar",
          });
        }
        return updated;
      }),
  }),
  
  // AI Travel Advisor router
  ai: router({
    chat: publicProcedure
      .input(
        z.object({
          message: z.string(),
          conversationHistory: z.array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string(),
            })
          ).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { message, conversationHistory = [] } = input;

        // Build conversation history for LLM
        const messages = [
          {
            role: "system" as const,
            content: `You are a professional travel advisor for PACK&GO Travel Agency. Your role is to:
1. Help customers plan their trips and recommend destinations
2. Answer questions about travel packages, visa requirements, and travel tips
3. Provide personalized recommendations based on customer preferences
4. Be friendly, professional, and helpful
5. Always respond in Traditional Chinese (繁體中文)

Important guidelines:
- Focus on travel-related topics only
- Provide specific, actionable advice
- Ask clarifying questions when needed
- Suggest PACK&GO's services when appropriate`,
          },
          ...conversationHistory.slice(-10).map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          {
            role: "user" as const,
            content: message,
          },
        ];

        try {
          const response = await invokeLLM({ messages });
          const assistantMessage = response.choices[0]?.message?.content || "抱歉,我無法處理您的請求。請稍後再試。";

          return {
            response: assistantMessage,
          };
        } catch (error) {
          console.error("[AI Chat] Error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "無法連接到 AI 服務,請稍後再試。",
          });
        }
      }),
  }),

  // Tour management router (admin only)
  tours: router({
    // Get all tours (public)
    list: publicProcedure
      .input(
        z
          .object({
            category: z.string().optional(),
            status: z.string().optional(),
            featured: z.boolean().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return await db.getAllTours(input);
      }),

    // Get single tour by ID (public)
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const tour = await db.getTourById(input.id);
        if (!tour) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Tour not found",
          });
        }
        return tour;
      }),

    // Search tours with filters (public)
    search: publicProcedure
      .input(
        z.object({
          destination: z.string().optional(),
          minDays: z.number().optional(),
          maxDays: z.number().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          airlines: z.array(z.string()).optional(),
          hotelGrades: z.array(z.string()).optional(),
          specialActivities: z.array(z.string()).optional(),
          sortBy: z.enum(["popular", "price_asc", "price_desc", "days_asc", "days_desc"]).optional(),
          page: z.number().min(1).default(1),
          pageSize: z.number().min(1).max(100).default(12),
        })
      )
      .query(async ({ input }) => {
        const { page, pageSize, ...filters } = input;
        const offset = (page - 1) * pageSize;
        
        // Get total count for pagination
        const allTours = await db.searchTours(filters);
        const total = allTours.length;
        const totalPages = Math.ceil(total / pageSize);
        
        // Get paginated results
        const tours = allTours.slice(offset, offset + pageSize);
        
        return {
          tours,
          pagination: {
            page,
            pageSize,
            total,
            totalPages,
            hasMore: page < totalPages,
          },
        };
      }),

    // Create new tour (admin only)
    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1),
          destination: z.string().min(1),
          destinationCountry: z.string().min(1),
          destinationCity: z.string().min(1),
          description: z.string().min(1),
          duration: z.number().min(1),
          price: z.number().min(0),
          imageUrl: z.string().optional(),
          category: z.enum(["group", "custom", "package", "cruise", "theme"]),
          status: z.enum(["active", "inactive", "soldout"]).default("active"),
          featured: z.number().min(0).max(1).default(0),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          maxParticipants: z.number().optional(),
          highlights: z.string().optional(),
          includes: z.string().optional(),
          excludes: z.string().optional(),
          // New fields for enhanced tour data
          productCode: z.string().optional(),
          promotionText: z.string().optional(),
          tags: z.string().optional(),
          departureCountry: z.string().optional(),
          departureCity: z.string().optional(),
          departureAirportCode: z.string().optional(),
          departureAirportName: z.string().optional(),
          destinationRegion: z.string().optional(),
          destinationAirportCode: z.string().optional(),
          destinationAirportName: z.string().optional(),
          destinationDescription: z.string().optional(),
          nights: z.number().optional(),
          priceUnit: z.string().optional(),
          availableSeats: z.number().optional(),
          outboundAirline: z.string().optional(),
          outboundFlightNo: z.string().optional(),
          outboundDepartureTime: z.string().optional(),
          outboundArrivalTime: z.string().optional(),
          outboundFlightDuration: z.string().optional(),
          inboundAirline: z.string().optional(),
          inboundFlightNo: z.string().optional(),
          inboundDepartureTime: z.string().optional(),
          inboundArrivalTime: z.string().optional(),
          inboundFlightDuration: z.string().optional(),
          hotelName: z.string().optional(),
          hotelGrade: z.string().optional(),
          hotelNights: z.number().optional(),
          hotelLocation: z.string().optional(),
          hotelDescription: z.string().optional(),
          hotelFacilities: z.string().optional(),
          hotelRoomType: z.string().optional(),
          hotelRoomSize: z.string().optional(),
          hotelCheckIn: z.string().optional(),
          hotelCheckOut: z.string().optional(),
          hotelSpecialOffers: z.string().optional(),
          hotelImages: z.string().optional(),
          hotelWebsite: z.string().optional(),
          attractions: z.string().optional(),
          dailyItinerary: z.string().optional(),
          optionalTours: z.string().optional(),
          specialReminders: z.string().optional(),
          notes: z.string().optional(),
          safetyGuidelines: z.string().optional(),
          flightRules: z.string().optional(),
          galleryImages: z.string().optional(),
          sourceUrl: z.string().optional(),
          isAutoGenerated: z.number().optional(),
          airline: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Check if user is admin
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can create tours",
          });
        }

        const tour = await db.createTour({
          ...input,
          createdBy: ctx.user.id,
        });

        return tour;
      }),

    // Update tour (admin only)
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).optional(),
          destination: z.string().min(1).optional(),
          description: z.string().min(1).optional(),
          duration: z.number().min(1).optional(),
          price: z.number().min(0).optional(),
          imageUrl: z.string().optional(),
          category: z.enum(["group", "custom", "package", "cruise", "theme"]).optional(),
          status: z.enum(["active", "inactive", "soldout"]).optional(),
          featured: z.number().min(0).max(1).optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          maxParticipants: z.number().optional(),
          currentParticipants: z.number().optional(),
          highlights: z.string().optional(),
          includes: z.string().optional(),
          excludes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Check if user is admin
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can update tours",
          });
        }

        const { id, ...updates } = input;
        const tour = await db.updateTour(id, updates);

        return tour;
      }),

    // Delete tour (admin only)
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Check if user is admin
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can delete tours",
          });
        }

        await db.deleteTour(input.id);

        return { success: true };
      }),

    // Batch delete tours (admin only)
    batchDelete: protectedProcedure
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(async ({ ctx, input }) => {
        // Check if user is admin
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can delete tours",
          });
        }

        await db.batchDeleteTours(input.ids);

        return { success: true };
      }),

    // Get tour generation jobs for current user
    getMyGenerationJobs: protectedProcedure
      .query(async ({ ctx }) => {
        const { getUserTourGenerationJobs } = await import("./queue");
        return await getUserTourGenerationJobs(ctx.user.id);
      }),

    // Auto-generate tour from URL (admin only) - Complete version with all AI agents
    autoGenerateComplete: protectedProcedure
      .input(z.object({ 
        url: z.string().url(),
        autoSave: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user is admin
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can auto-generate tours",
          });
        }

        const startTime = Date.now();
        console.log("[AutoGenerateComplete] Starting complete generation from URL:", input.url);

        try {
          // Import MasterAgent
          const { MasterAgent } = await import("./agents/masterAgent");
          const masterAgent = new MasterAgent();
          
          // Execute complete tour generation with all AI agents
          const result = await masterAgent.execute(
            input.url,
            ctx.user.id,
            (step, percentage) => {
              console.log(`[AutoGenerateComplete] Progress: ${step} (${percentage}%)`);
            }
          );
          
          if (!result.success || !result.data) {
            throw new Error(result.error || "Tour generation failed");
          }
          
          const generationTime = (Date.now() - startTime) / 1000;
          console.log(`[AutoGenerateComplete] Generation completed in ${generationTime.toFixed(1)} seconds`);

          // Transform MasterAgent result to database schema
          const masterData = result.data;
          
          // Parse JSON strings
          const highlights = JSON.parse(masterData.highlights || "[]");
          const keyFeatures = JSON.parse(masterData.keyFeatures || "[]");
          const poeticContent = JSON.parse(masterData.poeticContent || "{}");
          const colorTheme = JSON.parse(masterData.colorTheme || "{}");
          
          // Prepare tour data for database
          const tourData = {
            // Basic Information
            title: masterData.title || "未命名行程",
            productCode: masterData.productCode || "",
            description: masterData.description || "",
            promotionText: masterData.heroSubtitle || "",
            tags: JSON.stringify(masterData.tags || []),
            
            // Location - Departure
            departureCountry: "台灣",
            departureCity: masterData.departureCity || "桃園",
            departureAirportCode: "TPE",
            departureAirportName: "桃園國際機場",
            
            // Location - Destination
            destinationCountry: masterData.destinationCountry || "未指定",
            destinationCity: masterData.destinationCity || "未指定",
            destinationRegion: "",
            destinationAirportCode: "",
            destinationAirportName: "",
            destination: `${masterData.destinationCountry || ""} ${masterData.destinationCity || ""}`.trim() || "未指定",
            destinationDescription: "",
            
            // Duration
            duration: masterData.days || 1,
            nights: masterData.nights || 0,
            
            // Pricing
            price: masterData.price || 0,
            priceUnit: "人/起",
            availableSeats: null,
            
            // Flight - Empty for now (will be filled by FlightAgent)
            outboundAirline: "",
            outboundFlightNo: "",
            outboundDepartureTime: "",
            outboundArrivalTime: "",
            outboundFlightDuration: "",
            inboundAirline: "",
            inboundFlightNo: "",
            inboundDepartureTime: "",
            inboundArrivalTime: "",
            inboundFlightDuration: "",
            airline: "",
            
            // Accommodation - Empty for now (will be filled by HotelAgent)
            hotelName: "",
            hotelGrade: "",
            hotelNights: null,
            hotelLocation: "",
            hotelDescription: "",
            hotelFacilities: JSON.stringify([]),
            hotelRoomType: "",
            hotelRoomSize: "",
            hotelCheckIn: "",
            hotelCheckOut: "",
            hotelSpecialOffers: JSON.stringify([]),
            hotelWebsite: "",
            
            // Attractions
            attractions: JSON.stringify([]),
            
            // Daily Itinerary
            dailyItinerary: JSON.stringify([]),
            
            // Pricing Details
            includes: JSON.stringify([]),
            excludes: JSON.stringify([]),
            optionalTours: JSON.stringify([]),
            
            // Highlights (from MasterAgent)
            highlights: JSON.stringify(highlights),
            
            // Notes
            specialReminders: "",
            notes: "",
            safetyGuidelines: "",
            flightRules: "",
            
            // Images (Hero image from MasterAgent)
            imageUrl: masterData.heroImage || "",
            
            // AI-generated rich content (Sipincollection style)
            heroImage: masterData.heroImage || "",
            heroImageAlt: masterData.heroImageAlt || "",
            heroSubtitle: masterData.heroSubtitle || "",
            colorTheme: JSON.stringify(colorTheme),
            keyFeatures: JSON.stringify(keyFeatures),
            poeticContent: JSON.stringify(poeticContent),
            
            // Detailed sections from specialized agents
            itineraryDetailed: masterData.itineraryDetailed || "",
            costExplanation: masterData.costExplanation || "",
            noticeDetailed: masterData.noticeDetailed || "",
            hotels: masterData.hotels || "",
            meals: masterData.meals || "",
            flights: masterData.flights || "",
            
            // Metadata
            originalityScore: masterData.originalityScore || 0,
            
            // Source
            sourceUrl: input.url,
            isAutoGenerated: 1,
            
            // Status - 預設為下架,讓管理員確認後再上架
            status: "inactive" as const,
            
            // Category - 預設為 group
            category: "group" as const,
          };

          // 如果啟用自動儲存,將行程儲存到資料庫
          let savedTour = null;
          if (input.autoSave) {
            console.log("[AutoGenerateComplete] Auto-saving tour to database...");
            savedTour = await db.createTour({
              ...tourData,
              createdBy: ctx.user.id,
            });
            console.log("[AutoGenerateComplete] Tour saved with ID:", savedTour.id);
          }

          const totalTime = (Date.now() - startTime) / 1000;
          console.log(`[AutoGenerateComplete] Total time: ${totalTime.toFixed(1)} seconds`);

          return {
            success: true,
            data: savedTour || tourData,
            message: `行程生成成功!耗時 ${totalTime.toFixed(1)} 秒`,
            tourId: savedTour?.id,
          };
        } catch (error: any) {
          const totalTime = (Date.now() - startTime) / 1000;
          console.error("[AutoGenerateComplete] Error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "行程生成失敗",
          });
        }
      }),


  }),

  // Booking management router
  bookings: router({
    // Create new booking
    create: protectedProcedure
      .input(
        z.object({
          tourId: z.number(),
          participants: z.number().min(1),
          contactName: z.string().min(1),
          contactEmail: z.string().email(),
          contactPhone: z.string().min(1),
          specialRequests: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Get tour details
        const tour = await db.getTourById(input.tourId);
        if (!tour) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Tour not found",
          });
        }

        // Calculate total amount
        const totalAmount = tour.price * input.participants;

        // Create booking
        const booking = await db.createBooking({
          ...input,
          userId: ctx.user.id,
          totalPrice: totalAmount,
          bookingStatus: "pending",
        });

        // Send confirmation email
        await sendBookingConfirmationEmail({
          to: input.contactEmail,
          bookingId: booking.id,
          tourTitle: tour.title,
          participants: input.participants,
          totalAmount,
        });

        return booking;
      }),

    // Get user's bookings
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserBookings(ctx.user.id);
    }),

    // Get single booking
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const booking = await db.getBookingById(input.id);
        if (!booking) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Booking not found",
          });
        }

        // Check if user owns this booking
        if (booking.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to view this booking",
          });
        }

        return booking;
      }),

    // Cancel booking
    cancel: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const booking = await db.getBookingById(input.id);
        if (!booking) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Booking not found",
          });
        }

        // Check if user owns this booking
        if (booking.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to cancel this booking",
          });
        }

        // Update booking status
        await db.updateBooking(input.id, { status: "cancelled" });

        return { success: true };
      }),

    // Admin: Get all bookings
    adminList: protectedProcedure.query(async ({ ctx }) => {
      // Check if user is admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view all bookings",
        });
      }

      return await db.getAllBookings();
    }),

    // Admin: Update booking status
    adminUpdateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Check if user is admin
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can update booking status",
          });
        }

        const { id, status } = input;
        await db.updateBooking(id, { status });

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
