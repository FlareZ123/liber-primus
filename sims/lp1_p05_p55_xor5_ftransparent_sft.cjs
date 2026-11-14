'use strict';
/** Original p05 verbal-cell tape against original p55 under 5-bit XOR.
 * Independent negative for both source directions and all 2^3 ciphertext-F
 * literal-bypass masks. Tested in Node.js 22 with repository-pinned inputs.
 * Run: node sims/lp1_p05_p55_xor5_ftransparent_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source=read('resources/transcriptions/lp1_wulfic_canonical.txt');
const start=source.indexOf('272-138-');
assert(start>=0);
const words=source.slice(start).split(/\r?\n/).slice(0,5)
 .flatMap(line=>line.replace(/\/$/,'').split('-').filter(s=>!/^\d+$/.test(s)));
const key=Array.from(words.join(''),rune=>corpus.runes.indexOf(rune));
const cipher=corpus.pages.find(p=>p.page===55).indices;
assert.equal(words.length,13);assert.equal(key.length,76);
assert.equal(cipher.length,76);assert(key.every(x=>x>=0&&x<29));
const fPositions=cipher.flatMap((x,i)=>x===0?[i]:[]);
assert.deepEqual(fPositions,[15,25,41]);
/** @param {number[]} k @param {number} mask @returns {{bad:number[],consumed:number}} */
function probe(k,mask){
 let consumed=0;const bad=[];
 for(let i=0;i<cipher.length;i++){
  const fi=fPositions.indexOf(i);
  const bypass=fi>=0 && Boolean(mask & (1<<fi));
  const keyIndex=bypass?-1:consumed++;
  const value=bypass?0:(cipher[i]^k[keyIndex]);
  assert.equal(bypass?0:(value^k[keyIndex]),cipher[i]);
  if(value>28||(!bypass&&value===0))bad.push(i);
 }
 return {bad,consumed};
}
const results=[];
for(const orientation of ['printed','reversed']){
 const k=orientation==='printed'?key:[...key].reverse();
 for(let mask=0;mask<8;mask++){
  const {bad,consumed}=probe(k,mask);
  assert(bad.length>0);
  if(orientation==='printed')assert.deepEqual(bad.slice(0,3),[3,6,9]);
  results.push({orientation,mask,invalidCount:bad.length,firstInvalid:bad[0],consumed});
 }
}
assert.deepEqual(results.slice(0,8).map(r=>r.invalidCount),[11,7,9,8,11,7,9,9]);
assert.deepEqual(results.slice(8).map(r=>r.invalidCount),[4,5,5,7,4,5,5,11]);
// Independent 76-position native GP29 planted XOR positive for each key direction.
for(const k of [key,[...key].reverse()]){
 const plain=k.map(v=>Array.from({length:28},(_,j)=>j+1)
  .find(p=>(p^v)>=1&&(p^v)<=28));
 assert(plain.every(Number.isInteger));
 const ct=plain.map((p,i)=>p^k[i]);
 assert(ct.every(x=>x>=1&&x<=28));
 assert.deepEqual(ct.map((v,i)=>v^k[i]),plain);
}
console.log(JSON.stringify({sourceKeyLength:key.length,originalP55Length:cipher.length,
 fPositions,variants:results.length,anyValid:results.some(r=>r.invalidCount===0),
 results},null,2));
