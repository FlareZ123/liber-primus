"use strict";
/**
 * Exact crib-free maximum-likelihood inversion of the two proposed 4D F29
 * source matrices. Uses a sparse Fourier representation of the entire
 * 29^4-state likelihood, then performs four 29-point tensor transforms.
 *
 * Distinct from crib-fitting: every one of 707281 states is scored from
 * original physical pages 0..27, before decoding pages 28..55.
 * An independently encrypted solved-Cicada GP source control verifies
 * blind state recovery, exact full inverse, and exact full re-encryption.
 *
 * Scope: GP-EA zero-difference marker, 15^plaintext-step feedback and one
 * continuously evolving four-dimensional source-matrix state. The source
 * matrices and this architecture remain hypotheses, not historical keys.
 *
 * Node.js 22 CommonJS. Run: node sims/source_4d_fourier_fullkey_inverse.cjs
 */
const assert = require("node:assert/strict");
const red = require("./red16_spiral_4d_native_crib.cjs");
const { C, N, pages, nativeSymbols } = red;
const fs = require("node:fs");
const path = require("node:path");
const REGISTER = process.env.GP_REGISTER === "latin" ? "latin" : "solved-cicada";
const latin = REGISTER === "latin" ? JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources","control","latin-vulgate-gp-trigrams.json"),"utf8")) : null;
const latinHoldout = REGISTER === "latin" ? JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources","control","latin-vulgate-heldout-gp.json"),"utf8")).runes : null;
const P = 29, STATES = P ** 4, EA = 28;
const mod = x => (x % P + P) % P;
assert.equal(STATES, 707281);
assert.equal(N, 12956);
const matrices = [
  { label: "red16-prime-sum-spiral", A: red.A },
  { label: "red16-visible-count-spiral", A: [
    [9,11,16,19],[12,13,16,10],[14,11,3,8],[9,22,8,3]
  ] },
  { label: "printed-p15-prime-spiral", A: [
    [3258,3222,3152,3038], [3278,3299,3298,2838],
    [3288,3294,3296,2472], [4516,1206,708,1820]
  ].map(row => row.map(mod)) },
  // The LP1 p05 text says the totient function is sacred; LP1's MOBIUS
  // cell has GP-prime sum 226. Applying phi to the 16 primes underlying
  // the LP2 p15 Fibonacci spiral gives this independent 4x4 transition
  // matrix. This is a clue-motivated candidate, not an established cipher.
  { label: "p15-fibonacci-prime-totient-spiral", A: [
    [42,78,148,262], [22,1,2,462],
    [12,6,4,828], [7816,4506,2592,1480]
  ].map(row => row.map(mod)) }
];
const isHead = new Uint8Array(N), isTrain = new Uint8Array(N);
let offset = 0, trainCount = 0;
for (const page of pages) {
  isHead[offset] = 1;
  for (let i = 0; i < page.indices.length; i++) {
    if (page.page < 28) {
      isTrain[offset+i] = 1;
      trainCount++;
    }
  }
  offset += page.indices.length;
}
assert.equal(offset, N);
assert.equal(trainCount, 6761);
const pow = Array.from({ length: 28 }, (_, j) => {
  let x = 1;
  for (let k = 0; k < j; k++) x = x * 15 % P;
  return x;
});
const logarithm = new Int8Array(P).fill(-1);
pow.forEach((x, j) => { logarithm[x] = j; });
const freq = new Float64Array(P).fill(0.5);
if(latin)latin.u.forEach((n,i)=>{freq[i]+=n;});
else for (const p of nativeSymbols) freq[p]++;
const total = freq.reduce((a,b)=>a+b,0);
const nonEA = total - freq[EA];
const score29 = Array.from(freq,x=>Math.log(P*x/total));
const score28 = Array.from(freq.slice(0,28),x=>Math.log(28*x/nonEA));
const precomputed = [];
const TWO_PI = 2*Math.PI;
const cos = new Float64Array(P), sin = new Float64Array(P);
for(let z=0;z<P;z++) {
  cos[z]=Math.cos(TWO_PI*z/P);
  sin[z]=Math.sin(TWO_PI*z/P);
}
/**
 * Frequency-domain coefficients of the log-likelihood contribution f(k).
 * @param {number[]} values
 */
function spectrum(values) {
  const re = new Float64Array(P), im = new Float64Array(P);
  for (let m=0;m<P;m++) for (let k=0;k<P;k++) {
    const j=m*k%P, weight=values[k]/P;
    re[m]+=weight*cos[j];
    im[m]-=weight*sin[j];
  }
  return {re,im};
}
for(let e=0;e<28;e++) {
  precomputed.push(spectrum(Array.from({length:P},(_,k)=>
    score28[(e-(k%28)+28)%28])));
}
for(let c=0;c<P;c++) {
  precomputed.push(spectrum(Array.from({length:P},(_,k)=>
    score29[mod(c-k)])));
}
const logstep = cipher => {
  const e = new Int8Array(N).fill(-1);
  for(let t=0;t<N;t++) {
    if(isHead[t])continue;
    const d=mod(cipher[t]-cipher[t-1]);
    if(d)e[t]=logarithm[d];
  }
  return e;
};
/** @param {number[][]} A */
function vectors(A) {
  let v=[1,0,0,0];
  const result = new Array(N);
  for(let t=0;t<N;t++) {
    result[t]=v;
    v = Array.from({length:4},(_,j)=>
      mod(v.reduce((s,x,i)=>s+x*A[i][j],0)));
  }
  return result;
}
const stateIndex = s => s[0]+P*(s[1]+P*(s[2]+P*s[3]));
const decodeIndex = n => {
  const s=[];
  for(let k=0;k<4;k++) {s.push(n%P);n=Math.floor(n/P);}
  return s;
};
const matrixKey=(V,t,s)=>mod(V[t][0]*s[0]+V[t][1]*s[1]+
  V[t][2]*s[2]+V[t][3]*s[3]);
/** @param {number[]} cipher @param {number[][]} V @param {number[]} s */
function decrypt(cipher,V,s) {
  const plain=new Array(N);
  for(let t=0;t<N;t++) {
    const k=matrixKey(V,t,s);
    if(isHead[t])plain[t]=mod(cipher[t]-k);
    else {
      const d=mod(cipher[t]-cipher[t-1]);
      plain[t]=d?(logarithm[d]-(k%28)+56)%28:EA;
    }
  }
  return plain;
}
/** @param {number[]} plain @param {number[][]} V @param {number[]} s */
function encrypt(plain,V,s) {
  const cipher=new Array(N);
  for(let t=0;t<N;t++) {
    const k=matrixKey(V,t,s);
    if(isHead[t])cipher[t]=mod(plain[t]+k);
    else cipher[t]=plain[t]===EA?cipher[t-1]:
      mod(cipher[t-1]+pow[(plain[t]+k%28)%28]);
  }
  return cipher;
}
/**
 * Compute exactly the same conditional GP likelihood used to build
 * the sparse Fourier spectrum, skipping key-independent EA positions.
 * @param {number[]} cipher
 * @param {number[][]} V
 * @param {number[]} s
 * @param {boolean} train
 */
function directScore(cipher,V,s,train) {
  let score=0, count=0;
  for(let t=0;t<N;t++) {
    if(Boolean(isTrain[t])!==train)continue;
    const k=matrixKey(V,t,s);
    if(isHead[t]) score+=score29[mod(cipher[t]-k)];
    else {
      const delta=mod(cipher[t]-cipher[t-1]);
      if(!delta)continue;
      score+=score28[(logarithm[delta]-(k%28)+28)%28];
    }
    count++;
  }
  return {sum:score,mean:score/count,count};
}
/**
 * Add the spectrum of each observed original training rune to the
 * Fourier coordinates m * (A^t e0), m=0..28. The data dependence is
 * linear in the four unknown F29 state coordinates.
 * @param {number[]} cipher
 * @param {number[][]} V
 */
function sparseSpectrum(cipher,V) {
  const re=new Float64Array(STATES), im=new Float64Array(STATES);
  const e=logstep(cipher);
  let totalPoints=0;
  for(let t=0;t<N;t++) {
    if(!isTrain[t] || (!isHead[t]&&e[t]<0))continue;
    const f=precomputed[isHead[t]?28+cipher[t]:e[t]];
    const v=V[t];
    for(let m=0;m<P;m++) {
      const j=(m*v[0]%P)+P*((m*v[1]%P)+P*((m*v[2]%P)+P*(m*v[3]%P)));
      re[j]+=f.re[m]; im[j]+=f.im[m];
    }
    totalPoints++;
  }
  return {re,im,totalPoints};
}
/**
 * Fourier synthesis along four F29 dimensions. The inverse transform
 * deliberately has no scale: each 1/29 factor is already in spectrum().
 * This yields the exact score at every one of the 29^4 secret states.
 * @param {Float64Array} re @param {Float64Array} im
 */
function fourierSynthesis(re,im) {
  const a=new Float64Array(P),b=new Float64Array(P);
  for(let stride=1;stride<STATES;stride*=P) {
    const block=stride*P;
    for(let base=0;base<STATES;base+=block) for(let off=0;off<stride;off++) {
      for(let j=0;j<P;j++) {
        const ix=base+off+j*stride;
        a[j]=re[ix];b[j]=im[ix];
      }
      for(let k=0;k<P;k++) {
        let sumR=0,sumI=0;
        for(let j=0;j<P;j++) {
          const phase=k*j%P, cr=cos[phase],si=sin[phase];
          sumR+=a[j]*cr-b[j]*si;
          sumI+=a[j]*si+b[j]*cr;
        }
        const ix=base+off+k*stride;
        re[ix]=sumR;im[ix]=sumI;
      }
    }
  }
  return re;
}
function topRanks(scores, count=10) {
  const indices=Array.from({length:STATES},(_,i)=>i);
  indices.sort((i,j)=>scores[j]-scores[i]);
  return indices.slice(0,count).map(i=>({state:decodeIndex(i),trainSum:scores[i]}));
}
/** @param {number[]} plain */
function coincidence(plain,start=0,end=plain.length) {
  const f=new Float64Array(29);
  for(let t=start;t<end;t++)f[plain[t]]++;
  const n=end-start;
  return f.reduce((x,c)=>x+c*(c-1),0)/(n*(n-1));
}
/**
 * Optimize all keys for a completely frozen source transition matrix.
 * Synthetic ciphertext is generated with an unknown state in precisely
 * the same original physical-page layout.
 */
function experiment(label,A,cipher,knownState=null) {
  const V=vectors(A);
  const spectral=sparseSpectrum(cipher,V);
  const scores=fourierSynthesis(spectral.re,spectral.im);
  for(const s of [[0,0,0,0],[1,2,3,4],[11,7,22,3]]) {
    const exact=directScore(cipher,V,s,true).sum;
    assert.ok(Math.abs(exact-scores[stateIndex(s)])<1e-5,
      "DFT must equal direct original-cipher likelihood");
  }
  const ranked=topRanks(scores,10);
  const top=ranked[0].state;
  const recovered=decrypt(cipher,V,top);
  assert.deepEqual(encrypt(recovered,V,top),cipher);
  const topTrain=directScore(cipher,V,top,true);
  const topHold=directScore(cipher,V,top,false);
  const bestByTrain=ranked.map(r=>({
    ...r,heldout:directScore(cipher,V,r.state,false).mean}));
  let known=null;
  if(knownState) {
    const target=stateIndex(knownState), desired=scores[target];
    const rank=1+scores.reduce((n,x)=>n+Number(x>desired+1e-7),0);
    const truePlain=decrypt(cipher,V,knownState);
    assert.deepEqual(encrypt(truePlain,V,knownState),cipher);
    assert.deepEqual(truePlain,plantedPlain,
      "Blind planted key must restore all source-native GP symbols");
    known={state:knownState,rank,knownTrain:
      directScore(cipher,V,knownState,true),knownHold:
      directScore(cipher,V,knownState,false),exactRecoveredRunes:N};
    assert.equal(rank,1,
      "An exhaustive state-score algorithm must recover a native-source plant");
  }
  return {sourceMatrix:label,sourceA:A,statesScored:STATES,
    trainingOriginalPages:"physical 0..27",
    trainingCipherRunes:trainCount,heldoutCipherRunes:N-trainCount,
    eligibleTrainingSymbols:spectral.totalPoints,
    bestByTrain:bestByTrain.slice(0,5),topScore:topTrain,
    frozenHeldoutScore:topHold,heldoutPlaintextIOC:
      coincidence(recovered.slice(trainCount)),
    exactForwardCipherReencrypted:N,
    firstHeldoutGpIndices:recovered.slice(trainCount,trainCount+40),
    knownStateControl:known};
}

/**
 * Source-GP bigram likelihood on non-EA consecutive runes.
 * Unlike the 1D unary case, the key-dependent potential is a function
 * of TWO projections of the same global secret state. A two-dimensional
 * Fourier expansion remains sparse in the full 4D key-state grid.
 */
const pairFreq = Array.from({length:28},()=>new Float64Array(28).fill(0.5));
if(latin) {
  for(const [index,n] of latin.b) {
    const a=Math.floor(index/29),b=index%29;
    if(a!==EA&&b!==EA)pairFreq[a][b]+=n;
  }
}else for(let t=1;t<nativeSymbols.length;t++) {
  const a=nativeSymbols[t-1],b=nativeSymbols[t];
  if(a!==EA&&b!==EA)pairFreq[a][b]++;
}
const pairSum = pairFreq.reduce((s,row)=>
  s+row.reduce((a,b)=>a+b,0),0);
const pairLog = pairFreq.map(row=>
  Array.from(row,x=>Math.log(784*x/pairSum)));
/** @typedef {{re:Float64Array,im:Float64Array}} Spectrum */
const pairCache=new Array(28*28);
/**
 * Exact two-dimensional 29x29 discrete Fourier coefficients for f(k,l)
 * where k,l are projected state values in F29. A value of 28 aliases
 * key zero under the tested cipher's 28-step output rule.
 * @param {number} earlierExponent @param {number} laterExponent
 * @returns {Spectrum}
 */
function pairSpectrum(earlierExponent,laterExponent) {
  const tag=28*earlierExponent+laterExponent;
  if(pairCache[tag])return pairCache[tag];
  const midwayR=new Float64Array(P*P),midwayI=new Float64Array(P*P);
  const outR=new Float64Array(P*P),outI=new Float64Array(P*P);
  for(let l=0;l<P;l++)for(let m=0;m<P;m++) {
    let a=0,b=0;
    for(let k=0;k<P;k++) {
      const val=pairLog[(earlierExponent-k%28+28)%28]
        [(laterExponent-l%28+28)%28]/P;
      const phase=m*k%P;
      a+=val*cos[phase]; b-=val*sin[phase];
    }
    midwayR[m*P+l]=a;midwayI[m*P+l]=b;
  }
  for(let m=0;m<P;m++)for(let n=0;n<P;n++) {
    let a=0,b=0;
    for(let l=0;l<P;l++) {
      const ix=m*P+l,phase=n*l%P,c=cos[phase],s=sin[phase];
      a+=(midwayR[ix]*c+midwayI[ix]*s)/P;
      b+=(midwayI[ix]*c-midwayR[ix]*s)/P;
    }
    outR[m*P+n]=a;outI[m*P+n]=b;
  }
  return (pairCache[tag]={re:outR,im:outI});
}
/**
 * Sum the two-ridge F29 Fourier coefficients into the global 4D grid.
 * Pageheads and immediate repeats are omitted in this model's bigram
 * objective. Both source positions must be wholly inside the same split.
 * @param {number[]} cipher @param {number[][]} V
 */
function sparsePairSpectrum(cipher,V) {
  const re=new Float64Array(STATES),im=new Float64Array(STATES);
  const exponents=logstep(cipher);
  let eligible=0;
  for(let t=1;t<N;t++) {
    if(!isTrain[t]||!isTrain[t-1]||
      isHead[t]||isHead[t-1]||
      exponents[t]<0||exponents[t-1]<0)continue;
    const f=pairSpectrum(exponents[t-1],exponents[t]);
    const a=V[t-1],b=V[t];
    for(let m=0;m<P;m++)for(let n=0;n<P;n++) {
      const index=(m*a[0]+n*b[0])%P+
        P*((m*a[1]+n*b[1])%P+
        P*((m*a[2]+n*b[2])%P+
        P*((m*a[3]+n*b[3])%P)));
      const ix=m*P+n;
      re[index]+=f.re[ix];im[index]+=f.im[ix];
    }
    eligible++;
  }
  return {re,im,eligible};
}
/**
 * Direct independent check on the original step-pair scoring functional.
 * @param {number[]} cipher @param {number[][]} V
 * @param {number[]} state @param {boolean} train
 */
function directPairScore(cipher,V,state,train) {
  const exponent=logstep(cipher);
  let value=0,count=0;
  for(let t=1;t<N;t++) {
    if(Boolean(isTrain[t])!==train||
      Boolean(isTrain[t-1])!==train||
      isHead[t]||isHead[t-1]||
      exponent[t]<0||exponent[t-1]<0)continue;
    const k0=matrixKey(V,t-1,state)%28,k1=matrixKey(V,t,state)%28;
    value+=pairLog[(exponent[t-1]-k0+28)%28]
      [(exponent[t]-k1+28)%28];
    count++;
  }
  return {sum:value,mean:value/count,count};
}
/**
 * Second objective, exhaustive across the entire state space, based
 * on solved-Cicada GP source bigrams. Training and heldout original
 * positions remain identical to the 1D attack.
 * @param {string} label @param {number[][]} A
 * @param {number[]} cipher @param {number[]|null} known
 */
function pairExperiment(label,A,cipher,known=null) {
  const V=vectors(A);
  const sparse=sparsePairSpectrum(cipher,V);
  const score=fourierSynthesis(sparse.re,sparse.im);
  for(const s of [[0,0,0,0],[1,2,3,4],[11,7,22,3]]) {
    const direct=directPairScore(cipher,V,s,true).sum;
    assert.ok(Math.abs(direct-score[stateIndex(s)])<1e-5,
      "Two-dimensional source Fourier score must match exact direct sum");
  }
  const ranked=topRanks(score,10);
  const best=ranked[0].state;
  const decoded=decrypt(cipher,V,best);
  assert.deepEqual(encrypt(decoded,V,best),cipher);
  const output={
    sourceMatrix:label,objective:"unfitted consecutive non-EA GP source bigrams",
    sourceBigrams:latin?latin.b.reduce((s,p)=>s+p[1],0):nativeSymbols.length-1,
    stateSpaceExhausted:STATES,trainPairs:sparse.eligible,
    originalTraining:directPairScore(cipher,V,best,true),
    frozenHeldout:directPairScore(cipher,V,best,false),
    bestStates:ranked.slice(0,5).map(x=>({...x,
      heldout:directPairScore(cipher,V,x.state,false).mean})),
    heldoutPlaintextIOC:coincidence(decoded.slice(trainCount)),
    cipherRunesExactlyReencrypted:N,
    firstUnfittedGpIndices:decoded.slice(trainCount,trainCount+32)
  };
  if(known) {
    const trueScore=score[stateIndex(known)];
    const rank=1+score.reduce((s,x)=>s+Number(x>trueScore+1e-7),0);
    const truth=decrypt(cipher,V,known);
    assert.deepEqual(truth,plantedPlain);
    assert.equal(rank,1,
      "Native GP source plant must identify its hidden 4D state");
    output.knownStateControl={state:known,rank,
      exactRecoveredPlaintext:N,
      heldout:directPairScore(cipher,V,known,false)};
  }
  return output;
}


/**
 * An alternative 29-symbol output architecture:
 *    C_t = P_t + e0 * A^t * S (mod 29).
 * This is NOT the same as the transparent-EA predecessor-step cipher.
 * Every rune, including printed page heads and repeated ciphertexts,
 * is directly enciphered and must be exactly recovered.
 * Source-native unigrams and 29x29 adjacent GP bigrams are scored over
 * all 29^4 initial states with an exact Fourier convolution.
 */
const directPairFreq=Array.from({length:P},()=>new Float64Array(P).fill(0.5));
if(latin) {
  for(const [index,count] of latin.b)
    directPairFreq[Math.floor(index/P)][index%P]+=count;
} else {
  for(let i=1;i<nativeSymbols.length;i++)
    directPairFreq[nativeSymbols[i-1]][nativeSymbols[i]]++;
}
const directPairTotal=directPairFreq.reduce(
  (s,row)=>s+row.reduce((a,b)=>a+b,0),0);
const directPairLog=directPairFreq.map(row=>
  Array.from(row,v=>Math.log(P*P*v/directPairTotal)));
/**
 * Fourier transform of g(c-k,d-l): select the single source bigram
 * kernel, transform it once and apply the observed ciphertext phase.
 * @returns {Spectrum}
 */
function directPairKernel() {
  const re=new Float64Array(P*P),im=new Float64Array(P*P);
  const tempRe=new Float64Array(P*P),tempIm=new Float64Array(P*P);
  for(let m=0;m<P;m++)for(let y=0;y<P;y++) {
    let x=0,z=0;
    for(let a=0;a<P;a++) {
      const phase=m*a%P,weight=directPairLog[a][y]/P;
      x+=weight*cos[phase];z+=weight*sin[phase];
    }
    tempRe[m*P+y]=x;tempIm[m*P+y]=z;
  }
  for(let m=0;m<P;m++)for(let n=0;n<P;n++) {
    let x=0,z=0;
    for(let b=0;b<P;b++) {
      const index=m*P+b,phase=n*b%P,
        w=tempRe[index],v=tempIm[index];
      x+=(w*cos[phase]-v*sin[phase])/P;
      z+=(w*sin[phase]+v*cos[phase])/P;
    }
    re[m*P+n]=x;im[m*P+n]=z;
  }
  return {re,im};
}
const directKernel=process.env.GP_DIRECT==="1" ? directPairKernel() : null;
/** @param {number[]} cipher @param {number[][]} V @param {number[]} state */
function directPlain(cipher,V,state) {
  return cipher.map((c,t)=>mod(c-matrixKey(V,t,state)));
}
/** @param {number[]} plain @param {number[][]} V @param {number[]} state */
function directCipher(plain,V,state) {
  return plain.map((c,t)=>mod(c+matrixKey(V,t,state)));
}
function directLikelihood(cipher,V,state,train,pair) {
  let sum=0,count=0;
  for(let t=0;t<N;t++) {
    if(Boolean(isTrain[t])!==train)continue;
    if(pair) {
      if(t===0||isHead[t]||Boolean(isTrain[t-1])!==train)continue;
      const u=mod(cipher[t-1]-matrixKey(V,t-1,state));
      const v=mod(cipher[t]-matrixKey(V,t,state));
      sum+=directPairLog[u][v];count++;
    } else {
      sum+=score29[mod(cipher[t]-matrixKey(V,t,state))];count++;
    }
  }
  return {sum,mean:sum/count,count};
}
/**
 * A 1-ridge observation induces at most 29 Fourier frequencies in
 * full 4D state space, independent of any secret key.
 */
function directUnigramSpectrum(cipher,V) {
  const re=new Float64Array(STATES),im=new Float64Array(STATES);
  let eligible=0;
  for(let t=0;t<N;t++) {
    if(!isTrain[t])continue;
    const f=precomputed[28+cipher[t]],v=V[t];
    for(let m=0;m<P;m++) {
      const index=(m*v[0]%P)+P*((m*v[1]%P)+P*((m*v[2]%P)+P*(m*v[3]%P)));
      re[index]+=f.re[m];im[index]+=f.im[m];
    }
    eligible++;
  }
  return {re,im,eligible};
}
/**
 * For pair (c,d), Fourier coefficient is G(m,n)*exp[-2πi
 * (m*c+n*d)/29]. Source kernel G itself is independently computed
 * using +2πi GP plaintext phase. Every coefficient is added on the
 * linear span m*v_(t-1)+n*v_t in the full F29^4 key space.
 */
function directBigramSpectrum(cipher,V) {
  assert.ok(directKernel);
  const re=new Float64Array(STATES),im=new Float64Array(STATES);
  let eligible=0;
  for(let t=1;t<N;t++) {
    if(!isTrain[t]||!isTrain[t-1]||isHead[t])continue;
    const a=V[t-1],b=V[t],x=cipher[t-1],y=cipher[t];
    for(let m=0;m<P;m++)for(let n=0;n<P;n++) {
      const index=(m*a[0]+n*b[0])%P+
        P*((m*a[1]+n*b[1])%P+
        P*((m*a[2]+n*b[2])%P+
        P*((m*a[3]+n*b[3])%P)));
      const z=m*P+n,phase=(m*x+n*y)%P;
      const u=directKernel.re[z],v=directKernel.im[z];
      re[index]+=u*cos[phase]+v*sin[phase];
      im[index]+=v*cos[phase]-u*sin[phase];
    }
    eligible++;
  }
  return {re,im,eligible};
}
function directExperiment(label,A,cipher,knownState=null) {
  const V=vectors(A),summary={};
  for(const pair of [false,true]) {
    const sparse=pair?directBigramSpectrum(cipher,V):
      directUnigramSpectrum(cipher,V);
    const scores=fourierSynthesis(sparse.re,sparse.im);
    for(const state of [[0,0,0,0],[11,7,22,3],[5,12,19,27]]) {
      const d=directLikelihood(cipher,V,state,true,pair).sum;
      assert.ok(Math.abs(d-scores[stateIndex(state)])<1e-5,
        "Exact Fourier score must reproduce direct full-GP arithmetic");
    }
    const best=topRanks(scores,6);
    const top=best[0].state;
    const decoded=directPlain(cipher,V,top);
    assert.deepEqual(directCipher(decoded,V,top),cipher,
      "Original ciphertext must exactly re-encrypt from found state");
    const output={
      initialState:top,
      eligibleOriginalTraining:sparse.eligible,
      train:directLikelihood(cipher,V,top,true,pair),
      frozenHeldout:directLikelihood(cipher,V,top,false,pair),
      heldoutIoC:coincidence(decoded.slice(trainCount)),
      statesExhausted:STATES,
      wholeCipherExactlyReencrypted:N,
      firstHeldoutGP:decoded.slice(trainCount,trainCount+40)
    };
    if(knownState) {
      const trueValue=scores[stateIndex(knownState)];
      const rank=1+scores.reduce((sum,value)=>
        sum+Number(value>trueValue+1e-7),0);
      assert.equal(rank,1,"Native GP source plant must recover true key");
      assert.deepEqual(directPlain(cipher,V,knownState),plantedPlain);
      output.nativePlant={secret:knownState,rank,
        GPPlaintextExactlyRestored:N,
        heldout:directLikelihood(cipher,V,knownState,false,pair)};
    }
    summary[pair?"gp29Bigram":"gp29Unigram"]=output;
  }
  return {sourceMatrix:label,sourceA:A,results:summary};
}

const sourcePlant=latinHoldout || nativeSymbols;
const plantedPlain=Array.from({length:N},(_,t)=>sourcePlant[t%sourcePlant.length]);
const report={classification:"Exhaustive 4D F29 source-matrix inverse (not an LP2 solution)",register:REGISTER,
  sourceTrainingRunes:latin?.n||nativeSymbols.length,sourcePlantBaseRunes:sourcePlant.length,
  assumption:"Continuous A-powered 4-state key, transparent EA marker, 15-root step cipher",
  originalAndControls:[]};
for(const source of matrices) {
  const V=vectors(source.A);
  const secret=source.label === "red16-prime-sum-spiral" ? [11,7,22,3] :
    source.label === "red16-visible-count-spiral" ? [1,9,18,27] :
    source.label === "p15-fibonacci-prime-totient-spiral" ? [17,5,23,9] :
    [5,12,19,27];
  const plantedCipher=encrypt(plantedPlain,V,secret);
  assert.deepEqual(decrypt(plantedCipher,V,secret),plantedPlain);
  const actual=experiment(source.label,source.A,C);
  const control=experiment(source.label,source.A,plantedCipher,secret);
  const originalBigram=pairExperiment(source.label,source.A,C);
  const plantedBigram=pairExperiment(source.label,source.A,plantedCipher,secret);
  report.originalAndControls.push({original:actual,blindSourceNativeControl:control,
    originalBigram,blindSourceNativeBigramControl:plantedBigram});
}
if(process.env.GP_DIRECT==="1") {
  report.classification="Exhaustive direct 29-symbol additive 4D cipher, different from transparent EA step model";
  report.assumption="C[t]=(P[t]+first(A^t*S)) mod29, continuously over all 12956 runes";
  report.originalAndControls=[];
  for(const source of matrices) {
    const V=vectors(source.A);
    const secret=source.label === "red16-prime-sum-spiral" ? [11,7,22,3] :
      source.label === "red16-visible-count-spiral" ? [1,9,18,27] : [5,12,19,27];
    const plantedCipher=directCipher(plantedPlain,V,secret);
    assert.deepEqual(directPlain(plantedCipher,V,secret),plantedPlain);
    const original=directExperiment(source.label,source.A,C);
    const blindNativeControl=directExperiment(source.label,source.A,plantedCipher,secret);
    report.originalAndControls.push({original,blindNativeControl});
  }
}
process.stdout.write(JSON.stringify(report,null,2)+"\n");
