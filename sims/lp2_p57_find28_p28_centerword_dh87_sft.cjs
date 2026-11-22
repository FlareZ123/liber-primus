"use strict";

/**
 * Source-exact p57 -> p50 -> p28 center-word -> DH87 loop.
 *
 * This test starts from the already established solved-p57 GP0 table graph
 * whose FIND edge yields physical page 28. It verifies a new blind consequence:
 * p28's 28th printed word starts immediately after the exact center rune, sums
 * to EMERGE under GP0, and yields generator 35 when its outer runes are shed.
 * It then checks the finite p57 Diffie-Hellman relations and the resulting p50
 * address loop. A p31 p56-style continuation is included as a bounded negative.
 *
 * Run:
 *   node sims/lp2_p57_find28_p28_centerword_dh87_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(
  read("resources/external/relikd-solved-gp29-native-v1.json")
);
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");

/** @param {number} value */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) {
    if (n % d === 0) return false;
  }
  return true;
}

/** @param {number} n */
function primePi(n) {
  let count = 0;
  for (let value = 2; value <= n; value += 1) {
    if (isPrime(value)) count += 1;
  }
  return count;
}

/** @param {number} base @param {number} exponent @param {number} modulus */
function powMod(base, exponent, modulus) {
  let result = 1;
  let factor = base % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

/** @param {string} token @param {string} alphabet */
function decode(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

/** @param {string} token */
function decode59(token) {
  return decode(token, alphabet59);
}

/** @param {string} token */
function decode60(token) {
  return decode(token, alphabet60);
}

/** @param {number[]} word */
function gp0(word) {
  return word.reduce((sum, value) => sum + value, 0);
}

/** @param {number[]} word */
function gp1(word) {
  return word.reduce((sum, value) => sum + value + 1, 0);
}

/** @param {number[]} word */
function gpPrime(word) {
  return word.reduce((sum, value) => sum + corpus.prime[value], 0);
}

/** @param {number[]} word */
function translit(word) {
  return word.map((value) => corpus.translit[value]).join("");
}

/** @param {string} text */
function runeWords(text) {
  const normalized = text.replace(/\/\s*/gu, "");
  return (normalized.match(/[\u16A0-\u16FF]+/gu) || []).map((word) =>
    [...word].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    })
  );
}

/** @param {number} physicalPage */
function wordsOnPhysicalPage(physicalPage) {
  assert.notEqual(physicalPage, 50);
  const partIndex = physicalPage <= 49 ? physicalPage : physicalPage - 1;
  return runeWords(parts[partIndex]);
}

/** @param {number} physicalPage */
function page(physicalPage) {
  const row = corpus.pages.find((candidate) => candidate.page === physicalPage);
  assert.ok(row);
  return row.indices;
}

const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const p57Words = runeWords(p57.source_text);
assert.equal(p57Words.length, 20);

const p57Rows = p57Words.map((word, index) => ({
  position: index + 1,
  text: translit(word),
  gp0: gp0(word),
  prime: gpPrime(word),
}));

/** @param {string} text */
function p57Word(text) {
  const row = p57Rows.find((candidate) => candidate.text === text);
  assert.ok(row);
  return row;
}

const parable = p57Word("PARABLE");
const to = p57Word("TO");
const we = p57Word("WE");
const shed = p57Word("SHED");
const our = p57Word("OUR");
const own = p57Word("OWN");
const find = p57Word("FIND");
const circumferences = p57Word("CIRCUMFERENCES");
const divinity = p57Word("DIUINITY");
const within = p57Word("WITHIN");
const and = p57Word("AND");
const emerge = p57Word("EMERGE");

assert.equal(find.gp0, 42);
assert.equal(find.prime, 151);
assert.equal(our.prime, 21);
assert.equal(own.prime, 55);
assert.equal(parable.prime, 449);
assert.equal(emerge.gp0, 83);

/* Existing frozen upstream graph: FIND -> 28. */
assert.equal(tokens[find.gp0], "0S");
assert.equal(decode59(tokens[find.gp0]), 28);
assert.equal(decode60(tokens[find.gp0]), 28);

/* Blind-selected physical p28 and its page-numbered word. */
const p28 = page(28);
const p28Words = wordsOnPhysicalPage(28);
assert.equal(p28.length, 269);
assert.equal(p28Words.length, 59);
assert.equal(p28Words.flat().length, p28.length);
assert.deepEqual(p28Words.flat(), p28);

let offset = 0;
const p28WordRows = p28Words.map((word, index) => {
  const start = offset;
  offset += word.length;
  return {
    number: index + 1,
    start,
    end: offset - 1,
    word,
    gp0: gp0(word),
    text: translit(word),
  };
});

const center28 = Math.floor(p28.length / 2);
const selected = p28WordRows[27];
assert.equal(center28, 134);
assert.equal(selected.number, 28);
assert.equal(selected.start, center28 + 1);
assert.equal(selected.end, 139);
assert.deepEqual(selected.word, [28, 24, 10, 1, 20]);
assert.equal(selected.text, "EAAIUL");
assert.equal(selected.gp0, emerge.gp0);

const outer = [selected.word[0], selected.word.at(-1)];
assert.deepEqual(outer, [28, 20]);
assert.equal(Math.abs(outer[0] - outer[1]), our.gp0);
assert.equal((outer[0] + outer[1]) % 29, own.gp0);
const shellSolutions = [];
for (let left = 0; left < 29; left += 1) {
  for (let right = left; right < 29; right += 1) {
    if (Math.abs(left - right) === our.gp0 && (left + right) % 29 === own.gp0) {
      shellSolutions.push([left, right]);
    }
  }
}
assert.deepEqual(shellSolutions, [[20, 28]]);
const p28PhysicalLines = parts[28].split(/\r?\n/).filter((line) => line.includes("/"));
assert.equal(p28PhysicalLines.length, 12);
const selectedRuneText = selected.word.map((value) => corpus.runes[value]).join("");
assert.ok(p28PhysicalLines[5].trim().endsWith(`${selectedRuneText}-/`));

/* The page-numbered center/sum conjunction is unique in the available book. */
const pageNumberWordRows = [];
for (let physicalPage = 1; physicalPage <= 55; physicalPage += 1) {
  if (physicalPage === 50) continue;
  const words = wordsOnPhysicalPage(physicalPage);
  if (words.length < physicalPage) continue;
  const runes = page(physicalPage);
  let cursor = 0;
  let nth = null;
  for (let index = 0; index < words.length; index += 1) {
    const start = cursor;
    cursor += words[index].length;
    if (index + 1 === physicalPage) {
      nth = {
        start,
        end: cursor - 1,
        gp0: gp0(words[index]),
      };
    }
  }
  assert.ok(nth);
  pageNumberWordRows.push({
    page: physicalPage,
    center: Math.floor(runes.length / 2),
    ...nth,
  });
}
assert.equal(pageNumberWordRows.length, 48);
assert.deepEqual(
  pageNumberWordRows
    .filter((row) => row.start === row.center + 1)
    .map((row) => row.page),
  [28]
);
assert.deepEqual(
  pageNumberWordRows
    .filter((row) => row.gp0 === emerge.gp0)
    .map((row) => row.page),
  [28]
);

/* SHED OUR OWN CIRCUMFERENCES: peel the selected five-rune word. */
const inner = selected.word.slice(1, -1);
const centerRune = inner.slice(1, -1);
assert.deepEqual(inner, [24, 10, 1]);
assert.equal(gp0(inner), 35);
assert.equal(gp1(inner), within.gp0);
assert.equal(gpPrime(inner), circumferences.gp0);
assert.equal(gp0(inner) + inner.length, within.gp0);
assert.equal(gp0(inner) * inner.length, divinity.gp0);
assert.deepEqual(centerRune, [10]);
assert.equal(translit(centerRune), "I");

/* This three-measure nested signature is unique across every printed LP2 word. */
const nestedSignatureHits = [];
let fullEmergeCount = 0;
let innerWithinCount = 0;
let innerCircumferenceCount = 0;
for (let physicalPage = 0; physicalPage <= 55; physicalPage += 1) {
  if (physicalPage === 50) continue;
  const words = wordsOnPhysicalPage(physicalPage);
  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    if (word.length < 3) continue;
    const wordInner = word.slice(1, -1);
    const fullHit = gp0(word) === emerge.gp0;
    const withinHit = gp1(wordInner) === within.gp0;
    const circumferenceHit = gpPrime(wordInner) === circumferences.gp0;
    fullEmergeCount += Number(fullHit);
    innerWithinCount += Number(withinHit);
    innerCircumferenceCount += Number(circumferenceHit);
    if (fullHit && withinHit && circumferenceHit) {
      nestedSignatureHits.push({
        page: physicalPage,
        word: index + 1,
        values: word,
      });
    }
  }
}
assert.deepEqual(nestedSignatureHits, [
  { page: 28, word: 28, values: [28, 24, 10, 1, 20] },
]);

/*
 * The twice-peeled I has GP-prime31. Using the same p50 address convention,
 * cell31 is token2D, whose only duplicate is cell38 = GP0(WITHIN), and whose
 * base59 value is131 = GP0(CIRCUMFERENCES).
 */
assert.equal(corpus.prime[centerRune[0]], 31);
assert.equal(tokens[31], "2D");
assert.equal(tokens[within.gp0], "2D");
assert.deepEqual(
  tokens.map((token, index) => token === "2D" ? index : null)
    .filter((index) => index !== null),
  [31, within.gp0]
);
assert.equal(decode59(tokens[31]), circumferences.gp0);
assert.equal(decode59(tokens[within.gp0]), circumferences.gp0);
assert.notEqual(decode60(tokens[31]), circumferences.gp0);

/* Frozen DH inputs from p57 and the peeled p28 word. */
const modulus = find.prime;
const generator = gp0(inner);
const a = our.prime;
const b = own.prime;
assert.equal(modulus, 151);
assert.equal(generator, 35);
assert.equal(powMod(generator, 150, modulus), 1);
assert.notEqual(powMod(generator, 75, modulus), 1);
assert.notEqual(powMod(generator, 50, modulus), 1);
assert.notEqual(powMod(generator, 30, modulus), 1);

const publicA = powMod(generator, a, modulus);
const publicB = powMod(generator, b, modulus);
const shared = powMod(generator, a * b, modulus);
assert.deepEqual({ publicA, publicB, shared }, { publicA: 107, publicB: 66, shared: 87 });
assert.equal(publicB, to.prime);
assert.equal(shared, primePi(parable.prime));

/* Finite vocabulary checks within the solved p57 words. */
const distinctEligible = [];
const seenEligible = new Set();
for (const row of p57Rows) {
  if (row.prime <= 0 || row.prime >= modulus || seenEligible.has(row.text)) continue;
  seenEligible.add(row.text);
  distinctEligible.push(row);
}
assert.deepEqual(
  distinctEligible.map((row) => [row.text, row.prime]),
  [["THE", 72], ["TO", 66], ["WE", 86], ["OUR", 21], ["OWN", 55], ["WITHIN", 115]]
);

const p57PrimeTargets = new Map();
for (const row of p57Rows) {
  if (!p57PrimeTargets.has(row.prime)) p57PrimeTargets.set(row.prime, []);
  p57PrimeTargets.get(row.prime).push(row.text);
}
const exponentWordHits = distinctEligible
  .map((row) => ({
    source: row.text,
    exponent: row.prime,
    output: powMod(generator, row.prime, modulus),
  }))
  .filter((row) => p57PrimeTargets.has(row.output));
assert.deepEqual(exponentWordHits, [
  { source: "OWN", exponent: 55, output: 66 },
]);

const primeOrdinalTargets = new Map();
for (const row of p57Rows) {
  if (isPrime(row.prime)) {
    const ordinal = primePi(row.prime);
    if (!primeOrdinalTargets.has(ordinal)) primeOrdinalTargets.set(ordinal, []);
    primeOrdinalTargets.get(ordinal).push(row.text);
  }
}
const pairHits = [];
for (let i = 0; i < distinctEligible.length; i += 1) {
  for (let j = i + 1; j < distinctEligible.length; j += 1) {
    const left = distinctEligible[i];
    const right = distinctEligible[j];
    const output = powMod(generator, left.prime * right.prime, modulus);
    if (primeOrdinalTargets.has(output)) {
      pairHits.push({
        left: left.text,
        right: right.text,
        output,
        targets: primeOrdinalTargets.get(output),
      });
    }
  }
}
assert.deepEqual(pairHits, [
  { left: "OUR", right: "OWN", output: 87, targets: ["PARABLE"] },
]);

/* DH outputs as exact p50 addresses. Base59 is selected by two of three hits. */
assert.equal(tokens.length, 256);
assert.deepEqual(
  [
    [publicA, tokens[publicA], decode59(tokens[publicA]), decode60(tokens[publicA])],
    [publicB, tokens[publicB], decode59(tokens[publicB]), decode60(tokens[publicB])],
    [shared, tokens[shared], decode59(tokens[shared]), decode60(tokens[shared])],
  ],
  [
    [107, "3c", and.prime, 218],
    [66, "0P", we.gp0, we.gp0],
    [87, "15", shed.gp0, 65],
  ]
);
assert.equal(tokens.filter((token) => decode59(token) === and.prime).length, 1);
assert.equal(tokens.filter((token) => decode59(token) === we.gp0).length, 2);
assert.equal(tokens.filter((token) => decode59(token) === shed.gp0).length, 1);

/* Shared87 -> SHED -> PARABLE -> FIND -> 28 closes the navigation cycle. */
assert.equal(decode59(tokens[shared]), shed.gp0);
assert.equal(decode59(tokens[shed.gp0]), parable.gp0);
assert.equal(decode60(tokens[parable.gp0]), find.gp0);
assert.equal(decode59(tokens[find.gp0]), 28);

/*
 * Bounded negative: recursively peeled I has GP-prime31 and p31 has center F,
 * but the exact p56 F-transparent cipher with prime449 selected by shared87
 * cannot decode the whole page or the source-natural center-origin rays.
 */
const p31 = page(31);
assert.equal(p31.length, 269);
assert.equal(p31[Math.floor(p31.length / 2)], 0);

const sieve = new Uint8Array(10000);
sieve.fill(1, 2);
for (let q = 2; q * q < sieve.length; q += 1) {
  if (sieve[q]) {
    for (let n = q * q; n < sieve.length; n += q) sieve[n] = 0;
  }
}
const primes = [];
for (let q = 2; q < sieve.length; q += 1) {
  if (sieve[q]) primes.push(q);
}
const primeStart = primes.indexOf(parable.prime);
assert.equal(primeStart, 86);
assert.equal(primes[primeStart], 449);
assert.equal(primePi(449), shared);
const shifts = primes.map((q) => (q - 1) % 29);

/** @param {number[]} ciphertext @param {number} sign */
function p56Feasible(ciphertext, sign) {
  let consumed = new Set([0]);
  for (let position = 0; position < ciphertext.length; position += 1) {
    const next = new Set();
    for (const count of consumed) {
      if (ciphertext[position] === 0) next.add(count);
      const shift = shifts[primeStart + count];
      assert.notEqual(shift, undefined);
      const plaintext = mod29(ciphertext[position] - sign * shift);
      if (plaintext !== 0) next.add(count + 1);
    }
    consumed = next;
    if (consumed.size === 0) return { feasible: false, fail: position };
  }
  return { feasible: true, fail: null };
}

const center31 = Math.floor(p31.length / 2);
const rightRay = p31.slice(center31 + 1);
const leftRay = p31.slice(0, center31).reverse();
const alternating = Array.from({ length: center31 }, (_, distance) => [
  p31[center31 + 1 + distance],
  p31[center31 - 1 - distance],
]).flat();

const p31Gate = {
  whole: [1, -1].map((sign) => ({ sign, ...p56Feasible(p31, sign) })),
  right: [1, -1].map((sign) => ({ sign, ...p56Feasible(rightRay, sign) })),
  left: [1, -1].map((sign) => ({ sign, ...p56Feasible(leftRay, sign) })),
  alternating: [1, -1].map((sign) => ({ sign, ...p56Feasible(alternating, sign) })),
};
for (const family of Object.values(p31Gate)) {
  assert.ok(family.every((row) => !row.feasible));
}

console.log(JSON.stringify({
  status: "PASS: p28 center-word peel yields g35 and a source-closed DH87/p50 loop",
  p28: {
    runeCount: p28.length,
    wordCount: p28Words.length,
    centerOffset: center28,
    selectedWordNumber: selected.number,
    selectedOffsets: [selected.start, selected.end],
    selectedRunes: selected.word,
    selectedTranslit: selected.text,
    selectedGp0: selected.gp0,
    selectedTarget: "EMERGE",
    physicalLine: 6,
    physicalLineCount: 12,
    outerShell: {
      values: outer,
      difference: Math.abs(outer[0] - outer[1]),
      differenceTarget: "OUR",
      sumMod29: (outer[0] + outer[1]) % 29,
      sumMod29Target: "OWN",
      uniquePairSolutions: shellSolutions,
    },
    peeledInterior: inner,
    peeledGp0: generator,
    peeledGp1: gp1(inner),
    peeledPrime: gpPrime(inner),
    peeledSumPlusLength: gp0(inner) + inner.length,
    peeledSumTimesLength: gp0(inner) * inner.length,
    nestedSignatureCounts: {
      fullEmergeCount,
      innerWithinCount,
      innerCircumferenceCount,
      joint: nestedSignatureHits.length,
    },
    finalCenter: translit(centerRune),
    centerIToP50: {
      address: corpus.prime[centerRune[0]],
      token: tokens[31],
      duplicateAddress: within.gp0,
      base59: decode59(tokens[31]),
      target: "CIRCUMFERENCES",
    },
    uniquePageNumberWordStartAfterCenter: [28],
    uniquePageNumberWordGp0Emerge: [28],
  },
  dh: {
    p: modulus,
    g: generator,
    a: { word: "OUR", value: a },
    b: { word: "OWN", value: b },
    publicA,
    publicB,
    shared,
    publicBTarget: "TO",
    sharedTarget: "primeOrdinal(PARABLE)",
    finiteExponentWordHits: exponentWordHits,
    finitePairHits: pairHits,
  },
  p50: {
    publicA: { address: publicA, token: tokens[publicA], base59: decode59(tokens[publicA]), target: "AND:prime" },
    publicB: { address: publicB, token: tokens[publicB], base59: decode59(tokens[publicB]), target: "WE:gp0" },
    shared: { address: shared, token: tokens[shared], base59: decode59(tokens[shared]), target: "SHED:gp0" },
    cycle: "87 -> SHED64 -> PARABLE120 -> FIND42 -> 28",
  },
  rejectedP31Prime449P56Transfer: p31Gate,
}, null, 2));
