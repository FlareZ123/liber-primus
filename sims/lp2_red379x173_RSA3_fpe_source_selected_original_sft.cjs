'use strict';
/**
 * LP2 cuneiform original 553, red-sum RSA379*173 3-rune cycle-walk gate.
 * Windows 11 Node.js 22 portable CommonJS single-file original-source test.
 * This is a bounded, speculative first opcode, not a claimed Cicada key.
 * No writes, downloads, dynamic inputs or tuneable fitting.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');

const ROOT=path.resolve(__dirname,'..');
const gp=JSON.parse(fs.readFileSync(path.join(ROOT,'resources',
  'liber-primus','lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(path.join(ROOT,'resources',
  'liber-primus','lp2-ink-annotations.json'),'utf8'));
const RSA_P=379,RSA_Q=173,N=RSA_P*RSA_Q,LAMBDA=32508,DOMAIN=29**3;
assert.equal(N,65567);
assert.equal(DOMAIN,24389);
assert.ok(N*N<Number.MAX_SAFE_INTEGER);
const red33=ink.pages.find(p=>p.page===33).red_spans[0].runes;
const red39=ink.pages.find(p=>p.page===39).red_spans[0].runes;
/** @param {string} s @returns {number} */
function primeSum(s){
  return [...s].reduce((a,c)=>{
    const index=gp.runes.indexOf(c);
    assert.ok(index>=0);
    return a+gp.prime[index];
  },0);
}
assert.deepEqual([primeSum(red33),primeSum(red39)],[379,173]);
assert.equal(379+173+1,553);
const source=Uint8Array.from(gp.pages.filter(p=>p.page>=33&&p.page<=39)
  .flatMap(p=>p.indices).slice(845,1398));
assert.equal(source.length,553);
const digest=crypto.createHash('sha256').update(source).digest('hex');
assert.equal(digest,'f432558b32ef4120d80f330d068d4f211005f4a6dac7780e3eec2d1e7a0f191a');
assert.equal(source[378],0);

/** @param {number} a @param {number} b */
function gcd(a,b){while(b)[a,b]=[b,a%b];return a;}
/** @param {number} v @param {number} exponent */
function modpow(v,exponent) {
  let x=1;
  while(exponent>0){
    if(exponent%2)x=x*v%N;
    v=v*v%N;
    exponent=Math.floor(exponent/2);
  }
  return x;
}
/** @param {number} v @param {number} exponent */
function cycle(v,exponent) {
  do{v=modpow(v,exponent);}while(v>=DOMAIN);
  return v;
}
/** @param {Uint8Array} src @param {number[][]} windows @returns {{i:number,v:number}[]} */
function packets(src,windows) {
  const blocks=[];
  for(const [start,len] of windows) {
    for(let i=start;i+3<=start+len;i+=3)
      blocks.push({i,v:(src[i]*29+src[i+1])*29+src[i+2]});
  }
  return blocks;
}
/** @param {Uint8Array} src @param {{i:number,v:number}[]} blocks
 * @param {number} exponent @returns {Uint8Array}
 */
function transform(src,blocks,exponent) {
  const out=Uint8Array.from(src);
  for(const {i,v} of blocks) {
    let x=cycle(v,exponent);
    for(let j=2;j>=0;j--) {
      out[i+j]=x%29;
      x=Math.floor(x/29);
    }
  }
  return out;
}
/** @param {Uint8Array} src @returns {number} */
function ic(src) {
  const freq=new Int32Array(29);
  for(const x of src)freq[x]++;
  let pairs=0;
  for(const count of freq)pairs+=count*(count-1);
  return pairs/(src.length*(src.length-1));
}
const clocks=[
 {name:'continuous553',windows:[[0,553]],count:184},
 {name:'red379 F plus tail174',windows:[[0,379],[379,174]],count:184},
 {name:'five red-number resets',windows:[[0,139],[139,91],[230,98],[328,96],[424,129]],count:183}
];
for(const k of clocks)assert.equal(packets(source,k.windows).length,k.count);
assert.equal(packets(source,clocks[1].windows).some(b=>b.i<=378&&b.i+2>=378),false);
assert.equal(packets(source,clocks[1].windows).some(b=>b.i===379),true);
/**
 * Raw, non-cyclewalking textbook RSA ciphertext framing has to be <n,
 * regardless of the secret exponent. Test BOTH standard radix29 digit
 * directions on all source-fixed packet windows. Any violation rules out
 * the complete fixed-width raw RSA serialization on that window.
 * @param {Uint8Array} src
 * @param {number[][]} windows
 * @param {number} modulus
 * @param {number} width
 * @returns {{blocks:number,badBE:number,badLE:number,firstBadBE:number,firstBadLE:number}}
 */
function rawRange(src,windows,modulus,width) {
  let blocks=0,badBE=0,badLE=0,firstBadBE=-1,firstBadLE=-1;
  for(const [start,len] of windows) {
    for(let i=start;i+width<=start+len;i+=width) {
      let be=0,le=0,p=1;
      for(let j=0;j<width;j++){
        be=be*29+src[i+j];
        le+=src[i+j]*p;
        p*=29;
      }
      if(be>=modulus){badBE++;if(firstBadBE<0)firstBadBE=i;}
      if(le>=modulus){badLE++;if(firstBadLE<0)firstBadLE=i;}
      blocks++;
    }
  }
  return {blocks,badBE,badLE,firstBadBE,firstBadLE};
}
const raw379x173=clocks.map(clock=>rawRange(source,clock.windows,N,4));
const raw1033x3301=clocks.map(clock=>rawRange(source,clock.windows,1033*3301,5));
assert.deepEqual(raw379x173.map(v=>[v.blocks,v.badBE,v.badLE]),[
  [138,124,126],[137,122,128],[136,126,124]
]);
assert.deepEqual(raw1033x3301.map(v=>[v.blocks,v.badBE,v.badLE]),[
  [110,95,95],[109,92,97],[108,91,91]
]);
assert.ok(raw379x173.every(v=>v.firstBadBE===0&&v.firstBadLE===0));
assert.ok(raw1033x3301.every(v=>v.firstBadBE===0&&v.firstBadLE===0));

/** @param {Uint8Array} src @param {number[][]} windows */
function exhaust(src,windows) {
  const blocks=packets(src,windows);
  let maxIoC=-1,bestExponent=-1,above048=0,admissible=0;
  for(let e=1;e<LAMBDA;e++) {
    if(gcd(e,LAMBDA)!==1)continue;
    admissible++;
    const score=ic(transform(src,blocks,e));
    if(score>=.048)above048++;
    if(score>maxIoC) {
      maxIoC=score;
      bestExponent=e;
    }
  }
  assert.equal(admissible,9072);
  return {maxIoC,bestExponent,above048,admissible,blocks:blocks.length};
}
const expected=[
 [0.036513614802002256,1007,184],
 [0.03719501008989176,5123,184],
 [0.037070524412296565,4055,183]
];
const tests=clocks.map((clock,i)=>{
  const result=exhaust(source,clock.windows);
  const [max,e,n]=expected[i];
  assert.ok(Math.abs(result.maxIoC-max)<1e-12);
  assert.equal(result.bestExponent,e);
  assert.equal(result.above048,0);
  assert.equal(result.blocks,n);
  return {name:clock.name,...result};
});

// Authentic solved LP1 p6 553 GP29 runes as independent positive control;
// only overwrite 0-based index 378 with literal transparent F to reproduce
// the original red-source delimiter. The input and output are checked exactly.
const text=fs.readFileSync(path.join(ROOT,'resources','liber-primus',
  'lp1-plaintext-reference.txt'),'utf8').replace(/\r\n/g,'\n')
  .split('### 6\n')[1].split('### 7\n')[0].replace(/^A KOAN\n/,'');
const alphabet=gp.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} word @returns {number[]} */
function encode(word) {
  const w=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out=[];
  for(let i=0;i<w.length;) {
    if(w.startsWith('ING',i)){out.push(21);i+=3;}
    else if(w.startsWith('IO',i)){out.push(27);i+=2;}
    else{
      const item=alphabet.find(a=>w.startsWith(a.s,i));
      assert.ok(item,'unrecognized GP29 spelling');
      out.push(item.i);i+=item.s.length;
    }
  }
  return out;
}
const native=Uint8Array.from((text.toUpperCase().match(/[A-Z]+/g)||[])
  .flatMap(encode).slice(0,553));
assert.equal(native.length,553);
assert.ok(Math.abs(ic(native)-0.06628534738055927)<1e-12);
native[378]=0;
const ePublic=65537,eInverse=29825;
assert.equal(ePublic*eInverse%LAMBDA,1);
const originalBlocks=packets(native,clocks[1].windows);
const encrypted=transform(native,originalBlocks,ePublic);
assert.equal(encrypted[378],0);
const recovered=transform(encrypted,packets(encrypted,clocks[1].windows),eInverse);
assert.deepEqual(recovered,native);
assert.deepEqual(transform(recovered,packets(recovered,clocks[1].windows),ePublic),encrypted);
assert.ok(Math.abs(ic(native)-0.065885682836701)<1e-12);
assert.ok(Math.abs(ic(encrypted)-0.03456115522708808)<1e-12);
const plantedScan=exhaust(encrypted,clocks[1].windows);
assert.equal(plantedScan.bestExponent,eInverse);
assert.equal(plantedScan.above048,1);
assert.ok(Math.abs(plantedScan.maxIoC-ic(native))<1e-12);

console.log(JSON.stringify({
  claim:'one source-motivated RSA model rejected as ordinary native GP29 English',
  originalSource:'physical LP2 pp33-39 numbered 553 runes',
  originalSha256:digest,
  redPrimeSums:[379,173],
  math:{p:RSA_P,q:RSA_Q,n:N,lambda:LAMBDA,domain:DOMAIN,
    admissibleExponents:9072,selectedFZeroBasedOffset:378},
  originalIoC:ic(source),tests,
  directRawRsaFraming:{red379x173Width4:raw379x173,cuneiform1033x3301Width5:raw1033x3301},
  sourceNativePlanted:{
    originalNativeIoC:ic(native),rsaCipherIoC:ic(encrypted),
    bestRecoveredExponent:plantedScan.bestExponent,
    above048:plantedScan.above048,all553Recovered:true,
    redSelectedFRemainsOriginal:true
  },
  recoveredUnknownLP2Plaintext:false
},null,2));
console.log('PASS: all source-fixed raw RSA frames impossible; 9072 original FPE exponents and 553/553 native plant controlled');
