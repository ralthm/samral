# Cashback vs Miles Calculator
- [ ] Audit reusable records and official issuer cashback/earning terms.
- [ ] Add searchable bank-grouped cards and spending-profile comparison modes.
- [ ] Apply verified conditional rules and rank supported alternatives transparently.
- [ ] Test caps, thresholds, exclusions and categories; verify existing calculator safeguards.
- [x] Simplify primary inputs and retain all advanced controls.
- [x] Add labelled destination examples and automatic sourced award requirements.
- [x] Run mathematical regressions and verify immediate results and quote overrides.
- [x] Add deterministic comparison engine and transparent terms/data adapters.
- [x] Add integrated calculator page and discreet discovery links.
- [x] Test financial rules and verify new and existing calculator flows across screen sizes.
- [x] Document assumptions and first-version limitations.

## Verification and limitations
- Refinement: 53 targeted tests pass. All twelve country/destination defaults show immediate estimates; actual low-price quotes, cashback caps and unknown-card safeguards checked in the browser. Desktop, current-width and phone layouts have no horizontal overflow or runtime errors. Calculation engine unchanged.
- All destination fare/tax presets are explicitly hypothetical, not historical prices. Published exact award mileage is reused; card-spending terms remain unverified so primary choices are illustrative, with the existing card registry available in advanced controls.
- New comparison: 25 tests pass. Targeted new/existing coverage: 145 tests pass. Desktop and phone flows checked with actual user-entered Singapore and Malaysia scenarios; existing Enrich balance calculation and Tally/Cal.com links verified.
- Full suite: 1,116 tests pass; three existing CIMB/Cathay promotion tests expect the expired August 2026 CIMB bonus. Production promotion behaviour was not changed.
- Earning/cashback terms remain manual until independently sourced. The Singapore example fare/taxes are explicitly hypothetical; no live fares or award availability are checked. Malaysia supports manual quotes and matching existing award targets.
- One annual transfer, steady spending, manual annual fees and no expiry are disclosed assumptions; category rates are supplied by the visitor, not inferred from transfer metadata.