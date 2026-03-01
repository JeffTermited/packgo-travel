/**
 * useRecaptcha Hook
 * Loads Google reCAPTCHA v3 and provides a function to execute it
 * reCAPTCHA badge is hidden by default (shown only on protected pages)
 */
import { useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string;

/**
 * Dynamically load the reCAPTCHA v3 script once
 */
function loadRecaptchaScript(): Promise<void> {
  return new Promise((resolve) => {
    if (window.grecaptcha) {
      resolve();
      return;
    }
    const existing = document.getElementById("recaptcha-script");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.id = "recaptcha-script";
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

/**
 * useRecaptcha — call executeRecaptcha(action) before form submission
 * Returns a token string to pass to the backend
 */
export function useRecaptcha() {
  const loaded = useRef(false);

  useEffect(() => {
    if (!SITE_KEY) {
      console.warn("[reCAPTCHA] VITE_RECAPTCHA_SITE_KEY is not set");
      return;
    }
    if (loaded.current) return;
    loaded.current = true;
    loadRecaptchaScript().catch(console.error);
  }, []);

  const executeRecaptcha = useCallback(
    async (action: string): Promise<string | null> => {
      if (!SITE_KEY) {
        console.warn("[reCAPTCHA] Site key not configured, skipping verification");
        return null;
      }
      try {
        await loadRecaptchaScript();
        return await new Promise<string>((resolve, reject) => {
          window.grecaptcha.ready(async () => {
            try {
              const token = await window.grecaptcha.execute(SITE_KEY, { action });
              resolve(token);
            } catch (err) {
              reject(err);
            }
          });
        });
      } catch (error) {
        console.error("[reCAPTCHA] Failed to execute:", error);
        return null;
      }
    },
    []
  );

  return { executeRecaptcha };
}
