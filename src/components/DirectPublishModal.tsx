import React, { useState } from 'react';
import {
  X,
  Send,
  Share2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Settings,
  Key,
  Copy,
  Check,
  Radio,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  PlatformId,
  isPlatformConnected,
  getPlatformKeys,
} from '../lib/apiVault';
import {
  dispatchDirectApiPublish,
  openTwitterShare,
  openLinkedInShare,
  openFacebookShare,
  openWhatsAppShare,
  openTelegramShare,
  openRedditShare,
  triggerNativeShare,
  PublishResult,
} from '../utils/platformPublishers';
import { YoutubeIcon } from './icons/YoutubeIcon';

interface DirectPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle?: string;
  initialCaption?: string;
  videoSrc?: string | null;
  onOpenApiSettings: () => void;
  onOpenAiCaptions?: () => void;
}

const PLATFORMS: Array<{
  id: PlatformId;
  name: string;
  badge: string;
  iconName: string;
  apiSupport: boolean;
}> = [
  { id: 'twitter', name: 'X / Twitter', badge: 'Direct API & Share', iconName: 'twitter', apiSupport: true },
  { id: 'linkedin', name: 'LinkedIn', badge: 'Direct API & Share', iconName: 'linkedin', apiSupport: true },
  { id: 'discord', name: 'Discord Channel', badge: 'Webhook Broadcast', iconName: 'discord', apiSupport: true },
  { id: 'slack', name: 'Slack Workspace', badge: 'Webhook Broadcast', iconName: 'slack', apiSupport: true },
  { id: 'youtube', name: 'YouTube Studio', badge: 'Studio Upload', iconName: 'youtube', apiSupport: true },
  { id: 'tiktok', name: 'TikTok', badge: 'Creator Upload', iconName: 'tiktok', apiSupport: false },
  { id: 'custom_webhook', name: 'Zapier / Custom Webhook', badge: 'Webhook Automation', iconName: 'webhook', apiSupport: true },
];

export const DirectPublishModal: React.FC<DirectPublishModalProps> = ({
  isOpen,
  onClose,
  videoTitle = 'My LoraGi Creation',
  initialCaption = '',
  videoSrc,
  onOpenApiSettings,
  onOpenAiCaptions,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId>('twitter');
  const [title, setTitle] = useState<string>(videoTitle);
  const [caption, setCaption] = useState<string>(initialCaption);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  React.useEffect(() => {
    if (isOpen) {
      setTitle(videoTitle);
      if (initialCaption) setCaption(initialCaption);
      setPublishResult(null);
    }
  }, [isOpen, videoTitle, initialCaption]);

  if (!isOpen) return null;

  const isConnected = isPlatformConnected(selectedPlatform);
  const effectiveVideoUrl = videoSrc && !videoSrc.startsWith('blob:')
    ? videoSrc
    : 'https://loragi.lorapok.tech';

  const handleDirectPublish = async () => {
    setIsPublishing(true);
    setPublishResult(null);
    try {
      const res = await dispatchDirectApiPublish({
        platform: selectedPlatform,
        title,
        caption,
        videoUrl: effectiveVideoUrl,
      });
      setPublishResult(res);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(`${title}\n\n${caption}\n\n${effectiveVideoUrl}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    await triggerNativeShare(title, caption, effectiveVideoUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-bio-card/95 border border-bio-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top ambient glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-bio-cyan via-bio-emerald to-bio-purple" />

        {/* Header */}
        <div className="p-5 border-b border-bio-border/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bio-surface border border-bio-cyan/40 flex items-center justify-center text-bio-cyan shadow-lg shadow-bio-cyan/10">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  Direct Multi-Platform Publisher
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-bio-cyan/10 text-bio-cyan border border-bio-cyan/30">
                  Instant API Dispatch
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Publish video cuts directly via connected APIs, webhooks, or 1-click share intents.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenApiSettings}
              className="p-2 rounded-xl bg-bio-surface hover:bg-bio-hover text-slate-300 hover:text-white border border-bio-border text-xs flex items-center gap-1.5 transition-all"
            >
              <Key className="w-4 h-4 text-bio-cyan" />
              <span className="hidden sm:inline">API Settings</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-bio-surface/80 hover:bg-bio-surface text-slate-400 hover:text-white border border-bio-border transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Platform Selection Cards */}
        <div className="p-5 border-b border-bio-border/40 bg-bio-surface/20">
          <label className="text-xs font-bold text-slate-300 block mb-2.5">
            Select Destination Platform
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {PLATFORMS.map((p) => {
              const isSelected = selectedPlatform === p.id;
              const connected = isPlatformConnected(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? 'bg-bio-cyan/10 border-bio-cyan shadow-md shadow-bio-cyan/10'
                      : 'bg-bio-surface/50 border-bio-border/60 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">{p.name}</span>
                    {connected ? (
                      <span className="w-2 h-2 rounded-full bg-bio-emerald" title="API Connected" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-600" title="Quick Share Ready" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">{p.badge}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Status Indicator */}
          <div className="p-3 rounded-xl bg-bio-surface/50 border border-bio-border/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-bio-emerald" />
                  <span className="text-xs text-slate-200">
                    <strong className="text-bio-emerald">Direct API Connected</strong> — 1-click publishing enabled.
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-bio-cyan" />
                  <span className="text-xs text-slate-300">
                    API token not saved. Using <strong>1-Click Direct Share Intent</strong>.
                  </span>
                </>
              )}
            </div>

            <button
              onClick={onOpenApiSettings}
              className="text-xs text-bio-cyan hover:underline flex items-center gap-1 font-medium"
            >
              <span>{isConnected ? 'Manage Key' : 'Connect API Token'}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Title Input */}
          <div>
            <label className="text-xs text-slate-300 block mb-1">Broadcast Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-bio-card border border-bio-border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-bio-cyan"
            />
          </div>

          {/* Caption / Post Text */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-300">Caption & Tags</label>
              {onOpenAiCaptions && (
                <button
                  type="button"
                  onClick={onOpenAiCaptions}
                  className="text-xs text-bio-purple hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Rewrite with AI</span>
                </button>
              )}
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write your post caption, tags, and timestamps..."
              rows={4}
              className="w-full bg-bio-card border border-bio-border rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-bio-cyan resize-none font-mono"
            />
          </div>

          {/* Publish Feedback Result */}
          {publishResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                publishResult.success
                  ? 'bg-bio-emerald/10 border-bio-emerald/40 text-bio-emerald'
                  : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {publishResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{publishResult.message}</span>
              </div>
              {publishResult.postUrl && (
                <a
                  href={publishResult.postUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-bio-emerald/20 hover:bg-bio-emerald/30 text-white font-medium flex items-center gap-1 shrink-0"
                >
                  <span>View Post</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Quick Share Grid (Deep Links) */}
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wider">
              Quick Share Deep-Links
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <button
                type="button"
                onClick={() => openTwitterShare(caption, effectiveVideoUrl)}
                className="p-2 rounded-xl bg-bio-surface/60 hover:bg-bio-surface border border-bio-border text-xs text-slate-300 hover:text-white transition-all text-center truncate"
              >
                X / Twitter
              </button>

              <button
                type="button"
                onClick={() => openLinkedInShare(effectiveVideoUrl, caption)}
                className="p-2 rounded-xl bg-bio-surface/60 hover:bg-bio-surface border border-bio-border text-xs text-slate-300 hover:text-white transition-all text-center truncate"
              >
                LinkedIn
              </button>

              <button
                type="button"
                onClick={() => openWhatsAppShare(caption, effectiveVideoUrl)}
                className="p-2 rounded-xl bg-bio-surface/60 hover:bg-bio-surface border border-bio-border text-xs text-slate-300 hover:text-white transition-all text-center truncate"
              >
                WhatsApp
              </button>

              <button
                type="button"
                onClick={() => openTelegramShare(caption, effectiveVideoUrl)}
                className="p-2 rounded-xl bg-bio-surface/60 hover:bg-bio-surface border border-bio-border text-xs text-slate-300 hover:text-white transition-all text-center truncate"
              >
                Telegram
              </button>

              <button
                type="button"
                onClick={() => openFacebookShare(effectiveVideoUrl)}
                className="p-2 rounded-xl bg-bio-surface/60 hover:bg-bio-surface border border-bio-border text-xs text-slate-300 hover:text-white transition-all text-center truncate"
              >
                Facebook
              </button>

              <button
                type="button"
                onClick={handleNativeShare}
                className="p-2 rounded-xl bg-bio-surface/60 hover:bg-bio-surface border border-bio-border text-xs text-slate-300 hover:text-white transition-all text-center truncate"
              >
                Device Share
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-bio-border/60 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopyCaption}
            className="px-3.5 py-2 rounded-xl bg-bio-surface hover:bg-bio-hover border border-bio-border text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-bio-emerald" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Caption & Link</span>
          </button>

          <button
            type="button"
            onClick={handleDirectPublish}
            disabled={isPublishing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-bio-cyan to-bio-emerald hover:opacity-95 text-slate-950 font-bold text-xs shadow-lg shadow-bio-cyan/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Send className={`w-3.5 h-3.5 ${isPublishing ? 'animate-pulse' : ''}`} />
            <span>
              {isPublishing
                ? 'Broadcasting via API...'
                : isConnected
                ? `Publish Directly to ${PLATFORMS.find((p) => p.id === selectedPlatform)?.name}`
                : `Broadcast to ${PLATFORMS.find((p) => p.id === selectedPlatform)?.name}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
