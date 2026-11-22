'use strict';
/** Blind shared cyclic 256-rune pad with free per-page offsets.
 * Read-only, dependency-free Node 22 CommonJS single-file test.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const ref=fs.readFileSync(path.join(root,'resources/liber-primus/lp1-plaintext-reference.txt'),'utf8');
const pages=data.pages.slice(0,56).filter(p=>p.indices.length).map(p=>p.indices);
assert.equal(pages.length,55);
assert.equal(pages.reduce((s,p)=>s+p.length,0),12956);
const alphabet=new Map(data.translit.map((x,i)=>[x,i]));
const tokens=[...alphabet.keys()].sort((a,b)=>b.length-a.length);
const hist=new Float64Array(29).fill(.5);
let knownRunes=0;
for(let word of ref.toUpperCase().match(/[A-Z]+/g)||[]){
  word=word.replaceAll('ING','NG');
  const seq=[];
  for(let at=0;at<word.length;){
    const token=tokens.find(t=>word.startsWith(t,at));
    if(!token){seq.length=0;break;}
    seq.push(alphabet.get(token));at+=token.length;
  }
  for(const x of seq){hist[x]++;knownRunes++;}
}
assert.equal(knownRunes,3568);
for(const x of data.pages[57].indices)hist[x]++;
const total=hist.reduce((s,x)=>s+x,0);
const freq=Array.from(hist,x=>x/total);
const diff=Array.from({length:29},(_,d)=>freq.reduce((s,x,i)=>s+x*freq[(i-d+29)%29],0));
const score=diff.map(x=>Math.log(29*x));
const KL=diff.reduce((s,x)=>s+x*Math.log(29*x),0);
assert(Math.abs(KL-0.022701219984236028)<1e-10);
/** @param {number} seed */
function prng(seed){
  let state=seed;
  return {
    next(){state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296;},
    int(n){return Math.floor(this.next()*n);},
    gp(){let u=this.next();for(let i=0;i<29;i++){u-=freq[i];if(u<0)return i;}return 28;}
  };
}
/** @param {number[][]} corpus */
function matrices(corpus){
  const m=Array.from({length:55},()=>Array(55).fill(null));
  for(let a=0;a<55;a++)for(let b=a+1;b<55;b++){
    const left=corpus[a],right=corpus[b],row=new Float32Array(256);
    for(let delta=0;delta<256;delta++){
      let sum=0;
      for(let j=0;j<left.length;j++){
        const t=(j+delta)&255;
        if(t<right.length)sum+=score[(left[j]-right[t]+29)%29];
        if(t+256<right.length)sum+=score[(left[j]-right[t+256]+29)%29];
      }
      row[delta]=sum;
    }
    m[a][b]=row;
  }
  return m;
}
/** @param {number[][]} corpus
 * @param {{int:(n:number)=>number}} rng
 * @param {number} starts
 * @param {number} passes
 */
function fit(corpus,rng,starts,passes){
  const m=matrices(corpus);
  let top=-Infinity,topPhase=null;
  for(let attempt=0;attempt<starts;attempt++){
    const phase=Array.from({length:55},()=>attempt===0?0:rng.int(256));
    for(let iteration=0;iteration<passes;iteration++){
      let moved=0;
      for(let p=0;p<55;p++){
        let high=-Infinity,arg=phase[p];
        for(let o=0;o<256;o++){
          let value=0;
          for(let j=0;j<55;j++){
            if(j<p)value+=m[j][p][(phase[j]-o+256)&255];
            if(j>p)value+=m[p][j][(o-phase[j]+256)&255];
          }
          if(value>high){high=value;arg=o;}
        }
        if(arg!==phase[p]){phase[p]=arg;moved++;}
      }
      if(moved===0)break;
    }
    let v=0;
    for(let p=0;p<55;p++)for(let j=p+1;j<55;j++)v+=m[p][j][(phase[p]-phase[j]+256)&255];
    if(v>top){top=v;topPhase=phase.slice();}
  }
  return {score:top,phase:topPhase};
}
console.log('Input:',JSON.stringify({pages:pages.length,runes:12956,pairs:1485,
  period:256,knownRunes,clearP57:data.pages[57].indices.length,KL}));
const plantedRng=prng(5113421);
const K=Array.from({length:256},()=>plantedRng.int(29));
const truePhase=Array.from({length:55},()=>plantedRng.int(256));
const pos=pages.map((p,page)=>Array.from({length:p.length},(_,i)=>
  (plantedRng.gp()+K[(i+truePhase[page])&255])%29));
const positive=fit(pos,plantedRng,10,24);
const globalShift=(truePhase[0]-positive.phase[0]+256)&255;
const recovered=truePhase.filter((p,i)=>((p-positive.phase[i]+256)&255)===globalShift).length;
console.log('Planted positive:',JSON.stringify({score:positive.score,recovered,expected:55}));
assert.equal(recovered,55);
assert(positive.score>6500);
const realRng=prng(11235813);
const original=fit(pages,realRng,8,20);
const nullCorpus=pages.map(p=>{
  const a=p.slice();
  for(let i=a.length-1;i>0;i--){const j=realRng.int(i+1);const tmp=a[i];a[i]=a[j];a[j]=tmp;}
  return a;
});
const control=fit(nullCorpus,realRng,8,20);
console.log('Original vs no-reuse page-permutation control:',JSON.stringify({
  original:original.score,null:control.score,positive:positive.score,
  originalPerPair:original.score/1485,nullPerPair:control.score/1485
}));
assert(original.score<0);
assert(original.score<positive.score-6000);
assert(control.score<positive.score-6000);
console.log('PASS: planted full phase recovery; no original shared cyclic-pad signal.');


/**
 * Stronger, NONADDITIVE model: every one of 256 key positions uses an
 * independent arbitrary 29-symbol bijection. Aligned C equalities are
 * exactly the unknown plaintext equalities, regardless of all secret keys.
 * The likelihood uses Bernoulli equal-vs-unequal scores and penalizes the
 * varying number of overlapped positions for each page-offset hypothesis.
 */
/** @param {number[][]} corpus */
function allSecretMatrices(corpus) {
  const qCollision = freq.reduce((sum, p) => sum + p * p, 0);
  const equalGain = Math.log(qCollision * 29);
  const unequalGain = Math.log((1 - qCollision) / (28 / 29));
  const m = Array.from({length: 55}, () => Array(55).fill(null));
  for (let p = 0; p < 55; p++) {
    for (let t = p + 1; t < 55; t++) {
      const a = corpus[p], b = corpus[t], row = new Float32Array(256);
      for (let shift = 0; shift < 256; shift++) {
        let equal = 0, compared = 0;
        for (let j = 0; j < a.length; j++) {
          const at = (j + shift) & 255;
          if (at < b.length) {
            compared++;
            if (a[j] === b[at]) equal++;
          }
          if (at + 256 < b.length) {
            compared++;
            if (a[j] === b[at + 256]) equal++;
          }
        }
        row[shift] = equal * equalGain + (compared - equal) * unequalGain;
      }
      m[p][t] = row;
    }
  }
  return m;
}

/** @param {number[][]} corpus
 * @param {{int:(n:number)=>number}} rng
 * @param {number} starts
 * @param {number} passes
 */
function fitAllSecret(corpus, rng, starts, passes) {
  const m = allSecretMatrices(corpus);
  let top = -Infinity, topPhase = [];
  for (let start = 0; start < starts; start++) {
    const phase = Array.from({length: 55}, () => start ? rng.int(256) : 0);
    for (let iteration = 0; iteration < passes; iteration++) {
      let moves = 0;
      for (let p = 0; p < 55; p++) {
        let best = -Infinity, bestPhase = phase[p];
        for (let x = 0; x < 256; x++) {
          let score = 0;
          for (let t = 0; t < 55; t++) {
            if (t < p) score += m[t][p][(phase[t] - x + 256) & 255];
            else if (t > p) score += m[p][t][(x - phase[t] + 256) & 255];
          }
          if (score > best) { best = score; bestPhase = x; }
        }
        if (bestPhase !== phase[p]) { phase[p] = bestPhase; moves++; }
      }
      if (!moves) break;
    }
    let score = 0;
    for (let p = 0; p < 55; p++) {
      for (let t = p + 1; t < 55; t++) {
        score += m[p][t][(phase[p] - phase[t] + 256) & 255];
      }
    }
    if (score > top) { top = score; topPhase = phase.slice(); }
  }
  return {score: top, phase: topPhase};
}

const arbitraryRng = prng(23001288);
const allSecretKey = Array.from({length: 256}, () => {
  const values = Array.from({length: 29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = arbitraryRng.int(i + 1);
    const hold = values[i]; values[i] = values[j]; values[j] = hold;
  }
  return values;
});
const allSecretOffsets = Array.from({length: 55}, () => arbitraryRng.int(256));
const arbitraryPlant = pages.map((p, page) =>
  Array.from({length: p.length}, (_, j) =>
    allSecretKey[(j + allSecretOffsets[page]) & 255][arbitraryRng.gp()]
  )
);
const arbitraryPositive = fitAllSecret(arbitraryPlant, arbitraryRng, 10, 24);
const arbitraryCommon = (allSecretOffsets[0] - arbitraryPositive.phase[0] + 256) & 255;
const arbitraryRecovered = allSecretOffsets.filter((offset, i) =>
  ((offset - arbitraryPositive.phase[i] + 256) & 255) === arbitraryCommon
).length;
assert.equal(arbitraryRecovered, 55, 'Arbitrary permutation plant alignment failed');
const arbitraryOriginal = fitAllSecret(pages, arbitraryRng, 8, 20);
const arbitraryNull = pages.map(p => {
  const a = p.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = arbitraryRng.int(i + 1);
    const hold = a[i]; a[i] = a[j]; a[j] = hold;
  }
  return a;
});
const arbitraryNullResult = fitAllSecret(arbitraryNull, arbitraryRng, 8, 20);
console.log('Arbitrary secret 29-symbol alphabet per key phase:', JSON.stringify({
  alphabetChoices: '(29!)^256',
  qCollision: freq.reduce((sum, p) => sum + p * p, 0),
  positive: arbitraryPositive.score,
  recoveredRelativeOffsets: arbitraryRecovered,
  original: arbitraryOriginal.score,
  shuffledControl: arbitraryNullResult.score
}));
assert(arbitraryPositive.score > 2000, 'Nonlinear positive was not detected');
assert(arbitraryOriginal.score < -300, 'Original unexpected positive');
assert(arbitraryNullResult.score < -300, 'No-reuse control unexpected positive');
console.log('PASS: additive and arbitrary-bijection cyclic-256 page-offset key-reuse gates.');
