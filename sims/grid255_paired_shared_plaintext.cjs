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


/**
 * Exact maximum-weight square assignment, using the Hungarian primal-dual
 * algorithm. Zero-padded rows and columns model otherwise unmapped symbols.
 * @param {number[][]} weights
 * @returns {number} Maximum retained original coordinate pairs.
 */
function maxWeightAssignment(weights) {
  const n=weights.length;
  const u=new Float64Array(n+1),v=new Float64Array(n+1);
  const p=new Int32Array(n+1),way=new Int32Array(n+1);
  for (let i=1;i<=n;i++) {
    p[0]=i;
    let j0=0;
    const minv=new Float64Array(n+1).fill(Infinity);
    const used=new Uint8Array(n+1);
    do {
      used[j0]=1;
      const i0=p[j0];
      let delta=Infinity,j1=0;
      for (let j=1;j<=n;j++) if (!used[j]) {
        const cur=-weights[i0-1][j-1]-u[i0]-v[j];
        if (cur<minv[j]) {minv[j]=cur;way[j]=j0;}
        if (minv[j]<delta) {delta=minv[j];j1=j;}
      }
      for (let j=0;j<=n;j++) {
        if (used[j]) {u[p[j]]+=delta;v[j]-=delta;}
        else minv[j]-=delta;
      }
      j0=j1;
    } while (p[j0]!==0);
    do {
      const j1=way[j0];
      p[j0]=p[j1];
      j0=j1;
    } while (j0!==0);
  }
  let score=0;
  for (let j=1;j<=n;j++) score+=weights[p[j]-1][j-1];
  return score;
}

/**
 * A pair of arbitrary alphabet bijections composing the same plaintext has
 * one-to-one A-rune <-> B-rune relationships within each fixed state column.
 * A maximum-weight bipartite matching gives the exact largest consistent
 * subset, hence the exact minimum original positions that must be excluded
 * or changed. No particular alphabet labels or key are assumed.
 * @param {number[]} A
 * @param {number[]} B
 * @returns {number}
 */
function compatiblePairs(A,B) {
  assert.equal(A.length,B.length);
  if (!A.length) return 0;
  const left=[...new Set(A)],right=[...new Set(B)];
  const lm=new Map(left.map((value,i)=>[value,i]));
  const rm=new Map(right.map((value,i)=>[value,i]));
  const n=Math.max(left.length,right.length);
  const weights=Array.from({length:n},()=>Array(n).fill(0));
  for (let i=0;i<A.length;i++) weights[lm.get(A[i])][rm.get(B[i])]++;
  return maxWeightAssignment(weights);
}

/**
 * Minimize necessary source-position modifications over both B orientations
 * and all 128 possible missing latent positions. The period is the number
 * of independently rekeyed grid columns, aligned by latent coordinate.
 * @param {number[]} A
 * @param {number[]} B
 * @param {number} period
 * @returns {{drops:number,kept:number,reverse:boolean,missing:number,parts:object[]}}
 */
function minSymbolEdits(A,B,period) {
  assert.equal(A.length,128);
  assert.equal(B.length,127);
  assert.ok(Number.isInteger(period)&&period>=1&&period<=128);
  let best={drops:128};
  for (const reverse of [false,true]) {
    const oriented=reverse?[...B].reverse():B;
    for (let missing=0;missing<128;missing++) {
      let kept=0;
      const parts=[];
      for (let col=0;col<period;col++) {
        const left=[],right=[];
        for (let j=0;j<127;j++) {
          const i=j+Number(j>=missing);
          if (i%period===col) {left.push(A[i]);right.push(oriented[j]);}
        }
        const retained=compatiblePairs(left,right);
        kept+=retained;
        parts.push({total:left.length,kept:retained});
      }
      const drops=127-kept;
      if (drops<best.drops) best={drops,kept,reverse,missing,parts};
    }
  }
  return best;
}

/**
 * Fully bijective unknown alphabet maps with a source-disjoint latent string,
 * one omitted B symbol, independent per-column maps, and reversed B order.
 * @param {number} period
 * @returns {{A:number[],B:number[]}}
 */
function permutationControl(period) {
  const next=makeRng(0x590013+period);
  const latent=Array.from({length:128},()=>next()%29);
  const permutation=()=>{
    const x=Array.from({length:29},(_,i)=>i);
    for (let i=28;i>0;i--) {
      const j=next()%(i+1);
      [x[i],x[j]]=[x[j],x[i]];
    }
    return x;
  };
  const mapsA=Array.from({length:period},permutation);
  const mapsB=Array.from({length:period},permutation);
  const A=latent.map((value,i)=>mapsA[i%period][value]);
  const B=[];
  for (let j=0;j<127;j++) {
    const i=j+Number(j>=73);
    B.push(mapsB[i%period][latent[i]]);
  }
  return {A,B:B.reverse()};
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
  assert.equal(maxWeightAssignment([[1,5],[8,0]]),13);
  const labelFree=[1,2,4,8,16].map(period=>({period,...minSymbolEdits(A,B,period)}));
  const globalControl=permutationControl(1);
  const column8Control=permutationControl(8);
  assert.equal(minSymbolEdits(globalControl.A,globalControl.B,1).drops,0);
  assert.equal(minSymbolEdits(column8Control.A,column8Control.B,8).drops,0);
  return {source:{p53Black:128,p53Red:51,p55:76,grid:256},
    model:'two masked, identical 128-rune plaintext streams, one B-side symbol absent; grid halves in printed order, modulo 29',
    searched:{byteMaps:['byte%29','floor(byte*29/256)','byte%28'],
      signsPerHalf:2,directionsB:2,gapAdvancementPolicies:2,missingPositions:128,
      exactConfigurations:actual.modelCount},
    original:{maxMatches:actual.maxMatches,positionsCompared:127,winners:actual.winners},
    positive:{seed:'0x330155',trueSetup:synthetic.setup,matched:positive.maxMatches,
      exactRecovered128:true,exactReencrypted255:true,
      wrongGridBest:search(synthetic.A,synthetic.B,[...grid].reverse()).maxMatches},
    labelFree:{original:labelFree,completeGlobalPlant:true,completeEightColumnPlant:true,
      interpretation:'minimum paired coordinates to drop for unknown arbitrary per-column alphabet bijections'},
    shuffledGlobal:{replicates:total,seed:'0x533055',...summarize(globalNull),
      exceedOrEqual:globalNull.filter(v=>v>=actual.maxMatches).length,
      addOneP:(1+globalNull.filter(v=>v>=actual.maxMatches).length)/(total+1)},
    shuffledWithinRedAndLastPages:{replicates:total,...summarize(blockedNull),
      exceedOrEqual:blockedNull.filter(v=>v>=actual.maxMatches).length,
      addOneP:(1+blockedNull.filter(v=>v>=actual.maxMatches).length)/(total+1)}
  };
}

if (require.main === module) console.log(JSON.stringify(main(),null,2));
module.exports={byteToRune,search,encodeParallel,plant,maxWeightAssignment,compatiblePairs,minSymbolEdits,permutationControl,main};
