-- REST IN READ — Postgres & Realtime Schema for Supabase
-- Run this in your Supabase SQL Editor to set up the tables and permissions.

-- Graves table
CREATE TABLE IF NOT EXISTS public.graves (
    id TEXT PRIMARY KEY,
    victim_text TEXT NOT NULL,
    time_of_death_hours NUMERIC NOT NULL DEFAULT 24,
    cause_of_death TEXT NOT NULL CHECK (cause_of_death IN ('one_word_assassin', 'ghosting', 'reaction_only', 'topic_pivot')),
    zone TEXT NOT NULL CHECK (zone IN ('trench', 'hill')),
    epitaph TEXT NOT NULL,
    is_haunted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for chronological queries
CREATE INDEX IF NOT EXISTS idx_graves_created_at ON public.graves(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_graves_zone ON public.graves(zone);

-- Reactions table
CREATE TABLE IF NOT EXISTS public.reactions (
    id TEXT PRIMARY KEY,
    grave_id TEXT NOT NULL REFERENCES public.graves(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('incense', 'pour_one_out', 'fallen_soldier')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    session_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_reactions_grave_id ON public.reactions(grave_id);
CREATE INDEX IF NOT EXISTS idx_reactions_type ON public.reactions(type);
CREATE INDEX IF NOT EXISTS idx_reactions_created_at ON public.reactions(created_at DESC);

-- Exhumation Comments table (eulogies & closure advice)
CREATE TABLE IF NOT EXISTS public.comments (
    id TEXT PRIMARY KEY,
    grave_id TEXT NOT NULL REFERENCES public.graves(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL DEFAULT 'Anonymous Mourner',
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_comments_grave_id ON public.comments(grave_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.graves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Allow public read & insert for anon users (no login required for MVP)
CREATE POLICY "Allow public read graves" ON public.graves FOR SELECT USING (true);
CREATE POLICY "Allow public insert graves" ON public.graves FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read reactions" ON public.reactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert reactions" ON public.reactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Allow public insert comments" ON public.comments FOR INSERT WITH CHECK (true);

-- Enable Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.graves;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
