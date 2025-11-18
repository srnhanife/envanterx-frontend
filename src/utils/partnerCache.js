const PENDING_KEY = "envanter_pending_partners";
const RESOLVED_KEY = "envanter_movement_partners";
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn("partnerCache read error", err);
    return fallback;
  }
};

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn("partnerCache write error", err);
  }
};

export const addPendingPartner = (entry) => {
  const list = readJson(PENDING_KEY, []);
  list.push(entry);
  writeJson(PENDING_KEY, list);
};

const pruneOldPending = (list) => {
  const cutoff = Date.now() - WINDOW_MS;
  return list.filter((item) => item.createdAt >= cutoff);
};

export const matchPendingPartner = (movement) => {
  if (!movement) return null;
  const productId = movement.product?.id;
  const movementTime = movement.createdAt ? new Date(movement.createdAt).getTime() : Date.now();
  let list = readJson(PENDING_KEY, []);
  list = pruneOldPending(list);
  let matched = null;
  const remaining = [];
  list.forEach((item) => {
    const isMatch =
      !matched &&
      item.type === movement.type &&
      item.productId === productId &&
      item.quantity === Math.abs(movement.quantity || 0) &&
      Math.abs(item.createdAt - movementTime) < WINDOW_MS;
    if (isMatch) {
      matched = item;
    } else {
      remaining.push(item);
    }
  });
  if (matched) {
    writeJson(PENDING_KEY, remaining);
  }
  return matched;
};

export const storeMovementPartner = (movementId, partner) => {
  if (!movementId || !partner) return;
  const map = readJson(RESOLVED_KEY, {});
  map[movementId] = { partner, savedAt: Date.now() };
  writeJson(RESOLVED_KEY, map);
};

export const getStoredMovementPartner = (movementId) => {
  if (!movementId) return "";
  const map = readJson(RESOLVED_KEY, {});
  const record = map[movementId];
  return record?.partner || "";
};

