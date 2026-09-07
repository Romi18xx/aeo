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
- `.claude/agents/` — five specialist marketing subagents (strategy, content,
  SEO/AEO, acquisition, conversion) that partition all 54 skills between
  them and hand work off to each other (see "Multi-agent marketing system"
  below).

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

`.claude/commands/` holds two kinds of checked-in command, not something to
copy-paste from anywhere:

1. **Skill commands** — one thin wrapper per bespoke skill, run inline in
   the current session:
   - `/audit <domain>` → aeo-signal
   - `/competitor-intel <names or blank>` → competitor-intel ("Gossip Ella")
   - `/write-post <brief>` → content-writer
   - `/publish <channels>` → channel-publisher
   - `/brand <blank, or a fact to add/update>` → brand-memory

   Each is a short template using `$ARGUMENTS`, with a fallback that pulls
   from `brand-memory` (or asks) when no argument is given, rather than
   failing on empty input.

2. **Agent commands** — one per subagent in `.claude/agents/`, using
   `context: fork` + `agent: <name>` frontmatter so the command hands the
   whole request to that specialist agent instead of running inline:
   - `/strategy <task>` → marketing-strategy ("מצפן")
   - `/content <task>` → marketing-content ("קול")
   - `/seo-aeo <task>` → marketing-seo-aeo ("מכ״ם")
   - `/acquisition <task>` → marketing-acquisition ("גשר")
   - `/conversion <task>` → marketing-conversion ("מאזן")

   Each is `$ARGUMENTS` plus a one-line fallback telling the agent to ask
   the user rather than guess when no task was given.

Add a new command here whenever a new bespoke skill or subagent is added,
so the pattern stays consistent.

## Multi-agent marketing system

`.claude/agents/` defines five Hebrew-system-prompt subagents that split
ownership of every skill in `.claude/skills/` (the `marketingskills` pack
plus the bespoke ones) so a full marketing org — strategy through
measurement — can be driven as a team instead of one agent trying to cover
everything. Each agent's file is the complete, standalone system prompt
(no external references needed to use it). All five embed the same shared
ground rules: never fabricate facts/sources/numbers/prices, label
fact vs. assumption vs. recommendation, stay on-brand (loaded from
`brand-memory`), prioritize high-impact/reasonable-effort work, give every
recommendation as goal → rationale → KPI → measurement → next step, hand
off instead of working outside scope, and never publish, spend money, or
contact anyone externally without explicit approval.

| Agent (nickname) | Domain | Skills it owns |
|---|---|---|
| `marketing-strategy` ("מצפן"/Compass) | Strategy, research, market intel | `brand-memory`, `competitor-intel`, `competitor-profiling`, `customer-research`, `marketing-council`, `marketing-ideas`, `marketing-plan`, `marketing-psychology`, `product-marketing` |
| `marketing-content` ("קול"/Voice) | Content, copy, brand distribution | `content-strategy`, `content-writer`, `copy-editing`, `copywriting`, `image`, `social`, `video`, `channel-publisher`, `competitors` |
| `marketing-seo-aeo` ("מכ״ם"/Radar) | SEO, AEO, organic discovery | `aeo-signal`, `ai-seo`, `aso`, `directory-submissions`, `programmatic-seo`, `schema`, `seo-audit`, `site-architecture` |
| `marketing-acquisition` ("גשר"/Bridge) | Paid acquisition, outbound, partnerships, community | `ads`, `ad-creative`, `cold-email`, `free-tools`, `lead-magnets`, `prospecting`, `co-marketing`, `community-marketing`, `events`, `influencer-marketing`, `launch`, `public-relations` |
| `marketing-conversion` ("מאזן"/Ledger) | Conversion, revenue, retention, measurement | `cro`, `offers`, `onboarding`, `paywalls`, `popups`, `pricing`, `signup`, `churn-prevention`, `emails`, `referrals`, `sms`, `ab-testing`, `analytics`, `attribution`, `marketing-loops`, `revops` |

Notes:
- `sales-enablement` (from the `marketingskills` pack) isn't assigned to any
  of the five — it predates this system and wasn't in scope when the
  agents were defined.
- Claude Code has no native way to restrict which skills a subagent may
  invoke (the `skills:` frontmatter field only *preloads* content, it
  doesn't gate the `Skill` tool) — the skill ownership above is enforced by
  each agent's own system-prompt instructions, not by tooling. Don't rely
  on it as a hard security boundary.
- Typical flow: `marketing-strategy` turns a request into a brief →
  `marketing-content` and/or `marketing-seo-aeo`/`marketing-acquisition`
  produce assets and drive traffic → `marketing-conversion` measures and
  optimizes → findings flow back to `marketing-strategy`. Any agent can
  hand off directly to any other when it hits its boundary; a handoff
  always carries goal, audience, message, assumptions, existing assets,
  KPIs, and open questions.

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
- Full `marketingskills` pack skill set built out (ads, cro, emails, seo,
  retention, etc. — 54 skills total).
- `.claude/agents/` five-agent marketing system added: strategy, content,
  SEO/AEO, acquisition, and conversion agents, each with its own Hebrew
  system prompt, exclusive skill ownership, fixed output format, and
  explicit handoff rules to the other four.
