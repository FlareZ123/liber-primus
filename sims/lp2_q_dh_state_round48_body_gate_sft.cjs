'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const silent=require('./lp2_periodic_silent_unbounded_inverse_sft.cjs');
const del=require('./lp2_alt29_delete_exact_latent_viterbi_sft.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const raw={gp:read('resources/liber-primus/lp2-corpus.json'),shakespeare:read('resources/control/shakespeare_first300k.txt'),gibran:read('resources/control/gibran_prophet_58585.txt'),emerson:read('resources/control/emerson_essays_2944.txt')};
const gp=JSON.parse(raw.gp),ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json')),Tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function words(text){const out=[];for(let w of(text.toUpperCase().match(/[A-Z]+/g)||[])){w=w.replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');const v=[];for(let j=0;j<w.length;){const t=w.startsWith('ING',j)?{s:'ING',i:21}:w.startsWith('IO',j)?{s:'IO',i:27}:Tok.find(x=>w.startsWith(x.s,j));if(!t)throw Error('unmapped '+w.slice(j));v.push(t.i);j+=t.s.length;}out.push(v);}return out;}
const sources=[words(raw.shakespeare),words(raw.gibran),words(raw.emerson)],LM=silent.language(sources);
const state=[23,5,6,15,8,19,2];
function isPrime(n){if(n<2)return false;for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true;}
function nthPrime(rank){let k=0;for(let n=2;;n++)if(isPrime(n)&&++k===rank)return n;}
const T=n=>(nthPrime(n)-1)%29;
const keys=[{name:'raw',key:state},{name:'prime-minus-one',key:state.map(T)}];
assert.deepEqual(keys[1].key,[24,10,12,17,18,8,2]);
const receivers=[];
for(const pageNo of [8,23]){
 const page=gp.pages.find(p=>p.page===pageNo),span=ink.pages.find(p=>p.page===pageNo).red_spans[0];
 assert.equal(span.start,0);
 receivers.push({page:pageNo,start:span.length,C:page.indices.slice(span.length)});
}
assert.deepEqual(receivers.map(x=>[x.page,x.start,x.C.length]),[[8,12,243],[23,16,197]]);
const tape=W=>W.flatMap(w=>[...w,29]),held=tape(sources[1].slice(Math.floor(sources[1].length*.57))).slice(4200,4550);
const results=[];
for(const k of keys){
 const M=silent.machine(36,k.key),plant=M.encode(held),control=silent.decode(M,plant.C,LM,384,0);
 assert(control.P);assert.deepEqual(M.encode(control.P,0).C,plant.C);
 const hidden=[];
 for(const r of receivers){
  const d=silent.decode(M,r.C,LM,384,0);assert(d.P);assert.deepEqual(M.encode(d.P,0).C,r.C);
  hidden.push({page:r.page,start:r.start,length:r.C.length,score:d.score,plain:d.P.length,hidden:d.hidden,clock:d.clock,maxHidden:d.maxHidden,preview:d.P.slice(0,90).map(v=>v===29?' ':gp.translit[v]).join('')});
 }
 const K=Array.from({length:2000},(_,i)=>k.key[i%k.key.length]),deletion=[];
 for(const r of receivers){
  const d=del.experiment(raw,{beam:900,maxDeleted:3,decodeInput:{cipher:r.C,key:K}});
  assert.equal(d.status,'candidate decoder output (not authenticated plaintext)');
  deletion.push({page:r.page,start:r.start,length:r.C.length,score:d.score,lastConsumedKeyIndex:d.lastConsumedKeyIndex,visited:d.visited,preview:d.preview});
 }
 results.push({representation:k.name,key:k.key,hidden36:{sameKeyNativeControl:{score:control.score,printed:plant.C.length,plain:control.P.length,hidden:control.hidden},original:hidden},gp29Deletion:{original:deletion}});
}
assert(Math.abs(results[0].hidden36.sameKeyNativeControl.score+1.9193967771648186)<1e-12);
assert(Math.abs(results[0].hidden36.original[0].score+4.894902463877811)<1e-12);
assert(Math.abs(results[0].hidden36.original[1].score+4.86520341589697)<1e-12);
assert(Math.abs(results[0].gp29Deletion.original[0].score+4.11176523597062)<1e-12);
assert(Math.abs(results[0].gp29Deletion.original[1].score+4.204708302277448)<1e-12);
assert(Math.abs(results[1].hidden36.sameKeyNativeControl.score+1.8314138855167588)<1e-12);
assert(Math.abs(results[1].hidden36.original[0].score+5.258767341704342)<1e-12);
assert(Math.abs(results[1].hidden36.original[1].score+5.094123092248355)<1e-12);
assert(Math.abs(results[1].gp29Deletion.original[0].score+4.236561604905771)<1e-12);
assert(Math.abs(results[1].gp29Deletion.original[1].score+4.157746574420159)<1e-12);
const controls=del.experiment(raw,{beam:900,maxDeleted:3,plants:2}).results.map(x=>({name:x.name,rightScore:x.right.score,wrongScore:x.wrong.score,rightRecovery:x.right.recovery,wrongRecovery:x.wrong.recovery}));
assert(controls.every(x=>x.rightScore>-3.2&&x.rightRecovery>.8&&x.wrongScore<-4.0));
for(const r of results)r.gp29Deletion.controls=controls;
const out={scope:'post-discovery Q-directed DH state key transfer; no plaintext promoted',state:{labels:['p','g','a','b','A','B','K'],values:state},representations:keys,receivers:receivers.map(r=>({page:r.page,start:r.start,length:r.C.length})),results,decision:'neither raw nor authentic prime-minus-one state representation is the periodic key for either calibrated erasure channel on either Q-selected black body'};
console.log(JSON.stringify(out,null,2));
fs.writeFileSync(path.join(process.env.RUNNER_TEMP||process.cwd(),'source-test-output.json'),JSON.stringify(out,null,2)+'\n');
