---
name: channel-publisher
description: Repurposes finished content into channel-native versions and a publishing schedule, and actually publishes/schedules it where a connected channel or MCP integration exists. Use whenever the user asks to publish, post, schedule, or distribute a piece of content, wants a blog post turned into social posts or an email, or asks "what should we post this week." Reads a content-writer draft or user-supplied content plus brand-memory for voice, checks for a connected publishing channel before falling back to producing copy-paste-ready packages, and always confirms before anything goes out publicly.
---

# Channel publisher

Takes one piece of content and gets it in front of an audience on the
channels that make sense — either by actually publishing/scheduling it
through a connected integration, or, when there isn't one, by producing a
ready-to-post package a human pastes in themselves. Always be honest
about which of the two just happened.

## 1. Get the source content

Take a finished draft (e.g. from `content/drafts/`, written by the
**content-writer** skill) or content pasted directly by the user. Don't
repurpose a rough draft as final copy without at least skimming it for
obvious issues first.

## 2. Confirm the channel plan

Ask, or infer from context, which channels this goes to (blog/site,
LinkedIn, X/Twitter, email newsletter, etc.) and whether it's a single
post now or a scheduled cadence. Load `voice` from **brand-memory** so
every version sounds consistent across channels even as format changes.

## 3. Check for a real publishing path

Before producing a manual package, check whether this session actually
has a way to publish:

- Look for relevant connected tools/connectors (e.g. via `ListConnectors`
  or any channel-specific MCP tools already available in this session —
  a CMS, a social scheduler, an email platform).
- If a real integration exists and covers the target channel, **use it**
  — but always show the user exactly what will be posted/scheduled and
  get explicit confirmation before it goes out or gets scheduled. Never
  publish or schedule something publicly without that confirmation, even
  if asked to "just post it" — restate what's about to happen and get a
  yes, since a live post is hard to fully undo.
- If no integration covers a channel, fall back to step 4 for that
  channel. Don't claim something was published when it was only drafted.

## 4. Produce channel-native versions (fallback / always useful)

For each target channel, adapt the source content rather than truncating
it — respect real platform constraints (character limits, hashtag norms,
hook-first structure for social, subject-line conventions for email). The
**social** and **emails** skills have deeper platform-specific guidance
(post templates, platform limits, sequence structures) — use their
reference material for format details rather than reinventing it here;
this skill's job is orchestrating the repurposing and scheduling, not
re-deriving platform specs.

For each version produce: the copy itself, any format notes (image/video
needed, link placement), and a suggested post time if this is part of a
cadence.

## 5. Build the publish package

Write a schedule to `content/scheduled/<slug>-schedule.md`: a table of
channel, copy (or a pointer to a per-channel file if long), suggested
date/time, and status (`draft` / `scheduled` / `published`). Create
`content/scheduled/` if needed. If channels were actually published via
an integration in step 3, mark those rows `published` (or `scheduled`
with the real scheduled time) — everything else stays `draft` until a
human posts it.

## 6. Hand off

Tell the user what actually happened per channel — published/scheduled
via integration vs. drafted for manual posting — and where to find the
package. Don't blur that line; it's the difference between "done" and
"here's your copy."
