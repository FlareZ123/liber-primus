"use strict";
/**
 * Original-LP2 13-dot / 32x8-grid two-tap GP29 capacity theorem.
 * SFT: node sims/grid13_two_tap_allkey.cjs (Node.js 22; no packages).
 *
 * The grid determines paired affine feedback coefficients; secret output
 * alphabets are COMPLETELY arbitrary 29-way bijections per fragment/phase.
 * For additional rigor, grant each fragment its own choice of grid row,
 * coefficient reading, signs and feedback reset, plus arbitrary independent
 * column permutation. Maximize the number of any designated GP plaintext
 * rune over every such key, without ever guessing the original plaintext.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { sourceSpans, nativeGP, eWindows } =
  require("./thirteen_dot_grid_8phase_allkey_capacity.cjs");

const ROOT = path.resolve(__dirname, "..");
const load = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const corpus = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(load("resources/liber-primus/base60-grid.json"));
const spans = sourceSpans().spans.slice(0, 28);
const original = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
const FIELD = 29, PHASES = 8;
const mod = x => ((x % FIELD) + FIELD) % FIELD;

assert.equal(original.length, 12956);
assert.equal(spans.length, 28);
assert.equal(spans.filter(([a, b]) => a === b).length, 2);
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every(row => row.length === PHASES &&
  row.every(v => Number.isInteger(v) && v >= 0 && v < 256)));
const gridBytes = Buffer.from(grid.byte_rows.flat());
assert.equal(crypto.createHash("sha256").update(gridBytes).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

/**
 * Four source-native decompositions of each printed grid byte into
 * two field coefficients. Both orders are included.
 */
const readings = {
  radix29: v => [v % 29, Math.floor(v / 29)],
  radix29swap: v => [Math.floor(v / 29), v % 29],
  printed60: v => [Math.floor(v / 60), (v % 60) % 29],
  printed60swap: v => [(v % 60) % 29, Math.floor(v / 60)]
};
const MODES = [];
for (const reading of Object.keys(readings)) {
  for (const history of ["reset", "continuous"]) {
    for (const sign1 of [-1, 1]) {
      for (const sign2 of [-1, 1]) {
        MODES.push({reading, history, sign1, sign2});
      }
    }
  }
}
assert.equal(MODES.length, 32);

/**
 * @param {number[]} cipher
 * @param {number} fragment
 * @param {"reset"|"continuous"} history
 * @returns {number[][][]} Eight arrays of [current, previous1, previous2].
 */
function observedTriples(cipher, fragment, history) {
  const [lo, hi] = spans[fragment];
  const groups = Array.from({length:PHASES}, () => []);
  for (let i=lo; i<hi; i++) {
    const p1 = i > lo ? cipher[i-1] :
      (history === "continuous" && i > 0 ? cipher[i-1] : 0);
    const p2 = i > lo+1 ? cipher[i-2] :
      (history === "continuous" && i > 1 ? cipher[i-2] : 0);
    groups[(i-lo) % PHASES].push([cipher[i], p1, p2]);
  }
  return groups;
}

/**
 * Dynamic programming over all 8! column assignments. This is the exact
 * maximum weight perfect matching on an eight-by-eight integer matrix.
 * Reconstruct the winning permutation to exhibit an attainable E count.
 * @param {number[][]} weights
 * @returns {{score:number, columns:number[]}}
 */
function optimalColumns(weights) {
  let dp = new Int16Array(256).fill(-1);
  const parents = Array.from({length:9}, () => Array(256).fill(null));
  dp[0] = 0;
  for (let h=0; h<PHASES; h++) {
    const next = new Int16Array(256).fill(-1);
    for (let mask=0; mask<256; mask++) {
      if (dp[mask] < 0) continue;
      for (let j=0; j<PHASES; j++) {
        if (mask & (1 << j)) continue;
        const updated = mask | (1 << j);
        const score = dp[mask] + weights[h][j];
        if (score > next[updated]) {
          next[updated] = score;
          parents[h+1][updated] = {mask, j};
        }
      }
    }
    dp = next;
  }
  const columns = new Array(PHASES);
  let mask = 255;
  for (let h=PHASES; h>0; h--) {
    const item = parents[h][mask];
    assert.ok(item);
    columns[h-1] = item.j;
    mask = item.mask;
  }
  assert.equal(mask, 0);
  assert.equal(new Set(columns).size, 8);
  return {score:dp[255], columns};
}

/**
 * Each unknown 29-way output permutation can map a designated plaintext
 * rune to a SINGLE transformed value. Therefore its best possible count
 * is the maximum transformed-value frequency in that state.
 *
 * @param {number[][][]} phaseTriples
 * @param {number} row
 * @param {{reading:string,history:string,sign1:number,sign2:number}} mode
 */
function rowCapacity(phaseTriples, row, mode) {
  const weights = [];
  for (let h=0; h<PHASES; h++) {
    const costs = [];
    for (let j=0; j<PHASES; j++) {
      const [a,b] = readings[mode.reading](grid.byte_rows[row][j]);
      const counts = new Uint16Array(FIELD);
      for (const [c,p1,p2] of phaseTriples[h])
        counts[mod(c + mode.sign1*a*p1 + mode.sign2*b*p2)]++;
      costs.push(Math.max(...counts));
    }
    weights.push(costs);
  }
  return optimalColumns(weights);
}

/**
 * Exact optimization. The strongest model permits arbitrary, independently
 * selected grid rows WITH REPLACEMENT, independent source-byte readings,
 * history scope, signs, eight-way column orders, and unknown GP29 alphabets
 * for EACH source fragment.
 */
function capacity(cipher) {
  const globallyShared = new Int32Array(MODES.length);
  const selected = [];
  let fixedRowIndependent = 0, freelyChosenRow = 0;
  for (let fragment=0; fragment<spans.length; fragment++) {
    const [lo,hi] = spans[fragment];
    if (lo === hi) {
      selected.push(null);
      continue;
    }
    const phaseByHistory = {
      reset: observedTriples(cipher, fragment, "reset"),
      continuous: observedTriples(cipher, fragment, "continuous")
    };
    let fragmentFixed = -1, fragmentFree = -1, witness = null;
    for (let m=0; m<MODES.length; m++) {
      const mode = MODES[m], triplets = phaseByHistory[mode.history];
      let fixedScore = -1;
      for (let row=0; row<grid.byte_rows.length; row++) {
        const ans = rowCapacity(triplets, row, mode);
        if (row === fragment) fixedScore = ans.score;
        if (ans.score > fragmentFree) {
          fragmentFree = ans.score;
          witness = {fragment, row, ...mode, columns:ans.columns,
            maximum:ans.score};
        }
      }
      assert.ok(fixedScore >= 0);
      globallyShared[m] += fixedScore;
      if (fixedScore > fragmentFixed) fragmentFixed = fixedScore;
    }
    fixedRowIndependent += fragmentFixed;
    freelyChosenRow += fragmentFree;
    assert.ok(fragmentFree >= fragmentFixed);
    selected.push(witness);
  }
  const fixedRowShared = Math.max(...globallyShared);
  assert.ok(fixedRowShared <= fixedRowIndependent);
  assert.ok(fixedRowIndependent <= freelyChosenRow);
  return {
    fixedRowShared,
    fixedRowIndependent,
    freelyChosenRow,
    globalWinner: MODES[globallyShared.indexOf(fixedRowShared)],
    fragmentWitnesses: selected
  };
}

/** Generate arbitrary hidden 29-permutations with the chosen rune as E. */
function eMaximizingSecret(cipher, best) {
  const keys = [];
  for (let fragment=0; fragment<spans.length; fragment++) {
    const win = best.fragmentWitnesses[fragment], [lo] = spans[fragment];
    if (!win) {keys.push(null); continue;}
    const groups = observedTriples(cipher, fragment, win.history);
    const key = [];
    for (let h=0; h<PHASES; h++) {
      const j = win.columns[h], [a,b] =
        readings[win.reading](grid.byte_rows[win.row][j]);
      const counts = new Uint16Array(FIELD);
      for (const [c,p1,p2] of groups[h])
        counts[mod(c+win.sign1*a*p1+win.sign2*b*p2)]++;
      const high = counts.indexOf(Math.max(...counts));
      const permutation = new Array(FIELD);
      permutation[18] = high;
      let next = 0;
      for (let letter=0; letter<FIELD; letter++) {
        if (letter === 18) continue;
        while (next === high) next++;
        permutation[letter] = next++;
      }
      assert.equal(new Set(permutation).size, FIELD);
      const inverse = new Array(FIELD);
      for (let p=0; p<FIELD; p++) inverse[permutation[p]] = p;
      key.push({a:win.sign1*a,b:win.sign2*b,
        permutation,inverse,history:win.history});
    }
    keys.push(key);
  }
  return keys;
}

/** Causal full-manuscript encryption/decryption with source fragment resets. */
function transform(input, keys, decrypt) {
  const out = new Array(original.length);
  for (let fragment=0; fragment<spans.length; fragment++) {
    const [lo,hi] = spans[fragment], records = keys[fragment];
    if (lo===hi)continue;
    assert.equal(records.length, PHASES);
    for (let i=lo; i<hi; i++) {
      const key = records[(i-lo)%PHASES];
      const c = decrypt ? input : out;
      const p1 = i>lo ? c[i-1] :
        (key.history==="continuous" && i>0 ? c[i-1] : 0);
      const p2 = i>lo+1 ? c[i-2] :
        (key.history==="continuous" && i>1 ? c[i-2] : 0);
      if (decrypt) {
        out[i] = key.inverse[mod(input[i]+key.a*p1+key.b*p2)];
      } else {
        out[i] = mod(key.permutation[input[i]]-key.a*p1-key.b*p2);
      }
      assert.ok(Number.isInteger(out[i]) && out[i]>=0 && out[i]<FIELD);
    }
  }
  return out;
}

function randomSourceKeys() {
  let seed = 0x31c0a330;
  const next = () => {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    return seed >>> 0;
  };
  return spans.map((_,fragment) =>
    Array.from({length:PHASES}, (_,h) => {
      const [a,b] = readings.radix29(grid.byte_rows[fragment][h]);
      const permutation = Array.from({length:FIELD}, (_,i)=>i);
      for(let i=FIELD-1;i>0;i--) {
        const j=next()%(i+1);
        [permutation[i],permutation[j]]=[permutation[j],permutation[i]];
      }
      const inverse = new Array(FIELD);
      for(let i=0;i<FIELD;i++)inverse[permutation[i]]=i;
      return {a,b,history:"reset",permutation,inverse};
    })
  );
}

function run() {
  const originalMaximum = capacity(original);
  assert.equal(originalMaximum.fixedRowShared, 1154);
  assert.equal(originalMaximum.fixedRowIndependent, 1221);
  assert.equal(originalMaximum.freelyChosenRow, 1288);

  const shakespeare = nativeGP(load("resources/control/shakespeare_first300k.txt"));
  const gibran = nativeGP(load("resources/control/gibran_prophet_58585.txt"));
  const shakespeareControl = eWindows(shakespeare, original.length);
  const gibranControl = eWindows(gibran, original.length);
  assert.equal(shakespeareControl.minE, 1404);
  assert.equal(gibranControl.minE, 1414);
  assert.ok(originalMaximum.freelyChosenRow < shakespeareControl.minE);

  const mostEKeys = eMaximizingSecret(original, originalMaximum);
  const hypotheticalPlain = transform(original, mostEKeys, true);
  const hypotheticalE = hypotheticalPlain.filter(r=>r===18).length;
  assert.equal(hypotheticalE, originalMaximum.freelyChosenRow);
  assert.deepEqual(transform(hypotheticalPlain, mostEKeys, false), original);

  const sourcePlain = shakespeare.slice(25000,25000+original.length);
  assert.equal(sourcePlain.length, original.length);
  const secret = randomSourceKeys();
  const planted = transform(sourcePlain,secret,false);
  assert.deepEqual(transform(planted,secret,true),sourcePlain);
  assert.deepEqual(transform(transform(planted,secret,true),secret,false),planted);
  const plantedE = sourcePlain.filter(x=>x===18).length;
  assert.ok(plantedE>shakespeareControl.minE);
  const plantedKeyFree = capacity(planted);
  assert.ok(plantedKeyFree.freelyChosenRow>=plantedE);

  return {
    classification:"Exact, conditional source-derived all-secret capacity; no actual LP2 plaintext",
    corpus:{originalCipherRunes:original.length,fragments:spans.length,
      emptyFragments:spans.filter(([a,b])=>a===b).length,
      gridRows:32,gridColumns:8},
    model:{sourceByteInterpretations:Object.keys(readings),
      coefficientSigns:4,registerHistory:2,
      independentRowSelectionWithReplacement:true,
      independentPerFragmentColumnPermutations:true,
      independentPerFragmentGP29SubstitutionPermutations:true},
    originalBounds:{
      rowFixedSharedReading:originalMaximum.fixedRowShared,
      rowFixedIndependentReadings:originalMaximum.fixedRowIndependent,
      anyGridRowIndependentReadings:originalMaximum.freelyChosenRow,
      sharpECountAttainedBySomeSecret:hypotheticalE,
      hypotheticalCiphertextReencrypted:original.length
    },
    sourceNativeReference:{shakespeare:shakespeareControl,
      gibran:gibranControl,
      minimalForcedEChangesVsShakespeare:
        shakespeareControl.minE-originalMaximum.freelyChosenRow,
      minimalForcedEChangesVsGibran:
        gibranControl.minE-originalMaximum.freelyChosenRow},
    sourceKeyPositive:{trueGpE:plantedE,recoveredRunes:sourcePlain.length,
      reencryptionRunes:sourcePlain.length,
      fullKeyFreeCapacity:plantedKeyFree.freelyChosenRow,
      passed:true},
    interpretation:"Even arbitrary row reuse, four source-byte coefficient pairs, " +
      "independent signs, history, all 8! column assignments and every " +
      "independent 29-symbol substitution leave the original GP-E count " +
      "at least 116 short of native GP prose. Other state rules and " +
      "non-GP plaintext registers remain open."
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,capacity,optimalColumns,observedTriples,transform};
