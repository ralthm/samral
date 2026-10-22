# Cashback vs Miles Calculator
- [x] Add deterministic comparison engine and transparent terms/data adapters.
- [x] Add integrated calculator page and discreet discovery links.
- [x] Test financial rules and verify new and existing calculator flows across screen sizes.
- [x] Document assumptions and first-version limitations.

## Verification and limitations
- New comparison: 25 tests pass. Targeted new/existing coverage: 145 tests pass. Desktop and phone flows checked with actual user-entered Singapore and Malaysia scenarios; existing Enrich balance calculation and Tally/Cal.com links verified.
- Full suite: 1,116 tests pass; three existing CIMB/Cathay promotion tests expect the expired August 2026 CIMB bonus. Production promotion behaviour was not changed.
- Earning/cashback terms remain manual until independently sourced. The Singapore example fare/taxes are explicitly hypothetical; no live fares or award availability are checked. Malaysia supports manual quotes and matching existing award targets.
- One annual transfer, steady spending, manual annual fees and no expiry are disclosed assumptions; category rates are supplied by the visitor, not inferred from transfer metadata.