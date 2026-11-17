'use strict';
/**
 * Fixed-escape reversible GP29 anti-repeat channel: original-cipher gate.
 * Hypothesis: one globally fixed plaintext rune E emits the previous
 * ciphertext symbol; each other rune maps bijectively to the remaining
 * 28 symbols under any unknown 28-ary keystream. Therefore the locations
 * of adjacent equal ciphertext glyphs expose exactly the plaintext E sites.
 *
 * Compare observed original (repeat, word-start repeat, word-end repeat)
 * with 700 seeded native-English page-shaped plants from Shakespeare
 * and Gibran, keeping all 2896 original printed word lengths.
 * No original plaintext or source-selected secret key is assumed.
 *
 * Exact rank-skip forward/inverse controls prove a lossless encoder exists.
 * This gate is limited to standard GP-native English, one fixed escape,
 * original word boundaries and a one-rune-output-per-rune transducer.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const alphabet=grid.alphabet;
const keys=grid.pages.flatMap(p=>p.tokens).map(t=>
  (60*alphabet.indexOf(t[0])+alphabet.indexOf(t[1]))%28);
assert.equal(keys.length,256);
const spelling=gp.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);

/** @param {string} word @returns {number[]} */
function gpWord(word) {
  word=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out=[];
  for(let i=0;i<word.length;) {
    if(word.startsWith('ING',i)){out.push(21);i+=3;}
    else if(word.startsWith('IO',i)){out.push(27);i+=2;}
    else {
      const unit=spelling.find(t=>word.startsWith(t.s,i));
      assert.ok(unit,'GP spelling');
      out.push(unit.i);i+=unit.s.length;
    }
  }
  return out;
}
const getWords=s=>(s.match(/[A-Za-z]+/g)||[]).map(gpWord);
const native=getWords(read('resources/control/gibran_prophet_58585.txt'));
const refs=[
  ['Shakespeare',getWords(read('resources/control/shakespeare_first300k.txt'))],
  ['Gibran',native]
];
const originalSource=read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0,55).join('%');
const runeId=new Map(gp.runes.map((s,i)=>[s,i]));
const originalWords=[];
let word=[],previous=null,runeCount=0;
const close=()=>{if(word.length){originalWords.push(word);word=[];}};
for(const ch of originalSource) {
  if(runeId.has(ch)) {
    const symbol=runeId.get(ch);
    word.push({symbol,repeat:previous===symbol,index:runeCount});
    previous=symbol;runeCount++;
  } else if(ch!=='/' && ch!=='%' && !/\s/u.test(ch)) close();
}
close();
assert.equal(runeCount,12956);
assert.equal(originalWords.length,2896);
const lengths=originalWords.map(w=>w.length);
assert.equal(lengths.reduce((a,b)=>a+b,0),12956);
assert.equal(lengths.filter(n=>n===1).length,83);
const original=[0,0,0];
for(const w of originalWords)for(let j=0;j<w.length;j++)if(w[j].repeat){
  original[0]++;
  if(j===0)original[1]++;
  if(j===w.length-1)original[2]++;
}
assert.deepEqual(original,[86,23,19]);

/** @param {number[]} plain @param {number} escape @returns {number[]} */
function encrypt(plain,escape) {
  let prev=escape;
  return plain.map((p,i)=>{
    const rank=p<escape?p:p-1;
    const c=p===escape?prev:(prev+1+(rank+keys[i%keys.length])%28)%29;
    prev=c;return c;
  });
}
/** @param {number[]} cipher @param {number} escape @returns {number[]} */
function decrypt(cipher,escape) {
  let prev=escape;
  return cipher.map((c,i)=>{
    const rank=(c-prev-1+58)%29;
    const ordinary=(rank+28-keys[i%keys.length])%28;
    const p=c===prev?escape:ordinary>=escape?ordinary+1:ordinary;
    prev=c;return p;
  });
}
for(const E of [0,13,21,28]) {
  const planted=native.flat().slice(1000,4000);
  const encrypted=encrypt(planted,E);
  assert.deepEqual(decrypt(encrypted,E),planted);
  for(let i=1;i<encrypted.length;i++)
    assert.equal(encrypted[i]===encrypted[i-1],planted[i]===E);
}
console.log('PASS four native-GP lossless rank-skip planted positives using 256 source grid key');

/** @param {number[][]} corpus @returns {number[][][]} */
function bucketize(corpus) {
  const b=Array.from({length:20},()=>[]);
  for(const w of corpus)if(w.length<b.length)b[w.length].push(w);
  for(const n of lengths)assert.ok(b[n].length,'native word-shape coverage');
  return b;
}
let state=0x9e3779b9;
/** @param {number} n @returns {number} */
function randomInt(n){
  state=(Math.imul(1664525,state)+1013904223)>>>0;
  return Math.floor(state/4294967296*n);
}
const TRIALS=700;
for(const pair of refs) {
  const name=pair[0],buckets=bucketize(pair[1]);
  const sum=Array.from({length:29},()=>new Float64Array(3));
  const sumSq=Array.from({length:29},()=>new Float64Array(3));
  for(let trial=0;trial<TRIALS;trial++) {
    const features=Array.from({length:29},()=>new Float64Array(3));
    for(const L of lengths) {
      const b=buckets[L],w=b[randomInt(b.length)];
      for(const rune of w)features[rune][0]++;
      features[w[0]][1]++;
      features[w[L-1]][2]++;
    }
    for(let e=0;e<29;e++)for(let j=0;j<3;j++) {
      const x=features[e][j];sum[e][j]+=x;sumSq[e][j]+=x*x;
    }
  }
  const ranks=gp.translit.map((rune,e)=>{
    const means=[],z=[];
    for(let j=0;j<3;j++) {
      const mean=sum[e][j]/TRIALS;
      const variance=Math.max(1e-10,sumSq[e][j]/TRIALS-mean*mean);
      means.push(+mean.toFixed(1));
      z.push(+((original[j]-mean)/Math.sqrt(variance)).toFixed(2));
    }
    return {rune,expected:means,z,maxAbs:Math.max(...z.map(Math.abs))};
  }).sort((a,b)=>a.maxAbs-b.maxAbs);
  console.log(name+': '+TRIALS+' seeded source-word-length native GP plants');
  console.log('Original repeat triple: '+JSON.stringify(original));
  console.log('Best global fixed E across all 29: '+JSON.stringify(ranks[0]));
  console.log('Next seven candidate runes: '+JSON.stringify(ranks.slice(1,8)));
  assert.ok(ranks[0].maxAbs>6,
    'original site profile unexpectedly fits a native-GP fixed escape rune');
}
/* Rival keyless null: repeat positions selected uniformly within each
 * original rune-bearing physical page, with actual per-page repeat counts
 * frozen. Preserve source word positions and all 32 carried words.
 * This is a site-placement comparison only, not a proposed ciphertext
 * inverse or a formal linguistic randomness proof. */
const positions=originalWords.flatMap(w=>w.map((o,j)=>({
  index:o.index,start:j===0,end:j===w.length-1,
  singleton:w.length===1,repeat:o.repeat
})));
assert.equal(positions.length,12956);
const pageQuotas=[];
let base=0;
for(const p of gp.pages.filter(p=>p.page<=55)){
  const n=p.indices.length;
  if(n){
    const slice=positions.slice(base,base+n);
    pageQuotas.push({
      count:slice.filter(o=>o.repeat).length,
      eligible:slice.slice(1).map(o=>o.index)
    });
  }
  base+=n;
}
assert.equal(base,12956);
assert.equal(pageQuotas.length,55);
assert.equal(pageQuotas.reduce((a,p)=>a+p.count,0),86);
let siteState=314159265;
const siteRand=n=>{
  siteState=(Math.imul(1664525,siteState)+1013904223)>>>0;
  return Math.floor(siteState/4294967296*n);
};
const observed=[original[1],original[2],0],SITE_TRIALS=10000;
const samples=[],siteSum=[0,0,0],siteSumSq=[0,0,0];
for(let t=0;t<SITE_TRIALS;t++){
  const x=[0,0,0];
  for(const p of pageQuotas){
    const selected=new Set();
    while(selected.size<p.count)selected.add(siteRand(p.eligible.length));
    for(const k of selected){
      const o=positions[p.eligible[k]];
      x[0]+=Number(o.start);
      x[1]+=Number(o.end);
      x[2]+=Number(o.singleton);
    }
  }
  samples.push(x);
  for(let j=0;j<3;j++){
    siteSum[j]+=x[j];siteSumSq[j]+=x[j]*x[j];
  }
}
const siteMean=siteSum.map(x=>x/SITE_TRIALS);
const siteSd=siteSumSq.map((x,j)=>
  Math.sqrt(x/SITE_TRIALS-siteMean[j]*siteMean[j]));
const dist=x=>x.reduce((a,v,j)=>
  a+((v-siteMean[j])/Math.max(0.1,siteSd[j]))**2,0);
const dOriginal=dist(observed);
const jointP=(1+samples.filter(x=>dist(x)>=dOriginal).length)
  /(SITE_TRIALS+1);
console.log('Page-count-preserving uniform site placement: '+
  JSON.stringify({observed,mean:siteMean.map(x=>+x.toFixed(3)),
    sd:siteSd.map(x=>+x.toFixed(3)),
    jointP:+jointP.toFixed(4)}));
assert.ok(jointP>0.10,
  'ordinary page-conditioned uniform site null unexpectedly excluded');
console.log('PASS original repeat-site word geometry remains compatible with uniform page-conditioned placement');

console.log('PASS original key-independent exclusion under two independent native-GP controls');
console.log('SCOPE: normal English, one fixed escape, printed word boundaries, one-to-one ranks.');
