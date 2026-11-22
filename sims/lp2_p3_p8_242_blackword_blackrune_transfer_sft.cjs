'use strict';
/**
 * Original-source GP29 242 black-word -> 242 black-rune transfer test.
 * Node.js 22, Windows 11, CommonJS. Read-only single-file test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const gp = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'lp2-ink-annotations.json'), 'utf8'));
const trans = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8');
const alphabet = new Map(gp.runes.map((r, i) => [r, i]));
const words = trans.split('%').slice(3, 8).join('')
  .replace(/[\n\/&$]/g, '').split(/[-.]/)
  .map((s) => [...s].filter((r) => alphabet.has(r)).map((r) => alphabet.get(r)))
  .filter((w) => w.length > 0);
assert.equal(words.length, 255);
assert.equal(words.flat().length, 1145);
assert.deepEqual(words.flat(), gp.pages.slice(3, 8).flatMap((p) => p.indices));
const offsets = [];
const redOffsets = new Set();
let off = 0;
for (let page = 3; page <= 7; page++) {
  offsets.push(off);
  const annotation = ink.pages.find((p) => p.page === page);
  if (annotation) {
    for (const span of annotation.red_spans || [])
      for (let j = 0; j < span.length; j++) redOffsets.add(off + span.start + j);
  }
  off += gp.pages[page].indices.length;
}
assert.equal(off, 1145);
assert.equal(redOffsets.size, 44);
let cursor = 0;
const blackWords = [];
const redWords = [];
for (let j = 0; j < words.length; j++) {
  const w = words[j];
  const flags = w.map((_, k) => redOffsets.has(cursor + k));
  const everyRed = flags.every(Boolean);
  const everyBlack = flags.every((v) => !v);
  assert(everyRed || everyBlack, 'unexpected word with mixed original inks');
  const entry = { w, page: 3 + offsets.findLastIndex((x) => x <= cursor), originalWord: j };
  (everyRed ? redWords : blackWords).push(entry);
  cursor += w.length;
}
assert.equal(cursor, 1145);
assert.deepEqual([redWords.length, blackWords.length], [13, 242]);
assert.deepEqual(redWords.map((x) => x.originalWord),
  [0, 1, 2, 22, 176, 177, 178, 179, 250, 251, 252, 253, 254]);
const p8 = gp.pages[8].indices;
assert.equal(p8.length, 255);
assert.equal(ink.pages.find((p) => p.page === 8).red_spans[0].length, 12);
assert.equal(p8.at(-1), 12); // Final p8 black rune carries into the first p9 word.
const recipient = p8.slice(12, 254);
assert.equal(recipient.length, 242);
const mod = (x) => ((x % 29) + 29) % 29;
const ioc = (values) => {
  const count = Array(29).fill(0);
  for (const x of values) count[x]++;
  return count.reduce((sum, n) => sum + n * (n - 1), 0) / (values.length * (values.length - 1));
};
const source = blackWords.map(({ w }) => w);
const wordSums = source.map((w) => mod(w.reduce((sum, x) => sum + x, 0)));
const matches = (rhs, shift) => wordSums.reduce((sum, x, j) =>
  sum + Number(x === rhs[(j + shift) % rhs.length]), 0);
const rotations = Array.from({ length: 242 }, (_, shift) => matches(recipient, shift));
assert.equal(rotations[0], 6);
assert.equal(Math.max(...rotations.slice(1)), 18);
assert.equal(rotations.filter((x) => x >= rotations[0]).length, 198);
const residual = recipient.map((x, i) => mod(x - wordSums[i]));
assert(Math.abs(ioc(residual) - 0.03288638935564624) < 1e-14);
const direct = source.filter((w, i) => w.includes(recipient[i])).length;
assert.equal(direct, 36);
// A fixed whole-word -> one-rune code is independently impossible even if
// the secret map is an arbitrary dictionary over entire source words.
const repeats = new Map();
for (let i = 0; i < source.length; i++) {
  const key = source[i].join(',');
  if (!repeats.has(key)) repeats.set(key, []);
  repeats.get(key).push(i);
}
const duplicatePositions = [...repeats.values()].filter((indexes) => indexes.length > 1);
assert.deepEqual(duplicatePositions, [[43, 232], [44, 223], [227, 228]]);
for (const indexes of duplicatePositions)
  assert.notEqual(recipient[indexes[0]], recipient[indexes[1]]);
assert.equal(blackWords[227].page, 7);
assert.equal(blackWords[228].page, 7); // Consecutive identical words on original p7.
// Any global secret map (even nonbijective) needs one common source glyph for
// every output glyph; page-specific maps need common glyph per page and output.
function impossibleGroups(groupName) {
  const groups = new Map();
  for (let i = 0; i < source.length; i++) {
    const key = groupName(blackWords[i], i) + ':' + recipient[i];
    const possible = new Set(source[i]);
    if (groups.has(key)) {
      groups.set(key, new Set([...groups.get(key)].filter((x) => possible.has(x))));
    } else groups.set(key, possible);
  }
  return { groups: groups.size, impossible: [...groups.values()].filter((s) => s.size === 0).length };
}
const global = impossibleGroups(() => 'all');
const page = impossibleGroups((x) => x.page);
assert.deepEqual(global, { groups: 29, impossible: 29 });
assert.deepEqual(page, { groups: 121, impossible: 52 });
const phase5 = impossibleGroups((x, i) => i % 5);
const pagePhase5 = impossibleGroups((x, i) => x.page + ':' + (i % 5));
assert.deepEqual(phase5, { groups: 122, impossible: 49 });
assert.deepEqual(pagePhase5, { groups: 205, impossible: 18 });
// Exact source-shaped positive: arbitrary fixed secret GP29 affine substitution
// applied to one selected rune per word must have zero impossible groups.
const plant = source.map((w) => mod(7 * w[0] + 13));
function positiveCollisionCount(outputs) {
  const groups = new Map();
  for (let i = 0; i < source.length; i++) {
    const key = outputs[i];
    if (!groups.has(key)) groups.set(key, new Set(source[i]));
    else groups.set(key, new Set([...groups.get(key)].filter((x) => source[i].includes(x))));
  }
  return [...groups.values()].filter((s) => s.size === 0).length;
}
assert.equal(positiveCollisionCount(plant), 0);
const base29 = (w, reverse = false) => (reverse ? [...w].reverse() : w)
  .reduce((v, x) => (v * 29 + x) % 243, 0);
assert.equal(new Set(source.map((w) => base29(w))).size, 150);
assert.equal(new Set(source.map((w) => base29(w, true))).size, 149);
// Fixed, reversible two-time-pad hypothesis: each p8 rune is an encrypted
// source-word checksum under a state pad also reused on later page plaintext.
const originalP9 = gp.pages.slice(9, 15).flatMap((p) => p.indices);
const untouchedP13 = gp.pages.slice(13, 15).flatMap((p) => p.indices);
const native = gp.pages[57].indices;
assert.equal(native.length, 95);
// The printed p7 five-red-word products define the existing exact primitive
// GF(3)^5 LFSR. Original 242 intra-page black runes let us use only the
// nonzero 242-state orbit: the p8->p9 carry stays outside this register.
const p7red = gp.pages[7].indices.slice(-14);
const p7RedWords = [p7red.slice(0, 2), p7red.slice(2, 6),
  p7red.slice(6, 9), p7red.slice(9, 11), p7red.slice(11, 14)];
const gf3 = p7RedWords.map((w) => mod(w.reduce((v, x) => v * x, 1)) % 3);
assert.deepEqual(gf3, [2, 2, 2, 0, 2]);
let state = gf3.slice();
const nonzeroStateAddress = [];
for (let i = 0; i < 242; i++) {
  const address = state.reduce((v, x) => 3 * v + x, 0);
  assert(address > 0 && address < 243);
  nonzeroStateAddress.push(address - 1);
  state = [...state.slice(1), gf3.reduce((v, x, j) => v + x * state[j], 0) % 3];
}
assert.deepEqual(state, gf3);
assert.equal(new Set(nonzeroStateAddress).size, 242);
assert.deepEqual(nonzeroStateAddress.slice(0, 5), [235, 222, 183, 66, 202]);
// Two native interpretations of which 242 source-ordered register is
// serialized in GF(3) state order. Use original GP native checksum and heldout.
const gf3Results = [];
for (const [kind, summary] of [
  ['index', wordSums],
  ['prime', source.map((w) => mod(w.reduce((v, x) => v + gp.prime[x], 0)))],
]) {
  for (const direction of ['readTableState', 'readWordsState']) {
    const left = direction === 'readWordsState'
      ? nonzeroStateAddress.map((j) => summary[j]) : summary;
    const right = direction === 'readTableState'
      ? nonzeroStateAddress.map((j) => recipient[j]) : recipient;
    const matches = left.reduce((v, x, j) => v + Number(x === right[j]), 0);
    const key = right.map((v, j) => mod(v - left[j]));
    const originalP9Decoded = originalP9.slice(5, 305)
      .map((v, j) => mod(v - key[j % 242]));
    const originalP13Decoded = untouchedP13.slice(0, 200)
      .map((v, j) => mod(v - key[j % 242]));
    assert.deepEqual(originalP9Decoded.map((v, j) => mod(v + key[j % 242])),
      originalP9.slice(5, 305));
    assert.deepEqual(originalP13Decoded.map((v, j) => mod(v + key[j % 242])),
      untouchedP13.slice(0, 200));
    const solved = Array.from({ length: 300 }, (_, i) => native[i % native.length]);
    const planted = solved.map((v, j) => mod(v + key[j % 242]));
    assert.deepEqual(planted.map((v, j) => mod(v - key[j % 242])), solved);
    const row = { kind, direction, matches, p9: ioc(originalP9Decoded),
      p13: ioc(originalP13Decoded) };
    gf3Results.push(row);
    console.log('GF3 nonzero 242 register: ' + JSON.stringify(row));
  }
}
assert.deepEqual(gf3Results.map((x) => x.matches), [9, 9, 6, 12]);
assert.deepEqual(gf3Results.map((x) => +x.p9.toFixed(12)),
  [0.033065774805, 0.035875139353, 0.033400222965, 0.03723522854]);
assert.deepEqual(gf3Results.map((x) => +x.p13.toFixed(12)),
  [0.036381909548, 0.034824120603, 0.034271356784, 0.03351758794]);
const outputs = [];
for (const [kind, summary] of [
  ['GP-index word sum', wordSums],
  ['GP-prime word sum', source.map((w) => mod(w.reduce((sum, x) => sum + gp.prime[x], 0)))],
]) {
  const key = recipient.map((x, i) => mod(x - summary[i]));
  const decrypt = (cipher, n) => cipher.slice(0, n).map((x, i) => mod(x - key[i % key.length]));
  const p9 = decrypt(originalP9.slice(5), 300); // Preserve actual p8->p9 six-rune carried word.
  const p13 = decrypt(untouchedP13, 200);
  const plantText = Array.from({ length: 300 }, (_, i) => native[i % native.length]);
  const cipherPlant = plantText.map((x, i) => mod(x + key[i % key.length]));
  assert.deepEqual(decrypt(cipherPlant, 300), plantText);
  assert.deepEqual(p9.map((x, i) => mod(x + key[i % key.length])), originalP9.slice(5, 305));
  assert.deepEqual(p13.map((x, i) => mod(x + key[i % key.length])), untouchedP13.slice(0, 200));
  const report = { kind, keyIoc: ioc(key), originalP9Ioc: ioc(p9), untouchedP13Ioc: ioc(p13) };
  outputs.push(report);
  console.log(JSON.stringify(report));
}
assert(Math.abs(outputs[0].originalP9Ioc - 0.034024526198439244) < 1e-14);
assert(Math.abs(outputs[0].untouchedP13Ioc - 0.034522613065326634) < 1e-14);
assert(Math.abs(outputs[1].originalP9Ioc - 0.03422519509476031) < 1e-14);
assert(Math.abs(outputs[1].untouchedP13Ioc - 0.03492462311557789) < 1e-14);
console.log('PASS: 13 red/242 black scroll words, 12 red/242 intra-page black p8 runes, p8 carried rune preserved');
console.log('PASS: direct extraction 36/242, arbitrary global map 29/29 impossible, page-private map 52/121 impossible');
console.log('PASS: 3 repeated whole-word pairs each contradict fixed word-code, including one adjacent pair on p7');
console.log('PASS: secret five-phase chosen-glyph maps 49/122 inconsistent; page-private five-phase maps 18/205 inconsistent');
console.log('PASS: source-red-aware checksum match 6/242; 242-state BASE29 word labels have 150/149 distinct values');
console.log('PASS: source-motivated checksum-pad reuse decrypts zero sustained original plaintext but both genuine-GP plants and original forward replay recover exactly');
console.log('PASS: original p7 GF3 nonzero-state address permutation predicts zero sustained p9 or p13 plaintext under either rigid register order');
