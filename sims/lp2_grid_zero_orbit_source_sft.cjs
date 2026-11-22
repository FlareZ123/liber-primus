"use strict";
/**
 * Original LP2 256-byte grid as a deterministic byte-transition graph.
 * Reproduce source cycles, a multiset-preserving geometric null, and a
 * constrained lossless ciphertext/plaintext-feedback GP29 inverse.
 *
 * Run: node sims/lp2_grid_zero_orbit_source_sft.cjs
 * Optional: LP2_ORBIT_NULLS=250000
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const load = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const source = load("resources/liber-primus/lp2-grid-256.json");
const corpus = load("resources/liber-primus/lp2-corpus.json");
const bytes = source.bytes;
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(bytes.length, 256);
assert.equal(pages.reduce((n, p) => n + p.indices.length, 0), 12956);
const indices = Array.from({length: 256}, (_, i) => i);
const globalColumns = indices.map(i => 8 * (i % 32) + Math.floor(i / 32));
const perPageColumns = indices.map(i => {
  const start = i < 80 ? 0 : i < 184 ? 80 : 184;
  const height = i < 80 ? 10 : i < 184 ? 13 : 9;
  const offset = i - start;
  return start + 8 * (offset % height) + Math.floor(offset / height);
});
const views = {
  row: indices,
  rowReverse: indices.slice().reverse(),
  col: globalColumns,
  colReverse: globalColumns.slice().reverse(),
  pageCol: perPageColumns,
  pageColReverse: perPageColumns.slice().reverse()
};
const visible = name => views[name].map(i => bytes[i]);

/**
 * Follow the byte at the indexed lookup until a state recurs.
 * @param {ArrayLike<number>} table
 * @returns {{tail:number,period:number,states:number[]}}
 */
function orbit(table) {
  const seen = new Int16Array(256).fill(-1);
  const states = [];
  let state = 0;
  while (seen[state] === -1) {
    seen[state] = states.length;
    states.push(state);
    state = table[state];
  }
  const tail = seen[state];
  return {tail, period: states.length - tail, states: states.slice(tail)};
}
const sourceOrbits = Object.fromEntries(Object.keys(views).map(v => [v, orbit(visible(v))]));
assert.deepEqual(sourceOrbits.row, {
  tail: 0, period: 11, states: [0,203,68,199,47,76,114,197,115,247,192]
});
assert.deepEqual(sourceOrbits.pageCol, {
  tail: 0, period: 8, states: [0,203,159,56,171,65,199,234]
});
assert.deepEqual(Object.values(sourceOrbits).map(o => o.tail === 0 ? o.period : 0),
  [11,0,0,0,8,0]);

/** @returns {number[][]} All directed cycles, without duplicate components. */
function graphCycles(table) {
  const done = new Uint8Array(256);
  const cycles = [];
  for (let start = 0; start < 256; start++) {
    if (done[start]) continue;
    const order = new Map();
    const path = [];
    let state = start;
    while (!order.has(state) && !done[state]) {
      order.set(state, path.length);
      path.push(state);
      state = table[state];
    }
    if (order.has(state)) cycles.push(path.slice(order.get(state)));
    for (const value of path) done[value] = 1;
  }
  return cycles;
}
assert.deepEqual(graphCycles(bytes), [
  [0,203,68,199,47,76,114,197,115,247,192],
  [249,158]
]);

let rngState = 3301;
/** Deterministic xorshift32, with rejection sampling for exact bounded draws. */
function random32() {
  rngState ^= rngState << 13;
  rngState ^= rngState >>> 17;
  rngState ^= rngState << 5;
  return rngState >>> 0;
}
function uniform(limit) {
  const upper = 4294967296 - (4294967296 % limit);
  let sample;
  do { sample = random32(); } while (sample >= upper);
  return sample % limit;
}
const shuffled = Uint8Array.from(bytes);
function shufflePreservingMultiset() {
  shuffled.set(bytes);
  for (let i = 255; i > 0; i--) {
    const j = uniform(i + 1);
    const t = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = t;
  }
}
function periodFromZeroOnView(view) {
  const seen = new Int16Array(256).fill(-1);
  let state = 0, steps = 0;
  while (seen[state] === -1) {
    seen[state] = steps++;
    state = shuffled[view[state]];
  }
  return seen[state] === 0 ? steps : 0;
}
/** @param {number} repetitions */
function selectedNull(repetitions) {
  let exact = 0, orientationAdjusted = 0, sixViewAdjusted = 0;
  for (let i = 0; i < repetitions; i++) {
    shufflePreservingMultiset();
    const p = Object.values(views).map(periodFromZeroOnView);
    if (p[0] === 11 && p[4] === 8) exact++;
    if ((p[0] === 11 || p[1] === 11) && (p[4] === 8 || p[5] === 8))
      orientationAdjusted++;
    if (p.includes(11) && p.includes(8)) sixViewAdjusted++;
  }
  return {repetitions, exact, orientationAdjusted, sixViewAdjusted,
    smoothed: [exact,orientationAdjusted,sixViewAdjusted].map(n => (n+1)/(repetitions+1))};
}
const mod29 = x => ((x % 29) + 29) % 29;
function score(values) {
  const counts = new Int32Array(29);
  for (const value of values) counts[value]++;
  const n = values.length;
  return {n, ioc: counts.reduce((a, x) => a + x*(x-1), 0)/(n*(n-1)),
    top12: Array.from(counts).sort((a, b) => b - a).slice(0, 12).reduce((a,b) => a+b, 0)/n};
}
/**
 * A bijective model: C_i = P_i - sign*state_i (mod29), with
 * state_(i+1) = grid[(state_i XOR/add feedback_i) mod256].
 * feedback_i is the published ciphertext or recovered plaintext.
 * @typedef {{table:number[],seed:number,mix:string,feedback:string,
 * reset:string,sign:number}} Model
 * @param {number[][]} inputPages
 * @param {Model} model
 * @param {boolean} encrypt
 * @returns {number[][]}
 */
function transform(inputPages, model, encrypt) {
  let state = model.seed;
  return inputPages.map(page => {
    if (model.reset === "page") state = model.seed;
    return page.map(symbol => {
      const c = encrypt ? mod29(symbol - model.sign*(state%29)) : symbol;
      const p = encrypt ? symbol : mod29(c + model.sign*(state%29));
      const feedback = model.feedback === "cipher" ? c : p;
      const index = model.mix === "xor" ? state ^ feedback : (state + feedback) & 255;
      state = model.table[index];
      return encrypt ? c : p;
    });
  });
}
function invertTest() {
  const sourcePages = pages.map(p => p.indices);
  const split = pages.map(p => p.page < 28);
  const stats = [];
  for (const name of ["row", "pageCol"])
    for (const seed of [0,24])
      for (const mix of ["add","xor"])
        for (const feedback of ["cipher","plain"])
          for (const reset of ["page","book"])
            for (const sign of [-1,1]) {
              const model = {table:visible(name),seed,mix,feedback,reset,sign};
              const recovered = transform(sourcePages,model,false);
              assert.deepEqual(transform(recovered,model,true),sourcePages);
              const train=[],hold=[];
              for (let i=0;i<pages.length;i++) (split[i]?train:hold).push(...recovered[i]);
              stats.push({name,seed,mix,feedback,reset,sign,train:score(train),hold:score(hold)});
            }
  const plant = sourcePages.map((p,i) => p.map((_,j) => (i*13+j*17+7)%29));
  const model = {table:visible("pageCol"),seed:24,mix:"xor",
    feedback:"plain",reset:"book",sign:-1};
  assert.deepEqual(transform(transform(plant,model,true),model,false),plant);
  const sorted = stats.slice().sort((a,b) => b.train.ioc - a.train.ioc);
  const rawTrain = [], rawHold = [];
  for (let i=0;i<pages.length;i++) (split[i]?rawTrain:rawHold).push(...sourcePages[i]);
  return {models:stats.length,raw:{train:score(rawTrain),hold:score(rawHold)},
    selected:sorted[0],heldoutRange:[
      Math.min(...stats.map(x=>x.hold.ioc)),Math.max(...stats.map(x=>x.hold.ioc))]};
}
const repetitions = Number(process.env.LP2_ORBIT_NULLS || 250000);
assert(Number.isInteger(repetitions) && repetitions >= 1);
console.log(JSON.stringify({
  input:"lp2-grid-256.json / lp2-corpus.json",
  sourceOrbits, sourceGraphCycles:graphCycles(bytes),
  null:selectedNull(repetitions), losslessCipher:invertTest()
},null,2));
