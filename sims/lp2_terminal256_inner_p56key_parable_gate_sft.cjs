#!/usr/bin/env node
"use strict";
// Read-only source test. Run: node sims/lp2_terminal256_inner_p56key_parable_gate_sft.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/base60-grid.json"), "utf8"));
const expectedP56 = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const runeTokens = corpus.translit.map((token, index) => ({ token, index })).sort((a, b) => b.token.length - a.token.length);
function encodeGp(text) {
  const out = [];
  for (const word of text.split(/\s+/)) for (let i = 0; i < word.length;) {
    const match = runeTokens.find(x => word.startsWith(x.token, i));
    assert.ok(match, "Unmapped GP spelling at " + word.slice(i));
    out.push(match.index); i += match.token.length;
  }
  return out;
}
function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) if (n % d === 0) { prime = false; break; }
    if (prime) out.push(n);
  }
  return out;
}
function eulerPhi(n) {
  assert.ok(n > 0, "phi(0) is undefined; remove the zero marker first");
  let rest = n, result = n;
  for (let p = 2; p * p <= rest; p++) if (rest % p === 0) {
    while (rest % p === 0) rest /= p;
    result -= result / p;
  }
  if (rest > 1) result -= result / rest;
  return result;
}
function tokenValue(token, alphabet) {
  const a = alphabet.indexOf(token[0]), b = alphabet.indexOf(token[1]);
  assert.ok(a >= 0 && b >= 0, "Token outside radix alphabet: " + token);
  return a * alphabet.length + b;
}
function ringCoordinates(R) {
  const out = [];
  for (let c = R.c0; c <= R.c1; c++) out.push([R.r0, c]);
  for (let r = R.r0 + 1; r <= R.r1; r++) out.push([r, R.c1]);
  for (let c = R.c1 - 1; c >= R.c0; c--) out.push([R.r1, c]);
  for (let r = R.r1 - 1; r > R.r0; r--) out.push([r, R.c0]);
  return out;
}
// orientation = 2*corner + directionBit; corners TL, TR, BR, BL;
// directionBit 0 = clockwise, 1 = counterclockwise.
function orientRing(R, orientation) {
  const coords = ringCoordinates(R), corner = orientation >> 1;
  const direction = (orientation & 1) ? -1 : 1;
  const corners = [[R.r0, R.c0], [R.r0, R.c1], [R.r1, R.c1], [R.r1, R.c0]];
  const [sr, sc] = corners[corner];
  const start = coords.findIndex(([r, c]) => r === sr && c === sc);
  assert.ok(start >= 0);
  return Array.from({ length: coords.length }, (_, j) => coords[(start + direction * j + coords.length) % coords.length]);
}
function conflictCount(inputs, outputs) {
  const seen = new Map(); let conflicts = 0;
  for (let i = 0; i < inputs.length; i++) {
    const x = inputs[i], y = outputs[i];
    if (seen.has(x) && seen.get(x) !== y) conflicts++;
    else seen.set(x, y);
  }
  return conflicts;
}
function scoreEqual(a, b) {
  assert.equal(a.length, b.length);
  let matches = 0;
  for (let i = 0; i < a.length; i++) if (a[i] === b[i]) matches++;
  return matches;
}
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every(row => row.length === 8));
const p56Cipher = corpus.pages.find(p => p.page === 56).indices;
const p56Plain = encodeGp(expectedP56);
const p57Plain = corpus.pages.find(p => p.page === 57).indices;
assert.equal(p56Cipher.length, 85);
assert.equal(p56Plain.length, 85);
assert.equal(p57Plain.length, 95);
const fPositions = p56Plain.map((v, i) => v === 0 ? i : -1).filter(i => i >= 0);
assert.deepEqual(fPositions, [56]);
// Authentic p56 rule: prime-1 mod29, with the literal F at index56 not consuming key.
const key = firstPrimes(84).map(p => (p - 1) % 29);
assert.equal(key.length, 84);
const decodedP56 = []; let keyIndex = 0;
for (let i = 0; i < p56Cipher.length; i++) {
  if (i === 56) decodedP56.push(0);
  else decodedP56.push((p56Cipher[i] - key[keyIndex++] + 29) % 29);
}
assert.equal(keyIndex, 84);
assert.deepEqual(decodedP56, p56Plain, "Authentic p56 prime-totient/F-skip positive control");
const target = [...key, ...p57Plain];
assert.equal(target.length, 179); // 84 consumed key symbols + 95 clear p57 symbols.
const rings = {
  outer: { r0: 1, r1: 30, c0: 1, c1: 6 },
  middle: { r0: 2, r1: 29, c0: 2, c1: 5 },
  inner: { r0: 3, r1: 28, c0: 3, c1: 4 }
};
assert.deepEqual([rings.inner, rings.middle, rings.outer].map(R => ringCoordinates(R).length), [52, 60, 68]);
const innerZeros = [];
for (let r = 1; r <= 30; r++) for (let c = 1; c <= 6; c++) if (grid.rows[r][c] === "00") innerZeros.push([r, c]);
assert.deepEqual(innerZeros, [[28, 5]]); // the other table 00 is on the outer 76-cell perimeter.
const middleZeroPositions = Array.from({ length: 8 }, (_, orientation) => {
  const ring = orientRing(rings.middle, orientation);
  return 52 + ring.findIndex(([r, c]) => r === 28 && c === 5);
});
assert.deepEqual(middleZeroPositions, [81, 83, 78, 86, 111, 53, 108, 56]);
assert.equal(middleZeroPositions.filter(x => x === 56).length, 1);
const MIDDLE_ORIENTATION = 7; // bottom-left, counterclockwise; unique zero/F alignment.
assert.equal(middleZeroPositions[MIDDLE_ORIENTATION], 56);
const alphabets = {
  base60: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx",
  base59: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx".replace("f", "")
};
const mappings = ["mod29", "scaled29", "phi-mod29"];
const outputs = [], lookupConflicts = { base60: [], base59: [] }, residueConflicts = [];
for (const [radix, alphabet] of Object.entries(alphabets)) {
  const values = grid.rows.map(row => row.map(token => tokenValue(token, alphabet)));
  for (let innerOrientation = 0; innerOrientation < 8; innerOrientation++) {
    for (let outerOrientation = 0; outerOrientation < 8; outerOrientation++) {
      const coords = [
        ...orientRing(rings.inner, innerOrientation),
        ...orientRing(rings.middle, MIDDLE_ORIENTATION),
        ...orientRing(rings.outer, outerOrientation)
      ];
      const raw = coords.map(([r, c]) => values[r][c]);
      assert.deepEqual(raw.map((v, i) => v === 0 ? i : -1).filter(i => i >= 0), [56]);
      const nonzero = raw.filter((_, i) => i !== 56);
      assert.equal(nonzero.length, 179);
      lookupConflicts[radix].push(conflictCount(nonzero, target));
      if (radix === "base60") residueConflicts.push(conflictCount(nonzero.map(v => v % 29), target));
      for (const mapping of mappings) {
        const mapped = nonzero.map(v => mapping === "mod29" ? v % 29 :
          mapping === "scaled29" ? Math.floor(v * 29 / 256) : eulerPhi(v) % 29);
        outputs.push({ radix, mapping, innerOrientation, outerOrientation, matches: scoreEqual(mapped, target) });
      }
    }
  }
}
assert.equal(outputs.length, 384);
assert.ok(!outputs.some(x => x.matches === 179));
const maxBy = {};
for (const x of outputs) maxBy[x.radix + "-" + x.mapping] = Math.max(maxBy[x.radix + "-" + x.mapping] || 0, x.matches);
assert.deepEqual(maxBy, {
  "base60-mod29": 7, "base60-scaled29": 14, "base60-phi-mod29": 11,
  "base59-mod29": 11, "base59-scaled29": 11, "base59-phi-mod29": 11
});
const best = outputs.slice().sort((a, b) => b.matches - a.matches)[0];
assert.deepEqual(
  { radix: best.radix, mapping: best.mapping, inner: best.innerOrientation, outer: best.outerOrientation, matches: best.matches },
  { radix: "base60", mapping: "scaled29", inner: 3, outer: 7, matches: 14 }
);
const uniform = outputs.find(x => x.radix === "base60" && x.mapping === "scaled29" && x.innerOrientation === 7 && x.outerOrientation === 7);
assert.equal(uniform.matches, 12);
const rawConflictRange = {};
for (const radix of ["base60", "base59"]) {
  rawConflictRange[radix] = { min: Math.min(...lookupConflicts[radix]), max: Math.max(...lookupConflicts[radix]) };
  assert.deepEqual(rawConflictRange[radix], { min: 46, max: 52 });
}
const residueConflictRange = { min: Math.min(...residueConflicts), max: Math.max(...residueConflicts) };
assert.deepEqual(residueConflictRange, { min: 140, max: 149 });
console.log(JSON.stringify({
  p56PlainRunes: p56Plain.length, p56LiteralFPosition: fPositions[0],
  p56ConsumedPrimeTotientSymbols: key.length, p57ClearRunes: p57Plain.length,
  innerRingLengthsCenterOut: [52, 60, 68], innerZeroCell: innerZeros[0],
  middleRingZeroPositionsByCornerDirection: middleZeroPositions,
  selectedMiddleRingOrientation: "bottom-left counterclockwise",
  targetRegister: "84 p56 prime-totient symbols || 95 clear p57 runes",
  targetLength: target.length, models: outputs.length, bestDirectReadout: best,
  bestByRadixAndMapping: maxBy, uniformBottomLeftCounterclockwiseBase60Scaled29Matches: uniform.matches,
  stationaryRawByteLookupConflicts: rawConflictRange, stationaryBase60Mod29LookupConflicts: residueConflictRange,
  exactReadoutCount: outputs.filter(x => x.matches === 179).length,
  conclusion: "The unique 00/F offset alignment is a conditional structural clue; no tested direct readout decodes the 179-symbol register."
}, null, 2));
