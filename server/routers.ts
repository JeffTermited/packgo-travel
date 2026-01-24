import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { extractTourInfoWithManus } from "./manusApi";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  
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
          const assistantMessage = response.choices[0]?.message?.content || "抱歉，我無法處理您的請求。請稍後再試。";

          return {
            response: assistantMessage,
          };
        } catch (error) {
          console.error("[AI Chat] Error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "無法連接到 AI 服務，請稍後再試。",
          });
        }
      }),
  }),
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
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
        })
      )
      .query(async ({ input }) => {
        return await db.searchTours(input);
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
      .input(z.object({ ids: z.array(z.number()).min(1) }))
      .mutation(async ({ ctx, input }) => {
        // Check if user is admin
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can delete tours",
          });
        }

        await db.batchDeleteTours(input.ids);

        return { success: true, deletedCount: input.ids.length };
      }),

    // Auto-generate tour from URL (admin only) - Enhanced version with detailed extraction
    autoGenerate: protectedProcedure
      .input(z.object({ url: z.string().url() }))
      .mutation(async ({ ctx, input }) => {
        // Check if user is admin
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can auto-generate tours",
          });
        }

        try {
          // Step 1: Use Manus API to browse and extract tour information
          console.log("[AutoGenerate] Using Manus API to extract tour info from URL:", input.url);
          
          let llmContent: string;
          
          // Check if MANUS_API_KEY is configured
          if (process.env.MANUS_API_KEY) {
            // Use Manus Browser Operator
            console.log("[AutoGenerate] MANUS_API_KEY found, using Manus Browser Operator");
            llmContent = await extractTourInfoWithManus(input.url);
          } else {
            // Fallback to fetch + LLM approach
            console.log("[AutoGenerate] MANUS_API_KEY not found, using fallback fetch + LLM approach");
            const response = await fetch(input.url, {
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
              },
            });

            if (!response.ok) {
              throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
            }

            const htmlContent = await response.text();
            console.log("[AutoGenerate] HTML content length:", htmlContent.length);

            // Extract text content from HTML
            const textContent = htmlContent
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim()
              .substring(0, 25000);

            console.log("[AutoGenerate] Extracted text length:", textContent.length);

            // Use LLM to extract tour information
            const extractionPrompt = `你是一個資深旅遊編輯，專門從網頁內容中提取完整的旅遊行程資訊。請從以下網頁內容中提取所有旅遊行程資訊，並以 JSON 格式回傳。

網頁內容：
${textContent}

請提取以下資訊並以 JSON 格式回傳（如果找不到某項資訊，請使用合理的預設值或留空）：
{
  "basicInfo": {
    "title": "行程標題（請重新撰寫一個吸引人的行銷標題）",
    "productCode": "產品代碼",
    "description": "行程描述（100-200字的精彩行程亮點介紹）",
    "promotionText": "促銷文字（如：過年大促銷、限時優惠等）",
    "tags": ["標籤，如：特色住宿、獨家企劃、刷卡好康"]
  },
  "location": {
    "departureCountry": "出發國家（預設台灣）",
    "departureCity": "出發城市（如：桃園、台北、高雄）",
    "departureAirportCode": "出發機場代碼（如：TPE）",
    "departureAirportName": "出發機場名稱",
    "destinationCountry": "目的地國家",
    "destinationCity": "目的地城市",
    "destinationRegion": "目的地區域（如：那霸、大阪、東京）",
    "destinationAirportCode": "目的地機場代碼",
    "destinationAirportName": "目的地機場名稱",
    "destinationDescription": "目的地介紹（100-200字）"
  },
  "duration": {
    "days": 天數,
    "nights": 晚數
  },
  "pricing": {
    "price": 價格（數字，新台幣）,
    "priceUnit": "人/起",
    "availableSeats": 可賣席次（數字）
  },
  "flight": {
    "outbound": {
      "airline": "去程航空公司",
      "flightNo": "去程航班號",
      "departureTime": "去程出發時間（如：06:55）",
      "arrivalTime": "去程抵達時間（如：09:15）",
      "duration": "去程飛行時間（如：1h20m）"
    },
    "inbound": {
      "airline": "回程航空公司",
      "flightNo": "回程航班號",
      "departureTime": "回程出發時間",
      "arrivalTime": "回程抵達時間",
      "duration": "回程飛行時間"
    }
  },
  "accommodation": {
    "hotelName": "酒店名稱",
    "hotelGrade": "酒店等級（如：五星級、四星級）",
    "hotelNights": 住宿晚數,
    "hotelLocation": "酒店位置",
    "hotelDescription": "酒店介紹（100-200字）",
    "hotelFacilities": ["設施1", "設施2"],
    "hotelRoomType": "房型",
    "hotelRoomSize": "房間大小",
    "hotelCheckIn": "入住時間",
    "hotelCheckOut": "退房時間",
    "hotelSpecialOffers": ["特別贈送項目"],
    "hotelWebsite": "酒店官網"
  },
  "attractions": [
    {
      "name": "景點名稱",
      "description": "景點描述"
    }
  ],
  "dailyItinerary": [
    {
      "day": 1,
      "title": "第一天標題",
      "activities": ["活動1", "活動2"]
    }
  ],
  "pricingDetails": {
    "includes": ["費用包含項目1", "費用包含項目2"],
    "excludes": ["費用不含項目1", "費用不含項目2"],
    "optionalTours": [
      {
        "name": "自費行程名稱",
        "content": "自費行程內容",
        "price": 價格,
        "includes": ["包含項目"]
      }
    ]
  },
  "highlights": ["行程亮點1", "行程亮點2"],
  "notes": {
    "specialReminders": "行程特殊提醒",
    "notes": "行程備註",
    "safetyGuidelines": "安全守則",
    "flightRules": "團體航班規定事項"
  },
  "departureDate": "出發日期（YYYY-MM-DD）",
  "imageUrl": "行程主圖片網址"
}

重要注意事項：
1. 標題請重新撰寫，使其更吸引人，不要原文照抄
2. 描述請重新撰寫，突出行程亮點
3. 價格請只提取數字，不要包含貨幣符號
4. 天數和晚數請只提取數字
5. 請確保 JSON 格式正確，可以被解析
6. 如果找不到某項資訊，請留空或使用合理的預設值`;

            const llmResponse = await invokeLLM({
              messages: [
                {
                  role: "system" as const,
                  content: "你是一個資深旅遊編輯，專門從網頁內容中提取結構化的旅遊行程資訊。你需要重新撰寫標題和描述，使其更具吸引力。請只回傳 JSON 格式的資料，不要包含其他文字。",
                },
                {
                  role: "user" as const,
                  content: extractionPrompt,
                },
              ],
              response_format: { type: "json_object" },
            });

            const fallbackContent = llmResponse.choices[0]?.message?.content;
            if (!fallbackContent) {
              throw new Error("LLM did not return any content");
            }
            llmContent = typeof fallbackContent === "string" ? fallbackContent : JSON.stringify(fallbackContent);
            console.log("[AutoGenerate] LLM response:", llmContent);
          }

          // Now llmContent contains the JSON string from either Manus API or fallback LLM
          console.log("[AutoGenerate] Processing extracted content...");

          // Parse the JSON response
          let extractedData;
          try {
            extractedData = JSON.parse(typeof llmContent === "string" ? llmContent : JSON.stringify(llmContent));
          } catch (parseError) {
            console.error("[AutoGenerate] JSON parse error:", parseError);
            throw new Error("Failed to parse LLM response as JSON");
          }

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

          // Return the extracted data in a standardized format matching the new schema
          return {
            success: true,
            data: {
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
              price: parseInt(pricing.price) || 0,
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
              
              // Dates
              departureDate: extractedData.departureDate || null,
              
              // Images
              imageUrl: extractedData.imageUrl || "",
              
              // Source
              sourceUrl: input.url,
              isAutoGenerated: 1,
            },
          };
        } catch (error) {
          console.error("[AutoGenerate] Error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "自動生成行程失敗，請稍後再試",
          });
        }
      }),
  }),

  // Tour departures router
  departures: router({
    // Get all departures for a tour (public)
    listByTour: publicProcedure
      .input(z.object({ tourId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTourDepartures(input.tourId);
      }),

    // Get single departure by ID (public)
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const departure = await db.getDepartureById(input.id);
        if (!departure) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Departure not found",
          });
        }
        return departure;
      }),

    // Create new departure (admin only)
    create: protectedProcedure
      .input(
        z.object({
          tourId: z.number(),
          departureDate: z.date(),
          returnDate: z.date(),
          adultPrice: z.number().min(0),
          childPriceWithBed: z.number().min(0).optional(),
          childPriceNoBed: z.number().min(0).optional(),
          infantPrice: z.number().min(0).optional(),
          singleRoomSupplement: z.number().min(0).optional(),
          totalSlots: z.number().min(1),
          status: z.enum(["open", "full", "cancelled"]).default("open"),
          currency: z.string().default("TWD"),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can create departures",
          });
        }

        return await db.createDeparture(input);
      }),

    // Update departure (admin only)
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          departureDate: z.date().optional(),
          returnDate: z.date().optional(),
          adultPrice: z.number().min(0).optional(),
          childPriceWithBed: z.number().min(0).optional(),
          childPriceNoBed: z.number().min(0).optional(),
          infantPrice: z.number().min(0).optional(),
          singleRoomSupplement: z.number().min(0).optional(),
          totalSlots: z.number().min(1).optional(),
          bookedSlots: z.number().min(0).optional(),
          status: z.enum(["open", "full", "cancelled"]).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can update departures",
          });
        }

        const { id, ...updates } = input;
        return await db.updateDeparture(id, updates);
      }),

    // Delete departure (admin only)
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can delete departures",
          });
        }

        await db.deleteDeparture(input.id);
        return { success: true };
      }),
  }),

  // Bookings router
  bookings: router({    // Get all bookings (admin sees all, users see their own)
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "admin") {
        return await db.getAllBookings();
      } else {
        return await db.getAllBookings({ userId: ctx.user.id });
      }
    }),

    // Get single booking by ID
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

        // Check if user has permission to view this booking
        if (ctx.user.role !== "admin" && booking.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to view this booking",
          });
        }

        return booking;
      }),

    // Get booking participants
    getParticipants: protectedProcedure
      .input(z.object({ bookingId: z.number() }))
      .query(async ({ ctx, input }) => {
        const booking = await db.getBookingById(input.bookingId);
        if (!booking) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Booking not found",
          });
        }

        // Check permission
        if (ctx.user.role !== "admin" && booking.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to view these participants",
          });
        }

        return await db.getBookingParticipants(input.bookingId);
      }),

    // Create new booking (authenticated users or guest)
    create: publicProcedure
      .input(
        z.object({
          tourId: z.number(),
          departureId: z.number(),
          customerName: z.string().min(1),
          customerEmail: z.string().email(),
          customerPhone: z.string().min(1),
          numberOfAdults: z.number().min(0).default(0),
          numberOfChildrenWithBed: z.number().min(0).default(0),
          numberOfChildrenNoBed: z.number().min(0).default(0),
          numberOfInfants: z.number().min(0).default(0),
          numberOfSingleRooms: z.number().min(0).default(0),
          message: z.string().optional(),
          participants: z.array(
            z.object({
              participantType: z.enum(["adult", "child", "infant"]),
              firstName: z.string().min(1),
              lastName: z.string().min(1),
              gender: z.enum(["male", "female", "other"]).optional(),
              dateOfBirth: z.date().optional(),
              passportNumber: z.string().optional(),
              passportExpiry: z.date().optional(),
              nationality: z.string().optional(),
              dietaryRequirements: z.string().optional(),
              specialNeeds: z.string().optional(),
            })
          ),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Get departure to calculate price
        const departure = await db.getDepartureById(input.departureId);
        if (!departure) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Departure not found",
          });
        }

        // Check availability
        const availableSlots = departure.totalSlots - departure.bookedSlots;
        const totalPeople =
          input.numberOfAdults +
          input.numberOfChildrenWithBed +
          input.numberOfChildrenNoBed +
          input.numberOfInfants;

        if (totalPeople > availableSlots) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Not enough available slots",
          });
        }

        // Calculate total price
        let totalPrice = 0;
        totalPrice += input.numberOfAdults * departure.adultPrice;
        if (departure.childPriceWithBed) {
          totalPrice += input.numberOfChildrenWithBed * departure.childPriceWithBed;
        }
        if (departure.childPriceNoBed) {
          totalPrice += input.numberOfChildrenNoBed * departure.childPriceNoBed;
        }
        if (departure.infantPrice) {
          totalPrice += input.numberOfInfants * departure.infantPrice;
        }
        if (departure.singleRoomSupplement) {
          totalPrice += input.numberOfSingleRooms * departure.singleRoomSupplement;
        }

        // Calculate deposit (20%) and remaining amount
        const depositAmount = Math.round(totalPrice * 0.2);
        const remainingAmount = totalPrice - depositAmount;

        // Calculate due dates (deposit due in 3 days, balance due 30 days before departure)
        const now = new Date();
        const depositDueDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        const balanceDueDate = new Date(
          departure.departureDate.getTime() - 30 * 24 * 60 * 60 * 1000
        );

        // Create booking
        const { participants, ...bookingData } = input;
        const booking = await db.createBooking({
          ...bookingData,
          userId: ctx.user?.id,
          totalPrice,
          depositAmount,
          remainingAmount,
          currency: departure.currency,
          depositDueDate,
          balanceDueDate,
        });

        // Create participants
        for (const participant of participants) {
          await db.createBookingParticipant({
            bookingId: booking.id,
            ...participant,
          });
        }

        // Update booked slots
        await db.updateDeparture(input.departureId, {
          bookedSlots: departure.bookedSlots + totalPeople,
        });

        return booking;
      }),

    // Update booking status (admin only)
    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          bookingStatus: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
          paymentStatus: z.enum(["unpaid", "deposit", "paid", "refunded"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can update booking status",
          });
        }

        const { id, ...updates } = input;
        return await db.updateBooking(id, updates);
      }),

    // Create Stripe checkout session for booking payment
    createCheckoutSession: protectedProcedure
      .input(
        z.object({
          bookingId: z.number(),
          paymentType: z.enum(["deposit", "full", "balance"]),
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

        // Check permission
        if (ctx.user.role !== "admin" && booking.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to pay for this booking",
          });
        }

        // Calculate amount based on payment type
        let amount = 0;
        if (input.paymentType === "deposit") {
          amount = booking.depositAmount;
        } else if (input.paymentType === "balance") {
          amount = booking.remainingAmount;
        } else {
          amount = booking.totalPrice;
        }

        // Import Stripe dynamically
        const Stripe = (await import("stripe")).default;
        const { ENV } = await import("./_core/env");
        const stripe = new Stripe(ENV.stripeSecretKey, {
          apiVersion: "2025-12-15.clover",
        });

        // Create checkout session
        const origin = ctx.req.headers.origin || "http://localhost:3000";
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: booking.currency.toLowerCase(),
                product_data: {
                  name: `Tour Booking #${booking.id}`,
                  description: `${input.paymentType === "deposit" ? "Deposit" : input.paymentType === "balance" ? "Balance" : "Full"} payment for tour booking`,
                },
                unit_amount: Math.round(amount * 100), // Convert to cents
              },
              quantity: 1,
            },
          ],
          customer_email: booking.customerEmail,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            booking_id: booking.id.toString(),
            user_id: ctx.user.id.toString(),
            customer_email: booking.customerEmail,
            customer_name: booking.customerName,
            payment_type: input.paymentType,
          },
          success_url: `${origin}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/booking/${booking.id}`,
          allow_promotion_codes: true,
        });

        return {
          sessionId: session.id,
          url: session.url,
        };
      }),
  }),

  // Admin dashboard router
  admin: router({
    // Get dashboard statistics (admin only)
    getStats: adminProcedure.query(async () => {
      const [bookings, tours, inquiries] = await Promise.all([
        db.getAllBookings(),
        db.getAllTours(),
        db.getAllInquiries(),
      ]);

      // Calculate today's bookings
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayBookings = bookings.filter(
        (b) => new Date(b.createdAt).getTime() >= today.getTime()
      );

      // Calculate this month's revenue
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const thisMonthBookings = bookings.filter(
        (b) => new Date(b.createdAt).getTime() >= thisMonth.getTime()
      );
      const thisMonthRevenue = thisMonthBookings.reduce(
        (sum, b) => sum + (b.totalPrice || 0),
        0
      );

      // Calculate last month's revenue for comparison
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      const lastMonthBookings = bookings.filter((b) => {
        const createdAt = new Date(b.createdAt).getTime();
        return createdAt >= lastMonth.getTime() && createdAt <= lastMonthEnd.getTime();
      });
      const lastMonthRevenue = lastMonthBookings.reduce(
        (sum, b) => sum + (b.totalPrice || 0),
        0
      );

      // Calculate revenue growth percentage
      const revenueGrowth =
        lastMonthRevenue > 0
          ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : 0;

      // Count pending inquiries
      const pendingInquiries = inquiries.filter(
        (i) => i.status === "new" || i.status === "in_progress"
      );

      // Count active tours
      const activeTours = tours.filter((t) => t.status === "active");

      return {
        todayBookings: todayBookings.length,
        todayBookingsGrowth: 0, // Can be calculated if needed
        thisMonthRevenue,
        revenueGrowth,
        pendingInquiries: pendingInquiries.length,
        totalInquiries: inquiries.length,
        totalTours: tours.length,
        activeTours: activeTours.length,
      };
    }),
  }),

  // Inquiries router
  inquiries: router({
    // Get all inquiries (admin sees all, users see their own)
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "admin") {
        return await db.getAllInquiries();
      } else {
        return await db.getAllInquiries({ userId: ctx.user.id });
      }
    }),

    // Get single inquiry by ID
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

        // Check permission
        if (ctx.user.role !== "admin" && inquiry.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to view this inquiry",
          });
        }

        return inquiry;
      }),

    // Get inquiry messages
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

        // Check permission
        if (ctx.user.role !== "admin" && inquiry.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to view these messages",
          });
        }

        return await db.getInquiryMessages(input.inquiryId);
      }),

    // Create new inquiry (public)
    create: publicProcedure
      .input(
        z.object({
          inquiryType: z.enum(["general", "custom_tour", "visa", "group_booking", "complaint", "other"]),
          customerName: z.string().min(1),
          customerEmail: z.string().email(),
          customerPhone: z.string().optional(),
          subject: z.string().min(1),
          message: z.string().min(1),
          destination: z.string().optional(),
          numberOfDays: z.number().optional(),
          numberOfPeople: z.number().optional(),
          budget: z.number().optional(),
          preferredDepartureDate: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.createInquiry({
          ...input,
          userId: ctx.user?.id,
        });
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

        // Check permission
        const isAdmin = ctx.user.role === "admin";
        const isOwner = inquiry.userId === ctx.user.id;

        if (!isAdmin && !isOwner) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to add messages to this inquiry",
          });
        }

        const message = await db.createInquiryMessage({
          inquiryId: input.inquiryId,
          senderId: ctx.user.id,
          senderType: isAdmin ? "admin" : "customer",
          message: input.message,
        });

        // Update inquiry status
        if (isAdmin) {
          await db.updateInquiry(input.inquiryId, { status: "replied" });
        }

        return message;
      }),

    // Update inquiry (admin only)
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["new", "in_progress", "replied", "resolved", "closed"]).optional(),
          assignedTo: z.number().optional(),
          priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can update inquiries",
          });
        }

        const { id, ...updates } = input;
        return await db.updateInquiry(id, updates);
      }),
  }),

  // Newsletter subscription router
  newsletter: router({
    // Subscribe to newsletter
    subscribe: publicProcedure
      .input(
        z.object({
          email: z.string().email("Invalid email address"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const subscriber = await db.createNewsletterSubscriber({
            email: input.email,
          });
          return { success: true, message: "訂閱成功！感謝您的訂閱" };
        } catch (error: any) {
          // Check if email already exists
          if (error.code === "ER_DUP_ENTRY" || error.message?.includes("Duplicate entry")) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "此電子郵件已經訂閱過",
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "訂閱失敗，請稍後再試",
          });
        }
      }),

    // Get all subscribers (admin only)
    getAll: adminProcedure
      .query(async () => {
        return await db.getAllNewsletterSubscribers();
      }),

    // Unsubscribe from newsletter
    unsubscribe: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
        })
      )
      .mutation(async ({ input }) => {
        await db.unsubscribeNewsletter(input.email);
        return { success: true, message: "已成功取消訂閱" };
      }),
  }),
});

export type AppRouter = typeof appRouter;
