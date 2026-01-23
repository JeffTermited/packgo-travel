import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";

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

    // Create new tour (admin only)
    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1),
          destination: z.string().min(1),
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
