'use strict';
/**
 * Experimental original 56-page scan of a finite three-key historically
 * motivated GP29 periodic-key family under a calibrated key-skip filter.
 *
 * The keys are literal words from earlier solved Cicada material:
 * DIVINITY, CIRCUMFERENCE and the provisional p7 matrix READURL readout.
 * No key use in unsolved LP2 is claimed as author-authenticated.
 *
 * This tests a distinct missing condition of rigid-key scans: a discarded
 * key cell on ciphertext-repeat rejection can desynchronize the entire
 * running key. Native full-255-rune encrypted positive controls must be
 * exactly recoverable or the scan must fail.
 *
 * Windows 11, Node22, CommonJS: node sims/lp2_signedwords_keyskip_allpages_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const mod = n => (n % 29 + 29) % 29;
const alphabet = corpus.translit;
const translit = alphabet.map(x => x.toUpperCase());
const gpLongest = [...alphabet].sort((a, b) => b.length - a.length);
const index = new Map(alphabet.map((t, i) => [t, i]));

/** Literal historical Latin/GP orthography, longest GP runes first. */
function parseKey(s) {
  const raw = s.toUpperCase().replace(/V/g, 'U');
  const out = [];
  for (let pos = 0; pos < raw.length;) {
    const rune = gpLongest.find(x => raw.startsWith(x, pos));
    assert(rune, 'Cannot tokenize historical key into GP29');
    out.push(index.get(rune));
    pos += rune.length;
  }
  return out;
}
const keys = [
  {name:'DIVINITY', indices:parseKey('DIVINITY')},
  {name:'CIRCUMFERENCE', indices:parseKey('CIRCUMFERENCE')},
  {name:'READURL-provisional', indices:parseKey('READURL')}
];
assert.deepEqual(keys[2].indices, [4,28,23,1,4,20]);

const q = new Map();
let total = 0;
for (const line of read('resources/control/dukotah_english_quadgrams.txt')
  .split(/\r?\n/u)) {
  const [word, raw] = line.trim().split(/\s+/u);
  const n = Number(raw);
  if (word?.length === 4 && Number.isFinite(n)) {
    q.set(word, n);
    total += n;
  }
}
assert.equal(q.size, 79495);
const grams = new Map([...q].map(([g, n]) =>
  [g, Math.log10(n / total)]));
const floor = Math.log10(0.01 / total);

/** Scoring is Latin English quadgrams over native GP transliteration. */
function advance(tail, rune) {
  let add = 0;
  for (const ch of translit[rune]) {
    tail += ch;
    if (tail.length >= 4) {
      add += grams.get(tail.slice(-4)) ?? floor;
      tail = tail.slice(-3);
    }
  }
  return {tail, add};
}

/** A genuine strict-repeat-rejecting source-native positive encoder. */
function encrypt(P, K, sign, transparentF) {
  let cursor = 0;
  let discarded = 0;
  let prev = null;
  const C = [];
  for (const p of P) {
    if (transparentF && p === 0) {
      C.push(0);
      prev = 0;
      continue;
    }
    for (;;) {
      const output = mod(p + sign * K[cursor++ % K.length]);
      if (output === prev) {
        discarded++;
        continue;
      }
      C.push(output);
      prev = output;
      break;
    }
  }
  return {C, discarded};
}

/** Exact unknown key-position drift. The source words contain no adjacent
 * equal rune symbols; at most one skipped cell is possible for each glyph. */
function decrypt(C, K, sign, transparentF, width) {
  let beam = [{j:0, tail:'', score:0, plain:[], discarded:0}];
  for (let i = 0; i < C.length; i++) {
    const next = [];
    const previous = i ? C[i - 1] : null;
    for (const s of beam) {
      for (const skip of [0,1]) {
        const j = s.j + skip;
        const p = mod(C[i] - sign * K[j % K.length]);
        if (skip && previous !==
          mod(p + sign * K[s.j % K.length])) continue;
        const v = advance(s.tail, p);
        next.push({
          j:j + 1, tail:v.tail,
          score:s.score + v.add - (skip ? 1.1 : 0),
          plain:[...s.plain, p], discarded:s.discarded + skip
        });
      }
      if (transparentF && C[i] === 0) {
        const v = advance(s.tail, 0);
        next.push({
          j:s.j, tail:v.tail, score:s.score + v.add,
          plain:[...s.plain, 0], discarded:s.discarded
        });
      }
    }
    next.sort((a, b) => b.score - a.score);
    beam = next.slice(0, width);
  }
  return beam[0];
}

const native = Array.from({length:255}, (_, i) =>
  corpus.pages[57].indices[i % corpus.pages[57].indices.length]);
const positives = [];
for (const key of keys) {
  assert(key.indices.every((x, i, a) => i === 0 || x !== a[i - 1]));
  for (const sign of [-1, 1]) {
    for (const F of [false,true]) {
      const e = encrypt(native, key.indices, sign, F);
      const d = decrypt(e.C, key.indices, sign, F, 8000);
      const recovered = d.plain.reduce((n, p, i) =>
        n + Number(p === native[i]), 0);
      assert.equal(recovered, 255,
        'Native-English 255-rune plant must be recovered completely');
      positives.push({key:key.name, sign, literalF:F,
        trueDiscarded:e.discarded, exactlyRecovered:recovered,
        scorePerRune:Number((d.score / 255).toFixed(5))});
    }
  }
}
const all = [];
for (const page of corpus.pages) {
  if (page.page > 55 || page.indices.length < 76) continue;
  for (const key of keys) {
    for (const sign of [-1,1]) {
      for (const F of [false,true]) {
        const d = decrypt(page.indices, key.indices, sign, F, 450);
        all.push({page:page.page, length:page.indices.length,
          key:key.name, sign, literalF:F, discarded:d.discarded,
          scorePerRune:Number((d.score / page.indices.length).toFixed(5)),
          prefixGP:d.plain.slice(0, 90).map(x => translit[x]).join('')});
      }
    }
  }
}
const ranked = all.slice().sort(
  (a, b) => b.scorePerRune - a.scorePerRune);
const worstNative = Math.min(...positives.map(x => x.scorePerRune));
console.log(JSON.stringify({
  sourceKeyRings:keys, fullLengthPositiveControls:positives,
  originalPagesScanned:new Set(all.map(x => x.page)).size,
  originalCandidates:all.length,
  bestOriginal:ranked.slice(0,20),
  worstOriginal:ranked.slice(-3),
  nativeWorstScore:worstNative,
  bestOriginalScore:ranked[0].scorePerRune,
  foundAuthenticatedUnknownPlaintext:false,
  caution:'Source-key transfer and key-skip filter are hypotheses. English-only gate; no author-selected keystream demonstrated.'
}, null, 2));
