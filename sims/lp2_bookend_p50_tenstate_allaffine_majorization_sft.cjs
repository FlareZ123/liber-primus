"use strict";
/**
 * Source-original all-secret GF29-affine pair-mixer capacity gate for the
 * 81x81 / 80x80 LP2 bookend and the ten-state p50 digit/parity clock.
 *
 * For each source state z, permit ANY affine first-output map
 *   P = a[z] * K + b[z] * C + d[z] (mod 29)
 * with (a[z],b[z]) != (0,0). A second, hidden affine output Q may always
 * be selected to make (K,C)->(P,Q) an invertible 841-point transformation.
 * This program proves a TOP-K plaintext frequency cap simultaneously for
 * ALL such secret coefficients without fitting a single coefficient.
 *
 * SFT: node sims/lp2_bookend_p50_tenstate_allaffine_majorization_sft.cjs
 * Windows 11 / Node.js 22 / CommonJS / read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { encodeSourceNativeGP } =
  require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const runes = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const A = runes.slice(0, 6561);
const C = runes.slice(6561);
assert.equal(runes.length, 12956);
assert.equal(A.length, 6561);
assert.equal(C.length, 6395);
assert.equal(grid.bytes.length, 256);
assert.deepEqual(A.slice(-6), C.slice(-6));

const holes = new Set([2244, 2384, 2476, 2575, 2672]);
const positions = Array.from({ length: 6400 }, (_, i) => i)
  .filter(i => !holes.has(i));
assert.equal(positions.length, C.length);

/** Multiply by x+1 modulo x^4+x^2+x+1 in GF(3^4). */
function mul4(x) {
  const d = [0, 0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    const trit = x % 3;
    x = Math.floor(x / 3);
    d[i] += trit;
    d[i + 1] += trit;
  }
  const high = d[4] % 3;
  for (let i = 0; i < 3; i++) d[i] -= high;
  return d.slice(0, 4).reduce((s, v, i) =>
    s + ((v % 3 + 3) % 3) * 3 ** i, 0);
}
const g = [1];
while (g.length < 80) g.push(mul4(g.at(-1)));
assert.equal(new Set(g).size, 80);
assert.equal(mul4(g.at(-1)), 1);
const K = {
  field: positions.map(i =>
    A[g[Math.floor(i / 80)] * 81 + g[i % 80]]),
  crop: positions.map(i =>
    A[(Math.floor(i / 80) + 1) * 81 + i % 80 + 1])
};
const state = C.map((_, i) => {
  const byte = grid.bytes[(6561 + i - 1) % 256];
  return 2 * Math.floor(byte / 60) + (byte % 60) % 2;
});
assert.deepEqual(Array.from({ length: 10 }, (_, s) =>
  state.filter(z => z === s).length),
[899, 600, 799, 650, 750, 875, 725, 675, 174, 248]);
const mod = v => (v % 29 + 29) % 29;

/**
 * The 29 nonvertical linear directions normalize b != 0 to
 * C+lambda*K; the one vertical direction b=0 normalizes to K.
 * Scaling by b and adding d only permute the 29 output labels.
 * Each direction's top-k histogram is therefore a universal bound
 * for all secret nonzero linear first-output rows in that direction.
 * The sum of independently optimized per-state maxima is an upper
 * bound even if the chosen top-k rune labels differ across states.
 *
 * @param {number[]} key
 * @param {number[]} cipher
 * @returns {{topK:number[],stateRows:Array<{state:number,n:number,topOne:number,slopes:number[]}>}}
 */
function affineEnvelope(key, cipher) {
  assert.equal(key.length, 6395);
  assert.equal(cipher.length, 6395);
  const slots = Array.from({ length: 10 }, () => []);
  for (let i = 0; i < cipher.length; i++) slots[state[i]].push(i);
  const topK = Array(29).fill(0);
  const stateRows = [];
  for (let s = 0; s < slots.length; s++) {
    const best = Array(29).fill(0);
    const leaders = [];
    for (let direction = 0; direction <= 29; direction++) {
      const counts = Array(29).fill(0);
      for (const i of slots[s]) {
        const output = direction === 29
          ? key[i] : (cipher[i] + direction * key[i]) % 29;
        counts[output]++;
      }
      counts.sort((a, b) => b - a);
      let total = 0;
      for (let k = 0; k < 29; k++) {
        total += counts[k];
        if (total > best[k]) best[k] = total;
      }
      leaders.push({ direction, maxCount: counts[0] });
    }
    for (let k = 0; k < 29; k++) topK[k] += best[k];
    stateRows.push({
      state: s,
      n: slots[s].length,
      topOne: best[0],
      slopes: leaders.filter(x => x.maxCount === best[0])
        .map(x => x.direction)
    });
  }
  assert.equal(topK[28], 6395);
  return { topK, stateRows };
}


/**
 * More permissive next-degree triangle: every independent p50 state may
 * use ANY hidden quadratic GF29 shift of the source rune K:
 *    P=b*C+u*K*K+v*K+d, b!=0.
 * Normalizing by b leaves 29^2 possible (u,v) first outputs; scaling
 * and d again only permute output classes. A first output independent
 * of C must be an injective quadratic in K for invertible pair mixing.
 * In odd-characteristic GF29, a nonconstant quadratic is not injective,
 * so the only legal missing direction is vertical K.
 *
 * @param {number[]} key
 * @param {number[]} cipher
 */
function quadraticTopOneEnvelope(key,cipher){
  const slots=Array.from({length:10},()=>[]);
  for(let i=0;i<cipher.length;i++)slots[state[i]].push(i);
  let upper=0;
  const rows=[];
  for(let st=0;st<10;st++){
    let best=0;
    const args=[];
    for(let u=0;u<29;u++)for(let v=0;v<29;v++){
      const f=new Uint16Array(29);
      for(const i of slots[st]){
        const k=key[i];
        f[(cipher[i]+u*k*k+v*k)%29]++;
      }
      const top=Math.max(...f);
      if(top>best){best=top;args.length=0;args.push([u,v]);}
      else if(top===best)args.push([u,v]);
    }
    const vertical=new Uint16Array(29);
    for(const i of slots[st])vertical[key[i]]++;
    const verticalTop=Math.max(...vertical);
    const cap=Math.max(best,verticalTop);
    rows.push({state:st,n:slots[st].length,cap,
      quadraticBest:best,verticalTop,optimalPairs:args.length});
    upper+=cap;
  }
  return {topOne:upper,rows};
}

/**
 * Boundary control: ANY independently secret GP29 permutation of C
 * at every (p50 state,K) pair. A 29-way bijection has exactly one
 * selected C index producing any designated output symbol. Each
 * row contributes at most its most frequent C. More generally,
 * the sum of top-k row counts bounds any k output symbols.
 * This class is *strictly more permissive* than polynomial shifts.
 * @param {number[]} key
 * @param {number[]} cipher
 */
function arbitrarySourceKeySubstitutionEnvelope(key,cipher){
  const rows=Array.from({length:10*29},()=>Array(29).fill(0));
  for(let i=0;i<cipher.length;i++)
    rows[29*state[i]+key[i]][cipher[i]]++;
  const cap=Array(29).fill(0);
  for(const row of rows){
    row.sort((a,b)=>b-a);
    let acc=0;
    for(let k=0;k<29;k++){acc+=row[k];cap[k]+=acc;}
  }
  return cap;
}

/** @param {number[]} source @returns {number[]} */
function topHistogram(source) {
  const counts = Array(29).fill(0);
  for (const v of source) counts[v]++;
  counts.sort((a, b) => b - a);
  let sum = 0;
  return counts.map(v => (sum += v));
}

/** Exact modular inverse for nonzero b in GF(29). */
function inverse(b) {
  for (let x = 1; x < 29; x++) if (mod(x * b) === 1) return x;
  throw new Error("Expected nonzero field element");
}

const corpusFiles = {
  Gibran: "resources/control/gibran_prophet_58585.txt",
  Shakespeare: "resources/control/shakespeare_first300k.txt"
};
const controls = Object.fromEntries(Object.entries(corpusFiles)
  .map(([name, file]) => [name, encodeSourceNativeGP(read(file))]));
assert.deepEqual(Object.fromEntries(Object.entries(controls)
  .map(([name, x]) => [name, x.length])),
{ Gibran: 62492, Shakespeare: 217106 });
const nativeFirst = controls.Gibran.slice(0, C.length);
assert.equal(topHistogram(nativeFirst)[0], 755);

const findings = {};
for (const [name, key] of Object.entries(K)) {
  const original = affineEnvelope(key, C);
  assert.equal(original.topK[0], name === "field" ? 375 : 381);
  assert.equal(original.topK[4], name === "field" ? 1571 : 1565);
  assert.equal(original.topK[9], name === "field" ? 2838 : 2850);

  const quadratic=quadraticTopOneEnvelope(key,C);
  assert.equal(quadratic.topOne,name==="field"?418:426);
  const arbitrarySourceKey=arbitrarySourceKeySubstitutionEnvelope(key,C);
  assert.equal(arbitrarySourceKey[0],name==="field"?828:853);
  assert.equal(arbitrarySourceKey[4],name==="field"?3084:3082);
  assert.equal(arbitrarySourceKey[9],name==="field"?4767:4758);

  // Planted source-keyed quadratic, fully invertible in the cipher operand.
  const quadraticPlant=nativeFirst.map((plain,i)=>{
    const st=state[i],k=key[i];
    return mod(plain-(st+3)*k*k-(2*st+5)*k-(3*st+7));
  });
  assert.deepEqual(quadraticPlant.map((ci,i)=>{
    const st=state[i],k=key[i];
    return mod(ci+(st+3)*k*k+(2*st+5)*k+(3*st+7));
  }),nativeFirst);
  assert.ok(quadraticTopOneEnvelope(key,quadraticPlant).topOne>=755);

  // Complete native-GP positive plant under a different source-derived,
  // state-specific invertible affine first-output for each of ten states.
  const cipherPlant = nativeFirst.map((plain, i) => {
    const s = state[i], a = (7 * s + 3) % 29;
    const b = s + 1, d = (11 * s + 1) % 29;
    return mod((plain - a * key[i] - d) * inverse(b));
  });
  const decoded = cipherPlant.map((cipher, i) => {
    const s = state[i], a = (7 * s + 3) % 29;
    const b = s + 1, d = (11 * s + 1) % 29;
    return mod(a * key[i] + b * cipher + d);
  });
  assert.deepEqual(decoded, nativeFirst);
  const plantCap = affineEnvelope(key, cipherPlant).topK;
  const trueTop = topHistogram(nativeFirst);
  assert.ok(trueTop.every((v, i) => v <= plantCap[i]));

  const windows = {};
  for (const [author, source] of Object.entries(controls)) {
    const step = Math.floor(C.length / 3);
    let count = 0, failing = 0, minimumTop = Infinity;
    let maximumTop = 0;
    for (let offset = 0; offset + C.length <= source.length;
      offset += step) {
      const freq = topHistogram(source.slice(offset, offset + C.length));
      count++;
      minimumTop = Math.min(minimumTop, freq[0]);
      maximumTop = Math.max(maximumTop, freq[0]);
      if (freq[0] > original.topK[0]) failing++;
    }
    assert.equal(failing, count);
    windows[author] = {
      windows: count, excludedByTopOne: failing,
      nativeTopRuneRange: [minimumTop, maximumTop]
    };
  }
  findings[name] = {
    independentQuadraticTopOneMaximum: quadratic.topOne,
    independentQuadraticStateBounds: quadratic.rows,
    arbitraryStateKeySubstitutionTopOneMaximum: arbitrarySourceKey[0],
    arbitraryStateKeySubstitutionTopFiveMaximum: arbitrarySourceKey[4],
    arbitraryStateKeySubstitutionTopTenMaximum: arbitrarySourceKey[9],
    plantedQuadraticFullyRecoveredRunes: quadraticPlant.length,
    originalTopOneMaximum: original.topK[0],
    originalTopFiveMaximum: original.topK[4],
    originalTopTenMaximum: original.topK[9],
    originalStateBounds: original.stateRows,
    controls: windows,
    sourceNativePlantRecoveredRunes: decoded.length,
    sourceNativePlantTopOneCapacity: plantCap[0],
    sourceNativePlantActualTopOne: trueTop[0]
  };
}
assert.deepEqual([
  findings.field.controls.Gibran.windows,
  findings.field.controls.Shakespeare.windows
], [27, 99]);
console.log(JSON.stringify({
  status: "PASS",
  source: "Original GP29 81x81/80x80 bookend; p50 global predecessor-byte ten-state first-digit x parity",
  theorem: "For every state-specific invertible GF29 affine 841-pair mixer (any secret a,b,d with (a,b)!=0 and any hidden second output), the exact upper bound on any k plaintext label counts is the sum of the maximal top-k counts over 30 projective output directions in each original p50 state.",
  result: findings,
  conclusion: "All ten-state GF29 affine and source-keyed quadratic shifts are excluded for pinned native-GP English donor frequencies on this original source. Arbitrary source-key-indexed GP29 substitution survives this necessary bound, and the larger nonlinear 841! S-box family remains unexcluded. No unknown plaintext or key recovered."
}, null, 2));
