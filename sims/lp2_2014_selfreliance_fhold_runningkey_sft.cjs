"use strict";
const fs=require("node:fs");
function experiment(raw,gp,known){
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
 const cases=[{name:"full p0-55",c:full},{name:"black opening p0-2",c:full.slice(13,729)},{name:"black terminal p54-55",c:gp.pages.slice(54,56).flatMap(p=>p.indices).slice(9)},...ranges.map(([a,b])=>({name:`p${a}-${b}`,c:gp.pages.slice(a,b+1).flatMap(p=>p.indices)}))];
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
console.log(JSON.stringify(experiment(fs.readFileSync(paths[0],"utf8"),JSON.parse(fs.readFileSync(paths[1],"utf8")),JSON.parse(fs.readFileSync(paths[2],"utf8"))),null,2));
