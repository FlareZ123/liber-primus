#!/usr/bin/env node
'use strict';

// Bounded test of the 2014 onion-2 elapsed-time values as a key stream.
// Inputs are the reconciled 112 intervals (in 5-minute units) and the
// untouched LP2 corpus. The two missing byte-index intervals (189,190) are
// omitted when constructing the exploratory 112-symbol period; this is an
// explicit, unproven compression assumption, not a claimed original rule.
//
// Run: node sims/lp2_2014_onion2_timing_key_gate.cjs

const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const timing = JSON.parse(fs.readFileSync(path.join(root, 'im-results', 'lp2-2014-onion2-timing-merged-112.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const pages = corpus.pages.filter(p => p.page <= 55);
const key = timing.records.map(r => r.interval_div_5);
if (key.length !== 112) throw new Error('expected 112 known timing values');
const mod = (x, m) => ((x % m) + m) % m;
const cycle = [23,14,20,17,13,2,5,22,21,3,1,26,8,7,24,27,16,12,9,15,6,4,18,10,0,19,11,25];
const rank = Array(29).fill(-1);
cycle.forEach((x, i) => { rank[x] = i; });
const mobiusShift = (x, k) => x === 28 ? 28 : cycle[mod(rank[x] + k, 28)];
const ioc = a => {
  const f = Array(29).fill(0);
  for (const x of a) f[x]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
};
const top12 = a => {
  const f = Array(29).fill(0);
  for (const x of a) f[x]++;
  return f.sort((a, b) => b - a).slice(0, 12).reduce((s, n) => s + n, 0) / a.length;
};
const render = a => a.map(x => corpus.translit[x]).join(' ');
const original = pages.flatMap(p => p.indices);
const p57 = corpus.pages.find(p => p.page === 57).indices;
const results = [];
for (const operation of ['additive-GP29', 'Mobius-28-cycle']) {
  for (const sign of [1, -1]) {
    for (const clock of ['book-continuous', 'page-reset']) {
      const out = [];
      let globalPos = 0;
      for (const p of pages) {
        for (let j = 0; j < p.indices.length; j++, globalPos++) {
          const pos = clock === 'book-continuous' ? globalPos : j;
          const shift = sign * key[pos % key.length];
          const x = p.indices[j];
          out.push(operation === 'additive-GP29'
            ? mod(x + shift, 29)
            : mobiusShift(x, shift));
        }
      }
      results.push({
        operation, sign, clock,
        ioc: ioc(out), top12: top12(out),
        prefix120: render(out.slice(0, 120)),
        p55: render(out.slice(-76))
      });
    }
  }
}
process.stdout.write(JSON.stringify({
  timingValues: key.length,
  timingIndexCoverage: timing.coverage,
  missingByteIndicesOmitted: timing.coverage.missing_byte_indices,
  original: { length: original.length, ioc: ioc(original), top12: top12(original) },
  solvedP57Control: { length: p57.length, ioc: ioc(p57), top12: top12(p57) },
  results
}, null, 2) + '\n');
