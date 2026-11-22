/**
 * Tests a concrete, previously unmodeled word-boundary key-consumption variant:
 * C = P +/- K_j (mod 29), K from LP2 256-byte base60 grid, 0..2 collision skips,
 * plus OPTIONAL one unconditional extra key advance precisely at word separators.
 * The extra step is penalized by log((1-p)/p), p=0.42. Neither the rune nor the
 * English plaintext is inserted: the key stream alone advances.
 *
 * Replay: node sims/grid_boundary_advance.cjs
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encode, train, solve} = require('./grid_keyskip_viterbi.cjs');
const ROOT = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const mod = n => ((n % 29) + 29) % 29;
const edgePenalty = -Math.log(0.42 / 0.58);

function xorshift(seed) {
  let value = seed >>> 0;
  return () => {
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    return (value >>> 0) / 4294967296;
  };
}

/**
 * The corpus strips layout, so derive word edges from the source transcription
 * before applying DP. Checks byte-for-byte against the exact numeric corpus.
 */
function boundaries(corpus, text) {
  const abc = new Map(corpus.runes.map((v, i) => [v, i]));
  const segments = text.split('%');
  assert.equal(segments.length, 57);
  const out = new Map();
  for (let i = 0; i < 55; i++) {
    const page = i < 50 ? i : i + 1;
    const segment = segments[i];
    const b = [], nums = [];
    let gap = '';
    for (const ch of segment) {
      if (abc.has(ch)) {
        b.push(b.length > 0 && /[-.&$]/.test(gap));
        nums.push(abc.get(ch));
        gap = '';
      } else gap += ch;
    }
    assert.deepEqual(nums, corpus.pages[page].indices, 'Source page mismatch ' + page);
    out.set(page, b);
  }
  return out;
}

/** Known GP plant with independent 42%-chance key advancement at each word edge. */
function syntheticPlant(plaintext, wordStart, key, start, seed, edgeRate = 0.42) {
  const random = xorshift(seed);
  const cipher = [];
  let j = start, previous = -1, extra = 0, collisions = 0;
  for (let i = 0; i < plaintext.length; i++) {
    if (wordStart[i] && random() < edgeRate) {
      j = (j + 1) & 255;
      extra++;
    }
    const p = plaintext[i];
    let c = mod(p + key[j]), tries = 0;
    while (previous !== -1 && c === previous && tries < 2 && random() < 0.82) {
      j = (j + 1) & 255;
      c = mod(p + key[j]);
      tries++; collisions++;
    }
    cipher.push(c);
    previous = c;
    j = (j + 1) & 255;
  }
  return {cipher, extra, collisions, start, seed};
}

function main() {
  const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
  const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
  const key = grid.byte_rows.flat().map(v => v % 29);
  const boundary = boundaries(corpus, read('resources/lp2-transcription.txt'));
  const model = train(read('resources/control/shakespeare_first300k.txt'));
  const solved = read('resources/liber-primus/lp1-plaintext-reference.txt');
  const first = solved.indexOf('BELIEVE NOTHING'), last = solved.indexOf('### 3');
  const englishWords = solved.slice(first, last).toUpperCase().match(/[A-Z]+/g);
  const pt = [], edges = [];
  for (let i = 0; i < englishWords.length; i++) {
    const w = encode(englishWords[i]);
    for (let j = 0; j < w.length; j++) {
      pt.push(w[j]); edges.push(j === 0 && i > 0);
    }
  }
  assert.ok(pt.length > 100);
  const plant = syntheticPlant(pt, edges, key, 37, 0x33014321);
  assert.ok(plant.extra >= 4, 'No planted word-boundary advances');
  const correct = solve(plant.cipher, key, -1, model, 3, 3.5, edges, edgePenalty);
  const matches = correct.plaintext.filter((v,i)=>v===pt[i]).length;
  console.log(JSON.stringify({kind:'positive',n:pt.length,words:englishWords.length,extra:plant.extra,collisionSkips:plant.collisions,start:plant.start,recovered:matches,rate:matches/pt.length,inferredStart:correct.start,inferredSkips:correct.skips,score:correct.perRune}));

  const testedPages = corpus.pages.filter(p=>p.page<=55&&p.indices.length>0);
  assert.equal(testedPages.length, 55);
  const focused=[0,20,49,51,55];
  const scores=[];
  for (const p of testedPages) {
    let best = null;
    for (const reverse of [false,true]) {
      const k=reverse?key.slice().reverse():key;
      for (const sign of [-1,1]) {
        const test = solve(p.indices,k,sign,model,3,3.5,boundary.get(p.page),edgePenalty);
        if (!best || test.perRune > best.perRune) best={sign,reverse,perRune:test.perRune,offset:test.start,skips:test.skips,head:test.plaintext.slice(0,50).map(v=>corpus.translit[v] || '?').join('')};
      }
    }
    scores.push({page:p.page,n:p.indices.length,best});
  }
  scores.sort((a,b)=>b.best.perRune-a.best.perRune);
  console.log(JSON.stringify({kind:'allPages',best10:scores.slice(0,10),focus:focused.map(id=>scores.find(x=>x.page===id))}));

  const random = xorshift(0x3301d001), replicas=60;
  for (const page of [0,20,49,51]) {
    const trueScore=scores.find(x=>x.page===page).best.perRune;
    const p=corpus.pages[page], nullScores=[];
    for(let k=0;k<replicas;k++){
      const shuffled=key.slice();
      for(let j=shuffled.length-1;j>0;j--){
        const i=Math.floor(random()*(j+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
      }
      let score=-Infinity;
      for(const reverse of [false,true])for(const sign of [-1,1]){
        const keyTest=reverse?shuffled.slice().reverse():shuffled;
        score=Math.max(score,solve(p.indices,keyTest,sign,model,3,3.5,boundary.get(page),edgePenalty).perRune);
      }
      nullScores.push(score);
    }
    const mean=nullScores.reduce((x,y)=>x+y,0)/replicas;
    const sd=Math.sqrt(nullScores.reduce((x,y)=>x+(y-mean)**2,0)/(replicas-1));
    console.log(JSON.stringify({kind:'keyPermutationNull',page,score:trueScore,mean,sd,empiricalP:(1+nullScores.filter(x=>x>=trueScore).length)/(replicas+1),replicas}));
  }
}
if(require.main===module)main();
module.exports={boundaries,syntheticPlant};
