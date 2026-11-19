"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8").replace(/\r/g, "");
const M = 29, mod = x => ((x % M) + M) % M;
const sum = xs => mod(xs.reduce((a, b) => a + b, 0));
const digits = (n, b) => { const out=[]; do { out.unshift(n % b); n=Math.floor(n/b); } while(n); return out; };
const H = xs => {
  const out=[]; let l=0, r=xs.length-1;
  while(l<r) { out.push(mod(xs[l]-xs[r]), mod(xs[l]+xs[r])); l++; r--; }
  if(l===r) out.push(xs[l]);
  return out;
};

// Independently recover the 2014 square-derived DH state (same fixed BASE29 route).
const squares = read("resources/cicada2014-openpuff-magic-squares.txt").trim()
  .split(/\n\s*\n/u).map(b => b.split("\n").map(line => line.trim().split(/\s+/u).map(Number)));
const magicSum = sq => sq[0].reduce((a,b)=>a+b,0);
const equal1033 = squares.filter(sq => magicSum(sq)===1033).sort((a,b)=>a.length-b.length);
assert.deepEqual(equal1033.map(sq=>sq.length), [5,7]);
const small=equal1033[0], large=equal1033[1], g=5, K=2;
const [e,q]=digits(small[2][2],29), center7=digits(large[3][3],29);
const A=center7[0]-e, sum1033=digits(1033,29), a=sum1033[1], B=mod(A-sum1033[2]);
const p=large[e-1][a-1], b=large[e-1][g+K-1];
const state={p,g,a,b,A,B,K,e,q};
assert.deepEqual(state,{p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3,q:4});
const target=[a,p,mod(B-K)];
assert.deepEqual(target,[6,23,17]);

// Manual transcription of the red square-dot cluster in original resources/liber-primus/01.jpg.
// Five rows contain 1,3,3,3,1 dots; columns therefore contain 3,5,3 dots (11 total).
// This is distinct from the 13 red title runes EPIPHANY/SEEKS.
const markerRows=[1,3,3,3,1], markerColumns=[3,5,3];
assert.equal(markerRows.reduce((x,y)=>x+y,0),11);
assert.deepEqual(markerColumns,[e,g,e]);

// Parse page-local rune words from the shared transcription, matching the established p0 receiver census.
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const tx=read("resources/lp2-transcription.txt");
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const parts=tx.split(/^\s*%\s*$/m).slice(0,55);
const pages=parts.map((_,s)=>({page:s>=50?s+1:s,words:[],offset:0}));
let current=[], startPage=0, endPage=0, startOffset=0;
function flush(){
  if(!current.length) return;
  if(startPage===endPage) pages[startPage].words.push({ordinal:pages[startPage].words.length+1,start:startOffset,values:current.slice()});
  current=[];
}
for(let s=0;s<parts.length;s++) for(const ch of [...parts[s]]) {
  const v=runeIndex.get(ch);
  if(v!==undefined) {
    if(!current.length) { startPage=s; startOffset=pages[s].offset; }
    endPage=s; current.push(v); pages[s].offset++;
  } else if(ch==="/" || /\s/u.test(ch)) {
    // Preserve within-word slash/space behavior of the established receiver census.
  } else flush();
}
flush();

const translit=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
function gp(text) {
  const s=text.toUpperCase().replace(/K/g,"C").replace(/V/g,"U").replace(/Q/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");
  const out=[];
  for(let i=0;i<s.length;) {
    const t=translit.find(x=>s.startsWith(x.symbol,i));
    assert.ok(t, "unmapped plaintext at "+s.slice(i));
    out.push(t.value); i+=t.symbol.length;
  }
  return out;
}
const candidate=[...gp("EPIPHANY"),...gp("SEEKS")];
assert.equal(candidate.length,13);

const rows=[];
for(const page of pages) for(let i=0;i+1<page.words.length;i++) {
  const w1=page.words[i], w2=page.words[i+1];
  if(w1.values.length!==8 || w2.values.length!==5) continue;
  const ciphertext=[...w1.values,...w2.values];
  const key=ciphertext.map((v,j)=>mod(v-candidate[j]));
  const h=H(key);
  assert.equal(h.length,13);
  // "Shed our own circumferences": remove the two outermost H atoms.
  // The retained 11 atoms fit the independently counted physical 3|5|3 dot columns.
  const inner=h.slice(1,-1);
  assert.equal(inner.length,11);
  const groups=[inner.slice(0,3),inner.slice(3,8),inner.slice(8,11)];
  const sums=groups.map(sum);
  rows.push({page:page.page,ordinals:[w1.ordinal,w2.ordinal],start:w1.start,
    h,inner,groups,sums,match:JSON.stringify(sums)===JSON.stringify(target)});
}
assert.equal(rows.length,19);
const matches=rows.filter(r=>r.match);
assert.equal(matches.length,1);
assert.equal(matches[0].page,0);
assert.deepEqual(matches[0].ordinals,[1,2]);
assert.equal(matches[0].start,0);
assert.deepEqual(matches[0].h,[7,16,8,11,8,8,11,27,27,27,21,27,18]);
assert.deepEqual(matches[0].inner,[16,8,11,8,8,11,27,27,27,21,27]);
assert.deepEqual(matches[0].sums,[6,23,17]);

console.log(JSON.stringify({
  status:"PASS",
  state,
  sourceMarker:{rows:markerRows,columns:markerColumns,total:11,transcription:"manual count from original resources/liber-primus/01.jpg"},
  operation:"H(C-P mod29), shed first and last H atoms, partition retained 11 as 3|5|3, sum each column mod29",
  predictedStatePacket:{formula:["a","p","B-K"],values:target},
  receiverFamily:{count:rows.length,exactMatches:matches},
  p0:matches[0],
  evidenceBoundary:"The candidate EPIPHANY SEEKS was already known; this is a source-constrained holdout/serialization constraint, not blind plaintext recovery or a complete p0 body inverse."
},null,2));
