"use strict";
const fs=require("node:fs");
const L=13,R=600;
function rng(seed){let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};}
function train(sections,omit){
 const u=new Float64Array(29).fill(.25),b=new Float64Array(841).fill(.1),t=new Float64Array(24389).fill(.1);
 for(let i=0;i<sections.length;i++)if(i!==omit){const s=sections[i];for(let j=0;j<s.length;j++){u[s[j]]++;if(j)b[29*s[j-1]+s[j]]++;if(j>1)t[841*s[j-2]+29*s[j-1]+s[j]]++;}}
 const norm=(a,w)=>{for(let i=0;i<a.length;i+=w){let z=0;for(let j=i;j<i+w;j++)z+=a[j];for(let j=i;j<i+w;j++)a[j]=Math.log(a[j]/z);}return a;};
 return {u:norm(u,29),b:norm(b,29),t:norm(t,29)};
}
function likelihood(u,penalty){const a=new Float64Array(841);for(let c=0;c<29;c++)for(let k=0;k<29;k++){let p=(c-k+29)%29;a[c*29+k]=p?u[p]:u[0]-penalty;}return a;}
function viterbi(C,K,tab,u,free){
 const l=K.length,back=new Uint8Array(C.length*l);
 let a=new Float64Array(l),b=new Float64Array(l);
 a.fill(free?-Math.log(l):-Infinity);if(!free)a[0]=0;
 for(let i=0;i<C.length;i++){
  let c=C[i];
  for(let j=0;j<l;j++){
   let q=j?j-1:l-1,adv=a[q]+tab[c*29+K[q]],hold=c===0?a[j]+u[0]:-Infinity;
   if(hold>adv){b[j]=hold;back[i*l+j]=0;}else{b[j]=adv;back[i*l+j]=1;}
  }
  [a,b]=[b,a];
 }
 let end=0;for(let j=1;j<l;j++)if(a[j]>a[end])end=j;
 if(!Number.isFinite(a[end]))return null;
 const hist=new Uint32Array(l*29),P=new Uint8Array(C.length);
 let p=end;
 for(let i=C.length-1;i>=0;i--){if(back[i*l+p]){p=p?p-1:l-1;hist[p*29+C[i]]++;P[i]=(C[i]-K[p]+29)%29;}}
 return {score:a[end],hist,plain:Array.from(P),start:p,end};
}
function recover(units,model,seed,restarts){
 const random=rng(seed),tabs=[2,7,Infinity].map(x=>likelihood(model.u,x)),cand=new Map();
 for(let r=0;r<restarts;r++){
  const K=Array.from({length:L},()=>random()%29);
  for(const tab of tabs){
   for(let sw=0;sw<8;sw++){
    const h=new Uint32Array(L*29);let ok=true;
    for(let s=0;s<units.length;s++){
     const v=viterbi(units[s],K,tab,model.u,s>0);if(!v){ok=false;break;}
     for(let j=0;j<h.length;j++)h[j]+=v.hist[j];
    }
    if(!ok)break;
    let change=false;
    for(let j=0;j<L;j++){
     let max=-Infinity,best=K[j];
     for(let k=0;k<29;k++){
      let z=0;
      for(let c=0;c<29;c++)if(h[j*29+c])z+=h[j*29+c]*tab[c*29+k];
      if(z>max){max=z;best=k;}
     }
     if(K[j]!==best){K[j]=best;change=true;}
    }
    if(!change)break;
   }
  }
  const vv=units.map((C,s)=>viterbi(C,K,tabs[2],model.u,s>0));if(vv.some(x=>!x))continue;
  const id=K.join(","),score=vv.reduce((z,x)=>z+x.score,0);
  if(!cand.has(id))cand.set(id,{key:K.slice(),score,basin:0});cand.get(id).basin++;
 }
 return [...cand.values()].sort((a,b)=>b.score-a.score);
}
function tri(C,K,model,free,startContext=null){
 // State encodes next phase and two prior symbols, using sentinel 29.
 let cur=new Map();const layers=[];
 if(startContext){const [j,a,b]=startContext;cur.set(j*900+a*30+b,0);}
 else for(let j=0;j<(free?L:1);j++)cur.set(j*900+899,free?-Math.log(L):0);
 for(const c of C){
  const next=new Map(),trace=new Map();
  for(const [state,score] of cur){
   const j=Math.floor(state/900),a=Math.floor(state%900/30),b=state%30;
   function emit(p,k){const id=k*900+b*30+p,sc=score+(b===29?model.u[p]:a===29?model.b[b*29+p]:model.t[a*841+b*29+p]);if(!next.has(id)||sc>next.get(id)){next.set(id,sc);trace.set(id,state);}}
   if(c===0)emit(0,j);
   const p=(c-K[j]+29)%29;if(p)emit(p,(j+1)%L);
  }
  if(!next.size)return null;
  layers.push(trace);cur=next;
 }
 let best=-Infinity,id=-1;for(const [k,v] of cur)if(v>best){best=v;id=k;}
 const end=[Math.floor(id/900),Math.floor(id%900/30),id%30],plain=new Array(C.length);
 for(let i=C.length-1;i>=0;i--){plain[i]=id%30;id=layers[i].get(id);}
 return {score:best,plain,start:Math.floor(id/900),end};
}
function rerank(units,model,candidates,n=80){
 return candidates.slice(0,n).map((c)=>{let vs=units.map((C,i)=>tri(C,c.key,model,i>0));return {...c,triScore:vs.every(Boolean)?vs.reduce((s,v)=>s+v.score,0):-Infinity,vs};}).sort((a,b)=>b.triScore-a.triScore);
}
function encrypt(P,K,start=0){return P.map(p=>{if(!p)return 0;let c=(p+K[start])%29;start=(start+1)%L;return c;});}
function control(corpus,gold,ct){
 const ex=s=>Array.from(s).filter(x=>corpus.runes.includes(x)).map(x=>corpus.runes.indexOf(x)),sections=gold.sections.map(s=>ex(s.source_text)),target=gold.sections.findIndex(s=>s.name==="jpg107-167"),P=sections[target];
 const C=ct.split("$").map(ex).find(s=>s.length===319),K=[0,10,4,0,1,19,0,18,4,18,9,0,18];
 if(P.length!==319||!C||!encrypt(P,K).every((x,i)=>x===C[i]))throw Error("control mismatch");
 const model=train(sections,target),A=C.slice(0,110),B=C.slice(110,219),H=C.slice(219);
 const tests=[];
 for(const [name,units,seed] of [["pooled",[A,B],0x2546],["first",[A],0x2547],["second",[B],0x2548]]){
  const candidates=recover(units,model,seed,R),ranked=rerank(units,model,candidates);
  const truth=c=>name==="second"?Array.from({length:L},(_,j)=>K.slice(j).concat(K.slice(0,j)).join(",")).includes(c.key.join(",")):c.key.join(",")===K.join(",");
  const top=ranked[0],ho=name==="pooled"&&top?tri(H,top.key,model,false,top.vs[1].end):null;
  tests.push({name,count:candidates.length,trueUnigramRank:candidates.findIndex(truth)+1,trueTrigramRank:ranked.findIndex(truth)+1,top:top&&{key:top.key,score:top.triScore,plain:top.vs.map(v=>v.plain),start:top.vs.map(v=>v.start),end:top.vs.map(v=>v.end)},holdout:ho&&{score:ho.score,exact:ho.plain.filter((x,i)=>x===P[219+i]).length,plain:ho.plain}});
 }
 return {tests,controlName:gold.sections[target].name};
}
console.log(JSON.stringify(control(JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8")),JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8")),fs.readFileSync("resources/transcriptions/lp1_wulfic_canonical.txt","utf8")),null,2));
