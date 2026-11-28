'use strict';
// Agent 47: source-derived Q on complete printed p54+p55 words.
// Direct signed-2016 bigram receiver vs all nonzero GF(29^2) multipliers.
// node sims/agent47_p3q_wordpair_signed_gate_sft.cjs
const fs=require('node:fs'), assert=require('node:assert/strict'), path=require('node:path');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const tape=fs.readFileSync(path.join(root,'resources/transcriptions/lp2-image-corrected.txt'),'utf8');
const signed=fs.readFileSync(path.join(root,'resources/historical/cicada2016-4gq25-outguess.asc'),'utf8');
const mod=x=>(x%29+29)%29;
const mul=([a,b],[c,d])=>[mod(a*c+8*b*d),mod(a*d+b*c+3*b*d)];
const Eval=seq=>{let value=[0,0],power=[1,0];for(const z of seq){value=[mod(value[0]+z*power[0]),mod(value[1]+z*power[1])];power=mul(power,[0,1]);}return value;};
const runes=new Set(corpus.runes);
const segments=tape.split('%').map(raw=>({raw,indices:[...raw].filter(c=>runes.has(c)).map(c=>corpus.runes.indexOf(c))}));
function groups(page){
  const a=corpus.pages.find(p=>p.page===page).indices;
  const section=segments.find(z=>z.indices.length===a.length&&z.indices.every((v,i)=>v===a[i]));
  assert.ok(section,'corrected original page is not uniquely mapped');
  const g=section.raw.replace(/\s/g,'').replace(/\//g,'').split(/[-.$&§]+/)
    .map(x=>[...x].filter(c=>runes.has(c)).map(c=>corpus.runes.indexOf(c))).filter(x=>x.length);
  assert.deepStrictEqual(g.flat(),a,'exact word-group reconstruction');
  return g;
}
const p54=groups(54),p55=groups(55);
assert.equal(p54.length,50); assert.equal(p55.length,17);
const words=(signed.slice(signed.indexOf('Hello.'),signed.indexOf('-----BEGIN PGP SIGNATURE-----'))
  .match(/[A-Za-z]+/g)||[]).map(w=>w.toUpperCase());
assert.equal(words.length,43);
const bigrams=new Set();for(let i=0;i<words.length-1;i++)bigrams.add(words[i]+' '+words[i+1]);
const residues=p54.concat(p55).map(Eval);
const score=Q=>{
  const hits=[];let adjacentIndices=0;
  for(let i=0;i<residues.length;i++){
    const [a,b]=mul(Q,residues[i]);
    if(b===a+1)adjacentIndices++;
    const pair=words[a]+' '+words[b];
    if(bigrams.has(pair))hits.push({group:i,coordinates:[a,b],sourceBigram:pair});
  }
  return {Q,hits,score:hits.length,adjacentIndices};
};
const rows=[];
for(let a=0;a<29;a++)for(let b=0;b<29;b++)if(a||b)rows.push(score([a,b]));
assert.equal(rows.length,840);
rows.sort((a,b)=>b.score-a.score||b.adjacentIndices-a.adjacentIndices||a.Q[0]-b.Q[0]||a.Q[1]-b.Q[1]);
const target=rows.find(r=>r.Q.join(',')==='17,24');
assert.ok(target);
const rank=rows.indexOf(target)+1,better=rows.filter(r=>r.score>target.score).length;
const ties=rows.filter(r=>r.score===target.score).length;
assert.equal(target.score,9);
assert.equal(target.adjacentIndices,2);
assert.equal(better,155);
assert.equal(ties,105);
const result={classification:'word-complete, source-typed signed-bigram direct receiver, not a recovered key',
  source:{field:'u^2=3u+8',Q:[17,24],pages:[54,55],wordCount:residues.length,
    signedSourceWords:words.length,authenticBigrams:[...bigrams].length},
  nullFamily:{nonzeroMultipliers:840,median:rows[Math.floor(rows.length/2)].score,
    mean:rows.reduce((s,r)=>s+r.score,0)/rows.length,
    best:rows.slice(0,5).map(r=>({Q:r.Q,score:r.score,adjacentIndices:r.adjacentIndices}))},
  frozenQ:{rank,better,ties,score:target.score,adjacentIndices:target.adjacentIndices,hits:target.hits},
  decision:'The source-fixed Q does not distinguish itself from arbitrary nonzero multipliers as a direct complete-word-to-consecutive-signed-bigram decoder; even without tuning its 9 hits rank 235/840. Do not interpret isolated THE MAP/THE PATH/THE ROAD as recovered body plaintext.'};
console.log(JSON.stringify(result,null,2));
if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,'source-test-output.json'),JSON.stringify(result,null,2));
