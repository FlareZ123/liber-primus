"use strict";
/**
 * Physical p55 word-sum -> 2013 Wisdom 5x5 west-edge SFT.
 * The candidate address operation is interpretive, not historically authenticated.
 * Input is the repository's original GP ciphertext and 2014 archived square.
 * Run: node sims/p55_wisdom_cardinal_route_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const matrices = fs.readFileSync(path.join(root, "resources/cicada2014-openpuff-magic-squares.txt"), "utf8")
  .trim().split(/\r?\n\s*\r?\n/).map(block => block.trim().split(/\r?\n/)
    .map(line => line.trim().split(/\s+/).map(Number)));
const original = fs.readFileSync(path.join(root, "resources/external/2013-0-wisdom.txt"), "utf8");
assert.ok(original.includes("ᚳᚪᛒᚪᛚ"), "2013 source word CABAL");
const page = corpus.pages.find(record => record.page === 55);
const lengths = [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.equal(page.indices.length, 76);
assert.equal(lengths.reduce((a,b)=>a+b,0), 76);
assert.deepEqual(matrices.map(m=>m.length), [5,7,5]);

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
/** @param {number[]} arr @returns {number[]} */
function sumWords(arr) {
  const result=[];
  let pos=0;
  for(const n of lengths) {
    result.push(arr.slice(pos,pos+n).reduce((a,b)=>a+b,0));
    pos+=n;
  }
  return result;
}
const steps=new Map([[7,[0,-1,"W"]],[18,[0,1,"E"]],[9,[-1,0,"N"]],[15,[1,0,"S"]]]);
/** @param {number[]} sums @param {number[][]} square */
function findRoutes(sums,square) {
  const matches=[];
  for(let i=0;i+2<sums.length;i++) {
    const step=steps.get(phi(sums[i+1])%29);
    if(!step) continue;
    for(let r=0;r<square.length;r++) for(let c=0;c<square.length;c++) {
      const toR=r+step[0],toC=c+step[1];
      if(toR<0||toR>=square.length||toC<0||toC>=square.length) continue;
      if(square[r][c]===sums[i]&&square[toR][toC]===sums[i+2]) {
        matches.push({word:i,from:[r,c],to:[toR,toC],values:sums.slice(i,i+3),direction:step[2]});
      }
    }
  }
  return matches;
}
/** @param {number} seed */
function rng(seed) {
  let v=seed>>>0;
  return ()=>{v^=v<<13;v^=v>>>17;v^=v<<5;return v>>>0;};
}
/** @param {number[]} arr @param {()=>number} next */
function permute(arr,next) {
  const copy=arr.slice();
  for(let i=copy.length-1;i>0;i--) {
    const j=next()%(i+1);
    [copy[i],copy[j]]=[copy[j],copy[i]];
  }
  return copy;
}
/** @param {number[]} vals */
function ioc(vals) {
  let matches=0;
  for(let i=0;i<vals.length;i++) for(let j=i+1;j<vals.length;j++) {
    if(vals[i]===vals[j]) matches++;
  }
  return matches/(vals.length*(vals.length-1)/2);
}
/** @param {number[]} cipher @param {string} word */
function decipher(cipher,word) {
  const key=Array.from(word,letter=>corpus.translit.indexOf(letter));
  assert.ok(key.every(x=>x>=0));
  return cipher.map((c,i)=>(c-key[i%key.length]+29)%29);
}
function run() {
  const wisdom=matrices[2],other5=matrices[0],seven=matrices[1];
  const weights=page.indices.map(i=>corpus.prime[i]);
  const sums=sumWords(weights),hit=findRoutes(sums,wisdom);
  assert.deepEqual(sums.slice(9,12),[138,108,341]);
  assert.equal(phi(108),36);
  assert.equal(corpus.translit[7],"W");
  assert.deepEqual(hit,[{
    word:9,from:[4,3],to:[4,2],values:[138,108,341],direction:"W"
  }]);
  assert.equal(wisdom[0][2],341);
  assert.equal(wisdom[4][2],341);
  assert.equal(findRoutes(sums,other5).length,0);
  assert.equal(findRoutes(sums,seven).length,0);
  const ring=wisdom.flatMap((row,r)=>row.filter((_,c)=>r===0||r===4||c===0||c===4));
  assert.equal(ring.length,16);
  assert.equal(new Set(ring).size,8);
  assert.equal(wisdom[2][2],91);
  const next=rng(0x330105),samples=120000;
  let orderHits=0,runeHits=0,other5Hits=0,sevenHits=0;
  for(let t=0;t<samples;t++) {
    orderHits+=Number(findRoutes(permute(sums,next),wisdom).length>0);
    const randomSums=sumWords(permute(weights,next));
    runeHits+=Number(findRoutes(randomSums,wisdom).length>0);
    other5Hits+=Number(findRoutes(randomSums,other5).length>0);
    sevenHits+=Number(findRoutes(randomSums,seven).length>0);
  }
  const tail=page.indices.slice(55),cabAll=decipher(page.indices,"CABAL"),cabTail=decipher(tail,"CABAL");
  const native=seq=>seq.map(i=>corpus.translit[i]).join("");
  return {
    interpretation:"conditional p55 direction-to-2013-Wisdom word, no plaintext/key",
    originalWordSums:sums,
    originalRoutes:hit,
    originalRing:{count:ring.length,unique:new Set(ring).size,center:wisdom[2][2]},
    wrongSourceRoutes:{other5:findRoutes(sums,other5),seven:findRoutes(sums,seven)},
    nulls:{seed:"0x330105",samples,
      fixedWordOrder:{hits:orderHits,addOneP:(1+orderHits)/(1+samples)},
      originalRuneInventory:{hits:runeHits,addOneP:(1+runeHits)/(1+samples)},
      wrong5x5:{hits:other5Hits},wrong7x7:{hits:sevenHits}},
    destination:{bottom:"CABAL",topMirror:"SHADOWS"},
    oneSourceKeyInverse:{key:"CABAL",full76IoC:ioc(cabAll),
      fullPrefix:native(cabAll.slice(0,35)),tail21IoC:ioc(cabTail),tail:native(cabTail)}
  };
}
if(require.main===module) console.log(JSON.stringify(run(),null,2));
module.exports={phi,sumWords,findRoutes,run};
