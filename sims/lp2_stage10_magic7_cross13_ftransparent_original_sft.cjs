'use strict';
/**
 * Original Stage10 7x7 magic-square center cross as a 13-rune GP29 key.
 * Exact historically authenticated plaintext-F transparent decoder.
 * Standalone Windows 11 Node 22: node sims/lp2_stage10_magic7_cross13_ftransparent_original_sft.cjs
 *
 * No fitted key phase, edited ciphertext, output-dependent orientation,
 * arbitrary alphabet mapping, or secret operator.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const read = p => fs.readFileSync(path.resolve(__dirname,'..',p));
const squareText = read('resources/cicada2014-openpuff-magic-squares.txt');
assert.equal(createHash('sha256').update(squareText).digest('hex'),
  '9e5c3004eec652c89027e99aa6f31c53a84c1f8c327c04ca9aa6acf7884b6c7f');
const blocks = squareText.toString('utf8').trim()
  .split(/\r?\n\s*\r?\n/u)
  .map(b => b.trim().split(/\r?\n/u)
    .map(line => line.trim().split(/\s+/u).map(Number)));
const square = blocks.find(b => b.length===7 && b.every(row => row.length===7));
assert.ok(square);
const horizontal = square[3], vertical = square.map(row => row[3]);
assert.deepEqual(horizontal,[16,65,270,331,270,65,16]);
assert.deepEqual(vertical,[190,47,114,331,114,47,190]);
assert.ok(square.every(row => row.reduce((x,y)=>x+y,0)===1033));
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const mod=n=>((n%29)+29)%29;
const originalArms={
  horizontalFirst:[...horizontal,...vertical.filter((_,i)=>i!==3)],
  verticalFirst:[...vertical,...horizontal.filter((_,i)=>i!==3)]
};
const keys=Object.fromEntries(Object.entries(originalArms)
  .map(([name,nums])=>[name,nums.map(mod)]));
assert.deepEqual(keys.horizontalFirst,
  [16,7,9,12,9,7,16,16,18,27,27,18,16]);
assert.deepEqual(keys.verticalFirst,
  [16,18,27,12,27,18,16,16,7,9,9,7,16]);
assert.equal(originalArms.horizontalFirst.reduce((a,b)=>a+b,0),1735);
const red=corpus.pages[0].indices.slice(0,13);
assert.deepEqual(red,[15,8,18,3,6,19,27,0,15,26,18,21,5]);
const primeSum=values=>values.reduce((n,r)=>n+corpus.prime[r],0);
assert.deepEqual([primeSum(red.slice(0,8)),primeSum(red.slice(8))],[347,315]);
assert.equal(1735,5*347);
const full=corpus.pages.slice(0,3).flatMap(p=>p.indices);
const black=full.slice(13);
const nextChapter=corpus.pages.slice(3,8).flatMap(p=>p.indices);
const clear=corpus.pages[57].indices;
assert.deepEqual([full.length,black.length,nextChapter.length,clear.length],
  [729,716,1145,95]);

/**
 * @param {number[]} plaintext
 * @param {number[]} key
 * @param {number} inverseSign
 * @returns {number[]}
 */
function encrypt(plaintext,key,inverseSign){
  let used=0;
  return plaintext.map(p=>p===0?0:mod(p-inverseSign*key[(used++)%key.length]));
}

/**
 * All ciphertext-F bypass choices. Ciphertext F also admits a consuming
 * non-F plaintext branch. Same-key-consumption states are merged exactly.
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} inverseSign
 * @returns {number}
 */
function furthest(cipher,key,inverseSign){
  let states=new Set([0]);
  for(let i=0;i<cipher.length;i++){
    const c=cipher[i],out=new Set();
    for(const used of states){
      if(c===0)out.add(used);
      if(mod(c+inverseSign*key[used%key.length])!==0)out.add(used+1);
    }
    if(out.size===0)return i;
    states=out;
  }
  return cipher.length;
}

/**
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} inverseSign
 * @returns {{plaintext:string,skipped:number[],consumed:number}[]}
 */
function titleDecodes(cipher,key,inverseSign){
  let paths=[{used:0,plain:[],skipped:[]}];
  for(let i=0;i<cipher.length;i++){
    const out=[];
    for(const p of paths){
      const c=cipher[i];
      if(c===0)out.push({used:p.used,plain:[...p.plain,0],
        skipped:[...p.skipped,i]});
      const v=mod(c+inverseSign*key[p.used%key.length]);
      if(v!==0)out.push({used:p.used+1,plain:[...p.plain,v],
        skipped:p.skipped});
    }
    paths=out;
  }
  return paths.map(p=>({plaintext:p.plain.map(x=>corpus.translit[x]).join(''),
    skipped:p.skipped,consumed:p.used}));
}

const expected={
  horizontalFirst:{minus:[45,17,7],plus:[29,9,55]},
  verticalFirst:{minus:[143,10,7],plus:[88,1,1]}
};
const results=[];
for(const [direction,key] of Object.entries(keys)){
  for(const inverseSign of [-1,1]){
    const mode=inverseSign===-1?'minus':'plus';
    const original=[
      furthest(full,key,inverseSign),
      furthest(black,key,inverseSign),
      furthest(nextChapter,key,inverseSign)
    ];
    assert.deepEqual(original,expected[direction][mode]);
    const title=titleDecodes(red,key,inverseSign);
    assert.equal(title.length,2);
    assert.equal(furthest(red,key,inverseSign),13);
    const planted=encrypt(clear,key,inverseSign);
    assert.equal(furthest(planted,key,inverseSign),95);
    let consumed=0;
    for(let i=0;i<clear.length;i++){
      assert.equal(planted[i],clear[i]===0?0:
        mod(clear[i]-inverseSign*key[(consumed++)%key.length]));
    }
    results.push({direction,inverseSign,redTitle: title,
      p0to2:{reached:original[0],of:729},
      p0blackFreshClock:{reached:original[1],of:716},
      nextChapterFreshClock:{reached:original[2],of:1145},
      clearP57Plant:'95/95'});
  }
}
console.log(JSON.stringify({source:'original 2014 stage10 magic square',
  key:'13 central-cross cells mod29, period13, two printed orders',
  originalCrossSum:1735,originalTitlePrimeSums:[347,315],
  results,decision:'All four direct historical-F-transparent inverses become mathematically impossible on the original unseen p0 body and independent p3-7. No plaintext or real LP2 key recovered.'},null,2));
