"use strict";
// #3146 — original 1983 ACH [2,7] code and necessary LP2 framing gates.
// https://doi.org/10.1109/TIT.1983.1056597 (Table XVI and Eq. 9.3).
const fs=require("node:fs"),path=require("node:path");
/** @param {string} transcription */
function experiment(transcription) {
  const gp=[..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"],gpidx=new Map(gp.map((x,i)=>[x,i]));
  const sections=transcription.split("%");
  const clean=s=>(s.match(/[\u16a0-\u16ff]/gu)||[]).map(x=>gpidx.get(x));
  const pages=Array.from({length:58},(_,i)=>i===50?[]:clean(sections[i<50?i:i-1]));
  function assert(v,label){if(!v)throw Error(label)}
  // Adler/Coppersmith/Hassner, 1983, Table XVI, paper p20.
  // A=0^1,B=0^2,C=1^1,D=2^2,E=2^3,F=2^4,G=4^3.
  const table={A:[["D",0,0],["F",0,0]],B:[["C",0,0],["E",0,0]],C:[["B",0,1],["A",0,1]],D:[["B",1,0],["A",1,0]],E:[["C",0,0],["C",1,0]],F:[["D",0,0],["G",0,0]],G:[["D",0,0],["C",1,0]]};
  function encode(bits){let state="B",out=[];for(const bit of bits){const [next,a,b]=table[state][bit];out.push(a,b);state=next}return {state,out}}
  // Published Eq. 9.3; decode one input bit from four consecutive output pairs.
  function decode(bits,n){let out=[];for(let i=0;i<n;i++){const [a,b,c,d,e,f,g,h]=bits.slice(i*2,i*2+8);out.push((a&&d||c&&f||b&&!f&&!h||!a&&!b&&!c&&!d||a&&!f&&!h)?1:0)}return out}
  function valid(bits){for(let i=0;i<bits.length;i++){if(bits[i]&&(bits[i-1]||bits[i-2]))return false;if(i>=7&&bits.slice(i-7,i+1).every(x=>!x))return false}return true}
  function control(input){const e=encode([...input,0,1,0,0]);assert(valid(e.out),"RLL plant");assert(e.state==="B","published reset");assert(decode(e.out,input.length).join("")===input.join(""),"published inverse");return e.out}
  for(let m=0;m<256;m++)control(Array.from({length:8},(_,i)=>(m>>(7-i))&1));
  const input=pages[57].flatMap(v=>Array.from({length:5},(_,i)=>(v>>(4-i))&1)),native=control(input);
  assert(pages[57].length===95&&native.length===958,"native PARABLE plant");
  assert(!valid([1,0,1])&&!valid(Array(8).fill(0))&&!valid([1,1]),"malformed controls");
  // Any static 29->2 class map must assign 1 only to labels without lag1/2 self
  // occurrences. Its chosen labels must be independent in the lag1/2 conflict graph
  // and meet every length-8 window. Finite exhaustive Boolean mask test if needed.
  function projection(x){
    const bad=new Set();for(let i=0;i<x.length;i++)for(const lag of [1,2])if(i>=lag&&x[i]===x[i-lag])bad.add(x[i]);
    const cand=[...new Set(x)].filter(c=>!bad.has(c)),idx=new Map(cand.map((c,i)=>[c,i]));
    const conflicts=Array(cand.length).fill(0);
    for(let i=0;i<x.length;i++)for(const lag of [1,2])if(i>=lag&&idx.has(x[i])&&idx.has(x[i-lag])){
      const a=idx.get(x[i]),b=idx.get(x[i-lag]);conflicts[a]|=1<<b;conflicts[b]|=1<<a;
    }
    const windows=[];
    for(let i=0;i+8<=x.length;i++){let m=0;for(const c of x.slice(i,i+8))if(idx.has(c))m|=1<<idx.get(c);windows.push(m)}
    const zero=windows.filter(m=>!m).length;
    if(zero)return {candidates:cand.length,impossibleWindows:zero,first:windows.indexOf(0),feasible:0};
    let independent=0,max=0,feasible=0,minMissing=Infinity;
    for(let m=0;m<2**cand.length;m++){
      let ok=true,k=0;for(let i=0;i<cand.length;i++)if(m>>i&1){k++;if(m&conflicts[i]){ok=false;break}}
      if(!ok)continue;independent++;max=Math.max(max,k);
      const missing=windows.filter(x=>!(x&m)).length;if(!missing)feasible++;minMissing=Math.min(minMissing,missing);
    }
    return {candidates:cand.length,impossibleWindows:zero,independent,max,feasible,minMissing};
  }
  assert(projection(native).feasible>=1,"all-secret projection positive");
  assert(projection(Array(8).fill(0)).feasible===0,"all-secret projection negative");
  const admissible5=Array.from({length:32},(_,m)=>Array.from({length:5},(_,i)=>(m>>(4-i))&1)).filter(valid).map(a=>a.join(""));
  assert(admissible5.length===9,"five-bit output inventory");
  const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
  const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
  const rows=chapters.map(([a,b])=>{
    const x=pages.slice(a,b+1).flat(),d=x.slice(1).map((v,i)=>(v-x[i]+29)%29);
    const repeats=[];for(let i=1;i<x.length;i++)if(x[i]===x[i-1])repeats.push(i);
    const gapGcd=repeats.slice(1).map((v,i)=>v-repeats[i]).reduce(gcd,0);
    return {range:[a,b],length:x.length,alphabet:new Set(x).size,repeats,repeatGapGcd:gapGcd,direct:projection(x),differential:projection(d)};
  });
  assert(rows.reduce((n,x)=>n+x.length,0)===12956,"original lengths");
  assert(rows.reduce((n,x)=>n+x.repeats.length,0)===86,"original repeats");
  assert(rows.every(x=>x.alphabet===29&&x.repeatGapGcd===1&&x.direct.feasible===0&&x.differential.feasible===0),"original obstructions");
  const lengthGcd=rows.map(x=>x.length).reduce(gcd),lengthDifferenceGcd=rows.slice(1).map(x=>x.length-rows[0].length).reduce(gcd,0);
  assert(lengthGcd===1&&lengthDifferenceGcd===1,"whole block frames");
  return {publishedControls:256,nativeControl:{runes:95,bits:input.length,encodedBits:native.length,exact:true},admissible5,lengthGcd,lengthDifferenceGcd,rows};
}
if(require.main===module) console.log(JSON.stringify(experiment(fs.readFileSync(path.join(__dirname,"..","resources/transcriptions/lp2-image-corrected.txt"),"utf8")),null,2));
module.exports=experiment;
