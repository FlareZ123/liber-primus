'use strict';
/**
 * Exploratory two-time-pad/relative-key English probe for LP2 pages 28 and 42.
 *
 * Hypothesis: if two ciphertexts share an additive key, D[i] = C28[i]-C42[i]
 * cancels that key. A dynamic program maximizes the probability of two
 * simultaneous Gematria Primus plaintexts under a Shakespeare-trained
 * word-boundary-aware character bigram model. Each position has only 29
 * candidate plaintext pairs constrained by the known difference.
 *
 * A high score is insufficient evidence of plaintext recovery: pair-selection,
 * language-model overfitting, and null calibration matter. The recovered text
 * must be examined and independently validated before any decryption claim.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..');
const START = 29;
const END = 30;
const N = 31;
const rootSource = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const corp = JSON.parse(rootSource('resources/liber-primus/lp2-corpus.json'));
const runeMap = new Map(corp.runes.map((r,i) => [r,i]));
const translit = corp.translit;
const translitMap = new Map(translit.map((r,i)=>[r,i]));
/** @param {number} x */
function mod(x) { return ((x%29)+29)%29; }

/** @param {string} word @returns {number[]} */
function encode(word) {
  const s = word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    const digraph = s.slice(i, i+2);
    if (translitMap.has(digraph)) {
      out.push(translitMap.get(digraph));
      i += 2;
    } else {
      const index = translitMap.get(s[i]);
      assert.notEqual(index, undefined, 'Unmapped English character: ' + s[i]);
      out.push(index);
      i++;
    }
  }
  return out;
}

/** @param {string} text @returns {number[][]} */
function corpusWords(text) {
  return (text.match(/[A-Za-z]+/g)||[]).map(encode);
}

/** @param {number[][]} words */
function train(words) {
  const counts = new Float64Array(N*N);
  const unigrams = new Float64Array(N);
  const totals = new Float64Array(N);
  for (const word of words) {
    let prev = START;
    for (const c of [...word, END]) {
      counts[prev*N+c]++;
      unigrams[c]++;
      totals[prev]++;
      prev=c;
    }
  }
  const total = unigrams.reduce((a,b)=>a+b,0);
  const prior = Float64Array.from(unigrams, x => (x+1)/(total+N));
  const probs = new Float64Array(N*N);
  for (let prev=0; prev<N;prev++) for (let curr=0;curr<N;curr++) {
    probs[prev*N+curr] = Math.log((counts[prev*N+curr] + 5*prior[curr]) / (totals[prev]+5));
  }
  return probs;
}

/** @param {number[][]} words @param {number} desired @returns {{xs:number[],start:boolean[],end:boolean[]}} */
function stream(words, desired = Infinity) {
  const xs=[],start=[],end=[];
  for (const word of words) {
    for (let j=0;j<word.length&&xs.length<desired;j++) {
      xs.push(word[j]);start.push(j===0);end.push(j===word.length-1);
    }
    if (xs.length>=desired) break;
  }
  return {xs,start,end};
}

/** @param {number} manuscriptPage */
function lp2Page(manuscriptPage) {
  const segments = rootSource('resources/liber-primus/lp2-transcription.txt').split('%');
  const raw = segments[manuscriptPage>=51 ? manuscriptPage-1 : manuscriptPage];
  const xs=[],start=[],end=[];
  let active=false;
  for (const ch of raw) {
    if (runeMap.has(ch)) {
      xs.push(runeMap.get(ch));
      start.push(!active);
      end.push(false);
      active=true;
    } else if ('-.$&§'.includes(ch)) {
      if (end.length) end[end.length-1] = true;
      active=false;
    }
  }
  const p = corp.pages.find(p=>p.page===manuscriptPage);
  assert.deepEqual(xs,p.indices);
  return {xs,start,end};
}

/**
 * Optimal joint bigram score and optional Viterbi plaintext paths.
 * The second ciphertext is cyclically shifted in *glyph positions only*;
 * its physical word-boundary mask stays fixed.
 *
 * @param {{xs:number[],start:boolean[],end:boolean[]}} pa
 * @param {{xs:number[],start:boolean[],end:boolean[]}} pb
 * @param {Float64Array} lm
 * @param {number} shift
 * @param {boolean} withText
 */
function solve(pa,pb,lm,shift=0,withText=false) {
  const n=Math.min(pa.xs.length,pb.xs.length);
  const dp1=new Float64Array(29),dp2=new Float64Array(29);
  let prev=dp1,next=dp2;
  const back=new Uint8Array(n*29);
  const bn=pb.xs.length;
  const difference=(t)=>mod(pa.xs[t]-pb.xs[(t+shift)%bn]);
  for (let r=0;r<29;r++) {
    const q=mod(r-difference(0));
    prev[r]=lm[START*N+r]+lm[START*N+q]
      +(pa.end[0]?lm[r*N+END]:0)+(pb.end[0]?lm[q*N+END]:0);
  }
  for(let t=1;t<n;t++) {
    const d=difference(t),dprev=difference(t-1);
    for(let r=0;r<29;r++) {
      const q=mod(r-d);
      const base=(pa.start[t]?lm[START*N+r]:0)+(pb.start[t]?lm[START*N+q]:0)
        +(pa.end[t]?lm[r*N+END]:0)+(pb.end[t]?lm[q*N+END]:0);
      let best=-Infinity,bestPrev=0;
      for(let pr=0;pr<29;pr++) {
        const pq=mod(pr-dprev);
        const value=prev[pr]+base
          +(pa.start[t]?0:lm[pr*N+r])
          +(pb.start[t]?0:lm[pq*N+q]);
        if (value>best) {best=value;bestPrev=pr;}
      }
      next[r]=best;
      back[t*29+r]=bestPrev;
    }
    [prev,next]=[next,prev];
  }
  let best=-Infinity,arg=0;
  for(let i=0;i<29;i++) if(prev[i]>best){best=prev[i];arg=i;}
  if(!withText)return {score:best,n};
  const p=new Uint8Array(n),q=new Uint8Array(n);
  for(let t=n-1;t>=0;t--){p[t]=arg;q[t]=mod(arg-difference(t));arg=back[t*29+arg];}
  const text=(x,wordStarts)=>[...x].map((r,i)=>(wordStarts[i]?' ':'')+translit[r]).join('').trim();
  return {score:best,n,p:Array.from(p),q:Array.from(q),
    pText:text(p,pa.start),qText:text(q,pb.start)};
}

/** @param {number} seed */
function prng(seed){let x=seed>>>0;return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
function study() {
  const source = rootSource('resources/control/shakespeare_first300k.txt');
  const cut=240000;
  const training=corpusWords(source.slice(0,cut));
  const heldout=corpusWords(source.slice(cut));
  const lm=train(training),a=lp2Page(28),b=lp2Page(42);
  const observed=solve(a,b,lm,0,true);
  const shifts=[];
  for(let shift=0;shift<b.xs.length;shift++)shifts.push({shift,score:solve(a,b,lm,shift,false).score});
  const sorted=shifts.slice().sort((u,v)=>v.score-u.score);
  const ranking=sorted.findIndex(s=>s.shift===0)+1;

  // Held-out Shakespeare positive control, two genuine plaintext passages,
  // independently masked with one *shared* random additive key.
  const plantedA=stream(heldout.slice(0,400),269);
  const plantedB=stream(heldout.slice(500,900),269);
  assert.equal(plantedA.xs.length,269);
  assert.equal(plantedB.xs.length,269);
  const rand=prng(3301),key=plantedA.xs.map(()=>Math.floor(rand()*29));
  const ciphertextA={...plantedA,xs:plantedA.xs.map((v,i)=>mod(v+key[i]))};
  const ciphertextB={...plantedB,xs:plantedB.xs.map((v,i)=>mod(v+key[i]))};
  const plantScore=solve(ciphertextA,ciphertextB,lm,0,true);
  const plantOthers=[];
  for(let shift=0;shift<269;shift++)plantOthers.push({shift,score:solve(ciphertextA,ciphertextB,lm,shift).score});
  plantOthers.sort((u,v)=>v.score-u.score);
  const plantedRank=plantOthers.findIndex(v=>v.shift===0)+1;
  const accuracy=plantScore.p.filter((r,i)=>r===plantedA.xs[i]).length/269;
  return {
    model: 'English Shakespeare 240k-character training, GP digraphs, smoothed character bigrams and exact rune-word ends',
    target:[28,42],comparison:'All 272 cyclic rotations of page42 glyph stream, with page42 word boundaries held fixed',
    observed:{score:observed.score,rankAmongShifts:ranking,shifts:b.xs.length,
      scoreMedian:sorted[Math.floor(sorted.length/2)].score,secondBest:sorted[1],
      decodedP28:observed.pText,decodedP42:observed.qText},
    heldoutPositive:{score:plantScore.score,rankAmongShifts:plantedRank,
      correctRuneFraction:accuracy,shifts:269},
    interpretation:'A winning shift is a secondary exploratory statistic after pair selection, not familywise-confirmed plaintext'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(study(),null,2)+'\n');
module.exports={encode,corpusWords,train,stream,lp2Page,solve,study};
