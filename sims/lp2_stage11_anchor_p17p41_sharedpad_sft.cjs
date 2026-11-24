"use strict";
// Agent 5: frozen Stage11 HTML p17/p41 anchor-aligned pad recovery gate.
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function experiment(source,transcription,rawDictionary,assert){
 const mod=(v,n=29)=>((v%n)+n)%n;
 const N=273, A=source.pages[17].indices,B=source.pages[41].indices;
 assert(A.length===N&&B.length===N&&A[132]===10&&B[57]===21,"source anchors");
 const runeIndex=new Map(source.runes.map((s,i)=>[s,i]));
 const gp=source.translit.map((name,i)=>[name,i]).sort((a,b)=>b[0].length-a[0].length);
 const dictionary=new Map();
 for(const line of rawDictionary.split(/\r?\n/)){
  const hit=/^([a-z]+)\s+\d+$/.exec(line);if(!hit)continue;
  for(const historical of [false,true]){
   let w=hit[1].toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");
   if(historical)w=w.replace(/ING/g,"NG").replace(/IO/g,"IA");
   let a=[];for(let i=0;i<w.length;){const p=gp.find(x=>w.startsWith(x[0],i));if(!p){a=[];break;}a.push(p[1]);i+=p[0].length;}
   if(a.length&&a.length<=14){if(!dictionary.has(a.length))dictionary.set(a.length,new Map());dictionary.get(a.length).set(a.join(","),a);}
  }
 }
 const D=new Map([...dictionary].map(([n,m])=>[n,[...m.values()]]));
 assert(D.get(8).length>4500,"dictionary coverage");
 function words(p){
  const section=transcription.split("%")[p<50?p:p-1],out=[],tape=[];let start=0,len=0;
  function finish(){if(len)out.push({start,len});len=0;}
  for(const ch of section){const idx=runeIndex.get(ch);if(idx!==undefined){if(!len)start=tape.length;len++;tape.push(idx);}else if("-.$&§".includes(ch))finish();}
  finish();assert(JSON.stringify(tape)===JSON.stringify(source.pages[p].indices),"original transcription");
  return out.filter(w=>w.start>0&&w.start+w.len<N);
 }
 const wa=words(17),wb=words(41);
 function layout(direction){
  const a=Array.from({length:N},(_,i)=>mod(132+i,N));
  const b=Array.from({length:N},(_,i)=>mod(57+direction*i,N));
  const mapA=Array(N).fill(null),mapB=Array(N).fill(null);
  wa.forEach((w,j)=>{for(let i=0;i<w.len;i++)mapA[w.start+i]=[j,i];});
  wb.forEach((w,j)=>{for(let i=0;i<w.len;i++)mapB[w.start+i]=[j,i];});
  const groups=new Map();
  for(let t=0;t<N;t++){const x=mapA[a[t]],y=mapB[b[t]];if(!x||!y)continue;const k=x[0]+","+y[0];if(!groups.has(k))groups.set(k,{i:x[0],j:y[0],positions:[]});groups.get(k).positions.push([t,x[1],y[1]]);}
  return {a,b,groups:[...groups.values()].sort((x,y)=>y.positions.length-x.positions.length)};
 }
 function solve(ca,cb,direction,sa,sb){
  const {a,b,groups}=layout(direction),possible=Array.from({length:29},(_,i)=>i),witnesses=[];
  let offsets=possible;
  for(const g of groups.filter(g=>g.positions.length>=4)){
   const keys=new Set(D.get(wb[g.j].len).map(w=>g.positions.map(([t,ai,bi])=>mod(sb*w[bi])).join(",")));
   const diffs=g.positions.map(([t])=>mod(ca[a[t]]-cb[b[t]]));
   const shifts=offsets.filter(k=>D.get(wa[g.i].len).some(w=>keys.has(g.positions.map(([t,ai],z)=>mod(sa*w[ai]-diffs[z]+k)).join(","))));
   witnesses.push({aStart:wa[g.i].start,bStart:wb[g.j].start,width:g.positions.length,clock:g.positions.map(x=>x[0]),before:offsets.length,after:shifts.length});
   offsets=shifts;if(!offsets.length)break;
  }
  const survivors=[];
  for(const k of offsets){
   const da=wa.map(w=>D.get(w.len)),db=wb.map(w=>D.get(w.len));let changed=true,pass=0,failed=false;
   while(changed&&!failed){changed=false;pass++;
    for(const g of groups){
     const diffs=g.positions.map(([t])=>mod(ca[a[t]]-cb[b[t]]-k));
     const keyB=new Set(db[g.j].map(w=>g.positions.map(([,ai,bi])=>mod(sb*w[bi])).join(",")));
     const aa=da[g.i].filter(w=>keyB.has(g.positions.map(([,ai],z)=>mod(sa*w[ai]-diffs[z])).join(",")));
     if(!aa.length){failed=true;break;}if(aa.length<da[g.i].length){da[g.i]=aa;changed=true;}
     const keyA=new Set(da[g.i].map(w=>g.positions.map(([,ai])=>mod(sa*w[ai])).join(",")));
     const bb=db[g.j].filter(w=>keyA.has(g.positions.map(([,ai,bi],z)=>mod(sb*w[bi]+diffs[z])).join(",")));
     if(!bb.length){failed=true;break;}if(bb.length<db[g.j].length){db[g.j]=bb;changed=true;}
    }
   }
   if(!failed)survivors.push({k,pass,domains:[...da,...db].map(x=>x.length)});
  }
  return {direction,sa,sb,bridges:groups.filter(g=>g.positions.length>=4).length,afterLong:offsets,witnesses,survivors};
 }
 function plant(ws,salt){const out=Array(N).fill(0);for(const w of ws){const opts=D.get(w.len),p=opts[(w.start*41+salt)%opts.length];p.forEach((v,i)=>out[w.start+i]=v);}return out;}
 const results=[],plants=[];
 for(const direction of [1,-1])for(const sa of [1,-1])for(const sb of [1,-1]){
  results.push(solve(A,B,direction,sa,sb));
  const P=plant(wa,91),Q=plant(wb,173),ca=[],cb=[],{a,b}=layout(direction),key=Array.from({length:N},(_,i)=>mod(i*i+7*i+3));
  for(let t=0;t<N;t++){ca[a[t]]=mod(sa*P[a[t]]+key[t]+5);cb[b[t]]=mod(sb*Q[b[t]]+key[t]+12);}
  const test=solve(ca,cb,direction,sa,sb);
  assert(test.survivors.some(x=>x.k===22),"true plant survives");
  for(let t=0;t<N;t++){assert(mod(sa*(ca[a[t]]-key[t]-5))===P[a[t]],"plant A");assert(mod(sb*(cb[b[t]]-key[t]-12))===Q[b[t]],"plant B");}
  plants.push({direction,sa,sb,trueShift:22,survives:true});
 }
 return {N,lexicon:[...D.values()].reduce((a,b)=>a+b.length,0),interiorWords:[wa.length,wb.length],results,plants};
}
const result=experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/lp2-transcription.txt"),read("resources/control/english_wordfreq_textblob.txt"),assert);
console.log(JSON.stringify(result,null,2));
assert(result.results.every(x=>x.survivors.length===0),"original candidate survives: review before reporting");
