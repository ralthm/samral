# Architecture rules
- Keep Cashback vs Miles comparison arithmetic in a pure decimal-based module, separate from page state and existing balance-conversion logic, so assumptions and monetary rules are independently testable.
- Reference existing card IDs and redemption targets through comparison adapters; missing spending terms stay explicitly unknown rather than inferred from transfer metadata.
- Preserve route-level lazy loading for new tools so they do not increase the initial homepage code payload.
- Keep illustrative flight scenarios in a separate data adapter with explicit hypothetical provenance; use published mileage only for exact itinerary matches so UI defaults cannot imply verified fares or availability.