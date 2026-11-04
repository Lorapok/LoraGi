import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause Video' },
    { key: '[', desc: 'Mark In Point for current portion' },
    { key: ']', desc: 'Mark Out Point for current portion' },
    { key: 'S', desc: 'Split portion at playhead' },
    { key: '← / →', desc: 'Step 1 frame backward / forward (0.05s)' },
    { key: 'Shift + ← / →', desc: 'Step 1 second backward / forward' },
    { key: 'J / L', desc: 'Shuttle rewind / fast-forward 5s' },
    { key: 'K', desc: 'Pause playback' },
    { key: '?', desc: 'Toggle keyboard shortcuts guide' },
    { key: 'Esc', desc: 'Close any active modal' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bio-void/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bio-glass-card p-6 border border-bio-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-bio-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-bio-emerald/10 text-bio-emerald border border-bio-emerald/20">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Keyboard Shortcuts</h3>
              <p className="text-xs text-slate-400">High-speed precision video editing</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-bio-surface transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="py-4 space-y-2">
          {shortcuts.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 rounded-xl bg-bio-void/60 border border-bio-border/50 text-xs"
            >
              <span className="text-slate-300">{item.desc}</span>
              <kbd className="px-2 py-1 rounded bg-bio-surface border border-bio-border font-mono text-bio-emerald font-bold text-[11px] shadow">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-bio-border flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-bio-surface hover:bg-bio-hover border border-bio-border text-xs font-semibold text-slate-200 transition-all"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
