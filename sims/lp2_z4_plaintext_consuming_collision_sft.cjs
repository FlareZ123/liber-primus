'use strict';
const fs=require('node:fs');
function collisions(corpus,native){
 const alphabet=corpus.runes, words=new Map();
 for(const rec of native.sections)for(const s of rec.source_text.split(/[^\u16a0-\u16ff]+/u)){const p=Array.from(s).map(v=>alphabet.indexOf(v));if(p.length&&p.every(v=>v>=0))words.set(p.join(","),p);}
 const keys=[[23,10,1,10,9,10,16,26],[0,10,4,0,1,19,0,18,4,18,9,0,18]];
 const results=[];
 for(const K of keys){
  const q=K.length;
  function enc(P,phase,prev){let C=[];for(const p of P){let c;do{c=(p+K[phase])%36;phase=(phase+1)%q;}while(c===prev);prev=c;if(c<29)C.push(c);}return {C,phase,prev};}
  const witness=(p1,p2,t,c)=>{const a=enc(p1,t,c),b=enc(p2,t,c);if(a.C.join(",")!==b.C.join(",")||a.phase!==b.phase||a.prev!==b.prev||p1.length!==p2.length||p1.join(",")===p2.join(","))throw Error("bad witness");return {phase:t,prev:c,plaintext:[p1.map(v=>corpus.translit[v]).join(""),p2.map(v=>corpus.translit[v]).join("")],plaintextIndices:[p1,p2],cipher:a.C,endPhase:a.phase,endPrev:a.prev};};
  let nativeCount=0, pairCount=0, stateCount=0, stateCountVisible=0, nativeExamples=[], generalExamples=[], noNative=[];
  for(let t=0;t<q;t++)for(let prev=0;prev<=36;prev++){
   const buckets=new Map();
   for(const p of words.values()){
    const a=enc(p,t,prev);
    if(!a.C.length)continue;
    const key=[p.length,a.phase,a.prev,a.C.join(",")].join("|");
    if(!buckets.has(key))buckets.set(key,[]);
    buckets.get(key).push(p);
   }
   const ambiguous=Array.from(buckets.values()).filter(v=>v.length>1);if(ambiguous.length){nativeCount++;for(const v of ambiguous){pairCount+=v.length*(v.length-1)/2;if(nativeExamples.length<10)nativeExamples.push(witness(v[0],v[1],t,prev));}}else noNative.push([t,prev]);
   let any=false,vis=false;const bs=new Map();
   for(let p=0;p<29;p++)for(let p2=0;p2<29;p2++){
     const P=[p,p2], a=enc(P,t,prev);const key=[a.phase,a.prev,a.C.join(",")].join("|");
     if(bs.has(key)){any=true;if(a.C.length){vis=true;if(generalExamples.length<5)generalExamples.push(witness(bs.get(key),P,t,prev));}}else bs.set(key,P);
   }stateCount+=any;stateCountVisible+=vis;
  }
  results.push({q,states:q*37,nativeWords:words.size,nativeCount,pairCount,stateCount,stateCountVisible,nativeExamples,generalExamples,noNative});
 }
 return results;
}
const c=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8')); const n=JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8')); console.log(JSON.stringify(collisions(c,n),null,2));
