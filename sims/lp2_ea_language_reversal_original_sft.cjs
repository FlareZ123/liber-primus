"use strict";
/**
 * Original LP2 zero-step/EA feedback gate in three source languages.
 * Preserves source print-word and physical-page boundaries. Tests the
 * precise reversible map C[i]=C[i-1]+K[i]*(P[i]+1) mod29, nonzero K[i],
 * whose exact repeat event denotes plaintext EA, with optional reversal
 * of each plaintext word before ciphering. No unknown key is invented.
 *
 * Windows 11 / Node.js 22 CJS: run this file directly from the repository.
 * Local source corpus only; deterministic, no file writes or dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const sourceEnglish = read("resources/control/english_wordfreq_textblob.txt");
const sourceLatin = read("resources/control/latin-vulgate-gp-wholewords.txt");
const sourceOldEnglish = JSON.parse(read(
  "resources/control/beowulf_oe_gp_profile_corrected.json"));
const index = new Map(gp.runes.map((r, i) => [r, i]));
const alphabet = gp.translit.map((token, i) => ({token, i}))
  .sort((a, b) => b.token.length - a.token.length);
const mod = n => (n % 29 + 29) % 29;

/** @param {string} word @returns {number[] | null} */
function englishGP(word) {
  word = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S").replace(/ING/g, "NG")
    .replace(/IO/g, "IA");
  const result = [];
  for (let i = 0; i < word.length;) {
    const t = alphabet.find(x => word.startsWith(x.token, i));
    if (!t) return null;
    result.push(t.i);
    i += t.token.length;
  }
  return result;
}

/** @returns {Array<Array<{c:number,page:number,mark:number}>>} */
function originalWords() {
  const stream = transcription.split("%").slice(0, 55).join("%");
  const words = [];
  let word = [], page = 0, previous = null, total = 0;
  function finish() {
    if (word.length) words.push(word);
    word = [];
  }
  for (const ch of stream) {
    if (index.has(ch)) {
      const c = index.get(ch);
      const mark = previous?.page === page
        ? Number(previous.c === c) : -1;
      word.push({c, page, mark});
      previous = {c, page};
      total++;
    } else if (ch === "%") page++;
    else if ("-.$&§".includes(ch)) finish();
  }
  finish();
  assert.equal(words.length, 2896);
  assert.equal(total, 12956);
  assert.equal(words.flat().filter(x => x.mark === 1).length, 86);
  assert.equal(words.filter(w => w[0].mark === 1).length, 23);
  assert.equal(words.filter(w => w.some(x => x.mark === 1)).length, 85);
  return words;
}

/** @typedef {{v:number[],w:number,label?:string}} SourceWord */
/** @returns {Map<number,SourceWord[]>} */
function englishCorpus() {
  const byLength = new Map(), distinct = new Set();
  for (const m of sourceEnglish.matchAll(/^([a-z]+) (\d+)$/gm)) {
    const v = englishGP(m[1]);
    if (!v || v.length >= 40) continue;
    distinct.add(v.join(","));
    const arr = byLength.get(v.length) || [];
    arr.push({v, w:Number(m[2]), label:m[1]});
    byLength.set(v.length, arr);
  }
  assert.equal(distinct.size, 29058);
  return byLength;
}
/** @returns {Map<number,SourceWord[]>} */
function latinCorpus() {
  const byLength = new Map();
  let count = 0;
  for (const text of sourceLatin.split(/\r?\n/)) {
    if (!/^[0-9A-S]+$/.test(text)) continue;
    const v = [...text].map(x => parseInt(x, 29));
    const arr = byLength.get(v.length) || [];
    arr.push({v, w:1});
    byLength.set(v.length, arr);
    count++;
  }
  assert.equal(count, 39835);
  return byLength;
}
/** @returns {Map<number,SourceWord[]>} */
function oldEnglishCorpus() {
  const source = sourceOldEnglish;
  assert.equal(source.schema, 2);
  assert.equal(source.acceptedSourceWords, 10885);
  const byLength = new Map();
  let pos = 0;
  for (const n of source.allSourceGpWordLengths) {
    const v = [...source.sourceGpBase29.slice(pos, pos+n)]
      .map(c => source.positiveControlAlphabet.indexOf(c));
    assert.equal(v.length, n);
    assert(v.every(x => x >= 0 && x <= 28));
    const arr = byLength.get(n) || [];
    arr.push({v, w:1});
    byLength.set(n, arr);
    pos += n;
  }
  assert.equal(pos, 48012);
  return byLength;
}

/** @param {Array<{mark:number,page:number}>} word
 *  @param {Map<number,SourceWord[]>} source
 *  @param {boolean} reverse
 */
function evaluateWord(word, source, reverse) {
  const options = source.get(word.length) || [];
  let weight = 0, sum = 0, sumSq = 0, start = 0;
  let compatible = false, compatibleWords = 0, soleCandidate = null;
  for (const {v, w, label} of options) {
    weight += w;
    let count = 0, good = true;
    for (let i = 0; i < v.length; i++) {
      if (word[i].mark < 0) continue;
      const code = v[reverse ? v.length-1-i : i];
      const ea = Number(code === 28);
      count += ea;
      if (ea !== word[i].mark) good = false;
    }
    sum += w*count;
    sumSq += w*count*count;
    start += w * Number(word[0].mark >= 0 &&
      v[reverse ? v.length-1 : 0] === 28);
    if (good) {
      compatible = true;
      compatibleWords++;
      soleCandidate = label || null;
    }
  }
  if (!weight) return null; // Source lacks words of this exact length.
  const mean = sum/weight, startProb = start/weight;
  return {
    mean, variance:sumSq/weight-mean*mean,
    startProb, startVariance:startProb*(1-startProb),
    compatible, compatibleWords, soleCandidate
  };
}

/** @param {ReturnType<typeof originalWords>} original
 *  @param {Map<number,SourceWord[]>} source
 *  @param {boolean} reverse
 */
function evaluate(original, source, reverse, expectedMaskedWords = 85) {
  let expectedTotal = 0, varianceTotal = 0;
  let expectedStart = 0, varianceStart = 0;
  let maskedWords = 0, unattainableMasks = 0, missingLengthWords = 0;
  const firstExamples = [], uniqueMaskWords = [];
  for (let wordIndex = 0; wordIndex < original.length; wordIndex++) {
    const word = original[wordIndex];
    const result = evaluateWord(word, source, reverse);
    if (!result) {
      // All three original length-14 words have no repeat events.
      assert(!word.some(x => x.mark === 1));
      missingLengthWords++;
      continue;
    }
    expectedTotal += result.mean;
    varianceTotal += result.variance;
    expectedStart += result.startProb;
    varianceStart += result.startVariance;
    if (!word.some(x => x.mark === 1)) continue;
    maskedWords++;
    if (result.compatibleWords === 1 && result.soleCandidate) {
      uniqueMaskWords.push({wordIndex,
        physicalPage:word[0].page >= 50 ? word[0].page + 1 : word[0].page,
        length:word.length, mask:word.map(x => x.mark).join(""),
        candidate:result.soleCandidate});
    }
    if (!result.compatible) {
      unattainableMasks++;
      if (firstExamples.length < 8) firstExamples.push({
        physicalPage:word[0].page >= 50 ? word[0].page + 1 : word[0].page,
        length:word.length, mask:word.map(x => x.mark).join("")
      });
    }
  }
  assert.equal(maskedWords, expectedMaskedWords);
  return {
    meanTotal:+expectedTotal.toFixed(3),
    sdTotal:+Math.sqrt(varianceTotal).toFixed(3),
    meanWordInitial:+expectedStart.toFixed(3),
    sdWordInitial:+Math.sqrt(varianceStart).toFixed(3),
    unattainableMasks, missingLengthWords, firstExamples,
    uniqueMaskWords
  };
}

/** Exact independent constructive positive for GF29 feedback and EA/reversal. */
function positive() {
  const plaintext = englishGP("EACH");
  assert.deepEqual(plaintext, [28,5,8]);
  const key = [2,3,5], run = [];
  let prev = 17;
  for (let i = 0; i < plaintext.length; i++) {
    const c = mod(prev + key[i]*(plaintext[i]+1));
    run.push(c);
    prev = c;
  }
  assert.equal(run[0], 17, "EA at word start forces a repeat");
  assert.notEqual(run[1], run[0]);
  assert.notEqual(run[2], run[1]);
  const inverse = k => {
    for (let x = 1; x < 29; x++) if (mod(k*x) === 1) return x;
    throw Error("nonzero inverse missing");
  };
  let last = 17;
  const recovered = run.map((c, i) => {
    const p = mod(mod(c-last)*inverse(key[i])-1);
    last = c;
    return p;
  });
  assert.deepEqual(recovered, plaintext);
  return {plaintext, key, ciphertext:run, recovered};
}

/**
 * The EA model fixes symbol 28 through P+1. To test the independent rival
 * "a single DIFFERENT plaintext symbol emits a zero step", grant every
 * one of the 29 source symbols that role without fitting a key or a word.
 * Group exact original word-length and eligible-position layouts for speed.
 *
 * A finite language-sample diagnostic, not a cipher selector.
 * @param {ReturnType<typeof originalWords>} original
 * @param {Map<number,SourceWord[]>} source
 */
function allMarkerRanks(original, source) {
  const groups = new Map();
  for (const word of original) {
    const mask = word.map(x => Number(x.mark >= 0));
    const key = word.length + ":" + mask.join("");
    const item = groups.get(key) || {
      length:word.length, mask, count:0
    };
    item.count++;
    groups.set(key, item);
  }
  const rankings = [];
  for (let marker = 0; marker < 29; marker++) {
    let expected = 0, expectedStart = 0;
    let varTotal = 0, varStart = 0, covariance = 0;
    let uncovered = 0;
    for (const group of groups.values()) {
      const options = source.get(group.length) || [];
      if (!options.length) {uncovered += group.count; continue;}
      let W = 0, sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
      for (const {v, w} of options) {
        const a = v.reduce((n, x, i) =>
          n + Number(group.mask[i] && x === marker), 0);
        const b = Number(group.mask[0] && v[0] === marker);
        W += w;
        sx += w*a;
        sy += w*b;
        sxx += w*a*a;
        syy += w*b;
        sxy += w*a*b;
      }
      const mx = sx/W, my = sy/W;
      expected += group.count*mx;
      expectedStart += group.count*my;
      varTotal += group.count*(sxx/W - mx*mx);
      varStart += group.count*(syy/W - my*my);
      covariance += group.count*(sxy/W - mx*my);
    }
    const dx = 86-expected, dy = 23-expectedStart;
    const determinant = varTotal*varStart-covariance*covariance;
    const distance = determinant > 0 ?
      Math.sqrt(Math.max(0,
        (varStart*dx*dx-2*covariance*dx*dy+varTotal*dy*dy)/
        determinant)) : Infinity;
    rankings.push({
      rune:gp.translit[marker], expected:+expected.toFixed(3),
      expectedStart:+expectedStart.toFixed(3),
      jointDistance:Number.isFinite(distance)?+distance.toFixed(3):null,
      unscoredOriginalWords:uncovered
    });
  }
  rankings.sort((a,b) =>
    (a.jointDistance ?? Infinity)-(b.jointDistance ?? Infinity));
  return rankings;
}

/**
 * Evaluate the independently page-ink-selected nine ORIGINAL visual chapters.
 * The chapter itself may use a distinct cipher, so the whole-book model's
 * rejection must not silently be attributed to every section.
 * @param {ReturnType<typeof originalWords>} original
 * @param {Map<number,SourceWord[]>} english
 */
function visualChapters(original, english) {
  const ranges = [[0,2],[3,7],[8,14],[15,22],[23,26],
    [27,32],[33,39],[40,53],[54,55]];
  const out = [];
  for (const [lo, hi] of ranges) {
    const local = original.filter(w => {
      const p = w[0].page >= 50 ? w[0].page+1 : w[0].page;
      return p >= lo && p <= hi;
    });
    const observedTotal = local.reduce((n,w) =>
      n+w.filter(x=>x.mark===1).length, 0);
    const observedInitial = local.filter(w=>w[0].mark===1).length;
    const expectedMasked = local.filter(w=>
      w.some(x=>x.mark===1)).length;
    const sample = evaluate(local, english, false, expectedMasked);
    out.push({physicalPages:lo+"-"+hi, printedWords:local.length,
      observedTotal, observedInitial,
      expectedTotal:sample.meanTotal, sdTotal:sample.sdTotal,
      expectedInitial:sample.meanWordInitial,
      sdInitial:sample.sdWordInitial,
      unsupportedEnglishMasks:sample.unattainableMasks});
  }
  assert.equal(out.reduce((n,x)=>n+x.printedWords,0), 2896);
  assert.equal(out.reduce((n,x)=>n+x.observedTotal,0), 86);
  assert.equal(out.reduce((n,x)=>n+x.observedInitial,0), 23);
  assert.deepEqual(out[3], {
    physicalPages:"15-22",printedWords:437,
    observedTotal:10,observedInitial:0,
    expectedTotal:12.011,sdTotal:3.403,
    expectedInitial:0.797,sdInitial:0.891,
    unsupportedEnglishMasks:0
  });
  return out;
}

function run() {
  const original = originalWords();
  const sources = {
    English:englishCorpus(),
    Latin:latinCorpus(),
    OldEnglish:oldEnglishCorpus()
  };
  const results = {};
  for (const [name, source] of Object.entries(sources)) {
    results[name] = {
      direct:evaluate(original, source, false),
      wordReversed:evaluate(original, source, true),
      bestAlternativeZeroStepPlaintextSymbols:allMarkerRanks(original,source)
        .slice(0, 6)
    };
  }
  const englishRanks = allMarkerRanks(original, sources.English);
  assert.equal(englishRanks[0].rune, "G");
  assert(Math.abs(englishRanks[0].expected-146.001) < 0.02);
  assert(Math.abs(englishRanks[0].expectedStart-52.316) < 0.02);
  assert(Math.abs(englishRanks[0].jointDistance-5.237) < 0.02);
  assert(Math.abs(results.English.direct.meanTotal-81.513) < 0.05);
  assert(Math.abs(results.English.direct.meanWordInitial-5.445) < 0.05);
  assert.equal(results.English.direct.unattainableMasks, 5);
  assert.equal(results.English.direct.uniqueMaskWords.length, 7);
  assert.equal(results.English.direct.uniqueMaskWords
    .filter(x => x.candidate === "ossea").length, 4);
  assert.equal(results.English.direct.uniqueMaskWords
    .filter(x => x.candidate === "purpurea").length, 3);
  assert.equal(results.English.wordReversed.unattainableMasks, 4);
  assert.equal(results.Latin.direct.unattainableMasks, 36);
  assert.equal(results.OldEnglish.direct.unattainableMasks, 11);
  const output = {
    hypothesis:"GF29 multiplicative ciphertext feedback: a zero step reveals plaintext EA",
    original:{runes:12956,printedWords:2896,repeatEvents:86,
      wordInitialEvents:23,repeatBearingWords:85},
    sourceRegisters:{
      English:"TextBlob frequency lexicon, independently archived",
      Latin:"source-pinned Vulgate 39,835 words, native GP encoding",
      OldEnglish:"corrected source-pinned Beowulf 10,885 words, native GP encoding"
    },
    positive:positive(),
    results,
    visualChapterEnglishEA:visualChapters(original, sources.English),
    conclusion:"Neither direct nor word-reversed source-register model fits all "+
      "original repeat counts and locations. These are conditional finite "+
      "language controls, not proof against arbitrary key schedules, "+
      "plaintext word rotations, or other plaintext languages."
  };
  console.log(JSON.stringify(output,null,2));
  return output;
}

if (require.main === module) run();
module.exports = {englishGP, originalWords, evaluate, positive, run};
