/**
 * SFT: terminal DJU/BEI -> p50 bracket -> base60 THE/FOLD continuation.
 *
 * Structural-only test. It reproduces the existing provisional GP-prime/base58
 * word-address rule, then asks what happens when the independently selected
 * terminal DJU/BEI pair is used as input. It also freezes the p50 printed-token
 * geometry before any radix choice.
 *
 * Run: node sims/lp2_terminal_p50_bracket_wordmap_sft.cjs
 */
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");

function read(path) {
  return fs.readFileSync(path, "utf8");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const printedSource = read("resources/lp2-transcription.txt").split("%");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

assert.equal(corpus.pages.length, 58);
assert.equal(printedSource.length, 57);
assert.match(signed2016, /\blies\b/i);

/** @param {string} page */
function printedWords(page) {
  const source = page.replaceAll("/", "").replaceAll("\n", "").replaceAll("\r", "");
  return source.split(/[-.&$§,:!?]/u)
    .map(piece => (piece.match(/[ᚠ-᛿]+/gu) || []).join(""))
    .filter(Boolean);
}

const pages = Array.from({ length: 58 }, (_, page) =>
  page === 50 ? [] : printedWords(printedSource[page > 50 ? page - 1 : page])
);
assert.equal(pages.reduce((n, page) => n + page.length, 0), 2973);

function translit(word) {
  return [...word].map(rune => {
    const index = corpus.runes.indexOf(rune);
    assert.notEqual(index, -1);
    return corpus.translit[index];
  }).join("");
}

function runePrimeSum(word) {
  return [...word].reduce((sum, rune) => {
    const index = corpus.runes.indexOf(rune);
    assert.notEqual(index, -1);
    return sum + corpus.prime[index];
  }, 0);
}

const englishAlphabet = corpus.translit
  .map((token, index) => ({ token: token.toLowerCase(), index }))
  .sort((a, b) => b.token.length - a.token.length);

function encodeEnglish(word) {
  const source = word.toLowerCase()
    .replaceAll("v", "u")
    .replaceAll("k", "c")
    .replaceAll("z", "s");
  const out = [];
  for (let i = 0; i < source.length;) {
    const hit = englishAlphabet.find(({ token }) => source.startsWith(token, i));
    assert(hit, "No GP token for " + word + " at " + i);
    out.push(hit.index);
    i += hit.token.length;
  }
  return out;
}

function englishPrimeSum(word) {
  return encodeEnglish(word).reduce((sum, index) => sum + corpus.prime[index], 0);
}

function address(number) {
  return { page: number % 58, index: Math.floor(number / 58) };
}

function wordAt(page, index) {
  assert.notEqual(page, 50, "p50 has no rune words");
  const word = pages[page]?.[index];
  assert(word, "Missing word at p" + page + ":" + index);
  return word;
}

function nextRuneWord(page, index) {
  const word = wordAt(page, index);
  const sum = runePrimeSum(word);
  return { sum, ...address(sum) };
}

function walkRuneWords(page, index, limit = 100) {
  const path = [];
  const seen = new Set();
  for (let step = 0; step < limit; step++) {
    if (page === 50 || !pages[page]?.[index]) {
      return { path, terminal: { kind: "missing", page, index } };
    }
    const key = page + ":" + index;
    if (seen.has(key)) {
      return { path, terminal: { kind: "cycle", page, index } };
    }
    seen.add(key);
    const word = pages[page][index];
    const sum = runePrimeSum(word);
    path.push({ step, page, index, word: translit(word), sum });
    ({ page, index } = address(sum));
  }
  return { path, terminal: { kind: "limit" } };
}

// The source-selected repeated terminal pair is page-local DJU/BEI on p27 and p55.
assert.equal(translit(pages[27][5]), "DJU");
assert.equal(translit(pages[27][6]), "BEI");
assert.equal(translit(pages[55][15]), "DJU");
assert.equal(translit(pages[55][16]), "BEI");
assert.equal(runePrimeSum(pages[27][5]), 129);
assert.equal(runePrimeSum(pages[27][6]), 159);

const djuWalk = walkRuneWords(27, 5);
assert.deepEqual(
  djuWalk.path.map(row => [row.page, row.index, row.word, row.sum]),
  [[27, 5, "DJU", 129], [13, 2, "NAEWG", 166]]
);
assert.deepEqual(djuWalk.terminal, { kind: "missing", page: 50, index: 2 });

const beiWalk = walkRuneWords(27, 6);
const merge = beiWalk.path.findIndex(row => row.page === 27 && row.index === 5);
assert.equal(merge, 14);
assert.deepEqual(beiWalk.terminal, { kind: "missing", page: 50, index: 2 });

// Calibrate the topology over every adjacent page-local segment pair.
let pairCount = 0;
let bHitsA = 0;
let aHitsB = 0;
let either = 0;
const p50MergePairs = [];

for (let page = 0; page < 58; page++) {
  for (let index = 0; index + 1 < pages[page].length; index++) {
    pairCount++;
    const aWalk = walkRuneWords(page, index);
    const bWalk = walkRuneWords(page, index + 1);
    const bHit = bWalk.path.slice(1)
      .some(row => row.page === page && row.index === index);
    const aHit = aWalk.path.slice(1)
      .some(row => row.page === page && row.index === index + 1);

    if (bHit) bHitsA++;
    if (aHit) aHitsB++;
    if (bHit || aHit) either++;

    if (bHit && aWalk.terminal.kind === "missing" &&
        aWalk.terminal.page === 50) {
      p50MergePairs.push({
        page,
        index,
        a: translit(pages[page][index]),
        b: translit(pages[page][index + 1]),
        terminalIndex: aWalk.terminal.index
      });
    }
  }
}

assert.deepEqual(
  { pairCount, bHitsA, aHitsB, either },
  { pairCount: 2916, bHitsA: 20, aHitsB: 21, either: 40 }
);
assert.deepEqual(p50MergePairs, [
  { page: 1, index: 3, a: "CRTHIA", b: "RBODTHF", terminalIndex: 2 },
  { page: 20, index: 2, a: "GIEO", b: "PXY", terminalIndex: 2 },
  { page: 27, index: 5, a: "DJU", b: "BEI", terminalIndex: 2 }
]);

// The authenticated 2016 word "lies" independently selects p50 local item 3
// under the same provisional GP-prime/base58 address convention.
assert.equal(englishPrimeSum("lies"), 224);
assert.deepEqual(address(224), { page: 50, index: 3 });

// Authentication gate #1621: apply the frozen formula to every alphabetic word
// in the signed 2016 message. Strip the hexadecimal key ID before tokenizing.
const signedBodyMatch = signed2016.match(
  /Hash: SHA1\r?\n\r?\n([\s\S]*?)\r?\n-----BEGIN PGP SIGNATURE-----/
);
assert(signedBodyMatch);
const signedWords = (signedBodyMatch[1].replaceAll("7A35090F", "").match(/[A-Za-z]+/g) || []);
assert.equal(signedWords.length, 43);
const signedWordAddresses = signedWords.map(word => {
  const sum = englishPrimeSum(word);
  return { word, sum, ...address(sum) };
});
const signedP50Hits = signedWordAddresses.filter(row => row.page === 50);
assert.deepEqual(signedP50Hits, [
  { word: "lies", sum: 224, page: 50, index: 3 }
]);

// Freeze the printed-token geometry before choosing radix 59 or 60.
const tokens = grid.pages.flatMap(page => page.tokens);
assert.equal(tokens.length, 256);
assert.equal(tokens[82], "3L");
assert.equal(tokens[83], "3D");
assert.equal(tokens[127], "3D");
assert.equal(tokens[128], "3L");
assert.deepEqual(
  tokens.map((token, index) => token === "3L" ? index : -1).filter(index => index >= 0),
  [82, 128]
);
assert.deepEqual(
  tokens.map((token, index) => token === "3D" ? index : -1).filter(index => index >= 0),
  [83, 127]
);
assert.deepEqual(
  tokens.map((token, index) => token === "13" ? index : -1).filter(index => index >= 0),
  [105]
);

const enclosed = tokens.slice(84, 127);
assert.equal(enclosed.length, 43);
assert.equal(enclosed[21], "13");

// Exhaust every AB ... BA nested two-token bracket in the printed row-major stream.
const nested = [];
for (let left = 0; left < tokens.length; left++) {
  for (let right = left + 3; right < tokens.length; right++) {
    if (tokens[left] === tokens[right] && tokens[left + 1] === tokens[right - 1]) {
      nested.push({
        left,
        right,
        outer: tokens[left],
        inner: tokens[left + 1],
        center: (left + right) % 2 === 0 ? tokens[(left + right) / 2] : null
      });
    }
  }
}
assert.deepEqual(nested, [
  { left: 82, right: 128, outer: "3L", inner: "3D", center: "13" }
]);

// Conditional codec continuation. Base60 makes first enclosed token 2r = 173,
// which addresses clear p57 word2 THE, and THE's number addresses p14 word1 FOLD.
const alphabet60 = grid.alphabet;
assert.equal(alphabet60, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx");
const alphabet59 = alphabet60.replace("f", "");

function decodeToken(token, alphabet) {
  const radix = alphabet.length;
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert(hi >= 0 && lo >= 0);
  return hi * radix + lo;
}

assert.equal(tokens[84], "2r");
const first60 = decodeToken(tokens[84], alphabet60);
const first59 = decodeToken(tokens[84], alphabet59);
assert.equal(first60, 173);
assert.equal(first59, 170);

const first60Address = address(first60);
const first59Address = address(first59);
assert.deepEqual(first60Address, { page: 57, index: 2 });
assert.equal(translit(wordAt(first60Address.page, first60Address.index)), "THE");
assert.equal(runePrimeSum(wordAt(57, 2)), 72);
assert.deepEqual(address(72), { page: 14, index: 1 });
assert.equal(translit(wordAt(14, 1)), "FOLD");

assert.deepEqual(first59Address, { page: 54, index: 2 });
assert.equal(translit(wordAt(54, 2)), "IADPNGUWAM");

// Existing FOLD continuation: FOLD -> p55:2 -> p56:1, whose solved p56
// prime/totient inverse is END.
assert.equal(runePrimeSum(wordAt(14, 1)), 171);
assert.deepEqual(address(171), { page: 55, index: 2 });
assert.equal(translit(wordAt(55, 2)), "SB");
assert.equal(runePrimeSum(wordAt(55, 2)), 114);
assert.deepEqual(address(114), { page: 56, index: 1 });
assert.equal(translit(wordAt(56, 1)), "OESR");

function primes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(n);
  }
  return out;
}

function phi(n) {
  let x = n;
  let result = n;
  for (let p = 2; p * p <= x; p++) {
    if (x % p === 0) {
      while (x % p === 0) x /= p;
      result -= result / p;
    }
  }
  if (x > 1) result -= result / x;
  return result;
}

const p56Runes = corpus.pages[56].indices;
const primeList = primes(p56Runes.length);
const plain56 = p56Runes.map((cipher, i) => {
  if (cipher === 0) return 0; // authenticated plaintext-F transparent case
  return (cipher - (phi(primeList[i]) % 29) + 29) % 29;
});
const p56Word1Runes = [...wordAt(56, 1)].map(rune => corpus.runes.indexOf(rune));
let p56Cursor = pages[56][0].length;
assert.equal(p56Cursor, 2);
assert.deepEqual(p56Word1Runes, p56Runes.slice(p56Cursor, p56Cursor + p56Word1Runes.length));
const solvedWord1 = plain56.slice(p56Cursor, p56Cursor + p56Word1Runes.length)
  .map(index => corpus.translit[index]).join("");
assert.equal(solvedWord1, "END");

console.log("PASS terminal/p50 bracket word-map SFT");
console.log(JSON.stringify({
  sourcePair: {
    p27: [5, 6],
    p55: [15, 16],
    sums: [129, 159],
    mergeIntoDJUAtStep: merge,
    terminalAddress: "p50:2"
  },
  topology: {
    adjacentPageLocalPairs: pairCount,
    bEventuallyHitsA: bHitsA,
    eitherEventuallyHitsOther: either,
    bHitsAThenATerminatesOnP50: p50MergePairs
  },
  signedLies: { sum: 224, address: "p50:3" },
  signed2016Census: {
    alphabeticWords: signedWords.length,
    p50Hits: signedP50Hits
  },
  printedBracket: {
    globalRange: [82, 128],
    form: "3L 3D [43 tokens] 3D 3L",
    uniqueCenter: { globalIndex: 105, token: "13" },
    nestedBracketCount: nested.length
  },
  codecFork: {
    firstEnclosedToken: tokens[84],
    base60: { value: first60, address: first60Address, route: ["THE", "FOLD", "SB", "END"] },
    base59: { value: first59, address: first59Address, firstTarget: "IADPNGUWAM" }
  }
}, null, 2));
