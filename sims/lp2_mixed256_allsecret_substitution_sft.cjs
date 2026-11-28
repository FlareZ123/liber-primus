/**
 * Mixed p0-55 256-event clock: key-free equality invariant for ALL secret
 * segment-local GP29 bijective substitutions, not just a table mod29 shift.
 *
 * A bijection preserves equality of any two positions in its segment.
 * Source observations and native literature controls are fixed in advance.
 * Node.js 22 CommonJS, Windows-compatible read-only source SFT.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const load=p=>JSON.parse(read(p));
const corpus=load('resources/liber-primus/lp2-corpus.json');
const punct=load('resources/liber-primus/lp2-punctuation-identity.json');
const grid=load('resources/liber-primus/lp2-grid-256.json');
const {encodeSourceNativeGP}=require('./lp2_native_gp_source_orthography_sft.cjs');
const pages=corpus.pages.filter(p=>p.page<=55);
const input=pages.flatMap(p=>p.indices);
assert.equal(input.length,12956);
let global=0;
const repeats=[];
for(const p of pages){
  for(let i=1;i<p.indices.length;i++)
    if(p.indices[i]===p.indices[i-1])
      repeats.push({offset:global+i,kind:'repeat'});
  global+=p.indices.length;
}
assert.equal(repeats.length,86);
const absent=new Set([57,58,59,60,125]);
const physical=punct.events.filter(e=>!absent.has(e.index));
assert.equal(physical.length,175);
const marks=physical.filter(e=>e.symbol==='⁜'||(e.symbol==='⁘'&&e.index!==127))
  .map(e=>({offset:e.rune_offset,kind:'mark'}));
assert.equal(marks.length,170);
const events=[...marks,...repeats].sort((a,b)=>
  a.offset-b.offset||a.kind.localeCompare(b.kind));
assert.equal(events.length,256);
assert.equal(grid.bytes.length,256);
const segments=[];
let prev=0;
for(const e of events){segments.push({start:prev,end:e.offset});prev=e.offset;}
assert.equal(prev,12956);
assert.equal(segments.filter(s=>s.end===s.start).length,4);
const pairs=segments.reduce((v,s)=>v+(s.end-s.start)*(s.end-s.start-1)/2,0);
assert.equal(pairs,604532);

/** Key-free within-segment equality-pair count. */
function collision(x){
  assert.equal(x.length,input.length);
  let hits=0;
  for(const s of segments){
    const hist=new Uint16Array(29);
    for(let j=s.start;j<s.end;j++)hist[x[j]]++;
    for(const n of hist)hits+=n*(n-1)/2;
  }
  return {hits, pairs, rate:hits/pairs};
}
const actual=collision(input);
assert.equal(actual.hits,20365);
assert.ok(Math.abs(actual.rate-0.03368721589593272)<1e-14);

// A separate archive of actual solved Cicada GP29 words guards against
// calibrating this contrast on only three outside literary registers.
const solved=load('resources/external/relikd-solved-gp29-native-v1.json')
  .sections.flatMap(p=>Array.from(p.source_text)
    .map(glyph=>corpus.runes.indexOf(glyph)).filter(i=>i>=0));
assert.equal(solved.length,2979);
const cyclicControl=(shift)=>Array.from({length:input.length},
  (_,j)=>solved[(j+shift)%solved.length]);
const offsets=[0,193,971,1541,2043,2500];
const solvedControls=offsets.map(shift=>({shift,...collision(cyclicControl(shift))}));
assert.ok(solvedControls.every(c=>c.rate>=0.06));

const corpusPaths=[
  ['Shakespeare','resources/control/shakespeare_first300k.txt',32],
  ['Gibran','resources/control/gibran_prophet_58585.txt',8],
  ['Emerson','resources/control/emerson_essays_2944.txt',48]
];
const results=[];
let controlMinimum=Infinity,totalWindows=0;
let plant=null;
for(const [name,p,expected] of corpusPaths){
  const source=encodeSourceNativeGP(read(p));
  const windowScores=[];
  const step=Math.floor(input.length/2);
  for(let start=0;start+input.length<=source.length;start+=step){
    const window=source.slice(start,start+input.length);
    if(plant===null)plant=window;
    const score=collision(window);
    windowScores.push(score.rate);
    controlMinimum=Math.min(controlMinimum,score.rate);
    assert.ok(score.rate>actual.rate,name+' matched window');
  }
  assert.equal(windowScores.length,expected,name+' window inventory');
  totalWindows+=windowScores.length;
  results.push({name,windows:windowScores.length,
    min:Math.min(...windowScores),max:Math.max(...windowScores)});
}
assert.equal(totalWindows,88);
assert.ok(controlMinimum>0.0575);

/**
 * Every possible segment-local monoalphabetic GP29 cipher preserves all
 * 604,532 equality comparisons. A deterministic changing 29-way affine
 * substitution is a useful positive plant; its 256 secret alphabets need
 * not share any recognizable p50 byte operation.
 */
const affine=plant.slice();
for(let i=0;i<segments.length;i++){
  const a=1+(i%28),b=(7*i+11)%29;
  for(let j=segments[i].start;j<segments[i].end;j++)
    affine[j]=(a*plant[j]+b)%29;
}
assert.deepEqual(collision(affine),collision(plant));
assert.ok(collision(affine).rate>actual.rate);
console.log(JSON.stringify({
  classification:'all-secret fixed-event segment-bijection exclusion, no plaintext',
  source:{runes:input.length,segments:segments.length,
    empty:segments.filter(s=>s.end===s.start).length,
    repeats:repeats.length,printed_marks:marks.length},
  original:actual,
  original_versus_all88_native:{
    min_reference:controlMinimum,max_original:actual.rate,
    total_windows:totalWindows,registers:results
  },
  solved_source:{runes:solved.length,controls:solvedControls},
  positive_affine_plant:{passes:true,rate:collision(affine).rate}
},null,2));
