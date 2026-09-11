# BHH Drug Allergy Assessment v1.0

Production-oriented **modular static web application** for Bangkok Hospital Hat Yai pharmacist ADR and drug-allergy assessment workflow.

## Core pharmacist workflow
Patient Case → Medication Exposure → ADR Events → Graphical Timeline → Drug × ADR Naranjo → Drug Allergy Phenotype → Final Pharmacist Conclusion → Recommendation → Final A4 Report.

The application supports multiple suspected/concomitant drugs, multiple ADR events and multiple causality assessments in one case. Pediatric age can be recorded in days, months or years. Severity and seriousness are deliberately separate concepts.

## Optional Clinical Evaluation Modules
These tools are **optional and are not the main workflow**:
- PEN-FAST — penicillin-allergy risk stratification.
- RegiSCAR — DRESS diagnostic scoring support.
- ALDEN — per-drug SJS/TEN causality support.
- Schumock & Thornton — ADR preventability.

Optional calculator engines are loaded with dynamic `import()` only when the pharmacist opens that module.

## Modular source layout
- `src/core/` — central in-memory store.
- `src/domain/` — clinical/domain models, Naranjo, validation and state transitions.
- `src/features/` — independent pharmacist workflow features.
- `src/clinical/` — independent optional clinical engines.
- `src/services/` — file, migration, summary and presentation services.
- `src/config/` — bilingual labels and i18n.
- `src/ui/` — reusable DOM/dialog/feedback primitives.
- `assets/css/` — modular CSS source; build produces one `assets/styles.css`.

See `ARCHITECTURE.md` for details.

## Clinical safety rules
- Naranjo is ADR causality support, **not** an automatic drug-allergy diagnosis.
- Naranjo Q3 uses drug discontinuation/specific antagonist; dose-response is Q8.
- No Naranjo classification until all 10 answers are completed.
- Q1/Q5/Q7/Q9/Q10 and every Unknown answer require rationale.
- Naranjo is assessed separately for every Suspected Drug × ADR pair.
- Source-data edits mark linked assessments `Needs Review`.
- Final pharmacist conclusion remains independent of the Naranjo score.
- Final Print/PDF is blocked until the core clinical record is complete.
- ALDEN does not provide positive scoring defaults; six criteria require explicit pharmacist selection.

## Privacy-first static design
Clinical case data is not persisted in browser storage. The current case remains in memory until the pharmacist explicitly exports JSON. Only the TH/EN language preference may use localStorage. The CSP blocks application outbound connections (`connect-src 'none'`).

Read `SECURITY.md` before routine use with identifiable patient data.

## Build and verify
Requires Node.js 20+.

```bash
npm run build
```

This rebuilds the production CSS, syntax-checks all JavaScript modules and runs the automated test suite.

For local testing, ES Modules require an HTTP server:

```bash
npm start
```

Then open `http://localhost:8000`.

## GitHub Pages
Recommended repository name: `BHH_Drug_Allergy_Assessment`.

1. Upload the repository contents to `main`.
2. Run/verify GitHub Actions `Production CI`.
3. Settings → Pages → Deploy from branch → `main` → `/ (root)`.
4. Complete `REVIEW_CHECKLIST.md` before clinical use.

## Documentation
- `ARCHITECTURE.md` — module boundaries and performance design.
- `CLINICAL_REFERENCES.md` — algorithm sources and implementation notes.
- `SECURITY.md` — privacy/security scope and limitations.
- `DEPLOY_GUIDE_TH.md` — Thai deployment instructions.
- `REVIEW_CHECKLIST.md` — pharmacist/developer production UAT.
- `CHANGELOG.md` — release notes.
