"use strict";
/**
 * Exact original-source p57 CIRCUMFERENCES interior -> THOR keyword,
 * with full historical plaintext-F-transparent p55 inverse and solved plants.
 * Hypothesis, not an authenticated Cicada decipherment.
 * SFT: node sims/lp2_p57_interior_thor_p55_key_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} file */
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
const db=read("resources/liber-primus/lp2-corpus.json");
const grid=read("resources/liber-primus/lp2-grid-256.json");
const lengths=[7,4,2,6,7,2,2,7,2,4,4,3,3,14,4,2,8,5,3,6];
const c55=db.pages[55].indices, c57=db.pages[57].indices;
assert.deepEqual([c55.length,c57.length,grid.bytes.length],[76,95,256]);
let pos=0;
const words=lengths.map(n=>{const w=c57.slice(pos,pos+n);pos+=n;return w;});
assert.equal(pos,95);
const spell=a=>a.map(n=>db.translit[n]).join("");
const sum=a=>a.reduce((s,n)=>s+db.prime[n],0);
const full=words.map(sum),inside=words.map(w=>sum(w.slice(1,-1)));
assert.deepEqual([spell(words[0]),spell(words[4]),spell(words[13]),spell(words[16])],
  ["PARABLE","TUNNELNG","CIRCUMFERENCES","DIUINITY"]);
assert.deepEqual([full[0],inside[0],full[4],inside[4],inside[13],full[16],inside[16]],
  [449,339,339,201,385,376,184]);
const matches=full.flatMap((s,i)=>grid.bytes[(s%256||256)-1]===inside[i]?[i]:[]);
assert.deepEqual(matches,[4,16]);
assert.deepEqual([full[4]%256,full[16]%256,grid.bytes[82],grid.bytes[119]],
  [83,120,201,184]);
assert.equal(inside[4]+inside[16],inside[13]);
// Both and only the two source-table copies of byte201 are reached by
// TUNNELNG whole339 -> address83 and CIRCUMFERENCES interior385 -> address129.
assert.equal(grid.bytes[(inside[13]%256||256)-1],inside[4]);
assert.deepEqual(grid.bytes.flatMap((v,i)=>v===inside[4]?[i+1]:[]),[83,129]);
assert.deepEqual(grid.bytes.flatMap((v,i)=>v===inside[16]?[i+1]:[]),[110,120]);
assert.equal(inside[0],full[4]);
/** @param {number} n */
function factors(n){const f=[];for(let p=2;p*p<=n;p++)while(n%p===0){f.push(p);n/=p;}if(n>1)f.push(n);return f;}
const primes=factors(inside[13]),runes=primes.map(p=>db.prime.indexOf(p));
assert.deepEqual(primes,[5,7,11]);
assert.deepEqual(runes,[2,3,4]);
assert.equal(spell(runes),"THOR");
const mod=n=>(n%29+29)%29;
/**
 * @param {number[]} source
 * @param {number[]} key
 * @param {number} phase
 */
function inverse(source,key,phase){
  let states=[{clock:0,plain:[]}];
  for(let i=0;i<source.length;i++){
    const next=[];
    for(const s of states){
      if(source[i]===0)next.push({clock:s.clock,plain:s.plain.concat(0)});
      const p=mod(source[i]-key[(s.clock+phase)%key.length]);
      if(p!==0)next.push({clock:s.clock+1,plain:s.plain.concat(p)});
    }
    states=next;
    if(!states.length)return {survivors:0,failed:i,plains:[]};
  }
  return {survivors:states.length,failed:null,plains:states.map(s=>s.plain)};
}
/** @param {number[]} plain @param {number[]} key @param {number} phase */
function forward(plain,key,phase){
  let k=0;
  return plain.map(p=>p===0?0:mod(p+key[(k++ +phase)%key.length]));
}
/** @param {number[]} a */
function ioc(a){const counts=Array(29).fill(0);for(const n of a)counts[n]++;return counts.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));}
const keys={
  literal:runes,
  primeTotient:primes.map(p=>(p-1)%29),
  primeRaw:primes.map(p=>p%29),
};
const tests={};
for(const [name,key] of Object.entries(keys)){
  tests[name]=[];
  for(let phase=0;phase<key.length;phase++){
    const f=inverse(c55,key,phase),s=inverse(c55.slice(1),key,phase);
    const plant=forward(c57,key,phase),control=inverse(plant,key,phase);
    assert.ok(control.plains.some(p=>p.length===95&&p.every((n,i)=>n===c57[i])));
    for(const p of f.plains)assert.deepEqual(forward(p,key,phase),c55);
    tests[name].push({phase,full:f.survivors,fullFirstFailure:f.failed,
      suffix:s.survivors,suffixFirstFailure:s.failed,
      sourceIoC:f.plains.map(ioc),first30:f.plains.map(p=>spell(p.slice(0,30)))});
  }
}
assert.deepEqual(tests.literal.map(x=>x.full),[2,1,0]);
assert.deepEqual(tests.literal.map(x=>x.suffix),[0,2,1]);
assert.deepEqual(tests.primeTotient.map(x=>x.full),[0,0,0]);
assert.deepEqual(tests.primeRaw.map(x=>x.full),[0,0,0]);
console.log(JSON.stringify({
  source:{parableInterior:inside[0],tunnelWhole:full[4],
    tunnelInterior:inside[4],divinityInterior:inside[16],
    circumferencesInterior:inside[13],tableMatchedWords:matches,
    primeFactors:primes,keyword:spell(runes)},
  fullOriginalP55:76,authenticSolvedP57Plant:95,tests,
  decision:"Source-derived THOR is conditional; no original unknown-page plaintext recovered"
},null,2));
