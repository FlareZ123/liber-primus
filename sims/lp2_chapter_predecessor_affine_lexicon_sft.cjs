'use strict';

/**
 * Source-native constraint gate for chapter-local, predecessor-ciphertext-keyed
 * affine GP29 substitution. Node.js 22 CommonJS, dependency-free.
 *
 * Execute from repository root:
 *   node sims/lp2_chapter_predecessor_affine_lexicon_sft.cjs
 *
 * Every candidate key remains unknown to the solver. Domains initially contain
 * all 28*29 reversible affine rows. All printed complete source words of length
 * at most five are restricted to the frozen native GP dictionary. Grouped
 * repeated predecessor symbols within a word are constrained to share one row.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const lexiconText = read('resources/control/english_wordfreq_textblob.txt');
const runeIndex = new Map(corpus.runes.map((c, i) => [c, i]));
const translit = corpus.translit.map((symbol, i) => ({symbol, i}))
  .sort((a, b) => b.symbol.length - a.symbol.length);
const CHAPTERS = [[0,2], [3,7], [8,14], [15,22], [23,26],
  [27,32], [33,39], [40,52], [53,54]];
const WIDE = process.argv.includes('--wide');
const LIMIT = WIDE ? 14 : 5;
const SIZE = 29;

/** @param {number} x @returns {number} */
const mod = x => ((x % SIZE) + SIZE) % SIZE;

/**
 * Encode one unpunctuated Latin English word under the existing repository
 * source-calibrated native GP29 convention.
 * @param {string} raw
 * @returns {number[]|null}
 */
function encode(raw) {
  const s = raw.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const out = [];
  for (let j = 0; j < s.length;) {
    const hit = translit.find(x => s.startsWith(x.symbol, j));
    if (!hit) return null;
    out.push(hit.i);
    j += hit.symbol.length;
  }
  return out;
}

// Source lexicon is frozen, not conditioned on the ciphertext. Permit every
// attested 2-5-rune dictionary form, including rare/abbreviated source entries.
// Original single-rune printed English words must be native A, I or O.
const byLength = Array.from({length: LIMIT + 1}, () => new Map());
for (const word of lexiconText.match(/^[A-Za-z]+/gm) || []) {
  const indices = encode(word);
  if (indices && indices.length <= LIMIT)
    byLength[indices.length].set(indices.join(','), indices);
}
byLength[1] = new Map([[3, [3]], [10, [10]], [24, [24]]]);
const native = byLength.map(m => [...m.values()]);
assert.deepEqual(native.map(a => a.length), WIDE ?
  [0,3,188,752,2123,3613,4657,4776,4325,3397,2388,1450,767,379,153] :
  [0,3,188,752,2123,3613]);

/** @typedef {{page:number,offset:number,prev:number|null,c:number[],ordinal:number}} Word */
/** @returns {Word[]} */
function parseWords() {
  let page = 0, pageOffset = 0, lastPage = -1, lastCipher = null;
  let startPage = 0, startOffset = 0, previous = null;
  let current = [], sourceGlyphs = 0;
  /** @type {Word[]} */
  const words = [];
  function finish() {
    if (current.length) words.push({
      page: startPage, offset: startOffset, prev: previous,
      c: current, ordinal: words.length
    });
    current = [];
  }
  for (const ch of transcript.split('%').slice(0, 55).join('%')) {
    const rune = runeIndex.get(ch);
    if (rune !== undefined) {
      if (current.length === 0) {
        startPage = page;
        startOffset = pageOffset;
        previous = lastPage === page ? lastCipher : null;
      }
      current.push(rune);
      lastPage = page;
      lastCipher = rune;
      pageOffset++;
      sourceGlyphs++;
    } else if (ch === '%') {
      page++;
      pageOffset = 0;
    } else if (ch === '/' || /\s/u.test(ch)) {
      // Source line/physical page continuation does not end a printed word.
    } else finish();
  }
  finish();
  assert.equal(sourceGlyphs, 12956);
  assert.equal(words.length, 2896);
  assert.equal(words.reduce((n,w) => n + w.c.length, 0), 12956);
  assert.equal(words.filter(w => w.c.length === 1).length, 83);
  return words;
}
const words = parseWords();

/** @typedef {{a:number,b:number,inv:number}} Key */
/** @type {Key[]} */
const keys = [];
for (let a = 1; a < SIZE; a++) {
  let inv = 0;
  for (let j = 1; j < SIZE; j++) if ((a * j) % SIZE === 1) inv = j;
  assert(inv > 0);
  for (let b = 0; b < SIZE; b++) keys.push({a,b,inv});
}
assert.equal(keys.length, 812);

/** @type {Uint8Array[][]} */
const plainFor = Array.from({length: SIZE}, (_, prev) =>
  Array.from({length: SIZE}, (_, c) =>
    Uint8Array.from(keys, k => mod(k.inv * (c - prev - k.b)))));

/**
 * One exact word-domain constraint: repeated predecessor states have the
 * same affine row, so all their rune positions must agree simultaneously.
 * @param {Word} w
 */
function constraint(w) {
  const states = new Map();
  let prev = w.prev;
  for (let pos = 0; pos < w.c.length; pos++) {
    if (!states.has(prev)) states.set(prev, []);
    states.get(prev).push({pos, cipher: w.c[pos]});
    prev = w.c[pos];
  }
  return {
    source: {page:w.page, offset:w.offset, ordinal:w.ordinal,
      count:w.c.length, values:w.c.join(',')},
    groups: [...states].map(([state, positions]) => ({state, positions})),
    choices: native[w.c.length]
  };
}

/**
 * Exact safe filtering on each printed word. A surviving domain may contain
 * keys that cannot all be selected together. An empty word support or empty
 * key domain is, however, an exact impossibility certificate.
 * @param {Word[]} sourceWords
 * @param {number} maxWordLength
 * @returns {{possible:boolean,rounds:number,selectedWords:number,
 *  firstConflict?:object,domains:number[][],remainingKeys:number}}
 */
function analyze(sourceWords, maxWordLength) {
  const selected = sourceWords.filter(w => w.prev !== null &&
    w.c.length <= maxWordLength).map(constraint);
  const domains = Array.from({length: SIZE}, () =>
    Array.from({length: keys.length}, (_, i) => i));
  let rounds = 0, changed = true;
  while (changed && rounds < 40) {
    rounds++;
    changed = false;
    for (const word of selected) {
      const lookup = word.groups.map(({state, positions}) => {
        const m = new Map();
        for (const key of domains[state]) {
          const signature = positions
            .map(({cipher}) => plainFor[state][cipher][key]).join(',');
          let ids = m.get(signature);
          if (!ids) { ids = []; m.set(signature, ids); }
          ids.push(key);
        }
        return m;
      });
      const admitted = word.groups.map(() => new Set());
      let choices = 0;
      for (const candidate of word.choices) {
        const signatures = word.groups.map(({positions}) =>
          positions.map(({pos}) => candidate[pos]).join(','));
        if (signatures.some((signature, i) => !lookup[i].has(signature)))
          continue;
        choices++;
        signatures.forEach((signature, i) => admitted[i].add(signature));
      }
      if (choices === 0) {
        return {possible:false, rounds, selectedWords:selected.length,
          firstConflict:word.source, domains, remainingKeys:0};
      }
      for (let i = 0; i < word.groups.length; i++) {
        const state = word.groups[i].state;
        const next = [...admitted[i]]
          .flatMap(signature => lookup[i].get(signature))
          .sort((a,b) => a-b);
        if (next.length < domains[state].length) {
          domains[state] = next;
          changed = true;
        }
      }
    }
  }
  assert(rounds < 40, 'GAC did not converge');
  return {possible:true, rounds, selectedWords:selected.length,
    domains, remainingKeys:domains.reduce((n,a) => n + a.length, 0)};
}

/**
 * Native-text positive plant using original exact word-length shapes and
 * independent 29 unknown affine row keys. Later words depend on the actual
 * ciphertext output, so this exercises the state feedback and row unification.
 * @param {Word[]} source
 * @param {number} chapter
 */
function plant(source, chapter) {
  const seed = chapter + 17;
  const hiddenIds = Array.from({length: SIZE}, (_, state) =>
    ((1 + (7 * state + seed) % 28) - 1) * 29 +
      ((13 * state + 3 * seed) % 29));
  /** @type {Word[]} */
  const planted = [];
  let lastCipher = 0, positions = 0;
  for (const original of source) {
    if (original.prev === null) lastCipher = 0;
    const previous = original.prev === null ? null : lastCipher;
    const len = original.c.length;
    const plain = len <= LIMIT ?
      native[len][(original.ordinal * 37 + chapter * 97) % native[len].length] :
      Array.from({length:len}, (_, i) => (i + chapter) % SIZE);
    const ciphertext = plain.map(p => {
      const k = keys[hiddenIds[lastCipher]];
      const c = mod(lastCipher + k.a * p + k.b);
      assert.equal(mod(k.inv * (c - lastCipher - k.b)), p);
      lastCipher = c;
      positions++;
      return c;
    });
    planted.push({...original, prev:previous, c:ciphertext});
  }
  assert.equal(positions, source.reduce((a,w) => a+w.c.length,0));
  const result = analyze(planted, LIMIT);
  assert(result.possible, 'Native-key planted original-layout prose must survive');
  for (let row = 0; row < SIZE; row++)
    assert(result.domains[row].includes(hiddenIds[row]),
      'True planted secret affine key pruned from row ' + row);
  return {nativeWords:result.selectedWords, runes:positions,
    compatibleKeys:result.remainingKeys};
}

// New source certificate on p33-39: genuine singleton source words at p35,
// p35 and p38 share previous GP G=6, but no affine row can produce their three
// distinct ciphertext symbols from English standalone A/I/O in any order.
const witness = [{page:35,offset:124,c:4}, {page:35,offset:243,c:7},
  {page:38,offset:74,c:12}];
for (const q of witness) {
  const matches = words.filter(w => w.page === q.page &&
    w.offset === q.offset && w.c.length === 1);
  assert.equal(matches.length,1);
  assert.equal(matches[0].prev,6);
  assert.equal(matches[0].c[0],q.c);
  assert.equal(corpus.pages[q.page].indices[q.offset],q.c);
}
const target = witness.map(w => w.c).sort((a,b) => a-b);
const matchingRowKeys = keys.filter(k => {
  const values = [3,10,24].map(p => mod(6 + k.a*p + k.b))
    .sort((a,b) => a-b);
  return values.every((v,i) => v === target[i]);
});
assert.equal(matchingRowKeys.length,0);

// A fresh independent affine positive, which the same all-812-key singleton
// certificate accepts without being told the secret (a,b).
const knownKey = {a:17,b:9};
const generated = [3,10,24].map(p =>
  mod(6 + knownKey.a * p + knownKey.b)).sort((a,b)=>a-b);
assert(keys.some(k => [3,10,24].map(p => mod(6+k.a*p+k.b))
  .sort((a,b)=>a-b).every((v,i)=>v===generated[i])));

if (WIDE) {
  for (const chapter of [0, 8]) {
    const [from,to] = CHAPTERS[chapter];
    const source = words.filter(w => w.page >= from && w.page <= to);
    for (let length = 5; length <= LIMIT; length++) {
      const result = analyze(source, length);
      console.log('WIDE', JSON.stringify({chapter:chapter+1, maxLength:length,
        selectedWords:result.selectedWords, possible:result.possible,
        firstConflict:result.firstConflict || null,
        remainingKeys:result.remainingKeys}));
      if (!result.possible) break;
    }
    console.log('WIDE_POSITIVE',JSON.stringify({chapter:chapter+1, ...plant(source,chapter)}));
  }
  process.exit(0);
}

const table = [];
const expectedFirstReject = [null,4,3,3,4,3,1,1,null];
const expectedNativeWords = [102,156,161,195,132,144,9,13,44];
for (let chapter = 0; chapter < CHAPTERS.length; chapter++) {
  const [from,to] = CHAPTERS[chapter];
  const source = words.filter(w => w.page >= from && w.page <= to);
  assert.equal(source.reduce((n,w)=>n+w.c.length,0),
    [729,1145,1729,1903,1021,1433,1680,3008,308][chapter]);
  // Produce the first contradiction threshold without fitting any source word.
  let firstReject = null, result = null;
  for (let len = 1; len <= LIMIT; len++) {
    result = analyze(source, len);
    if (!result.possible) {firstReject = len;break;}
  }
  assert.equal(firstReject, expectedFirstReject[chapter],
    'Original fixed native-lexicon affine capacity changed');
  assert.equal(result.selectedWords, expectedNativeWords[chapter]);
  const positive = plant(source, chapter);
  table.push({
    chapter:chapter+1, sourcePages:[from,to],
    testedWordLength:firstReject || LIMIT,
    sourceWords:result.selectedWords,
    impossible:firstReject !== null,
    conflict:result.firstConflict || null,
    feasibleDomainKeys:result.possible ? result.remainingKeys : null,
    independentNativePositive:positive
  });
  console.log('CHAPTER', chapter+1, 'pages', from+'-'+to,
    'first fail length',firstReject,
    'source selected words',result.selectedWords,
    'native positive',positive.nativeWords,
    'result',result.firstConflict || result.remainingKeys);
}
assert.equal(table.filter(x=>x.impossible).length,7);
console.log(JSON.stringify({
  status:'EXACT FINITE NATIVE DICTIONARY EXCLUSION; NO UNKNOWN PLAINTEXT',
  hypothesis:'Chapter-independent secret affine rows selected by previous printed ciphertext rune',
  affineCipher:'C_i=C_(i-1)+a_prev*P_i+b_prev mod29, a_prev nonzero',
  sourceCipherRunes:12956, printedWords:2896,
  singletonChapter7Witness:witness,
  chapter7All812KeysMatchZero:true,
  completeOriginalChapterExclusions:7,
  originalSurvivors:[1,9],
  positiveControls:'All nine original-length source-shaped encrypted native-English plants retain all 29 true secret row keys',
  nativeDictionarySizes:native.map(x=>x.length),
  chapters:table
},null,2));
