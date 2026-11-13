"use strict";

/**
 * Eight table columns as eight independent secret GP29 substitutions.
 * Source-anchored, known-interior contradiction gate.
 *
 * Run: node sims/lp2_terminal256_column_codebook_sft.cjs
 * Node.js 20+ CommonJS; original source resources only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = p => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const reference = read("resources/liber-primus/lp1-plaintext-reference.txt");
const bytes = grid.bytes;
assert.equal(bytes.length, 256);
const p56 = gp.pages[56].indices, p57 = gp.pages[57].indices;
assert.equal(p56.length, 85);
assert.equal(p57.length, 95);

const primes = [];
for (let n = 2; primes.length < 86; n++) {
  if (primes.every(p => p*p > n || n%p !== 0)) primes.push(n);
}
let counter = 0;
const plain56 = p56.map((c, i) => {
  if (i === 56) {
    assert.equal(c, 0);
    return 0;
  }
  return (c - (primes[counter++] - 1) % 29 + 29) % 29;
});
assert.equal(counter, 84);

/** @param {string} text */
function encodeNative(text) {
  const tokens = gp.translit.map((s, i) => ({s, i}))
    .sort((a, b) => b.s.length - a.s.length);
  const out = [];
  const normal = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  for (const word of normal.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith("ING", i)) {out.push(21); i += 3;}
      else if (word.startsWith("IO", i)) {out.push(27); i += 2;}
      else {
        const token = tokens.find(t => word.startsWith(t.s, i));
        assert(token);
        out.push(token.i);
        i += token.s.length;
      }
    }
  }
  return out;
}
const ref56 = reference.split("### 56\n")[1].split("### 57\n")[0]
  .replace(/^[0-9a-f]+$/gm, "");
const ref57 = reference.split("### 57\n")[1];
assert.deepEqual(plain56, encodeNative(ref56));
assert.deepEqual(p57, encodeNative(ref57));

// Four 32-by-8 concentric rings, from outer circumference inward.
const H = 32, W = 8;
function spiral(ccw) {
  const out = [];
  for (let r = 0; r < 4; r++) {
    const t = r, b = H-1-r, l = r, rt = W-1-r;
    if (!ccw) {
      for (let c = l; c <= rt; c++) out.push([t,c]);
      for (let i = t+1; i <= b; i++) out.push([i,rt]);
      for (let c = rt-1; c >= l; c--) out.push([b,c]);
      for (let i = b-1; i > t; i--) out.push([i,l]);
    } else {
      for (let i = t; i <= b; i++) out.push([i,l]);
      for (let c = l+1; c <= rt; c++) out.push([b,c]);
      for (let i = b-1; i >= t; i--) out.push([i,rt]);
      for (let c = rt-1; c > l; c--) out.push([t,c]);
    }
  }
  assert.equal(out.length, 256);
  assert.equal(new Set(out.map(([r,c]) => r*W+c)).size, 256);
  return out;
}

/**
 * Even arbitrary per-column secret permutations cannot map one
 * same grid residue to two different target GP29 runes.
 * @param {number[]} known
 * @param {number[][]} path
 */
function gate(known, path) {
  const forward = Array.from({length:8}, () => new Map());
  const backward = Array.from({length:8}, () => new Map());
  let forwardConflict = 0, inverseConflict = 0;
  for (let i = 0; i < 180; i++) {
    const [r,c] = path[76+i];
    const x = bytes[r*8+c]%29, y=known[i];
    const m=forward[c], n=backward[c];
    if (m.has(x) && m.get(x)!==y) forwardConflict++;
    else m.set(x,y);
    if (n.has(y) && n.get(y)!==x) inverseConflict++;
    else n.set(y,x);
  }
  return {forwardConflict, inverseConflict,
    mappingSizes: forward.map(m => m.size)};
}

const cases=[];
for (const ccw of [false,true])
  for (const flipRow of [false,true])
    for (const flipCol of [false,true]) {
      const path=spiral(ccw).map(([r,c]) => [
        flipRow?H-1-r:r, flipCol?W-1-c:c
      ]);
      const plain=gate([...plain56,...p57],path);
      const ciphertext=gate([...p56,...p57],path);
      cases.push({ccw,flipRow,flipCol,plain,ciphertext});
      // A planted, genuinely bijective secret permutation in every column
      // satisfies every known position, including duplicated input residues.
      const planted=path.slice(76).map(([r,c]) =>
        ((1+3*c)*(bytes[r*8+c]%29)+4*c)%29);
      const control=gate(planted,path);
      assert.equal(control.forwardConflict,0);
      assert.equal(control.inverseConflict,0);
    }
assert.equal(cases.length,8);
const minPlain=Math.min(...cases.map(x=>x.plain.forwardConflict));
const minCipher=Math.min(...cases.map(x=>x.ciphertext.forwardConflict));
assert.equal(minPlain,62);
assert.equal(minCipher,64);
console.log(JSON.stringify({originalGridBytes:256,gridShape:"32x8",
  originalUnknownOuterRunes:76,solvedInnerRunes:180,
  authenticP56Plaintext:"85 native-GP symbols verified from reference",
  allEightOrientations:true,minPlainConflicts:minPlain,
  minCipherConflicts:minCipher,positiveColumnPermutationPlant:"8 of 8",
  cases},null,2));
