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
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);
const tableTokens = grid.pages.flatMap((page) => page.tokens);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} left @param {number} right @returns {[number,number]} */
function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function powMod(base, exponent, modulus) {
  let out = 1 % modulus;
  let x = ((base % modulus) + modulus) % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) out = out * x % modulus;
    x = x * x % modulus;
    e = Math.floor(e / 2);
  }
  return out;
}

/** @param {number} a @param {number} b @returns {number} */
function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x;
}

/** @param {number} value @param {number} modulus @returns {number|null} */
function inverse(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if (value * candidate % modulus === 1) return candidate;
  }
  return null;
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.ok(page >= 0 && page <= 55 && page !== 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} source @returns {number[]} */
function runes(source) {
  return [...source]
    .map((char) => runeIndex.get(char))
    .filter((value) => value !== undefined);
}

/**
 * Printed fragments are maximal rune sequences, the same source units used
 * by the p28 HERE checkpoint.
 * @param {string} source
 * @returns {Array<{start:number,end:number,values:number[],text:string}>}
 */
function fragments(source) {
  const raw = source.match(/[\u16A0-\u16FF]+/gu) || [];
  const out = [];
  let start = 0;
  for (const token of raw) {
    const values = runes(token);
    out.push({
      start,
      end: start + values.length - 1,
      values,
      text: spell(values),
    });
    start += values.length;
  }
  return out;
}

// -------------------------------------------------------------------------
// 1. Reproduce the already committed p28 HERE checkpoint.
// -------------------------------------------------------------------------

const p28Source = physicalPart(28);
const p28Lines = p28Source
  .split("/")
  .filter((line) => /[\u16A0-\u16FF]/u.test(line));
assert.equal(p28Lines.length, 12);

const line6Fragments = fragments(p28Lines[5]);
const firstH = H(
  line6Fragments[0].values[0],
  line6Fragments[0].values.at(-1),
);
const lastH = H(
  line6Fragments.at(-1).values[0],
  line6Fragments.at(-1).values.at(-1),
);
const state = {
  p: line6Fragments.flatMap((fragment) => fragment.values).length,
  g: line6Fragments.length,
  a: 6,
  b: firstH[0],
  A: lastH[0],
  B: lastH[1],
  K: firstH[1],
};
assert.deepEqual(state, {p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2});

const line1Fragments = fragments(p28Lines[0]);
assert.deepEqual(
  [
    line1Fragments.flatMap((fragment) => fragment.values).length,
    line1Fragments.length,
    line1Fragments[0].values.length,
    line1Fragments[1].values.length,
  ],
  [state.p, state.g, state.K, state.g],
);
const hereValues = [
  ...H(line1Fragments[0].values[0], line1Fragments[0].values.at(-1)),
  ...H(line1Fragments[1].values[0], line1Fragments[1].values.at(-1)),
];
assert.deepEqual(hereValues, [8, 18, 4, 18]);
assert.equal(spell(hereValues), "HERE");

// -------------------------------------------------------------------------
// 2. Apply the already promoted whole-word GP0 -> zero-based p50 cell.
// -------------------------------------------------------------------------

const hereGp0 = hereValues.reduce((sum, value) => sum + value, 0);
assert.equal(hereGp0, 48);
assert.equal(tableTokens[hereGp0], "4D");

// Treat positive digit + single-GP-letter cells as a finite literal family.
// A self-index hit means token nX at address a and rune a on a page is the
// nth X seen from that page's start. This charges the "fourth D" reading
// manuscript-wide rather than defining it only for HERE.
const singleLetterRune = new Map(
  corpus.translit
    .map((text, value) => [text, value])
    .filter(([text]) => /^[A-Z]$/.test(text)),
);
const compatibleCells = [];
for (let address = 0; address < tableTokens.length; address += 1) {
  const token = tableTokens[address];
  if (!/^[1-9][A-Z]$/.test(token)) continue;
  const rune = singleLetterRune.get(token[1]);
  if (rune === undefined) continue;
  compatibleCells.push({
    address,
    token,
    ordinal: Number(token[0]),
    letter: token[1],
    rune,
  });
}
assert.equal(compatibleCells.length, 77);

/**
 * @param {number[]} pageRunes
 * @param {number} offset
 * @param {number} rune
 * @returns {number}
 */
function prefixCount(pageRunes, offset, rune) {
  let count = 0;
  for (let index = 0; index <= offset; index += 1) {
    if (pageRunes[index] === rune) count += 1;
  }
  return count;
}

const selfIndexes = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const source = physicalPart(page);
  const pageRunes = runes(source);
  const pageFragments = fragments(source);

  /** @type {Array<null|{fragment:number,start:number,end:number,local:number,length:number,values:number[]}>} */
  const metadata = Array(pageRunes.length).fill(null);
  for (let fragment = 0; fragment < pageFragments.length; fragment += 1) {
    const item = pageFragments[fragment];
    for (let local = 0; local < item.values.length; local += 1) {
      metadata[item.start + local] = {
        fragment: fragment + 1,
        start: item.start,
        end: item.end,
        local,
        length: item.values.length,
        values: item.values,
      };
    }
  }

  for (const cell of compatibleCells) {
    if (cell.address >= pageRunes.length) continue;
    if (pageRunes[cell.address] !== cell.rune) continue;
    if (prefixCount(pageRunes, cell.address, cell.rune) !== cell.ordinal) {
      continue;
    }

    const meta = metadata[cell.address];
    assert.ok(meta);
    const exactCenter = meta.local * 2 === meta.length - 1;
    const hasCentered3 = meta.local > 0 && meta.local < meta.length - 1;
    let centered3 = null;
    if (hasCentered3) {
      const left = pageRunes[cell.address - 1];
      const center = pageRunes[cell.address];
      const right = pageRunes[cell.address + 1];
      centered3 = {
        input: [left, center, right],
        output: [...H(left, right), center],
      };
    }

    selfIndexes.push({
      page,
      ...cell,
      fragment: {
        index: meta.fragment,
        start: meta.start,
        end: meta.end,
        length: meta.length,
        local: meta.local,
        text: spell(meta.values),
      },
      exactCenter,
      centered3,
      centered3Text: centered3 ? spell(centered3.output) : null,
    });
  }
}

assert.equal(selfIndexes.length, 11);
const p28Hit = selfIndexes.find(
  (row) => row.page === 28 && row.address === hereGp0,
);
assert.ok(p28Hit);
assert.deepEqual(
  {
    token: p28Hit.token,
    ordinal: p28Hit.ordinal,
    letter: p28Hit.letter,
    fragment: p28Hit.fragment,
  },
  {
    token: "4D",
    ordinal: 4,
    letter: "D",
    fragment: {
      index: 14,
      start: 46,
      end: 50,
      length: 5,
      local: 2,
      text: "AELDXA",
    },
  },
);

// Among all 11 literal self-indexes, p28 alone lands exactly at a printed
// fragment center.
assert.deepEqual(
  selfIndexes.filter((row) => row.exactCenter).map((row) => [
    row.page,
    row.address,
    row.token,
    row.fragment.text,
  ]),
  [[28, 48, "4D", "AELDXA"]],
);

// -------------------------------------------------------------------------
// 3. Consume the selected center with the fixed preserved-center H packet.
// -------------------------------------------------------------------------

assert.deepEqual(p28Hit.centered3.input, [20, 23, 14]);
assert.deepEqual(p28Hit.centered3.output, [6, 5, 23]);
assert.equal(p28Hit.centered3Text, "GCD");

// Eight of the 11 literal self-indexes admit the same centered-3 consumer.
// GCD occurs only at the p28/HERE-selected hit.
const centeredRows = selfIndexes.filter((row) => row.centered3 !== null);
assert.equal(centeredRows.length, 8);
assert.deepEqual(
  centeredRows.filter((row) => row.centered3Text === "GCD").map((row) => [
    row.page,
    row.address,
    row.token,
  ]),
  [[28, 48, "4D"]],
);

// GCD supplies the standard invertibility test required to reverse the
// literal p28 DH exponent b in the order-(p-1) multiplicative group.
assert.equal(gcd(state.b, state.p - 1), 1);
const inverseB = inverse(state.b, state.p - 1);
assert.equal(inverseB, 3);
assert.equal(powMod(state.B, inverseB, state.p), state.g);

// It also reproduces the previously observed GP29 cross-modulus chain.
assert.equal(powMod(state.K, inverseB, 29), state.A);
assert.equal(powMod(state.A, inverseB, 29), state.B);
assert.equal(powMod(state.B, inverseB, 29), state.b);

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "prospective p28 local holdout: committed HERE -> GP0 48 -> p50[48]=4D -> literal fourth-D self-index at p28 offset48 -> unique exact printed-fragment center -> fixed centered H = GCD -> gcd(b,p-1)=1 and b^-1 mod(p-1)=3",
  chronology:
    "HERE was committed before the 4D/GCD continuation was inspected in this invocation",
  here: {
    values: hereValues,
    gp0: hereGp0,
    token: tableTokens[hereGp0],
  },
  selected: p28Hit,
  dh: {
    state,
    gcd: gcd(state.b, state.p - 1),
    inverseB,
    recoverG: powMod(state.B, inverseB, state.p),
    gp29Chain: [
      powMod(state.K, inverseB, 29),
      powMod(state.A, inverseB, 29),
      powMod(state.B, inverseB, 29),
    ],
  },
  controls: {
    compatibleDigitSingleLetterCells: compatibleCells.length,
    pageCellTrials: 55 * compatibleCells.length,
    literalSelfIndexes: selfIndexes.length,
    exactFragmentCenterSelfIndexes: selfIndexes.filter((row) => row.exactCenter).length,
    centered3Consumers: centeredRows.length,
    gcdOutputs: centeredRows.filter((row) => row.centered3Text === "GCD").length,
    allSelfIndexes: selfIndexes.map((row) => ({
      page: row.page,
      address: row.address,
      token: row.token,
      exactCenter: row.exactCenter,
      centered3Text: row.centered3Text,
    })),
  },
}, null, 2));
