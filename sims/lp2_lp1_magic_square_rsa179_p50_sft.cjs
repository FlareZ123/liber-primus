'use strict';

/**
 * Source-selected exploratory RSA179 consumer. The solved LP1 5x5 magic
 * squares yield prime moduli 1033 and 3301. Their regular continued-fraction
 * denominators include 179, selected immediately before the separately
 * source-visible 225 original red rune count. A small RSA inverse is the
 * simplest standard cipher suggested by solved LP1 "primes/totient/encrypt".
 *
 * This rejects exact direct block interpretations, not arbitrary RSA padding
 * or source-unknown key arrangements. Windows11 Node22:
 * node sims/lp2_lp1_magic_square_rsa179_p50_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname,'..');
const corpus = JSON.parse(fs.readFileSync(path.join(
  root,'resources','liber-primus','lp2-corpus.json'),'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(
  root,'resources','liber-primus','lp2-grid-256.json'),'utf8'));
const bytes = grid.pages.flatMap(p=>p.bytes);
const p=1033n, q=3301n, modulus=p*q, totient=(p-1n)*(q-1n), exponent=179n;

/** @param {bigint} a @param {bigint} b */
function gcd(a,b) {while(b)[a,b]=[b,a%b];return a;}
/** @param {bigint} b @param {bigint} e @param {bigint} m */
function power(b,e,m) {
  let result=1n,base=b%m,exp=e;
  while(exp>0n){if(exp&1n)result=result*base%m;exp>>=1n;base=base*base%m;}
  return result;
}
/** @param {bigint} a @param {bigint} m */
function inverse(a,m) {
  let [t,newt,r,newr]=[0n,1n,m,a];
  while(newr) {const k=r/newr;[t,newt]=[newt,t-k*newt];[r,newr]=[newr,r-k*newr];}
  assert.equal(r,1n);
  return (t%m+m)%m;
}
/** @param {number[]} a @returns {bigint} */
function as256(a){return a.reduce((s,b)=>s*256n+BigInt(b),0n);}
/** @param {number[]} a @returns {bigint} */
function as29(a){return a.reduce((s,v)=>s*29n+BigInt(v),0n);}
/** @param {bigint} n */
function gp29(n){const vals=[];let q=n;while(q>0n){vals.unshift(corpus.translit[Number(q%29n)]);q/=29n;}return vals.join('');}
/** @param {bigint} n @param {number} width */
function toBytes(n,width) {
  assert(n>=0n&&n<256n**BigInt(width));
  return Array.from({length:width},(_,i)=>Number((n/256n**BigInt(width-i-1))%256n));
}
/** @param {number[]} b @param {number} width @param {number} offset @param {bigint} d */
function frameTest(b,width,offset,d) {
  let valid=0,blockCount=0,ascii16=0,output16=[];
  for(let i=offset;i+width<=b.length;i+=width) {
    blockCount++;
    const c=as256(b.slice(i,i+width));
    if(c>=modulus) continue;
    valid++;
    const m=power(c,d,modulus);
    if(m<65536n){ascii16++;output16.push(Number(m));}
  }
  return {width,offset,blockCount,valid,bytes16:ascii16,
    twoBytePrintable:output16.filter(v=>[v>>8,v&255]
      .every(c=>c===10||c===13||c===9||(c>=32&&c<=126))).length};
}
/** @param {string} text @param {bigint} d */
function positive(text,d) {
  const ascii=Buffer.from(text,'ascii');
  assert.equal(ascii.length%2,0);
  const encrypted=[];
  for(let i=0;i<ascii.length;i+=2) {
    const m=as256([...ascii.subarray(i,i+2)]);
    assert(m<modulus);
    const c=power(m,exponent,modulus);
    encrypted.push(...toBytes(c,3));
  }
  const recovered=[];
  for(let i=0;i<encrypted.length;i+=3) {
    const c=as256(encrypted.slice(i,i+3));
    assert(c<modulus);
    recovered.push(...toBytes(power(c,d,modulus),2));
  }
  assert.equal(Buffer.from(recovered).toString('ascii'),text);
  assert.deepEqual(recovered,[...ascii]);
  return {plaintext:text,packedCipherBytes:encrypted.length,
    recoveredASCII:Buffer.from(recovered).toString('ascii')};
}
function main() {
  assert.equal(bytes.length,256);
  assert.equal(modulus,3409933n);
  assert.equal(totient,3405600n);
  assert.equal(gcd(exponent,totient),1n);
  const d=inverse(exponent,totient);
  assert.equal(d,1198619n);
  assert.equal(exponent*d%totient,1n);
  const planted=positive('READ OUT',d);
  const N=as256(bytes), quot=N/(179n*179n);
  assert.equal(N%(179n*179n),0n);
  const direct=[['original-p50-N',N],['N-div-179sq',quot],
    ['N-div-179sq-29',quot/29n]].map(([name,v])=>{
    const ciphertext=v%modulus,plaintext=power(ciphertext,d,modulus);
    assert.equal(power(plaintext,exponent,modulus),ciphertext);
    return {name,ciphertext:Number(ciphertext),plain:Number(plaintext),
      gp29:gp29(plaintext)};
  });
  assert.deepEqual(direct.map(x=>x.gp29),[
    'UNEOFP','THEOLOEI','RMM SOE'.replace(/ /g,'')
  ]);
  const framing=[];
  for(const width of [2,3,4])for(const off of [0,1,2])
    framing.push(frameTest(bytes,width,off,d));
  assert.deepEqual(framing.filter(x=>x.width===3).map(x=>x.valid),
    [20,17,8]);
  assert.deepEqual(framing.filter(x=>x.width===3).map(x=>x.blockCount),
    [85,85,84]);
  assert.deepEqual(framing.filter(x=>x.width===4).map(x=>x.valid),
    [0,0,0]);
  const p15=as29(corpus.pages[15].indices.slice(23,74));
  const p53=as29(corpus.pages[53].indices.slice(128,179));
  const original51=[
    {name:'p15 DH-coordinate 51-rune window',c:p15%modulus},
    {name:'p53 red 51-rune span',c:p53%modulus}
  ].map(({name,c})=>({name,GP29:gp29(power(c,d,modulus))}));
  console.log(JSON.stringify({
    source:'original 2014 LP1 p5/p16 1033/3301 squares; 179 convergent exponent; LP2 original p50 byte table',
    rsa:{p:Number(p),q:Number(q),modulus:Number(modulus),
      totient:Number(totient),e:Number(exponent),d:Number(d)},
    positiveControl:planted,wholeInteger:direct,byteFrameTests:framing,
    originalSourceSelected51RuneTest:original51,
    decision:'The source-motivated direct RSA179 whole-table and fixed 2/3/4-byte frames do not recover coherent source-native plaintext; three-byte frames fail strict ciphertext<modulus for most original blocks.'
  },null,2));
}
if(require.main===module)main();
module.exports={power,inverse,as256,as29,frameTest,gp29};
