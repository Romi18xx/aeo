---
name: competitor-intel
description: Scans named or discovered competitors and returns real, sourced intelligence — positioning shifts, pricing changes, new features/launches, messaging changes, and review sentiment — internally nicknamed "Gossip Ella." Use whenever the user asks to research competitors, check what a competitor is up to, get "the gossip" on a rival, compare positioning against another company, or wants a competitive-intelligence brief. Publishes a styled report artifact and, for durable findings, updates the competitors list in brand-memory. Every finding comes from a live fetch or search run during the session — never invented. For building comparison/"vs" landing pages from this intel, see the competitors skill; for one-time deep-dive competitor profiles, see competitor-profiling.
---

# Competitor intel (Gossip Ella)

Real competitive intelligence, gathered live, not recalled from training
data that may be stale or wrong. If a claim in the output isn't backed by
something actually fetched or searched this run, cut it or flag it as
unverified.

## 1. Get the target list

Take competitor names/URLs from the user if given. If not, check
`.claude/brand-memory.json`'s `competitors` field first (via the
**brand-memory** skill), then fall back to `WebSearch` for the brand name
plus its category to find who else shows up. Confirm the list with the
user before a long scan if it's not obvious — a report about the wrong
companies is wasted work. Cap it at 3-5 competitors per run so each one
gets real depth instead of a shallow pass across ten.

## 2. Scan each competitor

For each competitor, gather what's actually checkable right now:

- **Site & positioning** — `WebFetch` the homepage (and pricing page if
  linked). Note their current one-liner, target audience, and any
  positioning change if brand-memory has notes from a prior run to
  compare against.
- **Pricing** — note current tiers/pricing if public. Flag anything that
  looks like a recent change (odd tier names, "new" badges, footnotes).
- **Recent moves** — `WebSearch` `"<competitor>" launch OR "new feature"
  OR funding OR acquired`, restricted to recent results. Look for
  launches, funding rounds, leadership changes, notable partnerships.
- **Messaging** — how do they describe themselves vs. how they described
  themselves before (if brand-memory has a prior note)? What claims do
  they lead with?
- **Sentiment** — `WebSearch` review sites/forums (G2, Capterra, Reddit,
  Twitter/X) for recent public sentiment. Don't fabricate a review that
  wasn't found; if nothing surfaces, say coverage was thin rather than
  inventing quotes.

Environments sometimes block `WebFetch` at the network layer
(`EGRESS_BLOCKED` even on a plain domain — that's environmental, not a
bad URL). If that happens, fall back to `WebSearch` `site:domain.com` and
third-party listings, and say so in the report rather than silently
reporting less.

## 3. Synthesize insights, not just facts

A list of scraped facts isn't intel. For each competitor, and across the
set, answer:

- What changed since last time (if brand-memory has prior notes)?
- Where are they strong that we're weak, and vice versa?
- Is there a specific, exploitable gap (a claim they can't back up, a
  segment they're ignoring, a price point they've abandoned)?

Keep the "gossip" framing light and factual — sharp and specific ("their
pricing page quietly dropped the free tier last week") beats vague
color commentary. Every insight still has to trace back to something
found in step 2.

## 4. Report

Publish with the `Artifact` tool: a tag reading "Competitor intel /
Gossip Ella", one section per competitor (positioning, pricing, recent
moves, sentiment, the insight), and a closing "what this means for us"
summary. Pick a favicon emoji and a title naming the brands compared. If
`Artifact` isn't appropriate for the context (e.g. the user just wants a
quick answer in chat), a concise markdown summary is fine — don't force
a full report for a one-line question like "did competitor X change
their pricing?"

## 5. Save durable findings

Any finding likely to matter next time (a positioning change, a new
competitor worth tracking, a pricing move) should be written back via the
**brand-memory** skill — update or append the relevant `competitors`
entry (`{name, url, notes}`) with what changed and today's date, so the
next run can diff against it instead of starting cold.
