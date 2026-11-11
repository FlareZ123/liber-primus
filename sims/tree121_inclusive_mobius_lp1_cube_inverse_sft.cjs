'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ciphertextPages = corpus.pages.filter((p) => p.page <= 55).map((p) => p.indices);
const original = ciphertextPages.flat();
assert.equal(original.length, 12956);
const prime = corpus.prime;
const p32 = corpus.pages.find((p) => p.page === 32).indices.map((x) => prime[x]);
assert.equal(p32.length, 121);
const ring = [];
for (let c = 3; c <= 7; c++) ring.push(p32[33 + c]);
for (let r = 4; r <= 7; r++) ring.push(p32[11*r + 7]);
for (let c = 6; c >= 3; c--) ring.push(p32[77 + c]);
for (let r = 6; r >= 4; r--) ring.push(p32[11*r + 3]);
assert.equal(ring.reduce((a,b)=>a+b,0),1136);

const MOD=29;
/** @param {number} x @returns {number} */
function mod(x) {return ((x%MOD)+MOD)%MOD;}
/** @param {number} x @returns {number} */
function inverse(x){
  for(let i=1;i<MOD;i++) if(mod(i*x)===1)return i;
  throw Error('no inverse in F29');
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function mul(a,b) {
  return [mod(a[0]*b[0]+a[1]*b[2]),mod(a[0]*b[1]+a[1]*b[3]),
    mod(a[2]*b[0]+a[3]*b[2]),mod(a[2]*b[1]+a[3]*b[3])];
}
/** @param {number[]} m @returns {number[]} */
function invmat(m){
  const scale=inverse(mod(m[0]*m[3]-m[1]*m[2]));
  return [mod(scale*m[3]),mod(-scale*m[1]),mod(-scale*m[2]),mod(scale*m[0])];
}
/** @param {number[]} m @param {number} n @returns {number[]} */
function power(m,n) {
  let out=[1,0,0,1];
  for(let i=0;i<n;i++)out=mul(out,m);
  return out;
}
/** @param {number[]} m @param {number} x @returns {number} */
function apply(m,x) {
  if(x===29)return m[2]===0?29:mod(m[0]*inverse(m[2]));
  const den=mod(m[2]*x+m[3]);
  return den===0?29:mod((m[0]*x+m[1])*inverse(den));
}

const M05=[11,6,6,11];
const M16=[28,9,9,28];
assert.deepEqual(M16,power(M05,6).map((x)=>mod(21*x)));
const sides=[
  ring.slice(0,5).reduce((a,b)=>a+b,0),
  ring.slice(4,9).reduce((a,b)=>a+b,0),
  ring.slice(8,13).reduce((a,b)=>a+b,0),
  [...ring.slice(12),ring[0]].reduce((a,b)=>a+b,0)
];
assert.deepEqual(sides,[275,347,373,339]);
const M32=sides.map(mod);
assert.deepEqual(M32,[14,28,25,20]);
const width=p32.slice(0,11).reduce((a,b)=>a+b,0);
const height=Array.from({length:11},(_,r)=>p32[11*r]).reduce((a,b)=>a+b,0);
assert.deepEqual([width,height],[563,569]);
const Q=[mod(-width),8,0,1];
assert.deepEqual(Q,[17,8,0,1]);
assert.deepEqual(mul(mul(Q,power(M05,3)),invmat(Q)).map((x)=>mod(3*x)),M32);
assert.deepEqual(mul(mul(Q,M16),invmat(Q)).map((x)=>mod(17*x)),power(M32,2));

const cycles=[];
const seen=new Set();
for(let x=0;x<=29;x++){
  if(seen.has(x))continue;
  const cycle=[];
  let y=x;
  while(!seen.has(y)){
    seen.add(y);cycle.push(y);y=apply(M32,y);
  }
  assert.equal(y,x);
  cycles.push(cycle);
}
cycles.sort((a,b)=>b.length-a.length);
assert.deepEqual(cycles.map(x=>x.length),[28,1,1]);
const long=cycles[0];
assert.deepEqual(cycles.slice(1).map(x=>x[0]).sort((a,b)=>a-b),[20,25]);
assert.ok(long.includes(29));
assert.ok(long.includes(apply(Q,23)));

/** @param {number[]} symbols @returns {number} */
function coincidence(symbols){
  const count=Array(29).fill(0);
  for(const x of symbols)count[x]++;
  return count.reduce((v,n)=>v+n*(n-1),0)/(symbols.length*(symbols.length-1));
}
/** @param {number[]} letters @returns {string} */
function preview(letters){return letters.slice(0,80).map(x=>corpus.translit[x]).join(' ');}

/** @param {number} replaceInfinity @param {'book'|'page'} reset @returns {object} */
function test(replaceInfinity,reset){
  const reserved=replaceInfinity===20?25:20;
  const orbit=long.map(x=>x===29?replaceInfinity:x);
  assert.equal(new Set(orbit).size,28);
  const positions=new Map(orbit.map((v,i)=>[v,i]));
  const plainSteps=Array.from({length:28},(_,i)=>i).filter(i=>i!==reserved);
  assert.equal(plainSteps.length,27);
  const seed=apply(Q,23);
  assert.ok(positions.has(seed));

  /** @param {number[]} cipher @returns {number[]} */
  function decode(cipher){
    const out=[];let previous=seed;let k=0;
    for(const page of ciphertextPages){
      if(reset==='page')previous=seed;
      for(let i=0;i<page.length;i++,k++){
        const c=cipher[k];
        if(c===reserved){out.push(reserved);continue;}
        const step=(positions.get(c)-positions.get(previous)+28)%28;
        out.push(step===0?28:plainSteps[step-1]);
        previous=c;
      }
    }
    assert.equal(k,cipher.length);
    return out;
  }

  /** @param {number[]} plain @returns {number[]} */
  function encode(plain){
    const out=[];let previous=seed;let k=0;
    for(const page of ciphertextPages){
      if(reset==='page')previous=seed;
      for(let i=0;i<page.length;i++,k++){
        const p=plain[k];
        if(p===reserved){out.push(reserved);continue;}
        const step=p===28?0:plainSteps.indexOf(p)+1;
        assert.ok(step>=0&&step<28);
        const c=orbit[(positions.get(previous)+step)%28];
        out.push(c);
        previous=c;
      }
    }
    assert.equal(k,plain.length);
    return out;
  }
  const decrypted=decode(original);
  assert.deepEqual(encode(decrypted),original);
  const planted=Array.from({length:original.length},(_,i)=>i%29);
  assert.deepEqual(decode(encode(planted)),planted);
  return {replaceInfinity,reserved,reset,seed,rawIoC:coincidence(original),
    decodedIoC:coincidence(decrypted),seedPlantRecovered:planted.length,
    originalReenciphered:original.length,decodedFirst80:preview(decrypted)};
}

const variants=[];
for(const replaceInfinity of [20,25]){
  for(const reset of ['book','page'])variants.push(test(replaceInfinity,reset));
}
assert.ok(variants.every(x=>x.decodedIoC<0.036));
console.log(JSON.stringify({
  classification:'source-specific original GP28 projective-cycle inverse, bounded negative; no plaintext',
  sourceDimensions:[width,height],cornerInclusiveSides:sides,
  lp1Matrices:{p05:M05,p16:M16,p05Cubed:power(M05,3),p05Sixth:power(M05,6)},
  p32Matrix:M32,
  affineQ:Q,
  exactRelations:'M32 = 3 Q M05^3 Q^-1; M32^2 = 17 Q M16 Q^-1 (mod29)',
  orbitLengths:cycles.map(x=>x.length),fixed:cycles.slice(1).map(x=>x[0]),
  cycleStart:long,
  nativeControl:'all 29 rune indices repeated to original word/page lengths, forward-encode then decode exact',
  variants,
  decision:'The mathematically natural inclusion-rule yields a 28-state public cycle but four direct lossless source-cycle GP inverses remain ciphertext-like.'
},null,2));
