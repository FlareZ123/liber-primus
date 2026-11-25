"use strict";
// Agent4, 25 November 2026.
// Exact fixed-seed plaintext ranking for the no-literal-F shared-RNG model.
// This is a diagnostic decoder, not evidence that this model is historical.
// Inputs are the canonical p0..55 tape and pinned, non-target English controls.
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8").replace(/\r\n/g, "\n");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const C = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const A = 29, B = 30, START = 29, Q = 2 ** 53;
function fnv32(a) {
  let h = 0x811c9dc5;
  for (const x of a) h = Math.imul(h ^ x, 0x01000193) >>> 0;
  return h.toString(16).padStart(8, "0");
}
const repeats = C.slice(1).filter((x, i) => x === C[i]).length;
if (C.length !== 12956 || repeats !== 86 || fnv32(C) !== "fe63c4ed")
  throw new Error("canonical p0..55 ciphertext fingerprint mismatch");

function encode(text, T) {
  const tokens = T.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
  const P = [];
  const words = text.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S").match(/[A-Z]+/g) || [];
  for (const w of words) {
    for (let i = 0; i < w.length;) {
      if (w.startsWith("ING", i)) { P.push(21); i += 3; }
      else if (w.startsWith("IO", i)) { P.push(27); i += 2; }
      else {
        const t = tokens.find(x => w.startsWith(x.s, i));
        if (!t) throw new Error("unmapped GP29 token at " + w.slice(i));
        P.push(t.i); i += t.s.length;
      }
    }
  }
  return P;
}
function train(seqs, alpha = 0.5) {
  const n1 = new Float64Array(A), n2 = new Float64Array(B * A);
  const n3 = new Float64Array(B * B * A), d2 = new Float64Array(B);
  const d3 = new Float64Array(B * B);
  let total = 0;
  for (const P of seqs) {
    let a = START, b = START;
    for (const p of P) {
      n1[p]++; n2[b * A + p]++; n3[(a * B + b) * A + p]++;
      d2[b]++; d3[a * B + b]++; total++; a = b; b = p;
    }
  }
  const L = new Float64Array(B * B * A);
  for (let a = 0; a < B; a++) for (let b = 0; b < B; b++) for (let p = 0; p < A; p++) {
    const u = (n1[p] + alpha) / (total + alpha * A);
    const v = (n2[b * A + p] + 8 * u) / (d2[b] + 8);
    L[(a * B + b) * A + p] = Math.log((n3[(a * B + b) * A + p] + 8 * v) / (d3[a * B + b] + 8));
  }
  return L;
}
class MT {
  constructor(seed) {
    const z = BigInt(seed);
    const words = [Number(z & 0xffffffffn) >>> 0, Number((z >> 32n) & 0xffffffffn) >>> 0];
    const nw = words[1] ? 2 : 1;
    this.m = new Uint32Array(624); this.m[0] = 19650218;
    for (let x = 1; x < 624; x++)
      this.m[x] = (Math.imul(1812433253, this.m[x - 1] ^ (this.m[x - 1] >>> 30)) + x) >>> 0;
    let i = 1, j = 0;
    for (let q = 0; q < 624; q++) {
      this.m[i] = ((this.m[i] ^ Math.imul(this.m[i - 1] ^ (this.m[i - 1] >>> 30), 1664525)) + words[j] + j) >>> 0;
      if (++i === 624) { this.m[0] = this.m[623]; i = 1; }
      if (++j === nw) j = 0;
    }
    for (let q = 0; q < 623; q++) {
      this.m[i] = ((this.m[i] ^ Math.imul(this.m[i - 1] ^ (this.m[i - 1] >>> 30), 1566083941)) - i) >>> 0;
      if (++i === 624) { this.m[0] = this.m[623]; i = 1; }
    }
    this.m[0] = 0x80000000; this.idx = 624; this.words = [];
  }
  next() {
    if (this.idx === 624) {
      for (let q = 0; q < 624; q++) {
        const y = (this.m[q] & 0x80000000) | (this.m[(q + 1) % 624] & 0x7fffffff);
        this.m[q] = (this.m[(q + 397) % 624] ^ (y >>> 1) ^ ((y & 1) ? 0x9908b0df : 0)) >>> 0;
      }
      this.idx = 0;
    }
    let y = this.m[this.idx++];
    y ^= y >>> 11; y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000; y ^= y >>> 18;
    return y >>> 0;
  }
  word(q) { while (q >= this.words.length) this.words.push(this.next()); return this.words[q]; }
  key(q) { let v; do { v = this.word(q++) >>> 27; } while (v >= 29); return [v, q]; }
  coin(q) {
    const a = this.word(q++) >>> 5, b = this.word(q++) >>> 6;
    return [a * 67108864 + b, q];
  }
}
function logadd(a, b) {
  if (a === -Infinity) return b;
  if (b === -Infinity) return a;
  const m = Math.max(a, b);
  return m + Math.log1p(Math.exp(Math.min(a, b) - m));
}
function log10BigInt(n) {
  const s = n.toString(), k = Math.min(16, s.length);
  return Math.log10(Number(s.slice(0, k))) + (s.length - k);
}
function plant(P, seed, threshold) {
  const mt = new MT(seed); let j = 0, prev = -1; const out = [];
  for (const p of P) {
    while (true) {
      const [k, j1] = mt.key(j); j = j1;
      const c = (p + k) % 29;
      if (c !== prev) { out.push(c); prev = c; break; }
      const [u, j2] = mt.coin(j); j = j2;
      if (u >= threshold) { out.push(c); prev = c; break; }
    }
  }
  return { C: out, end: j };
}
function decode(seed, threshold, L) {
  const mt = new MT(seed), nodes = [];
  const [k0, j0] = mt.key(0), p0 = (C[0] + 29 - k0) % 29;
  const w0 = L[(START * B + START) * A + p0];
  nodes.push({ j: j0, a: START, b: p0, best: w0, mass: w0, count: 1n, back: -1, p: p0 });
  const id = (j, a, b) => (j * B + a) * B + b;
  let cur = new Map([[id(j0, START, p0), 0]]), maxStates = 1;
  for (let i = 1; i < C.length; i++) {
    const c = C[i], prev = C[i - 1], next = new Map();
    for (const qi of cur.values()) {
      const q = nodes[qi], branches = [];
      const [k1, j1] = mt.key(q.j);
      if (c !== prev) branches.push({ j: j1, p: (c + 29 - k1) % 29 });
      const p = (prev + 29 - k1) % 29;
      let cursor = j1;
      while (true) {
        const [u, afterCoin] = mt.coin(cursor);
        if (u >= threshold) {
          if (c === prev) branches.push({ j: afterCoin, p });
          break;
        }
        const [kr, afterKey] = mt.key(afterCoin), emit = (p + kr) % 29;
        if (emit !== prev) {
          if (emit === c) branches.push({ j: afterKey, p });
          break;
        }
        cursor = afterKey;
      }
      for (const e of branches) {
        const a = q.b, b = e.p, w = L[(q.a * B + q.b) * A + b];
        const score = q.best + w, key = id(e.j, a, b);
        let ni = next.get(key);
        if (ni === undefined) {
          ni = nodes.length;
          nodes.push({ j: e.j, a, b, best: score, mass: q.mass + w, count: q.count, back: qi, p: b });
          next.set(key, ni);
        } else {
          const z = nodes[ni];
          z.mass = logadd(z.mass, q.mass + w);
          z.count += q.count;
          if (score > z.best) { z.best = score; z.back = qi; z.p = b; }
        }
      }
    }
    if (!next.size) return { complete: false, dead: i };
    cur = next; maxStates = Math.max(maxStates, cur.size);
  }
  let mass = -Infinity, count = 0n, winner = -1;
  for (const qi of cur.values()) {
    const q = nodes[qi]; mass = logadd(mass, q.mass); count += q.count;
    if (winner < 0 || q.best > nodes[winner].best) winner = qi;
  }
  const win = nodes[winner], P = new Array(C.length);
  let qidx = winner;
  for (let i = C.length - 1; i >= 0; i--) { const q = nodes[qidx]; P[i] = q.p; qidx = q.back; }
  const replay = plant(P, seed, threshold);
  if (replay.C.some((v, i) => v !== C[i]) || replay.end !== win.j)
    throw new Error("MAP forward-replay mismatch");
  const raw = P.map(p => corpus.translit[p]).join("");
  return {
    seed, threshold_k: threshold, threshold: threshold / Q,
    maxStates, nodes: nodes.length, finalStates: cur.size,
    log10Paths: log10BigInt(count), log10LanguageMass: mass / Math.LN10,
    bestLogProbability: win.best, meanLogProbability: win.best / C.length,
    logMAPPosterior: win.best - mass, finalCursor: win.j,
    rawPrefix: raw.slice(0, 240), rawSuffix: raw.slice(-240),
    forwardReplay: true
  };
}
function score(P, L) {
  let a = START, b = START, s = 0;
  for (const p of P) { s += L[(a * B + b) * A + p]; a = b; b = p; }
  return s / P.length;
}

const G = encode(read("resources/control/gibran_prophet_58585.txt"), corpus.translit);
const E = encode(read("resources/control/emerson_essays_2944.txt"), corpus.translit);
const SH = encode(read("resources/control/shakespeare_first300k.txt"), corpus.translit);
const L = train([G, E]);
const keyVector = new MT(7144649572585460758n), expected = [13, 17, 9, 14, 24, 8];
let keyCursor = 0;
for (const x of expected) { const [v, j] = keyVector.key(keyCursor); if (v !== x) throw new Error("CPython integer-key vector mismatch"); keyCursor = j; }

const candidates = [
  [1398989090, 6554622621531415n, 6651383279363437n],
  [1398989536, 6485183463413515n, 6490870470555201n],
  [1398990093, 6485183463413515n, 6533764771580409n],
  [1398990714, 6485183463413515n, 6575757681833078n],
  [1398992178, 6556557179042061n, 6615067251093212n],
  [1398992812, 6485183463413515n, 6486183651479801n],
  [1398993220, 6485799364307052n, 6580767529763636n],
  [1398993384, 6583326451867766n, 6614932074851581n],
  [1398995246, 6485183463413515n, 6532729050012345n],
  [1398997001, 6485183463413515n, 6517722395209558n],
  [1398998333, 6485183463413515n, 6580903751831356n],
  [1398998359, 6485183463413515n, 6539095680690496n],
  [1398998656, 6485183463413515n, 6549396496762761n]
];
const widest = new Set(candidates.slice().sort((a, b) => Number((b[2] - b[1]) - (a[2] - a[1]))).slice(0, 4).map(x => x[0]));
const results = [];
for (const [seed, lo, hi] of candidates) {
  const mid = Number((lo + hi) / 2n);
  results.push({ point: "mid", ...decode(seed, mid, L) });
  if (widest.has(seed)) {
    results.push({ point: "lo", ...decode(seed, Number(lo), L) });
    results.push({ point: "hi", ...decode(seed, Number(hi), L) });
  }
}
const report = {
  model: "CPython MT integer key getrandbits(5), conditional random() collision coin, no literal-F hold",
  target: { corpus_blob_sha: "054f2a0f780b7d46901acbe3d9bf4f0ac1801165", length: C.length, fnv32: fnv32(C), adjacent_repeats: repeats },
  training: {
    gibran: { blob_sha: "df260a07d56bf5998d40a6360b6132c35c252d10", runes: G.length, mean_logprob: score(G, L) },
    emerson: { blob_sha: "a92be8ba5b3511a003a22ba31523c14397aaa83a", runes: E.length, mean_logprob: score(E, L) },
    heldout_shakespeare: { blob_sha: "94c677ad9dd50771c6670e0c4e4dad9052b46d85", runes: SH.length, mean_logprob: score(SH, L) }
  },
  candidates: results
};
const out = JSON.stringify(report, null, 2) + "\n";
if (process.argv[2]) fs.writeFileSync(process.argv[2], out);
process.stdout.write(out);
