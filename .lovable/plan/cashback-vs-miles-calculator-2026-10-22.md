# Cashback vs Miles Calculator

## Scope
Add a free comparison tool at `/cashback-vs-miles`, using Samral’s current typography, colours, header and footer. Singapore is the default; Malaysia is supported with RM inputs. Keep the existing Miles Calculator, services, payment links, client content and homepage design unchanged.

## What can be reused
- Existing Singapore/Malaysia card identifiers, issuer names and airline programmes.
- Published bank-points conversion ratios, minimum transfer blocks and known transfer fees.
- Existing redemption destinations, cabins, airline routing and sourced award requirements where verified.
- Current form controls, layout patterns, tracking and page metadata conventions.

## Important data limitation
The current database primarily converts **existing bank points** into miles. It does not contain comprehensive structured spending earn rates, cashback caps, exclusions or annual fees. Existing flight records do not provide comparable cash fares or exact award taxes.

Do not infer earning rates from conversion ratios or turn unknown fees into verified zeroes. The reliable first version uses clearly labelled manual earning assumptions where terms are missing. Selecting an existing miles card reuses its transfer rules, but requires a user-confirmed earning rate if Samral has no verified spending terms. Actual cashback-card calculations are enabled only for fully sourced terms; otherwise offer manual cashback rather than inventing issuer rates.

## Main experience
1. Country and monthly spending: Singapore, S$3,000 by default; numeric entry plus slider.
2. Cashback: manual rate and optional monthly cap, default 1.7% uncapped. Allow actual cards only when complete verified terms are available.
3. Miles: default illustrative 1.4 miles per local dollar; alternatively select an existing card and confirm its spending earning rate. Keep bank points and airline miles distinct.
4. Destination: Tokyo, Bangkok, Seoul, Hong Kong, Taipei or London, with supported sourced itineraries. Economy by default.
5. Comparison mode: clearly labelled illustrative fare/tax assumptions, or custom cash fare, award miles and taxes. Use sourced mileage requirements only when the exact programme and itinerary match. Require input when no suitable verified record exists.

Results update immediately. Show annual cashback, newly earned miles, estimated usable miles value, reward percentages, currency difference, break-even cents per mile and cash fare, and months to earn the chosen award. Say when results are close. Separate existing miles from future spending rewards and explain that miles value is not immediate cash savings.

## Optional details
Use one expandable “Make my comparison more accurate” area for spending categories, excluded spending, cashback caps/thresholds, existing miles, passengers, travel dates, cabin, fare/award overrides, annual fees and transfer fees. Dates provide comparison context, not live flight searches. Apply verified category rules only when available; otherwise disclose that the result is an estimate based on the user’s inputs.

Add a concise expandable calculation explanation and assumption/source notes, including fee uncertainty, data dates, transfer leftovers and expiry where known. Unknown material inputs must prevent a definitive recommendation.

## Integration
- Add a discreet footer tool link and a cross-link from the existing Miles Calculator; avoid crowding the main navigation.
- End results with “Already have bank points or airline miles?” and “Explore Points Trip Planning”, linking to the existing service page.
- No accounts, email collection, new payment flow, live fare APIs or multi-card optimisation.

## Technical implementation
- Keep a separate deterministic calculation engine, independent from the UI, using decimal-safe monetary arithmetic and rounding at defined rule boundaries.
- Add updateable cashback/earning-term models referencing existing card IDs, with verification status, sources and dates. Missing terms remain missing.
- Reuse existing conversion rules without changing their behaviour. Do not count temporary transfer promotions as permanent spending earning rates.
- Calculate each selected airline programme independently; do not average programmes.
- Keep new route code lazy-loaded, consistent with existing routes.

## Verification
- Unit tests for all ten brief scenarios, including S$612 cashback, S$2,160 capped cashback, 50,400 miles, approximately 1.96 cents per mile, 2.75% reward rate and 1.214-cent break-even.
- Additional tests for fees, thresholds, category caps, transfer blocks, missing data, existing balances and close comparisons.
- Exercise the new tool with illustrative and custom inputs, card selection, country changes and a cashback-winning scenario.
- Check desktop, tablet and mobile presentation and keyboard-accessible controls.
- Confirm the original Miles Calculator still calculates correctly and existing service/payment destinations are unchanged.

## First-version limitations
No live fares or availability. Broad automatic cashback-card and spending-category coverage requires verified issuer terms that are absent today. Manual assumptions are explicitly labelled, with no claim that an illustrative award is currently bookable.