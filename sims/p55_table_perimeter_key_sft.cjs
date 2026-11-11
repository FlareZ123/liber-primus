"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const historical = JSON.parse(read("resources/cicada2014-sexagesimal-source.json"));
const mod = n => ((n % 29) + 29) % 29;

function perimeter(bytes) {
  assert.equal(bytes.length, 256);
  const rows = Array.from({length: 32}, (_, r) => bytes.slice(r * 8, r * 8 + 8));
  const out = [...rows[0]];
  for (let r = 1; r < 31; r++) out.push(rows[r][7]);
  out.push(...rows[31].slice().reverse());
  for (let r = 30; r >= 1; r--) out.push(rows[r][0]);
  return out;
}

const tokens = corpus.translit.map((s, i) => ({s, i})).sort((a, b) => b.s.length - a.s.length);
function nativeGp(text) {
  const out = [];
  for (let word of (text.toUpperCase().match(/[A-Z]+/g) || [])) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S").replace(/ING/g, "NG");
    for (let i = 0; i < word.length;) {
      const token = tokens.find(t => word.startsWith(t.s, i));
      if (!token) throw new Error("unmapped Gibran text at " + word.slice(i));
      out.push(token.i);
      i += token.s.length;
    }
  }
  return out;
}

function makeLanguage(reference) {
  const counts = new Map();
  let total = 0;
  for (let i = 2; i < reference.length; i++) {
    const key = reference[i - 2] * 841 + reference[i - 1] * 29 + reference[i];
    counts.set(key, (counts.get(key) || 0) + 1);
    total++;
  }
  const denominator = total + 0.1 * 29 ** 3;
  return sequence => {
    let score = 0;
    for (let i = 2; i < sequence.length; i++) {
      const key = sequence[i - 2] * 841 + sequence[i - 1] * 29 + sequence[i];
      score += Math.log(((counts.get(key) || 0) + 0.1) / denominator);
    }
    return score / (sequence.length - 2);
  };
}

function ioc(sequence) {
  const counts = Array(29).fill(0);
  for (const value of sequence) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (sequence.length * (sequence.length - 1));
}

function decrypt(cipher, key, sign) {
  assert.equal(cipher.length, key.length);
  return cipher.map((value, i) => mod(value + sign * key[i]));
}

function main() {
  const p55 = corpus.pages.find(p => p.page === 55).indices;
  assert.equal(p55.length, 76);
  const canonical = grid.pages.flatMap(p => p.bytes);
  const historicalBytes = historical.decimal_values;
  const tables = [
    {name: "2014 sexagesimal", bytes: historicalBytes},
    {name: "LP2 canonical", bytes: canonical}
  ];
  const maps = [
    {name: "byte mod 29", fn: b => b % 29},
    {name: "floor(29*byte/256)", fn: b => Math.floor(29 * b / 256)}
  ];

  const native = nativeGp(read("resources/control/gibran_prophet_58585.txt"));
  const model = makeLanguage(native.slice(0, 40000));
  const held = native.slice(40000);
  const native76 = [];
  for (let i = 0; i + 76 <= held.length; i++) native76.push(model(held.slice(i, i + 76)));
  native76.sort((a, b) => a - b);
  const worstNative = native76[0];

  const candidates = [];
  for (const table of tables) {
    const ring = perimeter(table.bytes);
    assert.equal(ring.length, 76);
    for (const map of maps) {
      const key = ring.map(map.fn);
      for (const sign of [-1, 1]) {
        const decoded = decrypt(p55, key, sign);
        const score = model(decoded);
        candidates.push({
          table: table.name,
          mapping: map.name,
          direction: sign < 0 ? "C-K" : "C+K",
          keyLength: key.length,
          score,
          ioc: ioc(decoded),
          nativeWindowsAtOrBelowCandidate: native76.filter(x => x <= score).length,
          preview: decoded.map(i => corpus.translit[i]).join("")
        });
      }
    }
  }
  assert.equal(candidates.length, 8);
  assert.ok(candidates.every(c => c.score < worstNative));
  assert.ok(candidates.every(c => c.nativeWindowsAtOrBelowCandidate === 0));

  // Positive control: the same reversible operation must recover a planted
  // native 76-rune segment under the exact source-derived ring key.
  const plant = native.slice(1000, 1076);
  const positive = [];
  for (const table of tables) {
    const ring = perimeter(table.bytes);
    for (const map of maps) {
      const key = ring.map(map.fn);
      const encrypted = decrypt(plant, key, +1);
      const recovered = decrypt(encrypted, key, -1);
      assert.deepEqual(recovered, plant);
      positive.push({table: table.name, mapping: map.name, exactRecovery: true});
    }
  }

  console.log(JSON.stringify({
    hypothesis: "The 76-cell clockwise perimeter of the 32x8 table is a one-to-one GP29 additive key for the 76-rune p55 page.",
    humanClue: "p55 has 76 runes; the 32x8 table has a 76-byte circumference; solved p57 uses circumference language.",
    contract: {
      perimeterOrder: "top row left-to-right, right edge top-to-bottom, bottom row right-to-left, left edge bottom-to-top",
      byteMaps: maps.map(m => m.name),
      signs: ["C-K", "C+K"],
      noPhaseOrRotationSearch: true
    },
    source: {
      p55Runes: p55.length,
      tableBytes: 256,
      perimeterBytes: 76,
      historicalTableDifferencesFromLp2: historical.verification.differences_vs_lp2_canonical_grid
    },
    languageControl: {
      gibranRunes: native.length,
      trainingRunes: 40000,
      heldOut76RuneWindows: native76.length,
      worstNative76Window: worstNative,
      medianNative76Window: native76[Math.floor(native76.length / 2)],
      bestNative76Window: native76[native76.length - 1]
    },
    rawP55: {score: model(p55), ioc: ioc(p55)},
    candidates,
    positiveControls: positive,
    decision: "All eight fixed perimeter-key variants score below every held-out native 76-rune Gibran window; direct circumference-as-Vigenere key is rejected."
  }, null, 2));
}

if (require.main === module) main();
module.exports = {perimeter, nativeGp, makeLanguage, decrypt, main};
