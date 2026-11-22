#!/usr/bin/env node
"use strict";

// Bounded test of the p32 13-rune window as a repeating key, a Python 2
// MT19937 seed, and a seed for the p49-51 256-byte table.
// No dependencies beyond Node.js and repository reference files.

const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const readJSON = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const corpus = readJSON("resources/liber-primus/lp2-corpus.json");
const grid = readJSON("resources/liber-primus/lp2-grid-256.json");
const vectors = readJSON("resources/control/duko_round27_vectors_s2.json");
const quadText = fs.readFileSync(path.join(ROOT, "resources/control/duko_round27_english_quadgrams.txt"), "utf8");

const N = 29;
const TRANS = corpus.translit;
const mod = (x) => ((x % N) + N) % N;
const qmap = new Map();
let qtotal = 0;
for (const line of quadText.trim().split(/\r?\n/)) {
  const parts = line.trim().split(/\s+/);
  if (parts.length < 2) continue;
  const count = Number(parts[1]);
  qmap.set(parts[0], Math.log10(count));
  qtotal += count;
}
const logTotal = Math.log10(qtotal);
const floor = Math.log10(0.01) - logTotal;
for (const [gram, value] of qmap) qmap.set(gram, value - logTotal);
function quadScore(text) {
  let sum = 0, n = 0;
  for (let i = 0; i + 3 < text.length; i++) {
    sum += qmap.has(text.slice(i, i + 4)) ? qmap.get(text.slice(i, i + 4)) : floor;
    n++;
  }
  return n ? sum / n : -Infinity;
}

function mt19937(seedWords) {
  const mt = new Uint32Array(624);
  let index = 624;
  mt[0] = 19650218;
  for (let i = 1; i < 624; i++) {
    mt[i] = (Math.imul(1812433253, mt[i - 1] ^ (mt[i - 1] >>> 30)) + i) >>> 0;
  }
  let i = 1, j = 0, k = Math.max(624, seedWords.length);
  while (k--) {
    mt[i] = ((mt[i] ^ Math.imul(mt[i - 1] ^ (mt[i - 1] >>> 30), 1664525)) + seedWords[j] + j) >>> 0;
    i++; j++;
    if (i >= 624) { mt[0] = mt[623]; i = 1; }
    if (j >= seedWords.length) j = 0;
  }
  k = 623;
  while (k--) {
    mt[i] = ((mt[i] ^ Math.imul(mt[i - 1] ^ (mt[i - 1] >>> 30), 1566083941)) - i) >>> 0;
    i++;
    if (i >= 624) { mt[0] = mt[623]; i = 1; }
  }
  mt[0] = 0x80000000;
  index = 624;

  function uint32() {
    if (index >= 624) {
      for (let z = 0; z < 227; z++) {
        const y = ((mt[z] & 0x80000000) | (mt[z + 1] & 0x7fffffff)) >>> 0;
        mt[z] = (mt[z + 397] ^ (y >>> 1) ^ ((y & 1) ? 0x9908b0df : 0)) >>> 0;
      }
      for (let z = 227; z < 623; z++) {
        const y = ((mt[z] & 0x80000000) | (mt[z + 1] & 0x7fffffff)) >>> 0;
        mt[z] = (mt[z - 227] ^ (y >>> 1) ^ ((y & 1) ? 0x9908b0df : 0)) >>> 0;
      }
      const y = ((mt[623] & 0x80000000) | (mt[0] & 0x7fffffff)) >>> 0;
      mt[623] = (mt[396] ^ (y >>> 1) ^ ((y & 1) ? 0x9908b0df : 0)) >>> 0;
      index = 0;
    }
    let y = mt[index++];
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;
    return y >>> 0;
  }
  function random() {
    const a = uint32() >>> 5;
    const b = uint32() >>> 6;
    return (a * 67108864 + b) / 9007199254740992;
  }
  return { uint32, random };
}
function wordsFrom64(n) {
  return [Number(n & 0xffffffffn), Number((n >> 32n) & 0xffffffffn)];
}
function py2StringHash(bytes) {
  const b = typeof bytes === "string" ? Array.from(Buffer.from(bytes, "latin1")) : Array.from(bytes);
  if (!b.length) return 0n;
  const mask = (1n << 64n) - 1n;
  let h = BigInt(b[0]) << 7n;
  for (const x of b) h = ((1000003n * h) & mask) ^ BigInt(x);
  h = (h ^ BigInt(b.length)) & mask;
  return h;
}
function keyStream(seedWords, length) {
  const rng = mt19937(seedWords);
  const out = new Array(length);
  for (let i = 0; i < length; i++) out[i] = Math.floor(rng.random() * 29);
  return out;
}

// Port of the keyskip1 beam used by the external round27 S2 research.
// Parameters match its exact preset: sign=-1, max_skip=3, max_free=0, lam=0.
function beamDecode(C, K, beamWidth = 400, maxSkip = 3, sign = -1, offset = 0) {
  const L = C.length;
  let Kx = K;
  if (offset + L + maxSkip * L >= K.length) {
    Kx = K.concat(new Array(L * (maxSkip + 1) + offset + 8).fill(0));
  }
  const parentRows = [[]], runeRows = [[]];
  let beams = [];
  const acc0 = offset;
  const p0 = mod(C[0] + sign * Kx[acc0]);
  const t0 = TRANS[p0];
  beams.push([0, 0, acc0, t0, t0.length, 0, 0]);
  parentRows[0].push(-1);
  runeRows[0].push(p0);
  const counts = new Array(N).fill(0);
  const qget = (gram) => qmap.has(gram) ? qmap.get(gram) : floor;

  for (let ii = 1; ii < L; ii++) {
    const ci = C[ii];
    const delta = mod(sign * (C[ii - 1] - ci));
    const pmap = new Array(N), tmap = new Array(N), lmap = new Array(N), vmap = new Array(N);
    for (let k = 0; k < N; k++) {
      pmap[k] = mod(ci + sign * k);
      tmap[k] = TRANS[pmap[k]];
      lmap[k] = tmap[k].length;
      vmap[k] = mod(k - delta);
    }
    const next = [], parRow = [], runeRow = [];
    for (const beam of beams) {
      const [score, qcum, pa, tail, L1, nunTotal, nodeId] = beam;
      const base = pa + 1;
      let hi = base, maxCount = 0;
      const longForm = L1 < 3;
      const off = longForm ? 0 : L1 - 3;
      for (let dsk = 0; dsk <= maxSkip; dsk++) {
        const acc = base + dsk;
        if (acc >= Kx.length) break;
        let need = 0;
        if (dsk) {
          const km = Kx[acc - 1];
          const c2 = counts[km] + 1;
          counts[km] = c2;
          if (c2 > maxCount) maxCount = c2;
          hi = acc;
          need = dsk;
          if (need - maxCount > 0) break;
        }
        const kacc = Kx[acc];
        const unexplained = need - counts[vmap[kacc]];
        if (unexplained > 0) continue;
        const la = lmap[kacc];
        const s2 = tail + tmap[kacc];
        let total = 0;
        if (longForm) {
          for (let e = 4; e <= L1 + la; e++) {
            const a = e - 4 - off;
            if (a >= 0) total += qget(s2.slice(a, e - off));
          }
        } else if (la === 1) {
          total = qget(s2);
        } else {
          total = qget(s2.slice(0, 4)) + qget(s2.slice(1));
        }
        const nextScore = score + total;
        next.push([nextScore, qcum + total, acc, s2.slice(-3), L1 + la, nunTotal + unexplained, parRow.length]);
        parRow.push(nodeId);
        runeRow.push(pmap[kacc]);
      }
      if (hi > base) {
        for (let m = base; m < hi; m++) counts[Kx[m]] = 0;
      }
    }
    if (!next.length) break;
    next.sort((a, b) => b[0] - a[0]);
    beams = next.slice(0, beamWidth);
    parentRows.push(parRow);
    runeRows.push(runeRow);
  }
  const best = beams[0];
  const nsteps = parentRows.length - 1;
  let node = best[6];
  const plain = [];
  for (let step = nsteps; step >= 0; step--) {
    plain.push(runeRows[step][node]);
    node = parentRows[step][node];
  }
  plain.reverse();
  return {
    plain,
    translit: plain.map((r) => TRANS[r]).join(""),
    score: best[4] > 3 ? best[1] / (best[4] - 3) : -Infinity,
    beamScore: best[0],
    ptrEnd: best[2],
    nSkips: best[2] - offset - plain.length
  };
}

const cipherPages = corpus.pages.filter((p) => p.page <= 55);
const cipher = cipherPages.flatMap((p) => p.indices);
const p32 = corpus.pages.find((p) => p.page === 32);
const key = p32.indices.slice(25, 38);
const keyText = key.map((r) => TRANS[r]).join("");
let base29 = 0n;
for (const d of key) base29 = base29 * 29n + BigInt(d);
const asciiHash = py2StringHash(keyText);
const rawIndexHash = py2StringHash(key);

function vigenere(sign, resetPage) {
  const out = [];
  let global = 0;
  for (const page of cipherPages) {
    let local = 0;
    for (const c of page.indices) {
      const pos = resetPage ? local : global;
      out.push(mod(c + sign * key[pos % key.length]));
      global++;
      local++;
    }
  }
  const text = out.map((r) => TRANS[r]).join("");
  return { sign, resetPage, score: quadScore(text), prefix: text.slice(0, 160) };
}
function icForPeriod(period) {
  let total = 0, groups = 0;
  for (let r = 0; r < period; r++) {
    const f = new Array(N).fill(0);
    let n = 0;
    for (let i = r; i < cipher.length; i += period) { f[cipher[i]]++; n++; }
    if (n < 2) continue;
    let pairs = 0;
    for (const x of f) pairs += x * (x - 1);
    total += pairs / (n * (n - 1));
    groups++;
  }
  return total / groups;
}

const reference = vectors.planted_stage_a;
const refOut = beamDecode(reference.cipher_idx_120, keyStream([reference.seed], 120 * 6 + 64));
const refMismatch = refOut.plain.reduce((n, x, i) => n + (x !== reference.plain_idx[i] ? 1 : 0), 0);
if (refMismatch !== 0 || Math.abs(refOut.score - Number(reference.beam_score)) > 1e-9) {
  throw new Error("S2 reference parity check failed: mismatch=" + refMismatch + " score=" + refOut.score);
}

const seedCandidates = [
  { name: "base29-integer", value: base29 },
  { name: "python2-ascii-string-hash", value: asciiHash },
  { name: "python2-raw-index-bytes-hash", value: rawIndexHash }
];
const seedResults = seedCandidates.map((candidate) => {
  const words = wordsFrom64(candidate.value);
  const decoded = beamDecode(cipher.slice(0, 240), keyStream(words, 240 * 6 + 64));
  return {
    name: candidate.name,
    seedHex: "0x" + candidate.value.toString(16).toUpperCase(),
    seedWords: words,
    score: decoded.score,
    belowMinus5_5: decoded.score < -5.5,
    nSkips: decoded.nSkips,
    prefix: decoded.translit.slice(0, 160)
  };
});

const alphabetIndex = new Map(Array.from(grid.alphabet).map((c, i) => [c, i]));
const tableBytes = grid.pages.flatMap((p) => p.tokens).map((token) =>
  60 * alphabetIndex.get(token[0]) + alphabetIndex.get(token[1])
);
function compareByteStream(seedWords, mode) {
  const rng = mt19937(seedWords);
  const out = [];
  for (let i = 0; i < 256; i++) {
    let x;
    if (mode === "getrandbits8") {
      x = rng.uint32() >>> 24;
    } else if (mode === "random256") {
      x = Math.floor(rng.random() * 256);
    } else {
      do { x = rng.uint32() >>> 23; } while (x >= 256);
    }
    out.push(x);
  }
  return { mode, exactMatches: out.reduce((n, x, i) => n + (x === tableBytes[i] ? 1 : 0), 0), first12: out.slice(0, 12) };
}
const tableResults = [];
for (const candidate of seedCandidates.slice(0, 2)) {
  const words = wordsFrom64(candidate.value);
  for (const mode of ["getrandbits8", "random256", "randbelow256"]) {
    tableResults.push({ seed: candidate.name, ...compareByteStream(words, mode) });
  }
}
const periodScores = Array.from({ length: 60 }, (_, i) => ({ period: i + 1, ic: icForPeriod(i + 1) }))
  .sort((a, b) => b.ic - a.ic);

const result = {
  key: {
    runeIndices: key,
    transliteration: keyText,
    base29Integer: base29.toString(),
    base29Hex: "0x" + base29.toString(16).toUpperCase(),
    asciiPython2HashHex: "0x" + asciiHash.toString(16).toUpperCase(),
    rawIndexPython2HashHex: "0x" + rawIndexHash.toString(16).toUpperCase()
  },
  vigenere: {
    period13IC: icForPeriod(13),
    uniformIC: 1 / 29,
    period13InTop15Periods1to60: periodScores.slice(0, 15).some((x) => x.period === 13),
    topPeriods: periodScores.slice(0, 10),
    variants: [-1, 1].flatMap((sign) => [false, true].map((resetPage) => vigenere(sign, resetPage)))
  },
  keyskip1: {
    reference: {
      seed: reference.seed,
      runeMismatch: refMismatch,
      score: refOut.score,
      referenceScore: Number(reference.beam_score)
    },
    candidates: seedResults
  },
  table: {
    length: tableBytes.length,
    uniqueBytes: new Set(tableBytes).size,
    tests: tableResults
  }
};
console.log(JSON.stringify(result, null, 2));
