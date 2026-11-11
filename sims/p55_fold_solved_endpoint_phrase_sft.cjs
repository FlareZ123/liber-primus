"use strict";

/**
 * Original-LP2 p55 word-fold to independently solved-page endpoint test.
 *
 * Frozen operation: a GP prime sum N addresses physical page N mod 58,
 * zero-based printed word floor(N/58), then iterates the prime sum until
 * a solved page, p50 numeric page, repeated address, or missing target.
 * FOLD was selected from signed-2016 "the" -> p14:w1 -> p55:w2.
 *
 * Positive result: exactly three of p55's 17 word routes reach solved p56/p57.
 * Reversing their natural order reads THE DEEP END. This is a clue candidate,
 * not unknown plaintext, a key, or authenticated proof of puzzle intent.
 *
 * Node.js 20+ CommonJS, no dependencies or output file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const chunks = read("resources/liber-primus/lp2-transcription.txt").split("%");
const known = read("resources/liber-primus/lp1-plaintext-reference.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
assert(signed.includes("words are the map"));
assert(signed.includes("epiphany seeks the devoted"));
assert.equal(chunks.length, 57);
const prime = new Map(corpus.runes.map((c, i) => [c, corpus.prime[i]]));

/** @param {string} pageText @returns {string[]} */
function printedWords(pageText) {
  const result = [];
  let word = "";
  for (const ch of pageText) {
    if (prime.has(ch)) word += ch;
    else if (ch === "/" || /\s/u.test(ch)) {}
    else if (word) { result.push(word); word = ""; }
  }
  if (word) result.push(word);
  return result;
}
const pages = Array.from({length:58}, (_, p) => p === 50
  ? grid.pages.find(x => x.page === 50).tokens
  : printedWords(chunks[p >= 51 ? p - 1 : p]));
assert.equal(pages[55].length,17);
assert.equal(pages[50].length,104);
const sum = word => [...word].reduce((a, ch) => a + prime.get(ch), 0);
const p55Sums = pages[55].map(sum);
assert.deepEqual(p55Sums,[79,222,114,118,306,283,30,596,365,138,108,341,291,88,284,129,159]);

const ref56 = known.split("### 56")[1].split("### 57")[0]
  .split(/\r?\n\r?\n/u).slice(0,2).join(" ").match(/[A-Z]+/gu);
const ref57 = known.split("### 57")[1].match(/[A-Z]+/gu);
assert.equal(ref56[1],"END");
assert.equal(ref56[4],"DEEP");
assert.equal(ref57[6],"THE");

/**
 * @param {number} initialSum
 * @returns {{reason:string,steps:Array<{n:number,page:number,word:number,runes:string}>,plaintext?:string}}
 */
function walk(initialSum) {
  let n=initialSum;
  const visited=new Set(),steps=[];
  for (let i=0;i<150;i++) {
    const page=n%58, word=Math.floor(n/58), runes=pages[page][word];
    if (runes===undefined) return {reason:"invalid",steps};
    steps.push({n,page,word,runes});
    if (page===50) return {reason:"table",steps};
    if (page>=56) return {reason:"solved",steps,plaintext:(page===56?ref56:ref57)[word]};
    if (visited.has(n)) return {reason:"cycle",steps};
    visited.add(n);
    n=sum(runes);
  }
  throw new Error("Unexpected orbit length");
}
const hits=p55Sums.map((n,i)=>({i,initialSum:n,...walk(n)}))
  .filter(x=>x.reason==="solved");
assert.deepEqual(hits.map(x=>x.i),[2,8,13]);
assert.deepEqual(hits.map(x=>x.plaintext),["END","DEEP","THE"]);
assert.equal(hits.slice().reverse().map(x=>x.plaintext).join(" "),"THE DEEP END");
console.log("p55 17 original word GP sums:", p55Sums.join(","));
for (const hit of hits) {
  console.log("p55 printed word",hit.i,":",
    hit.steps.map(x=>x.n+"->p"+x.page+":w"+x.word).join(" -> "),
    "=", hit.plaintext);
}
console.log("Reversed solved endpoints: THE DEEP END (all known plaintext).");

// Independent page check: p4 also contains the phrase as an internal substring,
// so the phrase is not unique across all long pages.
const phrases=[];
for (let p=0;p<56;p++) {
  if (p===50) continue;
  const labels=pages[p].map(sum).map(n=>walk(n)).filter(x=>x.reason==="solved")
    .map(x=>x.plaintext);
  phrases.push({p,labels,reversed:labels.reverse().join(" ")});
}
assert.deepEqual(phrases.filter(x=>x.reversed==="THE DEEP END").map(x=>x.p),[55]);
assert(phrases.find(x=>x.p===4).reversed.includes("THE DEEP END"));

// Post-selection diagnostic only. Resample each p55 printed-word length from
// other unsolved pages, preserving all 17 original lengths and the whole
// anchored 58-page address graph. Source lexemes are drawn with replacement.
const pools=new Map();
for(let p=0;p<56;p++) {
  if(p===50||p===55)continue;
  for(const w of pages[p]) {
    const len=[...w].length;
    if(!pools.has(len))pools.set(len,[]);
    const result=walk(sum(w));
    pools.get(len).push(result.reason==="solved"
      ? String(result.steps.at(-1).page)+":"+result.steps.at(-1).word : "");
  }
}
let seed=0x4c503255;
/** @returns {number} */
function random() {
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return (seed>>>0)/4294967296;
}
const target=["56:1","56:4","57:6"].join(",");
const B=600000;
let same=0,three=0;
for(let trial=0;trial<B;trial++) {
  const selected=[];
  for(const w of pages[55]) {
    const pool=pools.get([...w].length);
    const v=pool[Math.floor(random()*pool.length)];
    if(v)selected.push(v);
  }
  if(selected.length===3)three++;
  if(selected.join(",")===target)same++;
}
assert.equal(same,172);
console.log("Post-selected matched-word-length diagnostic:",same,"/",B,
  "surrogates reproduce the exact ordered three solved endpoints;",
  three,"/",B,"have exactly three solved endpoints.");
console.log("Scope: no unknown plaintext, key, or decoder recovered.");
