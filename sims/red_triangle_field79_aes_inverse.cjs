'use strict';
/**
 * Constructive source-triangle LP2 inverse:
 *
 * The three physically marked red rune spans have GP-prime sums
 * 638=29*22 (page 15), 435=29*15 (page 40),
 * 2262=29*78 (page 53). The previously documented arithmetic
 * selects 53 as a primitive root modulo 79, of order 78.
 *
 * For each anchored cipher body, take state = g^q mod 79;
 * output 32 consecutive field units as an AES/ChaCha256 key and the
 * next 16 consecutive units as a 128-bit IV. Test all primitive
 * roots g in F_79 and either AES-256-CTR or ChaCha20 with both
 * direct byte/GP reductions and signs. For g=53, this is a new
 * exact original-source inverse; other roots are a finite,
 * source-compatible contrast, not automatically meaningful keys.
 *
 * A separate independently sourced GP-English plant uses exactly
 * this original red-ink arithmetic and collision-driven hidden skips.
 * 160 original GP runes per body select the model, and the following
 * 140 independently test the frozen phase, key, and cipher.
 *
 * Node.js 22, CommonJS, no external npm modules. No plaintext claim.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {streamKey,viterbi}=require('./grid_stream_collision_viterbi.cjs');
const {train,encode}=require('./grid_keyskip_viterbi.cjs');
const {latinModel}=require('./title_grid_kdf_viterbi.cjs');
const crypto=require('node:crypto');

const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const qSource=[{page:15,start:0,length:9,q:22,bodyPage:15,bodyStart:20},
 {page:40,start:0,length:8,q:15,bodyPage:40,bodyStart:8},
 {page:53,start:128,length:51,q:78,bodyPage:54,bodyStart:0}];
const ALPHABET=[...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const mod=x=>(x%29+29)%29;
const T=160,H=140;
function power(g,n){
  let x=1;for(let i=0;i<n;i++)x=x*g%79;return x;
}
function original(){
  const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
  const annotated=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
  assert.equal(corpus.pages.filter(p=>p.page<=55&&p.indices.length).reduce((s,p)=>s+p.indices.length,0),12956);
  const bodies=qSource.map(anchor=>{
    const span=annotated.pages.find(p=>p.page===anchor.page).red_spans
      .find(s=>s.start===anchor.start&&s.length===anchor.length);
    assert.ok(span);
    const sum=[...span.runes].reduce((s,r)=>s+corpus.prime[corpus.runes.indexOf(r)],0);
    assert.equal(sum,29*anchor.q);
    const cipher=corpus.pages.filter(p=>p.page>=anchor.bodyPage&&p.page<=55)
      .flatMap(p=>p.indices.slice(p.page===anchor.bodyPage?anchor.bodyStart:0));
    return cipher.slice(0,T+H);
  });
  assert.deepEqual(bodies.map(x=>x.length),[300,300,300]);
  return bodies;
}
const primitiveRoots=Array.from({length:78},(_,i)=>i+1)
  .filter(g=>power(g,39)!==1&&power(g,26)!==1&&power(g,6)!==1);
assert.equal(primitiveRoots.length,24);
assert.ok(primitiveRoots.includes(53));
const MODES=[];
for(const g of primitiveRoots)
for(const algo of ['aes-256-ctr','chacha20'])
for(const reducer of ['mod29','scaled29'])
for(const sign of [1,-1]) MODES.push({g,algo,reducer,sign});

/** Generate one source-marked 256-bit cryptographic key and 128-bit nonce. */
function sourceKey(g,q){
  let x=power(g,q%78), bytes=[];
  for(let i=0;i<48;i++){bytes.push(x);x=x*g%79;}
  assert.equal(bytes.length,48);
  return {key:Buffer.from(bytes.slice(0,32)),iv:Buffer.from(bytes.slice(32))};
}
function pad(g,q,mode){
  const {key,iv}=sourceKey(g,q);
  return streamKey(key,mode,420,iv);
}
/** Exact train-only family selection and separately computed heldout. */
function solve(bodies,lm){
  let best=null;
  const candidates=[];
  for(const mode of MODES){
    const rows=bodies.map((cipher,i)=>{
      const k=pad(mode.g,qSource[i].q,mode);
      const tr=viterbi(cipher.slice(0,T),k,mode.sign,lm);
      return {tr, key:k};
    });
    const training=rows.reduce((s,x)=>s+x.tr.score,0)/(3*T);
    candidates.push({mode,training});
    if(!best||training>best.training)best={mode,training,rows};
  }
  const heldout=best.rows.map((row,i)=>{
    const test=viterbi(bodies[i].slice(T),row.key.slice(T+row.tr.skips),
      best.mode.sign,lm);
    return {sourcePage:qSource[i].page,sourceQuotient:qSource[i].q,
      cipherPage:qSource[i].bodyPage,trainSkips:row.tr.skips,
      heldoutScore:test.perRune,heldoutGP:test.plaintext.map(x=>ALPHABET[x]).join('').slice(0,80)};
  });
  const mean=heldout.reduce((s,x)=>s+x.heldoutScore,0)/heldout.length;
  const bestByRoot=primitiveRoots.map(g=>{
    const a=candidates.filter(c=>c.mode.g===g).sort((x,y)=>y.training-x.training);
    return {g,training:a[0].training,bestMode:a[0].mode};
  }).sort((a,b)=>b.training-a.training);
  return {bestMode:best.mode,trainedScore:best.training,
    heldoutScore:mean,heldout,bestByRoot,
    root53TrainingRank:bestByRoot.findIndex(x=>x.g===53)+1,
    root53Best:bestByRoot.find(x=>x.g===53),
    settings:MODES.length};
}
function randomGenerator(seed){
 let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};
}
/** Plant from a Shakespeare tail disjoint from GP-trigram training text. */
function planted(lm,latin=false){
  const gp=latin?JSON.parse(read('resources/control/latin-vulgate-heldout-gp.json')).runes
    :encode(read('resources/control/shakespeare_first300k.txt').slice(205000));
  const plain=qSource.map((_,i)=>gp.slice(i*300,i*300+300));
  assert.ok(plain.every(x=>x.length===300));
  const mode={g:53,algo:'aes-256-ctr',reducer:'mod29',sign:1};
  const random=randomGenerator(0x31537922);
  const actualSkips=[];
  const ciphertext=plain.map((text,i)=>{
    const k=pad(mode.g,qSource[i].q,mode);
    let j=0,prev=-1,count=0;const c=[];
    for(const x of text){
      let out=mod(x+k[j]);
      if(out===prev&&random()<.81){j++;count++;out=mod(x+k[j]);}
      c.push(out);j++;prev=out;
    }
    actualSkips.push(count);return c;
  });
  const solved=solve(ciphertext,lm);
  const matched=Object.keys(mode).every(k=>solved.bestMode[k]===mode[k]);
  const correct=solved.heldout.map((x,i)=>{
    const k=pad(mode.g,qSource[i].q,mode);
    const first=viterbi(ciphertext[i].slice(0,T),k,mode.sign,lm);
    const second=viterbi(ciphertext[i].slice(T),k.slice(T+first.skips),mode.sign,lm);
    return second.plaintext.filter((p,j)=>p===plain[i][T+j]).length;
  });
  const count=correct.reduce((a,b)=>a+b,0);
  assert.ok(count>=3*H*.85,'Planted true-field key must recover heldout GP source');
  return {mode,actualSkips,blindRecoveredMode:matched,
    rankOfTruePrimitiveRoot:solved.root53TrainingRank,
    trainScore:solved.trainedScore,heldoutScore:solved.heldoutScore,
    trueKeyHeldoutGP:count,heldoutTotal:3*H};
}
function main(){
  const latin=process.argv.includes('--latin');
  const lm=latin?latinModel():train(read('resources/control/shakespeare_first300k.txt').slice(0,200000));
  const plantedEvidence=planted(lm,latin);
  const tested=solve(original(),lm);
  const result={
    hypothesis:'source exact red-span prime quotient seeds a field79 78-cycle, packed AES/ChaCha key+IV',
    field:79, generatorSourcePrime:53,primitiveRoots:primitiveRoots.length,
    sourceAnchors:qSource,
    construction:'state=g^q mod79; 32 successive state bytes form 256-bit key; next 16 state bytes form nonce',
    originalCipherRunes:3*(T+H),trainPerSection:T,heldoutPerSection:H,
    skipRule:'one extra key draw only if the rejected draw would emit the previous published ciphertext rune',
    languageRegister:latin?'Latin Vulgate New Testament':'Shakespeare GP English',
    noPlaintextClaim:true,
    planted:plantedEvidence,original:tested
  };
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
if(require.main===module)main();
module.exports={original,sourceKey,pad,solve,planted,power,primitiveRoots};
