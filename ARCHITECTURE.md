# BHH Drug Allergy Assessment — Modular Architecture v1.0

## Design goal
Production-oriented static ES-module application for pharmacist ADR/drug-allergy workflow. The application intentionally separates clinical domain logic from UI code so a change to one calculator or screen does not require editing a monolithic application file.

## Runtime architecture

```text
index.html
   ↓
src/main.js                 Application composition / bootstrap
   ↓
src/core/store.js           Central in-memory case state
   ├─ src/features/*         Pharmacist workflow modules
   ├─ src/domain/*           Clinical/domain rules and validation
   ├─ src/services/*         Import/export, migration, summary/report helpers
   ├─ src/config/*           Labels and TH/EN translation
   └─ src/clinical/registry.js
           ↓ dynamic import only when used
      src/clinical/penfast.js
      src/clinical/regiscar.js
      src/clinical/alden.js
      src/clinical/schumock.js
```

## Feature boundaries
- `features/patient.js` — patient, diagnoses, previous allergy history.
- `features/medications.js` — medication exposure and suspected/concomitant role.
- `features/events.js` — ADR event, phenotype, severity, seriousness, outcome and evidence.
- `features/timeline.js` — graphical chronology using real Date values.
- `features/naranjo.js` — Drug × ADR Naranjo editor and rationale workflow.
- `features/clinical-modules.js` — optional calculators; engines lazy-load only when opened.
- `features/conclusions.js` — pharmacist clinical conclusion and recommendations.
- `features/report.js` — validation, TH/EN summaries and A4 final report.
- `features/file-operations.js` — JSON import/export and unsaved-change protection.

## Domain boundaries
- `domain/models.js` — schema/version and entity constructors.
- `domain/naranjo.js` — reviewed Naranjo questions, scoring and rationale rules.
- `domain/assessment-state.js` — Complete / Incomplete / Needs Review state transitions.
- `domain/validation.js` — structural integrity and final-print validation.
- `domain/timeline.js` — chronology calculations only.

## Performance strategy
1. No React/Vue/chart library or CDN runtime dependency.
2. Native browser ES Modules; optional clinical calculators use `import()` and are not loaded during the normal core workflow.
3. CSS is authored in six modular source files and concatenated to one `assets/styles.css` at build time to reduce stylesheet requests.
4. Off-screen workspace sections use `content-visibility` when supported.
5. Central store supports scoped rendering, so most field changes do not redraw the entire application.
6. Timeline is rendered with native HTML/CSS rather than a heavy charting package.

## State and privacy
Clinical case state exists only in JavaScript memory. `localStorage` is permitted only for non-clinical language preference. Case persistence is explicit JSON Export/Import. A `beforeunload` guard warns when the case has unsaved changes.

## Clinical safety boundaries
- Naranjo is causality support and never becomes a drug-allergy diagnosis automatically.
- Final pharmacist conclusion is a separate entity.
- Editing medication/event source data invalidates linked Naranjo and linked optional module results to `Needs Review`.
- Optional calculators do not block core case completion unless their own structural references are corrupted.
- ALDEN has no positive scoring defaults; all six parameters must be explicitly selected.
- Final Print is blocked until the core case is valid and all Drug × ADR Naranjo/conclusion requirements are complete.

## Extension pattern
A new optional calculator should be implemented as a new file under `src/clinical/`, registered in `clinical/registry.js`, then surfaced by `features/clinical-modules.js`. Do not add calculator math directly to UI event handlers.
