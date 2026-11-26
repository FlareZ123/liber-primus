"use strict";
/** Read-only structural-vs-ink delimiter sensitivity; run from repository root with Node. */
const fs = require("node:fs");
const assert = require("node:assert/strict");
const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const source = fs.readFileSync("resources/transcriptions/lp2-image-corrected.txt", "utf8");
const ids = new Map(corpus.runes.map((r, i) => [r, i]));
/** @param {string} s */
const runeIds = s => [...s].filter(r => ids.has(r)).map(r => ids.get(r));
const parts = source.split("%");
assert.equal(parts.length, 57);
const pages = [...parts.slice(0, 50), "", ...parts.slice(50, 55)];
pages.forEach((p, i) => assert.deepEqual(runeIds(p), corpus.pages[i].indices));
/** @type {[number,number,string][]} */
const cuts = [[37,91,""], [38,28,","], [27,144,"-"]];
/** @param {number} n */
function variant(n) {
  const changed = [...pages];
  for (const [page, offset, replacement] of cuts.slice(0, n)) {
    let count = 0;
    const chars = [...changed[page]];
    const at = [];
    chars.forEach((ch, i) => {
      if (ids.has(ch)) count++;
      if (ch === "." && count === offset) at.push(i);
    });
    assert.equal(at.length, 1);
    chars[at[0]] = replacement;
    changed[page] = chars.join("");
  }
  return changed.join("%").split(/[.&$%]/u).map(runeIds);
}
/** @param {number[][]} groups */
function measure(groups) {
  let equal = 0, pairs = 0;
  for (const row of groups) {
    pairs += row.length * (row.length - 1);
    const hist = Array(29).fill(0);
    row.forEach(x => hist[x]++);
    equal += hist.reduce((a,x) => a+x*(x-1),0);
  }
  return {slots:groups.length, empty:groups.filter(x=>!x.length).length,
    runes:groups.flat().length, equal, pairs, ioc:equal/pairs};
}
const base = variant(0);
const results = [];
for(let n=0;n<=3;n++){
  const rows=variant(n);
  assert.deepEqual(rows.flat(),base.flat());
  const m=measure(rows);
  assert.equal(m.slots,254-n);
  assert.equal(m.empty,37);
  assert.equal(m.runes,12956);
  results.push(m);
}
assert.deepEqual(results.map(x=>x.equal),[42240,42818,42876,43064]);
assert.deepEqual(results.map(x=>x.pairs),[1251768,1269604,1271228,1276728]);
assert.deepEqual([base[173].length,base[174].length,variant(1)[173].length],[91,98,189]);
console.log(JSON.stringify(results,null,2));
