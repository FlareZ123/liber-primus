'use strict';
/**
 * Original-source p53/p55 versus 256-byte table: parallel/shared-plaintext gate.
 * A fixed 128/127 split yields 128 latent plaintext symbols, with one B-side
 * cell missing. A and B are independently masked by the two 128-byte table
 * halves. This scanner tests both sign choices, natural byte maps, B reading
 * directions and two interpretations of table advancement across the gap.
 *
 * Positive control encrypts an independent 128-rune message, removes one
 * B-side symbol and requires perfect original-cipher round-trip recovery.
 * Randomization is deterministic. This is a bounded exclusion, not a claim
 * about the actual LP2 cipher.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');

/** @param {string} file @returns {any} */
function readJSON(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

/** @param {number} x @returns {number} */
function mod29(x) { return ((x % 29) + 29) % 29; }

/** @param {number} n @param {number} mode @returns {number} */
function byteToRune(n, mode) {
  if (mode === 0) return n % 29;
  if (mode === 1) return Math.floor(n * 29 / 256);
  return n % 28;
}

/** @param {number} seed @returns {()=>number} */
function makeRng(seed) {
  let x = seed >>> 0;
  return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return x >>> 0; };
}

/**
 * Recover the best equality count between 128 parallel plaintext positions.
 * All tested cryptographic maps are invertible mod29 under the given bytes.
 * For B position j, its latent position is i=j+(j>=missing).
 * No-skip mode: B byte coordinate stays j; skip mode: it advances to i.
 * @param {number[]} A
 * @param {number[]} B
 * @param {number[]} grid
 * @returns {{maxMatches:number, winners:object[], modelCount:number}}
 */
function search(A, B, grid) {
  assert.equal(A.length, 128);
  assert.equal(B.length, 127);
  assert.equal(grid.length, 256);
  let maxMatches = -1;
  const winners = [];
  let modelCount = 0;
  for (let mode = 0; mode < 3; mode++) {
    for (const signA of [-1, 1]) {
      const pA = A.map((x, i) => mod29(x + signA * byteToRune(grid[i], mode)));
      for (const signB of [-1, 1]) {
        for (const reverseB of [false, true]) {
          const b = reverseB ? [...B].reverse() : B;
          const bZero = b.map((x, j) => mod29(x + signB * byteToRune(grid[128+j], mode)));
          const bSkip = b.map((x, j) => mod29(x + signB * byteToRune(grid[129+j], mode)));
          const prefix = [0];
          for (let j=0; j<127; j++) prefix.push(prefix[j] + Number(pA[j] === bZero[j]));
          for (const advanceOnMissing of [false, true]) {
            const right = advanceOnMissing ? bSkip : bZero;
            const suffix = new Array(128).fill(0);
            for (let j=126; j>=0; j--) suffix[j] = suffix[j+1] + Number(pA[j+1] === right[j]);
            for (let missing=0; missing<128; missing++) {
              const matches = prefix[missing] + suffix[missing];
              modelCount++;
              if (matches > maxMatches) { maxMatches=matches; winners.length=0; }
              if (matches === maxMatches) {
                winners.push({mode, signA, signB, reverseB, advanceOnMissing, missing});
              }
            }
          }
        }
      }
    }
  }
  return {maxMatches, winners:winners.slice(0,10), modelCount};
}

/**
 * @param {number[]} plain
 * @param {number[]} grid
 * @param {{mode:number,signA:number,signB:number,reverseB:boolean,advanceOnMissing:boolean,missing:number}} setup
 * @returns {{A:number[],B:number[]}}
 */
function encodeParallel(plain, grid, setup) {
  assert.equal(plain.length, 128);
  const A=plain.map((p,i)=>mod29(p-setup.signA*byteToRune(grid[i],setup.mode)));
  const B=[];
  for (let j=0; j<127; j++) {
    const i=j+Number(j>=setup.missing);
    const bytePos=128+(setup.advanceOnMissing?i:j);
    B.push(mod29(plain[i]-setup.signB*byteToRune(grid[bytePos],setup.mode)));
  }
  return {A,B:setup.reverseB?B.reverse():B};
}

/**
 * Construct a source-disjoint 128-rune planted common message and encode two
 * full cipher streams under a planted table+gap configuration.
 * @param {number[]} grid
 * @returns {{A:number[],B:number[],plain:number[],setup:object}}
 */
function plant(grid) {
  const next=makeRng(0x330155);
  const plain=Array.from({length:128},()=>next()%29);
  const setup={mode:1,signA:-1,signB:1,reverseB:true,advanceOnMissing:true,missing:73};
  return {...encodeParallel(plain,grid,setup),plain,setup};
}

/** @param {number[]} v @param {()=>number} next */
function shuffle(v, next) {
  for (let i=v.length-1; i>0; i--) {
    const j=next()%(i+1);
    [v[i],v[j]]=[v[j],v[i]];
  }
}

/** @param {number[]} a @returns {object} */
function summarize(a) {
  a.sort((x,y)=>x-y);
  return {min:a[0],p05:a[Math.floor((a.length-1)*.05)],median:a[Math.floor((a.length-1)*.50)],
    p95:a[Math.floor((a.length-1)*.95)],max:a[a.length-1]};
}

function main() {
  const corpus=readJSON('resources/liber-primus/lp2-corpus.json');
  const table=readJSON('resources/liber-primus/base60-grid.json');
  const ink=readJSON('resources/liber-primus/lp2-page53-red-span.json');
  const p53=corpus.pages.find(p=>p.page===53).indices;
  const p55=corpus.pages.find(p=>p.page===55).indices;
  const grid=table.byte_rows.flat();
  assert.equal(p53.length,179);
  assert.equal(p55.length,76);
  assert.equal(ink.red_text.start_rune_inclusive,128);
  assert.equal(ink.red_text.rune_count,51);
  assert.equal(grid.length,256);
  const A=p53.slice(0,128), B=[...p53.slice(128),...p55];
  assert.equal(B.length,127);
  const actual=search(A,B,grid);
  const synthetic=plant(grid);
  const positive=search(synthetic.A,synthetic.B,grid);
  assert.equal(positive.maxMatches,127);
  assert.ok(positive.winners.some(m=>Object.keys(synthetic.setup).every(k=>m[k]===synthetic.setup[k])));
  const recovered=synthetic.A.map((v,i)=>mod29(v+synthetic.setup.signA*byteToRune(grid[i],synthetic.setup.mode)));
  assert.deepEqual(recovered,synthetic.plain);
  const regen=encodeParallel(recovered,grid,synthetic.setup);
  assert.deepEqual(regen.A,synthetic.A);
  assert.deepEqual(regen.B,synthetic.B);
  const next=makeRng(0x533055);
  const total=1000;
  const globalNull=[],blockedNull=[];
  for (let run=0; run<total; run++) {
    const joint=[...B];shuffle(joint,next);
    globalNull.push(search(A,joint,grid).maxMatches);
    const red=B.slice(0,51),tail=B.slice(51);
    shuffle(red,next);shuffle(tail,next);
    blockedNull.push(search(A,[...red,...tail],grid).maxMatches);
  }
  return {source:{p53Black:128,p53Red:51,p55:76,grid:256},
    model:'two masked, identical 128-rune plaintext streams, one B-side symbol absent; grid halves in printed order, modulo 29',
    searched:{byteMaps:['byte%29','floor(byte*29/256)','byte%28'],
      signsPerHalf:2,directionsB:2,gapAdvancementPolicies:2,missingPositions:128,
      exactConfigurations:actual.modelCount},
    original:{maxMatches:actual.maxMatches,positionsCompared:127,winners:actual.winners},
    positive:{seed:'0x330155',trueSetup:synthetic.setup,matched:positive.maxMatches,
      exactRecovered128:true,exactReencrypted255:true,
      wrongGridBest:search(synthetic.A,synthetic.B,[...grid].reverse()).maxMatches},
    shuffledGlobal:{replicates:total,seed:'0x533055',...summarize(globalNull),
      exceedOrEqual:globalNull.filter(v=>v>=actual.maxMatches).length,
      addOneP:(1+globalNull.filter(v=>v>=actual.maxMatches).length)/(total+1)},
    shuffledWithinRedAndLastPages:{replicates:total,...summarize(blockedNull),
      exceedOrEqual:blockedNull.filter(v=>v>=actual.maxMatches).length,
      addOneP:(1+blockedNull.filter(v=>v>=actual.maxMatches).length)/(total+1)}
  };
}

if (require.main === module) console.log(JSON.stringify(main(),null,2));
module.exports={byteToRune,search,encodeParallel,plant,main};
