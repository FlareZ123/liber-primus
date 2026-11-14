'use strict';
/**
 * Original p40-p48 nine-page same-position GP29 one-time pad reuse attack.
 * A fully unknown GP29 keystream is inferred by Viterbi, simultaneously
 * maximizing nine independent GP-native plaintext trigram likelihoods.
 * Source clue: the same five-berry border is printed on all these pages.
 * This is an analyst cipher hypothesis, NOT an original Cicada instruction.
 *
 * Node 22 CommonJS, single read-only SFT, fixed native language training.
 * Positive: plant nine distinct heldout native prose streams encrypted with
 * one shared, fully random GP29 pad and recover the pad without knowing it.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
/** @param {string} file */
function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}
const source = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const N = 29;
const sourcePages = source.pages.filter(p => p.page >= 40 && p.page <= 48);
assert.deepEqual(sourcePages.map(p => p.page),[40,41,42,43,44,45,46,47,48]);
const width = Math.min(...sourcePages.map(p => p.indices.length));
assert.equal(width,231);
const original = sourcePages.map(p=>p.indices.slice(0,width));
const g = Object.fromEntries(source.translit.map((x,i)=>[x,i]));
const digraph = new Set(['TH','NG','EO','OE','AE','IA','EA']);
/** @param {string} text @returns {number[]} */
function gp(text) {
  const out = [];
  for (const word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    const w = word.replace(/QU/g,'CW').replace(/[KQ]/g,'C')
      .replace(/V/g,'U').replace(/Z/g,'S');
    for(let i=0;i<w.length;i++){
      const d = w.slice(i,i+2);
      if (digraph.has(d)){out.push(g[d]);i++;}
      else out.push(g[w[i]]);
    }
  }
  return out;
}
const text = gp(read('resources/control/shakespeare_first300k.txt'));
assert(text.length > 145000);
const trainLength = 120000;
const train = text.slice(0,trainLength);
const alpha = 0.05;
const uni = new Float64Array(N);
const bi = new Float64Array(N*N);
const tri = new Float64Array(N*N*N);
for(let i=0;i<train.length;i++){
  uni[train[i]]++;
  if(i>0) bi[train[i-1]*N+train[i]]++;
  if(i>1) tri[(train[i-2]*N+train[i-1])*N+train[i]]++;
}
const log1 = new Float64Array(N);
const log2 = new Float64Array(N*N);
const log3 = new Float64Array(N*N*N);
for(let a=0;a<N;a++){
  log1[a]=Math.log((uni[a]+alpha)/(train.length+N*alpha));
  for(let b=0;b<N;b++){
    log2[a*N+b]=Math.log((bi[a*N+b]+alpha)/(uni[a]+N*alpha));
    for(let c=0;c<N;c++)
      log3[(a*N+b)*N+c]=Math.log(
        (tri[(a*N+b)*N+c]+alpha)/(bi[a*N+b]+N*alpha));
  }
}
/** @param {number} n */
function mod(n){return (n%N+N)%N;}
/** @param {number[][]} cipher @returns {{key:number[],score:number,plaintext:number[][]}} */
function infer(cipher) {
  assert.equal(cipher.length,9);
  assert(cipher.every(p=>p.length===width));
  const states=N*N, old=new Float64Array(states), next=new Float64Array(states);
  const back=new Uint8Array(width*states);
  for(let k0=0;k0<N;k0++)for(let k1=0;k1<N;k1++){
    let s=0;
    for(const page of cipher){
      const a=mod(page[0]-k0), b=mod(page[1]-k1);
      s+=log1[a]+log2[a*N+b];
    }
    old[k0*N+k1]=s;
  }
  for(let t=2;t<width;t++){
    next.fill(-Infinity);
    for(let k0=0;k0<N;k0++)for(let k1=0;k1<N;k1++){
      const past=old[k0*N+k1];
      const prev0=cipher.map(page=>mod(page[t-2]-k0));
      const prev1=cipher.map(page=>mod(page[t-1]-k1));
      for(let k2=0;k2<N;k2++){
        let score=past;
        for(let j=0;j<9;j++){
          const x=mod(cipher[j][t]-k2);
          score+=log3[(prev0[j]*N+prev1[j])*N+x];
        }
        const site=k1*N+k2;
        if(score>next[site]){next[site]=score;back[t*states+site]=k0;}
      }
    }
    old.set(next);
  }
  let best=-Infinity, site=0;
  for(let i=0;i<states;i++)if(old[i]>best){best=old[i];site=i;}
  const key=Array(width);
  key[width-2]=Math.floor(site/N);key[width-1]=site%N;
  for(let t=width-1;t>=2;t--){
    const a=back[t*states+key[t-1]*N+key[t]];
    key[t-2]=a;
  }
  const plaintext=cipher.map(page=>page.map((v,t)=>mod(v-key[t])));
  return {key,score:best/(width*cipher.length),plaintext};
}
/** @param {number[][]} pages */
function equalRate(pages) {
  let same=0,total=0;
  for(let i=0;i<pages.length;i++)for(let j=i+1;j<pages.length;j++){
    for(let t=0;t<width;t++){
      same+=Number(pages[i][t]===pages[j][t]);total++;
    }
  }
  return {same,total,rate:same/total};
}
/** @param {number[][]} pages */
function avgIoC(pages){
  const all=pages.flat(),cnt=Array(N).fill(0);
  for(const x of all)cnt[x]++;
  return cnt.reduce((s,x)=>s+x*(x-1),0)/(all.length*(all.length-1));
}
const gibranText = gp(read('resources/control/gibran_prophet_58585.txt'));
const gibran = Array.from({length:9}, (_, i) =>
  gibranText.slice(500 + 462*i, 731 + 462*i));
assert(gibran.every(page=>page.length===width));
const gibranEqual = equalRate(gibran);
assert.equal(gibranEqual.same,458);

const originalEqual = equalRate(original), originalDecode=infer(original);
assert.equal(originalEqual.total,36*width);
assert.equal(originalEqual.same,323); // 36 pairs at 231 shared positions.
let state=0x3301;
/** @returns {number} */
function random29(){state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)%N;}
const secret=Array.from({length:width},random29);
const native=Array.from({length:9},(_,i)=>
  text.slice(trainLength+1000+width*(i*2),trainLength+1000+width*(i*2+1)));
assert(native.every(p=>p.length===width));
const planted=native.map(page=>page.map((x,t)=>mod(x+secret[t])));
const plantEqual=equalRate(planted),plantDecoded=infer(planted);
const keyHits=plantDecoded.key.filter((x,i)=>x===secret[i]).length;
const plainHits=plantDecoded.plaintext.flat().filter((x,i)=>
  x===native[Math.floor(i/width)][i%width]).length;
console.log(JSON.stringify({
  model:'One fixed position-aligned secret GP29 additive pad shared across original floral p40-p48',
  pages:sourcePages.map(p=>({page:p.page,sourceRunes:p.indices.length})),
  lengthPerPage:width,sourceReadout:'first 231 GP runes of each page',
  originalEqual, gibranNativeEqual:gibranEqual,
  originalOptimalScorePerRune:originalDecode.score,
  originalDecodedFirst70:originalDecode.plaintext.map((p,j)=>({
    page:sourcePages[j].page,translit:p.slice(0,70).map(v=>source.translit[v]).join(' ')
  })),
  originalDecodedPooledIoC:avgIoC(originalDecode.plaintext),
  positiveNativeEqual:equalRate(native),positiveCipherEqual:plantEqual,
  positiveTrueKeyRecovered:keyHits,positivePlainRuneRecovered:plainHits,
  positiveOptimalScorePerRune:plantDecoded.score
},null,2));
assert.equal(plantEqual.same,equalRate(native).same);
assert(plainHits>=1800, 'native plaintext shared-pad recovery insufficient');
assert(keyHits>=200, 'true shared pad recovery insufficient');
