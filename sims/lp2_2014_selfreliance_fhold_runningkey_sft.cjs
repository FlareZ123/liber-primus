"use strict";
const fs=require("node:fs");
function experiment(raw,gp,known,pageRange=null){
 const mod=x=>(x+29)%29;
 const tokens=gp.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
 function encode(raw){const result=[];for(let w of raw.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");for(let i=0;i<w.length;){const t=tokens.find(([s])=>w.startsWith(s,i));if(!t)throw Error("unmapped "+w.slice(i));result.push(t[1]);i+=t[0].length;}}return result;}
 const key=encode(raw), parse=s=>Array.from(s).map(x=>gp.runes.indexOf(x)).filter(x=>x>=0);
 function enc(p,k,origin,sign){let j=origin;return p.map(x=>x===0?0:mod(x+sign*k[j++]));}
 function sweep(c,k,sign){
  const m=c.filter(x=>x===0).length+1;
  let cur=new Int32Array(m),next=new Int32Array(m),seen=new Int32Array(m),tag=0;
  const survivors=[],hist=new Uint32Array(c.length+1);let max=0,best=[];
  const signed=k.map(x=>mod(sign*x));
  for(let start=0;start<=k.length;start++){
   let n=1;cur[0]=0;let i=0;
   for(;i<c.length;i++){
    let nn=0;tag++;const x=c[i];
    for(let z=0;z<n;z++){const h=cur[z],j=start+i-h;
     if(j<k.length&&x!==signed[j]&&seen[h]!==tag){seen[h]=tag;next[nn++]=h;}
     if(x===0&&seen[h+1]!==tag){seen[h+1]=tag;next[nn++]=h+1;}
    }
    if(!nn)break;
    const t=cur;cur=next;next=t;n=nn;
   }
   hist[i]++;
   if(i>max){max=i;best=[start];}else if(i===max&&best.length<10)best.push(start);
   if(i===c.length)survivors.push({start,ends:n});
  }
  return {sign,starts:k.length+1,max,best,survivorCount:survivors.length,survivors,prefixAtLeast100:hist.slice(100).reduce((s,x)=>s+x,0)};
 }
 const plain56=parse(known.sections.at(-2).source_text),p56=gp.pages[56].indices;const primes=[];for(let x=2;primes.length<85;x++){if(primes.every(p=>p*p>x||x%p!==0))primes.push(x);}
 const p56replay=enc(plain56,primes.map(p=>(p-1)%29),0,1);
 if(p56replay.some((x,i)=>x!==p56[i]))throw Error("real p56 replay failed");
 const full=gp.pages.slice(0,56).flatMap(p=>p.indices);
 const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 const cases=pageRange?gp.pages.slice(pageRange[0],pageRange[1]+1).filter(p=>p.indices.length).map(p=>({name:`p${p.page}`,c:p.indices})):[{name:"full p0-55",c:full},{name:"black opening p0-2",c:full.slice(13,729)},{name:"black terminal p54-55",c:gp.pages.slice(54,56).flatMap(p=>p.indices).slice(9)},...ranges.map(([a,b])=>({name:`p${a}-${b}`,c:gp.pages.slice(a,b+1).flatMap(p=>p.indices)}))];
 const results=cases.map(({name,c})=>({name,length:c.length,zeros:c.filter(x=>x===0).length,runs:[1,-1].map(sign=>sweep(c,key,sign))}));
 
 // Independent GP-native language model, trained only on first five solved sections.
 const uni=new Uint32Array(29), bi=new Uint32Array(841), prev=new Uint32Array(29);
 let total=0;
 for(const s of known.sections.slice(0,5)){const p=parse(s.source_text);for(let i=0;i<p.length;i++){uni[p[i]]++;total++;if(i){bi[p[i-1]*29+p[i]]++;prev[p[i-1]]++;}}}
 const ul=Array.from(uni,x=>Math.log((x+.5)/(total+14.5)));
 const logp=Array.from({length:29},(_,a)=>Array.from({length:29},(_,b)=>Math.log((bi[a*29+b]+10*Math.exp(ul[b]))/(prev[a]+10))));
 function score(p){return (ul[p[0]]+p.slice(1).reduce((s,x,i)=>s+logp[p[i]][x],0))/p.length;}
 function bestPath(c,start,sign){
  let states=new Map([[0,{h:0,last:-1,s:0,back:null}]]);
  for(let i=0;i<c.length;i++){const next=new Map(),x=c[i];for(const node of states.values()){
   const j=start+i-node.h;
   const push=(p,h)=>{const s=node.s+(node.last<0?ul[p]:logp[node.last][p]);const id=h*29+p;const old=next.get(id);if(!old||old.s<s)next.set(id,{h,last:p,s,back:node});};
   if(j<key.length){const p=mod(x-sign*key[j]);if(p!==0)push(p,node.h);}
   if(x===0)push(0,node.h+1);
  }states=next;if(!states.size)return null;}
  let best=null;for(const n of states.values())if(!best||n.s>best.s)best=n;
  let q=best,p=[];while(q.back){p.push(q.last);q=q.back;}p.reverse();
  if(enc(p,key,start,sign).some((x,i)=>x!==c[i]))throw Error("replay");
  return {start,sign,score:best.s/c.length,holds:best.h,p};
 }
 function rank(c,runs){const out=[];for(const run of runs)for(const {start} of run.survivors){const d=bestPath(c,start,run.sign);if(!d)throw Error("reachability discrepancy");out.push(d);}return out.sort((a,b)=>b.score-a.score);}
 function scoreOnly(c,start,sign){
  const m=c.filter(x=>x===0).length+1;
  let A=new Float64Array(m),B=new Float64Array(m),NA=new Float64Array(m),NB=new Float64Array(m);
  A.fill(-Infinity);B.fill(-Infinity);
  let z=0;
  if(start<key.length){const p=mod(c[0]-sign*key[start]);if(p)A[0]=ul[p];}
  if(c[0]===0){B[1]=ul[0];z=1;}
  for(let i=1;i<c.length;i++){
   const nz=z+(c[i]===0?1:0);
   NA.fill(-Infinity,0,nz+1);NB.fill(-Infinity,0,nz+1);
   for(let h=0;h<=z;h++){
    const a=A[h],b=B[h];if(a===-Infinity&&b===-Infinity)continue;
    const j=start+i-h;
    const last=a===-Infinity?0:mod(c[i-1]-sign*key[j-1]);
    if(j<key.length){const p=mod(c[i]-sign*key[j]);if(p)NA[h]=Math.max(a+logp[last][p],b+logp[0][p]);}
    if(c[i]===0)NB[h+1]=Math.max(a+logp[last][0],b+logp[0][0]);
   }
   [A,NA]=[NA,A];[B,NB]=[NB,B];z=nz;
  }
  let best=-Infinity;for(let h=0;h<=z;h++)best=Math.max(best,A[h],B[h]);
  return best/c.length;
 }
 if(pageRange){
  const pages=results.map((v,i)=>{
   const c=cases[i].c;let ranks=[];
   for(const run of v.runs)for(const {start} of run.survivors){const score=scoreOnly(c,start,run.sign);if(!Number.isFinite(score))throw Error("scoreOnly reachability discrepancy");ranks.push({start,sign:run.sign,score});}
   ranks.sort((a,b)=>b.score-a.score);
   const best=ranks.slice(0,3).map(x=>{const d=bestPath(c,x.start,x.sign);if(Math.abs(d.score-x.score)>1e-10)throw Error("scoreOnly Viterbi mismatch");return {...x,holds:d.holds,runes:d.p.map(k=>gp.runes[k]).join(""),text:d.p.map(k=>gp.translit[k]).join("")};});
   const donor=known.sections.slice(5).flatMap(s=>parse(s.source_text));let nativeMin=Infinity,nativeMax=-Infinity;
   for(let i=0;i+c.length<=donor.length;i++){const q=score(donor.slice(i,i+c.length));nativeMin=Math.min(nativeMin,q);nativeMax=Math.max(nativeMax,q);}
   return {name:v.name,length:v.length,zeros:v.zeros,signs:v.runs.map(({sign,starts,max,survivorCount})=>({sign,starts,max,survivorCount})),best,nativeComparison:{windows:donor.length-c.length+1,min:nativeMin,max:nativeMax,margin:best.length?nativeMin-best[0].score:null}};
  });
  return {keyLength:key.length,p56Control:plain56.length,pages};
 }
 const render=p=>p.map(x=>gp.runes[x]).join("");
 const decoded=results.map((v,i)=>{const c=cases[i].c,b=rank(c,v.runs);return {name:v.name,count:b.length,best:b.slice(0,5).map(x=>({...x,p:undefined,preview:render(x.p.slice(0,120)),fullRunes:render(x.p)}))};});
 const donor=known.sections.slice(5).flatMap(s=>parse(s.source_text));
 const plants=[133,3301,761].map((start,i)=>{const sign=i===1?-1:1,c=enc(donor,key,start,sign),cut=320;
  const trainRuns=[1,-1].map(s=>sweep(c.slice(0,cut),key,s));
  const ranked=rank(c.slice(0,cut),trainRuns);
  const best=ranked[0], chosen=bestPath(c,best.start,best.sign);
  const trueRank=ranked.findIndex(x=>x.start===start&&x.sign===sign)+1;
  if(!trueRank)throw Error("planted origin absent");
  const exact=chosen?chosen.p.filter((x,j)=>x===donor[j]).length:0;
  const heldExact=chosen?chosen.p.slice(cut).filter((x,j)=>x===donor[j+cut]).length:0;
  return {start,sign,length:donor.length,cut,trueRank,trainSurvivors:ranked.length,selected:{start:best.start,sign:best.sign,trainScore:best.score},fullScore:chosen?.score??null,heldScore:chosen?score(chosen.p.slice(cut)):null,knownScore:score(donor),knownHeldScore:score(donor.slice(cut)),exact,heldExact,heldLength:donor.length-cut};
 });
 // Preserve complete original candidate offsets; large control lists are intentionally not emitted.

 return {decoded, keyLength:key.length,rawWords:(raw.toUpperCase().match(/[A-Z]+/g)||[]).length,p56Control:plain56.length,results,plants};
}
const paths=["resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt","resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(experiment(fs.readFileSync(paths[0],"utf8"),JSON.parse(fs.readFileSync(paths[1],"utf8")),JSON.parse(fs.readFileSync(paths[2],"utf8")),process.argv[2]==='--pages'?[Number(process.argv[3]),Number(process.argv[4])]:null),null,2));
