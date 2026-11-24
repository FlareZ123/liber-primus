'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} p */
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const frozen = JSON.parse(read('im-results/lp2-p49-typed-field-template-freeze-agent48.json'));
const native = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
/** @param {string} s */
const runes = s => [...s].filter(x => corpus.runes.includes(x)).join('');
/** @param {string} s */
const widths = s => (s.match(/[\u16a0-\u16ea]+/gu) || []).map(w=>w.length);
/** @param {number[]} w */
const sum = w => w.reduce((a,b)=>a+b,0);
/** @param {number[]} a @param {number[]} b */
const equal = (a,b) => a.length===b.length && a.every((x,i)=>x===b[i]);
const pages = read('resources/liber-primus/lp2-transcription.txt').split('%').filter(s=>runes(s));
const target = corpus.pages[49].indices.map(i=>corpus.runes[i]).join('');
const k = pages.findIndex(p=>runes(p)===target);
assert.equal(k,49);
assert.equal(runes(pages[k-1]),corpus.pages[48].indices.map(i=>corpus.runes[i]).join(''));
assert.equal(runes(pages[k]).length,66);
const pre = (pages[k-1]+pages[k]).replace(/[/%\s]/g,'');
const end = pre.lastIndexOf('.');
const start = pre.lastIndexOf('.',end-1);
const clause = pre.slice(start+1,end);
const w = widths(clause);
assert.equal(sum(w),138);
assert.equal(w.length,33);
assert.deepEqual(w.slice(-5),[4,6,5,2,6]);
for (const c of frozen.candidates) assert.deepEqual(widths(c.runes),c.widths);
const p56 = native.sections.find(s=>s.name==='p56_an_end').source_text.split('\n')[1];
const lp1 = native.sections.filter(s=>['0_wisdom','jpg229'].includes(s.name));
assert.equal(p56,frozen.candidates[0].runes);
for (const s of lp1) assert(s.source_text.split('\n').includes(frozen.candidates[1].runes));
assert(equal(widths(p56),frozen.candidates[0].widths));
console.log('Source-native positive controls: p56 and both LP1 table introductions');
console.log('Pre-field clause', {runes:sum(w),words:w.length,widths:w});
let eligible = 0;
for (const c of frozen.candidates) {
  const observed = w.slice(-c.widths.length);
  const match = equal(observed,c.widths);
  if(match && sum(c.widths)>=26) eligible++;
  console.log({id:c.id,n:sum(c.widths),expected:c.widths,observed,match});
}
assert.equal(eligible,0);
console.log('PASS: no boundary-compatible, sufficiently long source crib. No key fit performed.');


/* Robust terminal check: allow every chart-token segmentation of the
 * exact source Latin spelling, including NG/ING and IA/IO aliases.
 * This is a superset of the fixed native/greedy representations. */
const tokens = ['F','U','V','TH','O','R','C','K','G','W','H','N','I','J','EO','P','X','S','Z','T','B','E','M','L','NG','ING','OE','D','A','AE','Y','IA','IO','EA'];
/** @param {string} word */
function possibleWidths(word) {
  const states = Array.from({length:word.length+1},()=>new Set());
  states[0].add(0);
  for(let i=0;i<word.length;i++) {
    for(const t of tokens) if(word.startsWith(t,i)) {
      for(const n of states[i]) states[i+t.length].add(n+1);
    }
  }
  return [...states[word.length]].sort((a,b)=>a-b);
}
const possible = frozen.candidates.map(c => {
  const terminal = c.text.toUpperCase().match(/[A-Z]+/g).at(-1);
  const widths = possibleWidths(terminal);
  assert(!widths.includes(w.at(-1)));
  return {id:c.id,terminal,widths};
});
assert.deepEqual(possible.map(x=>x.widths),[[2],[3,4],[4],[8,9]]);
console.log('All chart segmentations of fixed source spelling:',possible);
