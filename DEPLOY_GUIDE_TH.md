# คู่มือ Deploy Production — BHH Drug Allergy Assessment v1.0.1

## 1) ตรวจ Build ก่อนขึ้นระบบ
ติดตั้ง Node.js 20+ แล้วเปิด Terminal ในโฟลเดอร์โปรเจกต์

```bash
npm run build
```

ต้องเห็น syntax check ผ่านและ tests ทุกข้อผ่านก่อนนำขึ้น production branch

## 2) สร้าง GitHub Repository
แนะนำชื่อ `BHH_Drug_Allergy_Assessment`

อัปโหลด **ไฟล์และโฟลเดอร์ทั้งหมดภายใน package** ไปที่ root ของ repository โดยต้องเห็น `index.html`, `src/`, `assets/`, `tests/` และ `.github/`

## 3) ตรวจ CI
ไปที่แท็บ **Actions → Production CI** และยืนยันว่า job `verify` ผ่าน

CI จะ rebuild CSS, ตรวจ syntax ของ JavaScript modules และรัน automated tests

## 4) เปิด GitHub Pages
Settings → Pages → Build and deployment → Deploy from a branch

- Branch: `main`
- Folder: `/ (root)`

จากนั้นเปิด URL ที่ GitHub Pages แสดง

## 5) Production UAT บน URL จริง
ใช้ข้อมูลทดสอบที่ไม่ระบุตัวผู้ป่วยก่อน แล้วตรวจอย่างน้อย:

- เพิ่ม Patient / pediatric age / Diagnosis / Allergy History
- เพิ่มยาหลายรายการและ role Suspected/Concomitant
- เพิ่ม ADR หลาย events
- ตรวจ graphical Timeline
- สร้าง Naranjo แยก Drug × ADR และตรวจ Yes/No/Unknown + rationale
- แก้ start/stop/onset หลัง Naranjo complete แล้วตรวจ `Needs Review`
- เปิด PEN-FAST / RegiSCAR / ALDEN / Schumock เพื่อยืนยัน lazy-loaded modules ทำงาน
- ตรวจว่า ALDEN ไม่ยอม Save จนเลือก 6 parameters ครบ
- ตรวจ Copy TH และ Copy EN
- ตรวจ Import/Export JSON round trip
- ตรวจว่า Print ถูก block จน core clinical data complete
- ตรวจ responsive layout บน desktop ที่เภสัชกรใช้จริง

## 6) Data / Privacy
ตัวโปรแกรมไม่ส่ง clinical data ไป backend และไม่บันทึก HN/case data ลง localStorage, sessionStorage หรือ IndexedDB ข้อมูลเคสอยู่ใน memory ของ tab เท่านั้น

**ต้อง Export JSON ก่อน Refresh/ปิด tab** หากต้องการเก็บเคส

ภาษา TH/EN เป็น preference ที่อนุญาตให้เก็บใน localStorage เพราะไม่ใช่ข้อมูลผู้ป่วย

## 7) ก่อนใช้ข้อมูลผู้ป่วยจริง
GitHub Pages ไม่มี application authentication ดังนั้นต้องให้ BHH IT / Information Security / PDPA governance อนุมัติรูปแบบ hosting และกระบวนการเก็บไฟล์ JSON ก่อน routine clinical production

หากนโยบายโรงพยาบาลต้องมี Login/RBAC/Audit log ให้ใช้ source modular ชุดเดียวกันหลัง approved authenticated/internal hosting layer แทน public GitHub Pages

อ่าน `SECURITY.md` และทำ `REVIEW_CHECKLIST.md` ให้ครบก่อน go-live
