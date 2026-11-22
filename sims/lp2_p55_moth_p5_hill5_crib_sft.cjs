"use strict";
/**
 * Agent48, #729: source-native LP1 p5 moth 5x5 square used as a fixed
 * GF29 Hill cipher on the exact 30-rune p55 moth-linked seven-word crib.
 * No fitted alphabet, phase, IV, nonce or source alteration.
 * SFT: node sims/lp2_p55_moth_p5_hill5_crib_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root,p),"utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lp1 = read("resources/transcriptions/lp1_wulfic_canonical.txt");
assert(lp1.includes("ᚦᛖ-ᛏᚩᛏᛁᛖᚾᛏ-ᚠᚢᚾᚳᛏᛡᚾ"));
assert(lp1.includes("ᚪᛚᛚ-ᚦᛝᛋ"));
const M = [
 [272,138,341,131,151],
 [366,199,130,320,18],
 [226,245,91,245,226],
 [18,320,130,199,366],
 [151,131,341,138,272]
];
assert(M.every(row => row.reduce((s,x)=>s+x,0)===1033));
const mod = n => ((n%29)+29)%29;
const inv = a => {
 for(let x=1;x<29;x++)if(mod(x*a)===1)return x;
 throw Error("singular pivot");
};
function inverse(matrix) {
 const aug=matrix.map((row,i)=>[...row.map(mod),...Array.from({length:5},(_,j)=>Number(i===j))]);
 let determinant=1;
 for(let i=0;i<5;i++) {
  const pivot=aug.findIndex((r,j)=>j>=i&&r[i]!==0);
  assert(pivot>=0,"source matrix singular");
  if(pivot!==i){[aug[i],aug[pivot]]=[aug[pivot],aug[i]];determinant=mod(-determinant);}
  const val=aug[i][i];determinant=mod(determinant*val);
  const scale=inv(val);aug[i]=aug[i].map(x=>mod(x*scale));
  for(let j=0;j<5;j++)if(j!==i){const mul=aug[j][i];aug[j]=aug[j].map((x,k)=>mod(x-mul*aug[i][k]));}
 }
 assert.equal(determinant,3);
 return aug.map(r=>r.slice(5));
}
const inverseM=inverse(M);
function transform(input,matrix) {
 assert.equal(input.length%5,0);
 const out=[];
 for(let i=0;i<input.length;i+=5)
  for(const row of matrix)
   out.push(mod(row.reduce((sum,n,j)=>sum+n*input[i+j],0)));
 return out;
}
const sourceCrib=["THE","TOTIENT","FUNCTION","IS","SACRED","ALL","THINGS"];
const sourceGPWords=["ᚦᛖ","ᛏᚩᛏᛁᛖᚾᛏ","ᚠᚢᚾᚳᛏᛡᚾ","ᛁᛋ","ᛋᚪᚳᚱᛖᛞ","ᚪᛚᛚ","ᚦᛝᛋ"];
assert.deepEqual(sourceGPWords.map(w=>w.length),[2,7,7,2,6,3,3]);
const plain=[...sourceGPWords.join("")].map(r=>gp.runes.indexOf(r));
assert(plain.every(x=>x>=0)&&plain.length===30);
const page=gp.pages[55].indices;
assert.equal(page.length,76);
const cipher=page.slice(46);
assert.equal(cipher.length,30);
const expected=transform(plain,M);
const matchingPositions=expected.map((v,i)=>v===cipher[i]?i:-1).filter(i=>i>=0);
assert.deepEqual(matchingPositions,[0]);
assert.deepEqual(transform(expected,inverseM),plain);
assert.deepEqual(transform(transform(cipher,inverseM),M),cipher);
const withheld=page.slice(1,41);
const decodedHoldout=transform(withheld,inverseM);
assert.deepEqual(transform(decodedHoldout,M),withheld);
const render=xs=>xs.map(x=>gp.translit[x]).join("-");
const result={
 status:"PASS: source-moth 5x5 Hill cipher contradicts exact seven-word crib",
 sourceMagicSquare: "solved LP1 physical p5, same moth as LP2 p55",
 matrixModulus:29, matrixDeterminantMod29:3, reversible:true,
 sourcePhrase:sourceCrib.join(" "),
 originalP55SevenWordStart:46,
 plaintextGP:render(plain),originalCipherGP:render(cipher),
 sourcePredictedCipherGP:render(expected), matches:matchingPositions.length,
 matchingPositions, withheldLength:decodedHoldout.length,
 withheldDecodedGP:render(decodedHoldout),
 originalCipherAndNativePlantRoundTrips:true,
 interpretation:"Reject fixed no-IV 5x5 Hill multiplication by the source p5 square for this provisional crib; neither crib nor cipher identified."
};
console.log(JSON.stringify(result,null,2));
