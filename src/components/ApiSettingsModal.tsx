import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Trash2,
  Save,
  Radio,
  Sparkles,
  Lock,
} from 'lucide-react';
import {
  PlatformKeys,
  getPlatformKeys,
  savePlatformKeys,
  clearPlatformKeys,
  isPlatformConnected,
} from '../lib/apiVault';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [keys, setKeys] = useState<PlatformKeys>({});
  const [activeTab, setActiveTab] = useState<'social' | 'webhooks' | 'ai'>('social');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKeys(getPlatformKeys());
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    savePlatformKeys(keys);
    setSaveSuccess(true);
    if (onSaved) onSaved();
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all saved API credentials from your browser?')) {
      clearPlatformKeys();
      setKeys({});
      if (onSaved) onSaved();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-bio-card/95 border border-bio-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow ambient header accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-bio-cyan via-bio-emerald to-bio-purple" />

        {/* Header */}
        <div className="p-6 border-b border-bio-border/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bio-surface border border-bio-cyan/40 flex items-center justify-center text-bio-cyan shadow-lg shadow-bio-cyan/10">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  Platform API Connections
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-bio-cyan/10 text-bio-cyan border border-bio-cyan/30">
                  Zero-Leak Vault
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Connect external platform tokens to post directly with 1-click speed.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-bio-surface/80 hover:bg-bio-surface text-slate-400 hover:text-white border border-bio-border transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security & Privacy Banner */}
        <div className="px-6 py-2.5 bg-bio-surface/60 border-b border-bio-border/40 flex items-center gap-2.5 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-bio-emerald shrink-0" />
          <span>
            Credentials are encrypted & stored <strong className="text-white">only in your local browser storage</strong>. Never relayed or stored on cloud databases.
          </span>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-bio-border/40 px-6 bg-bio-surface/30">
          <button
            type="button"
            onClick={() => setActiveTab('social')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'social'
                ? 'border-bio-cyan text-bio-cyan'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Social Platforms (X, LinkedIn, YouTube)</span>
            {isPlatformConnected('twitter') || isPlatformConnected('linkedin') ? (
              <span className="w-2 h-2 rounded-full bg-bio-emerald" />
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('webhooks')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'webhooks'
                ? 'border-bio-emerald text-bio-emerald'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Webhooks (Discord, Slack, Zapier)</span>
            {isPlatformConnected('discord') || isPlatformConnected('slack') ? (
              <span className="w-2 h-2 rounded-full bg-bio-emerald" />
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'ai'
                ? 'border-bio-purple text-bio-purple'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live AI Keys (Gemini / OpenAI)</span>
            {keys.geminiApiKey || keys.openaiApiKey ? (
              <span className="w-2 h-2 rounded-full bg-bio-purple" />
            ) : null}
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'social' && (
            <div className="space-y-5">
              {/* X / Twitter */}
              <div className="p-4 rounded-xl bg-bio-surface/40 border border-bio-border/60 hover:border-bio-cyan/40 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">X / Twitter API v2</span>
                    {isPlatformConnected('twitter') ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-bio-emerald/10 text-bio-emerald border border-bio-emerald/30 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3" /> Connected
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        Quick Share Ready
                      </span>
                    )}
                  </div>
                  <a
                    href="https://developer.x.com/en/portal/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-bio-cyan hover:underline flex items-center gap-1"
                  >
                    X Developer Portal <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">
                    Bearer Token / OAuth 2.0 User Token
                  </label>
                  <input
                    type="password"
                    value={keys.twitterBearerToken || ''}
                    onChange={(e) => setKeys({ ...keys, twitterBearerToken: e.target.value })}
                    placeholder="AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzU..."
                    className="w-full bg-bio-card border border-bio-border rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-bio-cyan"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enables direct 1-click tweet broadcasting. If empty, LoraGi falls back to instant Twitter Intent composer.
                  </p>
                </div>
              </div>

              {/* LinkedIn */}
              <div className="p-4 rounded-xl bg-bio-surface/40 border border-bio-border/60 hover:border-bio-cyan/40 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">LinkedIn Share API</span>
                    {isPlatformConnected('linkedin') ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-bio-emerald/10 text-bio-emerald border border-bio-emerald/30 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3" /> Connected
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        Quick Share Ready
                      </span>
                    )}
                  </div>
                  <a
                    href="https://www.linkedin.com/developers/apps"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-bio-cyan hover:underline flex items-center gap-1"
                  >
                    LinkedIn Developers <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">
                      OAuth 2.0 Access Token
                    </label>
                    <input
                      type="password"
                      value={keys.linkedinAccessToken || ''}
                      onChange={(e) => setKeys({ ...keys, linkedinAccessToken: e.target.value })}
                      placeholder="AQV8uF7..."
                      className="w-full bg-bio-card border border-bio-border rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-bio-cyan"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">
                      Person URN or Member ID
                    </label>
                    <input
                      type="text"
                      value={keys.linkedinPersonUrn || ''}
                      onChange={(e) => setKeys({ ...keys, linkedinPersonUrn: e.target.value })}
                      placeholder="urn:li:person:abcdef123"
                      className="w-full bg-bio-card border border-bio-border rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-bio-cyan"
                    />
                  </div>
                </div>
              </div>

              {/* YouTube */}
              <div className="p-4 rounded-xl bg-bio-surface/40 border border-bio-border/60 hover:border-bio-cyan/40 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">YouTube Data API v3</span>
                    {isPlatformConnected('youtube') ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-bio-emerald/10 text-bio-emerald border border-bio-emerald/30 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3" /> Connected
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        Studio Direct Ready
                      </span>
                    )}
                  </div>
                  <a
                    href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-bio-cyan hover:underline flex items-center gap-1"
                  >
                    Google Cloud Console <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">
                    Google OAuth Access Token / API Key
                  </label>
                  <input
                    type="password"
                    value={keys.youtubeAccessToken || keys.youtubeApiKey || ''}
                    onChange={(e) => setKeys({ ...keys, youtubeAccessToken: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full bg-bio-card border border-bio-border rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-bio-cyan"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Without an API key, clicking YouTube will copy your generated title & description to clipboard and launch YouTube Studio Upload directly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'webhooks' && (
            <div className="space-y-5">
              {/* Discord Webhook */}
              <div className="p-4 rounded-xl bg-bio-surface/40 border border-bio-border/60 hover:border-bio-emerald/40 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Discord Channel Webhook</span>
                    {isPlatformConnected('discord') ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-bio-emerald/10 text-bio-emerald border border-bio-emerald/30 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3" /> Connected
                      </span>
                    ) : null}
                  </div>
                  <span className="text-xs text-slate-400">Server Settings → Integrations → Webhooks</span>
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">
                    Discord Webhook URL
                  </label>
                  <input
                    type="password"
                    value={keys.discordWebhookUrl || ''}
                    onChange={(e) => setKeys({ ...keys, discordWebhookUrl: e.target.value })}
                    placeholder="https://discord.com/api/webhooks/1234567890/abcde..."
                    className="w-full bg-bio-card border border-bio-border rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-bio-emerald"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Publishes rich video announcement embeds directly into your community Discord server.
                  </p>
                </div>
              </div>

              {/* Slack Webhook */}
              <div className="p-4 rounded-xl bg-bio-surface/40 border border-bio-border/60 hover:border-bio-emerald/40 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Slack Workspace Webhook</span>
                    {isPlatformConnected('slack') ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-bio-emerald/10 text-bio-emerald border border-bio-emerald/30 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3" /> Connected
                      </span>
                    ) : null}
                  </div>
                  <a
                    href="https://api.slack.com/messaging/webhooks"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-bio-emerald hover:underline flex items-center gap-1"
                  >
                    Slack Incoming Webhooks <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">
                    Slack Webhook URL
                  </label>
                  <input
                    type="password"
                    value={keys.slackWebhookUrl || ''}
                    onChange={(e) => setKeys({ ...keys, slackWebhookUrl: e.target.value })}
                    placeholder="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX"
                    className="w-full bg-bio-card border border-bio-border rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-bio-emerald"
                  />
                </div>
              </div>

              {/* Custom Webhook (Zapier, Make, n8n) */}
              <div className="p-4 rounded-xl bg-bio-surface/40 border border-bio-border/60 hover:border-bio-emerald/40 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Custom Automation Webhook</span>
                    {isPlatformConnected('custom_webhook') ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-bio-emerald/10 text-bio-emerald border border-bio-emerald/30 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3" /> Connected
                      </span>
                    ) : null}
                  </div>
                  <span className="text-xs text-slate-400">Zapier / Make / n8n / Webhook.site</span>
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">
                    POST Webhook Endpoint URL
                  </label>
                  <input
                    type="url"
                    value={keys.customWebhookUrl || ''}
                    onChange={(e) => setKeys({ ...keys, customWebhookUrl: e.target.value })}
                    placeholder="https://hooks.zapier.com/hooks/catch/12345/abcde/"
                    className="w-full bg-bio-card border border-bio-border rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-bio-emerald"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-5">
              {/* Google Gemini API */}
              <div className="p-4 rounded-xl bg-bio-surface/40 border border-bio-border/60 hover:border-bio-purple/40 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Google Gemini AI API Key</span>
                    {keys.geminiApiKey ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-bio-purple/20 text-bio-purple border border-bio-purple/40 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        Defaulting to Heuristic Engine
                      </span>
                    )}
                  </div>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-bio-purple hover:underline flex items-center gap-1"
                  >
                    Google AI Studio (Free) <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">
                    Gemini 1.5 Flash API Key
                  </label>
                  <input
                    type="password"
                    value={keys.geminiApiKey || ''}
                    onChange={(e) => setKeys({ ...keys, geminiApiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full bg-bio-card border border-bio-border rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-bio-purple"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enables deep reasoning AI copywriting with dynamic humor, custom hooks, and viral timing prediction.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-bio-border/60 flex items-center justify-between">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Keys</span>
            </button>

            <div className="flex items-center gap-3">
              {saveSuccess && (
                <span className="text-xs text-bio-emerald flex items-center gap-1 animate-pulse">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved to Local Vault!
                </span>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-bio-cyan to-bio-emerald hover:opacity-95 text-slate-950 font-bold text-xs shadow-lg shadow-bio-cyan/20 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Vault Credentials</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
