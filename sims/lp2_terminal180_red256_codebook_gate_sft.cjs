'use strict';

/**
 * Source-bound terminal256 red-event codebook inversion gate.
 *
 * All 225 original red rune events + all 31 physical 13-dot glyphs form
 * a 256-event tape. This tests whether any arbitrary fixed mapping from
 * rune identity / dot type to a byte can encrypt the known p56+p57 180
 * GP29 symbols, under the p50 32x8 table's source-natural interior layouts.
 *
 * Even an *arbitrary reordering* of all 256 event objects cannot expand a
 * deterministic symbol-to-byte lookup beyond the number of distinct source
 * event identities. This is an unconditional pigeonhole exclusion for the
 * specified bytewise consumers, independent of every secret codebook value.
 *
 * Run: node sims/lp2_terminal180_red256_codebook_gate_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(base, 'resources/liber-primus', p), 'utf8'));
const source = read('lp2-corpus.json');
const annotations = read('lp2-ink-annotations.json');
const bytes = read('lp2-grid-256.json').bytes;
assert.equal(bytes.length, 256);
const pages = new Map(source.pages.map(p => [p.page, p]));

// All-red-runes + all 13-dot-glyphs (size-based identity, independent of ink).
// A black p7 13-dot is allowed the same secret key byte as a red 13-dot.
const tape = [];
for (const page of annotations.pages.slice().sort((a, b) => a.page - b.page)) {
  const original = pages.get(page.page);
  assert.ok(original);
  const current = [];
  let ordinal = 0;
  for (const [offset, size] of page.large_punctuation || []) {
    if (size === 13) current.push({ offset, order: 0, ordinal: ordinal++, label: 'DOT13' });
  }
  for (const span of page.red_spans || []) {
    const printed = [...span.runes];
    assert.equal(printed.length, span.length);
    for (let j = 0; j < span.length; j++) {
      const offset = span.start + j;
      const gp = original.indices[offset];
      assert.equal(source.runes[gp], printed[j]);
      current.push({ offset, order: 1, ordinal: ordinal++, label: 'R' + gp });
    }
  }
  current.sort((a, b) => a.offset - b.offset || a.order - b.order || a.ordinal - b.ordinal);
  tape.push(...current.map(x => x.label));
}
assert.equal(tape.length, 256);
assert.equal(tape.filter(x => x === 'DOT13').length, 31);
assert.equal(tape.filter(x => x.startsWith('R')).length, 225);
assert.equal(new Set(tape).size, 30);

// Exact authentic p56 forward cipher inversion (one plaintext-F bypass at 56).
const c56 = pages.get(56).indices;
const p57 = pages.get(57).indices;
let sievePrime = [];
for (let n = 2; sievePrime.length < 85; n++) {
  let ok = true;
  for (let f = 2; f * f <= n; f++) {
    if (n % f === 0) { ok = false; break; }
  }
  if (ok) sievePrime.push(n);
}
let cursor = 0;
const p56 = c56.map((v, i) => i === 56 ? 0
  : ((v - (sievePrime[cursor++] - 1) + 2900) % 29));
assert.equal(cursor, 84);
assert.equal(p56.length + p57.length, 180);
const plainText = v => v.map(x => source.translit[x]).join('');
assert.equal(plainText(p56), 'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE');

/** @returns {number[]} */
function perimeterFirstSpiral() {
  const positions = [];
  let top = 0, bottom = 31, left = 0, right = 7;
  while (top <= bottom && left <= right) {
    for (let x = left; x <= right; x++) positions.push(top * 8 + x);
    top++;
    for (let y = top; y <= bottom; y++) positions.push(y * 8 + right);
    right--;
    if (top <= bottom) {
      for (let x = right; x >= left; x--) positions.push(bottom * 8 + x);
      bottom--;
    }
    if (left <= right) {
      for (let y = bottom; y >= top; y--) positions.push(y * 8 + left);
      left++;
    }
  }
  return positions;
}
const positions = perimeterFirstSpiral();
assert.equal(positions.length, 256);
assert.equal(new Set(positions).size, 256);
const outer = positions.slice(0, 76);
const inner = positions.slice(76);
const rows = [], columns = [];
for (let y = 1; y < 31; y++) for (let x = 1; x < 7; x++) rows.push(y * 8 + x);
for (let x = 1; x < 7; x++) for (let y = 1; y < 31; y++) columns.push(y * 8 + x);
assert.deepEqual(new Set(inner), new Set(rows));

/** @param {number} a @param {number} b @param {'xor'|'minus'|'plus'} op */
function operation(a, b, op) {
  return op === 'xor' ? (a ^ b) : op === 'minus' ? ((a - b) & 255) : ((a + b) & 255);
}
const tests = [];
for (const [layout, indices] of [
  ['row', rows], ['column', columns], ['spiral', inner],
  ['reverse-spiral', inner.slice().reverse()]
]) {
  for (const [p56Input, known] of [
    ['plaintext', [...p56, ...p57]], ['ciphertext', [...c56, ...p57]]
  ]) {
    for (const op of ['xor', 'minus', 'plus']) {
      const key = indices.map((cell, i) => operation(bytes[cell], known[i], op));
      tests.push({
        layout, p56Input, op,
        distinctRequiredKeyValues: new Set(key).size
      });
    }
  }
}
assert.equal(tests.length, 24);
const minDistinct = Math.min(...tests.map(x => x.distinctRequiredKeyValues));
const maxDistinct = Math.max(...tests.map(x => x.distinctRequiredKeyValues));
assert.equal(minDistinct, 119);
assert.equal(maxDistinct, 138);
assert.ok(minDistinct > 32); // 29 possible runes + at most 3 dot-type classes.

// Recovered-plaintext positive: a *secret*, arbitrary 30-symbol codebook,
// a fully original-shaped 256-cell table, 76 withheld planted target runes,
// and the same 180 true known terminal runes. Infer codebook from interior
// alone, then decode every unknown perimeter rune exactly.
const distinct = [...new Set(tape)];
const secret = new Map(distinct.map((label, i) => [label, (131 * i + 19) & 255]));
const planted55 = p57.slice(0, 76);
const allPlain = [...planted55, ...p56, ...p57];
const synthetic = new Array(256);
for (let i = 0; i < 256; i++) {
  synthetic[positions[i]] = secret.get(tape[i]) ^ allPlain[i];
}
const decodedSecret = new Map();
for (let i = 0; i < 180; i++) {
  const label = tape[76 + i];
  const keyByte = synthetic[inner[i]] ^ allPlain[76 + i];
  if (decodedSecret.has(label)) assert.equal(decodedSecret.get(label), keyByte);
  decodedSecret.set(label, keyByte);
}
assert.equal(decodedSecret.size, 30);
const recovered55 = outer.map((cell, i) => synthetic[cell] ^ decodedSecret.get(tape[i]));
assert.deepEqual(recovered55, planted55);
console.log('PASS 225 red rune + 31 source 13-dot tape: 256 events, 30 distinct symbol classes');
console.log('PASS p56 85/85 solved + clear p57 95 original GP29 runes');
console.log('PASS blinded 76-rune p55 plant recovered exactly from the 180 known plaintext runes using ONLY the 30-byte secret codebook');
console.log('ORIGINAL ' + JSON.stringify({ candidateByteConsumers: 24, knownInputRunes: 180,
  maxEventClasses: 32, sourceClassA: distinct.length, minDistinct, maxDistinct,
  tests }));
console.log('DECISION: every tested bytewise table/known-terminal receiver requires at least 119 key byte values; no fixed 29-rune/13-dot source-event codebook, even arbitrarily reordered, can encode it.');
