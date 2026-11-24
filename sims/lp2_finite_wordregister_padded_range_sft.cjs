'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const source = fs.readFileSync('resources/liber-primus/lp2-transcription.txt','utf8');
const re = new RegExp('[' + corpus.runes.join('') + ']+','gu');
const words = source.split('%').slice(0,55).join('').replace(/[/\s]/g,'').match(re);
assert.equal(words.length,2896);
assert.equal(words.join('').length,12956);
assert.deepEqual([...words.join('')].map(r=>corpus.runes.indexOf(r)),
  corpus.pages.slice(0,56).flatMap(p=>p.indices));

/** Exact minimum over every bijection from the given word's symbols to GP29 digits.
 * Lexicographic first occurrence must receive the least unused digit.
 * @param {string} word
 * @param {boolean} minimum
 * @returns {bigint}
 */
function value(word, minimum) {
  const labels = new Map();
  let n=0n;
  for (const r of word) {
    if (!labels.has(r)) labels.set(r,labels.size);
    n=29n*n+BigInt(minimum?labels.get(r):corpus.runes.indexOf(r));
  }
  return n;
}
const pageEnds=[]; let total=0;
for(const p of corpus.pages.slice(0,56)){total+=p.indices.length;pageEnds.push(total);}
let offset=0;
const vals=words.map((word,i)=>{
  const pos=offset, page=pageEnds.findIndex(x=>x>pos);
  offset+=word.length;
  return {i,pos,page,word,canonical:value(word,false),minimum:value(word,true),
    revminimum:value([...word].reverse().join(''),true)};
});
const min=(a,b)=>a<b?a:b;
const max=vals.reduce((a,b)=>min(a.minimum,a.revminimum)>min(b.minimum,b.revminimum)?a:b);
assert.equal(max.i,1353);
assert.equal(max.pos,6035);
assert.equal(max.page,25);
assert.equal(min(max.minimum,max.revminimum),379538559069874922n);
const limits=[49n,256n,300n,2048n,3301n,100000n,1000000n,1000000000n,1n<<64n];
const table=limits.map(N=>({N:String(N),
  canonical:vals.filter(x=>x.canonical<N).length,
  adaptiveBE:vals.filter(x=>x.minimum<N).length,
  adaptiveLE:vals.filter(x=>x.revminimum<N).length,
  either:vals.filter(x=>min(x.minimum,x.revminimum)<N).length,
  oneBasedEither:vals.filter(x=>min(x.minimum,x.revminimum)<=N && (x.minimum>0n||x.revminimum>0n)).length}));
assert.deepEqual(table.map(x=>x.either),[1258,1258,1258,1766,1766,2084,2340,2711,2896]);
assert.equal(vals.filter(x=>x.canonical>=1n<<64n).length,3);
console.table(table);
console.log('Strongest adaptive-orientation lower bound:',max);
console.log('PASS: exact original-source padded register capacity');
