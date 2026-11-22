#!/usr/bin/env node
"use strict";

/*
 * Test whether the three historical 256-byte hidden-service blobs can act
 * as page-reset GP29 additive pads for LP2 pages.
 *
 * Model contract: fixed plaintext across rejected proposals; a key position
 * is rejected only when it would reproduce the preceding ciphertext symbol.
 * This ports sims/keyskip_transducer.cjs with:
 *   - no key wrap (a literal one-page pad),
 *   - offsets 0..20,
 *   - maxTotalSkips 40,
 *   - maxSkippedPerOutput 4,
 *   - rejectRepeat 0.83.
 *
 * Exact language likelihood is English GP29 unigram vs uniform. The
 * bigram/trigram beam at the end is a readability check on the best pair
 * candidate, not an independently calibrated language detector.
 *
 * Replay: node sims/onion_hiddenservice_page_pad_test.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const M = 29, R = 0.83, MAX_TOTAL = 40, MAX_LOCAL = 4;
const mod = (x) => (x % M + M) % M;
const digraphs = {TH:2,NG:21,EO:12,OE:22,AE:25,IA:27,EA:28};
const letters = {A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,W:7,X:14,Y:26,Z:15};

function encodeWords(text, alphabet) {
  const normalized = text.toUpperCase().replace(/K/g, "C").replace(/Q/g, "C")
    .replace(/V/g, "U").replace(/Z/g, "S").replace(/[^A-Z]+/g, " ").trim();
  const tokens = alphabet.map((token, index) => ({token, index})).sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (const word of normalized.split(/\s+/)) for (let i = 0; i < word.length;) {
    const match = tokens.find(x => word.startsWith(x.token, i));
    if (!match) throw new Error("Unmapped GP spelling: " + word.slice(i));
    out.push(match.index); i += match.token.length;
  }
  return out;
}
function train(text, alphabet) {
  const symbols = encodeWords(text, alphabet);
  const u = new Uint32Array(M), b = new Uint32Array(M * M), tri = new Uint32Array(M * M * M);
  for (let i = 0; i < symbols.length; i++) {
    u[symbols[i]]++; if (i) b[symbols[i - 1] * M + symbols[i]]++;
    if (i > 1) tri[(symbols[i - 2] * M + symbols[i - 1]) * M + symbols[i]]++;
  }
  const q = Array.from(u, x => (x + 1) / (symbols.length + M));
  const unigram = new Float64Array(M), bigram = new Float64Array(M * M), trigram = new Float64Array(M * M * M);
  for (let c = 0; c < M; c++) unigram[c] = Math.log(q[c]);
  for (let a = 0; a < M; a++) for (let c = 0; c < M; c++)
    bigram[a * M + c] = Math.log((b[a * M + c] + 12 * q[c]) / (u[a] + 12));
  for (let a = 0; a < M; a++) for (let v = 0; v < M; v++) for (let c = 0; c < M; c++) {
    const ix = (a * M + v) * M + c;
    trigram[ix] = Math.log((tri[ix] + 9 * Math.exp(bigram[v * M + c])) / (b[a * M + v] + 9));
  }
  return {symbols, q, unigram, bigram, trigram};
}
function firstPrimes(n) {
  const out = [];
  for (let x = 2; out.length < n; x++) {
    let prime = true; for (let d = 2; d * d <= x; d++) if (x % d === 0) {prime = false; break;}
    if (prime) out.push(x);
  }
  return out;
}
function p56Regression(corpus) {
  const cipher = corpus.pages.find(p => p.page === 56).indices;
  const expected = encodeWords("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE", corpus.translit);
  const f = cipher.map((x, i) => x === 0 ? i : -1).filter(i => i >= 0);
  const ps = firstPrimes(cipher.length + 29); let j = 0;
  const recovered = cipher.map((c, i) => i === f[3] ? 0 : mod(c - (ps[j++] - 1)));
  return {exact: recovered.length === expected.length && recovered.every((x, i) => x === expected[i]), fPositions: f};
}
function logLikelihood(cipher, key, offset, q) {
  const stateSize = cipher.length + MAX_TOTAL + 2;
  let state = new Float64Array(stateSize);
  state[0] = 1;
  let logProb = 0;
  for (let t = 0; t < cipher.length; t++) {
    const observed = cipher[t], previous = t ? cipher[t - 1] : -1;
    const next = new Float64Array(stateSize);
    let normalization = 0;
    const upper = Math.min(t + MAX_TOTAL, stateSize - 2);
    for (let emitAt = t; emitAt <= upper; emitAt++) {
      const keyPos = offset + emitAt;
      if (keyPos >= key.length) break;
      const p = mod(observed - key[keyPos]);
      const accept = previous === observed ? (1 - R) : 1;
      let paths = state[emitAt];
      if (t > 0) {
        let product = R;
        for (let s = 1; s <= MAX_LOCAL && emitAt - s >= t; s++) {
          const skippedPos = offset + emitAt - s;
          if (skippedPos >= key.length) break;
          if (mod(p + key[skippedPos]) !== previous) break;
          paths += state[emitAt - s] * product;
          product *= R;
        }
      }
      const probability = q[p] * accept * paths;
      next[emitAt + 1] += probability;
      normalization += probability;
    }
    if (!(normalization > 0)) return -Infinity;
    const inv = 1 / normalization;
    for (let j = t + 1; j <= Math.min(t + MAX_TOTAL + 1, stateSize - 1); j++) {
      next[j] *= inv;
    }
    logProb += Math.log(normalization);
    state = next;
  }
  return logProb;
}
function llr(cipher, key, offset, q) {
  const uniform = new Array(M).fill(1 / M);
  return logLikelihood(cipher, key, offset, q) -
    logLikelihood(cipher, key, offset, uniform);
}
function pairBE(bytes) {
  const out = [];
  for (let i = 0; i < bytes.length; i += 2) {
    out.push(((bytes[i] << 8) | bytes[i + 1]) % M);
  }
  return out;
}
function shuffle(values, random) {
  const a = values.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function xorshift(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}
function plant(plain, key, offset, seed) {
  const random = xorshift(seed);
  let cursor = offset, previous = -1, skips = 0;
  const cipher = [];
  for (const p of plain) {
    let c = mod(p + key[cursor]), tries = 0;
    while (previous >= 0 && c === previous && tries < MAX_LOCAL && random() < R) {
      cursor++; skips++; tries++;
      c = mod(p + key[cursor]);
    }
    cipher.push(c); previous = c; cursor++;
  }
  return {cipher, skips, cursor};
}
function scan(pages, blobs, kind, q) {
  const rows = [];
  for (const page of pages) {
    for (const blob of blobs) {
      const base = kind === "byte"
        ? blob.bytes.map(x => x % M)
        : pairBE(blob.bytes);
      for (const reversed of [false, true]) for (const sign of [1, -1]) {
        const raw = reversed ? base.slice().reverse() : base;
        const key = raw.map(x => mod(sign * x));
        let best = -Infinity, bestOffset = -1;
        for (let offset = 0; offset <= 20 && offset + page.indices.length <= key.length; offset++) {
          const score = llr(page.indices, key, offset, q);
          if (score > best) { best = score; bestOffset = offset; }
        }
        rows.push({
          kind, page: page.page, length: page.indices.length, blob: blob.id,
          reversed, sign, offset: bestOffset, llr: best,
          perRune: best / page.indices.length
        });
      }
    }
  }
  return rows.sort((a, b) => b.llr - a.llr);
}

/* Beam readability check for the best pair-BE candidate, no F-null branch. */
function decodeBeam(cipher, key, offset, model, translit, beamSize = 30000) {
  let beam = new Map();
  const p0 = mod(cipher[0] - key[offset]);
  const first = {
    cursor: offset + 1, p2: 29, p1: p0,
    score: model.unigram[p0], text: [p0], skips: 0
  };
  beam.set(first.cursor + ",29," + p0, first);
  for (let t = 1; t < cipher.length; t++) {
    const next = new Map(), observed = cipher[t], previous = cipher[t - 1];
    for (const s of beam.values()) {
      for (let d = 0; d <= MAX_LOCAL; d++) {
        const emit = s.cursor + d;
        if (emit >= key.length || s.skips + d > MAX_TOTAL) break;
        const p = mod(observed - key[emit]);
        let valid = true;
        for (let h = s.cursor; h < emit; h++) {
          if (mod(p + key[h]) !== previous) { valid = false; break; }
        }
        if (!valid) continue;
        const language = t === 1
          ? model.bigram[s.p1 * M + p]
          : model.trigram[(s.p2 * M + s.p1) * M + p];
        const weight = d * Math.log(R) +
          (observed === previous ? Math.log(1 - R) : 0);
        const n = {
          cursor: emit + 1, p2: s.p1, p1: p,
          score: s.score + language + weight,
          text: s.text.concat(p), skips: s.skips + d
        };
        const k = n.cursor + "," + n.p2 + "," + n.p1;
        const old = next.get(k);
        if (!old || n.score > old.score) next.set(k, n);
      }
    }
    const ordered = Array.from(next.values()).sort((a, b) => b.score - a.score);
    beam = new Map(ordered.slice(0, beamSize).map(s => [
      s.cursor + "," + s.p2 + "," + s.p1, s
    ]));
  }
  const best = Array.from(beam.values()).sort((a, b) => b.score - a.score)[0];
  return {
    score: best.score,
    perRune: best.score / cipher.length,
    skips: best.skips,
    endCursor: best.cursor,
    plaintext: best.text.map(x => translit[x]).join("")
  };
}

function main() {
  const source = JSON.parse(read("resources/cicada-hiddenservice-256-candidates.json"));
  const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const training = train(read("resources/control/shakespeare_first300k.txt"), corpus.translit);
  const p56 = p56Regression(corpus);
  if (!p56.exact) throw new Error("Canonical GP29 / p56 regression failed");
  const pages = corpus.pages.filter(p => p.status === "unsolved" && p.indices.length >= 3);
  const blobs = source.sourceServices.map(s => ({
    id: s.id,
    bytes: Array.from({length: s.hex.length / 2}, (_, i) =>
      parseInt(s.hex.slice(2 * i, 2 * i + 2), 16))
  }));
  if (blobs.length !== 3 || blobs.some(b => b.bytes.length !== 256)) {
    throw new Error("Expected exactly three 256-byte source blobs");
  }
  if (pages.length !== 55 || pages.reduce((n, p) => n + p.indices.length, 0) !== 12956) {
    throw new Error("Unexpected LP2 corpus shape");
  }

  // Positive control: known English plaintext, true byte key, known offset.
  const plantKey = blobs[0].bytes.map(x => x % M);
  const planted = plant(training.symbols.slice(500, 700), plantKey, 7, 0x3301);
  const plantLLR = llr(planted.cipher, plantKey, 7, training.q);
  const wrongKey = blobs[0].bytes.map(x => (x * 7 + 13) % M);
  const wrongLLR = llr(planted.cipher, wrongKey, 7, training.q);

  const bytePages = pages.filter(p => p.indices.length <= 256);
  const pairPages = pages.filter(p => p.indices.length <= 128);
  const byteRows = scan(bytePages, blobs, "byte", training.q);
  const pairRows = scan(pairPages, blobs, "pairBE", training.q);
  const pairBest = pairRows[0];
  const pairBlob = blobs.find(b => b.id === pairBest.blob);
  const pairKey = pairBE(pairBlob.bytes).map(x => mod(pairBest.sign * x));
  const orientedPairKey = pairBest.reversed ? pairKey.slice().reverse() : pairKey;
  const pairPage = pages.find(p => p.page === pairBest.page);
  const decoded = decodeBeam(
    pairPage.indices, orientedPairKey, pairBest.offset, training, corpus.translit
  );

  // Pair-BE family-wise permutation null: shuffle bytes before pair encoding.
  const nulls = [];
  for (let rep = 0; rep < 40; rep++) {
    const random = xorshift(0x3301f600 + rep * 7919);
    const shuffled = blobs.map(b => ({
      id: b.id,
      bytes: shuffle(b.bytes, random)
    }));
    const rows = scan(pairPages, shuffled, "pairBE", training.q);
    nulls.push({rep, best: rows[0].llr, candidate: rows[0]});
  }
  const exceeded = nulls.filter(x => x.best >= pairBest.llr).length;

  console.log(JSON.stringify({
    p56Regression: p56,
    model: {
      rejectRepeat: R, maxTotalSkips: MAX_TOTAL,
      maxSkippedPerOutput: MAX_LOCAL, wrap: false,
      offsetRange: "0..20; maximum over offsets",
      FNull: "not included",
      trainingSymbols: training.symbols.length
    },
    positiveControl: {
      length: planted.cipher.length, skips: planted.skips,
      endCursor: planted.cursor, trueKeyLLR: plantLLR,
      wrongKeyLLR: wrongLLR, passed: plantLLR > wrongLLR
    },
    family: {
      byteCandidates: byteRows.length, pairBECandidates: pairRows.length,
      byteBest: byteRows[0], pairBEBest: pairBest
    },
    pairBEPermutationNull: {
      replicates: nulls.length, exceeded,
      empiricalP: (1 + exceeded) / (1 + nulls.length),
      nullMaxima: nulls
    },
    pairBEPlaintextCheck: decoded
  }, null, 2));
}
if (require.main === module) main();
module.exports = {encodeWords, train, logLikelihood, llr, pairBE, scan, decodeBeam};
