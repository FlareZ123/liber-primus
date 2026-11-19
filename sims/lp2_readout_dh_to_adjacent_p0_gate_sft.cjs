"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");
const sourceAudit = fs.readFileSync(
  path.join(root, "resources/external/2013-tcp-server-signed-source.md"), "utf8");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const parts = transcription.split(/^\s*%\s*$/m);

/**
 * @param {string} text
 * @returns {Array<{number:number,start:number,end:number,values:number[]}>}
 */
function parseWords(text) {
  const words = [];
  let values = [];
  let start = 0;
  let offset = 0;

  function flush() {
    if (!values.length) return;
    words.push({
      number: words.length + 1,
      start,
      end: offset - 1,
      values: values.slice(),
    });
    values = [];
  }

  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!values.length) start = offset;
      values.push(value);
      offset += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return words;
}

/**
 * @typedef {{
 *   name:string,
 *   inputType:string,
 *   outputType:string,
 *   deterministic:boolean,
 *   consumesDhState:boolean,
 *   producesGp29:boolean
 * }} Operation
 */

/** @type {Operation[]} */
const authenticated2013 = [
  {
    name: "RAND",
    inputType: "integer count",
    outputType: "random integers 0..255",
    deterministic: false,
    consumesDhState: false,
    producesGp29: false,
  },
  {
    name: "QUINE",
    inputType: "command",
    outputType: "participant-selected program text",
    deterministic: false,
    consumesDhState: false,
    producesGp29: false,
  },
  {
    name: "BASE29",
    inputType: "integer",
    outputType: "ASCII base-29 numeral",
    deterministic: true,
    consumesDhState: false,
    producesGp29: false,
  },
  {
    name: "CODE",
    inputType: "command",
    outputType: "participant server source text",
    deterministic: false,
    consumesDhState: false,
    producesGp29: false,
  },
  {
    name: "KOAN",
    inputType: "command",
    outputType: "participant-selected koan text",
    deterministic: false,
    consumesDhState: false,
    producesGp29: false,
  },
  {
    name: "DH",
    inputType: "prime modulus, participant/server DH integers",
    outputType: "integer base/public share/shared key",
    deterministic: false,
    consumesDhState: true,
    producesGp29: false,
  },
  {
    name: "NEXT",
    inputType: "client-supplied text",
    outputType: "stored client text plus acknowledgement",
    deterministic: false,
    consumesDhState: false,
    producesGp29: false,
  },
  {
    name: "GOODBYE",
    inputType: "command",
    outputType: "connection termination",
    deterministic: true,
    consumesDhState: false,
    producesGp29: false,
  },
];

// These are the only reversible GP29 maps admitted by Director #1708.
// Their domains are already-GP29 symbols. Neither source-authenticated map
// defines a conversion from the integer DH state into a GP29 keystream.
const sourceSelectedGp29 = [
  {
    name: "H/Hinv",
    inputType: "two GP29 symbols",
    outputType: "two GP29 symbols",
    deterministic: true,
    consumesDhState: false,
    producesGp29: true,
  },
  {
    name: "cube/uncube",
    inputType: "one GP29 symbol, frozen exponent 3/19",
    outputType: "one GP29 symbol",
    deterministic: true,
    consumesDhState: false,
    producesGp29: true,
  },
];

// The exact signed-source audit must retain the semantic facts used here.
assert.match(sourceAudit, /BASE29 3301/);
assert.match(sourceAudit, /worked DH 23 exchange/);
assert.match(sourceAudit, /server returns the shared value/);
assert.match(sourceAudit, /NEXT as client-supplied text/);
assert.match(sourceAudit, /no source-authored reversible cipher/i);

// Freeze the Director target before any output scoring: the next four complete
// printed words after the READ OUT packet p0 words18..21 / offsets80..102.
const p0Words = parseWords(parts[0]);
const packet = p0Words.slice(17, 21);
assert.deepEqual(packet.map((word) => [word.number, word.start, word.end]), [
  [18, 80, 82],
  [19, 83, 89],
  [20, 90, 94],
  [21, 95, 102],
]);

const target = p0Words.slice(21, 25);
assert.deepEqual(target.map((word) => [word.number, word.start, word.end, word.values]), [
  [22, 103, 104, [8, 12]],
  [23, 105, 108, [16, 8, 25, 27]],
  [24, 109, 110, [14, 26]],
  [25, 111, 113, [18, 1, 21]],
]);

const dh = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 };
assert.equal(Object.keys(dh).length, 7);

// A qualifying bridge has to be source-authenticated, deterministic,
// consume the DH state, and emit GP29 symbols. No authenticated 2013
// operation has that type. H/cube emit GP29 only after GP29 input is already
// supplied, so treating integer DH values as runes or as a repeated key would
// add an unauthenticated coercion/KDF.
const allOperations = [...authenticated2013, ...sourceSelectedGp29];
const typedBridges = allOperations.filter((operation) =>
  operation.deterministic &&
  operation.consumesDhState &&
  operation.producesGp29
);
assert.deepEqual(typedBridges, []);

console.log(JSON.stringify({
  status: "PASS",
  directorIssue: 1708,
  frozenPacket: {
    page: 0,
    words: [18, 21],
    offsets: [80, 102],
    dh,
  },
  frozenAdjacentTarget: {
    page: 0,
    words: [22, 25],
    offsets: [103, 113],
    values: target.flatMap((word) => word.values),
  },
  authenticated2013,
  sourceSelectedGp29,
  typedDhToGp29Bridges: typedBridges,
  decision:
    "STOP: authenticated 2013 semantics define an integer DH result but no KDF/serialization from that state to GP29; H/cube require GP29 inputs and do not supply the missing type conversion. The adjacent ciphertext target is therefore left untouched.",
}, null, 2));
