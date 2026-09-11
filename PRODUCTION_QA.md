# Production QA Record — v1.0.0

## Automated verification
Command: `npm run build`

Build pipeline performs:
1. Concatenate six modular CSS source files into `assets/styles.css`.
2. JavaScript syntax check for every file under `src/`.
3. Node test suite.

Latest result in the build environment: **23 tests passed, 0 failed**.

Coverage includes:
- Naranjo incomplete behavior, semantic No/Unknown, classification boundaries and rationale requirements.
- Suspected-vs-concomitant pair integrity and Needs Review transitions.
- Final-print phenotype/conclusion validation.
- PEN-FAST cutoff and conservative Unknown handling.
- RegiSCAR score bands.
- ALDEN score bands and rejection of incomplete six-parameter input.
- Schumock & Thornton preventability behavior.
- Legacy migration safeguards.
- Optional Clinical Module reference integrity.
- Duplicate pharmacist-conclusion integrity.
- Lazy loading of all four optional clinical engines.
- No patient-data browser persistence API outside language preference.
- CSP `connect-src 'none'` and modular production entry point.

## Static release review
- No CDN/runtime framework dependencies.
- `src/main.js` is the sole production composition root.
- No prototype compatibility shim files remain.
- Optional calculator engines are separate `src/clinical/*.js` modules.
- CSS source remains modular while deployment uses one compiled stylesheet.
- No TODO/FIXME markers remain in application source.

## Interactive browser QA limitation in this build environment
Chromium is installed, but local/file navigation is blocked by the execution environment's administrator policy. Therefore this record **does not claim a completed click-through browser UAT**.

Before clinical go-live, complete `REVIEW_CHECKLIST.md` against the deployed GitHub Pages (or approved internal-hosting) URL using a hospital-supported browser and non-patient test data first.

## Release interpretation
The package is a production-oriented software release with automated clinical-logic/data-integrity safeguards. Clinical governance, PDPA/IT hosting approval, and real-browser pharmacist UAT remain go-live gates for routine identifiable-patient use.
