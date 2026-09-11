# Changelog

## 1.0.1 — Branding and Naranjo workflow guardrail

### Branding
- Replaced the generated placeholder hospital mark with the supplied Bangkok Hospital Hat Yai logo artwork in the application header and A4 report.
- Rebuilt the favicon from the official B symbol in the supplied artwork.

### Naranjo workflow
- Added an explicit prerequisite gate: at least one saved medication with `Role = Suspected` and at least one ADR event are required before a new Naranjo assessment can be created.
- The `New assessment` button is disabled until prerequisites are satisfied and a TH/EN status message explains what is missing.
- Added domain-level prerequisite logic and regression coverage.

### Quality
- Production build passes 24 automated tests, 0 failed.

## 1.0.0 — Modular production-oriented release

### Architecture
- Refactored monolithic prototype into `core`, `domain`, `features`, `clinical`, `services`, `config` and `ui` modules.
- Added central in-memory store with scoped renders.
- Split optional clinical calculators into independent engines with lazy dynamic imports.
- Split CSS into six source modules and added build-time concatenation to one production stylesheet.
- Added CSP, no-referrer and no-index hardening.

### Clinical workflow
- Full Patient → Medication → ADR Event → Timeline → Drug × ADR Naranjo → Pharmacist Conclusion workflow.
- Multiple drugs, events and pair-specific assessments.
- Drug-allergy phenotype, severity, seriousness, outcome, management and objective evidence.
- TH/EN UI plus separate Copy TH / Copy EN clinical summaries.
- Final A4 print remains blocked until core clinical validation passes.

### Optional modules
- PEN-FAST, RegiSCAR, ALDEN and Schumock & Thornton remain optional.
- Source edits invalidate linked optional results to Needs Review.
- PEN-FAST retains pediatric caution and never auto-orders a challenge.
- RegiSCAR displays an Unknown-data caution without altering the published score.
- **Safety fix:** ALDEN no longer inherits positive values from HTML select defaults. All six scoring parameters must be explicitly selected; incomplete input is not scored.
- RegiSCAR eosinophilia UI clarifies percentage thresholds apply when leukocytes are <4,000/µL.

### Data integrity / privacy
- Added structural validation for optional-module IDs/types/references and pharmacist-conclusion references/duplicates.
- Patient clinical data is not persisted in browser storage; only language preference may be stored.
- Native/legacy JSON import is guarded before replacing active state.
- Legacy ambiguous Naranjo data remains Needs Review or is not imported when semantics cannot be trusted.

### Quality
- Production CI runs the full build, syntax validation and automated tests.
- Added architecture tests for lazy module loading, storage privacy and CSP.
