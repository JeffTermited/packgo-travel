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

    // Submit async tour generation job (admin only)
    submitAsyncGeneration: protectedProcedure
      .input(z.object({ 
        url: z.string().url(),
        forceRegenerate: z.boolean().optional().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user is admin
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can auto-generate tours",
          });
        }

        const { addTourGenerationJob } = await import("./queue");
        const requestId = `gen_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        const job = await addTourGenerationJob({
          url: input.url,
          userId: ctx.user.id,
          requestId,
          forceRegenerate: input.forceRegenerate,
        });

        console.log(`[SubmitAsyncGeneration] Job submitted: ${job.id}`);

        return {
          jobId: job.id!,
          requestId,
          message: "行程生成任務已提交，請稍候...",
        };
      }),

    // Get generation job status (admin only)
    getGenerationStatus: protectedProcedure
      .input(z.object({ 
        jobId: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        // Check if user is admin
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can check generation status",
          });
        }

        const { getTourGenerationJobStatus } = await import("./queue");
        const status = await getTourGenerationJobStatus(input.jobId);

        if (status.status === "not_found") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Generation job not found",
          });
        }

        return status;
      }),

    // Auto-generate tour from URL (admin only) - Complete version with all AI agents
    // Supports preview mode: when previewOnly=true, returns data without saving
    autoGenerateComplete: protectedProcedure
      .input(z.object({ 
        url: z.string().url(),
        autoSave: z.boolean().default(false), // 預設不自動儲存，讓管理員預覽後確認
        previewOnly: z.boolean().default(true), // 預設為預覽模式
        taskId: z.string().optional(), // 前端傳入的 taskId，用於進度追蹤
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
        // Use provided taskId or generate a new one for progress tracking
        const taskId = input.taskId || `gen_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        console.log("[AutoGenerateComplete] Starting complete generation from URL:", input.url);
        console.log("[AutoGenerateComplete] Task ID:", taskId);

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
            },
            taskId // Pass taskId for progress tracking
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
            originalityScore: String(masterData.originalityScore || 0),
            
            // Source
            sourceUrl: input.url,
            isAutoGenerated: 1,
            
            // Status - 預設為下架,讓管理員確認後再上架
            status: "inactive" as const,
            
            // Category - 預設為 group
            category: "group" as const,
          };

          // 預覽模式：只返回資料，不儲存到資料庫
          if (input.previewOnly) {
            const totalTime = (Date.now() - startTime) / 1000;
            console.log(`[AutoGenerateComplete] Preview mode - Total time: ${totalTime.toFixed(1)} seconds`);
            
            return {
              success: true,
              data: {
                ...tourData,
                // 額外返回原始 MasterAgent 資料以便預覽
                poeticTitle: masterData.poeticTitle,
                featureImages: masterData.featureImages,
                executionReport: result.executionReport,
              },
              message: `行程預覽已生成！耗時 ${totalTime.toFixed(1)} 秒`,
              tourId: null,
              previewMode: true,
              taskId, // 返回 taskId 以便前端追蹤進度
            };
          }

          // 如果啟用自動儲存,將行程儲存到資料庫
          let savedTour = null;
          if (input.autoSave || !input.previewOnly) {
            console.log("[AutoGenerateComplete] Saving tour to database...");
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
            message: `行程生成成功！耗時 ${totalTime.toFixed(1)} 秒`,
            tourId: savedTour?.id,
            previewMode: false,
            taskId, // 返回 taskId 以便前端追蹤進度
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

    // Auto-generate tour from URL (admin only) - Fast version with auto-save
    autoGenerate: protectedProcedure
      .input(z.object({ 
        url: z.string().url(),
        autoSave: z.boolean().default(true), // 預設自動儲存
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
        console.log("[AutoGenerate] Starting fast extraction from URL:", input.url);

        try {
          // 使用快速提取方式(fetch + LLM),約 30 秒
          const extractedData = await quickExtractTourInfo(input.url);
          
          const extractionTime = (Date.now() - startTime) / 1000;
          console.log(`[AutoGenerate] Extraction completed in ${extractionTime.toFixed(1)} seconds`);

          // Transform extracted data to match database schema
          const basicInfo = extractedData.basicInfo || {};
          const location = extractedData.location || {};
          const duration = extractedData.duration || {};
          const pricing = extractedData.pricing || {};
          const flight = extractedData.flight || {};
          const outbound = flight.outbound || {};
          const inbound = flight.inbound || {};
          const accommodation = extractedData.accommodation || {};
          const pricingDetails = extractedData.pricingDetails || {};
          const notes = extractedData.notes || {};

          // Prepare tour data for database
          const tourData = {
            // Basic Information
            title: basicInfo.title || "未命名行程",
            productCode: basicInfo.productCode || "",
            description: basicInfo.description || "",
            promotionText: basicInfo.promotionText || "",
            tags: JSON.stringify(basicInfo.tags || []),
            
            // Location - Departure
            departureCountry: location.departureCountry || "台灣",
            departureCity: location.departureCity || "桃園",
            departureAirportCode: location.departureAirportCode || "TPE",
            departureAirportName: location.departureAirportName || "桃園國際機場",
            
            // Location - Destination
            destinationCountry: location.destinationCountry || "未指定",
            destinationCity: location.destinationCity || "未指定",
            destinationRegion: location.destinationRegion || "",
            destinationAirportCode: location.destinationAirportCode || "",
            destinationAirportName: location.destinationAirportName || "",
            destination: `${location.destinationCountry || ""} ${location.destinationCity || ""}`.trim() || "未指定",
            destinationDescription: location.destinationDescription || "",
            
            // Duration
            duration: parseInt(duration.days) || 1,
            nights: parseInt(duration.nights) || (parseInt(duration.days) - 1) || 0,
            
            // Pricing
            price: parseInt(String(pricing.price).replace(/,/g, "")) || 0,
            priceUnit: pricing.priceUnit || "人/起",
            availableSeats: parseInt(pricing.availableSeats) || null,
            
            // Flight - Outbound
            outboundAirline: outbound.airline || "",
            outboundFlightNo: outbound.flightNo || "",
            outboundDepartureTime: outbound.departureTime || "",
            outboundArrivalTime: outbound.arrivalTime || "",
            outboundFlightDuration: outbound.duration || "",
            
            // Flight - Inbound
            inboundAirline: inbound.airline || "",
            inboundFlightNo: inbound.flightNo || "",
            inboundDepartureTime: inbound.departureTime || "",
            inboundArrivalTime: inbound.arrivalTime || "",
            inboundFlightDuration: inbound.duration || "",
            
            // Legacy airline field
            airline: outbound.airline || "",
            
            // Accommodation
            hotelName: accommodation.hotelName || "",
            hotelGrade: accommodation.hotelGrade || "",
            hotelNights: parseInt(accommodation.hotelNights) || null,
            hotelLocation: accommodation.hotelLocation || "",
            hotelDescription: accommodation.hotelDescription || "",
            hotelFacilities: JSON.stringify(accommodation.hotelFacilities || []),
            hotelRoomType: accommodation.hotelRoomType || "",
            hotelRoomSize: accommodation.hotelRoomSize || "",
            hotelCheckIn: accommodation.hotelCheckIn || "",
            hotelCheckOut: accommodation.hotelCheckOut || "",
            hotelSpecialOffers: JSON.stringify(accommodation.hotelSpecialOffers || []),
            hotelWebsite: accommodation.hotelWebsite || "",
            
            // Attractions
            attractions: JSON.stringify(extractedData.attractions || []),
            
            // Daily Itinerary
            dailyItinerary: JSON.stringify(extractedData.dailyItinerary || []),
            
            // Pricing Details
            includes: JSON.stringify(pricingDetails.includes || []),
            excludes: JSON.stringify(pricingDetails.excludes || []),
            optionalTours: JSON.stringify(pricingDetails.optionalTours || []),
            
            // Highlights
            highlights: JSON.stringify(extractedData.highlights || []),
            
            // Notes
            specialReminders: notes.specialReminders || "",
            notes: notes.notes || "",
            safetyGuidelines: notes.safetyGuidelines || "",
            flightRules: notes.flightRules || "",
            
            // Images
            imageUrl: extractedData.imageUrl || "",
            
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
            console.log("[AutoGenerate] Auto-saving tour to database...");
            savedTour = await db.createTour({
              ...tourData,
              createdBy: ctx.user.id, // 添加建立者 ID
            });
            console.log("[AutoGenerate] Tour saved with ID:", savedTour.id);
          }

          const totalTime = (Date.now() - startTime) / 1000;
          console.log(`[AutoGenerate] Total time: ${totalTime.toFixed(1)} seconds`);

          return {
            success: true,
            data: savedTour || tourData,
            message: `行程提取成功!耗時 ${totalTime.toFixed(1)} 秒`,
            tourId: savedTour?.id,
          };
        } catch (error: any) {
          const totalTime = (Date.now() - startTime) / 1000;
          console.error("[AutoGenerate] Error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "行程提取失敗",
          });
        }
      }),

    // Save tour from preview (admin only)
    // Used after previewing generated tour data
    saveFromPreview: protectedProcedure
      .input(z.object({
        tourData: z.any(), // The tour data from preview
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user is admin
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can save tours",
          });
        }

        console.log("[SaveFromPreview] Saving tour from preview...");

        try {
          const tourData = input.tourData;
          
          // Remove preview-only fields
          const { poeticTitle, featureImages, executionReport, ...savableData } = tourData;
          
          // Save to database
          const savedTour = await db.createTour({
            ...savableData,
            createdBy: ctx.user.id,
          });

          console.log("[SaveFromPreview] Tour saved with ID:", savedTour.id);

          return {
            success: true,
            tourId: savedTour.id,
            message: "行程已成功儲存！",
          };
        } catch (error: any) {
          console.error("[SaveFromPreview] Error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "儲存行程失敗",
          });
        }
      }),

    // Toggle tour status (admin only)
    toggleStatus: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Check if user is admin
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can toggle tour status",
          });
        }

        // Get current tour
        const tour = await db.getTourById(input.id);
        if (!tour) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Tour not found",
          });
        }

        // Toggle status: active <-> inactive
        const newStatus = tour.status === "active" ? "inactive" : "active";

        // Update tour status
        await db.updateTour(input.id, { status: newStatus });

        return {
          success: true,
          newStatus,
          message: `行程已${newStatus === "active" ? "上架" : "下架"}`,
        };
      }),

    // Toggle featured status (admin only)
    toggleFeatured: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const tour = await db.getTourById(input.id);
        if (!tour) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Tour not found",
          });
        }

        const newFeatured = tour.featured === 1 ? 0 : 1;
        await db.updateTour(input.id, { featured: newFeatured });

        return {
          success: true,
          featured: newFeatured === 1,
          message: `行程已${newFeatured === 1 ? "設為精選" : "取消精選"}`,
        };
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
          tourId: input.tourId,
          departureId: 0, // TODO: Add departure selection
          userId: ctx.user.id,
          customerName: input.contactName,
          customerEmail: input.contactEmail,
          customerPhone: input.contactPhone,
          numberOfAdults: input.participants,
          numberOfChildrenWithBed: 0,
          numberOfChildrenNoBed: 0,
          numberOfInfants: 0,
          numberOfSingleRooms: 0,
          totalPrice: totalAmount,
          depositAmount: Math.floor(totalAmount * 0.2), // 20% deposit
          remainingAmount: Math.floor(totalAmount * 0.8),
          message: input.specialRequests,
          bookingStatus: "pending",
        });

        // Send confirmation email
        await sendBookingConfirmationEmail({
          to: input.contactEmail,
          customerName: input.contactName,
          customerEmail: input.contactEmail,
          bookingId: booking.id,
          tourTitle: tour.title,
          departureDate: "TBD", // TODO: Add departure date selection
          returnDate: "TBD", // TODO: Calculate return date
          numberOfAdults: input.participants,
          numberOfChildren: 0,
          numberOfInfants: 0,
          totalPrice: totalAmount,
          depositAmount: Math.floor(totalAmount * 0.2),
          remainingAmount: Math.floor(totalAmount * 0.8),
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

    // Create Stripe checkout session
    createCheckoutSession: protectedProcedure
      .input(
        z.object({
          bookingId: z.number(),
          paymentType: z.enum(["deposit", "remaining"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const booking = await db.getBookingById(input.bookingId);
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
            message: "You don't have permission to pay for this booking",
          });
        }

        const amount = input.paymentType === "deposit" ? booking.depositAmount : booking.remainingAmount;
        const description = input.paymentType === "deposit" ? "訂金" : "尾款";

        // TODO: Implement Stripe checkout session creation
        // For now, return a mock URL
        return {
          url: `https://checkout.stripe.com/pay/mock-${input.bookingId}-${input.paymentType}`,
        };
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
        await db.updateBooking(input.id, { bookingStatus: "cancelled" });

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
        await db.updateBooking(id, { bookingStatus: status });

        return { success: true };
      }),
  }),

  // Departures management router
  departures: router({
    // Get all departures for a tour
    list: publicProcedure
      .input(z.object({ tourId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTourDepartures(input.tourId);
      }),

    // Alias for list (for backward compatibility)
    listByTour: publicProcedure
      .input(z.object({ tourId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTourDepartures(input.tourId);
      }),

    // Get single departure
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getDepartureById(input.id);
      }),

    // Create new departure (admin only)
    create: adminProcedure
      .input(
        z.object({
          tourId: z.number(),
          departureDate: z.date(),
          returnDate: z.date(),
          totalSlots: z.number(),
          adultPrice: z.number(),
          childPriceWithBed: z.number().optional(),
          childPriceNoBed: z.number().optional(),
          infantPrice: z.number().optional(),
          singleRoomSupplement: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createDeparture(input);
      }),

    // Update departure (admin only)
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          departureDate: z.date().optional(),
          returnDate: z.date().optional(),
          totalSlots: z.number().optional(),
          adultPrice: z.number().optional(),
          childPriceWithBed: z.number().optional(),
          childPriceNoBed: z.number().optional(),
          infantPrice: z.number().optional(),
          singleRoomSupplement: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return await db.updateDeparture(id, updates);
      }),

    // Delete departure (admin only)
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteDeparture(input.id);
        return { success: true };
      }),
  }),

  // Inquiries management router
  inquiries: router({
    // Get all inquiries (admin only)
    list: adminProcedure.query(async () => {
      return await db.getAllInquiries();
    }),

    // Get single inquiry
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const inquiry = await db.getInquiryById(input.id);
        if (!inquiry) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Inquiry not found",
          });
        }
        // Check if user owns this inquiry or is admin
        if (inquiry.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to view this inquiry",
          });
        }
        return inquiry;
      }),

    // Create new inquiry
    create: publicProcedure
      .input(
        z.object({
          customerName: z.string().min(1),
          customerEmail: z.string().email(),
          customerPhone: z.string().optional(),
          subject: z.string().min(1),
          message: z.string().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await db.createInquiry({
          ...input,
          inquiryType: "general",
          userId: ctx.user?.id,
          status: "new",
        });
      }),

    // Update inquiry status (admin only)
    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["new", "in_progress", "replied", "resolved", "closed"]),
        })
      )
      .mutation(async ({ input }) => {
        const { id, status } = input;
        return await db.updateInquiry(id, { status });
      }),

    // Alias for updateStatus (for backward compatibility)
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["new", "in_progress", "replied", "resolved", "closed"]),
        })
      )
      .mutation(async ({ input }) => {
        const { id, status } = input;
        return await db.updateInquiry(id, { status });
      }),

    // Get messages for an inquiry
    getMessages: protectedProcedure
      .input(z.object({ inquiryId: z.number() }))
      .query(async ({ ctx, input }) => {
        const inquiry = await db.getInquiryById(input.inquiryId);
        if (!inquiry) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Inquiry not found",
          });
        }
        // Check if user owns this inquiry or is admin
        if (inquiry.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to view these messages",
          });
        }
        return await db.getInquiryMessages(input.inquiryId);
      }),

    // Add message to inquiry
    addMessage: protectedProcedure
      .input(
        z.object({
          inquiryId: z.number(),
          message: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const inquiry = await db.getInquiryById(input.inquiryId);
        if (!inquiry) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Inquiry not found",
          });
        }
        // Check if user owns this inquiry or is admin
        if (inquiry.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to add messages to this inquiry",
          });
        }
        return await db.createInquiryMessage({
          inquiryId: input.inquiryId,
          senderId: ctx.user.id,
          senderType: ctx.user.role === "admin" ? "admin" : "customer",
          message: input.message,
        });
       }),
  }),

  // Newsletter subscription router
  newsletter: router({
    // Subscribe to newsletter
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        // TODO: Implement newsletter subscription logic
        console.log(`Newsletter subscription: ${input.email}`);
        return { success: true, message: "訂閱成功！感謝您的支持" };
      }),
  }),

  // Admin dashboard router
  admin: router({
    // Get dashboard statistics
    getStats: adminProcedure.query(async () => {
      // TODO: Implement dashboard statistics logic
      return {
        totalTours: 0,
        totalBookings: 0,
        totalRevenue: 0,
        totalInquiries: 0,
        activeTours: 0,
        pendingInquiries: 0,
        thisMonthRevenue: 0,
        revenueGrowth: 0,
        todayBookings: 0,
      };
    }),
  }),
});
export type AppRouter = typeof appRouter;
