'use strict';
/*
 * POST-COMMIT GRADER for the separate source-only p30/p31 heldout.
 *
 * First commit the exact JSON produced by lp2_p6_prefix_holdout_freeze_sft.cjs.
 * Use that commit SHA as immutable GitHub evidence. This grader must be run
 * only after the separate frozen artifact exists and is independently dated.
 *
 * Usage:
 * node sims/lp2_p6_prefix_holdout_grade_sft.cjs --selftest
 * node sims/lp2_p6_prefix_holdout_grade_sft.cjs <frozen-file> <declared-sha256> <pretarget-commit-SHA>
 */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),mod=x=>((x%29)+29)%29;
const sum=xs=>mod(xs.reduce((a,b)=>a+b,0));
function score(payload,expectedDigest,pretargetCommit,corpus,source){
 assert(/^[a-f0-9]{40}$/.test(pretargetCommit),'record independently verifiable GitHub pretarget commit SHA-1');
 const sha=crypto.createHash('sha256').update(JSON.stringify(payload.frozen)).digest('hex');
 assert.equal(sha,expectedDigest,'frozen-source SHA mismatch');
 assert.equal(payload.sha256,sha,'internal canonical digest mismatch');
 assert.equal(payload.canonicalBytes,JSON.stringify(payload.frozen).length,'canonical size mismatch');
 assert.equal(payload.frozen.status,'FROZEN PRETARGET');
 assert.equal(payload.frozen.pages.length,2);
 const body=source.replace(/\r\n/g,'\n').split('-----BEGIN PGP SIGNATURE-----')[0];
 const cut=body.indexOf('\n\n',body.indexOf('Hash:'));
 assert(cut>=0,'cannot parse signed message header');
 const words=body.slice(cut+2).match(/[A-Za-z]+/g).map(x=>x.toUpperCase());
 assert.equal(words[30],'SEEK');assert.equal(words[31],'AND');
 const target=words.slice(30,32).map(w=>[...w].map(ch=>{
   const normal=ch==='V'?'U':ch,idx=corpus.translit.indexOf(normal);
   assert(idx>=0,'non-GP target letter '+ch);return idx;
 }));
 const details=[];
 for(let i=0;i<2;i++){
  const frozen=payload.frozen.pages[i],page=i+30,n=i===0?4:3,offset=i===0?112:126;
  assert.equal(frozen.page,page);assert.equal(frozen.start,offset);
  assert.deepEqual(frozen.preparedCipher,corpus.pages[page].indices.slice(offset,offset+n));
  assert.equal(frozen.key.length,n);assert.equal(frozen.decoded.length,n);
  assert.equal(sum(frozen.key),[20,9][i]);
  assert.deepEqual(frozen.decoded,frozen.preparedCipher.map((x,j)=>mod(x-frozen.key[j])));
  const hits=frozen.decoded.filter((x,j)=>x===target[i][j]).length;
  details.push({page,hitCount:hits,arity:n,completeWordMatch:hits===n});
 }
 return {status:'POSTCOMMIT GRADED',source:'resources/historical/cicada2016-4gq25-outguess.asc',
  pretargetCommit,sha256:sha,targetIndices:target,details,
  matchedRunes:details.reduce((a,b)=>a+b.hitCount,0),
  completeWords:details.reduce((a,b)=>a+Number(b.completeWordMatch),0),
  caution:'pretarget commit chronology and derivation independence must be checked externally; this script verifies bytes and arithmetic, not intellectual independence'};
}
function selftest(){
 const f={schema:1,status:'FROZEN PRETARGET',pages:[{page:30,start:112,preparedCipher:[21,3,12,11],key:[0,0,0,20],decoded:[21,3,12,20]},{page:31,start:126,preparedCipher:[12,23,1],key:[0,0,9],decoded:[12,23,21]}]};
 // Testing hashing without applying fake controls to the signed input:
 const c=JSON.stringify(f),digest=crypto.createHash('sha256').update(c).digest('hex');
 assert.equal(digest.length,64);
 assert.notEqual(digest,crypto.createHash('sha256').update(JSON.stringify({...f,status:'changed'})).digest('hex'));
 console.log(JSON.stringify({status:'PASS',name:'p30/p31 after-freeze grade integrity selftest',sha256:digest}));
}
if(require.main===module){
 if(process.argv[2]==='--selftest')selftest();
 else {
  assert.equal(process.argv.length,5,'require frozen filename, exact frozen.sha256, prior pretarget commit');
  const payload=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
  const signed=fs.readFileSync(path.join(root,'resources/historical/cicada2016-4gq25-outguess.asc'),'utf8');
  console.log(JSON.stringify(score(payload,process.argv[3],process.argv[4],corpus,signed),null,2));
 }
}
module.exports={score};
