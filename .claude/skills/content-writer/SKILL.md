---
name: content-writer
description: Writes blog posts and long-form content from a brief, matching this project's brand tone and voice. Use whenever the user asks to write, draft, or outline a blog post or article, gives a content brief (topic, goal, audience, keyword), or asks for content "in our voice"/"on brand." Loads brand voice from the brand-memory skill first so tone stays consistent across pieces, and saves finished drafts to content/drafts/ so channel-publisher can repurpose them later. Not for short-form social copy (see the social skill) or ad copy (see ad-creative) — this is for standalone long-form posts.
---

# Content writer

Turns a brief into a publish-ready blog post that sounds like this brand
wrote it, not like generic AI copy. The brief can be as short as a topic
and a goal — fill the gaps with judgment, not filler.

## 1. Get the brief

At minimum you need: **topic**, **goal** (educate, rank for a keyword,
support a launch, nurture leads), and **audience**. If the user gave a
one-line request, that's a valid brief — infer the rest from context
(the brand-memory audience list, recent conversation, the repo) rather
than stopping to ask three clarifying questions for a routine post. Only
ask when the piece would come out wrong without an answer (e.g. the topic
is genuinely ambiguous, or there's a factual claim only the user can
confirm).

Useful optional inputs, use if given: target keyword/SEO angle, desired
length, format (listicle, how-to, opinion, comparison), a specific CTA,
source material to draw facts from.

## 2. Load brand voice

Invoke the **brand-memory** skill (or read `.claude/brand-memory.json`
directly if it's faster) before writing a word. Pull `voice.tone`,
`voice.do`, `voice.dont`, `key_messages`, and `audience`. If no brand
memory exists yet, fall back to brand-memory's bootstrapping step rather
than writing in a generic voice — an on-brand post is the entire point of
this skill.

## 3. Research, don't invent

Any factual claim, statistic, or competitor reference in the post must
come from something you actually checked (`WebSearch`/`WebFetch`) or from
material the user supplied — never fabricate numbers, quotes, or case
studies. If you can't verify a claim the brief wants included, flag it to
the user instead of guessing plausibly.

## 4. Structure the draft

- **Headline** — states the finding or benefit, not just the topic (match
  `voice.do` if it says lead with a concrete result).
- **Meta description** — one sentence, ~150-160 characters, for SEO.
- **Intro** — the point of the piece in the first 2-3 sentences; don't
  throat-clear.
- **Body** — scannable: short paragraphs, subheads every 150-250 words,
  bullets/tables where they beat prose. Weave in `key_messages` where they
  genuinely fit the argument, not as a checklist to tick off.
- **CTA** — one clear next step, matching brand-memory's tone for CTAs
  (short, low-friction, not hard-sell) unless the brief specifies
  otherwise.

Apply `voice.dont` as hard constraints — if the brand voice says no
superlatives, none make it into the draft, full stop.

## 5. Save the draft

Write the post as markdown to `content/drafts/<slug>.md`, with frontmatter:

```markdown
---
title: "..."
slug: "..."
meta_description: "..."
status: draft
target_keyword: "..."
created: YYYY-MM-DD
---
```

Create `content/drafts/` if it doesn't exist. Use a URL-safe slug derived
from the headline. If a draft with the same slug exists, ask before
overwriting rather than clobbering earlier work.

## 6. Hand off

Tell the user where the draft was saved and give a one-sentence summary of
the angle you took. If they want it repurposed for social/email/other
channels, that's the **channel-publisher** skill's job — mention it's
available rather than trying to do channel-specific formatting here.
