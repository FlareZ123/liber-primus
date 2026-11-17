'use strict';

/**
 * Original LP2 terminal256 all-secret GP29 event-codebook inverse.
 *
 * Distinct from prior 8-bit byte tests: reduce each printed table value to
 * native Gematria Primus Z/29Z before coupling to the authentic 180 known
 * terminal runes. Fit an arbitrary 30-label hidden source-event codebook,
 * then fit ALL 29 stateful affine GP29 multipliers, without tuning keys.
 *
 * Source-ordered 225 red runes and 31 physical 13-dot marks are the
 * hypothesis, not an established original cipher instruction.
 *
 * Run: node sims/lp2_terminal180_red256_gp29_original_gate_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = path.resolve(__dirname, '..', 'resources/liber-primus');
/** @param {string} p */
const read = p => JSON.parse(fs.readFileSync(path.join(base, p), 'utf8'));
const corpus = read('lp2-corpus.json');
const annot = read('lp2-ink-annotations.json');
const grid = read('lp2-grid-256.json').bytes;
assert.equal(grid.length, 256);
const pages = new Map(corpus.pages.map(x => [x.page, x]));

// First-party physical original event serial order; identify every rune by
// authentic GP29 index, every 13-dot shape as one source-symbol class.
const tape = [];
let countRed = 0, countDots = 0;
for (const page of annot.pages.slice().sort((a, b) => a.page - b.page)) {
  const printed = pages.get(page.page).indices;
  const pageTape = [];
  let serial = 0;
  for (const [offset, numberDots] of page.large_punctuation || []) {
    if (numberDots !== 13) continue;
    pageTape.push({ offset, kind: 0, serial: serial++, type: 'DOT13' });
    countDots++;
  }
  for (const span of page.red_spans || []) {
    assert.equal([...span.runes].length, span.length);
    for (let j = 0; j < span.length; j++) {
      const offset = span.start + j;
      assert.equal([...span.runes][j], corpus.runes[printed[offset]]);
      pageTape.push({ offset, kind: 1, serial: serial++, type: 'R' + printed[offset] });
      countRed++;
    }
  }
  pageTape.sort((a, b) => a.offset - b.offset || a.kind - b.kind || a.serial - b.serial);
  tape.push(...pageTape.map(x => x.type));
}
assert.deepEqual([countRed, countDots, tape.length, new Set(tape).size], [225, 31, 256, 30]);

// Recover the historically authentic 85 known p56 plaintext runes.
const cipher56 = pages.get(56).indices, clear57 = pages.get(57).indices;
const primes = [];
for (let candidate = 2; primes.length < 85; candidate++) {
  let isPrime = true;
  for (let factor = 2; factor * factor <= candidate; factor++) {
    if (candidate % factor === 0) { isPrime = false; break; }
  }
  if (isPrime) primes.push(candidate);
}
let advance = 0;
const clear56 = cipher56.map((v, i) =>
  i === 56 ? 0 : (v - (primes[advance++] - 1) + 2900) % 29);
assert.equal(advance, 84);
assert.equal(clear56.length, 85);
assert.equal(clear57.length, 95);
const translit = x => x.map(i => corpus.translit[i]).join('');
assert.equal(translit(clear56), 'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE');

// 32x8 table's source-natural 76 outside and 180 inside.
const spiral = [];
let top = 0, bottom = 31, left = 0, right = 7;
while (top <= bottom && left <= right) {
  for (let col = left; col <= right; col++) spiral.push(top * 8 + col);
  top++;
  for (let row = top; row <= bottom; row++) spiral.push(row * 8 + right);
  right--;
  if (top <= bottom) {
    for (let col = right; col >= left; col--) spiral.push(bottom * 8 + col);
    bottom--;
  }
  if (left <= right) {
    for (let row = bottom; row >= top; row--) spiral.push(row * 8 + left);
    left++;
  }
}
assert.equal(spiral.length, 256);
const outside = spiral.slice(0, 76), inside = spiral.slice(76);
const rows = [], columns = [];
for (let y = 1; y < 31; y++) for (let x = 1; x < 7; x++) rows.push(y * 8 + x);
for (let x = 1; x < 7; x++) for (let y = 1; y < 31; y++) columns.push(y * 8 + x);
assert.equal(new Set(inside).size, 180);
assert.deepEqual(new Set(inside), new Set(rows));

/** @param {number} n */
const mod29 = n => (n + 2900) % 29;

/**
 * Exact maximum original positions possible under ANY source-type secret
 * GP29 lookup, for one fixed state multiplier. An exact decoder needs
 * every within-type key difference to agree.
 * @param {number[]} key
 * @param {number|null} a
 */
function bestFit(key, a) {
  const frequency = new Map();
  for (let j = a === null ? 0 : 1; j < key.length; j++) {
    const label = tape[76 + j];
    const derived = a === null ? key[j] : mod29(key[j] - a * key[j - 1]);
    let values = frequency.get(label);
    if (!values) { values = new Map(); frequency.set(label, values); }
    values.set(derived, (values.get(derived) || 0) + 1);
  }
  return [...frequency.values()].reduce((score, values) =>
    score + Math.max(...values.values()), 0);
}

const original = [];
for (const [layout, cells] of [
  ['rows', rows], ['columns', columns], ['spiral', inside],
  ['reversed-spiral', inside.slice().reverse()]
]) {
  for (const [p56Register, known] of [
    ['plaintext', [...clear56, ...clear57]],
    ['ciphertext', [...cipher56, ...clear57]]
  ]) {
    for (const op of ['minus', 'plus']) {
      const key = cells.map((pos, i) =>
        mod29(grid[pos] % 29 + (op === 'minus' ? -known[i] : known[i])));
      let strongest = { matches: -1, a: -1 };
      for (let a = 0; a < 29; a++) {
        const matches = bestFit(key, a);
        if (matches > strongest.matches) strongest = { matches, a };
      }
      original.push({
        layout, p56Register, op,
        fixedTypeMatches: bestFit(key, null),
        affineTypeMatches: strongest.matches,
        affineMultiplier: strongest.a
      });
    }
  }
}
assert.equal(original.length, 16);
const maxStatic = Math.max(...original.map(x => x.fixedTypeMatches));
const maxStateful = Math.max(...original.map(x => x.affineTypeMatches));
assert.deepEqual([maxStatic, maxStateful], [46, 52]);

// Full-size original-labelled blind plant with unknown secret GP29 lookup and
// unknown multiplier. Reveal only the real 180 solved/clear GP29 runes;
// reconstruct 76 previously hidden GP29 target runes exactly.
const distinct = [...new Set(tape)];
const secret = new Map(distinct.map((label, i) => [label, (13 * i + 7) % 29]));
const hidden76 = clear57.slice(0, 76);
const wholePlain = [...hidden76, ...clear56, ...clear57];
assert.equal(wholePlain.length, 256);
const secretKey = [11];
for (let i = 1; i < 256; i++) {
  secretKey.push((7 * secretKey[i - 1] + secret.get(tape[i])) % 29);
}
const syntheticTable = new Array(256);
for (let i = 0; i < 256; i++) {
  syntheticTable[spiral[i]] = (wholePlain[i] + secretKey[i]) % 29;
}
const recoveredKnownKey = inside.map((cell, i) =>
  mod29(syntheticTable[cell] - wholePlain[76 + i])
);
const multipliers = [];
for (let a = 0; a < 29; a++) {
  const map = new Map();
  let viable = true;
  for (let j = 1; j < 180; j++) {
    const label = tape[76 + j];
    const value = mod29(recoveredKnownKey[j] - a * recoveredKnownKey[j - 1]);
    if (map.has(label) && map.get(label) !== value) { viable = false; break; }
    map.set(label, value);
  }
  if (viable) multipliers.push({ a, map });
}
assert.equal(multipliers.length, 1);
assert.equal(multipliers[0].a, 7);
assert.equal(multipliers[0].map.size, 30);
const inv7 = 25;
assert.equal((7 * inv7) % 29, 1);
const recoveredWholeKey = new Array(256);
recoveredWholeKey[76] = recoveredKnownKey[0];
for (let i = 75; i >= 0; i--) {
  recoveredWholeKey[i] = mod29(inv7 * (
    recoveredWholeKey[i + 1] - multipliers[0].map.get(tape[i + 1])
  ));
}
const decodedHidden = outside.map((cell, i) =>
  mod29(syntheticTable[cell] - recoveredWholeKey[i])
);
assert.deepEqual(decodedHidden, hidden76);

console.log('PASS authentic p56 85/85 and clear p57 95, source tape 225+31 and 32x8=76+180');
console.log('PASS BLIND native GP29 source-type feedback: unique multiplier7, all30 secret types, recovered 76/76 hidden runes');
console.log('ORIGINAL_GP29 ' + JSON.stringify({ cases: original.length, maxStatic, maxStateful, results: original }));
console.log('DECISION: under source event order, original table reduced mod29 requires >=134/180 static or >=127/179 stateful source-type contradictions in every fixed original register; no p55 plaintext recovered.');
