"use strict";

/**
 * P27 DJU/BEI dual-radix navigation into the unique INSTAR/DIVINITY carrier,
 * followed by the source-visible red13 handoff.
 *
 * This is a structural/navigation result. It does not recover unknown plaintext
 * or define a post-DH data cipher.
 *
 * Run from repository root:
 *   node sims/lp2_p27_djubei_dualradix_divinity_red13_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tableTokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");

assert.equal(tableTokens.length, 256);
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);

/**
 * @typedef {{start:number, indices:number[], pageStart?:number, pageEnd?:number}} Word
 */

/**
 * Parse visible complete words. Page and line separators do not end a word.
 * @param {string} source
 * @param {boolean} trackPages
 * @returns {Word[]}
 */
function parseWords(source, trackPages = false) {
  /** @type {Word[]} */
  const words = [];
  /** @type {number[]} */
  let current = [];
  let runeOffset = 0;
  let start = 0;
  let page = 0;
  let pageStart = 0;

  const flush = () => {
    if (!current.length) return;
    words.push({
      start,
      indices: current,
      ...(trackPages ? {pageStart, pageEnd: page} : {}),
    });
    current = [];
  };

  for (const ch of [...source]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) {
        start = runeOffset;
        pageStart = page;
      }
      current.push(value);
      runeOffset += 1;
    } else if (ch === "%") {
      page += 1;
    } else if (current.length && "-.$&§".includes(ch)) {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {number[]} indices @returns {string} */
function spell(indices) {
  return indices.map((index) => corpus.translit[index]).join("");
}

/** @param {Word|{indices:number[]}} word @returns {number} */
function gp0(word) {
  return word.indices.reduce((sum, index) => sum + index, 0);
}

/** @param {number[]} indices @returns {number} */
function primeSum(indices) {
  return indices.reduce((sum, index) => sum + corpus.prime[index], 0);
}

/** @param {number} n @returns {number} */
function phi(n) {
  let result = n;
  let value = n;
  for (let p = 2; p * p <= value; p += 1) {
    if (value % p !== 0) continue;
    while (value % p === 0) value /= p;
    result -= result / p;
  }
  if (value > 1) result -= result / value;
  return result;
}

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let p = 3; p * p <= n; p += 2) {
    if (n % p === 0) return false;
  }
  return true;
}

/** @param {number} n @returns {number} */
function primeOrdinal(n) {
  assert(isPrime(n));
  let count = 0;
  for (let value = 2; value <= n; value += 1) {
    if (isPrime(value)) count += 1;
  }
  return count;
}

/** @param {string} token @param {string} alphabet @returns {number} */
function tokenValue(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function modPow(base, exponent, modulus) {
  let out = 1;
  let x = base % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) out = (out * x) % modulus;
    x = (x * x) % modulus;
    e >>= 1;
  }
  return out;
}

const rawPages = transcription.split("%");
const p27Words = parseWords(rawPages[27]);
const p57Words = parseWords(rawPages.at(-1));
assert.equal(p27Words.length, 52);
assert.equal(p57Words.length, 20);

/** @param {number} offset @returns {Word|null} */
function p27Containing(offset) {
  return p27Words.find((word) =>
    word.start <= offset && offset < word.start + word.indices.length) || null;
}

/** @param {string} name @returns {Word} */
function p57Word(name) {
  const found = p57Words.find((word) => spell(word.indices) === name);
  assert(found);
  return found;
}

// The unique terminal repeated pair selects p27, while solved p57 FIND supplies
// the local offset 28 through the already replicated GP0 -> p50 grammar.
const unknownSource = rawPages.slice(0, 55).join("%");
const unknownWords = parseWords(unknownSource, true);
assert.equal(unknownWords.length, 2896);

const pairOccurrences = new Map();
for (let i = 0; i < unknownWords.length - 1; i += 1) {
  const key = spell(unknownWords[i].indices) + "/" + spell(unknownWords[i + 1].indices);
  if (!pairOccurrences.has(key)) pairOccurrences.set(key, []);
  pairOccurrences.get(key).push(i);
}
const duplicatePairs = [...pairOccurrences.entries()]
  .filter(([, occurrences]) => occurrences.length > 1);
assert.deepEqual(duplicatePairs, [["DJU/BEI", [1462, 2894]]]);

const find = p57Word("FIND");
assert.equal(gp0(find), 42);
assert.equal(tableTokens[42], "0S");
assert.equal(tokenValue(tableTokens[42], alphabet60), 28);
assert.equal(tokenValue(tableTokens[42], alphabet59), 28);

const dju = p27Containing(28);
const bei = p27Containing(31);
assert(dju && bei);
assert.equal(dju.start, 28);
assert.equal(bei.start, 31);
assert.equal(spell(dju.indices), "DJU");
assert.equal(spell(bei.indices), "BEI");
assert.equal(gp0(dju), 35);
assert.equal(gp0(bei), 45);

/**
 * Two GP0/table navigation steps on the already selected p27 receiver.
 * @param {Word} source
 * @param {string} alphabet
 */
function branch(source, alphabet) {
  const sourceAddress = gp0(source);
  if (sourceAddress >= 256) return null;
  const first = tokenValue(tableTokens[sourceAddress], alphabet);
  const intermediate = p27Containing(first);
  if (!intermediate) return null;
  const intermediateAddress = gp0(intermediate);
  if (intermediateAddress >= 256) return null;
  const second = tokenValue(tableTokens[intermediateAddress], alphabet);
  const target = p27Containing(second);
  return {
    sourceAddress,
    first,
    intermediate,
    intermediateAddress,
    second,
    target,
  };
}

const d60 = branch(dju, alphabet60);
const b60 = branch(bei, alphabet60);
const d59 = branch(dju, alphabet59);
const b59 = branch(bei, alphabet59);
assert(d60 && b60 && d59 && b59);

assert.deepEqual(
  [d60.first, b60.first, d59.first, b59.first],
  [39, 107, 39, 105]
);
assert.deepEqual(
  [spell(d60.intermediate.indices), spell(b60.intermediate.indices)],
  ["AEPTH", "ATS"]
);
assert.deepEqual(
  [d60.intermediate.start, b60.intermediate.start],
  [37, 105]
);
assert.deepEqual(
  [d60.intermediateAddress, b60.intermediateAddress],
  [40, 55]
);
assert.equal(tableTokens[40], "1K");
assert.equal(tableTokens[55], "1K");
assert.deepEqual([d60.second, b60.second], [80, 80]);
assert.deepEqual([d59.second, b59.second], [79, 79]);

for (const target of [d60.target, b60.target, d59.target, b59.target]) {
  assert(target);
  assert.equal(target.start, 79);
  assert.equal(spell(target.indices), "EORNSOOCAEYEE");
}
const carrier = d59.target;
assert(carrier);
assert.equal(carrier.indices.length, 12);
assert.equal(d59.second, carrier.start);
assert.equal(d60.second, carrier.start + 1);

// Local family control: two adjacent p27 pairs converge to one target word
// under both radices, but only DJU/BEI does so after distinct first hops.
const dualConvergences = [];
for (let i = 0; i < p27Words.length - 1; i += 1) {
  const left60 = branch(p27Words[i], alphabet60);
  const right60 = branch(p27Words[i + 1], alphabet60);
  const left59 = branch(p27Words[i], alphabet59);
  const right59 = branch(p27Words[i + 1], alphabet59);
  if (!left60 || !right60 || !left59 || !right59) continue;
  if (!left60.target || !right60.target || !left59.target || !right59.target) continue;
  const targetStarts = [
    left60.target.start, right60.target.start,
    left59.target.start, right59.target.start,
  ];
  if (!targetStarts.every((value) => value === targetStarts[0])) continue;
  dualConvergences.push({
    pairIndex: i,
    starts: [p27Words[i].start, p27Words[i + 1].start],
    words: [spell(p27Words[i].indices), spell(p27Words[i + 1].indices)],
    first60: [left60.first, right60.first],
    first59: [left59.first, right59.first],
    targetStart: targetStarts[0],
  });
}
assert.equal(dualConvergences.length, 2);
const nontrivialDual = dualConvergences.filter((row) =>
  row.first60[0] !== row.first60[1] || row.first59[0] !== row.first59[1]);
assert.deepEqual(nontrivialDual, [{
  pairIndex: 5,
  starts: [28, 31],
  words: ["DJU", "BEI"],
  first60: [39, 107],
  first59: [39, 105],
  targetStart: 79,
}]);

// P57 semantic recognition on the fixed carrier.
const instar = p57Word("INSTAR");
const tunnelng = p57Word("TUNNELNG");
const surface = p57Word("SURFACE");
const we = p57Word("WE");
const must = p57Word("MUST");
const shed = p57Word("SHED");
const our = p57Word("OUR");
const own = p57Word("OWN");
const divinity = p57Word("DIUINITY");
const within = p57Word("WITHIN");
const emerge = p57Word("EMERGE");
const like = p57Word("LICE"); // canonical GP transliteration of LIKE

// The solved p57 vocabulary explains the navigation registers themselves.
assert.equal(primeSum(our.indices), 21);
assert.equal(phi(primeSum(our.indices)), 12);
assert.equal(phi(primeSum(our.indices)), carrier.indices.length);

assert.equal(primeSum(own.indices), 55);
assert.equal(phi(primeSum(own.indices)), 40);
assert.deepEqual(
  [d60.intermediateAddress, b60.intermediateAddress].sort((a, b) => a - b),
  [phi(primeSum(own.indices)), primeSum(own.indices)]
);
assert.equal(tableTokens[40], "1K");
assert.equal(tableTokens[55], "1K");
assert.equal(tokenValue(tableTokens[40], alphabet59), carrier.start);
assert.equal(tokenValue(tableTokens[55], alphabet59), carrier.start);

assert.equal(gp0(tunnelng), 94);
assert.equal(tokenValue(tableTokens[gp0(tunnelng)], alphabet59), primeSum(own.indices));
assert.equal(tokenValue(tableTokens[primeSum(own.indices)], alphabet59), carrier.start);

assert.equal(primeSum(surface.indices), 246);
assert.equal(primeSum(emerge.indices), 300);
assert.equal(phi(primeSum(surface.indices)), 80);
assert.equal(phi(primeSum(emerge.indices)), 80);
assert.equal(d60.second, phi(primeSum(surface.indices)));
assert.equal(b60.second, phi(primeSum(emerge.indices)));

assert.equal(primeSum(we.indices), 86);
assert.equal(phi(primeSum(we.indices)), gp0(find));

// Base59 continues from the carrier start to the exact left edge of the
// DIVINITY interior. WITHIN independently supplies the right edge.
const innerLeft = tokenValue(tableTokens[carrier.start], alphabet59);
const innerRight = phi(primeSum(within.indices));
assert.equal(innerLeft, 81);
assert.equal(innerRight, 88);
assert.equal(innerLeft, carrier.start + 2);
assert.equal(innerRight, carrier.start + carrier.indices.length - 3);
const p27Runes = corpus.pages.find((page) => page.page === 27).indices;
const selectedInner = p27Runes.slice(innerLeft, innerRight + 1);
assert.deepEqual(selectedInner, carrier.indices.slice(2, -2));
assert.equal(primeSum(selectedInner), 376);

const carrierPrime = primeSum(carrier.indices);
assert.equal(carrierPrime, 562);
assert.equal(phi(carrierPrime), 280);
assert.equal(primeSum(instar.indices), 280);

const shedMatches = [];
const p57PrimeSums = new Set(p57Words.map((word) => primeSum(word.indices)));
for (let depth = 1; depth * 2 < carrier.indices.length; depth += 1) {
  const inner = carrier.indices.slice(depth, -depth);
  const sum = primeSum(inner);
  if (p57PrimeSums.has(sum)) {
    shedMatches.push({depth, sum, inner: spell(inner)});
  }
}
assert.deepEqual(shedMatches, [{
  depth: 2,
  sum: 376,
  inner: "NSOOCAEY",
}]);
assert.equal(primeSum(divinity.indices), 376);
assert.equal(phi(376), 184);
assert.equal(primeSum(like.indices), 184);

// DIVINITY -> LIKE is the only p57 word whose prime-sum totient is another
// p57 word sum.
const p57ByPrimeSum = new Map();
for (const word of p57Words) {
  const sum = primeSum(word.indices);
  if (!p57ByPrimeSum.has(sum)) p57ByPrimeSum.set(sum, []);
  p57ByPrimeSum.get(sum).push(spell(word.indices));
}
const p57TotientEdges = [];
for (const word of p57Words) {
  const sum = primeSum(word.indices);
  const target = p57ByPrimeSum.get(phi(sum));
  if (!target) continue;
  for (const to of target) {
    p57TotientEdges.push({from: spell(word.indices), sum, phi: phi(sum), to});
  }
}
assert.deepEqual(p57TotientEdges, [{
  from: "DIUINITY",
  sum: 376,
  phi: 184,
  to: "LICE",
}]);

// Manuscript-wide control: the selected carrier is the only complete unknown
// word simultaneously satisfying phi(whole prime sum)=INSTAR and a symmetric
// interior prime sum=DIVINITY.
const globalConjunction = [];
for (let i = 0; i < unknownWords.length; i += 1) {
  const word = unknownWords[i];
  const whole = primeSum(word.indices);
  if (phi(whole) !== 280) continue;
  const depths = [];
  for (let depth = 1; depth * 2 < word.indices.length; depth += 1) {
    if (primeSum(word.indices.slice(depth, -depth)) === 376) depths.push(depth);
  }
  if (depths.length) {
    globalConjunction.push({
      index: i,
      page: word.pageStart,
      start: word.start,
      word: spell(word.indices),
      wholePrime: whole,
      depths,
    });
  }
}
assert.equal(globalConjunction.length, 1);
assert.equal(globalConjunction[0].word, "EORNSOOCAEYEE");
assert.deepEqual(globalConjunction[0].depths, [2]);

// The recovered semantic word DIVINITY returns to a literal source-visible 13.
assert.equal(gp0(divinity), 105);
assert.equal(tableTokens[105], "13");

// On the already selected p27 receiver, that literal names the red 13-dot mark.
const p27Ink = ink.pages.find((page) => page.page === 27);
assert(p27Ink);
assert.deepEqual(p27Ink.red_spans.map((span) => [span.start, span.length]), [[0, 19]]);
assert.deepEqual(p27Ink.large_punctuation, [[19, 13, "red"]]);

const heading = corpus.pages.find((page) => page.page === 27).indices.slice(0, 19);
assert.equal(heading.length, 19);
const selectedHeadingRune = heading[12]; // visible count 13, one-based forward
assert.equal(corpus.translit[selectedHeadingRune], "I");
assert.equal(corpus.prime[selectedHeadingRune], 31);
const residual = heading.length - 13;
assert.equal(residual, 6);

const headingPrimeSum = primeSum(heading);
assert.equal(headingPrimeSum, 1109);
assert.equal(primeOrdinal(headingPrimeSum), 186);
assert.equal(31 * residual, 186);
assert.equal(primeSum(must.indices), 186);
assert.equal(phi(primeSum(shed.indices)), 112);

// This is the already established local DH/base59 transducer entered from the
// newly supplied p57/p27 selector.
const coordinate = 31 * 8 + residual;
assert.equal(coordinate, 254);
assert.equal(tableTokens[coordinate], "39");
assert.equal(tokenValue(tableTokens[coordinate], alphabet59), 186);
assert.equal(tokenValue(tableTokens[coordinate], alphabet60), 189);
assert.equal(186, 23 * 8 + 2);
assert.equal(189, 23 * 8 + 5);
const sharedSecret = 186 - 23 * 8;
assert.equal(sharedSecret, 2);
assert.deepEqual(selectedInner, carrier.indices.slice(sharedSecret, -sharedSecret));
assert.equal(modPow(5, residual, 23), 8);
assert.equal(tableTokens[186], "0J");
assert.equal(tokenValue(tableTokens[186], alphabet59), 19);
assert.equal(tableTokens[189], "3C");
assert.equal(tokenValue(tableTokens[189], alphabet59), 189);

process.stdout.write(JSON.stringify({
  classification: "source-constrained navigation and DH handoff; NO UNKNOWN PLAINTEXT",
  terminalRepeat: {
    duplicatedAdjacentPair: "DJU/BEI",
    occurrences: [1462, 2894],
    findGp0: 42,
    findCell: tableTokens[42],
    selectedLocalOffset: 28,
  },
  dualRadixNavigation: {
    source: ["DJU", "BEI"],
    gp0: [35, 45],
    base60First: [d60.first, b60.first],
    base59First: [d59.first, b59.first],
    intermediates: ["AEPTH", "ATS"],
    intermediateGp0: [40, 55],
    sharedSecondToken: "1K",
    base60Convergence: 80,
    base59Convergence: 79,
    carrierStart: carrier.start,
    carrier: spell(carrier.indices),
    nontrivialDualConvergences: nontrivialDual.length,
  },
  carrierSemantics: {
    wholePrimeSum: carrierPrime,
    wholeTotient: phi(carrierPrime),
    instarPrimeSum: primeSum(instar.indices),
    uniqueShedMatch: shedMatches[0],
    sourceSelectedInner: {
      left: innerLeft,
      right: innerRight,
      primeSum: primeSum(selectedInner),
    },
    semanticRegisters: {
      ourTotient: phi(primeSum(our.indices)),
      ownPrime: primeSum(own.indices),
      ownTotient: phi(primeSum(own.indices)),
      tunnelngGp0: gp0(tunnelng),
      surfaceTotient: phi(primeSum(surface.indices)),
      emergeTotient: phi(primeSum(emerge.indices)),
      weTotient: phi(primeSum(we.indices)),
    },
    divinityPrimeSum: primeSum(divinity.indices),
    divinityTotient: phi(primeSum(divinity.indices)),
    likePrimeSum: primeSum(like.indices),
    p57TotientEdges,
    globalUnknownWordConjunctions: globalConjunction.length,
  },
  red13Handoff: {
    divinityGp0: gp0(divinity),
    p50Literal: tableTokens[gp0(divinity)],
    p27HeadingLength: heading.length,
    markerDots: p27Ink.large_punctuation[0][1],
    selectedRune: corpus.translit[selectedHeadingRune],
    selectedPrime: corpus.prime[selectedHeadingRune],
    residual,
    headingPrimeSum,
    headingPrimeOrdinal: primeOrdinal(headingPrimeSum),
    coordinate,
    coordinateToken: tableTokens[coordinate],
    mustPrimeSum: primeSum(must.indices),
    shedTotient: phi(primeSum(shed.indices)),
    sharedSecret,
    sharedSecretConfirmsSymmetricShedDepth: sharedSecret,
    base59CoordinateValue: tokenValue(tableTokens[coordinate], alphabet59),
    base60CoordinateValue: tokenValue(tableTokens[coordinate], alphabet60),
  },
  decision:
    "The manuscript-internal p55 repeat plus FIND selects p27:28; DJU/BEI uniquely reconverges on one p27 carrier under both numeral maps; that carrier uniquely realizes INSTAR/DIVINITY prime-sum semantics and returns through DIVINITY to the visible p27 red13 marker, supplying a source-constrained handoff into the existing DH/base59 transducer. A post-DH receiver/KDF remains missing.",
}, null, 2) + "\n");
