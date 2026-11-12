"use strict";
/**
 * Full 32x8 ring histogram obstruction for every independent secret GP29
 * alphabet bijection AND every arbitrary within-ring position permutation.
 * Uses exactly deciphered p56, raw solved p57, and original table cells.
 *
 * Run: node sims/lp2_terminal256_ring_allsecret_hist_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname,"..");
const read = p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const corpus=read("resources/liber-primus/lp2-corpus.json");
const grid=read("resources/liber-primus/base60-grid.json").byte_rows;
assert.equal(grid.length,32);
assert(grid.every(row=>row.length===8));
const page=n=>corpus.pages.find(p=>p.page===n).indices;
const p55=page(55),p56=page(56),p57=page(57);
assert.deepEqual([p55.length,p56.length,p57.length],[76,85,95]);
const primes=[];
for(let x=2;primes.length<84;x++){
  let prime=true;
  for(let d=2;d*d<=x;d++)if(x%d===0){prime=false;break;}
  if(prime)primes.push(x);
}
const mod=x=>((x%29)+29)%29;
let j=0;
const solved56=p56.map((x,i)=>i===56?x:mod(x-primes[j++]+1));
assert.equal(j,84);
const expected="AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const tokens=corpus.translit.map((token,index)=>({token,index}))
  .sort((a,b)=>b.token.length-a.token.length);
const known=[];
for(const word of expected.split(" ")){
  for(let i=0;i<word.length;){
    const found=tokens.find(t=>word.startsWith(t.token,i));
    assert(found,"Unknown GP token "+word.slice(i));
    known.push(found.index);
    i+=found.token.length;
  }
}
assert.equal(known.length,85);
assert.deepEqual(solved56,known,"Full authentic p56 decrypt is the control");
const joined=p55.concat(solved56,p57);
assert.equal(joined.length,256);
assert.equal(p57.slice(43).length,52);
const sortedHistogram=values=>{
  const h=Array(29).fill(0);
  for(const v of values){assert(Number.isInteger(v)&&v>=0&&v<29);h[v]++;}
  return h.sort((a,b)=>b-a);
};
/**
 * Exact minimum number of changed slots under ANY independent alphabet
 * bijection and ANY arbitrary permutation of positions. Sorting class
 * multiplicities optimizes the pairing under absolute-distance cost.
 * @param {number[]} x
 * @param {number[]} y
 */
const minChanges=(x,y)=>{
  assert.equal(x.length,y.length);
  const a=sortedHistogram(x),b=sortedHistogram(y);
  return a.reduce((sum,v,i)=>sum+Math.abs(v-b[i]),0)/2;
};
let offset=0;
const rings=[];
for(let depth=0;depth<4;depth++){
  const source=[];
  for(let row=depth;row<32-depth;row++)
    for(let col=depth;col<8-depth;col++)
      if(row===depth||row===31-depth||col===depth||col===7-depth)
        source.push(grid[row][col]%29);
  const target=joined.slice(offset,offset+source.length);
  const minimum=minChanges(source,target);
  const planted=target.map(v=>mod(5*v+7)).reverse();
  const exactNativePositive=minChanges(planted,target);
  assert.equal(exactNativePositive,0);
  rings.push({depth,sourceRuneCount:source.length,sourceStart:offset,
    originalIsKnownPlaintext:depth>0,minimumChangedSymbols:minimum,
    knownPlaintextPlantMinimum:exactNativePositive});
  offset+=source.length;
}
assert.deepEqual(rings.map(r=>r.sourceRuneCount),[76,68,60,52]);
assert.deepEqual(rings.map(r=>r.minimumChangedSymbols),[4,13,8,8]);
assert.equal(offset,256);
assert.equal(rings.slice(1).reduce((n,r)=>n+r.minimumChangedSymbols,0),29);
console.log(JSON.stringify({
  scope:"Every unknown independent GP29 ring bijection plus arbitrary "+
    "within-ring position permutation; all 180 known terminal plain runes",
  source:"original 32x8 base60 table row-major GF29 remainders",
  knownP56:"full 85-runic prime-totient solution with literal F at 56",
  innerSuffix:"solved p57 physical local43..94 is the 52-rune SHED imperative",
  results:rings,minimumChangedKnownSymbols:29,
  inference:"Exact direct four-ring substitution/transposition architecture "+
    "is impossible even with secret alphabet and order per known shell. "+
    "This is not an exclusion of position-dependent stateful ciphers."
},null,2));
