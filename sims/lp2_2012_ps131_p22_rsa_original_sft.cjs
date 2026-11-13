'use strict';

/**
 * Reproducible source-fixed 2012 PS RSA / original LP2 p22 test.
 * Eight natural 65/66 digit GP29 blocks, ordinary/reverse ordering.
 * Node 22, CommonJS. No random key search, no fitted offsets or padding.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const P=99554414790940424414351515490472769096534141749790794321708050837n;
const Q=104593961812606247801193807142122161186583731774511103180935025763n;
const N=P*Q, E=65537n, PHI=(P-1n)*(Q-1n);
const PS=10412790658919985359827898739594318956404425106955675643739226952372682423852959081739834390370374475764863415203423499357108713631n;
const ALPHABET_LENGTH=29n;
assert.equal(N,PS);

/** @param {bigint} a @param {bigint} m @returns {bigint} */
function invert(a,m){
  let [r,t,or,ot]=[a,1n,m,0n];
  while(or!==0n) {
    const k=r/or;
    [r,or]=[or,r-k*or];
    [t,ot]=[ot,t-k*ot];
  }
  assert.equal(r,1n);
  return (t+m)%m;
}
/** @param {bigint} x @param {bigint} y @param {bigint} m @returns {bigint} */
function powmod(x,y,m){
  let z=1n;
  while(y>0n) {
    if(y&1n)z=z*x%m;
    x=x*x%m;
    y>>=1n;
  }
  return z;
}
/** @param {number[]} digits @param {boolean} reverse @returns {bigint} */
function gp29(digits,reverse) {
  const xs=reverse?digits.slice().reverse():digits;
  return xs.reduce((a,c)=>a*ALPHABET_LENGTH+BigInt(c),0n);
}
/** @param {bigint} n @returns {number[]} */
function bytes(n) {
  return Array.from({length:54},(_,i)=>Number((n>>BigInt(8*(53-i)))&255n));
}
/** @param {number[]} a @returns {number} */
function printable(a) {return a.filter(x=>x>=32&&x<=126).length;}

function run(){
  const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
  const original=corpus.pages.find(x=>x.page===22).indices;
  assert.equal(original.length,131);
  const D=invert(E,PHI);
  assert.equal(E*D%PHI,1n);
  const patterns=[];
  for(const skip of ['none','first','last']){
    for(const reverse of [false,true]){
      for(const split of [65,66]){
        const data=skip==='first'?original.slice(1):skip==='last'?original.slice(0,-1):original;
        const left=data.slice(0,split),right=data.slice(split);
        if(left.length<65||right.length<65||right.length>66)continue;
        const ct=[gp29(left,reverse),gp29(right,reverse)];
        assert(ct.every(v=>v<N));
        const plaintext=ct.map(c=>powmod(c,D,N));
        plaintext.forEach((m,i)=>assert.equal(powmod(m,E,N),ct[i],'RSA original reencryption'));
        const raw=plaintext.flatMap(bytes);
        assert.equal(raw.length,108);
        const first16=Buffer.from(raw.slice(0,16)).toString('hex');
        patterns.push({skip,reverse,split,printable:printable(raw),lettersAndSpaces:raw.filter(
          x=>x===32||(x>=65&&x<=90)||(x>=97&&x<=122)).length,first16});
      }
    }
  }
  const expected=[45,39,42,33,43,40,39,41];
  assert.deepEqual(patterns.map(x=>x.printable),expected);
  assert.deepEqual(patterns.map(x=>x.first16),[
    '3ca2bcdb204709b3f1b65da45658d2c2',
    'ef0c15ba6c9e238f36a38655b49be0ed',
    '7af94d52a2e5b1d353a3369ec56da93f',
    'baf82a5299c79f63ea918fc5a45a1bce',
    '71c116f3a874454b0285dbe1665a4c0c',
    '7b5378b27d82dac0f7e46ddd3f1d7d59',
    '3ca2bcdb204709b3f1b65da45658d2c2',
    '7af94d52a2e5b1d353a3369ec56da93f'
  ]);
  const m=BigInt('0x'+Buffer.from('LIKE THE INSTAR').toString('hex'));
  assert.equal(powmod(powmod(m,E,N),D,N),m,'real plain ASCII RSA plant');
  return {status:'eight source-framed RSA-65537 block decodes are binary-like; no LP2 plaintext',
    originalRuneCount:original.length,keyBits:N.toString(2).length,origFactorDigits:[P.toString().length,Q.toString().length],
    cases:patterns.length,patterns,plantedRSA:'complete exact forward and inverse'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,powmod,invert,gp29};
