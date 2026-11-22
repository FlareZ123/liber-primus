'use strict';
/**
 * Original-source all-secret GP29 predecessor-exclusion rank capacity.
 *
 * A fixed ordered alphabet of q rune labels yields q-1 available labels
 * after the previous ciphertext rune is excluded. The decoded digit is the
 * current rune's ordinal among those remaining q-1 labels.
 *
 * The unknown ordering may change independently on each original page;
 * a different secret bijection of decoded digits to plaintext symbols is
 * allowed on every page. No unknown key or language score is optimized.
 *
 * Run from any directory: node sims/lp2_no_repeat_allorder_page_capacity_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} filePath @returns {string} */
function read(filePath) {
  return fs.readFileSync(path.join(ROOT, filePath), 'utf8');
}
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const PAGES = corpus.pages.filter((p) => p.page >= 0 && p.page <= 55);
const Q = corpus.runes.length;
const E = corpus.translit.indexOf('E');
assert.equal(Q, 29);
assert.equal(E, 18);

/**
 * @param {Array<{page:number,indices:number[]}>} pages
 * @param {number} q
 * @returns {{matrix:number[][], transitions:number, equal:number}}
 */
function matrix(pages, q = Q) {
  const T = Array.from({length:q}, () => Array(q).fill(0));
  let transitions = 0;
  let equal = 0;
  for (const p of pages) {
    for (let i = 1; i < p.indices.length; i++) {
      const a = p.indices[i - 1];
      const b = p.indices[i];
      if (a === b) {
        equal++;
        continue;
      }
      T[a][b]++;
      transitions++;
    }
  }
  return {matrix:T, transitions, equal};
}

/**
 * For any rank r in any secret q-rune global ordering, exactly two
 * adjacent glyphs a,b can emit that rank. The previous symbol s chooses
 * which of these two outputs is legal. Positioning s on the more favorable
 * side of adjacent a,b attains max(T[s,a],T[s,b]). The two mutual
 * transitions T[a,b], T[b,a] always contribute.
 *
 * The largest rank-bin size over all q! unknown orderings and all ranks
 * is thus exactly max over unordered (a,b) of the displayed finite sum.
 *
 * @param {number[][]} T
 * @returns {{max:number,a:number,b:number,order:number[]}}
 */
function capacity(T) {
  const q = T.length;
  let best = {max:-1, a:-1, b:-1, order:[]};
  for (let a = 0; a < q; a++) {
    for (let b = a + 1; b < q; b++) {
      const before = [];
      const after = [];
      let total = T[a][b] + T[b][a];
      for (let s = 0; s < q; s++) {
        if (s === a || s === b) continue;
        if (T[s][b] >= T[s][a]) {
          total += T[s][b];
          before.push(s);
        } else {
          total += T[s][a];
          after.push(s);
        }
      }
      if (total > best.max) {
        best = {max:total, a, b, order:[...before,a,b,...after]};
      }
    }
  }
  return best;
}

/**
 * @param {number[]} order
 * @returns {number[]}
 */
function positions(order) {
  const pos = Array(order.length);
  order.forEach((rune, i) => {pos[rune] = i;});
  assert.deepEqual([...pos].sort((a,b)=>a-b),
    Array.from({length:order.length}, (_,i)=>i));
  return pos;
}

/** @param {number} before @param {number} current @param {number[]} pos */
function digit(before, current, pos) {
  assert.notEqual(before, current);
  return pos[current] - Number(pos[before] < pos[current]);
}

/**
 * @param {number} previous
 * @param {number} rank
 * @param {number[]} order
 * @param {number[]} pos
 */
function nextRune(previous, rank, order, pos) {
  const actual = rank + Number(rank >= pos[previous]);
  return order[actual];
}

// A small exhaustive oracle validates the all-orders theorem, independent
// of its 29-letter original input.
const toy = [
  [0,3,5,2,8],
  [4,0,1,7,2],
  [9,6,0,3,4],
  [2,8,5,0,7],
  [1,4,9,6,0]
];
let brute = 0;
/** @param {number[]} prefix @param {number[]} remain */
function oracle(prefix, remain) {
  if (remain.length === 0) {
    const pos = positions(prefix);
    const hist = Array(4).fill(0);
    for (let s = 0; s < 5; s++) {
      for (let c = 0; c < 5; c++) {
        if (c !== s) hist[digit(s,c,pos)] += toy[s][c];
      }
    }
    brute = Math.max(brute, ...hist);
    return;
  }
  for (let i = 0; i < remain.length; i++) {
    oracle([...prefix,remain[i]],
      [...remain.slice(0,i),...remain.slice(i+1)]);
  }
}
oracle([], [0,1,2,3,4]);
assert.equal(capacity(toy).max, brute);

const totalRunes = PAGES.reduce((s,p)=>s+p.indices.length,0);
const whole = matrix(PAGES);
assert.equal(PAGES.length,56);
assert.equal(PAGES.filter(p=>p.indices.length>0).length,55);
assert.equal(totalRunes,12956);
assert.equal(whole.equal,86);
assert.equal(whole.transitions,12815);

const global = capacity(whole.matrix);
assert.equal(global.max,574);
assert.deepEqual([global.a,global.b],[22,24]);
const pos = positions(global.order);
const hist = Array(28).fill(0);
for (let s=0;s<29;s++) for (let c=0;c<29;c++) {
  if (s!==c) hist[digit(s,c,pos)] += whole.matrix[s][c];
}
assert.equal(hist.reduce((a,b)=>a+b,0),whole.transitions);
assert.equal(Math.max(...hist),global.max);

const chapterCuts = [[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]];
const chapters = chapterCuts.map(([start,end]) => ({
  start, end, ...matrix(PAGES.filter(p=>p.page>=start&&p.page<=end))
})).map(x=>({start:x.start,end:x.end,
  transitions:x.transitions, maximum:capacity(x.matrix).max}));
assert.deepEqual(chapters.map(x=>x.maximum),
  [53,77,102,111,64,86,99,158,28]);
assert.equal(chapters.reduce((s,x)=>s+x.maximum,0),778);

const perPage = PAGES.filter(p=>p.indices.length>0).map(p=>({
  page:p.page, max:capacity(matrix([p]).matrix).max
}));
const perPageMax = perPage.reduce((s,x)=>s+x.max,0);
assert.equal(perPageMax,1292);

// The excluded positions are completely free. The cipher receives every
// physical page's initial rune as a seed and every repeated output as an
// erasure, including occurrences at real printed-word boundaries.
const excluded=[];
for (const p of PAGES) for (let i=0;i<p.indices.length;i++) {
  if(i===0 || p.indices[i]===p.indices[i-1]) {
    excluded.push(PAGES.filter(t=>t.page<p.page)
      .reduce((s,t)=>s+t.indices.length,0)+i);
  }
}
assert.equal(excluded.length,141);
assert.equal(whole.transitions+excluded.length,totalRunes);

// Reuse exactly the historical project GP tokenizer, not a new cipher
// alphabet or word segmentation. Longest token wins.
const tokens=corpus.translit.map((token,index)=>({token,index}))
  .sort((a,b)=>b.token.length-a.token.length);
/** @param {string} source @returns {number[]} */
function gp(source) {
  const words=source.toUpperCase().replace(/QU/g,'CW')
    .replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S')
    .match(/[A-Z]+/g) || [];
  const out=[];
  for (const word of words) {
    for(let i=0;i<word.length;) {
      const match=tokens.find(x=>word.startsWith(x.token,i));
      assert(match,'Unsupported control text token');
      out.push(match.index);
      i+=match.token.length;
    }
  }
  return out;
}

/**
 * Evaluate all native GP English windows of the same complete 12956-rune
 * length. Count E on precisely the 12815 original source positions where
 * an adaptive rank is decoded, and grant the other 141 arbitrary symbols.
 * 
 * @param {number[]} data
 * @returns {{min:number,at:number,excludedE:number,fullE:number}}
 */
function nativeMinimum(data) {
  const indicator=Uint8Array.from(data,x=>Number(x===E));
  assert(indicator.length>=totalRunes);
  let full=0;
  for(let i=0;i<totalRunes;i++) full+=indicator[i];
  let min=Infinity,at=-1,freeE=0,fullE=0;
  for(let k=0;k<=indicator.length-totalRunes;k++) {
    if(k>0) full+=indicator[k+totalRunes-1]-indicator[k-1];
    let free=0;
    for(let j=0;j<excluded.length;j++) free+=indicator[k+excluded[j]];
    const contentE=full-free;
    if(contentE<min) {
      min=contentE;
      at=k;
      freeE=free;
      fullE=full;
    }
  }
  return {min,at,excludedE:freeE,fullE};
}

const controls=[
  ['resources/control/gibran_prophet_58585.txt',63114,1381,21238],
  ['resources/control/shakespeare_first300k.txt',218800,1372,100411],
  ['resources/control/emerson_essays_2944.txt',324630,1459,39070]
];
const checked=[];
for(const [file,expectedLength,expectedMin,expectedStart] of controls) {
  const source=gp(read(file));
  assert.equal(source.length,expectedLength);
  const score=nativeMinimum(source);
  assert.equal(score.min,expectedMin);
  assert.equal(score.at,expectedStart);
  assert(score.min>perPageMax);
  checked.push({source:file,windows:source.length-totalRunes+1,...score});
}

// Complete original-shape positive plant. All original 86 doublet events
// remain at the same offsets, and every nonrepeat rune is a reversible
// secret-ordered rank carrying content from genuine GP English.
const source=gp(read('resources/control/shakespeare_first300k.txt'));
const planted=[];
let contentCursor=0;
for (const p of PAGES) {
  const out=[];
  for(let i=0;i<p.indices.length;i++) {
    if (i===0) {
      out.push((7*p.page+3)%29);
    } else if(p.indices[i]===p.indices[i-1]) {
      out.push(out[i-1]);
    } else {
      const native=source[contentCursor];
      const rank=native===28?18:native;
      const now=nextRune(out[i-1],rank,global.order,pos);
      assert.equal(digit(out[i-1],now,pos),rank);
      out.push(now);
      contentCursor++;
    }
  }
  planted.push(out);
}
assert.equal(contentCursor,12815);
assert.equal(matrix(planted.map((indices,page)=>({page,indices}))).equal,86);


console.log(JSON.stringify({
  originalRunes:totalRunes, eligible:whole.transitions,
  doublets:whole.equal, seedAndErasurePositions:excluded.length,
  globalMaximum:global.max,
  globalAttainingRunePair:[corpus.translit[global.a],corpus.translit[global.b]],
  chapterMaximum:chapters.reduce((s,x)=>s+x.maximum,0),
  pagewiseMaximum:perPageMax,
  chapterBreakdown:chapters,
  nativeWindows:checked,
  positivePlant:contentCursor+' exact GP rank decodes',
  toyBruteForce:brute
},null,2));
