'use strict';

/**
 * Complete original 9×28 quotient-key LFSR rank-exclusion SFT.
 * Node 22 CommonJS, no CLI arguments. Execute:
 * node sims/lp2_q252_28tap_predecessor_escape_sft.cjs
 *
 * All positions, including the special EA escape, consume one clock.
 * Each visible chapter begins with a literal first rune, then starts
 * the 28-element register at its 2nd rune.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const source = read('resources/liber-primus/lp2-corpus.json');
const grid = read('resources/liber-primus/lp2-grid-256.json');
const orig = source.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(orig.length, 12956);
const cuts = [0, 729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
const f = [12, 17, 11, 21, 23]; // 2013 H · p39 G, high-first
const mod = (x, n) => ((x % n) + n) % n;
const bytes = grid.pages.flatMap(p => p.bytes);
assert.equal(bytes.length, 256);
assert.equal(
  crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'
);
const work = bytes.map(x => x % 29), q = [];
for (let i = 0; i < 252; i++) {
  const z = mod(work[i] * 17, 29); // 12^-1 = 17 mod29
  q.push(z);
  for (let t = 0; t < 5; t++) work[i+t] = mod(work[i+t] - z*f[t], 29);
}
assert.deepEqual(work.slice(-4), [0,0,0,0]);
assert.equal(q.length, 252);
assert.equal(q[0], 0);

/**
 * @param {number[]} row exactly 28 coefficients and seed symbols
 * @param {number} n number of generated key digits
 * @param {number} field 29 or rank-domain 28
 * @param {boolean} reverse reverse source-order taps, preserve initial seed
 * @returns {number[]}
 */
function extend(row, n, field, reverse) {
  assert.equal(row.length, 28);
  const taps = reverse ? [...row].reverse() : row;
  const k = row.map(x => x % field);
  while (k.length < n) {
    let x = 0;
    for (let t = 1; t <= 28; t++)
      x = mod(x + (taps[t-1] % field) * k[k.length-t], field);
    k.push(x);
  }
  return k.slice(0, n);
}

/**
 * The conditional alphabet has 28 outputs distinct from predecessor, and
 * one EA=28 escape that repeats the predecessor. This is a 29-way bijection.
 * @param {number[]} page plaintext or original ciphertext
 * @param {number[]} key clock for its non-initial positions
 * @param {'sorted'|'cyclic'} rule
 * @param {-1|1} sign
 * @param {boolean} encrypt
 * @returns {number[]}
 */
function transduce(page, key, rule, sign, encrypt) {
  assert.equal(page.length, key.length + 1);
  const result = [page[0]];
  for (let i = 1; i < page.length; i++) {
    const previous = encrypt ? result[i-1] : page[i-1];
    const token = page[i];
    const k = key[i-1] % 28;
    let rune;
    if (encrypt) {
      if (token === 28) rune = previous;
      else {
        const rank = mod(token - sign*k, 28);
        rune = rule === 'sorted'
          ? (rank >= previous ? rank+1 : rank)
          : mod(previous+1+rank, 29);
      }
    } else {
      const rank = token === previous ? 28
        : rule === 'sorted'
          ? token - (token > previous ? 1 : 0)
          : mod(token - previous, 29)-1;
      rune = rank === 28 ? 28 : mod(rank + sign*k, 28);
    }
    assert.ok(Number.isInteger(rune) && rune >= 0 && rune <= 28);
    result.push(rune);
  }
  return result;
}

/** @param {number[]} input */
function ioc(input) {
  const hist = Array(29).fill(0);
  for (const r of input) hist[r]++;
  return hist.reduce((sum,n)=>sum+n*(n-1),0)/(input.length*(input.length-1));
}
const native = Array.from({length:orig.length}, (_,i) => source.pages[57].indices[i%95]);
assert.equal(source.pages[57].indices.length,95);
const results = [];
for (const field of [29,28]) for (const reverse of [false,true])
  for (const sign of [-1,1]) for (const rule of ['sorted','cyclic']) {
    const decoded = [];
    const chapters = [];
    let originalRepeats = 0;
    for (let j = 0; j < 9; j++) {
      const n = cuts[j+1]-cuts[j];
      const key = extend(q.slice(j*28,(j+1)*28), n-1, field, reverse);
      const cipher = orig.slice(cuts[j], cuts[j+1]);
      const plain = transduce(cipher, key, rule, sign, false);
      const re = transduce(plain, key, rule, sign, true);
      assert.deepEqual(re,cipher,'original exact re-encryption');
      const nativePlain = native.slice(cuts[j],cuts[j+1]);
      const syntheticCipher = transduce(nativePlain,key,rule,sign,true);
      assert.deepEqual(transduce(syntheticCipher,key,rule,sign,false),nativePlain,
        'authentic original-language synthetic plant exact recovery');
      const repeats = cipher.slice(1).filter((v,i) => v === cipher[i]).length;
      originalRepeats += repeats;
      assert.equal(plain.filter(v => v === 28).length,
        cipher[0] === 28 ? repeats + 1 : repeats,
        'all escaped EA positions are ciphertext repeat positions, except the literal chapter leader');
      chapters.push({chapter:j, sourceRunes:n, candidateIoc:ioc(plain), repeats});
      decoded.push(...plain);
    }
    assert.equal(decoded.length,12956);
    const candidateIoc=ioc(decoded);
    const first=decoded.slice(0,36).map(i=>source.translit[i]).join(' ');
    results.push({field, reverse, sign, rule,
      originalRepeats, candidateIoc, first36:first,
      maxChapterIoc:Math.max(...chapters.map(x=>x.candidateIoc)),
      minChapterIoc:Math.min(...chapters.map(x=>x.candidateIoc)),
      exactSyntheticRecovery:native.length});
  }
assert.equal(results.length,16);
assert.ok(results.every(x=>x.candidateIoc>0.034 && x.candidateIoc<0.036));
console.log(JSON.stringify({
  premise:'source H·G GF29 polynomial quotient 252=9×28 source-boundary self-seeded 28-tap register',
  model:'EA=28 encodes ciphertext repeat; 28 other plaintext GP symbols map bijectively onto 28 non-predecessor ciphertext symbols; first rune literal per chapter',
  originalRunes:orig.length, originalIoc:ioc(orig),
  knownNativePositive:'Repeated original solved p57 GP29 95-rune text, exact whole-book synthetic recovery for all 16 variants',
  results, decision:'NONE_OF_THE_SIXTEEN_SOURCE_FIXED_28TAP_PREDECESSOR_ESCAPED_INVERSIONS_RECOVERS_GP_ENGLISH'
},null,2));
