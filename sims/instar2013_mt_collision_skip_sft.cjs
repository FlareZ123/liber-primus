'use strict';
/**
 * 2013 PARABLE audio numeric seed -> 2014 LP2 direct MT-rune pad, with exact
 * one-draw collision rejection. Existing mt-only and collision-only studies
 * do not establish this composite.
 *
 * Source seed 1,595,277,641 is the archived 761.MP3 ID3 value and equals the
 * product of the three solved LP2 PARABLE clause GP prime sums 1259*1031*1229.
 * Reuse independently tested CPython 2.7 / PHP 5.6 MT engines and the
 * prior exact one-skip Viterbi, without inventing a new PRNG approximation.
 *
 * Each of the eight original text sections is a fresh MT-seeded 400-rune
 * segment. The first four sections select the public mechanism; the next
 * four are out-of-sample. Each key draw emits GP29 C=(P+sign*K) mod29. The
 * encoder can discard one draw if it would repeat the previous ciphertext.
 * No arbitrary key index is chosen, and skips are possible only at an actual
 * collision. Sources and scores are kept separate from speculative plaintext.
 *
 * SFT: node sims/instar2013_mt_collision_skip_sft.cjs
 * Node.js 22 CJS; checked-in original ciphertext and controls, no network.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {Python27MT}=require('./instar2013_python_mt_inverse.cjs');
const {LegacyPhpMt}=require('./php_legacy_mt.cjs');
const {viterbi}=require('./grid_stream_collision_viterbi.cjs');
const {train,encode}=require('./grid_keyskip_viterbi.cjs');

const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const CORPUS=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const SEED=1595277641, WIN=400, KEYLEN=WIN+40;
const LENGTHS=[729,1145,1738,1894,1021,1433,1680,3316];
const MOD=29;
assert.equal(1259*1031*1229,SEED);
const c=CORPUS.pages.filter(p=>p.page<56&&p.indices.length).flatMap(p=>p.indices);
assert.equal(c.length,12956);
assert.equal(LENGTHS.reduce((a,b)=>a+b,0),c.length);
const sections=[];
for(let at=0,s=0;s<8;s++) {
  const seg=c.slice(at,at+WIN);
  assert.equal(seg.length,WIN);
  sections.push(seg);
  at+=LENGTHS[s];
}
const mod=x=>(x%29+29)%29;

/**
 * @typedef {{engine:'Python27MT'|'PHP56MT',reducer:'wordmod'|'wordscale'|'byte'|'bounded',sign:-1|1}} Config
 * @param {Config} cfg
 * @param {number} seed
 * @param {number} length
 */
function key(cfg,seed=SEED,length=KEYLEN){
  const gen=cfg.engine==='Python27MT'?new Python27MT(seed):new LegacyPhpMt(seed);
  const out=new Uint8Array(length);
  for(let i=0;i<length;i++){
    let v;
    if(cfg.reducer==='bounded'){
      if(cfg.engine==='Python27MT'){
        do{v=gen.get5();}while(v>=29);
      }else v=gen.bounded(0,28);
    }else {
      const x=cfg.engine==='Python27MT'?gen.get31():gen.next31();
      if(cfg.reducer==='wordmod')v=x%29;
      else if(cfg.reducer==='wordscale')v=Math.floor(29*x/2147483648);
      else if(cfg.reducer==='byte')v=(x&255)%29;
      else throw Error('invalid reducer');
    }
    assert(v>=0&&v<29);
    out[i]=v;
  }
  return Array.from(out);
}
/** @returns {Config[]} */
function settings(){
  const out=[];
  for(const engine of ['Python27MT','PHP56MT'])
  for(const reducer of ['wordmod','wordscale','byte','bounded'])
  for(const sign of [-1,1])out.push({engine,reducer,sign});
  assert.equal(out.length,16);
  return out;
}
/**
 * True P->C encoder. The rejected key is tested at the SAME plaintext rune;
 * after one rejection, the next key must be emitted even if it also collides.
 * @param {number[]} plain
 * @param {number[]} pad
 * @param {-1|1} sign
 * @param {()=>number} random
 */
function encrypt(plain,pad,sign,random){
  let at=0,prior=-1,skips=0;
  const cipher=[];
  for(const p of plain){
    assert(at+1<pad.length);
    let val=mod(p+sign*pad[at++]);
    if(prior>=0&&val===prior&&random()<0.81){
      val=mod(p+sign*pad[at++]);skips++;
    }
    cipher.push(val);prior=val;
  }
  return {cipher,skips};
}
/** @param {number} initial */
function randomizer(initial){
  let x=initial>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;
    return (x>>>0)/4294967296;};
}
/**
 * Independent exact forward witness: each trial path starts at key index1,
 * either consumes one normal symbol or one rejected and one accepted draw.
 * An intermediate reject is accepted only for a real previous-cipher match.
 * @param {number[]} plain @param {number[]} ciphertext
 * @param {number[]} pad @param {-1|1} sign
 */
function reencryptable(plain,ciphertext,pad,sign){
  if(mod(plain[0]+sign*pad[0])!==ciphertext[0])return false;
  let states=new Set([1]);
  for(let i=1;i<plain.length;i++){
    const next=new Set();
    for(const at of states){
      if(at<pad.length&&mod(plain[i]+sign*pad[at])===ciphertext[i])
        next.add(at+1);
      if(at+1<pad.length&&mod(plain[i]+sign*pad[at])===ciphertext[i-1]&&
        mod(plain[i]+sign*pad[at+1])===ciphertext[i])
        next.add(at+2);
    }
    if(!next.size)return false;
    states=next;
  }
  return true;
}
/** @param {number[]} seq @param {ReturnType<typeof train>} lm */
function languageScore(seq,lm){
  let s=lm.unigram[seq[0]];
  if(seq.length>1)s+=lm.bigram[29*seq[0]+seq[1]];
  for(let i=2;i<seq.length;i++)s+=lm.trigram[(29*seq[i-2]+seq[i-1])*29+seq[i]];
  return s/seq.length;
}
/**
 * @param {number[][]} original
 * @param {ReturnType<typeof train>} lm
 * @param {number} seed
 */
function scan(original,lm,seed=SEED){
  const all=[];
  for(const cfg of settings()){
    const pad=key(cfg,seed);
    const decoded=original.map(seq=>viterbi(seq,pad,cfg.sign,lm));
    for(let i=0;i<8;i++)assert.ok(reencryptable(decoded[i].plaintext,
      original[i],pad,cfg.sign),'exact recipher '+cfg.engine+'/'+cfg.reducer+'/'+i);
    const train=decoded.slice(0,4).reduce((s,v)=>s+v.perRune,0)/4;
    const held=decoded.slice(4).reduce((s,v)=>s+v.perRune,0)/4;
    all.push({...cfg,train,held,perSection:decoded.map(v=>+v.perRune.toFixed(6)),
      inferredSkips:decoded.map(v=>v.skips),
      decodes:decoded.map(v=>v.plaintext)});
  }
  all.sort((a,b)=>b.train-a.train);
  return all;
}
function main(){
  const raw=read('resources/control/shakespeare_first300k.txt');
  const lm=train(raw.slice(0,180000));
  const source=encode(raw.slice(235000));
  assert(source.length>=8*WIN);
  const trueCfg={engine:'Python27MT',reducer:'bounded',sign:1};
  const p=key(trueCfg),rng=randomizer(0x33012013);
  const plain=Array.from({length:8},(_,s)=>source.slice(s*WIN,(s+1)*WIN));
  const made=plain.map(x=>encrypt(x,p,trueCfg.sign,rng));
  const synthetic=made.map(x=>x.cipher);
  const planted=scan(synthetic,lm);
  const best=planted[0];
  const rank=planted.findIndex(x=>Object.entries(trueCfg)
    .every(([k,v])=>x[k]===v))+1;
  const truth=planted[rank-1];
  const recovered=truth.decodes.reduce((sum,arr,i)=>
    sum+arr.reduce((ss,x,j)=>ss+Number(x===plain[i][j]),0),0);
  const native=plain.map(x=>languageScore(x,lm));
  // Model must have power on source-separated native prose with one-draw
  // collision rejection before interpreting any original failure.
  assert(rank>=1&&rank<=3,'native planted true seed selection rank '+rank);
  assert(recovered>=2800,'source-true planted plaintext recovery under 87.5%');
  assert(truth.held>planted.at(-1).held+0.25,'planted heldout separation');

  const actual=scan(sections,lm);
  const selected=actual[0];
  const nulls=[];
  for(const deviation of [1,2,3,4]){
    const wrong=scan(sections,lm,SEED+deviation);
    nulls.push({seed:SEED+deviation,
      selectedTraining:wrong[0].train,selectedHeldout:wrong[0].held});
  }
  const output={
    hypothesis:'2013 PARABLE ID3 product as CPython2.7/PHP56 MT seed with collision-only single rejected byte',
    sourceSeed:SEED,sourceClausePrimeFactors:[1259,1031,1229],
    originalRunes:12956,originalSections:8,firstRunesPerSection:WIN,
    keyLength:KEYLEN,candidateSettings:16,drawPolicy:'one reject only when proposed ciphertext equals previous emitted rune',
    training:'physical source sections 0..3',heldout:'independent original sections 4..7',
    nativeSourceControl:{meanLogPerRune:native.reduce((a,b)=>a+b,0)/8},
    planted:{trueConfiguration:trueCfg,
      plantedRealSkips:made.map(x=>x.skips),blindTrainRank:rank,
      correctlyRecoveredRunes:recovered,outOf:3200,
      trueTrainScore:truth.train,trueHeldoutScore:truth.held,
      winner:{engine:best.engine,reducer:best.reducer,sign:best.sign,
        train:best.train,held:best.held}},
    original:{
      selected:{engine:selected.engine,reducer:selected.reducer,sign:selected.sign,
        train:selected.train,held:selected.held,
        skips:selected.inferredSkips,
        previewGP:selected.decodes[4].slice(0,70).map(i=>CORPUS.translit[i]).join('')},
      topThree:actual.slice(0,3).map(({engine,reducer,sign,train,held})=>
        ({engine,reducer,sign,train,held})),
      fixedSourceTrueSeed:actual.find(x=>
        x.engine==='Python27MT'&&x.reducer==='bounded'&&x.sign===1)
        .perSection,
      reconstructedOriginalCipherExact:true
    },
    matchedNearbySeedControls:nulls,
    claim:'No authentic plaintext unless the frozen source mechanism recovers GP text on the independent heldout sections'
  };
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
}
if(require.main===module)main();
module.exports={key,settings,encrypt,reencryptable,languageScore,scan,main};
