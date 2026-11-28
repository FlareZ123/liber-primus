'use strict';
// POST-freeze grading for Agent38 / Director #3406.
// PRETARGET candidate file was committed in f57aa4c2e856fa7991a87675fdfbba2b384309ad.
// This script MUST NOT modify/reselect a source-only candidate.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const frozen=JSON.parse(fs.readFileSync(path.join(root,'im-results/lp2-p6-exceptional-black7-pretarget-output.json'),'utf8'));
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const asc=fs.readFileSync(path.join(root,'resources/historical/cicada2016-4gq25-outguess.asc'),'utf8');
const body=asc.slice(asc.indexOf('\n\n',asc.indexOf('Hash:'))+2,asc.indexOf('-----BEGIN PGP SIGNATURE-----'));
const words=body.match(/[A-Za-z]+/g).map(x=>x.toUpperCase());
assert.equal(words[36],'GOOD');assert.equal(words[41],'VERIFY');assert.equal(words[42],'OPENPGP');
const norm=ch=>ch==='V'?'U':ch;
const targets=[36,41,42].map(j=>[...words[j]].map(ch=>{const i=corpus.translit.indexOf(norm(ch));assert(i>=0);return i;}));
assert.deepEqual(targets.map(x=>x.length),[4,6,7]);
assert.equal(frozen.alternatives.total,48);assert.equal(frozen.variants.length,48);
const scores=frozen.variants.map(v=>{
  const counts=v.receivers.map((r,j)=>r.rawDecoded.filter((q,i)=>q===targets[j][i]).length);
  const complete=v.receivers.map((r,j)=>Number(r.rawDecoded.every((q,i)=>q===targets[j][i])));
  return {representation:v.representation,orientation:v.orientation,sign:v.sign,placement:v.placement,matchedRunes:counts.reduce((a,b)=>a+b,0),matchedCompleteWords:complete.reduce((a,b)=>a+b,0),perPage:counts};
});
const hist={};for(const s of scores)hist[s.matchedRunes]=(hist[s.matchedRunes]||0)+1;
assert.deepEqual(hist,{'0':19,'1':20,'2':5,'3':4});
assert(scores.every(s=>s.matchedCompleteWords===0));
console.log(JSON.stringify({source:'resources/historical/cicada2016-4gq25-outguess.asc',freezeCommit:'f57aa4c2e856fa7991a87675fdfbba2b384309ad',candidateCount:scores.length,targetIndices:targets,hitHistogram:hist,maxMatchedRunes:3,completeWords:0,best:scores.filter(s=>s.matchedRunes===3)},null,2));
