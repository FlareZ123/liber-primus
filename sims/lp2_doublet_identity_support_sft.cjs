"use strict";

/** Literal original GP29 doublet-identity census, no file writes. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const j = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, "../resources/liber-primus/lp2-corpus.json"), "utf8"));
const ps = j.pages.filter(p => p.page <= 55 && p.indices.length);
const counts = Array(29).fill(0);
assert.equal(ps.length, 55);
assert.equal(ps.reduce((s,p)=>s+p.indices.length, 0),12956);
for(const p of ps)for(let i=1;i<p.indices.length;i++)
  if(p.indices[i]===p.indices[i-1])counts[p.indices[i]]++;
const t=Object.fromEntries(j.translit.map((r,i)=>[r,counts[i]]));
assert.equal(counts.reduce((a,b)=>a+b,0),86);
assert.equal(counts.filter(x=>x>0).length,28);
assert.equal(t.B,0);
assert.deepEqual(["U","C","S","NG","IA"].map(x=>t[x]),[2,1,3,2,2]);
assert.equal(["U","C","S","NG","IA"].reduce((a,x)=>a+t[x],0),10);
console.log(JSON.stringify({runes:12956,doublets:86,occupied:28,
  missing:"B",ambiguousFive:10,allOthers:76,counts:t},null,2));
