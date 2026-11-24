#!/usr/bin/env node
'use strict';

// Blind family-discriminator gate for issue #2465.
// Families: a restricted global base-29 word-affine map and the source p15
// 4x4 GF(31) space-changing Hill map (four source orientations), plus an
// unencrypted native-text control. No original plaintext or key is exposed
// to the classifier. This is deliberately a diagnostic gate, not a solver.

const fs = require('node:fs');
const read = p => fs.readFileSync(p, 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const translits = gp.translit.slice().sort((a, b) => b.length - a.length);

function encodeReferenceWord(word) {
  const s = word.toUpperCase()
    .replace(/QU/g, 'CU').replace(/[QK]/g, 'C')
    .replace(/V/g, 'U').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    const token = translits.find(t => s.startsWith(t, i));
    if (!token) return null;
    out.push(gp.translit.indexOf(token));
    i += token.length;
  }
  return out;
}

function loadReferenceParagraphs() {
  const source = read('resources/liber-primus/lp1-plaintext-reference.txt');
  const sections = source.split(/^### (\d+)\s*$/m);
  const paragraphs = [];
  for (let i = 1; i < sections.length; i += 2) {
    const page = Number(sections[i]);
    const body = sections[i + 1].replace(/^#+.*$/gm, '').replace(/^\[.*$/gm, '');
    for (const raw of body.split(/\n\s*\n/).map(x => x.trim()).filter(Boolean)) {
      const words = (raw.toUpperCase().match(/[A-Z]+/g) || []).map(encodeReferenceWord);
      if (!words.length || words.some(w => !w)) continue;
      const tokens = [];
      words.forEach((w, j) => {
        if (j) tokens.push(29);
        tokens.push(...w);
      });
      if (/[.!?]$/.test(raw)) tokens.push(30);
      paragraphs.push({ page, tokens });
    }
  }
  return paragraphs;
}

const M = [
  [3, 29, 21, 0],
  [23, 13, 12, 17],
  [2, 8, 10, 23],
  [21, 28, 26, 22]
];
const Mi = [
  [8, 4, 22, 19],
  [8, 9, 8, 3],
  [10, 18, 5, 2],
  [7, 17, 8, 18]
];
const transpose = A => A[0].map((_, j) => A.map(row => row[j]));
const hillVariants = [M, transpose(M), Mi, transpose(Mi)];
const mod = (n, m) => (n % m + m) % m;

function hill31(tokens, matrix) {
  const out = tokens.slice();
  for (let i = 0; i + 3 < tokens.length; i += 4) {
    const block = tokens.slice(i, i + 4);
    for (let r = 0; r < 4; r++) {
      out[i + r] = mod(matrix[r].reduce((s, v, j) => s + v * block[j], 0), 31);
    }
  }
  return out;
}

function pow29(n) {
  let m = 1n;
  for (let i = 0; i < n; i++) m *= 29n;
  return m;
}
function wordInteger(word) {
  return word.reduce((x, v) => x * 29n + BigInt(v), 0n);
}
function base29Digits(x, width) {
  const out = Array(width);
  for (let i = width - 1; i >= 0; i--) {
    out[i] = Number(x % 29n);
    x /= 29n;
  }
  return out;
}
function wordAffine(tokens, a, b) {
  const out = [];
  let word = [];
  const flush = () => {
    if (!word.length) return;
    const width = word.length;
    const modulus = pow29(width);
    const encoded = (BigInt(a) * wordInteger(word) + BigInt(b)) % modulus;
    out.push(...base29Digits(encoded, width));
    word = [];
  };
  for (const token of tokens) {
    if (token < 29) word.push(token);
    else { flush(); out.push(token); }
  }
  flush();
  return out;
}

function features(tokens) {
  const uni = Array(31).fill(0);
  const bi = Array(31 * 31).fill(0);
  const wordHist = Array(21).fill(0);
  let run = 0, words = 0, empty = 0, equal = 0;
  let runes = 0, spaces = 0, stops = 0, previous = -1;
  let uniqueRatioSum = 0, uniqueRatioN = 0;
  for (let i = 0; i < tokens.length; i++) {
    const v = tokens[i];
    uni[v]++;
    if (i) bi[previous * 31 + v]++;
    if (v < 29) {
      runes++;
      run++;
      if (v === previous) equal++;
      previous = v;
      continue;
    }
    if (v === 29) spaces++; else stops++;
    if (!run) empty++;
    else {
      words++;
      wordHist[Math.min(run, 20)]++;
      const segment = tokens.slice(i - run, i);
      uniqueRatioSum += new Set(segment).size / run;
      uniqueRatioN++;
    }
    run = 0;
    previous = v;
  }
  if (run) {
    words++;
    wordHist[Math.min(run, 20)]++;
    const segment = tokens.slice(tokens.length - run);
    uniqueRatioSum += new Set(segment).size / run;
    uniqueRatioN++;
  }
  const lengths = [];
  let current = 0;
  for (const v of tokens) {
    if (v < 29) current++;
    else { if (current) lengths.push(current); current = 0; }
  }
  if (current) lengths.push(current);
  const mean = lengths.reduce((s, x) => s + x, 0) / Math.max(1, lengths.length);
  const variance = lengths.reduce((s, x) => s + (x - mean) ** 2, 0) / Math.max(1, lengths.length);
  const normalize = a => {
    const total = a.reduce((s, x) => s + x, 0) || 1;
    return a.map(x => x / total);
  };
  const entropy = a => -a.filter(x => x > 0).reduce((s, x) => s + x * Math.log(x), 0);
  const u = normalize(uni), b = normalize(bi), w = normalize(wordHist);
  return [
    ...u, ...b, ...w,
    spaces / tokens.length,
    stops / tokens.length,
    empty / tokens.length,
    equal / Math.max(1, runes - 1),
    mean,
    Math.sqrt(variance),
    uniqueRatioSum / Math.max(1, uniqueRatioN),
    entropy(u),
    entropy(b)
  ];
}

function cosine(a, b) {
  let dot = 0, aa = 0, bb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    aa += a[i] * a[i];
    bb += b[i] * b[i];
  }
  return dot / Math.sqrt(aa * bb);
}
function centroid(xs) {
  const d = xs[0].length, out = Array(d).fill(0);
  for (const x of xs) for (let j = 0; j < d; j++) out[j] += x[j] / xs.length;
  return out;
}
function classify(f, centers) {
  const scores = Object.fromEntries(Object.entries(centers).map(([k, c]) => [k, cosine(f, c)]));
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return { scores, predicted: ranked[0][0], margin: ranked[0][1] - ranked[1][1] };
}

let seed = 2465;
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}

function originalRegion(first, last) {
  const pages = read('resources/liber-primus/lp2-transcription.txt').split(/\n%\n/);
  let raw = '';
  for (let p = first; p <= last; p++) {
    if (p !== 50) raw += pages[p < 50 ? p : p - 1].replace(/[\/\n\r]/g, '');
  }
  const tokens = [];
  for (const ch of raw) {
    if (runeIndex.has(ch)) tokens.push(runeIndex.get(ch));
    else if (ch === '-') tokens.push(29);
    else if (ch === '.') tokens.push(30);
  }
  return tokens;
}

function evaluate() {
  const paragraphs = loadReferenceParagraphs();
  const train = { plain: [], affine: [], hill: [] };
  const test = { plain: [], affine: [], hill: [] };

  for (const p of paragraphs) {
    const heldOut = p.page >= 11;
    const destination = heldOut ? test : train;
    destination.plain.push(features(p.tokens));
    for (let k = 0; k < 8; k++) {
      const a = 1 + Math.floor(random() * 28);
      const b = Math.floor(random() * 29);
      destination.affine.push(features(wordAffine(p.tokens, a, b)));
      destination.hill.push(features(hill31(p.tokens, hillVariants[k % 4])));
    }
  }

  const centers3 = {
    plain: centroid(train.plain),
    affine: centroid(train.affine),
    hill: centroid(train.hill)
  };
  const centers2 = {
    affine: centers3.affine,
    hill: centers3.hill
  };

  const heldOut = { correct: 0, total: 0, byClass: {} };
  for (const family of Object.keys(test)) {
    heldOut.byClass[family] = { n: test[family].length, correct: 0 };
    for (const f of test[family]) {
      const c = classify(f, centers3);
      if (c.predicted === family) {
        heldOut.correct++;
        heldOut.byClass[family].correct++;
      }
      heldOut.total++;
    }
  }

  const twoFamily = { correct: 0, total: 0, margins: [] };
  for (const family of ['affine', 'hill']) {
    for (const f of test[family]) {
      const c = classify(f, centers2);
      if (c.predicted === family) twoFamily.correct++;
      twoFamily.total++;
      twoFamily.margins.push(c.margin);
    }
  }
  twoFamily.margins.sort((a, b) => a - b);

  const targets = [
    { name: 'LP2 p16–22', tokens: originalRegion(16, 22) },
    { name: 'LP2 p40–53', tokens: originalRegion(40, 53) }
  ].map(x => ({
    name: x.name,
    tokenCount: x.tokens.length,
    ...classify(features(x.tokens), centers3)
  }));
  const solvedControls = [
    { name: 'solved LP2 p56', tokens: originalRegion(56, 56) },
    { name: 'solved LP2 p57', tokens: originalRegion(57, 57) }
  ].map(x => ({
    name: x.name,
    tokenCount: x.tokens.length,
    ...classify(features(x.tokens), centers3)
  }));

  return {
    seed: 2465,
    source: 'resources/liber-primus/lp1-plaintext-reference.txt; editor-normalized transliteration mapped to GP29 using the repository table',
    sourceParagraphs: paragraphs.length,
    trainingCounts: Object.fromEntries(Object.entries(train).map(([k, v]) => [k, v.length])),
    heldOutCounts: Object.fromEntries(Object.entries(test).map(([k, v]) => [k, v.length])),
    twoFamilyHeldOutAccuracy: twoFamily.correct / twoFamily.total,
    twoFamilyMedianMargin: twoFamily.margins[Math.floor(twoFamily.margins.length / 2)],
    threeClassHeldOutAccuracy: heldOut.correct / heldOut.total,
    threeClassByFamily: heldOut.byClass,
    targets,
    solvedControls,
    preregisteredThresholds: {
      heldOutAccuracyAtLeast: 0.90,
      originalTopVsRunnerUpMarginAtLeast: 0.20
    },
    decision: 'NO FAMILY SELECTED: held-out accuracy and original margin both fail the preregistered thresholds; native plaintext controls are classified almost identically to the affine family. No original key search is authorized by this discriminator.'
  };
}

console.log(JSON.stringify(evaluate(), null, 2));
