"use strict";
/** Shared cyclic mod36 key, reset only at nine source-visible chapters.
 * Fit first seven chapters, predict final two; same boundary/length plants.
 * Search independently sums each chapter's soft iid marginal likelihood.
 * Exact strict Markov fit-only reranks all unique rotations.
 */
const LEN=[729,1145,1729,1903,1021,1433,1680,3008,308];
function coordinate(chapters,initial,m,s,seed,sweeps=8){
 const rng=s.rng(seed),K=initial.slice(),score=k=>chapters.reduce((a,c)=>a+s.surrogate(c,k,m),0);let value=score(K),calls=1;const history=[];
 for(let sw=0;sw<sweeps;sw++){
 const order=Array.from({length:K.length},(_,i)=>i);for(let i=order.length-1;i>0;i--){const j=rng(i+1);[order[i],order[j]]=[order[j],order[i]];}
 let changes=0;
 for(const j of order){const old=K[j];let best=old;for(let k=0;k<36;k++){if(k===old)continue;K[j]=k;const v=score(K);calls++;if(v>value+1e-10){value=v;best=k;}}K[j]=best;if(best!==old)changes++;}
 history.push({score:value,changes});if(!changes)break;}
 return {K,score:value,calls,history};
}
function exact(chapters,K,m,s){
 const chapter=chapters.map(C=>s.exact(C,K,m).total);
 return {chapter,total:chapter.reduce((a,v,i)=>a+v*chapters[i].length,0)/chapters.reduce((a,C)=>a+C.length,0)};
}
function run(raw,s,opt={}){
 const m=s.model(raw),q=opt.q||8,starts=[17,3301,1033,761];let chapters,truth=null;
 if(opt.original){const C=m.gp.pages.slice(0,56).flatMap(p=>p.indices);let i=0;chapters=LEN.map(n=>{const z=C.slice(i,i+n);i+=n;return z;});}
 else{const seed=opt.keySeed||20261128,r=s.rng(seed);if(starts.includes(seed))throw Error("plant/search seed overlap");truth=Array.from({length:q},()=>r(36));const tape=m.tests[opt.source||"gibran"];let at=opt.offset||5000;chapters=LEN.map(n=>{const z=s.sender(tape.slice(at),truth,n);if(z.C.length!==n)throw Error("plant too short");at+=z.events.length;return z.C;});}
 if(chapters.some((c,i)=>c.length!==LEN[i]))throw Error("chapter length mismatch");
 const fit=chapters.slice(0,7),hold=chapters.slice(7),rows=[],candidates=[],seen=new Set();
 for(const seed of starts){const r=s.rng(seed),initial=Array.from({length:q},()=>r(36));rows.push({seed,initial,...coordinate(fit,initial,m,s,seed^0x9e3779b9)});}
 for(const row of rows)for(let j=0;j<q;j++){const K=row.K.slice(j).concat(row.K.slice(0,j)),id=K.join(",");if(seen.has(id))continue;seen.add(id);candidates.push({K,seed:row.seed,rotation:j,fit:exact(fit,K,m,s).total});}
 candidates.sort((a,b)=>b.fit-a.fit);const best=candidates[0];
 return {source:opt.original?"original":opt.source||"gibran",q,lengths:LEN,rows,candidates,best,fit:exact(fit,best.K,m,s),hold:exact(hold,best.K,m,s),truth:truth?{K:truth,cyclicMatches:s.cyclicMatches(best.K,truth),exactPhase:JSON.stringify(best.K)===JSON.stringify(truth),fit:exact(fit,truth,m,s),hold:exact(hold,truth,m,s)}:null};
}
if(typeof module!=="undefined")module.exports={run,coordinate,exact,LEN};
if(typeof require!=="undefined"&&typeof module!=="undefined"&&require.main===module){
 const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
 const raw={gp:read("resources/liber-primus/lp2-corpus.json"),shakespeare:read("resources/control/shakespeare_first300k.txt"),gibran:read("resources/control/gibran_prophet_58585.txt"),emerson:read("resources/control/emerson_essays_2944.txt")};
 console.log(JSON.stringify(run(raw,require("./lp2_alt36_blind_periodic_hmm_sft.cjs"),JSON.parse(process.argv[2]||"{}")),null,2));
}
