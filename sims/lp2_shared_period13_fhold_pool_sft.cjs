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

function assess(corpus,gold,ct,mode){
 const ex=s=>Array.from(s).filter(x=>corpus.runes.includes(x)).map(x=>corpus.runes.indexOf(x));
 const sections=gold.sections.map(s=>ex(s.source_text)),idx=gold.sections.findIndex(s=>s.name==="jpg107-167"),P=sections[idx];
 const C=ct.split("$").map(ex).find(s=>s.length===319);
 const model=train(sections,mode==="original"?-1:idx);
 const K=[0,10,4,0,1,19,0,18,4,18,9,0,18],random=rng(0x2546a);
 let A,B,H,known=null;
 if(mode==="original"){
  A=corpus.pages.filter(p=>p.page>=23&&p.page<=26).flatMap(p=>p.indices);
  const U=corpus.pages.filter(p=>p.page>=54&&p.page<=55).flatMap(p=>p.indices);
  B=U.slice(0,208);H=U.slice(208);
 }else if(mode==="matched"){A=C.slice(0,110);B=C.slice(110,219);H=C.slice(219);known=P;}
 else{A=C.slice(0,110);const J=Array.from({length:L},()=>random()%29),U=encrypt(P.slice(110),J,7);B=U.slice(0,109);H=U.slice(109);known=P;}
 const top=(units,seed)=>{
  const candidates=recover(units,model,seed,R),ranking=rerank(units,model,candidates);
  const t=ranking[0];if(!t)return {count:candidates.length};
  return {count:candidates.length,key:t.key,score:t.triScore,unigram:t.score,runner:ranking[1]?.triScore,starts:t.vs.map(x=>x.start),ends:t.vs.map(x=>x.end),plaintext:t.vs.map(x=>x.plain),
  replay:t.vs.every((v,i)=>encrypt(v.plain,t.key,v.start).every((x,j)=>x===units[i][j]))};
 };
 const pooled=top([A,B],0x2546),first=top([A],0x2547),second=top([B],0x2548);
 const held=pooled.key?tri(H,pooled.key,model,false,pooled.ends[1]):null;
 const secondHeld=second.key?tri(H,second.key,model,false,second.ends[0]):null;
 const latin=p=>p.map(x=>corpus.translit[x]).join("");
 return {mode,lengths:[A.length,B.length,H.length],pooled:{...pooled,plaintext:pooled.plaintext?.map(latin)},first:{...first,plaintext:first.plaintext?.map(latin)},second:{...second,plaintext:second.plaintext?.map(latin)},holdout:held&&{score:held.score,perRune:held.score/H.length,plain:latin(held.plain),exact:known?held.plain.filter((x,i)=>x===known[219+i]).length:null,replay:encrypt(held.plain,pooled.key,pooled.ends[1][0]).every((x,i)=>x===H[i])},secondHoldout:secondHeld&&{score:secondHeld.score,perRune:secondHeld.score/H.length,plain:latin(secondHeld.plain),exact:known?secondHeld.plain.filter((x,i)=>x===known[219+i]).length:null},poolTrainExact:known&&pooled.plaintext?pooled.plaintext.flat().filter((x,i)=>x===known[i]).length:null,independentTrainingScore:first.score!=null&&second.score!=null?first.score+second.score:null};
}


function phaseProfile(C,holdBits,model){
 const hist=new Uint16Array(L*29);
 let phase=0,zero=0,holds=0;
 for(const c of C){
  if(c===0&&holdBits[zero++]){holds++;continue;}
  hist[phase*29+c]++;phase=(phase+1)%L;
 }
 const rows=[];
 for(let j=0;j<L;j++){
  const row=[];
  for(let k=0;k<29;k++){
   if(hist[j*29+k])continue;
   let score=0;for(let c=0;c<29;c++)if(hist[j*29+c])score+=hist[j*29+c]*model.u[(c-k+29)%29];
   row.push([k,score]);
  }
  if(!row.length)return null;
  rows.push(row);
 }
 return {rows,holdScore:holds*model.u[0],holds};
}
function enumerateBits(n,limit,rng){
 if(n<=16&&2**n<=limit)return Array.from({length:2**n},(_,i)=>Array.from({length:n},(_,j)=>(i>>>j)&1));
 const seen=new Set(),out=[];
 for(let i=0;i<limit;i++){
  const prob=[.25,.5,.75,.1,.9][i%5],p=Array.from({length:n},()=>rng()/4294967296<prob?1:0);
  const id=p.join("");if(!seen.has(id)){seen.add(id);out.push(p);}
 }
 return out;
}
function pathInitialize(units,model,seed,budget=4096){
 const random=rng(seed),A=units[0],B=units[1],aZero=A.filter(x=>x===0).length,bZero=B?.filter(x=>x===0).length??0;
 const aBits=enumerateBits(aZero,budget,random),bBits=B?enumerateBits(bZero,2**Math.min(bZero,16),random):[[]];
 const bProfiles=[];
 if(B)for(const bits of bBits){const p=phaseProfile(B,bits,model);if(!p)continue;for(let initial=0;initial<L;initial++){
  const rows=Array.from({length:L},()=>new Float64Array(29).fill(-Infinity));
  for(let j=0;j<L;j++)for(const [k,score] of p.rows[j])rows[(j+initial)%L][k]=score;
  bProfiles.push({rows,score:p.holdScore-Math.log(L),holds:p.holds,initial});
 }}
 const candidates=new Map();let aFeasible=0,pairs=0;
 for(const bits of aBits){
  const a=phaseProfile(A,bits,model);if(!a)continue;aFeasible++;
  for(const b of B?bProfiles:[null]){
   let score=a.holdScore+(b?.score??0);const key=[];
   for(let j=0;j<L;j++){
    let best=-Infinity,kBest=-1;
    for(const [k,value] of a.rows[j]){
     const v=value+(b?b.rows[j][k]:0);
     if(v>best){best=v;kBest=k;}
    }
    if(kBest<0)break;
    score+=best;key.push(kBest);
   }
   if(key.length!==L)continue;pairs++;
   const id=key.join(","),old=candidates.get(id);
   if(!old||score>old.score)candidates.set(id,{key,score,basin:1,holds:[a.holds,b?.holds],phase:b?.initial});
  }
 }
 // Exact per-path best key; re-evaluate latent states on training only.
 const tab=likelihood(model.u,Infinity);
 const ranked=[...candidates.values()].map(c=>{
  const paths=units.map((C,i)=>viterbi(C,c.key,tab,model.u,i>0));
  if(paths.some(x=>!x))throw Error("constructed path should be legal");
  return {...c,score:paths.reduce((s,v)=>s+v.score,0)};
 }).sort((a,b)=>b.score-a.score);
 return {ranked,aSchedules:aBits.length,aFeasible,bProfiles:bProfiles.length,pairs,unique:candidates.size};
}
function assessPathInit(corpus,gold,ct,mode){
 const ex=s=>Array.from(s).filter(x=>corpus.runes.includes(x)).map(x=>corpus.runes.indexOf(x)),sections=gold.sections.map(s=>ex(s.source_text)),idx=gold.sections.findIndex(s=>s.name==="jpg107-167"),P=sections[idx],C=ct.split("$").map(ex).find(s=>s.length===319);
 const model=train(sections,mode==="original"?-1:idx),random=rng(0x2546a);
 let A,B,H,known=null;
 if(mode==="original"){A=corpus.pages.filter(p=>p.page>=23&&p.page<=26).flatMap(p=>p.indices);const U=corpus.pages.filter(p=>p.page>=54&&p.page<=55).flatMap(p=>p.indices);B=U.slice(0,208);H=U.slice(208);}
 else if(mode==="matched"){A=C.slice(0,110);B=C.slice(110,219);H=C.slice(219);known=P;}
 else{A=C.slice(0,110);const J=Array.from({length:L},()=>random()%29),U=encrypt(P.slice(110),J,7);B=U.slice(0,109);H=U.slice(109);known=P;}
 const latin=p=>p.map(x=>corpus.translit[x]).join("");
 function get(units,seed){
  const result=pathInitialize(units,model,seed),ranked=rerank(units,model,result.ranked,80),t=ranked[0];
  const {ranked:_,...counts}=result;
  if(!t)return counts;
  return {...counts,key:t.key,score:t.triScore,runner:ranked[1]?.triScore,starts:t.vs.map(v=>v.start),ends:t.vs.map(v=>v.end),native:t.vs.map(v=>v.plain),plain:t.vs.map(v=>latin(v.plain)),replay:t.vs.every((v,i)=>encrypt(v.plain,t.key,v.start).every((x,j)=>x===units[i][j]))};
 }
 const pooled=get([A,B],0x2546b),first=get([A],0x2547b),second=get([B],0x2548b);
 const held=pooled.key?tri(H,pooled.key,model,false,pooled.ends[1]):null,secondHeld=second.key?tri(H,second.key,model,false,second.ends[0]):null;
 const clean=x=>{const {native,...rest}=x;return rest;};
 return {mode,lengths:[A.length,B.length,H.length],pooled:clean(pooled),first:clean(first),second:clean(second),poolTrainExact:known&&pooled.native?pooled.native.flat().filter((x,i)=>x===known[i]).length:null,
 held:held&&{score:held.score,perRune:held.score/H.length,plain:latin(held.plain),exact:known?held.plain.filter((x,i)=>x===known[219+i]).length:null,replay:encrypt(held.plain,pooled.key,pooled.ends[1][0]).every((x,i)=>x===H[i])},
 secondHeld:secondHeld&&{score:secondHeld.score,perRune:secondHeld.score/H.length,plain:latin(secondHeld.plain),exact:known?secondHeld.plain.filter((x,i)=>x===known[219+i]).length:null},
 independentTrainingScore:first.score!=null&&second.score!=null?first.score+second.score:null};
}


function boundaryAudit(corpus,gold){
 const ex=s=>Array.from(s).filter(x=>corpus.runes.includes(x)).map(x=>corpus.runes.indexOf(x)),model=train(gold.sections.map(s=>ex(s.source_text)),-1);
 const B=corpus.pages.filter(p=>p.page>=54&&p.page<=55).flatMap(p=>p.indices),prefix=B.slice(0,208);
 const keys=[{name:"pooled",K:[0,0,12,27,11,11,21,14,23,0,15,14,12],start:9},{name:"independent",K:[6,16,20,15,24,27,17,4,13,26,17,19,14],start:0}];
 return keys.map(({name,K,start})=>{
  const pre=tri(prefix,K,model,false,[start,29,29]),fixed=tri(B,K,model,false,[start,29,29]),free=tri(B,K,model,true);
  function describe(result,initial){
   if(!result)return null;
   const p=result.plain;let ps=model.u[p[0]]+model.b[p[0]*29+p[1]],hs=0;
   for(let i=2;i<p.length;i++){let z=model.t[p[i-2]*841+p[i-1]*29+p[i]];if(i<208)ps+=z;else hs+=z;}
   return {start:result.start,prefixScore:ps,suffixPerRune:hs/100,plain:p.slice(208).map(x=>corpus.translit[x]).join(""),replay:encrypt(p,K,result.start).every((x,i)=>x===B[i])};
  }
  return {name,prefixScore:pre?.score,fixedStartFull:describe(fixed,start),freeStartDiagnostic:describe(free,null)};
 });
}

console.log(JSON.stringify(control(JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8")),JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8")),fs.readFileSync("resources/transcriptions/lp1_wulfic_canonical.txt","utf8")),null,2));

for(const mode of ["matched","mismatch","original"])console.log(JSON.stringify(assess(JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8")),JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8")),fs.readFileSync("resources/transcriptions/lp1_wulfic_canonical.txt","utf8"),mode),null,2));

for(const mode of ["matched","mismatch","original"])console.log(JSON.stringify(assessPathInit(JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8")),JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8")),fs.readFileSync("resources/transcriptions/lp1_wulfic_canonical.txt","utf8"),mode),null,2));

console.log(JSON.stringify(boundaryAudit(JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8")),JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8"))),null,2));
