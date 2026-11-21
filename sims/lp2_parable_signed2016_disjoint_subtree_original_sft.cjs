"use strict";
/**
 * Source-selected PARABLE vs signed-2016 competing 56-subtree graph decision.
 * Standalone Node22 CJS SFT. All inputs are original page/control records;
 * the test never fits a plaintext key or alters a ciphertext rune.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const readJSON = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const corpus = readJSON("resources/liber-primus/lp2-corpus.json");
const grid = readJSON("resources/liber-primus/lp2-grid-256.json");
const token = grid.pages.flatMap(p => p.tokens);
const alphabet = grid.alphabet;
assert.equal(token.length, 256);
assert.equal(alphabet.length, 60);
const parent = token.map(t => 60 * alphabet.indexOf(t[0]) + alphabet.indexOf(t[1]));
assert(parent.every(v => Number.isInteger(v) && v >= 0 && v < 256));

/** All nodes in this address's orbit, including the start and one visit per node. @param {number} n */
function orbit(n) {
  const seen = new Set();
  const visit = [];
  while (!seen.has(n)) {
    seen.add(n);
    visit.push(n);
    n = parent[n];
  }
  return visit;
}
/** @param {number} n @returns {number[]} */
function descendants(n) {
  return Array.from({length: 256}, (_, i) => i)
    .filter(i => orbit(i).includes(n));
}
/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let j = 2; j * j <= n; j++) if (n % j === 0) return false;
  return true;
}
/** Zero-based rank, 2 is ordinal 0. @param {number} prime */
function primeRankZero(prime) {
  assert(isPrime(prime));
  let count = -1;
  for (let j = 2; j <= prime; j++) if (isPrime(j)) count++;
  return count;
}

/** Exact original p57 three signed-era clause factor primes. */
const p57 = corpus.pages.find(p => p.page === 57);
assert.equal(p57.indices.length, 95);
const factors = [p57.indices.slice(7,37),p57.indices.slice(37,67),p57.indices.slice(67,95)]
  .map(x => x.reduce((s,i)=>s + corpus.prime[i],0));
assert.deepEqual(factors,[1259,1031,1229]);
assert.equal(factors.reduce((a,b)=>a*b,1),1595277641);
const ranksZero = factors.map(primeRankZero);
assert.deepEqual(ranksZero, [204,172,200]);
// Published P50-source navigation and original 2013 arithmetic use
// *one-based* ordinal addresses 205,173,201; confirm convention explicitly.
const ranks = ranksZero.map(n=>n+1);
assert.deepEqual(ranks,[205,173,201]);

// The two historically independent source address routes:
const old = [201,74,205];   // Original 2013 PARABLE rank201, p50 transitions
const signed = [20,102,32]; // Signed 2016 THE / DEVOTED GP0, p50 transitions
assert.deepEqual(old.map(n=>parent[n]),[74,205,76]);
assert.deepEqual(signed.map(n=>parent[n]),[102,32,115]);
assert.deepEqual(old.map(n=>descendants(n).length),[56,57,58]);
assert.deepEqual(signed.slice(0,2).map(n=>descendants(n).length),[56,57]);

const parable56 = descendants(201), signed56 = descendants(20);
const parable58 = descendants(205), signed57 = descendants(102);
assert.equal(parable56.length,56);
assert.equal(signed56.length,56);
const setParable56 = new Set(parable56);
assert.equal(signed56.filter(n=>setParable56.has(n)).length,0);
assert(signed57.every(n=>!parable58.includes(n)));
assert(!parable58.includes(32));
assert(!parable58.includes(20));
assert(!parable58.includes(102));
assert(parable58.includes(201));

/** Isomorphism-free canonical rooted tree shape; children unordered. @param {number} rootId @param {number[]} nodes */
function canonicalShape(rootId,nodes) {
  const set = new Set(nodes);
  const children = new Map(nodes.map(n=>[n,[]]));
  for (const n of nodes) if(n!==rootId) {
    assert(set.has(parent[n]));
    children.get(parent[n]).push(n);
  }
  /** @param {number} n */
  function encode(n) {
    return "(" + children.get(n).map(encode).sort().join("") + ")";
  }
  return encode(rootId);
}
const isomorphic56 = canonicalShape(201,parable56) === canonicalShape(20,signed56);
assert.equal(isomorphic56,false);

const op = orbit(201), os = orbit(20);
const shared = op.filter(n=>os.includes(n));
assert.deepEqual(new Set(shared),new Set([76,114,197,115,247,192,0,203,68,199,47]));
assert.equal(shared.length,11);
assert.equal(orbit(201)[1],74);
assert.equal(orbit(20)[1],102);
// As an extra stable holdout: if children are sorted by original row-major
// table position and pages read in bottom-up DFS, the PARABLE 58-tree
// unequivocally places the last three vertices at 201,74,205.
const in58 = new Set(parable58), kids = new Map(parable58.map(n=>[n,[]]));
for (const n of parable58) if(n!==205) kids.get(parent[n]).push(n);
const post=[];
/** @param {number} n */
function dfs(n){for(const c of kids.get(n).sort((a,b)=>a-b)) dfs(c);post.push(n);}
dfs(205);
assert.deepEqual(post.slice(-3),[201,74,205]);
assert.equal(post.indexOf(32),-1);
assert.equal(post.length,58);
console.log(JSON.stringify({
  status:"PASS",
  corpusOriginalUnknownRuneCount:corpus.pages.filter(p=>p.page<56).reduce((s,p)=>s+p.indices.length,0),
  sourceParableFactorSums:factors,
  oneBasedPrimeOrdinalP50Cells:ranks,
  parableNodeChain:old,
  parableDescendantSizes:old.map(n=>descendants(n).length),
  signedTHE_DEVOTED_Physical32:signed,
  signedDescendantSizes:signed.slice(0,2).map(n=>descendants(n).length),
  twoSource56Trees:{sizeEach:56,intersectingNodes:[],unlabeledTreeIsomorphism:isomorphic56},
  signedNode32BelongsToParable58:false,
  sharedDownstream11Cycle:shared,
  sortedChildrenPostorderFinalThree:post.slice(-3),
  postorderCanPlaceDirectSigned32:false,
  interpretation:"Two 56-node branches merge downstream into the same 11-cycle, but cannot be the same identity-mapped 56-page roster.",
  unknownPagePlaintextRecovered:false
},null,2));
