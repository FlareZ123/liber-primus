'use strict';
/**
 * Original-source predecessor-cipher-state, all-secret alphabet capacity gate.
 * Run: node sims/lp2_prevcipher_state_allsecret_capacity_sft.cjs
 * Every within-word emitted ciphertext rune C_j is conditioned on the
 * previous printed ciphertext rune C_(j-1). The first rune is left free.
 * The secret 29-alphabet permutation may change independently in each
 * of nine original visual chapters and each previous-cipher state.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')
  .replace(/\r\n/g, '\n');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pageText = read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0, 55).join('%')
  .replace(/\/\n/g, '').replace(/[\n%]/g, '');
const runeToIndex = new Map(gp.runes.map((r, i) => [r, i]));
const runePattern = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const words = [...pageText.matchAll(runePattern)]
  .map(m => [...m[0]].map(r => runeToIndex.get(r)));
assert.equal(words.length, 2896);
assert.equal(words.reduce((n, w) => n + w.length, 0), 12956);

const CHAPTER_LENGTHS = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
const CHAPTER_ENDS = [];
for (const length of CHAPTER_LENGTHS)
  CHAPTER_ENDS.push((CHAPTER_ENDS.at(-1) || 0) + length);
assert.equal(CHAPTER_ENDS.at(-1), 12956);
/** @returns {number[][]} */
const blank = () => Array.from({ length: 29 }, () => Array(29).fill(0));
/** @returns {number[][][]} */
const blankChapters = () => Array.from({ length: 9 }, blank);
const originalGlobal = blank();
const originalByChapter = blankChapters();
const offsets = Array.from({ length: 9 }, () =>
  Array.from({ length: 29 }, () => Array(29).fill(null)));

let globalPosition = 0;
let interiorPositions = 0;
for (const word of words) {
  for (let j = 0; j < word.length; j++, globalPosition++) {
    if (j === 0) continue;
    const chapter = CHAPTER_ENDS.findIndex(end => globalPosition < end);
    assert(chapter >= 0);
    const prev = word[j - 1], next = word[j];
    originalGlobal[prev][next]++;
    originalByChapter[chapter][prev][next]++;
    if (offsets[chapter][prev][next] === null)
      offsets[chapter][prev][next] = globalPosition;
    interiorPositions++;
  }
}
assert.equal(globalPosition, 12956);
assert.equal(interiorPositions, 10060);

/**
 * Capacity over independently secret, arbitrary 29-permutations per row.
 * @param {number[][][]} matrices
 * @returns {{E:number, EO:number, fullRows:number}}
 */
function capacity(matrices) {
  let E = 0, EO = 0, fullRows = 0;
  for (const matrix of matrices)
    for (const row of matrix) {
      const sorted = [...row].sort((a, b) => b - a);
      E += sorted[0];
      EO += sorted[0] + sorted[1];
      if (sorted[28] > 0) fullRows++;
    }
  return { E, EO, fullRows };
}
const global = capacity([originalGlobal]);
const chapters = capacity(originalByChapter);
assert.deepEqual(global, { E: 578, EO: 1086, fullRows: 26 });
assert.deepEqual(chapters, { E: 1068, EO: 1938, fullRows: 1 });
const fullState = [];
for (let chapter = 0; chapter < 9; chapter++)
  for (let prev = 0; prev < 29; prev++)
    if (offsets[chapter][prev].every(x => x !== null))
      fullState.push({ chapter, previousRune: prev,
        successorOffsetsByGPIndex: offsets[chapter][prev] });
assert.equal(fullState.length, 1);
assert.equal(fullState[0].chapter, 7);
assert.equal(fullState[0].previousRune, 18); // source GP E, not assumed plaintext
assert.deepEqual(fullState[0].successorOffsetsByGPIndex,
  [9803, 11785, 12093, 10617, 9726, 9762, 11742, 9730,
   10032, 9995, 10631, 10337, 10556, 10060, 9778,
   10020, 9746, 9681, 11103, 11425, 11822, 10952,
   10784, 10827, 10925, 9710, 10091, 10321, 12446]);

const tokens = gp.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
/** Native 29-rune English spelling, calibrated on solved LP1 source. 
 * @param {string} value @returns {number[]} */
function native(value) {
  const s = value.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith('ING', i)) { out.push(21); i += 3; }
    else if (s.startsWith('IO', i)) { out.push(27); i += 2; }
    else {
      const item = tokens.find(t => s.startsWith(t.s, i));
      assert(item, 'unknown native spelling ' + s);
      out.push(item.i);
      i += item.s.length;
    }
  }
  return out;
}
const corpusPaths = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/shakespeare_first300k.txt'
];
const reference = corpusPaths.flatMap(p =>
  (read(p).match(/[A-Za-z]+/g) || []).map(native));
assert.equal(reference.length, 149072);
const byLength = new Map();
for (const word of reference) {
  if (!byLength.has(word.length)) byLength.set(word.length, []);
  byLength.get(word.length).push(word);
}

// A true unknown-key positive plant: 9*29 independent state alphabets.
// x -> x^5 is a permutation modulo29 because gcd(5,28)=1.
const fwd = Array.from({ length: 9 }, (_, chapter) =>
  Array.from({ length: 29 }, (_, prev) =>
    Array.from({ length: 29 }, (_, p) =>
      ((p ** 5) % 29 + 7 * prev + 3 * chapter) % 29)));
const inv = Array.from({ length: 9 }, () =>
  Array.from({ length: 29 }, () => Array(29).fill(-1)));
for (let chapter = 0; chapter < 9; chapter++)
  for (let prev = 0; prev < 29; prev++) {
    for (let p = 0; p < 29; p++)
      inv[chapter][prev][fwd[chapter][prev][p]] = p;
    assert(inv[chapter][prev].every(x => x >= 0));
  }

const plantedByChapter = blankChapters();
const occurrence = new Map();
let plantE = 0, plantEO = 0, expectedE = 0, expectedEO = 0;
let recovered = 0, at = 0;
for (const word of words) {
  const bin = byLength.get(word.length);
  assert(bin && bin.length > 0, 'missing source-native length ' + word.length);
  const group = word[0] + ':' + word.length;
  const times = occurrence.get(group) || 0;
  occurrence.set(group, times + 1);
  const plaintext = bin[(times * 17 + word[0] * 11 + word.length * 13)
    % bin.length];
  let prev = word[0]; // each initial cipher glyph is freely supplied
  for (let j = 0; j < word.length; j++, at++) {
    if (j === 0) continue;
    const chapter = CHAPTER_ENDS.findIndex(end => at < end);
    const p = plaintext[j];
    const c = fwd[chapter][prev][p];
    assert.equal(inv[chapter][prev][c], p);
    plantedByChapter[chapter][prev][c]++;
    prev = c;
    recovered++;
    if (p === 18) plantE++;
    if (p === 18 || p === 3) plantEO++;
    for (const sample of bin) {
      if (sample[j] === 18) expectedE += 1 / bin.length;
      if (sample[j] === 18 || sample[j] === 3)
        expectedEO += 1 / bin.length;
    }
  }
}
assert.equal(at, 12956);
assert.equal(recovered, 10060);
const plantedCapacity = capacity(plantedByChapter);
assert.deepEqual(plantedCapacity, { E: 1742, EO: 3032, fullRows: 0 });
assert.equal(plantE, 1499);
assert.equal(plantEO, 2388);
assert(Math.abs(expectedE - 1487.4447156192) < 1e-5);
assert(Math.abs(expectedEO - 2289.22558091775) < 1e-5);
assert(plantedCapacity.E >= plantE && plantedCapacity.EO >= plantEO);

// Allow one extra, visibly motivated rekey at the rune-free numeric p50.
const postNumericEnds = [...CHAPTER_ENDS.slice(0, 7), 12114,
  ...CHAPTER_ENDS.slice(7)];
assert.equal(postNumericEnds.length, 10);
const postNumericCounts = Array.from({ length: 10 }, blank);
let postNumericPosition = 0;
for (const word of words)
  for (let j = 0; j < word.length; j++, postNumericPosition++) {
    if (j === 0) continue;
    const segment = postNumericEnds.findIndex(x => postNumericPosition < x);
    postNumericCounts[segment][word[j - 1]][word[j]]++;
  }
assert.equal(postNumericPosition, 12956);
const postNumericRekey = capacity(postNumericCounts);
assert.deepEqual(postNumericRekey, { E: 1109, EO: 2015, fullRows: 0 });

// Optimize every possible physically visible page boundary as an additional
// reset. This is a dynamic program over all contiguous within-chapter
// partitions, with an independent arbitrary alphabet per segment/state.
const runePages = gp.pages.filter(p => p.page <= 55 && p.runic_count > 0);
assert.equal(runePages.length, 55);
const pageOfRune = Array(12956);
let pageOffset = 0;
for (let i = 0; i < runePages.length; i++)
  for (let j = 0; j < runePages[i].runic_count; j++)
    pageOfRune[pageOffset++] = i;
assert.equal(pageOffset, 12956);
const pageRows = runePages.map(blank);
let p = 0;
for (const word of words)
  for (let j = 0; j < word.length; j++, p++)
    if (j >= 1) pageRows[pageOfRune[p]][word[j - 1]][word[j]]++;
assert.equal(p, 12956);
const pageChapterStarts = [0, 3, 8, 15, 23, 27, 33, 40, 54, 56];
const chapterPageGroups = Array.from({ length: 9 }, (_, i) =>
  runePages.map((page, k) => ({ page: page.page, rows: pageRows[k] }))
    .filter(page => page.page >= pageChapterStarts[i] &&
      page.page < pageChapterStarts[i + 1]));
for (let i = 0; i < 9; i++) {
  const count = chapterPageGroups[i]
    .reduce((total, item) =>
      total + runePages.find(x => x.page === item.page).runic_count, 0);
  assert.equal(count, CHAPTER_LENGTHS[i]);
}
/**
 * @param {{page:number,rows:number[][]}[]} pages
 * @param {number} start
 * @param {number} end
 * @returns {{E:number, EO:number}}
 */
function pageSegmentCapacity(pages, start, end) {
  const h = blank();
  for (let j = start; j < end; j++)
    for (let prev = 0; prev < 29; prev++)
      for (let c = 0; c < 29; c++)
        h[prev][c] += pages[j].rows[prev][c];
  const score = capacity([h]);
  const maxDistinct = Math.max(...h.map(row =>
    row.filter(count => count > 0).length));
  return { E: score.E, EO: score.EO, maxDistinct };
}
/**
 * Exactly maximize independently secret state capacity for each number of
 * extra page-start resets, preserving the nine visual chapter boundaries.
 * @param {'E' | 'EO'} metric
 * @returns {{value:number, resets:number[]}[]}
 */
function bestPageRekeys(metric) {
  let best = [{ value: 0, resets: [] }];
  for (const pages of chapterPageGroups) {
    const n = pages.length;
    const scores = Array.from({ length: n + 1 }, () =>
      Array(n + 1).fill(null));
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j <= n; j++)
        scores[i][j] = pageSegmentCapacity(pages, i, j);
    const dp = Array.from({ length: n + 1 }, () =>
      Array(n + 1).fill(null));
    dp[0][0] = { value: 0, resets: [] };
    for (let end = 1; end <= n; end++)
      for (let start = 0; start < end; start++)
        for (let k = 0; k <= start; k++) {
          const previous = dp[start][k];
          if (!previous) continue;
          const candidate = {
            value: previous.value + scores[start][end][metric],
            resets: [...previous.resets,
              ...(start ? [pages[start].page] : [])]
          };
          if (!dp[end][k + 1] ||
              candidate.value > dp[end][k + 1].value)
            dp[end][k + 1] = candidate;
        }
    const local = dp[n].slice(1);
    const updated = [];
    for (let k = 0; k < best.length; k++) {
      if (!best[k]) continue;
      for (let q = 0; q < local.length; q++) {
        if (!local[q]) continue;
        const candidate = {
          value: best[k].value + local[q].value,
          resets: [...best[k].resets, ...local[q].resets]
        };
        const resetCount = k + q;
        if (!updated[resetCount] ||
            candidate.value > updated[resetCount].value)
          updated[resetCount] = candidate;
      }
    }
    best = updated;
  }
  return best;
}
// A p50 reset eliminates the single 29-output row, but leaves rows with
// 28 distinct outputs, so direct Latin26 remains impossible in that model.
const postNumericMaxOutputs = Math.max(...postNumericCounts
  .flatMap(matrix => matrix.map(row =>
    row.filter(count => count > 0).length)));
assert.equal(postNumericMaxOutputs, 28);
const maxOutputsByChapter = chapterPageGroups.map(pages =>
  pageSegmentCapacity(pages, 0, pages.length).maxDistinct);
assert.deepEqual(maxOutputsByChapter,
  [19, 24, 27, 28, 23, 25, 25, 29, 11]);

// Minimum *additional physical-page resets* necessary to eliminate every
// >26-output public-state cardinality obstruction. This is necessary only;
// it does not produce a lexical plaintext or determine secret codebooks.
const latin26PageRekeys = [];
for (const pages of chapterPageGroups) {
  const n = pages.length;
  const dp = Array(n + 1).fill(null);
  dp[0] = { segments: 0, pageStarts: [] };
  for (let end = 1; end <= n; end++)
    for (let start = 0; start < end; start++) {
      if (!dp[start]) continue;
      if (pageSegmentCapacity(pages, start, end).maxDistinct > 26)
        continue;
      const candidate = {
        segments: dp[start].segments + 1,
        pageStarts: [...dp[start].pageStarts,
          ...(start ? [pages[start].page] : [])]
      };
      if (!dp[end] || candidate.segments < dp[end].segments)
        dp[end] = candidate;
    }
  assert(dp[n], 'missing 26-symbol capacity partition');
  latin26PageRekeys.push(dp[n]);
}
const minimumLatin26ExtraResets = latin26PageRekeys.reduce(
  (n, x) => n + x.segments - 1, 0);
const latin26ExamplePageStarts = latin26PageRekeys
  .flatMap(x => x.pageStarts);
assert.equal(minimumLatin26ExtraResets, 3);
assert.deepEqual(latin26ExamplePageStarts, [10, 16, 45]);

const bestE = bestPageRekeys('E');
const bestEO = bestPageRekeys('EO');
assert.equal(bestE[0].value, 1068);
assert.equal(bestEO[0].value, 1938);
assert.equal(bestE[10].value, 1485);
assert.equal(bestE[11].value, 1519);
assert.equal(bestEO[4].value, 2254);
assert.equal(bestEO[5].value, 2319);
const minExtraE = bestE.findIndex(x => x && x.value >= expectedE);
const minExtraEO = bestEO.findIndex(x => x && x.value >= expectedEO);
assert.equal(minExtraE, 11);
assert.equal(minExtraEO, 5);
assert.deepEqual(bestE[11].resets,
  [1, 11, 18, 20, 25, 29, 35, 42, 44, 46, 51]);

console.log(JSON.stringify({
  status: 'PASS', hypothesis: 'state = preceding printed GP ciphertext rune',
  originalRunes: at, originalWords: words.length, interiorPairs: recovered,
  chapterLengths: CHAPTER_LENGTHS, referenceWords: reference.length,
  secretAlphabets: '29 per chapter, each any GP29 permutation',
  original: { global, nineChapterIndependent: chapters },
  originalFullStateWitness: fullState,
  p50OnlyExtraRekey: { ...postNumericRekey,
    maximumDistinctOutputsAtFixedState: postNumericMaxOutputs },
  latin26FixedStateCardinality: {
    originalChapterMaxDistinctOutputs: maxOutputsByChapter,
    minimumAdditionalPageRekeys: minimumLatin26ExtraResets,
    witnessPageStarts: latin26ExamplePageStarts,
    caveat: 'three resets remove the cardinality obstruction only; no 26-letter plaintext or key is recovered'
  },
  optimalPageBoundaryRekeyDemand: {
    minExtraResetsForReferenceE: minExtraE,
    minExtraResetsForReferenceEplusO: minExtraEO,
    tenResetUpperBoundE: bestE[10].value,
    elevenResetUpperBoundE: bestE[11].value,
    elevenResetExamplePageStarts: bestE[11].resets,
    fourResetUpperBoundEplusO: bestEO[4].value,
    fiveResetUpperBoundEplusO: bestEO[5].value
  },
  sourceNativeExpected: { E: expectedE, EplusO: expectedEO },
  nonLinearGP29PositivePlant: {
    recovered, exact: true, actualE: plantE, actualEplusO: plantEO,
    statewiseCapacity: plantedCapacity
  },
  verdict: '29-symbol GP source necessary; original per-state symbol capacity excludes direct 26-letter encoder, while source-native English E/E+O demand exceeds even the nine-chapter all-key maximum'
}, null, 2));
