'use strict';
// Director #3065: physical-position prime-minus-one plus a separate consuming
// q8/q13 keyword clock. Exact visible-zero histories; no phase/origin sweep.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const core=require('./lp2_fhold_cyclic_ngram_map.cjs');

function experiment(gp,native){
 const mod=x=>(x%29+29)%29,N=232,H=76,ALL=(1<<29)-1;
 const primes=[];for(let p=2;primes.length<N+H;p++)if(primes.every(k=>k*k>p||p%k))primes.push(p);
 const phi=primes.map(p=>(p-1)%29);
 const eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
 const render=p=>p.map(x=>gp.translit[x]).join('');
 const ns=native.sections.map(s=>({name:s.name,a:[...s.source_text].map(c=>gp.runes.indexOf(c)).filter(x=>x>=0)}));

 // No-hold equivalence: with no literal F, physical i and consuming t coincide.
 function encodePhysical(p,k){
  let t=0;return p.map((v,i)=>v===0?0:mod(v+k[t++%k.length]+phi[i]));
 }
 function encodeConsuming(p,k){
  let t=0;return p.map(v=>v===0?0:mod(v+k[t%k.length]+phi[t++]));
 }
 const noHold=Array.from({length:40},(_,i)=>(i%28)+1),testKey=[4,12,15,20,16,21,17,12];
 assert.deepEqual(encodePhysical(noHold,testKey),encodeConsuming(noHold,testKey),'no-hold equation equivalence');
 const toyPlain=[1,0,2],toyKey=[23];
 const toyPhysical=encodePhysical(toyPlain,toyKey);
 const toyConsuming=encodeConsuming(toyPlain,toyKey);
 assert.equal(toyPhysical[1],0);
 assert.equal(toyPhysical[2],0,'non-F consuming ciphertext-F branch');
 assert.notEqual(toyPhysical[2],toyConsuming[2],'physical and consuming clocks diverge only after a held F');

 // Exact language-free preflight. For each actual ciphertext-zero mask, subtract
 // phi[i] at every consuming physical position and exclude K[phase]=R, which
 // would force forbidden consuming plaintext F. Empty phase domains reject a mask.
 function keyless(c,q){
  const zeroPos=c.map((v,i)=>v===0?i:-1).filter(i=>i>=0),z=zeroPos.length,states=[];
  for(let mask=0;mask<2**z;mask++){
   let t=0,zi=0;const phase=new Int16Array(c.length),residual=new Uint8Array(c.length),allowed=Array(q).fill(ALL);
   for(let i=0;i<c.length;i++){
    if(c[i]===0&&((mask>>>zi++)&1)){phase[i]=-1;residual[i]=0;continue;}
    const ph=t%q,v=mod(c[i]-phi[i]);phase[i]=ph;residual[i]=v;
    allowed[ph]&=~(1<<v);t++;
   }
   const domains=allowed.map(m=>Array.from({length:29},(_,i)=>i).filter(v=>m&(1<<v)));
   if(domains.some(d=>!d.length))continue;
   let keyPairs=1n;for(const d of domains)keyPairs*=BigInt(d.length);
   states.push({mask,phase,residual,domains,t,keyPairs});
  }
  const totalKeyPairs=states.reduce((a,s)=>a+s.keyPairs,0n);
  return {
   zeros:z,totalMasks:2**z,legalMasks:states.length,
   keyPairsByMask:states.map(s=>({mask:s.mask,domainSizes:s.domains.map(d=>d.length),keyPairs:s.keyPairs.toString()})),
   totalMaskKeyPairs:totalKeyPairs.toString(),states
  };
 }
 function recoverPrefix(c,q,lm){
  const pre=keyless(c,q),ranked=[];
  for(const state of pre.states){
   const opt=core.optimize(state,core.factors(state.residual,q,state,lm,3),3);
   const p=state.residual.map((x,i)=>state.phase[i]<0?0:mod(x-opt.key[state.phase[i]]));
   assert(Math.abs(opt.score-core.scorePlain(p,lm,3))<1e-6,'exact cyclic factor score');
   assert(eq(encodePhysical(p,opt.key),c),'physical-clock prefix replay');
   ranked.push({mask:state.mask,key:opt.key,score:opt.score,p,t:state.t,domains:state.domains.map(d=>d.length),keyPairs:state.keyPairs.toString()});
  }
  ranked.sort((a,b)=>b.score-a.score||a.mask-b.mask);
  return {preflight:{zeros:pre.zeros,totalMasks:pre.totalMasks,legalMasks:pre.legalMasks,keyPairsByMask:pre.keyPairsByMask,totalMaskKeyPairs:pre.totalMaskKeyPairs},ranked};
 }
 // Freeze the p54 key and consuming phase; enumerate every legal p55 hold/consume
 // history. Physical prime index continues across the 232/76 seam.
 function suffix(c,best,lm,physicalStart=N){
  let paths=[{t:best.t,p:[],score:0}];
  for(let j=0;j<c.length;j++){
   const v=c[j],physical=physicalStart+j,next=[];
   for(const a of paths){
    const z=mod(v-best.key[a.t%best.key.length]-phi[physical]);
    const add=(p,t)=>{const prev=best.p.concat(a.p).slice(-2);next.push({t,p:a.p.concat([p]),score:a.score+lm.tri[(prev[0]*29+prev[1])*29+p]});};
    if(v===0)add(0,a.t);       // held plaintext F
    if(z!==0)add(z,a.t+1);     // consuming non-F, including v=0
   }
   paths=next;if(!paths.length)break;
  }
  paths.sort((a,b)=>b.score-a.score);
  return paths;
 }
 let rng=0x33012622;const rand=n=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n;};
 const targets=ns.filter(s=>['0_koan_1','0_loss_of_divinity'].includes(s.name));
 assert.equal(targets.length,2,'two independent held-out native sections available');
 const controls=[];
 for(const q of [8,13]){
  for(const s of targets){
   const key=Array.from({length:q},()=>rand(29));let p,c,off;
   for(off=0;off+N+H<=s.a.length;off++){
    p=s.a.slice(off,off+N+H);c=encodePhysical(p,key);
    const held=p.slice(0,N).filter(x=>x===0).length,zeros=c.slice(0,N).filter(x=>x===0).length;
    if(held>=1&&zeros>held&&zeros<=5)break;
   }
   assert(off+N+H<=s.a.length,'source control with both F branches');
   const lm=core.train(ns.filter(x=>x!==s).map(x=>x.a));
   const fit=recoverPrefix(c.slice(0,N),q,lm),best=fit.ranked[0];
   assert(best,'native control has at least one keyless-legal mask');
   const out=suffix(c.slice(N),best,lm,N),truth=p.slice(N);
   for(const a of out)assert(eq(encodePhysical(best.p.concat(a.p),best.key),c),'full native physical-clock replay');
   const bestSuffix=out[0];
   const row={
    name:s.name,q,sourceOffset:off,sourceRunes:p.length,
    heldFInPrefix:p.slice(0,N).filter(x=>x===0).length,
    ciphertextZerosInPrefix:c.slice(0,N).filter(x=>x===0).length,
    consumingCiphertextZerosInPrefix:c.slice(0,N).filter((x,i)=>x===0&&p[i]!==0).length,
    keyExact:eq(key,best.key),key,keyRecovered:best.key,
    prefixExact:best.p.reduce((n,x,i)=>n+ +(x===p[i]),0),
    heldoutExact:bestSuffix?bestSuffix.p.reduce((n,x,i)=>n+ +(x===truth[i]),0):0,
    heldoutLength:H,legalSuffixPaths:out.length,
    prefixScoreNatsPerRune:best.score/N,
    heldoutScoreNatsPerRune:bestSuffix?bestSuffix.score/H:null,
    keylessPreflight:fit.preflight
   };
   assert(row.keyExact,'native key recovery');
   assert.equal(row.heldoutExact,H,'all untouched native suffix runes predicted');
   assert(row.consumingCiphertextZerosInPrefix>0,'control includes consuming ciphertext-F ambiguity');
   controls.push(row);
  }
 }
 // Controls must pass before the original is scored.
 assert.equal(controls.length,4);
 const controlGate=controls.every(x=>x.keyExact&&x.heldoutExact===H);
 assert(controlGate,'two independent plants per q must pass');

 const original=gp.pages[54].indices.concat(gp.pages[55].indices);
 assert.equal(original.length,N+H,'physical p54/p55 split');
 const originalZeros=original.slice(0,N).map((v,i)=>v===0?i:-1).filter(i=>i>=0);
 assert.equal(originalZeros.length,3,'frozen original p54 has exactly three ciphertext-F positions');
 const originalResults=[];
 for(const q of [8,13]){
  const lm=core.train(ns.map(s=>s.a)),fit=recoverPrefix(original.slice(0,N),q,lm);
  if(!fit.ranked.length){
   originalResults.push({q,keylessPreflight:fit.preflight,noLegalPrefixMask:true});
   continue;
  }
  const best=fit.ranked[0],out=suffix(original.slice(N),best,lm,N);
  for(const a of out)assert(eq(encodePhysical(best.p.concat(a.p),best.key),original),'original full replay');
  const bestSuffix=out[0];
  originalResults.push({
   q,keylessPreflight:fit.preflight,noLegalPrefixMask:false,
   bestMask:best.mask,key:best.key,consumingAtSeam:best.t,
   prefixScoreNatsPerRune:best.score/N,
   runnerUpGapNatsPerRune:fit.ranked.length>1?(best.score-fit.ranked[1].score)/N:null,
   prefix:render(best.p),
   legalP55SuffixPaths:out.length,
   bestP55ScoreNatsPerRune:bestSuffix?bestSuffix.score/H:null,
   bestP55:bestSuffix?render(bestSuffix.p):null,
   bestP55PlainIndices:bestSuffix?bestSuffix.p:null,
   maskScores:fit.ranked.map(x=>({mask:x.mask,scoreNatsPerRune:x.score/N,key:x.key,consumingAtSeam:x.t}))
  });
 }
 return {
  model:'C_i=P_i+K[t mod q]+(prime[i]-1) mod29 for P_i!=F; literal plaintext F emits zero and holds t; physical i advances on every rune',
  physicalPrimeCount:phi.length,physicalPrimeResidues:phi,
  equationAudit:{noHoldEquivalentToConsumingClock:true,heldFAdvancesPhysicalButNotKeyword:true,consumingCiphertextZeroAllowed:true,toyPhysical,toyConsuming},
  controls,controlGate,originalPhysicalZeroOffsets:originalZeros,original:originalResults
 };
}
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
const output=experiment(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json'),core,assert.ok);
const rendered=JSON.stringify(output,null,2)+'\n';
const temp=process.env.RUNNER_TEMP||require('node:os').tmpdir();
fs.writeFileSync(path.join(temp,'source-test-output.json'),rendered);
process.stdout.write(rendered);
