/**
 * Exact local GP29 affine and projective repeat crib gate on original LP2.
 * Windows Node 22 single-file test: node sims/lp2_projective_repeat_original_sft.cjs
 * @typedef {{page:number, runic_count:number, indices:number[]}} Page
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
/** @type {Page[]} */
const unknown = corpus.pages.filter(p => p.page <= 55 && p.runic_count > 0);
const clear = corpus.pages.find(p => p.page === 57);
assert.ok(clear && clear.runic_count === 95);
assert.equal(unknown.length, 55);
assert.equal(unknown.reduce((s, p) => s + p.runic_count, 0), 12956);

/** @param {number} x @returns {number} */
function mod(x) { return ((x % 29) + 29) % 29; }
const inverse = Array.from({length: 29}, (_, a) => {
  if (!a) return 0;
  for (let b = 1; b < 29; b++) if (mod(a * b) === 1) return b;
  throw new Error('noninvertible residue ' + a);
});

/**
 * Canonical local fingerprint for a full invertible affine or
 * fractional-linear action over GF(29), with finite input/output symbols.
 * A full 29-rune alphabet permutation is necessarily affine; projective
 * fingerprints generously allow local partial maps with a finite pole.
 * @param {number[]} x
 * @param {number} i
 * @param {number} n
 * @param {'affine'|'projective'} family
 * @returns {string|null}
 */
function signature(x, i, n, family) {
  if (family === 'affine') {
    const [a, b] = x.slice(i, i + 2);
    if (a === b) return null;
    const v = inverse[mod(b - a)];
    return Array.from({length: n - 2}, (_, k) =>
      mod((x[i + 2 + k] - a) * v)).join(',');
  }
  const [a, b, c] = x.slice(i, i + 3);
  if (a === b || a === c || b === c) return null;
  const v = mod((b - c) * inverse[mod(b - a)]);
  return Array.from({length: n - 3}, (_, k) => {
    const y = x[i + 3 + k];
    return y === c ? 29 : mod((y - a) * v * inverse[mod(y - c)]);
  }).join(',');
}

/**
 * Compare original page-local positions against an independent source set.
 * @param {Page[]} targets
 * @param {Page[]} references
 * @param {number} n
 * @param {'affine'|'projective'} family
 * @param {boolean} sameCorpus
 */
function scan(targets, references, n, family, sameCorpus) {
  /** @type {Map<string,Array<{page:number,pos:number,indices:number[]}>>} */
  const index = new Map();
  for (const p of references) {
    for (let i = 0; i + n <= p.indices.length; i++) {
      const s = signature(p.indices, i, n, family);
      if (s === null) continue;
      const hits = index.get(s) || [];
      hits.push({page: p.page, pos: i, indices: p.indices});
      index.set(s, hits);
    }
  }
  const found = [];
  for (const p of targets) {
    for (let i = 0; i + n <= p.indices.length; i++) {
      const s = signature(p.indices, i, n, family);
      if (s === null) continue;
      for (const prev of index.get(s) || []) {
        if (sameCorpus && (prev.page > p.page ||
             (prev.page === p.page && prev.pos >= i))) continue;
        if (sameCorpus && prev.page === p.page && i - prev.pos < n) continue;
        let len = n;
        while (i + len < p.indices.length &&
               prev.pos + len < prev.indices.length &&
               signature(p.indices, i, len + 1, family) ===
                 signature(prev.indices, prev.pos, len + 1, family)) len++;
        found.push({referencePage: prev.page, referenceOffset: prev.pos,
          page: p.page, offset: i, length: len});
      }
    }
  }
  found.sort((a, b) => b.length - a.length || a.referencePage - b.referencePage ||
    a.referenceOffset - b.referenceOffset || a.page - b.page || a.offset - b.offset);
  return found;
}

const affine7 = scan(unknown, unknown, 7, 'affine', true);
const affine8 = scan(unknown, unknown, 8, 'affine', true);
const projective7 = scan(unknown, unknown, 7, 'projective', true);
const projective8 = scan(unknown, unknown, 8, 'projective', true);
const projective9 = scan(unknown, unknown, 9, 'projective', true);
const p57Projective8 = scan(unknown, [clear], 8, 'projective', false);
assert.equal(affine7.length, 1);
assert.deepEqual(affine7[0], {referencePage:13, referenceOffset:20, page:33, offset:183, length:7});
assert.equal(affine8.length, 0);
assert.equal(projective7.length, 101);
assert.equal(projective8.length, 6);
assert.equal(projective9.length, 0);
assert.equal(p57Projective8.length, 0);

/* Independent 12-symbol positive: the local nonlinear map has a pole
 * at 25, so select 12 distinct-window source symbols that omit 25. */
const sample = [0,1,2,3,4,5,6,7,8,9,10,11];
const mapped = sample.map(x => mod((2*x + 3) * inverse[mod(x + 4)]));
assert.equal(signature(sample, 0, 12, 'projective'),
  signature(mapped, 0, 12, 'projective'));
const changed = mapped.slice();
changed[10] = mod(changed[10] + 1);
assert.notEqual(signature(sample, 0, 12, 'projective'),
  signature(changed, 0, 12, 'projective'));
assert.equal(signature(sample, 0, 12, 'affine') ===
  signature(mapped, 0, 12, 'affine'), false);

console.log(JSON.stringify({
  originalRunes: 12956, pageCount: 55,
  affine7: affine7.length, affine8: affine8.length,
  projective7: projective7.length, projective8: projective8.length,
  projective9: projective9.length, p57Projective8: p57Projective8.length,
  length8Pairs: projective8,
  nonlinearPlant: '12/12 exact, one-rune negative rejected'
}, null, 2));
