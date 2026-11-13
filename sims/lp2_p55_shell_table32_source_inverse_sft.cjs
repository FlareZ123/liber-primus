"use strict";

/**
 * SFT: Source-frozen p55 word-shell -> 32-row table -> 43-core GP29 inverse.
 * Repro: node sims/lp2_p55_shell_table32_source_inverse_sft.cjs
 * Node.js 20+ CommonJS; repository-relative files, no downloads.
 *
 * This is a conditional original-input test, not an authenticated Cicada key.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const load = relative => fs.readFileSync(path.join(root, relative), "utf8");
const gp = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const sourceTable = JSON.parse(load("resources/liber-primus/base60-grid.json"));
const base59 = sourceTable.alphabet.replace("f", "");
assert.equal(base59.length, 59);
assert(sourceTable.rows.flat().every(token => !token.includes("f")));
const readings = {
  base60: sourceTable.byte_rows,
  base59: sourceTable.rows.map(row => row.map(token =>
    59 * base59.indexOf(token[0]) + base59.indexOf(token[1])))
};
const lengths = [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
const page55 = gp.pages.find(p => p.page === 55).indices;
const page57 = gp.pages.find(p => p.page === 57).indices;
assert.equal(page55.length, 76);
assert.equal(page57.length, 95);
for (const [radix, table] of Object.entries(readings)) {
  assert.equal(table.length, 32, radix);
  assert(table.every(row => row.length === 8 &&
    row.every(x => Number.isInteger(x) && x >= 0 && x <= 255)), radix);
}

let cursor = 1; // p55 index 0 is a continuation of a p54 word, not a complete p55 word.
const words = lengths.map(len => {
  const word = page55.slice(cursor, cursor + len);
  cursor += len;
  return word;
});
assert.equal(cursor, page55.length);
const shell = words.flatMap(word => [word[0], word[word.length - 1]]);
const core = words.flatMap(word => word.slice(1, -1));
assert.equal(shell.length, 32);
assert.equal(core.length, 43);
assert.equal(new Set(shell).size > 1, true);
assert.deepEqual(shell, [
  25, 7, 15, 17, 14, 19, 15, 25, 0, 1, 7, 4, 17, 12, 19, 0,
  17, 5, 12, 18, 28, 15, 18, 15, 2, 22, 5, 14, 23, 1, 17, 10
]);

/** @param {string} input @returns {number[]} */
function encodeNativeGP(input) {
  const normalized = input.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const tokens = gp.translit.map((s, i) => ({ s, i }))
    .sort((a, b) => b.s.length - a.s.length);
  const result = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith("ING", i)) {
        result.push(21);
        i += 3;
      } else if (word.startsWith("IO", i)) {
        result.push(27);
        i += 2;
      } else {
        const token = tokens.find(t => word.startsWith(t.s, i));
        assert(token, "Unmapped GP spelling: " + word.slice(i));
        result.push(token.i);
        i += token.s.length;
      }
    }
  }
  return result;
}

/** @param {number} x @returns {number} */
const mod29 = x => (x % 29 + 29) % 29;
const directKey = shell;
const models = [{ name: "raw", mode: "identity", key: directKey }];
for (const mode of ["minus", "plus", "reflect"]) {
  models.push({ name: mode + "_direct_shell", mode, key: directKey });
}
for (const [radix, table] of Object.entries(readings)) {
  for (const selector of ["ordinal", "prime"]) {
    const columns = shell.map(index =>
      (selector === "ordinal" ? index : gp.prime[index]) % 8);
    const bytes = table.map((row, i) => row[columns[i]]);
    for (const projection of ["mod29", "scaled29"]) {
      const key = bytes.map(value => projection === "mod29"
        ? value % 29 : Math.floor(29 * value / 256));
      for (const mode of ["minus", "plus"]) {
        models.push({ name: radix + "_" + selector + "_" + projection
          + "_" + mode, mode, key });
      }
    }
  }
}
assert.equal(models.length, 20);

/** @param {number[]} input @param {{mode:string,key:number[]}} model @returns {number[]} */
function decode(input, model) {
  return input.map((c, i) => {
    const k = model.key[i % model.key.length];
    if (model.mode === "minus") return mod29(c - k);
    if (model.mode === "plus") return mod29(c + k);
    if (model.mode === "reflect") return mod29(k - c);
    return c;
  });
}
/** @param {number[]} input @param {{mode:string,key:number[]}} model @returns {number[]} */
function encode(input, model) {
  return input.map((p, i) => {
    const k = model.key[i % model.key.length];
    if (model.mode === "minus") return mod29(p + k);
    if (model.mode === "plus") return mod29(p - k);
    if (model.mode === "reflect") return mod29(k - p);
    return p;
  });
}
const plant = page57.slice(0, 43);
for (const model of models) {
  const candidate = decode(core, model);
  assert.deepEqual(encode(candidate, model), core, model.name + ": exact original inverse");
  assert.deepEqual(decode(encode(plant, model), model), plant,
    model.name + ": held-out solved-p57 positive plant");
}

const train = encodeNativeGP(load("resources/control/shakespeare_first300k.txt"));
const triples = new Float64Array(29 ** 3);
const pairCounts = new Float64Array(29 ** 2);
for (let i = 2; i < train.length; i++) {
  const prefix = train[i - 2] * 29 + train[i - 1];
  triples[29 * prefix + train[i]]++;
  pairCounts[prefix]++;
}
/** @param {number[]} runes @returns {number} */
function score(runes) {
  let sum = 0;
  for (let i = 2; i < runes.length; i++) {
    const pair = runes[i - 2] * 29 + runes[i - 1];
    sum += Math.log((triples[29 * pair + runes[i]] + 0.1)
      / (pairCounts[pair] + 2.9));
  }
  return sum / (runes.length - 2);
}
const scored = models.map(model => {
  const candidate = decode(core, model);
  return { name: model.name, score: score(candidate),
    readout: candidate.map(x => gp.translit[x]).join("") };
});
assert.equal(train.length, 217106);
assert(Math.abs(score(page57.slice(0, 43)) - (-2.330957831116531)) < 1e-9);
for (const { relative, expectedWindows, expectedMin } of [
  { relative: "resources/control/gibran_prophet_58585.txt",
    expectedWindows: 62450, expectedMin: -4.0428669611523596 },
  { relative: "resources/control/emerson_essays_2944.txt",
    expectedWindows: 321285, expectedMin: -4.1414434622663 }
]) {
  const control = encodeNativeGP(load(relative));
  let minimum = Infinity;
  const tailCounts = Object.fromEntries(scored.map(v => [v.name, 0]));
  for (let i = 0; i + 43 <= control.length; i++) {
    const value = score(control.slice(i, i + 43));
    minimum = Math.min(minimum, value);
    for (const result of scored) {
      if (value <= result.score) tailCounts[result.name]++;
    }
  }
  assert.equal(control.length - 42, expectedWindows);
  assert(Math.abs(minimum - expectedMin) < 1e-9, relative + " native minimum");
  assert(Object.values(tailCounts).every(n => n === 0), relative + " controls");
  console.log("Held-out", relative, "windows", expectedWindows,
    "worst-native-score", minimum.toFixed(9), "more-cipherlike: 0 for all 20");
}
for (const result of scored) {
  console.log(result.name, result.score.toFixed(9), result.readout);
}
assert(Math.abs(scored.find(r => r.name === "base60_prime_mod29_plus").score
  - (-4.387464903390191)) < 1e-9);
assert(Math.abs(scored.find(r => r.name === "base59_prime_scaled29_plus").score
  - (-4.445923585073992)) < 1e-9);
console.log("PASS: 20/20 exact original roundtrips, 20/20 p57 plants,"
  + " no coherent 43-rune interior; no key or plaintext recovered.");
