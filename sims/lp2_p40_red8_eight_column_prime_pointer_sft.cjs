'use strict';
/** p40-53 eight-column 32-row prime-counter original-inverse gate.
 * Reader from original published physical chapter:
 *  - first eight red runes are eight pointer initial values (0..28)
 *  - 3000 next runes consume table columns round-robin, each column retains
 *    one 5-bit pointer into the 32-ROW source numeral table
 *  - pointer increments by the published GP prime weight of printed cipher
 *    rune, mod32, AFTER each output
 *  - table cell byte reduces mod29, using p56's subtract-pad convention
 * Source does not authenticate the proposed pointer update; the experiment
 * tests exactly one frozen human-computable interpretation with no phase fit.
 * Windows Node.js 22 / CommonJS; read-only.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
/** @param {string} name */
function read(name){return fs.readFileSync(path.join(root,name),'utf8');}
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table=JSON.parse(read('resources/liber-primus/lp2-grid-256.json')).bytes;
const pages=corpus.pages.filter(page=>page.page>=40&&page.page<=53);
assert.equal(pages.length,14);
const original=pages.flatMap(page=>page.indices);
assert.equal(original.length,3008);
const heading=original.slice(0,8);
assert.deepEqual(heading,[0,9,19,26,6,23,25,8]);
assert.equal(table.length,256);
const ciphertext=original.slice(8);
assert.equal(ciphertext.length,3000);
const holdoutOffset=pages.filter(page=>page.page<=50)
  .reduce((sum,page)=>sum+page.indices.length,0)-8;
assert.equal(holdoutOffset,2466);
/** @param {number} x */
const mod29=x=>(x%29+29)%29;
/**
 * Counter is an independently maintained five-bit 0..31 row address for
 * each source column, seeded by the eight original red GP index values.
 * @param {number[]} input
 * @param {boolean} decrypt
 * @returns {{out:number[],finalState:number[]}}
 */
function decodeOrEncode(input,decrypt){
  const states=heading.slice();
  const out=[];
  for(let t=0;t<input.length;t++){
    const col=t%8,row=states[col];
    const pad=table[8*row+col]%29;
    const value=input[t];
    const c=decrypt?value:mod29(value+pad);
    const p=decrypt?mod29(value-pad):value;
    out.push(decrypt?p:c);
    states[col]=(row+corpus.prime[c])&31;
  }
  return {out,finalState:states};
}
/** @param {number[]} data */
function ioc(data){
  const freq=Array(29).fill(0);
  for(const x of data)freq[x]++;
  return freq.reduce((sum,x)=>sum+x*(x-1),0)/
    (data.length*(data.length-1));
}
/** Extract source-independent native GP29 control from Shakespeare text. */
function nativeControl(){
  const latin=read('resources/control/shakespeare_first300k.txt').toUpperCase()
    .replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S');
  const tokens=corpus.translit.map((t,i)=>({t,i}))
    .sort((a,b)=>b.t.length-a.t.length||a.i-b.i);
  const out=[];
  for(let i=0;i<latin.length&&out.length<3000;){
    const item=tokens.find(row=>latin.startsWith(row.t,i));
    if(item){out.push(item.i);i+=item.t.length;}else i++;
  }
  assert.equal(out.length,3000);
  return out;
}
const decoded=decodeOrEncode(ciphertext,true);
const recovered=decodeOrEncode(decoded.out,false);
assert.deepEqual(recovered.out,ciphertext);
assert.deepEqual(recovered.finalState,decoded.finalState);
assert.deepEqual(decoded.finalState,[2,31,26,7,5,8,20,27]);
const plant=nativeControl();
const encrypted=decodeOrEncode(plant,false);
const plantRecovery=decodeOrEncode(encrypted.out,true);
assert.deepEqual(plantRecovery.out,plant);
assert.deepEqual(plantRecovery.finalState,encrypted.finalState);
// Independently specified negative: starting states reversed must fail
// on the native source plant. One changed physical red key cannot recover it.
const first=heading[0];
heading[0]=heading[7];heading[7]=first;
const wrong=decodeOrEncode(encrypted.out,true).out;
heading[7]=heading[0];heading[0]=first;
assert(wrong.some((x,i)=>x!==plant[i]));
const preview=decoded.out.slice(0,40).map(i=>corpus.translit[i]).join(' ');
const result={
  source:'physical p40..53 original 3008 runes, first 8 red GP29 seeds',
  schema:'eight independent source-column 32-row pointers, GP-prime(C) feedback, grid byte%29',
  heading,tableBytes:table.length,originalRunes:original.length,
  encryptedBodyRunes:ciphertext.length,holdoutBodyStart:holdoutOffset,
  originalBodyIoc:ioc(ciphertext),
  decodedIoc:ioc(decoded.out),
  decodedTrainingIoc:ioc(decoded.out.slice(0,holdoutOffset)),
  decodedP51To53Ioc:ioc(decoded.out.slice(holdoutOffset)),
  nativeGPShakespeareIoc:ioc(plant),
  nativeRecovered:plantRecovery.out.length,
  originalReencryptionIdentical:true,
  finalPointerState:decoded.finalState,
  first40Decoded:preview,
  conclusion:'One source-derived prime-counter interpretation fails to recover native-GP prose.'
};
console.log(JSON.stringify(result,null,2));
