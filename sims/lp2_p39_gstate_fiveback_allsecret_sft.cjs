'use strict';

/**
 * Original-input, all-secret GF29 five-back state gate for LP2 physical pages 40–53.
 * Run: node sims/lp2_p39_gstate_fiveback_allsecret_sft.cjs
 *
 * State: s[5] = any of 29 values;
 *        s[i+1] = G(s[i]) + C[i] - C[i-5] (mod 29)
 * where G(x) = 27 + 5x + 15x^2 is the original p39 red triad.
 *
 * An otherwise unrestricted fixed secret permutation for EACH state maps
 * ciphertext C[i] to GP plaintext P[i]. The first five rune positions are
 * granted arbitrary plaintext and are included as five free positions in
 * every top-k bound. This grants far more keys than a chosen affine decoder.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = require(path.join(root, 'resources/liber-primus/lp2-corpus.json'));
const ink = require(path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'));
const solved = require(path.join(root, 'resources/external/relikd-solved-gp29-native-v1.json'));
const latinSource = fs.readFileSync(
  path.join(root, 'resources/control/latin-vulgate-gp-wholewords.txt'),
  'utf8',
);

const MOD = 29;
const K = [1, 2, 3, 5, 9, 14];
const PAGE_FIRST = 40;
const PAGE_LAST = 53;

/** @param {number} n @returns {number} */
function mod(n) {
  return ((n % MOD) + MOD) % MOD;
}

/** @param {number} x @returns {number} */
function G(x) {
  return mod(27 + 5 * x + 15 * x * x);
}

/**
 * @param {readonly number[]} seq
 * @returns {number[]}
 */
function topCounts(seq) {
  const f = Array(MOD).fill(0);
  for (const sym of seq) {
    assert.ok(Number.isInteger(sym) && sym >= 0 && sym < MOD);
    f[sym]++;
  }
  f.sort((a, b) => b - a);
  return K.map((count) => f.slice(0, count).reduce((sum, value) => sum + value, 0));
}

/**
 * Independent of every one of the 29 secret output permutations, the largest
 * possible sum of any top k plaintext symbol counts equals the sum of the
 * k largest ciphertext symbol counts in each state row.
 *
 * @param {readonly number[]} ciphertext
 * @param {number} seed
 * @returns {{ bound: number[], finalState: number, states: number[] }}
 */
function invariant(ciphertext, seed) {
  let state = seed;
  const rows = Array.from({ length: MOD }, () => Array(MOD).fill(0));
  const states = [];
  for (let i = 5; i < ciphertext.length; i++) {
    const symbol = ciphertext[i];
    rows[state][symbol]++;
    states.push(state);
    state = mod(G(state) + symbol - ciphertext[i - 5]);
  }
  for (const row of rows) {
    row.sort((a, b) => b - a);
  }
  const bound = K.map((count) => 5 + rows.reduce(
    (sum, row) => sum + row.slice(0, count).reduce((part, v) => part + v, 0), 0,
  ));
  return { bound, finalState: state, states };
}

/**
 * @param {readonly number[]} ciphertext
 * @returns {number}
 */
function synchronizationPrefix(ciphertext) {
  const states = Array.from({ length: MOD }, (_, i) => i);
  for (let i = 5; i < ciphertext.length; i++) {
    for (let k = 0; k < states.length; k++) {
      states[k] = mod(G(states[k]) + ciphertext[i] - ciphertext[i - 5]);
    }
    if (new Set(states).size === 1) {
      return i + 1;
    }
  }
  return -1;
}


/**
 * Enlarge the all-secret model by permitting independent new sets of
 * 29 secret state-indexed permutations at actual physical-page boundaries.
 * The GF29 state itself always continues across pages, words, and p50.
 * @param {readonly number[]} ciphertext
 * @param {readonly number[]} physicalPageLengths
 * @returns {{ envelopes: number[][], p50Seam: number[] }}
 */
function pageRekeyCapacities(ciphertext, physicalPageLengths) {
  const boundaries = [0];
  for (const length of physicalPageLengths) boundaries.push(boundaries.at(-1) + length);
  assert.equal(boundaries.length, 14);
  assert.equal(boundaries.at(-1), 3008);
  assert.equal(boundaries[10], 2474); // Literal p49 -> numeric p50 -> p51.

  const envelopes = Array.from({ length: 4 }, () => K.map(() => 0));
  const p50Seam = K.map(() => 0);

  /** @param {number} n @param {number} next @param {number[]} picks @returns {number[][]} */
  function chooseCuts(n, next, picks) {
    if (picks.length === n) return [picks];
    const sets = [];
    for (let i = next; i <= 12 - (n - picks.length) + 1; i++) {
      sets.push(...chooseCuts(n, i + 1, [...picks, i]));
    }
    return sets;
  }
  const cutSets = Array.from({ length: 4 }, (_, n) => chooseCuts(n, 1, []));

  for (let seed = 0; seed < MOD; seed++) {
    let state = seed;
    const states = Array(ciphertext.length).fill(-1);
    for (let i = 5; i < ciphertext.length; i++) {
      states[i] = state;
      state = mod(G(state) + ciphertext[i] - ciphertext[i - 5]);
    }

    const intervals = Array.from({ length: 14 }, () => Array(14).fill(null));
    for (let start = 0; start < 13; start++) {
      const rows = Array.from({ length: MOD }, () => Array(MOD).fill(0));
      for (let end = start + 1; end < 14; end++) {
        for (let i = Math.max(boundaries[end - 1], 5); i < boundaries[end]; i++) {
          rows[states[i]][ciphertext[i]]++;
        }
        const sortedRows = rows.map((row) => [...row].sort((a, b) => b - a));
        intervals[start][end] = K.map((count) => sortedRows.reduce(
          (sum, row) => sum + row.slice(0, count).reduce((part, n) => part + n, 0), 0,
        ));
      }
    }

    for (let n = 0; n <= 3; n++) {
      for (const selected of cutSets[n]) {
        const cuts = [0, ...selected, 13];
        const upper = K.map(() => 5);
        for (let i = 0; i < cuts.length - 1; i++) {
          const segment = intervals[cuts[i]][cuts[i + 1]];
          for (let j = 0; j < K.length; j++) upper[j] += segment[j];
        }
        for (let j = 0; j < K.length; j++) {
          envelopes[n][j] = Math.max(envelopes[n][j], upper[j]);
          if (n === 1 && selected[0] === 10) {
            p50Seam[j] = Math.max(p50Seam[j], upper[j]);
          }
        }
      }
    }
  }
  return { envelopes, p50Seam };
}

/** @param {number} a @returns {number} */
function inverse(a) {
  for (let b = 1; b < MOD; b++) {
    if (mod(a * b) === 1) return b;
  }
  throw new Error('Noninvertible GF29 element');
}

/**
 * Plant a full-length native-GP plaintext into exactly this machine,
 * with 29 hidden, state-indexed affine permutations as a subclass of
 * the arbitrary 29! allowed secret alphabet permutations.
 *
 * @param {readonly number[]} plain
 * @param {number} seed
 * @returns {{cipher:number[], recovered:number[]}}
 */
function plant(plain, seed) {
  const cipher = plain.slice(0, 5);
  const recovered = plain.slice(0, 5);
  let state = seed;
  for (let i = 5; i < plain.length; i++) {
    const a = 1 + (7 * state) % 28;
    const b = mod(13 * state + 5);
    const symbol = mod(inverse(a) * (plain[i] - b));
    cipher.push(symbol);
    recovered.push(mod(a * symbol + b));
    state = mod(G(state) + symbol - cipher[i - 5]);
  }
  return { cipher, recovered };
}

const runeLookup = new Map(corpus.runes.map((r, i) => [r, i]));
const p39 = ink.pages.find((page) => page.page === 39);
const triad = p39.red_spans.find((span) => span.length === 3);
assert.deepEqual([...triad.runes].map((r) => runeLookup.get(r)), [27, 5, 15]);
assert.equal(G(24), 0);
assert.equal(G(25), 15);

const originalPages = corpus.pages.filter((p) => p.page <= 55);
assert.equal(originalPages.reduce((sum, p) => sum + p.indices.length, 0), 12956);
const ciphertext = corpus.pages
  .filter((p) => p.page >= PAGE_FIRST && p.page <= PAGE_LAST)
  .flatMap((p) => p.indices);
assert.equal(ciphertext.length, 3008);

const bounds = Array.from({ length: MOD }, (_, seed) => invariant(ciphertext, seed));
const maxima = K.map((_, j) => Math.max(...bounds.map((result) => result.bound[j])));
const minima = K.map((_, j) => Math.min(...bounds.map((result) => result.bound[j])));
assert.deepEqual(maxima, [233, 424, 602, 925, 1487, 2060]);
assert.deepEqual(minima, [229, 418, 594, 916, 1479, 2053]);
assert.equal(synchronizationPrefix(ciphertext), 133);
assert.equal(new Set(bounds.map((result) => result.finalState)).size, 1);

// One independent native-GP English positive from historically solved Cicada.
const english = solved.sections.flatMap((section) => [...section.source_text]
  .filter((rune) => runeLookup.has(rune))
  .map((rune) => runeLookup.get(rune)));
assert.equal(english.length, 2979);
const englishTop = topCounts(english);
assert.deepEqual(englishTop, [380, 636, 853, 1248, 1958, 2488]);
assert.ok(K.every((_, j) => maxima[j] < englishTop[j]));

// The second language control uses a separately pinned, actual GP29 Latin
// whole-word corpus. Its digit alphabet is GP ordinals 0..28.
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRS';
const latinWords = latinSource.split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => /^[0-9A-S]+$/.test(line));
const latin = latinWords.flatMap((word) => [...word].map((character) => alphabet.indexOf(character)));
assert.equal(latin.length, 204802);
const latinWindows = [];
for (let offset = 0; offset + 3008 <= latin.length; offset += 3008) {
  latinWindows.push(topCounts(latin.slice(offset, offset + 3008)));
}
assert.equal(latinWindows.length, 68);
const nativeMinimum = K.map((_, j) => Math.min(...latinWindows.map((v) => v[j])));
assert.deepEqual(nativeMinimum, [328, 635, 933, 1438, 2201, 2743]);
assert.ok(K.every((_, j) => maxima[j] < nativeMinimum[j]));


const physicalPages = corpus.pages.filter(
  (p) => p.page >= PAGE_FIRST && p.page <= PAGE_LAST && p.indices.length,
);
assert.deepEqual(physicalPages.map((p) => p.page),
  [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 52, 53]);
const relaxations = pageRekeyCapacities(
  ciphertext, physicalPages.map((p) => p.indices.length),
);
assert.deepEqual(relaxations.envelopes, [
  [233, 424, 602, 925, 1487, 2060],
  [302, 545, 762, 1136, 1747, 2327],
  [348, 627, 868, 1280, 1927, 2500],
  [393, 702, 965, 1414, 2075, 2646],
]);
assert.deepEqual(relaxations.p50Seam, [284, 522, 737, 1096, 1684, 2253]);
assert.ok(relaxations.envelopes.every((limits) => limits.some(
  (limit, j) => limit < nativeMinimum[j],
)));


/* Independent English-language profile exclusion with source-calibrated
 * 2014/2016 Gematria Primus orthography; exact 3008-rune disjoint windows.
 */
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');
const englishBooks = [
  {name:'Shakespeare',file:'resources/control/shakespeare_first300k.txt',
    nativeRunes:217106,windows:72,rejection:[72,72,63,3],minimum:[296,558,781,1162,1823,2440]},
  {name:'Gibran',file:'resources/control/gibran_prophet_58585.txt',
    nativeRunes:62492,windows:20,rejection:[20,20,19,0],minimum:[314,578,812,1228,1888,2467]},
  {name:'Emerson',file:'resources/control/emerson_essays_2944.txt',
    nativeRunes:321327,windows:106,rejection:[106,106,106,12],minimum:[318,564,793,1221,1928,2462]},
];
const englishRejected = [0,0,0,0];
let englishWindowCount = 0;
for (const book of englishBooks) {
  const text = fs.readFileSync(path.join(root,book.file),'utf8');
  const encoded = encodeSourceNativeGP(text);
  assert.equal(encoded.length,book.nativeRunes,book.name);
  const windows=[];
  for (let start=0;start+ciphertext.length<=encoded.length;start+=ciphertext.length) {
    windows.push(topCounts(encoded.slice(start,start+ciphertext.length)));
  }
  assert.equal(windows.length,book.windows,book.name);
  assert.deepEqual(K.map((_,j)=>Math.min(...windows.map(row=>row[j]))),
    book.minimum,book.name+' profile minima');
  const rejection=relaxations.envelopes.map(upper=>windows.filter(
    row=>row.some((count,j)=>count>upper[j])
  ).length);
  assert.deepEqual(rejection,book.rejection,book.name+' rekey profile exclusion');
  for (let i=0;i<4;i++)englishRejected[i]+=rejection[i];
  englishWindowCount+=windows.length;
}
assert.equal(englishWindowCount,198);
assert.deepEqual(englishRejected,[198,198,188,15]);


/**
 * A separately frozen source-motivated word-local five-back clock:
 * for printed word position j<5 use delta=C[j], otherwise
 * delta=C[j]-C[j-5] within THAT word.  Hidden state and its arbitrary
 * permutation continue across words and original printed pages.
 *
 * The printed word masks are reconstructed across actual original page
 * wraps rather than splitting carried words at every page boundary.
 *
 * @param {number[][]} words
 * @param {number} seed
 * @returns {{plainBound:number[],seamBound:number[],encodedStates:number[]}}
 */
function wordLocalBounds(words, seed) {
  let state = seed;
  let position = 0;
  const plainRows = Array.from({length:MOD},()=>Array(MOD).fill(0));
  const seamRows = Array.from({length:MOD*2},()=>Array(MOD).fill(0));
  const encodedStates = [];
  for (const word of words) {
    for (let j=0;j<word.length;j++) {
      const c=word[j];
      plainRows[state][c]++;
      seamRows[state+(position>=2474?MOD:0)][c]++;
      encodedStates.push(state);
      state=mod(G(state)+c-(j>=5?word[j-5]:0));
      position++;
    }
  }
  assert.equal(position,3008);
  /** @param {number[][]} rows @returns {number[]} */
  function cap(rows) {
    const sorted=rows.map(row=>row.slice().sort((a,b)=>b-a));
    return K.map(k=>sorted.reduce(
      (sum,row)=>sum+row.slice(0,k).reduce((a,b)=>a+b,0),0));
  }
  return {plainBound:cap(plainRows),seamBound:cap(seamRows),encodedStates};
}

const joinedText=fs.readFileSync(
  path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8'
).split('%').slice(40,53).join('').replace(/\/\s*/g,'').replace(/[\r\n]/g,'');
const sourceRune=new Map(corpus.runes.map((r,i)=>[r,i]));
const wordRegex=new RegExp('['+corpus.runes.join('')+']+','gu');
const sourceWords=(joinedText.match(wordRegex)||[]).map(
  w=>[...w].map(g=>sourceRune.get(g))
);
assert.equal(sourceWords.length,669);
assert.deepEqual(sourceWords.flat(),ciphertext);
const sourceWordCap=Array.from({length:MOD},(_,seed)=>wordLocalBounds(sourceWords,seed));
const wordLocalMax=K.map((_,j)=>Math.max(...sourceWordCap.map(x=>x.plainBound[j])));
const wordLocalSeamMax=K.map((_,j)=>Math.max(...sourceWordCap.map(x=>x.seamBound[j])));
assert.deepEqual(wordLocalMax,[232,436,615,942,1503,2070]);
assert.deepEqual(wordLocalSeamMax,[283,520,729,1092,1684,2267]);
assert.ok(englishBooks.every(book=>wordLocalMax[0]<book.minimum[0]));
assert.ok(englishBooks.every(book=>wordLocalSeamMax[0]<book.minimum[0]));
assert.ok(wordLocalSeamMax[0]<nativeMinimum[0]);

// Exact, independent native-GP forward/inverse plant for word-local state.
let wordCipher=[],wordRecovered=[],nativePos=0,plantState=24;
for(const word of sourceWords)for(let j=0;j<word.length;j++){
  const p=latin[nativePos];
  const a=1+(7*plantState)%28,b=mod(13*plantState+5);
  const c=mod(inverse(a)*(p-b));
  wordCipher.push(c);
  wordRecovered.push(mod(a*c+b));
  plantState=mod(G(plantState)+c-(j>=5?wordCipher[nativePos-5]:0));
  nativePos++;
}
assert.equal(nativePos,3008);
assert.deepEqual(wordRecovered,latin.slice(0,3008));

// Source-shaped positive plant: every secret alphabet is correctly inverted,
// and the SAME necessary bound includes its true plaintext symbol counts.
const nativePlain = latin.slice(0, ciphertext.length);
const positive = plant(nativePlain, 24);
assert.deepEqual(positive.recovered, nativePlain);
const plantedLimit = invariant(positive.cipher, 24).bound;
const plantedTop = topCounts(nativePlain);
assert.ok(K.every((_, j) => plantedLimit[j] >= plantedTop[j]));

// A genuine model has a repeated-state row-permutation inverse. The
// invariant is derived before any key search; source-original failure cannot
// be repaired by changing any of the 29 secret row permutations.
console.log('PASS: original source p39 red G(x)=[27,5,15], root=24');
console.log('Original p40-53: 3008 ciphertext runes, 29/29 arbitrary IVs');
console.log('All-seed maximum top-k capacities:', JSON.stringify(maxima));
console.log('All-seed minimum top-k capacities:', JSON.stringify(minima));
console.log('All 29 states synchronize at original chapter prefix length 133');
console.log('Authenticated solved-GP English counts (2979):', JSON.stringify(englishTop));
console.log('Latin 68 x 3008-rune control minima:', JSON.stringify(nativeMinimum));
console.log('Envelope with 0, 1, 2, 3 best-placed physical-page rekeys:', JSON.stringify(relaxations.envelopes));
console.log('One actual p50 numeric-table rekey (all 29 seeds):', JSON.stringify(relaxations.p50Seam));
console.log('Calibrated English exclusion (0..3 rekeys) across 198 windows:', JSON.stringify(englishRejected));
console.log('Word-local five-back 0-rekey and exact p50-seam maxima:', JSON.stringify([wordLocalMax,wordLocalSeamMax]));
console.log('Positive native-Latin plant 3008/3008 inverted; bound dominates true top-k');
console.log('Decision: continuous GF29 G-state five-back one-row-per-state cipher');
console.log('cannot generate these native-GP language profiles; original key not found.');
