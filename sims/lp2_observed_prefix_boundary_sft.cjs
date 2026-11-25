"use strict";
const fs=require("node:fs"),path=require("node:path");
const INPUTS=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/transcriptions/lp2-image-corrected.txt"
];
function experiment(raw){
 const gp=JSON.parse(raw[0]),ix=new Map(gp.runes.map((x,i)=>[x,i])),unknown=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices),groups=[];let w=[],gap="";
 function push(){if(w.length){groups.push({w,gap});w=[];gap=""}}
 for(const c of raw[1]){if(ix.has(c)){if(w.length&&/[-.&]/u.test(gap))push();w.push(ix.get(c));gap=""}else if(w.length)gap+=c}push();
 const G=groups.slice(0,2896);if(G.flatMap(g=>g.w).join(",")!==unknown.join(","))throw Error("source mismatch");
 const chapters=[158,255,383,437,224,326,378,669,66];const ends=new Set();let p=0;for(const a of gp.pages.filter(p=>p.page<56)){p+=a.indices.length;ends.add(p-1)}
 const samples=[];let start=0,ch=0,stop=chapters[0];
 for(let gi=0;gi<G.length;gi++){if(gi===stop){ch++;stop+=chapters[ch]}const {w,gap}=G[gi];let sum=0,product=1n,prefix=[];for(let j=0;j<w.length;j++){const i=start+j,c=w[j];sum+=gp.prime[c];product*=BigInt(gp.prime[c]);prefix.push(c);const last=j===w.length-1;const forced=last&&(/[.&]/.test(gap)||gi===stop-1);if(!forced&&!ends.has(i))samples.push({i,ch,len:j+1,sum,product:String(product),prefix:prefix.join(","),c,prev:unknown[start-1]??-1,next:unknown[i+1]??-1,stop:Number(last)})}start+=w.length}
 function bound(rows,fn){const M=new Map;for(const r of rows){const k=fn(r),v=M.get(k)||[0,0];v[r.stop]++;M.set(k,v)}let error=0,conflictingStates=0,conflictingObservations=0;for(const v of M.values()){error+=Math.min(...v);if(v[0]&&v[1]){conflictingStates++;conflictingObservations+=v[0]+v[1]}}return {n:rows.length,stops:rows.filter(x=>x.stop).length,states:M.size,error,conflictingStates,conflictingObservations}}
 const fs={length:r=>`${r.len}`,primeSum:r=>`${r.sum}`,lengthSum:r=>`${r.len}|${r.sum}`,sumLengthLast:r=>`${r.len}|${r.sum}|${r.c}`,primeProduct:r=>r.product,prefix:r=>r.prefix,prefixLookahead:r=>`${r.prefix}|${r.next}`,prefixPreviousRune:r=>`${r.prefix}|${r.prev}`,prefixBoth:r=>`${r.prefix}|${r.prev}|${r.next}`};
 const results={};for(const [name,f] of Object.entries(fs))results[name]={book:bound(samples,f),chapter:bound(samples,r=>`${r.ch}|${f(r)}`)};
 const singletonStops=new Set(samples.filter(r=>r.stop&&r.len===1).map(r=>r.c));
 const witnesses=samples.filter(r=>r.len===1&&!r.stop&&singletonStops.has(r.c)).length;
 const rules=[];for(const mod of [29,59,60,83,1033,3301])rules.push({mod,book:bound(samples,r=>String(r.sum%mod)),chapter:bound(samples,r=>`${r.ch}|${r.sum%mod}`)});
 const M=new Map;for(const r of samples){const k=`${r.ch}|${fs.prefixBoth(r)}`,v=M.get(k)||[[],[]];v[r.stop].push(r.i);M.set(k,v)}
 const bothWitnesses=[...M].filter(([k,v])=>v[0].length&&v[1].length).map(([state,positions])=>({state,positions}));
 const plant=[];let sum=0;for(let i=0;i<unknown.length-1;i++){sum+=gp.prime[unknown[i]];const stop=Number(sum>=200);plant.push({sum,stop});if(stop)sum=0}
 const control=bound(plant,r=>String(r.sum));if(control.error)throw Error("plant");
 return {groups:G.length,runes:unknown.length,samples:samples.length,singletonStopRunes:[...singletonStops].sort((a,b)=>a-b),nonstopSingletonPrefixWitnesses:witnesses,results,rules,bothWitnesses,control};
}
console.log(JSON.stringify(experiment(INPUTS.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
