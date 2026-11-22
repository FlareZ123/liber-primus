"use strict";

/**
 * Source-original 2014 historical column-14 state-clock exclusion.
 *
 * The authenticated 2014 Stage05 manual column permutation contains exactly
 * 14 columns. A natural candidate is a 14-phase GP29 alphabet, one unknown
 * arbitrary (29!) bijection per column, repeated globally or reset on each
 * original LP2 physical page. No actual alphabet values are fitted.
 *
 * Conditional necessary condition: if every printed complete one-rune word
 * is plain English A or I, each stationary column state has at most TWO
 * distinct possible ciphertext outputs, whatever its secret permutation.
 * Source-pinned original complete singleton words disprove both clocks.
 *
 * The original book's 12,956 ciphertext runes, 2,896 complete words, 83
 * singletons, physical page carry and no-runic p50 are preserved.
 *
 * Run on Windows 11 with Node22:
 * node sims/lp2_historical14_allsecret_singleton_clock_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const source = fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-transcription.txt"), "utf8");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const ABC = [..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
const IDX = new Map(ABC.map((symbol, index) => [symbol, index]));
const HISTORICAL14 = [2, 8, 9, 1, 12, 13, 11, 4, 5, 7, 3, 0, 6, 10];
assert.deepEqual(HISTORICAL14.slice().sort((a, b) => a - b),
  Array.from({length: 14}, (_, i) => i));

const pages = source.split("%").slice(0, 55);
assert.equal(pages.length, 55);
const sourceStream = pages.join("%");
const completeWords = [];
let current = [], page = 0, local = 0, absolute = 0;
function finishWord() {
  if (current.length) completeWords.push(current);
  current = [];
}
for (const character of sourceStream) {
  if (IDX.has(character)) {
    current.push({gp: IDX.get(character), page: page >= 50 ? page + 1 : page,
      offset: local++, absolute: absolute++});
  } else if (character === "%") {
    page++;
    local = 0;
  } else if (character === "/" || /\s/u.test(character)) {
    // A visual line wrap or physical page break is not a word separator.
  } else {
    finishWord();
  }
}
finishWord();

const letters = completeWords.flat();
assert.equal(letters.length, 12956);
assert.equal(completeWords.length, 2896);
const original = corpus.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices);
assert.equal(original.length, letters.length);
assert.deepEqual(letters.map(x => x.gp), original);

const singletons = [];
for (let ordinal = 0; ordinal < completeWords.length; ordinal++) {
  if (completeWords[ordinal].length === 1) {
    singletons.push({...completeWords[ordinal][0], ordinal});
  }
}
assert.equal(singletons.length, 83);
assert.equal(new Set(singletons.map(x => x.gp)).size, 28);

/**
 * Count distinct outputs at each one of the 14 clock states.
 * @param {Array<{gp:number,page:number,offset:number,absolute:number,
 *                 ordinal:number}>} entries
 * @param {"global" | "page" | "word"} clock
 */
function profile(entries, clock) {
  const byPhase = Array.from({length: 14}, () => new Map());
  for (const entry of entries) {
    const n = clock === "global" ? entry.absolute :
      clock === "page" ? entry.offset : entry.ordinal;
    const phase = n % 14;
    const group = byPhase[phase];
    if (!group.has(entry.gp)) group.set(entry.gp, entry);
  }
  const distinct = byPhase.map(g => g.size);
  return {distinct, violatedPhases: distinct.filter(x => x > 2).length,
    firstContradiction: [...byPhase.entries()]
      .filter(([,g]) => g.size > 2).map(([phase, group]) => ({
        phase, witnesses: [...group.values()].slice(0, 3)
      }))[0]};
}
const globalClock = profile(singletons, "global");
const pageClock = profile(singletons, "page");
const wordClock = profile(singletons, "word");
assert.deepEqual(globalClock.distinct, [5,4,4,7,11,4,9,2,7,3,1,4,7,6]);
assert.deepEqual(pageClock.distinct, [3,9,4,2,9,8,6,9,7,8,4,7,2,4]);
assert.deepEqual(wordClock.distinct, [4,5,5,5,3,3,5,5,3,10,3,6,11,5]);
assert.equal(globalClock.violatedPhases, 12);
assert.equal(pageClock.violatedPhases, 12);
assert.equal(wordClock.violatedPhases, 14);
assert.deepEqual(globalClock.firstContradiction.witnesses.map(x => [
  x.page,x.absolute,x.gp]), [[1,350,9],[2,644,0],[5,1316,26]]);
assert.deepEqual(pageClock.firstContradiction.witnesses.map(x => [
  x.page,x.offset,x.gp]), [[13,28,1],[18,56,16],[54,0,24]]);

/**
 * Exact synthetic GP29 plant with 14 distinct reversible Caesar alphabets.
 * Only the 83 singleton plaintext symbols are changed to A/I; every other
 * plaintext rune is an unmodified source-index geometric placeholder.
 * This tests the all-secret A/I support invariant and full-length inverse.
 */
for (const clock of ["global", "page", "word"]) {
  const plantedPlain = letters.map(x => x.gp);
  const plantEntries = singletons.map((entry,i) => {
    plantedPlain[entry.absolute] = (i%2) ? 10 : 24; // I or A.
    return {...entry, gp: plantedPlain[entry.absolute]};
  });
  const allOrdinals = completeWords.flatMap((word,ordinal) =>
    word.map(() => ordinal));
  const encrypted = letters.map((entry,i) => {
    const n = clock === "global" ? entry.absolute :
      clock === "page" ? entry.offset : allOrdinals[i];
    return (plantedPlain[i] + 2*(n%14))%29;
  });
  assert.equal(encrypted.length, letters.length);
  const decrypted = encrypted.map((v,i) => {
    const entry = letters[i];
    const n = clock === "global" ? entry.absolute :
      clock === "page" ? entry.offset : allOrdinals[i];
    return (v - 2*(n%14) + 29)%29;
  });
  assert.deepEqual(decrypted, plantedPlain);
  const sample = plantEntries.map(x => ({
    ...x, gp: encrypted[x.absolute]
  }));
  assert.ok(profile(sample,clock).distinct.every(x=>x<=2),
    "True 14-state A/I plant must satisfy the invariant");
}

console.log(JSON.stringify({
  originalSource: {unsolvedRunes: absolute, completeWords: completeWords.length,
    singletonWords: singletons.length, distinctSingletonRunes:28},
  historicalSource: {operation:"2014 Stage05 manual 14-column permutation",
    columnOrder:HISTORICAL14},
  globallyContinuousRuneClock: globalClock,
  physicallyPageResetRuneClock: pageClock,
  globallyContinuousWordOrdinalClock: wordClock,
  native14PhasePositiveControls:"3 exact 12956-rune forward/inverse plants, all pass",
  decision:"No stationary 14-alphabet source-column clock (all 14 row permutations unrestricted) can explain original singletons as preserved native A/I words. Separate per-page keys, moving punctuation and hidden evolving states remain open."
},null,2));
