/**
 * Cloudflare Pages Function: /api/resolve-video
 * Resolves FlowMusic links, direct video streams, and web media URLs with CORS proxying.
 */

interface Env {}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Range, Authorization',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
};

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
};

export const onRequest = async (context: { request: Request; env: Env }) => {
  const { request } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const urlObj = new URL(request.url);

  // 1. Video streaming proxy mode (?stream=1&url=...)
  if (urlObj.searchParams.get('stream') === '1') {
    const targetUrl = urlObj.searchParams.get('url');
    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'Missing target url parameter' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    try {
      const range = request.headers.get('Range');
      const fetchHeaders: HeadersInit = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      };
      if (range) {
        fetchHeaders['Range'] = range;
      }

      const upstreamRes = await fetch(targetUrl, {
        headers: fetchHeaders,
      });

      const responseHeaders = new Headers(CORS_HEADERS);
      responseHeaders.set('Content-Type', upstreamRes.headers.get('Content-Type') || 'video/mp4');
      if (upstreamRes.headers.has('Content-Length')) {
        responseHeaders.set('Content-Length', upstreamRes.headers.get('Content-Length')!);
      }
      if (upstreamRes.headers.has('Content-Range')) {
        responseHeaders.set('Content-Range', upstreamRes.headers.get('Content-Range')!);
      }
      if (upstreamRes.headers.has('Accept-Ranges')) {
        responseHeaders.set('Accept-Ranges', upstreamRes.headers.get('Accept-Ranges')!);
      } else {
        responseHeaders.set('Accept-Ranges', 'bytes');
      }

      return new Response(upstreamRes.body, {
        status: upstreamRes.status,
        headers: responseHeaders,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Proxy fetch failed';
      return new Response(JSON.stringify({ error: msg }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
  }

  // 2. Resolve target URL mode (POST or GET)
  let targetUrl = urlObj.searchParams.get('url');
  if (request.method === 'POST') {
    try {
      const body = await request.json() as { url?: string };
      if (body?.url) targetUrl = body.url;
    } catch {}
  }

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Please provide a valid video or session URL' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const parsedTarget = new URL(targetUrl);

    // Case A: Direct video file (.mp4, .webm, .mov, etc.)
    if (/\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(targetUrl)) {
      return new Response(
        JSON.stringify({
          success: true,
          type: 'direct',
          videoUrl: targetUrl,
          proxyUrl: `/api/resolve-video?stream=1&url=${encodeURIComponent(targetUrl)}`,
          title: parsedTarget.pathname.split('/').pop() || 'Video Clip',
        }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // Case B: Google Flow Music session link (www.flowmusic.app/session/...)
    if (parsedTarget.hostname.includes('flowmusic.app')) {
      const res = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      const html = await res.text();

      // Extract all video assets from NEXT_DATA
      const videoMatches = [
        ...html.matchAll(/https?:\/\/[^"']*(storage\.googleapis\.com\/producer-app-public\/assets\/[^"']+\.mp4)/gi),
      ].map((m) => m[0]);

      const uniqueVideos = Array.from(new Set(videoMatches));

      if (uniqueVideos.length > 0) {
        const primaryVideo = uniqueVideos[0];
        return new Response(
          JSON.stringify({
            success: true,
            type: 'flowmusic',
            videoUrl: primaryVideo,
            proxyUrl: `/api/resolve-video?stream=1&url=${encodeURIComponent(primaryVideo)}`,
            allClips: uniqueVideos.map((v, i) => ({
              id: `flow-clip-${i + 1}`,
              url: v,
              proxyUrl: `/api/resolve-video?stream=1&url=${encodeURIComponent(v)}`,
              title: `Flow Music Video Clip ${i + 1}`,
            })),
            title: 'Google Flow Music Generated Video',
          }),
          { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Case C: YouTube Video / Shorts / Embeds
    const isYouTube = parsedTarget.hostname.includes('youtube.com') || parsedTarget.hostname.includes('youtu.be');
    if (isYouTube) {
      let videoId: string | null = null;
      if (parsedTarget.hostname.includes('youtu.be')) {
        videoId = parsedTarget.pathname.slice(1).split('/')[0].split('?')[0];
      } else if (parsedTarget.pathname.includes('/shorts/')) {
        videoId = parsedTarget.pathname.split('/shorts/')[1]?.split('/')[0]?.split('?')[0];
      } else if (parsedTarget.pathname.includes('/embed/')) {
        videoId = parsedTarget.pathname.split('/embed/')[1]?.split('/')[0]?.split('?')[0];
      } else {
        videoId = parsedTarget.searchParams.get('v');
      }

      let title = 'YouTube Video';
      let author = 'YouTube Creator';
      let thumbnail = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';

      if (videoId) {
        try {
          const oembedRes = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
            { headers: { 'User-Agent': 'Mozilla/5.0' } }
          );
          if (oembedRes.ok) {
            const oembedData = (await oembedRes.json()) as {
              title?: string;
              author_name?: string;
              thumbnail_url?: string;
            };
            if (oembedData.title) title = oembedData.title;
            if (oembedData.author_name) author = oembedData.author_name;
            if (oembedData.thumbnail_url) thumbnail = oembedData.thumbnail_url;
          }
        } catch {}
      }

      // Try public Invidious instances with short timeouts
      let directStreamUrl: string | null = null;
      if (videoId) {
        const publicInstances = [
          'https://inv.nadeko.net',
          'https://invidious.nerdvpn.de',
          'https://yt.chocolatemoo53.com',
          'https://invidious.tiekoetter.com',
        ];

        for (const instance of publicInstances) {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 1800);
            const apiRes = await fetch(`${instance}/api/v1/videos/${videoId}`, {
              signal: controller.signal,
              headers: { 'User-Agent': 'Mozilla/5.0' },
            });
            clearTimeout(timeout);

            if (apiRes.ok) {
              const vidData = (await apiRes.json()) as {
                formatStreams?: { url: string; qualityLabel: string; type: string }[];
              };
              const stream = vidData.formatStreams?.find(
                (s) => s.type?.includes('video/mp4') && s.url
              );
              if (stream?.url) {
                directStreamUrl = stream.url;
                break;
              }
            }
          } catch {}
        }
      }

      const safeTitle = title.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || 'youtube_video';
      const cleanFileName = safeTitle.replace(/\s+/g, '_');

      if (directStreamUrl) {
        return new Response(
          JSON.stringify({
            success: true,
            type: 'youtube_stream',
            directStreamAvailable: true,
            videoId,
            title,
            author,
            thumbnail,
            videoUrl: directStreamUrl,
            proxyUrl: `/api/resolve-video?stream=1&url=${encodeURIComponent(directStreamUrl)}`,
          }),
          { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
      }

      // YouTube Cipher protection active — provide rich video card and 1-click import helpers
      return new Response(
        JSON.stringify({
          success: true,
          type: 'youtube_guide',
          directStreamAvailable: false,
          videoId,
          title,
          author,
          thumbnail,
          videoUrl: targetUrl,
          cleanFileName,
          helperCommands: {
            ytdlp: `yt-dlp -f "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]" "${targetUrl}" -o "${cleanFileName}.mp4"`,
            cobaltUrl: `https://cobalt.tools/`,
          },
          instructions: [
            '1. Click Open Cobalt Web Downloader or copy the yt-dlp one-liner command below.',
            '2. Save the MP4 file to your computer.',
            '3. Drop the file directly into LoraGi to cut portions and append an outro scene.',
          ],
        }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // Case C: General Web Page with embedded video
    const pageRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    const pageHtml = await pageRes.text();

    // Check OpenGraph video
    const ogMatch = pageHtml.match(/<meta\s+property=["']og:video["']\s+content=["']([^"']+)["']/i) ||
                    pageHtml.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:video["']/i);
    if (ogMatch?.[1]) {
      const found = ogMatch[1];
      return new Response(
        JSON.stringify({
          success: true,
          type: 'opengraph',
          videoUrl: found,
          proxyUrl: `/api/resolve-video?stream=1&url=${encodeURIComponent(found)}`,
          title: 'Embedded Video',
        }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // Check <video src="..."> or <source src="...">
    const videoTagMatch = pageHtml.match(/<video[^>]+src=["']([^"']+)["']/i) ||
                          pageHtml.match(/<source[^>]+src=["']([^"']+\.(mp4|webm|mov))["']/i);
    if (videoTagMatch?.[1]) {
      let resolved = videoTagMatch[1];
      if (resolved.startsWith('/')) {
        resolved = new URL(resolved, targetUrl).toString();
      }
      return new Response(
        JSON.stringify({
          success: true,
          type: 'html5_video',
          videoUrl: resolved,
          proxyUrl: `/api/resolve-video?stream=1&url=${encodeURIComponent(resolved)}`,
          title: 'HTML5 Video Stream',
        }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'No downloadable video stream detected at this link. Please ensure it is a valid video or Flow Music session link.',
      }),
      { status: 404, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to parse media link';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
};
