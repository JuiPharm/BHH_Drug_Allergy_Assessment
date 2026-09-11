# Security & Privacy Notes

## Current deployment model
BHH Drug Allergy Assessment v1.0 is a static client-side application designed for GitHub Pages or an equivalent approved static host. It has no authentication, database, analytics, telemetry, or application network API.

## Privacy controls implemented
- Patient case data is held in memory only.
- No patient/HN/clinical case data is written to localStorage, sessionStorage or IndexedDB by application source modules.
- Only TH/EN language preference may be stored locally.
- Content Security Policy sets `connect-src 'none'`, preventing application fetch/XHR/WebSocket connections.
- Scripts, styles and images are self-hosted; there are no CDN runtime dependencies.
- Referrer policy is `no-referrer`.
- Search indexing is discouraged with `noindex,nofollow,noarchive`.
- JSON import is size-limited and passes schema/data-integrity checks before state replacement.
- Final print is guarded by clinical validation.

## Important limitation
GitHub Pages does not provide application-level user authentication or hospital role-based access. A public URL can be opened by anyone who knows it, although the application does not transmit entered patient data to a backend.

**Routine use with identifiable patient information must therefore be approved by Bangkok Hospital Hat Yai IT / Information Security / PDPA governance.** If hospital policy requires authenticated access, audit logging, central retention, device controls, or access revocation, deploy the same modular frontend behind an approved internal/authenticated hosting layer rather than public GitHub Pages.

## Operational controls recommended
- Use hospital-managed devices and approved browsers.
- Do not place exported case JSON files in uncontrolled personal/cloud locations.
- Define an approved folder/retention process for exported case files if real patient data is used.
- Review clinical algorithm/version changes before deployment.
- Require CI to pass before merging to the production branch.
- Complete pharmacist UAT after every clinical-rule change.

## Not a medical-device certification statement
The software implements decision-support algorithms and validation guardrails. A successful software build does not itself constitute regulatory, clinical-governance, PDPA, or medical-device approval.

## Drug Database PIN (v1.0.3)

The Drug Database administration PIN protects only local browser editing actions. It is not server-side authentication, RBAC or cryptographic access control. The PIN is stored as a salted SHA-256 hash; the clear-text PIN is not persisted. Clearing browser storage can remove the local PIN and local database overrides.

Drug Database localStorage contains non-patient master-data changes only. HN, diagnoses, medication exposure, ADR events, Naranjo assessments and pharmacist conclusions remain excluded from persistent browser storage.

CSP allows `connect-src 'self'` solely so the application can fetch `assets/data/drug-master.json` from the same GitHub Pages origin. External application endpoints remain disallowed.
