"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
function experiment(co,src){
 const g=new Map(co.runes.map((r,i)=>[r,i])),mod=x=>(x+29)%29,ALL=0x1fffffff;
 const native=src.sections.map(s=>({name:s.name,p:[...s.source_text].filter(x=>g.has(x)).map(x=>g.get(x))}));
 const str=p=>p.map(x=>co.runes[x]).join("");
 const repeats=new Map();
 for(const {name,p} of native.filter(s=>s.name.startsWith("0_")))for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++){
  if(i&&p[i-1]===p[j-1])continue;
  let n=0;while(j+n<p.length&&p[i+n]===p[j+n])n++;
  if(n>=20){let a=p.slice(i,i+n),s=str(a);if(!repeats.has(s))repeats.set(s,{name,p:a,first:i,second:j});}
 }
 const cribs=[...repeats.values()];
 function scan(c,crib,q,limit=c.length){
  let hits=[],placements=0;
  for(let start=0;start+crib.p.length<=limit;start++){
   let d=new Int32Array(q).fill(ALL),j=0,ok=true;placements++;
   for(let i=0;i<crib.p.length;i++){
    const p=crib.p[i],x=c[start+i],prev=start+i?c[start+i-1]:-1;
    if(!p){if(x!==0){ok=false;break;}continue;}
    let m=1<<mod(x-p);if(prev>=0&&prev!==x)m|=1<<mod(prev-p);
    d[j]&=m;if(!d[j]){ok=false;break;}j=(j+1)%q;
   }
   if(!ok)continue;
   if(d.some(x=>x===ALL))throw Error("incomplete key coverage");
   const k=[];
   function go(a){if(a===q){hits.push({start,end:start+crib.p.length,key:k.slice(),endPhase:j});return;}
    for(let v=0;v<29;v++)if(d[a]&(1<<v)){k[a]=v;go(a+1);}}
   go(0);
  }
  return {placements,hits};
 }
 function encrypt(p,k,seed){let c=[],j=0,repairs=0;
  function rng(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
  for(let i=0;i<p.length;i++){let x;if(!p[i])x=0;else{x=(p[i]+k[j])%29;j=(j+1)%k.length;
   if(i&&x===c[i-1]&&rng()<0.8){x=(x+1+Math.floor(rng()*28))%29;repairs++;}}
   c.push(x);
  }
  return {c,repairs};
 }
 function scoreModel(exclude){let b=new Int32Array(841),t=new Int32Array(24389);
  for(const s of native)if(s.name!==exclude)for(let i=2;i<s.p.length;i++){let x=s.p[i-2]*29+s.p[i-1];b[x]++;t[x*29+s.p[i]]++;}
  return (a,b1,z)=>Math.log((t[(a*29+b1)*29+z]+0.2)/(b[a*29+b1]+5.8));
 }
 function decode(c,h,crib,stop,score){
  const q=h.key.length;let st=new Map([[0,{j:h.endPhase,a:crib.p.at(-2),b:crib.p.at(-1),s:0,p:[],rep:[]}]]);
  for(let i=h.end;i<stop;i++){
   const next=new Map,x=c[i],prev=c[i-1];
   for(const v of st.values()){
    const push=(p,j,w,r)=>{const s=v.s+score(v.a,v.b,p)+w,id=(j*29+v.b)*29+p;const old=next.get(id);if(!old||s>old.s)next.set(id,{j,a:v.b,b:p,s,p:v.p.concat(p),rep:v.rep.concat(r)});};
    if(x===0)push(0,v.j,0,0);
    const p=mod(x-h.key[v.j]),j=(v.j+1)%q;
    if(p)push(p,j,x===prev?Math.log(.2):0,0);
    if(x!==prev){const r=mod(prev-h.key[v.j]);if(r)push(r,j,Math.log(.8/28),1);}
   }
   st=next;if(!st.size)return null;
  }
  const best=[...st.values()].sort((a,b)=>b.s-a.s)[0];let j=h.endPhase,lang=0,a=crib.p.at(-2),b=crib.p.at(-1);
  for(let i=0;i<best.p.length;i++){const p=best.p[i],ix=h.end+i;let raw=p?(p+h.key[j])%29:0;if(p)j=(j+1)%q;
   if(best.rep[i]){if(!p||raw!==c[ix-1]||c[ix]===raw)throw Error("invalid repair");}else if(raw!==c[ix])throw Error("invalid replay");
   lang+=score(a,b,p);a=b;b=p;
  }
  return {p:best.p,repairs:best.rep.reduce((a,b)=>a+b,0),repairMask:best.rep,lang:lang/best.p.length,posterior:best.s/best.p.length};
 }
 const c=co.pages.slice(0,56).flatMap(p=>p.indices);if(c.length!==12956)throw Error("original count");
 const out={model:"q8/q13 continuous additive plaintext-F hold; arbitrary non-F collision repair with unchanged clock; repeated native LP1 cribs",original:[],controls:[]};
 for(const q of [8,13]){
  for(const crib of cribs){
   const s=scan(c,crib,q);out.original.push({q,name:crib.name,length:crib.p.length,crib:str(crib.p),placements:s.placements,hits:s.hits.map(h=>({...h,decoded:decode(c,h,crib,Math.min(h.end+150,c.length),scoreModel(null))}))});
  }
  for(const name of [...new Set(cribs.map(x=>x.name))]){
   const crib=cribs.filter(x=>x.name===name).sort((a,b)=>b.p.length-a.p.length)[0],p=native.find(x=>x.name===name).p;
   for(let seed=1;seed<=3;seed++){
    const k=Array.from({length:q},(_,i)=>(i*i*3+i*(seed+4)+seed*7+q)%29),plant=encrypt(p,k,seed*93451+q);
    const limit=crib.first+crib.p.length,s=scan(plant.c,crib,q,limit),phase=p.slice(0,crib.first).filter(Boolean).length%q,truth=k.slice(phase).concat(k.slice(0,phase));
    const matches=s.hits.filter(h=>h.start===crib.first&&h.key.join()===truth.join());if(!matches.length)throw Error("true key lost");
    const stop=Math.min(limit+150,p.length),h=s.hits.length===1?s.hits[0]:matches[0],d=decode(plant.c,h,crib,stop,scoreModel(name));
    out.controls.push({q,name,seed,plantedKey:k,plantedRepairs:plant.repairs,cribLength:crib.p.length,candidates:s.hits.length,unique:s.hits.length===1,selection:s.hits.length===1?"blind unique":"truth-assisted diagnostic",heldout:stop-limit,correct:d?d.p.filter((x,i)=>x===p[limit+i]).length:0,heldoutTruth:p.slice(limit,stop),decoded:d});
   }
  }
 }
 return out;
}
module.exports=experiment;
if(require.main===module)console.log(JSON.stringify(experiment(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
