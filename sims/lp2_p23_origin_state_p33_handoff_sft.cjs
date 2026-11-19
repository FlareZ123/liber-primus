"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tokens = grid.pages.flatMap((page) => page.tokens);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out = [];
  for (let candidate = 2; out.length < count; candidate += 1) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor += 1) {
      if (candidate % divisor === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(candidate);
  }
  return out;
}

const primes = firstPrimes(400);

/** @param {number} cardinal @returns {number} */
function T(cardinal) {
  assert.ok(Number.isInteger(cardinal) && cardinal >= 1 && cardinal <= primes.length);
  return mod29(primes[cardinal - 1] - 1);
}

/** @param {number[]} cardinals @returns {string} */
function spellCardinals(cardinals) {
  return cardinals.map((cardinal) => corpus.translit[T(cardinal)]).join("");
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} line @returns {number[]} */
function wordLengths(line) {
  return (line.match(/[\u16A0-\u16FF]+/gu) || []).map((word) => [...word].length);
}

/** @param {number} page @returns {{lens:number[],terminalGp0:number}[]} */
function pageLineRecords(page) {
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

/** @param {number} page @returns {number[][]} */
function pageLineLengths(page) {
  return pageLineRecords(page).map((row) => row.lens);
}

/** @param {number} page @returns {{start:number,end:number,length:number}[]} */
function pageWordRows(page) {
  const words = physicalPart(page)
    .replace(/\/\s*/gu, "")
    .match(/[\u16A0-\u16FF]+/gu) || [];
  let offset = 0;
  return words.map((word) => {
    const length = [...word].length;
    const row = { start: offset, end: offset + length, length };
    offset += length;
    return row;
  });
}

/** @param {number} page @returns {number[][]} */
function exactRedSpanWordLengths(page) {
  const rows = pageWordRows(page);
  const annotation = ink.pages.find((entry) => entry.page === page);
  assert.ok(annotation);
  return annotation.red_spans.map((span) => {
    const selected = rows.filter((row) =>
      row.start >= span.start && row.end <= span.start + span.length
    );
    if (
      selected.length === 0 ||
      selected[0].start !== span.start ||
      selected.at(-1).end !== span.start + span.length
    ) return [];
    return selected.map((row) => row.length);
  });
}

/** @param {number} value @returns {boolean} */
function isPrime(value) {
  if (value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
    if (value % divisor === 0) return false;
  }
  return true;
}

/** @param {number} a @param {number} b @returns {number} */
function gcd(a, b) {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

/** @param {number} value @param {number} modulus @returns {number} */
function inverseModulo(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  throw new Error("no modular inverse");
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function powModulo(base, exponent, modulus) {
  let result = 1;
  let current = ((base % modulus) + modulus) % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * current) % modulus;
    current = (current * current) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

/** @param {[number,number]} pair @returns {[number,number]} */
function H(pair) {
  return [mod29(pair[0] - pair[1]), mod29(pair[0] + pair[1])];
}

/** @param {[number,number]} pair @returns {[number,number]} */
function Hinv(pair) {
  return [mod29(15 * (pair[0] + pair[1])), mod29(15 * (pair[1] - pair[0]))];
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

const clear2016 = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");
const sourceWords = clear2016
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());
assert.equal(sourceWords.length, 43);
const theirPositions = sourceWords
  .map((word, index) => ({ word, index }))
  .filter((entry) => entry.word === "THEIR")
  .map((entry) => entry.index);
assert.deepEqual(theirPositions, [19, 25]);

const p23Line1Record = pageLineRecords(23)[0];
const p23Line1 = p23Line1Record.lens;
assert.deepEqual(p23Line1, [2, 6, 3, 5, 4]);
assert.equal(p23Line1Record.terminalGp0, 25);
assert.equal(spellCardinals(p23Line1), "THEORIG");

const state = {
  p: 23,
  K: p23Line1[0],
  a: p23Line1[1],
  e: p23Line1[2],
  g: p23Line1[3],
  q: p23Line1[4]
};
state.b = inverseModulo(state.e, state.p - 1);
state.A = powModulo(state.g, state.a, state.p);
state.B = powModulo(state.g, state.b, state.p);
assert.deepEqual(state, {
  p: 23, K: 2, a: 6, e: 3, g: 5, q: 4,
  b: 15, A: 8, B: 19
});
assert.equal(powModulo(state.A, state.b, state.p), state.K);
assert.equal(powModulo(state.B, state.a, state.p), state.K);

assert.equal(tokens[state.B], "0X");
assert.equal(grid.bytes[state.B], 33);

const p33RedPairs = exactRedSpanWordLengths(33);
assert.deepEqual(p33RedPairs.slice(0, 2), [
  [state.K, state.A],
  [state.e, state.g]
]);
const upper = [
  ...p33RedPairs[0],
  ...Hinv(p33RedPairs[0])
];
const lower = [
  ...p33RedPairs[1],
  ...H(p33RedPairs[1])
];
assert.equal(spellCardinals(upper), "THEIR");
assert.equal(spellCardinals(lower), "RISE");

const p33Annotation = ink.pages.find((entry) => entry.page === 33);
assert.ok(p33Annotation);
const lowerHeading = [...p33Annotation.red_spans[1].runes]
  .slice(0, 2)
  .map((rune) => runeIndex.get(rune));
assert.deepEqual(lowerHeading, [21, 2]);
const firstRise = H(lowerHeading);
const secondRise = H(firstRise);
assert.deepEqual(firstRise, [19, 23]);
assert.deepEqual(secondRise, [25, 13]);
assert.equal(firstRise[0], theirPositions[0]);
assert.equal(secondRise[0], theirPositions[1]);
assert.equal(theirPositions[1] - theirPositions[0], state.a);
const fiveDotCount = 5;
assert.equal(spellCardinals([fiveDotCount]), "I");
assert.equal(spellCardinals([p23Line1Record.terminalGp0]), "N");
assert.equal(
  spellCardinals([...p23Line1, fiveDotCount, p23Line1Record.terminalGp0]),
  "THEORIGIN"
);
assert.equal(secondRise[0], p23Line1Record.terminalGp0);

let fiveWordLines = 0;
const localPacketPrefixHits = [];
for (let page = 0; page <= 57; page += 1) {
  if (page === 50) continue;
  const records = pageLineRecords(page);
  for (let lineIndex = 0; lineIndex < records.length; lineIndex += 1) {
    const row = records[lineIndex];
    if (row.lens.length !== 5) continue;
    fiveWordLines += 1;
    const output = spellCardinals([...row.lens, fiveDotCount, row.terminalGp0]);
    if (output.startsWith("THEORI")) {
      localPacketPrefixHits.push({
        page,
        line: lineIndex + 1,
        lens: row.lens,
        terminalGp0: row.terminalGp0,
        output
      });
    }
  }
}
assert.equal(fiveWordLines, 188);
assert.deepEqual(localPacketPrefixHits, [{
  page: 23,
  line: 1,
  lens: [2, 6, 3, 5, 4],
  terminalGp0: 25,
  output: "THEORIGIN"
}]);

const motifAdjacentControls = [
  { page: 7, row: pageLineRecords(7).at(-1) },
  { page: 23, row: pageLineRecords(23)[0] },
  { page: 56, row: pageLineRecords(56).at(-1) }
].map(({ page, row }) => ({
  page,
  cardinals: [...row.lens, fiveDotCount, row.terminalGp0],
  output: spellCardinals([...row.lens, fiveDotCount, row.terminalGp0])
}));
assert.deepEqual(motifAdjacentControls, [
  { page: 7, cardinals: [2, 4, 3, 2, 3, 5, 19], output: "THGRTHRIH" },
  { page: 23, cardinals: [2, 6, 3, 5, 4, 5, 25], output: "THEORIGIN" },
  { page: 56, cardinals: [2, 2, 4, 3, 3, 4, 5, 15], output: "THTHGRRGIB" }
]);

// Charge every field-order assignment on every five-word line of every prime physical page.
const roleOrders = permutations(["K", "a", "e", "g", "q"]);
const closures = [];
let primePageFiveWordLines = 0;
for (let page = 2; page <= 55; page += 1) {
  if (page === 50 || !isPrime(page)) continue;
  const lines = pageLineLengths(page);
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const lens = lines[lineIndex];
    if (lens.length !== 5) continue;
    primePageFiveWordLines += 1;

    for (const order of roleOrders) {
      const values = Object.fromEntries(
        order.map((role, index) => [role, lens[index]])
      );
      if (
        Math.max(values.K, values.a, values.e, values.g, values.q) >= page ||
        gcd(values.e, page - 1) !== 1
      ) continue;

      const b = inverseModulo(values.e, page - 1);
      const A = powModulo(values.g, values.a, page);
      const B = powModulo(values.g, b, page);
      if (
        powModulo(A, b, page) !== values.K ||
        powModulo(B, values.a, page) !== values.K
      ) continue;

      closures.push({
        page,
        line: lineIndex + 1,
        lens,
        order,
        values,
        b,
        A,
        B,
        destination: B < grid.bytes.length ? grid.bytes[B] : null
      });
    }
  }
}
assert.equal(primePageFiveWordLines, 53);
assert.equal(primePageFiveWordLines * roleOrders.length, 6360);
assert.equal(closures.length, 54);

const physicalPageHandoffs = closures.filter((entry) =>
  Number.isInteger(entry.destination) &&
  entry.destination >= 0 &&
  entry.destination <= 57
);
assert.equal(physicalPageHandoffs.length, 4);

const packetMatches = physicalPageHandoffs.filter((entry) => {
  if (entry.destination === 50) return false;
  const pairs = exactRedSpanWordLengths(entry.destination);
  return (
    pairs.length >= 2 &&
    JSON.stringify(pairs[0]) === JSON.stringify([entry.values.K, entry.A]) &&
    JSON.stringify(pairs[1]) === JSON.stringify([entry.values.e, entry.values.g])
  );
});
assert.equal(packetMatches.length, 1);
assert.equal(packetMatches[0].page, 23);
assert.equal(packetMatches[0].line, 1);
assert.deepEqual(packetMatches[0].order, ["K", "a", "e", "g", "q"]);
assert.equal(packetMatches[0].destination, 33);

const p23Closures = closures.filter((entry) => entry.page === 23 && entry.line === 1);
assert.equal(p23Closures.length, 6);
assert.deepEqual(
  p23Closures.map((entry) => [entry.order.join(","), entry.B, entry.destination]),
  [
    ["K,a,e,g,q", 19, 33],
    ["K,g,a,e,q", 16, 121],
    ["K,g,e,q,a", 8, 92],
    ["a,g,K,e,q", 16, 121],
    ["g,K,e,a,q", 16, 121],
    ["g,a,e,q,K", 16, 121]
  ]
);

console.log(JSON.stringify({
  status: "PASS",
  serializer: "T(n)=phi(p_n) mod29=(p_n-1) mod29, positive one-based cardinal",
  p23: {
    sourceSelector: "five-dot p7->p23 vertical mirror selects p23 initial line",
    line1WordLengths: p23Line1,
    prefix: spellCardinals(p23Line1),
    fiveDotCount,
    terminalGp0: p23Line1Record.terminalGp0,
    completedCardinals: [...p23Line1, fiveDotCount, p23Line1Record.terminalGp0],
    completedInstruction: spellCardinals([...p23Line1, fiveDotCount, p23Line1Record.terminalGp0]),
    fiveWordLineControlCount: fiveWordLines,
    localPacketPrefixHits,
    motifAdjacentControls,
    originState: state
  },
  stateHandoff: {
    addressField: "B",
    p50Address: state.B,
    p50Token: tokens[state.B],
    base60DestinationPage: grid.bytes[state.B],
    destinationRedPairs: p33RedPairs.slice(0, 2),
    hiddenText: spellCardinals(upper) + " " + spellCardinals(lower)
  },
  theirRiseCompletion: {
    signedTheirPositions: theirPositions,
    p33HChain: [lowerHeading, firstRise, secondRise],
    rise: theirPositions[1] - theirPositions[0],
    signedRiseDestination: theirPositions[1],
    TOfRiseDestination: spellCardinals([theirPositions[1]]),
    equalsP23TerminalGp0: theirPositions[1] === p23Line1Record.terminalGp0,
    role: "independent confirmation of the p23 terminal cardinal 25"
  },
  chargedFamily: {
    primePageFiveWordLines,
    roleOrders: roleOrders.length,
    assignments: primePageFiveWordLines * roleOrders.length,
    dhClosures: closures.length,
    physicalPageHandoffs: physicalPageHandoffs.length,
    packetMatches: packetMatches.length,
    uniquePacketMatch: {
      page: packetMatches[0].page,
      line: packetMatches[0].line,
      order: packetMatches[0].order,
      destination: packetMatches[0].destination
    }
  }
}, null, 2));
