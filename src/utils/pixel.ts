/**
 * Pixel & Conversion API Tracking Utility for GOODLUXE
 * Handles TikTok Pixel (CompletePayment, PlaceAnOrder, InitiateCheckout, AddToCart)
 * and Meta Pixel with matching event IDs for server-side Conversion API (CAPI) deduplication.
 */

import { Product } from '../data/products';
import { OrderRecord } from '../components/CartCheckoutModal';

export const TIKTOK_PIXEL_ID = 'DB3L0UBC77UDJITAII3G';
export const META_PIXEL_ID = '4085853741707178';

// Hash string with SHA-256 (client-side using Web Crypto API)
export async function sha256Client(str: string): Promise<string> {
  const clean = str.trim().toLowerCase();
  if (!clean) return '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(clean);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return '';
  }
}

// Normalize Nigerian phone numbers to E.164 (+234...)
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('234')) {
    return `+${digits}`;
  }
  if (digits.startsWith('0') && digits.length === 11) {
    return `+234${digits.slice(1)}`;
  }
  return digits ? `+${digits}` : '';
}

// Get cookie by name
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : undefined;
}

// Get URL query parameter
export function getQueryParam(param: string): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param) || undefined;
}

interface PixelItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface PurchaseTrackingOptions {
  order: OrderRecord;
  product?: Product;
}

/**
 * Tracks a Purchase event across:
 * 1. TikTok Pixel (CompletePayment & PlaceAnOrder with complete parameters and identify)
 * 2. Meta (Facebook) Pixel (Purchase with matching eventID)
 * 3. Server-side Conversion API (/api/conversion-event) for robust server delivery
 */
export async function trackPurchaseEvent({ order, product }: PurchaseTrackingOptions): Promise<void> {
  const eventId = order.orderId;
  const normalizedPhone = normalizePhone(order.phone);
  const [hashedPhone, hashedName] = await Promise.all([
    sha256Client(normalizedPhone),
    sha256Client(order.customerName),
  ]);

  // Extract items
  const items: PixelItem[] = order.items && order.items.length > 0
    ? order.items.map((it) => ({
        id: it.product.id,
        name: it.product.name,
        quantity: it.quantity,
        price: it.product.currentPrice,
      }))
    : [
        {
          id: product?.id || 'glx-smart-cooker-01',
          name: product?.name || '2-BURNER SMART TIMER GAS COOKER',
          quantity: 1,
          price: product?.currentPrice || 160000,
        },
      ];

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const primaryItem = items[0];

  const contentsTikTok = items.map((item) => ({
    content_id: item.id,
    content_name: item.name,
    content_type: 'product',
    quantity: item.quantity,
    price: item.price,
  }));

  const win = window as unknown as {
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      identify?: (data: Record<string, unknown>) => void;
      track?: (event: string, data?: Record<string, unknown>, options?: Record<string, unknown>) => void;
    };
  };

  // 1. TikTok Pixel Client-Side Event
  if (win.ttq) {
    try {
      // Advanced Matching identification
      if (typeof win.ttq.identify === 'function') {
        win.ttq.identify({
          phone_number: hashedPhone || undefined,
          name: hashedName || undefined,
          external_id: order.orderId,
        });
      }

      if (typeof win.ttq.track === 'function') {
        // CompletePayment: Standard TikTok purchase event
        win.ttq.track(
          'CompletePayment',
          {
            contents: contentsTikTok,
            content_type: 'product',
            content_id: primaryItem.id,
            content_name: primaryItem.name,
            quantity: totalQuantity,
            price: primaryItem.price,
            value: order.totalAmount,
            currency: 'NGN',
            description: `Order ${order.orderId} - ${order.customerName}`,
            event_id: eventId,
          },
          { event_id: eventId }
        );

        // PlaceAnOrder: Secondary TikTok checkout completion event
        win.ttq.track(
          'PlaceAnOrder',
          {
            contents: contentsTikTok,
            content_type: 'product',
            content_id: primaryItem.id,
            content_name: primaryItem.name,
            quantity: totalQuantity,
            price: primaryItem.price,
            value: order.totalAmount,
            currency: 'NGN',
            event_id: `${eventId}_pao`,
          },
          { event_id: `${eventId}_pao` }
        );
      }
    } catch (err) {
      console.warn('[Pixel] TikTok tracking error:', err);
    }
  }

  // 2. Meta (Facebook) Pixel Client-Side Event
  if (typeof win.fbq === 'function') {
    try {
      win.fbq(
        'track',
        'Purchase',
        {
          content_ids: items.map((i) => i.id),
          content_name: primaryItem.name,
          content_type: 'product',
          contents: items.map((i) => ({
            id: i.id,
            quantity: i.quantity,
            item_price: i.price,
          })),
          num_items: totalQuantity,
          value: order.totalAmount,
          currency: 'NGN',
        },
        { eventID: eventId }
      );
    } catch (err) {
      console.warn('[Pixel] Meta tracking error:', err);
    }
  }

  // 3. Server-Side Conversion API (CAPI)
  try {
    const fbp = getCookie('_fbp');
    const fbc = getCookie('_fbc') || (getQueryParam('fbclid') ? `fb.1.${Date.now()}.${getQueryParam('fbclid')}` : undefined);
    const ttclid = getQueryParam('ttclid') || getCookie('_ttp');

    await fetch('/api/conversion-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName: 'Purchase',
        eventId,
        orderId: order.orderId,
        totalAmount: order.totalAmount,
        currency: 'NGN',
        items,
        customer: {
          fullName: order.customerName,
          phone: order.phone,
          normalizedPhone,
          state: order.state,
          address: order.address,
        },
        attribution: {
          fbp,
          fbc,
          ttclid,
          userAgent: navigator.userAgent,
          pageUrl: window.location.href,
          referrer: document.referrer,
        },
      }),
    });
  } catch (err) {
    // Non-blocking for UI, logs silently
    console.debug('[Conversion API] Server dispatch notice:', err);
  }
}

/**
 * Standard pixel tracking for AddToCart and InitiateCheckout
 */
export function trackStandardEvent(
  eventName: 'AddToCart' | 'InitiateCheckout' | 'ViewContent',
  params: {
    product: Product;
    quantity: number;
    value: number;
    currency?: string;
  }
): void {
  const win = window as unknown as {
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      track?: (event: string, data?: Record<string, unknown>, options?: Record<string, unknown>) => void;
    };
  };

  const currency = params.currency || 'NGN';
  const contents = [
    {
      content_id: params.product.id,
      content_name: params.product.name,
      content_type: 'product',
      quantity: params.quantity,
      price: params.product.currentPrice,
    },
  ];

  // Meta Pixel
  if (typeof win.fbq === 'function') {
    win.fbq('track', eventName, {
      content_name: params.product.name,
      content_ids: [params.product.id],
      content_type: 'product',
      contents: [
        {
          id: params.product.id,
          quantity: params.quantity,
          item_price: params.product.currentPrice,
        },
      ],
      value: params.value,
      currency,
    });
  }

  // TikTok Pixel
  if (win.ttq && typeof win.ttq.track === 'function') {
    win.ttq.track(eventName, {
      contents,
      content_id: params.product.id,
      content_name: params.product.name,
      content_type: 'product',
      quantity: params.quantity,
      price: params.product.currentPrice,
      value: params.value,
      currency,
    });
  }
}
