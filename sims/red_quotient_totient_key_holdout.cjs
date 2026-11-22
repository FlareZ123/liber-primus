'use strict';
/**
 * Test the red-source quotient q = prime-sum / 29 as an anchor for the
 * historically genuine LP2 page56 prime-totient stream. Source selected
 * anchors: p15 (q22), p40 (q15), p53 (q78). The direct predictions are
 * the body ciphertext following the marked headings/stanza. Fit only
 * the 24 labelled key conventions on the p15 body and predict p40+p54.
 *
 * Original-input inverse is exact; planted English is an exact forward
 * ciphertext with the same three independent quotient-derived q-1 starts.
 * Node.js 22 CommonJS: node sims/red_quotient_totient_key_holdout.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {totientKey,decodePages,ioc}=require('./twin_prime_totient_holdout.cjs');
const {encode}=require('./affine_echo_literary_control.cjs');
const ROOT=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(
  path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(
  path.join(ROOT,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));
const P=corpus.pages;
const MOD=29;
const mod=n=>(n%MOD+MOD)%MOD;
const {primes,key}=totientKey();

/** Verify exact source-defined red sums instead of setting key values freely. */
function quotient(page,start,length) {
  const source=ink.pages.find(x=>x.page===page);
  assert.ok(source.red_spans.some(x=>x.start===start&&x.length===length));
  const runes=P[page].indices.slice(start,start+length);
  assert.equal(runes.length,length);
  const total=runes.reduce((t,x)=>t+corpus.prime[x],0);
  assert.equal(total%MOD,0);
  return {page,start,length,total,quotient:total/MOD};
}
/** Source-led whole-scoped ciphertext segments, not fitted to score. */
function targets() {
  const specs=[
    {label:'page15-two-red-headings-followed-by-section',q:quotient(15,0,9),
      groups:[P[15].indices.slice(20),...P.slice(16,23).map(p=>p.indices)]},
    {label:'page40-red-heading-followed-by-next-section',q:quotient(40,0,8),
      groups:[P[40].indices.slice(8),...P.slice(41,49).map(p=>p.indices)]},
    {label:'page53-red-stanza-followed-by-terminal-title',q:quotient(53,128,51),
      groups:[P[54].indices.slice(9),P[55].indices]}
  ];
  assert.deepEqual(specs.map(s=>[s.q.quotient,s.groups.flat().length]),
    [[22,1883],[15,2400],[78,299]]);
  return specs;
}
function keyStart(spec,model) {
  const q=spec.q.quotient;
  if(model==='q-as-one-based-prime-index')return q-1;
  if(model==='p-q-as-prime-index')return primes[q-1];
  if(model==='phi-p-q-as-prime-index')return primes[q-1]-1;
  throw Error('Unknown model');
}
function ciphertextDecode(spec,config) {
  return decodePages(spec.groups,key,keyStart(spec,config.model),
    config.sign,config.flip,config.skip,false);
}
/** Reversible exact non-F-skip, no-flip positive encryption of sourced GP. */
function positive(specs) {
  const text=fs.readFileSync(
    path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8');
  const source=(text.match(/[A-Za-z]+/g)||[]).flatMap(w=>encode(w));
  let offset=0,successful=0,pre=0;
  for(const spec of specs){
    const n=spec.groups.flat().length,start=keyStart(spec,'q-as-one-based-prime-index');
    const plain=source.slice(offset,offset+n);
    assert.equal(plain.length,n);
    offset+=n;
    const c=plain.map((p,j)=>mod(p+key[start+j]));
    const got=decodePages([c],key,start,-1,false,false,false).flat();
    assert.deepEqual(got,plain);
    successful+=got.length;
    if(spec===specs[0])pre=ioc([got]);
  }
  return {source:'Shakespeare control GP register',keySource:'q-1',runes:successful,
    firstSectionRecoveredIoC:pre,allExact:true};
}
function run() {
  const specs=targets();
  const configs=[];
  for(const model of ['q-as-one-based-prime-index',
    'p-q-as-prime-index','phi-p-q-as-prime-index'])
    for(const sign of[-1,1])
      for(const flip of[false,true])
        for(const skip of[false,true]){
          const x={model,sign,flip,skip};
          const scores=specs.map(s=>ioc(ciphertextDecode(s,x)));
          configs.push({...x,scores});
        }
  assert.equal(configs.length,24);
  configs.sort((a,b)=>b.scores[0]-a.scores[0]);
  const winner=configs[0];
  const direct=configs.find(x=>x.model==='q-as-one-based-prime-index'
    &&x.sign===-1&&!x.flip&&x.skip);
  assert.ok(direct);
  assert.ok(winner.scores[0]<0.04);
  assert.ok(specs.every((s,i)=>Math.max(...configs.map(x=>x.scores[i]))<0.04));
  const result={
    model:'Source-red GP sum divisible by29 gives q as historically genuine prime-totient key-stream start; source spans p15,p40,p53',
    candidates:configs.length,scopes:specs.map(s=>({
      name:s.label,source:s.q,originalCipherIoC:ioc(s.groups),
      n:s.groups.flat().length
    })),
    selectedOnPage15Only:winner,
    untouchedPage40IoC:winner.scores[1],
    untouchedTerminalIoC:winner.scores[2],
    historicalDirectStartConvention:direct,
    individualUpperEnvelopes:specs.map((_,i)=>
      Math.max(...configs.map(c=>c.scores[i]))),
    positive:positive(specs),
    verdict:'No LP2 plaintext. None of the exact original rune intervals shows language-like GP IoC under the fixed red-quotient prime-totient interpretations. F-skipped forms concentrate ciphertext F and should not be mistaken for a recovered key.'
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)run();
module.exports={quotient,targets,keyStart,ciphertextDecode,positive,run};
