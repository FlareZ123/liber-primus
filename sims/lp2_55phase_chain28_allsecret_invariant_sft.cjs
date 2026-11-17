'use strict';

/**
 * All-secret 55-phase chain28 necessary-condition test.
 *
 * Source: LP2 p57 PARABLE yields exactly 55 strict word-interior runes;
 * 55 original LP2 physical pages have encrypted GP29 symbols.
 * Any independent 28-rune bijection at phase (position % 55) preserves
 * same-phase equality after mapping to the 28 nonzero chain steps.
 *
 * SFT: node sims/lp2_55phase_chain28_allsecret_invariant_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length).map(p => p.indices);
const pageLength = pages.map(p => p.length);
assert.equal(pages.length, 55);
assert.equal(pageLength.reduce((a, b) => a + b, 0), 12956);
const mod = (x, n) => (x % n + n) % n;

/**
 * @param {number[][]} sourcePages
 * @param {boolean} pageReset
 * @returns {number[][]}
 */
function differenceToPlain(sourcePages, pageReset) {
  let prev = 0;
  const out = [];
  for (const page of sourcePages) {
    if (pageReset) prev = 0;
    const converted = [];
    for (const c of page) {
      const d = mod(c - prev, 29);
      converted.push(d === 0 ? 28 : d - 1);
      prev = c;
    }
    out.push(converted);
  }
  return out;
}

/**
 * Counts pairs of equal non-reserved symbols at the same 55-phase,
 * conditioned on the nonzero subset (28 symbols). This is invariant
 * under EVERY independent bijection on those 28 symbols in each phase.
 *
 * @param {number[][]} inputPages
 * @param {boolean} pageReset
 */
function phaseStatistic(inputPages, pageReset) {
  const hist = Array.from({ length: 55 }, () => Array(28).fill(0));
  let position = 0, reserved = 0;
  for (const page of inputPages) {
    if (pageReset) position = 0;
    for (const p of page) {
      if (p === 28) reserved++;
      else {
        assert(p >= 0 && p < 28);
        hist[position % 55][p]++;
      }
      position++;
    }
  }
  let totalPairs = 0, equalPairs = 0;
  for (const row of hist) {
    const total = row.reduce((a, b) => a + b, 0);
    totalPairs += total * (total - 1);
    equalPairs += row.reduce((a, b) => a + b * (b - 1), 0);
  }
  return {
    scaled28_ioc: 28 * equalPairs / totalPairs,
    equal_pairs_ordered: equalPairs,
    all_pairs_ordered: totalPairs,
    reserved_count: reserved
  };
}

/**
 * Independent source-key interpretation: all 55 clear-PARABLE interior
 * runes index the 55 rune-bearing physical ciphertext pages, with one
 * arbitrary secret bijection per page throughout that page.
 *
 * @param {number[][]} inputPages
 */
function pageStatistic(inputPages) {
  let allPairs = 0, equalPairs = 0, reserved = 0;
  for (const page of inputPages) {
    const hist = Array(28).fill(0);
    for (const p of page) {
      if (p === 28) reserved++;
      else {
        assert(p >= 0 && p < 28);
        hist[p]++;
      }
    }
    const n = hist.reduce((a, b) => a + b, 0);
    allPairs += n * (n - 1);
    equalPairs += hist.reduce((a, b) => a + b * (b - 1), 0);
  }
  return {
    scaled28_ioc: 28 * equalPairs / allPairs,
    equal_pairs_ordered: equalPairs,
    all_pairs_ordered: allPairs,
    reserved_count: reserved
  };
}

/** @param {number[]} runes */
function partition(runes) {
  let p = 0;
  return pageLength.map(n => {
    const page = runes.slice(p, p + n);
    p += n;
    return page;
  });
}
const nativeMap = new Map(corpus.translit.map((x, i) => [x, i]));
const alias = { K: 'C', Q: 'C', V: 'U', Z: 'S' };
/** @param {string} text */
function toGp29(text) {
  const s = text.toUpperCase().replace(/[^A-Z]/g, '');
  const out = [];
  for (let i = 0; i < s.length;) {
    const pair = s.slice(i, i + 2);
    if (nativeMap.has(pair)) {
      out.push(nativeMap.get(pair));
      i += 2;
    } else {
      const one = alias[s[i]] || s[i];
      if (nativeMap.has(one)) out.push(nativeMap.get(one));
      i++;
    }
  }
  return out;
}

const sourceText = [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt']
];
const originals = {
  continuous: phaseStatistic(differenceToPlain(pages, false), false),
  per_page: phaseStatistic(differenceToPlain(pages, true), true),
  per_page_static: pageStatistic(differenceToPlain(pages, true))
};
const controls = [];
let first = null;
for (const [name, file] of sourceText) {
  const runes = toGp29(read(file));
  for (let start = 0; start + 12956 <= runes.length; start += 12956) {
    const plain = partition(runes.slice(start, start + 12956));
    if (!first) first = plain;
    controls.push({
      name, native_offset: start,
      continuous: phaseStatistic(plain, false),
      per_page: phaseStatistic(plain, true),
      per_page_static: pageStatistic(plain)
    });
  }
}
assert.equal(controls.length, 44);
const min = {
  continuous: Math.min(...controls.map(x => x.continuous.scaled28_ioc)),
  per_page: Math.min(...controls.map(x => x.per_page.scaled28_ioc)),
  per_page_static: Math.min(...controls.map(x => x.per_page_static.scaled28_ioc))
};
assert(Math.abs(originals.continuous.scaled28_ioc - 1.0059917140410457) < 1e-12);
assert(Math.abs(originals.per_page.scaled28_ioc - 0.9974646611801926) < 1e-12);
assert(Math.abs(originals.per_page_static.scaled28_ioc - 1.0028036666356064) < 1e-12);
assert(Math.abs(min.continuous - 1.6359185716198026) < 1e-12);
assert(Math.abs(min.per_page - 1.6382247339355005) < 1e-12);
assert(Math.abs(min.per_page_static - 1.6459615376008665) < 1e-12);
assert(originals.continuous.scaled28_ioc < min.continuous);
assert(originals.per_page.scaled28_ioc < min.per_page);
assert(originals.per_page_static.scaled28_ioc < min.per_page_static);

/**
 * Independent arbitrary per-phase secret bijections. The multiplier is
 * coprime to 28 and the addition depends on the phase. No key is given
 * to the phaseStat invariant; only the source plaintext is used there.
 */
const units28 = [1, 3, 5, 9, 11, 13, 15, 17, 19, 23, 25, 27];
const perm = Array.from({ length: 55 }, (_, phase) =>
  Array.from({ length: 28 }, (_, x) => mod(units28[phase % units28.length] * x + phase * 7 + 3, 28)));
const inv = perm.map(table => {
  const inverse = Array(28).fill(-1);
  for (let i = 0; i < 28; i++) inverse[table[i]] = i;
  assert(inverse.every(x => x >= 0));
  return inverse;
});
function plantAndRecover(plainPages, pageReset, perPageStatic = false) {
  const cipher = [], recovered = [];
  let prev = 0, pos = 0, pageIndex = 0;
  for (const page of plainPages) {
    if (pageReset) { prev = 0; pos = 0; }
    const cPage = [], pPage = [];
    for (const p of page) {
      const phase = perPageStatic ? pageIndex : pos % 55;
      const step = p === 28 ? 0 : 1 + perm[phase][p];
      const c = mod(prev + step, 29);
      const recoveredStep = mod(c - prev, 29);
      const q = recoveredStep === 0 ? 28 : inv[phase][recoveredStep - 1];
      cPage.push(c);
      pPage.push(q);
      prev = c;
      pos++;
    }
    cipher.push(cPage);
    recovered.push(pPage);
    pageIndex++;
  }
  assert.deepEqual(recovered, plainPages, '12,956 exact original-format native GP29 runes must recover');
  const fromCipher = perPageStatic ? pageStatistic(differenceToPlain(cipher, true)) :
    phaseStatistic(differenceToPlain(cipher, pageReset), pageReset);
  const fromPlain = perPageStatic ? pageStatistic(plainPages) :
    phaseStatistic(plainPages, pageReset);
  assert.deepEqual(fromCipher, fromPlain, 'all-secret 55-phase permutation cannot change the statistic');
  return fromCipher;
}
const planted = {
  continuous: plantAndRecover(first, false),
  per_page: plantAndRecover(first, true),
  per_page_static: plantAndRecover(first, true, true)
};
console.log(JSON.stringify({
  original: originals,
  controls: {
    independent_nonoverlapping_windows: controls.length,
    sources: sourceText.map(([name]) => name),
    minimum_native_gp_english: min
  },
  native_GP29_blind_plant: planted,
  conclusion: 'All secret 55-phase periodic and 55-independent-page-static 28-step bijections excluded for ordinary GP-native English'
}, null, 2));
