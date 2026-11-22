'use strict';
/**
 * Direct p50 byte-pointer lookup into all 225 red runes and 31 thirteen-dot
 * marks of the original 58 LP2 images. No fitted offsets, cipher keys or
 * linguistic postselection. Read-only, Windows Node 22.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
/** @param {string} name @returns {any} */
const json = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const ink = json('lp2-ink-annotations.json');
const grid = json('lp2-grid-256.json');
/** @typedef {{page:number,offset:number,kind:'mark'|'rune',value:string,ordinal:number}} Event */
/** @type {Event[]} */
const events = [];
for (const page of ink.pages) {
  for (const [offset, dots] of page.large_punctuation || []) {
    if (dots === 13) events.push({page:page.page, offset, kind:'mark',value:' ',ordinal:events.length});
  }
  for (const span of page.red_spans || []) {
    for (const [i,rune] of [...span.runes].entries()) {
      events.push({page:page.page, offset:span.start+i, kind:'rune', value:rune,ordinal:events.length});
    }
  }
}
events.sort((a,b)=>a.page-b.page||a.offset-b.offset
  ||(a.kind==='mark'?-1:1)||(a.ordinal-b.ordinal));
assert.equal(events.length,256);
assert.equal(events.filter(e=>e.kind==='rune').length,225);
assert.equal(events.filter(e=>e.kind==='mark').length,31);
assert.equal(grid.bytes.length,256);
assert.ok(grid.bytes.every(x=>Number.isInteger(x)&&x>=0&&x<=255));
// A table cell is one unsigned byte pointing to one complete original event.
const output = grid.bytes.map(x=>events[x].value).join('');
assert.equal([...output].length,256);
const markCount = [...output].filter(x=>x===' ').length;
const words = output.trim().split(/\s+/).map(x=>[...x].length);
assert.equal(markCount,38);
assert.equal(words.length,33);
assert.equal(Math.max(...words),47);
assert.equal([...output.slice(0,12)].join(''),'ᛠᛗᛋᚦᛒᛁᛋᚹᚢᚪᚦᚩ');
console.log('Original 256->256 source lookup: 225 red runes, 31 thirteen-dot marks.');
console.log('Nonempty output words: '+words.length+'; spaces: '+markCount+'; longest uninterrupted runes: '+Math.max(...words));
console.log('Original first 12 runes: '+output.slice(0,12));
console.log('Original first 64 source positions: '+grid.bytes.slice(0,64).join(','));
console.log('Original complete output (GP runes, spaces from thirteen-dot marks):\n'+output);
// Synthetic pointer positive: fixed, externally intelligible p57 red title.
const parable = [...'ᛈᚪᚱᚪᛒᛚᛖ'];
const titleIndex = Array.from({length:parable.length},(_,i)=>i);
assert.equal(titleIndex.map(i=>parable[i]).join(''),'ᛈᚪᚱᚪᛒᛚᛖ');
console.log('Source spelling positive: PARABLE original p57 red heading 7/7.');
console.log('Decision: direct printed-row p50 byte-indexed red-event readout is not GP-native prose. No original unknown-page plaintext or key.');
