'use strict';

/**
 * Original p7->p8 five-point quartic as a direct one-back GF29 feedback KDF.
 * A finite, human-discoverable 4-variant ORIGINAL p8 243-rune body attempt.
 * p7 red-word products give full quartic, p8 header roots select f(x)=1,
 * and rooted-tree art motivates a one-back recurrence. The equation,
 * previous-cipher/plain choice and use of p8 red terminal rune as IV are
 * hypotheses, not author-signed operations. No parameter fitting.
 * Windows11 Node22 CommonJS, source-native plaintext positive, no writes.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
const p7=corpus.pages[7].indices,p8=corpus.pages[8].indices,clear=corpus.pages[57].indices;
assert.deepEqual([p7.length,p8.length,clear.length],[208,255,95]);
const wordSizes=[2,4,3,2,3],mod=x=>((x%29)+29)%29;
let j=194;
const words=wordSizes.map(n=>{const a=p7.slice(j,j+n);j+=n;return a;});
assert.equal(j,p7.length);
const coeff=words.map(a=>a.reduce((s,n)=>mod(s*n),1));
assert.deepEqual(coeff,[11,26,8,15,2]);
const f=x=>coeff.reduce((a,b)=>mod(a*x+b),0);
const roots=Array.from({length:29},(_,x)=>x).filter(x=>f(x)===1);
assert.deepEqual(roots,[3,4,19,27]);
const seen=new Set(Array.from({length:29},(_,x)=>f(x)));
assert.equal(seen.size,18);
const red=p8.slice(0,12),black=p8.slice(12),iv=red.at(-1);
assert.equal(black.length,243);
assert.equal(iv,17);
assert.equal(new Set(black).size,29);
const spell=a=>a.map(i=>corpus.translit[i]).join('');
const ioc=a=>{const h=Array(29).fill(0);for(const x of a)h[x]++;return h.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1));};
/** @param {number[]} C @param {'cipher'|'plain'} mode @param {1|-1} sign */
function inverse(C,mode,sign){
  const P=[];
  let prev=iv;
  for(const v of C){
    const plain=mod(v+sign*f(prev));
    P.push(plain);
    prev=mode==='cipher'?v:plain;
  }
  return P;
}
/** @param {number[]} P @param {'cipher'|'plain'} mode @param {1|-1} sign */
function forward(P,mode,sign){
  const C=[];
  let prev=iv;
  for(const v of P){
    const cipher=mod(v-sign*f(prev));
    C.push(cipher);
    prev=mode==='cipher'?cipher:v;
  }
  return C;
}
const plant=Array.from({length:243},(_,i)=>clear[i%clear.length]);
for(const mode of ['cipher','plain'])for(const sign of [-1,1]){
  const decoded=inverse(black,mode,sign);
  assert.deepEqual(forward(decoded,mode,sign),black);
  const plantedCipher=forward(plant,mode,sign);
  assert.deepEqual(inverse(plantedCipher,mode,sign),plant);
  console.log(JSON.stringify({
    source:'p7 5-word GP29 products -> quartic; p8 red12 terminal IV and black243',
    originalQuartic:coeff,
    gp29ImageSize:seen.size,
    p8BodyDistinctRawSymbols:new Set(black).size,
    headerRoots:roots,
    seed:iv,feedback:mode,sign,bodyIoC:+ioc(decoded).toFixed(7),
    sourceNativeFirst100:spell(decoded.slice(0,100)),
    positive243Recovered:true,forwardReplay:true
  }));
}
console.log('PASS: four original p8 direct quartic one-back feedback inverses; no authenticated plaintext');
