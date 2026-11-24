'use strict';
/**
 * Agent25: repeat-delimited variable-length radix GP29 original-tape test.
 * Run from any directory: node sims/lp2_repeat_delimited_radix_inverse_sft.cjs
 * No fitted key or extra quotient. This is exploratory, not a source-authenticated cipher.
 */
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
function experiment(corpus, donor) {
  "use strict";
  const eq=(a,b,msg)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw new Error(msg)};
  const requireTrue=(v,msg)=>{if(!v)throw new Error(msg)};
  const id=new Map(corpus.runes.map((r,i)=>[r,i]));
  const pages=corpus.pages.filter(p=>p.page<56);
  const C=pages.flatMap(p=>p.indices);
  eq(C.length,12956,"canonical rune count");
  let offset=0;
  const bounds=new Map();
  for (const p of pages){bounds.set(p.page,[offset,offset+p.indices.length]);offset+=p.indices.length;}
  /** Convert positional numeral, with zero-prefix preservation and an empty-string code. */
  function convert(a,from,to){
    let z=0;while(z<a.length&&a[z]===0)z++;
    let n=0n;for(let i=z;i<a.length;i++){requireTrue(a[i]>=0&&a[i]<from,"digit range");n=n*BigInt(from)+BigInt(a[i]);}
    const tail=[];while(n>0n){tail.push(Number(n%BigInt(to)));n/=BigInt(to);}
    return Array(z).fill(0).concat(tail.reverse());
  }
  function decode(C){
    requireTrue(C.length>0,"seed required");
    const blocks=[];let digits=[],start=1;
    for(let i=1;i<C.length;i++){
      const prev=C[i-1],x=C[i];
      if(x===prev){blocks.push({start,end:i,digits,plain:convert(digits,28,29)});digits=[];start=i+1;}
      else digits.push(x-(x>prev?1:0));
    }
    blocks.push({start,end:C.length,digits,plain:convert(digits,28,29)});
    return {seed:C[0],blocks};
  }
  function encode(seed,blocks){
    const out=[seed];
    for(let i=0;i<blocks.length;i++){
      for(const r of convert(blocks[i],29,28)){
        const prev=out[out.length-1];out.push(r+(r>=prev?1:0));
      }
      if(i<blocks.length-1)out.push(out[out.length-1]);
    }
    return out;
  }
  const original=decode(C);
  eq(original.blocks.length,87,"86 repeat delimiters");
  eq(encode(original.seed,original.blocks.map(b=>b.plain)),C,"original complete replay");
  const sourceSections=donor.sections.map(s=>({name:s.name,a:[...s.source_text].filter(c=>id.has(c)).map(c=>id.get(c))}));
  eq(sourceSections.reduce((a,s)=>a+s.a.length,0),2979,"native corpus count");
  const controlNames=["0_welcome","jpg107-167"];
  const count=new Uint32Array(29**3),ctx=new Uint32Array(29**2);
  for(const s of sourceSections.filter(s=>!controlNames.includes(s.name))){
    for(let i=2;i<s.a.length;i++){
      const h=s.a[i-2]*29+s.a[i-1];ctx[h]++;count[h*29+s.a[i]]++;
    }
  }
  function score(a){
    let s=0;for(let i=2;i<a.length;i++){const h=a[i-2]*29+a[i-1];s+=Math.log((count[h*29+a[i]]+0.5)/(ctx[h]+14.5));}
    return s/(a.length-2);
  }
  function ioc(a){const f=Array(29).fill(0);for(const x of a)f[x]++;return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));}
  const latin=a=>a.map(x=>corpus.translit[x]).join("");
  const metric=a=>({n:a.length,ioc:ioc(a),trigramNatsPerRune:score(a),head:latin(a.slice(0,100))});
  const controls=sourceSections.filter(s=>controlNames.includes(s.name)).map((s,i)=>{
    const blocks=[];for(let j=0;j<s.a.length;j+=128)blocks.push(s.a.slice(j,j+128));
    const ct=encode(3+i,blocks),dec=decode(ct);
    eq(dec.seed,3+i,"control seed");
    eq(dec.blocks.map(b=>b.plain),blocks,"control plaintext");
    eq(encode(dec.seed,dec.blocks.map(b=>b.plain)),ct,"control replay");
    return {name:s.name,plain:metric(s.a),cipher:metric(ct),repeatCount:dec.blocks.length-1};
  });
  const originalPlain=original.blocks.flatMap(b=>b.plain);
  const train=[bounds.get(0)[0],bounds.get(2)[1]];
  const test=[bounds.get(16)[0],bounds.get(21)[1]];
  const select=(bs,range)=>bs.filter(b=>b.start>=range[0]&&b.end<=range[1]);
  const a=select(original.blocks,train),b=select(original.blocks,test);
  const trainPlain=a.flatMap(b=>b.plain),testPlain=b.flatMap(b=>b.plain);
  requireTrue(trainPlain.length>=300&&testPlain.length>=200,"minimum split sizes");
  let state=3301>>>0;
  function rng(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;}
  function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=rng()%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
  function nullSummary(blocks,actual){
    const scores=Array.from({length:128},()=>score(blocks.flatMap(b=>convert(shuffle(b.digits),28,29))));
    return {n:scores.length,min:Math.min(...scores),max:Math.max(...scores),mean:scores.reduce((a,b)=>a+b,0)/scores.length,atLeastActual:scores.filter(s=>s>=actual).length};
  }
  const originalMetric=metric(originalPlain),trainMetric=metric(trainPlain),testMetric=metric(testPlain);
  const result={seed:original.seed,sourceLength:C.length,sourceRepeatCount:original.blocks.length-1,sourceBlockLengths:original.blocks.map(b=>b.digits.length),decodedBlockLengths:original.blocks.map(b=>b.plain.length),removedOverhead:C.length-originalPlain.length,original:originalMetric,sourceCipher:metric(C),train:{physical:"p0–2",range:train,blockCount:a.length,metric:trainMetric,shuffle:nullSummary(a,trainMetric.trigramNatsPerRune)},holdout:{physical:"p16–21",range:test,blockCount:b.length,metric:testMetric,shuffle:nullSummary(b,testMetric.trigramNatsPerRune)},controls};
  return result;
}
const result=experiment(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json'));
console.log(JSON.stringify(result,null,2));
