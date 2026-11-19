import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Helper for SHA-256 hashing
function sha256(val: string): string {
  if (!val) return '';
  return crypto.createHash('sha256').update(val.trim().toLowerCase()).digest('hex');
}

// Configured Pixel IDs
const TIKTOK_PIXEL_ID = process.env.TIKTOK_PIXEL_ID || 'DB3L0UBC77UDJITAII3G';
const META_PIXEL_ID = process.env.META_PIXEL_ID || '4085853741707178';

// Conversion Status Diagnostic Endpoint
app.get('/api/conversion-status', (_req: Request, res: Response) => {
  const hasTikTokToken = Boolean(process.env.TIKTOK_ACCESS_TOKEN || process.env.TIKTOK_EVENTS_API_TOKEN);
  const hasMetaToken = Boolean(process.env.META_ACCESS_TOKEN || process.env.FACEBOOK_ACCESS_TOKEN);

  res.json({
    status: 'active',
    tiktok: {
      pixelId: TIKTOK_PIXEL_ID,
      conversionApiConfigured: hasTikTokToken,
      testEventCode: process.env.TIKTOK_TEST_EVENT_CODE || null,
    },
    meta: {
      pixelId: META_PIXEL_ID,
      conversionApiConfigured: hasMetaToken,
      testEventCode: process.env.META_TEST_EVENT_CODE || null,
    },
    timestamp: new Date().toISOString(),
  });
});

// Conversion API (CAPI) Tracking Endpoint
app.post('/api/conversion-event', async (req: Request, res: Response) => {
  try {
    const {
      eventName = 'Purchase',
      eventId,
      orderId,
      totalAmount,
      currency = 'NGN',
      items = [],
      customer = {},
      attribution = {},
    } = req.body;

    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '';
    const userAgent = (req.headers['user-agent'] as string) || attribution.userAgent || '';
    const nowUnix = Math.floor(Date.now() / 1000);

    const rawPhone = customer.normalizedPhone || customer.phone || '';
    const hashedPhone = rawPhone ? sha256(rawPhone) : '';
    const hashedName = customer.fullName ? sha256(customer.fullName) : '';
    const hashedOrderId = orderId ? sha256(orderId) : '';

    const tiktokAccessToken =
      process.env.TIKTOK_ACCESS_TOKEN || process.env.TIKTOK_EVENTS_API_TOKEN;
    const metaAccessToken =
      process.env.META_ACCESS_TOKEN || process.env.FACEBOOK_ACCESS_TOKEN;

    const results: Record<string, unknown> = {
      orderId,
      eventId: eventId || orderId,
      tiktok: { dispatched: false },
      meta: { dispatched: false },
    };

    // 1. TikTok Events API (Conversions API)
    if (tiktokAccessToken) {
      try {
        const tiktokPayload = {
          event_source: 'web',
          event_source_id: TIKTOK_PIXEL_ID,
          test_event_code: process.env.TIKTOK_TEST_EVENT_CODE || undefined,
          data: [
            {
              event: eventName === 'Purchase' ? 'CompletePayment' : eventName,
              event_time: nowUnix,
              event_id: eventId || orderId,
              user: {
                phone: hashedPhone || undefined,
                external_id: hashedOrderId || undefined,
                ip: clientIp || undefined,
                user_agent: userAgent || undefined,
                ttclid: attribution.ttclid || undefined,
              },
              properties: {
                contents: items.map((it: { id: string; name: string; quantity: number; price: number }) => ({
                  content_id: it.id,
                  content_name: it.name,
                  content_type: 'product',
                  quantity: it.quantity,
                  price: it.price,
                })),
                content_type: 'product',
                value: totalAmount,
                currency,
                description: `Order ${orderId}`,
              },
              page: {
                url: attribution.pageUrl || undefined,
                referrer: attribution.referrer || undefined,
              },
            },
          ],
        };

        const ttRes = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
          method: 'POST',
          headers: {
            'Access-Token': tiktokAccessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tiktokPayload),
        });

        const ttData = await ttRes.json();
        results.tiktok = { dispatched: true, status: ttRes.status, response: ttData };
      } catch (ttErr) {
        console.error('[TikTok CAPI Error]', ttErr);
        results.tiktok = { dispatched: false, error: String(ttErr) };
      }
    } else {
      results.tiktok = {
        dispatched: false,
        note: 'TIKTOK_ACCESS_TOKEN not set in environment. Set TIKTOK_ACCESS_TOKEN to stream directly to TikTok Events API.',
      };
    }

    // 2. Meta Conversions API (CAPI)
    if (metaAccessToken) {
      try {
        const metaPayload = {
          data: [
            {
              event_name: eventName,
              event_time: nowUnix,
              event_id: eventId || orderId,
              action_source: 'website',
              event_source_url: attribution.pageUrl,
              user_data: {
                ph: hashedPhone ? [hashedPhone] : undefined,
                fn: hashedName ? [hashedName] : undefined,
                client_ip_address: clientIp || undefined,
                client_user_agent: userAgent || undefined,
                fbp: attribution.fbp || undefined,
                fbc: attribution.fbc || undefined,
              },
              custom_data: {
                currency,
                value: totalAmount,
                contents: items.map((it: { id: string; quantity: number; price: number }) => ({
                  id: it.id,
                  quantity: it.quantity,
                  item_price: it.price,
                })),
                content_type: 'product',
                order_id: orderId,
              },
            },
          ],
          test_event_code: process.env.META_TEST_EVENT_CODE || undefined,
        };

        const metaRes = await fetch(
          `https://graph.facebook.com/v19.0/${META_PIXEL_ID}/events?access_token=${metaAccessToken}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(metaPayload),
          }
        );

        const metaData = await metaRes.json();
        results.meta = { dispatched: true, status: metaRes.status, response: metaData };
      } catch (mErr) {
        console.error('[Meta CAPI Error]', mErr);
        results.meta = { dispatched: false, error: String(mErr) };
      }
    } else {
      results.meta = {
        dispatched: false,
        note: 'META_ACCESS_TOKEN not set in environment. Set META_ACCESS_TOKEN to stream directly to Meta Conversions API.',
      };
    }

    console.log(
      `[Conversion API] Processed ${eventName} for ${orderId} (${currency} ${totalAmount}). TikTok: ${(results.tiktok as { dispatched: boolean }).dispatched ? 'SENT' : 'LOGGED'}, Meta: ${(results.meta as { dispatched: boolean }).dispatched ? 'SENT' : 'LOGGED'}`
    );

    res.status(200).json({
      success: true,
      message: 'Conversion event processed successfully',
      results,
    });
  } catch (error) {
    console.error('[Conversion API Error]', error);
    res.status(500).json({ success: false, error: 'Internal conversion error' });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (dev: ${!isProduction})`);
  });
}

startServer();
