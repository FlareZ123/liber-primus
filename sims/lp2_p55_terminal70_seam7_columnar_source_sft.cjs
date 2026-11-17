'use strict';

/**
 * Exact p55 70+7 source-echo rectangle: standard columnar transport gate.
 *
 * The first 15 complete p55 words occupy 70 original GP29 runes;
 * the final two three-rune words plus p56's first original ciphertext
 * rune form a 7-rune key seen verbatim between F runes on p27.
 *
 * 70 = 10 rows * 7 columns = 5 rows * 14 columns.
 * Historic 2014 Cicada stage used 14 columns. This exact test asks
 * whether any pure column permutation, even with arbitrary secret key,
 * can turn the 70 intact ciphertext runes into ordinary GP29 prose.
 *
 * A pure transposition preserves the original 70-rune multiset and IoC
 * under ANY column order. Compare all actual 70-rune solved-reference
 * windows (not fitted sources), then demonstrate native source plants.
 *
 * Node22 CJS single runnable test; no writes:
 *   node sims/lp2_p55_terminal70_seam7_columnar_source_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const load=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const corpus=load('resources/liber-primus/lp2-corpus.json');
const references=load('resources/external/relikd-solved-gp29-native-v1.json');
const printed=fs.readFileSync(
  path.join(ROOT,'resources/liber-primus/lp2-transcription.txt'),'utf8');
const page55=corpus.pages[55].indices;
const page56=corpus.pages[56].indices;
const page27=corpus.pages[27].indices;
const page57=corpus.pages[57].indices;
const nativeMap=new Map(corpus.runes.map((g,i)=>[g,i]));
const latin=x=>x.map(v=>corpus.translit[v]).join('');
const ioc=arr=>{
  const counts=Array(29).fill(0);
  for(const i of arr){assert(i>=0 && i<29);counts[i]++;}
  return counts.reduce((n,c)=>n+c*(c-1),0)/(arr.length*(arr.length-1));
};
const sourceBody=page55.slice(0,70);
const sourceKey=page55.slice(70).concat(page56[0]);
assert.equal(page55.length,76);
assert.equal(page56.length,85);
assert.equal(page27.length,234);
assert.equal(page57.length,95);
assert.equal(sourceBody.length,70);
assert.equal(sourceKey.length,7);
assert.deepEqual(sourceKey,page27.slice(28,35));
assert.deepEqual(sourceKey,[23,11,1,17,18,10,25]);
assert.equal(latin(sourceKey),'DJUBEIAE');
const bodyTranscription=printed.split('%')[54];
const sourceWordLengths=[];
let current=0;
for(const character of bodyTranscription){
  if(nativeMap.has(character))current++;
  else if(character==='/'||/\s/u.test(character)){}
  else if(current){sourceWordLengths.push(current);current=0;}
}
if(current)sourceWordLengths.push(current);
assert.deepEqual(sourceWordLengths,
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.equal(sourceWordLengths.slice(0,15).reduce((a,b)=>a+b,0),70);
assert.equal(sourceWordLengths.at(-2)+sourceWordLengths.at(-1),6);
const keySorted=[...sourceKey.keys()].sort((i,j)=>
  sourceKey[i]-sourceKey[j]);
assert.deepEqual(keySorted,[2,5,1,3,4,0,6]);
const historical14=[2,8,9,1,12,13,11,4,5,7,3,0,6,10];
assert.equal(new Set(historical14).size,14);

/**
 * Encrypt (read columns in a fixed permutation) on a complete
 * nrow-by-ncolumn plaintext register.
 * @param {number[]} source
 * @param {number[]} order
 * @returns {number[]}
 */
function encrypt(source,order){
  assert.equal(source.length%order.length,0);
  const out=[],height=source.length/order.length;
  for(const col of order)
    for(let row=0;row<height;row++)
      out.push(source[row*order.length+col]);
  return out;
}
/**
 * Inverse of standard columnar transport for any column permutation.
 * @param {number[]} encrypted
 * @param {number[]} order
 * @returns {number[]}
 */
function decrypt(encrypted,order){
  assert.equal(encrypted.length%order.length,0);
  const out=new Array(encrypted.length),height=encrypted.length/order.length;
  let j=0;
  for(const col of order)
    for(let row=0;row<height;row++)
      out[row*order.length+col]=encrypted[j++];
  return out;
}
const direct7=decrypt(sourceBody,keySorted);
const direct14=decrypt(sourceBody,historical14);
assert.deepEqual(encrypt(direct7,keySorted),sourceBody);
assert.deepEqual(encrypt(direct14,historical14),sourceBody);
assert.equal(ioc(sourceBody),ioc(direct7));
assert.equal(ioc(sourceBody),ioc(direct14));
assert.equal(ioc(sourceBody),0.0380952380952381);

const positive=page57.slice(0,70);
assert.equal(positive.length,70);
for(const order of [keySorted,historical14]){
  assert.deepEqual(decrypt(encrypt(positive,order),order),positive);
  assert.equal(ioc(encrypt(positive,order)),ioc(positive));
}
const solvedRunes=references.sections.map(section=>({
  name:section.name,
  indices:[...section.source_text].filter(g=>nativeMap.has(g))
    .map(g=>nativeMap.get(g))
}));
const W=70, values=[];
for(const source of solvedRunes)
  for(let i=0;i+W<=source.indices.length;i++)
    values.push({name:source.name,offset:i,
      value:ioc(source.indices.slice(i,i+W))});
assert.equal(values.length,2358);
const min=values.reduce((best,x)=>x.value<best.value?x:best,values[0]);
assert.equal(min.name,'0_wisdom');
assert.equal(min.offset,30);
assert.equal(min.value,0.04389233954451346);
assert.equal(values.filter(x=>x.value<=ioc(sourceBody)).length,0);

console.log(JSON.stringify({
  hypothesis:'Exact p55 15 whole words=70-cipher runes, terminal two printed words + p56 rune = 7-rune source key; conventional historical 7/14-column transposition',
  fixedOriginal:{
    physicalP55Runes:76,bodyRunes:70,bodyWords:15,
    terminalPrintedWords:2,keyRunes:7,
    keyLatin:latin(sourceKey),
    keyAgainAtP27BetweenF:true,
    keySortedSevenColumns:keySorted,
    authenticHistorical14Columns:historical14,
    ciphertextIoC:ioc(sourceBody),
    sevenColumnInverse:latin(direct7),
    fourteenColumnInverse:latin(direct14)
  },
  solvedControls:{
    independentSolved70RuneWindows:values.length,
    smallestSolvedSourceIoC:min,
    atOrBelowCipherIoC:0,
    plantedSolvedP57Length:positive.length,
    plantedSolvedP57IoC:ioc(positive),
    exactRecoveryForSevenAndFourteenColumns:true
  },
  decision:'All pure, even secret, column permutations preserve the original 70-rune IoC below all 2358 solved GP-native windows; standard original inverses produce no authentic plaintext. Additional value-changing substitution not tested; original p56 first rune is an independently solved title, not a proved key component.'
},null,2));
module.exports={encrypt,decrypt,ioc};
