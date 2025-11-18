const NOTE_SEPARATOR = " · ";

const isEmpty = (value) => !value || !value.trim();
const isUnknownLabel = (value) => {
  if (!value) return false;
  const normalized = value.toLowerCase();
  return normalized.includes("bilinmeyen");
};

export const composeNoteWithPartner = (partner, note) => {
  const safePartner = (partner || "").trim();
  const safeNote = (note || "").trim();
  if (safePartner && safeNote) {
    return `${safePartner}${NOTE_SEPARATOR}${safeNote}`;
  }
  if (safePartner) return safePartner;
  return safeNote;
};

export const extractCounterpartyFromNote = (note) => {
  if (isEmpty(note)) return "";
  const [firstPart] = note.split(NOTE_SEPARATOR);
  return firstPart ? firstPart.trim() : "";
};

export const getMovementNoteBody = (note) => {
  if (isEmpty(note)) return "";
  const parts = note.split(NOTE_SEPARATOR);
  if (parts.length <= 1) return "";
  return parts.slice(1).join(NOTE_SEPARATOR).trim();
};

export const getMovementCounterparty = (movement) => {
  if (!movement) return "";
  const fromField = movement.counterparty?.trim();
  if (fromField && !isUnknownLabel(fromField)) {
    return fromField;
  }
  const fromNote = extractCounterpartyFromNote(movement.note);
  if (fromNote) return fromNote;
  if (fromField) return fromField;
  return movement.type === "SATIS" ? "Bilinmeyen Müşteri" : "Bilinmeyen Tedarikçi";
};

