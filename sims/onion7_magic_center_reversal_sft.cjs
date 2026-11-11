"use strict";

/**
 * Reproducible seventh-onion source links and source-prime original LP2 test.
 * Node.js 22: node sims/onion7_magic_center_reversal_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p));
const txt = (p) => read(p).toString("utf8");

/** @param {number} n */
function reverseDigits(n) { return Number(String(n).split("").reverse().join("")); }

/** @param {number[][]} square @param {boolean} anti */
function diagonal(square, anti) {
  return square.reduce((s, row, i) => s + row[anti ? row.length - 1 - i : i], 0);
}

/** @param {number} count @returns {number[]} */
function primesUpToCount(count) {
  const primes = [];
  for (let n = 2; primes.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) if (n % d === 0) {
      prime = false; break;
    }
    if (prime) primes.push(n);
  }
  return primes;
}

/** @param {string} raw @param {string[]} glyphs @returns {number[]} */
function toGP(raw, glyphs) {
  const tokens = glyphs.map((g, i) => ({g, i})).sort((a,b) => b.g.length - a.g.length);
  const normalized = raw.toUpperCase().replace(/V/g, "U").replace(/K/g, "C")
    .replace(/Q/g, "CU").replace(/Z/g, "S");
  const out = [];
  for (let j = 0; j < normalized.length;) {
    if (normalized[j] < "A" || normalized[j] > "Z") { j++; continue; }
    const match = tokens.find((t) => normalized.startsWith(t.g, j));
    if (match) {out.push(match.i); j += match.g.length;} else j++;
  }
  return out;
}

/** @param {number[]} sample */
function trainTrigram(sample) {
  const bi = new Uint32Array(29 * 29), tri = new Uint32Array(29 ** 3);
  for (let i = 2; i < sample.length; i++) {
    const k = sample[i-2] * 29 + sample[i-1];
    bi[k]++; tri[k * 29 + sample[i]]++;
  }
  const lp = new Float64Array(tri.length);
  for (let k = 0; k < tri.length; k++) {
    lp[k] = Math.log((tri[k] + 0.5)/(bi[Math.floor(k / 29)] + 14.5));
  }
  return (arr) => {
    let s = 0;
    for (let i = 2; i < arr.length; i++) {
      s += lp[(arr[i-2] * 29 + arr[i-1]) * 29 + arr[i]];
    }
    return s / (arr.length - 2);
  };
}

/**
 * Decrypt under authentic p56 prime-totient family; visible F mask optional.
 * @param {number[]} c @param {number[]} primes
 * @param {number} start @param {number} mask
 */
function decrypt(c, primes, start, mask) {
  let k = start - 1, fi = 0;
  return c.map((x) => {
    if (x === 0 && ((mask >>> fi++) & 1)) return x;
    return (x - (primes[k++] - 1) % 29 + 29) % 29;
  });
}

/** @param {number[]} c @param {number[]} primes @param {number} start @param {(x:number[])=>number} score */
function searchF(c, primes, start, score) {
  const nF = c.filter((x) => x === 0).length;
  assert.ok(nF <= 20);
  let best = {score: -Infinity, mask: 0, decoded: []};
  for (let mask = 0; mask < 2**nF; mask++) {
    const decoded = decrypt(c, primes, start, mask);
    const value = score(decoded);
    if (value > best.score) best = {score: value, mask, decoded};
  }
  // A bijective wrong-key roundtrip is an invariant, not proof of key.
  let k = start - 1, fi = 0;
  const again = best.decoded.map((p, i) => {
    if (c[i] === 0 && ((best.mask >>> fi++) & 1)) return p;
    return (p + (primes[k++] - 1) % 29) % 29;
  });
  assert.deepEqual(again, c);
  return best;
}

function main() {
  const html = txt("resources/cicada2014-onion7-index.html");
  const title = Number(html.match(/<title>(\d+)<\/title>/)[1]);
  const div = Number(html.match(/<div id="(\d+)">/)[1]);
  assert.deepEqual([title, div], [133, 331]);

  const parts = txt("resources/cicada2014-openpuff-magic-squares.txt")
    .trim().split(/\r?\n\s*\r?\n/);
  assert.equal(parts.length, 3);
  const sq = parts[1].trim().split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/).map(Number));
  assert.deepEqual(sq.map((r) => r.length), Array(7).fill(7));
  assert.equal(sq[3][3], div);
  assert.equal(reverseDigits(div), title);
  assert.deepEqual([diagonal(sq,false),diagonal(sq,true)], [1033,1033]);
  const rev = sq.map((row) => row.map(reverseDigits));
  assert.deepEqual([diagonal(rev,false),diagonal(rev,true)], [1033,727]);

  const jpg = read("resources/liber-primus/05.jpg");
  const sha256 = crypto.createHash("sha256").update(jpg).digest("hex");
  assert.equal(sha256,
    "2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7");
  const suffixLength = 72700;
  assert.deepEqual(jpg.subarray(jpg.length - suffixLength - 2, jpg.length - suffixLength),
    Buffer.from([0xff,0xd9]));
  assert.deepEqual(jpg.subarray(-suffixLength),
    Buffer.from(jpg.subarray(0,suffixLength)).reverse());
  assert.equal(suffixLength / 100, diagonal(rev,true));

  const primes = primesUpToCount(1000);
  assert.deepEqual([primes[128],primes[173],primes[463]], [727,1033,3301]);
  assert.equal(title + div, 464);

  const corpus = JSON.parse(txt("resources/liber-primus/lp2-corpus.json"));
  const native = toGP(txt("resources/control/emerson_essays_2944.txt"),
    corpus.translit);
  assert.equal(native.length, 324926);
  const score = trainTrigram(native);
  const p0 = corpus.pages.find((p) => p.page === 0).indices;
  const p56 = corpus.pages.find((p) => p.page === 56).indices;
  assert.equal(p0.filter((v) => v === 0).length, 14);
  assert.equal(p56.filter((v) => v === 0).length, 5);

  const solved = searchF(p56, primes, 1, score);
  const knownWords = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO " +
    "IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
  assert.equal(solved.mask, 8);
  assert.deepEqual(solved.decoded, toGP(knownWords, corpus.translit));
  const candidates = [1,129,464].map((start) => {
    const b = searchF(p0, primes, start, score);
    return {startOrdinal: start, prime: primes[start-1], masksTested: 2**14,
      bestMask: b.mask, trigramNatsPerRune: b.score,
      sample: b.decoded.slice(0,120).map((x) => corpus.translit[x]).join("")};
  });
  assert.ok(candidates.every((x) => x.trigramNatsPerRune < -3.8));
  console.log(JSON.stringify({
    originalSources: {htmlTitle: title, htmlDiv: div, squareCenter: sq[3][3],
      originalDiagonals: [diagonal(sq,false),diagonal(sq,true)],
      reversedDiagonals: [diagonal(rev,false),diagonal(rev,true)],
      jpeg05sha256: sha256, jpeg05AppendedReverseBytes: suffixLength,
      index3301: 464, index1033: 174, index727: 129},
    nativeControl: {page: 56, exactRunes: p56.length, mask: solved.mask,
      score: solved.score},
    originalPage0: {runes: p0.length, rawScore: score(p0), candidates},
    conclusion: "Exact source facts with postselected relationships; " +
      "no authentic unknown LP2 plaintext or key recovered."
  }, null, 2));
}

if (require.main === module) main();
module.exports = {main, toGP, decrypt, searchF, reverseDigits, diagonal};
