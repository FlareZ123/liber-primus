"use strict";
/**
 * Original-input, source-motivated square spiral and permutation-only gate.
 * Node 22/CommonJS. Requires canonical LP2 tape and untouched Gibran control.
 * The p15 4x4 clockwise-out spiral is authenticated ON p15; applying it to
 * 81x81 and 80x80 bookend grids is hypothetical.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const tape = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(tape.length, 12956);
const first = tape.slice(0, 81 ** 2);
const last = tape.slice(81 ** 2);
assert.equal(first.length, 6561);
assert.equal(last.length, 6395);
assert.deepEqual(first.slice(-6), [23,11,1,17,18,10]);
assert.deepEqual(last.slice(-6), first.slice(-6));
const slots = [2244, 2384, 2476, 2575, 2672];
const ordinalCompletion = last.slice();
for (const slot of slots) ordinalCompletion.splice(slot, 0, null);
assert.equal(ordinalCompletion.length, 6400);
assert.deepEqual(slots.map(i => ordinalCompletion[i]), [null,null,null,null,null]);
const titleCompletion = last.concat(corpus.pages[56].indices.slice(0,5));
assert.equal(titleCompletion.length, 6400);
assert.deepEqual(titleCompletion.slice(-5), [25,11,22,15,4]);

/** Reproduce the direction and central-left origin of the printed p15 4x4 spiral. */
function spiral(n) {
  let x = Math.floor((n - 1)/2), y = x, d = 0, len = 1;
  const dirs = [[1,0],[0,1],[-1,0],[0,-1]];
  const cells = [[x,y]];
  while (cells.length < n*n) {
    for (let twice = 0; twice < 2; twice++) {
      for (let i = 0; i < len; i++) {
        x += dirs[d][0]; y += dirs[d][1];
        if (x>=0 && x<n && y>=0 && y<n) cells.push([x,y]);
      }
      d = (d+1)%4;
    }
    len++;
  }
  assert.equal(new Set(cells.map(([a,b])=>a+","+b)).size, n*n);
  return cells;
}
const expectedP15 = [
  [1,1],[2,1],[2,2],[1,2],[0,2],[0,1],[0,0],[1,0],
  [2,0],[3,0],[3,1],[3,2],[3,3],[2,3],[1,3],[0,3]
];
assert.deepEqual(spiral(4), expectedP15);
const path81 = spiral(81), path80 = spiral(80);
const traverse = (grid, n, cells) => cells
  .map(([x,y])=>grid[y*n+x]).filter(x=>x!==null);
function untraverse(plaintext,n,cells,holes=[]) {
  const out = Array(n*n).fill(null), h = new Set(holes);
  let k=0;
  for (const [x,y] of cells) {
    const i=y*n+x;
    if (!h.has(i)) out[i]=plaintext[k++];
  }
  assert.equal(k, plaintext.length);
  return out;
}
const ioc = values => {
  const f = Array(29).fill(0);
  for (const v of values) f[v]++;
  return f.reduce((acc,z)=>acc+z*(z-1),0)/(values.length*(values.length-1));
};
const top12 = values => {
  const f=Array(29).fill(0);
  for(const v of values) f[v]++;
  return f.sort((a,b)=>b-a).slice(0,12).reduce((a,b)=>a+b,0);
};
const doublets = v => v.slice(1).filter((x,i)=>x===v[i]).length;
const maxNonoverlap200 = v => {
  let best=0;
  for(let i=0;i+200<=v.length;i+=200)best=Math.max(best,ioc(v.slice(i,i+200)));
  return best;
};
const spiralA=traverse(first,81,path81);
const spiralB=traverse(ordinalCompletion,80,path80);
const spiralTitle=traverse(titleCompletion,80,path80);
assert.deepEqual([top12(first),top12(last),top12(spiralA),top12(spiralB)],
  [2908,2797,2908,2797]);
assert.deepEqual([doublets(first),doublets(last),doublets(spiralA),
  doublets(spiralB),doublets(spiralTitle)],[41,45,129,128,121]);
assert(Math.abs(ioc(spiralA)-0.0345227805844588)<1e-13);
assert(Math.abs(ioc(spiralB)-0.034451571217445597)<1e-13);
assert(maxNonoverlap200(spiralA)<0.038);
assert(maxNonoverlap200(spiralB)<0.038);
assert(maxNonoverlap200(spiralTitle)<0.038);

// Native GP English controls of equal source length, with original encoder grammar.
const mapping = new Map(corpus.translit.map((s,i)=>[s,i]));
const input = fs.readFileSync(path.join(root,
  "resources/control/gibran_prophet_58585.txt"), "utf8").toUpperCase();
const native=[];
for(let word of input.match(/[A-Z]+/g)||[]) {
  word=word.replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/K/g,"C").replace(/Z/g,"S");
  for(let i=0;i<word.length;) {
    const dig=word.slice(i,i+2);
    if(mapping.has(dig)){native.push(mapping.get(dig));i+=2;}
    else {if(mapping.has(word[i]))native.push(mapping.get(word[i]));i++;}
  }
}
assert(native.length>=65000-2000); // full historical control file
const nativeA=native.slice(0,6561),nativeB=native.slice(10000,16395);
assert.deepEqual(traverse(untraverse(nativeA,81,path81),81,path81),nativeA);
const plantB=untraverse(nativeB,80,path80,slots);
assert.deepEqual(traverse(plantB,80,path80),nativeB);
assert.deepEqual(slots.map(i=>plantB[i]),[null,null,null,null,null]);
const windows=[];
for(let i=0;i+200<=native.length;i+=200)windows.push(ioc(native.slice(i,i+200)));
assert.equal(windows.length,315);
assert(Math.min(...windows)>0.052);
assert(top12(nativeA)>4900 && top12(nativeB)>4800);
console.log(JSON.stringify({
  originalLengths:{first:6561,last:6395,ordinalSquare:6400,titleSquare:6400},
  actualOrdinalSlots:slots,
  p15SpiralNative4x4Match:true,
  original:{
    first:{top12:top12(spiralA),ioc:ioc(spiralA),
      doublets:doublets(spiralA),maxNonoverlap200IoC:maxNonoverlap200(spiralA)},
    ordinalCompletion:{top12:top12(spiralB),ioc:ioc(spiralB),
      doublets:doublets(spiralB),maxNonoverlap200IoC:maxNonoverlap200(spiralB)},
    solvedHeadingCompletion:{top12:top12(spiralTitle),ioc:ioc(spiralTitle),
      doublets:doublets(spiralTitle),maxNonoverlap200IoC:maxNonoverlap200(spiralTitle)}
  },
  nativeControl:{windows200:windows.length,minIoC:Math.min(...windows),
    firstTop12:top12(nativeA),lastTop12:top12(nativeB),exactPlants:true},
  decision:"Position-only p15-spiral reordering does not recover GP native English; no authentic cross-square selector or plaintext."
},null,2));
