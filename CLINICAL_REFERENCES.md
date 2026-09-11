# Clinical references and implementation notes

This file documents the principal sources used to review calculator logic. The web app is decision support and does not replace local policy, specialist assessment, or clinical judgement.

## Naranjo ADR Probability Scale
- Naranjo CA, Busto U, Sellers EM, et al. *A method for estimating the probability of adverse drug reactions.* Clin Pharmacol Ther. 1981;30(2):239-245.
- LiverTox / NCBI Bookshelf: Naranjo Adverse Drug Reaction Probability Scale.
- Implementation note: Question 3 uses discontinuation or a specific antagonist; dose increase/decrease is handled in Question 8. Classification is withheld until all 10 questions are answered.

## PEN-FAST
- Trubiano JA, Vogrin S, Chua KYL, et al. Development and Validation of a Penicillin Allergy Clinical Decision Rule. JAMA Intern Med. 2020;180(5):745-752. doi:10.1001/jamainternmed.2020.0403
- Original low-risk cutoff: score <3. The Melbourne cohort NPV was 96.3% (95% CI 94.1%-97.8%).
- Yuenyongviwat A, Wedchakama K, Sangsupawanich P, Koosakulchai V. External validation of the PEN-FAST clinical decision rule in children with reported penicillin allergy. Asian Pac J Allergy Immunol. 2026. doi:10.12932/AP-210226-2237
- Thai pediatric validation: NPV 95.8%, AUC 0.62; authors concluded that routine pediatric use may require refinement. The app therefore shows a pediatric caution and never auto-orders a challenge.

## RegiSCAR DRESS validation score
- Kardaun SH, Sidoroff A, Valeyrie-Allanore L, et al. Variability in the clinical pattern of cutaneous side-effects of drugs with systemic symptoms: does a DRESS syndrome really exist? Br J Dermatol. 2007;156(3):609-611.
- Implemented bands: <2 no case; 2-3 possible; 4-5 probable; >=6 definite.
- Eosinophilia thresholds are presented as the published absolute/percentage categories; interpretation should account for the leukocyte-count context used by RegiSCAR.

## ALDEN for SJS/TEN
- Sassolas B, Haddad C, Mockenhaupt M, et al. ALDEN, an algorithm for assessment of drug causality in Stevens-Johnson syndrome and toxic epidermal necrolysis: comparison with case-control analysis. Clin Pharmacol Ther. 2010;88(1):60-68. doi:10.1038/clpt.2009.252
- Six parameters: delay, drug presence in body, prechallenge/rechallenge, dechallenge, drug notoriety, other causes.
- Range -12 to +10; <0 very unlikely, 0-1 unlikely, 2-3 possible, 4-5 probable, >=6 very probable.
- Drug notoriety and drug-presence assumptions are deliberately clinician-selected, not guessed from the drug name.

## Schumock & Thornton preventability
- Schumock GT, Thornton JP. Focusing on the preventability of adverse drug reactions. Hosp Pharm. 1992;27(6):538.
- This prototype implements the commonly cited original 7-question approach. Any Yes -> Preventable. To avoid falsely classifying incomplete data as Not preventable, all seven must be No for a Not preventable result; otherwise the app reports Unable to determine.

## v1.0 production implementation safeguards
- RegiSCAR percentage eosinophil thresholds are shown specifically in the leukocyte <4,000/µL context; the raw published score is preserved and the UI separately flags the number of Unknown inputs.
- ALDEN scoring fields have no positive HTML defaults. Missing any of the six scoring parameters returns `Incomplete` rather than treating missing data as zero.
- The ALDEN date helper is informational only for a first-exposure chronology; prior same-drug reaction changes the latency categories, so the pharmacist must explicitly confirm the latency criterion.
- Optional calculator results remain decision support and never overwrite Naranjo or Final Pharmacist Conclusion.
