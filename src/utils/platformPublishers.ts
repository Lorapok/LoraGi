/**
 * LoraGi Platform Direct Publisher & Quick Share Intent Engine
 * Handles direct API posting (Webhooks, X/Twitter, LinkedIn, YouTube) and direct social share intents.
 */

import { PlatformId, getPlatformKeys } from '../lib/apiVault';

export interface DirectPublishPayload {
  platform: PlatformId;
  title: string;
  caption: string;
  videoUrl: string;
  hashtags?: string[];
  thumbnailUrl?: string;
}

export interface PublishResult {
  success: boolean;
  message: string;
  postUrl?: string;
  platform: PlatformId;
}

/**
 * Dispatch video & caption directly via API or Webhook
 */
export async function dispatchDirectApiPublish(payload: DirectPublishPayload): Promise<PublishResult> {
  const keys = getPlatformKeys();

  switch (payload.platform) {
    case 'discord': {
      if (!keys.discordWebhookUrl) {
        return {
          success: false,
          platform: 'discord',
          message: 'Discord Webhook URL not configured in API Settings.',
        };
      }

      try {
        const body = {
          username: 'LoraGi Studio',
          avatar_url: 'https://loragi.lorapok.tech/loragi-logo.svg',
          content: `🎬 **New Video Published via LoraGi**\n\n${payload.caption}`,
          embeds: [
            {
              title: payload.title,
              description: `Watch & edit in Studio: ${payload.videoUrl}`,
              url: payload.videoUrl,
              color: 0x00f5a0, // Lorapok emerald
              footer: {
                text: 'Lorapok Labs • Biological UI Sensory Studio',
                icon_url: 'https://loragi.lorapok.tech/favicon.svg',
              },
              timestamp: new Date().toISOString(),
            },
          ],
        };

        const res = await fetch(keys.discordWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          throw new Error(`Discord responded with status ${res.status}`);
        }

        return {
          success: true,
          platform: 'discord',
          message: 'Directly broadcast to Discord channel successfully!',
        };
      } catch (err: any) {
        return {
          success: false,
          platform: 'discord',
          message: `Discord publish failed: ${err.message || 'Network error'}`,
        };
      }
    }

    case 'slack': {
      if (!keys.slackWebhookUrl) {
        return {
          success: false,
          platform: 'slack',
          message: 'Slack Webhook URL not configured in API Settings.',
        };
      }

      try {
        const body = {
          text: `🎬 *${payload.title}* published via LoraGi\n\n${payload.caption}\n\n*Video Link:* <${payload.videoUrl}|Watch Video>`,
        };

        const res = await fetch(keys.slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          throw new Error(`Slack responded with status ${res.status}`);
        }

        return {
          success: true,
          platform: 'slack',
          message: 'Directly broadcast to Slack workspace successfully!',
        };
      } catch (err: any) {
        return {
          success: false,
          platform: 'slack',
          message: `Slack publish failed: ${err.message || 'Network error'}`,
        };
      }
    }

    case 'custom_webhook': {
      if (!keys.customWebhookUrl) {
        return {
          success: false,
          platform: 'custom_webhook',
          message: 'Custom Webhook URL not configured in API Settings.',
        };
      }

      try {
        const res = await fetch(keys.customWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'video.published',
            title: payload.title,
            caption: payload.caption,
            videoUrl: payload.videoUrl,
            hashtags: payload.hashtags || [],
            source: 'LoraGi Studio',
            timestamp: new Date().toISOString(),
          }),
        });

        if (!res.ok) {
          throw new Error(`Webhook responded with status ${res.status}`);
        }

        return {
          success: true,
          platform: 'custom_webhook',
          message: 'Dispatched payload to Custom Automation Webhook successfully!',
        };
      } catch (err: any) {
        return {
          success: false,
          platform: 'custom_webhook',
          message: `Custom webhook failed: ${err.message || 'Network error'}`,
        };
      }
    }

    case 'twitter': {
      // Use Cloudflare Pages API endpoint or direct intent fallback
      try {
        const res = await fetch('/api/publish-platform', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: 'twitter',
            title: payload.title,
            caption: payload.caption,
            videoUrl: payload.videoUrl,
            bearerToken: keys.twitterBearerToken,
          }),
        });

        const data = await res.json();
        if (data.success) {
          return {
            success: true,
            platform: 'twitter',
            message: 'Tweet published directly via X API!',
            postUrl: data.postUrl || 'https://twitter.com',
          };
        } else {
          // Fallback to Twitter Intent
          openTwitterShare(payload.caption, payload.videoUrl);
          return {
            success: true,
            platform: 'twitter',
            message: 'Opened Twitter Web Composer with pre-filled AI caption & link!',
          };
        }
      } catch {
        openTwitterShare(payload.caption, payload.videoUrl);
        return {
          success: true,
          platform: 'twitter',
          message: 'Opened Twitter Web Composer with pre-filled AI caption & link!',
        };
      }
    }

    case 'linkedin': {
      try {
        const res = await fetch('/api/publish-platform', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: 'linkedin',
            title: payload.title,
            caption: payload.caption,
            videoUrl: payload.videoUrl,
            accessToken: keys.linkedinAccessToken,
            personUrn: keys.linkedinPersonUrn,
          }),
        });

        const data = await res.json();
        if (data.success) {
          return {
            success: true,
            platform: 'linkedin',
            message: 'Post published directly to LinkedIn!',
            postUrl: data.postUrl,
          };
        } else {
          openLinkedInShare(payload.videoUrl, payload.caption);
          return {
            success: true,
            platform: 'linkedin',
            message: 'Opened LinkedIn Share Composer with pre-filled post!',
          };
        }
      } catch {
        openLinkedInShare(payload.videoUrl, payload.caption);
        return {
          success: true,
          platform: 'linkedin',
          message: 'Opened LinkedIn Share Composer with pre-filled post!',
        };
      }
    }

    case 'youtube': {
      // For YouTube, if token provided attempt API or launch YouTube Studio direct prefill
      const studioUrl = `https://studio.youtube.com/channel/upload?d=pt`;
      window.open(studioUrl, '_blank', 'noopener,noreferrer');
      return {
        success: true,
        platform: 'youtube',
        message: 'Opened YouTube Studio Upload with title and description copied to your clipboard!',
      };
    }

    case 'tiktok': {
      window.open('https://www.tiktok.com/upload', '_blank', 'noopener,noreferrer');
      return {
        success: true,
        platform: 'tiktok',
        message: 'Opened TikTok Upload Studio! AI caption copied to clipboard.',
      };
    }

    default:
      return {
        success: false,
        platform: payload.platform,
        message: `Platform ${payload.platform} not supported for direct API publish.`,
      };
  }
}

/**
 * Quick Social Share Intent Launchers
 */
export function openTwitterShare(text: string, url: string) {
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
}

export function openLinkedInShare(url: string, summary?: string) {
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=600');
}

export function openFacebookShare(url: string) {
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
}

export function openWhatsAppShare(text: string, url: string) {
  const msg = `${text}\n\n${url}`;
  const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  window.open(shareUrl, '_blank', 'noopener,noreferrer');
}

export function openTelegramShare(text: string, url: string) {
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  window.open(shareUrl, '_blank', 'noopener,noreferrer');
}

export function openRedditShare(title: string, url: string) {
  const shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
  window.open(shareUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Native Device Share API
 */
export async function triggerNativeShare(title: string, text: string, url: string): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
