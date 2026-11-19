"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const squareText = read("resources/cicada2014-openpuff-magic-squares.txt");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

const squares = squareText
  .trim()
  .split(/\n\s*\n/u)
  .map((block) => block
    .split("\n")
    .map((line) => line.trim().split(/\s+/u).map(Number)));

const tape = grid.pages.flatMap((page) => page.tokens);
const alphabet59 = grid.alphabet.replace("f", "");
const alphabet60 = grid.alphabet;

assert.equal(tape.length, 256);
assert.equal(squares.length, 3);

/**
 * Canonical Latin -> GP29 encoding used by current repository analyses.
 * @param {string} text
 * @returns {number[]}
 */
function gp(text) {
  const normalized = text
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const tokens = corpus.translit
    .map((symbol, value) => ({symbol, value}))
    .sort((left, right) => right.symbol.length - left.symbol.length);

  const out = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      out.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      out.push(27);
      offset += 2;
      continue;
    }
    const token = tokens.find((row) => normalized.startsWith(row.symbol, offset));
    assert.ok(token, "Unmapped GP spelling: " + normalized.slice(offset));
    out.push(token.value);
    offset += token.symbol.length;
  }
  return out;
}

/** @param {string} text @returns {number} */
function gp0(text) {
  return gp(text).reduce((sum, value) => sum + value, 0);
}

/** @param {number[][]} square @returns {number[]} */
function outerRing(square) {
  const n = square.length;
  const out = [];
  for (let column = 0; column < n; column += 1) out.push(square[0][column]);
  for (let row = 1; row < n; row += 1) out.push(square[row][n - 1]);
  for (let column = n - 2; column >= 0; column -= 1) out.push(square[n - 1][column]);
  for (let row = n - 2; row > 0; row -= 1) out.push(square[row][0]);
  return out;
}

/**
 * Frozen p50 consumer: source integer -> zero-based mod256 table address ->
 * printed two-digit numeral under the chosen alphabet.
 * @param {number} source
 * @param {string} alphabet
 * @returns {{source:number,address:number,token:string,value:number}}
 */
function p50Read(source, alphabet) {
  const address = ((source % 256) + 256) % 256;
  const token = tape[address];
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.notEqual(high, -1);
  assert.notEqual(low, -1);
  return {
    source,
    address,
    token,
    value: high * alphabet.length + low,
  };
}

/** @param {string[]} words @returns {Map<number,string[]>} */
function valueRegistry(words) {
  const registry = new Map();
  for (const word of words) {
    const value = gp0(word);
    if (!registry.has(value)) registry.set(value, []);
    registry.get(value).push(word);
  }
  return registry;
}

const signedClear = signed.slice(
  signed.indexOf("Hello."),
  signed.indexOf("-----BEGIN PGP SIGNATURE-----")
);
assert.match(signedClear, /Verify OpenPGP 7A35090F\./u);

const signedWords = [
  ...new Set(
    signedClear
      .replace(/\b7A35090F\b/gu, "")
      .match(/[A-Za-z]+/gu)
      .map((word) => word.toUpperCase())
  ),
];

const p57Words = [
  ...new Set(
    "PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE"
      .split(/\s+/u)
  ),
];

const signedRegistry = valueRegistry(signedWords);
const p57Registry = valueRegistry(p57Words);

assert.equal(gp0("OPENPGP"), 75);
assert.equal(gp0("CIRCUMFERENCES"), 131);
assert.equal(gp0("EMERGE"), 83);

const targetRing = outerRing(squares[0]);
const uniqueTargetRing = [...new Set(targetRing)];

assert.deepEqual(uniqueTargetRing, [434, 1311, 312, 278, 966, 1071, 626, 204]);

const base59Target = uniqueTargetRing.map((source) => {
  const row = p50Read(source, alphabet59);
  return {
    ...row,
    signed: signedRegistry.get(row.value) || [],
    p57: p57Registry.get(row.value) || [],
  };
});

const openPgpHit = base59Target.find((row) => row.signed.includes("OPENPGP"));
assert.deepEqual(openPgpHit, {
  source: 1071,
  address: 47,
  token: "1G",
  value: 75,
  signed: ["OPENPGP"],
  p57: [],
});

const circumferenceHit = base59Target.find((row) =>
  row.p57.includes("CIRCUMFERENCES")
);
assert.equal(circumferenceHit.source, 1311);
assert.equal(circumferenceHit.address, 31);
assert.equal(circumferenceHit.token, "2D");
assert.equal(circumferenceHit.value, 131);

const allSquareOpenPgpHits = squares.flatMap((square, squareIndex) =>
  [...new Set(outerRing(square))]
    .map((source) => ({square: squareIndex + 1, ...p50Read(source, alphabet59)}))
    .filter((row) => row.value === gp0("OPENPGP"))
);

assert.deepEqual(allSquareOpenPgpHits, [{
  square: 1,
  source: 1071,
  address: 47,
  token: "1G",
  value: 75,
}]);

const base60TargetHits = uniqueTargetRing
  .map((source) => {
    const row = p50Read(source, alphabet60);
    return {
      ...row,
      signed: signedRegistry.get(row.value) || [],
      p57: p57Registry.get(row.value) || [],
    };
  })
  .filter((row) => row.signed.length > 0 || row.p57.length > 0);

const keyId = 0x7A35090Fn;
assert.equal(keyId % 58n, 23n);
assert.equal(809 % 58, 55);

const fingerprint = BigInt("0x6D854CD7933322A601C3286D181F01E57A35090F");
assert.equal(fingerprint % 58n, 41n);

console.log(JSON.stringify({
  status: "PASS",
  classification: "source-constrained SURFACE -> OPENPGP -> mod58 p23 bridge",
  targetSquare: {
    uniqueSurfaceValues: uniqueTargetRing,
    frozenBase59Reads: base59Target,
    openPgpHit,
    circumferenceHit,
  },
  controls: {
    allThreeSquareBase59OpenPgpHits: allSquareOpenPgpHits,
    targetSquareBase60TypedHits: base60TargetHits,
    note: "Base60 is a charged rival only; do not mix radices to manufacture a phrase.",
  },
  authenticatedOpenPgpSource: {
    exactTailPresent: true,
    shortKeyIdHex: "7A35090F",
    shortKeyIdMod58: Number(keyId % 58n),
    predictedPhysicalPage: 23,
  },
  priorIndependentDirectionCheck: {
    sourceInteger: 809,
    mod58: 809 % 58,
    predictedPhysicalPage: 55,
  },
  sealedFullFingerprintExtension: {
    fingerprint: "6D854CD7933322A601C3286D181F01E57A35090F",
    mod58: Number(fingerprint % 58n),
    predictedPhysicalPage: 41,
    decision: "Prediction was sealed before p41 inspection; p41 supplied no predeclared typed reversible receiver, so this extension is retired.",
  },
  decision:
    "Preserve SURFACE->OPENPGP and the prospective short-key-ID mod58->p23 prediction. " +
    "It supplies the missing second source-selected number-to-page check for the 58-page direction rule. " +
    "Do not promote the full-fingerprint p41 continuation.",
}, null, 2));
