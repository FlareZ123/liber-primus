'use strict';
/**
 * Source-fixed p40/p53 red checksum, exact chapter-conditioned null,
 * and literal p40 eight-column numerical-table readouts.
 * Node.js CommonJS, standalone from repository root, no third-party libraries.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const load = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = load('lp2-corpus.json');
const ink = load('lp2-ink-annotations.json');
const grid = load('base60-grid.json');
const prime = corpus.prime;
const chapters = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const chapterOf = p => chapters.findIndex(([lo,hi]) => lo <= p && p <= hi);
const mod29 = n => ((n % 29) + 29) % 29;
const residues = a => ({
  ordinalSum: a.reduce((sum,x) => sum+x, 0),
  primeSum: a.reduce((sum,x) => sum+prime[x], 0),
  ord: mod29(a.reduce((sum,x) => sum+x, 0)),
  prime: mod29(a.reduce((sum,x) => sum+prime[x], 0))
});
const spans = [];
for (const p of ink.pages) for (const s of p.red_spans || []) {
  if (p.page > 55) continue;
  const indices = corpus.pages[p.page].indices.slice(s.start,s.start+s.length);
  assert.equal(indices.length,s.length);
  assert.deepEqual([...s.runes].map(g=>corpus.runes.indexOf(g)),indices);
  spans.push({page:p.page,start:s.start,length:s.length,indices,...residues(indices)});
}
assert.equal(spans.length,16);
assert.equal(spans.reduce((a,b)=>a+b.length,0),213);
const get=(p,start) => spans.find(s=>s.page===p&&s.start===start);
const x15=get(15,0),x40=get(40,0),x53=get(53,128);
assert.deepEqual([x15.length,x15.ordinalSum,x15.primeSum],[9,164,638]);
assert.deepEqual([x40.length,x40.ordinalSum,x40.primeSum],[8,116,435]);
assert.deepEqual(x40.indices,[0,9,19,26,6,23,25,8]);
assert.deepEqual([x53.length,x53.ordinalSum,x53.primeSum],[51,634,2262]);
assert.deepEqual(spans.filter(s=>s.prime===0).map(s=>s.page),[15,40,53]);
assert.equal(prime[x53.indices.at(-1)],29);
const all=corpus.pages.slice(0,56).flatMap(p=>p.indices);
assert.equal(all.length,12956);
const matches=[];
for(let i=0;i<=all.length-8;i++){
 const q=residues(all.slice(i,i+8));
 if(q.ord===0&&q.prime===0)matches.push(i);
}
assert.deepEqual(matches,[1103,4725,5692,5712,8621,9640,10930,12882]);
const frequencies=chapters.map(([lo,hi])=>{
 const a=corpus.pages.slice(lo,hi+1).flatMap(p=>p.indices);
 const f=Array(29).fill(0);
 for(const x of a)f[x]++;
 return f.map(n=>n/a.length);
});
function primeZero(freq,length) {
 let dp=new Float64Array(29);dp[0]=1;
 for(let i=0;i<length;i++){
  const next=new Float64Array(29);
  for(let x=0;x<29;x++)for(let k=0;k<29;k++)
   next[(x+prime[k])%29]+=dp[x]*freq[k];
  dp=next;
 }
 return dp[0];
}
let poisson=[1],expected=0;
for(const s of spans){
 const p=primeZero(frequencies[chapterOf(s.page)],s.length);
 expected+=p;
 const next=Array(poisson.length+1).fill(0);
 for(let i=0;i<poisson.length;i++){
  next[i]+=poisson[i]*(1-p);
  next[i+1]+=poisson[i]*p;
 }
 poisson=next;
}
const pThreeOrMore=poisson.slice(3).reduce((a,b)=>a+b,0);
let dp=new Float64Array(841);dp[0]=1;
for(let i=0;i<8;i++){
 const next=new Float64Array(841);
 for(let a=0;a<29;a++)for(let b=0;b<29;b++){
  const base=dp[a*29+b];
  for(let k=0;k<29;k++)
   next[((a+k)%29)*29+(b+prime[k])%29]+=base*frequencies[7][k];
 }
 dp=next;
}
const pDual8=dp[0],pPrime51=primeZero(frequencies[7],51);
assert.ok(Math.abs(expected-0.5528885054018242)<1e-9);
assert.ok(Math.abs(pThreeOrMore-0.01648620737643442)<1e-9);
assert.ok(Math.abs(pDual8-0.0009292003844221167)<1e-9);
assert.ok(Math.abs(pPrime51-1/29)<1e-9);
assert.equal(grid.byte_rows.length,32);
assert.ok(grid.byte_rows.every(row=>row.length===8));
const toHex=bytes=>bytes.map(x=>x.toString(16).padStart(2,'0')).join('');
const tableRead=(symbols,row)=>toHex(symbols.map((x,col)=>grid.byte_rows[row(x)][col]));
const original={
 p40Zero:tableRead(x40.indices,x=>x),
 p40One:tableRead(x40.indices,x=>x+1),
 p40PrimeMod32:tableRead(x40.indices,x=>prime[x]%32),
 p33Zero:tableRead(get(33,91).indices,x=>x)
};
assert.deepEqual(original,{
 p40Zero:'cb4f0e3d56c07f6c',
 p40One:'5c3ac03b6a73fb52',
 p40PrimeMod32:'79ea9245f54cc721',
 p33Zero:'f0ca48c1616ba7ce'
});
// Source-visible chapter 3008=32*94 and 32x8 table: finite additive trial.
const full=corpus.pages.slice(40,54).flatMap(p=>p.indices);
assert.equal(full.length,3008);
function ioc(seq) {
 const f=Array(29).fill(0);
 for(const x of seq)f[x]++;
 return f.reduce((sum,count)=>sum+count*(count-1),0)/(seq.length*(seq.length-1));
}
const originalIoC=ioc(full);
assert.ok(Math.abs(originalIoC-0.0345426274862201)<1e-12);
const readings=[];
for(const orientation of ['rows','interleave'])for(const sign of [-1,1]) {
 const transformed=full.map((value,i)=>{
  const row=orientation==='rows'?Math.floor(i/94):i%32;
  const col=orientation==='rows'?(i%94)%8:Math.floor(i/32)%8;
  const k=grid.byte_rows[row][col]%29;
  return mod29(value+sign*k);
 });
 // Every raw original symbol is recovered by the inverse; seeded native-GP
 // positive plant is checked using a second exact source-independent sample.
 const reciphered=transformed.map((value,i)=>{
  const row=orientation==='rows'?Math.floor(i/94):i%32;
  const col=orientation==='rows'?(i%94)%8:Math.floor(i/32)%8;
  return mod29(value-sign*(grid.byte_rows[row][col]%29));
 });
 assert.deepEqual(reciphered,full);
 // Native GP29 plant taken only from independently solved plaintext p57.
 const native=Array.from({length:full.length},(_,i)=>corpus.pages[57].indices[i%corpus.pages[57].indices.length]);
 const enc=native.map((value,i)=>{
  const row=orientation==='rows'?Math.floor(i/94):i%32;
  const col=orientation==='rows'?(i%94)%8:Math.floor(i/32)%8;
  return mod29(value-sign*(grid.byte_rows[row][col]%29));
 });
 const dec=enc.map((value,i)=>{
  const row=orientation==='rows'?Math.floor(i/94):i%32;
  const col=orientation==='rows'?(i%94)%8:Math.floor(i/32)%8;
  return mod29(value+sign*(grid.byte_rows[row][col]%29));
 });
 assert.deepEqual(dec,native);
 readings.push({orientation,sign,ioc:ioc(transformed),
  prefix:transformed.slice(0,20).map(x=>corpus.translit[x]).join('')});
}
assert.ok(Math.abs(readings[0].ioc-0.034416370667025166)<1e-12);
assert.ok(Math.abs(readings[1].ioc-0.034543954177840355)<1e-12);
assert.ok(Math.abs(readings[2].ioc-0.03453665737392892)<1e-12);
assert.ok(Math.abs(readings[3].ioc-0.03443494434970883)<1e-12);

console.log('PASS original red source, all 8-window GP29 checks, exact chapter-conditioned null and printed 32x8 table readouts');
console.log(JSON.stringify({redZero:spans.filter(s=>s.prime===0).map(s=>[s.page,s.length,s.ordinalSum,s.primeSum]),matches,pThreeOrMore,pDual8,pPrime51,pJoint:pDual8*pPrime51,gridReadouts:original,originalIoC,readings},null,2));