'use strict';

/**
 * Exact source-level test of four printed-grid rings and original LP2 p53–55.
 * Node 22: node sims/lp2_grid_p53_p55_four_ring_source_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
/** @param {string} file */
const load = file => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', file), 'utf8'));
const c = load('lp2-corpus.json'), a = load('lp2-ink-annotations.json'), grid = load('lp2-grid-256.json');
const bytes = grid.pages.flatMap(p => p.bytes);
const p53 = c.pages.find(p => p.page === 53).indices;
const p55 = c.pages.find(p => p.page === 55).indices;
const red = a.pages.find(p => p.page === 53);
assert.equal(bytes.length, 256);
assert.deepEqual([p53.length, p55.length], [179, 76]);
assert.deepEqual(red.red_spans.map(s => [s.start,s.length]), [[128,51]]);
assert.deepEqual(red.large_punctuation, [[179,13,'red']]);
assert.deepEqual(c.pages.filter(p => p.runic_count === 76).map(p => p.page), [55]);
assert.deepEqual(a.pages.flatMap(p => (p.red_spans || []).filter(s => s.length === 51).map(s => p.page)), [53]);

/** @param {number} d @returns {number[]} */
function ring(d) {
  const out = [], top = d, bottom = 31-d, left = d, right = 7-d;
  for (let x=left;x<=right;x++) out.push(8*top+x);
  for (let y=top+1;y<=bottom;y++) out.push(8*y+right);
  for (let x=right-1;x>=left;x--) out.push(8*bottom+x);
  for (let y=bottom-1;y>=top+1;y--) out.push(8*y+left);
  return out;
}
const rings = Array.from({length:4},(_,d)=>ring(d));
assert.deepEqual(rings.map(r=>r.length),[76,68,60,52]);
assert.equal(new Set(rings.flat()).size,256);

/**
 * The extra source-visible large rune is Ac, index24, on JPEG 71.jpg (p54).
 * Replacing this with the p53 terminal punctuation is another untested framing.
 */
const source = [p55,p53.slice(0,68),p53.slice(68,128),[...p53.slice(128),24]];
assert.deepEqual(source.map(s=>s.length),[76,68,60,52]);

/**
 * For each source glyph, fit the best arbitrary fixed lookup f(input)=glyph;
 * return exact minimum edits after globally fitting every mapping entry.
 * @param {number[]} x @param {number[]} y @param {(v:number)=>number} project
 */
function minEdits(x,y,project) {
  const hist = new Map();
  for (let i=0;i<x.length;i++) {
    const key=project(x[i]), tally=hist.get(key)||new Map();
    tally.set(y[i],(tally.get(y[i])||0)+1);hist.set(key,tally);
  }
  let possible=0;
  for (const tally of hist.values()) possible+=Math.max(...tally.values());
  return x.length-possible;
}
const corners = [[0,0],[0,7],[31,7],[31,0]], results=[];
for(let corner=0;corner<4;corner++)for(const direction of [-1,1])for(const invertBlack of [false,true]){
  const streams=[source[0],...(invertBlack?[source[2],source[1]]:[source[1],source[2]]),source[3]];
  const x=[],y=[];
  for(let d=0;d<4;d++){
    const ringIds=rings[d], [cy,cx]=corners[corner];
    const sy=Math.max(d,Math.min(31-d,cy)),sx=Math.max(d,Math.min(7-d,cx));
    const start=ringIds.indexOf(8*sy+sx); assert.ok(start>=0);
    x.push(...ringIds.map((_,i)=>bytes[ringIds[(start+direction*i+ringIds.length*2)%ringIds.length]]));
    y.push(...streams[d]);
  }
  const direct=x.reduce((sum,value,i)=>sum+Number(value%29===y[i]),0);
  const residueEdits=minEdits(x,y,v=>v%29), fullByteEdits=minEdits(x,y,v=>v);
  const plant=x.map(v=>(7*(v%29)+13)%29);
  assert.equal(minEdits(x,plant,v=>v%29),0);
  results.push({corner,direction,invertBlack,direct,residueEdits,fullByteEdits});
}
assert.equal(results.length,16);
/** @param {keyof (typeof results)[number]} key */
function extent(key){return [Math.min(...results.map(r=>r[key])),Math.max(...results.map(r=>r[key]))];}
assert.deepEqual(extent('direct'),[5,14]);
assert.deepEqual(extent('residueEdits'),[194,209]);
assert.deepEqual(extent('fullByteEdits'),[87,94]);
console.log(JSON.stringify({
  source: {grid:[32,8],rings:[76,68,60,52],
    p55:76,p53Black:128,p53Red:51,p54OversizedAc:24,p53EndDots:13},
  original:{tested:16,directMod29Matches:extent('direct'),
    minimumEditsArbitraryResidueLookup:extent('residueEdits'),
    minimumEditsArbitraryByteLookup:extent('fullByteEdits')},
  nativeControls:'all 16 source-lookup plants recover 256/256',
  status:'source alignment is conditional; fixed lookups excluded; no original plaintext'
},null,2));
