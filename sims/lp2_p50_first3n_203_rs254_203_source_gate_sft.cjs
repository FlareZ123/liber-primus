'use strict';

/**
 * Narrow original-source shortened Reed-Solomon candidate for p49-51 plate:
 * first two original printed tokens are 3N,3p => 203,231 under base60.
 * Take following 254 bytes as 203 data + 51 candidate check symbols.
 * Test conventional GF(256) field 0x11d, alpha=2, roots alpha^0 or alpha^1.
 * Both source radix60 and drop-f radix59 are tested. This is a conditional
 * payload format probe, not an authenticated author instruction.
 * Node22 CommonJS, single read-only original-source test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const src = JSON.parse(fs.readFileSync(path.join(
  __dirname,'..','resources','liber-primus','lp2-grid-256.json'),'utf8'));
const originalTokens = src.pages.flatMap(p=>p.tokens);
assert.equal(originalTokens.length,256);
assert.equal(originalTokens[0],'3N');
assert.equal(originalTokens[1],'3p');
assert.equal(src.alphabet,'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');

/** @param {number} a @param {number} b */
function gfMul(a,b) {
  let result = 0;
  for(let i=0;i<8;i++) {
    if(b & 1)result ^= a;
    const carry=a & 128;
    a=(a << 1) & 255;
    if(carry)a ^= 0x1d;
    b >>>= 1;
  }
  return result;
}
/** @param {number} n */
function gfPow(n) {
  let a=1;
  for(let i=0;i<n;i++)a=gfMul(a,2);
  return a;
}
/** @param {number[]} bytes @param {number} exponent */
function syndrome(bytes,exponent) {
  const alpha=gfPow(exponent);
  let acc=0;
  for(const b of bytes)acc=gfMul(acc,alpha)^b;
  return acc;
}
/** @param {string} alphabet */
function decode(alphabet) {
  const bytes=originalTokens.map(token=>{
    const a=alphabet.indexOf(token[0]),b=alphabet.indexOf(token[1]);
    assert.ok(a>=0 && b>=0);
    const value=a*alphabet.length+b;
    assert.ok(value>=0 && value<=255);
    return value;
  });
  assert.equal(bytes.length,256);
  return bytes;
}
/**
 * Multiply generator polynomials with descending coefficients in GF256.
 * @param {number[]} a @param {number[]} b
 */
function polyMul(a,b) {
  const out=Array(a.length+b.length-1).fill(0);
  for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)
    out[i+j]^=gfMul(a[i],b[j]);
  return out;
}
/**
 * Systematic source-shaped 203-data +51-parity RS positive test.
 * @param {number[]} message
 * @param {number} rootStart
 * @returns {number[]}
 */
function encodeRS(message,rootStart) {
  assert.equal(message.length,203);
  let g=[1];
  for(let i=0;i<51;i++)g=polyMul(g,[1,gfPow(rootStart+i)]);
  assert.equal(g.length,52);
  const rem=message.concat(Array(51).fill(0));
  for(let i=0;i<203;i++) {
    const top=rem[i];
    for(let j=0;j<g.length;j++)rem[i+j]^=gfMul(top,g[j]);
  }
  const output=message.concat(rem.slice(203));
  assert.equal(output.length,254);
  for(let i=0;i<51;i++)
    assert.equal(syndrome(output,rootStart+i),0);
  return output;
}

const cases=[];
for(const [radix,alphabet] of [
  ['base60',src.alphabet],
  ['drop-f-base59',src.alphabet.replace('f','')],
]) {
  const bytes=decode(alphabet);
  if(radix==='base60') {
    assert.deepEqual(bytes,src.bytes);
    assert.deepEqual(bytes.slice(0,2),[203,231]);
  } else {
    assert.deepEqual(bytes.slice(0,2),[200,227]);
  }
  const originalPayload=bytes.slice(2);
  assert.equal(originalPayload.length,254);
  assert.equal(originalPayload.slice(0,203).length,203);
  assert.equal(originalPayload.slice(203).length,51);
  for(const reverse of [false,true]) {
    const candidate=reverse ? originalPayload.toReversed() : originalPayload;
    for(const firstRoot of [0,1]) {
      const all=Array.from({length:51},(_,j)=>
        syndrome(candidate,firstRoot+j));
      const nonzero=all.filter(v=>v!==0).length;
      const first=all[0];
      assert.notEqual(first,0,'Original frame unexpectedly satisfies RS root');
      const planted=encodeRS(candidate.slice(0,203),firstRoot);
      assert.equal(planted.slice(0,203).length,203);
      assert.equal(planted.length,254);
      const originalFirstData=originalPayload.slice(0,203);
      if(!reverse)assert.deepEqual(planted.slice(0,203),originalFirstData);
      // One byte of deliberate parity corruption must be detected.
      const corrupt=planted.slice();
      corrupt[253]^=1;
      assert.notEqual(syndrome(corrupt,firstRoot),0);
      cases.push({radix,reverse,firstRoot,firstSyndrome:first,
        nonzeroOf51:nonzero,originalIsCodeword:nonzero===0});
    }
  }
}
assert.equal(cases.length,8);
assert.deepEqual(cases.map(x=>x.firstSyndrome),
  [184,90,184,112,10,101,10,159]);
assert.deepEqual(cases.map(x=>x.nonzeroOf51),
  [50,50,51,51,51,51,51,51]);

console.log(JSON.stringify({
  source:'Original p49-51 numerical table',
  sourceFirstTokens:originalTokens.slice(0,2),
  conventionalHeader:[203,231],
  proposedFrame:'[2 source header bytes][203 source data bytes][51 source parity bytes]',
  dataBytes:203,parityBytes:51,sourceFrameBytes:256,
  standardGF256:{irreduciblePolynomial:'0x11d',primitiveElement:2},
  cases,positivePlants:cases.length,
  conclusion:'No original-source variant has even the first required RS parity root. Positive complete shortened RS(254,203) codewords pass all 51 roots. No unknown plaintext.',
},null,2));
