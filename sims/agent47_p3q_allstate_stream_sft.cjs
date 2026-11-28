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
const MOD = 29, Q = [17, 24], QINV = [22, 26];
const mod = (x) => (x % MOD + MOD) % MOD;
const mul = ([a, b], [c, d]) => [mod(a*c + 8*b*d), mod(a*d + b*c + 3*b*d)];
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
function transduce(x,seed,forward,law){
  assert.equal(x.length%2,0);
  let state=seed.slice();
  const step=forward?Q:QINV,out=new Array(x.length);
  for(let k=0;k<x.length;k+=2){
    const a=x[k],b=x[k+1];
    let v;
    if(law===0)v=[mod(a-state[0]),mod(b-state[1])];
    else if(law===1)v=[mod(a+state[0]),mod(b+state[1])];
    else if(law===2)v=mul([a,b],state);
    else v=mul([a,b],inv(state));
    out[k]=v[0];out[k+1]=v[1];
    state=mul(state,step);
  }
  return out;
}
const inverseLaw=[1,0,3,2];
function census(x){
  let best=[];
  let scanned=0;
  for(const forward of [true,false])
  for(let law=0;law<4;law++)
  for(const seed of states){
    const decoded=transduce(x,seed,forward,law);
    const value=score(decoded);
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
const originals=frames.map(f=>{
  const {scanned,best}=census(f.cipher);
  return {frame:f.name,n:f.cipher.length,scanned,
    ciphertextScore:score(f.cipher),best};
});
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
for(const seed of [[0,20],[19,8]])
for(const forward of [true,false])
for(const law of [0,2]){
  const encoded=transduce(plant,seed,forward,inverseLaw[law]);
  assert.deepEqual(transduce(encoded,seed,forward,law),plant);
  const check=census(encoded);
  assert.ok(Math.abs(check.best[0].score-score(plant))<1e-10,
    'known correct key must rank first in planted native ciphertext');
  const best=transduce(encoded,check.best[0].seed,check.best[0].forward,check.best[0].law);
  assert.deepEqual(best,plant);
  control.push({seed,forward,law,score:score(plant),
    recoveredTop1:true,top:check.best[0]});
}
assert.equal(control.length,8);
const result={
  schema:1,
  classification:'all-840-state, both-Q-directions, four direct GF841 pair-stream inverses; exact original ciphertext',
  source:{relation:'u^2=3u+8',Q,QINV,order:840,
    p54RedQProduct:[0,20],nativeTrainRunes:train.length,
    signedReference:'resources/historical/cicada2016-4gq25-outguess.asc'},
  model:{states:840,directions:2,laws:4,framingCases:2,
    totalOriginalCandidates:originals.reduce((n,x)=>n+x.scanned,0),
    noPageReset:true,noFreePerRuneKey:true,
    score:'GP29 smoothed bigram log probability per rune from disjoint Gibran prefix'},
  originals,reference:{
    signed2016:{runes:signedGp.length,score:score(signedGp)},
    heldGibranWindows:holdScores
  },nativePlants:control,
  decision:'For both physically specified p54-p55 pair framings, no key in the exhaustive direct Q-stream family yields native-like original plaintext. All eight planted control keys recover the exact held-out native 308-runic message at rank 1. This excludes only the fixed linear/additive or multiplicative Q-state emission maps, not more complex receiver laws, state feedback, side channels, or different plaintext languages.'
};
const output=JSON.stringify(result,null,2);
console.log(output);
if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,'agent47-p3q-stream-output.json'),output);
