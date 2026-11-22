'use strict';

/**
 * Exact 2014 participant-authored Bach note-number key candidates against
 * untouched LP2 GP29 ciphertext. Run: node sims/lp2_2014_bach_pastebin_key_original_sft.cjs
 *
 * Scope: native GP29 additive inverse, the two historically solved Vigenere
 * signs and global/page-local clocks. Does not assert Cicada authorship.
 */

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const noteText = fs.readFileSync(path.join(root, 'resources/external/cicada2014-bach-pastebin-3T089HUW.txt'), 'utf8');
const mappedText = fs.readFileSync(path.join(root, 'resources/external/cicada2014-bach-pastebin-17h9MhyK.txt'), 'utf8');
const lines = mappedText.split(/\r?\n/);
assert(noteText.includes('Flute 1: G') && noteText.includes('Harpsic: B'));
assert(corpus.pages.length === 58);

function after(label, expectedLength) {
  const line = lines.indexOf(label);
  assert(line >= 0, 'Missing historical participant mapping ' + label);
  const values = lines.slice(line + 1, line + 4).join(' ').trim().split(/\s+/).map(Number);
  assert.equal(values.length, expectedLength);
  assert(values.every(Number.isInteger));
  return values;
}

const primeNums = after('Gematria Primus numbers(corresponding to letters):', 19);
const primeIndices = primeNums.map(value => {
  const index = corpus.prime.indexOf(value);
  assert(index >= 0);
  return index;
});
// Both source notes and the tonal/pitch-class numeric rows contain 20 events.
// GP primes omit the second Flute 2 A; both alphanumeric rows omit the
// second adjacent first-Flute G. The cause of these omissions is unproven.
// Source-constrained complete mappings are tested *alongside* literal 19s.
const prime20 = [...primeNums.slice(0, 14), 97, ...primeNums.slice(14)];
const alpha1 = after('Alphanumeric:', 19);
const alpha0 = after('Alphanumeric-(A=0)', 19);
const alpha1Full20 = [alpha1[0], ...alpha1];
const alpha0Full20 = [alpha0[0], ...alpha0];
assert.equal(prime20.length, 20);
assert.equal(prime20[13], prime20[14]);
assert.equal(alpha1Full20[0], 7);
assert.equal(alpha0Full20[0], 6);

const keysets = [
  ['tonal-scale', after('Tonal-(Scale):', 20)],
  ['tonal-octaves', after('Tonal-(Scale w/octaves):', 20)],
  ['pitch-class', after('Pitch Class:', 20)],
  ['alpha-1', alpha1],
  ['alpha-0', alpha0],
  ['alpha-1-full20-source-repaired', alpha1Full20],
  ['alpha-0-full20-source-repaired', alpha0Full20],
  ['GP-prime-residue', primeNums.map(n => n % 29)],
  ['GP-prime-index', primeIndices],
  ['GP-prime20-repaired-residue', prime20.map(n => n % 29)],
  ['GP-prime20-repaired-index', prime20.map(n => corpus.prime.indexOf(n))],
];
for (const [name, key] of keysets) {
  assert(key.length === 19 || key.length === 20, name + ' has unexpected key length');
  assert(key.every(n => Number.isInteger(n) && n >= 0 && n < 29));
}

const unknown = corpus.pages.filter(x => x.page >= 0 && x.page <= 55);
assert.equal(unknown.reduce((sum, p) => sum + p.indices.length, 0), 12956);
const p55 = unknown.find(p => p.page === 55);
const p27 = unknown.find(p => p.page === 27);
assert.equal(p55.indices.length, 76);
const known = corpus.pages.find(p => p.page === 57).indices;
assert.equal(known.length, 95);

function inverse(pages, key, sign, clock) {
  const out = [];
  let pos = 0;
  for (const page of pages) {
    for (let j = 0; j < page.indices.length; j++, pos++) {
      const phase = clock === 'page' ? j : pos;
      out.push((page.indices[j] + 29 + sign * key[phase % key.length]) % 29);
    }
  }
  return out;
}

function ioc(text) {
  const counts = Array(29).fill(0);
  for (const n of text) counts[n]++;
  return counts.reduce((acc, n) => acc + n * (n - 1), 0) / (text.length * (text.length - 1));
}

function translit(text) {
  return text.map(n => corpus.translit[n]).join(' ');
}

for (const [name, key] of keysets) {
  const plaintext = known;
  const planted = plaintext.map((v, i) => (v + key[i % key.length]) % 29);
  const recovered = inverse([{ indices: planted }], key, -1, 'page');
  assert.deepEqual(recovered, plaintext, name + ' positive control');
}

const tests = [];
for (const [name, key] of keysets) {
  for (const sign of [-1, 1]) {
    for (const clock of ['global', 'page']) {
      const out = inverse(unknown, key, sign, clock);
      tests.push({
        name,
        keyLength: key.length,
        sign,
        clock,
        total: out.length,
        fullIoC: ioc(out),
        p55IoC: ioc(inverse([p55], key, sign, 'page')),
      });
    }
  }
}
tests.sort((a, b) => b.fullIoC - a.fullIoC);

const p27Checks = [];
for (const [name, key] of keysets.filter(([name]) => name.startsWith('GP-prime'))) {
  for (const sign of [-1, 1]) {
    const text = inverse([{ indices: p27.indices.slice(0, 19) }], key, sign, 'page');
    p27Checks.push({ name, sign, original19: translit(p27.indices.slice(0, 19)), recovered19: translit(text) });
  }
}
const maxIoC = tests[0].fullIoC;
console.log(JSON.stringify({
  source: 'Exact archived 3T089HUW and live 17h9MhyK participant text',
  primeNotes: primeNums,
  repaired20FromOtherPublishedRows: prime20,
  repairedAlpha20FromNoteText: { alpha1Full20, alpha0Full20 },
  primeAsGP: translit(primeIndices),
  inputRunes: 12956,
  originalP55Length: 76,
  originalP27HeadingLength: 19,
  clearP57IoC: ioc(known),
  tested: tests.length,
  top8: tests.slice(0, 8),
  maxIoC,
  p27Checks,
}, null, 2));
assert(maxIoC < 0.045, 'An unexpectedly nonuniform inverse requires actual plaintext follow-up');
console.log('SOURCE-KEY GATE: all source-frozen direct additive keys remain ciphertext-like; 95/95 positive plant recovered.');
