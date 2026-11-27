'use strict';
/** Generate the two source tapes for lp2_p8_14_hill7_full_projection_sft.cpp. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = p => JSON.parse(fs.readFileSync(path.join(__dirname, '..', p), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const solved = read('resources/external/relikd-solved-gp29-native-v1.json');
const original = corpus.pages.slice(8,15).flatMap(p => p.indices);
const native = solved.sections.flatMap(s => [...s.source_text].map(r => corpus.runes.indexOf(r)).filter(i => i >= 0)).slice(0,1729);
function tape(a, sum, weighted) {
  assert.equal(a.length,1729);
  assert.equal(a.reduce((s,x)=>s+x,0),sum);
  assert.equal(a.reduce((s,x,i)=>s+x*(i+1),0),weighted);
  return a.map(x => x.toString(36)).join('');
}
process.stdout.write(tape(original,24182,20996876)+'\n'+tape(native,21510,18789294)+'\n');
