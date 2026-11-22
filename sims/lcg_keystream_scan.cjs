'use strict';
/**
 * LP2 exhaustive affine-LCG mod-29 additive keystream scan.
 *
 * A key evolves as k[t+1] = (a*k[t] + b) % 29, with the offset t resetting
 * never, per page, or per rune word. The decoded symbol is (c[t]-k[t]) % 29.
 * A pure additive constant rotates the output histogram and leaves its
 * Pearson chi-square unchanged, so affine-equivalent parameter classes
 * are enumerated only once.
 *
 * Node.js 20+, no dependencies or network; run from any working directory:
 *   node sims/lcg_keystream_scan.cjs --selftest
 *   node sims/lcg_keystream_scan.cjs --trials 200
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const ALPHABET_SIZE = 29;
const MODES = ['global', 'page', 'word'];
const PERIODS = [1, 2, 4, 7, 14, 28, 29];

/** @param {number} a @param {number} b */
function mod(a, b = ALPHABET_SIZE) {
  return ((a % b) + b) % b;
}

/** @returns {{pages: Array<Array<{c: number,global: number,page: number,word: number}>>, runeCount:number,wordCount:number}} */
function load() {
  const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
  const transcription = fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');
  const segments = transcription.split('%').slice(0, 55);
  const runeIds = new Map(corpus.runes.map((r, i) => [r, i]));
  const indexedPages = corpus.pages.filter(p => p.status === 'unsolved' && p.indices.length);
  assert.equal(segments.length, 55);
  assert.equal(indexedPages.length, 55);
  let global = 0;
  let word = 0;
  let wordCount = 0;
  let inWord = false;
  const pages = segments.map((segment, j) => {
    const page = [];
    for (const ch of segment) {
      if (runeIds.has(ch)) {
        if (!inWord) {
          wordCount++;
          inWord = true;
        }
        page.push({c: runeIds.get(ch), global: global++, page: page.length, word: word++});
      } else if ('-.$&§'.includes(ch)) {
        inWord = false;
        word = 0;
      }
    }
    assert.deepEqual(page.map(x => x.c), indexedPages[j].indices, 'Rune mismatch on LP2 page ' + indexedPages[j].page);
    return page;
  });
  assert.equal(global, 12956, 'Unexpected unsolved rune total');
  assert.equal(wordCount, 2896, 'Page wraps must not silently split rune words');
  return {pages, runeCount: global, wordCount};
}

/**
 * Full affine LCG classes modulo 29, with offsets factored out of chi-square.
 * For a!=1 and a!=0, write k_t=q+(s-q)*a^t, q=b/(1-a).
 * q merely rotates every decoded label, hence a scan of b=0, s=1..28
 * represents every nonconstant trajectory. a=1 scans the 28 step sizes.
 * a=0 is constant after t=0; scan all 28 distinct first-state offsets.
 * @returns {Array<{a:number,b:number,s:number,period:number,key:number[]}>}
 */
function candidates() {
  const out = [];
  for (let a = 2; a < 29; a++) {
    for (let s = 1; s < 29; s++) {
      let state = s;
      const key = [s];
      let period = 0;
      for (let t = 1; t <= 28; t++) {
        state = mod(a * state);
        if (state === s) {
          period = t;
          break;
        }
        key.push(state);
      }
      assert.ok(PERIODS.includes(period));
      out.push({a, b: 0, s, period, key});
    }
  }
  for (let b = 1; b < 29; b++) {
    out.push({a: 1, b, s: 0, period: 29, key: Array.from({length: 29}, (_, t) => mod(b * t))});
  }
  out.push({a: 1, b: 0, s: 0, period: 1, key: [0]});
  for (let s = 1; s < 29; s++) out.push({a: 0, b: 0, s, period: 0, key: [s, 0]});
  assert.equal(out.length, 813);
  return out;
}

/**
 * @param {Array<Array<{c:number,global:number,page:number,word:number}>>} pages
 * @param {number[]} rotations
 * @param {number} total
 * @returns {{max:number,best:object}}
 */
function scan(pages, rotations, total) {
  const expectation = total / ALPHABET_SIZE;
  const classes = candidates();
  let maximum = -Infinity;
  let best = null;
  for (const mode of MODES) {
    const frequency = new Map();
    for (const period of PERIODS) frequency.set(period, new Uint32Array(period * ALPHABET_SIZE));
    const first = new Uint32Array(ALPHABET_SIZE);
    for (let j = 0; j < pages.length; j++) {
      const page = pages[j];
      const rotation = rotations[j];
      for (let i = 0; i < page.length; i++) {
        const pos = page[i][mode];
        const c = page[(i + rotation) % page.length].c;
        for (const period of PERIODS) frequency.get(period)[ALPHABET_SIZE * (pos % period) + c]++;
        if (pos === 0) first[c]++;
      }
    }
    for (const cls of classes) {
      const hist = new Uint32Array(ALPHABET_SIZE);
      if (cls.period === 0) {
        const base = frequency.get(1);
        for (let c = 0; c < 29; c++) {
          hist[c] = base[c] - first[c] + first[mod(c + cls.s)];
        }
      } else {
        const src = frequency.get(cls.period);
        for (let phase = 0; phase < cls.period; phase++) {
          const off = cls.key[phase];
          for (let c = 0; c < 29; c++) {
            hist[mod(c - off)] += src[ALPHABET_SIZE * phase + c];
          }
        }
      }
      let chiSquare = 0;
      for (const n of hist) chiSquare += (n - expectation) ** 2 / expectation;
      if (chiSquare > maximum) {
        maximum = chiSquare;
        best = {mode, a: cls.a, b: cls.b, s: cls.s, period: cls.period,
          chiSquare: Number(chiSquare.toFixed(6)), decodedMin: Math.min(...hist),
          decodedMax: Math.max(...hist)};
      }
    }
  }
  return {max: maximum, best};
}

/** @param {number} seed */
function prng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function selftest() {
  const key = candidates().find(v => v.a === 2 && v.b === 0 && v.s === 5);
  assert.ok(key);
  let k = 5;
  const plain = [...('BELIEVE NOTHING FROM THIS BOOK EXCEPT WHAT YOU KNOW TO BE TRUE ').repeat(75)]
    .filter(c => c >= 'A' && c <= 'Z').map(c => c.charCodeAt(0) - 65);
  const sample = plain.map((p, i) => {
    const c = mod(p + k);
    const out = {c, global: i, page: i, word: i};
    k = mod(2 * k);
    return out;
  });
  assert.deepEqual(sample.map((x, i) => mod(x.c - key.key[i % key.period])), plain);
  const planted = scan([sample], [0], sample.length);
  assert.ok(planted.max > 1000, 'Known-LCG positive control failed');
  assert.equal(mod(-1), 28);
  return {syntheticLetters: plain.length, plantedBest: planted.best, positiveControlPassed: true};
}

/** @param {number} trials @param {number} seed */
function study(trials = 200, seed = 3301) {
  const corpus = load();
  const none = corpus.pages.map(() => 0);
  const observed = scan(corpus.pages, none, corpus.runeCount);
  const random = prng(seed);
  const maxima = [];
  for (let i = 0; i < trials; i++) {
    const rotations = corpus.pages.map(p => Math.floor(random() * p.length));
    maxima.push(scan(corpus.pages, rotations, corpus.runeCount).max);
  }
  maxima.sort((a, b) => a - b);
  return {
    hypothesis: 'Additive modulo-29 affine-LCG key k[t+1]=a*k[t]+b, no skips',
    keyFamiliesAfterSymmetryReduction: 813,
    resetModes: MODES,
    runePages: corpus.pages.length,
    runeWords: corpus.wordCount,
    runes: corpus.runeCount,
    controls: 'Independent cyclic rune rotations per page; page lengths and symbol contents retained',
    seed, trials, observed: observed.best,
    familywiseP: (1 + maxima.filter(x => x >= observed.max).length) / (trials + 1),
    nullMedian: maxima[Math.floor((trials - 1) * .5)],
    null95: maxima[Math.ceil(trials * .95) - 1],
    null99: maxima[Math.ceil(trials * .99) - 1],
    nullMax: maxima[trials - 1],
    scope: 'Cannot exclude word-dependent nonlinear state, key skips, external keys, or nonsingle-rune plaintext encodings'
  };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) process.stdout.write(JSON.stringify(selftest(), null, 2) + '\n');
  else {
    const i = args.indexOf('--trials');
    const trials = i < 0 ? 200 : Number(args[i + 1]);
    assert.ok(Number.isInteger(trials) && trials > 0 && trials <= 10000);
    process.stdout.write(JSON.stringify(study(trials), null, 2) + '\n');
  }
}
module.exports = {load, candidates, scan, study, selftest};
