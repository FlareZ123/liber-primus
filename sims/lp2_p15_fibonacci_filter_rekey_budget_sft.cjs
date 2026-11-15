'use strict';
/**
 * Source-selected F_n recurrence key, allowing hidden rekeys and arbitrary
 * initial K0/K1. The p15 printed Fibonacci prime spiral motivates exactly
 * K_i=K_(i-1)+K_(i-2) mod29, not a search over recurrence coefficients.
 *
 * Algebraic key-free inverse gate:
 * C_i=P_i+K_i -> D2(C)_i-D2(P)_i=K_i-K_(i-1)-K_(i-2) mod29.
 * Each nonzero residual REQUIRES one key recurrence fault/rekey at i;
 * comparing histogram counts yields a lower bound on recurrence faults
 * even WITHOUT knowing plaintext order, provided its *filtered* 29-way
 * histogram equals that of a specified source-native English control.
 *
 * No file writes, no key fitting; single runnable Node22 CommonJS SFT.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
const book=pages.flatMap(p=>p.indices);
assert.equal(book.length,12956);
const J={TH:2,NG:21,EO:12,OE:22,AE:25,IA:27,EA:28};
const L={A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,W:7,X:14,Y:26,Z:15};
/** @param {string} input @returns {number[]} */
function encodeEnglish(input){
  const t=input.toUpperCase().replace(/[^A-Z]/g,'');
  const result=[];
  for(let i=0;i<t.length;i++){
    const dig=J[t.slice(i,i+2)];
    if(dig!==undefined){result.push(dig);i++;}
    else result.push(L[t[i]]);
  }
  return result;
}
/** @param {number[]} a @returns {number[]} */
function filter2(a){
  const out=[];
  for(let i=2;i<a.length;i++)out.push((a[i]-a[i-1]-a[i-2]+58)%29);
  return out;
}
/** @param {number[]} a @returns {number[]} */
function hist(a){const h=Array(29).fill(0);for(const v of a){assert(v>=0&&v<29);h[v]++;}return h;}
/** @param {number[]} observed @param {number[]} candidate */
function minFaults(observed,candidate){
  assert.equal(observed.length,candidate.length);
  const a=hist(observed),b=hist(candidate);
  const sum=a.reduce((v,x,i)=>v+Math.abs(x-b[i]),0);
  assert.equal(sum%2,0);
  return sum/2;
}
/** @param {number[]} text @param {number} a @param {number} b @param {number} rekeyStep */
function additiveCipher(text,a,b,rekeyStep=0){
  const keys=[a,b];
  for(let i=2;i<text.length;i++){
    const exception=(rekeyStep&&i%rekeyStep===0)?7:0;
    keys.push((keys[i-1]+keys[i-2]+exception)%29);
  }
  return {keys,cipher:text.map((v,i)=>(v+keys[i])%29)};
}
const controls={
  Gibran:encodeEnglish(read('resources/control/gibran_prophet_58585.txt').split('*** START OF THIS PROJECT GUTENBERG EBOOK THE PROPHET ***').at(-1).split('*** END OF THIS PROJECT GUTENBERG EBOOK THE PROPHET ***')[0]),
  Shakespeare:encodeEnglish(read('resources/control/shakespeare_first300k.txt')),
  Emerson:encodeEnglish(read('resources/control/emerson_essays_2944.txt').split('*** START OF THIS PROJECT GUTENBERG EBOOK ESSAYS, FIRST SERIES ***').at(-1))
};
for(const [name,plain] of Object.entries(controls)){
  assert(plain.length>=book.length,name+' must cover original book');
}
const native=corpus.pages[57].indices;
assert.equal(native.length,95);
for(const seed of [[0,1],[24,3]]){
  for(const rekeyStep of [0,37]){
    const {keys,cipher}=additiveCipher(native,...seed,rekeyStep);
    const y=filter2(cipher),p=filter2(native),k=filter2(keys);
    for(let i=0;i<y.length;i++)
      assert.equal((y[i]-p[i]+29)%29,k[i]);
    const plantedExactFaults=k.filter(v=>v!==0).length;
    assert.equal(plantedExactFaults,rekeyStep?2:0);
    assert(minFaults(y,p)<=plantedExactFaults);
  }
}
const chapterEnds=[729,1874,3603,5506,6527,7960,9640,12648,12956];
assert.equal(chapterEnds.at(-1),book.length);
const scopes={
  originalBook:book,
  originalP15to22After9Red:book.slice(3603+9,5506),
  independentP3to7:book.slice(729,1874),
  independentP40to53After8Red:book.slice(9640+8,12648),
  terminalP54to55After9Red:book.slice(12648+9)
};
const results={};
for(const [scope,original] of Object.entries(scopes)){
  const originalFilter=filter2(original);
  const bySource={};
  for(const [name,plain] of Object.entries(controls)){
    const samples=[];
    for(let off=0;off+original.length<=plain.length;off+=original.length){
      const candidate=filter2(plain.slice(off,off+original.length));
      const bound=minFaults(originalFilter,candidate);
      samples.push({sourceRuneOffset:off,minRecurrenceFaults:bound,
        minFraction:bound/originalFilter.length});
    }
    assert(samples.length>0);
    samples.sort((a,b)=>a.minRecurrenceFaults-b.minRecurrenceFaults);
    bySource[name]={windows:samples.length,best:samples[0],
      worst:samples.at(-1)};
  }
  results[scope]={runes:original.length,filteredPositions:originalFilter.length,
    bySource};
}
const mainBest=Object.values(results.originalBook.bySource)
  .map(x=>x.best.minFraction);
assert(mainBest.every(x=>x>0.03));
console.log(JSON.stringify({
  proposedModel:'source-visible p15 Fibonacci recurrence over GP29, any initial seed, plus exceptional rekey residues',
  filter:'Y[i]=(C[i]-C[i-1]-C[i-2]) modulo29',
  necessaryCondition:'number of recurrence faults >= half L1 histogram difference vs source-native filtered plaintext',
  positive:'all native p57 GP29 positions passed for exact Fibonacci and 3 faults under every 37-step rekey schedule',
  controls:'non-overlapping exact rune-length windows, simple canonical GP digraph transliteration',
  results,
  verdict:'Conditional: no <=3% fault/rekey GP29 Fibonacci-additive key fits these exact native prose windows; no unknown plaintext or authentic key recovered.'
},null,2));
