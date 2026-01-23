import { z } from "zod";

// Login form validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "請輸入電子郵件")
    .email("電子郵件格式不正確"),
  password: z
    .string()
    .min(1, "請輸入密碼")
    .min(8, "密碼至少需要 8 個字元"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register form validation schema
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "請輸入姓名")
    .min(2, "姓名至少需要 2 個字元")
    .max(50, "姓名不能超過 50 個字元"),
  email: z
    .string()
    .min(1, "請輸入電子郵件")
    .email("電子郵件格式不正確"),
  password: z
    .string()
    .min(1, "請輸入密碼")
    .min(8, "密碼至少需要 8 個字元")
    .regex(/[A-Z]/, "密碼需包含至少一個大寫字母")
    .regex(/[a-z]/, "密碼需包含至少一個小寫字母")
    .regex(/[0-9]/, "密碼需包含至少一個數字"),
  confirmPassword: z
    .string()
    .min(1, "請確認密碼"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "密碼不一致",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Forgot password form validation schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "請輸入電子郵件")
    .email("電子郵件格式不正確"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Reset password form validation schema
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, "請輸入新密碼")
    .min(8, "密碼至少需要 8 個字元")
    .regex(/[A-Z]/, "密碼需包含至少一個大寫字母")
    .regex(/[a-z]/, "密碼需包含至少一個小寫字母")
    .regex(/[0-9]/, "密碼需包含至少一個數字"),
  confirmPassword: z
    .string()
    .min(1, "請確認新密碼"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "密碼不一致",
  path: ["confirmPassword"],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Password strength calculator
export function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) {
    return { score, label: "弱", color: "bg-red-500" };
  } else if (score <= 4) {
    return { score, label: "中等", color: "bg-yellow-500" };
  } else {
    return { score, label: "強", color: "bg-green-500" };
  }
}

// Profile edit schema
export const profileEditSchema = z.object({
  name: z.string().min(1, "姓名不能為空").max(50, "姓名最多 50 個字元"),
  phone: z.string().optional().refine(
    (val) => !val || /^[0-9+\-\s()]+$/.test(val),
    "電話格式不正確"
  ),
  address: z.string().optional(),
});

export type ProfileEditFormData = z.infer<typeof profileEditSchema>;


// Quick inquiry form validation schema
export const quickInquirySchema = z.object({
  customerName: z.string().min(1, "請輸入姓名").max(100, "姓名最多 100 個字元"),
  customerEmail: z.string().min(1, "請輸入電子郵件").email("電子郵件格式不正確"),
  customerPhone: z.string().optional(),
  subject: z.string().min(1, "請輸入諮詢主旨").max(255, "主旨最多 255 個字元"),
  message: z.string().min(10, "諮詢內容至少需要 10 個字元").max(2000, "諮詢內容最多 2000 個字元"),
});

export type QuickInquiryFormData = z.infer<typeof quickInquirySchema>;

// Custom tour request form validation schema
export const customTourSchema = z.object({
  customerName: z.string().min(1, "請輸入姓名").max(100, "姓名最多 100 個字元"),
  customerEmail: z.string().min(1, "請輸入電子郵件").email("電子郵件格式不正確"),
  customerPhone: z.string().optional(),
  subject: z.string().min(1, "請輸入主旨").max(255, "主旨最多 255 個字元"),
  message: z.string().min(10, "需求描述至少需要 10 個字元").max(2000, "需求描述最多 2000 個字元"),
  destination: z.string().min(1, "請輸入目的地").max(255, "目的地最多 255 個字元"),
  numberOfDays: z.number().min(1, "天數至少為 1 天").max(365, "天數最多為 365 天"),
  numberOfPeople: z.number().min(1, "人數至少為 1 人").max(100, "人數最多為 100 人"),
  budget: z.number().min(0, "預算不能為負數").optional(),
  preferredDepartureDate: z.date().optional(),
});

export type CustomTourFormData = z.infer<typeof customTourSchema>;
