"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict");
function experiment(t,b,a,n,assert){
 const alphabet="0123456789ABCDEFGHIJKLMNOPQRS",map=new Map(a.runes.map((r,i)=>[r,i])),scan=s=>Array.from(s).filter(r=>map.has(r)).map(r=>map.get(r)),parts=t.split("%"),unknown=parts.slice(0,-2).join("%"),runes=scan(unknown); const eq=(x,y)=>JSON.stringify(x)===JSON.stringify(y);
 assert(eq(parts.map(scan),a.pages.filter(p=>p.runic_count>0).map(p=>p.indices)),"page tapes");
 assert(runes.length===12956&&unknown.split(".").length===174,"corrected source");
 const toInt=ds=>ds.reduce((x,y)=>x*29n+BigInt(y),0n);
 function encode(x){let s="";do{s=alphabet[Number(x%29n)]+s;x/=29n;}while(x);return s;}
 assert(encode(3301n)==="3QO"&&encode(30n)==="11"&&encode(1033n)==="16I"&&encode(0n)==="0","historical examples");
 const offsets=[];let q=0;for(const p of a.pages){offsets.push({page:p.page,start:q,end:q+p.indices.length});q+=p.indices.length;}
 function audit(fields,start=0){let pos=start;const invalid=[],empty=[];for(let i=0;i<fields.length;i++){const ds=fields[i],p=offsets.find(p=>pos>=p.start&&pos<p.end); if(!ds.length){empty.push({field:i,offset:pos});continue;}const raw=ds.map(x=>alphabet[x]).join(""),canonical=encode(toInt(ds));if(raw!==canonical)invalid.push({field:i,offset:pos,page:p.page,local:pos-p.start,length:ds.length,zeros:raw.length-canonical.length,prefix:raw.slice(0,12)});pos+=ds.length;}return{fields:fields.length,nonempty:fields.length-empty.length,empty,invalid,canonical:fields.length-empty.length-invalid.length};}
 const excluded=[57,58,59,60,91,125,127],stops=b.events.filter(e=>e.symbol==="⁘"&&e.page<=55&&!excluded.includes(e.index)).map(e=>e.rune_offset);assert(stops.length===138&&new Set(stops).size===138&&stops[0]===154&&stops.at(-1)===12597,"strict boundaries"); const boundaries=[0,...stops,runes.length],strict=boundaries.slice(1).map((v,i)=>runes.slice(boundaries[i],v));const corrected=unknown.split(".").map(scan);
 const p56=scan(n.sections.find(s=>s.name==="p56_an_end").source_text),p57=scan(n.sections.find(s=>s.name==="p57_parable").source_text);let j=0;const primes=[];for(let v=2;primes.length<85;v++){if(primes.every(p=>v%p!==0))primes.push(v);}
 assert(eq(p56.map(v=>v===0?0:(v+primes[j++]-1)%29),a.pages[56].indices),"solved p56");assert(eq(p57,a.pages[57].indices),"solved p57");
 return {corrected:audit(corrected),strict:audit(strict),controls:[{page:56,...audit(parts.at(-2).split(".").map(scan),12956)},{page:57,...audit(parts.at(-1).split(".").map(scan),12956+85)}]};
}
const paths=["resources/transcriptions/lp2-image-corrected.txt","resources/liber-primus/lp2-punctuation-identity.json","resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
const [t,b,a,n]=paths.map(p=>fs.readFileSync(p,"utf8"));
console.log(JSON.stringify(experiment(t,JSON.parse(b),JSON.parse(a),JSON.parse(n),assert.ok),null,2));
