import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { verifyToken } from "../jwt";
import { COOKIE_NAME } from "@shared/const";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Get token from cookie
    const token = opts.req.cookies?.[COOKIE_NAME];
    
    if (token) {
      // Verify JWT token
      const payload = verifyToken(token);
      
      if (payload) {
        // Get user from database
        user = await db.getUserById(payload.userId);
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
