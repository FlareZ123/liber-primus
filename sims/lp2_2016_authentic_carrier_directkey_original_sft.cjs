"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p));
const book = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const p0 = book.pages.find(p => p.page === 0).indices;
const cipher = book.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const p13 = [18,13,10,13,8,24,9,26,15,18,18,5,15];
const p22 = p13.concat([2,18,23,18,1,3,16,18,23]);
const specs = [
  {id:"2016 signed-message carrier JPEG",path:"resources/historical/cicada2016-4gq25.jpg",
    length:26342,hash:"a8340ad04b83fb3130e7ed9172867a440812e87089d6aa2b932d97c6ae38aebe"},
  {id:"2016 verified OutGuess PGP output",path:"resources/historical/cicada2016-4gq25-outguess.asc",
    length:1136,hash:"fe89e77519dfaca998a257ed39c2861303029de2a49183db00eea0fda3a28010"}
];
const mod = x => (x % 29 + 29) % 29;
const reduce = (b,projection) => projection === "mod29" ? b % 29 : Math.floor(29 * b / 256);

/**
 * Search all original byte offsets, including cyclic wrap, never fit offset
 * to the intended plaintext. A true direct key must match every cipher rune.
 * @param {Buffer} bytes @param {number[]} plain @param {number[]} actual
 * @param {"mod29"|"scale29"} projection
 * @param {"minus"|"plus"} sign
 * @param {boolean} reverse
 */
function scan(bytes, plain, actual, projection, sign, reverse) {
  const expected = actual.map((c,i)=>mod(sign === "minus" ? c-plain[i] : plain[i]-c));
  let best=-1,ties=0,first=[];
  for(let s=0;s<bytes.length;s++){
    let count=0;
    for(let i=0;i<expected.length;i++){
      const pos=(s+(reverse?-i:i)+bytes.length)%bytes.length;
      if(reduce(bytes[pos],projection)===expected[i]) count++;
    }
    if(count>best){best=count;ties=1;first=[s];}
    else if(count===best){ties++;if(first.length<4)first.push(s);}
  }
  return {best,ties,first};
}

/** @param {number[]} xs */
function ioc(xs) {
  const f=Array(29).fill(0);
  for(const x of xs) f[x]++;
  return f.reduce((s,n)=>s+n*(n-1),0)/(xs.length*(xs.length-1));
}

function main() {
  assert.equal(p0.length,262);
  assert.deepEqual(p0.slice(0,13),[15,8,18,3,6,19,27,0,15,26,18,21,5]);
  assert.equal(cipher.length,12956);
  assert.equal(p0[7],0); // F contradicts hypothetical p0 plaintext Y
  assert.equal(p13[7],26);
  const cases=[];
  for(const source of specs){
    const bytes=read(source.path);
    assert.equal(bytes.length,source.length);
    assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"),source.hash);
    if(source.id.includes("JPEG")) assert.deepEqual([...bytes.subarray(0,4)],[255,216,255,224]);
    else {
      assert(bytes.toString().includes("BEGIN PGP SIGNED MESSAGE"));
      assert.match(bytes.toString(),/epiphany seeks the devoted/i);
    }
    for(const projection of ["mod29","scale29"]){
      for(const sign of ["minus","plus"]){
        for(const reverse of [false,true]){
          const red13=scan(bytes,p13,p0.slice(0,13),projection,sign,reverse);
          const extended22=scan(bytes,p22,p0.slice(0,22),projection,sign,reverse);
          assert(red13.best<=6);
          assert(extended22.best<=7);
          // Positive original-source cipher plant: every branch must recover
          // the source-typed OutGuess seed 230 with complete 22-rune agreement.
          const plant=p22.map((p,i)=>{
            const pos=(230+(reverse?-i:i)+bytes.length)%bytes.length;
            const k=reduce(bytes[pos],projection);
            return mod(sign==="minus"?p+k:p-k);
          });
          const found=scan(bytes,p22,plant,projection,sign,reverse);
          assert.equal(found.best,22);
          assert(found.first.includes(230));
          let offset=230;
          const decoded=cipher.map(c=>{
            const k=reduce(bytes[offset++%bytes.length],projection);
            return mod(sign==="minus"?c-k:c+k);
          });
          const fullBookIoC=ioc(decoded);
          assert(fullBookIoC<0.04);
          cases.push({
            source:source.id,sourceBytes:bytes.length,projection,sign,reverse,
            red13,extended22,fullBookIoC,positive:found.best
          });
        }
      }
    }
  }
  assert.equal(cases.length,16);
  console.log(JSON.stringify({
    originalRunes:cipher.length,originalIoC:ioc(cipher),
    conditionalCribs:"signed 2016 EPIPHANY SEEKS / EPIPHANY SEEKS THE DEVOTED",
    originalP0FBypassConflict:"original rune at offset7 is F=0, hypothetical plaintext is Y=26",
    originalBytePositions:cases.reduce((sum,x)=>sum+2*x.sourceBytes,0),
    positivePlants:cases.filter(x=>x.positive===22).length,
    bestOriginal13:Math.max(...cases.map(x=>x.red13.best)),
    bestOriginal22:Math.max(...cases.map(x=>x.extended22.best)),
    cases,
    decision:"No direct literal 2016 carrier/extraction byte-key GP29 source gives the signed-crib plaintext. Source seed230 yields random-like full-book output; other KDFs and F rules remain untested."
  },null,2));
}
if(require.main===module)main();
module.exports={main,scan};
