# Changelog

## 1.0.3 — 2026-09-11

### Drug Database & Medication UX
- Added a separate **Drug Database** workspace tab so master-data administration does not interrupt the pharmacist clinical workflow.
- Built `assets/data/drug-master.json` from `Drug list Update 10092026.xls` using the source `GenercName` field directly: 1,568 source rows, 1,505 rows with Generic name, 1,053 unique Generic names.
- Medication **Generic name** is now an editable searchable combobox (`datalist`). A name not present in the database can still be entered and saved as `nameSource: manual`.
- Database-selected medication names store `drugDatabaseId` and `nameSource: database` in the case JSON.
- Added Route and Frequency suggestion lists while retaining free-text entry.
- Drug database search also uses source product display names, item codes and TMT codes as search context.

### Drug Database administration
- Read-only by default.
- Local administrator can create a 4–8 digit PIN on first use, then must enter the correct PIN to add/edit/remove database entries.
- PIN is stored only as a salted SHA-256 hash in browser localStorage; unlock state is session-only and auto-locks after 10 minutes.
- Add/Edit/Remove operations are stored as local non-patient overrides; the shipped master JSON remains read-only on GitHub Pages.
- Added Export changes, Import changes, Export merged database, Restore/Remove entries, and Reset local changes.
- The PIN is an accidental-edit guard only, not authentication or a security boundary on a static GitHub Pages app.

### Clinical integrity fixes
- Editing Medication or ADR Event now marks linked Final Pharmacist Conclusions as **Needs Review**, in addition to Naranjo and optional modules.
- Editing Naranjo answers/rationales marks an existing linked Final Conclusion as **Needs Review**.
- Final Conclusion can only be added/edited when the linked Naranjo assessment is Complete.
- Final Print validation blocks a stale `conclusion_needs_review` result.
- Confirming Naranjo review now refuses to make an assessment current when the drug is no longer Suspected.

### Security / deployment
- CSP `connect-src` changed from `none` to `self` only to load the local static drug-master JSON. External application connections remain blocked.
- Patient clinical case data remains memory-only; only language preference and non-patient Drug Database admin/override settings use localStorage.

### Tests
- Production build passes 30 automated tests.
- Added tests for source Drug Database counts, manual Generic-name entry, and local override merge behavior.
