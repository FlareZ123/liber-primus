'use strict';
/** Plaintext-fed GP29 autokey, latent F holds, q29 primer. */
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function study(inputs,lib,which='both'){
 const gp=JSON.parse(inputs[0]),native=JSON.parse(inputs[1]),assert=(x,m)=>{if(!x)throw Error(m)};
 const alpha=new Map(gp.translit.map((x,i)=>[x,i]));alpha.set("ING",21);
 const rune=new Map(gp.runes.map((x,i)=>[x,i]));
 const seqs=new Map(native.sections.map(s=>[s.name,Array.from(s.source_text).filter(x=>rune.has(x)).map(x=>rune.get(x))]));
 assert(String(seqs.get("p57_parable"))===String(gp.pages[57].indices),"actual p57");
 function donor(s){const start=/\*\*\* START OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[^\r\n]*\*\*\*/i.exec(s);if(start)s=s.slice(start.index+start[0].length);const end=/\*\*\* END OF (?:THIS|THE) PROJECT GUTENBERG EBOOK/i.exec(s);if(end)s=s.slice(0,end.index);let out=[];for(let t of s.match(/[A-Za-z]+/g)||[]){t=t.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");while(t.length){let ok=false;for(let n=Math.min(t.length,3);n>=1;n--){const v=alpha.get(t.slice(0,n));if(v!==undefined){out.push(v);t=t.slice(n);ok=true;break}}assert(ok,"native translation");}}return out}
 const train=inputs.slice(2).map(donor).map(p=>p.slice(0,Math.floor(p.length*.7)));
 const lm=lib.train(train),q=29,split=232,n=308,mod=x=>((x%29)+29)%29;
 let rng=0x330129a5;function rand(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n}

 function encrypt(P,K){const k=K.slice();return P.map(x=>{if(x===0)return 0;const c=mod(x+k.shift());k.push(x);return c})}
 const render=P=>P.map(x=>gp.translit[x]).join("");
 function state(C,mask){
  const phase=new Int8Array(C.length).fill(-1),pos=Array.from({length:q},()=>[]),domains=Array.from({length:q},()=>[]),values=Array(C.length);let j=0,z=0;
  for(let i=0;i<C.length;i++){if(C[i]===0&&((mask>>>z++)&1)){values[i]=[0];continue}const ph=j++%q;phase[i]=ph;pos[ph].push(i);values[i]=[]}
  for(let ph=0;ph<q;ph++){for(let k=0;k<29;k++){let p=k,trail=[];for(const i of pos[ph]){p=mod(C[i]-p);if(!p)break;trail.push(p)}if(trail.length===pos[ph].length){domains[ph].push(k);pos[ph].forEach((i,j)=>values[i].push(trail[j]))}}if(!domains[ph].length)return null}return {phase,domains,values};
 }
 function factors(C,s,order){
  const {phase,domains,values}=s,D=domains.map(x=>x.length),U=D.map(n=>new Float64Array(n)),B=D.map((n,j)=>new Float64Array(n*D[(j+1)%q])),T=order===3?D.map((n,j)=>new Float64Array(n*D[(j+1)%q]*D[(j+2)%q])):null;let constant=0;
  for(let i=0;i<C.length;i++){
   const n=Math.min(i+1,order),start=i-n+1,ph=Array.from(phase.slice(start,i+1)).filter(v=>v>=0),m=ph.length;
   if(!m){constant+=n===1?lm.uni[0]:n===2?lm.bi[0]:lm.tri[0];continue}
   const j=ph[0],out=m===1?U[j]:m===2?B[j]:T[j],v0=values[start],v1=n>=2?values[start+1]:null,v2=n===3?values[start+2]:null;
   if(n===1){for(let a=0;a<v0.length;a++)out[a]+=lm.uni[v0[a]]}
   else if(n===2){let t=0;for(const a of v0)for(const b of v1)out[t++]+=lm.bi[a*29+b]}
   else{let t=0;for(const a of v0)for(const b of v1)for(const c of v2)out[t++]+=lm.tri[(a*29+b)*29+c]}
  }
  if(order===2){for(let j=0;j<q;j++)for(let a=0;a<D[j];a++)for(let b=0;b<D[(j+1)%q];b++)B[j][a*D[(j+1)%q]+b]+=U[j][a];return {D,F:B,constant}}
  for(let j=0;j<q;j++){const db=D[(j+1)%q],dc=D[(j+2)%q];let t=0;for(let a=0;a<D[j];a++)for(let b=0;b<db;b++){const v=U[j][a]+B[j][a*db+b];for(let c=0;c<dc;c++)T[j][t++]+=v}}return {D,F:T,constant};
 }
 function plain(C,s,key){return C.map((_,i)=>s.phase[i]<0?0:s.values[i][s.domains[s.phase[i]].indexOf(key[s.phase[i]])])}
 function marginal(C,s){const S=s.domains.map(x=>new Float64Array(x.length));let z=0;for(let i=0;i<C.length;i++){const ph=s.phase[i];if(ph<0){z+=lm.uni[0];continue}for(let j=0;j<S[ph].length;j++)S[ph][j]+=lm.uni[s.values[i][j]]}for(const v of S){const m=Math.max(...v);z+=m+Math.log(v.reduce((a,b)=>a+Math.exp(b-m),0))-Math.log(29)}return z}
 function frozen(C,split,K){
  let states=new Map([[String.fromCharCode(...K,29,29),{z:0,v:0,path:""}]]),prefixZ=null,peak=1;
  for(let i=0;i<C.length;i++){
   if(i===split)prefixZ=[...states.values()].reduce((z,x)=>lib.logadd(z,x.z),-Infinity);
   const dst=new Map(),c=C[i];
   for(const [key,a] of states){const k=key.charCodeAt(0),x=key.charCodeAt(q),y=key.charCodeAt(q+1),p=mod(c-k);
    const emit=(p,queue)=>{const score=y===29?lm.uni[p]:x===29?lm.bi[y*29+p]:lm.tri[(x*29+y)*29+p],t=queue+String.fromCharCode(y,p),z=a.z+score,v=a.v+score;let b=dst.get(t);if(!b)dst.set(t,{z,v,path:a.path+String.fromCharCode(p)});else{b.z=lib.logadd(b.z,z);if(v>b.v){b.v=v;b.path=a.path+String.fromCharCode(p)}}};
    if(c===0)emit(0,key.slice(0,q));if(p!==0)emit(p,key.slice(1,q)+String.fromCharCode(p))
   }
   states=dst;peak=Math.max(peak,states.size);if(!states.size)return {legal:false,failedAt:i,peak};if(states.size>100000)return {legal:null,reason:"state budget",failedAt:i,peak}
  }
  const a=[...states.values()],best=a.reduce((x,y)=>x.v>y.v?x:y),P=Array.from(best.path,x=>x.charCodeAt(0));assert(String(encrypt(P,K))===String(C),"full replay");
  return {legal:true,peak,score:(a.reduce((z,x)=>lib.logadd(z,x.z),-Infinity)-prefixZ)/(C.length-split),P};
 }
 function solve(name,C,split,P=null,K=null){
  const start=Date.now(),pref=C.slice(0,split),z=pref.filter(v=>!v).length;assert(z<=14,"mask cap");let truthMask=null;
  if(P){truthMask=0;let j=0;for(let i=0;i<split;i++)if(pref[i]===0){if(P[i]===0)truthMask|=1<<j;j++}}
  let ranks=[];for(let mask=0;mask<2**z;mask++){const s=state(pref,mask);if(s)ranks.push({mask,u:marginal(pref,s)})}ranks.sort((a,b)=>b.u-a.u||a.mask-b.mask);
  const b=ranks.slice(0,64).map(x=>{const s=state(pref,x.mask);return {...x,bi:lib.optimize(s,factors(pref,s,2),2).score}}).sort((a,b)=>b.bi-a.bi);
  const t=b.slice(0,z<=3?b.length:8).map(x=>{const s=state(pref,x.mask),v=lib.optimize(s,factors(pref,s,3),3),p=plain(pref,s,v.key);assert(Math.abs(v.score-lib.scorePlain(p,lm))<1e-6,"factor score");assert(String(encrypt(p,v.key))===String(pref),"prefix replay");return {...x,tri:v.score,key:v.key,p}}).sort((a,b)=>b.tri-a.tri);
  return {name,split,seconds:(Date.now()-start)/1000,zeros:z,legalMasks:ranks.length,truthMask,truthRanks:P?[ranks.findIndex(x=>x.mask===truthMask)+1,b.findIndex(x=>x.mask===truthMask)+1,t.findIndex(x=>x.mask===truthMask)+1]:null,truthKey:K,candidates:t.map(x=>{const f=frozen(C,split,x.key);return {mask:x.mask,key:x.key,tri:x.tri,prefix:render(x.p),continuation:f.legal?{legal:true,peak:f.peak,score:f.score,suffix:render(f.P.slice(split)),suffixIndices:f.P.slice(split)}:f,truth:P?{keyCorrect:K.filter((v,i)=>v===x.key[i]).length,prefixCorrect:P.slice(0,split).filter((v,i)=>v===x.p[i]).length,suffixCorrect:f.legal?P.slice(split).filter((v,i)=>v===f.P[split+i]).length:0}:null}})};
 }
 function region(lo,hi,split,cap){
  const target=gp.pages.slice(lo,hi).flatMap(p=>p.indices),n=target.length,controls=[];assert(target.slice(0,split).filter(v=>!v).length===cap,"target F count");
  for(const name of ["0_koan_1","0_loss_of_divinity"]){
   const p=seqs.get(name);let plant=null,draws=0;
   // Accept first source window and first deterministic key under common 14-F budget.
   for(let offset=0;offset+n<=p.length&&!plant;offset++){
    const P=p.slice(offset,offset+n),forced=encrypt(P,Array(q).fill(0)).slice(0,split).filter(v=>!v).length;
    if(forced>14)continue;
    const K=Array.from({length:q},()=>rand(29)),C=encrypt(P,K);draws++;
    if(C.slice(0,split).filter(v=>!v).length<=14)plant={offset,P,K,C}
   }
   if(!plant){controls.push({name,status:"no eligible window",draws});continue}
   controls.push({offset:plant.offset,draws,...solve(name,plant.C,split,plant.P,plant.K)});
  }
  return {lo,hi,split,controls,target:solve("original",target,split)};
 }
 return {q,trainLengths:train.map(p=>p.length),terminal:which==='opening'?null:region(54,56,232,3),opening:which==='terminal'?null:region(0,3,262,14)};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),lib=require("./lp2_fhold_cyclic_ngram_map.cjs");console.log(JSON.stringify(study(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")),lib),null,2));}
module.exports={study,files};
