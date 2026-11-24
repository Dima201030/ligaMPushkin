/** Lightweight Pairly UUID contract checks (no test runner required). */
import assert from "node:assert/strict";

function normalizeUuid(value) {
  return (value ?? "").trim().toLowerCase();
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value) {
  const s = normalizeUuid(value);
  return s.length === 36 && UUID_RE.test(s);
}

function uuidsEqual(a, b) {
  const na = normalizeUuid(a);
  const nb = normalizeUuid(b);
  if (!na || !nb) return false;
  return na === nb;
}

assert.equal(
  normalizeUuid("  A1B2C3D4-E5F6-4789-A012-3456789ABCDE "),
  "a1b2c3d4-e5f6-4789-a012-3456789abcde",
);
assert.equal(isUuid("a1b2c3d4-e5f6-4789-a012-3456789abcde"), true);
assert.equal(isUuid("not-a-uuid"), false);
assert.equal(
  uuidsEqual(" A1B2C3D4-E5F6-4789-A012-3456789ABCDE ", "a1b2c3d4-e5f6-4789-a012-3456789abcde"),
  true,
);
assert.equal(uuidsEqual("", ""), false);
assert.equal(uuidsEqual(null, "a1b2c3d4-e5f6-4789-a012-3456789abcde"), false);

console.log("uuid-selftest: ok");
