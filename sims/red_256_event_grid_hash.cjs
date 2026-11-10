"use strict";
/**
 * Exact-source 256 ink-event / 8x32 numeric-grid digest check.
 * Node 22 CommonJS. Run: node sims/red_256_event_grid_hash.cjs
 * The source alignment is retrospective, and negative results are bounded.
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const {events}=require("./red_256_event_key_inverse.cjs");
const root=path.join(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(
  path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const grid=JSON.parse(fs.readFileSync(
  path.join(root,"resources/liber-primus/base60-grid.json"),"utf8")).byte_rows;
const target="36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";

assert.equal(crypto.createHash("sha256").update("abc").digest("hex"),
  "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
assert.equal(grid.length,32);
assert.ok(grid.every(x=>x.length===8));
const stream=events();
assert.equal(stream.length,256);

const variants={
  gpIndex:Buffer.from(stream.map(e=>e.value)),
  gpPrime:Buffer.from(stream.map(e=>e.kind?corpus.prime[e.value]:13)),
  markerIndicator:Buffer.from(stream.map(e=>Number(e.kind===0))),
  primeParity:Buffer.from(stream.map(e=>e.kind?corpus.prime[e.value]%2:1)),
  utf8RunesAndMark:Buffer.from(stream.map(e=>e.kind?
    corpus.runes[e.value]:"᛭").join(""),"utf8")
};
const flat=grid.flat();
const gridViews={
  vertical: Array.from({length:8},(_,i)=>Buffer.from(grid.map(row=>row[i]))),
  rowChunks: Array.from({length:8},(_,i)=>Buffer.from(flat.slice(i*32,i*32+32)))
};

/** @param {string} alg @param {Buffer} bytes @param {number} n */
function digest(alg,bytes,n) {
  if(alg==="shake256")return crypto.createHash(alg,{outputLength:n})
    .update(bytes).digest();
  return crypto.createHash(alg).update(bytes).digest().subarray(0,n);
}

/** @param {Buffer} whole @param {number} size */
function blocks(whole,size) {
  assert.equal(whole.length%size,0);
  return Array.from({length:whole.length/size},(_,i)=>
    whole.subarray(i*size,(i+1)*size));
}

/** A fixed source layout (no cyclic offsets or fitted rune alphabets). */
function run() {
  const results=[];
  let comparisonCount=0;
  let digestMatchCount=0;
  let targetHashCount=0;
  let targetMatches=0;
  for(const [source,bytes] of Object.entries(variants)) {
    const all=[["chronological",bytes]];
    if(bytes.length===256) {
      all.push(["gridTranspose",Buffer.from(Array.from({length:256},(_,i)=>
        bytes[(i%32)*8+Math.floor(i/32)]))]);
    }
    for(const [layout,full] of all) {
      for(const alg of ["sha512","sha3-512","blake2b512","shake256"]) {
        const hex=digest(alg,full,64).toString("hex");
        targetHashCount++;
        if(hex===target){targetMatches++;results.push({source,layout,alg,target:true});}
      }
      if(full.length!==256)continue;
      for(const direction of ["forward","reverse"]) {
        const eventsInOrder=direction==="forward"?full:Buffer.from(full).reverse();
        const source32=blocks(eventsInOrder,32);
        for(const alg of ["sha256","sha3-256","blake2s256"]) {
          const keyed=source32.map(bytes=>digest(alg,bytes,32));
          for(const [gridLayout,table] of Object.entries(gridViews)) {
            for(const reverseGrid of [false,true]) {
              const outputs=table.map(b=>reverseGrid?Buffer.from(b).reverse():b);
              let fixedMatches=0,anyMatches=0;
              for(let i=0;i<8;i++)for(let j=0;j<8;j++) {
                const equal=keyed[i].equals(outputs[j]);
                comparisonCount++;
                if(equal){anyMatches++;if(i===j)fixedMatches++;}
              }
              if(anyMatches) {
                digestMatchCount+=anyMatches;
                results.push({source,layout,direction,alg,gridLayout,
                  reverseGrid,fixedMatches,anyMatches});
              }
            }
          }
        }
      }
    }
  }
  // Positive: substitute known-source SHA-256 output columns and recover
  // all eight exact matches without searching any unknown algorithm.
  const planted=blocks(variants.gpIndex,32)
    .map(block=>digest("sha256",block,32));
  const plantMatches=planted.reduce((n,x,i)=>
    n+Number(x.equals(planted[i])),0);
  assert.equal(plantMatches,8);
  // The printed 256-byte table is separately tested as a 64-byte digest input.
  for(const alg of ["sha512","sha3-512","blake2b512","shake256"]) {
    targetHashCount++;
    if(digest(alg,Buffer.from(flat),64).toString("hex")===target) {
      targetMatches++;
      results.push({source:"gridRaw256",alg,target:true});
    }
  }
  return {sourceEventCount:stream.length,sourceSerializations:Object.keys(variants),
    targetHashCount,targetMatches,groupDigestComparisons:comparisonCount,
    groupDigestMatches:digestMatchCount,plantedEightGroupMatches:plantMatches,
    exactOriginalMatches:results};
}

if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run};
