"use strict";

/**
 * LP2 original reverse-order two-layer decision.
 *
 * Hypothesis: a strict no-repeat GP29 outer stage (possibly restarted on each
 * original printed word) is FOLLOWED by a conventional GP29 Vigenere keyed
 * stage. The original historical source screen tested the opposite order.
 *
 * For a non-F-transparent last stage, an exact original-plaintext-independent
 * exclusion applies to ALL secret keys of each period 1..28 on p40..p53.
 * For F-transparent last stages, test all 30 source-fixed historic keywords,
 * both signs, all start phases, and both word-reset conventions.
 *
 * Run as a single test on Windows 11:
 * node sims/lp2_layer2_reverse_order_allsecret_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const gp = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(path.join(root, "resources", "lp2-transcription.txt"), "utf8");
const mod = x => (x % 29 + 29) % 29;
const WORDS = [
  "DIVINITY", "FIRFUMFERENFE", "CIRCUMFERENCE", "INSTAR", "EMERGENCE",
  "PRIMALITY", "TOTIENT", "PILGRIM", "CICADA", "LIBERPRIMUS", "INTUS",
  "PARABLE", "KOAN", "WELCOME", "PRIMES", "SACRED", "WISDOM", "INSTRUCTION",
  "WARNING", "TRUTH", "ENLIGHTENED", "CONSUMPTION", "PRESERVATION",
  "ADHERENCE", "DECEPTION", "CIRCUMFERENCES", "SURFACE", "EMERGE",
  "THEPRIMESARESACRED", "AWARNING"
];

/** @returns {{runes:number[], wordStart:boolean[]}} */
function readOriginal() {
  const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
  const runes = [], wordStart = [];
  let nextWord = true;
  for (const ch of transcription) {
    const rune = runeIndex.get(ch);
    if (rune !== undefined) {
      runes.push(rune);
      wordStart.push(nextWord);
      nextWord = false;
    } else if (ch === "-" || ch === ".") {
      nextWord = true;
    }
  }
  const exact = gp.pages.flatMap(page => page.indices);
  assert.deepEqual(runes, exact);
  assert.equal(runes.length, 13136);
  assert.equal(wordStart.slice(0, 12956).filter(Boolean).length, 2896);
  return {runes, wordStart};
}

const source = readOriginal();
const pageGroups = [
  [0,3], [3,8], [8,15], [15,23], [23,28],
  [28,32], [32,40], [40,54], [54,56]
];
const sectionLengths = [729,1145,1729,1903,1255,1078,1801,3008,308];
let cursor = 0;
const chapters = pageGroups.map(([a, b], index) => {
  const len = gp.pages.slice(a, b).reduce((n, page) => n + page.indices.length, 0);
  assert.equal(len, sectionLengths[index]);
  const start = cursor;
  cursor += len;
  return {pages:[a,b-1], start, end:cursor, runes:source.runes.slice(start,cursor),
    words:source.wordStart.slice(start,cursor)};
});
assert.equal(cursor,12956);

/** @param {string} word @returns {number[]} */
function encodeKeyword(word) {
  const order = gp.translit.map((_, i) => i)
    .sort((a, b) => gp.translit[b].length - gp.translit[a].length);
  const aliases = {V:1, K:5, Z:15, Q:5};
  const out = [];
  while (word.length) {
    const rune = order.find(i => word.startsWith(gp.translit[i]));
    if (rune !== undefined) {
      out.push(rune);
      word = word.slice(gp.translit[rune].length);
    } else {
      assert(Object.hasOwn(aliases, word[0]), "unmapped historic keyword: " + word);
      out.push(aliases[word[0]]);
      word = word.slice(1);
    }
  }
  return out;
}

/**
 * For c[i] = q[i] + key[(i + phase0) mod m] and a strict no-repeat q,
 * each original adjacent pair within the SAME word excludes one possible
 * secret key difference at this key phase:
 * key[j] - key[j-1] != c[i] - c[i-1] (mod29).
 * If every one of the 29 differences occurs at phase j, no secret key exists.
 *
 * @param {number[]} c
 * @param {boolean[]} wordStart
 * @param {number} period
 * @returns {{phase:number, positions:number[]}|null}
 */
function saturatedPhaseWitness(c, wordStart, period) {
  const positions = Array.from({length:period}, () => new Map());
  for (let i = 1; i < c.length; i++) {
    if (wordStart[i]) continue;
    const phase = i % period;
    const difference = mod(c[i] - c[i - 1]);
    if (!positions[phase].has(difference)) positions[phase].set(difference, i);
  }
  const phase = positions.findIndex(differences => differences.size === 29);
  if (phase === -1) return null;
  const witness = Array.from({length:29}, (_, d) => positions[phase].get(d));
  assert(witness.every((i, d) => i % period === phase
    && !wordStart[i] && mod(c[i] - c[i-1]) === d));
  return {phase,positions:witness};
}

/**
 * Exact feasibility DP for a fixed final Vigenere keyword. Every initial
 * phase is permitted. The optional native plaintext-F branch emits F without
 * advancing the key; the ordinary branch cannot consume a plaintext-F when
 * that bypass is active. A boundary may reset the earlier anti-repeat layer.
 *
 * @param {number[]} c
 * @param {boolean[]} wordStart
 * @param {number[]} key
 * @param {number} sign
 * @param {boolean} literalF
 * @param {boolean} wordReset
 * @returns {{pass:boolean,prefix:number}}
 */
function invertNoRepeat(c, wordStart, key, sign, literalF, wordReset) {
  let states = Array.from({length:key.length}, (_, phase) => ({phase, last:29}));
  for (let i = 0; i < c.length; i++) {
    const next = new Map();
    for (const state of states) {
      const previous = wordReset && wordStart[i] ? 29 : state.last;
      const candidate = mod(c[i] - sign * key[state.phase]);
      if ((!literalF || candidate !== 0) && candidate !== previous) {
        const phase = (state.phase + 1) % key.length;
        next.set(phase * 29 + candidate, {phase, last:candidate});
      }
      if (literalF && c[i] === 0 && previous !== 0) {
        next.set(state.phase * 29, {phase:state.phase, last:0});
      }
    }
    states = [...next.values()];
    if (!states.length) return {pass:false, prefix:i+1};
  }
  return {pass:true, prefix:c.length};
}

/** @param {number[]} plain @returns {number[]} */
function plantStrictOuter(plain) {
  const q = [];
  let j = 0, last = 29;
  for (const p of plain) {
    let tries = 0, v;
    do {
      v = mod(p + gp.prime[j++ % 29]);
      tries++;
      assert(tries < 100);
    } while (v === last);
    q.push(v);
    last = v;
  }
  return q;
}

/**
 * @param {number[]} intermediate
 * @param {number[]} key
 * @param {number} sign
 * @param {boolean} literalF
 * @param {number} initialPhase
 * @returns {number[]}
 */
function plantFinal(intermediate, key, sign, literalF, initialPhase) {
  let phase = initialPhase;
  return intermediate.map(q => {
    if (literalF && q === 0) return 0;
    const c = mod(q + sign * key[phase]);
    phase = (phase + 1) % key.length;
    return c;
  });
}

// Original p40..p53: all periods from 1 through 28 are independently
// impossible, allowing every possible 29-symbol secret key for each period
// and allowing the strict outer stage to reset at EACH printed word.
const lastLong = chapters[7];
const witnesses = [];
for (let period = 1; period <= 28; period++) {
  const w = saturatedPhaseWitness(lastLong.runes, lastLong.words, period);
  assert(w, "all-secret reverse-layer period unexpectedly possible: " + period);
  witnesses.push({
    period, phase:w.phase,
    witnessSha256:crypto.createHash("sha256").update(w.positions.join(",")).digest("hex")
  });
}

// Sharp necessary-condition frontier: period29 lacks a saturated phase.
// This is NOT evidence of meaningful plaintext or the creator's key length.
assert.equal(saturatedPhaseWitness(lastLong.runes,lastLong.words,29),null);

// Independently assess native bypass with each of 30 historic fixed keywords,
// both additive signs, every starting phase, and both chapter-only/printed-word
// outer anti-repeat restart conventions on ALL nine authentic chapters.
const testRows = [];
const bestWordPrefix = Array(9).fill(0);
const bestStrictPrefix = Array(9).fill(0);
let allComplete = 0;
for (const name of WORDS) {
  const keyword = encodeKeyword(name);
  for (const sign of [1,28]) for (const literalF of [false,true]) {
    for (let section = 0; section < chapters.length; section++) {
      const c = chapters[section];
      const strict = invertNoRepeat(c.runes,c.words,keyword,sign,literalF,false);
      const word = invertNoRepeat(c.runes,c.words,keyword,sign,literalF,true);
      allComplete += Number(strict.pass) + Number(word.pass);
      bestWordPrefix[section] = Math.max(bestWordPrefix[section],word.prefix);
      bestStrictPrefix[section] = Math.max(bestStrictPrefix[section],strict.prefix);
      assert(!strict.pass && !word.pass);
      testRows.push({keyword:name,sign,literalF,section,
        strictPrefix:strict.prefix,wordPrefix:word.prefix});
    }
  }
}
assert.equal(testRows.length, 1080);
assert.equal(allComplete, 0);
assert.deepEqual(bestWordPrefix,[285,200,274,234,225,238,200,231,267]);
assert.deepEqual(bestStrictPrefix,[222,200,208,201,225,158,200,170,220]);

/**
 * Complete exact secret-key enumeration for periods 1..4 with plaintext-F
 * bypass enabled. Cyclic key rotation absorbs every initial phase. Negative
 * and positive signs are both included because every residue is enumerated.
 * The states are (keyword phase, previous intermediate rune), with wordwise
 * first-stage anti-repeat resets; no language model or beam pruning applies.
 *
 * @param {number[]} c
 * @param {boolean[]} wordStart
 * @returns {Array<{period:number,secretKeys:number,passes:number,maxPrefix:number,bestKey:number[]}>}
 */
function exhaustiveSecretFehu(c, wordStart) {
  const results = [];
  for (let period = 1; period <= 4; period++) {
    const secretKeys = 29 ** period;
    const key = new Uint8Array(period);
    const seen = new Uint32Array(period * 30);
    let epoch = 1, maxPrefix = 0, bestKey = [], passes = 0;
    for (let number = 0; number < secretKeys; number++) {
      let v = number;
      for (let j = 0; j < period; j++) {
        key[j] = v % 29;
        v = Math.floor(v / 29);
      }
      let current = [29], next = [], prefix = 0;
      for (let i = 0; i < c.length; i++) {
        next.length = 0;
        epoch++;
        const ci = c[i], reset = wordStart[i];
        for (const token of current) {
          const phase = Math.floor(token / 30);
          const last = reset ? 29 : token % 30;
          const q = mod(ci - key[phase]);
          if (q !== 0 && q !== last) {
            const nextPhase = phase + 1 === period ? 0 : phase + 1;
            const label = nextPhase * 30 + q;
            if (seen[label] !== epoch) {
              seen[label] = epoch;
              next.push(label);
            }
          }
          if (ci === 0 && last !== 0) {
            const label = phase * 30;
            if (seen[label] !== epoch) {
              seen[label] = epoch;
              next.push(label);
            }
          }
        }
        const old = current;
        current = next;
        next = old;
        prefix = i + 1;
        if (!current.length) break;
      }
      if (prefix > maxPrefix) {
        maxPrefix = prefix;
        bestKey = [...key];
      }
      if (prefix === c.length) passes++;
    }
    results.push({period,secretKeys,passes,maxPrefix,bestKey});
  }
  return results;
}

const allSecretFehu = exhaustiveSecretFehu(lastLong.runes,lastLong.words);
assert.equal(allSecretFehu.reduce((n, x) => n + x.secretKeys, 0), 732540);
assert.deepEqual(allSecretFehu.map(x => x.passes), [0,0,0,0]);
assert.deepEqual(allSecretFehu.map(x => x.maxPrefix), [278,278,278,353]);

// Source-native clear p57 plant, both operator orders explicitly implemented.
// The forward generator guarantees an intermediate GP29 stream with no adjacent
// equal output, and both known-key F-bypass and unknown-key period28 receivers
// must admit this original-shaped planted data.
const clear = gp.pages[57].indices;
assert.equal(clear.length,95);
const nativePlain = Array.from({length:3008},(_,i)=>clear[i%clear.length]);
const intermediate = plantStrictOuter(nativePlain);
assert(intermediate.every((x,i)=>i===0||x!==intermediate[i-1]));
const knownKey = encodeKeyword("CIRCUMFERENCE");
const positive = [];
for (const [length,sign,phase] of [[729,1,3],[308,28,2],[3008,1,7]]) {
  const wordStart = lastLong.words.slice(0,length);
  const lastRune = intermediate.slice(0,length);
  const encoded = plantFinal(lastRune,knownKey,sign,true,phase);
  assert(invertNoRepeat(encoded,wordStart,knownKey,sign,true,false).pass);
  assert(invertNoRepeat(encoded,wordStart,knownKey,sign,true,true).pass);
  positive.push({length,sign,phase,accepted:true});
}
for (let m = 1; m <= 4; m++) {
  const key = gp.prime.slice(0,m).map(x=>x%29);
  const planted=plantFinal(intermediate,key,1,true,m-1);
  assert(invertNoRepeat(planted,lastLong.words,key,1,true,true).pass);
}
const hiddenKey28 = gp.prime.slice(0,28).map(x=>x%29);
const secretPlant = plantFinal(intermediate,hiddenKey28,1,false,11);
assert.equal(saturatedPhaseWitness(secretPlant,lastLong.words,28),null);
assert(invertNoRepeat(secretPlant,lastLong.words,hiddenKey28,1,false,true).pass);

// A matched source-original word-geometry null is unnecessary to establish
// an exact unsatisfiable logical constraint. All negative claims are witnessed
// by an original-source pair per GP29 difference, not inferred from scores.
console.log(JSON.stringify({
  scope:"Reverse strict-anti-repeat THEN final GP29 Vigenere on original LP2",
  sourceCorpus:"resources/liber-primus/lp2-corpus.json",
  sourceWords:"resources/lp2-transcription.txt",
  originalCiphertextRunes:12956,
  originalWordCount:2896,
  chapterRunes:sectionLengths,
  secretNoF:{
    sourceSection:"p40-p53, 3008 runes",
    reset:"anti-repeat comparison is exempt at every authentic printed-word start",
    keyClock:"continues across printed words and pages within section",
    periodsExcluded:[1,28],
    firstWithoutSinglePhaseSaturation:29,
    witnesses
  },
  secretLiteralF:{
    fullOriginalSecretKeyEnumeration:true,
    wordBoundaryResets:true,
    bothSignsAndAllStartPhasesByFullKeyEnumeration:true,
    results:allSecretFehu
  },
  knownKeyword:{
    catalog:WORDS.length,
    signs:2,
    Fmodes:2,
    fullOriginalChapterCombinations:testRows.length,
    wordResetAndStrictSubtests:testRows.length*2,
    passingFullChapterSubtests:allComplete,
    bestOriginalPrefixesWordReset:bestWordPrefix,
    bestOriginalPrefixesChapterOnly:bestStrictPrefix
  },
  plantedNativeGP:{
    originalSource:"clear LP2 p57 repeated to native original chapter lengths",
    positives:positive,
    allSecretPeriod28:true
  },
  conclusion:"This reverse serial order is excluded only for strict pre-Vigenere anti-repeat, chapter-continuous final key phase, and the stated keyword/secret-period classes; the original intended cipher and its unknown plaintext remain unsolved."
},null,2));
