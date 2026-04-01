import Fuse from "fuse.js";
import { MEDICATION_NAMES } from "../data/medicationDatabase";

const fuse = new Fuse(MEDICATION_NAMES, {
  threshold: 0.4,
  distance: 100,
  includeScore: true,
});

/**
 * Returns a suggested correction if the medication name is a likely typo,
 * or null if it's an exact match or no good match is found.
 */
export function validateMedicationName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return null;

  // Exact match (case-insensitive) → no suggestion needed
  const exactMatch = MEDICATION_NAMES.find(
    (n) => n.toLowerCase() === trimmed.toLowerCase()
  );
  if (exactMatch) return null;

  const results = fuse.search(trimmed);
  if (results.length > 0 && results[0].score! < 0.35) {
    return results[0].item;
  }

  return null;
}
