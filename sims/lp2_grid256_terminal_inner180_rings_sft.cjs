"use strict";

/**
 * Agent48, 13 November 2026.
 * Terminal 76+180 original ring-frame known-plaintext obstruction.
 * Read 32x8 table's four complete concentric rings [76,68,60,52].
 * p55(76) is withheld; test the solved p56+p57(180) against the
 * remaining three rings, granting one arbitrary secret lookup PER ring.
 *
 * SFT: node sims/lp2_grid256_terminal_inner180_rings_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} name */
const json = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const corpus = json("resources/liber-primus/lp2-corpus.json");
const grid = json("resources/liber-primus/lp2-grid-256.json");
const {exactLookup} = require("./grid256_terminal_composite_lookup_gate.cjs");
const text = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const letters = corpus.translit.map((token, index) => ({token, index}))
  .sort((a,b) => b.token.length - a.token.length);
const knownP56 = [];
for(const word of text.split(" "))for(let i=0;i<word.length;) {
  const match=letters.find(x=>word.startsWith(x.token,i));
  assert(match, "unrecognized GP token");
  knownP56.push(match.index);
  i+=match.token.length;
}
const page56 = corpus.pages[56].indices;
assert.equal(knownP56.length,85);
assert.equal(page56.length,85);
let prime=2, count=0;
for(let i=0;i<85;i++) {
  if(i===56) {
    assert.equal(page56[i],0);
    assert.equal(knownP56[i],0);
    continue;
  }
  while(true) {
    let primeFlag=true;
    for(let d=2;d*d<=prime;d++)
      if(prime%d===0){primeFlag=false;break;}
    if(primeFlag)break;
    prime++;
  }
  const decoded=((page56[i]-(prime-1))%29+29)%29;
  assert.equal(decoded,knownP56[i]);
  prime++;
  count++;
}
assert.equal(count,84);
const p55=corpus.pages[55].indices;
const p57=corpus.pages[57].indices;
assert.deepEqual([p55.length,page56.length,p57.length],[76,85,95]);
assert.equal(grid.bytes.length,256);
const known=knownP56.concat(p57);
assert.equal(known.length,180);

/** @param {number} depth */
function ring(depth) {
  const out=[];
  const top=depth, bottom=31-depth, left=depth, right=7-depth;
  for(let x=left;x<=right;x++)out.push(8*top+x);
  for(let y=top+1;y<=bottom;y++)out.push(8*y+right);
  for(let x=right-1;x>=left;x--)out.push(8*bottom+x);
  for(let y=bottom-1;y>=top+1;y--)out.push(8*y+left);
  return out;
}
const rings=Array.from({length:4},(_,i)=>ring(i));
assert.deepEqual(rings.map(r=>r.length),[76,68,60,52]);
assert.equal(new Set(rings.flat()).size,256);
const corners=[[0,0],[0,7],[31,7],[31,0]];
const tests=[];
for(let corner=0;corner<corners.length;corner++)
  for(const direction of [-1,1]) {
    const [cy,cx]=corners[corner];
    const values=rings.map((ids,depth)=>{
      const y=Math.max(depth,Math.min(31-depth,cy));
      const x=Math.max(depth,Math.min(7-depth,cx));
      const start=ids.indexOf(y*8+x);
      assert(start>=0);
      return ids.map((_,i)=>grid.bytes[
        ids[(start+direction*i+ids.length*2)%ids.length]]);
    });
    const interior=values.slice(1);
    assert.deepEqual(interior.map(x=>x.length),[68,60,52]);
    const orders=[
      ["outer-to-inner",interior],
      ["inner-to-outer",interior.slice().reverse()],
      ["reverse-each",interior.map(x=>x.slice().reverse())],
      ["reverse-all",interior.slice().reverse().map(x=>x.slice().reverse())]
    ];
    for(const [order,arr] of orders)for(const textReverse of [false,true]) {
      const plaintext=textReverse?known.slice().reverse():known;
      const bytes=arr.flat();
      assert.equal(bytes.length,plaintext.length);
      const allByteToRune=exactLookup(bytes,plaintext);
      const allRuneToByte=exactLookup(plaintext,bytes);
      let offset=0;
      const byRing=[];
      for(const block of arr) {
        const p=plaintext.slice(offset,offset+block.length);
        assert.equal(block.length,p.length);
        const byteToRune=exactLookup(block,p).errors;
        const runeToByte=exactLookup(p,block).errors;
        const planted=block.map(x=>(x*7+13)%29);
        assert.equal(exactLookup(block,planted).errors,0);
        const plantedOther=p.map(x=>(x*5+39)%256);
        assert.equal(exactLookup(p,plantedOther).errors,0);
        byRing.push({length:block.length,byteToRune,runeToByte});
        offset+=block.length;
      }
      assert.equal(offset,180);
      tests.push({corner,direction,order,textReverse,
        whole:{byteToRune:allByteToRune.errors,runeToByte:allRuneToByte.errors},
        byRing,
        threeIndependentByteToRune:byRing.reduce((s,r)=>s+r.byteToRune,0),
        threeIndependentRuneToByte:byRing.reduce((s,r)=>s+r.runeToByte,0)});
    }
  }
assert.equal(tests.length,64);
assert.equal(Math.min(...tests.map(r=>r.threeIndependentByteToRune)),19);
assert.equal(Math.min(...tests.map(r=>r.whole.byteToRune)),45);
assert(tests.every(r=>r.threeIndependentByteToRune>0));
assert(tests.every(r=>r.threeIndependentRuneToByte>0));
const best=tests.slice().sort((a,b)=>
  a.threeIndependentByteToRune-b.threeIndependentByteToRune)[0];
console.log(JSON.stringify({
  source:{grid:"32x8 original table",rings:[76,68,60,52],
    unknownP55:76,solvedP56:85,clearP57:95,
    solvedPrimeTotientP56Verified:85},
  configurations:64,
  minContradictionsStaticGlobalByteToRune:
    Math.min(...tests.map(r=>r.whole.byteToRune)),
  minContradictionsSeparateMapPerInnerRing:
    Math.min(...tests.map(r=>r.threeIndependentByteToRune)),
  minContradictionsSeparateMapPerInnerRingReverse:
    Math.min(...tests.map(r=>r.threeIndependentRuneToByte)),
  best,
  arbitrarySecretMapPositivePlants:"All 64 variants and three rings pass",
  outcome:"All tested ring-constrained fixed codebooks contradict original solved GP text"
},null,2));
