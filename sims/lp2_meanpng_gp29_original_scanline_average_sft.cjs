'use strict';
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const source = JSON.parse(readFileSync(require.resolve('../resources/liber-primus/lp2-corpus.json'),'utf8'));
const transcript = readFileSync(require.resolve('../resources/liber-primus/lp2-transcription.txt'),'utf8');
const runeIndex = new Map(source.runes.map((r,i)=>[r,i]));
const segments = transcript.split('%');
assert.equal(segments.length,57,'one numeral-only page is absent in rune transcription');
assert.equal(source.pages.length,58);

/** @type {number[][][]} */
const printedLines = source.pages.map((p,i)=>{
  if(i===50){ assert.equal(p.runic_count,0);return [];}
  const text=segments[i<50?i:i-1];
  const rows=text.split('/').map(s=>[...s].filter(c=>runeIndex.has(c)).map(c=>runeIndex.get(c))).filter(a=>a.length>0);
  assert.deepEqual(rows.flat(),p.indices,'Original slash-line parser mismatch, page '+i);
  return rows;
});
assert.equal(printedLines.flat().length,604);
assert.equal(printedLines.flat(2).length,12956);
const mod=x=>(x%29+29)%29;
/**
 * Original PNG Average bpp=1 recurrence, ported exactly to GP29:
 * filter: residual=(pixel-floor((left+above)/2)) mod29;
 * inverse: pixel=(residual+floor((recoveredLeft+recoveredAbove)/2)) mod29.
 * @param {number[][]} rows @param {'forward'|'inverse'} direction
 * @returns {number[][]}
 */
function average(rows,direction){
  let prior=[];
  return rows.map(row=>{
    const decoded=[];
    for(let j=0;j<row.length;j++){
      const above=prior[j]??0;
      const left=direction==='forward'?(row[j-1]??0):(decoded[j-1]??0);
      const predictor=Math.floor((left+above)/2);
      decoded.push(mod(row[j]+(direction==='forward'?-predictor:predictor)));
    }
    prior=direction==='forward'?row:decoded;
    return decoded;
  });
}
/** @param {number[]} a */
function ioc(a){
  const counts=Array(29).fill(0);
  for(const x of a)counts[x]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
const targets=[[0,5],[16,21],[40,53]];
const results=[];
for(const [lo,hi] of targets){
  const raw=source.pages.slice(lo,hi+1).flatMap(p=>p.indices);
  const filter=printedLines.slice(lo,hi+1).flatMap(p=>average(p,'forward').flat());
  const inverse=printedLines.slice(lo,hi+1).flatMap(p=>average(p,'inverse').flat());
  assert.equal(raw.length,filter.length);
  assert.equal(raw.length,inverse.length);
  results.push({pages:`${lo}-${hi}`,symbols:raw.length,IoC_source:ioc(raw),IoC_forward:ioc(filter),IoC_inverse:ioc(inverse),prefix_forward:filter.slice(0,40),prefix_inverse:inverse.slice(0,40)});
}
assert.deepEqual(results.map(x=>x.symbols),[1470,1613,3008]);
for(const r of results){
  assert.ok(r.IoC_forward>0.032 && r.IoC_forward<0.038,'Unexpected forward original language-like structure');
  assert.ok(r.IoC_inverse>0.032 && r.IoC_inverse<0.038,'Unexpected inverse original language-like structure');
}
const known=printedLines[57];
assert.equal(known.flat().length,95);
const encrypted=average(known,'forward');
assert.deepEqual(average(encrypted,'inverse'),known,'Synthetic original p57 native_GP exact decoder failed');
const doubleCheck=average(known,'inverse');
assert.deepEqual(average(doubleCheck,'forward'),known,'Synthetic opposite orientation inverse failed');
console.log(JSON.stringify({source:'literal / scanlines of original LP2 transcription, p50 image-only',pages:58,scanlines:604,symbols:12956,method:'PNG Average predictor left+above floor/2, 8-bit semantics mapped mod29',positive:'true solved p57 95/95 exact for both paired directions',native_p57_ioc:ioc(known.flat()),original:results},null,2));
console.log('PASS: no GP-native paragraph in three original disjoint intervals; both exact native-p57 round trips');
