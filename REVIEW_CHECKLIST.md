# Production UAT Checklist — BHH Drug Allergy Assessment v1.0

## Pharmacist — Core workflow
- [ ] HN, pediatric age (day/month/year), Male/Female และ Visit date ถูกต้อง
- [ ] Diagnosis เพิ่มหลายรายการ + free text ได้
- [ ] Previous allergy history เพิ่ม/แก้ไข/ลบได้
- [ ] Medication หลายรายการ; Suspected/Concomitant ชัดเจน
- [ ] Stop datetime ก่อน Start ถูก reject
- [ ] ADR หลาย event แยกกันได้
- [ ] Severity (Mild/Moderate/Severe) แยกจาก Seriousness
- [ ] Phenotype / Other detail / suspected mechanism เหมาะกับ workflow BHH
- [ ] Outcome, management, objective evidence และ clinical note แสดงในรายงาน
- [ ] Timeline เรียง chronological จริง

## Pharmacist — Naranjo

- [ ] เมื่อยังไม่มี Suspected drug หรือ ADR event ปุ่ม `New assessment` ถูก disable และข้อความบอก prerequisite ถูกต้อง
- [ ] เมื่อมี Suspected drug + ADR event แล้ว สามารถเลือกคู่ Drug × ADR เพื่อเริ่ม Naranjo ได้
- [ ] ประเมินแยก Suspected Drug × ADR Event
- [ ] Concomitant drug สร้าง Naranjo ไม่ได้
- [ ] Yes / No / Unknown แยก semantic ชัดเจน
- [ ] Q3 ไม่มี dose reduction; Q8 เป็น dose-response
- [ ] Q1/Q5/Q7/Q9/Q10 บังคับ rationale
- [ ] ทุก Unknown บังคับ rationale
- [ ] ยังไม่ครบ 10 ข้อ = ไม่มี final classification
- [ ] ≥9 Definite / 5–8 Probable / 1–4 Possible / ≤0 Doubtful
- [ ] แก้ยา/เวลา/ADR source แล้วขึ้น Needs Review
- [ ] Final Pharmacist Conclusion แยกจาก Naranjo และสามารถอธิบาย clinical reasoning ได้

## Pharmacist — Optional modules
### PEN-FAST
- [ ] ใช้เฉพาะ penicillin-allergy history
- [ ] ≤5 ปีหรือ Unknown = +2
- [ ] Anaphylaxis/angioedema หรือ SCAR = +2
- [ ] Treatment required หรือ Unknown = +1
- [ ] <3 แสดง low risk แต่ไม่สั่ง challenge อัตโนมัติ
- [ ] Pediatric caution แสดงในผู้ป่วย <18 ปี

### RegiSCAR
- [ ] Fever, lymph node, atypical lymphocyte, rash extent, DRESS rash pattern, biopsy, organ involvement, resolution, alternative causes ครบ
- [ ] Eosinophil absolute threshold และ % เมื่อ WBC <4,000/µL แสดงถูกต้อง
- [ ] <2 / 2–3 / 4–5 / ≥6 ถูกต้อง
- [ ] ถ้ามี Unknown ระบบแสดง caution ให้ผู้ประเมินเห็น

### ALDEN
- [ ] ใช้เฉพาะ SJS/TEN และประเมินรายยา
- [ ] 6 parameters ครบ
- [ ] ไม่มี scoring default ที่ทำให้คะแนนบวกโดยไม่เลือก
- [ ] Notoriety และ half-life/body presence ต้องเลือกจาก reference ที่เชื่อถือได้
- [ ] incomplete input ไม่ถูกคำนวณเป็น 0
- [ ] <0 / 0–1 / 2–3 / 4–5 / ≥6 classification ถูกต้อง

### Schumock & Thornton
- [ ] 7 questions
- [ ] Yes อย่างน้อย 1 ข้อ = Preventable
- [ ] 7 ข้อ No = Not preventable
- [ ] ไม่มี Yes แต่มี Unknown = Unable to determine

## Developer — Architecture / performance
- [ ] `src/main.js` เป็น composition root; ไม่มี monolithic clinical engine ใน entry file
- [ ] Features แยก Patient/Medication/Event/Timeline/Naranjo/Modules/Conclusion/Report
- [ ] PEN-FAST/RegiSCAR/ALDEN/Schumock โหลดแบบ dynamic import เมื่อใช้งาน
- [ ] CSS source modular และ production ใช้ `assets/styles.css` ที่ build แล้ว
- [ ] Scoped rendering ไม่ redraw ทั้ง app ในทุก input
- [ ] ไม่มี CDN/runtime framework dependency
- [ ] Mobile/desktop layout ไม่มี overflow ที่กระทบการกรอกข้อมูล

## Developer — Integrity / privacy
- [ ] `npm run build` ผ่าน
- [ ] Production CI ผ่าน
- [ ] ไม่มี patient data ใน localStorage/sessionStorage/IndexedDB
- [ ] CSP มี `connect-src 'none'`
- [ ] JSON >5 MB ถูก reject
- [ ] Broken Drug/Event/Naranjo/module/conclusion reference ถูก reject
- [ ] Duplicate Drug × ADR assessment/conclusion ถูก reject
- [ ] Legacy TimeLines ไม่ migrate ambiguous Naranjo
- [ ] Workbench/Naranjo_BHH legacy assessment = Needs Review
- [ ] unsaved case มี beforeunload warning
- [ ] Final Print ถูก block จน core record complete
- [ ] Optional module ไม่เป็น requirement หลักของ Final Print

## Go-live governance
- [ ] BHH clinical owner approved wording/calculator behavior
- [ ] BHH IT/Information Security approved hosting model
- [ ] PDPA process for exported JSON files is defined
- [ ] Production URL and browser/device policy documented

## Modal validation regression (v1.0.2)
- [ ] เปิด Add ADR Event แล้วกด Save โดยเว้นช่องจำเป็น: ข้อความเตือนต้องอยู่ **ภายใน modal** และอ่านได้ชัดเจน
- [ ] ADR / Manifestation, Onset, Severity, Outcome และ Management ต้องมีเครื่องหมาย `*`
- [ ] เมื่อ validation ผิด ช่องที่เกี่ยวข้องต้องถูก highlight และ focus ที่ช่องแรก
- [ ] ทดสอบ validation แบบเดียวกันใน Medication, Allergy History, Final Conclusion และ Optional Clinical Modules
- [ ] เปิด record เดิม แก้ให้ไม่ valid แล้วกด Cancel: ข้อมูลที่บันทึกไว้เดิมต้องไม่เปลี่ยน

## Drug Database UAT (v1.0.3)

- [ ] Switch to Drug Database tab without disturbing current clinical case data.
- [ ] Search `Amoxicillin` and confirm source product records are visible.
- [ ] Add Medication and select a Generic name from the database.
- [ ] Add Medication using a Generic name that is not in the database and confirm it saves as manual entry.
- [ ] Confirm Drug Database editing controls are disabled while locked.
- [ ] First use: create a 4–8 digit PIN; lock; confirm an incorrect PIN cannot unlock; confirm the correct PIN can unlock.
- [ ] Add a local Generic name; confirm it immediately appears in Medication Generic-name suggestions.
- [ ] Edit a master Generic name locally and confirm master source file itself is unchanged.
- [ ] Remove a master Generic locally; enable Show inactive; restore it.
- [ ] Export changes and Export merged DB; verify JSON files contain no patient information.
- [ ] Import previously exported changes after unlocking.
- [ ] Reset local changes and confirm BHH master entries return to baseline.
