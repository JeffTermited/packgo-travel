import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import * as skillDb from "./skillDb";
import { learnFromPdfContent, initializeBuiltInSkills } from "./agents/learningAgent";
import { SkillLearnerAgent } from "./agents/skillLearnerAgent";
import { invokeLLM } from "./_core/llm";
import { extractTourInfoWithManus } from "./manusApi";
import { quickExtractTourInfo } from "./webScraper";
import { sendBookingConfirmationEmail } from "./email";
import * as auth from "./auth";
import { createToken } from "./jwt";
import { translateText, translateBatch, translateTour, translateMultipleTours, getTourTranslations, getAllTourTranslations, getTranslationJobs, getSupportedLanguages, Language } from "./translation";
import { getExchangeRates, convertCurrency, getExchangeRate, formatCurrency, getCurrencySymbol, convertPrices, type SupportedCurrency } from "./agents/exchangeRateAgent";

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
    // Skill-enhanced AI chat with performance tracking
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
          sessionId: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { message, conversationHistory = [], sessionId } = input;
        const { processMessageWithSkills } = await import("./services/aiChatSkillService");

        try {
          // Process message with skill integration
          const result = await processMessageWithSkills({
            message,
            conversationHistory,
            userId: ctx.user?.id,
            sessionId: sessionId || `session_${Date.now()}`,
          });

          return {
            response: result.response,
            triggeredSkills: result.triggeredSkills.map(s => ({
              skillId: s.skillId,
              skillName: s.skillName,
              confidence: s.confidence,
            })),
            usageLogIds: result.usageLogIds,
          };
        } catch (error) {
          console.error("[AI Chat] Error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "無法連接到 AI 服務，請稍後再試。",
          });
        }
      }),

    // Record user feedback for AI chat response
    recordFeedback: publicProcedure
      .input(
        z.object({
          usageLogIds: z.array(z.number()),
          feedback: z.enum(["positive", "negative"]),
          comment: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { recordChatFeedback } = await import("./services/aiChatSkillService");
        await recordChatFeedback(input.usageLogIds, input.feedback, input.comment);
        return { success: true };
      }),

    // Record conversion from AI chat session
    recordConversion: publicProcedure
      .input(
        z.object({
          usageLogIds: z.array(z.number()),
          conversionType: z.enum(["booking", "inquiry", "favorite", "share"]),
          conversionId: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { recordChatConversion } = await import("./services/aiChatSkillService");
        await recordChatConversion(input.usageLogIds, input.conversionType, input.conversionId);
        return { success: true };
      }),
  }),

  // User Favorites router
  favorites: router({
    // Get user's favorite tour IDs (for quick checking)
    getIds: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserFavoriteIds(ctx.user.id);
    }),

    // Get user's favorite tours with details
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserFavorites(ctx.user.id);
    }),

    // Add a tour to favorites
    add: protectedProcedure
      .input(z.object({ tourId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.addFavorite(ctx.user.id, input.tourId);
        return { success: true };
      }),

    // Remove a tour from favorites
    remove: protectedProcedure
      .input(z.object({ tourId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.removeFavorite(ctx.user.id, input.tourId);
        return { success: true };
      }),

    // Toggle favorite status
    toggle: protectedProcedure
      .input(z.object({ tourId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const isFav = await db.isFavorite(ctx.user.id, input.tourId);
        if (isFav) {
          await db.removeFavorite(ctx.user.id, input.tourId);
          return { isFavorite: false };
        } else {
          await db.addFavorite(ctx.user.id, input.tourId);
          return { isFavorite: true };
        }
      }),
  }),

  // User Browsing History router
  browsingHistory: router({
    // Get user's browsing history
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional().default(20) }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getUserBrowsingHistory(ctx.user.id, input?.limit);
      }),

    // Record a tour view
    record: protectedProcedure
      .input(z.object({ tourId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.recordBrowsingHistory(ctx.user.id, input.tourId);
        return { success: true };
      }),

    // Clear browsing history
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await db.clearBrowsingHistory(ctx.user.id);
      return { success: true };
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

    // Get filter options for smart filtering (public)
    getFilterOptions: publicProcedure.query(async () => {
      return await db.getFilterOptions();
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
          tags: z.array(z.string()).optional(),
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

    // Update tour (admin only) - Supports inline editing
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          // Basic Information
          title: z.string().min(1).optional(),
          destination: z.string().min(1).optional(),
          description: z.string().min(1).optional(),
          duration: z.number().min(1).optional(),
          price: z.number().min(0).optional(),
          
          // Images
          imageUrl: z.string().optional(),
          heroImage: z.string().optional(),
          heroSubtitle: z.string().optional(),
          
          // Location
          destinationCountry: z.string().optional(),
          destinationCity: z.string().optional(),
          
          // Category & Status
          category: z.enum(["group", "custom", "package", "cruise", "theme"]).optional(),
          status: z.enum(["active", "inactive", "soldout"]).optional(),
          featured: z.number().min(0).max(1).optional(),
          
          // Dates
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          
          // Capacity
          maxParticipants: z.number().optional(),
          currentParticipants: z.number().optional(),
          
          // Content (JSON strings)
          highlights: z.string().optional(),
          includes: z.string().optional(),
          excludes: z.string().optional(),
          keyFeatures: z.string().optional(),
          attractions: z.string().optional(),
          hotels: z.string().optional(),
          meals: z.string().optional(),
          flights: z.string().optional(),
          itineraryDetailed: z.string().optional(),
          costExplanation: z.string().optional(),
          noticeDetailed: z.string().optional(),
          poeticContent: z.string().optional(),
          colorTheme: z.string().optional(),
          galleryImages: z.string().optional(),
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

    // Partial update for inline editing (admin only)
    // Allows updating a single field at a time
    patchField: adminProcedure
      .input(
        z.object({
          id: z.number(),
          field: z.string(),
          value: z.union([z.string(), z.number(), z.null()]),
        })
      )
      .mutation(async ({ input }) => {
        const { id, field, value } = input;
        
        // Whitelist of allowed fields for inline editing
        const allowedFields = [
          'title', 'description', 'heroSubtitle', 'heroImage',
          'destinationCountry', 'destinationCity', 'price', 'duration',
          'keyFeatures', 'attractions', 'hotels', 'meals', 'flights',
          'itineraryDetailed', 'costExplanation', 'noticeDetailed',
          'poeticContent', 'colorTheme', 'galleryImages', 'imageUrl',
          'highlights', 'includes', 'excludes', 'startDate', 'endDate'
        ];
        
        if (!allowedFields.includes(field)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Field '${field}' is not allowed for inline editing`,
          });
        }
        
        const updates: Record<string, any> = { [field]: value };
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

    // Duplicate tour (admin only) - 複製行程作為模板
    duplicate: protectedProcedure
      .input(z.object({ 
        id: z.number(),
        newTitle: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user is admin
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can duplicate tours",
          });
        }

        // Get original tour
        const originalTour = await db.getTourById(input.id);
        if (!originalTour) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Tour not found",
          });
        }

        // Create a copy with modified title
        const { id, createdAt, updatedAt, ...tourData } = originalTour;
        const newTour = await db.createTour({
          ...tourData,
          title: input.newTitle || `${originalTour.title} (副本)`,
          status: "inactive", // New copy starts as inactive
          featured: 0, // Not featured by default
          createdBy: ctx.user.id,
          productCode: originalTour.productCode ? `${originalTour.productCode}-COPY` : undefined,
        });

        return newTour;
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
        isPdf: z.boolean().optional().default(false),
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
          isPdf: input.isPdf,
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

    // Generate PDF for tour (public)
    generatePdf: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        console.log(`[GeneratePDF] Starting PDF generation for tour ${input.id}`);
        
        // Get tour data
        const tour = await db.getTourById(input.id);
        if (!tour) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Tour not found",
          });
        }
        
        // Parse JSON fields
        const parseJSON = (str: string | null | undefined, defaultValue: any = null) => {
          if (!str) return defaultValue;
          try {
            return JSON.parse(str);
          } catch {
            return defaultValue;
          }
        };
        
        const itineraryDetailed = parseJSON(tour.itineraryDetailed, []);
        const highlights = parseJSON(tour.highlights, []);
        const includes = parseJSON(tour.includes, []);
        const excludes = parseJSON(tour.excludes, []);
        const noticeDetailed = parseJSON(tour.noticeDetailed, []);
        const colorTheme = parseJSON(tour.colorTheme, null);
        
        // Prepare PDF data
        const pdfGenerator = await import('./pdfGenerator');
        
        const pdfData: any = {
          id: tour.id,
          title: tour.title,
          subtitle: tour.heroSubtitle || undefined,
          days: tour.duration,
          destinations: [
            tour.destinationCountry,
            ...(tour.destinationCity ? tour.destinationCity.split(',').map(c => c.trim()) : []),
          ].filter(Boolean),
          price: tour.price || undefined,
          currency: 'NT$',
          heroImage: tour.heroImage || undefined,
          description: tour.description || undefined,
          highlights: highlights.length > 0 ? highlights : undefined,
          itinerary: itineraryDetailed.length > 0 ? itineraryDetailed.map((day: any) => ({
            day: day.day,
            title: day.title,
            subtitle: day.subtitle,
            activities: day.activities || [],
            meals: day.meals || {},
            accommodation: day.accommodation,
          })) : undefined,
          inclusions: includes.length > 0 ? includes : undefined,
          exclusions: excludes.length > 0 ? excludes : undefined,
          notes: noticeDetailed.length > 0 ? noticeDetailed : undefined,
          colorTheme: colorTheme || undefined,
        };
        
        // Generate and upload PDF
        const storageKey = `tours/${tour.id}/itinerary_${Date.now()}.pdf`;
        const pdfUrl = await pdfGenerator.generateAndUploadTourPdf(pdfData, storageKey);
        
        console.log(`[GeneratePDF] PDF generated successfully: ${pdfUrl}`);
        
        return {
          success: true,
          url: pdfUrl,
          message: "PDF 已成功生成",
        };
      }),

    // 診斷工具 API (admin only)
    diagnose: adminProcedure
      .input(z.object({ 
        url: z.string().url(),
      }))
      .mutation(async ({ input }) => {
        console.log("[Diagnostics] Starting diagnosis for URL:", input.url);
        
        const { agentDiagnostics } = await import('./agents/diagnostics');
        const report = await agentDiagnostics.runFullDiagnostics(input.url);
        
        return report;
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

  // Image Library router
  imageLibrary: router({
    // List images from library
    list: protectedProcedure
      .input(z.object({
        tourId: z.number().optional(),
        search: z.string().optional(),
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
      }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getImageLibrary({
          userId: ctx.user.id,
          tourId: input?.tourId,
          search: input?.search,
          limit: input?.limit,
          offset: input?.offset,
        });
      }),

    // Add image to library
    add: protectedProcedure
      .input(z.object({
        url: z.string(),
        filename: z.string().optional(),
        mimeType: z.string().optional(),
        fileSize: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        tags: z.array(z.string()).optional(),
        tourId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const image = await db.addImageToLibrary({
          url: input.url,
          filename: input.filename,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          width: input.width,
          height: input.height,
          tags: input.tags ? JSON.stringify(input.tags) : null,
          tourId: input.tourId,
          uploadedBy: ctx.user.id,
        });
        if (!image) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to add image to library",
          });
        }
        return image;
      }),

    // Delete image from library
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const success = await db.deleteImageFromLibrary(input.id, ctx.user.id);
        if (!success) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Image not found or you don't have permission to delete it",
          });
        }
        return { success: true };
      }),
  }),

  // Homepage content management
  homepage: router({
    // Get homepage content by section key
    getContent: publicProcedure
      .input(z.object({ sectionKey: z.string() }))
      .query(async ({ input }) => {
        const content = await db.getHomepageContent(input.sectionKey);
        if (!content) return null;
        try {
          return { ...content, content: JSON.parse(content.content) };
        } catch {
          return content;
        }
      }),

    // Get all homepage content
    getAllContent: publicProcedure.query(async () => {
      const contents = await db.getAllHomepageContent();
      return contents.map(c => {
        try {
          return { ...c, content: JSON.parse(c.content) };
        } catch {
          return c;
        }
      });
    }),

    // Update homepage content (admin only)
    updateContent: adminProcedure
      .input(z.object({
        sectionKey: z.string(),
        content: z.any(),
      }))
      .mutation(async ({ ctx, input }) => {
        const contentStr = typeof input.content === 'string' 
          ? input.content 
          : JSON.stringify(input.content);
        const success = await db.upsertHomepageContent(
          input.sectionKey, 
          contentStr, 
          ctx.user.id
        );
        if (!success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update homepage content",
          });
        }
        return { success: true };
      }),

    // Get all destinations
    getDestinations: publicProcedure.query(async () => {
      return await db.getActiveDestinations();
    }),

    // Get all destinations (including inactive) for admin
    getAllDestinations: adminProcedure.query(async () => {
      return await db.getAllDestinations();
    }),

    // Create destination (admin only)
    createDestination: adminProcedure
      .input(z.object({
        name: z.string(),
        label: z.string().optional(),
        image: z.string().optional(),
        region: z.string().optional(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createDestination(input);
        if (!id) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create destination",
          });
        }
        return { id };
      }),

    // Update destination (admin only)
    updateDestination: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        label: z.string().optional(),
        image: z.string().optional(),
        region: z.string().optional(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const success = await db.updateDestination(id, data);
        if (!success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update destination",
          });
        }
        return { success: true };
      }),

    // Delete destination (admin only)
    deleteDestination: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const success = await db.deleteDestination(input.id);
        if (!success) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Destination not found",
          });
        }
        return { success: true };
      }),

    // Reorder destinations (admin only)
    reorderDestinations: adminProcedure
      .input(z.object({ orderedIds: z.array(z.number()) }))
      .mutation(async ({ input }) => {
        const success = await db.reorderDestinations(input.orderedIds);
        if (!success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to reorder destinations",
          });
        }
        return { success: true };
      }),
  }),

  // Agent Skills management router
  skills: router({
    // Get all skills
    list: adminProcedure.query(async () => {
      return await skillDb.getAllSkills(true);
    }),

    // Get skills by type
    listByType: adminProcedure
      .input(z.object({ skillType: z.string() }))
      .query(async ({ input }) => {
        return await skillDb.getSkillsByType(input.skillType);
      }),

    // Get single skill
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const skill = await skillDb.getSkillById(input.id);
        if (!skill) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Skill not found",
          });
        }
        return skill;
      }),

    // Create new skill (with Superpowers-style fields)
    create: adminProcedure
      .input(z.object({
        skillType: z.enum(["feature_classification", "tag_rule", "itinerary_structure", "highlight_detection", "transportation_type", "meal_classification", "accommodation_type"]),
        skillCategory: z.enum(["technique", "pattern", "reference"]).optional().default("technique"),
        skillName: z.string(),
        skillNameEn: z.string().optional(),
        keywords: z.array(z.string()),
        rules: z.any(),
        outputLabels: z.array(z.string()).optional(),
        outputFormat: z.string().optional(),
        description: z.string().optional(),
        source: z.string().optional(),
        sourceUrl: z.string().optional(),
        // Superpowers-style documentation fields
        whenToUse: z.string().optional(),
        corePattern: z.string().optional(),
        quickReference: z.string().optional(),
        commonMistakes: z.string().optional(),
        realWorldImpact: z.string().optional(),
        // Dependencies and testing
        dependsOn: z.array(z.number()).optional(),
        testCases: z.array(z.object({
          id: z.string(),
          input: z.string(),
          expectedOutput: z.string(),
          description: z.string().optional(),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const skillId = await skillDb.createSkill({
          skillType: input.skillType,
          skillCategory: input.skillCategory,
          skillName: input.skillName,
          skillNameEn: input.skillNameEn,
          keywords: JSON.stringify(input.keywords),
          rules: JSON.stringify(input.rules),
          outputLabels: input.outputLabels ? JSON.stringify(input.outputLabels) : undefined,
          outputFormat: input.outputFormat,
          description: input.description,
          source: input.source,
          sourceUrl: input.sourceUrl,
          whenToUse: input.whenToUse,
          corePattern: input.corePattern,
          quickReference: input.quickReference,
          commonMistakes: input.commonMistakes,
          realWorldImpact: input.realWorldImpact,
          dependsOn: input.dependsOn ? JSON.stringify(input.dependsOn) : undefined,
          testCases: input.testCases ? JSON.stringify(input.testCases) : undefined,
          createdBy: ctx.user.id,
          isActive: true,
          isBuiltIn: false,
        });
        return { id: skillId };
      }),

    // Update skill (with Superpowers-style fields)
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        skillCategory: z.enum(["technique", "pattern", "reference"]).optional(),
        skillName: z.string().optional(),
        skillNameEn: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        rules: z.any().optional(),
        outputLabels: z.array(z.string()).optional(),
        outputFormat: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
        // Superpowers-style documentation fields
        whenToUse: z.string().optional(),
        corePattern: z.string().optional(),
        quickReference: z.string().optional(),
        commonMistakes: z.string().optional(),
        realWorldImpact: z.string().optional(),
        // Dependencies and testing
        dependsOn: z.array(z.number()).optional(),
        testCases: z.array(z.object({
          id: z.string(),
          input: z.string(),
          expectedOutput: z.string(),
          description: z.string().optional(),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, keywords, rules, outputLabels, dependsOn, testCases, ...rest } = input;
        const updates: any = { ...rest };
        if (keywords) updates.keywords = JSON.stringify(keywords);
        if (rules) updates.rules = JSON.stringify(rules);
        if (outputLabels) updates.outputLabels = JSON.stringify(outputLabels);
        if (dependsOn) updates.dependsOn = JSON.stringify(dependsOn);
        if (testCases) updates.testCases = JSON.stringify(testCases);
        
        await skillDb.updateSkill(id, updates);
        return { success: true };
      }),

    // Delete skill
    delete: adminProcedure
      .input(z.object({ id: z.number(), hardDelete: z.boolean().optional() }))
      .mutation(async ({ input }) => {
        await skillDb.deleteSkill(input.id, input.hardDelete);
        return { success: true };
      }),

    // Match skills to content
    matchToContent: adminProcedure
      .input(z.object({
        content: z.string(),
        skillType: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const matches = await skillDb.matchSkillsToContent(input.content, input.skillType);
        return matches.map(m => ({
          skill: m.skill,
          score: m.score,
          matchedKeywords: m.matchedKeywords,
        }));
      }),

    // Apply skill rules to content
    applyRules: adminProcedure
      .input(z.object({
        skillId: z.number(),
        content: z.string(),
        metadata: z.any().optional(),
      }))
      .mutation(async ({ input }) => {
        const skill = await skillDb.getSkillById(input.skillId);
        if (!skill) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Skill not found",
          });
        }
        const labels = skillDb.applySkillRules(skill, input.content, input.metadata);
        return { labels };
      }),

    // Seed built-in skills
    seedBuiltIn: adminProcedure.mutation(async () => {
      await skillDb.seedBuiltInSkills();
      return { success: true };
    }),

    // Get learning sessions
    getLearningSessions: adminProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await skillDb.getRecentLearningSessions(input.limit);
      }),

    // Get skill application history
    getApplicationHistory: adminProcedure
      .input(z.object({
        skillId: z.number().optional(),
        tourId: z.number().optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await skillDb.getSkillApplicationHistory(input.skillId, input.tourId, input.limit);
      }),

    // Learn from PDF content
    learnFromPdf: adminProcedure
      .input(z.object({
        pdfContent: z.string(),
        sourceName: z.string(),
        sourceUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await learnFromPdfContent(
          input.pdfContent,
          input.sourceName,
          input.sourceUrl,
          ctx.user.id
        );
        return result;
      }),

    // Initialize built-in skills
    initializeBuiltIn: adminProcedure.mutation(async () => {
      await initializeBuiltInSkills();
      return { success: true };
    }),

    // Run skill test cases (TDD-style)
    runTests: adminProcedure
      .input(z.object({ skillId: z.number() }))
      .mutation(async ({ input }) => {
        const skill = await skillDb.getSkillById(input.skillId);
        if (!skill) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Skill not found",
          });
        }
        
        const testCases = skill.testCases ? JSON.parse(skill.testCases as string) : [];
        if (testCases.length === 0) {
          return { results: [], passRate: 0, message: "No test cases defined" };
        }
        
        const results = [];
        let passed = 0;
        
        for (const testCase of testCases) {
          const startTime = Date.now();
          try {
            const labels = skillDb.applySkillRules(skill, testCase.input, {});
            const actualOutput = JSON.stringify(labels);
            const isPassed = actualOutput === testCase.expectedOutput || 
                            labels.some((l: string) => testCase.expectedOutput.includes(l));
            
            if (isPassed) passed++;
            
            results.push({
              testCaseId: testCase.id,
              passed: isPassed,
              expectedOutput: testCase.expectedOutput,
              actualOutput,
              executionTimeMs: Date.now() - startTime,
            });
          } catch (error: any) {
            results.push({
              testCaseId: testCase.id,
              passed: false,
              expectedOutput: testCase.expectedOutput,
              actualOutput: null,
              errorMessage: error.message,
              executionTimeMs: Date.now() - startTime,
            });
          }
        }
        
        const passRate = passed / testCases.length;
        
        // Update skill with test results
        await skillDb.updateSkill(input.skillId, {
          lastTestedAt: new Date(),
          testPassRate: passRate.toFixed(2),
        });
        
        return { results, passRate, totalTests: testCases.length, passedTests: passed };
      }),

    // Get skill statistics
    getStats: adminProcedure.query(async () => {
      const skills = await skillDb.getAllSkills(true);
      const totalSkills = skills.length;
      const activeSkills = skills.filter(s => s.isActive).length;
      const builtInSkills = skills.filter(s => s.isBuiltIn).length;
      const customSkills = totalSkills - builtInSkills;
      
      const byCategory = {
        technique: skills.filter(s => s.skillCategory === 'technique').length,
        pattern: skills.filter(s => s.skillCategory === 'pattern').length,
        reference: skills.filter(s => s.skillCategory === 'reference').length,
      };
      
      const byType = skills.reduce((acc, s) => {
        acc[s.skillType] = (acc[s.skillType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const totalUsage = skills.reduce((sum, s) => sum + (s.usageCount || 0), 0);
      const totalSuccess = skills.reduce((sum, s) => sum + (s.successCount || 0), 0);
      const overallSuccessRate = totalUsage > 0 ? (totalSuccess / totalUsage * 100).toFixed(1) : '0';
      
      return {
        totalSkills,
        activeSkills,
        builtInSkills,
        customSkills,
        byCategory,
        byType,
        totalUsage,
        overallSuccessRate,
      };
    }),

    // Get skill dependencies
    getDependencies: adminProcedure
      .input(z.object({ skillId: z.number() }))
      .query(async ({ input }) => {
        const skill = await skillDb.getSkillById(input.skillId);
        if (!skill) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Skill not found",
          });
        }
        
        const dependsOn = skill.dependsOn ? JSON.parse(skill.dependsOn as string) : [];
        const dependencies = [];
        
        for (const depId of dependsOn) {
          const depSkill = await skillDb.getSkillById(depId);
          if (depSkill) {
            dependencies.push({
              id: depSkill.id,
              skillName: depSkill.skillName,
              skillType: depSkill.skillType,
              skillCategory: depSkill.skillCategory,
            });
          }
        }
        
        return dependencies;
      }),

    // AI 自動學習 - 從內容中學習新關鍵字和技能
    aiLearn: adminProcedure
      .input(z.object({
        content: z.string(),
        contentType: z.enum(['tour', 'pdf', 'text']).optional(),
        metadata: z.object({
          title: z.string().optional(),
          source: z.string().optional(),
          region: z.string().optional(),
          country: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ input }) => {
        const learner = new SkillLearnerAgent();
        const result = await learner.learnFromContent({
          title: input.metadata?.title || '未命名行程',
          description: input.content,
          country: input.metadata?.country,
        });
        return result;
      }),

    // AI 批量學習 - 從多個內容中學習
    aiBatchLearn: adminProcedure
      .input(z.object({
        contents: z.array(z.object({
          content: z.string(),
          metadata: z.object({
            title: z.string().optional(),
            source: z.string().optional(),
          }).optional(),
        })),
      }))
      .mutation(async ({ input }) => {
        const learner = new SkillLearnerAgent();
        const contents = input.contents.map(c => ({
          ...c.metadata,
          description: c.content,
        }));
        const result = await learner.batchLearn(contents);
        return result;
      }),

    // 應用學習到的關鍵字到技能
    applyLearnedKeywords: adminProcedure
      .input(z.object({
        skillId: z.number(),
        newKeywords: z.array(z.string()),
        approvedBy: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const learner = new SkillLearnerAgent();
        const success = await learner.applyKeywordSuggestion(
          input.skillId,
          input.newKeywords,
          input.approvedBy || ctx.user.name || 'admin'
        );
        return { success };
      }),

    // 創建 AI 建議的新技能
    createSuggestedSkill: adminProcedure
      .input(z.object({
        skillType: z.string(),
        skillName: z.string(),
        category: z.enum(['technique', 'pattern', 'reference']),
        description: z.string(),
        keywords: z.array(z.string()),
        whenToUse: z.string().optional(),
        corePattern: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const learner = new SkillLearnerAgent();
        // 轉換為 createNewSkill 所需的格式
        const suggestion = {
          skillName: input.skillName,
          skillType: input.skillType,
          category: input.category,
          description: input.description,
          keywords: input.keywords,
          whenToUse: input.whenToUse || '',
          corePattern: input.corePattern || '',
          confidence: 1.0,
          reason: '管理員手動創建'
        };
        const skillId = await learner.createNewSkill(suggestion);
        return { success: skillId !== null, skillId };
      }),

    // 獲取學習建議（待審核的關鍵字和新技能建議）
    getLearningRecommendations: adminProcedure.query(async () => {
      // 這裡可以從資料庫獲取待審核的學習建議
      // 目前返回空陣列，實際應用時需要建立學習建議資料表
      return {
        pendingKeywords: [],
        suggestedSkills: [],
        recentLearnings: [],
      };
    }),

    // === 排程學習 API ===
    
    // 獲取所有排程
    getSchedules: adminProcedure.query(async () => {
      const { scheduledLearningService } = await import('./services/scheduledLearningService');
      return await scheduledLearningService.getSchedules();
    }),

    // 創建排程
    createSchedule: adminProcedure
      .input(z.object({
        name: z.string(),
        frequency: z.enum(['daily', 'weekly', 'monthly']),
        dayOfWeek: z.number().min(0).max(6).optional(),
        dayOfMonth: z.number().min(1).max(31).optional(),
        hour: z.number().min(0).max(23).optional(),
        minute: z.number().min(0).max(59).optional(),
        maxToursPerRun: z.number().min(1).max(50).optional(),
        minTourAge: z.number().min(0).optional(),
        autoApplyHighConfidence: z.boolean().optional(),
        autoApplyThreshold: z.number().min(0).max(1).optional(),
        notifyOnComplete: z.boolean().optional(),
        notifyOnNewSuggestions: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { scheduledLearningService } = await import('./services/scheduledLearningService');
        const scheduleId = await scheduledLearningService.createSchedule({
          ...input,
          createdBy: ctx.user.id,
        });
        return { success: scheduleId !== null, scheduleId };
      }),

    // 更新排程
    updateSchedule: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        isEnabled: z.boolean().optional(),
        frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
        dayOfWeek: z.number().min(0).max(6).optional(),
        dayOfMonth: z.number().min(1).max(31).optional(),
        hour: z.number().min(0).max(23).optional(),
        minute: z.number().min(0).max(59).optional(),
        maxToursPerRun: z.number().min(1).max(50).optional(),
        minTourAge: z.number().min(0).optional(),
        autoApplyHighConfidence: z.boolean().optional(),
        autoApplyThreshold: z.number().min(0).max(1).optional(),
        notifyOnComplete: z.boolean().optional(),
        notifyOnNewSuggestions: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { scheduledLearningService } = await import('./services/scheduledLearningService');
        const { id, ...updates } = input;
        const success = await scheduledLearningService.updateSchedule(id, updates);
        return { success };
      }),

    // 刪除排程
    deleteSchedule: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { scheduledLearningService } = await import('./services/scheduledLearningService');
        const success = await scheduledLearningService.deleteSchedule(input.id);
        return { success };
      }),

    // 手動觸發排程學習
    triggerScheduledLearning: adminProcedure
      .input(z.object({ scheduleId: z.number() }))
      .mutation(async ({ input }) => {
        const { scheduledLearningService } = await import('./services/scheduledLearningService');
        const result = await scheduledLearningService.executeScheduledLearning(input.scheduleId);
        return { success: result !== null, result };
      }),

    // 手動學習（從指定行程）
    triggerManualLearning: adminProcedure
      .input(z.object({ tourIds: z.array(z.number()) }))
      .mutation(async ({ ctx, input }) => {
        const { scheduledLearningService } = await import('./services/scheduledLearningService');
        const result = await scheduledLearningService.triggerManualLearning(input.tourIds, ctx.user.id);
        return { success: result !== null, result };
      }),

    // 獲取學習歷史
    getLearningHistory: adminProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
        sourceType: z.enum(['tour', 'batch', 'scheduled', 'manual']).optional(),
      }).optional())
      .query(async ({ input }) => {
        const { scheduledLearningService } = await import('./services/scheduledLearningService');
        return await scheduledLearningService.getLearningHistory(input || {});
      }),

    // 更新學習歷史的建議狀態
    updateLearningHistoryStatus: adminProcedure
      .input(z.object({
        historyId: z.number(),
        accepted: z.number(),
        rejected: z.number(),
        skillsCreated: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { scheduledLearningService } = await import('./services/scheduledLearningService');
        const success = await scheduledLearningService.updateSuggestionStatus(
          input.historyId,
          input.accepted,
          input.rejected,
          input.skillsCreated
        );
        return { success };
      }),

    // === 學習分析儀表板 API ===
    
    // 獲取儀表板統計數據
    getDashboardStats: adminProcedure.query(async () => {
      const { getDashboardStats } = await import('./services/learningAnalyticsService');
      return await getDashboardStats();
    }),

    // 獲取學習趨勢數據
    getLearningTrends: adminProcedure
      .input(z.object({ days: z.number().min(7).max(90).optional() }).optional())
      .query(async ({ input }) => {
        const { getLearningTrends } = await import('./services/learningAnalyticsService');
        return await getLearningTrends(input?.days || 30);
      }),

    // 獲取技能採納率數據
    getAdoptionRates: adminProcedure.query(async () => {
      const { getSkillAdoptionRates } = await import('./services/learningAnalyticsService');
      return await getSkillAdoptionRates();
    }),

    // 獲取學習來源分佈
    getSourceDistribution: adminProcedure.query(async () => {
      const { getSourceDistribution } = await import('./services/learningAnalyticsService');
      return await getSourceDistribution();
    }),

    // 獲取熱門行程排名
    getTopTours: adminProcedure
      .input(z.object({ limit: z.number().min(1).max(50).optional() }).optional())
      .query(async ({ input }) => {
        const { getTopToursByPopularity } = await import('./services/learningAnalyticsService');
        return await getTopToursByPopularity(input?.limit || 10);
      }),

    // 獲取優先學習的行程
    getPrioritizedTours: adminProcedure
      .input(z.object({ limit: z.number().min(1).max(20).optional() }).optional())
      .query(async ({ input }) => {
        const { getPrioritizedToursForLearning } = await import('./services/learningAnalyticsService');
        return await getPrioritizedToursForLearning(input?.limit || 5);
      }),

    // === 審核佇列 API ===
    
    // 獲取待審核的技能
    getReviewQueue: adminProcedure
      .input(z.object({
        status: z.enum(['pending', 'approved', 'rejected', 'merged']).optional(),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      }).optional())
      .query(async ({ input }) => {
        const { getDb } = await import('./db');
        const { skillReviewQueue } = await import('../drizzle/schema');
        const { eq, desc } = await import('drizzle-orm');
        
        const db = await getDb();
        if (!db) return { items: [], total: 0 };
        
        let query = db.select().from(skillReviewQueue);
        
        if (input?.status) {
          query = query.where(eq(skillReviewQueue.status, input.status)) as typeof query;
        }
        
        const items = await query
          .orderBy(desc(skillReviewQueue.createdAt))
          .limit(input?.limit || 20)
          .offset(input?.offset || 0);
        
        // Get total count
        const { count } = await import('drizzle-orm');
        let countQuery = db.select({ count: count() }).from(skillReviewQueue);
        if (input?.status) {
          countQuery = countQuery.where(eq(skillReviewQueue.status, input.status)) as typeof countQuery;
        }
        const [totalResult] = await countQuery;
        
        return { items, total: Number(totalResult?.count) || 0 };
      }),

    // 批准技能
    approveSkill: adminProcedure
      .input(z.object({
        reviewId: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getDb } = await import('./db');
        const { skillReviewQueue, agentSkills } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        // Get the review item
        const [review] = await db.select().from(skillReviewQueue).where(eq(skillReviewQueue.id, input.reviewId));
        if (!review) throw new TRPCError({ code: 'NOT_FOUND', message: 'Review item not found' });
        if (review.status !== 'pending') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Item already reviewed' });
        
        // Create the actual skill
        // Map review skillType to agentSkills skillType
        const skillTypeMapping: Record<string, 'feature_classification' | 'tag_rule' | 'itinerary_structure' | 'highlight_detection' | 'transportation_type' | 'meal_classification' | 'accommodation_type'> = {
          'technique': 'feature_classification',
          'pattern': 'tag_rule',
          'reference': 'itinerary_structure',
        };
        const mappedSkillType = skillTypeMapping[review.skillType] || 'feature_classification';
        
        const [insertResult] = await db.insert(agentSkills).values({
          skillType: mappedSkillType,
          skillCategory: review.skillType as 'technique' | 'pattern' | 'reference',
          skillName: review.skillName,
          keywords: review.keywords,
          rules: review.rules,
          outputLabels: review.outputLabels,
          description: review.description,
          confidence: review.confidence,
          isActive: true,
          isBuiltIn: false,
          createdBy: ctx.user.id,
        });
        
        const skillId = insertResult.insertId;
        
        // Update review status
        await db.update(skillReviewQueue)
          .set({
            status: 'approved',
            reviewedBy: ctx.user.id,
            reviewedAt: new Date(),
            reviewNotes: input.notes,
            createdSkillId: Number(skillId),
          })
          .where(eq(skillReviewQueue.id, input.reviewId));
        
        return { success: true, skillId: Number(skillId) };
      }),

    // 拒絕技能
    rejectSkill: adminProcedure
      .input(z.object({
        reviewId: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getDb } = await import('./db');
        const { skillReviewQueue } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        // Get the review item
        const [review] = await db.select().from(skillReviewQueue).where(eq(skillReviewQueue.id, input.reviewId));
        if (!review) throw new TRPCError({ code: 'NOT_FOUND', message: 'Review item not found' });
        if (review.status !== 'pending') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Item already reviewed' });
        
        // Update review status
        await db.update(skillReviewQueue)
          .set({
            status: 'rejected',
            reviewedBy: ctx.user.id,
            reviewedAt: new Date(),
            reviewNotes: input.notes,
          })
          .where(eq(skillReviewQueue.id, input.reviewId));
        
        return { success: true };
      }),

    // 新增待審核的技能（從 AI 學習結果）
    addToReviewQueue: adminProcedure
      .input(z.object({
        skillName: z.string(),
        skillType: z.enum(['technique', 'pattern', 'reference']),
        category: z.string(),
        keywords: z.array(z.string()),
        rules: z.any(),
        description: z.string().optional(),
        outputLabels: z.array(z.string()).optional(),
        confidence: z.number().min(0).max(1).optional(),
        sourceType: z.enum(['ai_learning', 'scheduled', 'manual']),
        sourceTourId: z.number().optional(),
        learningHistoryId: z.number().optional(),
        priority: z.enum(['low', 'medium', 'high']).optional(),
      }))
      .mutation(async ({ input }) => {
        const { getDb } = await import('./db');
        const { skillReviewQueue } = await import('../drizzle/schema');
        
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        const [result] = await db.insert(skillReviewQueue).values({
          skillName: input.skillName,
          skillType: input.skillType,
          category: input.category,
          keywords: JSON.stringify(input.keywords),
          rules: JSON.stringify(input.rules),
          description: input.description,
          outputLabels: input.outputLabels ? JSON.stringify(input.outputLabels) : null,
          confidence: input.confidence?.toFixed(2) || '0.80',
          sourceType: input.sourceType,
          sourceTourId: input.sourceTourId,
          learningHistoryId: input.learningHistoryId,
          priority: input.priority || 'medium',
          status: 'pending',
        });
        
        return { success: true, reviewId: Number(result.insertId) };
      }),

    // 更新行程統計（用於智能優先級）
    recordTourView: adminProcedure
      .input(z.object({ tourId: z.number() }))
      .mutation(async ({ input }) => {
        const { recordTourView } = await import('./services/learningAnalyticsService');
        await recordTourView(input.tourId);
        return { success: true };
      }),

    // 更新熱門度分數
    updatePopularityScores: adminProcedure.mutation(async () => {
      const { updatePopularityScores } = await import('./services/learningAnalyticsService');
      await updatePopularityScores();
      return { success: true };
    }),

    // ========== 技能效能追蹤 API ==========
    
    // 記錄技能觸發事件
    recordSkillTrigger: protectedProcedure
      .input(z.object({
        skillId: z.number(),
        skillName: z.string(),
        skillType: z.string(),
        contextType: z.enum(['chat', 'search', 'itinerary', 'content', 'classification']),
        contextId: z.string().optional(),
        inputText: z.string().optional(),
        matchedKeywords: z.array(z.string()).optional(),
        outputResult: z.string().optional(),
        wasSuccessful: z.boolean().optional(),
        errorMessage: z.string().optional(),
        processingTimeMs: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { recordSkillTrigger } = await import('./services/skillPerformanceService');
        const usageLogId = await recordSkillTrigger({
          ...input,
          userId: ctx.user.id,
          sessionId: ctx.req.headers['x-session-id'] as string,
        });
        return { success: true, usageLogId };
      }),

    // 記錄用戶回饋
    recordFeedback: protectedProcedure
      .input(z.object({
        usageLogId: z.number(),
        feedback: z.enum(['positive', 'negative', 'none']),
        comment: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { recordUserFeedback } = await import('./services/skillPerformanceService');
        await recordUserFeedback(input);
        return { success: true };
      }),

    // 記錄轉換事件
    recordConversion: protectedProcedure
      .input(z.object({
        usageLogId: z.number(),
        conversionType: z.enum(['booking', 'inquiry', 'favorite', 'share', 'none']),
        conversionId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { recordConversion } = await import('./services/skillPerformanceService');
        await recordConversion(input);
        return { success: true };
      }),

    // 獲取效能儀表板數據
    getPerformanceDashboard: adminProcedure
      .input(z.object({ days: z.number().optional() }).optional())
      .query(async ({ input }) => {
        const { getPerformanceDashboard } = await import('./services/skillPerformanceService');
        return await getPerformanceDashboard(input?.days || 30);
      }),

    // 獲取技能效能摘要
    getSkillPerformanceSummary: adminProcedure
      .input(z.object({ days: z.number().optional() }).optional())
      .query(async ({ input }) => {
        const { getSkillPerformanceSummary } = await import('./services/skillPerformanceService');
        return await getSkillPerformanceSummary(input?.days || 30);
      }),

    // 獲取技能效能趨勢
    getSkillPerformanceTrend: adminProcedure
      .input(z.object({
        skillId: z.number(),
        days: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const { getSkillPerformanceTrend } = await import('./services/skillPerformanceService');
        return await getSkillPerformanceTrend(input.skillId, input.days || 30);
      }),

    // 獲取使用記錄
    getUsageLogs: adminProcedure
      .input(z.object({
        skillId: z.number().optional(),
        contextType: z.enum(['chat', 'search', 'itinerary', 'content', 'classification']).optional(),
        feedback: z.enum(['positive', 'negative', 'none']).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        const { getUsageLogs } = await import('./services/skillPerformanceService');
        return await getUsageLogs({
          ...input,
          startDate: input?.startDate ? new Date(input.startDate) : undefined,
          endDate: input?.endDate ? new Date(input.endDate) : undefined,
        });
      }),

    // ========== 自動審核規則 API ==========
    
    // 獲取所有規則
    getAutoApprovalRules: adminProcedure.query(async () => {
      const { getAllRules } = await import('./services/autoApprovalService');
      return await getAllRules();
    }),

    // 創建規則
    createAutoApprovalRule: adminProcedure
      .input(z.object({
        ruleName: z.string(),
        description: z.string().optional(),
        ruleType: z.enum(['confidence_threshold', 'source_type', 'keyword_count', 'skill_category', 'combined']),
        conditions: z.array(z.object({
          field: z.string(),
          operator: z.enum(['>', '>=', '<', '<=', '==', '!=', 'in', 'not_in']),
          value: z.union([z.string(), z.number(), z.array(z.string())]),
        })),
        action: z.enum(['auto_approve', 'auto_reject', 'flag_priority', 'notify_admin']),
        priority: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createRule } = await import('./services/autoApprovalService');
        const ruleId = await createRule({
          ...input,
          createdBy: ctx.user.id,
        });
        return { success: true, ruleId };
      }),

    // 更新規則
    updateAutoApprovalRule: adminProcedure
      .input(z.object({
        ruleId: z.number(),
        ruleName: z.string().optional(),
        description: z.string().optional(),
        conditions: z.array(z.object({
          field: z.string(),
          operator: z.enum(['>', '>=', '<', '<=', '==', '!=', 'in', 'not_in']),
          value: z.union([z.string(), z.number(), z.array(z.string())]),
        })).optional(),
        action: z.enum(['auto_approve', 'auto_reject', 'flag_priority', 'notify_admin']).optional(),
        priority: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { updateRule } = await import('./services/autoApprovalService');
        const { ruleId, ...updateData } = input;
        await updateRule(ruleId, updateData);
        return { success: true };
      }),

    // 刪除規則
    deleteAutoApprovalRule: adminProcedure
      .input(z.object({ ruleId: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteRule } = await import('./services/autoApprovalService');
        await deleteRule(input.ruleId);
        return { success: true };
      }),

    // 初始化預設規則
    initializeDefaultRules: adminProcedure.mutation(async ({ ctx }) => {
      const { initializeDefaultRules } = await import('./services/autoApprovalService');
      await initializeDefaultRules(ctx.user.id);
      return { success: true };
    }),

    // 獲取規則統計
    getRuleStatistics: adminProcedure.query(async () => {
      const { getRuleStatistics } = await import('./services/autoApprovalService');
      return await getRuleStatistics();
    }),

    // 應用自動審核規則到待審核項目
    applyAutoApprovalRules: adminProcedure
      .input(z.object({ reviewQueueId: z.number() }))
      .mutation(async ({ input }) => {
        const { applyAutoApprovalRules } = await import('./services/autoApprovalService');
        return await applyAutoApprovalRules(input.reviewQueueId);
      }),
  }),

  // Translation router - AI-powered translation agent
  translation: router({
    // Translate single text
    translate: publicProcedure
      .input(z.object({
        text: z.string(),
        targetLanguage: z.enum(['zh-TW', 'en', 'es']),
        sourceLanguage: z.enum(['zh-TW', 'en', 'es']).optional().default('zh-TW'),
      }))
      .mutation(async ({ input }) => {
        const translated = await translateText(
          input.text,
          input.targetLanguage,
          input.sourceLanguage
        );
        return { translated };
      }),

    // Translate multiple texts in batch
    translateBatch: publicProcedure
      .input(z.object({
        texts: z.array(z.string()),
        targetLanguage: z.enum(['zh-TW', 'en', 'es']),
        sourceLanguage: z.enum(['zh-TW', 'en', 'es']).optional().default('zh-TW'),
      }))
      .mutation(async ({ input }) => {
        const translated = await translateBatch(
          input.texts,
          input.targetLanguage,
          input.sourceLanguage
        );
        return { translated };
      }),

    // Translate a single tour to multiple languages
    translateTour: adminProcedure
      .input(z.object({
        tourId: z.number(),
        targetLanguages: z.array(z.enum(['zh-TW', 'en', 'es', 'ja', 'ko'])),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await translateTour(
          input.tourId,
          input.targetLanguages as Language[],
          'zh-TW',
          ctx.user.id
        );
        return result;
      }),

    // Translate all tours to multiple languages
    translateAllTours: adminProcedure
      .input(z.object({
        targetLanguages: z.array(z.enum(['zh-TW', 'en', 'es', 'ja', 'ko'])),
      }))
      .mutation(async ({ input, ctx }) => {
        // Get all tour IDs
        const allTours = await db.getAllTours();
        const tourIds = allTours.map(t => t.id);
        
        if (tourIds.length === 0) {
          return { success: true, message: 'No tours to translate', results: [] };
        }

        const result = await translateMultipleTours(
          tourIds,
          input.targetLanguages as Language[],
          ctx.user.id
        );
        
        return {
          success: result.success,
          jobId: result.jobId,
          totalTours: tourIds.length,
          results: result.results,
        };
      }),

    // Get translations for a specific tour
    getTourTranslations: publicProcedure
      .input(z.object({
        tourId: z.number(),
        targetLanguage: z.enum(['zh-TW', 'en', 'es', 'ja', 'ko']),
      }))
      .query(async ({ input }) => {
        const translations = await getTourTranslations(
          input.tourId,
          input.targetLanguage as Language
        );
        return translations;
      }),

    // Get all translations for a tour (all languages)
    getAllTourTranslations: publicProcedure
      .input(z.object({
        tourId: z.number(),
      }))
      .query(async ({ input }) => {
        const translations = await getAllTourTranslations(input.tourId);
        return translations;
      }),

    // Get translation job history
    getJobs: adminProcedure
      .input(z.object({
        limit: z.number().optional().default(20),
      }))
      .query(async ({ input }) => {
        const jobs = await getTranslationJobs(input.limit);
        return jobs;
      }),

    // Get supported languages
    getSupportedLanguages: publicProcedure
      .query(() => {
        return getSupportedLanguages();
      }),
  }),
  
  // Exchange Rate router - 匯率轉換服務
  exchangeRate: router({
    // 獲取所有匯率
    getRates: publicProcedure.query(async () => {
      const rates = await getExchangeRates();
      return {
        base: rates.base,
        rates: rates.rates,
        lastUpdated: rates.lastUpdated,
        // 免責聲明
        disclaimer: '匯率僅供參考，實際價格以屆時人員提供的報價為準'
      };
    }),
    
    // 轉換單一金額
    convert: publicProcedure
      .input(z.object({
        amount: z.number(),
        fromCurrency: z.enum(['TWD', 'USD', 'EUR', 'JPY', 'CNY', 'HKD', 'KRW', 'SGD', 'GBP', 'AUD']),
        toCurrency: z.enum(['TWD', 'USD', 'EUR', 'JPY', 'CNY', 'HKD', 'KRW', 'SGD', 'GBP', 'AUD']),
      }))
      .query(async ({ input }) => {
        const convertedAmount = await convertCurrency(
          input.amount,
          input.fromCurrency as SupportedCurrency,
          input.toCurrency as SupportedCurrency
        );
        const rate = await getExchangeRate(
          input.fromCurrency as SupportedCurrency,
          input.toCurrency as SupportedCurrency
        );
        
        return {
          originalAmount: input.amount,
          convertedAmount,
          fromCurrency: input.fromCurrency,
          toCurrency: input.toCurrency,
          rate,
          disclaimer: '匯率僅供參考，實際價格以屆時人員提供的報價為準'
        };
      }),
    
    // 獲取特定貨幣對的匯率
    getRate: publicProcedure
      .input(z.object({
        fromCurrency: z.enum(['TWD', 'USD', 'EUR', 'JPY', 'CNY', 'HKD', 'KRW', 'SGD', 'GBP', 'AUD']),
        toCurrency: z.enum(['TWD', 'USD', 'EUR', 'JPY', 'CNY', 'HKD', 'KRW', 'SGD', 'GBP', 'AUD']),
      }))
      .query(async ({ input }) => {
        const rate = await getExchangeRate(
          input.fromCurrency as SupportedCurrency,
          input.toCurrency as SupportedCurrency
        );
        
        return {
          fromCurrency: input.fromCurrency,
          toCurrency: input.toCurrency,
          rate,
          disclaimer: '匯率僅供參考，實際價格以屆時人員提供的報價為準'
        };
      }),
    
    // 獲取貨幣符號
    getSymbol: publicProcedure
      .input(z.object({
        currency: z.enum(['TWD', 'USD', 'EUR', 'JPY', 'CNY', 'HKD', 'KRW', 'SGD', 'GBP', 'AUD']),
      }))
      .query(({ input }) => {
        return {
          currency: input.currency,
          symbol: getCurrencySymbol(input.currency as SupportedCurrency)
        };
      }),
    
    // 獲取支援的貨幣列表
    getSupportedCurrencies: publicProcedure.query(() => {
      return [
        { code: 'TWD', name: '新台幣', symbol: 'NT$' },
        { code: 'USD', name: '美元', symbol: '$' },
        { code: 'EUR', name: '歐元', symbol: '€' },
        { code: 'JPY', name: '日圓', symbol: '¥' },
        { code: 'CNY', name: '人民幣', symbol: '¥' },
        { code: 'HKD', name: '港幣', symbol: 'HK$' },
        { code: 'KRW', name: '韓元', symbol: '₩' },
        { code: 'SGD', name: '新加坡元', symbol: 'S$' },
        { code: 'GBP', name: '英鎊', symbol: '£' },
        { code: 'AUD', name: '澳幣', symbol: 'A$' },
      ];
    }),
  }),
});
export type AppRouter = typeof appRouter;
