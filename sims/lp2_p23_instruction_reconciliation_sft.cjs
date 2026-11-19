"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) { return ((value % 29) + 29) % 29; }

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out = [];
  for (let candidate = 2; out.length < count; candidate += 1) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor += 1) {
      if (candidate % divisor === 0) { prime = false; break; }
    }
    if (prime) out.push(candidate);
  }
  return out;
}

/** @param {number} a @param {number} b @returns {number} */
function gcd(a, b) { return b === 0 ? Math.abs(a) : gcd(b, a % b); }

/** @param {number} value @param {number} modulus @returns {number} */
function inverseModulo(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  throw new Error("no inverse");
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function powModulo(base, exponent, modulus) {
  let result = 1;
  let factor = mod29(base);
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

/** @param {number} value @returns {boolean} */
function isPrime(value) {
  if (value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
    if (value % divisor === 0) return false;
  }
  return true;
}

/** @template T @param {T[]} values @returns {T[][]} */
function permutations(values) {
  if (values.length <= 1) return [values];
  const out = [];
  for (let index = 0; index < values.length; index += 1) {
    const rest = [...values.slice(0, index), ...values.slice(index + 1)];
    for (const tail of permutations(rest)) out.push([values[index], ...tail]);
  }
  return out;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const p50Tokens = grid.pages.flatMap((page) => page.tokens);
const p50Bytes = grid.pages.flatMap((page) => page.bytes);
const primes = firstPrimes(400);
const fiveDots = 5;
const state = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4 };

/** @param {number} cardinal @returns {number} */
function T(cardinal) {
  assert.ok(Number.isInteger(cardinal) && cardinal >= 1 && cardinal <= primes.length);
  return mod29(primes[cardinal - 1] - 1);
}

/** @param {number[]} cardinals @returns {number[]} */
function serialize(cardinals) { return cardinals.map(T); }

/** @param {number[]} values @returns {string} */
function spell(values) { return values.map((value) => corpus.translit[value]).join(""); }

/** @param {number} address @returns {[number,number]} */
function p50Pair(address) {
  const value = p50Bytes[address];
  return [Math.floor(value / 29), value % 29];
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {number} page @returns {{lens:number[],terminalGp0:number}[]} */
function lineRecords(page) {
  return physicalPart(page)
    .split(/\n/u)
    .filter((line) => /[\u16A0-\u16FF]/u.test(line))
    .map((line) => {
      const words = line.match(/[\u16A0-\u16FF]+/gu) || [];
      const terminalRune = [...words.at(-1)].at(-1);
      const terminalGp0 = runeIndex.get(terminalRune);
      assert.notEqual(terminalGp0, undefined);
      return { lens: words.map((word) => [...word].length), terminalGp0 };
    });
}

/** @param {number} page @returns {{start:number,end:number,length:number}[]} */
function wordRows(page) {
  const text = physicalPart(page);
  const rows = [];
  let offset = 0;
  let current = [];
  let start = 0;
  const flush = () => {
    if (!current.length) return;
    rows.push({ start, end: offset, length: current.length });
    current = [];
  };
  for (const ch of text) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (ch === "-" || ch === "." || ch === "/" || /\s/u.test(ch)) {
      flush();
    }
  }
  flush();
  return rows;
}

/** @param {number} a @param {number} b @returns {[number,number]} */
function H(a, b) { return [mod29(a - b), mod29(a + b)]; }

/** @param {number} a @param {number} b @returns {[number,number]} */
function Hinv(a, b) {
  return [mod29(15 * (a + b)), mod29(15 * (b - a))];
}

// ---- Distinct source objects on p23 ----

const p23Line = lineRecords(23)[0];
assert.deepEqual(p23Line.lens, [2, 6, 3, 5, 4]);
assert.equal(p23Line.terminalGp0, 25);
assert.equal(spell(serialize(p23Line.lens)), "THEORIG");

const p23Annotation = ink.pages.find((page) => page.page === 23);
assert.ok(p23Annotation);
assert.deepEqual(p23Annotation.red_spans.map((span) => [span.start, span.length]), [[0, 16]]);
const p23Rows = wordRows(23);
const redSpan = p23Annotation.red_spans[0];
const p23RedLengths = p23Rows
  .filter((row) => row.start >= redSpan.start && row.end <= redSpan.start + redSpan.length)
  .map((row) => row.length);
assert.deepEqual(p23RedLengths, [2, 6, 3, 5]);

// Shared inputs are the first four lengths only. THE ORIGINAL additionally uses
// fifth length4, dot5, terminal25, physical23 and the state-selected destination33.
// THE ONE RISE stops at the red span and uses forward H on its two printed pairs.

const oneRiseCardinals = [
  p23RedLengths[0], p23RedLengths[1], ...H(p23RedLengths[0], p23RedLengths[1]),
  p23RedLengths[2], p23RedLengths[3], ...H(p23RedLengths[2], p23RedLengths[3])
];
assert.deepEqual(oneRiseCardinals, [2, 6, 25, 8, 3, 5, 27, 8]);
const oneRiseValues = serialize(oneRiseCardinals);
assert.equal(spell(oneRiseValues), "THEONERISE");
const oneRiseGp0 = oneRiseValues.reduce((sum, value) => sum + value, 0);
assert.equal(oneRiseGp0, 88);
assert.equal(p50Tokens[oneRiseGp0], "3V");
assert.deepEqual(p50Pair(oneRiseGp0), [7, 8]);

// ---- Complete comparable red-span H/Hinv family ----

const redVariants = [];
for (const page of ink.pages) {
  if (page.page === 50) continue;
  const rows = wordRows(page.page);
  for (const span of page.red_spans || []) {
    const selected = rows.filter((row) =>
      row.start >= span.start && row.end <= span.start + span.length
    );
    const lengths = selected.map((row) => row.length);
    if (
      lengths.length === 0 ||
      lengths.length % 2 !== 0 ||
      lengths.reduce((sum, value) => sum + value, 0) !== span.length ||
      lengths.length > 12
    ) continue;
    const pairCount = lengths.length / 2;
    for (let mask = 0; mask < (1 << pairCount); mask += 1) {
      const cardinals = [];
      for (let pair = 0; pair < pairCount; pair += 1) {
        const a = lengths[pair * 2];
        const b = lengths[pair * 2 + 1];
        const derived = (mask & (1 << pair)) ? Hinv(a, b) : H(a, b);
        cardinals.push(a, b, ...derived);
      }
      if (!cardinals.every((value) => value >= 1 && value <= primes.length)) continue;
      const values = serialize(cardinals);
      const gp0 = values.reduce((sum, value) => sum + value, 0);
      if (gp0 >= 256) continue;
      redVariants.push({
        page: page.page,
        start: span.start,
        lengths,
        mask,
        cardinals,
        text: spell(values),
        gp0,
        p50Pair: p50Pair(gp0)
      });
    }
  }
}
assert.equal(redVariants.length, 24);
assert.deepEqual(
  redVariants.filter((row) => row.text === "THEONERISE"),
  [{
    page: 23,
    start: 0,
    lengths: [2, 6, 3, 5],
    mask: 0,
    cardinals: oneRiseCardinals,
    text: "THEONERISE",
    gp0: 88,
    p50Pair: [7, 8]
  }]
);
assert.deepEqual(
  redVariants.filter((row) => row.p50Pair[1] === row.p50Pair[0] + 1),
  [{
    page: 23,
    start: 0,
    lengths: [2, 6, 3, 5],
    mask: 0,
    cardinals: oneRiseCardinals,
    text: "THEONERISE",
    gp0: 88,
    p50Pair: [7, 8]
  }]
);

// The held-out pair [7,8] is literally one rise from p7, the other unsolved
// five-dot stencil page established before the English serializer was read.
assert.equal(p50Pair(oneRiseGp0)[0], 7);
assert.equal(p50Pair(oneRiseGp0)[1] - p50Pair(oneRiseGp0)[0], 1);

// ---- Prospective p8 cross-check opened only after freezing ONE RISE -> [7,8] ----

// The frozen holdout names p8 as the one-rise endpoint from p7.
// Physical p8 itself equals A=8.
assert.equal(state.A, 8);
assert.deepEqual(p50Pair(state.A), [state.e, state.g]);

const exactTwoWordRedSpans = [];
for (const page of ink.pages) {
  if (page.page === 50) continue;
  const rows = wordRows(page.page);
  for (const span of page.red_spans || []) {
    const selected = rows.filter((row) =>
      row.start >= span.start && row.end <= span.start + span.length
    );
    if (
      selected.length !== 2 ||
      selected[0].start !== span.start ||
      selected[1].end !== span.start + span.length
    ) continue;
    const lengths = selected.map((row) => row.length);
    exactTwoWordRedSpans.push({
      page: page.page,
      start: span.start,
      lengths,
      inverseH: Hinv(lengths[0], lengths[1]),
      pageP50Pair: p50Pair(page.page)
    });
  }
}
assert.equal(exactTwoWordRedSpans.length, 8);

const p8RedState = exactTwoWordRedSpans.filter((row) =>
  row.page === state.A &&
  row.lengths[0] === state.q &&
  row.lengths[1] === state.A &&
  row.inverseH[0] === state.a &&
  row.inverseH[1] === state.K &&
  row.pageP50Pair[0] === state.e &&
  row.pageP50Pair[1] === state.g
);
assert.deepEqual(p8RedState, [{
  page: 8,
  start: 0,
  lengths: [state.q, state.A],
  inverseH: [state.a, state.K],
  pageP50Pair: [state.e, state.g]
}]);

assert.deepEqual(
  exactTwoWordRedSpans.filter((row) =>
    row.lengths[0] === state.q && row.lengths[1] === state.A
  ).map((row) => row.page),
  [8]
);
assert.deepEqual(
  exactTwoWordRedSpans.filter((row) =>
    row.pageP50Pair[0] === state.e &&
    row.pageP50Pair[1] === state.g &&
    row.inverseH[0] === state.a &&
    row.inverseH[1] === state.K
  ).map((row) => row.page),
  [8]
);

const egByte = state.e * 29 + state.g;
const egAddresses = p50Bytes
  .map((value, address) => value === egByte ? address : null)
  .filter((address) => address !== null);
assert.deepEqual(egAddresses, [8, 146]);
assert.deepEqual(
  egAddresses.filter((address) => address <= 57 && address !== 50),
  [8]
);

// ---- THE ORIGIN local packet family ----

let fiveWordLines = 0;
let serializerValidFiveWordLines = 0;
const invalidTerminalCardinalLines = [];
const originTextHits = [];
for (let page = 0; page <= 57; page += 1) {
  if (page === 50) continue;
  const records = lineRecords(page);
  for (let index = 0; index < records.length; index += 1) {
    const row = records[index];
    if (row.lens.length !== 5) continue;
    fiveWordLines += 1;
    if (row.terminalGp0 < 1) {
      invalidTerminalCardinalLines.push({
        page,
        line: index + 1,
        lens: row.lens,
        terminalGp0: row.terminalGp0
      });
      continue;
    }
    serializerValidFiveWordLines += 1;
    const cardinals = [...row.lens, fiveDots, row.terminalGp0];
    const text = spell(serialize(cardinals));
    if (text.startsWith("THEORI")) {
      originTextHits.push({ page, line: index + 1, cardinals, text });
    }
  }
}
assert.equal(fiveWordLines, 188);
assert.equal(serializerValidFiveWordLines, 179);
assert.equal(invalidTerminalCardinalLines.length, 9);
assert.deepEqual(originTextHits, [{
  page: 23,
  line: 1,
  cardinals: [2, 6, 3, 5, 4, 5, 25],
  text: "THEORIGIN"
}]);

const motifControls = [
  { page: 7, row: lineRecords(7).at(-1) },
  { page: 23, row: lineRecords(23)[0] },
  { page: 56, row: lineRecords(56).at(-1) }
].map(({ page, row }) => ({
  page,
  cardinals: [...row.lens, fiveDots, row.terminalGp0],
  text: spell(serialize([...row.lens, fiveDots, row.terminalGp0]))
}));
assert.deepEqual(motifControls, [
  { page: 7, cardinals: [2, 4, 3, 2, 3, 5, 19], text: "THGRTHRIH" },
  { page: 23, cardinals: [2, 6, 3, 5, 4, 5, 25], text: "THEORIGIN" },
  { page: 56, cardinals: [2, 2, 4, 3, 3, 4, 5, 15], text: "THTHGRRGIB" }
]);

// ---- Charged DH/page-handoff family used to extend ORIGIN to ORIGINAL ----

const roleOrders = permutations(["K", "a", "e", "g", "q"]);
const closures = [];
for (let page = 2; page <= 55; page += 1) {
  if (page === 50 || !isPrime(page)) continue;
  const records = lineRecords(page);
  for (let lineIndex = 0; lineIndex < records.length; lineIndex += 1) {
    const row = records[lineIndex];
    if (row.lens.length !== 5) continue;
    for (const order of roleOrders) {
      const values = Object.fromEntries(order.map((role, index) => [role, row.lens[index]]));
      if (Math.max(...Object.values(values)) >= page || gcd(values.e, page - 1) !== 1) continue;
      const b = inverseModulo(values.e, page - 1);
      const A = powModulo(values.g, values.a, page);
      const B = powModulo(values.g, b, page);
      if (powModulo(A, b, page) !== values.K || powModulo(B, values.a, page) !== values.K) continue;
      closures.push({
        page,
        line: lineIndex + 1,
        row,
        order,
        B,
        destination: B < p50Bytes.length ? p50Bytes[B] : null
      });
    }
  }
}
assert.equal(closures.length, 54);
const physicalHandoffs = closures.filter((row) =>
  Number.isInteger(row.destination) && row.destination >= 0 && row.destination <= 57
);
assert.equal(physicalHandoffs.length, 4);

const handoffPackets = physicalHandoffs.map((row) => {
  const cardinals = [
    ...row.row.lens,
    fiveDots,
    row.row.terminalGp0,
    row.page,
    row.destination
  ];
  const values = serialize(cardinals);
  const gp0 = values.reduce((sum, value) => sum + value, 0);
  return {
    page: row.page,
    line: row.line,
    order: row.order.join(","),
    destination: row.destination,
    terminalGp0: row.row.terminalGp0,
    cardinals,
    text: spell(values),
    gp0,
    primeAtTerminal: primes[row.row.terminalGp0 - 1],
    primeClosure: primes[row.row.terminalGp0 - 1] === gp0,
    p50Pair: gp0 < 256 ? p50Pair(gp0) : null
  };
});

const originalPacket = handoffPackets.find((row) =>
  row.page === 23 && row.line === 1 && row.order === "K,a,e,g,q"
);
assert.ok(originalPacket);
assert.equal(originalPacket.destination, 33);
assert.equal(originalPacket.text, "THEORIGINAL");
assert.equal(originalPacket.gp0, 97);
assert.equal(originalPacket.terminalGp0, 25);
assert.equal(originalPacket.primeAtTerminal, 97);
assert.equal(originalPacket.primeClosure, true);
assert.deepEqual(originalPacket.p50Pair, [fiveDots, p23Line.lens.length]);

assert.deepEqual(
  handoffPackets.filter((row) => row.primeClosure).map((row) => [row.page, row.line, row.order]),
  [[23, 1, "K,a,e,g,q"]]
);
assert.deepEqual(
  handoffPackets.filter((row) =>
    row.p50Pair &&
    row.p50Pair[0] === fiveDots &&
    row.p50Pair[1] === p23Line.lens.length
  ).map((row) => [row.page, row.line, row.order]),
  [[23, 1, "K,a,e,g,q"]]
);

// Important cross-family control: the p41 DH rivals also have GP0=88 -> [7,8],
// so the ONE-RISE scalar is not globally unique. They do not arise from the
// red-span serializer and fail the ORIGINAL prime/[5,5] holdouts.
assert.equal(
  handoffPackets.filter((row) => row.gp0 === oneRiseGp0).length,
  2
);
assert.ok(
  handoffPackets.filter((row) => row.gp0 === oneRiseGp0)
    .every((row) => row.page === 41)
);

console.log(JSON.stringify({
  status: "PASS",
  sourceObjects: {
    sharedP23Lengths: p23RedLengths,
    originalOnly: {
      fifthWordLength: p23Line.lens[4],
      fiveDots,
      terminalGp0: p23Line.terminalGp0,
      sourcePage: 23,
      destinationPage: originalPacket.destination
    },
    oneRiseOnly: {
      redBoundaryLength: redSpan.length,
      pairModes: ["H", "H"],
      derived: [H(2, 6), H(3, 5)]
    }
  },
  original: {
    localFiveWordFamily: {
      rawCount: fiveWordLines,
      serializerValidCount: serializerValidFiveWordLines,
      invalidTerminalCardinalLines,
      hits: originTextHits
    },
    motifControls,
    dhClosures: closures.length,
    physicalHandoffs: handoffPackets,
    fullInstruction: originalPacket.text,
    holdouts: {
      gp0: originalPacket.gp0,
      terminalPrime: originalPacket.primeAtTerminal,
      primeClosure: originalPacket.primeClosure,
      p50Pair: originalPacket.p50Pair,
      sourceTypedPair: [fiveDots, p23Line.lens.length]
    }
  },
  oneRise: {
    redVariantCount: redVariants.length,
    exactTextHits: redVariants.filter((row) => row.text === "THEONERISE"),
    consecutiveP50PairHits: redVariants.filter((row) => row.p50Pair[1] === row.p50Pair[0] + 1),
    holdout: {
      gp0: oneRiseGp0,
      p50Pair: p50Pair(oneRiseGp0),
      motifStartPage: 7,
      literalRise: 1
    },
    prospectiveP8Crosscheck: {
      physicalPage: state.A,
      pageP50Pair: p50Pair(state.A),
      exactTwoWordRedSpanCount: exactTwoWordRedSpans.length,
      redState: p8RedState[0],
      exactEgByteAddresses: egAddresses
    }
  },
  reconciliation:
    "Both survive as distinct p23 source objects. THE ORIGINAL uses the five-dot-selected complete five-word line plus local dot/terminal and the independently charged DH page handoff. THE ONE RISE uses only the four-word red span plus forward H on its two printed pairs. Their numeric holdouts differ: ORIGINAL closes 97=p_25 and p50[97]=[5,5]; ONE RISE uniquely within the charged red family closes p50[88]=[7,8], a literal one-rise from the other unsolved five-dot motif page p7. After freezing that consequence, p8 independently validates as a state cross-check: page8=A, p50[8]=[e,g], its unique red two-word span is [q,A], and Hinv([q,A])=[a,K]. A concurrent stronger route establishes that the repeated RISE=[3,5] packet already carries a +2 page operation at p33 and p40, so THE ONE RISE preferentially means one +2 application from p23 to independently selected p25. The [7,8] p8 result remains secondary numeric corroboration. The p41 DH rivals also sum to88, so [7,8] is family-specific rather than globally unique."
}, null, 2));
