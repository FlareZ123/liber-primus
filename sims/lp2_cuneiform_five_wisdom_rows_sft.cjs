"use strict";
/**
 * Original LP2 cuneiform five-numbered-passage / 2014 Wisdom-5x5
 * source-key inverse, SFT. Node 22; no external packages.
 * Run: node sims/lp2_cuneiform_five_wisdom_rows_sft.cjs
 *
 * The printed red numerals 1..5 are on physical p36, p37, p38.
 * Their exact positions were located visually in the original
 * scans 53.jpg, 54.jpg, 55.jpg; source line lengths are asserted.
 * The model is a test of a motivated candidate, not an authentic key.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-ink-annotations.json"), "utf8"));
const transcription = fs.readFileSync(path.join(root, "resources/lp2-transcription.txt"), "utf8");
const squares = fs.readFileSync(path.join(root, "resources/cicada2014-openpuff-magic-squares.txt"), "utf8")
  .trim().split(/\r?\n\s*\r?\n/).map(block => block.trim().split(/\r?\n/)
    .map(row => row.trim().split(/\s+/).map(Number)));
assert.equal(squares.length, 3);
const wisdom = squares[2];
assert.deepEqual(wisdom[0], [272,138,341,131,151]);
assert.deepEqual(wisdom.map(row => row.reduce((sum,v) => sum+v,0)), Array(5).fill(1033));

/** @param {number} n @returns {number} */
function phi(n) {
  let result=n, rest=n;
  for(let p=2;p*p<=rest;p++) {
    if(rest%p!==0) continue;
    while(rest%p===0) rest/=p;
    result-=result/p;
  }
  if(rest>1) result-=result/rest;
  return result;
}
const keys=wisdom.map(row => row.map(n => phi(n)%29));
assert.deepEqual(keys, [
  [12,15,10,14,5],[4,24,19,12,6],[25,23,14,23,25],
  [6,12,19,24,4],[5,14,10,15,12]
]);
const pages=new Map(corpus.pages.map(page=>[page.page,page.indices]));
const runeSet=new Set(corpus.runes);
const sourcePages=transcription.split("%");
/** @param {number} page */
function lengths(page) {
  return sourcePages[page].split(/\r?\n/).map(row=>
    Array.from(row).filter(ch=>runeSet.has(ch)).length).filter(Boolean);
}
assert.deepEqual(lengths(36),[23,24,22,22,8,21,25,22,24,26,21]);
assert.deepEqual(lengths(37),[20,23,24,24,22,20,24,24,8,20,19]);
assert.deepEqual(lengths(38),[23,21,13,21,23,21,23,24,17,22,20]);
assert.ok(ink.pages.find(p=>p.page===36).large_punctuation.some(p=>p[0]===99&&p[1]===10));
assert.ok(ink.pages.find(p=>p.page===38).large_punctuation.some(p=>p[0]===186&&p[1]===10));
// Each red numeral is at the beginning of the indicated original printed line:
// #1 p36 line 6; #2 p37 line 1; #3 p37 line 5;
// #4 p37 line 10; #5 p38 line 4. Stop at p38's red 10-dot mark.
// Source segments may cross a printed page boundary.
const spans=[
  [[36,99,238]],
  [[37,0,91]],
  [[37,91,189]],
  [[37,189,228],[38,0,57]],
  [[38,57,186]]
];
const inputs=spans.map(parts=>parts.flatMap(([p,a,b])=>pages.get(p).slice(a,b)));
assert.deepEqual(inputs.map(row=>row.length),[139,91,98,96,129]);
assert.equal(inputs.reduce((sum,row)=>sum+row.length,0),553);
/** @param {number[]} a */
function ioc(a) {
  const freq=Array(29).fill(0);
  for(const c of a)freq[c]++;
  return freq.reduce((sum,n)=>sum+n*(n-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} a */
function doublets(a) {return a.reduce((sum,c,i)=>sum+Number(i>0&&a[i-1]===c),0);}
/** @param {number[]} seq @param {number[]} key @param {number} sign */
function decode(seq,key,sign) {
  const out=seq.map((c,i)=>(c+29+sign*key[i%5])%29);
  assert.deepEqual(out.map((d,i)=>(d+29-sign*key[i%5])%29),seq);
  return out;
}
const raw=inputs.flat();
assert.equal(doublets(raw),1);
const results=[];
for(const sign of [-1,1]) {
  const outputs=inputs.map((seq,i)=>decode(seq,keys[i],sign));
  const joined=outputs.flat();
  const totalDoublets=doublets(joined);
  assert.equal(totalDoublets,sign===-1?17:20);
  const metrics={
    sign,
    totalRunes:joined.length,
    rawIoC:ioc(raw),
    decodedIoC:ioc(joined),
    rawDoublets:doublets(raw),
    decodedDoublets:totalDoublets,
    byPassage:outputs.map((out,i)=>({
      number:i+1,
      length:out.length,
      ioc:ioc(out),
      first30:out.slice(0,30).map(c=>corpus.translit[c]).join(" ")
    }))
  };
  results.push(metrics);
}
console.log(JSON.stringify({model:"Wisdom 5x5 row totients mod29, period-five additive, reset at each red numeral",keys,spans,results},null,2));
