'use strict';
/**
 * Source-first original-image rubrics: the 4-rune physical p8 title is XIXM
 * in actual GP transliteration; reversing its one ORIGINAL whole word gives
 * a canonical prime Roman numeral MXIX = 1019.
 *
 * Check the full source-only 50-red-whole-word corpus, GP29 red products,
 * solved p56's authentic totient operation as an analog, and the nearby
 * p7 fixed-point polynomial. This is an arithmetic clue, no cipher decoding.
 *
 * Windows11 / Node22 / CommonJS; read-only SFT.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.join(__dirname,'..','resources','liber-primus');
/** @param {string} n @returns {string} */
const read=(n)=>fs.readFileSync(path.join(base,n),'utf8');
const gp=JSON.parse(read('lp2-corpus.json'));
const ink=JSON.parse(read('lp2-ink-annotations.json'));
const sections=read('lp2-transcription.txt').split('%');
const ix=new Map(gp.runes.map((r,i)=>[r,i]));
const red=new Map(ink.pages.map(p=>[p.page,new Set((p.red_spans||[])
  .flatMap(span=>Array.from({length:span.length},(_,j)=>span.start+j)))]));
const completeWords=[];
let current=[];
for(let page=0;page<=55;page++){
  if(page===50)continue;
  let offset=0;
  const text=sections[page>50?page-1:page];
  for(const rune of text){
    if(ix.has(rune)){
      current.push({page,ordinal:offset,value:ix.get(rune),
        red:red.get(page)?.has(offset)||false});
      offset++;
    }else if((rune==='-'||rune==='.')&&current.length){
      completeWords.push(current);
      current=[];
    }
  }
  assert.equal(offset,gp.pages[page].indices.length);
}
if(current.length)completeWords.push(current);
assert.equal(completeWords.length,2896);
const redWords=completeWords.filter(w=>w.every(x=>x.red));
assert.equal(redWords.length,50);
const valueOf=(word)=>word.map(x=>gp.translit[x.value]).join('');
const product=(word)=>word.reduce((s,x)=>s*x.value%29,1);
const isCanonicalRoman=/^(?=.+)M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
/** @param {string} s @returns {number|null} */
function romanValue(s){
  if(!isCanonicalRoman.test(s))return null;
  const value={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
  let out=0;
  for(let i=0;i<s.length;i++){
    const n=value[s[i]];
    out+=n<(value[s[i+1]]||0)?-n:n;
  }
  return out;
}
/** @param {number} n @returns {boolean} */
function isPrime(n){
  if(n<2)return false;
  for(let p=2;p*p<=n;p++)if(n%p===0)return false;
  return true;
}
const reversedRoman=redWords.flatMap(w=>{
  const text=valueOf(w);
  const reverse=text.split('').reverse().join('');
  const decoded=romanValue(reverse);
  return decoded!==null?[{page:w[0].page,source:text,reverse,
    numeral:decoded,len:w.length,product:product(w)}]:[];
});
assert.deepEqual(reversedRoman,[
  {page:6,source:'M',reverse:'M',numeral:1000,len:1,product:19},
  {page:8,source:'XIXM',reverse:'MXIX',numeral:1019,len:4,product:4}
]);
assert.equal(romanValue('XIXM'),null);
assert.equal(romanValue('MXIX'),1019);
assert.equal(isPrime(1019),true);
const p8Red=redWords.filter(w=>w[0].page===8);
assert.equal(p8Red.length,2);
assert.deepEqual(p8Red.map(valueOf),['XIXM','UXMCTHPOB']);
assert.deepEqual(p8Red.map(product),[4,3]);
// Phi(prime)=prime-1, hence exact GP29 residue pair of the two full words.
const phi1019=1018;
assert.equal(1019%29,4);
assert.equal(phi1019%29,3);
const p7Red=redWords.filter(w=>w[0].page===7);
assert.deepEqual(p7Red.map(product),[11,26,8,15,2]);
const P=(x)=>p7Red.reduce((s,w,i)=>s+product(w)*x**i,0)%29;
assert.equal(P(1019%29),4); // genuine red p7 fixed point
assert.equal(P(phi1019%29),3); // other red p7 fixed point
assert.deepEqual(
  gp.pages[8].indices.slice(0,4),
  [14,10,14,19]
);
console.log(JSON.stringify({
  completeUnknownWholeWords:completeWords.length,fullyRedUnknownWholeWords:redWords.length,
  canonicalReversedRedRomans:reversedRoman,
  genuineP8RedWords:p8Red.map(valueOf),
  p8GP0Products:p8Red.map(product),
  p8ReversedRomanPrime:1019,
  primeAndTotientResidues:[1019%29,phi1019%29],
  p7FixedPointPair:[P(4),P(3)],
  classification:'source-typed arithmetic and unique red reverse Roman, no cipher inverse'
},null,2));
console.log('PASS all 2896 source complete words; prime1019 reversed Roman source packet');
