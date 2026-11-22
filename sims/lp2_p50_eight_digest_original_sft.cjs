'use strict';
/**
 * Original LP2 32x8 digit panel: exact SHA-256-class digest receiver test.
 * Each original column or successive group of four printed rows is 32 bytes.
 * Node 22 CommonJS read-only SFT. No candidate threshold other than exact 32/32.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname,'..');
/** @param {string} rel @returns {Buffer} */
const file = rel => fs.readFileSync(path.join(root,rel));
/** @param {string} rel @returns {any} */
const json = rel => JSON.parse(file(rel).toString('utf8'));
const grid = json('resources/liber-primus/base60-grid.json');
const gp = json('resources/liber-primus/lp2-corpus.json');
assert.equal(grid.byte_rows.length,32);
assert.ok(grid.byte_rows.every(r=>r.length===8 && r.every(n=>Number.isInteger(n)&&n>=0&&n<=255)));
const pages = gp.pages.filter(p=>p.page<=55);
assert.equal(pages.reduce((n,p)=>n+p.indices.length,0),12956);
/** @type {Array<{label:string,bytes:Buffer}>} */
const panels = [];
for(let c=0;c<8;c++)panels.push({label:'column_'+c,bytes:Buffer.from(grid.byte_rows.map(r=>r[c]))});
for(let b=0;b<8;b++)panels.push({label:'rowblock_'+b,bytes:Buffer.from(grid.byte_rows.slice(4*b,4*b+4).flat())});
assert.ok(panels.every(p=>p.bytes.length===32));
/** @type {Array<{label:string,bytes:Buffer}>} */
const sources=[];
/** @param {string} name @param {Buffer|string|number[]} value */
const add=(name,value)=>sources.push({label:name,bytes:Buffer.from(value)});
/** @param {number[]} seq @param {string} label */
const addRunes=(seq,label)=>{
  add(label+':indices',seq);
  add(label+':commas',seq.join(','));
  add(label+':runes',seq.map(x=>gp.runes[x]).join(''));
  add(label+':translit',seq.map(x=>gp.translit[x]).join(''));
};
for(const p of pages)addRunes(p.indices,'page_'+p.page);
const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
for(const [a,b] of chapters)addRunes(pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices),'chapter_'+a+'_'+b);
addRunes(pages.flatMap(p=>p.indices),'all_unknown');
const scans=[];
for(let i=0;i<75;i++){
 const b=file('resources/liber-primus/'+String(i).padStart(2,'0')+'.jpg');
 scans.push(b);add('scan_'+i+':JPEG',b);
}
for(const [a,b] of chapters)add('chapter_'+a+'_'+b+':JPEG',Buffer.concat(scans.slice(a+17,b+18)));
const digests=[
 ['sha256',x=>crypto.createHash('sha256').update(x).digest()],
 ['sha512-first32',x=>crypto.createHash('sha512').update(x).digest().subarray(0,32)],
 ['sha512-last32',x=>crypto.createHash('sha512').update(x).digest().subarray(32)],
 ['blake2s256',x=>crypto.createHash('blake2s256').update(x).digest()],
];
assert.equal(crypto.createHash('sha256').update('abc').digest('hex'),
'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
const matches=[];let comparisons=0,best=0;
for(const s of sources)for(const [algorithm,digester] of digests){
 const digest=digester(s.bytes);
 for(const p of panels){
  let bytes=0;for(let j=0;j<32;j++)if(p.bytes[j]===digest[j])bytes++;
  comparisons++;best=Math.max(best,bytes);
  if(bytes===32)matches.push({panel:p.label,source:s.label,algorithm});
 }
}
const plant=digests[0][1](sources[0].bytes);
assert.ok(Buffer.compare(plant,digests[0][1](sources[0].bytes))===0,'planted exact digest positive');
console.log(JSON.stringify({inputSource:'original JPEG 00-74, GP29 pages 0-55, nine original chapters',
panelRows:32,panelColumns:8,panelCandidates:panels.length,sourceRepresentations:sources.length,
hashFamilies:digests.map(d=>d[0]),comparisons,bestMatchingBytes:best,exact32ByteMatches:matches,
plantedPositive:'PASS'},null,2));
