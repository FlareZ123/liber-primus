"use strict";

/**
 * Exhaustive, key-free word-local period-five additive GP inverse.
 *
 * Proposed model:
 *   tentative_i = (plaintext_i + K[i mod 5]) mod29
 * for five entirely unknown runic key symbols per word. The generator may
 * also use the already-proposed LP2 collision repair: when tentative equals
 * prior published rune, with probability q publish T(C[i-6]) at word positions
 * >=6 or one of 28 different symbols at word positions <6.
 *
 * Instead of guessing K, intersect its EXACT admissible residue sets for
 * every index congruent mod 5. Each visible rune admits one tentative value
 * C_i; it additionally admits previous published C_(i-1) only when the
 * particular repair mechanism can have produced the visible rune.
 *
 * The matcher is a complete exact decision procedure for the declared model
 * conditional on the candidate GP-English source word, even when repairs
 * occurred. There is no beam width, language scoring or key search.
 *
 * Reproduce: node sims/word_period5_unknown_key_exact_inverse.cjs
 * @module word_period5_unknown_key_exact_inverse
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const ROOT = path.resolve(__dirname, "..");
const RAW = fs.readFileSync(path.join(ROOT,
  "resources/lp2-transcription.txt"), "utf8");
const LEX_SOURCE = fs.readFileSync(path.join(ROOT,
  "resources/control/english_wordfreq_textblob.txt"), "utf8");
const SHAKESPEARE = fs.readFileSync(path.join(ROOT,
  "resources/control/shakespeare_first300k.txt"), "utf8");
const CORPUS = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const RUNE_ID = new Map(CORPUS.runes.map((rune, i) => [rune, i]));
const GP_ROMAN = new Map(CORPUS.translit.map((letters, i) => [letters, i]));
const PAGES = CORPUS.pages.filter(p => p.status === "unsolved" && p.indices.length);
const WORDS = parseSharedCorpus().words.map(w => [...w.runes].map(r => {
  const id = RUNE_ID.get(r);
  assert.notEqual(id, undefined);
  return id;
}));
assert.equal(WORDS.length, 2896);
assert.equal(PAGES.length, 55);
assert.deepEqual(WORDS.flat(), PAGES.flatMap(p => p.indices));

const LONG_MIN = 10;
const SEED = 0x5533a771;
const TRIALS = 120;
const Q = 0.81;

/** @param {number} x GP index. */
function mod(x) { return (x % 29 + 29) % 29; }
/** @param {number} x GP index. */
function T(x) { return mod(24 - 2 * x); }
/** @param {number} seed Positive nonzero PRNG seed. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return s >>> 0;
  };
}
/**
 * Approximate GP-English transliteration with source-concordant digraphs.
 * @param {string} spelling Latin A-Z uppercase.
 * @returns {number[] | null}
 */
function encode(spelling) {
  const src = spelling.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < src.length;) {
    const pair = GP_ROMAN.get(src.slice(i, i + 2));
    if (pair !== undefined) {
      out.push(pair); i += 2;
    } else {
      const single = GP_ROMAN.get(src[i]);
      if (single === undefined) return null;
      out.push(single); i++;
    }
  }
  return out;
}

/** One candidate spelling per unique GP sequence and length. */
function loadLexicon() {
  const entries = new Map();
  for (const line of LEX_SOURCE.split(/\r?\n/)) {
    const match = /^([a-z]+) (\d+)$/.exec(line);
    if (!match) continue;
    const gp = encode(match[1]);
    if (!gp || gp.length < 7) continue;
    const signature = gp.join(",");
    if (!entries.has(gp.length)) entries.set(gp.length, new Map());
    const group = entries.get(gp.length);
    const prior = group.get(signature);
    const count = Number(match[2]);
    if (!prior || prior.count < count) {
      group.set(signature, {spelling: match[1], gp, count});
    }
  }
  const result = new Map([...entries].map(([length, group]) =>
    [length, [...group.values()]]));
  assert.ok(result.get(10).length > 1500);
  assert.ok(result.get(11).length > 1100);
  return result;
}

/**
 * Exact key-feasibility test. The five key values are independent unknowns,
 * but each phase must be consistent across all corresponding rune positions.
 *
 * At a word-start, previous published ciphertext is inherited from preceding
 * whole word, making this test more permissive than any word-state reset.
 *
 * For positions <6, a replacement can publish any rune except prior visible,
 * so tentative==prior is a valid alternative whenever C differs from prior.
 * At positions >=6, that same candidate is possible only if the observed
 * rune equals T(C[i-6]).
 *
 * @param {number[]} c Published whole ciphertext word.
 * @param {number[]} p Candidate plaintext GP word of same length.
 * @param {number} previous Last published rune in the preceding word, or -1.
 * @returns {{feasible:boolean,masks:number[],choices:number[]}}
 */
function fitUnknownKey(c, p, previous) {
  assert.equal(c.length, p.length);
  const masks = Array(5).fill((1 << 29) - 1);
  for (let i = 0; i < c.length; i++) {
    let allowed = 1 << mod(c[i] - p[i]);
    const prev = i > 0 ? c[i - 1] : previous;
    if (prev >= 0 && c[i] !== prev &&
        (i < 6 || c[i] === T(c[i - 6]))) {
      allowed |= 1 << mod(prev - p[i]);
    }
    masks[i % 5] &= allowed;
    if (!masks[i % 5]) {
      return {feasible: false, masks, choices: []};
    }
  }
  const choices = masks.map(mask => {
    let total = 0;
    for (let i = 0; i < 29; i++) total += Number(Boolean(mask & (1 << i)));
    return total;
  });
  return {feasible: true, masks, choices};
}

/**
 * All dictionary-compatible source words, with no key inferred from other
 * words, no source-language scoring and no heuristic candidate pruning.
 * @param {number[][]} observed
 * @param {Map<number,Array<{spelling:string,gp:number[],count:number}>>} lex
 * @param {number} minLength
 */
function scan(observed, lex, minLength = LONG_MIN) {
  const rows = [];
  let prior = -1;
  for (let index = 0; index < observed.length; index++) {
    const c = observed[index];
    if (c.length >= minLength) {
      const matches = [];
      for (const entry of lex.get(c.length) || []) {
        const check = fitUnknownKey(c, entry.gp, prior);
        if (check.feasible) {
          matches.push({spelling: entry.spelling, count: entry.count,
            keyChoices: check.choices});
        }
      }
      rows.push({wordIndex: index, length: c.length, rune0Absent: !c.includes(0),
        candidateCount: matches.length,
        topCandidates: matches.sort((a,b)=>b.count-a.count).slice(0,5)});
    }
    prior = c.at(-1);
  }
  return {
    checkedWords: rows.length,
    wordsWithCandidates: rows.filter(x => x.candidateCount).length,
    rune0Absent: rows.filter(x => x.rune0Absent).length,
    rune0AbsentWithCandidates: rows.filter(x =>
      x.rune0Absent && x.candidateCount > 0).length,
    byLength: Array.from({length: 8}, (_, i) => {
      const length = 7 + i;
      const slice = rows.filter(x=>x.length===length);
      return {length, checked: slice.length,
        lexiconSize: (lex.get(length) || []).length,
        matches: slice.filter(x => x.candidateCount).length};
    }).filter(x=>x.checked),
    matches: rows.filter(x => x.candidateCount),
    maximumCandidates: Math.max(0, ...rows.map(x => x.candidateCount))
  };
}

/** @param {number} initialRaw Unsigned. @param {number} previous Rune. */
function different(initialRaw, previous) {
  const rank = initialRaw % 28;
  return rank >= previous ? rank + 1 : rank;
}

/**
 * Generate valid period-five-key ciphertext for a real GP-English source.
 * Also supports independent-per-rune pad as the no-period null. Save the
 * true source and unknown key vectors strictly for planted assertions.
 * @param {number[][]} plaintext
 * @param {"period5"|"iid"} mode
 * @param {()=>number} random
 */
function encipher(plaintext, mode, random) {
  const output = [];
  const secrets = [];
  let previous = -1, rewriteCount = 0, longRewrites = 0;
  for (const p of plaintext) {
    const key = Array.from({length: 5}, () => random() % 29);
    const word = [];
    for (let i = 0; i < p.length; i++) {
      const pad = mode === "period5" ? key[i % 5] : random() % 29;
      const tentative = mod(p[i] + pad);
      let actual = tentative;
      if (previous >= 0 && tentative === previous &&
          random() / 4294967296 < Q) {
        if (i >= 6) actual = T(word[i - 6]);
        else actual = different(random(), previous);
        rewriteCount++;
        if (p.length >= LONG_MIN) longRewrites++;
      }
      word.push(actual);
      previous = actual;
    }
    output.push(word);
    secrets.push(key);
  }
  return {output, secrets, rewriteCount, longRewrites};
}

/**
 * Source-disjoint GP-English plant preserving the manuscript's exact word
 * lengths. Use last 60k Shakespeare characters where available, and lexicon
 * entries for rare lengths absent from the trailing sample.
 * @param {Map<number,Array<{spelling:string,gp:number[],count:number}>>} lex
 * @param {()=>number} random
 */
function sampleHeldout(lex, random) {
  const held = new Map();
  for (const spelling of SHAKESPEARE.slice(240000).toUpperCase()
    .match(/[A-Z]+/g) || []) {
    const gp = encode(spelling);
    if (!gp) continue;
    if (!held.has(gp.length)) held.set(gp.length, []);
    held.get(gp.length).push(gp);
  }
  let fallbackWordCount = 0, longWordsInLexicon = 0;
  const originals = WORDS.map(w => {
    const pool = held.get(w.length);
    if (pool?.length) return pool[random() % pool.length].slice();
    const known = lex.get(w.length);
    if (!known?.length) {
      fallbackWordCount++;
      return w.map(() => random() % 29);
    }
    fallbackWordCount++;
    return known[random() % known.length].gp.slice();
  });
  for (const p of originals) {
    if (p.length < LONG_MIN) continue;
    if ((lex.get(p.length) || []).some(entry =>
      entry.gp.length === p.length &&
      entry.gp.every((x,i) => x === p[i]))) longWordsInLexicon++;
  }
  return {plaintext: originals, fallbackWordCount, longWordsInLexicon};
}

/** @returns {object} */
function run() {
  const lex = loadLexicon();
  const sourceCounts = {
    unsolvedCiphertextRunes: 12956, unsolvedPhysicalPages: PAGES.length,
    canonicalWholeWords: WORDS.length,
    englishGPDictionaryTypes: [...lex.values()].reduce((n,a)=>n+a.length,0),
    originalTranscriptSHA256: createHash("sha256").update(RAW).digest("hex"),
    wordFrequencySourceSHA256: createHash("sha256").update(LEX_SOURCE).digest("hex")
  };
  const original = scan(WORDS, lex);
  const length9 = scan(WORDS, lex, 9);
  assert.equal(original.checkedWords, 109);
  assert.equal(original.wordsWithCandidates, 0);
  assert.equal(original.rune0Absent, 73);
  assert.equal(length9.checkedWords, 187);
  assert.equal(length9.wordsWithCandidates, 13);

  const draw = rng(SEED);
  const plant = sampleHeldout(lex, draw);
  const period5 = encipher(plant.plaintext, "period5", draw);
  for (let i = 0; i < WORDS.length; i++) {
    const prev = i === 0 ? -1 : period5.output[i-1].at(-1);
    const fit = fitUnknownKey(period5.output[i],plant.plaintext[i],prev);
    assert.equal(fit.feasible, true,
      "True period5 word/key not in exact candidate set at word " + i);
    for (let phase = 0; phase < 5; phase++) {
      assert.ok(fit.masks[phase] & (1 << period5.secrets[i][phase]));
    }
  }
  assert.ok(period5.longRewrites > 5, "Plant lacks genuine long-word rewrites");
  const synthetic = scan(period5.output, lex);
  assert.ok(synthetic.wordsWithCandidates >= plant.longWordsInLexicon,
    "Actual planted GP-English dictionary sources were not recovered");

  const nullScores = [];
  for (let trial = 0; trial < TRIALS; trial++) {
    const independent = encipher(plant.plaintext, "iid", draw);
    nullScores.push(scan(independent.output, lex).wordsWithCandidates);
  }
  const summary = {
    tests: TRIALS,
    seed: "0x" + SEED.toString(16),
    empiricalNullMax: Math.max(...nullScores),
    empiricalNullMean: nullScores.reduce((a,b)=>a+b,0)/TRIALS,
    pNullAtLeastOriginal: (nullScores.filter(x=>
      x>=original.wordsWithCandidates).length+1)/(TRIALS+1),
    // Original is zero: this is a *power* test, not a discovery p value.
    nullPositiveCounts: nullScores.filter(x=>x>0).length
  };
  return {hypothesis:"Unknown independent 5-rune additive key in every word, arbitrary exact T collision rewrites allowed",sourceCounts,
    original:{length10Plus:original, length9Plus:{
      checkedWords:length9.checkedWords,
      wordsWithCandidates:length9.wordsWithCandidates,
      matchedWords:length9.matches.filter(x=>x.length===9),
      byLength:length9.byLength}},
    syntheticPositive:{
      heldoutShakespeareCharacters:60000,sourceFallbackWords:plant.fallbackWordCount,
      trueLongWordsInBroadLexicon:plant.longWordsInLexicon,
      rewriteCount:period5.rewriteCount,
      longRewrites:period5.longRewrites,
      exactTrueSourceKeyCoverage:"2896/2896",
      matchedLongWords:synthetic.wordsWithCandidates,
      totalLongWords:synthetic.checkedWords},
    independentPadNull:summary,
    conclusion:"The exact unknown-period5 key family fails to yield any source-word candidate for the 109 original length>=10 rune words, even permitting any physically possible specified T collision rewrites. Test has strong positive reconstruction conditional on English lexicon coverage, not a general disproof of all hidden plaintext languages."};
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {encode, loadLexicon, fitUnknownKey, scan,
  different, encipher, sampleHeldout, run};
