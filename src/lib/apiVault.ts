/**
 * LoraGi Platform API & Webhook Vault
 * Securely stores platform publishing tokens and API credentials in client-side localStorage.
 * 100% Client-Side Privacy: No credentials ever leave the browser without explicit user action.
 */

export type PlatformId =
  | 'youtube'
  | 'twitter'
  | 'linkedin'
  | 'tiktok'
  | 'discord'
  | 'slack'
  | 'custom_webhook';

export interface PlatformKeys {
  youtubeApiKey?: string;
  youtubeAccessToken?: string;
  twitterBearerToken?: string;
  twitterApiKey?: string;
  linkedinAccessToken?: string;
  linkedinPersonUrn?: string;
  tiktokAccessToken?: string;
  discordWebhookUrl?: string;
  slackWebhookUrl?: string;
  customWebhookUrl?: string;
  geminiApiKey?: string;
  openaiApiKey?: string;
}

const STORAGE_KEY = 'loragi_platform_keys_v1';

export function getPlatformKeys(): PlatformKeys {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function savePlatformKeys(keys: Partial<PlatformKeys>): PlatformKeys {
  try {
    const current = getPlatformKeys();
    const updated = { ...current, ...keys };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save platform keys to localStorage', err);
    return getPlatformKeys();
  }
}

export function isPlatformConnected(platform: PlatformId): boolean {
  const keys = getPlatformKeys();
  switch (platform) {
    case 'youtube':
      return Boolean(keys.youtubeAccessToken || keys.youtubeApiKey);
    case 'twitter':
      return Boolean(keys.twitterBearerToken || keys.twitterApiKey);
    case 'linkedin':
      return Boolean(keys.linkedinAccessToken);
    case 'tiktok':
      return Boolean(keys.tiktokAccessToken);
    case 'discord':
      return Boolean(keys.discordWebhookUrl && keys.discordWebhookUrl.startsWith('https://discord.com/api/webhooks/'));
    case 'slack':
      return Boolean(keys.slackWebhookUrl && keys.slackWebhookUrl.startsWith('https://hooks.slack.com/'));
    case 'custom_webhook':
      return Boolean(keys.customWebhookUrl && keys.customWebhookUrl.startsWith('http'));
    default:
      return false;
  }
}

export function hasAnyConnectedPlatform(): boolean {
  const keys = getPlatformKeys();
  return Boolean(
    keys.youtubeAccessToken ||
    keys.youtubeApiKey ||
    keys.twitterBearerToken ||
    keys.twitterApiKey ||
    keys.linkedinAccessToken ||
    keys.tiktokAccessToken ||
    keys.discordWebhookUrl ||
    keys.slackWebhookUrl ||
    keys.customWebhookUrl
  );
}

export function clearPlatformKeys(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear platform keys', err);
  }
}
