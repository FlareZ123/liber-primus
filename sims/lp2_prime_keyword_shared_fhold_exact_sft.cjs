'use strict';
// Director #2622: exact fixed-origin prime-plus-keyword inversion.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const core=require('./lp2_fhold_cyclic_ngram_map.cjs');
function experiment(gp,native,core,assert,which="all"){
 const mod=x=>(x%29+29)%29,N=232,H=76;
 const primes=[];for(let p=2;primes.length<N+H;p++)if(primes.every(k=>k*k>p||p%k))primes.push(p);
 const phi=primes.map(p=>(p-1)%29);
 const eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
 const ns=native.sections.map(s=>({name:s.name,a:[...s.source_text].map(c=>gp.runes.indexOf(c)).filter(x=>x>=0)}));
 const render=p=>p.map(x=>gp.translit[x]).join("");
 function encode(p,k){let t=0;return p.map(v=>v===0?0:mod(v+k[t%k.length]+phi[t++]));}
 function recoverPrefix(c,q,lm){
   const z=c.filter(v=>v===0).length;assert(z<=5,"prefix mask budget");const ranked=[];
   for(let mask=0;mask<2**z;mask++){
     let t=0,f=0;const phase=new Int16Array(c.length),allowed=Array(q).fill((1<<29)-1),R=[];
     for(let i=0;i<c.length;i++){if(c[i]===0&&((mask>>>f++)&1)){phase[i]=-1;R.push(0);continue}const j=t%q,v=mod(c[i]-phi[t++]);phase[i]=j;R.push(v);allowed[j]&=~(1<<v);}
     if(allowed.some(x=>!x))continue;
     const domains=allowed.map(m=>Array.from({length:29},(_,i)=>i).filter(x=>m&(1<<x))),state={phase,domains};
     const opt=core.optimize(state,core.factors(R,q,state,lm,3),3);
     const p=R.map((x,i)=>phase[i]<0?0:mod(x-opt.key[phase[i]]));
     assert(Math.abs(opt.score-core.scorePlain(p,lm,3))<1e-6,"factor score exact");
     assert(eq(encode(p,opt.key),c),"prefix replay");
     ranked.push({mask,key:opt.key,t,score:opt.score,p,domains:domains.map(x=>x.length)});
   }
   ranked.sort((a,b)=>b.score-a.score||a.mask-b.mask);return {z,total:2**z,legal:ranked.length,ranked};
 }
 function suffix(c,best,lm){
   let paths=[{t:best.t,p:[],score:0}];
   for(const v of c){const next=[];for(const a of paths){const z=mod(v-best.key[a.t%best.key.length]-phi[a.t]);const add=(p,t)=>{const prev=best.p.concat(a.p).slice(-2);next.push({t,p:a.p.concat([p]),score:a.score+lm.tri[(prev[0]*29+prev[1])*29+p]});};if(v===0)add(0,a.t);if(z!==0)add(z,a.t+1);}paths=next;}
   paths.sort((a,b)=>b.score-a.score);return paths;
 }
 let rng=0x33012622;const rand=n=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n};
 const results=[];for(const q of [8,13]){
   for(const s of ns.filter(s=>["0_koan_1","0_loss_of_divinity"].includes(s.name))){
     const key=Array.from({length:q},()=>rand(29));if(which!=="all"&&which!==`q${q}`)continue;
     let p,c,off;
     for(off=0;off+N+H<=s.a.length;off++){p=s.a.slice(off,off+N+H);c=encode(p,key);const h=p.slice(0,N).filter(x=>x===0).length,z=c.slice(0,N).filter(x=>x===0).length;if(h>=1&&z>h&&z<=5)break;}
     assert(off+N+H<=s.a.length,"sparse native calibration selection");
     const lm=core.train(ns.filter(x=>x!==s).map(x=>x.a)),fit=recoverPrefix(c.slice(0,N),q,lm),best=fit.ranked[0],out=suffix(c.slice(N),best,lm);
     if(out.length)assert(eq(encode(best.p.concat(out[0].p),best.key),c),"full native replay");
     results.push({name:s.name,q,off,z:fit.z,legal:fit.legal,truth:key,recovered:best.key,keyExact:eq(key,best.key),prefixExact:best.p.reduce((n,x,i)=>n+ +(x===p[i]),0),prefixScore:best.score/N,suffixPaths:out.length,suffixExact:out.length?out[0].p.reduce((n,x,i)=>n+ +(x===p[N+i]),0):null,suffixScore:out.length?out[0].score/H:null,trueSuffixScore:(core.scorePlain(p,lm,3)-core.scorePlain(p.slice(0,N),lm,3))/H});
   }
   if(which!=="all"&&which!==`q${q}`)continue;
   const c=gp.pages[54].indices.concat(gp.pages[55].indices);assert(c.length===N+H,"p54/55 split");
   const lm=core.train(ns.map(s=>s.a)),fit=recoverPrefix(c.slice(0,N),q,lm),best=fit.ranked[0],out=suffix(c.slice(N),best,lm);
   for(const a of out)assert(eq(encode(best.p.concat(a.p),best.key),c),"full original replay");
   results.push({name:"LP2 p54-55",q,z:fit.z,legal:fit.legal,key:best.key,mask:best.mask,t:best.t,domains:best.domains,prefixScore:best.score/N,runnerGap:best.score-fit.ranked[1].score,prefix:render(best.p),suffixPaths:out.length,suffixScore:out.length?out[0].score/H:null,suffix:out.length?render(out[0].p):null,maskScores:fit.ranked.map(x=>({mask:x.mask,score:x.score/N,key:x.key}))});
 }
 return results;
}
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json'),core,assert.ok,process.argv[2]||'all'),null,2));
