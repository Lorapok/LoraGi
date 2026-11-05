import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  LogOut,
  Sparkles,
  Film,
  CheckCircle2,
  ChevronDown,
  Shield,
  UploadCloud,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserProfileMenuProps {
  onOpenAuth: () => void;
  onOpenPublish?: () => void;
  onFilterMyVideos?: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  onOpenAuth,
  onOpenPublish,
  onFilterMyVideos,
}) => {
  const { user, isLoggedIn, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isLoggedIn || !user) {
    return (
      <button
        onClick={onOpenAuth}
        className="px-3.5 py-1.5 rounded-xl bg-bio-surface hover:bg-bio-hover border border-bio-cyan/40 text-xs font-bold text-bio-cyan hover:text-white flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
      >
        <User className="w-3.5 h-3.5" />
        <span>Sign In</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-bio-surface hover:bg-bio-hover border border-bio-border hover:border-bio-emerald/40 transition-all cursor-pointer"
      >
        <img
          src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`}
          alt={user.displayName}
          className="w-6 h-6 rounded-lg bg-bio-card object-cover border border-bio-emerald/30"
        />
        <span className="text-xs font-semibold text-white max-w-[100px] truncate hidden sm:inline">
          {user.displayName}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bio-glass-card border border-bio-border shadow-2xl p-2 z-50 animate-fade-in text-xs space-y-1">
          {/* User Profile summary */}
          <div className="p-2.5 rounded-xl bg-bio-void/80 border border-bio-border/50 mb-1">
            <div className="flex items-center gap-2">
              <img
                src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`}
                alt={user.displayName}
                className="w-8 h-8 rounded-lg bg-bio-card object-cover border border-bio-emerald/40"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-white truncate">{user.displayName}</p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user.email || (user.isAnonymous ? 'Guest Creator' : 'Lorapok Member')}
                </p>
              </div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-bio-border/40 flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1 text-bio-emerald font-semibold">
                <Shield className="w-3 h-3" />
                <span>Verified Creator</span>
              </span>
              <span className="text-slate-500 font-mono">Firebase</span>
            </div>
          </div>

          {/* Menu items */}
          {onOpenPublish && (
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenPublish();
              }}
              className="w-full p-2 rounded-xl text-left hover:bg-bio-surface text-slate-200 hover:text-white flex items-center gap-2 transition-all"
            >
              <UploadCloud className="w-4 h-4 text-bio-cyan" />
              <span>Publish Active Video</span>
            </button>
          )}

          {onFilterMyVideos && (
            <button
              onClick={() => {
                setIsOpen(false);
                onFilterMyVideos();
              }}
              className="w-full p-2 rounded-xl text-left hover:bg-bio-surface text-slate-200 hover:text-white flex items-center gap-2 transition-all"
            >
              <Film className="w-4 h-4 text-bio-emerald" />
              <span>My Published Videos</span>
            </button>
          )}

          <div className="h-px bg-bio-border my-1" />

          {/* Logout */}
          <button
            onClick={async () => {
              setIsOpen(false);
              await logout();
            }}
            className="w-full p-2 rounded-xl text-left hover:bg-bio-rose/10 text-bio-rose flex items-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};
