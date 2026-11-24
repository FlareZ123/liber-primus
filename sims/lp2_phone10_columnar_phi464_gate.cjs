'use strict';
/*
 * Source-constrained test:
 * 2014 Stage11 HTML title=133 and div id=331 select LP2 pages 17 and 41
 * modulo the 58-image index. Both selected pages have 273 runes, so the
 * corresponding within-page positions are 133 and 58. The selected runes
 * are I and NG; T9 gives 4||64 = 464 = 133+331.
 *
 * Candidate receiver tested here:
 * - 2012 phone number 2143909608 as a stable-ranked 10-column key;
 * - columnar inverse at word and rune granularity;
 * - the authentic p56 phi(prime) mod 29 cipher, plaintext F transparent,
 *   with the 464th prime (3301) as the zero-based key-stream start (463).
 *
 * No external dependencies. Run from repository root:
 *   node sims/lp2_phone10_columnar_phi464_gate.cjs
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const check = (v, m) => { if (!v) throw new Error(m); };
const mod = x => ((x % 29) + 29) % 29;

const src = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const lextext = read('resources/control/english_wordfreq_textblob.txt');
const html = read('resources/historical/cicada2014-onion7-index.html');

const titleMatch = html.match(/<title>(\d+)<\/title>/i);
const divMatch = html.match(/<div\s+id=["'](\d+)["']/i);
const imageCount = (html.match(/<img\s+src=/gi) || []).length;
check(titleMatch && divMatch && imageCount === 58, '2014 Stage11 HTML selector source mismatch');
const titleValue = Number(titleMatch[1]);
const divValue = Number(divMatch[1]);
check(titleValue === 133 && divValue === 331, 'unexpected 2014 HTML values');

const runeMap = new Map(src.runes.map((r, i) => [r, i]));
const all = [];
const wordSpans = [];
let wordStart = 0;
for (const c of transcript) {
  if (all.length === 12956) break;
  if (runeMap.has(c)) all.push(runeMap.get(c));
  else if (c !== '/' && c !== '%' && !/\s/.test(c) && all.length > wordStart) {
    wordSpans.push([wordStart, all.length]);
    wordStart = all.length;
  }
}
if (wordStart < all.length) wordSpans.push([wordStart, all.length]);
check(all.length === 12956 && wordSpans.length === 2896, 'canonical LP2 corpus counts mismatch');
check(
  all.join(',') === src.pages.slice(0, 56).flatMap(p => p.indices).join(','),
  'transcription and canonical rune corpus disagree'
);

const pages = new Map();
let pageOffset = 0;
for (const p of src.pages.slice(0, 56)) {
  const spans = wordSpans
    .filter(([a, b]) => a >= pageOffset && b <= pageOffset + p.indices.length)
    .map(([a, b]) => [a - pageOffset, b - pageOffset]);
  pages.set(p.page, { c: p.indices, spans });
  pageOffset += p.indices.length;
}

const tokens = src.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
function gp(s) {
  s = s.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S')
    .replace(/ING/g, 'NG')
    .replace(/IO/g, 'IA');
  const out = [];
  while (s.length) {
    const t = tokens.find(x => s.startsWith(x.s));
    if (!t) return null;
    out.push(t.i);
    s = s.slice(t.s.length);
  }
  return out;
}

const lex = new Set();
const byLength = Array.from({ length: 20 }, () => []);
for (const line of lextext.split(/\r?\n/)) {
  const m = line.match(/^([a-z]+)\s+\d+$/);
  if (!m) continue;
  const a = gp(m[1]);
  if (!a || a.length >= byLength.length) continue;
  lex.add(a.join(','));
  byLength[a.length].push(a);
}

const page17 = pages.get(133 % imageCount);
const page41 = pages.get(331 % imageCount);
check(page17 && page41, 'selector pages missing from canonical corpus');
const pos17 = titleValue % page17.c.length;
const pos41 = divValue % page41.c.length;
const selectedRune17 = src.translit[page17.c[pos17 - 1]];
const selectedRune41 = src.translit[page41.c[pos41 - 1]];
const t9Groups = {
  A: '2', B: '2', C: '2', D: '3', E: '3', F: '3',
  G: '4', H: '4', I: '4', J: '5', K: '5', L: '5',
  M: '6', N: '6', O: '6', P: '7', Q: '7', R: '7', S: '7',
  T: '8', U: '8', V: '8', W: '9', X: '9', Y: '9', Z: '9'
};
function t9(s) { return s.split('').map(c => t9Groups[c] || '?').join(''); }
const selectorT9 = t9(selectedRune17) + t9(selectedRune41);
const pages273 = src.pages.slice(0, 56).filter(p => p.indices.length === 273).map(p => p.page);
let t9PairCount = 0;
for (const a of page17.c) {
  for (const b of page41.c) {
    if (t9(src.translit[a]) + t9(src.translit[b]) === String(titleValue + divValue)) t9PairCount++;
  }
}
check(page17.c.length === 273 && page41.c.length === 273, 'selected page lengths changed');
check(pos17 === 133 && pos41 === 58, 'selector offsets changed');
check(selectedRune17 === 'I' && selectedRune41 === 'NG', 'selected rune pair changed');
check(selectorT9 === String(titleValue + divValue), 'T9 selector checksum changed');

const phoneDigits = [2, 1, 4, 3, 9, 0, 9, 6, 0, 8];
const phoneOrder = Array.from({ length: 10 }, (_, i) => i)
  .sort((a, b) => phoneDigits[a] - phoneDigits[b] || a - b);

function columnarDecode(items, order) {
  const n = items.length;
  const cols = 10;
  const rows = Math.ceil(n / cols);
  const remainder = n % cols;
  const lengths = Array.from({ length: cols }, (_, c) =>
    rows - (remainder !== 0 && c >= remainder ? 1 : 0)
  );
  const grid = Array.from({ length: rows }, () => Array(cols));
  let k = 0;
  for (const c of order) {
    for (let r = 0; r < lengths[c]; r++) grid[r][c] = items[k++];
  }
  return grid.flat().filter(x => x !== undefined);
}

function columnarEncode(items, order) {
  const n = items.length;
  const cols = 10;
  const rows = Math.ceil(n / cols);
  const grid = Array.from({ length: rows }, () => Array(cols));
  for (let i = 0; i < n; i++) grid[Math.floor(i / cols)][i % cols] = items[i];
  const out = [];
  for (const c of order) {
    for (let r = 0; r < rows; r++) {
      if (grid[r][c] !== undefined) out.push(grid[r][c]);
    }
  }
  return out;
}

function primes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) out.push(n);
  }
  return out;
}

const primeStart = 463; // zero-based index of the 464th prime, 3301
const primeList = primes(primeStart + 273 + 20);
const phi = primeList.map(p => (p - 1) % 29);
check(primeList[primeStart] === 3301, '464th-prime clock selector mismatch');

function encryptFlat(plain, initial = 0) {
  let pointer = initial;
  const out = [];
  for (const p of plain) {
    if (p === 0) out.push(0); // plaintext F is transparent and consumes no key
    else {
      out.push(mod(p + phi[pointer]));
      pointer++;
    }
  }
  return out;
}

function inverseOptions(c, pointer) {
  const out = [];
  if (c === 0) out.push([0, pointer]); // transparent plaintext F
  const p = mod(c - phi[pointer]);
  if (p !== 0) out.push([p, pointer + 1]); // non-F plaintext consumes key
  return out;
}

function exactReachability(cipher) {
  let states = new Set([primeStart]);
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    for (const pointer of states) {
      for (const option of inverseOptions(cipher[i], pointer)) next.add(option[1]);
    }
    if (!next.size) return { full: false, firstDeadRune: i + 1, finalStates: 0 };
    states = next;
  }
  return { full: true, finalStates: states.size, endPointers: Array.from(states).sort((a, b) => a - b) };
}

function bestDictionaryPath(chunks) {
  let states = new Map([[primeStart, { score: 0, plain: [] }]]);
  let processed = 0;
  for (let ci = 0; ci < chunks.length; ci++) {
    const chunk = chunks[ci];
    const next = new Map();
    for (const [pointer, old] of states) {
      function visit(i, q, wordPlain) {
        if (i === chunk.v.length) {
          const score = old.score + (chunk.scoreWord && lex.has(wordPlain.join(',')) ? 1 : 0);
          const prior = next.get(q);
          if (!prior || score > prior.score) {
            next.set(q, { score, plain: old.plain.concat(wordPlain) });
          }
          return;
        }
        for (const [p, nextPointer] of inverseOptions(chunk.v[i], q)) {
          visit(i + 1, nextPointer, wordPlain.concat(p));
        }
      }
      visit(0, pointer, []);
    }
    processed += chunk.v.length;
    states = next;
    if (!states.size) return { full: false, firstDeadChunk: ci + 1, firstDeadRune: processed };
  }
  const best = Array.from(states.values()).sort((a, b) => b.score - a.score)[0];
  const target = chunks.flatMap(c => c.v);
  check(
    encryptFlat(best.plain, primeStart).join(',') === target.join(','),
    'best inverse path failed exact forward replay'
  );
  const counts = Array(29).fill(0);
  for (const x of best.plain) counts[x]++;
  const n = best.plain.length;
  const ioc = counts.reduce((s, x) => s + x * (x - 1), 0) / (n * (n - 1));
  const plainWords = [];
  let at = 0;
  for (const c of chunks) {
    const w = best.plain.slice(at, at + c.v.length);
    if (c.scoreWord) plainWords.push(w.map(x => src.translit[x]).join(''));
    at += c.v.length;
  }
  return {
    full: true,
    score: best.score,
    wordCount: chunks.filter(c => c.scoreWord).length,
    runeCount: n,
    ioc,
    finalStateCount: states.size,
    plainWords
  };
}

function pageData(pageNo) {
  const p = pages.get(pageNo);
  check(p && p.spans.length, 'missing word spans for selected page ' + pageNo);
  for (let i = 1; i < p.spans.length; i++) {
    check(p.spans[i - 1][1] === p.spans[i][0], 'internal unworded gap on selected page ' + pageNo);
  }
  const prefix = p.c.slice(0, p.spans[0][0]);
  const suffix = p.c.slice(p.spans[p.spans.length - 1][1]);
  const body = p.spans.map(([a, b]) => p.c.slice(a, b));
  return { c: p.c, prefix, suffix, body };
}

function transposedWordChunks(pageNo, order) {
  const p = pageData(pageNo);
  const words = columnarDecode(p.body, order);
  const chunks = [];
  if (p.prefix.length) chunks.push({ v: p.prefix, scoreWord: false });
  for (const w of words) chunks.push({ v: w, scoreWord: true });
  if (p.suffix.length) chunks.push({ v: p.suffix, scoreWord: false });
  return chunks;
}

function runPage(pageNo, order, orderName) {
  const p = pageData(pageNo);
  const wordResult = bestDictionaryPath(transposedWordChunks(pageNo, order));
  const runeResult = exactReachability(columnarDecode(p.c, order));
  return {
    page: pageNo,
    runeCount: p.c.length,
    wordCount: p.body.length,
    bodyRuneCount: p.body.flat().length,
    prefixRunes: p.prefix.length,
    suffixRunes: p.suffix.length,
    columnOrder: orderName,
    wordLevel: {
      full: wordResult.full,
      firstDeadChunk: wordResult.firstDeadChunk || null,
      firstDeadRune: wordResult.firstDeadRune || null,
      dictionaryHits: wordResult.score === undefined ? null : wordResult.score,
      dictionaryWords: wordResult.wordCount || null,
      ioc: wordResult.ioc || null
    },
    runeLevel: runeResult
  };
}

const ascending = phoneOrder;
const descending = phoneOrder.slice().reverse();
const results = [];
for (const [order, name] of [[ascending, 'ascending digit-rank'], [descending, 'descending digit-rank']]) {
  results.push(runPage(41, order, name));
  results.push(runPage(17, order, name));
}

const p56KnownWords = (
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'
).split(' ').map(gp);
check(p56KnownWords.every(Boolean), 'p56 known plaintext tokenization failed');
const p56KnownCipher = encryptFlat(p56KnownWords.flat(), 0);
check(
  p56KnownWords.flat().length === 85 &&
  p56KnownCipher.join(',') === src.pages[56].indices.join(','),
  'authentic p56 85/85 positive control failed'
);

const p41Data = pageData(41);
const plantWords = p41Data.body.map(w => byLength[w.length][0]);
check(plantWords.every(w => w && lex.has(w.join(','))), 'synthetic dictionary plant unavailable');
const plantPlain = [
  ...p41Data.prefix,
  ...plantWords.flat(),
  ...p41Data.suffix
];
check(plantPlain.length === 273, 'synthetic plant geometry mismatch');
const plantCipher = encryptFlat(plantPlain, primeStart);
let cursor = p41Data.prefix.length;
const prefixCipher = plantCipher.slice(0, cursor);
const plantCipherWords = [];
for (const w of plantWords) {
  plantCipherWords.push(plantCipher.slice(cursor, cursor + w.length));
  cursor += w.length;
}
const suffixCipher = plantCipher.slice(cursor);
const scrambledCipherWords = columnarEncode(plantCipherWords, ascending);
const unscrambledCipherWords = columnarDecode(scrambledCipherWords, ascending);
const positiveChunks = [];
if (prefixCipher.length) positiveChunks.push({ v: prefixCipher, scoreWord: false });
for (const w of unscrambledCipherWords) positiveChunks.push({ v: w, scoreWord: true });
if (suffixCipher.length) positiveChunks.push({ v: suffixCipher, scoreWord: false });
const wordPositive = bestDictionaryPath(positiveChunks);
const runeScrambled = columnarEncode(plantCipher, ascending);
const runePositive = exactReachability(columnarDecode(runeScrambled, ascending));
const wordRoundTrip = columnarDecode(columnarEncode(plantWords, ascending), ascending)
  .map(w => w.join(',')).join('|') === plantWords.map(w => w.join(',')).join('|');
check(wordRoundTrip, 'columnar word positive control failed');
check(wordPositive.full && wordPositive.score === plantWords.length, 'word-level positive control failed');
check(runePositive.full, 'rune-level positive control failed');

check(pages273.length === 6, 'unexpected 273-rune page multiplicity');
check(results.every(r => !r.wordLevel.full && !r.runeLevel.full), 'candidate unexpectedly has a complete inverse');

const output = {
  selector: {
    htmlTitle: titleValue,
    htmlDivId: divValue,
    imageCount,
    selectedPages: [titleValue % imageCount, divValue % imageCount],
    selectedOffsets1Based: [pos17, pos41],
    selectedRunes: [selectedRune17, selectedRune41],
    t9Codes: [t9(selectedRune17), t9(selectedRune41)],
    t9Concatenation: selectorT9,
    htmlValueSum: titleValue + divValue,
    t9MatchingPositionPairsAcrossSelectedPages: t9PairCount,
    pagesWith273Runes: pages273
  },
  phoneKey: {
    digits: phoneDigits,
    stableAscendingColumnOrder0Based: ascending,
    descendingColumnOrder0Based: descending,
    tieBreak: 'stable left-to-right'
  },
  primeClock: {
    zeroBasedStart: primeStart,
    oneBasedOrdinal: primeStart + 1,
    prime: primeList[primeStart],
    phiMod29AtStart: phi[primeStart]
  },
  sourcePositiveControls: {
    p56KnownRunes: p56KnownWords.flat().length,
    p56CipherRunes: p56KnownCipher.length,
    exactP56Match: true
  },
  candidateResults: results,
  syntheticPositiveControl: {
    page41WordGeometry: plantWords.length,
    runeCount: plantPlain.length,
    wordColumnarRoundTrip: wordRoundTrip,
    wordLevelFullInverse: wordPositive.full,
    dictionaryHits: wordPositive.score,
    dictionaryWords: wordPositive.wordCount,
    runeLevelFullInverse: runePositive.full,
    note: 'F-transparent inverse can be non-unique; the best 60/60 dictionary path is forward-replay verified.'
  },
  conclusion: 'The fixed phone-keyed 10-columnar + p56 phi(prime) start-3301 composition has no complete inverse on p17 or p41 at either word or rune granularity, under ascending or descending digit-rank column order.'
};

process.stdout.write(JSON.stringify(output, null, 2) + '\n');
