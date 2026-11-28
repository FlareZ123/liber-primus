'use strict';
// Agent 47 — finite all-state original-input gate for p3 quotient Q-path.
// Run: node sims/agent47_p3q_allstate_stream_sft.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const gibran = fs.readFileSync(path.join(root, 'resources/control/gibran_prophet_58585.txt'), 'utf8');
const signed = fs.readFileSync(path.join(root, 'resources/historical/cicada2016-4gq25-outguess.asc'), 'utf8');
const correctedTape = fs.readFileSync(path.join(root, 'resources/transcriptions/lp2-image-corrected.txt'), 'utf8');
const MOD = 29, Q = [17, 24], QINV = [22, 26];
const mod = (x) => (x % MOD + MOD) % MOD;
const mul = ([a, b], [c, d]) => [mod(a*c + 8*b*d), mod(a*d + b*c + 3*b*d)];
const frobenius = ([a,b]) => [mod(a+3*b),mod(-b)];
const inverseT = ([a,b]) => mul(QINV,frobenius([a,b]));
const forwardT = ([a,b]) => frobenius(mul(Q,[a,b]));
assert.deepEqual(forwardT(forwardT([1,0])),[8,0]);
let tState=[1,0],tOrder=0;
do {tState=forwardT(tState);tOrder++;} while((tState[0]!==1||tState[1]!==0)&&tOrder<841);
assert.equal(tOrder,56,'canonical signed DIRECTION29+Q semilinear T order on unit is 56');
const inv = ([a,b]) => {
  const n = mod(a*a + 3*a*b - 8*b*b);
  assert.notEqual(n,0,'nonzero GF841 state has nonzero norm');
  let ni = 1;
  while (mod(n*ni)!==1) ni++;
  return [mod((a+3*b)*ni), mod(-b*ni)];
};
assert.deepEqual(mul(Q,QINV),[1,0]);
const states = [];
for (let a=0;a<MOD;a++) for(let b=0;b<MOD;b++) if(a||b) states.push([a,b]);
assert.equal(states.length,840);
let st = [1,0], order=0;
do {st=mul(st,Q);order++;} while(st[0]!==1||st[1]!==0);
assert.equal(order,840,'source quotient Q is primitive');

const DIGRAPHS = ['TH','EO','NG','OE','AE','IA','EA'];
function gpWord(word) {
  const s=word.toUpperCase().replace(/QU/g,'CW').replace(/[KV]/g,'C').replace(/Z/g,'S');
  const out=[];
  for(let i=0;i<s.length;) {
    let token=null,n=1;
    if(s.slice(i,i+3)==='ING'){token='NG';n=3;}
    else for(const d of DIGRAPHS){if(s.startsWith(d,i)){token=d;n=d.length;break;}}
    if(!token)token=s[i];
    const v=corpus.translit.indexOf(token);
    if(v>=0)out.push(v);
    i+=n;
  }
  return out;
}
function gpText(s){return (s.match(/[A-Za-z]+/g)||[]).flatMap(gpWord);}
const native=gpText(gibran);
const train=native.slice(0,20000);
assert.equal(train.length,20000);
const counts=Array.from({length:MOD},()=>Array(MOD).fill(.25));
for(let i=1;i<train.length;i++)counts[train[i-1]][train[i]]++;
const logp=counts.map(row=>{
  const total=row.reduce((a,b)=>a+b,0);
  return row.map(x=>Math.log(x/total));
});
function score(x){
  assert.ok(x.length>1);
  let value=0;
  for(let i=1;i<x.length;i++)value+=logp[x[i-1]][x[i]];
  return value/(x.length-1);
}
// law 0: C-S; law 1: C+S; law 2: C*S; law 3: C/S.
// All arithmetic is over the source-fixed GF(29^2), u^2=3u+8.
function transduce(x,seed,forward,law,stepFamily='Q'){
  assert.equal(x.length%2,0);
  let state=seed.slice();
  assert.ok(stepFamily==='Q'||stepFamily==='T');
  const step=forward?Q:QINV,out=new Array(x.length);
  for(let k=0;k<x.length;k+=2){
    const a=x[k],b=x[k+1];
    let v;
    if(law===0)v=[mod(a-state[0]),mod(b-state[1])];
    else if(law===1)v=[mod(a+state[0]),mod(b+state[1])];
    else if(law===2)v=mul([a,b],state);
    else v=mul([a,b],inv(state));
    out[k]=v[0];out[k+1]=v[1];
    state=stepFamily==='Q'?mul(state,step):(forward?forwardT(state):inverseT(state));
  }
  return out;
}
const inverseLaw=[1,0,3,2];
function census(x,stepFamily='Q',scorer=score){
  let best=[];
  let scanned=0;
  for(const forward of [true,false])
  for(let law=0;law<4;law++)
  for(const seed of states){
    const decoded=transduce(x,seed,forward,law,stepFamily);
    const value=scorer(decoded);
    const item={score:value,seed,forward,law,
      prefix:decoded.slice(0,22).map(v=>corpus.translit[v]).join('')};
    if(best.length<5 || value>best[best.length-1].score){
      best.push(item);
      best.sort((a,b)=>b.score-a.score || a.seed[0]-b.seed[0] || a.seed[1]-b.seed[1]);
      best=best.slice(0,5);
    }
    scanned++;
  }
  assert.equal(scanned,6720);
  return {scanned,best};
}
const p54=corpus.pages.find(x=>x.page===54).indices;
const p55=corpus.pages.find(x=>x.page===55).indices;
assert.equal(p54.length,232);
assert.equal(p55.length,76);
const frames=[
  {name:'whole-p54p55',cipher:p54.concat(p55)},
  {name:'after-p54-red9-drop-terminal-rune',cipher:p54.slice(9).concat(p55).slice(0,-1)}
];
assert.deepEqual(frames.map(x=>x.cipher.length),[308,298]);
const originals=frames.flatMap(f=>['Q','T'].map(stepFamily=>{
  const {scanned,best}=census(f.cipher,stepFamily);
  return {frame:f.name,stepFamily,n:f.cipher.length,scanned,
    ciphertextScore:score(f.cipher),best};
}));
const signedText=signed.slice(signed.indexOf('Hello.'),signed.indexOf('-----BEGIN PGP SIGNATURE-----'));
assert.ok(signedText.startsWith('Hello.'));
const signedGp=gpText(signedText);
const holdScores=[300,450,600,750,900,1200,3000].map(offset=>{
  const start=20000+offset;
  return {offset,whole:score(native.slice(start,start+308)),
    black:score(native.slice(start,start+298))};
});
const plant=native.slice(21320,21628),control=[];
assert.equal(plant.length,308);
for(const stepFamily of ['Q','T'])
for(const seed of [[0,20],[19,8]])
for(const forward of [true,false])
for(const law of [0,2]){
  const encoded=transduce(plant,seed,forward,inverseLaw[law],stepFamily);
  assert.deepEqual(transduce(encoded,seed,forward,law,stepFamily),plant);
  const check=census(encoded,stepFamily);
  assert.ok(Math.abs(check.best[0].score-score(plant))<1e-10,
    'known correct key must rank first in planted native ciphertext');
  const best=transduce(encoded,check.best[0].seed,check.best[0].forward,check.best[0].law,stepFamily);
  assert.deepEqual(best,plant);
  control.push({stepFamily,seed,forward,law,score:score(plant),
    recoveredTop1:true,top:check.best[0]});
}
assert.equal(control.length,16);

// Separate robustness gate: source printed words may be out of native order.
// Score ONLY rune transitions within each original printed word, never across words.
// This deliberately removes the English word-order premise from the direct-state result.
const runeSet = new Set(corpus.runes);
const transcriptSegments = correctedTape.split('%').map(raw => ({
  raw,
  indices:[...raw].filter(x=>runeSet.has(x)).map(x=>corpus.runes.indexOf(x))
}));
function printedWords(page){
  const rawPage=corpus.pages.find(x=>x.page===page).indices;
  const sources=transcriptSegments.filter(x=>
    x.indices.length===rawPage.length&&x.indices.every((v,i)=>v===rawPage[i]));
  assert.equal(sources.length,1,'unique exact canonical page match in corrected transcription');
  const words=sources[0].raw.replace(/\s|\//g,'').split(/[-.const result={§]+/)
    .map(t=>[...t].filter(x=>runeSet.has(x)).map(x=>corpus.runes.indexOf(x)))
    .filter(x=>x.length);
  assert.deepEqual(words.flat(),rawPage,'printed word parser must preserve every rune');
  return words;
}
const p54words=printedWords(54),p55words=printedWords(55);
assert.equal(p54words.length,50);
assert.equal(p55words.length,17);
assert.deepEqual(p54words.slice(0,2).map(x=>x.length),[1,8]);
const wordFrames=[
  {name:'whole-p54p55',words:p54words.concat(p55words)},
  {name:'after-p54-red9-drop-terminal-rune',
    words:p54words.slice(2).concat(p55words.slice(0,-1),
      [p55words[p55words.length-1].slice(0,-1)])}
];
assert.deepEqual(wordFrames.map(f=>f.words.flat().length),[308,298]);
for(let i=0;i<wordFrames.length;i++){
  assert.deepEqual(wordFrames[i].words.flat(),frames[i].cipher);
}
const gibranWords=(gibran.match(/[A-Za-z]+/g)||[]).map(gpWord).filter(w=>w.length);
const wordCounts=Array.from({length:MOD},()=>Array(MOD).fill(.25));
let trainingSeen=0;
for(const word of gibranWords){
  if(trainingSeen>=20000) break;
  for(let i=1;i<word.length;i++)wordCounts[word[i-1]][word[i]]++;
  trainingSeen+=word.length;
}
assert.ok(trainingSeen>=20000);
const wordLogp=wordCounts.map(row=>{
  const total=row.reduce((a,b)=>a+b,0);
  return row.map(v=>Math.log(v/total));
});
const nativeWordPools=new Map();
for(const word of gibranWords.slice(6000)){
  if(!nativeWordPools.has(word.length))nativeWordPools.set(word.length,[]);
  nativeWordPools.get(word.length).push(word);
}
function wordMask(groups){
  const indices=[];let pos=0;
  for(const word of groups){
    for(let k=1;k<word.length;k++)indices.push(pos+k);
    pos+=word.length;
  }
  return indices;
}
function scoreInsideWords(sequence,mask){
  let val=0;
  for(const i of mask)val+=wordLogp[sequence[i-1]][sequence[i]];
  return val/mask.length;
}
function matchingNativeWords(groups){
  const used=new Map(),out=[];
  for(const word of groups){
    const pool=nativeWordPools.get(word.length);
    assert.ok(pool&&pool.length,'unavailable held native GP word length '+word.length);
    const k=used.get(word.length)||0;
    used.set(word.length,k+1);
    out.push(...pool[k%pool.length]);
  }
  return out;
}
const withinPrintedWords=[];
for(const frame of wordFrames){
  const original=frame.words.flat(),mask=wordMask(frame.words);
  const heldNative=matchingNativeWords(frame.words);
  assert.equal(original.length,heldNative.length);
  const scorer=x=>scoreInsideWords(x,mask);
  const familyResults=[];
  for(const stepFamily of ['Q','T']){
    const {scanned,best}=census(original,stepFamily,scorer);
    const controls=[];
    // Independent held-word-positive controls, with identical word slots and
    // every original within-word scoring position fixed before searching.
    for(const seed of [[0,20],[19,8]]){
      const forward=stepFamily==='Q';
      const law=seed[0]===0?0:2;
      const encoded=transduce(heldNative,seed,forward,inverseLaw[law],stepFamily);
      assert.deepEqual(transduce(encoded,seed,forward,law,stepFamily),heldNative);
      const plantCensus=census(encoded,stepFamily,scorer);
      assert.ok(Math.abs(plantCensus.best[0].score-scorer(heldNative))<1e-10,
        'native word-matched plant must rank first after 6720 candidates');
      const winning=transduce(encoded,plantCensus.best[0].seed,
        plantCensus.best[0].forward,plantCensus.best[0].law,stepFamily);
      assert.deepEqual(winning,heldNative,
        'exact matched-native word sequence must be recovered');
      controls.push({seed,forward,law,top1Exact:true,top:plantCensus.best[0]});
    }
    familyResults.push({stepFamily,scanned,best,controls});
  }
  withinPrintedWords.push({
    frame:frame.name,wordCount:frame.words.length,runes:original.length,
    insideWordTransitions:mask.length,
    originalInsideWordScore:scorer(original),
    lengthMatchedDisjointNativeInsideWordScore:scorer(heldNative),
    nativeWordSource:'held Gibran GP29 words after original training prefix; same exact printed-length slots',
    familyResults
  });
}
assert.deepEqual(withinPrintedWords.map(f=>f.insideWordTransitions),[241,233]);

const result={
  schema:1,
  classification:'all-840-state, both directions, Q or canonical semilinear T steps, four direct GF841 pair-stream inverses; exact original ciphertext',
  source:{relation:'u^2=3u+8',Q,QINV,order:840,semilinearStep:'T(x)=Frobenius(Q*x)',semilinearOrder:56,
    p54RedQProduct:[0,20],nativeTrainRunes:train.length,
    signedReference:'resources/historical/cicada2016-4gq25-outguess.asc'},
  model:{states:840,directions:2,stepFamilies:2,laws:4,framingCases:2,
    totalOriginalCandidates:originals.reduce((n,x)=>n+x.scanned,0),
    noPageReset:true,noFreePerRuneKey:true,
    score:'GP29 smoothed bigram log probability per rune from disjoint Gibran prefix'},
  originals,withinPrintedWords,reference:{
    signed2016:{runes:signedGp.length,score:score(signedGp)},
    heldGibranWindows:holdScores
  },nativePlants:control,
  decision:'For both p54-p55 pair framings, no key in the exhaustive direct Q or Frobenius(Q*) semilinear stream families yields native-like original plaintext even with scoring restricted to exact within-printed-word rune transitions. All 16 full-stream plants and eight length-matched printed-word native plants recover exactly at rank 1. This excludes fixed additive or multiplicative emissions with either source-derived state update, not more complex receiver laws, ciphertext-feedback, side channels, or different plaintext languages.'
};
const output=JSON.stringify(result,null,2);
console.log(output);
if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,'source-test-output.json'),output);
