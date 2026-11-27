"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** Minimum errors over every function from printed token to rune. */
function scan(rows, p57) {
  const modes = {
    rowMajor: rows.flat(),
    mirrored: rows.flatMap(row => row.slice().reverse())
  };
  const results = [];
  for (const [orientation, seq] of Object.entries(modes)) {
    for (const [fragment, target] of [["full", p57], ["body", p57.slice(7)]]) {
      let best = Infinity, offsets = [], zero = 0;
      for (let start = 0; start + target.length <= seq.length; start++) {
        const counts = new Map();
        for (let i = 0; i < target.length; i++) {
          const token = seq[start+i];
          if (!counts.has(token)) counts.set(token, new Map());
          const m = counts.get(token);
          m.set(target[i], (m.get(target[i]) || 0) + 1);
        }
        const errors = target.length - [...counts.values()]
          .reduce((sum,m) => sum + Math.max(...m.values()),0);
        if (errors === 0) zero++;
        if (errors < best) { best = errors; offsets = [start]; }
        else if (errors === best) offsets.push(start);
      }
      results.push({ orientation, fragment, length: target.length,
        windows: seq.length-target.length+1, best, offsets, zero });
    }
  }
  return results;
}
const read = name => JSON.parse(fs.readFileSync(path.join(__dirname,
  "../resources/liber-primus", name), "utf8"));
const rows = read("base60-grid.json").rows;
const corpus = read("lp2-corpus.json");
const p57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(rows.length, 32);
assert.ok(rows.every(r => r.length === 8));
assert.equal(p57.length, 95);
assert.equal(p57.slice(0,7).map(i=>corpus.translit[i]).join(""), "PARABLE");
const original = scan(rows,p57);
assert.deepEqual(original.map(r=>r.best),[10,8,9,7]);
assert.equal(original.reduce((s,r)=>s+r.windows,0),662);
assert.ok(original.every(r=>r.zero===0));
const tokenAlphabet = [...new Set(rows.flat())];
assert.ok(tokenAlphabet.length >= 87);
const plant=rows.map(row=>row.slice());
const decoding=new Map();
for (let i=0;i<p57.length;i++) {
  const token=tokenAlphabet[3*p57[i]+i%3];
  plant[Math.floor(i/8)][i%8]=token;
  decoding.set(token,p57[i]);
}
assert.deepEqual(plant.flat().slice(0,95).map(t=>decoding.get(t)),p57);
const control = scan(plant,p57);
assert.equal(control[0].best,0);
assert.ok(control[0].offsets.includes(0));
console.log(JSON.stringify({original, control},null,2));
