# Simplify the Points Trip Plan purchase flow

## Customer experience
- Rework the Points Trip Plan page into a focused advisory offer using the supplied copy, concise deliverables, a prominent **US$75** one-time price, and one consistent purchase CTA.
- Link the purchase CTA directly to the supplied Stripe Payment Link in the normal browser window. Stripe remains responsible for redirecting successful customers to the existing Tally questionnaire.
- Present the three requested “How it works” steps with restrained typography, whitespace, and minimal visual structure.
- Keep concise expectation-setting: Samral provides analysis and recommendations, does not issue tickets, and does not guarantee availability or savings.

## CTA consistency
- Keep homepage, navigation, footer, and calculator discovery CTAs pointed to the Points Trip Plan sales page rather than Tally.
- Update customer-facing Trip Plan prices and purchase wording from $79 to $75.
- Preserve the Personal Card Strategy Cal.com flow unchanged.

## Lightweight implementation
- Replace the browser call to the custom checkout Edge Function with a configurable Stripe Payment Link, defaulting to the supplied link.
- Remove the custom trip-intake and trip-order admin routes from the public application so the website no longer presents its own intake or fulfilment flow.
- Leave historical database migrations untouched to avoid destructive production changes; the new customer flow will not use them.

## Verification
- Check all public Trip Plan links and prices for consistency.
- Run the project’s automated validation and verify the sales-page CTA resolves to Stripe rather than Tally or the custom backend.
