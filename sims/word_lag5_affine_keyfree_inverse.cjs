"use strict";

/**
 * Exact GP-dictionary inversion for unknown affine five-back feedback with
 * an arbitrary initial five-symbol word pad, and any permitted published
 * ciphertext collision-T rewrites.
 *
 * Word-local i>=5:
 *   X_i = P_i + a*H_(i-5) + b mod29,
 *   H = previous plaintext P or previous published ciphertext C.
 * The two unknown coefficients a,b (mod29) are shared across all words,
 * while their first five tentative cipher runes are independently masked.
 *
 * For each candidate GP-English dictionary word, the fifth-offset output
 * limits b to at most two residues for each possible a. Check every later
 * offset by EXACT observed-vs-repair feasibility, never score partial fits.
 * This tests 29^2 coefficient pairs without a guessed word prefix key.
 *
 * Run with node sims/word_lag5_affine_keyfree_inverse.cjs
 * @module word_lag5_affine_keyfree_inverse
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const {encode, loadLexicon, sampleHeldout} =
  require("./word_period5_unknown_key_exact_inverse.cjs");

const ROOT = path.resolve(__dirname, "..");
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const MAP = new Map(DATA.runes.map((rune, i) => [rune, i]));
const WORDS = parseSharedCorpus().words.map(w => [...w.runes].map(g => {
  const n = MAP.get(g);
  assert.notEqual(n, undefined);
  return n;
}));
const LEX = loadLexicon();
const REPAIR_Q = 0.81;
const SOURCE_SEED = 0x5a7d3311;
const TRUE_ALPHA = 11;
const TRUE_BETA = 17;
const START_LENGTH = 10;
const MOD = 29;
const PARAMETER_COUNT = 29 * 29;
assert.equal(WORDS.length, 2896);
assert.equal(WORDS.flat().length, 12956);

/** @param {number} x GP integer. */
function mod(x) { return ((x % MOD) + MOD) % MOD; }
/** @param {number} x GP integer. */
function T(x) { return mod(24 - 2 * x); }
/** @param {number} seed Nonzero. */
function random32(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return s >>> 0;
  };
}

/**
 * Check if the proposed raw additive rune x could publish original output
 * c_i, given previous output and exactly the T collision-repair model.
 * @param {number[]} cipher One whole ciphertext word.
 * @param {number} pos Word-local offset.
 * @param {number} tentative Hypothetical pre-repair symbol.
 */
function canPublish(cipher, pos, tentative) {
  if (tentative === cipher[pos]) return true;
  const previous = cipher[pos - 1];
  if (tentative !== previous || cipher[pos] === previous) return false;
  if (pos < 6) return true;
  return cipher[pos] === T(cipher[pos - 6]);
}

/**
 * All affine coefficient pairs that exactly admit this candidate plaintext
 * and whole word, treating its first five symbols as unconstrained pad.
 * No random q penalty and any physically possible repair is allowed.
 * @param {number[]} cipher Ciphertext original word, length>=6.
 * @param {number[]} plain GP-encoded dictionary source same length.
 * @param {"plaintext"|"ciphertext"} mode Feedback source at lag five.
 * @returns {number[]} Packed 29*a+b pairs.
 */
function feasiblePairs(cipher, plain, mode) {
  assert.equal(cipher.length, plain.length);
  assert.ok(cipher.length >= 6);
  const history = mode === "plaintext" ? plain : cipher;
  const output = [];
  for (let a = 0; a < MOD; a++) {
    const base = mod(plain[5] + a * history[0]);
    const candidates = [mod(cipher[5] - base)];
    if (canPublish(cipher, 5, cipher[4])) {
      const alternative = mod(cipher[4] - base);
      if (alternative !== candidates[0]) candidates.push(alternative);
    }
    for (const b of candidates) {
      let valid = true;
      for (let i = 6; i < cipher.length; i++) {
        const tentative = mod(plain[i] + a * history[i - 5] + b);
        if (!canPublish(cipher, i, tentative)) {
          valid = false;
          break;
        }
      }
      if (valid) output.push(a * MOD + b);
    }
  }
  return output;
}

/**
 * Count a word at most once for each (a,b) candidate, irrespective of how
 * many GP dictionary source words or repair patterns produce it.
 * @param {number[][]} ciphertext Words on manuscript's 2896-length layout.
 * @param {"plaintext"|"ciphertext"} mode
 * @param {number} minimum
 * @returns {object}
 */
function scan(ciphertext, mode, minimum = START_LENGTH) {
  const votesTrain = new Uint16Array(PARAMETER_COUNT);
  const votesHold = new Uint16Array(PARAMETER_COUNT);
  const byLength = new Map();
  let checked = 0, matched = 0;
  const interesting = [];
  for (let wi = 0; wi < ciphertext.length; wi++) {
    const cipher = ciphertext[wi];
    if (cipher.length < minimum) continue;
    checked++;
    const length = cipher.length;
    const seen = new Uint8Array(PARAMETER_COUNT);
    let sourceCount = 0;
    const named = [];
    for (const entry of LEX.get(length) || []) {
      const possibilities = feasiblePairs(cipher, entry.gp, mode);
      if (possibilities.length) {
        sourceCount++;
        if (named.length < 5) named.push({
          word: entry.spelling, pairs: possibilities.slice(0, 3)});
        for (const pair of possibilities) seen[pair] = 1;
      }
    }
    matched += Number(sourceCount > 0);
    if (!byLength.has(length)) byLength.set(length, {words:0,matched:0});
    const bin = byLength.get(length);
    bin.words++;
    bin.matched += Number(sourceCount > 0);
    if (sourceCount > 0) interesting.push({wordIndex:wi,length,
      plaintextOptions:sourceCount, sample:named});
    const votes = wi < 1448 ? votesTrain : votesHold;
    for (let sig = 0; sig < PARAMETER_COUNT; sig++) votes[sig] += seen[sig];
  }
  const sorted = [...votesTrain.keys()]
    .sort((a,b) => votesTrain[b]-votesTrain[a]);
  const winner = sorted[0];
  const combined = new Uint16Array(PARAMETER_COUNT);
  for(let i=0;i<PARAMETER_COUNT;i++)
    combined[i]=votesTrain[i]+votesHold[i];
  const globalWinner = [...combined.keys()]
    .sort((a,b)=>combined[b]-combined[a])[0];
  return {
    mode,wordsChecked:checked,wordsWithAnyGPSource:matched,
    matchedByLength:Object.fromEntries([...byLength].sort((a,b)=>a[0]-b[0])),
    trainWinner:{alpha:Math.floor(winner/29),beta:winner%29,
      votes:votesTrain[winner],frozenHoldoutVotes:votesHold[winner]},
    globalWinner:{alpha:Math.floor(globalWinner/29),beta:globalWinner%29,
      totalVotes:combined[globalWinner]},
    bestTrainVoteCount:votesTrain[winner],
    bestHoldoutVoteCount:Math.max(...votesHold),
    examples:interesting.slice(0,20),
    votesTrain,votesHold
  };
}

/**
 * Produce GP-English planted authentic source; the first five output symbols
 * have separately random additive pads per word; remaining symbols use
 * hidden global a,b and ciphertext or plaintext feedback.
 * The 81% ciphertext collision-rewrite process carries its previous output
 * through word boundaries. The source and known coefficients are used
 * only for strict positive-control assertions.
 * @param {number[][]} plain
 * @param {"plaintext"|"ciphertext"} mode
 * @param {()=>number} random
 */
function plant(plain, mode, random) {
  let previous = -1, rewrites = 0, longRewrites = 0;
  const cipher = plain.map(source => {
    const result = [];
    const seed = Array.from({length:5},()=>random()%MOD);
    for(let i=0;i<source.length;i++) {
      const key = i < 5 ? seed[i] :
        mod(TRUE_ALPHA*(mode==="plaintext" ?
          source[i-5] : result[i-5])+TRUE_BETA);
      const raw = mod(source[i]+key);
      let published = raw;
      if(previous >= 0 && raw===previous &&
        random()/4294967296 < REPAIR_Q) {
        if(i>=6) published=T(result[i-6]);
        else {
          const rank=random()%28;
          published=rank>=previous ? rank+1 : rank;
        }
        rewrites++;
        if(source.length>=START_LENGTH) longRewrites++;
      }
      result.push(published);
      previous=published;
    }
    return result;
  });
  return {cipher,rewrites,longRewrites};
}

/** @returns {object} */
function run() {
  const dictionaryWords = [...LEX.values()].reduce((n,g)=>n+g.length,0);
  const random = random32(SOURCE_SEED);
  const sample = sampleHeldout(LEX, random);
  const truthCode = TRUE_ALPHA * 29 + TRUE_BETA;
  const output = {hypothesis:"Any global affine five-back plaintext/ciphertext autokey, unknown a and b, initial five runes of every word independently masked, optional exact T collision rewrites",
    ciphertext:{wholeWords:2896,runes:12956,wordLengthAtLeast10:
      WORDS.filter(w=>w.length>=10).length},
    lexiconGPTypes:dictionaryWords,
    originalSHA256:createHash("sha256").update(fs.readFileSync(
      path.join(ROOT,"resources/lp2-transcription.txt"))).digest("hex"),
    seed:"0x"+SOURCE_SEED.toString(16),
    hiddenPositiveCoefficients:{alpha:TRUE_ALPHA,beta:TRUE_BETA},
    modes:{}};
  for (const mode of ["plaintext","ciphertext"]) {
    const real = scan(WORDS,mode);
    const planted = plant(sample.plaintext,mode,random);
    let trueDirectMatches = 0, trueInLex = 0, sourceLong = 0;
    for(let wi=0;wi<planted.cipher.length;wi++){
      const c=planted.cipher[wi],p=sample.plaintext[wi];
      if(c.length<START_LENGTH) continue;
      sourceLong++;
      const possibilities=feasiblePairs(c,p,mode);
      assert.ok(possibilities.includes(truthCode),
        "True source/key impossible for planted word " + wi);
      trueDirectMatches++;
      if((LEX.get(p.length)||[]).some(e=>e.gp.every((x,j)=>x===p[j])))
        trueInLex++;
    }
    const positive = scan(planted.cipher,mode);
    assert.equal(trueDirectMatches,109);
    assert.ok(positive.wordsWithAnyGPSource>=trueInLex);
    assert.ok(positive.votesTrain[truthCode]+positive.votesHold[truthCode] >=
      trueInLex, "True key lost a source-dictionary word");
    assert.equal(positive.globalWinner.alpha,TRUE_ALPHA,
      "Heldout source planted key not ranked first");
    assert.equal(positive.globalWinner.beta,TRUE_BETA);
    output.modes[mode] = {original:{
      wordsChecked:real.wordsChecked,
      wordsWithAnyGPSource:real.wordsWithAnyGPSource,
      matchedByLength:real.matchedByLength,
      trainWinner:real.trainWinner, globalWinner:real.globalWinner,
      bestHoldoutVoteCount:real.bestHoldoutVoteCount,
      examples:real.examples
    }, planted:{
      rewrites:planted.rewrites,
      longRewrites:planted.longRewrites,
      trueLongSourceWordsInLex: trueInLex,
      trueSourceWordsFit: trueDirectMatches,
      wordsWithAnyGPSource:positive.wordsWithAnyGPSource,
      trueKeyTrainVotes:positive.votesTrain[truthCode],
      trueKeyHoldoutVotes:positive.votesHold[truthCode],
      globalWinner:positive.globalWinner
    }};
  }
  return output;
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={feasiblePairs,scan,plant,run};
