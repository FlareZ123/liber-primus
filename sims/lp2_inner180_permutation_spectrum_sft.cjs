"use strict";
/**
 * LP2 p49-p51 numerical table 180-cell interior vs solved 180 GP runes:
 * exact symbol-multiset obstruction to permutation-only readout.
 * Test both known ciphertext ending and genuinely decrypted plaintext ending,
 * original base60 and defensible base59 digit alphabets. No fitted parameters,
 * no Monte Carlo and no artificial textual candidate.
 * Windows 11 Node22: node sims/lp2_inner180_permutation_spectrum_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8");
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const book=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const cells=Array.from({length:30},(_,r)=>
 Array.from({length:6},(_,c)=>(r+1)*8+c+1)).flat();
assert.equal(cells.length,180);
assert.equal(grid.bytes.length,256);
const tokens=grid.pages.flatMap(p=>p.tokens);
assert.equal(tokens.length,256);
const glyph59=grid.alphabet.replace("f","");
assert.equal(glyph59.length,59);
const sources={
 base60:cells.map(i=>grid.bytes[i]%29),
 base59:cells.map(i=>(59*glyph59.indexOf(tokens[i][0])+
                     glyph59.indexOf(tokens[i][1]))%29)
};
assert.ok(Object.values(sources).every(x=>x.length===180&&x.every(v=>v>=0&&v<29)));
const ciphertext=[...book.pages[56].indices,...book.pages[57].indices];
assert.equal(ciphertext.length,180);
const tags=book.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
const known56="AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE "+
 "THAT HASHES TO IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE";
/** @param {string} sentence */
function runes(sentence) {
 const result=[];
 for(let word of sentence.toUpperCase().match(/[A-Z]+/g)||[]){
  word=word.replace(/QU/g,"CW").replace(/V/g,"U")
   .replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");
  for(let pos=0;pos<word.length;){
   const p=tags.find(x=>word.startsWith(x.s,pos));
   assert.ok(p,"GP source token missing");
   result.push(p.i);pos+=p.s.length;
  }
 }
 return result;
}
const p56=runes(known56);
assert.equal(p56.length,85);
const primes=[];
for(let n=2;primes.length<85;n++){
 let prime=true;
 for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break;}
 if(prime)primes.push(n);
}
let clock=0;
const recreated=p56.map(p=>p===0?0:(p+primes[clock++]-1)%29);
assert.equal(clock,84);
assert.deepEqual(recreated,book.pages[56].indices);
const plaintext=p56.concat(book.pages[57].indices);
assert.equal(plaintext.length,180);
/** @param {number[]} xs */
function hist(xs) {
 const counts=Array(29).fill(0);
 for(const x of xs)counts[x]++;
 return counts;
}
/** @param {number[]} a @param {number[]} b */
function l1(a,b) {
 return a.reduce((s,n,i)=>s+Math.abs(n-b[i]),0);
}
/** @param {number[]} a */
const sorted=a=>a.slice().sort((x,y)=>x-y);
const outcomes={};
for(const [name,source] of Object.entries(sources)){
 const sh=hist(source);
 outcomes[name]={};
 for(const [label,target] of Object.entries({endingCiphertext:ciphertext,endingPlaintext:plaintext})){
  const th=hist(target),direct=l1(sh,th),permutationAndRelabel=l1(sorted(sh),sorted(th));
  assert(permutationAndRelabel>0);
  outcomes[name][label]={directL1:direct,
   minimumL1UnderArbitraryRuneRelabeling:permutationAndRelabel};
 }
}
assert.deepEqual(outcomes,{
 base60:{endingCiphertext:{directL1:102,minimumL1UnderArbitraryRuneRelabeling:20},
         endingPlaintext:{directL1:144,minimumL1UnderArbitraryRuneRelabeling:74}},
 base59:{endingCiphertext:{directL1:116,minimumL1UnderArbitraryRuneRelabeling:26},
         endingPlaintext:{directL1:164,minimumL1UnderArbitraryRuneRelabeling:80}}
});
const plant=plaintext.map(v=>(7*v+3)%29).reverse();
assert.deepEqual(sorted(hist(plant)),sorted(hist(plaintext)));
console.log(JSON.stringify({source:{
 originalGridCells:256,interiorCells:180,solvedRunes:180,
 p56CipherPositive:true,model:"permutation + arbitrary bijective rune relabel"},
 results:outcomes,
 positive:{permutationAndBijectiveSubstitutionPreserveSpectrum:true},
 inference:"No pure permutation of base60/base59 interior-cell modulo29 symbols with any global GP29 relabeling yields the solved180-rune ciphertext or plaintext. This does not test additive pads, transducers, or nonlinear byte mappings."},null,2));
