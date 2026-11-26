#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(corpus,grid,native,rawDonors){
 const mod=n=>(n%29+29)%29, opening=corpus.pages.slice(0,3).flatMap(p=>p.indices).slice(14);
 if(opening.length!==715)throw Error("opening mismatch");
 const seeds=Array.from({length:55},(_,i)=>opening.slice(13*i,13*i+13).reduce((a,b)=>a+b,0));
 if(seeds[49]!==203)throw Error("row50 sum mismatch");
 const toGP=t=>Array.from(t,x=>native.runes.indexOf(x)).filter(x=>x>=0);
 const training=native.sections.slice(0,5).map(s=>toGP(s.source_text));
 const hold=native.sections.slice(5).map(s=>toGP(s.source_text));
 const held=hold.flat(), uni=Array(29).fill(.5), count=Array.from({length:29},()=>Array(29).fill(.5));
 for(const s of training)for(let i=0;i<s.length;i++){uni[s[i]]++;if(i)count[s[i-1]][s[i]]++}
 const u=uni.map(v=>Math.log(29*v/uni.reduce((a,b)=>a+b,0)));
 const b=count.map(r=>r.map(v=>Math.log(29*v/r.reduce((a,b)=>a+b,0))));
 const weight=(prev,p)=>prev===29?u[p]:b[prev][p];
 const score=arr=>arr.reduce((s,p,i)=>s+weight(i?arr[i-1]:29,p),0);
 const pages=corpus.pages.filter(p=>p.page>=3&&p.page<=55&&p.indices.length);
 const N=pages.reduce((s,p)=>s+p.indices.length,0);
 const tok=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function donor(raw){const D=[];for(let w of raw.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error("donor token");D.push(t.i);w=w.slice(t.s.length)}}return D}
 const refs=rawDonors.map(raw=>{const D=donor(raw),target=x=>+(x===18||x===3);if(D.length<N)throw Error("short donor");let z=D.slice(0,N).reduce((s,x)=>s+target(x),0),min=z,max=z;for(let i=N;i<D.length;i++){z+=target(D[i])-target(D[i-N]);min=Math.min(min,z);max=Math.max(max,z)}return {len:D.length,windows:D.length-N+1,min,max}});
 function graph(radix){const a=radix===60?grid.alphabet:grid.alphabet.replace("f","");let v=grid.pages.flatMap(p=>p.tokens).map(t=>radix*a.indexOf(t[0])+a.indexOf(t[1]));if(v.length!==256||v.some(x=>x<0||x>255))throw Error("graph mismatch");return v}
 function orbit(g,s){const seen=new Map();let t=0;while(!seen.has(s)){seen.set(s,t++);s=g[s]}return {transient:seen.get(s),period:t-seen.get(s),entry:s}}
 function encode(p,g,s,sign,hold){let ct=[];for(let x of p){if(hold&&x===0){ct.push(0);continue}let next=g[s];ct.push(mod(x+sign*next));s=next}return ct}
 function inverse(ct,g,s,sign,hold){
  if(!hold){const plain=ct.map(c=>{s=g[s];return mod(c-sign*s)});return {plain,score:score(plain),maxStates:1}}
  let states=new Map([[s*30+29,{score:0,prev:null,p:29,s}]]), maxStates=1;
  for(let i=0;i<ct.length;i++){const c=ct[i],ns=new Map();
   function add(prev,st,p){const k=st*30+p,v=prev.score+weight(prev.p,p);if(!ns.has(k)||v>ns.get(k).score)ns.set(k,{score:v,prev,p,s:st})}
   for(const prev of states.values()){const next=g[prev.s],p=mod(c-sign*next);if(p!==0)add(prev,next,p);if(c===0)add(prev,prev.s,0)}
   states=ns;maxStates=Math.max(maxStates,states.size);if(!states.size)return {plain:null,death:i,maxStates};
  }
  let best=[...states.values()].reduce((a,v)=>a.score>v.score?a:v),plain=[];const v=best.score;
  while(best.prev){plain.push(best.p);best=best.prev}plain.reverse();return {plain,score:v,maxStates};
 }
 const results=[],orbits=[],bounds=[];
 const baseline=pages.reduce((s,p)=>s+score(p.indices),0)/N;
 const hist=()=>Array.from({length:256},()=>new Uint32Array(29));
 const top2=h=>h.reduce((s,r)=>{let a=0,b=0;for(let x of r)if(x>=a){b=a;a=x}else if(x>b)b=x;return s+a+b},0);
 function capacities(g,records){
  const global=hist(),fTail=hist();let privateF=0,privateBound=0,prefixFree=0,tail=0,cycleAllFixed=true;
  for(const p of records){let s=seeds[p.page-1],local=hist();
   for(const v of p.indices){global[s][v]++;local[s][v]++;s=g[s]}
   privateBound+=top2(local);
   const o=orbit(g,seeds[p.page-1]);if(o.period!==1){cycleAllFixed=false;continue}
   let consumed=0,idx=0;while(idx<p.indices.length&&consumed<o.transient){if(p.indices[idx]!==0)consumed++;idx++}
   prefixFree+=idx;const h=hist();for(let v of p.indices.slice(idx)){h[o.entry][v]++;fTail[o.entry][v]++;tail++}privateF+=top2(h)+idx;
  }
  return {sharedOrdinary:top2(global),privatePageOrdinary:privateBound,states:global.filter(r=>r.some(v=>v)).length,cycleAllFixed,fixedFholdBound:cycleAllFixed?prefixFree+top2(fTail):null,privateFholdBound:cycleAllFixed?privateF:null,prefixFree:cycleAllFixed?prefixFree:null,tail:cycleAllFixed?tail:null};
 }
 for(const radix of [60,59]){
  const g=graph(radix),oo=pages.map(p=>({page:p.page,seed:seeds[p.page-1],...orbit(g,seeds[p.page-1])}));orbits.push({radix,uniqueSeeds:new Set(oo.map(p=>p.seed)).size,maxTransient:Math.max(...oo.map(p=>p.transient)),periodCounts:Object.fromEntries([...new Set(oo.map(p=>p.period))].map(k=>[k,oo.filter(p=>p.period===k).length])),pages:oo});
  const capacity=capacities(g,pages);
  let pos=0,target=0;const planted=pages.map(p=>{const truth=Array.from({length:p.indices.length},(_,i)=>held[(pos+i)%held.length]);pos+=truth.length;target+=truth.filter(x=>x===18||x===3).length;return {page:p.page,indices:encode(truth,g,seeds[p.page-1],1,false)}});
  const control=capacities(g,planted);if(control.sharedOrdinary<target||control.privatePageOrdinary<target)throw Error("capacity control");
  pos=0;const fplanted=pages.map(p=>{const truth=Array.from({length:p.indices.length},(_,i)=>held[(pos+i)%held.length]);pos+=truth.length;return {page:p.page,indices:encode(truth,g,seeds[p.page-1],1,true)}});
  const fcontrol=capacities(g,fplanted);if(fcontrol.cycleAllFixed&&(fcontrol.fixedFholdBound<target||fcontrol.privateFholdBound<target))throw Error("F capacity control");
  bounds.push({radix,...capacity,control:{target,ordinary:control,fhold:fcontrol}});
  for(const sign of [1,-1])for(const fhold of [false,true]){
   let fit={n:0,score:0,failed:[]},test={n:0,score:0,failed:[]},rows=[],plants={n:0,correct:0,score:0,truthScore:0,maxStates:0},pos=0;
   for(const page of pages){
    const ct=page.indices,seed=seeds[page.page-1],result=inverse(ct,g,seed,sign,fhold),group=page.page<40?fit:test;
    if(result.plain){if(encode(result.plain,g,seed,sign,fhold).join()!==ct.join())throw Error("original replay mismatch");group.n+=ct.length;group.score+=result.score;rows.push({page:page.page,n:ct.length,score:result.score/ct.length,plain:result.plain.map(v=>v.toString(36)).join(""),maxStates:result.maxStates})}else{group.failed.push(page.page);rows.push({page:page.page,n:ct.length,failed:true,death:result.death,maxStates:result.maxStates})}
    const truth=Array.from({length:ct.length},(_,i)=>held[(pos+i)%held.length]);pos+=ct.length;
    const cp=encode(truth,g,seed,sign,fhold),rp=inverse(cp,g,seed,sign,fhold);if(!rp.plain)throw Error("planted valid path lost");
    if(encode(rp.plain,g,seed,sign,fhold).join()!==cp.join())throw Error("plant replay mismatch");
    plants.n+=truth.length;plants.correct+=truth.filter((p,i)=>rp.plain[i]===p).length;plants.score+=rp.score;plants.truthScore+=score(truth);plants.maxStates=Math.max(plants.maxStates,rp.maxStates);
   }
   results.push({radix,sign,fhold,fit:{...fit,mean:fit.n?fit.score/fit.n:null},test:{...test,mean:test.n?test.score/test.n:null},plants:{...plants,mean:plants.score/plants.n,truthMean:plants.truthScore/plants.n},rows})
  }
 }
 return {N,seeds,train:native.sections.slice(0,5).map(s=>s.name),held:native.sections.slice(5).map(s=>s.name),baseline,refs,orbits,bounds,results};
}
const root=path.join(__dirname,'..');
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-grid-256.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const raw=paths.map(read);
console.log(JSON.stringify(experiment(...raw.slice(0,3).map(JSON.parse),raw.slice(3)),null,2));
