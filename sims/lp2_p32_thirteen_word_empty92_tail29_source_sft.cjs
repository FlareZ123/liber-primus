'use strict';

/**
 * Source-led p32 six-line 71/50 and 92/29 boundaries, pointer tree read.
 *
 * Exact input: original LP2 rune transcription, physical p32 original
 * 13-dot terminal mark, authenticated 2016 signed clause, original
 * 256-cell numeric table and solved p57 GP rune controls.
 *
 * Decoder gate: p32 authentic 92/29 rune cut, final29 original runes
 * as a literal GP29 repeating key against first92. The artwork never
 * specifies this additive receiver; this is a bounded direct test.
 *
 * Read-only Windows 11 Node.js 22 CommonJS SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
/** @param {string} file */
const json = file => JSON.parse(read(file));

const gp = json('resources/liber-primus/lp2-corpus.json');
const table = json('resources/liber-primus/lp2-grid-256.json');
const ink = json('resources/liber-primus/lp2-ink-annotations.json');
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');
assert.ok(signed.includes('epiphany seeks the devoted'));
assert.ok(signed.includes('path lies empty'));

const C = gp.pages.find(p => p.page === 32).indices;
const p57 = gp.pages.find(p => p.page === 57).indices;
assert.equal(C.length, 121);
assert.equal(p57.length, 95);
const mark = ink.pages.find(p => p.page === 32).large_punctuation;
assert.ok(mark.some(([offset, n, color]) => offset === 121 && n === 13 && color === 'red'));

const runeGroups = read('resources/liber-primus/lp2-transcription.txt')
  .split('%').filter(s => /[\u16A0-\u16FF]/.test(s));
assert.equal(runeGroups.length, 57, 'p50 is rune-free');
/** @param {string} s */
const runeWords = s => s.split(/[^\u16A0-\u16FF]+/).filter(Boolean);
const pages = runeGroups.map((raw, index) => ({
  page: index < 50 ? index : index + 1,
  words: runeWords(raw.replace(/\/[\r\n]*/g, '')),
  lineChunks: runeWords(raw),
}));
const physical = pages.find(p => p.page === 32);
assert.equal(physical.words.length, 22,'line-spanning runes form 22 complete words');
assert.equal(physical.lineChunks.length, 26,
  '26 artificial fragments appear only when physical line breaks are word boundaries');
assert.equal(physical.words.flatMap(word => [...word]).length,121);
const lengths = physical.lineChunks.map(chunk => [...chunk].length);
const realWordLengths=physical.words.map(word=>[...word].length);
assert.deepEqual(realWordLengths,
  [1,3,5,11,5,5,3,11,6,9,5,8,4,9,4,8,2,3,2,8,5,4]);
const sum = values => values.reduce((a,b)=>a+b,0);
assert.equal(sum(lengths.slice(0, 13)), 71);
assert.equal(sum(lengths.slice(13)), 50);
assert.equal(pages.filter(p => p.words.length === 22).length, 1);
assert.equal(pages.filter(p => p.lineChunks.length === 26).length, 1);
assert.equal(pages.filter(p => sum(p.lineChunks.slice(0,13).map(x => [...x].length)) === 71).length, 1);

/**
 * The 13/13 line-fragment split is exactly the *visually printed* 3/3
 * six-line split. Four original words straddle a physical line break.
 * The source transcript uses / to preserve image line endings.
 */
const lineInfo=runeGroups.map((text,index)=>{
  const lines=text.split('/').filter(line=>runeWords(line).length>0);
  return {
    page:index<50?index:index+1,
    lengths:lines.map(line=>runeWords(line).join('').length),
    chunks:lines.map(line=>runeWords(line).length),
  };
});
const p32Lines=lineInfo.find(x=>x.page===32);
assert.deepEqual(p32Lines.lengths,[25,23,23,21,22,7],
  'original image six printed lines are visibly asymmetric');
assert.deepEqual(p32Lines.chunks,[5,4,4,5,6,2]);
assert.equal(sum(p32Lines.lengths.slice(0,3)),71);
assert.equal(sum(p32Lines.lengths.slice(3)),50);
assert.equal(sum(p32Lines.chunks.slice(0,3)),13);
assert.equal(sum(p32Lines.chunks.slice(3)),13);
assert.equal(sum(p32Lines.lengths.slice(0,4)),92);
assert.equal(sum(p32Lines.lengths.slice(4)),29);
assert.deepEqual(lineInfo.filter(x=>x.lengths.length===6).map(x=>x.page),[22,32]);
assert.deepEqual(lineInfo.filter(x=>x.chunks.length===6
  && sum(x.chunks.slice(0,3))===13
  && sum(x.chunks.slice(3))===13).map(x=>x.page),[32]);


// Exact GP29 terms in the authenticated signed words, encoding K as C.
/** @param {string} source */
function gp0(source) {
  const canonical = source.toUpperCase().replace(/[KQ]/g, 'C')
    .replace(/V/g, 'U').replace(/Z/g, 'S');
  const ordered = gp.translit.map((spell, i) => ({spell,i}))
    .sort((a,b)=>b.spell.length-a.spell.length);
  const out = [];
  for (let j=0; j<canonical.length;) {
    const match = ordered.find(r => canonical.startsWith(r.spell, j));
    assert.ok(match, 'signed message must have canonical GP orthography');
    out.push(match.i);
    j += match.spell.length;
  }
  return sum(out);
}
assert.equal(gp0('SEEKS'), 71);
assert.equal(gp0('EMPTY'), 92);
assert.equal(gp0('EPIPHANY'), 121);
assert.equal(gp0('THE'), 20);

// Literal original row-major, conventional base60 byte-as-next-address graph.
const f = table.pages.flatMap(p => p.bytes);
assert.equal(f.length, 256);
let tableState = 50;
const path50 = [tableState];
for (let step = 1; step <= 71; step++) {
  tableState = f[tableState];
  path50.push(tableState);
}
assert.equal(path50[5], 115, 'first visit to tree root115');
assert.equal(path50[71], 115, 'signed SEEKS71 steps from table-page50');
const alpha59 = table.alphabet.replace('f', '');
const f59 = table.pages.flatMap(p=>p.tokens).map(s =>
  alpha59.indexOf(s[0]) * 59 + alpha59.indexOf(s[1]));
let reducedState=50;
for(let j=0;j<71;j++)reducedState=f59[reducedState];
assert.equal(reducedState,189,'radix59 does not reach the 2016-selected p32 tree root');

const cycle = [0, 203, 68, 199, 47, 76, 114, 197, 115, 247, 192];
for (let j=0;j<cycle.length;j++) assert.equal(f[cycle[j]], cycle[(j+1)%cycle.length]);
const cycleNodes = new Set(cycle);
const visited = new Set(cycle);
let frontier = [115], layers = [];
for (let depth=1;depth<=20;depth++) {
  const next = [];
  for (let i=0;i<256;i++) {
    if (visited.has(i) || cycleNodes.has(i)) continue;
    if (frontier.includes(f[i])) {
      next.push(i);
      visited.add(i);
    }
  }
  layers.push(next.length);
  frontier = next;
}
assert.deepEqual(layers,[2,4,7,9,7,13,10,8,10,7,4,6,5,6,6,3,3,4,4,3]);
assert.equal(sum(layers.slice(0,13)),92);
assert.equal(sum(layers.slice(13,20)),29);
assert.equal(sum(layers),121);
const original92 = C.slice(0,92), tail29 = C.slice(92);
assert.equal(original92.length,92);
assert.equal(tail29.length,29);
assert.equal(new Set(tail29).size,20, 'tail is not a GP29 permutation');
const boundaries = lengths.reduce((arr,n)=>(arr.push((arr.at(-1)||0)+n),arr),[]);
assert.ok(boundaries.includes(92),'artificial line-fragment cut at EMPTY92');
const wholeBoundaries=realWordLengths.reduce((arr,n)=>
  (arr.push((arr.at(-1)||0)+n),arr),[]);
assert.equal(wholeBoundaries.includes(71),false,
  'visible line3 break does not end a complete original word');
assert.equal(wholeBoundaries.includes(92),false,
  'visible line4 break does not end a complete original word');

const mod = x => ((x%29)+29)%29;
const io = seq => {
  const count = Array(29).fill(0);
  seq.forEach(v => count[v]++);
  return count.reduce((a,n)=>a+n*(n-1),0)/(seq.length*(seq.length-1));
};
const tests = [];
for (const sign of [-1,+1]) {
  const P = original92.map((v,i)=>mod(v+sign*tail29[i%29]));
  for (let i=0;i<92;i++) {
    assert.equal(mod(P[i]-sign*tail29[i%29]), original92[i],
      'exact original 92 rune re-encryption');
  }
  const plant = p57.slice(0,92);
  const ciphertext = plant.map((v,i)=>mod(v-sign*tail29[i%29]));
  const recovered = ciphertext.map((v,i)=>mod(v+sign*tail29[i%29]));
  assert.deepEqual(recovered, plant, 'exact native solved p57 key plant');
  tests.push({
    sign, body92_ioc: Number(io(P).toFixed(9)),
    first32: P.slice(0,32).map(x=>gp.translit[x]).join(' '),
    complete_original_replay: true, native_GP_positive: true,
  });
}
assert.ok(tests.every(t=>t.body92_ioc<0.04));

// Original first three printed lines = 71 rune source-selected route.
// Four literal GP29 additive consumers use visited address or emitted byte.
const pointerTests=[];
for(const emission of ['visited-address','emitted-byte']) {
  for(const sign of [-1,+1]) {
    const key=Array.from({length:71},(_,i)=>
      path50[emission==='visited-address'?i:i+1]%29);
    const plain=C.slice(0,71).map((v,i)=>mod(v+sign*key[i]));
    for(let i=0;i<71;i++)assert.equal(mod(plain[i]-sign*key[i]),C[i]);
    const planted=p57.slice(0,71);
    const cipherPlant=planted.map((v,i)=>mod(v-sign*key[i]));
    assert.deepEqual(cipherPlant.map((v,i)=>mod(v+sign*key[i])),planted);
    assert.ok(io(plain)<0.04,'original source-selected first-half ciphertext stays nonprose');
    pointerTests.push({
      emission, sign, first71_ioc:Number(io(plain).toFixed(9)),
      first26:plain.slice(0,26).map(x=>gp.translit[x]).join(' '),
    });
  }
}
assert.equal(pointerTests.length,4);

console.log(JSON.stringify({
  source: 'p32 six physical lines / 22 whole words / 26 line fragments / terminal red13-dot',
  signed_gp0: {SEEKS:71, EMPTY:92, EPIPHANY:121, THE:20},
  fragment_halves13: [sum(lengths.slice(0,13)),sum(lengths.slice(13))],
  original_complete_word_count:physical.words.length,
  original_line_fragment_count:physical.lineChunks.length,
  source_line_cut_rune_indices:[25,48,71,92,114,121],
  whole_word_boundary_at_71_or_92:false,
  physical_line_lengths:p32Lines.lengths,
  physical_line_fragment_counts:p32Lines.chunks,
  unique_6_line_13_and_13_fragments:true,
  uniqueness: 'p32 alone has 26 line fragments and line3 cut71; only p32 and p22 have six physical lines',
  base60_root115_tree_depth13_nonroot:sum(layers.slice(0,13)),
  base60_root115_outer14to20:sum(layers.slice(13)),
  terminal29_unique_symbols:new Set(tail29).size,
  table50_walk71_base60_endpoint:path50.at(-1),
  table50_walk71_base59_endpoint:reducedState,
  first_three_line_pointer_key_gates:pointerTests,
  tests,
  recovered_unknown_plaintext:false,
}, null, 2));
