"use strict";
/**
 * Blind spectral synchronization of page-specific Caesar alphabets.
 *
 * Model: C_i,t=(P_i,t+K_t+b_i) mod29, for one common page-aligned
 * mod29 keystream K_t and unknown per-page constant shift b_i.
 *
 * The nth Fourier coefficient of C_i,t is exp(2pi*i*h*C_i,t/29).
 * At a GP-English-determined harmonic h, cross-page covariance under
 * the model has a rank-one phase factor exp(i*h*(b_i-b_j)), even
 * though the pad is unknown. Estimate this latent phase direction
 * ONLY on even-indexed positions and assess its coherence on odd
 * untouched positions. Compare with independently circularly
 * rotated full pages. Synthetic plants match the observed page lengths.
 *
 * Node.js CommonJS, no packages, manual workflow only.
 */
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const english = fs.readFileSync(path.join(ROOT, "resources/control/shakespeare_first300k.txt"), "utf8");

/** @param {number} seed */
function xorshift(seed) {
  let s = seed | 0;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

/** @param {string} source */
function makePrior(source) {
  const map = new Map(corpus.translit.map((x, i) => [x, i]));
  const counts = Array(29).fill(1);
  for (let word of source.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
    for (let j = 0; j < word.length;) {
      const digraph = word.slice(j, j + 2);
      if (map.has(digraph)) { counts[map.get(digraph)]++; j += 2; }
      else if (map.has(word[j])) { counts[map.get(word[j])]++; j++; }
      else j++;
    }
  }
  const total = counts.reduce((s, x) => s + x);
  return counts.map(x => x / total);
}

/** @param {number[]} p */
function bestHarmonic(p) {
  let best = { h: 1, amplitude2: -1 };
  for (let h = 1; h <= 14; h++) {
    let re = 0, im = 0;
    for (let k = 0; k < 29; k++) {
      re += p[k] * Math.cos(2 * Math.PI * h * k / 29);
      im += p[k] * Math.sin(2 * Math.PI * h * k / 29);
    }
    const amp2 = re * re + im * im;
    if (amp2 > best.amplitude2) best = { h, amplitude2: amp2 };
  }
  return best;
}

/** @param {number} h */
function harmonicTable(h) {
  return Array.from({ length: 29 }, (_, r) => ({
    re: Math.cos(2 * Math.PI * h * r / 29),
    im: Math.sin(2 * Math.PI * h * r / 29)
  }));
}

/**
 * @param {number[][]} pages
 * @param {{re:number,im:number}[]} table
 * @param {number} prefix
 * @param {0|1} parity
 */
function phasorRows(pages, table, prefix, parity) {
  const rows = [];
  for (let t = parity; t < prefix; t += 2) {
    rows.push(pages.map(pg => table[pg[t]]));
  }
  return rows;
}

/**
 * Learn top complex covariance eigenvector from training rows through
 * the positive-semidefinite matrix-free power iteration M=Z*Z^H.
 * Each complex vector is stored as {re,im}. Fixed deterministic start.
 *
 * @param {{re:number,im:number}[][]} rows
 * @param {number} iterations
 */
function power(rows, iterations = 120) {
  const d = rows[0].length;
  let v = Array.from({ length: d }, (_, i) => {
    const angle = 2 * Math.PI * i * (Math.sqrt(5) - 1) / 2;
    return { re: Math.cos(angle) / Math.sqrt(d), im: Math.sin(angle) / Math.sqrt(d) };
  });
  for (let step = 0; step < iterations; step++) {
    const out = Array.from({ length: d }, () => ({ re: 0, im: 0 }));
    for (const row of rows) {
      // dot = row^H v = sum conj(row_i)*v_i
      let re = 0, im = 0;
      for (let i = 0; i < d; i++) {
        const z = row[i], a = v[i];
        re += z.re * a.re + z.im * a.im;
        im += z.re * a.im - z.im * a.re;
      }
      // out += row * dot
      for (let i = 0; i < d; i++) {
        const z = row[i];
        out[i].re += z.re * re - z.im * im;
        out[i].im += z.re * im + z.im * re;
      }
    }
    const norm = Math.sqrt(out.reduce((s, a) => s + a.re * a.re + a.im * a.im, 0));
    v = out.map(a => ({ re: a.re / norm, im: a.im / norm }));
  }
  return v;
}

/**
 * Coherent power projected on a fixed unit vector: expected 1 for
 * independent uniform page phases, larger under a shared stream.
 * @param {{re:number,im:number}[][]} rows
 * @param {{re:number,im:number}[]} v
 */
function projectedPower(rows, v) {
  let total = 0;
  for (const row of rows) {
    let re = 0, im = 0;
    for (let j = 0; j < v.length; j++) {
      const z = row[j], a = v[j];
      re += z.re * a.re + z.im * a.im;
      im += z.re * a.im - z.im * a.re;
    }
    total += re * re + im * im;
  }
  return total / rows.length;
}

/**
 * @param {number[][]} pages
 * @param {{re:number,im:number}[]} table
 * @param {number} prefix
 */
function test(pages, table, prefix) {
  const train = phasorRows(pages, table, prefix, 0);
  const held = phasorRows(pages, table, prefix, 1);
  const v = power(train);
  return { train: projectedPower(train, v), heldout: projectedPower(held, v), v };
}

/** @param {number[][]} pages @param {{re:number,im:number}[]} table
 * @param {number} prefix @param {number} repeats @param {number} seed */
function rotatedNull(pages, table, prefix, repeats, seed) {
  const rng = xorshift(seed);
  const scores = [];
  for (let k = 0; k < repeats; k++) {
    const shuffled = pages.map(a => {
      const off = Math.floor(rng() * a.length);
      return a.slice(off).concat(a.slice(0, off));
    });
    scores.push(test(shuffled, table, prefix).heldout);
  }
  const mean = scores.reduce((a, b) => a + b) / scores.length;
  const sd = Math.sqrt(scores.reduce((s, x) => s + (x - mean) ** 2, 0) / (scores.length - 1));
  return { mean, sd, scores };
}

/**
 * Plant one page-synchronous common key under independent Caesar
 * shifts of the ciphertext alphabet, with optional doublet repair.
 * @param {number[][]} real
 * @param {number[]} prior
 * @param {number} repair
 * @param {number} seed
 */
function plant(real, prior, repair, seed) {
  const rng = xorshift(seed);
  const maxLen = Math.max(...real.map(a => a.length));
  const key = Array.from({ length: maxLen }, () => Math.floor(rng() * 29));
  const shifts = real.map(() => Math.floor(rng() * 29));
  const cumulative = [], values = [];
  let s = 0;
  for (const x of prior) { s += x; cumulative.push(s); }
  const draw = () => {
    const x = rng();
    const i = cumulative.findIndex(v => x < v);
    return i < 0 ? 28 : i;
  };
  let repairs = 0;
  const pages = real.map((p, i) => {
    const result = [];
    for (let t = 0; t < p.length; t++) {
      let value = (draw() + key[t] + shifts[i]) % 29;
      if (t > 0 && value === result[t - 1] && rng() < repair) {
        value = (value + 1 + Math.floor(28 * rng())) % 29;
        repairs++;
      }
      result.push(value);
    }
    return result;
  });
  return { pages, shifts, repairs };
}

function main() {
  const prior = makePrior(english);
  const harmonic = bestHarmonic(prior);
  const table = harmonicTable(harmonic.h);
  const pages = corpus.pages.filter(p => p.status === "unsolved" && p.indices.length >= 150)
    .map(p => p.indices);
  const prefix = 150;
  const result = test(pages, table, prefix);
  const nulls = rotatedNull(pages, table, prefix, 180, 0x8173f9ae);
  const planted = plant(pages, prior, 0.81, 0x739ac281);
  const plantedScore = test(planted.pages, table, prefix);
  const plantNull = rotatedNull(planted.pages, table, prefix, 60, 0x93a510e2);
  console.log(JSON.stringify({
    question: "one page-aligned mod29 shared keystream under arbitrary per-page Caesar shifts",
    pages: pages.length,
    testedRunePositions: prefix,
    sourceRunes: "first 300k Shakespeare bytes re-encoded by GP transliteration",
    harmonic,
    real: {
      training: result.train, heldout: result.heldout,
      nullMean: nulls.mean, nullSD: nulls.sd,
      z: (result.heldout - nulls.mean) / nulls.sd,
      upperTail: (1 + nulls.scores.filter(x => x >= result.heldout).length) / (nulls.scores.length + 1),
      nullRepetitions: nulls.scores.length
    },
    positiveControl: {
      seed: "0x739ac281", repairs: planted.repairs,
      training: plantedScore.train, heldout: plantedScore.heldout,
      nullMean: plantNull.mean, nullSD: plantNull.sd,
      z: (plantedScore.heldout - plantNull.mean) / plantNull.sd,
      upperTail: (1 + plantNull.scores.filter(x => x >= plantedScore.heldout).length) / (plantNull.scores.length + 1),
      nullRepetitions: plantNull.scores.length
    }
  }, null, 2));
}

if (require.main === module) main();
module.exports = { makePrior, bestHarmonic, harmonicTable, phasorRows, power, projectedPower, test, rotatedNull, plant };
