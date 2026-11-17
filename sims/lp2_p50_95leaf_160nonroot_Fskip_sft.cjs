"use strict";

/**
 * 256-node source-absent-f rooted map, with the solved p56 plaintext-F
 * interruption removed and a unique root left unassigned.
 *
 * Source part count: p57 clear 95 -> leaves 95,
 * p56 85 minus its one literal plaintext-F -> internals 84,
 * p55 unknown 76 -> internals 76,
 * p50 base59 graph self-root 189 -> unassigned root 1.
 *
 * Test the natural zero-key parent-sum operation against 84 known
 * independently solved plaintext runes, both raw and root-normalized.
 * Parent addition is hypothetical and fails. All maps deterministic.
 *
 * Windows Node 22: node sims/lp2_p50_95leaf_160nonroot_Fskip_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");

/** @param {string} filename @returns {any} */
function json(filename) {
  return JSON.parse(fs.readFileSync(path.join(root,
    "resources", "liber-primus", filename), "utf8"));
}

const gp = json("lp2-corpus.json");
const table = json("base60-grid.json");
const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx";
const cells = table.rows.flat();
assert.equal(cells.length, 256);
assert.equal(alphabet.length, 59);
const next = cells.map(pair =>
  59 * alphabet.indexOf(pair[0]) + alphabet.indexOf(pair[1]));
assert(next.every(n => n >= 0 && n < 256));
const indegree = Array(256).fill(0);
const children = Array.from({length:256}, () => []);
next.forEach((v, i) => {
  indegree[v]++;
  if (v !== i) children[v].push(i);
});
const self = next.flatMap((v, i) => v === i ? [i] : []);
assert.deepEqual(self, [189]);

const preorder = [], postorder = [];
/** @param {number} node */
function visit(node) {
  preorder.push(node);
  for (const child of children[node]) visit(child);
  postorder.push(node);
}
visit(189);
assert.equal(new Set(preorder).size, 256);

const leaves = {
  address:Array.from({length:256}, (_, i) => i).filter(i=>indegree[i]===0),
  dfs:preorder.filter(i=>indegree[i]===0)
};
const nonroot = {
  address:Array.from({length:256}, (_, i) => i)
    .filter(i=>indegree[i]>0 && i!==189),
  dfs:preorder.filter(i=>indegree[i]>0 && i!==189),
  post:postorder.filter(i=>indegree[i]>0 && i!==189)
};
assert.equal(leaves.address.length, 95);
assert.equal(nonroot.address.length, 160);
assert.equal(gp.pages[55].indices.length, 76);
assert.equal(gp.pages[56].indices.length, 85);
const clear = gp.pages[57].indices;
assert.equal(clear.length, 95);

const p56Words = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const tokens = gp.translit.map((name, i) => ({name, i}))
  .sort((a, b) => b.name.length - a.name.length);
/** @param {string} phrase @returns {number[]} */
function encodeGP(phrase) {
  const out = [];
  for (const word of phrase.split(" ")) {
    for (let i = 0; i < word.length;) {
      const t = tokens.find(t => word.startsWith(t.name, i));
      assert(t, "unmapped known-plaintext token");
      out.push(t.i);
      i += t.name.length;
    }
  }
  return out;
}
const clearP56 = encodeGP(p56Words);
assert.equal(clearP56.length, 85);
assert.equal(clearP56.filter(x=>x===0).length, 1);
assert.equal(clearP56.findIndex(x=>x===0), 56);
const clearP56Consuming = clearP56.filter(x => x !== 0);
assert.equal(clearP56Consuming.length, 84);

let count = 0;
/** @param {number} p @returns {boolean} */
function prime(p) {
  for (let i = 2; i*i <= p; i++) if (p%i===0) return false;
  return p>=2;
}
const primeClock = [];
for (let k = 2; primeClock.length < 84; k++) {
  if (prime(k)) primeClock.push(k - 1);
}
/** @param {number} x @returns {number} */
const mod = x => (x%29+29)%29;
const printedP56 = clearP56.map(p =>
  p===0 ? 0 : mod(p + primeClock[count++]));
assert.equal(count, 84);
assert.deepEqual(printedP56, gp.pages[56].indices);

const details = [];
for (const [leafOrder, ids] of Object.entries(leaves)) {
  for (const [internalOrder, inner] of Object.entries(nonroot)) {
    for (const weights of ["index", "prime"]) {
      for (const backwards of [false, true]) {
        const values = Array(256).fill(-1);
        ids.forEach((node, i) => {
          const rune = clear[backwards ? 94-i : i];
          values[node] = weights==="prime" ? gp.prime[rune]%29 : rune;
        });
        /** @param {number} i @returns {number} */
        function derive(i) {
          if (values[i]>=0) return values[i];
          values[i] = children[i].reduce((sum, child) =>
            sum + derive(child), 0)%29;
          return values[i];
        }
        derive(189);
        assert(values.every(x=>x>=0 && x<29));
        const rootValue=values[189];
        const predicted=inner.slice(76).map(i=>values[i]);
        assert.equal(predicted.length, 84);
        const raw=predicted.filter((v,i) =>
          v===clearP56Consuming[i]).length;
        const rootZero=predicted.filter((v,i) =>
          mod(v-rootValue)===clearP56Consuming[i]).length;
        details.push({leafOrder,internalOrder,weights,
          backwards,rootValue,raw,rootZero});
      }
    }
  }
}
assert.equal(details.length, 24);
const bestRaw=Math.max(...details.map(x=>x.raw));
const bestRootZero=Math.max(...details.map(x=>x.rootZero));
assert.equal(bestRaw, 7);
assert.equal(bestRootZero, 5);
const primeRoot=details.filter(x=>x.weights==="prime")
  .map(x=>x.rootValue);
assert(primeRoot.every(x=>x===24));
const clearPrimeSum=clear.reduce((s,r)=>s+gp.prime[r],0);
assert.equal(clearPrimeSum, 3968);
assert.equal(clearPrimeSum%29, 3301%29);
const solvedIndexTotal=clearP56.concat(clear)
  .reduce((s,r)=>s+r,0);
assert.equal(solvedIndexTotal, 76*29);

// Source-shaped native geometry positive: create fresh leaf symbol labels, make
// every internal label with the same graph recurrence, and select a plant
// with exactly the one visible plaintext F inserted at source p56 offset56.
let plantSeed = -1, synthetic, plantedP55, plantedP56;
for (let seed = 1; seed <= 1024 && plantSeed === -1; seed++) {
  let state = seed;
  const take = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state>>>0)%29;
  };
  const trial = Array(256).fill(-1);
  leaves.address.forEach(node => {trial[node]=take();});
  /** @param {number} node @returns {number} */
  function propagate(node) {
    if(trial[node]>=0) return trial[node];
    return trial[node]=children[node].reduce((s,i)=>s+propagate(i),0)%29;
  }
  propagate(189);
  const labels = nonroot.address.map(node => trial[node]);
  const terminalKnown = labels.slice(76);
  if (terminalKnown.includes(0)) continue;
  synthetic=trial;plantedP55=labels.slice(0,76);
  plantedP56=terminalKnown;plantSeed=seed;
}
assert(plantSeed>0);
assert.equal(plantedP55.length,76);
assert.equal(plantedP56.length,84);
const plantedComplete=plantedP56.slice();
plantedComplete.splice(56,0,0);
assert.equal(plantedComplete.length,85);
let plantedClock=0;
const plantedCipher=plantedComplete.map(p=>
  p===0 ? 0 : mod(p+primeClock[plantedClock++]));
assert.equal(plantedClock,84);
let inverseClock=0;
const recovered=plantedCipher.map((c,i)=>
  i===56 ? 0 : mod(c-primeClock[inverseClock++]));
assert.equal(inverseClock,84);
assert.deepEqual(recovered,plantedComplete);
assert.deepEqual(recovered.filter(x=>x!==0),nonroot.address
  .slice(76).map(i=>synthetic[i]));

console.log(JSON.stringify({
  classification:"original source geometry; 24 finite root-excluded inversions fail held-out p56",
  original:{
    p50Cells:256,absentLowercaseF:true,root:189,leaves:95,
    internalNonroot:160,p55:76,p56:85,p56TransparentFIndex:56,
    p56Consuming:84,p57:95,
    p57PrimeSum:clearPrimeSum,p57PrimeMod29:clearPrimeSum%29,
    solvedP56P57IndexSum:solvedIndexTotal,
    indexSumEquals29TimesP55:solvedIndexTotal===29*76
  },
  sourceExactP56Reencrypted:printedP56.length,
  testedModels:details.length,best84Raw:bestRaw,best84RootZero:bestRootZero,
  models:details,
  decision:"Root omission resolves the source count but a leaf-sum parent decoder misses at least 77 of 84 known p56 runes; no unknown plaintext."
},null,2));
