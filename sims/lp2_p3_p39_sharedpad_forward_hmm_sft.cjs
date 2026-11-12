'use strict';
/**
 * Issue #651 independent word-boundary-free GP29 shared-pad necessary test.
 * If C3=P3+K and C39=P39+K with identical K at local0, then the 119
 * symbol differences must have the statistical structure of P3-P39.
 * This SFT uses a fixed first-order pair-language hidden Markov model
 * and independent out-of-training-corpus native-English positive controls.
 *
 * node sims/lp2_p3_p39_sharedpad_forward_hmm_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const db = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const tokens = db.translit.map((t, i) => ({t, i}))
  .sort((a, b) => b.t.length - a.t.length);
/** @param {string} text @returns {number[]} */
function encode(text) {
  const out = [];
  for (const word of text.match(/[A-Za-z]+/g) || []) {
    const s = word.toUpperCase().replace(/[KVZQ]/g,
      c => ({K:'C', V:'U', Z:'S', Q:'C'})[c]);
    for (let i=0; i<s.length;) {
      const hit = tokens.find(x => s.startsWith(x.t, i));
      assert(hit, 'Unmappable GP native word: ' + s);
      out.push(hit.i);
      i += hit.t.length;
    }
  }
  return out;
}
const corpus = [
  read('resources/control/shakespeare_first300k.txt'),
  read('resources/control/gibran_prophet_58585.txt'),
  read('resources/control/emerson_essays_2944.txt'),
].map(encode);
const names = ['Shakespeare', 'Gibran', 'Emerson'];
const mod = x => (x % 29 + 29) % 29;
const original = db.pages[3].indices.slice(0,119)
  .map((x,i) => mod(x-db.pages[39].indices[i]));
assert.equal(original.length,119);
/**
 * @param {number[]} seq
 * @returns {{p: Float64Array, q: Float64Array[]}}
 */
function model(seq) {
  const p = new Float64Array(29).fill(1);
  const q = Array.from({length:29},()=>new Float64Array(29).fill(0.5));
  for (let i=0; i<seq.length; i++) {
    p[seq[i]]++;
    if (i) q[seq[i-1]][seq[i]]++;
  }
  const total=p.reduce((a,b)=>a+b,0);
  for (let i=0;i<29;i++)p[i]/=total;
  for (let i=0;i<29;i++) {
    const denom=q[i].reduce((a,b)=>a+b,0);
    for (let j=0;j<29;j++)q[i][j]/=denom;
  }
  return {p,q};
}
/** Exact forward likelihood with hidden a_i and b_i=a_i-D_i.
 *  @param {number[]} d
 *  @param {{p:Float64Array,q:Float64Array[]}} m
 *  @returns {number} log probability / rune
 */
function forward(d,m) {
  let prev=new Float64Array(29), next=new Float64Array(29), ll=0;
  for(let i=0;i<29;i++)prev[i]=m.p[i]*m.p[mod(i-d[0])];
  let total=prev.reduce((a,b)=>a+b,0);
  ll+=Math.log(total);
  for(let i=0;i<29;i++)prev[i]/=total;
  for(let k=1;k<d.length;k++) {
    next.fill(0);
    for(let i=0;i<29;i++) {
      const j=mod(i-d[k-1]), weight=prev[i];
      for(let n=0;n<29;n++) {
        next[n]+=weight*m.q[i][n]*m.q[j][mod(n-d[k])];
      }
    }
    total=next.reduce((a,b)=>a+b,0);
    ll+=Math.log(total);
    for(let i=0;i<29;i++)next[i]/=total;
    [prev,next]=[next,prev];
  }
  return ll/d.length;
}
let seed=0x51a8cb37;
/** @returns {number} */
function random() {
  seed^=seed<<13;
  seed^=seed>>>17;
  seed^=seed<<5;
  return seed>>>0;
}
const rows=[];
for(let train=0;train<3;train++) {
  const others=[0,1,2].filter(i=>i!==train);
  const m=model(corpus[train]), scoreOriginal=forward(original,m);
  const trials=1500;
  let nativeBelow=0,randomBelow=0,nativeMean=0;
  for(let test=0;test<trials;test++) {
    const a=corpus[others[0]], b=corpus[others[1]];
    const ia=random()%(a.length-119),ib=random()%(b.length-119);
    const native=Array.from({length:119},(_,j)=>mod(a[ia+j]-b[ib+j]));
    const scoreNative=forward(native,m);
    nativeMean+=scoreNative;
    if(scoreNative<=scoreOriginal)nativeBelow++;
    const independent=Array.from({length:119},()=>random()%29);
    if(forward(independent,m)<=scoreOriginal)randomBelow++;
  }
  rows.push({
    trainedOn:names[train],
    heldout:others.map(i=>names[i]),
    scoreOriginal,
    meanNativeScore:nativeMean/trials,
    nativeBelow,
    independentBelow:randomBelow,
    trials,
  });
}
assert.deepEqual(rows.map(x=>x.nativeBelow),[4,3,3]);
assert.deepEqual(rows.map(x=>x.independentBelow),[576,356,544]);
assert(rows.every(x=>x.nativeBelow/x.trials<0.005));
console.log(JSON.stringify({
  scope:'Original unaltered 119-rune two-prefix cancellation; no word boundary assumption',
  seed:'0x51a8cb37', sourceRUNEcounts:corpus.map(c=>c.length),
  sampling:'1500 native pairs and 1500 independent-pad uniform differences per heldout training choice',
  rows,
  classification:'Exploratory statistical incompatibility, not universal cryptographic exclusion or plaintext recovery',
},null,2));
