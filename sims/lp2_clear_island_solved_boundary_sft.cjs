'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const native = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const gp = native.runes;
assert.deepEqual(gp, corpus.runes);
const flat = s => Array.from(s).filter(c=>gp.includes(c)).map(c=>gp.indexOf(c));
const glyph = a => a.map(n=>gp[n]).join('');
const blocks = read('resources/transcriptions/lp1_wulfic_canonical.txt').split('$').filter(x=>flat(x).length);
const src = blocks.map(flat);
src.push(corpus.pages[56].indices, corpus.pages[57].indices);
assert.equal(src.length,9);
const expected = [[184,2,1],[515,11,2],[157,157,157],[778,34,1],[755,755,755],[319,100,1],[89,89,89],[85,4,1],[95,95,95]];
for(let i=0;i<src.length;i++){
  const c=src[i];
  // Native external koan transcription has two extra glyphs. The known
  // shifted-reflection decoder provides the exact-position control instead.
  const p=i===3?c.map(x=>(31-x)%29):flat(native.sections[i].source_text);
  assert.equal(c.length,p.length);
  let equal=0, longest=0, run=0;
  for(let k=0;k<c.length;k++){
    if(c[k]===p[k]){equal++;run++;longest=Math.max(longest,run);}else run=0;
  }
  const actual=[c.length,equal,longest];
  assert.deepEqual(actual,expected[i]);
  console.log(native.sections[i].name, actual);
}
const sub = i => blocks[i].split('&').filter(x=>flat(x).length);
const controls=[sub(3).at(-1),sub(4).at(-1),sub(6)[0]];
const plainTitle=flat('ᚪᚾᛁᚾᛋᛏᚱᚢᚳᛏᛡᚾ');
for(let i=0;i<controls.length;i++){
  const raw=flat(controls[i].split('.')[0]);
  const decoded=i===0?raw.map(x=>(31-x)%29):raw;
  assert.deepEqual(decoded,plainTitle);
  assert.equal(flat(controls[i]).length,[38,40,82][i]);
  console.log('AN INSTRUCTION', [9,13,16][i],glyph(raw),glyph(decoded),'body length',flat(controls[i]).length-raw.length);
}
const captions=[sub(2).at(-1),sub(6).at(-1)];
for(const cap of captions)assert.equal(glyph(flat(cap.split('.')[0])),'ᚳᚾᚩᚹᚦᛁᛋ');
const p15=corpus.pages[15].indices.slice(0,9);
assert.deepEqual(p15,[0,1,20,19,24,28,26,22,24]);
assert.notDeepEqual(p15,flat('ᚳᚾᚩᚹᚦᛁᛋ'));
console.log('LP2 p15 above decimal square:',glyph(p15),p15.map(i=>corpus.translit[i]).join(' '));
console.log('PASS: matched solved source boundary counterexamples; no inferred clear unknown plaintext');
