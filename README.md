# ⚰️ REST IN READ — Digital Morgue for Dead Texts

> A satirical digital morgue where users file coroner's reports for ignored text messages, browse a communal graveyard of other people's dead conversations, and occasionally get flirted with by needy ghosts via a Ouija board.
>
> **Tone:** Dark comedy, gallows humor, genuinely funny — never mean-spirited toward the user.

---

## 🌟 Key Features

### Act 1 — The Morgue (Coroner's Intake & Burial Ritual)
- **Form CR-404 Styled Coroner's Intake Desk**:
  - **"The Victim"**: Verbatim paste of the deceased text message with real-time character counting and automatic cemetery zone classification.
  - **"Time of Death"**: Slider tracking hours/days since read with clinical stages (Fresh kill, Rigor mortis, Decomp, Fossilized).
  - **"Suspected Cause of Death"**:
    - 🗡️ *The One-Word Assassin* ("K", "cool", "nice" — bludgeoned with minimal syllables)
    - 👻 *The Ghosting* (Vanished without a trace, delivered but never replied)
    - 💔 *The Reaction-Only Fatality* (Hearted or thumbed-up conversational DNR order)
    - 🔀 *The Topic Pivot* (Emotional vulnerability countered by an unprompted TikTok)
- **Burial Sequence**:
  - Screen dims to 70% black (400ms transition)
  - Procedural Web Audio shovel-dig sound effect
  - Canvas dust & soil particles cascading down the screen
  - **Kübler-Ross Grief-Stage Loading Sequence (P2 Stretch)**: Interactive 5-stage progression (Denial → Anger → Bargaining → Depression → Acceptance) with satirical quips.
  - LLM generates a darkly comedic one-line tombstone epitaph (max 15 words).
- **Official Death Certificate**:
  - Styled as an authentic aged coroner's parchment document.
  - Rotated red **"DECLARATION OF CLOSURE"** stamp with authentic mechanical slam sound effect and slight jitter animation.
  - One-click **Download Certificate (PNG export)** via `html-to-image`.
  - Direct permalinks and burial routing to Act 2.

### Act 2 — The Graveyard (Communal Necropolis Feed)
- **Two Visually Distinct Terrain Zones** separated dynamically by message length:
  - ⛰️ **Hill of Left-on-Read Memes** (`≤ 200` chars): Casual texts, short reels, meme replies.
  - 🕳️ **Trench of Tragic Paragraphs** (`> 200` chars): Vulnerable essays, confessions, and novels.
- **Tombstone Cards**:
  - Cause-of-death badges and stone-carved epitaph typography.
  - Relative burial age (*"3 days in the ground"*).
  - Expandable *"Exhume Text"* drawer with full autopsy excerpt.
- **Interactive Grave Offerings**:
  - 🕯️ **Burn Incense**: Looping smoke-trail CSS animations rising from the stone; client-side expiry logic filters out incense older than 24 hours.
  - 🍺 **Pour One Out**: Liquid splash animation across the stone with procedural splashing sound.
  - 🎖️ **Fallen Soldier Badge**: Salute ribbon awarded to texts displaying extraordinary conversational courage.
  - Device-local session rate limiting (one reaction type per grave per session).
- **Exhumation & Eulogies (P2 Stretch)**:
  - Comment thread drawer where fellow mourners leave advice and closure eulogies.

### Act 3 — Paranormal Rizz (Ouija Board Side-Quest)
- **Haunted Graves**: ~15% of graves (or configurable) emanate an eerie spectral pulse glow.
- **Fullscreen Antique Ouija Board Modal**:
  - Custom wood-grained Ouija board graphic with letter arcs, numbers, YES, NO, and GOODBYE.
  - Sliding wooden **Planchette** with viewing lens sight glass.
  - Dragging letter-to-letter animation spelling out ghost dialogue with wooden scraping audio.
  - **Anthropic Claude AI Ghost Dialogue**: Needy, dramatic, aggressively flirty dialogue packed with texting & mortality puns.
  - **Escalation Double-Texts**: If the modal is idle for ~20s without interaction, the ghost sends unprompted double-texts (*"Hello??"*, *"did u seriously just ghost a ghost?!"*).
  - Interactive visitor input to converse with the spirit.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Gothic Google Fonts (`Cinzel Decorative`, `Cinzel`, `Cormorant Garamond`, `Special Elite`, `Creepster`)
- **Animations**: Framer Motion + HTML5 Canvas Particles + Custom CSS Keyframes
- **Audio**: Web Audio API Sound Engine (zero external audio asset dependencies; 100% offline-resilient synthesized sounds: Shovel dig, Planchette scrape, Pour splash, Red stamp thud, Bell toll, Ambient wind loop)
- **Certificate Export**: `html-to-image`
- **Database**: Supabase (Postgres & Realtime) with automatic graceful fallback to LocalStorage
- **AI Intelligence**: Anthropic Claude API (`@anthropic-ai/sdk`) with rich contextual dark-comedy fallback generators

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (Optional)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your credentials:
```env
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```
*(Note: If left blank, the app runs 100% in local mode with smart built-in epitaph/ghost generators and local storage!)*

### 3. Supabase Database Setup (Optional)
If using Supabase, copy the contents of `supabase/schema.sql` and run it in the **Supabase SQL Editor**.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Deployment

Deploy seamlessly to [Vercel](https://vercel.com):
```bash
npm run build
```
Add your `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel Environment Variables.
