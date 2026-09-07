---
name: brand-memory
description: Reads and updates the durable brand knowledge base for this project — brand voice/tone, positioning, audience, key messages, proof points, and known competitors — stored in .claude/brand-memory.json so it persists across sessions and is shared by content-writer, competitor-intel, and channel-publisher. Use this whenever the user asks "what's our brand voice," "how do we describe ourselves," "remember that we...," "update our positioning," "who are our competitors," or before any content/copy task that needs to match brand tone. Also use it proactively at the start of a content-writer, competitor-intel, or channel-publisher run to load context, and at the end of a competitor-intel run to save new competitor findings.
---

# Brand memory

This project's brand knowledge lives in one file: `.claude/brand-memory.json`,
relative to the repo root. It is the single source of truth other skills pull
from instead of re-deriving brand voice from scratch each time, and the place
they write back to when they learn something new (a new competitor, a
messaging change, a correction from the user).

Never keep brand facts only in chat — if it's worth remembering past this
turn, it belongs in the file.

## Reading (the common case)

1. Read `.claude/brand-memory.json`. If it doesn't exist yet, see
   "Bootstrapping a new brand" below instead of proceeding empty-handed.
2. Surface only what's relevant to the task at hand — don't dump the whole
   file into chat unless the user asked "what's our brand voice." A
   content-writer run needs `voice`, `audience`, and `key_messages`; a
   competitor-intel run needs `competitors` and `positioning`.
3. Treat `voice.do` / `voice.dont` as binding constraints on anything you
   write for this brand, not suggestions.

## Schema

```json
{
  "brand": "string — product/brand name",
  "company": "string — parent company, if different from brand",
  "tagline": "string",
  "one_liner": "string — one sentence, what it is and who it's for",
  "positioning": "string — a short paragraph: category, differentiation",
  "audience": ["string — one entry per distinct audience segment"],
  "voice": {
    "tone": ["string — adjectives/phrases describing how it sounds"],
    "do": ["string — concrete writing rules to follow"],
    "dont": ["string — concrete writing rules to avoid"]
  },
  "proof_points": ["string — real, citable facts/numbers about the product"],
  "competitors": ["string or {name, url, notes} — known competitors"],
  "key_messages": ["string — core claims content should reinforce"],
  "links": { "site": "string", "...": "any other durable reference URLs" },
  "last_updated": "YYYY-MM-DD",
  "changelog": [{ "date": "YYYY-MM-DD", "note": "string", "source": "string" }]
}
```

Keep `competitors` entries as objects (`{name, url, notes}`) once you have
more than a bare name to record — competitor-intel writes richer entries.

## Writing / updating

When the user tells you something new about the brand, or another skill
(competitor-intel, content-writer) surfaces a durable fact worth keeping:

1. Read the current file first — never overwrite blind.
2. Merge the change into the right field. Append to arrays rather than
   replacing them, unless the user is explicitly correcting/removing an
   entry.
3. Update `last_updated` to today's date and append one `changelog` entry
   describing what changed and why (`source`: the skill or user request
   that caused it).
4. Write the file back with `Edit` (or `Write` only if the file doesn't
   exist yet). Keep the JSON valid and the key order matching the schema
   above so diffs stay readable.
5. Briefly confirm what you updated — one sentence, not a re-dump of the
   file.

Don't record anything speculative or unverified as a `proof_point` — that
field feeds copy that ships. If a number came from a competitor-intel run
or an aeo-signal audit rather than a verified internal source, phrase it in
`competitors`/notes instead, not `proof_points`.

## Bootstrapping a new brand

If `.claude/brand-memory.json` doesn't exist and the task needs it:

1. Look for existing signal in the repo first — an index.html, README,
   pitch deck, or other copy that already states the brand's voice and
   positioning — rather than inventing one.
2. If nothing exists, ask the user for the essentials (what the product
   is, who it's for, 2-3 tone words) rather than guessing a generic
   "friendly and professional" voice that won't actually constrain
   anything written later.
3. Create the file matching the schema above, with a `changelog` entry
   noting how it was bootstrapped.
