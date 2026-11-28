'use strict';
/*
 * LP2 p30/p31 SEEK/AND heldout key commitment harness (Director #3402).
 * This entire file is source-only: it NEVER reads the signed 2016 message.
 * Submit a separate decoder that emits exact per-page ordered keys on an
 * untouched original receiver, freeze the output in a GitHub commit, and only
 * THEN run the separate `_grade_sft.cjs` program.
 *
 * Usage:
 *   node sims/lp2_p6_prefix_holdout_freeze_sft.cjs --selftest
 *   node sims/lp2_p6_prefix_holdout_freeze_sft.cjs path/to/candidate.json > path/to/frozen.json
 * Candidate JSON: {"schema":1,"model":"source-only description, no target words",
 * "keys":{"30":[0,0,0,20],"31":[0,0,9]}}
 */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),mod=x=>((x%29)+29)%29;
const sum=xs=>mod(xs.reduce((a,b)=>a+b,0));
const arities={30:4,31:3};
const sums={30:20,31:9};
const receivers={30:{start:112,ordinal:27,indices:[21,3,12,11]},31:{start:126,ordinal:32,indices:[12,23,1]}};
function evaluate(candidate,corpus){
 assert(candidate&&candidate.schema===1,'candidate.schema=1 required');
 assert(typeof candidate.model==='string'&&candidate.model.length>=20,'describe independently derived model');
 assert(candidate.keys&&typeof candidate.keys==='object','candidate.keys required');
 const pages=[];
 for(const k of ['30','31']){
  const key=candidate.keys[k],n=arities[k],receiver=receivers[k],page=Number(k);
  assert(Array.isArray(key)&&key.length===n,'complete key arity for p'+k);
  assert(key.every(x=>Number.isInteger(x)&&x>=0&&x<29),'keys must be canonical GP0 values');
  assert.deepEqual(corpus.pages[page].indices.slice(receiver.start,receiver.start+n),receiver.indices,'original receiver changed');
  assert.equal(sum(key),sums[k],'key must satisfy p6-frozen page-key checksum on p'+k);
  const decoded=receiver.indices.map((c,i)=>mod(c-key[i]));
  assert(decoded.every((p,i)=>mod(p+key[i])===receiver.indices[i]),'forward re-encryption failure');
  pages.push({page,start:receiver.start,localWordOrdinalOneBased:receiver.ordinal,preparedCipher:receiver.indices,key,decoded,checksum:sums[k]});
 }
 return {schema:1,status:'FROZEN PRETARGET',model:candidate.model,
  receiverConvention:'signed-source zero based / local manuscript one based',
  originalInput:'resources/liber-primus/lp2-corpus.json',
  method:'GP29 additive inverse P=C-K mod29, full exact forward re-encryption',
  pages};
}
function commit(candidate,corpus){
 const response=evaluate(candidate,corpus);
 const encoded=JSON.stringify(response);
 return {frozen:response,sha256:crypto.createHash('sha256').update(encoded).digest('hex'),canonicalBytes:encoded.length};
}
function selftest(){
 const fake={schema:1,model:'SYNTHETIC invariant positive control, not a candidate manuscript rule',keys:{30:[0,0,0,20],31:[0,0,9]}};
 const mock={pages:Array.from({length:32},()=>({indices:[]}))};
 for(const [k,v] of Object.entries(receivers)){const page=Number(k);mock.pages[page].indices=Array(v.start).fill(29).concat(v.indices);}
 const a=commit(fake,mock),b=commit(fake,mock);
 assert.deepEqual(a,b);assert.equal(a.frozen.pages.length,2);assert.equal(a.frozen.pages[0].decoded.length,4);assert.equal(a.frozen.pages[1].decoded.length,3);
 assert.throws(()=>evaluate({...fake,keys:{30:[0,0,0,20],31:[0,0,0]}},mock),/checksum/);
 assert.throws(()=>evaluate({...fake,keys:{30:[0,0,0],31:[0,0,9]}},mock),/arity/);
 console.log(JSON.stringify({status:'PASS',name:'p30/p31 sealed original-cipher pretarget commitment selftest',frozenHash:a.sha256,assertions:'length, exact original receiver, sum, reencryption, immutable encoding'}));
}
if(require.main===module){
 if(process.argv.length===2||process.argv[2]==='--selftest')selftest();
 else {
  assert.equal(process.argv.length,3,'pass a candidate filename or --selftest');
  const candidate=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
  console.log(JSON.stringify(commit(candidate,corpus),null,2));
 }
}
module.exports={evaluate,commit};
