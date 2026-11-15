"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// Source-locked three-square rank transposition on the 75-rune LP2 p55 body.
// Three 25-cell routes: first 5x5, centre of 7x7, final 5x5. Repeated square
// values use stable printed row-major ties. Only ascending/descending ranks and
// direct/inverse directions are tested; no fitted key or route parameters.
// Run: node sims/lp2_p55_three_square_rank_transposition_sft.cjs

const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const text = read("resources/cicada2014-openpuff-magic-squares.txt");
const blocks = text.trim().split(/\r?\n\s*\r?\n/);
const squares = blocks.map(b => b.trim().split(/\r?\n/).map(
  row => row.trim().split(/\s+/).map(Number)));
assert.deepEqual(squares.map(s => [s.length, s[0].length]), [[5,5],[7,7],[5,5]]);
const matrices = [squares[0], squares[1].slice(1,-1).map(r=>r.slice(1,-1)), squares[2]];
assert.deepEqual(squares.map(s=>s[0].reduce((a,b)=>a+b,0)), [3301,1033,1033]);
const ascending = matrices.map(s => {
  const values=s.flat();
  return Array.from({length:25},(_,i)=>i).sort((a,b)=>values[a]-values[b]||a-b);
});
const descending = ascending.map(r=>r.slice().reverse());
const body = corpus.pages[55].indices.slice(1);
const positive = corpus.pages[57].indices.slice(0,75);
assert.equal(corpus.pages[55].indices.length,76);
assert.equal(corpus.pages[55].indices[0],21);
assert.equal(body.length,75);
assert.equal(positive.length,75);

function transport(input,routes,inverse){
  const out=[];
  for(let s=0;s<3;s++){
    const block=input.slice(25*s,25*s+25),route=routes[s],dest=new Array(25);
    for(let i=0;i<25;i++){if(inverse)dest[route[i]]=block[i];else dest[i]=block[route[i]];}
    out.push(...dest);
  }
  return out;
}
const tokens=corpus.translit.map((spelling,index)=>({spelling,index}))
  .sort((a,b)=>b.spelling.length-a.spelling.length);
function nativeGP(source){
  const out=[];
  for(let word of source.toUpperCase().match(/[A-Z]+/g)||[]){
    word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/IO/g,"IA");
    for(let i=0;i<word.length;){
      const t=tokens.find(x=>word.startsWith(x.spelling,i));
      assert(t);out.push(t.index);i+=t.spelling.length;
    }
  }
  return out;
}
const source=nativeGP(read("resources/control/shakespeare_first300k.txt"));
assert(source.length>200000);
const pair=new Uint32Array(29*29),tri=new Uint32Array(29**3);
for(let i=2;i<source.length;i++){const p=29*source[i-2]+source[i-1];pair[p]++;tri[29*p+source[i]]++;}
function score(x){let sum=0;for(let i=2;i<x.length;i++){const p=29*x[i-2]+x[i-1];sum+=Math.log((tri[29*p+x[i]]+.1)/(pair[p]+2.9));}return sum/(x.length-2);}
const results=[];
for(const [name,routes] of [["ascending",ascending],["descending",descending]]){
  for(const inverse of [false,true]){
    const decoded=transport(body,routes,inverse);
    assert.deepEqual(transport(decoded,routes,!inverse),body);
    const planted=transport(positive,routes,!inverse);
    assert.deepEqual(transport(planted,routes,inverse),positive);
    results.push({route:name,direction:inverse?"inverse":"direct",score:score(decoded),
      decoded:decoded.map(i=>corpus.translit[i]).join("."),
      originalReencryptMatches:75,positiveRecoveryMatches:75});
  }
}
const expected=[-5.050536135798938,-4.968695932294145,-4.814447469383129,-4.555526977088];
for(let i=0;i<expected.length;i++)assert.ok(Math.abs(results[i].score-expected[i])<1e-10);
const originalScore=score(body),positiveScore=score(positive);
assert.ok(Math.abs(originalScore-(-4.542704471048683))<1e-10);
assert.ok(Math.abs(positiveScore-(-2.540842377756682))<1e-10);
assert.ok(results.every(r=>r.score< -4.5));
console.log(JSON.stringify({hypothesis:"2014 three-square rank permutations over three 25-rune p55 blocks",
  rowSums:[3301,1033,1033],sourceShape:"5x5 + centre(7x7)=5x5 + 5x5",
  originalScore,positiveScore,results},null,2));
