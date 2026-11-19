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
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const lp1 = read("resources/liber-primus/lp1-plaintext-reference.txt");
const MOD = 29;

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % MOD) + MOD) % MOD;
}

const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/**
 * Canonical repository Latin -> GP29 spelling. This is deliberately
 * permissive about punctuation and case because exact rune equality is the
 * acceptance criterion.
 * @param {string} text
 * @returns {number[]}
 */
function encodeGp29(text) {
  const normalized = text
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

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
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    out.push(token.value);
    offset += token.symbol.length;
  }
  return out;
}

/**
 * @param {number[]} haystack
 * @param {number[]} needle
 * @returns {number[]}
 */
function findAll(haystack, needle) {
  const hits = [];
  for (let start = 0; start <= haystack.length - needle.length; start += 1) {
    if (needle.every((value, index) => haystack[start + index] === value)) {
      hits.push(start);
    }
  }
  return hits;
}

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

// Frozen before opening the p32 receiver.
const key = [26,24,8,19,27,24,18,3,0,8,0,16,19];
assert.equal(key.length, 13);

// Source corpora named in the precommit. For LP1, remove comment lines but
// otherwise retain a deliberately broad text stream. This can only make an
// accidental exact hit easier, so a miss is conservative.
const signedClear = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n")
  .replace(/\b7A35090F\b/gu, "");
const lp1Broad = lp1
  .split("\n")
  .filter((line) => !line.startsWith("#"))
  .join("\n");

const sourceCorpora = [
  {name:"signed2016", indices:encodeGp29(signedClear)},
  {name:"lp1-solved-reference-broad", indices:encodeGp29(lp1Broad)},
  {
    name:"lp2-p56-solved",
    indices:corpus.pages.find((page) => page.page === 56).indices,
  },
  {
    name:"lp2-p57-solved",
    indices:corpus.pages.find((page) => page.page === 57).indices,
  },
];

/**
 * @param {number[]} output
 * @returns {{source:string,offset:number}[]}
 */
function sourceHits(output) {
  return sourceCorpora.flatMap((source) =>
    findAll(source.indices, output)
      .map((offset) => ({source:source.name, offset}))
  );
}

const controls = [];
for (const page of corpus.pages.filter((row) =>
  row.page >= 0 && row.page <= 55 && row.indices.length >= 13
)) {
  const cipher = page.indices.slice(-13);
  const plain = cipher.map((value, index) => mod29(value - key[index]));
  controls.push({
    page:page.page,
    cipher,
    plain,
    transliteration:spell(plain),
    hits:sourceHits(plain),
  });
}

const p32 = controls.find((row) => row.page === 32);
assert.ok(p32);
assert.deepEqual(
  p32.cipher,
  [20,24,3,26,1,16,0,11,16,24,6,17,12]
);
assert.deepEqual(
  p32.plain,
  [23,0,24,7,3,21,11,8,16,16,6,1,22]
);
assert.equal(p32.transliteration, "DFAWONGJHTTGUOE");
assert.deepEqual(p32.hits, []);

// Exact implementation-positive control under the frozen operation.
const plantedPlain = sourceCorpora[0].indices.slice(0, 13);
const plantedCipher = plantedPlain.map((value, index) =>
  mod29(value + key[index])
);
const plantedRecovered = plantedCipher.map((value, index) =>
  mod29(value - key[index])
);
assert.deepEqual(plantedRecovered, plantedPlain);
assert.ok(sourceHits(plantedRecovered).some((hit) =>
  hit.source === "signed2016" && hit.offset === 0
));

const hitControls = controls.filter((row) => row.hits.length > 0);

console.log(JSON.stringify({
  status:"PASS",
  classification:"precommitted negative: direct p0 state-key transfer to p32 closing13 rejected",
  precommit:"workplace/20261119-agent5-p32-closing13-statekey-precommit.md",
  key,
  operation:"P_i = C_i - K_i mod29",
  primary:p32,
  sourceCorpusLengths:Object.fromEntries(
    sourceCorpora.map((source) => [source.name, source.indices.length])
  ),
  matchedControlPages:controls.length,
  exactSourceHitControls:hitControls,
  positiveControl:{
    source:"signed2016",
    sourceOffset:0,
    plaintext:plantedPlain,
    ciphertext:plantedCipher,
    recovered:plantedRecovered,
    exact:true,
  },
  decision:"The exact final13 receiver selected by p32's closing 13-dot punctuation does not transfer Agent21's fixed p0 state key into any frozen authenticated/solved source substring. Retire this literal marker-adjacent transfer without shifting the p32 span.",
}, null, 2));
