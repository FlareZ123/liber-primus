"use strict";
/**
 * Test the original LP2 p50 252-coefficient GF(29) quotient as nine
 * repeating 28-symbol keys, one for each original LP2 body.
 * Source-key proposal is exploratory, not an authenticated instruction.
 * Node.js 22. GP28 marks equal neighboring ciphertext runes as EA.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const corpus=read("resources/liber-primus/lp2-corpus.json");
const grid=read("resources/liber-primus/base60-grid.json");
const ciphertext=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
const bytes=grid.byte_rows.flat();
const control=corpus.pages[57].indices;
const starts=[0,729,1874,3612,5506,6527,7960,8051,9640,12956];
const mod=(x,m)=>(x%m+m)%m;
assert.equal(ciphertext.length,12956);
assert.equal(bytes.length,256);
assert.equal(control.length,95);

/** @param {number[]} coefficients High-degree first.
 *  @param {number[]} divisor Low-degree first.
 *  @returns {number[]} High-degree-first quotient. */
function divide(coefficients,divisor){
  const w=coefficients.map(x=>mod(x,29)).reverse();
  const q=Array(w.length-divisor.length+1).fill(0);
  const inv=Array.from({length:28},(_,i)=>i+1)
    .find(x=>x*divisor.at(-1)%29===1);
  assert.ok(inv!==undefined);
  for(let i=q.length-1;i>=0;i--){
    const v=w[i+divisor.length-1]*inv%29;
    q[i]=v;
    for(let j=0;j<divisor.length;j++)
      w[i+j]=mod(w[i+j]-v*divisor[j],29);
  }
  assert.ok(w.slice(0,divisor.length-1).every(x=>x===0));
  return q.reverse();
}
const key252=divide(divide(bytes,[3,26,24]),[27,5,15]);
assert.equal(key252.length,252);
assert.deepEqual(key252.slice(0,8),[0,12,9,28,2,25,23,21]);

/** @param {number[]} v @returns {number} */
function ioc(v){
  const f=Array(29).fill(0);
  v.forEach(x=>{assert.ok(Number.isInteger(x)&&x>=0&&x<29);f[x]++});
  return f.reduce((s,n)=>s+n*(n-1),0)/(v.length*(v.length-1));
}
/** @param {number[]} c @param {number[]} k
 *  @param {"direct29"|"rank28"} mode @param {-1|1} sign */
function decrypt(c,k,mode,sign){
  return c.map((x,i)=>{
    const shift=k[i%28];
    if(mode==="direct29"||i===0)return mod(x+sign*shift,29);
    if(x===c[i-1])return 28;
    return mod(mod(x-c[i-1],29)-1+sign*(shift%28),28);
  });
}
/** @param {number[]} p @param {number[]} k
 *  @param {"direct29"|"rank28"} mode @param {-1|1} sign */
function encrypt(p,k,mode,sign){
  const out=[];
  for(let i=0;i<p.length;i++){
    const shift=k[i%28];
    if(mode==="direct29"||i===0)out.push(mod(p[i]-sign*shift,29));
    else if(p[i]===28)out.push(out[i-1]);
    else out.push(mod(out[i-1]+1+mod(p[i]-sign*(shift%28),28),29));
  }
  return out;
}
const results=[];
for(const mode of ["direct29","rank28"])for(const sign of [-1,1]){
  const outputs=[];
  for(let body=0;body<9;body++){
    const src=ciphertext.slice(starts[body],starts[body+1]);
    const key=key252.slice(28*body,28*body+28);
    const decoded=decrypt(src,key,mode,sign);
    assert.deepEqual(encrypt(decoded,key,mode,sign),src);
    outputs.push(decoded);
    const known=Array.from({length:src.length},(_,i)=>
      i>0&&i%97===0?28:control[i%control.length]);
    const encrypted=encrypt(known,key,mode,sign);
    assert.deepEqual(decrypt(encrypted,key,mode,sign),known);
  }
  const all=outputs.flat();
  assert.equal(all.length,12956);
  const score=ioc(all);
  assert.ok(score<0.04);
  results.push({
    mode,sign,IoC:Number(score.toFixed(9)),
    bodyIoC:outputs.map(x=>Number(ioc(x).toFixed(7))),
    head:all.slice(0,45).map(i=>corpus.translit[i]).join("")
  });
}
assert.equal(results[0].IoC,0.034490063);
assert.equal(results[1].IoC,0.034458487);
console.log(JSON.stringify({
  source:"256 p50 bytes -> exact H2013,Gp39 quotient -> 9x28 keys",
  ciphertextLength:ciphertext.length,
  quotientLength:key252.length,
  originalIoC:ioc(ciphertext),solvedP57IoC:ioc(control),
  originalBodyLengths:starts.slice(1).map((x,i)=>x-starts[i]),
  fourSourceKeyDecoderResults:results,
  plantedKnownGpSymbolsRecoveredPerMode:12956
},null,2));
