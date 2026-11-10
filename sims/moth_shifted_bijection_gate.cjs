'use strict';
/**
 * Necessary-condition original-input gate for the identical p53/p55 moth.
 * p53 contains 128 black and 51 red runes; p54's illuminated A plus p55
 * provides another 77 runes. Source-image reuse translates the moth +66,+67
 * pixels; explicitly test those candidate circular B-half rune offsets.
 *
 * Each half may use any secret bijective GP29 alphabet per period column,
 * independently, so failure is key-independent for the stated same-message
 * geometry. It does not determine a cipher or establish a plaintext key.
 *
 * SFT: node sims/moth_shifted_bijection_gate.cjs
 * Node.js 22/CommonJS. No writes.
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

/** @param {number[][]} weight @returns {number} */
function assignment(weight) {
  const n = weight.length;
  const u = new Float64Array(n + 1), v = new Float64Array(n + 1);
  const p = new Int32Array(n + 1), way = new Int32Array(n + 1);
  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = new Float64Array(n + 1).fill(Infinity);
    const used = new Uint8Array(n + 1);
    do {
      used[j0] = 1;
      const i0 = p[j0];
      let delta = Infinity, j1 = 0;
      for (let j = 1; j <= n; j++) if (!used[j]) {
        const cur = -weight[i0 - 1][j - 1] - u[i0] - v[j];
        if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
        if (minv[j] < delta) { delta = minv[j]; j1 = j; }
      }
      for (let j = 0; j <= n; j++) {
        if (used[j]) { u[p[j]] += delta; v[j] -= delta; }
        else minv[j] -= delta;
      }
      j0 = j1;
    } while (p[j0] !== 0);
    do {
      const previous = way[j0];
      p[j0] = p[previous];
      j0 = previous;
    } while (j0 !== 0);
  }
  let total = 0;
  for (let j = 1; j <= n; j++) total += weight[p[j] - 1][j - 1];
  return total;
}

/**
 * Exact sharp all-secret table upper bound for identical 128-rune message.
 * @param {number[]} a
 * @param {number[]} b Both already aligned at their putative plaintext offsets.
 * @param {number} period Number of independently unknown column bijections.
 * @returns {number}
 */
function compatible(a, b, period) {
  assert.equal(a.length, 128);
  assert.equal(b.length, 128);
  let total = 0;
  for (let col = 0; col < period; col++) {
    const weight = Array.from({length:29}, () => Array(29).fill(0));
    for (let i = col; i < 128; i += period) weight[a[i]][b[i]]++;
    total += assignment(weight);
  }
  return total;
}

/** @param {number[]} b @param {number} shift @param {boolean} reverse */
function align(b, shift, reverse) {
  const sequence = reverse ? b.slice().reverse() : b;
  return Array.from({length:128}, (_, i) =>
    sequence[((i + shift) % 128 + 128) % 128]);
}

/** @param {number} seed @returns {()=>number} */
function rng(seed) {
  let x = seed >>> 0;
  return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return x >>> 0; };
}

/** @param {number[]} a @param {()=>number} next */
function shuffle(a, next) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = next() % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function run() {
  const p53 = corpus.pages[53].indices, p54 = corpus.pages[54].indices;
  const p55 = corpus.pages[55].indices;
  assert.equal(p53.length,179);
  assert.equal(p55.length,76);
  assert.equal(p54[0],24); // Illuminated GP A, source image 71.jpg.
  const A = p53.slice(0,128), B = [...p53.slice(128), p54[0], ...p55];
  assert.equal(B.length,128);
  const shifts = [0,66,67,-66,-67], periods = [1,2,4,8,16];
  const models = [];
  for (const shift of shifts) for (const reverse of [false,true]) {
    const aligned = align(B,shift,reverse);
    const retained = Object.fromEntries(periods.map(period =>
      [period,compatible(A,aligned,period)]));
    models.push({shift,reverse,retained});
  }
  const strongest = models.slice().sort((a,b) =>
    b.retained[8] - a.retained[8])[0];
  const next = rng(0x330136);
  const secret = () => shuffle(Array.from({length:29},(_,i)=>i),next);
  const source = Array.from({length:128},()=>next()%29);
  const mapA = Array.from({length:8},secret);
  const mapB = Array.from({length:8},secret);
  const plantedA = source.map((v,i)=>mapA[i%8][v]);
  const plantedB = Array(128);
  for(let i=0;i<128;i++) plantedB[(i+66)%128]=mapB[i%8][source[i]];
  const positive = compatible(plantedA,align(plantedB,66,false),8);
  assert.equal(positive,128);

  // Refit all ten original source-pixel shifts/orientations per null draw.
  const nullMax = [];
  for (let rep=0;rep<200;rep++) {
    const shuffled = shuffle(B.slice(),next);
    let value=0;
    for (const shift of shifts) for (const reverse of [false,true])
      value=Math.max(value,compatible(A,align(shuffled,shift,reverse),8));
    nullMax.push(value);
  }
  const exceeds = nullMax.filter(v=>v>=strongest.retained[8]).length;
  return {
    pageStructure:{blackP53:128,redP53:51,illuminatedP54:1,p55:76},
    sourceImageShiftPixels:{dx:66,dy:67},
    originalModes:models,
    strongestEightColumn:strongest,
    requiredOriginalChanges:128-strongest.retained[8],
    exactlyRecoveredPlantedPositionPairs:positive,
    matchedNull:{draws:nullMax.length,
      min:Math.min(...nullMax),max:Math.max(...nullMax),
      average:nullMax.reduce((s,v)=>s+v,0)/nullMax.length,
      atLeastOriginal:exceeds,
      addOneTail:(exceeds+1)/(nullMax.length+1)},
    conclusion:'No common original GP29 plaintext under either source-derived '+
      'moth shift with fixed secret column bijections.'
  };
}
if (require.main === module) console.log(JSON.stringify(run(),null,2));
module.exports={assignment,compatible,align,run};
