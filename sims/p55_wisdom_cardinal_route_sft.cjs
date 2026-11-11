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
/**
 * Canonical continuous LP2 word parser. Page and visual line boundaries
 * retain the current word, while explicit punctuation terminates it.
 * Read the first 55 rune-bearing source pages (physical 50 is runeless).
 */
function allOriginalWordSums() {
  const raw = fs.readFileSync(path.join(root, "resources/lp2-transcription.txt"), "utf8");
  const gp = new Map(corpus.runes.map((rune, i) => [rune, corpus.prime[i]]));
  const perPage = Array.from({length:55}, () => []);
  const words = [];
  let page = 0, sum = 0, length = 0, startingPage = 0;
  function finish() {
    if(!length) return;
    perPage[startingPage].push(sum);
    words.push({page:startingPage,sum,length});
    length=0;
    sum=0;
  }
  for(const char of raw.split("%").slice(0,55).join("%")) {
    if(gp.has(char)) {
      if(!length) startingPage=page;
      sum+=gp.get(char);
      length++;
    } else if(char==="%") page++;
    else if(char==="/" || /\s/u.test(char)) { /* physical line, no word break */ }
    else finish();
  }
  finish();
  assert.equal(words.length, 2896);
  assert.equal(words.reduce((a,b)=>a+b.length,0), 12956);
  return {perPage,words};
}
/** @param {number[][]} square */
function edgeDictionary(square) {
  const edges = new Map();
  const n=square.length;
  for(let r=0;r<n;r++) for(let c=0;c<n;c++) {
    for(const [gp,[dr,dc,direction]] of steps) {
      const rr=r+dr,cc=c+dc;
      if(rr<0||rr>=n||cc<0||cc>=n) continue;
      edges.set(square[r][c]+","+gp+","+square[rr][cc],{from:[r,c],to:[rr,cc],direction});
    }
  }
  return edges;
}
/**
 * Search all 2,896 canonical original words, then shuffle word order
 * *within each source page*, preserving the page's complete word totals.
 */
function globalSourceCensus(square,other5,seven) {
  const {perPage,words}=allOriginalWordSums();
  const edges=edgeDictionary(square);
  const sums=words.map(w=>w.sum);
  const rawHit=findRoutes(sums,square);
  assert.deepEqual(rawHit.map(h=>h.word),[1962,2888]);
  assert.deepEqual(rawHit.map(h=>h.values),[[320,386,130],[138,108,341]]);
  assert.equal(findRoutes(sums,other5).length,0);
  assert.equal(findRoutes(sums,seven).length,0);
  assert.deepEqual(sums.slice(1960,1965),[149,79,320,386,130]);
  assert.equal(words[1960].page,36);
  let adjacent14979=0;
  for(let i=0;i+1<sums.length;i++) if(sums[i]===149&&sums[i+1]===79) adjacent14979++;
  assert.equal(adjacent14979,1);

  const phiCache=new Map();
  for(const value of sums) phiCache.set(value,phi(value)%29);
  function count(arr) {
    let n=0,intoMiddle=0;
    for(let i=0;i+2<arr.length;i++) {
      const edge=edges.get(arr[i]+","+phiCache.get(arr[i+1])+","+arr[i+2]);
      if(edge) {
        n++;
        intoMiddle+=Number(edge.to[1]===2);
      }
    }
    return {n,intoMiddle};
  }
  const trials=40000,next=rng(0x33013655);
  let anyTwo=0,twoMiddle=0,bothPages=0,total=0;
  for(let t=0;t<trials;t++) {
    let n=0,middle=0,p36=0,p55=0;
    for(let page=0;page<perPage.length;page++) {
      const sample=count(permute(perPage[page],next));
      n+=sample.n;
      middle+=sample.intoMiddle;
      if(page===36) p36=sample.n;
      if(page===54) p55=sample.n;
    }
    total+=n;
    anyTwo+=Number(n>=2);
    twoMiddle+=Number(middle>=2);
    bothPages+=Number(p36>=1&&p55>=1);
  }
  return {
    originalBookWords:words.length,
    originalBookRunes:words.reduce((a,b)=>a+b.length,0),
    immediatelyPrecedingP36Route:{globalWord:1960,wordSums:[149,79],pairOccurrencesInBook:adjacent14979},
    originalRoutes:rawHit.map(h=>({...h,physicalPage:words[h.word].page>=50?words[h.word].page+1:words[h.word].page})),
    wrongSourceBookHits:{other5:0,seven:0},
    pageWordOrderShuffles:{
      seed:"0x33013655",trials,meanTotalRoutes:total/trials,
      atLeastTwo:{hits:anyTwo,addOneP:(anyTwo+1)/(trials+1)},
      atLeastTwoIntoMiddleColumn:{hits:twoMiddle,addOneP:(twoMiddle+1)/(trials+1)},
      routesOnBothOriginalPages:{hits:bothPages,addOneP:(bothPages+1)/(trials+1)}
    }
  };
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
  const phiLetters=[130,341,91].map(value=>corpus.translit[phi(value)%29]);
  assert.deepEqual(phiLetters,["M","I","X"]);
  assert.equal(["M","I","X"].reduce((n,label)=>n+corpus.prime[corpus.translit.indexOf(label)],0),149);
  assert.equal(corpus.prime[corpus.translit.indexOf("NG")],79);
  const p36=corpus.pages.find(p=>p.page===36).indices;
  const mixingGP=["M","I","X","NG"].map(label=>corpus.translit.indexOf(label));
  const mixingInverse=indices=>indices.map((value,i)=>(value-mixingGP[i%4]+29)%29);
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
    nestedSourceWordCandidate:{
      sourceValuesInPhysicalPageOrderThenCenter:[130,341,91],
      totientMod29GP:phiLetters,
      word:"MIX",
      wordGPPrimeSum:149,
      followingSingleRune:"NG",
      combinedGPPrimeSumOfMixIng:228,
      note:"Original p36 two complete printed words immediately before its route have sums 149,79 but 3+3 ciphertext runes, so MIXING is conditional word-sum interpretation.",
      directHistoricalVigenereChecks:{
        MIX:{p36IoC:ioc(decipher(p36,"MIX")),p55IoC:ioc(decipher(page.indices,"MIX"))},
        MIXING:{gpKey:mixingGP,p36IoC:ioc(mixingInverse(p36)),p55IoC:ioc(mixingInverse(page.indices))}
      }
    },
    fullOriginalBookCensus:globalSourceCensus(wisdom,other5,seven),
    oneSourceKeyInverse:{key:"CABAL",full76IoC:ioc(cabAll),
      fullPrefix:native(cabAll.slice(0,35)),tail21IoC:ioc(cabTail),tail:native(cabTail)},
    oneInwardColumnKeyInverse:{
      speculativeKey:"CABALUOIDFORM",sourceRuneLength:13,
      physicalP55IoC:ioc(decipher(page.indices,"CABALUOIDFORM")),
      physicalP36IoC:ioc(decipher(corpus.pages.find(p=>p.page===36).indices,"CABALUOIDFORM")),
      physicalP55Prefix:native(decipher(page.indices,"CABALUOIDFORM").slice(0,36)),
      physicalP36Prefix:native(decipher(corpus.pages.find(p=>p.page===36).indices,"CABALUOIDFORM").slice(0,36))
    }
  };
}
if(require.main===module) console.log(JSON.stringify(run(),null,2));
module.exports={phi,sumWords,findRoutes,run};
