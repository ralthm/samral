The current Points Strategy page is overlong and reads like marketing copy. The user wants it rewritten from scratch to feel like one person speaking plainly over coffee. The page should be reduced by at least 70% and answer only four questions: What is it? Who is it for? How does it work? What's the next step?

The existing FAQ section should be preserved, with minimal edits if needed. Almost all other sections should be rewritten or removed.

### Proposed structure

1. **Hero** — One short paragraph explaining what Points Strategy is in plain language, plus a CTA to book a call. No eyebrow, no big headline, no salesy language.

2. **Who it's for** — A short, honest list. No consultancy framing. Focus on practical signs: someone who spends meaningfully on cards, has points scattered across programmes, or simply doesn’t want to do the research themselves.

3. **How it works** — Three to four short sentences. Discovery call → I look at your setup → If I can help, I tell you how and what it costs → you decide. No numbered steps, no process diagrams.

4. **What you get** — Brief, practical description of the paid review. No jargon, no “deliverables.” Just what I actually do.

5. **FAQ** — Keep existing accordion and questions. Only clean up tone if necessary; otherwise leave as-is.

6. **Final CTA** — Short, conversational invitation to book the call. No grand headline.

### Sections to remove

- Problem / Overlooked / Founder / Process / Discovery Call / Paid Service / Ideal Client — these become the new shorter sections above.

### Tone and style

- Plain, conversational English.
- Assume the visitor is intelligent.
- No marketing taglines, no em-dashed rhetorical flourishes, no “unlock value.”
- If a sentence sounds like a consultancy website, remove it.
- Keep the existing visual design (fonts, spacing, colors, rounded-sm buttons) but strip away the heavy marketing structure.

### Technical details

- Rewrite `src/pages/PointsStrategy.tsx` inline.
- Keep imports that are still used (images, icons, Accordion).
- Remove unused imports and image imports if their sections are removed.
- Keep the Nav and Footer unchanged except for minor tonal consistency.
- Preserve the route, SEO meta, and the `DISCOVERY_CALL_URL` constant.
- Keep the FAQ component and its array intact.

### Outcome

A single, scannable, conversational page that explains the service honestly and leaves the decision to the visitor.