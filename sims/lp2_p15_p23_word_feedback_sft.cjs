'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {parseLP2Words}=require('./lp2_word_pages.cjs');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const raw=read('resources/lp2-transcription.txt');
const gibran=read('resources/control/gibran_prophet_58585.txt');
const mod=n=>(n%29+29)%29;
const runeId=new Map(corpus.runes.map((r,i)=>[r,i]));
const translitId=new Map(corpus.translit.map((r,i)=>[r,i]));
function inv(x){for(let y=1;y<29;y++)if(x*y%29===1)return y;throw Error('noninvertible '+x);}
function nthPrime(k){let n=1,count=0;while(count<k){n++;let ok=true;for(let d=2;d*d<=n;d++)if(n%d===0){ok=false;break;}if(ok)count++;}return n;}
function ioc(xs){const h=Array(29).fill(0);for(const x of xs)h[x]++;const n=xs.length;return h.reduce((s,x)=>s+x*(x-1),0)/(n*(n-1));}
const flatten=ws=>ws.flat();
const encrypt=(ws,initial,a,b)=>{let prev=initial;return ws.map(w=>w.map((p,j)=>{const c=mod(a[j]*p+b[j]*prev);prev=c;return c;}));};
const decrypt=(ws,initial,a,b,ia)=>{let prev=initial;return ws.map(w=>w.map((c,j)=>{const p=mod(ia[j]*(c-b[j]*prev));prev=c;return p;}));};
function encodeGP(word){
 const s=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S');
 const multi=['ING','TH','NG','EO','OE','AE','IA','EA'];const out=[];
 for(let i=0;i<s.length;){const t=multi.find(x=>s.startsWith(x,i))||s[i];const v=translitId.get(t);if(v===undefined)return null;out.push(v);i+=t.length;}
 return out;
}
// The shared parser retains words across typographic/page wraps.
const parsed=parseLP2Words(raw,55);
const section=parsed.words.filter(w=>w.startPage>=23&&w.startPage<=26);
assert.equal(section.length,224);
const headingWords=section.filter(w=>w.startPage===23).slice(0,4);
const heading=flatten(headingWords.map(w=>[...w.runes].map(r=>runeId.get(r))));
assert.equal(heading.length,16);
assert.deepEqual(heading,corpus.pages[23].indices.slice(0,16));
const bodyWords=section.slice(4);
const cipherWords=bodyWords.map(w=>[...w.runes].map(r=>runeId.get(r)));
const cipher=flatten(cipherWords);
assert.deepEqual(cipher,[
 ...corpus.pages[23].indices.slice(16),...corpus.pages[24].indices,
 ...corpus.pages[25].indices,...corpus.pages[26].indices
]);
assert.equal(bodyWords.length,220);assert.equal(cipher.length,1005);
assert.equal(Math.max(...bodyWords.map(w=>w.length)),14);
assert.deepEqual([197,270,273,265],[
 corpus.pages[23].indices.length-16,corpus.pages[24].indices.length,
 corpus.pages[25].indices.length,corpus.pages[26].indices.length
]);
const fib=[0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987];
const primes=fib.map(x=>nthPrime(x+1));
assert.deepEqual(primes.map(p=>Math.abs(3301-p)),[
 3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516
]);
const a=primes.map(p=>mod(p-1));const b=heading;const ia=a.map(inv);assert.ok(a.every(x=>x!==0));
const initial=heading[15];
const plainWords=decrypt(cipherWords,initial,a,b,ia);
assert.deepEqual(encrypt(plainWords,initial,a,b),cipherWords);
const byLen=new Map();
for(const token of gibran.toUpperCase().match(/[A-Z]+/g)||[]){
 const enc=encodeGP(token);if(!enc)continue;
 if(!byLen.has(enc.length))byLen.set(enc.length,[]);byLen.get(enc.length).push(enc);
}
const plant=bodyWords.map((w,i)=>{
 const choices=byLen.get(w.length);assert.ok(choices&&choices.length);
 return choices[(i*37+17)%choices.length];
});
const plantCipher=encrypt(plant,initial,a,b);
const plantRecovered=decrypt(plantCipher,initial,a,b,ia);
assert.deepEqual(plantRecovered,plant);
assert.deepEqual(encrypt(plantRecovered,initial,a,b),plantCipher);
const plain=flatten(plainWords),plantFlat=flatten(plant);
const out={
 classification:'bounded original-source negative; no unknown plaintext or key recovered',
 formula:'C[w,j] = phi(prime(F_j+1))*P[w,j] + p23Heading[j]*C_previous (mod 29)',
 source:{pages:[23,24,25,26],headingWords:headingWords.map(w=>w.runes),headingIndices:heading,
  bodyWords:bodyWords.length,bodyRunes:cipher.length,bodyPageRunes:[197,270,273,265]},
 key:{fibonacciIndices:fib,primes,p15TotientsMod29:a,p23HeadingIndices:b,initialPreviousCipherRune:initial,
  unusedP15CoefficientPositions:[14,15],unusedHeadingCoefficientPosition:[14]},
 original:{rawIoC:ioc(cipher),inverseIoC:ioc(plain),
  first60:plain.slice(0,60).map(x=>corpus.translit[x]).join(' ')},
 positiveControl:{source:'Gibran, The Prophet; canonical GP29 tokenization',
  words:plant.length,runes:plantFlat.length,plaintextIoC:ioc(plantFlat),exactInverse:true,exactReencryption:true},
 solvedPage57ReferenceIoC:ioc(corpus.pages[57].indices)
};
assert.equal(out.original.rawIoC,0.03430457275376107);
assert.ok(Math.abs(out.original.inverseIoC-0.03451467760797606)<1e-14);
assert.ok(Math.abs(out.positiveControl.plaintextIoC-0.06297595686904124)<1e-14);
console.log(JSON.stringify(out,null,2));
