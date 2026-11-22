"use strict";

/**
 * Single-file test: all-secret, 8-column circulant table-to-terminal-page map.
 * Source geometry: 32x8 table border=76 and interior=30x6=180, matching
 * original physical pages p55=76, p56=85, p57=95. The key/offset are arbitrary.
 * Execution: node sims/terminal_grid8_circulant_knownplain_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {any} */
function load(name) {
  return JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", name), "utf8"));
}
const corpus = load("lp2-corpus.json");
const grid = load("lp2-grid-256.json");
const MOD = 29;
/** @param {number} n @returns {number} */
const mod = n => ((n % MOD) + MOD) % MOD;
/** @param {number} n @returns {number} */
function inverse(n) {
  for (let x = 1; x < MOD; x++) if (mod(n * x) === 1) return x;
  throw Error("singular pivot");
}

/** @param {string} text @returns {number[]} */
function readGp(text) {
  const tokens = corpus.translit.map((token, index) => ({token, index}))
    .sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (const word of text.split(" ")) {
    for (let i = 0; i < word.length;) {
      const matched = tokens.find(({token}) => word.startsWith(token, i));
      assert.ok(matched, "unrecognized GP token in " + word);
      out.push(matched.index);
      i += matched.token.length;
    }
  }
  return out;
}
const knownP56 = readGp("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
const cipherP56 = corpus.pages.find(p => p.page === 56).indices;
const clearP57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(knownP56.length, 85);
assert.equal(cipherP56.length, 85);
assert.equal(clearP57.length, 95);
assert.equal(grid.bytes.length, 256);
const expected = {
  plain: knownP56.concat(clearP57),
  visible: cipherP56.concat(clearP57),
  shift: cipherP56.map((x,i) => mod(x-knownP56[i])).concat(Array(95).fill(0))
};
const sourceTokens = grid.pages.flatMap(p => p.tokens);
assert.equal(sourceTokens.length, 256);
const alphabet59 = grid.alphabet.replace("f", "");
assert.equal(alphabet59.length, 59);
const altBytes = sourceTokens.map(token =>
  59 * alphabet59.indexOf(token[0]) + alphabet59.indexOf(token[1]));
assert.ok(altBytes.every(n => n >= 0 && n <= 255));
/** @param {number[]} bytes @param {number[]} y @returns {number[][]} */
function makeRows(bytes, y) {
  const out = [];
  for (let row = 1; row < 31; row++) {
    for (let col = 1; col < 7; col++) {
      // Unknown key w0..w7 and intercept b, cyclic permutation fixed by layout.
      const x = [1, ...Array.from({length:8}, (_,k) => mod(bytes[row*8+(col+k)%8]))];
      out.push([...x, y[(row-1)*6+(col-1)]]);
    }
  }
  assert.equal(out.length, 180);
  return out;
}
/** @param {number[][]} original @returns {{rank:number, contradictions:number, matches:number}} */
function allSecretGate(original) {
  const rows = original.map(row=>row.map(mod));
  const pivots = [];
  let lead = 0;
  for (let col = 0; col < 9; col++) {
    let pivot = lead;
    while (pivot < rows.length && rows[pivot][col] === 0) pivot++;
    if (pivot === rows.length) continue;
    [rows[lead], rows[pivot]] = [rows[pivot], rows[lead]];
    const scale = inverse(rows[lead][col]);
    for (let j = col; j < 10; j++) rows[lead][j] = mod(rows[lead][j] * scale);
    for (let i = 0; i < rows.length; i++) {
      if (i === lead) continue;
      const factor = rows[i][col];
      for (let j = col; j < 10; j++) rows[i][j] = mod(rows[i][j] - factor * rows[lead][j]);
    }
    pivots.push(col);
    lead++;
  }
  const coefficients = Array(9).fill(0);
  pivots.forEach((index,i) => coefficients[index] = rows[i][9]);
  const contradictions = rows.filter(row =>
    row.slice(0,9).every(v => v === 0) && row[9] !== 0).length;
  const matches = original.reduce((sum, row) =>
    sum + Number(mod(row.slice(0,9).reduce((s,v,i)=>s+v*coefficients[i],0))===row[9]),0);
  return {rank:pivots.length, contradictions, matches};
}
const predicted = {
  base60: {plain:[9,168,12],visible:[9,165,15],shift:[9,165,15]},
  base59: {plain:[9,163,17],visible:[9,164,16],shift:[9,166,14]}
};
for (const [radix, bytes] of [["base60", grid.bytes], ["base59", altBytes]]) {
  for (const [register, known] of Object.entries(expected)) {
    const result = allSecretGate(makeRows(bytes,known));
    assert.deepEqual([result.rank,result.contradictions,result.matches],predicted[radix][register]);
    console.log(radix+" / "+register+": "+JSON.stringify(result));
  }
}
// Blind source-length positive plant, wholly independent of the original runes.
const plantedKey = [7,3,5,7,11,13,17,19,23];
const plant = makeRows(grid.bytes, Array(180).fill(0)).map(row => {
  const y = mod(row.slice(0,9).reduce((s,v,i)=>s+v*plantedKey[i],0));
  return [...row.slice(0,9),y];
});
assert.deepEqual(allSecretGate(plant), {rank:9,contradictions:0,matches:180});
console.log("PASS: six exact all-secret original-input exclusions; positive plant 180/180.");
