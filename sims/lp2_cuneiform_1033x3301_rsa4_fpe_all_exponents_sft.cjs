'use strict';
/**
 * LP2 p33-39: complete original-input RSA 1033*3301 four-rune FPE test.
 * Run with Node 22 as a read-only single-file test.
 * Hypothesis (unauthenticated): p=1033,q=3301 printed in cuneiform;
 * encode each four GP29 digits big-endian, apply RSA mod p*q with cycle
 * walking until a value <29^4; preserve all trailing unpaired rune digits.
 * Exhaust ALL coprime exponents modulo lambda(p*q) and both packet clocks.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const gp = JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const P = 1033;
const Q = 3301;
const MOD = P * Q;
const LAMBDA = 283800;
const DOMAIN = 29 ** 4;
const LENGTHS = [139,91,98,96,129];
const SHA = 'f432558b32ef4120d80f330d068d4f211005f4a6dac7780e3eec2d1e7a0f191a';
assert.equal(MOD, 3409933);
assert.equal(DOMAIN, 707281);
assert.ok(MOD ** 2 < Number.MAX_SAFE_INTEGER);

/** @param {number} a @param {number} b @returns {number} */
function gcd(a,b) {
  while (b) [a,b] = [b,a%b];
  return a;
}
/** @param {number} x @param {number} exponent @returns {number} */
function powmod(x,exponent) {
  let out=1;
  for(;exponent>0;exponent=Math.floor(exponent/2),x=x*x%MOD)
    if(exponent%2) out=out*x%MOD;
  return out;
}
/** @param {number} p @param {number} g */
function dlog(p,g) {
  const powers=new Int32Array(p-1), logs=new Int16Array(p).fill(-1);
  let v=1;
  for(let i=0;i<p-1;i++) {
    assert.equal(logs[v],-1);
    powers[i]=v;logs[v]=i;v=v*g%p;
  }
  assert.equal(v,1);
  return {powers,logs};
}
const DP=dlog(P,5);
const DQ=dlog(Q,6);
const INVP=2010;
assert.equal(P*INVP%Q,1);
/** Fast exact modular power, using the public factors, CRT, and log tables.
 * @param {number} n @param {number} exponent @returns {number}
 */
function fastpow(n,exponent) {
  const p=n%P,q=n%Q;
  const a=p===0?0:DP.powers[DP.logs[p]*exponent%(P-1)];
  const b=q===0?0:DQ.powers[DQ.logs[q]*exponent%(Q-1)];
  return a+P*((b-a+Q)*INVP%Q);
}
for(const v of [0,1,2,29,707280,1033,3301,3409932]) {
  for(const e of [1,13,17,29,65537,133553,276473])
    assert.equal(fastpow(v,e),powmod(v,e));
}
/** @param {number} n @param {number} e */
function walk(n,e) {
  do {n=fastpow(n,e);} while(n>=DOMAIN);
  return n;
}
/** @param {number[]} lengths @returns {number[]} */
function positions(lengths) {
  let offset=0;
  const out=[];
  for(const length of lengths) {
    for(let i=0;i+4<=length;i+=4)out.push(offset+i);
    offset+=length;
  }
  return out;
}
/** @param {Uint8Array} src @param {number[]} pos */
function pack(src,pos) {
  return pos.map(i=>({i,v:((src[i]*29+src[i+1])*29+src[i+2])*29+src[i+3]}));
}
/** @param {Uint8Array} out @param {{i:number,v:number}[]} blocks
 * @param {number} e @returns {Uint8Array}
 */
function transform(out,blocks,e) {
  for(const {i,v} of blocks) {
    let n=walk(v,e);
    for(let j=3;j>=0;j--) {
      out[i+j]=n%29;
      n=Math.floor(n/29);
    }
  }
  return out;
}
/** @param {Uint8Array} a @returns {number} */
function ic(a) {
  const freq=new Uint16Array(29);
  for(const x of a)freq[x]++;
  let pairs=0;
  for(const n of freq)pairs+=n*(n-1);
  return pairs/(a.length*(a.length-1));
}
/** @param {Uint8Array} source @param {number[]} pos */
function exhaust(source,pos) {
  const blocks=pack(source,pos), out=Uint8Array.from(source);
  let maxIoC=-1,bestExponent=-1,above048=0,validExponents=0;
  for(let e=1;e<LAMBDA;e++) {
    if(gcd(e,LAMBDA)!==1)continue;
    validExponents++;
    out.set(source);
    transform(out,blocks,e);
    const score=ic(out);
    if(score>=.048)above048++;
    if(score>maxIoC){maxIoC=score;bestExponent=e;}
  }
  assert.equal(validExponents,67200);
  return {maxIoC,bestExponent,above048,validExponents};
}
const chapter=gp.pages.filter(p=>p.page>=33&&p.page<=39)
  .flatMap(p=>p.indices);
assert.equal(chapter.length,1680);
const original=Uint8Array.from(chapter.slice(845,1398));
assert.equal(original.length,553);
assert.equal(LENGTHS.reduce((a,b)=>a+b),553);
assert.equal(crypto.createHash('sha256').update(original).digest('hex'),SHA);
const continuous=positions([553]),reset=positions(LENGTHS);
assert.equal(continuous.length,138);
assert.equal(reset.length,136);
const natural=exhaust(original,continuous);
const fiveReset=exhaust(original,reset);
assert.equal(natural.above048,0);
assert.equal(fiveReset.above048,0);
assert.ok(Math.abs(natural.maxIoC-.037319495767486964)<1e-12);
assert.ok(Math.abs(fiveReset.maxIoC-.03705742065676023)<1e-12);
assert.equal(natural.bestExponent,76871);
assert.equal(fiveReset.bestExponent,89477);

// Original solved LP1 p6 English, encoded into author-authentic GP29
// and then ENCRYPTED before exhaustive key recovery.
const solved=fs.readFileSync(path.join(ROOT,
  'resources','liber-primus','lp1-plaintext-reference.txt'),'utf8')
  .replace(/\r\n/g,'\n')
  .split('### 6\n')[1].split('### 7\n')[0]
  .replace(/^A KOAN\r?\n/,'');
const alphabet=gp.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} word @returns {number[]} */
function enc(word) {
  const w=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out=[];
  for(let i=0;i<w.length;) {
    if(w.startsWith('ING',i)){out.push(21);i+=3;}
    else if(w.startsWith('IO',i)){out.push(27);i+=2;}
    else {
      const found=alphabet.find(item=>w.startsWith(item.s,i));
      assert.ok(found,'unmapped GP rune');
      out.push(found.i);
      i+=found.s.length;
    }
  }
  return out;
}
const sample=Uint8Array.from((solved.toUpperCase().match(/[A-Z]+/g)||[])
  .flatMap(enc).slice(0,553));
assert.equal(sample.length,553);
assert.ok(Math.abs(ic(sample)-.06628534738055927)<1e-12);
const publicE=65537,privateE=276473;
assert.equal(publicE*privateE%LAMBDA,1);
const encrypted=transform(Uint8Array.from(sample),pack(sample,continuous),publicE);
const recovered=transform(Uint8Array.from(encrypted),pack(encrypted,continuous),privateE);
assert.deepEqual(recovered,sample);
assert.deepEqual(transform(Uint8Array.from(recovered),
  pack(recovered,continuous),publicE),encrypted);
const planted=exhaust(encrypted,continuous);
assert.equal(planted.bestExponent,privateE);
assert.ok(Math.abs(planted.maxIoC-ic(sample))<1e-12);

console.log(JSON.stringify({
  scope:'LP2 pp33-39 numbered five, 553 original GP29 runes',
  originalSHA256:SHA,
  rsa:{p:P,q:Q,n:MOD,lambda:LAMBDA,domain:DOMAIN},
  originalIoC:ic(original),
  continuous:natural,
  fiveItemReset:fiveReset,
  planted:{
    originalNativeIoC:ic(sample),encryptedIoC:ic(encrypted),
    recoveredAll553:true,bestExponent:planted.bestExponent,
    maxIoC:planted.maxIoC,above048:planted.above048
  }
},null,2));
console.log('PASS all 67,200 coprime RSA exponents and planted-native inverse');
