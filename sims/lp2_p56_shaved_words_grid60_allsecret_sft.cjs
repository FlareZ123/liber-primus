"use strict";
/**
 * Original p56 known plaintext, shaving one rune from each printed word,
 * versus the 60-cell third concentric ring of the 32x8 printed byte grid.
 * One-file, read-only, Windows Node 22 CommonJS source-original SFT.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcript = read("resources/lp2-transcription.txt").split("%");
const byRune = new Map(gp.runes.map((r, i) => [r, i]));
/** @param {string} segment @returns {number[]} */
function wordLengths(segment) {
  const lengths = [];
  let n = 0;
  for (const ch of segment) {
    if (byRune.has(ch)) n++;
    else if (ch === "/" || /\s/u.test(ch)) {}
    else if (n) {lengths.push(n); n = 0;}
  }
  if (n) lengths.push(n);
  return lengths;
}
const mod = x => (x % 29 + 29) % 29;
const primes = [];
for (let n = 2; primes.length < 85; n++) {
  let prime = true;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) { prime = false; break; }
  }
  if (prime) primes.push(n);
}
const cipher = gp.pages.find(p => p.page === 56).indices;
assert.equal(cipher.length, 85);
assert.equal(cipher[56], 0); // unique authenticated bypass-F site.
let consumed = 0;
const known = cipher.map((c, i) =>
  i === 56 ? 0 : mod(c - (primes[consumed++] - 1)));
assert.equal(consumed, 84);
assert.equal(known.slice(0, 5).map(i => gp.translit[i]).join(""), "ANEND");
const lens = wordLengths(transcript[55]);
assert.equal(lens.length, 25);
assert.equal(lens.reduce((a, n) => a + n, 0), 85);
let offset = 0;
const words = lens.map(n => {
  const word = known.slice(offset, offset + n);
  offset += n;
  return word;
});
const first = words.flatMap(word => word.slice(1));
const last = words.flatMap(word => word.slice(0, -1));
assert.equal(first.length, 60);
assert.equal(last.length, 60);
const bytes = grid.pages.flatMap(p => p.tokens).map(token =>
  grid.alphabet.indexOf(token[0]) * 60 + grid.alphabet.indexOf(token[1]));
assert.equal(bytes.length, 256);
assert(bytes.every(x => Number.isInteger(x) && x >= 0 && x <= 255));
/** Third ring of four, depth 2 of the 32x8 rectangle, clockwise top-left. */
const ring = [];
const rowTop = 2, rowBottom = 29, colLeft = 2, colRight = 5;
for (let x = colLeft; x <= colRight; x++) ring.push(bytes[rowTop * 8 + x]);
for (let y = rowTop + 1; y <= rowBottom; y++) ring.push(bytes[y * 8 + colRight]);
for (let x = colRight - 1; x >= colLeft; x--) ring.push(bytes[rowBottom * 8 + x]);
for (let y = rowBottom - 1; y > rowTop; y--) ring.push(bytes[y * 8 + colLeft]);
assert.equal(ring.length, 60);
assert.equal(new Set(ring).size, 53);
/**
 * Any wholly unknown deterministic map from table-byte (or mod29 residue)
 * to GP rune can fit at most the most frequent rune for each input symbol.
 * @param {number[]} input
 * @param {number[]} output
 * @returns {{conflicts:number,distinct:number,witness:object|null}}
 */
function exactAllSecret(input, output) {
  const bySymbol = new Map();
  let witness = null;
  for (const [i, k] of input.entries()) {
    if (!bySymbol.has(k)) bySymbol.set(k, []);
    const positions = bySymbol.get(k);
    if (!witness) {
      const j = positions.find(j => output[j] !== output[i]);
      if (j !== undefined) {
        witness = {inputSymbol:k,firstPosition:j,secondPosition:i,
          originalKnownRuneA:gp.translit[output[j]],
          originalKnownRuneB:gp.translit[output[i]]};
      }
    }
    positions.push(i);
  }
  let matches = 0;
  for (const sites of bySymbol.values()) {
    const counts = new Map();
    for (const i of sites) counts.set(output[i], (counts.get(output[i]) || 0) + 1);
    matches += Math.max(...counts.values());
  }
  return {conflicts:input.length - matches,distinct:bySymbol.size,witness};
}
const starts = [0,3,30,33];
const results = [];
for (const [trim, target] of [["first",first],["last",last]]) {
  for (const [corner, start] of starts.entries()) {
    for (const step of [1,-1]) {
      const oriented = Array.from({length:60},(_,i)=>
        ring[(start + step * i + 600) % 60]);
      for (const representation of ["byte","mod29"]) {
        const input = representation === "byte" ? oriented :
          oriented.map(x => x % 29);
        const actual = exactAllSecret(input, target);
        assert(actual.conflicts > 0 && actual.witness);
        // Independent positive: no secret key fitted to original p56, just a
        // test that a genuine stationary secret codebook is accepted exactly.
        const planted = input.map(k => (7 * k + 13) % 29);
        assert.equal(exactAllSecret(input, planted).conflicts, 0);
        results.push({trim,corner,clockwise:step===1,representation,
          ...actual});
      }
    }
  }
}
const grouped = ["byte","mod29"].map(representation => {
  const relevant = results.filter(x => x.representation === representation);
  const min = Math.min(...relevant.map(x => x.conflicts));
  const best = relevant.find(x => x.conflicts === min);
  return {representation,configurations:relevant.length,
    minimumForcedContradictions:min,maximumMatches:60-min,
    bestWitness:best.witness,bestGeometry:{trim:best.trim,
      corner:best.corner,clockwise:best.clockwise}};
});
assert.deepEqual(grouped.map(x => x.minimumForcedContradictions),[5,29]);
console.log(JSON.stringify({originalKnownPlaintext:{
  p56Runes:known.length,p56Words:words.length,p56ShavedRuneCount:60},
  sourceNumericGrid:{rows:32,columns:8,thirdRing:60,
    distinctOriginalBytes:new Set(ring).size},
  allSecretCodebook:grouped,positivePlants:32,verdict:
  "No original 60-rune source-known mapping under any secret stationary symbol map."},null,2));