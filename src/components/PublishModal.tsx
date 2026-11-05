import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  Film,
  Sparkles,
  Tag,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Video,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { publishVideoToGallery, CommunityVideo } from '../lib/firebase';
import { formatTime } from '../utils/timeFormat';
import confetti from 'canvas-confetti';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string | null;
  videoFile: File | null;
  duration: number;
  fileName: string;
  hasOutro?: boolean;
  hasObjectRemoval?: boolean;
  onVideoPublished: (video: CommunityVideo) => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  videoSrc,
  videoFile,
  duration,
  fileName,
  hasOutro = false,
  hasObjectRemoval = false,
  onVideoPublished,
}) => {
  const { user, isLoggedIn } = useAuth();
  const [title, setTitle] = useState(
    fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ') || 'My LoraGi Creation'
  );
  const [description, setDescription] = useState(
    'Precision cut and processed with LoraGi Bio-Digital Video Studio.'
  );
  const [category, setCategory] = useState<CommunityVideo['category']>(
    hasObjectRemoval ? 'object_removal' : 'flowmusic'
  );
  const [tagsInput, setTagsInput] = useState('LoraGi, Bio-Digital, Slicer');
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a video title');
      return;
    }

    if (!user) {
      setError('You must be logged in to publish. Please sign in first.');
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const published = await publishVideoToGallery({
        title: title.trim(),
        description: description.trim(),
        category,
        videoUrl: videoSrc || 'https://storage.googleapis.com/producer-app-public/assets/3bcaf576-a168-476f-a7bf-14a725c10d96.mp4',
        thumbnailUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(title)}`,
        duration: Math.round(duration) || 30,
        durationFormatted: formatTime(duration || 30),
        authorId: user.uid,
        authorName: user.displayName || 'Creator',
        authorAvatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
        tags: tags.length > 0 ? tags : ['LoraGi'],
        aspectRatio: '16:9',
        hasOutro,
        hasObjectRemoval,
      });

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00f5a0', '#00d2ff', '#a855f7'],
      });

      onVideoPublished(published);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to publish video');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bio-void/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bio-glass-card p-6 border border-bio-border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-52 h-52 rounded-full bg-bio-cyan/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 rounded-full bg-bio-violet/15 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-bio-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-bio-cyan/10 text-bio-cyan border border-bio-cyan/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Publish to Community Gallery</h3>
              <p className="text-xs text-slate-400">Share your cut portions & creations on LoraGi</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-bio-surface transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handlePublish} className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Creator Attribution */}
          <div className="p-3 rounded-2xl bg-bio-surface/50 border border-bio-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={user?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=creator`}
                alt="Author"
                className="w-8 h-8 rounded-lg bg-bio-void object-cover border border-bio-emerald/30"
              />
              <div>
                <p className="text-xs font-bold text-white">{user?.displayName || 'Guest Creator'}</p>
                <p className="text-[10px] text-slate-400">Publishing as verified creator</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-bio-emerald/10 text-bio-emerald text-[10px] font-mono font-bold">
              Duration: {formatTime(duration)}
            </span>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Video Title <span className="text-bio-rose">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your video a catchy title..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-bio-void/80 border border-bio-border focus:border-bio-cyan text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell viewers about this edit, music, or object removal..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-bio-void/80 border border-bio-border focus:border-bio-cyan text-xs text-white placeholder-slate-500 focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'flowmusic', label: 'Flow Music AI' },
                { id: 'object_removal', label: 'AI Object Removal' },
                { id: 'cyberpunk', label: 'Cyberpunk' },
                { id: 'music_video', label: 'Music Video' },
                { id: 'shorts', label: 'Shorts (9:16)' },
                { id: 'remix', label: 'Remix / Cut' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id as CommunityVideo['category'])}
                  className={`p-2 rounded-xl text-left text-xs font-semibold border transition-all ${
                    category === cat.id
                      ? 'bg-bio-cyan/15 border-bio-cyan text-bio-cyan shadow-sm'
                      : 'bg-bio-void/60 border-bio-border text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tags (comma-separated)
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="AI, Music, Slicer, 4K"
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-bio-void/80 border border-bio-border focus:border-bio-cyan text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-bio-rose/10 border border-bio-rose/30 flex items-start gap-2.5 text-xs text-bio-rose">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPublishing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-bio-cyan via-bio-emerald to-bio-violet text-bio-void font-extrabold text-xs tracking-wide shadow-bio-cyan hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing to Lorapok Network...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Publish Video Publicly</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-3 border-t border-bio-border flex items-center justify-between text-[10px] text-slate-400 shrink-0">
          <span className="flex items-center gap-1 text-bio-emerald">
            <ShieldCheck className="w-3 h-3" />
            <span>Community Gallery Guidelines Apply</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="hover:text-white transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
