"use strict";

/** Four-cipher-rune to two-plaintext-rune all-codebook source gate.
 * Windows 11, Node.js 22, CommonJS. SFT:
 * node sims/lp2_p15_rank2_half_rate_codebook_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = p => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const mod = n => ((n % 29) + 29) % 29;
const M = [[10,3,20,22],[1,22,21,25],[11,17,19,7],[8,12,12,22]];
const A = M.map((row,i) => row.map((v,j) => mod(v - (i===j ? 24 : 0))));
const multiply = (X,Y) => X.map(row => Y[0].map((_,j) =>
  mod(row.reduce((s,v,k) => s+v*Y[k][j], 0))));
const Q = multiply(A,A).map(row => row.map(x => mod(15*x)));
assert.deepEqual(Q, [
  [22,17,17,4],[19,13,14,20],[19,28,24,19],[8,3,19,21]
]);
assert.equal(mod(22*13 - 17*19), 21);
const project = x => Q.slice(0,2).map(row =>
  mod(row.reduce((s,v,k) => s+v*x[k], 0)));
const pairs = (symbols, phase=0, limit=Infinity) => {
  const out=[];
  for(let i=phase; i+3<symbols.length && out.length<limit; i+=4)
    out.push(project(symbols.slice(i,i+4)));
  return out;
};
const collisions = arr => {
  const bins=new Uint16Array(841);
  for(const [a,b] of arr)bins[a*29+b]++;
  let n=0;for(const c of bins)n+=c*(c-1)/2;
  return n;
};
const translit=corpus.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
function encodeNative(text) {
  const out=[];
  const t=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  for(const word of t.match(/[A-Z]+/g)||[])
    for(let k=0;k<word.length;){
      if(word.startsWith("ING",k)){out.push(21);k+=3;}
      else if(word.startsWith("IO",k)){out.push(27);k+=2;}
      else {
        const token=translit.find(x=>word.startsWith(x.s,k));
        assert(token,"Missing GP token at "+word+":"+k);
        out.push(token.i);k+=token.s.length;
      }
    }
  return out;
}
assert.deepEqual(encodeNative("TUNNELING"),[16,1,9,9,18,20,21]);
const controls=[
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"]
].map(([name,p])=>({name, data:encodeNative(read(p))}));
const range=(data,n)=>{
  const vals=[];
  assert(data.length>=2*n);
  for(let k=0;k<600;k++){
    const start=Math.floor((data.length-2*n)*k/599);
    const p=Array.from({length:n},(_,i)=>[data[start+2*i],data[start+2*i+1]]);
    vals.push(collisions(p));
  }
  vals.sort((a,b)=>a-b);
  return {min:vals[0],median:vals[300],max:vals[599]};
};
const book=corpus.pages.filter(p=>p.page<56 && p.indices.length);
const sections=[[16,22],[40,53]].map(([lo,hi])=>({
  name:`pp${lo}-${hi}`,
  data:book.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices)
}));
const results=sections.map(({name,data})=>{
  const n=pairs(data).length;
  const original=[0,1,2,3].map(phase=>collisions(pairs(data,phase)));
  const references=controls.map(({name,data})=>({
    name,...range(data,n)
  }));
  assert(original.every(x=>references.every(ref=>x<ref.min)));
  return {name,runes:data.length,pairs:n,original,controls:references};
});
const lp1=read("resources/transcriptions/lp1_wulfic_canonical.txt");
const begin=lp1.indexOf("ᚦᛖ-ᛚᚩᛋᛋ");
const end=lp1.indexOf("ᚪ-ᛋᚹᚪᛁ",begin);
assert(begin>=0&&end>begin);
const alphabet=new Map(corpus.runes.map((r,i)=>[r,i]));
const plain=[...lp1.slice(begin,end)]
  .filter(ch=>alphabet.has(ch)).map(ch=>alphabet.get(ch));
assert.equal(plain.length,755);
const n=Math.floor(plain.length/2);
const sourcePairs=Array.from({length:n},(_,i)=>[plain[2*i],plain[2*i+1]]);
assert.equal(collisions(sourcePairs),451);
for(const {data} of sections)for(let phase=0;phase<4;phase++)
  assert(collisions(pairs(data,phase,n))<451);
let seed=0xA37D;
const rand29=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%29;};
const planted=[];
for(const [p0,p1] of sourcePairs){
  const x2=rand29(),x3=rand29();
  const b0=mod(p0-17*x2-4*x3),b1=mod(p1-14*x2-20*x3);
  const x0=mod(18*(13*b0-17*b1));
  const x1=mod(18*(-19*b0+22*b1));
  planted.push(x0,x1,x2,x3);
}
assert.deepEqual(pairs(planted),sourcePairs);
console.log(JSON.stringify({
  sourceMatrix:M, projection:Q,
  results,printedClearLP1:{runes:755,pairs:n,collisions:451},
  changingKernelPositivePlant:{cipherRunes:planted.length,
    recoveredPlainRunes:2*n,exact:true}
},null,2));
