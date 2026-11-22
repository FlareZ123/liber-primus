'use strict';

/**
 * Original LP2 p50 32x8 table as a direct or cumulatively consumed
 * GP29 key, with a completely unknown secret outer alphabet.
 *
 * For EACH of the nine original physical chapters, independently grant
 * (1) any table start phase 0..255, (2) any key multiplier 1..28 and
 * (3) any of 29! outer-symbol permutations. This is much more permissive
 * than the actual published table-pad proposal.
 *
 * C[i] = sigma((P[i] + m*K[(start+i) mod256]) mod29)
 * or K[i] = sum_{j<=i} byte[(start+j) mod256] mod29.
 *
 * An exact necessary E/O occupancy bound eliminates every secret sigma.
 * The bound even permits NON-bijective per-label assignments, so failure
 * is stronger than any fixed 29-symbol permutation fit can rescue.
 *
 * The historical solved-p56 literal-plaintext-F clock bypass, extra
 * rejection draws, changed word order, key change within a chapter
 * and non-GP/native-English plaintext are outside this experiment.
 *
 * Read-only, Node.js 22/CommonJS, works on Windows 11.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/base60-grid.json'), 'utf8'));
assert.equal(corpus.translit[18], 'E');
assert.equal(corpus.translit[3], 'O');
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every(row => row.length === 8));

const chapterPages = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const chapters = chapterPages.map(([first, last]) =>
  corpus.pages.slice(first, last + 1).flatMap(page => page.indices));
assert.deepEqual(chapters.map(c => c.length),
  [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);
assert.equal(chapters.flat().length, 12956);
const source60 = grid.byte_rows.flat();
assert.equal(source60.length, 256);
const alphabet59 = grid.alphabet.replace('f', '');
assert.equal(alphabet59.length, 59);
assert.ok(grid.rows.flat().every(token =>
  token.length === 2 && !token.includes('f') && [...token].every(c => alphabet59.includes(c))));
const source59 = grid.rows.flat().map(token =>
  59 * alphabet59.indexOf(token[0]) + alphabet59.indexOf(token[1]));
assert.equal(source59.length, 256);
assert.equal(source60[0], 203);
assert.equal(source59[0], 200);

/** @param {number[]} cipher @param {Uint8Array} stream */
function occupancyBound(cipher, stream) {
  assert.equal(cipher.length, stream.length);
  const h = new Uint16Array(841);
  for (let i = 0; i < cipher.length; i++) {
    const ci = cipher[i], k = stream[i];
    assert.ok(Number.isInteger(ci) && ci >= 0 && ci < 29);
    h[29 * ci + k]++;
  }
  let bestBound = 0, bestDelta = 0;
  for (let delta = 1; delta < 29; delta++) {
    let total = 0;
    for (let letter = 0; letter < 29; letter++) {
      const base = 29 * letter;
      let best = 0;
      for (let k = 0; k < 29; k++) {
        const count = h[base + k] + h[base + ((k + delta) % 29)];
        if (count > best) best = count;
      }
      total += best;
    }
    if (total > bestBound) {
      bestBound = total;
      bestDelta = delta;
    }
  }
  return {upper: bestBound, delta: bestDelta};
}

/**
 * @param {number[]} table
 * @param {number} phase
 * @param {number} length
 * @param {boolean} cumulative
 */
function keyStream(table, phase, length, cumulative) {
  const result = new Uint8Array(length);
  let sum = 0;
  for (let i = 0; i < length; i++) {
    sum = (sum + table[(phase + i) % 256]) % 29;
    result[i] = cumulative ? sum : table[(phase + i) % 256] % 29;
  }
  return result;
}

/** @param {number} seed @returns {() => number} */
function random32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** Verify a genuine p57-plaintext plant with unknown secret sigma. */
function positive(table, cumulative, chapterIndex) {
  const length = chapters[chapterIndex].length;
  const clear = corpus.pages[57].indices;
  assert.equal(clear.length, 95);
  const plain = Array.from({length},
    (_,i) => clear[(i + chapterIndex * 7) % clear.length]);
  const phase = (13 + chapterIndex * 31) % 256;
  const multiplier = chapterIndex + 1;
  const stream = keyStream(table, phase, length, cumulative);
  const sigma = Array.from({length:29},(_,i)=>i), next=random32(0x330155 + chapterIndex);
  for(let i=28;i>0;i--){const j=next()%(i+1);[sigma[i],sigma[j]]=[sigma[j],sigma[i]];}
  const inverse = Array(29);
  sigma.forEach((v,i)=>{inverse[v]=i;});
  assert.equal(new Set(sigma).size,29);
  const encrypted=plain.map((v,i)=>sigma[(v+multiplier*stream[i])%29]);
  const decoded=encrypted.map((v,i)=>
    (inverse[v] - multiplier * stream[i] % 29 + 29) % 29);
  assert.deepEqual(decoded,plain);
  const trueEO = plain.filter(v=>v===18||v===3).length;
  const upper = occupancyBound(encrypted,stream).upper;
  assert.ok(upper>=trueEO, 'legitimate source-text plant must be admitted');
  return {trueEO,upper};
}

const actual = [];
for (const [radix, table] of [['base60',source60],['base59',source59]]) {
  for (const cumulative of [false,true]) {
    const winners = chapterPages.map(([first,last],i)=>({
      pages:[first,last],length:chapters[i].length,
      upper:0,phase:0,delta:0
    }));
    for(let chapter=0;chapter<chapters.length;chapter++) {
      const text=chapters[chapter];
      for(let phase=0;phase<256;phase++) {
        const stream=keyStream(table,phase,text.length,cumulative);
        const estimate=occupancyBound(text,stream);
        if(estimate.upper>winners[chapter].upper) {
          winners[chapter].upper=estimate.upper;
          winners[chapter].phase=phase;
          winners[chapter].delta=estimate.delta;
        }
      }
    }
    const sum=winners.reduce((a,v)=>a+v.upper,0);
    const expected = {
      base60: {direct:[163,222,308,334,206,270,300,478,95],
        cumulative:[153,199,268,286,188,233,263,400,90]},
      base59: {direct:[158,215,289,310,200,251,281,439,93],
        cumulative:[153,202,266,284,187,236,264,404,90]}
    };
    assert.deepEqual(winners.map(v=>v.upper),
      expected[radix][cumulative?'cumulative':'direct']);
    assert.ok(sum<2408,'native GP E/O control minimum must exceed any candidate');
    const plants=chapters.map((_,i)=>positive(table,cumulative,i));
    const truePlantEO=plants.reduce((a,v)=>a+v.trueEO,0);
    assert.ok(truePlantEO>sum,'GP-native positive must be distinguishable');
    actual.push({radix,cumulative,perChapter:winners,
      allSecretUpperEO:sum,nativeControlMinEO:2408,margin:2408-sum,
      plantEO:truePlantEO});
  }
}
console.log(JSON.stringify({
  question:'Could original p50 bytes be a GP29 key hidden under any static secret 29-alphabet?',
  source:'32x8 p49-p51 printed table, GP29 original p0-p55',
  inverseFamily:'C = sigma(P + m*K) mod29; chapter-secret 29! sigma, m=1..28, phase=0..255',
  originalRunes:12956,originalChapters:9,results:actual,
  controls:'Genuine GP-native solved p57 plaintext, 9 independently secret random alphabets and key phases per model, full forward replay',
  decision:'All four frozen base59/base60 direct/cumulative no-skip models fall below native E/O occupancy controls, even after every source phase and multiplier per chapter',
  limitations:'No F-bypass or skipped key draws; GP-native English register, printed order unchanged, alphabet fixed inside each chapter. No unknown plaintext recovered.'
},null,2));
