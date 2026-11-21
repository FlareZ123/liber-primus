'use strict';

/**
 * One bounded cross-page receiver test:
 *   p23/p39 factor product -> exact p50 GF29 quotient Q
 *   p7 five-red-word GF29 LFSR + source-derived DH seed
 *   -> additive/subtractive decryptions of Q at the natural phase zero.
 *
 * This tests the source-derived p7 recurrence as a possible consumer of Q.
 * It does not search phases, signs beyond the two additive directions, or
 * alternative recurrences. Node.js 22+, deterministic and offline.
 */
const fs = require('node:fs');
const crypto = require('node:crypto');
const grid = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-grid-256.json', 'utf8'));
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync('resources/cicada2014-archive-hash-manifest.json', 'utf8'));
const target = manifest.targetHex.toLowerCase();
const mod = x => ((x % 29) + 29) % 29;
const factor = [12,16,7,24,5];
const factorDescending = factor.slice().reverse();
const p7Coefficients = [11,26,8,15,2];
const dhSeed = [23,2,5,2,19];
const p7Period = 1876;

function inv(a) {
  for (let x=1;x<29;x++) if(mod(a*x)===1) return x;
  throw new Error('No inverse modulo 29');
}
function divideByFactor(descendingCoefficients) {
  const work=descendingCoefficients.map(mod), q=[], leadInv=inv(factorDescending[0]);
  for(let i=0;i<=work.length-factorDescending.length;i++){
    const c=mod(work[i]*leadInv); q.push(c);
    for(let j=0;j<factorDescending.length;j++) work[i+j]=mod(work[i+j]-c*factorDescending[j]);
  }
  return {q,remainder:work.slice(-4)};
}
function generate(seed,n) {
  const out=seed.slice();
  for(let t=5;t<n;t++) out.push(mod(p7Coefficients.reduce(
    (sum,c,j)=>sum+c*out[t-j-1],0)));
  return out.slice(0,n);
}
function ioc(values) {
  const f=Array(29).fill(0); values.forEach(x=>f[x]++);
  return f.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}
function trim(p) {
  while(p.length>1 && mod(p[p.length-1])===0) p.pop();
  return p;
}
function polyGcd(a,b) {
  a=trim(a.map(mod)); b=trim(b.map(mod));
  while(!(b.length===1 && mod(b[0])===0)) {
    const r=a.slice(), invLead=inv(b[b.length-1]);
    for(let i=r.length-1;i>=b.length-1;i--){
      const t=mod(r[i]*invLead);
      for(let j=0;j<b.length;j++) r[i-(b.length-1)+j]=mod(r[i-(b.length-1)+j]-t*b[j]);
    }
    a=b; b=trim(r.slice(0,b.length-1)); if(!b.length)b=[0];
  }
  const g=a.map(mod), scale=inv(g[g.length-1]);
  return g.map(x=>mod(x*scale));
}
function hashSet(bytes) {
  return ['sha512','sha3-512','blake2b512'].map(algorithm=>{
    const hex=crypto.createHash(algorithm).update(bytes).digest('hex');
    return {algorithm,hex,match:hex===target};
  });
}
if(grid.bytes.length!==256 || corpus.translit.length!==29) throw new Error('Input shape mismatch');
const {q,remainder}=divideByFactor(grid.bytes);
if(q.length!==252 || remainder.some(x=>x!==0)) throw new Error('p23/p39 factor division failed');
if(dhSeed.length!==5 || p7Coefficients.length!==5) throw new Error('LFSR dimensions invalid');
const key=generate(dhSeed,q.length);
const residuals=q.slice(5).map((x,i)=>mod(x-p7Coefficients.reduce(
  (s,c,j)=>s+c*q[i+4-j],0)));
const p7Characteristic=[mod(-p7Coefficients[4]),mod(-p7Coefficients[3]),
  mod(-p7Coefficients[2]),mod(-p7Coefficients[1]),mod(-p7Coefficients[0]),1];
const commonFactor=polyGcd(p7Characteristic,factor);
const results=[];
for(const sign of [-1,1]){
  const values=q.map((x,i)=>mod(x+sign*key[i]));
  const raw=Buffer.from(values);
  const translit=Buffer.from(values.map(x=>corpus.translit[x]).join(''),'utf8');
  results.push({
    direction:sign===-1?'Q-minus-p7-keystream':'Q-plus-p7-keystream',
    ioc:ioc(values),
    raw_sha256:crypto.createHash('sha256').update(raw).digest('hex'),
    transliteration_length:translit.length,
    transliteration:translit.toString('utf8'),
    raw_hashes:hashSet(raw),
    transliteration_hashes:hashSet(translit)
  });
}
const summary={
  schema:1,
  source_hypothesis:'p7 five red-word products and DH-derived seed as a period-1876 LFSR consumer for p23/p39 Q',
  p50_factor_ascending:factor,
  p50_division_remainder:remainder,
  quotient_length:q.length,
  quotient_ioc:ioc(q),
  p7_coefficients:p7Coefficients,
  dh_seed:dhSeed,
  p7_period:p7Period,
  quotient_recurrence_residuals:{count:residuals.length,zeros:residuals.filter(x=>x===0).length,ioc:ioc(residuals)},
  p7_characteristic_ascending:p7Characteristic,
  gcd_with_p23p39_factor:commonFactor,
  gcd_degree:commonFactor.length-1,
  p56_target:target,
  target_hash_family:'not source-authenticated',
  results,
  matches:results.flatMap(r=>[...r.raw_hashes,...r.transliteration_hashes]
    .filter(x=>x.match).map(x=>({direction:r.direction,serialization:x===r.raw_hashes.find(y=>y===x)?'raw':'transliteration',algorithm:x.algorithm})))
};
console.log('LP2-P23P39-Q-P7-LFSR-RECEIVER-GATE',JSON.stringify(summary));
