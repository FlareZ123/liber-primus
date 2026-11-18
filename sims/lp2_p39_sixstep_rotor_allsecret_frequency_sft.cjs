'use strict';

/**
 * P39-root T6 six-block rotor, with an arbitrarily secret fixed GP29 base
 * alphabet. Observe T(x)=24-2x, root24 and first red ordinal27. A six-slot
 * block clock advances the rotor once, hence C[i]=T(C[i-6]) precisely when
 * the repeated original plaintext letters six apart are identical.
 *
 * The unknown static alphabet is eliminated without guessing it: reverse
 * the public rotor and compare IoC to natural GP English. A bijective
 * secret alphabet cannot change native GP symbol collision frequency.
 *
 * Read-only Node22 standalone original-input test on Windows 11.
 * Run node sims/lp2_p39_sixstep_rotor_allsecret_frequency_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} p */
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const glyphs=new Map(corpus.runes.map((x,i)=>[x,i]));
const rx=new RegExp('['+corpus.runes.join('')+']+','gu');
const words=(read('resources/lp2-transcription.txt').split('%')
 .slice(0,55).join('%').replace(/\/\r?\n/g,'').replace(/[\r\n%]/g,'')
 .match(rx)||[]).map(w=>[...w].map(x=>glyphs.get(x)));
const ciphertext=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
assert.equal(words.length,2896);
assert.equal(ciphertext.length,12956);
assert.deepEqual(words.flat(),ciphertext);
const MOD=29,mod=n=>(n%29+29)%29;
const T=x=>mod(24-2*x);
assert.equal(T(8),8);
const power=[27,14].map(a=>{
 const out=[1];for(let k=1;k<28;k++)out.push(mod(out.at(-1)*a));
 assert.equal(mod(out.at(-1)*a),1);
 return out;
});
for(let x=0;x<29;x++)for(let k=0;k<28;k++)
 assert.equal(mod(8+power[0][k]*(mod(8+power[1][k]*(x-8))-8)),x);
const wordStarts=[],wordPos=new Uint8Array(ciphertext.length);
let pos=0;
for(const w of words){wordStarts.push(pos);for(let j=0;j<w.length;j++)wordPos[pos++]=j}
assert.equal(pos,12956);
const pagePos=new Uint16Array(ciphertext.length);
pos=0;
for(const p of corpus.pages.filter(p=>p.page<56)){
 for(let i=0;i<p.indices.length;i++)pagePos[pos++]=i;
}
assert.equal(pos,12956);
/** @param {'global'|'page'|'word'} clock @param {number} i */
function position(clock,i){
 return clock==='global'?i:clock==='page'?pagePos[i]:wordPos[i];
}
/**
 * @param {number[]} stream
 * @param {'global'|'page'|'word'} clock
 * @param {-1|1} sign
 * @param {number} phase
 * @param {boolean} reverse
 */
function rotate(stream,clock,sign,phase,reverse){
 const table=power[(sign===-1?1:0)^(reverse?1:0)];
 return stream.map((v,i)=>{
  const rounds=Math.floor((position(clock,i)+phase)/6)%28;
  return mod(8+table[rounds]*(v-8));
 });
}
/** @param {number[]} x */
function ioc(x){
 const hist=Array(29).fill(0);for(const c of x)hist[c]++;
 return hist.reduce((s,c)=>s+c*(c-1),0)/(x.length*(x.length-1));
}
/**
 * Within-page collision rate is unchanged even if each original page has
 * its own wholly secret 29-rune alphabet.
 * @param {number[]} values
 */
function pageIoC(values){
 let off=0,hits=0,pairs=0;
 for(const p of corpus.pages.filter(x=>x.page<56)){
  const hist=Array(29).fill(0);
  for(let i=0;i<p.indices.length;i++)hist[values[off+i]]++;
  hits+=hist.reduce((n,k)=>n+k*(k-1),0);
  pairs+=p.indices.length*(p.indices.length-1);
  off+=p.indices.length;
 }
 assert.equal(off,values.length);
 return hits/pairs;
}
const original=[];
for(const clock of ['global','page','word']){
 for(const sign of [-1,1]){
  for(let phase=0;phase<6;phase++){
   const plaintext=rotate(ciphertext,clock,sign,phase,false);
   assert.deepEqual(rotate(plaintext,clock,sign,phase,true),ciphertext);
   original.push({clock,sign,phase,ioc:ioc(plaintext),pageIoC:pageIoC(plaintext),
    first80:plaintext.slice(0,80).map(x=>corpus.translit[x]).join('')});
  }
 }
}
assert.equal(original.length,36);
let observedSix=0;
for(const w of words)for(let i=6;i<w.length;i++)
 observedSix+=Number(w[i]===T(w[i-6]));
assert.equal(observedSix,80);
const translit=corpus.translit.map((str,index)=>({str,index}))
 .sort((a,b)=>b.str.length-a.str.length);
/** @param {string} value */
function nativeWord(value){
 const w=value.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
  .replace(/K/g,'C').replace(/Z/g,'S');
 const arr=[];
 for(let i=0;i<w.length;){
  const t=translit.find(x=>w.startsWith(x.str,i));
  if(!t)return [];
  arr.push(t.index);i+=t.str.length;
 }
 return arr;
}
const controls=[
 'resources/control/shakespeare_first300k.txt',
 'resources/control/gibran_prophet_58585.txt',
 'resources/control/emerson_essays_2944.txt'
].map((file,i)=>{
 const dict=new Map();
 for(const w of read(file).match(/[A-Za-z]+/g)||[]){
  const tokens=nativeWord(w);
  if(!tokens.length)continue;
  const list=dict.get(tokens.length)||[];
  list.push(tokens);dict.set(tokens.length,list);
 }
 assert([...new Set(words.map(w=>w.length))].every(n=>dict.has(n)));
 return {name:['Shakespeare','Gibran','Emerson'][i],dict};
});
let seed=0x33012439;
/** @returns {number} */
function rnd(){
 seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
 return seed>>>0;
}
function permutation(){
 const a=Array.from({length:29},(_,i)=>i);
 for(let i=28;i>0;i--){const j=rnd()%(i+1);[a[i],a[j]]=[a[j],a[i]]}
 return a;
}
const positive=[];
for(const {name,dict} of controls){
 const runes=[],wordCounts=[];
 for(let trial=0;trial<100;trial++){
  runes.length=0;wordCounts.length=0;
  for(const word of words){
   const options=dict.get(word.length);
   const text=options[rnd()%options.length];
   runes.push(...text);
   wordCounts.push(text);
  }
  assert.equal(runes.length,ciphertext.length);
  let events=0;
  for(const w of wordCounts)for(let i=6;i<w.length;i++)
   events+=Number(w[i]===w[i-6]);
  const mapped=permutation();
  const plain=runes.map(v=>mapped[v]);
  const enc=rotate(plain,'global',-1,0,true);
  const dec=rotate(enc,'global',-1,0,false);
  assert.deepEqual(dec,plain);
  assert.equal(ioc(plain),ioc(runes));
  const pageMapped=[];
  let start=0;
  for(const p of corpus.pages.filter(p=>p.page<56)){
   const key=permutation();
   for(let i=0;i<p.indices.length;i++)
    pageMapped.push(key[runes[start+i]]);
   start+=p.indices.length;
  }
  assert.equal(start,runes.length);
  const pageCipher=rotate(pageMapped,'page',-1,0,true);
  const pageRecovered=rotate(pageCipher,'page',-1,0,false);
  assert.deepEqual(pageRecovered,pageMapped);
  assert.equal(pageIoC(pageRecovered),pageIoC(runes));
  positive.push({name,ioc:ioc(dec),pageIoC:pageIoC(pageRecovered),
   sixBackSamePlain:events});
 }
}
const results={};
for(const name of controls.map(c=>c.name)){
 const rows=positive.filter(x=>x.name===name);
 results[name]={
  n:rows.length,IoC:[Math.min(...rows.map(x=>x.ioc)),Math.max(...rows.map(x=>x.ioc))],
  pageIoC:[Math.min(...rows.map(x=>x.pageIoC)),Math.max(...rows.map(x=>x.pageIoC))],
  sixBack:[Math.min(...rows.map(x=>x.sixBackSamePlain)),Math.max(...rows.map(x=>x.sixBackSamePlain))],
  sixBackMean:rows.reduce((s,v)=>s+v.sixBackSamePlain,0)/rows.length
 };
}
const best=[...original].sort((a,b)=>b.ioc-a.ioc);
const worstPositive=Math.min(...positive.map(x=>x.ioc));
assert(best[0].ioc<worstPositive);
const minPagePositive=Math.min(...positive.map(x=>x.pageIoC));
const maxPageOriginal=Math.max(...original.map(x=>x.pageIoC));
assert(maxPageOriginal<minPagePositive);
assert(original.every(x=>x.ioc<0.04));
assert(results.Shakespeare.sixBack[0]<=80&&results.Shakespeare.sixBack[1]>=80);
console.log(JSON.stringify({
 originalSource:{
  p39T:'24-2x mod29',fixedRune:'H',nonfixedOrbit:28,
  originalRunes:ciphertext.length,printedWords:words.length,
  sixBackAffineHits:observedSix,
  candidate:'six-symbol block rotor composed with arbitrary static substitution',
  originalSourceSelectedClock:false,
 },
 originalDeRotatedIoC:{n:36,best:best.slice(0,6),
  min:Math.min(...original.map(x=>x.ioc)),
  max:best[0].ioc,
  pageWiseIoCRange:[Math.min(...original.map(x=>x.pageIoC)),maxPageOriginal]},
 plantedGP:{n:positive.length,sourceShapedByWordLength:true,
  arbitraryHiddenBaseAlphabet:true,sourceSummaries:results,
  minNativeIoC:worstPositive,
  minNativePageWiseIoC:minPagePositive,
  pageSecretAlphabetPlantsExact:positive.length,
  exactAllPlanted:true},
 completeOriginalPlaintextRecovered:false
},null,2));
