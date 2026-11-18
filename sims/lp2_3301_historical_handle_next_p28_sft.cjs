"use strict";

/**
 * Historical 3301 -> next-screen handle -> NEXT -> p28 DH closure.
 *
 * Upstream:
 *   - a source-selected p27 parser recovers literal integer 3301;
 *   - a previously frozen receiver uses n mod 256 as a zero-based address
 *     into the original 256-cell p50 table;
 *   - the authentic 2013 prime_echo sequence ends at 3301 and the parent
 *     script's next screen is preserved verbatim in the repository.
 *
 * New test:
 *   Apply the same already-used mod256 operation to the source-authored number
 *   on that historical next screen. It must produce a member of the finite
 *   authenticated 2013 opcode vocabulary and then survive the independently
 *   frozen p28 receiver gate.
 *
 * No unknown plaintext or cipher inverse is recovered.
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
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const historicalMessage = read(
  "resources/historical/cicada2013-os-original-message.txt"
);

const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} word */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const out = [];
  for (let offset = 0; offset < normalized.length; ) {
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token);
    out.push(token.value);
    offset += token.symbol.length;
  }
  return out;
}

/** @param {number[]} values */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/** @param {string} token */
function decode60(token) {
  const high = alphabet60.indexOf(token[0]);
  const low = alphabet60.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * 60 + low;
}

/** @param {number} page */
function physicalPage(page) {
  const parts = transcription.split(/\r?\n%\r?\n/);
  const raw = parts[page < 50 ? page : page - 1];
  const values = [];
  const lineStarts = new Set();
  const wordStarts = new Set();
  let offset = 0;

  for (const line of raw.trim().split(/\r?\n/)) {
    lineStarts.add(offset);
    let inWord = false;
    for (const ch of [...line]) {
      const value = runeIndex.get(ch);
      if (value !== undefined) {
        if (!inWord) {
          wordStarts.add(offset);
          inWord = true;
        }
        values.push(value);
        offset += 1;
      } else if ("-./&$".includes(ch)) {
        inWord = false;
      }
    }
  }

  return { values, lineStarts, wordStarts };
}

assert.equal(tokens.length, 256);

// The original signed next-screen message itself is the source.
const handleMatch = historicalMessage.match(/@(\d+)/u);
assert.ok(handleMatch);
const handle = BigInt(handleMatch[1]);
assert.equal(handle, 1231507051321n);
assert.match(historicalMessage, /The key is all around you\./u);
assert.match(historicalMessage, /\n3301\s*$/u);

// Reproduce the previously frozen mod256 source-number lookup.
const recovered3301 = 3301n;
const footerAddress = Number(recovered3301 % BigInt(tokens.length));
assert.equal(footerAddress, 229);
assert.equal(tokens[footerAddress], "00");

// Apply the SAME operation to the historical number shown immediately after
// prime_echo's final 3301. No new modulus is selected.
const handleAddress = Number(handle % BigInt(tokens.length));
assert.equal(handleAddress, 57);

// The result is exactly the authenticated 2013 opcode NEXT under GP0.
const opcodes = [
  "RAND",
  "QUINE",
  "BASE29",
  "CODE",
  "KOAN",
  "DH",
  "NEXT",
  "GOODBYE",
];
const opcodeRows = opcodes.map((opcode) => ({
  opcode,
  gp0: sum(gp(opcode.replace(/\d/gu, ""))),
}));
assert.deepEqual(
  opcodeRows.filter((row) => row.gp0 === handleAddress),
  [{ opcode: "NEXT", gp0: 57 }]
);

// The other historically distinguished prime_echo pause/terminal number does
// not alias an authenticated opcode under the same operation.
const sourceNumbers = [
  { name: "pause1033", value: 1033n },
  { name: "terminal3301", value: 3301n },
  { name: "nextScreenHandle", value: handle },
].map((row) => ({
  ...row,
  mod256: Number(row.value % 256n),
}));
const opcodeGp0 = new Set(opcodeRows.map((row) => row.gp0));
assert.deepEqual(
  sourceNumbers
    .filter((row) => opcodeGp0.has(row.mod256))
    .map((row) => ({ name: row.name, mod256: row.mod256 })),
  [{ name: "nextScreenHandle", mod256: 57 }]
);

// Carry the historical result through Agent13's independently frozen receiver.
assert.equal(tokens[handleAddress], "1w");
const nextValue60 = decode60(tokens[handleAddress]);
assert.equal(nextValue60, 118);

const p28 = physicalPage(28);
const p28Offset = nextValue60 - 1;
assert.equal(p28Offset, 117);
assert.equal(p28.lineStarts.has(p28Offset), true);
assert.equal(p28.wordStarts.has(p28Offset), true);
assert.equal(
  corpus.translit[p28.values[p28Offset]] +
    corpus.translit[p28.values[p28Offset + 1]],
  "DH"
);

// Finite page holdout copied as an independent receiver check.
const eligible = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const parsed = physicalPage(page);
  if (parsed.values.length < 118) continue;
  eligible.push({
    page,
    lineStart: parsed.lineStarts.has(117),
    first2:
      corpus.translit[parsed.values[117]] +
      corpus.translit[parsed.values[118]],
  });
}
assert.equal(eligible.length, 52);
assert.deepEqual(
  eligible.filter((row) => row.first2 === "DH"),
  [{ page: 28, lineStart: true, first2: "DH" }]
);

console.log(
  JSON.stringify(
    {
      status:
        "PASS: recovered3301's authentic historical next screen maps under the same mod256 rule to NEXT57, which points to the unique p28 DH receiver",
      historicalSequence: {
        terminalPrime: 3301,
        nextScreenHandle: handle.toString(),
        message: "The key is all around you.",
      },
      frozenMod256: {
        terminal3301: footerAddress,
        terminalToken: tokens[footerAddress],
        handle: handleAddress,
        opcodeHit: "NEXT",
      },
      sourceNumberControl: sourceNumbers,
      opcodes: opcodeRows,
      nextReceiver: {
        address: handleAddress,
        token: tokens[handleAddress],
        base60Value: nextValue60,
        oneBasedP28Offset: p28Offset,
        fragment: "DH",
      },
      receiverCensus: {
        eligiblePages: eligible.length,
        dhAt117: eligible.filter((row) => row.first2 === "DH"),
      },
      interpretation:
        "The existing p27 route recovers3301. In the authentic 2013 program, final3301 is followed by a signed screen whose handle is @1231507051321. Reusing the already frozen n mod256 table operation gives57, uniquely GP0(NEXT) among the eight authenticated opcodes. P50 cell57 under the independently selected pre-SHED base60 state gives118, whose one-based p28 receiver is the unique DH line. This closes the historical continuation back into the manuscript-native DH node without choosing a new modulus. No unknown plaintext is recovered.",
    },
    null,
    2
  )
);
