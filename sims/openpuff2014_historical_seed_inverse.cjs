'use strict';
/**
 * Original-cipher LP2 attack using the independently published 2014 Cicada
 * OpenPuff password as a CPython 2.7 MT19937 seed. Source-defined candidate
 * spelling 33011033, plus archived 33011103 variant and wrong-seed control.
 * The key can consume one extra draw only if the rejected ciphertext output
 * would equal the previous published rune.
 *
 * SFT (Node 22, CommonJS): node sims/openpuff2014_historical_seed_inverse.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {Python27MT}=require('./instar2013_python_mt_inverse.cjs');
const {train,encode:gpEncode}=require('./grid_keyskip_viterbi.cjs');
const {viterbi}=require('./grid_stream_collision_viterbi.cjs');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source=read('resources/control/shakespeare_first300k.txt');
const groups=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],
  [33,39],[40,55]].map(([a,b])=>corpus.pages.filter(p=>
  p.page>=a&&p.page<=b).flatMap(p=>p.indices));
assert.deepEqual(groups.map(x=>x.length),
  [729,1145,1729,1903,1021,1433,1680,3316]);
const originals=groups.map(a=>a.slice(0,240));
const SEEDS=[33011033,33011103,33011034];
const reducers=['word31mod','word31scale','byte31','bits5','float29'];
const mod=x=>(x%29+29)%29;

/** @param {number} seed @param {string} reducer @param {number} n */
function pad(seed,reducer,n=280) {
  const mt=new Python27MT(seed),out=[];
  for(let i=0;i<n;i++){
    if(reducer==='bits5'){
      let x=mt.get5();
      while(x>=29)x=mt.get5();
      out.push(x);
    }else if(reducer==='float29'){
      out.push(Math.floor(mt.random()*29));
    }else{
      const x=mt.get31();
      out.push(reducer==='word31mod'?x%29:
        reducer==='word31scale'?Math.floor(x*29/2147483648):
        (x&255)%29);
    }
  }
  return out;
}
/** @param {number[][]} ciphers @param {object} lm */
function rank(ciphers,lm){
  const choices=[];
  for(const seed of SEEDS)for(const reducer of reducers)
  for(const sign of [-1,1]){
    const k=pad(seed,reducer);
    const decoded=ciphers.map(cipher=>viterbi(cipher,k,sign,lm));
    choices.push({seed,reducer,sign,
      perRune:decoded.reduce((sum,x)=>sum+x.perRune,0)/decoded.length,
      bySection:decoded.map(x=>x.perRune),
      skippedKeyCounts:decoded.map(x=>x.skips),
      openingGuess:decoded[0].plaintext.slice(0,45)
        .map(x=>corpus.translit[x]).join('')});
  }
  return choices.sort((a,b)=>b.perRune-a.perRune);
}
/** @param {number[]} p @param {number[]} k */
function plant(p,k) {
  let state=0x33011033,at=0,prev=-1,skips=0;
  const cipher=[],witness=[];
  const rand=()=>{
    state^=state<<13;state^=state>>>17;state^=state<<5;
    return (state>>>0)/4294967296;
  };
  for(const symbol of p){
    let next=mod(symbol+k[at]),skipped=false;
    if(next===prev&&rand()<.81){
      assert.equal(next,prev);
      at++;skips++;skipped=true;
      next=mod(symbol+k[at]);
    }
    cipher.push(next);witness.push(skipped);prev=next;at++;
  }
  return {cipher,skips,witness};
}
function main(){
  const model=train(source.slice(0,195000));
  const originalsRanked=rank(originals,model);
  assert.equal(originalsRanked.length,30);
  const trueSeed=33011033,trueMode='bits5',trueSign=1;
  const p=gpEncode(source.slice(210000)).slice(0,240);
  assert.equal(p.length,240);
  const key=pad(trueSeed,trueMode);
  const planted=plant(p,key);
  const recovered=viterbi(planted.cipher,key,trueSign,model);
  const exact=recovered.plaintext.filter((v,i)=>v===p[i]).length;
  assert.equal(exact,240);
  assert.equal(recovered.skips,planted.skips);
  let at=0;
  for(let i=0;i<p.length;i++){
    if(planted.witness[i]){
      assert.equal(mod(p[i]+key[at]),planted.cipher[i-1]);
      at++;
    }
    assert.equal(mod(recovered.plaintext[i]+key[at]),planted.cipher[i]);
    at++;
  }
  const plantedRanked=rank([planted.cipher],model);
  assert.equal(plantedRanked[0].seed,trueSeed);
  assert.equal(plantedRanked[0].reducer,trueMode);
  assert.equal(plantedRanked[0].sign,trueSign);
  const output={
    candidateSource:'2014 Cicada OpenPuff historical 33011033 password',
    alternateArchivedSpelling:33011103,
    wrongSeedControl:33011034,
    originalTotalRunes:groups.reduce((n,g)=>n+g.length,0),
    originalTrainingRunes:originals.length*240,
    originalSelectedRanking:originalsRanked.slice(0,5),
    historicalSources:SEEDS.slice(0,2).map(seed=>
      originalsRanked.find(x=>x.seed===seed)),
    wrongSeed:originalsRanked.find(x=>x.seed===33011034),
    planted:{source:source.slice(210000,210070),trueSeed,
      reducer:trueMode,sign:trueSign,hiddenSkips:planted.skips,
      recoveredSkips:recovered.skips,all240PlaintextRecovered:exact===240,
      exactSourceForwardReencryption:true,
      blindModelSelected:true,perRune:recovered.perRune},
    status:'No authenticated unknown LP2 plaintext, key or original cipher. Bounded negative for direct seeded MT GP29 with collision skips.'
  };
  assert.equal(output.originalTotalRunes,12956);
  console.log(JSON.stringify(output,null,2));
}
if(require.main===module)main();
module.exports={pad,rank,plant,main};
