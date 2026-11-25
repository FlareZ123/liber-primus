"use strict";
// Agent6: q8 literal-F direction reversal exact original gate.
const fs=require("node:fs"),path=require("node:path");
const core=require("./lp2_fhold_cyclic_ngram_map.cjs");
function experiment(gp,native,core) {
 const q=8,N=232,H=76,mod=x=>(x%29+29)%29,phaseMod=x=>(x+q)%q,ALL=(1<<29)-1;
 const eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
 const check=(x,msg)=>{if(!x)throw Error(msg)};
 const ns=native.sections.map(s=>({name:s.name,a:[...s.source_text].map(x=>gp.runes.indexOf(x)).filter(x=>x>=0)}));
 const render=a=>a.map(x=>gp.translit[x]).join("");
 /** F emits zero, holds the next phase, and reverses the future consuming direction. */
 function encode(P,K){let j=0,d=1;return P.map(p=>{if(!p){d=-d;return 0}const c=mod(p+K[j]);j=phaseMod(j+d);return c})}
 function fixed(C,mask){let j=0,d=1,z=0;const phase=[],allowed=Array(q).fill(ALL);
 for(const c of C){if(c===0&&((mask>>>z++)&1)){phase.push(-1);d=-d;continue}phase.push(j);allowed[j]&=~(1<<c);j=phaseMod(j+d)}
 if(allowed.some(x=>!x))return null;
 return {phase,domains:allowed.map(m=>Array.from({length:29},(_,i)=>i).filter(x=>m&(1<<x))),j,d}}
 /** A reversed adjacent phase triple is assigned to the same cyclic factor in forward coordinate order. */
 function factors(C,s,lm){const D=s.domains.map(a=>a.length),F=D.map((n,j)=>new Float64Array(n*D[(j+1)%q]*D[(j+2)%q]));let constant=0;
 for(let i=0;i<C.length;i++){
 const start=Math.max(0,i-2),n=i-start+1,ph=s.phase.slice(start,i+1),used=[...new Set(ph.filter(x=>x>=0))];
 const score=P=>n===1?lm.uni[P[0]]:n===2?lm.bi[P[0]*29+P[1]]:lm.tri[(P[0]*29+P[1])*29+P[2]];
 if(!used.length){constant+=score(Array(n).fill(0));continue}
 const base=used.find(j=>used.every(x=>phaseMod(x-j)<3));
 check(base!==undefined,"nonlocal phase factor");
 const js=[base,(base+1)%q,(base+2)%q],values=ph.map((j,h)=>j<0?[0]:s.domains[j].map(k=>mod(C[start+h]-k)));
 const pos=ph.map(j=>j<0?-1:js.indexOf(j)),p=Array(n);let idx=0;
 for(let a=0;a<D[js[0]];a++)for(let b=0;b<D[js[1]];b++)for(let c=0;c<D[js[2]];c++){
 const v=[a,b,c];for(let h=0;h<n;h++)p[h]=pos[h]<0?0:values[h][v[pos[h]]];F[base][idx++]+=score(p)
 }
 }
 return {D,F,constant}}
 function fit(C,lm){const z=C.filter(x=>x===0).length;check(z<=5,"mask budget");const rows=[];
 for(let mask=0;mask<2**z;mask++){const s=fixed(C,mask);if(!s)continue;const opt=core.optimize(s,factors(C,s,lm),3);const p=C.map((c,i)=>s.phase[i]<0?0:mod(c-opt.key[s.phase[i]]));check(Math.abs(opt.score-core.scorePlain(p,lm,3))<1e-6,"factor score");check(eq(encode(p,opt.key),C),"prefix replay");rows.push({...opt,p,j:s.j,d:s.d,mask})}
 rows.sort((a,b)=>b.score-a.score||a.mask-b.mask);return rows}
 function suffix(C,best,lm){let rows=[{j:best.j,d:best.d,p:[],score:0}];for(const c of C){const next=[];for(const a of rows){const ctx=best.p.concat(a.p).slice(-2);const add=(p,j,d)=>next.push({j,d,p:a.p.concat(p),score:a.score+lm.tri[(ctx[0]*29+ctx[1])*29+p]});if(!c)add(0,a.j,-a.d);const v=mod(c-best.key[a.j]);if(v)add(v,phaseMod(a.j+a.d),a.d)}rows=next}
 return rows.sort((a,b)=>b.score-a.score)}
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
 const out=[];
 for(const [name,off,seed] of [["0_koan_1",0,3301],["jpg107-167",0,1033]]){
 const s=ns.find(x=>x.name===name),P=s.a.slice(off,off+N+H),lm=core.train(ns.filter(x=>x!==s).map(x=>x.a)),R=rng(seed);let K,C,trial=0,z,h=P.slice(0,N).filter(x=>!x).length;
 for(;trial<10000;trial++){K=Array.from({length:q},()=>R()%29);C=encode(P,K);z=C.slice(0,N).filter(x=>!x).length;if(h>=2&&z>h&&z<=5)break}
 check(trial<10000&&P.length===N+H,"control construction");const rows=fit(C.slice(0,N),lm),best=rows[0],v=suffix(C.slice(N),best,lm);for(const w of v)check(eq(encode(best.p.concat(w.p),best.key),C),"control replay");
 out.push({name,off,seed,trial,h,z,key:K,recovered:best.key,keyExact:eq(K,best.key),prefixExact:best.p.filter((x,i)=>x===P[i]).length,prefixScore:best.score/N,suffixPaths:v.length,suffixExact:v.length?v[0].p.filter((x,i)=>x===P[N+i]).length:null,suffixScore:v.length?v[0].score/H:null})
 }
 const C=gp.pages[54].indices.concat(gp.pages[55].indices),lm=core.train(ns.map(s=>s.a));check(C.length===N+H,"original length");const rows=fit(C.slice(0,N),lm),best=rows[0],v=suffix(C.slice(N),best,lm);for(const w of v)check(eq(encode(best.p.concat(w.p),best.key),C),"original replay");
 out.push({name:"LP2 p54-p55",z:C.slice(0,N).filter(x=>!x).length,legalMasks:rows.length,key:best.key,mask:best.mask,j:best.j,d:best.d,prefixScore:best.score/N,prefix:render(best.p),suffixPaths:v.length,suffix:v.length?render(v[0].p):null,suffixScore:v.length?v[0].score/H:null,maskScores:rows.map(x=>[x.mask,x.score/N])});
 return out;
}
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(experiment(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json"),core),null,2));
