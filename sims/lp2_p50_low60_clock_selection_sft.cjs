'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const tx = fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');

const CH = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const pages = corpus.pages.filter((p) => p.page <= 55);
const mask = Uint8Array.from(grid.pages.flatMap((p) => p.tokens), (t) => Number(t[0] === '0'));
assert.equal(mask.reduce((a,b) => a+b, 0), 60);

function inv() {
  return {
    o: Array.from({length:9}, () => new Int32Array(256)),
    h: Array.from({length:9}, () => new Int32Array(256))
  };
}

function chapter(page) {
  const c = CH.findIndex(([a,b]) => a <= page && page <= b);
  assert.ok(c >= 0);
  return c;
}

function lengths(page, parts) {
  if (page === 50) return [];
  return parts[page < 50 ? page : page - 1]
    .split(/\/\r?\n/u)
    .map((line) => [...line].filter((r) => corpus.runes.includes(r)).length)
    .filter(Boolean);
}

const parts = tx.split(/^%$/m);
assert.equal(parts.length, 57);
const clocks = {global:inv(), page:inv(), chapter:inv(), line:inv()};
let g = 0, cg = 0, prevC = -1, totalLines = 0;

for (const page of pages) {
  const c = chapter(page.page);
  if (c !== prevC) { cg = 0; prevC = c; }
  const ls = lengths(page.page, parts);
  totalLines += ls.length;
  assert.equal(ls.reduce((a,b) => a+b, 0), page.indices.length);

  const lp = new Int32Array(page.indices.length);
  let at = 0;
  for (const n of ls) {
    for (let j = 0; j < n; j++) lp[at+j] = j;
    at += n;
  }

  for (let i = 0; i + 1 < page.indices.length; i++) {
    const phase = {global:(g+i)&255, page:i&255, chapter:(cg+i)&255, line:lp[i]&255};
    const hit = Number(page.indices[i] === page.indices[i+1]);
    for (const [name,p] of Object.entries(phase)) {
      clocks[name].o[c][p]++;
      clocks[name].h[c][p] += hit;
    }
  }
  g += page.indices.length;
  cg += page.indices.length;
}
assert.equal(g, 12956);
assert.equal(totalLines, 594);

function count(clock, chapters) {
  const x = {so:0,sh:0,uo:0,uh:0,to:0,th:0};
  for (const c of chapters) for (let p = 0; p < 256; p++) {
    const o = clock.o[c][p], h = clock.h[c][p];
    x.to += o; x.th += h;
    if (mask[p]) { x.so += o; x.sh += h; }
    else { x.uo += o; x.uh += h; }
  }
  return x;
}

function lb(h,n,p) {
  return h*Math.log(p) + (n-h)*Math.log1p(-p);
}

function fold(train, held) {
  const sp = (train.sh+.5)/(train.so+1);
  const up = (train.uh+.5)/(train.uo+1);
  const np = (train.th+.5)/(train.to+1);
  return {
    gain: lb(held.sh,held.so,sp)+lb(held.uh,held.uo,up)-lb(held.th,held.to,np),
    positive: held.sh*held.uo > held.uh*held.so
  };
}

const all = Array.from({length:9}, (_,i) => i);
function evaluate(clock) {
  const fs = [];
  for (let h = 0; h < 9; h++) {
    fs.push(fold(count(clock, all.filter((c) => c !== h)), count(clock, [h])));
  }
  return {
    source: count(clock, all),
    gain: fs.reduce((s,x) => s+x.gain, 0),
    positiveFolds: fs.filter((x) => x.positive).length,
    folds: fs.map((x) => x.gain)
  };
}

const out = Object.fromEntries(Object.entries(clocks).map(([k,v]) => [k,evaluate(v)]));
const expected = {
  global:[[3025,33,9876,53],4.5848931753101105,9],
  page:[[2934,19,9967,67],-1.0384117799082127,6],
  chapter:[[3020,20,9881,66],-0.5604708753894556,5],
  line:[[1918,16,10983,70],-0.47842866154683605,5]
};
for (const [name,[src,gain,pos]] of Object.entries(expected)) {
  const r = out[name];
  assert.deepEqual([r.source.so,r.source.sh,r.source.uo,r.source.uh], src);
  assert.equal(r.source.to, 12901);
  assert.equal(r.source.th, 86);
  assert.ok(Math.abs(r.gain-gain) < 1e-12);
  assert.equal(r.positiveFolds, pos);
}
console.log(JSON.stringify({physicalRuneLines:totalLines,result:out}, null, 2));
