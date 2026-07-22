## Goal

Replace the single Enrich-only destination dataset with three independent, verified redemption engines and fix the programme filter, ranking, and result-card wording so the calculator handles multi-programme portfolios correctly.

## What's wrong today

- `src/data/redemptionTargets.ts` only contains Enrich records, so the programme filter effectively has one option.
- Enrich results are labelled "One way · fixed saver", but Enrich Saver is round-trip only, with points quoted per direction. A 51,000 balance is being described as covering a 24,000 one-way trip instead of a 48,000 return-for-two.
- Enrich seeds include Dubai, Istanbul, Paris — routes not solely operated by Malaysia Airlines. They must be removed from the Saver engine.
- Programme totals from the calculator are shown as if additive across programmes, without any alternative-balance warning.

## Architecture

Replace the single seed file with per-programme engines under `src/data/redemption/`:

```text
src/data/redemption/
  types.ts           shared RedemptionOpportunity type (matches the field list in the brief)
  enrich.ts          Malaysia Airlines-operated Saver routes, return-only
  krisflyer.ts       Singapore Airlines Saver, effective 1 Nov 2025, KUL via SIN
  asiaMiles.ts       Cathay Pacific-operated standard awards, KUL via HKG
  index.ts           registry: programmeId -> { name, engine, buildOpportunities(ctx) }
```

Each engine exports:
- `programmeId`, `displayName` (Enrich / KrisFlyer / Cathay — Asia Miles)
- verified route seeds with the full field set (origin, destination, connection airports, segments, direct/connecting, cabin, award type, pricing basis, points per person, taxes note, source, verifiedOn, effectiveFrom/Until)
- `buildOpportunities({ balance, tripType, travellers })` that returns cards with `totalPointsRequired`, `remaining`, `shortfall`, threshold flag

A `SUPPORTED_PROGRAMMES` set marks which programmes are complete enough to appear in "Where can your points take you?". Phase 1: enrich, krisflyer, asia_miles only.

## Engine rules

### Enrich (Saver)
- Round-trip only. Stored `pointsPerPersonPerDirection`; `totalPointsRequired = perDirection × 2 × travellers` for return, and per-direction × travellers for the one-way case which is only shown as a "directional reference" and never marked bookable.
- Only include Malaysia Airlines-operated routes. Remove DXB, IST, CDG from the Saver seed. Keep PEN, BKI, BKK, DPS, SGN, HAN, MNL, HKG, TPE, ICN, NRT, KIX, PER, SYD, MEL, LHR (LHR is MH-operated).
- When user selects one-way, disable Enrich Saver cards and show explanatory note.
- Card wording per spec: "12,000 per person, per direction · return booking required" + "48,000 Enrich for two travellers, return".

### KrisFlyer
- Singapore Airlines Saver chart effective 1 Nov 2025. Seed KUL–SIN–<dest> itineraries with a single origin-to-destination total (not per-segment sum).
- Cabins: Economy, Premium Economy where offered, Business, Suites where offered.
- Connection shown as "KUL → SIN → NRT · Connecting via Singapore".
- Trip type: support one-way and return (return = 2× one-way per KrisFlyer rules).

### Cathay — Asia Miles
- Cathay Pacific-operated standard flight awards, KUL–HKG–<dest>.
- Zone-based pricing per current Cathay standard chart.
- Connection shown as "KUL → HKG → NRT · Connecting via Hong Kong".

Every seed carries `verifiedOn`, `sourceUrl`, `sourceTitle`, `effectiveFrom`, and a `taxesAndFeesNote`. If `effectiveUntil` has passed or `status !== 'verified'`, the card renders "Current points requirement needs verification" instead of a firm target.

## Programme filter

Compute dynamically in `MilesCalculator.tsx`:

```text
availableProgrammes = programmes reachable from user's entered cards (from calculator results)
supportedProgrammes = SUPPORTED_PROGRAMMES  // enrich, krisflyer, asia_miles
filterOptions = intersection(availableProgrammes, supportedProgrammes)
dropdown = ["All programmes", ...filterOptions.sortedByDisplayName]
```

"All programmes" iterates every supported programme's engine and merges opportunities.

Programmes that are reachable but not yet supported (e.g. AirAsia points from Alliance, Flying Blue from CIMB) continue to appear under "Potential transfer balances" but are excluded from the destination filter.

## Alternative-balance warning

Above the programme results grid, render a persistent notice:

> Your bank points can be transferred into different loyalty programmes. The full balances shown are alternative transfer scenarios unless you choose to split your bank points between programmes.

Do not sum potential balances across programmes anywhere in the UI.

## Ranking (All programmes view)

Sort merged opportunities by:
1. threshold met (true first)
2. selected trip type fully affordable
3. direct over connecting
4. larger programme-balance remaining
5. smaller shortfall
6. more recent `verifiedOn`

Then cap "You can reach these now" at 3 per programme with a "View all results" toggle that removes the cap.

## Result card wording

Programme-specific templates matching the brief exactly for Enrich, KrisFlyer, and Asia Miles. All cards end with "Award-seat availability has not been checked." Enrich cards additionally state "Malaysia Airlines-operated flight only" and the return-booking requirement.

## Files to change

- new: `src/data/redemption/types.ts`, `enrich.ts`, `krisflyer.ts`, `asiaMiles.ts`, `index.ts`
- edit: `src/data/redemptionTargets.ts` — re-export from the new registry for backwards compatibility, or delete once callers move
- edit: `src/pages/MilesCalculator.tsx` — new `DestinationDiscovery` render path using the registry, dynamic filter, alternative-balance notice, ranking, per-programme card templates, per-programme caps
- edit: `src/lib/tripContext.ts` — extend `TripContext` with connection airports and per-direction fields so `/trip-planning` can surface the correct itinerary

## Out of scope this pass

- AirAsia points destination cards (transfer-only until live pricing is wired)
- Star Alliance / oneworld partner awards on KrisFlyer and Asia Miles
- Phase 2 and 3 programmes (Qatar, BA, Emirates, Flying Blue, etc.)
- Live award availability checks

## Verification

- Vitest + tsgo typecheck
- Manual walkthrough against the 7 acceptance tests in the brief, using Playwright to confirm: Maybank 2 Cards Premier with 645,000 TP shows all three programmes as alternatives; Alliance 68,240 TBP shows no AirAsia destination cards; Enrich cards state return-only; KrisFlyer and Asia Miles cards show the connection airport.
