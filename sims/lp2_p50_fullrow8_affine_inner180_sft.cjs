"use strict";
/**
 * Original LP2 32x8 numeral table: all-secret full-eight-input affine
 * row receiver against six known GP29 terminal interior symbols.
 *
 * Node.js 22, CommonJS, source-only single-file test; reads repository
 * corpus and original printed token fixture without any file writes.
 * Hypothesis: each printed table row is one 8-cell GF29 block, and an
 * unknown fixed affine 8->6 map yields the row's six interior targets.
 * The manuscript does not select that alignment or affine operation.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const json = p => JSON.parse(fs.readFileSync(path.join(__dirname, "..", p), "utf8"));
const corpus = json("resources/liber-primus/lp2-corpus.json");
const grid = json("resources/liber-primus/lp2-grid-256.json");
const mod = n => ((n % 29) + 29) % 29;
const token = grid.pages.flatMap(p => p.tokens);
assert.equal(token.length, 256);
assert.deepEqual(grid.pages.map(p => p.tokens.length), [80, 104, 72]);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(corpus.pages[56].indices.length, 85);
assert.equal(corpus.pages[57].indices.length, 95);
assert.equal(grid.alphabet.length, 60);

/** @returns {number[]} The first 84 rational primes in ascending order. */
function primes84() {
  const primes = [];
  for (let n = 2; primes.length < 84; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) primes.push(n);
  }
  return primes;
}
const primes = primes84();
let clock = 0;
const p56 = corpus.pages[56].indices.map((c, i) =>
  i === 56 ? 0 : mod(c - (primes[clock++] - 1)));
assert.equal(clock, 84);
assert.equal(p56.map(i => corpus.translit[i]).join(""),
  "ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTO" +
  "ITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE");
const clear = p56.concat(corpus.pages[57].indices);
const printed = corpus.pages[56].indices.concat(corpus.pages[57].indices);
assert.equal(clear.length, 180);
assert.equal(printed.length, 180);

/**
 * Exact rank over GF29, allowing arbitrary pivot placement.
 * @param {number[][]} rows
 * @returns {number}
 */
function rank(rows) {
  const a = rows.map(r => r.map(mod));
  let pivot = 0;
  for (let col = 0; col < a[0].length && pivot < a.length; col++) {
    let found = pivot;
    while (found < a.length && a[found][col] === 0) found++;
    if (found === a.length) continue;
    [a[pivot], a[found]] = [a[found], a[pivot]];
    let inverse = 1;
    while (mod(a[pivot][col] * inverse) !== 1) inverse++;
    for (let c = col; c < a[0].length; c++) {
      a[pivot][c] = mod(a[pivot][c] * inverse);
    }
    for (let r = 0; r < a.length; r++) {
      if (r === pivot) continue;
      const factor = a[r][col];
      for (let c = col; c < a[0].length; c++) {
        a[r][c] = mod(a[r][c] - factor * a[pivot][c]);
      }
    }
    pivot++;
  }
  return pivot;
}

/**
 * Recover the nine coefficients of a secretly selected affine output
 * on the first nine linearly independent original input rows.
 * @param {number[][]} source 30 original 8+1 input rows
 * @param {number[]} target 30 one-column receiver values
 * @returns {{training:number[],coefficients:number[],heldExact:number,heldCount:number}}
 */
function recover(source, target) {
  const training = [], basis = [];
  for (let r = 0; r < source.length && training.length < 9; r++) {
    if (rank([...basis, source[r]]) > basis.length) {
      basis.push(source[r]); training.push(r);
    }
  }
  assert.equal(training.length, 9);
  const augmented = training.map(i => [...source[i], mod(target[i])]);
  for (let col = 0; col < 9; col++) {
    let pos = col;
    while (pos < 9 && augmented[pos][col] === 0) pos++;
    assert.ok(pos < 9);
    [augmented[col], augmented[pos]] = [augmented[pos], augmented[col]];
    let inv = 1;
    while (mod(augmented[col][col] * inv) !== 1) inv++;
    for (let j = col; j < 10; j++) augmented[col][j] = mod(augmented[col][j] * inv);
    for (let r = 0; r < 9; r++) {
      if (r === col) continue;
      const mul = augmented[r][col];
      for (let j = col; j < 10; j++) {
        augmented[r][j] = mod(augmented[r][j] - mul * augmented[col][j]);
      }
    }
  }
  const coefficients = augmented.map(r => r[9]);
  let heldExact = 0, heldCount = 0;
  for (let r = 0; r < source.length; r++) {
    const predicted = mod(source[r].reduce((s, x, c) => s + x * coefficients[c], 0));
    if (training.includes(r)) assert.equal(predicted, target[r]);
    else {heldCount++; if (predicted === target[r]) heldExact++;}
  }
  return {training,coefficients,heldExact,heldCount};
}

/** @param {number[]} s @returns {number[]} */
function orient(s, mode) {
  if (mode === "reverse") return s.slice().reverse();
  if (mode === "rowsReverse")
    return Array.from({length:30}, (_,r) => s.slice((29-r)*6, (30-r)*6)).flat();
  if (mode === "colsReverse")
    return Array.from({length:30}, (_,r) => s.slice(r*6,r*6+6).reverse()).flat();
  return s.slice();
}
const results = [];
for (const radix of [60, 59]) {
  const alphabet = radix === 60 ? grid.alphabet : grid.alphabet.replace("f","");
  const values = token.map(s => {
    const a = alphabet.indexOf(s[0]), b = alphabet.indexOf(s[1]);
    assert.ok(a >= 0 && b >= 0);
    return mod(a * radix + b);
  });
  const X = Array.from({length:30}, (_,r) => [...values.slice(8*(r+1),8*(r+2)),1]);
  assert.equal(rank(X), 9);
  for (const [targetName,targetSource] of [["solved56-plus-clear57",clear],["printed56-plus-clear57",printed]]) {
    for (const orientation of ["normal","reverse","rowsReverse","colsReverse"]) {
      const target = orient(targetSource, orientation);
      const cols = Array.from({length:6},(_,c)=>Array.from({length:30},(_,r)=>target[r*6+c]));
      const augmented = cols.map(y => rank(X.map((row,i)=>[...row,y[i]])));
      assert.deepEqual(augmented,[10,10,10,10,10,10]);
      const held = cols.map(y=>recover(X,y));
      assert.ok(held.every(x=>x.heldCount===21));
      results.push({radix,targetName,orientation,baseRank:9,augmented,heldMatches:held.map(x=>x.heldExact)});
    }
  }
  // Planted secret affine 8-input -> 6-output map. A source-blind
  // nine-row inference must recover every output on all held-out rows.
  const secret = Array.from({length:6},(_,j)=>
    Array.from({length:9},(_,k)=>mod((j+2)*(k+3)+j*k*k+7)));
  const planted = secret.map(w=>X.map(row=>mod(row.reduce((s,x,k)=>s+x*w[k],0))));
  const controls = planted.map(y=>recover(X,y));
  assert.deepEqual(controls.map(x=>x.heldExact),[21,21,21,21,21,21]);
  assert.ok(planted.every(y=>rank(X.map((row,i)=>[...row,y[i]]))===9));
}
assert.equal(results.length,16);
console.log(JSON.stringify({
  hypothesis:"30 printed 8-cell numeric rows to 180 solved interior GP29 runes under arbitrary stationary affine 8-to-6 map",
  sourceInputRank:9,originalRows:30,tableBytes:256,knownOutput:180,
  allSecretObstruction:"Every known output column raises exact GF29 rank from 9 to 10 in every frozen original-source case",
  testedCases:results,plantedSecretRecovery:"six columns all 21/21 blind holdout rows"
},null,2));
