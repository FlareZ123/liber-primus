"use strict";
/**
 * Source-only LP2 red-ink dual-GP checksum and 15x15/16x16 gnomon test.
 * Original ciphertext remains unsolved. No file writes or hidden keys.
 * Read-only SFT, CommonJS, tested against exact source JSON.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {events} = require("./red_256_event_key_inverse.cjs");

const root = path.resolve(__dirname, "..");
const read = rel => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const numeric = read("resources/liber-primus/base60-grid.json");
const mod = (x, m = 29) => (x % m + m) % m;

const stream = events();
const red = stream.filter(e => e.kind === 1);
const marks = stream.filter(e => e.kind === 0);
assert.equal(stream.length, 256);
assert.equal(red.length, 225);
assert.equal(marks.length, 31);
assert.equal(marks.filter(e => e.inkColor === "black").length, 1);

/** @param {number[]} runes */
function twoSums(runes) {
  return {index: runes.reduce((a,b)=>a+b,0),
    prime: runes.reduce((a,b)=>a+corpus.prime[b],0)};
}

const redValues = red.map(e => e.value);
const total = twoSums(redValues);
const red40 = red.filter(e => e.page === 40);
const p40 = twoSums(red40.map(e => e.value));
assert.deepEqual(total,{index:3103,prime:11252});
assert.deepEqual(p40,{index:116,prime:435});
assert.equal(red40.length,8);
assert.ok(total.index % 29 === 0 && total.prime % 29 === 0);
assert.ok(p40.index % 29 === 0 && p40.prime % 29 === 0);

/** Exact cyclic source-page test; p40 has eight consecutive red title glyphs. */
function p40PhaseTest() {
  const seq = corpus.pages[40].indices;
  const offsets = red40.map(e => e.offset);
  const satisfied = [];
  let indexZero = 0;
  let primeZero = 0;
  for (let shift = 0; shift < seq.length; shift++) {
    const xs = offsets.map(offset => seq[(offset + shift) % seq.length]);
    const sums = twoSums(xs);
    if (sums.index % 29 === 0) indexZero++;
    if (sums.prime % 29 === 0) primeZero++;
    if (sums.index % 29 === 0 && sums.prime % 29 === 0)
      satisfied.push(shift);
  }
  assert.equal(seq.length,231);
  assert.deepEqual(satisfied,[0]);
  return {shifts:seq.length,indexZero,primeZero,dualZeroShifts:satisfied};
}

/**
 * Conditional illustrative null: circularly reposition each complete original
 * red-position mask independently within its own physical page. This does not
 * model the author's actual heading placement or correct for discovery.
 */
function shiftedInkNull(trials=60000) {
  const pages = ink.pages.filter(p => (p.red_spans || []).length).map(p => ({
    page:p.page,
    runes:corpus.pages[p.page].indices,
    offsets:p.red_spans.flatMap(s =>
      Array.from({length:s.length},(_,j)=>s.start+j))
  }));
  let state = 0xc031b01c;
  /** @returns {number} */
  function next() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  }
  let totalDoubleZero = 0, p40DoubleZero = 0, jointDoubleZero = 0;
  for (let t=0; t<trials; t++) {
    let sumIndex=0,sumPrime=0,p40Index=0,p40Prime=0;
    for (const p of pages) {
      const shift=next()%p.runes.length;
      for(const off of p.offsets) {
        const v=p.runes[(off+shift)%p.runes.length];
        sumIndex+=v;
        sumPrime+=corpus.prime[v];
        if(p.page===40) {p40Index+=v;p40Prime+=corpus.prime[v];}
      }
    }
    const a=mod(sumIndex)===0&&mod(sumPrime)===0;
    const b=mod(p40Index)===0&&mod(p40Prime)===0;
    totalDoubleZero+=Number(a);
    p40DoubleZero+=Number(b);
    jointDoubleZero+=Number(a&&b);
  }
  return {trials,seed:"0xc031b01c",totalDoubleZero,
    p40DoubleZero,jointDoubleZero};
}

/**
 * Fixed gnomon test: 225 chronological red GP symbols in 15x15 interior,
 * 31 stencil positions as the last row+column of a 16x16 register.
 * The printed 32x8 byte table is reshaped row-major into 16x16.
 * A direct source-border GP29 additive rule predicts the interior from
 * the three known table border cells: g[r][15]+g[15][c]-g[15][15].
 */
function rotateClockwise(matrix) {
  const n=matrix.length;
  return Array.from({length:n},(_,r)=>
    Array.from({length:n},(_,c)=>matrix[n-1-c][r]));
}
function borderMatches(G,R) {
  let matches=0;
  const rowMatches=Array(15).fill(0);
  for(let r=0;r<15;r++)for(let c=0;c<15;c++){
    const predicted=mod(R[r][c]+G[r][15]+G[15][c]-G[15][15]);
    if(mod(G[r][c])===predicted){
      matches++;
      rowMatches[r]++;
    }
  }
  return {matches,rowMatches};
}
/**
 * Four-orientation extension of the source-fixed gnomon model.
 * The p40 red title has index-sum quotient 4, motivating exactly the four
 * 90-degree rotations (no reflections or arbitrary traversal variants).
 * In every orientation, retain the chronological red-rune 15x15 matrix and
 * apply the same bottom/right border-key equation to the rotated 16x16 grid.
 */
function borderModel() {
  assert.equal(numeric.byte_rows.length,32);
  const flat=numeric.byte_rows.flat();
  assert.equal(flat.length,256);
  const G0=Array.from({length:16},(_,r)=>flat.slice(r*16,r*16+16));
  const R=Array.from({length:15},(_,r)=>redValues.slice(r*15,r*15+15));
  const orientations=[];
  let G=G0;
  for(let rotation=0;rotation<4;rotation++){
    orientations.push({rotationDegrees:rotation*90,...borderMatches(G,R)});
    G=rotateClockwise(G);
  }
  assert.deepEqual(orientations.map(x=>x.matches),[8,9,6,8]);

  // Positive control: construct a grid whose interior obeys the declared
  // source-border rule, then mutate exactly one interior cell.
  const synthetic=G0.map(row=>row.slice());
  for(let r=0;r<15;r++)for(let c=0;c<15;c++)
    synthetic[r][c]=mod(R[r][c]+G0[r][15]+G0[15][c]-G0[15][15]);
  const planted=borderMatches(synthetic,R).matches;
  const mutatedGrid=synthetic.map(row=>row.slice());
  mutatedGrid[0][0]=mod(mutatedGrid[0][0]+1);
  const mutated=borderMatches(mutatedGrid,R).matches;
  assert.equal(planted,225);
  assert.equal(mutated,224);
  return {
    realMatchesByRotation:orientations,
    maximumRealMatches:Math.max(...orientations.map(x=>x.matches)),
    randomMatchExpectation:225/29,
    plantedSourceCorrect:planted,
    mutatedSourceCorrect:mutated
  };
}

/**
 * Literal prime-rank of the p40 red eight-rune title, the same ordering
 * operation historically used on Cicada's eight-column PATIENCE keyword.
 * Full 8! order comparison is conditional on the already-selected sources.
 */
function redTitleColumnOrder(view) {
  const idx=red40.map(e=>e.value);
  const order=Array.from({length:8},(_,i)=>i).sort(
    (i,j)=>corpus.prime[idx[i]]-corpus.prime[idx[j]]||i-j);
  assert.deepEqual(order,[0,4,7,1,2,5,6,3]);
  const grid=numeric.byte_rows;
  const table=Array.from({length:8},(_,source)=>
    Array.from({length:8},(_,col)=>
      grid.reduce((sum,row,r)=>sum+
        Number(stream[8*r+source].value ===
          (view==="low5"?(row[col]&31):row[col]%29)),0)));
  const score=permutation=>permutation.reduce((n,col,i)=>n+table[i][col],0);
  const baseline=score(order);
  let rankAtLeast=0,comparisons=0;
  /** @param {number[]} perm @param {number[]} remaining */
  function visit(perm,remaining) {
    if(remaining.length===0) {
      comparisons++;
      rankAtLeast+=Number(score(perm)>=baseline);
      return;
    }
    for(let i=0;i<remaining.length;i++)
      visit([...perm,remaining[i]],
        [...remaining.slice(0,i),...remaining.slice(i+1)]);
  }
  visit([],Array.from({length:8},(_,i)=>i));
  assert.equal(comparisons,40320);
  const expected=view==="low5"?[8,20089]:[10,17487];
  assert.deepEqual([baseline,rankAtLeast],expected);
  return {view,primeRankedOrder:order,matches:baseline,
    permutationOrders:comparisons,ordersAtLeast:rankAtLeast};
}

function run() {
  return {classification:"exact source arithmetic; candidate geometry, not decryption",
    counts:{redRunes:red.length,thirteenDotMarks:marks.length,
      totalEvents:stream.length,redSquareSide:15,gnomonOuterSide:16},
    dual29Closure:{
      allRed:{...total,indexQuotient:total.index/29,
        primeQuotient:total.prime/29},
      page40Red:{...p40,indexQuotient:p40.index/29,
        primeQuotient:p40.prime/29}},
    page40Cyclic:p40PhaseTest(),
    conditionalPageRotationNull:shiftedInkNull(),
    literalGnomonBorderInverse:borderModel(),
    redTitleColumnComparisons:[
      redTitleColumnOrder("low5"),
      redTitleColumnOrder("mod29")
    ]};
}

if(require.main===module) console.log(JSON.stringify(run(),null,2));
module.exports={twoSums,p40PhaseTest,shiftedInkNull,borderModel,
  redTitleColumnOrder,run};