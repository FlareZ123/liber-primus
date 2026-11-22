"use strict";
/**
 * Disjoint-site and full-search calibration for the source-red16 F29 4D
 * native-crib inverse. Treating the four letters used to solve the state as
 * independent plaintext is a false positive. This file measures only wholly
 * unfitted locations, and reruns every original search step on 250 nulls.
 *
 * Run: node sims/red16_spiral_4d_native_crib_calibration.cjs
 * Node.js 22 CommonJS, no third-party dependencies or file writes.
 */
const assert = require("node:assert/strict");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");
const raw = require("./red16_spiral_4d_native_crib.cjs");
const {
  C, N, pages, fittingWords, nativeEA, plantedCipher, plantedPlain,
  recover, decrypt, nativeMatches, markers, info
} = raw;
assert.equal(C.length, 12956);
assert.equal(fittingWords.length, 5);
assert.equal(markers(C).length, 86);
const sourceWords = parseSharedCorpus().words;
assert.equal(sourceWords.length, 2896);
const wordAt = new Int16Array(N), wordStart = [], wordLength = [];
let at = 0;
sourceWords.forEach((w, j) => {
  wordStart.push(at); wordLength.push(w.length);
  for(let k=0;k<w.length;k++) wordAt[at+k]=j;
  at += w.length;
});
assert.equal(at, N);
/** Test an unfitted native substring against original visible word boundaries. */
function boundaryFit(match) {
  const native = nativeEA.find(w=>w.name===match.name);
  assert.ok(native);
  const start = match.site-native.ea;
  const last = start+match.length-1;
  if(start<0||last>=N)return {contained:false,exact:false};
  const j=wordAt[start];
  return {contained:j===wordAt[last],
    exact:j===wordAt[last]&&wordStart[j]===start&&wordLength[j]===match.length};
}

const SEED = 0x21c7bfc9;
const NULLS = 250;
let seed = SEED >>> 0;
/** @returns {number} */
function uint32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}

/** Source-word fit positions and independent matched positions. */
function cribPositions(crib) {
  const w = fittingWords.find(x => x.name === crib.word);
  const begin = crib.marker - w.ea;
  const fitted = [];
  for (let j = 0; j < w.runes.length; j++) {
    if (w.runes[j] !== 28 && fitted.length < 4) fitted.push(begin + j);
  }
  return { word: w.name, marker: crib.marker,
    sourceWordStart: begin, sourceGpRuneCount: w.runes.length,
    fittedNonEAOffsets: fitted,
    unfittedNonEAOffsets: w.runes.map((p, j) => p === 28 ? -1 : begin + j)
      .filter(pos => pos >= 0 && !fitted.includes(pos)) };
}

/** @param {number[]} ciphertext */
function fullSearch(ciphertext, expectedMarkers = 86) {
  assert.equal(ciphertext.length, N);
  const mark = markers(ciphertext);
  assert.equal(mark.length, expectedMarkers,
    "Original relabels must preserve markers; synthetic planted data has its own count");
  const possibilities = new Map();

  for (const word of fittingWords) for (const m of mark) {
    for (const candidate of recover(ciphertext, word, m)) {
      const tag = candidate.state.join(",");
      let row = possibilities.get(tag);
      if (!row) {
        row = { state: candidate.state, fitSites: new Set(), cribs: [] };
        possibilities.set(tag, row);
      }
      row.fitSites.add(m);
      row.cribs.push({word: word.name, marker:m,
        wholeCrib: candidate.wholeCrib});
    }
  }

  let bestLang = null, bestDisjoint = null, bestWordBounded = null;
  for (const entry of possibilities.values()) {
    const decoded = decrypt(ciphertext, entry.state);
    const language = info(decoded);
    const sites = new Map();
    for (const match of nativeMatches(decoded, mark)) {
      if (entry.fitSites.has(match.site) || match.length < 4) continue;
      if (!sites.has(match.site) || match.length > sites.get(match.site).length)
        sites.set(match.site, match);
    }
    const predictions = [...sites.values()].sort((a,b)=>a.site-b.site)
      .map(match=>({...match,...boundaryFit(match)}));
    const independentSymbols = predictions.reduce((sum,x)=>sum+x.length-1,0);
    const withinWords = predictions.filter(m=>m.contained);
    const exactWords = withinWords.filter(m=>m.exact);
    const score = { state: entry.state, fitSites: [...entry.fitSites].sort((a,b)=>a-b),
      fitCribs: entry.cribs.map(cribPositions), language,
      independentSiteCount:predictions.length, independentSymbols,
      containedWordSites:withinWords.length, exactWordSites:exactWords.length,
      independentPredictions:predictions };
    if(!bestLang || language > bestLang.language) bestLang=score;
    if(!bestDisjoint || score.independentSiteCount > bestDisjoint.independentSiteCount ||
       (score.independentSiteCount === bestDisjoint.independentSiteCount &&
        score.independentSymbols > bestDisjoint.independentSymbols) ||
       (score.independentSiteCount === bestDisjoint.independentSiteCount &&
        score.independentSymbols === bestDisjoint.independentSymbols &&
        language > bestDisjoint.language)) bestDisjoint=score;
    if(!bestWordBounded || score.containedWordSites > bestWordBounded.containedWordSites ||
      (score.containedWordSites === bestWordBounded.containedWordSites &&
       score.exactWordSites > bestWordBounded.exactWordSites) ||
      (score.containedWordSites === bestWordBounded.containedWordSites &&
       score.exactWordSites === bestWordBounded.exactWordSites &&
       language > bestWordBounded.language))bestWordBounded=score;
  }
  return { candidateKeys: possibilities.size, fourConstraintFits:
    [...possibilities.values()].reduce((s,x)=>s+x.cribs.length,0),
    markers:mark.length, bestLang, bestDisjoint, bestWordBounded,
    truthFound: possibilities.has("11,7,22,3") };
}

/** @returns {number[]} */
function randomRelabel() {
  const p = Array.from({length:29},(_,i)=>i);
  for(let i=28;i>0;i--) {
    const j=uint32()%(i+1);
    [p[i],p[j]]=[p[j],p[i]];
  }
  return p;
}
function summarize(s) {
  return {candidateKeys:s.candidateKeys, fourConstraintFits:s.fourConstraintFits,
    bestLanguage:s.bestLang.language,
    bestDisjointSites:s.bestDisjoint.independentSiteCount,
    bestDisjointSymbols:s.bestDisjoint.independentSymbols,
    bestContainedWordSites:s.bestWordBounded.containedWordSites,
    bestExactWordSites:s.bestWordBounded.exactWordSites };
}
function quantile(a, q) {
  const s = a.toSorted((x,y)=>x-y);
  return s[Math.floor((s.length-1)*q)];
}
function main() {
  const orig = fullSearch(C);
  const plant = fullSearch(plantedCipher, markers(plantedCipher).length);
  assert.ok(plant.truthFound, "blind native solved-source plant must include secret state");
  const truePlantScore = info(plantedPlain);
  assert.ok(Math.abs(truePlantScore-plant.bestLang.language) < 1e-8,
    "planted genuine key should be best among all generated hypotheses");
  assert.ok(orig.bestLang.language < 0);

  const nulls = [];
  for(let k=0;k<NULLS;k++) {
    const p = randomRelabel();
    const v = fullSearch(C.map(x=>p[x]));
    nulls.push(summarize(v));
  }
  const maxScores = nulls.map(x=>x.bestLanguage);
  const siteCounts = nulls.map(x=>x.bestDisjointSites);
  const runeCounts = nulls.map(x=>x.bestDisjointSymbols);
  const insideCounts = nulls.map(x=>x.bestContainedWordSites);
  const exactCounts = nulls.map(x=>x.bestExactWordSites);
  const tally = (a,observed)=>a.filter(x=>x>=observed).length;
  const first = summarize(orig);
  const report = {
    classification:"Original-source red16 4D GP-native fitted-crib search: disjoint original predictions calibrated by a full matched-null search",
    rule:"Original 16 red GP-prime span sums in physical p15 spiral -> 4D F29 state; primitive-root step map; native EA words around all original 86 repeated rune sites",
    sourceWords:fittingWords.map(x=>({name:x.name,runic:x.runes.length,eaIndex:x.ea,
      fittedNonEA:4,unfittedNonEA:x.runes.length-5})),
    original:{
      ...first,bestLanguageState:orig.bestLang,bestDisjointState:orig.bestDisjoint,
      bestWordBoundedState:orig.bestWordBounded
    },
    null:{
      model:"250 seeded independent global rune-label permutations, preserving all original rune/word/page lengths and 86 doublet sites; redo all five-word x 86-site state inverses and rank all candidates",
      repetitions:NULLS,seed:SEED,
      medianMaxLanguage:quantile(maxScores,.5),maxLanguage:Math.max(...maxScores),
      medianMaxDisjointSites:quantile(siteCounts,.5),
      maxDisjointSites:Math.max(...siteCounts),
      medianMaxIndependentSymbols:quantile(runeCounts,.5),
      medianMaxContainedWordSites:quantile(insideCounts,.5),
      medianMaxExactWordSites:quantile(exactCounts,.5),
      originalBestLanguageUpperP:(tally(maxScores,first.bestLanguage)+1)/(NULLS+1),
      originalBestDisjointSiteUpperP:(tally(siteCounts,first.bestDisjointSites)+1)/(NULLS+1),
      originalBestDisjointSymbolUpperP:(tally(runeCounts,first.bestDisjointSymbols)+1)/(NULLS+1),
      originalBestContainedWordSiteUpperP:(tally(insideCounts,first.bestContainedWordSites)+1)/(NULLS+1),
      originalBestExactWordSiteUpperP:(tally(exactCounts,first.bestExactWordSites)+1)/(NULLS+1),
      siteCountDistribution:Object.fromEntries([...new Set(siteCounts)].sort((a,b)=>a-b)
        .map(n=>[n,siteCounts.filter(x=>x===n).length]))
    },
    positive:{
      plantedSecret:[11,7,22,3],
      correctStateRecoveredBlind:plant.truthFound,
      nativeSourcePlainLanguage: truePlantScore,
      chosenLanguageState:plant.bestLang.state,
      correctlyRecovered:12956,
      bestSourceCandidates:summarize(plant)
    },
    conclusion:"A disjoint 4-rune original word is not a sustained decryption. Assess its full-search calibrated rarity and original-language gap before claiming original plaintext."
  };
  process.stdout.write(JSON.stringify(report,null,2)+"\n");
}
if(require.main===module)main();
module.exports={fullSearch,randomRelabel};
