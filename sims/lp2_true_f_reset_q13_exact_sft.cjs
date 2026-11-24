'use strict';
// Director #2624. Exact q13 true-F reset. Condition key[0] to absorb cross-reset trigram chords.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const core=require('./lp2_fhold_cyclic_ngram_map.cjs');
function experiment(gp,native,core,assert,which="all"){
 const q=13,N=232,H=76,mod=x=>(x%29+29)%29,eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const ns=native.sections.map(s=>({name:s.name,a:[...s.source_text].map(c=>gp.runes.indexOf(c)).filter(x=>x>=0)}));
 const render=p=>p.map(x=>gp.translit[x]).join("");
 function encode(p,k){let t=0;return p.map(v=>{if(!v){t=0;return 0}const c=mod(v+k[t]);t=(t+1)%q;return c})}
 function suffix(c,best,lm){let paths=[{t:best.t,p:[],score:0}];for(const v of c){const next=[];for(const a of paths){const z=mod(v-best.key[a.t]);const add=(p,t)=>{const prev=best.p.concat(a.p).slice(-2);next.push({t,p:a.p.concat(p),score:a.score+lm.tri[(prev[0]*29+prev[1])*29+p]})};if(v===0)add(0,0);if(z!==0)add(z,(a.t+1)%q)}paths=next}return paths.sort((a,b)=>b.score-a.score)}
 function fit(c,lm){const z=c.filter(v=>v===0).length,ranked=[];assert(z<=5,"mask budget");for(let mask=0;mask<2**z;mask++){
  const phase=[],allowed=Array(q).fill((1<<29)-1);let t=0,f=0;
  for(const v of c){if(v===0&&((mask>>>f++)&1)){phase.push(-1);t=0;continue}phase.push(t);allowed[t]&=~(1<<v);t=(t+1)%q}
  if(allowed.some(x=>!x))continue;
  const domains=allowed.map(m=>Array.from({length:29},(_,i)=>i).filter(x=>m&(1<<x))),d=domains.map(a=>a.length);
  const U=d.map(n=>new Float64Array(n)),B=d.map((n,j)=>new Float64Array(n*d[(j+1)%q])),T=d.map((n,j)=>new Float64Array(n*d[(j+1)%q]*d[(j+2)%q])),E=d.map(n=>new Float64Array(n*d[0]));
  let constant=0;
  for(let i=0;i<c.length;i++){const start=Math.max(0,i-2),positions=[];for(let h=start;h<=i;h++)if(phase[h]>=0)positions.push(h);const ph=positions.map(h=>phase[h]),m=ph.length;const p=Array(i-start+1).fill(0);const evalTerm=()=>p.length===1?lm.uni[p[0]]:p.length===2?lm.bi[p[0]*29+p[1]]:lm.tri[(p[0]*29+p[1])*29+p[2]];
   if(!m){constant+=evalTerm();continue}
   const j=ph[0],ordinary=m===1||ph.every((x,l)=>x===(j+l)%q);assert(ordinary||m===2&&ph[1]===0,"cross-reset chord");
   const dest=m===1?U[j]:m===2?(ordinary?B[j]:E[j]):T[j];
   function walk(l,idx){if(l===m){dest[idx]+=evalTerm();return}const h=positions[l],j=ph[l];for(let a=0;a<d[j];a++){p[h-start]=mod(c[h]-domains[j][a]);walk(l+1,idx*d[j]+a)}}walk(0,0)
  }
  let best=null;
  for(let k0=0;k0<d[0];k0++){const ds=d.slice();ds[0]=1;const dom=domains.map((a,j)=>j===0?[a[k0]]:a);
    const F=ds.map((n,j)=>{const b=(j+1)%q,g=(j+2)%q,arr=new Float64Array(n*ds[b]*ds[g]);let idx=0;for(let a=0;a<n;a++)for(let h=0;h<ds[b];h++)for(let l=0;l<ds[g];l++){const aa=j===0?k0:a,hh=b===0?k0:h,ll=g===0?k0:l;arr[idx++]=T[j][(aa*d[b]+hh)*d[g]+ll]+U[j][aa]+B[j][aa*d[b]+hh]+E[j][aa*d[0]+k0]}return arr});
    const opt=core.optimize({domains:dom},{D:ds,F,constant},3);if(!best||opt.score>best.score)best=opt
  }
  const p=c.map((v,i)=>phase[i]<0?0:mod(v-best.key[phase[i]]));assert(Math.abs(best.score-core.scorePlain(p,lm,3))<1e-6,"factor exact");assert(eq(encode(p,best.key),c),"prefix replay");ranked.push({...best,p,t,mask})
 }ranked.sort((a,b)=>b.score-a.score||a.mask-b.mask);return {z,ranked}}
 const controls=[["0_koan_1",0,[15,17,16,10,23,17,16,1,26,10,4,7,7]],["0_loss_of_divinity",103,[3,18,6,27,28,27,15,21,17,15,8,15,20]]],out=[];
 for(const [name,off,key] of controls){
  if(which==="original")continue;const s=ns.find(x=>x.name===name),lm=core.train(ns.filter(x=>x!==s).map(x=>x.a)),p=s.a.slice(off,off+N+H),c=encode(p,key),h=p.slice(0,N).filter(x=>!x).length,z=c.slice(0,N).filter(x=>!x).length;let t=0;for(const v of p.slice(0,N))t=v?(t+1)%q:0;assert(h>=2&&z>h&&z<=5&&suffix(c.slice(N),{t,key,p:p.slice(0,N)},lm).length===1,"structural calibration");
  const a=fit(c.slice(0,N),lm),best=a.ranked[0],v=suffix(c.slice(N),best,lm);for(const w of v)assert(eq(encode(best.p.concat(w.p),best.key),c),"control replay");
  out.push({name,off,h,z,legal:a.ranked.length,keyExact:eq(key,best.key),key,recovered:best.key,prefixExact:best.p.filter((x,i)=>x===p[i]).length,prefixScore:best.score/N,suffixPaths:v.length,suffixExact:v.length?v[0].p.filter((x,i)=>x===p[N+i]).length:null,suffixScore:v.length?v[0].score/H:null})
 }
 if(which!=="controls"){const c=gp.pages[54].indices.concat(gp.pages[55].indices),lm=core.train(ns.map(s=>s.a)),a=fit(c.slice(0,N),lm),best=a.ranked[0],v=suffix(c.slice(N),best,lm);for(const w of v)assert(eq(encode(best.p.concat(w.p),best.key),c),"original replay");out.push({name:"LP2 p54-55",z:a.z,legal:a.ranked.length,key:best.key,mask:best.mask,t:best.t,prefixScore:best.score/N,prefix:render(best.p),suffixPaths:v.length,suffix:v.length?render(v[0].p):null,suffixScore:v.length?v[0].score/H:null,maskScores:a.ranked.map(x=>[x.mask,x.score/N])})}
 return out
}
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json'),core,assert.ok,process.argv[2]||'all'),null,2));
