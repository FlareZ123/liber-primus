#!/usr/bin/env node
'use strict';

// Test whether the 256 p50 table residues are themselves direct H/G linear
// recurrence streams.  All coefficient arrays are in ascending powers.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const historicalSource = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/cicada2014-sexagesimal-source.json'), 'utf8'));
const canonicalSource = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/base60-grid.json'), 'utf8'));
const historical = historicalSource.decimal_values;
const canonicalRows = canonicalSource.byte_rows;
assert.equal(historical.length, 256);
assert.equal(canonicalRows.length, 32);
assert.ok(canonicalRows.every(row => row.length === 8));
const canonical = canonicalRows.flat();
assert.equal(canonical.length, 256);
const historicalRows = Array.from({length: 32}, (_, i) => historical.slice(i * 8, i * 8 + 8));
const transpose = rows => rows[0].map((_, c) => rows.map(row => row[c])).flat();
const mod = x => ((x % 29) + 29) % 29;
const H = [3, 26, 24];
const G = [27, 5, 15];
const convolve = (a, b) => {
  const out = Array(a.length + b.length - 1).fill(0);
  a.forEach((x, i) => b.forEach((y, j) => { out[i + j] = mod(out[i + j] + x * y); }));
  return out;
};
const HG = convolve(H, G);
assert.deepEqual(HG, [23, 21, 11, 17, 12]);

function residualSummary(sequence, coefficients) {
  const residues = Array(29).fill(0);
  for (let i = 0; i + coefficients.length <= sequence.length; i++) {
    let r = 0;
    for (let j = 0; j < coefficients.length; j++) r = mod(r + coefficients[j] * sequence[i + j]);
    residues[r]++;
  }
  return {
    windows: sequence.length - coefficients.length + 1,
    zeroResiduals: residues[0],
    distinctResiduals: residues.filter(n => n > 0).length,
    residueCounts: residues
  };
}
function bothOrientations(sequence, coefficients) {
  return {
    forward: residualSummary(sequence, coefficients),
    reversed: residualSummary(sequence, [...coefficients].reverse())
  };
}
const layouts = {
  'historical-row-major': historical,
  'historical-column-major': transpose(historicalRows),
  'canonical-row-major': canonical,
  'canonical-column-major': transpose(canonicalRows)
};
const result = {};
for (const [name, values] of Object.entries(layouts)) {
  const seq = values.map(mod);
  result[name] = {
    H: bothOrientations(seq, H),
    G: bothOrientations(seq, G),
    HG: bothOrientations(seq, HG)
  };
}
const expected = {
  'historical-row-major': { H: [7,13], G: [10,7], HG: [13,8] },
  'historical-column-major': { H: [5,7], G: [7,8], HG: [9,8] },
  'canonical-row-major': { H: [8,14], G: [11,9], HG: [12,9] },
  'canonical-column-major': { H: [6,9], G: [7,6], HG: [7,4] }
};
for (const [name, want] of Object.entries(expected)) {
  for (const poly of ['H','G','HG']) {
    const got = [result[name][poly].forward.zeroResiduals, result[name][poly].reversed.zeroResiduals];
    assert.deepEqual(got, want[poly], name + ' ' + poly);
    assert.equal(result[name][poly].forward.distinctResiduals, 29);
    assert.equal(result[name][poly].reversed.distinctResiduals, 29);
  }
}
console.log(JSON.stringify({modulus:29,H,G,HG,results:result}, null, 2));
