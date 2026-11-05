/**
 * Cloudflare Pages Function: /api/publish-platform
 * Proxy endpoint to dispatch direct API posts to X/Twitter, LinkedIn, and external webhooks without CORS issues.
 */

interface Env {}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const onRequestOptions = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request } = context;

  try {
    const body = await request.json();
    const { platform, title, caption, videoUrl, bearerToken, accessToken, personUrn } = body as any;

    if (!platform) {
      return new Response(JSON.stringify({ success: false, error: 'Missing platform parameter' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // 1. Twitter / X Direct API v2
    if (platform === 'twitter') {
      if (!bearerToken) {
        return new Response(JSON.stringify({ success: false, fallbackToIntent: true, error: 'No Twitter token' }), {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      const tweetText = `${caption}\n\n${videoUrl}`.slice(0, 280);
      const twitterRes = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: tweetText }),
      });

      if (!twitterRes.ok) {
        const errText = await twitterRes.text();
        return new Response(JSON.stringify({ success: false, fallbackToIntent: true, error: errText }), {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      const twData = await twitterRes.json() as any;
      const tweetId = twData?.data?.id;
      return new Response(
        JSON.stringify({
          success: true,
          postUrl: tweetId ? `https://twitter.com/i/status/${tweetId}` : 'https://twitter.com',
          message: 'Tweet successfully posted via X API v2!',
        }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // 2. LinkedIn UGC / Shares API
    if (platform === 'linkedin') {
      if (!accessToken || !personUrn) {
        return new Response(JSON.stringify({ success: false, fallbackToIntent: true, error: 'Missing LinkedIn credentials' }), {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      const linkedinPayload = {
        author: personUrn.startsWith('urn:li:') ? personUrn : `urn:li:person:${personUrn}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: `${caption}\n\n${videoUrl}`,
            },
            shareMediaCategory: 'ARTICLE',
            media: [
              {
                status: 'READY',
                description: { text: caption.slice(0, 200) },
                originalUrl: videoUrl,
                title: { text: title },
              },
            ],
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      };

      const liRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify(linkedinPayload),
      });

      if (!liRes.ok) {
        const liErr = await liRes.text();
        return new Response(JSON.stringify({ success: false, fallbackToIntent: true, error: liErr }), {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      const liData = await liRes.json() as any;
      const urn = liData?.id || '';
      return new Response(
        JSON.stringify({
          success: true,
          postUrl: urn ? `https://www.linkedin.com/feed/update/${urn}` : 'https://www.linkedin.com/feed/',
          message: 'Successfully published to LinkedIn feed via API!',
        }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ success: false, error: 'Unsupported direct API platform' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Internal proxy error' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
};
