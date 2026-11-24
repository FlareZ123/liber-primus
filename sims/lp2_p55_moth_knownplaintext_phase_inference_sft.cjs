'use strict';
// Director #2623: exact known-plaintext inference, fixed source paths.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
function experiment(book,lp1,assert){
 const rows=lp1.slice(lp1.indexOf("272-138-")).split(/\r?\n/).slice(0,5).map(l=>l.replace(/\/$/,"").split("-"));
 const mod=n=>(n%29+29)%29;
 const F=a=>a.flatMap((v,i)=>v===0?[i]:[]);
 const seq=rows=>rows.flat().filter(c=>!/^\d+$/.test(c)).join("").split("").map(c=>book.runes.indexOf(c));
 const tapes=[["row",seq(rows)],["column",seq(rows[0].map((_,i)=>rows.map(row=>row[i])))]];
 const page=n=>book.pages.find(p=>p.page===n).indices;
 assert(rows.length===5&&rows.every(r=>r.length===5),"square geometry");
 assert(tapes.every(([,a])=>a.length===76&&a.every(x=>x>=0&&x<29)&&F(a).length===4),"source tape count");
 assert(page(55).length===76&&JSON.stringify(F(page(55)))==="[15,25,41]","physical p55 F positions");
 function fit(a,c,q,kind){
   const maps=Array.from({length:q},()=>new Map());
   const reverse=Array.from({length:q},()=>new Map());
   const conflict=[];let t=0;
   for(let i=0;i<50;i++){
     const p=a[i],v=c[i];if(p===0){if(v!==0)conflict.push({i,reason:"literal F",expected:0,actual:v});continue}
     const phase=t++%q,k=kind==="additive"?0:p,z=kind==="additive"?mod(v-p):v;
     const m=maps[phase],rev=reverse[phase];
     if(m.has(k)&&m.get(k).z!==z)conflict.push({i,reason:"forward",phase,first:m.get(k).i,expected:m.get(k).z,actual:z});
     if(kind==="bijection"&&rev.has(z)&&rev.get(z)!==p)conflict.push({i,reason:"injectivity",phase,previousPlain:rev.get(z),actualPlain:p,cipher:z});
     if(!m.has(k))m.set(k,{z,i});
     if(!rev.has(z))rev.set(z,p);
   }
   let known=0,correct=0,unknown=0,wrong=0;
   if(!conflict.length)for(let i=50;i<a.length;i++){
     const p=a[i],m=p===0?null:maps[t++%q],k=kind==="additive"?0:p;
     if(p!==0&&!m.has(k)){unknown++;continue}
     const v=p===0?0:kind==="additive"?mod(p+m.get(k).z):m.get(k).z;
     known++;if(v===c[i])correct++;else wrong++;
   }
   return {q,kind,firstConflict:conflict[0]??null,firstNonFConflict:conflict.find(x=>x.reason!=="literal F")??null,trainingConflicts:conflict.length,holdout:conflict.length?null:{known,correct,wrong,unknown}};
 }
 const targets=[["p55",page(55)],["p53-first",page(53).slice(0,76)],["p53-last",page(53).slice(-76)],["p54-first",page(54).slice(0,76)],["p57-first",page(57).slice(0,76)]];
 const results=tapes.flatMap(([order,a])=>targets.map(([target,c])=>({order,target,plaintextFs:F(a),ciphertextFs:F(c),literalFViolations:F(a).filter(i=>c[i]!==0),fits:[8,13].flatMap(q=>["additive","bijection"].map(kind=>fit(a,c,q,kind)))})));
 assert(results.every(x=>x.fits.every(f=>f.trainingConflicts>0)),"all originals and negatives must be incompatible by training prefix");
 const controls=[];
 for(const [source,a] of [...tapes,["p57",page(57).slice(0,76)]])for(const q of [8,13]){
   const key=Array.from({length:q},(_,i)=>(7*i*i+11*i+3)%29);let t=0;
   const c=a.map(p=>p===0?0:mod(p+key[t++%q]));
   const add=fit(a,c,q,"additive");const bij=fit(a,c,q,"bijection");
   assert(add.trainingConflicts===0&&add.holdout.correct===26&&add.holdout.unknown===0,"additive native positive");
   assert(bij.trainingConflicts===0&&bij.holdout.wrong===0,"bijection native positive (unknown slots are not guessed)");
   // Independently nonadditive permutation plant on each phase.
   t=0;const c2=a.map(p=>{if(p===0)return 0;const j=t++%q;return mod((1+(j*5+1)%28)*p+key[j])});
   const nonadd=fit(a,c2,q,"bijection");
   assert(nonadd.trainingConflicts===0&&nonadd.holdout.wrong===0,"nonadditive phase-map positive");
   controls.push({source,q,add:add.holdout,bij:bij.holdout,nonadd:nonadd.holdout});
 }
 return {results,controls};
}
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
console.log(JSON.stringify(experiment(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/transcriptions/lp1_wulfic_canonical.txt'),assert.ok),null,2));
