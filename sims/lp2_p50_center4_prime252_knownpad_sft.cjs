"use strict";
/**
 * Physical LP2 p49-51 32x8 table: source-center 2x2 prime-sum gate.
 * Tests one source-defined proposed 4-symbol p55 key, plus the p56
 * authenticated key as an untouched 84-symbol holdout. No solve claimed.
 *
 * Execute from repo root on Windows 11 / Node22:
 * node sims/lp2_p50_center4_prime252_knownpad_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

/** @param {string} file @returns {any} */
const read = file => JSON.parse(fs.readFileSync(path.join(__dirname, "..", file), "utf8"));
const book = read("resources/liber-primus/lp2-corpus.json");
const grid = read("resources/liber-primus/base60-grid.json");
const PRIME = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,
  67,71,73,79,83,89,97,101,103,107,109];
/** @param {number} n @returns {number} */
const mod = n => ((n % 29) + 29) % 29;
/** @param {number[]} seq @returns {number} */
const sum = seq => seq.reduce((a,b) => a+b, 0);
/** @param {number[]} x @returns {number} */
function ioc(x) {
  const h = Array(29).fill(0);
  for(const v of x) h[v]++;
  return sum(h.map(n => n*(n-1))) / (x.length*(x.length-1));
}
/** @param {number} n @returns {number[]} */
function firstPrimes(n) {
  const out = [];
  for(let x=2; out.length<n; x++) {
    let isPrime=true;
    for(let d=2; d*d<=x; d++) if(x%d===0) {isPrime=false;break;}
    if(isPrime) out.push(x);
  }
  return out;
}
/** @param {string} text @returns {number[]} */
function encodeGP(text) {
  const tokens=book.translit.map((v,i)=>({v,i})).sort((a,b)=>b.v.length-a.v.length);
  const out=[];
  for(const word of text.split(/\s+/)) {
    for(let i=0;i<word.length;) {
      const token=tokens.find(x=>word.startsWith(x.v,i));
      assert.ok(token, "Unrecognized GP spelling "+word.slice(i));
      out.push(token.i);
      i+=token.v.length;
    }
  }
  return out;
}
/** @param {number[]} plaintext @param {number[]} key @returns {number[]} */
function encTransparentF(plaintext,key) {
  let clock=0;
  return plaintext.map(p=>p===0?0:mod(p+key[clock++%key.length]));
}
/**
 * All legal inverse clocks; literal plaintext F bypasses the key, and a
 * non-F plaintext may encrypt to ciphertext F by consuming its key.
 * @param {number[]} cipher @param {number[]} key
 * @returns {{firstImpossible:number|null,survivingClocks:number}}
 */
function strictF(cipher,key) {
  let states=new Set([0]);
  for(let i=0;i<cipher.length;i++) {
    const next=new Set();
    for(const clock of states) {
      const k=key[clock%key.length];
      if(cipher[i]===0) {
        next.add(clock);
        if(k!==0)next.add(clock+1);
      } else if(cipher[i]!==k) next.add(clock+1);
    }
    if(!next.size) return {firstImpossible:i,survivingClocks:0};
    states=next;
  }
  return {firstImpossible:null,survivingClocks:states.size};
}
/** @param {number[]} x @returns {number} */
function inverse(x) {
  for(let n=1;n<29;n++)if(mod(n*x)===1)return n;
  throw Error("No GF29 inverse");
}
function run() {
  assert.equal(grid.byte_rows.length,32);
  assert.ok(grid.byte_rows.every(row=>row.length===8));
  const original=grid.byte_rows.flat();
  assert.equal(original.length,256);
  assert.equal(crypto.createHash("sha256").update(Buffer.from(original)).digest("hex"),
    "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
  const rows=grid.byte_rows;
  /** @param {number} y @param {number} x @returns {number[]} */
  const block=(y,x)=>[rows[y][x],rows[y][x+1],rows[y+1][x],rows[y+1][x+1]];
  const center=block(15,3),centerGP=center.map(v=>v%29);
  const centerPrimes=centerGP.map(i=>PRIME[i]);
  assert.deepEqual(center,[54,13,120,169]);
  assert.deepEqual(centerGP,[25,13,4,24]);
  assert.deepEqual(centerPrimes,[101,43,11,97]);
  assert.equal(sum(centerPrimes),252);
  const matchingWindows=[];
  for(let y=0;y<31;y++)for(let x=0;x<7;x++)
    if(sum(block(y,x).map(v=>PRIME[v%29]))===252)
      matchingWindows.push([y+1,x+1]);
  assert.deepEqual(matchingWindows,[[16,4]]);

  const omitted=new Set([123,124,131,132]);
  const outside=original.filter((_,i)=>!omitted.has(i)).map(mod);
  assert.equal(outside.length,252);
  assert.equal(outside.length,3*84);

  // Independent 2013 H and original p39 G quadratics: the previously
  // verified source-linked polynomial product [12,17,11,21,23].
  const factor=[12,17,11,21,23],rem=original.map(mod),quotient=[];
  for(let i=0;i<252;i++) {
    const q=mod(rem[i]*inverse(factor[0]));quotient.push(q);
    for(let j=0;j<5;j++)rem[i+j]=mod(rem[i+j]-q*factor[j]);
  }
  assert.deepEqual(rem.slice(252),[0,0,0,0]);
  const quotientToGeometricMatches=quotient
    .map((v,i)=>v===outside[i]?i:-1).filter(i=>i>=0);
  assert.deepEqual(quotientToGeometricMatches,[0,38,156,169,219]);

  const knownText="AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
  const plaintext56=encodeGP(knownText);
  const ciphertext56=book.pages.find(p=>p.page===56).indices;
  const ciphertext55=book.pages.find(p=>p.page===55).indices;
  const source57=book.pages.find(p=>p.page===57).indices;
  assert.deepEqual([ciphertext55.length,ciphertext56.length,source57.length],[76,85,95]);
  assert.equal(plaintext56.length,85);
  const fullPrimePad=firstPrimes(84).map(p=>mod(p-1));
  let clock=0;
  const replay=plaintext56.map(p=>p===0?0:mod(p+fullPrimePad[clock++]));
  assert.deepEqual(replay,ciphertext56);
  assert.equal(clock,84);

  const centerKeys=[
    {order:"row-major",indices:centerGP},
    {order:"clockwise",indices:[centerGP[0],centerGP[1],centerGP[3],centerGP[2]]}
  ];
  const p55Decodes=[];
  for(const item of centerKeys)for(const mode of ["indices","primes"]) {
    const key=mode==="indices"?item.indices:item.indices.map(i=>PRIME[i]%29);
    const f=strictF(ciphertext55,key);
    assert.equal(strictF(encTransparentF(source57.slice(0,76),key),key).firstImpossible,null);
    for(const sign of [1,-1]) {
      const decoded=ciphertext55.map((v,i)=>mod(v-sign*key[i%4]));
      assert.deepEqual(decoded.map((p,i)=>mod(p+sign*key[i%4])),ciphertext55);
      p55Decodes.push({order:item.order,mode,sign,
        ioc:Number(ioc(decoded).toFixed(9)),
        candidatePrefix:decoded.slice(0,25).map(i=>book.translit[i]).join(" "),
        FTransparentFirstImpossible:f.firstImpossible,
        FTransparentSurvivingClocks:f.survivingClocks});
    }
  }
  const expectedFailures=[null,null,3,3,null,null,69,69];
  assert.deepEqual(p55Decodes.map(x=>x.FTransparentFirstImpossible),expectedFailures);
  const knownPadMatches=[];
  for(const [layout,group] of [
    ["adjacent-triplets",j=>[outside[3*j],outside[3*j+1],outside[3*j+2]]],
    ["three-84-lanes",j=>[outside[j],outside[j+84],outside[j+168]]]]) {
    for(const [reduction,reduce] of [
      ["byte-sum",x=>mod(sum(x))],
      ["GP-prime-sum",x=>mod(sum(x.map(i=>PRIME[i])))]]) {
      const candidate=Array.from({length:84},(_,j)=>reduce(group(j)));
      const matching=candidate.map((v,i)=>v===fullPrimePad[i]?i:-1).filter(i=>i>=0);
      knownPadMatches.push({layout,reduction,matches:matching.length,matchingOffsets:matching});
    }
  }
  assert.deepEqual(knownPadMatches.map(x=>x.matches),[0,0,3,3]);
  console.log(JSON.stringify({
    interpretation:"conditional base60 central-2x2/prime-weight and p57 SHED/WITHIN clue",
    centerBytes:center,centerGP,centerPrimes,centerPrimeSum:252,
    centerOnly2x2Matching252:matchingWindows,
    centerExcisedLength:outside.length,
    H2013TimesG39QuotientLength:quotient.length,
    samePositionQuotientVsCenterExcised:quotientToGeometricMatches.length,
    authenticP56KeySymbolsConsumed:clock,originalP55IoC:ioc(ciphertext55),
    p55Decodes,knownPadMatches,recoveredUnknownPlaintext:false
  },null,2));
}
if(require.main===module)run();
module.exports={run,strictF,encTransparentF};
