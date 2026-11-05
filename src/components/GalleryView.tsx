import React, { useState, useEffect } from 'react';
import {
  Search,
  Film,
  Sparkles,
  Scissors,
  Heart,
  Share2,
  Play,
  UploadCloud,
  CheckCircle2,
  Wand2,
  Layers,
  SlidersHorizontal,
  X,
  ExternalLink,
  Eye,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  CommunityVideo,
  fetchCommunityVideos,
  likeVideoInGallery,
  incrementVideoViews,
} from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

interface GalleryViewProps {
  onLoadVideoIntoEditor: (videoUrl: string, title: string) => void;
  onOpenAiGenerator: () => void;
  onOpenPublish: () => void;
  onSwitchToStudio: () => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  onLoadVideoIntoEditor,
  onOpenAiGenerator,
  onOpenPublish,
  onSwitchToStudio,
}) => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<CommunityVideo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTheaterVideo, setActiveTheaterVideo] = useState<CommunityVideo | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  useEffect(() => {
    fetchCommunityVideos().then(setVideos);
  }, []);

  const handleLike = async (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation();
    if (likedIds.has(videoId)) return;
    setLikedIds((prev) => new Set([...prev, videoId]));
    const newLikes = await likeVideoInGallery(videoId);
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, likes: newLikes } : v))
    );
  };

  const handleShare = (e: React.MouseEvent, video: CommunityVideo) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.origin + '?v=' + video.id);
    setCopiedShareId(video.id);
    setTimeout(() => setCopiedShareId(null), 2000);
  };

  const handleOpenTheater = (video: CommunityVideo) => {
    setActiveTheaterVideo(video);
    incrementVideoViews(video.id);
    setVideos((prev) =>
      prev.map((v) => (v.id === video.id ? { ...v, views: v.views + 1 } : v))
    );
  };

  const categories = [
    { id: 'all', label: 'All Videos' },
    { id: 'flowmusic', label: 'Google Flow Music AI' },
    { id: 'object_removal', label: 'AI Object Removal' },
    { id: 'cyberpunk', label: 'Cyberpunk' },
    { id: 'music_video', label: 'Music Videos' },
    { id: 'shorts', label: 'Shorts (9:16)' },
  ];

  const filteredVideos = videos.filter((v) => {
    const matchesCat = selectedCategory === 'all' || v.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const formatViewCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      {/* Top Gallery Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 lg:p-6 rounded-3xl bio-glass-card border border-bio-border shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Film className="w-6 h-6 text-bio-cyan" />
              <span>Community Video Gallery</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-bio-cyan/10 border border-bio-cyan/20 text-bio-cyan text-xs font-mono font-bold">
              YouTube Feed
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Browse published AI-generated videos, remixes, and object removal showcases. Click any video to slice & remix!
          </p>
        </div>

        {/* Quick Gallery Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={onOpenAiGenerator}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-bio-cyan to-bio-emerald text-bio-void font-bold text-xs tracking-wide shadow-bio-cyan hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            <span>Generate AI Video</span>
          </button>

          <button
            onClick={onOpenPublish}
            className="px-4 py-2 rounded-xl bg-bio-surface hover:bg-bio-hover border border-bio-violet/40 text-bio-violet font-bold text-xs tracking-wide shadow-bio-violet hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Publish Video</span>
          </button>

          <button
            onClick={onSwitchToStudio}
            className="px-4 py-2 rounded-xl bg-bio-surface hover:bg-bio-hover border border-bio-border text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Scissors className="w-4 h-4 text-bio-emerald" />
            <span>Studio Slicer</span>
          </button>
        </div>
      </div>

      {/* Search & Categories Bar */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search community videos by title, creator, or tags..."
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-bio-card/70 border border-bio-border focus:border-bio-cyan text-xs text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-bio-emerald/20 to-bio-cyan/20 border border-bio-cyan text-white shadow-bio-cyan'
                  : 'bg-bio-card/60 hover:bg-bio-surface border border-bio-border text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bio-glass-card border border-bio-border space-y-3">
          <Film className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No videos found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or generate your own AI music video using Flow Music!
          </p>
          <button
            onClick={onOpenAiGenerator}
            className="px-4 py-2 rounded-xl bg-bio-cyan text-bio-void font-bold text-xs inline-flex items-center gap-1.5 shadow-bio-cyan"
          >
            <Wand2 className="w-4 h-4" />
            <span>Generate Free Video</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => handleOpenTheater(video)}
              className="group cursor-pointer rounded-2xl bio-glass-card border border-bio-border hover:border-bio-cyan/50 hover:shadow-bio-cyan transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full bg-bio-void overflow-hidden">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Duration Badge */}
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-bio-void/90 text-white text-[11px] font-mono font-bold backdrop-blur-sm">
                  {video.durationFormatted}
                </span>

                {/* Aspect / Outro Badges */}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  {video.aspectRatio === '9:16' && (
                    <span className="px-1.5 py-0.5 rounded bg-bio-rose/90 text-white text-[10px] font-bold">
                      Shorts
                    </span>
                  )}
                  {video.hasOutro && (
                    <span className="px-1.5 py-0.5 rounded bg-bio-violet/90 text-white text-[10px] font-bold">
                      Outro
                    </span>
                  )}
                  {video.hasObjectRemoval && (
                    <span className="px-1.5 py-0.5 rounded bg-bio-emerald/90 text-bio-void text-[10px] font-bold">
                      AI Inpainted
                    </span>
                  )}
                </div>

                {/* Play Hover Overlay */}
                <div className="absolute inset-0 bg-bio-void/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-bio-emerald/90 text-bio-void flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Card Meta */}
              <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  {/* Channel Avatar */}
                  <img
                    src={video.authorAvatar}
                    alt={video.authorName}
                    className="w-8 h-8 rounded-full bg-bio-card object-cover border border-bio-border shrink-0 mt-0.5"
                  />

                  {/* Title & Channel details */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-white line-clamp-2 group-hover:text-bio-cyan transition-colors">
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400">
                      <span className="truncate">{video.authorName}</span>
                      <CheckCircle2 className="w-3 h-3 text-bio-emerald shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                      <span>{formatViewCount(video.views)} views</span>
                      <span>•</span>
                      <span>{video.likes} likes</span>
                    </div>
                  </div>
                </div>

                {/* Actions row */}
                <div className="pt-2 border-t border-bio-border/50 flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLoadVideoIntoEditor(video.videoUrl, video.title);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-bio-surface hover:bg-bio-emerald/20 border border-bio-border hover:border-bio-emerald/50 text-[11px] font-bold text-bio-emerald flex items-center gap-1 transition-all"
                    title="Load into LoraGi Editor to cut portions or remove objects"
                  >
                    <Scissors className="w-3 h-3" />
                    <span>Cut / Remix</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleLike(e, video.id)}
                      className={`p-1.5 rounded-lg border text-[11px] flex items-center gap-1 transition-all ${
                        likedIds.has(video.id)
                          ? 'bg-bio-rose/20 border-bio-rose text-bio-rose'
                          : 'bg-bio-surface hover:bg-bio-hover border-bio-border text-slate-400 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${likedIds.has(video.id) ? 'fill-current' : ''}`} />
                      <span>{video.likes}</span>
                    </button>

                    <button
                      onClick={(e) => handleShare(e, video)}
                      className="p-1.5 rounded-lg bg-bio-surface hover:bg-bio-hover border border-bio-border text-slate-400 hover:text-white transition-all"
                      title="Share link"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Theater Mode Video Player Modal */}
      {activeTheaterVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bio-void/90 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl rounded-3xl bio-glass-card border border-bio-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-bio-border bg-bio-surface/40">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-bio-cyan" />
                <span className="text-xs font-bold text-white truncate max-w-md">
                  {activeTheaterVideo.title}
                </span>
              </div>
              <button
                onClick={() => setActiveTheaterVideo(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-bio-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video w-full bg-black">
              <video
                src={activeTheaterVideo.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            {/* Video Details & Action Panel */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-bio-border">
                <div className="flex items-center gap-3">
                  <img
                    src={activeTheaterVideo.authorAvatar}
                    alt={activeTheaterVideo.authorName}
                    className="w-10 h-10 rounded-full bg-bio-card object-cover border border-bio-emerald/40"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white">{activeTheaterVideo.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{activeTheaterVideo.authorName}</span>
                      <span>•</span>
                      <span>{formatViewCount(activeTheaterVideo.views)} views</span>
                      <span>•</span>
                      <span>{activeTheaterVideo.durationFormatted}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onLoadVideoIntoEditor(activeTheaterVideo.videoUrl, activeTheaterVideo.title);
                      setActiveTheaterVideo(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-bio-emerald to-bio-cyan text-bio-void font-bold text-xs tracking-wide shadow-bio-emerald hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Scissors className="w-4 h-4" />
                    <span>Cut & Remix in Studio</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {activeTheaterVideo.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-1.5">
                {activeTheaterVideo.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-bio-surface text-slate-300 text-[10px] font-mono border border-bio-border"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
