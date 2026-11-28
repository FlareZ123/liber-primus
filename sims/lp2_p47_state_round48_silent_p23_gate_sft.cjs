'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const silent=require('./lp2_periodic_silent_unbounded_inverse_sft.cjs');
const del=require('./lp2_alt29_delete_exact_latent_viterbi_sft.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const raw={
 gp:read('resources/liber-primus/lp2-corpus.json'),
 shakespeare:read('resources/control/shakespeare_first300k.txt'),
 gibran:read('resources/control/gibran_prophet_58585.txt'),
 emerson:read('resources/control/emerson_essays_2944.txt')
};
const gp=JSON.parse(raw.gp),Tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function words(text){const out=[];for(let w of(text.toUpperCase().match(/[A-Z]+/g)||[])){w=w.replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');const v=[];for(let j=0;j<w.length;){const t=w.startsWith('ING',j)?{s:'ING',i:21}:w.startsWith('IO',j)?{s:'IO',i:27}:Tok.find(x=>w.startsWith(x.s,j));if(!t)throw Error('unmapped '+w.slice(j));v.push(t.i);j+=t.s.length;}out.push(v);}return out;}
const sources=[words(raw.shakespeare),words(raw.gibran),words(raw.emerson)],LM=silent.language(sources),receiver=gp.pages.find(p=>p.page===23).indices.slice(20);
assert.equal(receiver.length,193);
const keys=[['state9',[23,5,6,15,8,19,2,3,4]],['line5',[2,6,3,5,4]]];
const tape=W=>W.flatMap(w=>[...w,29]),held=tape(sources[1].slice(Math.floor(sources[1].length*.57))).slice(4200,4550);
const hidden=[];
for(const [name,key] of keys){
 const M=silent.machine(36,key),plant=M.encode(held),control=silent.decode(M,plant.C,LM,384,0),original=silent.decode(M,receiver,LM,384,0);
 assert(control.P);assert.deepEqual(M.encode(control.P,0).C,plant.C);
 if(original.P)assert.deepEqual(M.encode(original.P,0).C,receiver);
 hidden.push({name,key,control:{score:control.score,printed:plant.C.length,plain:control.P.length,hidden:control.hidden,clock:control.clock},
  original:original.P?{score:original.score,plain:original.P.length,hidden:original.hidden,clock:original.clock,maxHidden:original.maxHidden,
    preview:original.P.slice(0,120).map(v=>v===29?' ':gp.translit[v]).join('')}:
    {failedAt:original.failed,popped:original.popped,maxQueue:original.maxQueue}});
}
assert(hidden[0].control.score>-2.2&&hidden[0].original.score<-5.0);
assert(hidden[1].control.score>-2.2&&hidden[1].original.failedAt===13);

const deletion=[];
for(const [name,key] of keys){
 const K=Array.from({length:1200},(_,i)=>key[i%key.length]);
 const r=del.experiment(raw,{beam:900,maxDeleted:3,decodeInput:{cipher:receiver,key:K}});
 assert.equal(r.status,'candidate decoder output (not authenticated plaintext)');
 deletion.push({name,key,score:r.score,lastConsumedKeyIndex:r.lastConsumedKeyIndex,visited:r.visited,decoded:r.indices.length,preview:r.preview});
}
const controls=del.experiment(raw,{beam:900,maxDeleted:3,plants:2}).results.map(x=>({
 name:x.name,rightScore:x.right.score,wrongScore:x.wrong.score,rightRecovery:x.right.recovery,wrongRecovery:x.wrong.recovery
}));
assert(deletion.every(x=>x.score<-4.2));
assert(controls.every(x=>x.rightScore>-3.2&&x.rightRecovery>.8&&x.wrongScore<-4.0));

const out={scope:'conditional on the Critic-audited candidate p47 DH descriptor grammar; phase0 p23 following-text receiver',
 receiver:{page:23,startRune:20,length:193},hidden36:hidden,gp29Deletion:{original:deletion,controls},
 decision:'candidate p47 state keys fail both calibrated Round48 erasure-channel inverses on the selected p23 body'};
console.log(JSON.stringify(out,null,2));
fs.writeFileSync(path.join(process.env.RUNNER_TEMP||process.cwd(),'source-test-output.json'),JSON.stringify(out,null,2)+'\n');
