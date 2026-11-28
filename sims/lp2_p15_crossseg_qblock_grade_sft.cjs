'use strict';
// Agent2, 2026-11-28. POST-FREEZE grader for the p15 cross-segment
// q-block decoder.  Do not alter the frozen output after consulting targets.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const frozen=JSON.parse(fs.readFileSync(
  path.join(root,'im-results/lp2-p15-crossseg-qblock-pretarget-output.json'),'utf8'));
const corpus=JSON.parse(fs.readFileSync(
  path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const asc=fs.readFileSync(
  path.join(root,'resources/historical/cicada2016-4gq25-outguess.asc'),'utf8');

assert.equal(frozen.grading,'PRETARGET NO-PLAINTEXT');
assert.equal(frozen.freezeScriptCommit,'2210d346963440fa7002804002999e9737bad6cc');
assert.deepEqual(frozen.tape,[10,5,12,0]);
assert.equal(frozen.candidates.length,2);

const body=asc.slice(asc.indexOf('\n\n',asc.indexOf('Hash:'))+2,
  asc.indexOf('-----BEGIN PGP SIGNATURE-----'));
const words=body.match(/[A-Za-z]+/g).map(x=>x.toUpperCase());
assert.deepEqual(words.slice(32,36),['YOU','WILL','BE','FOUND']);
assert.deepEqual(words.slice(37,41),['LUCK','BEWARE','FALSE','PATHS']);

const tokens=corpus.translit.map((t,i)=>({t,i}))
  .sort((a,b)=>b.t.length-a.t.length);
function encode(word){
  let s=word.replaceAll('QU','CW').replaceAll('ING','NG')
    .replaceAll('V','U').replaceAll('K','C').replaceAll('Z','S');
  const out=[];
  while(s.length){
    const hit=tokens.find(x=>s.startsWith(x.t));
    assert(hit, 'cannot encode '+word+' at '+s);
    out.push(hit.i);
    s=s.slice(hit.t.length);
  }
  return out;
}
const targetBlocks=[
  words.slice(32,36).map(encode),
  words.slice(37,41).map(encode),
];
assert.deepEqual(targetBlocks.map(b=>b.map(x=>x.length)),
  [[3,4,2,5],[4,6,5,4]]);

const scores=frozen.candidates.map(candidate=>{
  let matchingRunes=0, totalRunes=0, completeWords=0;
  const byBlock=[];
  for(let b=0;b<2;b++){
    const block=[];
    for(let j=0;j<4;j++){
      const decoded=candidate.blocks[b].receivers[j].decoded;
      const target=targetBlocks[b][j];
      assert.equal(decoded.length,target.length);
      const matches=decoded.filter((x,i)=>x===target[i]).length;
      matchingRunes+=matches;
      totalRunes+=target.length;
      completeWords+=Number(matches===target.length);
      block.push({matches,total:target.length,
        exact:matches===target.length});
    }
    byBlock.push(block);
  }
  return {sign:candidate.sign,matchingRunes,totalRunes,completeWords,byBlock};
});
assert.deepEqual(scores.map(x=>[x.sign,x.matchingRunes,x.completeWords]),[
  [1,2,0],[-1,0,0]
]);

console.log(JSON.stringify({
  freezeOutputCommit:'902056616e926958043972fa8054665088e99a22',
  source:'resources/historical/cicada2016-4gq25-outguess.asc',
  sourceWords:{
    block1:words.slice(32,36),
    block3:words.slice(37,41),
  },
  targetBlocks,
  scores,
  conclusion:
    'The frozen [Kg,g,aK,F] one-scalar-per-lane additive schedule fails both signs: zero complete source words; best 2/33 target runes. Do not tune phases or exceptions to rescue it.'
},null,2));
