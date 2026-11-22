"use strict";
/**
 * Original LP2 word-position test of all-secret zero-difference anchors.
 * Hypothetical C_i = C_(i-1) + a_i*(P_i + 1) (mod29), with ANY
 * secret nonzero a_i. Then C_i=C_(i-1) iff P_i=EA (GP0 index28).
 * Original p7 factor X^2-8 selects primitive generator8, motivating
 * the additional fully reversible a_i=8^(previous ciphertext) experiment.
 * Run on Windows 11 with Node.js22:
 * node sims/lp2_zeroanchor_root8_original_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=f=>fs.readFileSync(path.join(__dirname,"..",f),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const index=new Map(gp.runes.map((r,i)=>[r,i]));
/** @param {string} ch @returns {number} */
function rune(ch){const i=index.get(ch);assert.notEqual(i,undefined);return i;}
/** @param {string} s @returns {number[][]} */
function words(s){return (s.match(/[\u16A0-\u16FF]+/gu)||[]).map(w=>[...w].map(rune));}
const originalWords=read("resources/liber-primus/lp2-transcription.txt")
  .replace(/[\/\n\r%&$\s]/g,"").split(/[-.]/)
  .filter(s=>/[\u16A0-\u16FF]/u.test(s)).slice(0,2896)
  .map(s=>[...s].map(rune));
const known=solved.sections.flatMap(s=>words(s.source_text));
const original=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(originalWords.length,2896);
assert.equal(known.length,740);
assert.equal(known.flat().length,2979);
assert.equal(original.length,12956);
assert.deepEqual(originalWords.flat(),original);
assert.equal(gp.translit[28],"EA");
const hist=Array(15).fill(0);
let prev=null,inside=0,start=0,hasEvent=0,multiple=0;
for(const w of originalWords){
  let count=0;
  for(let j=0;j<w.length;j++){
    const repeated=j===0?(prev!==null&&prev===w[0]):w[j]===w[j-1];
    if(repeated){hist[j]++;count++;if(j===0)start++;else inside++;}
  }
  if(count)hasEvent++;
  if(count>1)multiple++;
  prev=w.at(-1);
}
assert.deepEqual([inside,start,hasEvent,multiple,hist[0],hist[1],hist[2]],
  [63,23,85,1,23,12,21]);
assert.equal(known.flat().filter(x=>x===28).length,20);

/**
 * Exact word-length-matched independent-donor Poisson-binomial lower tail.
 * For each of the original 2896 word slots sample one authentic donor word
 * of the identical length; calculate EA at within-word index1.
 * @param {number[][]} donor @returns {{mean:number,p:number}}
 */
function nullAtSecondRune(donor){
  const pools=new Map();
  for(const w of donor){if(!pools.has(w.length))pools.set(w.length,[]);
    pools.get(w.length).push(w);}
  const counts=new Map();
  for(const w of originalWords)counts.set(w.length,(counts.get(w.length)||0)+1);
  const cutoff=hist[1],dp=Array(cutoff+1).fill(0);dp[0]=1;
  let mean=0;
  for(const [len,n] of counts){
    const pool=pools.get(len);
    assert.ok(pool&&pool.length,"missing donor length "+len);
    if(len<=1)continue;
    const p=pool.filter(w=>w[1]===28).length/pool.length;
    mean+=n*p;
    for(let k=0;k<n;k++)
      for(let j=cutoff;j>=0;j--)
        dp[j]=dp[j]*(1-p)+(j?dp[j-1]*p:0);
  }
  return {mean,p:dp.reduce((s,v)=>s+v,0)};
}
const solvedControl=nullAtSecondRune(known);
assert.ok(Math.abs(solvedControl.mean-52.19610194011159)<1e-9);
assert.ok(Math.abs(solvedControl.p/1.468071636745234e-11-1)<1e-8);

/** @param {string} s @returns {number[][]} */
function latin(s){
  const pairs=["ING","TH","NG","EO","OE","AE","IA","EA"];
  const lookup=new Map(gp.translit.map((x,i)=>[x,i]));
  return (s.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>{
    const out=[];
    for(let j=0;j<w.length;){
      const found=pairs.find(p=>w.startsWith(p,j));
      let x=found||w[j];j+=found?found.length:1;
      if(x==="ING")x="NG";
      if(x==="K"||x==="Q")x="C";
      if(x==="V")x="U";
      if(x==="Z")x="S";
      assert.ok(lookup.has(x));
      out.push(lookup.get(x));
    }
    return out;
  });
}
const donors=[
  ["Gibran","resources/control/gibran_prophet_58585.txt",59.851550634853695,3.073343036057659e-14],
  ["Emerson","resources/control/emerson_essays_2944.txt",49.31834797500176,1.5049136171492517e-10],
  ["Shakespeare","resources/control/shakespeare_first300k.txt",56.888981562179154,3.361102100865871e-13]
];
const independent=donors.map(([name,file,mean,p])=>{
  const result=nullAtSecondRune(latin(read(file)));
  assert.ok(Math.abs(result.mean-mean)<1e-9);
  assert.ok(Math.abs(result.p/p-1)<1e-8);
  return {name,...result};
});
const mod=x=>((x%29)+29)%29;
const pow=Array(28).fill(0);pow[0]=1;
for(let k=1;k<28;k++)pow[k]=pow[k-1]*8%29;
assert.equal(new Set(pow).size,28);
assert.equal(pow[27]*8%29,1);
const invert=pow.map(a=>{for(let b=1;b<29;b++)if(a*b%29===1)return b;
  throw Error("nonunit");});
/** @param {number[]} c @param {number} sign @returns {number[]} */
function decode(c,sign){
  let prev=0;
  return c.map(x=>{
    const exponent=((sign*prev)%28+28)%28;
    const p=mod(28+invert[exponent]*mod(x-prev));
    prev=x;
    return p;
  });
}
/** @param {number[]} p @param {number} sign @returns {number[]} */
function encode(p,sign){
  let prev=0;
  return p.map(x=>{
    const exponent=((sign*prev)%28+28)%28;
    prev=mod(prev+pow[exponent]*(x+1));
    return prev;
  });
}
/** @param {number[]} x @returns {number} */
function ioc(x){
  const h=Array(29).fill(0);
  for(const v of x)h[v]++;
  return h.reduce((s,v)=>s+v*(v-1),0)/(x.length*(x.length-1));
}
const knownP57=gp.pages.find(p=>p.page===57).indices;
assert.equal(knownP57.length,95);
const direct=[-1,1].map(sign=>{
  const p=decode(original,sign);
  assert.deepEqual(encode(p,sign),original);
  assert.equal(p.filter(x=>x===28).length,86);
  assert.deepEqual(decode(encode(knownP57,sign),sign),knownP57);
  return {sign,fullIoC:ioc(p),first60: p.slice(0,60).map(i=>gp.translit[i]).join(" ")};
});
assert.ok(Math.abs(direct[0].fullIoC-0.0352993696922005)<1e-12);
assert.ok(Math.abs(direct[1].fullIoC-0.035293554802770986)<1e-12);
console.log(JSON.stringify({
  source:{unknownRunes:original.length,wholeWords:originalWords.length,
    repeats:inside+start,inside,start,hist,hasEvent,multiple},
  native:{sourceWords:known.length,sourceRunes:known.flat().length,EA:20},
  universalInvariant:"Any nonzero A_i forces repeat(C) iff plaintext EA",
  exactNativeNull:solvedControl, independent,
  sourceRoot8:{order:28,direct,positive:"solved p57 95/95"},
  classification:"EA marginal frequency matches, word-position signature does not; no unknown plaintext"
},null,2));
console.log("PASS source-original zero-anchor gate and root8 positive plants");
