---
name: aeo-signal
description: Runs a live Answer Engine Optimization (AEO) audit for a real brand or domain — fetches the brand's own site to check entity clarity and structured data, researches its current search visibility, tests realistic customer prompts against live web grounding to see whether the brand actually gets cited versus its competitors, and publishes the findings as a styled report artifact. Every number in the output comes from research performed during that run, never invented. Use this whenever the user asks to audit AEO or AI-citation readiness for a brand, check how ChatGPT/Perplexity/Gemini/Copilot might cite a company, run an "AEO signal" or "AI visibility" report, or pastes a domain and asks something like "how are we doing here" or "would AI recommend us." Trigger even if they don't use the term AEO — "are we showing up in ChatGPT answers," "why does [competitor] keep getting mentioned instead of us," and "is our site AI-search-ready" all mean the same thing.
---

# AEO Signal audit

Answer engines (ChatGPT, Perplexity, Gemini, Copilot, AI Overviews) answer
customer questions by synthesizing an answer from whatever they find on the
web, then citing a handful of sources. Getting cited is a function of real,
checkable things: whether the brand's own pages clearly state what it is,
whether its content matches the shape of the answer these engines want to
lift, and whether it currently shows up at all when someone searches the
questions a customer would actually ask. This skill measures those things
for real, for one brand, right now — it does not simulate them from
memory or fabricate plausible-looking numbers. If a claim in the report
isn't backed by something you actually fetched or searched for during this
run, cut the claim.

You have web access (`WebFetch`, `WebSearch`) and an `Artifact` publishing
tool. This audit uses both: fetch to inspect the brand's own pages, search
to see what the wider web currently says about it, and Artifact to hand
back a real, readable report instead of a wall of chat text.

## 1. Establish the subject

Get a brand name and a domain. If the user gave a bare domain, that's
enough — infer the brand name from the site itself in step 2. If they only
gave a brand name, search for the domain. If it's genuinely ambiguous (a
common name, multiple plausible companies), ask rather than guessing wrong
— the whole report is worthless if it's about the wrong company.

Also try to place the brand's category (project management software,
DTC skincare, B2B payments, etc.) — you'll need it in step 4 to write
prompts a real customer would type, and you'll usually pick it up for free
while reading the homepage in step 2.

## 2. Check entity clarity on the brand's own site

`WebFetch` the homepage, plus an about page and FAQ/help page if you can
find them (check the homepage nav/footer for links, or try `/about`,
`/faq`). You're checking whether the site itself gives an answer engine
something clean to lift:

- **A canonical description.** Does the homepage `<title>`/meta description
  and the about page agree on one clear, consistent sentence of what the
  company does? Answer engines get confused by a brand that describes
  itself five different ways across five pages.
- **Structured data.** Look at the page source for `schema.org` JSON-LD —
  `Organization`, `FAQPage`, `Product`, `Article`. This is the most direct
  signal a page gives to a machine reader. Note what's present and what's
  missing.
- **FAQ / Q&A content.** Answer engines lift FAQ blocks almost verbatim
  because the question-answer shape maps directly onto what they output.
  Note whether one exists and roughly how substantive it is.

Score this as **entity clarity**: a short verdict (e.g. "Clear" /
"Inconsistent" / "Thin") plus the 2-4 concrete findings that justify it.
Don't reduce it to a fake precision number like "62/100" — you didn't
measure against a real scale, so don't imply you did.

Some environments block `WebFetch` outright at the network layer (you'll
see `EGRESS_BLOCKED` even on a plain domain like `example.com` — that's
the tell it's environmental, not a bad URL, so don't retry the same fetch
expecting a different result). If that happens, fall back to `WebSearch`:
`site:domain.com` queries surface indexed subpages, and third-party
listings (G2, Crunchbase, app stores, review sites) usually restate the
brand's own description closely enough to judge consistency. Say so
plainly in the methodology section — structured data specifically can't
be verified this way, since JSON-LD isn't visible in search snippets, so
report it as unconfirmed rather than claiming it's absent.

## 3. Map current visibility

`WebSearch` the brand name, and the brand name plus its category (e.g.
`"Marketeam" marketing agency`). Note who else shows up prominently —
these are the competitors and third-party sources actually in the
running for citations right now. This also sanity-checks your read of the
brand's category from step 2.

## 4. Test realistic customer prompts

This is the core of the audit. Write 6-8 prompts a real prospective
customer would type into an AI assistant while evaluating options in this
category — a mix of:
- **Commercial** ("best X for Y", "X vs competitor", "top X tools 2026")
- **Informational** ("how does X work", "what is X", category-defining
  questions where a confident brand should be citable)

Ground these in what you saw in steps 2-3, not generic templates — if the
brand's site emphasizes a specific use case or niche, at least a couple of
prompts should test exactly that niche, since that's where the brand has
the best real shot at being cited.

For each prompt: run a `WebSearch`, then actually answer the prompt the
way an answer engine would — a short synthesized answer citing the
sources you'd realistically cite, based on what's actually ranking and
well-matched to the question right now. Record, honestly:
- Did the target brand appear as something you'd cite? (yes/no, and why)
- Who did get cited instead, if not?

Do not pre-decide the outcome — some brands genuinely do well on some
prompts and poorly on others, and a report that finds the brand losing
every single prompt (or winning every single one) is a signal to
double-check your searches, not necessarily the truth, but it can also
just be the truth. Follow what the search results actually show.

## 5. Synthesize

From step 4, compute:
- **Citation rate** = prompts where the brand was citable ÷ total prompts
  tested. This is a real fraction from real trials — state the count too
  (e.g. "3 of 7 prompts").
- **Gap list** = the prompts where it wasn't cited, with who was cited
  instead (from step 4) — this is usually the most actionable part of the
  report.
- **2-3 recommendations**, each tied to a specific finding from steps 2-4
  (a missing FAQ block, a specific gap prompt, an inconsistent
  description) — not generic AEO advice. If you noticed the same fixable
  issue behind multiple gaps, say so; that's a stronger, more useful
  finding than three separate generic tips.

## 6. Render the report

Read `assets/report.css` and inline its full contents into a `<style>`
block — it's the report's visual system (Space Mono for headings/data/tags,
IBM Plex Sans for prose, a cool-neutral palette, four fixed categorical
colors for engines/series). Don't rewrite the design; populate it with
this run's real findings. Reuse the four categorical color slots
(`--series-1..4`) in a fixed order across the report for whatever four
things you're comparing (e.g. the engines you tested, or up to four
prompt categories) — don't invent new hues, and don't recolor something
just because it's sorted differently in one chart than another (color
follows the entity, never its rank).

Structure, top to bottom:

1. **Report header** — `.report-header`: a `.tag` reading "AEO Signal /
   audit", the brand name as the `<h1>`, and a `.report-meta` line with the
   domain and today's date.
2. **Executive summary** — a `.stat-grid` of `.stat-tile`s: citation rate
   (as "3 / 7 prompts", not a bare percent, so the sample size stays
   visible), entity clarity verdict, prompts tested, and one more relevant
   number you actually gathered.
3. **Prompt-by-prompt results** — a table: prompt, cited? (`.badge-good`
   "Cited" / `.badge-critical` "Not cited"), who was cited instead. This is
   the evidence, not the summary — every row must trace back to a real
   search you ran in step 4.
4. **Entity clarity findings** — the concrete findings from step 2, as
   short prose or a small list, not another chart.
5. **Recommendations** — `.rec-grid` of `.rec-card`s, 2-3 cards, each
   naming the specific finding it addresses.
6. **Methodology** — `.method` at the bottom: plainly state what this
   audit is (live web search + direct synthesis of how an answer engine
   would likely respond, run once on this date) and isn't (it does not
   call the ChatGPT/Perplexity/Gemini/Copilot APIs directly, so treat it as
   a strong proxy, not a literal transcript of those products). This
   footer is what keeps the report honest — don't skip it or soften it into
   marketing copy.

A bar or line chart is optional — only add one if you have a real
categorical or time-series comparison worth showing (e.g. citation rate
by prompt category, or by intent type). Don't force a chart in just to
match a template; a strong table beats a decorative chart.

Publish with the `Artifact` tool: pick a favicon emoji, a title like
"AEO Signal — {Brand}", and a one-sentence description naming the brand
and the citation-rate headline. Tell the user the link plus a 2-3
sentence summary of the standout finding — the gap list is usually more
interesting to lead with than the topline rate.
