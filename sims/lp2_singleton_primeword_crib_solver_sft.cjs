"use strict";

/**
 * Source-original LP2 one-rune-word crib constraints on a specified
 * affine nth-prime word-clock generator.
 *
 * Conditional model: C_i = P_i + a*prime(word_ordinal+1) + b (mod 29).
 * The clock is fixed by authentic printed word order; every rune in a
 * printed word uses the same key value. The primary model restarts the
 * ordinal at the nine original decorated chapter starts and permits
 * different (a,b) in each chapter. Global word ordinal is a separately
 * preregistered no-reset control. A/I (and separately A/I/O) is a
 * hypothesized plaintext constraint, not an authenticated plaintext.
 *
 * This is deliberately a narrowly scoped additive original-input gate:
 * it cannot reject general prime-based ciphers, F-dependent key pointers,
 * ciphertext-dependent skips, nonadditive mappings or altered word breaks.
 *
 * Run: node sims/lp2_singleton_primeword_crib_solver_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const text = read("resources/liber-primus/lp2-transcription.txt");
const idx = new Map(corpus.runes.map((rune, i) => [rune, i]));
const CHAPTER_START_PAGES = [0, 3, 8, 15, 23, 27, 33, 40, 54];
const mod29 = n => ((n % 29) + 29) % 29;

/** @typedef {{cipher:number,page:number,local:number,absolute:number,chapter:number,chapterWord:number,pageWord:number}} RunePosition */
/** @typedef {{runes:RunePosition[],chapter:number,wordIndex:number,chapterWord:number,pageWord:number}} Word */

/**
 * Original boundaries: '/' is only line wrap; '%' is only a physical-page
 * boundary (with p50 runeless); ordinary punctuation actually ends a word.
 * A word can continue over a printed page, including its initial key clock.
 * @returns {Word[]}
 */
function originalWords() {
  const pages = text.split("%").slice(0, 55);
  assert.equal(pages.length, 55);
  const words = [];
  /** @type {RunePosition[]} */
  let current = [];
  let sourcePage = 0, local = 0, absolute = 0;
  let chapter = 0, chapterWord = 0, pageWord = 0;
  const finish = () => {
    if (current.length) {
      const first = current[0];
      words.push({
        runes: current, chapter: first.chapter, wordIndex: words.length,
        chapterWord: first.chapterWord, pageWord: first.pageWord
      });
      current = [];
    }
  };
  for (const char of pages.join("%")) {
    if (idx.has(char)) {
      const page = sourcePage >= 50 ? sourcePage + 1 : sourcePage;
      while (chapter + 1 < CHAPTER_START_PAGES.length &&
          page >= CHAPTER_START_PAGES[chapter + 1]) {
        chapter++;
        chapterWord = 0;
      }
      if (!current.length) {
        chapterWord++;
        pageWord++;
      }
      current.push({
        cipher: idx.get(char), page, local: local++, absolute: absolute++,
        chapter, chapterWord: chapterWord - 1, pageWord: pageWord - 1
      });
    } else if (char === "%") {
      sourcePage++;
      local = 0;
      pageWord = 0;
    } else if (char === "/" || /\s/u.test(char)) {
      // A line end, page break or formatting whitespace is not a word break.
    } else {
      finish();
    }
  }
  finish();
  const flat = words.flatMap(w => w.runes.map(r => r.cipher));
  assert.deepEqual(flat, corpus.pages.filter(p => p.page <= 55)
    .flatMap(p => p.indices));
  assert.equal(flat.length, 12956);
  assert.equal(words.length, 2896);
  assert.equal(words.filter(w => new Set(w.runes.map(r => r.page)).size > 1).length, 32);
  assert.equal(words.filter(w => w.runes.length === 1).length, 83);
  return words;
}

/** @returns {number[]} */
function primes() {
  const limit = 30000;
  const composite = new Uint8Array(limit);
  const out = [];
  for (let i = 2; i < limit; i++) {
    if (composite[i]) continue;
    out.push(i);
    if (i * i < limit) {
      for (let k = i * i; k < limit; k += i) composite[k] = 1;
    }
  }
  assert.ok(out.length > 2896);
  return out;
}

const sourceWords = originalWords();
const singletons = sourceWords.filter(w => w.runes.length === 1);
const PRIME = primes();
const allPlain = [24, 10];
const withVocative = [24, 10, 3];

/**
 * @typedef {{cipher:number,page:number,local:number,absolute:number,
 *  chapter:number,wordIndex:number,chapterWord:number,pageWord:number}} Observation
 */

/** @param {number[]|null} ciphertext @returns {Observation[]} */
function observations(ciphertext = null) {
  return singletons.map(w => {
    const r = w.runes[0];
    return {
      cipher: ciphertext === null ? r.cipher : ciphertext[r.absolute],
      page: r.page, local: r.local, absolute: r.absolute,
      chapter: w.chapter, wordIndex: w.wordIndex,
      chapterWord: w.chapterWord, pageWord: w.pageWord
    };
  });
}

/**
 * @param {Observation[]} obs
 * @param {"wordIndex"|"chapterWord"} clock
 * @param {number[]} permitted
 * @returns {{n:number,rank:number,solutions:number,firstZero:number|null,
 *   survivorsByPrefix:number[],witness:Observation[]|null}}
 */
function solve(obs, clock, permitted) {
  let solutions = [];
  for (let a = 0; a < 29; a++) {
    for (let b = 0; b < 29; b++) solutions.push([a, b]);
  }
  const phase = o => PRIME[o[clock]] % 29;
  const distinct = new Set(obs.map(phase));
  const rank = obs.length === 0 ? 0 : distinct.size === 1 ? 1 : 2;
  const counts = [];
  let firstZero = null;
  for (let i = 0; i < obs.length; i++) {
    const o = obs[i], q = phase(o);
    solutions = solutions.filter(([a, b]) =>
      permitted.includes(mod29(o.cipher - a * q - b)));
    counts.push(solutions.length);
    if (solutions.length === 0 && firstZero === null) firstZero = i + 1;
  }
  return {
    n: obs.length, rank, solutions: solutions.length,
    firstZero, survivorsByPrefix: counts,
    witness: firstZero === null ? null : obs.slice(0, firstZero)
  };
}

/**
 * Exact positive controls using a native unencrypted GP29 original manuscript
 * paragraph (clear LP2 p57), cyclically extended to the original 12,956
 * positions; the 83 masked glyphs are explicitly set to A/I. The resulting
 * plant is a controlled GP stream, not a grammatical LP2 plaintext claim.
 * The key is applied at every full original rune position.
 * @param {"wordIndex"|"chapterWord"} clock
 * @param {number} a
 * @param {number} b
 * @returns {{cipher:number[],plain:number[]}}
 */
function plantedStream(clock, a, b) {
  const clear = corpus.pages.find(p => p.page === 57).indices;
  assert.equal(clear.length, 95);
  const n = 12956;
  const plain = Array.from({length:n}, (_,i) => clear[i % clear.length]);
  for (let i = 0; i < singletons.length; i++) {
    plain[singletons[i].runes[0].absolute] = i % 2 === 0 ? 24 : 10;
  }
  const cipher = new Array(n);
  for (const w of sourceWords) {
    const key = mod29(a * PRIME[w[clock]] + b);
    for (const r of w.runes) cipher[r.absolute] = mod29(plain[r.absolute] + key);
  }
  // A separate full original-length inverse, then forward verification.
  const inverse = new Array(n);
  const forward = new Array(n);
  for (const w of sourceWords) {
    const key = mod29(a * PRIME[w[clock]] + b);
    for (const r of w.runes) {
      inverse[r.absolute] = mod29(cipher[r.absolute] - key);
      forward[r.absolute] = mod29(inverse[r.absolute] + key);
    }
  }
  assert.deepEqual(inverse, plain);
  assert.deepEqual(forward, cipher);
  return {cipher, plain};
}

const original = observations();
const byChapter = CHAPTER_START_PAGES.map((p, chapter) => {
  const group = original.filter(o => o.chapter === chapter);
  return {
    chapter, physicalPageStart: p,
    n: group.length, additiveAI: solve(group, "chapterWord", allPlain),
    additiveAIO: solve(group, "chapterWord", withVocative)
  };
});
const global = {
  additiveAI: solve(original, "wordIndex", allPlain),
  additiveAIO: solve(original, "wordIndex", withVocative)
};
assert.equal(original.length, 83);
assert.equal(new Set(original.map(o => o.cipher)).size, 28);
assert.deepEqual(byChapter.map(s => s.n), [5,8,11,18,5,12,9,13,2]);
assert.ok(byChapter.slice(0,8).every(s => s.additiveAI.solutions === 0));
assert.ok(byChapter.slice(0,8).every(s => s.additiveAIO.solutions === 0));
assert.equal(byChapter[8].additiveAI.solutions, 4);
assert.equal(byChapter[8].additiveAIO.solutions, 9);
assert.equal(global.additiveAI.solutions, 0);
assert.equal(global.additiveAIO.solutions, 0);

// Distinct seed controls; no plaintext is taken from the unsolved pages.
const seedControls = [[7, 13], [11, 2]];
for (const clock of ["chapterWord", "wordIndex"]) {
  for (const [a,b] of seedControls) {
    const planted = plantedStream(clock,a,b);
    const plantedObs = observations(planted.cipher);
    const full = solve(plantedObs, clock, allPlain);
    assert.ok(full.solutions >= 1, "native source positive seed must survive");
    const falseSeed = [mod29(a+1), b];
    assert.ok(plantedObs.some(o =>
      !allPlain.includes(mod29(o.cipher -
        falseSeed[0] * (PRIME[o[clock]] % 29) - falseSeed[1]))),
      "wrong independent seed must fail a fixed singleton mask");
    if (clock === "chapterWord") {
      for (let j=0;j<9;j++) {
        const g = plantedObs.filter(o => o.chapter === j);
        assert.ok(solve(g,clock,allPlain).solutions >= 1);
      }
    }
  }
}

const summary = {
  original: {runes:12956,words:sourceWords.length,
    crossPageWords:sourceWords.filter(w =>
      new Set(w.runes.map(r=>r.page)).size>1).length,
    oneRuneWords:original.length,
    distinctOneRuneCipherGlyphs:new Set(original.map(o=>o.cipher)).size},
  model: "C=P+a*p_(word ordinal+1)+b mod29; prime is nth prime; unknown a,b each 0..28",
  primaryClock: "word ordinal restarts at physical pages 0,3,8,15,23,27,33,40,54",
  permittedPlaintext: {AI:allPlain, AIO:withVocative},
  originalChapterCandidates: byChapter.map(x => ({
    chapter:x.chapter, page:x.physicalPageStart, n:x.n,
    rank:x.additiveAI.rank,
    AIsurvivors:x.additiveAI.solutions,
    AIOsurvivors:x.additiveAIO.solutions,
    shortestAIContradiction:x.additiveAI.firstZero,
    shortestAIOContradiction:x.additiveAIO.firstZero,
    originalWitness:x.additiveAIO.witness ?
      x.additiveAIO.witness.map(o => ({
        p:o.page,local:o.local,absolute:o.absolute,
        word:o.chapterWord,primeMod29:PRIME[o.chapterWord]%29,
        cipher:o.cipher
      })) : null
  })),
  originalGlobalWordCandidates: {
    AI:global.additiveAI.solutions,AIO:global.additiveAIO.solutions,
    firstAIContradiction:global.additiveAI.firstZero,
    firstAIOContradiction:global.additiveAIO.firstZero
  },
  unconstrainedIndependentKeyCount: {
    AI:(2n**83n).toString(),AIO:(3n**83n).toString()
  },
  controls: "4 complete 12,956-rune native-source plants, exact forward/inverse, original 83-site mask, true seeds retained and wrong seeds rejected",
  decision: "Eight independently keyed chapters reject this word-prime affine generator even under A/I/O. The terminal two-singleton chapter retains 4 A/I or 9 A/I/O seeds; no key or unknown plaintext recovered. No claim against general evolving or skip-aware ciphers."
};
console.log(JSON.stringify(summary,null,2));
