'use strict';
/**
 * Original-source test of line-framed GP29 enumerative anti-repeat coding.
 * Run: node sims/lp2_line_framed_enumerative_original_sft.cjs
 * The exact per-line repeat/seam schedules are observed in ciphertext and
 * therefore post-selected, not an authenticated historical encoder rule.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const raw = read('resources/liber-primus/lp2-transcription.txt');
const donor = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const dictText = read('resources/control/english_wordfreq_textblob.txt');
const id = new Map(corpus.runes.map((r, i) => [r, i]));
assert.equal(corpus.runes.length, 29);

const pageTexts = raw.split('%').slice(0, 55);
assert.equal(pageTexts.length, 55);
const lines = [];
const pageStart = new Map(), pageCount = new Map();
for (const [section, text] of pageTexts.entries()) {
  const page = section < 50 ? section : section + 1;
  const printed = text.split('/').filter(s => [...s].some(c => id.has(c)));
  pageStart.set(page, lines.length);
  pageCount.set(page, printed.length);
  const decoded = printed.map(s => [...s].filter(c => id.has(c)).map(c => id.get(c)));
  assert.deepEqual(decoded.flat(), corpus.pages.find(p => p.page === page).indices);
  for (const [line, runes] of decoded.entries()) lines.push({ page, line, runes });
}
const N = lines.reduce((s, x) => s + x.runes.length, 0);
assert.equal(lines.length, 594);
assert.equal(N, 12956);

const previous = lines.map((x, i) => i ? lines[i - 1].runes.at(-1) : null);
const fixedSizes = lines.map((x, i) => i === 0 ? 29 : (x.runes[0] === previous[i] ? 1 : 28));
const internalCounts = lines.map(x => x.runes.slice(1).filter((v, i) => v === x.runes[i]).length);
const distribution = Object.fromEntries([...new Set(internalCounts)].sort((a,b)=>a-b)
  .map(k => [k, internalCounts.filter(v => v === k).length]));
const lineStartRepeats = fixedSizes.slice(1).filter(x => x === 1).length;
const pageBoundaryRepeats = lines.slice(1).filter((x, i) =>
  x.page !== lines[i].page && x.runes[0] === lines[i].runes.at(-1)).length;
assert.deepEqual(distribution, {0:515, 1:76, 2:3});
assert.equal(internalCounts.reduce((a,b)=>a+b,0), 82);
assert.equal(lineStartRepeats, 4);
assert.equal(pageBoundaryRepeats, 0);

function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let v = 1n;
  for (let i = 1; i <= k; i++) v = v * BigInt(n + 1 - i) / BigInt(i);
  return v;
}
const pow = (b, n) => BigInt(b) ** BigInt(n);
const bitLength = x => x === 0n ? 0 : x.toString(2).length;
function log2BigInt(x) {
  const bits = x.toString(2), head = bits.slice(0, 52);
  return Math.log2(Number(BigInt('0b' + head))) + bits.length - head.length;
}
const toBase29 = a => a.reduce((v, d) => v * 29n + BigInt(d), 0n);
function fromBase(x, b, n) {
  const a = Array(n);
  for (let i = n - 1; i >= 0; i--) { a[i] = Number(x % b); x /= b; }
  assert.equal(x, 0n);
  return a;
}
const rankWithout = (x, p) => x - (x > p ? 1 : 0);
const unrankWithout = (r, p) => r + (r >= p ? 1 : 0);
const repeatsIn = a => a.slice(1).filter((v, i) => v === a[i]).length;

function pack(a, prev, firstSize) {
  const L = a.length, e = repeatsIn(a), t = L - 1 - e;
  let A;
  if (firstSize === 29) A = a[0];
  else if (firstSize === 1) { assert.equal(a[0], prev); A = 0; }
  else { assert.equal(firstSize, 28); assert.notEqual(a[0], prev); A = rankWithout(a[0], prev); }
  let B = 0n, k = 0, D = 0n;
  for (let j = 1; j < L; j++) {
    if (a[j] === a[j - 1]) B += choose(j - 1, ++k);
    else D = D * 28n + BigInt(rankWithout(a[j], a[j - 1]));
  }
  assert.equal(k, e);
  const b = choose(L - 1, e), d = pow(28, t), M = BigInt(firstSize) * b * d;
  const r = (BigInt(A) * b + B) * d + D;
  assert(r < M);
  return { L, e, t, firstSize, M, r };
}
function unpack(r, L, e, prev, firstSize) {
  const t = L - 1 - e, b = choose(L - 1, e), d = pow(28, t);
  let D = r % d; r /= d;
  let B = r % b; r /= b;
  const A = Number(r);
  assert(A < firstSize);
  const equalGaps = new Set();
  let ceiling = L - 1;
  for (let k = e; k >= 1; k--) {
    let j = ceiling - 1;
    while (choose(j, k) > B) j--;
    equalGaps.add(j); B -= choose(j, k); ceiling = j;
  }
  assert.equal(B, 0n);
  const ds = fromBase(D, 28n, t);
  const first = firstSize === 29 ? A : firstSize === 1 ? prev : unrankWithout(A, prev);
  const out = [first];
  let q = 0;
  for (let j = 1; j < L; j++) {
    if (equalGaps.has(j - 1)) out.push(out.at(-1));
    else out.push(unrankWithout(ds[q++], out.at(-1)));
  }
  assert.equal(q, t);
  return out;
}

const words = [];
let word = [];
function endWord() { if (word.length) words.push(word); word = []; }
for (const c of [...pageTexts.join('%')]) {
  if (id.has(c)) word.push(id.get(c));
  else if (c === '%' || c === '/' || /\s/u.test(c)) continue;
  else endWord();
}
endWord();
assert.equal(words.length, 2896);
assert.equal(words.reduce((s, w) => s + w.length, 0), N);

const lexicon = new Set();
const spellings = corpus.translit.map((s, i) => [s, i]).concat([['ING', 21], ['IO', 27]]);
for (const line of dictText.split(/\r?\n/)) {
  const m = /^([a-z]+)\s+\d+\s*$/.exec(line);
  if (!m) continue;
  const w = m[1].toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S');
  function walk(p, a) {
    if (p === w.length) { lexicon.add(a.join(',')); return; }
    if (a.length >= 14) return;
    for (const [token, symbol] of spellings) if (w.startsWith(token, p)) walk(p + token.length, a.concat(symbol));
  }
  walk(0, []);
}
assert.equal(lexicon.size, 40575);

function ioc(a) {
  const f = Array(29).fill(0);
  for (const x of a) f[x]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
}
const donorRunes = donor.sections.flatMap(s =>
  (s.source_text.match(/[ᚠ-᛿]+/gu) || []).flatMap(w => [...w].map(c => id.get(c)).filter(Number.isInteger))
);
assert.equal(donorRunes.length, 2979);

function plantControl(rows, sizes) {
  const plant = Array.from({length:N}, (_, i) => donorRunes[i % donorRunes.length]);
  const ciphertext = [];
  let state = 3301n, prev = null, offset = 0;
  for (let i = 0; i < lines.length; i++) {
    const row = rows[i], chunk = plant.slice(offset, offset + row.L);
    const v = state * pow(29, row.L) + toBase29(chunk);
    const r = v % row.M;
    const c = unpack(r, row.L, row.e, prev, sizes[i]);
    assert.equal(pack(c, prev, sizes[i]).r, r);
    ciphertext.push(c); prev = c.at(-1); state = v / row.M; offset += row.L;
  }
  const terminal = state;
  let decodeState = terminal;
  const recovered = Array(lines.length);
  for (let i = lines.length - 1; i >= 0; i--) {
    const prevCipher = i ? ciphertext[i - 1].at(-1) : null;
    const row = pack(ciphertext[i], prevCipher, sizes[i]);
    const v = decodeState * row.M + row.r;
    recovered[i] = fromBase(v % pow(29, row.L), 29n, row.L);
    decodeState = v / pow(29, row.L);
  }
  assert.equal(decodeState, 3301n);
  assert.deepEqual(recovered.flat(), plant);
  return { donorRunes: donorRunes.length, plantedRunes: N, initialState: '3301',
    terminalStateBits: bitLength(terminal), recoveredInitialState: decodeState.toString(), exact: true };
}

function runMode(name, sizes) {
  const rows = lines.map((x, i) => pack(x.runes, previous[i], sizes[i]));
  let Pprod = 1n, Mprod = 1n, logRatio = 0, rankBelowP = 0;
  for (const row of rows) {
    const P = pow(29, row.L);
    Pprod *= P; Mprod *= row.M;
    logRatio += log2BigInt(row.M) - log2BigInt(P);
    if (row.r < P) rankBelowP++;
  }
  const stateCount = (Pprod + Mprod - 1n) / Mprod;
  const privateBits = bitLength(stateCount - 1n);
  let carry = 0n;
  const plainLines = Array(lines.length);
  for (let i = lines.length - 1; i >= 0; i--) {
    const row = rows[i], P = pow(29, row.L), v = carry * row.M + row.r;
    plainLines[i] = fromBase(v % P, 29n, row.L);
    carry = v / P;
  }
  const initial = carry;
  assert.equal(initial, 0n);
  assert.equal(rankBelowP, lines.length);
  let state = initial, forward = true, unrankExact = true;
  for (let i = 0; i < lines.length; i++) {
    const row = rows[i], prev = sizes[i] === 29 ? null : previous[i];
    if (JSON.stringify(unpack(row.r, row.L, row.e, prev, sizes[i])) !== JSON.stringify(lines[i].runes)) unrankExact = false;
    const v = state * pow(29, row.L) + toBase29(plainLines[i]);
    if (v % row.M !== row.r) forward = false;
    state = v / row.M;
  }
  assert.equal(state, 0n);
  assert(unrankExact && forward);

  const flat = plainLines.flat();
  let offset = 0;
  const decodedWords = words.map(w => {
    const out = flat.slice(offset, offset + w.length);
    offset += w.length;
    return out;
  });
  const longWords = decodedWords.filter(w => w.length >= 5);
  const longHits = longWords.filter(w => lexicon.has(w.join(',')));
  const allHits = decodedWords.filter(w => lexicon.has(w.join(',')));

  function pageSummary(p) {
    const start = pageStart.get(p), count = pageCount.get(p);
    const symbols = plainLines.slice(start, start + count).flat();
    return { runes: symbols.length, ioc: Number(ioc(symbols).toFixed(9)),
      prefix80: symbols.slice(0, 80).map(x => corpus.translit[x]).join('') };
  }

  return {
    name,
    firstSizeCounts: Object.fromEntries([...new Set(sizes)].sort((a,b)=>a-b)
      .map(k => [k, sizes.filter(x => x === k).length])),
    repeatEvents: rows.reduce((s, r) => s + r.e, 0) + sizes.slice(1).filter(x => x === 1).length,
    log2CodebookOverMessage: Number(logRatio.toFixed(6)),
    requiredPrivateStateBits: privateBits,
    rankBelowMessageSpace: rankBelowP,
    initialState: initial.toString(),
    terminalState: '0',
    exactOriginalUnrank: unrankExact,
    exactForwardReplay: forward,
    ioc: Number(ioc(flat).toFixed(9)),
    wordCount: decodedWords.length,
    longWordCount: longWords.length,
    dictionaryHitsAllWords: allHits.length,
    dictionaryHitsLongWords: longHits.length,
    p0: pageSummary(0),
    p16: pageSummary(16),
    outputPrefix400: flat.map(x => corpus.translit[x]).join('').slice(0, 400),
    nativePositiveControl: plantControl(rows, sizes)
  };
}

const freeHead = runMode('free-head-at-every-line', lines.map(() => 29));
const fixedSeam = runMode('continuous-seam-across-lines', fixedSizes);
assert.equal(freeHead.repeatEvents, 82);
assert.equal(freeHead.requiredPrivateStateBits, 662);
assert.equal(freeHead.dictionaryHitsLongWords, 0);
assert(Math.abs(freeHead.ioc - 0.034551775) < 1e-9);
assert.equal(fixedSeam.repeatEvents, 86);
assert.equal(fixedSeam.requiredPrivateStateBits, 711);
assert.equal(fixedSeam.dictionaryHitsLongWords, 0);
assert(Math.abs(fixedSeam.ioc - 0.034577978) < 1e-9);

console.log(JSON.stringify({
  source: { pages: 55, lines: lines.length, runes: N, printedWords: words.length,
    lineLengthMin: Math.min(...lines.map(x => x.runes.length)),
    lineLengthMax: Math.max(...lines.map(x => x.runes.length)),
    internalRepeatDistribution: distribution, internalRepeats: 82,
    repeatedLineStarts: lineStartRepeats, pageBoundaryRepeats,
    fixedSeamFirstSizeCounts: fixedSeam.firstSizeCounts },
  dictionary: { forms: lexicon.size, longOriginalWordLengths: fixedSeam.longWordCount },
  modes: [freeHead, fixedSeam]
}, null, 2));
