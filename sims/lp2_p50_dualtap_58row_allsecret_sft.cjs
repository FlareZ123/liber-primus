'use strict';
/**
 * Source-selectable p50 parity dual-tap quasigroup, all 58 secret GP29 rows.
 * Original LP2 p0–55, true printed word joins, 29! freely secret bijections
 * independently at each bit0 x selected-ciphertext-predecessor state.
 *
 * Inverse tested: C_i = Q[bit0, C_(i-tap)][P_i], for j>=1 in a word,
 * tap=1 when bit0=0, tap=5 when bit0=1 and j>=5, else tap=1.
 * Each word's first rune is an arbitrary unencrypted seed. The p50 table is
 * clocked row-major, continuously, from original LP2 rune zero. The alternative
 * cross-word lag5 interpretation is tested separately as a sensitivity bound.
 * This is a candidate model; original Cicada does not specify this receiver.
 *
 * Windows11 Node22 single-file test: node sims/lp2_p50_dualtap_58row_allsecret_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} =
  require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.resolve(__dirname,'..');
const read = p => fs.readFileSync(path.join(root,p),'utf8')
  .replace(/\r\n/g,'\n');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const C=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(C.length,12956);
assert.equal(grid.bytes.length,256);
assert.equal(grid.alphabet,'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
const B=grid.bytes;
const glyph=new Map(gp.runes.map((r,i)=>[r,i]));
const runeRE=new RegExp('['+gp.runes.join('')+']+','gu');
const joined=read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0,55).join('')
  .replace(/\/\n/g,'').replace(/\n/g,'');
const words=(joined.match(runeRE)||[]).map(w=>[...w].map(r=>glyph.get(r)));
assert.equal(words.length,2896);
assert.deepEqual(words.flat(),C);
const wordLengths=words.map(w=>w.length);
assert.equal(Math.max(...wordLengths),14);
const POS=Array.from({length:C.length},()=>({j:0}));
let i=0;
for(const w of words) for(let j=0;j<w.length;j++) POS[i++]={j};
assert.equal(i,C.length);
const SITES=wordLengths.reduce((sum,n)=>sum+n-1,0);
assert.equal(SITES,10060);

/** @param {number} i @param {boolean} globalLag5 */
function state(i,globalLag5) {
  const bit=B[(i+255)&255]&1;
  const j=POS[i].j;
  const lag=(bit===1&&(globalLag5||j>=5))?5:1;
  return {bit,lag};
}
/**
 * Key-independent histogram envelope for every independently secret
 * permutation row Q[bit0, observed C_(i-lag)].
 * @param {number[]} c
 * @param {boolean} globalLag5
 */
function envelope(c,globalLag5) {
  const rows=Array.from({length:58},()=>new Uint16Array(29));
  for(let p=0;p<c.length;p++){
    if(POS[p].j===0)continue;
    const {bit,lag}=state(p,globalLag5);
    const ref=p>=lag?c[p-lag]:0;
    rows[29*bit+ref][c[p]]++;
  }
  const rank=[1,2,3,5,8,10];
  const caps=Object.fromEntries(rank.map(k=>[k,0]));
  let same=0,total=0;
  for(const row of rows){
    const sorted=[...row].sort((a,b)=>b-a);
    for(const k of rank) caps[k]+=sorted.slice(0,k).reduce((a,b)=>a+b,0);
    const size=sorted.reduce((a,b)=>a+b,0);
    total+=size*(size-1);
    same+=sorted.reduce((s,n)=>s+n*(n-1),0);
  }
  return {n:SITES,rows:58,capacities:caps,
    conditionalCoincidence:same/total};
}
const originalWithinWord=envelope(C,false);
const originalCrossWord=envelope(C,true);
assert.deepEqual(originalWithinWord.capacities,
  {1:680,2:1275,3:1827,5:2838,8:4202,10:5052});
assert.deepEqual(originalCrossWord.capacities,
  {1:658,2:1248,3:1792,5:2796,8:4157,10:4945});

/** @param {number} seed */
function random(seed) {
  let s=seed>>>0;
  return () => {
    s^=s<<13;s^=s>>>17;s^=s<<5;
    return (s>>>0)/4294967296;
  };
}
/** @param {number[]} arr @param {()=>number} rng */
function shuffle(arr,rng) {
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(rng()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}
/** @param {()=>number} rng */
function hiddenPermutations(rng){
  return Array.from({length:58},()=>
    shuffle(Array.from({length:29},(_,i)=>i),rng));
}
/**
 * The 2x29 secret rows are fully arbitrary independent permutations.
 * Each first rune is copied as a known state seed; only word interiors
 * participate in the tested cipher.
 * @param {number[]} plain
 * @param {number[][]} key
 * @param {boolean} globalLag5
 */
function encrypt(plain,key,globalLag5){
  const out=[];
  for(let p=0;p<plain.length;p++){
    if(POS[p].j===0){out.push(plain[p]);continue;}
    const {bit,lag}=state(p,globalLag5);
    const ref=p>=lag?out[p-lag]:0;
    out.push(key[29*bit+ref][plain[p]]);
  }
  return out;
}
/** @param {number[]} cipher @param {number[][]} key @param {boolean} globalLag5 */
function decrypt(cipher,key,globalLag5){
  const inv=key.map(row=>{
    const inverse=new Array(29);
    for(let i=0;i<29;i++)inverse[row[i]]=i;
    return inverse;
  });
  const out=[];
  for(let p=0;p<cipher.length;p++){
    if(POS[p].j===0){out.push(cipher[p]);continue;}
    const {bit,lag}=state(p,globalLag5);
    const ref=p>=lag?cipher[p-lag]:0;
    out.push(inv[29*bit+ref][cipher[p]]);
  }
  return out;
}
/**
 * @param {number[]} sample
 * @returns {{top1:number,top5:number,E:number}}
 */
function languageCounts(sample){
  const n=new Array(29).fill(0);
  for(let p=0;p<sample.length;p++)
    if(POS[p].j>0)n[sample[p]]++;
  const ranked=n.slice().sort((a,b)=>b-a);
  return {top1:ranked[0],top5:ranked.slice(0,5).reduce((a,b)=>a+b,0),
    E:n[gp.translit.indexOf('E')]};
}
/** @param {number[][][]} banks @param {()=>number} rng */
function matchedControl(banks,rng){
  const flat=[];
  for(const length of wordLengths){
    const pool=banks[length];
    assert(pool.length>0);
    flat.push(...pool[Math.floor(rng()*pool.length)]);
  }
  assert.equal(flat.length,C.length);
  return flat;
}
const outputs=[];
for(const [name,file,seed] of [
  ['Gibran','resources/control/gibran_prophet_58585.txt',0x33014c3f],
  ['Shakespeare','resources/control/shakespeare_first300k.txt',0x33014c40]
]) {
  const native=(read(file).toUpperCase().match(/[A-Z]+/g)||[])
    .map(encodeSourceNativeGP);
  const banks=Array.from({length:15},()=>[]);
  for(const word of native) if(word.length<15)banks[word.length].push(word);
  const rng=random(seed);
  let min1=Infinity,min5=Infinity,minE=Infinity;
  const nSamples=64;
  for(let k=0;k<nSamples;k++){
    const plain=matchedControl(banks,rng);
    const cnt=languageCounts(plain);
    min1=Math.min(min1,cnt.top1);
    min5=Math.min(min5,cnt.top5);
    minE=Math.min(minE,cnt.E);
    if(k===0){
      const key=hiddenPermutations(rng);
      const planted=encrypt(plain,key,false);
      const decoded=decrypt(planted,key,false);
      assert.deepEqual(decoded,plain);
      assert.deepEqual(encrypt(decoded,key,false),planted);
      const cap=envelope(planted,false);
      assert(cap.capacities[1]>=cnt.top1);
      assert(cap.capacities[5]>=cnt.top5);
      assert.deepEqual(decrypt(C,key,false).length,C.length);
    }
  }
  assert(min1>originalWithinWord.capacities[1],
    'all secret rows incapable of native common-rune count');
  assert(min5>originalWithinWord.capacities[5],
    'all secret rows incapable of native top-five count');
  outputs.push({control:name,layoutMatchedRuns:nSamples,
    minimumNativeTop1:min1,minimumNativeTop5:min5,
    minimumNativeE:minE,fullLengthPlantedRoundTrip:true});
}
console.log(JSON.stringify({
  status:'PASS: all 58 secret 29!-permutation dual-tap rows excluded under source-native GP register, no unknown plaintext',
  original:{runes:C.length,printedWords:words.length,
    interiorSites:SITES,
    nativeClock:'p50 rowmajor phase0, byte-under-immediate-predecessor',
    bit0Tap:'even lag1, odd within-word lag5 or fallback lag1',
    withinWord:originalWithinWord,
    globalLag5Rival:originalCrossWord},
  controlResults:outputs,
  caveat:'This iff architecture is hypothetical. Rules with evolving permutation rows, multiple simultaneous input taps, other source language or nonbijective sidebands remain open.'
},null,2));
