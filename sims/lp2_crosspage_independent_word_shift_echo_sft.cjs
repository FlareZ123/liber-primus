'use strict';
// Source-native independent-word shift echo search; Node 22, no dependencies.
const fs=require('node:fs'),path=require('node:path');
function experiment(corpus, transcription, trials=1000) {
 const mod=x=>(x+29)%29;
 const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
 const tape=pages.flatMap(p=>p.indices);
 const owners=pages.flatMap(p=>Array(p.indices.length).fill(p.page));
 const runeIndex=new Map(corpus.runes.map((x,i)=>[x,i]));
 let words=[],buf=[],pos=0,start=0,line=0,firstLine=0;
 const finish=()=>{if(buf.length){words.push({v:buf,page:owners[start],offset:start,line:firstLine});buf=[]}};
 for(const ch of transcription){if(runeIndex.has(ch)){if(!buf.length){start=pos;firstLine=line}buf.push(runeIndex.get(ch));pos++}else if(ch==="-"||ch===".")finish();if(ch==="\n")line++;if(pos===tape.length)break}finish();
 if(words.length!==2896||tape.length!==12956||words.flatMap(w=>w.v).some((v,i)=>v!==tape[i]))throw Error("source parse mismatch");
 const normalize=w=>w.map(x=>mod(x-w[0])).join(",");
 const types=[],typeIds=new Map();
 const v=words.map(w=>{const key=w.v.join(",");if(!typeIds.has(key)){typeIds.set(key,types.length);types.push({r:w.v,n:normalize(w.v),len:w.v.length,head:w.v[0]})}return typeIds.get(key)});
 const sigIds=new Map();for(const q of types){if(!sigIds.has(q.n))sigIds.set(q.n,sigIds.size);q.sig=sigIds.get(q.n)}
 const ns=sigIds.size;
 const eligible=[];for(let i=0;i<v.length-1;i++){let a=words[i].v.length,b=words[i+1].v.length;if(a>=2&&b>=2&&a+b>=5)eligible.push(i)}
 const same=(a,b,k)=>a.len===b.len&&a.sig===b.sig&&mod(b.head-a.head)===k;
 const scan=(ids,detail=false)=>{
  const seen=new Map(),out={pairs:0,common:0,split:0,maxLength:0,eligibleNeighborPairs:0,neighborMatches:0,splitNeighborMatches:0,maxExtended:0,details:[]};
  for(const i of eligible){const a=types[ids[i]],b=types[ids[i+1]],key=a.sig*ns+b.sig,prior=seen.get(key)||[];
   for(const j of prior){if(words[j].page===words[i].page)continue;
    const k0=mod(a.head-types[ids[j]].head),k1=mod(b.head-types[ids[j+1]].head);
    const L=a.len+b.len;out.pairs++;if(k0===k1)out.common++;else out.split++;out.maxLength=Math.max(out.maxLength,L);
    let possible=[],passed=[];
    for(const step of [-1,2]){const x=j+step,y=i+step;if(x<0||y>=ids.length||x>=ids.length||y<0)continue;
     const q=types[ids[x]],r=types[ids[y]];if(q.len<2||r.len!==q.len)continue;
     // Neighbor must be on the respective seed's physical page. Holdout does not cross page seams.
     if(words[x].page!==words[j].page||words[y].page!==words[i].page)continue;
     possible.push(step);if(same(q,r,step===-1?k1:k0)){passed.push(step);out.maxExtended=Math.max(out.maxExtended,L+q.len)}
    }
    if(possible.length)out.eligibleNeighborPairs++;
    if(passed.length){out.neighborMatches++;if(k0!==k1)out.splitNeighborMatches++}
    if(detail)out.details.push({i:j,j:i,pages:[words[j].page,words[i].page],offsets:[words[j].offset,words[i].offset],lengths:[a.len,b.len],shifts:[k0,k1],neighbors:possible,passed});
   }
   prior.push(i);seen.set(key,prior);
  }return out;
 };
 const observed=scan(v,true);
 if(observed.common!==1)throw Error("common-shift comparator failed");
 // Exhaustive 29^2 direct pattern-identity controls including equal and unequal offsets.
 const controlA=[23,11,1],controlB=[17,18,10];let controls=0;
 for(let a=0;a<29;a++)for(let b=0;b<29;b++){let x=controlA.map(z=>mod(z+a)),y=controlB.map(z=>mod(z+b));if(normalize(x)!==normalize(controlA)||normalize(y)!==normalize(controlB)||mod(x[0]-controlA[0])!==a||mod(y[0]-controlB[0])!==b)throw Error("control");controls++}
 // Full-detector controls: copy four complete words to another physical page
 // with the same four word lengths, translating by alternating known shifts.
 let shapeMap=new Map(),pair=null;
 for(let i=1;i<words.length-2&&!pair;i++){
  const seg=words.slice(i-1,i+3);
  if(seg.some(w=>w.page!==words[i].page||w.v.length<2)||seg[1].v.length+seg[2].v.length<5)continue;
  const shape=seg.map(w=>w.v.length).join(",");
  const prev=shapeMap.get(shape);
  if(prev!==undefined&&words[prev].page!==words[i].page)pair=[prev,i];
  else if(prev===undefined)shapeMap.set(shape,i);
 }
 if(!pair)throw Error("no matched four-word plant slots");
 const planted=[];
 for(const shifts of [[0,0],[7,13],[28,1]]){
  const ids=v.slice();
  for(const step of [-1,0,1,2]){
   const q=types[v[pair[0]+step]],k=(step===0||step===2)?shifts[0]:shifts[1];
   const r=q.r.map(x=>mod(x+k));
   ids[pair[1]+step]=types.length;types.push({r,n:q.n,len:q.len,head:r[0],sig:q.sig});
  }
  const hit=scan(ids,true).details.find(d=>d.i===pair[0]&&d.j===pair[1]);
  if(!hit||hit.shifts.some((x,i)=>x!==shifts[i])||hit.passed.join(",")!=="-1,2")throw Error("full detector plant failed");
  planted.push(hit);
 }
 function nullTest(field,seed){
  const bins=new Map();for(let i=0;i<words.length;i++){const w=words[i],key=w[field]+":"+w.v.length;if(!bins.has(key))bins.set(key,[]);bins.get(key).push(i)}
  let state=seed>>>0;const rng=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296};
  const keys=["pairs","split","maxLength","eligibleNeighborPairs","neighborMatches","splitNeighborMatches","maxExtended"];const sums=Object.fromEntries(keys.map(k=>[k,0])),hits={...sums};let hist={};
  for(let t=0;t<trials;t++){let ids=v.slice();for(const group of bins.values())for(let j=group.length-1;j>0;j--){let k=Math.floor(rng()*(j+1));[ids[group[j]],ids[group[k]]]=[ids[group[k]],ids[group[j]]]}
   let res=scan(ids);for(let k of keys){sums[k]+=res[k];if(res[k]>=observed[k])hits[k]++}hist[res.splitNeighborMatches]=(hist[res.splitNeighborMatches]||0)+1;
  }return {field,seed,trials,means:Object.fromEntries(keys.map(k=>[k,sums[k]/trials])),addOneTails:Object.fromEntries(keys.map(k=>[k,(hits[k]+1)/(trials+1)])),splitNeighborHistogram:hist};
 }
 return {words:words.length,runes:tape.length,eligible:eligible.length,controls,planted,observed,nulls:[nullTest("page",0x33012611),nullTest("line",0x27115526)]};
}
const root=path.join(__dirname,'..','resources','liber-primus');
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync(path.join(root,'lp2-corpus.json'),'utf8')),fs.readFileSync(path.join(root,'lp2-transcription.txt'),'utf8')),null,2));
