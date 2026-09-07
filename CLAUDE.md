# AEO Signal — project context for Claude

This file is read automatically at the start of every Claude Code session
on this repo. Keep it updated with durable decisions and context so each
new session doesn't start from zero — it is not a chat log, just the
distilled state of the project.

## What this repo is

`AEO Signal` — a proof-of-concept product landing page for **Marketeam**,
pitching an Answer Engine Optimization (AEO) monitoring tool: tracks how
ChatGPT, Perplexity, Gemini, and Copilot cite a brand, and shows the gaps
where competitors get cited instead.

- `index.html` + `assets/` — the static landing page (sample/illustrative
  data throughout, clearly labeled as such in the footer).
- `.claude/skills/` — Claude Code skills available whenever this repo is
  open in a session (see below).
- `.claude/brand-memory.json` — durable brand knowledge (voice, positioning,
  audience, competitors) shared across the content skills.
- `skills-lock.json` — lockfile for the skills pulled in from
  `coreyhaines31/marketingskills` (general marketing skill pack).
- `.claude/commands/` — slash commands, one thin wrapper per bespoke skill
  (see below), so triggering a skill is `/audit marketeam.ai` instead of
  writing out a full sentence each time.

## Skills available on this project

Two kinds live side by side in `.claude/skills/`:

1. **The `marketingskills` pack** (`ads`, `copywriting`, `seo-audit`, `cro`,
   etc.) — general marketing reference skills sourced verbatim from
   `coreyhaines31/marketingskills`, tracked in `skills-lock.json`. Don't
   hand-edit these; update by re-pulling from the source.
2. **Bespoke, product-specific skills** — written for this project, not
   sourced externally, no lock entry:
   - **aeo-signal** (triggers on "seo-aeo" style requests) — runs a real,
     live AEO audit for a brand/domain: checks entity clarity + structured
     data, tests realistic customer prompts with live web grounding, and
     publishes a styled Artifact report. Never fabricates numbers.
   - **content-writer** — writes on-brand blog posts from a brief, pulls
     tone from `brand-memory` first, saves drafts to `content/drafts/`.
   - **competitor-intel** (nicknamed "Gossip Ella") — live-researches named
     or discovered competitors (positioning, pricing, launches, sentiment)
     and publishes a sourced report; writes durable findings back to
     `brand-memory`.
   - **channel-publisher** — repurposes finished content per channel;
     publishes/schedules via a connected integration when one exists
     (with explicit confirmation before anything goes out), otherwise
     produces a copy-paste-ready package + schedule.
   - **brand-memory** — reads/writes `.claude/brand-memory.json` (voice,
     positioning, audience, key messages, competitors). The other three
     skills load it for consistency and write back durable findings.

## Slash commands

`.claude/commands/` gives each bespoke skill a matching slash command —
these are checked-in system prompts, not something to copy-paste from
anywhere:

- `/audit <domain>` → aeo-signal
- `/competitor-intel <names or blank>` → competitor-intel ("Gossip Ella")
- `/write-post <brief>` → content-writer
- `/publish <channels>` → channel-publisher
- `/brand <blank, or a fact to add/update>` → brand-memory

Each command is a short template using `$ARGUMENTS`, with a fallback that
pulls from `brand-memory` (or asks) when no argument is given, rather than
failing on empty input. Add a new command here whenever a new bespoke
skill is added, so the pattern stays consistent.

## Working conventions

- Custom, product-specific skills go in `.claude/skills/<name>/SKILL.md`
  with no `evals/` dir and no `skills-lock.json` entry — that's the
  signal that distinguishes them from the sourced marketing pack.
- `content-writer` output lives in `content/drafts/`; `channel-publisher`
  schedules live in `content/scheduled/` (both created on first use).
- Any factual claim written by a skill (AEO findings, competitor intel,
  blog content) must trace back to something actually fetched/searched
  during that run — never invented, never recalled from training data as
  if it were current.
- Default git branch for this repo is `claude/signal-poc-improvements-78ge0m`,
  not `main` — confirm before assuming `main` exists.

## History

- Landing page + visual identity built first (signal-readout style).
- `aeo-signal` audit skill added (real, tool-using, not a mockup).
- `coreyhaines31/marketingskills` pack pulled in for general marketing
  reference skills.
- `content-writer`, `competitor-intel`, `channel-publisher`, `brand-memory`
  added as the product-specific skill set, with `brand-memory.json` seeded
  from the landing page's existing copy.
