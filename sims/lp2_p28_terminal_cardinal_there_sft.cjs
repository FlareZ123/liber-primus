"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
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

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const parts = transcription.split(/^\s*%\s*$/m);
const primes = firstPrimes(500);
const p50Tokens = grid.pages.flatMap((page) => page.tokens);
const p50Bytes = grid.pages.flatMap((page) => page.bytes);

/** @param {number} cardinal @returns {number} */
function T(cardinal) {
  assert.ok(Number.isInteger(cardinal) && cardinal >= 1);
  return (primes[cardinal - 1] - 1) % 29;
}

/** @param {number[]} lengths @returns {string} */
function spell(lengths) {
  return lengths.map(T).map((value) => corpus.translit[value]).join("");
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} line @returns {number[]} */
function lengths(line) {
  return (line.match(/[\u16A0-\u16FF]+/gu) || []).map((word) => [...word].length);
}

const p28Lines = physicalPart(28)
  .split(/\n/u)
  .filter((line) => /[\u16A0-\u16FF]/u.test(line));
assert.equal(p28Lines.length, 12);

const terminal = lengths(p28Lines.at(-1));
assert.deepEqual(terminal, [1, 2, 8, 3, 8]);
assert.equal(spell(terminal), "UTHERE");
assert.equal(spell(terminal.slice(1)), "THERE");

const targetLine = [1, 2, 8, 3, 8];
const targetSuffix = [2, 8, 3, 8];
const lineHits = [];
const suffixWindowHits = [];
const terminalHits = [];
const terminalSelfPointers = [];
const terminalStatePairs = [];
const broadBoundarySelfPointers = [];
const state = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4 };
const stateValues = Object.values(state);
let runeBearingLines = 0;
let fourWordWindows = 0;
let pageTerminals = 0;

for (let page = 0; page <= 57; page += 1) {
  if (page === 50) continue;
  const lines = physicalPart(page)
    .split(/\n/u)
    .filter((line) => /[\u16A0-\u16FF]/u.test(line));
  if (lines.length > 0) {
    pageTerminals += 1;
    const finalLengths = lengths(lines.at(-1));
    if (JSON.stringify(finalLengths) === JSON.stringify(targetLine)) {
      terminalHits.push({ page, line: lines.length, lengths: finalLengths });
    }
    const finalSerialized = finalLengths.map(T);
    const finalAddress = finalSerialized.reduce((sum, value) => sum + value, 0);
    if (finalAddress < p50Bytes.length) {
      const pair = [
        Math.floor(p50Bytes[finalAddress] / 29),
        p50Bytes[finalAddress] % 29
      ];
      if (stateValues.includes(pair[0]) && stateValues.includes(pair[1])) {
        terminalStatePairs.push({
          page,
          line: lines.length,
          lengths: finalLengths,
          serialized: finalSerialized.map((value) => corpus.translit[value]).join(""),
          gp0: finalAddress,
          token: p50Tokens[finalAddress],
          byte: p50Bytes[finalAddress],
          pair
        });
      }
    }
    if (page <= 55 && finalLengths.length >= 4) {
      const suffix = finalLengths.slice(-4);
      const serialized = suffix.map(T);
      const address = serialized.reduce((sum, value) => sum + value, 0);
      if (address < p50Bytes.length && p50Bytes[address] === page) {
        terminalSelfPointers.push({
          page,
          line: lines.length,
          lengths: suffix,
          serialized: serialized.map((value) => corpus.translit[value]).join(""),
          gp0: address,
          token: p50Tokens[address],
          byte: p50Bytes[address]
        });
      }
    }
  }
  if (page <= 55 && lines.length > 0) {
    for (const [lineRole, line] of [["first", lines[0]], ["last", lines.at(-1)]]) {
      const boundaryLengths = lengths(line);
      if (boundaryLengths.length < 4) continue;
      for (const [windowRole, baseWindow] of [
        ["first4", boundaryLengths.slice(0, 4)],
        ["last4", boundaryLengths.slice(-4)]
      ]) {
        for (const reverse of [false, true]) {
          const window = reverse ? [...baseWindow].reverse() : baseWindow;
          const serialized = window.map(T);
          const address = serialized.reduce((sum, value) => sum + value, 0);
          if (address < p50Bytes.length && p50Bytes[address] === page) {
            broadBoundarySelfPointers.push({
              page,
              lineRole,
              windowRole,
              reverse,
              lengths: window,
              serialized: serialized.map((value) => corpus.translit[value]).join(""),
              gp0: address,
              token: p50Tokens[address],
              byte: p50Bytes[address]
            });
          }
        }
      }
    }
  }

  for (let index = 0; index < lines.length; index += 1) {
    runeBearingLines += 1;
    const row = lengths(lines[index]);
    if (JSON.stringify(row) === JSON.stringify(targetLine)) {
      lineHits.push({ page, line: index + 1, lengths: row });
    }
    for (let start = 0; start + 4 <= row.length; start += 1) {
      fourWordWindows += 1;
      const window = row.slice(start, start + 4);
      if (JSON.stringify(window) === JSON.stringify(targetSuffix)) {
        suffixWindowHits.push({ page, line: index + 1, wordStart: start + 1, lengths: row });
      }
    }
  }
}

assert.equal(runeBearingLines, 604);
assert.equal(pageTerminals, 57);
assert.equal(fourWordWindows, 1566);
assert.deepEqual(lineHits, [{ page: 28, line: 12, lengths: targetLine }]);
assert.deepEqual(terminalHits, [{ page: 28, line: 12, lengths: targetLine }]);
assert.deepEqual(suffixWindowHits, [{
  page: 28,
  line: 12,
  wordStart: 2,
  lengths: targetLine
}]);
assert.deepEqual(terminalSelfPointers, [{
  page: 28,
  line: 12,
  lengths: targetSuffix,
  serialized: "THERE",
  gp0: 42,
  token: "0S",
  byte: 28
}]);
assert.deepEqual(
  terminalStatePairs.filter((row) => row.pair[0] === state.K && row.pair[1] === state.b),
  [{
    page: 28,
    line: 12,
    lengths: targetLine,
    serialized: "UTHERE",
    gp0: 43,
    token: "1D",
    byte: 73,
    pair: [state.K, state.b]
  }]
);
assert.equal(terminalStatePairs.length, 5);
assert.deepEqual(
  broadBoundarySelfPointers.map((row) => [
    row.page, row.lineRole, row.windowRole, row.reverse, row.serialized, row.gp0
  ]),
  [
    [25, "last", "first4", false, "UTGR", 27],
    [25, "last", "first4", true, "RGTU", 27],
    [28, "first", "last4", false, "ITIG", 42],
    [28, "first", "last4", true, "GITI", 42],
    [28, "last", "last4", false, "THERE", 42],
    [28, "last", "last4", true, "ERETH", 42]
  ]
);

console.log(JSON.stringify({
  status: "PASS",
  serializer: "T(n)=(p_n-1) mod29, positive cardinal n",
  p28: {
    lineCount: p28Lines.length,
    terminalLengths: terminal,
    terminalReadout: spell(terminal),
    terminalSuffixReadout: spell(terminal.slice(1))
  },
  manuscriptControls: {
    runeBearingLines,
    fourWordWindows,
    pageTerminals,
    exactFullVectorHits: lineHits,
    exactThereVectorHits: suffixWindowHits,
    exactTerminalVectorHits: terminalHits,
    unknownPageTerminalSelfPointers: terminalSelfPointers,
    terminalStatePairHits: terminalStatePairs,
    exactKbTerminalHits: terminalStatePairs.filter(
      (row) => row.pair[0] === state.K && row.pair[1] === state.b
    ),
    broadBoundarySelfPointers
  },
  classification:
    "Fixed-serializer hidden-layout candidate on independently selected p28. UTHERE/THERE was recognized after the scan, so uniqueness is descriptive rather than a blind authorship probability."
}, null, 2));
