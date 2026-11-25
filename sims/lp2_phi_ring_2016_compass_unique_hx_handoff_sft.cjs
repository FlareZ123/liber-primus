#!/usr/bin/env node
"use strict";

// Source-selector audit for the p57 -> p50 -> p32 compass route.
// This tests navigation selection, not ciphertext decryption.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const signed = fs.readFileSync(path.join(ROOT, "resources/historical/cicada2016-4gq25-outguess.asc"), "utf8");

const start = signed.indexOf("Hello.");
const signature = signed.indexOf("-----BEGIN PGP SIGNATURE-----");
assert.ok(start >= 0 && signature > start);
const payload = signed.slice(start, signature);
const words = payload.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(words.length, 43);
assert.equal(words[37].toLowerCase(), "luck");

const alphabet = corpus.translit.map((token, index) => ({ token: token.toUpperCase(), index }))
  .sort((a, b) => b.token.length - a.token.length);

function gpEncode(text) {
  const clean = text.toUpperCase()
    .replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S").replace(/Q/g, "C");
  const encoded = [];
  for (const chunk of clean.match(/[A-Z]+/g) || []) {
    for (let at = 0; at < chunk.length;) {
      const token = alphabet.find(item => chunk.startsWith(item.token, at));
      assert.ok(token, "unmapped GP token in " + chunk.slice(at));
      encoded.push(token.index);
      at += token.token.length;
    }
  }
  return encoded;
}
const gpIndexSum = text => gpEncode(text).reduce((sum, index) => sum + index, 0);
const gpPrimeSum = text => gpEncode(text).reduce((sum, i) => sum + corpus.prime[i], 0);
const totient = n => {
  let r = n, out = n;
  for (let p = 2; p * p <= r; p++) if (r % p === 0) {
    while (r % p === 0) r /= p;
    out -= out / p;
  }
  if (r > 1) out -= out / r;
  return out;
};

const p32 = corpus.pages.find(page => page.page === 32).indices;
assert.equal(p32.length, 121);
assert.equal(gpIndexSum("EPIPHANY"), 121);
assert.equal(gpIndexSum("DEVOTED"), 102);
const tableTokens = grid.pages.flatMap(page => page.tokens);
assert.equal(tableTokens[102], "0W");
assert.equal(grid.bytes[102], 32);

const perimeters = [76, 68, 60, 52];
const phiValues = perimeters.map(totient);
assert.deepEqual(phiValues, [36, 32, 16, 24]);
const selectedPositions = phiValues.slice().reverse();
assert.deepEqual(selectedPositions, [24, 16, 32, 36]);
const selectedWords = selectedPositions.map(position => words[position - 1]);
assert.deepEqual(selectedWords.map(w => w.toLowerCase()), ["road", "words", "and", "found"]);
const addresses = selectedWords.map(gpPrimeSum);
assert.deepEqual(addresses, [204, 179, 215, 130]);
const tokens = addresses.map(address => tableTokens[address]);
assert.deepEqual(tokens, ["3E", "2t", "1O", "1Q"]);
const base60Bytes = addresses.map(address => grid.bytes[address]);
assert.deepEqual(base60Bytes, [194, 175, 84, 86]);

const base59Alphabet = grid.alphabet.replace("f", "");
const base59Bytes = tokens.map(token =>
  59 * base59Alphabet.indexOf(token[0]) + base59Alphabet.indexOf(token[1])
);
assert.deepEqual(base59Bytes, [191, 172, 83, 85]);

const hRune = corpus.translit.indexOf("H");
const xRune = corpus.translit.indexOf("X");
assert.equal(corpus.prime[hRune], 23); // p28 DH modulus
assert.equal(corpus.prime[xRune], 47); // not equal to the 43-word count
const hPositions = p32.map((rune, i) => rune === hRune ? i : null).filter(i => i !== null);
const xPositions = p32.map((rune, i) => rune === xRune ? i : null).filter(i => i !== null);
assert.deepEqual(hPositions, [11, 23, 33, 74, 79]);
assert.deepEqual(xPositions, [37, 54, 61, 68, 70]);
const indexableX = xPositions.filter(i => i >= 0 && i < words.length);
assert.deepEqual(indexableX, [37]);

const dirs = [[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]];
const dirNames = ["N","NE","E","SE","S","SW","W","NW"];
const mod = (n,m) => ((n % m) + m) % m;
function walk(startIndex, bytes, bitOrder = "low3") {
  let row = Math.floor(startIndex / 11), col = startIndex % 11;
  const steps = [];
  for (const byte of bytes) {
    // The 32x8 p50 table suggests a 3+5-bit move code. Test both bit orders.
    const d = bitOrder === "low3" ? byte & 7 : byte >> 5;
    const distance = bitOrder === "low3" ? byte >> 3 : byte & 31;
    const [dr,dc] = dirs[d];
    row = mod(row + dr * distance, 11);
    col = mod(col + dc * distance, 11);
    const index = row * 11 + col;
    steps.push({byte, direction:dirNames[d], distance, index, rune:corpus.translit[p32[index]]});
  }
  const finalIndex = row * 11 + col;
  return {startIndex, steps, finalIndex, finalRune:corpus.translit[p32[finalIndex]]};
}

// Test every p32 H origin; do not assume H33.
const base60Audit = hPositions.map(startIndex => {
  const route = walk(startIndex, base60Bytes);
  return {startIndex, finalIndex:route.finalIndex, finalRune:route.finalRune};
});
const base59Audit = hPositions.map(startIndex => {
  const route = walk(startIndex, base59Bytes);
  return {startIndex, finalIndex:route.finalIndex, finalRune:route.finalRune};
});
const high3Audit = hPositions.map(startIndex => {
  const route = walk(startIndex, base60Bytes, "high3");
  return {startIndex, finalIndex:route.finalIndex, finalRune:route.finalRune};
});
assert.deepEqual(base60Audit.map(x => x.finalIndex), [15,27,37,67,83]);
assert.deepEqual(base59Audit.map(x => x.finalIndex), [98,99,120,29,34]);
assert.deepEqual(high3Audit.map(x => x.finalIndex), [58,70,80,110,5]);
const base60Hits = base60Audit.filter(x => xPositions.includes(x.finalIndex));
const high3Hits = high3Audit.filter(x => xPositions.includes(x.finalIndex));
const indexableX = xPositions.filter(i => i >= 0 && i < words.length);
const indexableHigh3Hits = high3Hits.filter(x => indexableX.includes(x.finalIndex));
assert.deepEqual(high3Hits, [{startIndex:23,finalIndex:70,finalRune:"X"}]);
assert.deepEqual(indexableHigh3Hits, []);
const base59Hits = base59Audit.filter(x => xPositions.includes(x.finalIndex));
assert.deepEqual(base60Hits, [{startIndex:33,finalIndex:37,finalRune:"X"}]);
assert.deepEqual(base59Hits, []);

const route = walk(base60Hits[0].startIndex, base60Bytes);
assert.deepEqual(route.steps.map(x => x.index), [35,47,36,37]);
assert.deepEqual(route.steps.map(x => x.rune), ["M","IA","E","X"]);
assert.deepEqual(route.steps.slice(-2).map(x => x.index), [36,37]);
assert.deepEqual([words[36].toLowerCase(),words[37].toLowerCase()], ["good","luck"]);
const base59Route = walk(33, base59Bytes);
assert.equal(base59Route.finalIndex, 120);
assert.equal(base59Route.finalRune, "EO");

process.stdout.write(JSON.stringify({
  classification: "conditional source-constrained navigation; not a decryption",
  sourceSelectors: {
    p28DhModulus: 23,
    gpPrimeH: corpus.prime[hRune],
    gpPrimeX: corpus.prime[xRune],
    p32Runes: p32.length,
    gpIndexEpiphany: gpIndexSum("EPIPHANY"),
    gpIndexDevoted: gpIndexSum("DEVOTED"),
    p50Cell102: {token:tableTokens[102],base60Value:grid.bytes[102]},
    signed2016Words: words.length,
    signed2016Word37: words[37],
    indexableX
  },
  selectedWords: selectedPositions.map((position,i) => ({
    position, word:selectedWords[i], primeSum:addresses[i],
    p50Token:tokens[i], base60Byte:base60Bytes[i], base59Byte:base59Bytes[i]
  })),
  hPositions, xPositions,
  base60FinalCells: base60Audit,
  base59FinalCells: base59Audit,
  high3DirectionLow5DistanceFinalCells: high3Audit,
  uniqueBase60HX: base60Hits,
  base59HX: base59Hits,
  high3XHits: high3Hits,
  indexableHigh3XHits: indexableHigh3Hits,
  selectedRoute: route.steps,
  terminalSignedWords: [words[36],words[37]],
  p37Handoff: {cell:37,wordIndex:37,word:words[37],page:37,terminalWords:[words[36],words[37]]},
  base59Route: base59Route.steps
}, null, 2) + "\n");
