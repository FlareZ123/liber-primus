'use strict';

/**
 * Source-paired LP2 numeric table AES-256-CTR chapter-key inverse.
 * Original p49-51 table has 32 rows x 8 base60-byte cells. Each of eight
 * printed columns is exactly one 32-byte AES-256 key, potentially one for
 * each of eight original $ transcription sections. Test that direct human
 * route against the unchanged 12,956-rune unknown LP2 source. Also test
 * eight contiguous row-major 32-byte keys as the alternate source order.
 *
 * No unspecified secret IV: zero or a literal 3301 counter.
 * Ciphertext symbols remain native GP29, Vigenere combine with CTR bytes
 * reduced modulo29; both additive directions and two counter byte orders.
 * This is conditional and does not claim these operations are authored.
 *
 * Single-file, Windows Node22 CJS, no writes.
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const transcript=read('resources/lp2-transcription.txt');
const original=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
assert.equal(original.length,12956);
assert.equal(grid.bytes.length,256);
assert.ok(grid.bytes.every(x=>Number.isInteger(x)&&x>=0&&x<=255));
const runeMap=new Map(corpus.runes.map((r,i)=>[r,i]));
const parts=transcript.split('$').slice(0,8).map(s=>[...s].filter(r=>runeMap.has(r)).map(r=>runeMap.get(r)));
const lengths=parts.map(s=>s.length);
assert.deepEqual(lengths,[729,1145,1738,1894,1021,1433,1680,3316]);
assert.deepEqual(parts.flat(),original);
const keyTables={
  'printed-32x8-columns':Array.from({length:8},(_,col)=>
    Buffer.from(Array.from({length:32},(_,row)=>grid.bytes[row*8+col]))),
  'contiguous-32-byte-blocks':Array.from({length:8},(_,col)=>
    Buffer.from(grid.bytes.slice(col*32,(col+1)*32)))
};
for(const keys of Object.values(keyTables))for(const key of keys)assert.equal(key.length,32);

/** @param {Buffer} key @param {Buffer} iv @param {number} size @returns {Buffer} */
function ctr(key,iv,size){
  const cipher=crypto.createCipheriv('aes-256-ctr',key,iv);
  return Buffer.concat([cipher.update(Buffer.alloc(size)),cipher.final()]);
}
/** @param {number[]} xs @returns {number} */
function ioc(xs){
  const counts=Array(29).fill(0);
  for(const x of xs)counts[x]++;
  return counts.reduce((s,v)=>s+v*(v-1),0)/(xs.length*(xs.length-1));
}
/** @param {number[]} nums @returns {string} */
const latin=nums=>nums.map(x=>corpus.translit[x]).join('');
const variants=[
  ['zero',Buffer.alloc(16)],
  ['3301-as-bigend-counter',(()=>{const v=Buffer.alloc(16);v.writeUInt32BE(3301,12);return v;})()],
  ['3301-as-littleend-counter',(()=>{const v=Buffer.alloc(16);v.writeUInt32LE(3301,0);return v;})()]
];
const results=[];
const solvedPlant=corpus.pages[57].indices;
for(const [layout,keys] of Object.entries(keyTables)){
  for(const [ivName,iv] of variants){
    const outputs=keys.map((key,section)=>ctr(key,iv,parts[section].length));
    for(const sign of [-1,1]){
      const decoded=parts.map((section,k)=>section.map((v,i)=>
        (v+sign*(outputs[k][i]%29)+29)%29));
      const flat=decoded.flat();
      const score=decoded.map(ioc);
      const bestSection=Math.max(...score);
      const bestGlobal=ioc(flat);
      results.push({layout,iv:ivName,sign,overallIoC:bestGlobal,
        maximumSectionIoC:bestSection,chapterIoCs:score,
        firstChapterLatin:latin(decoded[0].slice(0,100))});
      const planted=Array.from({length:parts[0].length},
        (_,i)=>solvedPlant[i%solvedPlant.length]);
      const synthetic=planted.map((p,i)=>(p-sign*(outputs[0][i]%29)+29)%29);
      const recovered=synthetic.map((c,i)=>(c+sign*(outputs[0][i]%29)+29)%29);
      assert.deepEqual(recovered,planted,'AES-CTR GP-native solved-p57 plant must round-trip');
    }
  }
}
assert.equal(results.length,12);
const ranked=results.slice().sort((a,b)=>b.overallIoC-a.overallIoC);
const nativeIoC=ioc(solvedPlant);
const overallBest=ranked[0];
console.log(JSON.stringify({
  hypothesis:'8 x AES-256 keys from 32x8 original p50 table to 8 original $ groups',
  corpusRuneCount:original.length,
  originalSectionLengths:lengths,
  originalIoC:ioc(original),
  solvedP57NativeIoC:nativeIoC,
  testedConfigurations:results.length,
  best:overallBest,
  all:results.map(({firstChapterLatin,...r})=>r),
  nativePlantRecoveries:results.length,
  verdict:overallBest.overallIoC>0.045?'Investigate candidate':'No global native GP29 plaintext emerges from frozen direct AES-CTR/mod29 variants'
},null,2));
console.log('PASS original 32x8 AES-256 chapter-key original-input source test');
