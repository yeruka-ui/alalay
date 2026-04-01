# Prescription OCR Improvements

## 1. Editable Medication Cards
- [ ] Wire up the "Edit" button on `MedicationCard` to allow inline editing of name, dosage, time, and instructions
- [ ] Add save/cancel controls when editing
- [ ] Update state in `prescription_camera.tsx` when edits are saved

## 2. Two-Pass OCR Approach
- [ ] Pass 1: Extract raw text from the image ("extract all visible text exactly as written")
- [ ] Show raw text to the user for review/correction before proceeding
- [ ] Pass 2: Send corrected raw text to Gemini for structured JSON extraction
- [ ] Add a "Looks good" / "Edit text" step between the two passes

## 3. Medication Name Validation
- [ ] Fuzzy-match extracted medication names against a known drug database (e.g. RxNorm, OpenFDA)
- [ ] Suggest corrections for likely typos (e.g. "Parcetamol" → "Paracetamol")
- [ ] Show suggestions to the user for confirmation

## 4. Confidence Flagging
- [ ] Ask Gemini to include a `confidence` field ("low", "medium", "high") per medication
- [ ] Visually highlight low-confidence cards (e.g. different border/color)
- [ ] Prompt the user to review low-confidence entries

## 5. Manual Entry Fallback
- [ ] Add an "Add medication manually" button on the results screen
- [ ] Create a form for manual medication entry (name, dosage, time, instructions)
- [ ] Append manually added medications to the existing list
