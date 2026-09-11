'use client';

import React, { useState } from 'react';
import { Grave } from '../types';
import { addGraveComment } from '../lib/storage';
import { X, MessageSquare, Send, User, Clock, Heart } from 'lucide-react';
import { sound } from '../lib/audio';

interface ExhumationDrawerProps {
  grave: Grave | null;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded: () => void;
}

const MOURNER_TITLES = [
  'Certified Mortician',
  'Grave Inspector #42',
  'Fellow Ghostee',
  'Rebound Specialist',
  'The Unsent Drafts Guild',
  'Anonymous Bystander'
];

export const ExhumationDrawer: React.FC<ExhumationDrawerProps> = ({
  grave,
  isOpen,
  onClose,
  onCommentAdded
}) => {
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !grave) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    sound.playStamp();
    const finalName = authorName.trim() || MOURNER_TITLES[Math.floor(Math.random() * MOURNER_TITLES.length)];

    await addGraveComment(grave.id, finalName, commentText.trim());
    setCommentText('');
    setAuthorName('');
    setIsSubmitting(false);
    onCommentAdded();
  };

  const comments = grave.comments || [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm">
      <div className="relative flex h-full w-full max-w-lg flex-col border-l border-zinc-800 bg-zinc-950 p-6 shadow-2xl text-zinc-100 overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-red-500" />
            <h3 className="font-gothic text-xl font-bold tracking-wider text-zinc-100">
              EXHUMATION & EULOGIES
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-800 p-1.5 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Case Summary */}
        <div className="my-4 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 font-mono text-xs">
          <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider mb-1">
            EXCAVATED EVIDENCE #{grave.id.slice(0, 10)}
          </div>
          <p className="font-tombstone text-sm text-zinc-300 italic line-clamp-3">
            &ldquo;{grave.victim_text}&rdquo;
          </p>
          <div className="mt-2 text-zinc-500 text-[11px]">
            Epitaph: &ldquo;{grave.epitaph}&rdquo;
          </div>
        </div>

        {/* Comment Thread List */}
        <div className="flex-1 space-y-3 overflow-y-auto py-2">
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
            Mourner Condolences ({comments.length})
          </div>

          {comments.length === 0 ? (
            <div className="rounded-lg border border-zinc-900 bg-zinc-900/30 p-8 text-center text-xs font-mono text-zinc-600">
              No eulogies left at this grave yet. Be the first to leave closure advice or heartfelt condolences.
            </div>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3.5 space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span className="font-bold text-zinc-300 flex items-center space-x-1">
                    <User className="h-3 w-3 text-red-400" />
                    <span>{c.author_name}</span>
                  </span>
                  <span className="text-zinc-500">
                    {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-zinc-200 font-sans leading-relaxed">
                  {c.text}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Form to Post Eulogy / Closure Advice */}
        <form onSubmit={handleSubmit} className="mt-4 border-t border-zinc-800 pt-4 space-y-3">
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1">
              Mourner Moniker (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. Grief Counselor, Sympathetic Ex"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:border-red-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1">
              Eulogy / Closure Advice:
            </label>
            <textarea
              rows={3}
              required
              placeholder="Leave a darkly funny condolence or advice on how to move on..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:border-red-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={!commentText.trim() || isSubmitting}
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-red-700 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-white shadow hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            <span>Offer Condolences</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
