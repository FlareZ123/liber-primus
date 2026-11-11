'use strict';
/**
 * Source-constrained *direct textbook RSA* format gate.
 * The 2013 761.MP3 'Parable 1,595,277,641' is exactly the product
 * of the solved p57 three GP-prime clause sums 1259*1031*1229.
 * A three-prime RSA modulus is a hypothesis, not an attested instruction.
 * Run: node sims/parable_three_prime_rsa_original_format_gate.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const data=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const co=data('resources/liber-primus/lp2-corpus.json');
const table=data('resources/liber-primus/base60-grid.json').byte_rows.flat();
const ps=[1259n,1031n,1229n];
const N=ps.reduce((a,b)=>a*b,1n);
const phi=ps.reduce((a,b)=>a*(b-1n),1n);
assert.equal(N,1595277641n);
assert.equal(phi,1591168720n);
const pow=(base,exponent,modulus)=>{
  let out=1n,step=base%modulus,k=exponent;
  while(k>0n){if(k&1n)out=out*step%modulus;step=step*step%modulus;k>>=1n;}
  return out;
};
const inverse=(a,m)=>{
  let [old,newR]=[m,a], [u,v]=[0n,1n];
  while(newR!==0n){
    const q=old/newR;
    [old,newR]=[newR,old-q*newR];
    [u,v]=[v,u-q*v];
  }
  assert.equal(old,1n);
  return (u%m+m)%m;
};
const pages=co.pages.filter(p=>p.page<56&&p.indices.length);
assert.equal(pages.length,55);
const cipher=pages.flatMap(p=>p.indices);
assert.equal(cipher.length,12956);
const B=29n;
assert(B**6n<N&&N<B**7n);
assert.equal(N/(B**6n),2n);
const pagePhase=pages.map(p=>{
  const diversity=Array.from({length:7},(_,phase)=>
    new Set(p.indices.filter((_,i)=>i%7===phase)).size);
  return {page:p.page,min:Math.min(...diversity),diversity};
});
assert.equal(Math.min(...pagePhase.map(p=>p.min)),7);
const wholeBook=Array.from({length:7},(_,phase)=>
  new Set(cipher.filter((_,i)=>i%7===phase)).size);
assert(wholeBook.every(n=>n===29));
// A fixed seven-rune base29 ciphertext block must begin with digit0..2,
// even allowing an arbitrary secret alphabet permutation on *each page*.
// All seven alignments per page use >=7 different glyphs in that position.
let raw=fs.readFileSync(path.join(root,'resources/lp2-transcription.txt'),'utf8')
  .split('%').slice(0,55).join('%');
const alphabet=new Map(co.runes.map((r,i)=>[r,i]));
const words=[];
let word=[];
function finish(){if(word.length){words.push(word);word=[];}}
for(const c of raw){
 if(alphabet.has(c))word.push(alphabet.get(c));
 else if(c==='/'||c==='%'||/\s/u.test(c)){} else finish();
}
finish();
assert.equal(words.length,2896);
const geMod=words.filter(w=>w.reduce((z,x)=>z*B+BigInt(x),0n)>=N).length;
assert.equal(geMod,536);
const bytes=table;
assert.equal(bytes.length,256);
const inRange={BE:0,LE:0};
for(let i=0;i<256;i+=4){
 const be=BigInt(bytes[i])*16777216n+BigInt(bytes[i+1])*65536n+
   BigInt(bytes[i+2])*256n+BigInt(bytes[i+3]);
 const le=BigInt(bytes[i+3])*16777216n+BigInt(bytes[i+2])*65536n+
   BigInt(bytes[i+1])*256n+BigInt(bytes[i]);
 if(be<N)inRange.BE++;
 if(le<N)inRange.LE++;
}
assert.deepEqual(inRange,{BE:19,LE:32});
// Genuine textbook multi-prime RSA round-trip from the source-native
// solved p57 register, six-rune plaintext blocks and seven-rune ciphertext.
const solved=co.pages.find(p=>p.page===57).indices;
assert.equal(solved.length,95);
for(const e of [761n,3301n]){
  const d=inverse(e,phi);
  for(let i=0;i+6<=solved.length;i+=6){
    const plain=solved.slice(i,i+6).reduce((z,x)=>z*B+BigInt(x),0n);
    const encrypted=pow(plain,e,N);
    const digits=Array(7).fill(0);
    let value=encrypted;
    for(let j=6;j>=0;j--){digits[j]=Number(value%B);value/=B;}
    assert(digits[0]<=2);
    const roundtrip=pow(encrypted,d,N);
    assert.equal(roundtrip,plain);
  }
}
console.log(JSON.stringify({
  modulus:N.toString(),factors:ps.map(String),phi:phi.toString(),
  supportedExponents:['761','3301'],
  original:{cipherRunes:cipher.length,words:words.length,
    wordsTooLargeForTextbookWordRSA:geMod,
    minimumDistinctGlyphsInAnyPageSevenBlockPhase:7,
    allSevenBookPositionsDistinct:wholeBook,
    gridFourByteOriginalBlocksBelowModulus:inRange},
  decision:'Direct textbook RSA block formats excluded; modified framing and unrelated modular uses untested.'
},null,2));
