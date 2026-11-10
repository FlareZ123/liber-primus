'use strict';
/**
 * Finite source-key inverse for a two-register, reversible GP29/28 field cipher.
 *
 * At each non-initial word-start, one secret GP letter maps to a zero F29 step.
 * At all other positions a different GP letter maps to zero. All 28 remaining
 * letters map bijectively to nonzero steps using root 15 and a source AES-CTR
 * keystream. Latin Vulgate length-matched original event counts select
 * G(index6) / X(index14), provisionally, not as an authenticated Cicada key.
 *
 * Candidate AES128 keys are selected by the known p15 Fibonacci-prime spiral
 * from original p49-51 base60 bytes, as in the existing sourceIVs() tool.
 * Both word and book AES clocks, skip/consume-zero, sign and two byte reducers
 * are tested on the actual 12,956 original runes. Native Latin source and
 * planted known-key controls calibrate the GP-word language test.
 *
 * Node 22, CommonJS; run: node sims/dual_marker_latin_field_inverse.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createCipheriv}=require('node:crypto');
const {parseSharedCorpus}=require('./lp2_word_pages.cjs');
const {sourceIVs}=require('./fibonacci_indexed_grid_iv.cjs');
const {powers,logs}=require('./ea_zero_step_reversible.cjs');

const ROOT=path.join(__dirname,'..');
const read=name=>fs.readFileSync(path.join(ROOT,name),'utf8');
const GP=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const WORDS=parseSharedCorpus().words;
const N=12956, BASE=29, PERIOD=28, BEGIN=6, INTERIOR=14;
const CIPHER=GP.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
assert.equal(CIPHER.length,N);
assert.equal(WORDS.length,2896);
const start=new Uint8Array(N),end=new Uint8Array(N);
let offset=0;
for(const w of WORDS){
  start[offset]=1;
  end[offset+w.length-1]=1;
  offset+=w.length;
}
assert.equal(offset,N);
const plainWordRunes=WORDS.flatMap(w=>[...w.runes].map(r=>GP.runes.indexOf(r)));
assert.deepEqual(plainWordRunes,CIPHER);
const originalEvents=[0,0,0];
for(let i=1;i<N;i++)if(CIPHER[i]===CIPHER[i-1]){
  originalEvents[start[i]?0:end[i]?2:1]++;
}
assert.deepEqual(originalEvents,[23,44,19]);

const latinAlpha='0123456789ABCDEFGHIJKLMNOPQRS';
const latin=read('resources/control/latin-vulgate-gp-wholewords.txt')
  .split(/\r?\n/u)
  .filter(w=>/^[0-9A-S]+$/u.test(w))
  .map(w=>[...w].map(c=>latinAlpha.indexOf(c)));
assert.equal(latin.length,39835);

const STATES=31, START=29, END=30, TRI=STATES**3;
const wordModel=(()=>{
  const n3=new Float64Array(TRI),n2=new Float64Array(STATES**2);
  const c2=new Float64Array(STATES**2),c1=new Float64Array(STATES);
  const unigram=new Float64Array(STATES);
  let total=0;
  for(const word of latin.slice(0,24000)){
    let a=START,b=START;
    for(const c of [...word,END]){
      n3[(a*STATES+b)*STATES+c]++;
      c2[a*STATES+b]++;
      n2[b*STATES+c]++;
      c1[b]++;
      unigram[c]++;
      total++;
      a=b;b=c;
    }
  }
  const wordScore=word=>{
    let a=START,b=START,sum=0;
    for(const c of [...word,END]){
      const p3=(n3[(a*STATES+b)*STATES+c]+0.3)/
        (c2[a*STATES+b]+0.3*STATES);
      const p2=(n2[b*STATES+c]+0.3)/
        (c1[b]+0.3*STATES);
      const p1=(unigram[c]+0.5)/(total+0.5*STATES);
      sum+=Math.log(0.70*p3+0.25*p2+0.05*p1);
      a=b;b=c;
    }
    return sum;
  };
  return {wordScore,trainingWords:24000};
})();

const KEYS=sourceIVs().map(k=>({name:k.name,key:k.iv}));
const MODES=KEYS.flatMap(key=>[-1,1].flatMap(sign=>[false,true]
  .flatMap(scaled=>[false,true].flatMap(skipZero=>
    ['book','word'].map(clock=>({...key,sign,scaled,skipZero,clock}))))));
assert.equal(MODES.length,128);
const mod=(x,n)=>((x%n)+n)%n;
const padCache=new Map();
const streamFor=key=>{
  const name=key.toString('hex');
  if(!padCache.has(name)){
    const aes=createCipheriv('aes-128-ctr',key,Buffer.alloc(16));
    padCache.set(name,Buffer.concat([aes.update(Buffer.alloc(N)),aes.final()]));
  }
  return padCache.get(name);
};
const digit=(byte,scaled,base)=>
  scaled?Math.floor(byte*base/256):byte%base;

/** @param {number[]} ciphertext @param {typeof MODES[number]} mode */
function decrypt(ciphertext,mode){
  const stream=streamFor(mode.key),p=new Array(N);
  let cursor=0,prev=0;
  for(let i=0;i<N;i++){
    if(i&&mode.clock==='word'&&start[i])cursor=0;
    const c=ciphertext[i];
    if(i===0){p[i]=mod(c-digit(stream[cursor++],mode.scaled,BASE),BASE);}
    else{
      const d=mod(c-prev,BASE),marker=start[i]?BEGIN:INTERIOR;
      if(d===0){p[i]=marker;if(!mode.skipZero)cursor++;}
      else{
        const k=digit(stream[cursor++],mode.scaled,PERIOD);
        const rank=mod(logs[d]+mode.sign*k,PERIOD);
        p[i]=rank>=marker?rank+1:rank;
      }
    }
    prev=c;
  }
  return p;
}

/** @param {number[]} plaintext @param {typeof MODES[number]} mode */
function encrypt(plaintext,mode){
  const stream=streamFor(mode.key),c=new Array(N);
  let cursor=0,prev=0;
  for(let i=0;i<N;i++){
    if(i&&mode.clock==='word'&&start[i])cursor=0;
    if(i===0){c[i]=mod(plaintext[i]+digit(stream[cursor++],
      mode.scaled,BASE),BASE);}
    else{
      const marker=start[i]?BEGIN:INTERIOR,p=plaintext[i];
      if(p===marker){c[i]=prev;if(!mode.skipZero)cursor++;}
      else{
        const rank=p>marker?p-1:p;
        const k=digit(stream[cursor++],mode.scaled,PERIOD);
        const z=mod(rank-mode.sign*k,PERIOD);
        c[i]=mod(prev+powers[z],BASE);
      }
    }
    prev=c[i];
  }
  return c;
}
const SPLIT=GP.pages.filter(p=>p.page<28).reduce((s,p)=>s+p.indices.length,0);
assert.equal(SPLIT,6761);
function score(plaintext){
  let at=0,train=0,held=0,nTrain=0,nHeld=0;
  for(const word of WORDS){
    const w=plaintext.slice(at,at+word.length);
    const result=wordModel.wordScore(w);
    if(at<SPLIT){train+=result;nTrain+=w.length;}
    else{held+=result;nHeld+=w.length;}
    at+=word.length;
  }
  assert.equal(at,N);
  return {train:train/nTrain,held:held/nHeld};
}
function rank(ciphertext,modes=MODES){
  return modes.map(mode=>{
    const plain=decrypt(ciphertext,mode);
    return {mode,...score(plain),plain};
  }).sort((a,b)=>b.train-a.train);
}
function seeded(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}
function plantWords(){
  const rng=seeded(0x33014747),pool=Array.from({length:15},()=>[]);
  for(const w of latin.slice(24000))if(w.length<pool.length)pool[w.length].push(w);
  for(const w of latin)if(w.length<pool.length&&pool[w.length].length===0)
    pool[w.length].push(w);
  const result=WORDS.flatMap(w=>{
    const choices=pool[w.length];
    assert.ok(choices&&choices.length,'missing Latin source length '+w.length);
    return choices[rng()%choices.length];
  });
  assert.equal(result.length,N);
  return result;
}
function markerCounts(plain){
  const counts=[0,0,0];
  for(let i=1;i<N;i++)
    if(plain[i]===(start[i]?BEGIN:INTERIOR))
      counts[start[i]?0:end[i]?2:1]++;
  return counts;
}
function main(){
  const original=rank(CIPHER);
  assert.deepEqual(encrypt(original[0].plain,original[0].mode),CIPHER);
  // Any wrong secret key also gives the exact original ciphertext again.
  const other=original.at(-1);
  assert.deepEqual(encrypt(other.plain,other.mode),CIPHER);

  const trueMode=MODES.find(m=>m.name===KEYS[0].name&&m.sign===1&&
    !m.scaled&&!m.skipZero&&m.clock==='book');
  assert.ok(trueMode);
  const planted=plantWords(),synthetic=encrypt(planted,trueMode);
  assert.deepEqual(decrypt(synthetic,trueMode),planted);
  const ranking=rank(synthetic);
  assert.equal(ranking[0].mode,trueMode,'native source key must rank first');
  assert.deepEqual(ranking[0].plain,planted);
  assert.deepEqual(encrypt(ranking[0].plain,ranking[0].mode),synthetic);

  // Repeat the entire original model-selection process under wrong source keys.
  const random=seeded(0x4728b077),wrong=[];
  for(let j=0;j<12;j++){
    const keys=KEYS.map((_,i)=>({name:'wrong-'+j+'-'+i,
      key:Buffer.from(Array.from({length:16},()=>random()&255))}));
    const modes=keys.flatMap(key=>[-1,1].flatMap(sign=>[false,true]
      .flatMap(scaled=>[false,true].flatMap(skipZero=>
        ['book','word'].map(clock=>({...key,sign,scaled,skipZero,clock}))))));
    const winner=rank(CIPHER,modes)[0];
    wrong.push({train:winner.train,held:winner.held});
  }
  const top=original.slice(0,6).map(q=>({
    key:q.mode.name,sign:q.mode.sign,scaled:q.mode.scaled,
    skipZero:q.mode.skipZero,clock:q.mode.clock,
    train:q.train,held:q.held,
    originalPreview:q.plain.slice(SPLIT,SPLIT+48).map(i=>GP.translit[i]).join('')
  }));
  const summary={
    classification:'Source-constrained GP-Latin original-cipher inversion test; not an authenticated key',
    original:{runes:N,wholeWords:WORDS.length,repeatRoles:originalEvents,
      provisionalPlainMarkers:{wordFirst:'G',other:'X'},
      modeCount:MODES.length,trainingRuneSplit:SPLIT,
      topTraining:top,retrospectiveBestHeldout:Math.max(...original.map(x=>x.held)),
      wrongKeyReplicates:wrong.length,
      wrongSelectedHeldoutRange:[Math.min(...wrong.map(x=>x.held)),
        Math.max(...wrong.map(x=>x.held))],
      worseOrEqualWrongHeldout:wrong.filter(x=>x.held>=original[0].held).length,
      exactReencryption:true,wrongKeyAlsoReencrypts:true},
    planted:{latinWords:WORDS.length,runes:N,markers:markerCounts(planted),
      sourceTrueModeRank:ranking.findIndex(x=>x.mode===trueMode)+1,
      trainingScore:ranking[0].train,heldoutScore:ranking[0].held,
      decryptedAll:true,recipheredAll:true},
    source:{latinReferenceWords:latin.length,trainingWords:wordModel.trainingWords,
      AES128Candidates:KEYS.length,derivedFrom:'Fibonacci page15 ranks and p49-51 base60 grid',
      transform:'primitive root15 F29 rank28, two GP marker alphabets'},
    interpretation:'Synthetic success demonstrates identifiable planted keys only under chosen source/architecture. Genuine plaintext requires independently readable GP-Latin and authenticated key provenance.'
  };
  console.log(JSON.stringify(summary,null,2));
  return summary;
}
if(require.main===module)main();
module.exports={decrypt,encrypt,score,rank,main};
