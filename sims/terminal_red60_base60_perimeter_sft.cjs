'use strict';

/**
 * Cross-source direct inverse: p53/p54 51+9 red GP runes (60 symbols) as
 * index-to-GP lookup for the printed base60 table digits; table's 76-cell
 * clockwise perimeter as a GP key for the exact 76 p55 ciphertext runes.
 *
 * Three frozen radix-digit interpretations, two additive signs. No fitted
 * cipher key or plaintext; positive solved-p57 source control.
 *
 * Run: node sims/terminal_red60_base60_perimeter_sft.cjs (Node 22).
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const load=name=>JSON.parse(fs.readFileSync(path.join(ROOT,name),'utf8'));
const book=load('resources/liber-primus/lp2-corpus.json');
const grid=load('resources/liber-primus/base60-grid.json');
const ink=load('resources/liber-primus/lp2-ink-annotations.json');
const page=n=>book.pages.find(p=>p.page===n).indices;
const red=page(53).slice(128,179).concat(page(54).slice(0,9));
const target=page(55);
assert.equal(red.length,60);
assert.equal(target.length,76);
assert.equal(grid.rows.length,32);
assert.equal(grid.alphabet.length,60);
assert.deepEqual(ink.pages.find(p=>p.page===53).red_spans.map(x=>x.length),[51]);
assert.deepEqual(ink.pages.find(p=>p.page===54).red_spans.map(x=>x.length),[9]);

const perimeter=[];
for(let col=0;col<8;col++)perimeter.push([0,col]);
for(let row=1;row<32;row++)perimeter.push([row,7]);
for(let col=6;col>=0;col--)perimeter.push([31,col]);
for(let row=30;row>=1;row--)perimeter.push([row,0]);
assert.equal(perimeter.length,76);
const digits=perimeter.map(([row,col])=>{
  const token=grid.rows[row][col];
  const high=grid.alphabet.indexOf(token[0]);
  const low=grid.alphabet.indexOf(token[1]);
  assert(high>=0&&low>=0);
  assert.equal(grid.byte_rows[row][col],60*high+low);
  return [high,low];
});
const keys={
  low:digits.map(([hi,lo])=>red[lo]),
  sum:digits.map(([hi,lo])=>(red[hi]+red[lo])%29),
  numeric:digits.map(([hi,lo])=>(2*red[hi]+red[lo])%29)
};
const ioc=values=>{
  const freq=Array(29).fill(0);
  for(const x of values)freq[x]++;
  return freq.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
};
const results=[];
for(const [mode,key] of Object.entries(keys))for(const sign of [-1,1]){
  const apply=(source,direction)=>source.map((c,i)=>
    (c+direction*sign*key[i]+290)%29);
  const recovered=apply(target,1);
  assert.deepEqual(apply(recovered,-1),target);
  const native=page(57).slice(0,76);
  assert.deepEqual(apply(apply(native,-1),1),native);
  results.push({mode,sign,ioc:ioc(recovered),
    prefix:recovered.slice(0,32).map(i=>book.translit[i]).join('')});
}
assert.deepEqual(results.map(x=>+x.ioc.toFixed(8)),
  [0.02947368,0.03614035,0.02947368,0.04105263,0.03192982,0.03157895]);
console.log(JSON.stringify({
  source:'p53 51 red runes + p54 9 red runes = 60; base60 table digits; 76 perimeter bytes; p55 76 runes',
  redDigitAlphabetLength:red.length,
  ringLength:perimeter.length,
  rawP55Ioc:ioc(target),
  knownNativeP57Ioc:ioc(page(57)),
  original:results,
  exactOriginalRoundtrip:'76/76 each',
  solvedP57Plant:'76/76 each',
  interpretation:'No authentic unknown plaintext; all six direct key constructions fail'
},null,2));
