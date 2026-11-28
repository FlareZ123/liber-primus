'use strict';
// Agent10, Issue #3382: score *already committed*, complete pre-target
// q-block1 key outputs from SHA 67230ab163769be057243c6c4e36034b4580e5a1.
// This file is a separate grading commit. NEVER change frozen candidates
// after consulting signed-source target bytes.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const frozen=JSON.parse(fs.readFileSync(
  path.join(root,'im-results/lp2-p6-4word-serializer-pretarget-output.json'),'utf8'));
const corpus=JSON.parse(fs.readFileSync(
  path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const asc=fs.readFileSync(
  path.join(root,'resources/historical/cicada2016-4gq25-outguess.asc'),'utf8');
const body=asc.slice(asc.indexOf('\n\n',asc.indexOf('Hash:'))+2,
  asc.indexOf('-----BEGIN PGP SIGNATURE-----'));
const words=body.match(/[A-Za-z]+/g).map(x=>x.toUpperCase());
assert.deepEqual(words.slice(32,36),['YOU','WILL','BE','FOUND']);
const targets=words.slice(32,36).map(word=>[...word].map(ch=>{
  const i=corpus.translit.indexOf(ch);
  assert(i>=0);return i;
}));
assert.deepEqual(targets.map(x=>x.length),[3,4,2,5]);
assert.equal(frozen.grading,'PRETARGET NO-PLAINTEXT');
assert.equal(frozen.candidates.length,18);
const scores=frozen.candidates.map(x=>{
  assert.deepEqual(x.decoded.map(v=>v.length),[3,4,2,5]);
  const matches=x.decoded.reduce((sum,word,j)=>
    sum+word.filter((r,i)=>r===targets[j][i]).length,0);
  const whole=x.decoded.reduce((sum,word,j)=>
    sum+Number(word.every((r,i)=>r===targets[j][i])),0);
  return {encoding:x.encoding,sign:x.sign,clock:x.clock,
    matchingRunes:matches,matchingCompleteWords:whole};
});
const histogram={};for(const x of scores)
  histogram[x.matchingRunes]=(histogram[x.matchingRunes]||0)+1;
const best=Math.max(...scores.map(x=>x.matchingRunes));
assert.equal(best,2);
assert.deepEqual(histogram,{'0':7,'1':10,'2':1});
assert(scores.every(x=>x.matchingCompleteWords===0));
console.log(JSON.stringify({
 source:'resources/historical/cicada2016-4gq25-outguess.asc',
 freezeCommit:'67230ab163769be057243c6c4e36034b4580e5a1',
 candidateCount:scores.length,targetRuneCounts:[3,4,2,5],
 targetRuneIndices:targets,histogram,maxMatchingRunes:best,
 completeSourceWordHits:0,allFourWordMatches:0,
 conclusion:'No source-derived ordered key in this 18-rule family matches even one complete signed source word'
},null,2));
