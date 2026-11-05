/**
 * LoraGi AI Caption Engine
 * Generates platform-tailored social media captions, viral hooks, timestamps,
 * and high-converting hashtags across YouTube, TikTok, Instagram, X/Twitter, LinkedIn, and Facebook.
 * Operates offline via neural heuristic templates, with optional live Gemini/OpenAI API inference.
 */

import { getPlatformKeys } from '../lib/apiVault';
import { formatTime } from './timeFormat';

export type SocialPlatform = 'youtube' | 'tiktok' | 'instagram' | 'twitter' | 'linkedin' | 'facebook';

export type CaptionTone =
  | 'viral'
  | 'professional'
  | 'aesthetic'
  | 'cinematic'
  | 'humorous'
  | 'educational';

export interface CaptionContext {
  title: string;
  topicOrKeywords?: string;
  durationSeconds?: number;
  segments?: Array<{ name: string; start: number; end: number }>;
  category?: string;
  targetPlatform: SocialPlatform;
  tone: CaptionTone;
  customNotes?: string;
}

export interface GeneratedCaptionResult {
  platform: SocialPlatform;
  tone: CaptionTone;
  hook: string;
  body: string;
  timestamps?: string;
  hashtags: string[];
  callToAction: string;
  fullFormattedText: string;
  characterCount: number;
  characterLimit?: number;
  isOverLimit: boolean;
  platformTips: string;
}

export const PLATFORM_LIMITS: Record<SocialPlatform, number> = {
  twitter: 280,
  tiktok: 2200,
  instagram: 2200,
  linkedin: 3000,
  facebook: 63206,
  youtube: 5000,
};

export const PLATFORM_NAMES: Record<SocialPlatform, string> = {
  youtube: 'YouTube & Shorts',
  tiktok: 'TikTok Viral',
  instagram: 'Instagram Reels',
  twitter: 'X / Twitter',
  linkedin: 'LinkedIn Professional',
  facebook: 'Facebook Community',
};

// Algorithmic template generators for instant, offline generation
function generateOfflineCaption(ctx: CaptionContext): GeneratedCaptionResult {
  const cleanTitle = ctx.title.replace(/\.[^/.]+$/, '').trim() || 'Visual Story';
  const keywords = ctx.topicOrKeywords ? ctx.topicOrKeywords.split(',').map(k => k.trim()) : ['video', 'visuals', 'cinematic'];
  const dur = ctx.durationSeconds ? Math.round(ctx.durationSeconds) : 30;

  // Timestamps if segments exist
  let timestampsStr = '';
  if (ctx.segments && ctx.segments.length > 0) {
    timestampsStr = ctx.segments
      .map((seg, idx) => `${formatTime(seg.start)} - ${seg.name || `Scene ${idx + 1}`}`)
      .join('\n');
  } else {
    timestampsStr = `00:00 - Introduction\n${formatTime(Math.max(1, Math.round(dur * 0.3)))} - Peak Moment\n${formatTime(Math.max(2, Math.round(dur * 0.8)))} - Outro & Finale`;
  }

  let hook = '';
  let body = '';
  let cta = '';
  let hashtags: string[] = [];
  let tips = '';

  switch (ctx.targetPlatform) {
    case 'youtube': {
      tips = 'Include video chapters, 3-5 tags in title/description, and pin a comment asking viewers for their opinion.';
      if (ctx.tone === 'viral') {
        hook = `🔥 You won't believe what happens in ${cleanTitle} !`;
        body = `We pushed the limits in this cut. Here is the full breakdown of ${cleanTitle} edited frame-by-frame with zero compromise.\n\n` +
          `📌 Chapters & Timestamps:\n${timestampsStr}\n\n` +
          `Drop a comment below with your favorite scene!`;
        cta = '👉 Subscribe for more high-energy visual edits & turn on notifications!';
        hashtags = ['#Shorts', '#ViralVideo', '#Trending', '#VideoEditing', '#LoraGi'];
      } else if (ctx.tone === 'professional' || ctx.tone === 'educational') {
        hook = `Mastering ${cleanTitle}: Technical Breakdown & Workflow Analysis`;
        body = `In this deep dive, we explore the architectural composition, pacing, and visual dynamics behind ${cleanTitle}.\n\n` +
          `⏱️ Chapter Navigation:\n${timestampsStr}\n\n` +
          `Key Takeaways:\n• Structural timing & audio-visual synchronization\n• Object isolation and clean edge transitions\n• Preserving frame fidelity across export stages`;
        cta = '🔔 Subscribe for in-depth creative engineering workflows and software tutorials.';
        hashtags = ['#TechEdits', '#CreatorEconomy', '#VideoProduction', '#LorapokLabs', '#Tutorial'];
      } else {
        hook = `Experience ${cleanTitle} in Full Fidelity`;
        body = `An immersive exploration of atmospheric sound and organic motion.\n\n` +
          `Chapters:\n${timestampsStr}\n\n` +
          `Created and sequenced with LoraGi studio. Best experienced with headphones.`;
        cta = 'Like & subscribe if this resonated with you.';
        hashtags = ['#Cinematic', '#AudioVisual', '#Aesthetic', '#FlowMusic', '#LoraGi'];
      }
      break;
    }

    case 'tiktok': {
      tips = 'TikTok favors strong hooks within the first 2 seconds. Keep caption brief and encourage re-watches.';
      if (ctx.tone === 'viral') {
        hook = `Wait until the transition at ${formatTime(Math.max(1, Math.round(dur * 0.5)))}... 🤯`;
        body = `I still can't get over how clean this scene cut turned out. Watch until the end!`;
        cta = 'Save this for your next video idea and tag a creator who needs to see this! 👇';
        hashtags = ['#fyp', '#foryou', '#viral', '#trending', '#videoedit', '#transitions', '#lorapok'];
      } else if (ctx.tone === 'humorous') {
        hook = `My computer when I try to render 4K video: 💥`;
        body = `Slicing this together at 3 AM with pure caffeine and determination. Rate the cut from 1 to 10.`;
        cta = 'Hit that plus sign for more chaotic creator moments 😂';
        hashtags = ['#relatable', '#editorproblems', '#contentcreator', '#fypシ', '#viralvideo'];
      } else {
        hook = `Atmospheric vibes only ✨`;
        body = `Here's your sign to take a deep breath and appreciate this visual moment. ${cleanTitle}`;
        cta = 'Double tap if this brought you peace 🌿';
        hashtags = ['#aesthetic', '#lofi', '#vibes', '#chill', '#visualart', '#loragi'];
      }
      break;
    }

    case 'instagram': {
      tips = 'Use clean line breaks, high-converting carousels/reels keywords, and place 15-25 targeted hashtags at the bottom.';
      if (ctx.tone === 'aesthetic' || ctx.tone === 'cinematic') {
        hook = `A glimpse into motion & light: ${cleanTitle} 📽️`;
        body = `Every frame tells a story when rhythm and geometry align.\n\n` +
          `Details:\n` +
          `▫️ Track: Flow Music ambient synthesis\n` +
          `▫️ Sliced & Inpainted: LoraGi Studio\n` +
          `▫️ Duration: ${dur}s of pure aesthetic flow\n\n` +
          `Sometimes the simplest cuts create the deepest impressions.`;
        cta = '💾 Save this reel for creative inspiration\n📤 Share with a friend who loves cinematography';
        hashtags = ['#visualsoflife', '#cinematography', '#reelsviral', '#creativevideo', '#filmmaking', '#colorgrading', '#lorapoklabs', '#reelsvideo', '#motiongraphics'];
      } else {
        hook = `The secret to seamless video pacing isn't complex software—it's precision. ⚡`;
        body = `Here is ${cleanTitle}, broken down into its purest rhythm.\n\n` +
          `When you remove the noise and focus on micro-intervals, the storytelling speaks for itself.\n\n` +
          `What aspect of video editing takes you the longest? Drop your thoughts below! 👇`;
        cta = 'Save this post and follow for weekly creative engineering insights.';
        hashtags = ['#contentcreators', '#videoeditingtips', '#creatorcommunity', '#reelsinstagram', '#learnvideo', '#loragi', '#reelsgrowth'];
      }
      break;
    }

    case 'twitter': {
      tips = 'Twitter/X demands concise impact under 280 characters with 1-2 punchy hashtags.';
      if (ctx.tone === 'viral') {
        hook = `This ${dur}s cut of ${cleanTitle} hits completely different 🔥`;
        body = `Sliced, inpainted, and rendered 100% locally in the browser with @LorapokLabs LoraGi.\n\nWhat do you think?`;
        cta = `Watch with sound on 🎧`;
        hashtags = ['#VideoEditing', '#CreativeCode'];
      } else if (ctx.tone === 'professional') {
        hook = `Client-side video manipulation has reached native performance.`;
        body = `Precision multi-segment slicing + content-aware inpainting with zero cloud uploads: ${cleanTitle}.\n\nThe web as an OS is winning.`;
        cta = '';
        hashtags = ['#WebDev', '#OpenSource'];
      } else {
        hook = `${cleanTitle} • A sensory visual experiment.`;
        body = `Engineered with Biological UI principles.`;
        cta = `Link in bio.`;
        hashtags = ['#Design', '#SensoryUI'];
      }
      break;
    }

    case 'linkedin': {
      tips = 'LinkedIn thrives on professional vulnerability, engineering takeaways, and community questions.';
      hook = `Most creators think they need heavy desktop software for high-precision video editing. Here's why that's changing:`;
      body = `Today we deployed an update to ${cleanTitle} demonstrating what is possible when client-side WebAssembly, Canvas rendering, and modern browser hardware acceleration converge.\n\n` +
        `3 observations from building this workflow:\n\n` +
        `1. Privacy matters: Creators don't want their raw camera footage stored on third-party servers. 100% client-side slicing solves this instantly.\n` +
        `2. Friction kills creativity: Having to export, re-upload, and manually copy-paste links across platforms slows down distribution.\n` +
        `3. Precision is non-negotiable: Sub-frame control and smart inpainting turn raw footage into production-grade assets in minutes.\n\n` +
        `What software tools are currently driving the biggest efficiency gains in your content pipeline?`;
      cta = '💬 I would love to hear how your team is approaching video distribution and AI tooling in 2026.';
      hashtags = ['#VideoEngineering', '#ProductDesign', '#WebDevelopment', '#CreatorEconomy', '#SoftwareArchitecture', '#LorapokLabs'];
      break;
    }

    case 'facebook': {
      tips = 'Facebook audiences engage with warm storytelling, relatable anecdotes, and clear invitations to share.';
      hook = `✨ Excited to share our latest project: "${cleanTitle}"!`;
      body = `We put a lot of passion into crafting every second of this video. Whether it's the rhythm, the colors, or the underlying sound, our goal was to create something that feels alive and inspiring.\n\n` +
        `Take a moment to watch with sound turned on, and let us know what part stood out to you the most! ❤️`;
      cta = 'Feel free to share this with your friends and family if it brought a smile to your face today!';
      hashtags = ['#CreativeArt', '#Storytelling', '#VideoOfTheDay', '#Inspiration', '#CommunityEdits'];
      break;
    }
  }

  // Format final complete text
  let fullFormattedText = '';
  if (ctx.targetPlatform === 'twitter') {
    const tweetHashtags = hashtags.slice(0, 2).join(' ');
    fullFormattedText = `${hook}\n\n${body}${cta ? `\n\n${cta}` : ''}\n\n${tweetHashtags}`.trim();
  } else {
    const hashtagStr = hashtags.join(' ');
    fullFormattedText = `${hook}\n\n${body}\n\n${cta}\n\n${hashtagStr}`.trim();
  }

  const charCount = fullFormattedText.length;
  const limit = PLATFORM_LIMITS[ctx.targetPlatform];

  return {
    platform: ctx.targetPlatform,
    tone: ctx.tone,
    hook,
    body,
    timestamps: timestampsStr,
    hashtags,
    callToAction: cta,
    fullFormattedText,
    characterCount: charCount,
    characterLimit: limit,
    isOverLimit: limit ? charCount > limit : false,
    platformTips: tips,
  };
}

// Live Gemini API inference if key is present
async function generateGeminiCaption(ctx: CaptionContext, apiKey: string): Promise<GeneratedCaptionResult | null> {
  try {
    const prompt = `You are a world-class viral social media strategist and copywriting expert for Lorapok Labs.
Generate a high-converting, platform-tailored post for ${PLATFORM_NAMES[ctx.targetPlatform]}.
Context:
- Title: ${ctx.title}
- Platform: ${ctx.targetPlatform} (Respect character limits: ${PLATFORM_LIMITS[ctx.targetPlatform]} chars max)
- Tone: ${ctx.tone}
- Video Duration: ${ctx.durationSeconds || 30}s
- Keywords / Topic: ${ctx.topicOrKeywords || 'video, creativity, visuals'}
- User Notes: ${ctx.customNotes || 'None'}

Return ONLY a valid JSON object matching this structure:
{
  "hook": "attention-grabbing opening sentence or title",
  "body": "main engaging post body formatted with appropriate line breaks and emojis",
  "callToAction": "compelling CTA for this specific platform",
  "hashtags": ["#tag1", "#tag2", "#tag3"]
}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const parsed = JSON.parse(text);
    const hashtags = Array.isArray(parsed.hashtags) ? parsed.hashtags : ['#LoraGi', '#Video'];
    const hook = parsed.hook || ctx.title;
    const body = parsed.body || '';
    const cta = parsed.callToAction || '';

    const fullFormattedText = ctx.targetPlatform === 'twitter'
      ? `${hook}\n\n${body}${cta ? `\n\n${cta}` : ''}\n\n${hashtags.slice(0, 2).join(' ')}`.trim()
      : `${hook}\n\n${body}\n\n${cta}\n\n${hashtags.join(' ')}`.trim();

    const charCount = fullFormattedText.length;
    const limit = PLATFORM_LIMITS[ctx.targetPlatform];

    return {
      platform: ctx.targetPlatform,
      tone: ctx.tone,
      hook,
      body,
      hashtags,
      callToAction: cta,
      fullFormattedText,
      characterCount: charCount,
      characterLimit: limit,
      isOverLimit: limit ? charCount > limit : false,
      platformTips: `Generated via live Gemini 1.5 Flash AI model with ${ctx.tone} conditioning.`,
    };
  } catch (err) {
    console.warn('Gemini caption generation fallback to offline heuristics', err);
    return null;
  }
}

/**
 * Main generator entrypoint
 */
export async function generateSocialCaption(ctx: CaptionContext): Promise<GeneratedCaptionResult> {
  const keys = getPlatformKeys();
  if (keys.geminiApiKey) {
    const liveResult = await generateGeminiCaption(ctx, keys.geminiApiKey);
    if (liveResult) return liveResult;
  }

  // Instant deterministic heuristic generation
  return generateOfflineCaption(ctx);
}
