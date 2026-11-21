"use strict";

/**
 * An exact source-number Diffie–Hellman packet: 2014 squares + original
 * Onion7 HTML + solved p57 clause + p50 table, with 2013 DH control.
 *
 * This script proves arithmetic and original-input correspondences, not
 * an authenticated historical instruction or unknown-page decryption.
 *
 * Windows Node.js 22 SFT: node sims/lp2_2014_133331_dh3301_p57_table_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} f @returns {string} */
const read = f => fs.readFileSync(path.join(root, f), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const squareText = read("resources/cicada2014-openpuff-magic-squares.txt");
const html = read("resources/cicada2014-onion7-index.html");
const transcript = read("resources/liber-primus/lp2-transcription.txt");
const table = grid.pages.flatMap(page => page.bytes);
const tableTokens = grid.pages.flatMap(page => page.tokens);
assert.equal(table.length, 256);
assert.equal(tableTokens.length, 256);
const squares = squareText.trim().split(/\r?\n\s*\r?\n/u)
  .map(block => block.trim().split(/\r?\n/u)
    .map(line => line.trim().split(/\s+/u).map(Number)));
const sums = squares.map(square => {
  assert(square.every(row => row.length === square.length));
  const s = square[0].reduce((n, val) => n + val, 0);
  for (const row of square) assert.equal(row.reduce((a, b) => a + b, 0), s);
  return s;
});
assert.deepEqual(sums, [3301, 1033, 1033]);
const p = sums[0], g = sums[1];
const a = Number(html.match(/<title>\s*(\d+)\s*<\/title>/iu)?.[1]);
const b = Number(html.match(/<div id="(\d+)">/iu)?.[1]);
assert.deepEqual([a,b], [133,331]);
assert.deepEqual([...html.matchAll(/<img src="(\d+)\.jpg"/gu)].map(m => Number(m[1])),
  Array.from({length:58}, (_, i) => i));
/** @param {number} x @param {number} y */
function gcd(x, y) {
  while (y) [x,y] = [y,x%y];
  return x;
}
/** @param {number} base @param {number} exp @param {number} modulus */
function powmod(base, exp, modulus) {
  let x = BigInt(base), y = BigInt(exp), m = BigInt(modulus), value = 1n;
  while (y > 0n) {
    if (y & 1n) value = value*x%m;
    x = x*x%m;
    y >>= 1n;
  }
  return Number(value);
}
/** @param {number} n */
function primeRank(n) {
  if (n < 2) return 0;
  let count = 0;
  for (let k = 2; k <= n; k++) {
    let prime = true;
    for (let d = 2; d*d <= k; d++) if (k % d === 0) {prime = false; break;}
    if (prime) count++;
  }
  return count;
}
assert.equal(primeRank(p), 464);
assert.equal(primeRank(g), 174);
const runeIndex = new Map(corpus.runes.map((v, i) => [v, i]));
const lastPage = transcript.split(/\n%\n/u).at(-1).replaceAll("/\n", "");
const clauses = lastPage.split(".").slice(0, 4);
const clausesRune = clauses.map(s => [...s].filter(ch => runeIndex.has(ch))
  .map(ch => runeIndex.get(ch)));
assert.deepEqual(clausesRune.map(x => x.length), [7,30,30,28]);
assert.deepEqual(clausesRune.flat(), corpus.pages.find(page => page.page === 57).indices);
const sums57 = clausesRune.map(x => x.reduce((n,v) => n+corpus.prime[v], 0));
const ranks57 = sums57.map(primeRank);
assert.deepEqual(sums57, [449, 1259, 1031, 1229]);
assert.deepEqual(ranks57, [87, 205, 173, 201]);
const ordinal = ranks57[3];
const fromTable = table[ordinal];
assert.equal(tableTokens[ordinal], "1E");
assert.equal(fromTable, 74);

const A = powmod(g, a, p), B = powmod(g, b, p);
const K = powmod(A, b, p);
assert.deepEqual([A,B,K], [74,27,586]);
assert.equal(powmod(B, a, p), K);
assert.equal(gcd(a, p-1), 1);
const inverseA = 397;
assert.equal(a*inverseA % (p-1), 1);
assert.equal(powmod(fromTable, inverseA, p), g,
  "The source magic-sum 1033 is recoverable from table74 using exponent133");

// The original p50 table has 13 successor vertices linking the two
// 2014-HTML-exponent public shares, passing through the last p57 clause.
const path27to74 = [B];
let ptr = B;
while (ptr !== A && path27to74.length < 256) {
  ptr = table[ptr];
  assert(!path27to74.includes(ptr), "Unexpected loop before A");
  path27to74.push(ptr);
}
assert.deepEqual(path27to74,
  [27,25,198,105,63,51,59,69,73,79,82,201,74]);
assert.equal(path27to74.indexOf(ordinal), 11);
assert.equal(path27to74.length, 13);
assert.equal(corpus.pages.find(page => page.page === 0).indices.length, 262);

// Historical 2013 participant DH3301 transcript: the actual server used
// generator2757, secret331, serverPublic1264, clientPublic2800, shared1067.
// This is a distinct exchange from the speculative magic-square g1033.
const historical = {g:2757,b:331,B:1264,peerA:2800,K:1067};
assert.equal(powmod(historical.g, historical.b, p), historical.B);
assert.equal(powmod(historical.peerA, historical.b, p), historical.K);
const ord = Array.from({length:550}, (_, i) => i)
  .find(i => powmod(g, i, p) === 1 && i > 0);
assert.equal(ord, undefined);
let order = 0, power = 1;
do {
  power = power*g % p; order++;
} while (power !== 1 && order <= p);
assert.equal(order, 550);
const discreteLog = Array.from({length:order}, (_, exponent) => exponent)
  .find(exponent => powmod(g, exponent, p) === historical.g);
assert.equal(discreteLog, 191);
assert.equal(primeRank(191), 43);
assert.equal(powmod(g, discreteLog*historical.b, p), historical.B);

// Source-visible p0 13-rune title and a previously reported (provisional)
// conditional plaintext candidate form a motivated, independent check for
// a direct path-as-Vigenere key, not a fit to the original ciphertext.
const p0 = corpus.pages.find(page => page.page === 0).indices.slice(0,13);
assert.equal(p0.length, 13);
const gpTokens = corpus.translit.map((s,i) => ({s,i}))
  .sort((u,v) => v.s.length-u.s.length);
/** @param {string} text */
function encode(text) {
  const s = text.toUpperCase().replace(/\s/g, "");
  const out = [];
  for(let i=0;i<s.length;) {
    const t = gpTokens.find(t => s.startsWith(t.s, i));
    assert(t, s.slice(i));
    out.push(t.i); i+=t.s.length;
  }
  return out;
}
const titleHypothesis = encode("EPIPHANY SEEKS");
assert.equal(titleHypothesis.length, 13);
/** @param {number} n */
const mod29 = n => ((n%29)+29)%29;
/** @param {number[]} input */
function H(input) {
  const out = [];
  for(let l=0,r=input.length-1;l<r;l++,r--) {
    out.push(mod29(input[l]-input[r]),mod29(input[l]+input[r]));
  }
  if(input.length%2) out.push(input[Math.floor(input.length/2)]);
  return out;
}
const pathBytes = path27to74.map(i => table[i]);
const keyCandidates = [
  ["address", path27to74.map(mod29)],
  ["byte", pathBytes.map(mod29)],
  ["H(address)", H(path27to74.map(mod29))],
  ["H(byte)", H(pathBytes.map(mod29))]
];
const all = [];
for(const [keyType, base] of keyCandidates)
  for(const orderName of ["printed","reversed"]) {
    const key = orderName === "printed" ? base : [...base].reverse();
    for(const sign of [-1,+1]) {
      const values = p0.map((v,i) => mod29(v+sign*key[i]));
      const matches = values.filter((v,i) => v === titleHypothesis[i]).length;
      all.push({keyType,order:orderName,sign,matches,
        raw:values.map(i => corpus.translit[i]).join("")});
    }
  }
all.sort((x,y) => y.matches-x.matches);
assert.equal(all.length, 16);
assert.equal(all[0].matches, 2);
console.log(JSON.stringify({
  sourceNumbers: {squareSums:sums,html:{title:a,divId:b},historicalDH3301:historical},
  p57:{primeSums:sums57,primeOrdinals:ranks57},
  modularDH:{p,g,a,b,A,B,K,recoveredGenerator:powmod(fromTable,inverseA,p),
    exponentInverseMod3300:inverseA,orderOfG:order},
  p50:{ordinal,token:tableTokens[ordinal],value:fromTable,
    pathFromBToA:path27to74,vertices:path27to74.length,
    p57OrdinalPosition:path27to74.indexOf(ordinal)},
  historicalGeneratorBridge:{g2757ExponentBase1033:discreteLog,
    primeOrdinalOfExponent:primeRank(discreteLog),
    actualHistoricalPublicShare:historical.B},
  candidateOriginalP0Title:{cipher:p0,possiblePlain:titleHypothesis,
    bestDirectAdditiveReadout:all[0],allTested:all.length,
    entireTitleMatch:all.some(row => row.matches === 13)},
  status:"PROVISIONAL SOURCE-EXACT ARITHMETIC, NO SOURCE-SELECTED DECODER OR UNKNOWN PLAINTEXT"
},null,2));
