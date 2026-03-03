/**
 * GA4 Analytics Helper
 * Measurement ID: G-91VLGFSK70
 *
 * Provides typed wrappers around window.gtag() for all custom events.
 * All functions are no-ops if gtag is not loaded (e.g., ad-blocker).
 */

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

/** Safe gtag caller — silently skips if gtag is blocked */
function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

// ─── Page View ───────────────────────────────────────────────────────────────

/**
 * Track a page view. Call this inside useEffect on route changes.
 * GA4 fires page_view automatically on first load; this covers SPA navigation.
 */
export function trackPageView(path: string, title?: string) {
  gtag("event", "page_view", {
    page_path: path,
    page_title: title ?? document.title,
  });
}

// ─── Search ──────────────────────────────────────────────────────────────────

/**
 * Fired when a user submits a search query on SearchResults page.
 */
export function trackSearch(params: {
  keyword: string;
  destination?: string;
  duration?: string;
  budget?: string;
  resultCount?: number;
}) {
  gtag("event", "search", {
    search_term: params.keyword,
    destination: params.destination ?? "",
    duration: params.duration ?? "",
    budget: params.budget ?? "",
    result_count: params.resultCount ?? 0,
  });
}

// ─── Tour Detail ─────────────────────────────────────────────────────────────

/**
 * Fired when a user views a tour detail page.
 */
export function trackViewTour(params: {
  tourId: string | number;
  tourName: string;
  destination?: string;
  price?: number;
  currency?: string;
}) {
  gtag("event", "view_tour", {
    tour_id: String(params.tourId),
    tour_name: params.tourName,
    destination: params.destination ?? "",
    value: params.price ?? 0,
    currency: params.currency ?? "TWD",
  });

  // Also fire GA4 standard view_item for e-commerce reports
  gtag("event", "view_item", {
    currency: params.currency ?? "TWD",
    value: params.price ?? 0,
    items: [
      {
        item_id: String(params.tourId),
        item_name: params.tourName,
        item_category: params.destination ?? "",
        price: params.price ?? 0,
      },
    ],
  });
}

// ─── Checkout ────────────────────────────────────────────────────────────────

/**
 * Fired when a user enters the booking / checkout flow.
 */
export function trackBeginCheckout(params: {
  tourId: string | number;
  tourName: string;
  price: number;
  currency?: string;
  numTravelers?: number;
}) {
  gtag("event", "begin_checkout", {
    currency: params.currency ?? "TWD",
    value: params.price,
    items: [
      {
        item_id: String(params.tourId),
        item_name: params.tourName,
        price: params.price,
        quantity: params.numTravelers ?? 1,
      },
    ],
  });
}

// ─── Purchase ────────────────────────────────────────────────────────────────

/**
 * Fired when a booking is confirmed / payment succeeds.
 */
export function trackPurchase(params: {
  orderId: string | number;
  tourId: string | number;
  tourName: string;
  value: number;
  currency?: string;
  numTravelers?: number;
}) {
  gtag("event", "purchase", {
    transaction_id: String(params.orderId),
    currency: params.currency ?? "TWD",
    value: params.value,
    items: [
      {
        item_id: String(params.tourId),
        item_name: params.tourName,
        price: params.value,
        quantity: params.numTravelers ?? 1,
      },
    ],
  });
}
