'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const pages = fs.readFileSync('resources/liber-primus/lp2-transcription.txt','utf8').split('%');
/** @param {string} s @returns {number[][]} */
function units(s) {
  return s.replace(/[\n/]/g,'').split(/[.&$]/).map(x => x.split('-').map(w => [...w].filter(ch => corpus.runes.includes(ch)).length).filter(Boolean)).filter(x => x.length);
}
const rows = [[7,7,'last'],[23,23,'first'],[56,55,'last']].map(([page,idx,side]) => {
  const v = units(pages[idx]);
  assert.equal(v.flat().reduce((a,b)=>a+b,0),corpus.pages[page].runic_count);
  const unit = side === 'last' ? v.at(-1) : v[0];
  return {page,side,unit,words:unit.length,runes:unit.reduce((a,b)=>a+b,0)};
});
assert.deepEqual(rows.map(r=>r.unit),[[3,2,3],[2,6,3,5],[2,2,2,4,2,5,7,2,4,3,3,4]]);
assert.equal(new Set(rows.map(r=>r.words)).size,3);
console.log(JSON.stringify(rows,null,2));
