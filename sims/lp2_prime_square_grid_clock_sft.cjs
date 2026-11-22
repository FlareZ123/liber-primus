"use strict";

/**
 * Source-selected grid key: omitted f=41; p_41=179; p_41^2 mod 256=41.
 * For ordinal n=41+i, row=(p_n^2 mod256-1)/8 and column=n mod8.
 * Tests two exact reversible GP inverses on all original 12956 runes.
 * No ciphertext-fitted key; source hypothesis remains provisional.
 * Run: node sims/lp2_prime_square_grid_clock_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const base=path.resolve(__dirname,"..","resources");
const load=(name)=>JSON.parse(fs.readFileSync(path.join(base,name),"utf8"));
const grid=load("liber-primus/base60-grid.json");
const corpus=load("liber-primus/lp2-corpus.json");
const latin=load("control/latin-vulgate-heldout-gp.json");
const pages=corpus.pages.filter(p=>p.status==="unsolved");
const originals=pages.map(p=>p.indices);
const bytes=grid.byte_rows.flat();
const count=originals.reduce((n,p)=>n+p.length,0);
assert.equal(count,12956);
assert.equal(bytes.length,256);
assert.equal(grid.byte_rows.length,32);
const M=150000, sieve=new Uint8Array(M+1), primes=[];
for(let p=2;p<=M;p++){
  if(sieve[p])continue;
  primes.push(p);
  if(p*p<=M)for(let k=p*p;k<=M;k+=p)sieve[k]=1;
}
assert.ok(primes.length>=count+41);
assert.equal(primes[40],179);
assert.equal(grid.alphabet.indexOf("f"),41);
assert.deepEqual([...grid.alphabet].filter(ch=>!grid.rows.flat().some(cell=>cell[1]===ch)),["f"]);
assert.deepEqual(Array.from({length:60},(_,i)=>i+1).filter(n=>primes[n-1]**2%256===n),[41]);
const mod=(a,n)=>(a%n+n)%n;
const powers=[],logs=Array(29).fill(-1);
let power=1;
for(let e=0;e<28;e++){
  assert.equal(logs[power],-1);
  powers.push(power);logs[power]=e;
  power=power*15%29;
}
assert.equal(power,1);
assert.equal(powers.length,28);
/** @param {number} i @returns {number} */
function indexAt(i){
  const n=41+i,p=primes[n-1];
  const remainder=p*p%256;
  assert.equal(remainder%8,1);
  return remainder-1+n%8;
}
/** @param {number} position @param {number} cardinality
 * @param {"mod"|"scaled"} projection @returns {number}
 */
function keyAt(position,cardinality,projection){
  const b=bytes[indexAt(position)];
  return projection==="mod"?b%cardinality:Math.floor(b*cardinality/256);
}
assert.equal(indexAt(0),41);
assert.equal(new Set(Array.from({length:256},(_,i)=>indexAt(i))).size,177);
const first256=Array.from({length:256},(_,i)=>indexAt(i));
assert.ok(first256.every(i=>i>=0&&i<256));
/**
 * @param {number[][]} pageSequences
 * @param {"add29"|"rank28"|"log15"} family
 * @param {"mod"|"scaled"} projection
 * @param {-1|1} sign
 * @param {boolean} pageReset
 * @param {boolean} encode
 * @returns {number[][]}
 */
function cipher(pageSequences,family,projection,sign,pageReset,encode){
  const n=family==="add29"?29:28;
  let ordinal=0,previous=null;
  const out=[];
  for(const page of pageSequences){
    if(pageReset)previous=null;
    const decoded=[];
    for(let i=0;i<page.length;i++){
      const x=page[i],t=pageReset?i:ordinal,k=keyAt(t,n,projection);
      let y;
      if(family==="add29") y=mod(x+(encode?1:-1)*sign*k,29);
      else if(family==="log15"){
        if(encode) y=previous===null?x:x===28?previous:
          mod(previous+powers[mod(x+sign*k,28)],29);
        else y=previous===null?x:x===previous?28:
          mod(logs[mod(x-previous,29)]-sign*k,28);
      }else if(encode){
        y=previous===null?x:x===28?previous:mod(previous+1+mod(x+sign*k,28),29);
      }else y=previous===null?x:x===previous?28:mod(mod(x-previous-1,29)-sign*k,28);
      previous=encode?y:x;
      decoded.push(y);
      ordinal++;
    }
    out.push(decoded);
  }
  return out;
}
function ioc(x){
  const c=Array(29).fill(0);
  for(const v of x)c[v]++;
  return c.reduce((s,v)=>s+v*(v-1),0)/(x.length*(x.length-1));
}
const plant=latin.runes.slice(0,2400);
assert.equal(plant.length,2400);
const flanks=[corpus.pages.find(p=>p.page===49).indices,
  corpus.pages.find(p=>p.page===51).indices];
assert.deepEqual(flanks.map(x=>x.length),[66,92]);
const variants=[];
for(const family of ["add29","rank28","log15"])
 for(const projection of ["mod","scaled"])
  for(const sign of [-1,1])
   for(const pageReset of [false,true]){
     const p=cipher(originals,family,projection,sign,pageReset,false);
     assert.deepEqual(cipher(p,family,projection,sign,pageReset,true),originals);
     const plantedCipher=cipher([plant],family,projection,sign,pageReset,true);
     assert.deepEqual(cipher(plantedCipher,family,projection,sign,pageReset,false),[plant]);
     const flat=p.flat();
     const bridge=cipher(flanks,family,projection,sign,pageReset,false);
     assert.deepEqual(cipher(bridge,family,projection,sign,pageReset,true),flanks);
     const bridgePlain=bridge.flat();
     variants.push({family,projection,sign,pageReset,
       originalIoC:ioc(flat),bridgeIoC:ioc(bridgePlain),
       first40:flat.slice(0,40).map(i=>corpus.translit[i]).join(" ")});
   }
variants.sort((a,b)=>b.originalIoC-a.originalIoC);
assert.equal(variants.length,24);
assert.ok(variants.every(r=>r.originalIoC<0.045));
assert.ok(variants.every(r=>r.bridgeIoC<0.045));
console.log(JSON.stringify({
  source:"Original 32x8 256-cell table, missing units glyph f index41, GP corpus",
  omittedDigitIndex:41,primeAtIndex41:179,
  squareFixedPoint:179**2%256,firstGridCell:indexAt(0),
  distinctCellsInFirst256:177,
  runes:count,rawOriginalIoC:ioc(originals.flat()),
  plantedLatinLength:plant.length,plantedLatinIoC:ioc(plant),
  exactOriginalAndPlantRoundTrip:true,
  bridgeRuneLengths:flanks.map(p=>p.length),
  originalBridgeIoC:ioc(flanks.flat()),
  bestBridgeIoC:Math.max(...variants.map(v=>v.bridgeIoC)),
  variants,
  decision:"The source-selected prime-square row/ordinal-column schedule fails direct GP29, rank28, and GF29 log15 decipherments; no plaintext, mechanism, or key recovered.",
  scope:"A specific source-derived schedule only; other uses of prime179 and the table are open."
},null,2));
