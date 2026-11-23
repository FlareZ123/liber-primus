"use strict";
/**
 * Original word-position predecessor-state GP29 support vs raw Latin26.
 * Run: node sims/lp2_wordpos1_prevC_latin26_allsecret_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
/** @param {string} f */
const read = f => fs.readFileSync(path.join(root, f), "utf8");
const c = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = read("resources/liber-primus/lp2-transcription.txt").split("%");
assert.equal(pages.length, 57);
const toIndex = new Map(c.runes.map((v, i) => [v, i]));
const matcher = new RegExp("[" + c.runes.join("") + "]", "gu");
const matrix = Array.from({length:3}, () =>
  Array.from({length:29}, () => new Uint32Array(29)));
const all = Array.from({length:29}, () => new Set());
const witness = new Map();
let within = 0, repeats = 0, firstOffset = 0;
for (let p = 0; p <= 55; p++) {
  if (p === 50) continue;
  const txt = pages[p > 50 ? p-1 : p];
  const glyphs = [...txt.matchAll(matcher)];
  const seq = glyphs.map(x => toIndex.get(x[0]));
  assert.deepEqual(seq, c.pages[p].indices, "physical p" + p);
  let offset = 0, seenWordBoundary = false;
  for (let i = 1; i < glyphs.length; i++) {
    const between = txt.slice(glyphs[i-1].index + 1, glyphs[i].index);
    if (!/^[\s/]*$/u.test(between)) {
      offset = 0;
      seenWordBoundary = true;
      continue;
    }
    offset++;
    const prev = seq[i-1], next = seq[i];
    within++;
    repeats += Number(prev === next);
    all[prev].add(next);
    if (!seenWordBoundary || offset > 3) continue;
    matrix[offset-1][prev][next]++;
    if (offset === 1) {
      firstOffset++;
      if (prev === 0 && next !== 0 && !witness.has(next))
        witness.set(next, [p, i-1, i]);
    }
  }
}
assert.equal(c.pages.slice(0,56).reduce((a,p)=>a+p.indices.length,0),12956);
assert.equal(within, 10028);
assert.equal(repeats, 63);
assert.equal(firstOffset, 2784);
assert.ok(all.every((s,i) => [...s].filter(v=>v!==i).length===28));

const rows = matrix[0].map((arr,prev) => {
  const successors = [...arr].map((n,next)=>({n,next}))
    .filter(x=>x.n>0&&x.next!==prev)
    .sort((a,b)=>a.n-b.n||a.next-b.next);
  const extra = Math.max(0, successors.length-26);
  return {
    prior:c.translit[prev],
    n:[...arr].reduce((a,b)=>a+b,0),
    different:successors.length,
    excessTypes:extra,
    minExceptionOccurrences:successors.slice(0,extra)
      .reduce((a,x)=>a+x.n,0)
  };
});
const violations = rows.filter(x=>x.different>26);
const excessive = rows.reduce((a,r)=>a+r.excessTypes,0);
const minimum = rows.reduce((a,r)=>a+r.minExceptionOccurrences,0);
assert.equal(violations.length,24);
assert.equal(excessive,38);
assert.equal(minimum,41);
assert.equal(witness.size,28);
const other = matrix.slice(1).map(m=>m.filter((arr,prev)=>
  [...arr].filter((n,next)=>next!==prev&&n>0).length>26).length);
assert.deepEqual(other,[13,2]);

// Independent invertible 26-letter positive: all output rows cap at 26.
for (let prev=0; prev<29; prev++) {
  const outputs=Array.from({length:26},(_,plain)=>(prev+plain+1)%29);
  assert.equal(new Set(outputs).size,26);
  outputs.forEach((out,plain)=>{
    assert.notEqual(out,prev);
    assert.equal((out-prev-1+29)%29,plain);
  });
}
console.log(JSON.stringify({
  originalRunes:12956, strictWithinWordEdges:within,
  repeatedWithinWordEdges:repeats,
  j1SourceEdges:firstOffset, all29PredecessorsReachAll28UnequalSuccessors:true,
  j1RowsExceeding26:violations.length, j1ExcessTypes:excessive,
  minimumExceptionOccurrencesAtJ1:minimum,
  rows,
  j2AndJ3ViolatingRows:other,
  FRowWitnesses:[...witness.entries()].map(([next,source])=>
    [c.translit[next],...source])
},null,2));