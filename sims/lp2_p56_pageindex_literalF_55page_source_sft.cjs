/**
 * Original LP2 page-index literal-Fehu hypothesis.
 *
 * A previously exact solved p56 special case copies a single Fehu (F)
 * and skips one prime-totient key at physical rune offset 56. That offset
 * equals p56's zero-based position in the second-release archive. Freeze
 * the natural extrapolation: allow a literal F skip ONLY when the current
 * physical page has an original F at local rune offset equal to its page
 * number. Test the two independent original unknown such pages p27/p48
 * and the entire unsolved 55-page corpus, with no fitted alternate starts.
 *
 * This is a *hypothesis prompted after knowing p56*, not an authentic
 * author-signed LP2 rule. Node.js 22 CommonJS SFT; no files written.
 */
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = JSON.parse(fs.readFileSync(path.join(
  __dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
), "utf8"));
const mod = (x) => ((x % 29) + 29) % 29;

function primesUpToCount(count) {
  const primes = [];
  for (let n = 2; primes.length < count; n++) {
    let prime = true;
    for (let f = 2; f*f <= n; f++) {
      if (n % f === 0) { prime = false; break; }
    }
    if (prime) primes.push(n);
  }
  return primes;
}
const primes = primesUpToCount(350);

/** @param {string} plaintext - Original published GP spelling. */
function toIndices(plaintext) {
  const choices = source.translit.map((g,i) => ({g,i}))
    .sort((a,b) => b.g.length - a.g.length);
  const out = [];
  for (const word of plaintext.split(" ")) {
    let i = 0;
    while (i < word.length) {
      const item = choices.find((c) => word.startsWith(c.g, i));
      assert(item, "invalid native GP word");
      out.push(item.i);
      i += item.g.length;
    }
  }
  return out;
}

/**
 * This backward mapping is exact for the known p56 cipher's publicly
 * documented key 0 start, sign minus, and only literal-F key skip.
 * @param {number} pageNo - Zero-based LP2 physical page number.
 * @param {number[]} cipher - Source-original GP indices.
 */
function decode(pageNo, cipher) {
  let keyIndex = 0;
  const plain = [];
  const invalid = [];
  const skip = [];
  for (let i = 0; i < cipher.length; i++) {
    const c = cipher[i];
    if (i === pageNo && c === 0) {
      plain.push(0);
      skip.push(i);
    } else {
      const prime = primes[keyIndex++];
      assert(prime, "insufficient generated primes");
      const p = mod(c-(prime-1));
      plain.push(p);
      // The known p56 encoder's explicit-F bypass makes a non-F
      // ciphertext impossible if its plaintext is F.
      if (c !== 0 && p === 0) {
        invalid.push({index:i, output:c, keyPrime:prime});
      }
    }
  }
  return {plain, invalid, skip, primeKeysConsumed:keyIndex};
}
/**
 * @param {number} pageNo
 * @param {number[]} plain
 */
function encode(pageNo, plain) {
  let keyIndex = 0;
  return plain.map((p,i) => {
    if (i === pageNo && p === 0) return 0;
    return mod(p+(primes[keyIndex++]-1));
  });
}
function ioc(values) {
  const histogram = Array(29).fill(0);
  for (const n of values) histogram[n]++;
  return histogram.reduce((sum,x)=>sum+x*(x-1),0)/
    (values.length*(values.length-1));
}
const all = source.pages.filter((p) => p.page <= 56 && p.indices.length);
assert.equal(all.length, 56);
const hits = all.filter((p) => p.indices[p.page] === 0)
  .map((p) => p.page);
assert.deepEqual(hits, [27,48,56]);

// Exact within-each-page-original-rune-multiset permutation null for the
// diagonal F coincidence, conditioned on selecting p56's known solved skip.
// Each unknown original page contributes a Bernoulli success probability
// F_count / page_rune_count. The 55 page draws are independent under this
// stated permutation null. This is descriptive, never a deciphering key.
const unknown = all.filter((p)=>p.page<=55);
const probs = unknown.map((p) =>
  p.indices.filter((v)=>v===0).length/p.indices.length);
const diagCount = unknown.filter((p)=>p.indices[p.page]===0).length;
let dist = Array(unknown.length+1).fill(0);
dist[0] = 1;
for (const prob of probs) {
  for (let i = dist.length-1; i >= 0; i--) {
    dist[i] = dist[i]*(1-prob)+(i?dist[i-1]*prob:0);
  }
}
const expectedDiagonalCount = probs.reduce((s,x)=>s+x,0);
const diagonalUpperTail = dist.slice(diagCount).reduce((s,x)=>s+x,0);
assert.equal(diagCount,2);
assert(Math.abs(expectedDiagonalCount-1.922950027288523)<1e-12);
assert(Math.abs(diagonalUpperTail-0.5778776501174421)<1e-12);

const decoded = all.map((page) => {
  const result = decode(page.page, page.indices);
  if (result.invalid.length === 0) {
    assert.deepEqual(encode(page.page,result.plain),page.indices);
  }
  return {
    page:page.page, runeCount:page.indices.length,
    skips:result.skip, forbiddenCount:result.invalid.length,
    firstForbidden:result.invalid[0] ?? null,
    inverseIoC:ioc(result.plain),
    inversePrefix:result.plain.slice(0,45).map((x) =>
      source.translit[x]).join(""),
  };
});
const known = decoded.find((p)=>p.page===56);
const exactKnown = [
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO",
  "IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE",
].join(" ");
assert.deepEqual(
  decode(56, source.pages.find((p)=>p.page===56).indices).plain,
  toIndices(exactKnown),
);
assert.equal(known.forbiddenCount, 0);
assert.deepEqual(known.skips, [56]);
assert.equal(known.runeCount, 85);

// These original unknown pages are the only additional pages whose
// ciphertext provides an F at its own zero-based local index.
for (const [page, firstBad, totalBad] of [[27,50,5],[48,7,10]]) {
  const result = decoded.find((x)=>x.page===page);
  assert.deepEqual(result.skips, [page]);
  assert.equal(result.firstForbidden.index,firstBad);
  assert.equal(result.forbiddenCount,totalBad);
}
assert.equal(decoded.filter((p)=>
  p.page <= 55 && p.forbiddenCount===0).length,0);

console.log(JSON.stringify({
  source:"Original LP2 physical pages p0..p56 (p50 rune-free)",
  hypothesis:"literal F at local rune index equal to physical LP2 page index",
  originalFOnDiagonal:hits,
  independentUnknownDiagonalCount:diagCount,
  fixedPageRuneMultisetPermutationNull: {
    expected:expectedDiagonalCount, pAtLeastObserved:diagonalUpperTail,
  },
  solvedPageExactKnown:85,
  originalUnknownPagesContradicted:55,
  originalUnknownPages:decoded.length-1,
  p27:decoded.find((x)=>x.page===27),
  p48:decoded.find((x)=>x.page===48),
  solvedP56:known,
  conclusion:"Conditional original-cipher contradiction; no unknown plaintext",
}, null, 2));
