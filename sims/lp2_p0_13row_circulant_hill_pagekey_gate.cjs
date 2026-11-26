#!/usr/bin/env node
"use strict";

// Test whether each 13-symbol row of the p0 55x13 payload is a circulant
// Hill key for the corresponding LP2 page p1-p55.
const fs = require("fs");
const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const native = JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json", "utf8"));
const P = 29;
const mod = (x) => ((x % P) + P) % P;

function powMod(a, n) {
  let out = 1;
  a = mod(a);
  while (n > 0) {
    if (n & 1) out = mod(out * a);
    a = mod(a * a);
    n >>= 1;
  }
  return out;
}

function invertMatrixMod29(input) {
  const n = input.length;
  const m = input.map((r, i) => [
    ...r.map(mod),
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  ]);
  let determinant = 1;

  for (let col = 0; col < n; col++) {
    let pivot = col;
    while (pivot < n && m[pivot][col] === 0) pivot++;
    if (pivot === n) return { determinant: 0, inverse: null };
    if (pivot !== col) {
      [m[pivot], m[col]] = [m[col], m[pivot]];
      determinant = mod(-determinant);
    }
    const value = m[col][col];
    determinant = mod(determinant * value);
    const inv = powMod(value, P - 2);
    for (let j = 0; j < 2 * n; j++) m[col][j] = mod(m[col][j] * inv);
    for (let i = 0; i < n; i++) {
      if (i === col) continue;
      const factor = m[i][col];
      if (factor === 0) continue;
      for (let j = 0; j < 2 * n; j++) m[i][j] = mod(m[i][j] - factor * m[col][j]);
    }
  }
  return { determinant, inverse: m.map((r) => r.slice(n)) };
}

function circulant(key, direction) {
  return Array.from({ length: 13 }, (_, i) =>
    Array.from({ length: 13 }, (_, j) => key[((j + direction * i) % 13 + 13) % 13])
  );
}

function decryptBlock(cipherBlock, inverse) {
  return inverse.map((row) =>
    mod(row.reduce((sum, value, j) => sum + value * cipherBlock[j], 0))
  );
}

const pages = corpus.pages.map((p) => p.indices);
const opening = pages.slice(0, 3).flat();
const payload = opening.slice(14); // 13 red title runes + first black TH sentinel
if (payload.length !== 715 || payload.length % 13 !== 0) {
  throw new Error("expected 715-symbol p0-p2 payload after the first black TH sentinel");
}
const keyRows = Array.from({ length: 55 }, (_, i) => payload.slice(i * 13, (i + 1) * 13));
if (keyRows.some((r) => r.length !== 13)) throw new Error("expected 55 complete 13-symbol key rows");

const modelSections = native.sections.filter((s) => !["p56_an_end", "p57_parable"].includes(s.name));
const counts = new Float64Array(29 ** 3);
const denominators = new Float64Array(29 ** 2);
for (const section of modelSections) {
  const seq = [...section.source_text].map((ch) => native.runes.indexOf(ch)).filter((v) => v >= 0);
  for (let i = 2; i < seq.length; i++) counts[(seq[i - 2] * 29 + seq[i - 1]) * 29 + seq[i]]++;
}
for (let a = 0; a < 29; a++) {
  for (let b = 0; b < 29; b++) {
    let total = 0;
    for (let c = 0; c < 29; c++) total += counts[(a * 29 + b) * 29 + c];
    denominators[a * 29 + b] = total;
  }
}
function trigramScore(seq) {
  let total = 0;
  for (let i = 2; i < seq.length; i++) {
    const a = seq[i - 2], b = seq[i - 1], c = seq[i];
    total += Math.log((counts[(a * 29 + b) * 29 + c] + 0.2) / (denominators[a * 29 + b] + 5.8));
  }
  return seq.length > 2 ? total / (seq.length - 2) : -Infinity;
}

const rawScores = [];
for (let page = 1; page <= 55; page++) {
  const seq = pages[page];
  if (seq.length) rawScores.push(trigramScore(seq));
}
rawScores.sort((a, b) => a - b);

const results = [];
for (const direction of [-1, 1]) {
  let invertible = 0;
  let singular = 0;
  const pageScores = [];

  for (let page = 1; page <= 55; page++) {
    const ciphertext = pages[page];
    if (!ciphertext.length) {
      pageScores.push({ page, valid: false, reason: "no rune ciphertext (numeric table)" });
      continue;
    }

    const key = keyRows[page - 1];
    const matrix = circulant(key, direction);
    const result = invertMatrixMod29(matrix);
    if (!result.inverse) {
      singular++;
      pageScores.push({ page, valid: false, reason: "singular circulant key" });
      continue;
    }

    invertible++;
    const fullLength = ciphertext.length - (ciphertext.length % 13);
    const plaintext = [];
    for (let i = 0; i < fullLength; i += 13) {
      plaintext.push(...decryptBlock(ciphertext.slice(i, i + 13), result.inverse));
    }
    plaintext.push(...ciphertext.slice(fullLength));

    pageScores.push({
      page,
      valid: true,
      determinant: result.determinant,
      length: ciphertext.length,
      decryptedSymbols: fullLength,
      untouchedTail: ciphertext.length - fullLength,
      rawScore: trigramScore(ciphertext),
      decodedScore: trigramScore(plaintext),
      prefix: plaintext.slice(0, 80).map((v) => corpus.translit[v]).join(""),
    });
  }

  const valid = pageScores.filter((x) => x.valid);
  const decoded = valid.map((x) => x.decodedScore).sort((a, b) => a - b);
  const raw = valid.map((x) => x.rawScore).sort((a, b) => a - b);
  const top = [...valid].sort((a, b) => b.decodedScore - a.decodedScore).slice(0, 8);

  results.push({
    orientation: direction === -1 ? "right-shift circulant" : "left-shift circulant",
    invertibleMatrices: invertible,
    singularMatrices: singular,
    scoredPages: valid.length,
    medianDecodedTrigramScore: decoded[Math.floor(decoded.length / 2)],
    medianRawTrigramScore: raw[Math.floor(raw.length / 2)],
    topPages: top,
  });
}

console.log(JSON.stringify({
  hypothesis: "row i of the p0 55x13 payload is the 13-symbol first-row key of a circulant Hill cipher for LP2 page p(i+1)",
  source: {
    redTitleLength: 13,
    excludedFirstBlackSentinel: true,
    payloadLength: payload.length,
    keyRows: keyRows.length,
    keyWidth: 13,
    pageMapping: "key row 0 -> p1 ... key row 54 -> p55",
    skippedPage: 50,
  },
  nativeControlMedianTrigramScore: (() => {
    const all = modelSections
      .map((s) => [...s.source_text].map((ch) => native.runes.indexOf(ch)).filter((v) => v >= 0))
      .filter((s) => s.length > 20)
      .map(trigramScore)
      .sort((a, b) => a - b);
    return all[Math.floor(all.length / 2)];
  })(),
  rawCipherMedianTrigramScore: rawScores[Math.floor(rawScores.length / 2)],
  results,
}, null, 2));
