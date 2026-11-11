'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const ink = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-ink-annotations.json', 'utf8'));
const transcription = fs.readFileSync('resources/lp2-transcription.txt', 'utf8');

const RUNIC = /[\u16A0-\u16FF]/u;
const pages = corpus.pages.slice().sort((a, b) => a.page - b.page);
const pageByNumber = new Map(pages.map((page) => [page.page, page]));
const runeToIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

const pageStart = [];
let runeTotal = 0;
for (let page = 0; page < 58; page += 1) {
  pageStart[page] = runeTotal;
  runeTotal += pageByNumber.get(page)?.indices.length ?? 0;
}
assert.equal(runeTotal, 13136);

const thirteenDotGlobals = [];
for (const page of ink.pages) {
  for (const mark of page.large_punctuation ?? []) {
    if (mark[1] === 13) {
      thirteenDotGlobals.push(pageStart[page.page] + mark[0]);
    }
  }
}
thirteenDotGlobals.sort((a, b) => a - b);
assert.equal(thirteenDotGlobals.length, 31);

const allRunes = pages.flatMap((page) => page.indices);
const boundaries = [0, ...thirteenDotGlobals, allRunes.length];
assert.equal(boundaries.length, 33);

/** @param {number} globalOffset @returns {{page:number,local:number}|null} */
function locate(globalOffset) {
  for (let page = 0; page < 58; page += 1) {
    const count = pageByNumber.get(page)?.indices.length ?? 0;
    if (globalOffset >= pageStart[page] && globalOffset < pageStart[page] + count) {
      return { page, local: globalOffset - pageStart[page] };
    }
  }
  return null;
}

/** @param {number} oneBased */
function fragment(oneBased) {
  assert.ok(oneBased >= 1 && oneBased <= 32);
  const index = oneBased - 1;
  const start = boundaries[index];
  const end = boundaries[index + 1];
  const indices = allRunes.slice(start, end);
  return {
    oneBased,
    start,
    end,
    indices,
    startLocation: locate(start),
    endLocation: end > start ? locate(end - 1) : locate(start)
  };
}

// The physical p55 fold compares five aligned circle positions. A 1 means
// the two sides disagree at that position; 0 means they match.
const mismatch = { T: 1, ML: 0, MR: 0, BL: 1, BR: 0 };
const readings = [
  ['top-lr', ['T', 'ML', 'MR', 'BL', 'BR']],
  ['top-rl', ['T', 'MR', 'ML', 'BR', 'BL']],
  ['bottom-lr', ['BL', 'BR', 'ML', 'MR', 'T']],
  ['bottom-rl', ['BR', 'BL', 'MR', 'ML', 'T']]
].map(([name, order]) => {
  const bits = order.map((position) => mismatch[position]).join('');
  return { name, order, bits, value: Number.parseInt(bits, 2) };
});

assert.deepEqual(readings.map((x) => x.value), [18, 17, 17, 9]);
const selected = fragment(readings[0].value);
assert.equal(selected.oneBased, 18);
assert.deepEqual(selected.startLocation, { page: 27, local: 0 });
assert.deepEqual(selected.endLocation, { page: 27, local: 18 });
assert.equal(selected.indices.length, 19);

const expectedTitle = [19, 13, 26, 20, 15, 3, 24, 25, 8, 20, 18, 12, 10, 19, 20, 20, 15, 5, 13];
assert.deepEqual(selected.indices, expectedTitle);
assert.equal(selected.indices[0], 19);
assert.equal(selected.indices.length, selected.indices[0]);
assert.equal(selected.indices.length - 1, selected.oneBased);

// Fragment 18 is also uniquely self-addressing at page scale: the 13-dot
// punctuation supplies width 13 and its start page contains 18*13 runes.
assert.equal(pageByNumber.get(27).indices.length, 18 * 13);
const startPageForFragment = (item) => item.startLocation?.page;
const fragmentPageProducts = Array.from({ length: 32 }, (_, i) => fragment(i + 1))
  .filter((item) => item.startLocation)
  .filter((item) => (pageByNumber.get(startPageForFragment(item))?.indices.length ?? -1) === item.oneBased * 13)
  .map((item) => item.oneBased);
assert.deepEqual(fragmentPageProducts, [18]);

const allFragments = Array.from({ length: 32 }, (_, i) => fragment(i + 1));
assert.deepEqual(
  allFragments.filter((x) => x.indices.length > 0 && x.indices.length === x.indices[0]).map((x) => x.oneBased),
  [18]
);
assert.deepEqual(
  allFragments.filter((x) => x.indices.length - 1 === x.oneBased).map((x) => x.oneBased),
  [18]
);

assert.equal(fragment(17).indices.length, 1005);
assert.equal(fragment(9).indices.length, 0);
assert.equal(fragment(12).indices.length, 0);
assert.equal(fragment(19).indices.length, 1414);

const p27Ink = ink.pages.find((page) => page.page === 27);
assert.ok(p27Ink);
assert.ok((p27Ink.red_spans ?? []).some((span) => span.start === 0 && span.length === 19));

const p27Text = transcription.split('%')[27];
const titleText = p27Text.split('.')[0];
const printedWords = titleText.split('-').map((word) => [...word].filter((ch) => RUNIC.test(ch)));
assert.deepEqual(printedWords.map((word) => word.length), [3, 12, 4]);
assert.deepEqual(
  printedWords.flat().map((rune) => runeToIndex.get(rune)),
  expectedTitle
);

const sectionRunes = [...transcription.split('$')[5]]
  .filter((ch) => RUNIC.test(ch))
  .map((rune) => runeToIndex.get(rune));
assert.equal(sectionRunes.length, 1433);
assert.deepEqual(sectionRunes.slice(0, 19), expectedTitle);

const p27 = pageByNumber.get(27).indices;
const p55 = pageByNumber.get(55).indices;
const bookend = [23, 11, 1, 17, 18, 10];
assert.deepEqual(p27.slice(28, 34), bookend);
assert.deepEqual(p55.slice(70, 76), bookend);

// The selected fragment begins with enlarged M (GP index 19, prime 71).
// The first rune after its 13-dot boundary is N (index 9, prime 29).
// The two copies of the unique ciphertext bookend start exactly at the
// corresponding Euler-totient offsets phi(71)=70 and phi(29)=28.
const M = selected.indices[0];
const N = p27[selected.indices.length];
assert.equal(M, 19);
assert.equal(N, 9);
assert.equal(corpus.prime[M], 71);
assert.equal(corpus.prime[N], 29);
assert.equal(corpus.prime[M] - 1, 70);
assert.equal(corpus.prime[N] - 1, 28);
assert.equal((70 - 28) % 29, 13);
assert.deepEqual([Math.floor(28 / 13), 28 % 13], [2, 2]);
assert.deepEqual([Math.floor(70 / 13), 70 % 13], [5, 5]);

// Exact solved-p56 prime-totient semantics: plaintext F is emitted as
// literal ciphertext F and consumes no prime; all other plaintext symbols
// consume one consecutive prime-totient step. Test only the source-selected
// starts N=9 and M=19 under the authentic solved-page sign.
const primes = [];
for (let candidate = 2; primes.length < 1000; candidate += 1) {
  let prime = true;
  for (let divisor = 2; divisor * divisor <= candidate; divisor += 1) {
    if (candidate % divisor === 0) { prime = false; break; }
  }
  if (prime) primes.push(candidate);
}
const mod29 = (value) => ((value % 29) + 29) % 29;
const ioc = (values) => {
  const counts = new Array(29).fill(0);
  for (const value of values) counts[value] += 1;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
};
/** @param {number[]} cipher @param {number} start */
function enumerateSolvedP56Paths(cipher, start) {
  let paths = [{ plain: [], clock: 0, mask: [] }];
  for (let offset = 0; offset < cipher.length; offset += 1) {
    const next = [];
    for (const path of paths) {
      const cipherRune = cipher[offset];
      const normalPlain = mod29(cipherRune - (primes[start + path.clock] - 1));
      if (normalPlain !== 0) {
        next.push({
          plain: [...path.plain, normalPlain],
          clock: path.clock + 1,
          mask: [...path.mask, false]
        });
      }
      if (cipherRune === 0) {
        next.push({
          plain: [...path.plain, 0],
          clock: path.clock,
          mask: [...path.mask, true]
        });
      }
    }
    paths = next;
  }
  return paths;
}
const p27P56Paths = enumerateSolvedP56Paths(p27, N);
const p55P56Paths = enumerateSolvedP56Paths(p55, M);
assert.equal(p27P56Paths.length, 2);
assert.equal(p55P56Paths.length, 0);
const p27P56Iocs = p27P56Paths.map((path) => ioc(path.plain)).sort((a, b) => b - a);
assert.ok(Math.abs(p27P56Iocs[0] - 0.03396793954733869) < 1e-15);
assert.ok(Math.abs(p27P56Iocs[1] - 0.03389457466710685) < 1e-15);

// A literal reversible fold of the unique 18x13 page is also finite.
// Symmetric row/column pairs map through (a,b)->(a+b,a-b) over F29.
const p27Grid = Array.from({ length: 18 }, (_, row) => p27.slice(row * 13, (row + 1) * 13));
function rowFold(grid, reversedDifference) {
  const out = Array.from({ length: 18 }, () => new Array(13));
  for (let row = 0; row < 9; row += 1) for (let column = 0; column < 13; column += 1) {
    const a = grid[row][column];
    const b = grid[17 - row][column];
    out[row][column] = mod29(a + b);
    out[17 - row][column] = mod29(reversedDifference ? b - a : a - b);
  }
  return out;
}
function columnFold(grid, reversedDifference) {
  const out = Array.from({ length: 18 }, () => new Array(13));
  for (let row = 0; row < 18; row += 1) {
    for (let column = 0; column < 6; column += 1) {
      const a = grid[row][column];
      const b = grid[row][12 - column];
      out[row][column] = mod29(a + b);
      out[row][12 - column] = mod29(reversedDifference ? b - a : a - b);
    }
    out[row][6] = grid[row][6];
  }
  return out;
}
const foldIocs = [];
for (const rowReverse of [false, true]) for (const columnReverse of [false, true]) {
  const rowOnly = rowFold(p27Grid, rowReverse);
  const columnOnly = columnFold(p27Grid, columnReverse);
  const both = columnFold(rowOnly, columnReverse);
  foldIocs.push(ioc(rowOnly.flat()), ioc(columnOnly.flat()), ioc(both.flat()));
}
assert.ok(Math.abs(Math.max(...foldIocs) - 0.03492168299035252) < 1e-15);

// Canonical 2,896-word parser: page markers and line wraps do not split a
// printed word. The unique repeated p27/p55 pair supplies a word-number gap.
const unknownStream = transcription.split('%').slice(0, 55).join('%');
const canonicalWords = [];
let currentWord = [];
const finishWord = () => {
  if (currentWord.length > 0) {
    canonicalWords.push(currentWord);
    currentWord = [];
  }
};
for (const ch of unknownStream) {
  if (RUNIC.test(ch)) {
    currentWord.push(runeToIndex.get(ch));
  } else if (ch === '%' || ch === '/' || /\s/u.test(ch)) {
    // Physical page/line boundaries are transparent to printed words.
  } else {
    finishWord();
  }
}
finishWord();
assert.equal(canonicalWords.length, 2896);

const bookendWordPair = [[23, 11, 1], [17, 18, 10]];
const bookendStarts = [];
for (let i = 0; i + 1 < canonicalWords.length; i += 1) {
  if (
    canonicalWords[i].length === 3 &&
    canonicalWords[i + 1].length === 3 &&
    canonicalWords[i].every((value, j) => value === bookendWordPair[0][j]) &&
    canonicalWords[i + 1].every((value, j) => value === bookendWordPair[1][j])
  ) {
    bookendStarts.push(i);
  }
}
assert.deepEqual(bookendStarts, [1462, 2894]);
const wordNumberGap = bookendStarts[1] - bookendStarts[0];
assert.equal(wordNumberGap, 1432);
assert.equal(wordNumberGap, sectionRunes.length - 1);
assert.equal(wordNumberGap % sectionRunes.length, sectionRunes.length - 1);

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
}
/** @param {number} n */
function phi(n) {
  let x = n;
  let result = n;
  for (let p = 2; p * p <= x; p += 1) {
    if (x % p === 0) {
      while (x % p === 0) x /= p;
      result -= result / p;
    }
  }
  if (x > 1) result -= result / x;
  return result;
}
/** @param {number} a @param {number} modulus */
function multiplicativeOrder(a, modulus) {
  let value = 1;
  for (let exponent = 1; exponent <= phi(modulus); exponent += 1) {
    value = (value * a) % modulus;
    if (value === 1) return exponent;
  }
  return null;
}

assert.equal(isPrime(sectionRunes.length), true);
assert.equal(phi(sectionRunes.length), wordNumberGap);
assert.equal(multiplicativeOrder(selected.indices[0], sectionRunes.length), wordNumberGap);
assert.equal(1432, 8 * 179);
assert.equal(multiplicativeOrder(31, sectionRunes.length), 179);

// Cross-section controls: p27's section is uniquely both totient-matched to
// the repeated-pair gap and seeded by a full-order first rune.
const sectionControls = transcription.split('
  classification: 'source-image navigation candidate; no plaintext recovered',
  foldMismatch: readings,
  thirteenDotMarks: thirteenDotGlobals.length,
  fragments: boundaries.length - 1,
  selected: {
    oneBased: selected.oneBased,
    length: selected.indices.length,
    start: selected.startLocation,
    end: selected.endLocation,
    firstIndex: selected.indices[0],
    remainingAfterFirst: selected.indices.length - 1,
    transliteration: selected.indices.map((index) => corpus.translit[index]).join(''),
    wordLengths: printedWords.map((word) => word.length)
  },
  orientationControls: {
    fragment17Length: fragment(17).indices.length,
    fragment9Length: fragment(9).indices.length,
    fragment12Length: fragment(12).indices.length,
    zeroBased18AlternativeLength: fragment(19).indices.length
  },
  p27p55Bookend: bookend,
  primeTotientAnchor: {
    fragmentFirstRune: { index: M, prime: corpus.prime[M], totient: corpus.prime[M] - 1, p55BookendOffset: 70 },
    postBoundaryRune: { index: N, prime: corpus.prime[N], totient: corpus.prime[N] - 1, p27BookendOffset: 28 },
    offsetDifferenceMod29: (70 - 28) % 29,
    uniqueFragmentPageProduct: fragmentPageProducts,
    solvedP56Transfer: { p27ValidPaths: p27P56Paths.length, p27Iocs: p27P56Iocs, p55ValidPaths: p55P56Paths.length },
    reversibleFoldMaxIoc: Math.max(...foldIocs)
  },
  wordNumberDirection: {
    canonicalWordCount: canonicalWords.length,
    pairStartOffsetsZeroBased: bookendStarts,
    gap: wordNumberGap,
    selectedSectionRunes: sectionRunes.length,
    modularStep: wordNumberGap % sectionRunes.length,
    sectionPrime: isPrime(sectionRunes.length),
    sectionTotient: phi(sectionRunes.length),
    firstRuneOrder: multiplicativeOrder(selected.indices[0], sectionRunes.length),
    order31: multiplicativeOrder(31, sectionRunes.length),
    factorization: '1432 = 8 * 179',
    interpretation: 'word gap equals phi(1433); additively it is -1, multiplicatively M=19 is a full-cycle generator'
  },
  sectionControls
}, null, 2));
).map((part, section0) => {
  const runes = [...part].filter((ch) => RUNIC.test(ch)).map((rune) => runeToIndex.get(rune));
  const length = runes.length;
  const first = runes[0] ?? null;
  const totient = phi(length);
  return {
    section0,
    length,
    prime: isPrime(length),
    totient,
    first,
    firstOrder: first === null ? null : multiplicativeOrder(first, length),
    gapMatchesTotient: totient === wordNumberGap,
    firstHasFullOrder: first !== null && multiplicativeOrder(first, length) === totient
  };
});
assert.deepEqual(sectionControls.filter((x) => x.gapMatchesTotient).map((x) => x.section0), [5]);
assert.deepEqual(sectionControls.filter((x) => x.firstHasFullOrder).map((x) => x.section0), [5]);

console.log(JSON.stringify({
  classification: 'source-image navigation candidate; no plaintext recovered',
  foldMismatch: readings,
  thirteenDotMarks: thirteenDotGlobals.length,
  fragments: boundaries.length - 1,
  selected: {
    oneBased: selected.oneBased,
    length: selected.indices.length,
    start: selected.startLocation,
    end: selected.endLocation,
    firstIndex: selected.indices[0],
    remainingAfterFirst: selected.indices.length - 1,
    transliteration: selected.indices.map((index) => corpus.translit[index]).join(''),
    wordLengths: printedWords.map((word) => word.length)
  },
  orientationControls: {
    fragment17Length: fragment(17).indices.length,
    fragment9Length: fragment(9).indices.length,
    fragment12Length: fragment(12).indices.length,
    zeroBased18AlternativeLength: fragment(19).indices.length
  },
  p27p55Bookend: bookend,
  wordNumberDirection: {
    canonicalWordCount: canonicalWords.length,
    pairStartOffsetsZeroBased: bookendStarts,
    gap: wordNumberGap,
    selectedSectionRunes: sectionRunes.length,
    modularStep: wordNumberGap % sectionRunes.length,
    interpretation: '1432 mod 1433 = -1: reverse traversal'
  }
}, null, 2));
