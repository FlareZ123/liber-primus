#!/usr/bin/env node
"use strict";

/**
 * Original LP2 86-event combinatorial-mask hypothesis for the solved
 * AN END 512-bit digest. An information-bearing binary event mask can
 * encode up to floor(log2(C(12901,86))) bits by its combinatorial rank.
 *
 * This deliberately tests only canonical colex and lex combination ranks
 * and canonical 93-byte big/little endian packings, without tuning the
 * mask, event locations, start offset, source hashes, or postselected keys.
 *
 * Run from repository root:
 *   node sims/lp2_doublet_combinadic_anend_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
/** @param {string} file */
const json = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const corpus = json("resources/liber-primus/lp2-corpus.json");
const targetHex = json("resources/cicada2014-anend-binary-witness.json").target_hex;
const target = BigInt("0x" + targetHex);
assert.equal(targetHex.length, 128);

/** Exact (n choose k), native JS BigInt, including boundaries. */
function choose(n, k) {
  assert(Number.isInteger(n) && Number.isInteger(k));
  if (k < 0 || k > n) return 0n;
  const nTerms = Math.min(k, n-k);
  let result = 1n;
  for (let i = 1; i <= nTerms; i++)
    result = result * BigInt(n - nTerms + i) / BigInt(i);
  return result;
}

/**
 * LP2 book: after removing the 55 per-page initial runes,
 * each remaining rune has one predecessor in its physical page.
 * Pair positions are zero-indexed, in physical page order.
 *
 * @param {number[][]} pages
 * @returns {{N:number,events:number[]}}
 */
function eventSites(pages) {
  let N = 0;
  const events = [];
  for (const page of pages) {
    for (let i = 1; i < page.length; i++) {
      if (page[i] === page[i - 1]) events.push(N + i - 1);
    }
    N += page.length - 1;
  }
  return {N, events};
}

/** @param {number[]} sites */
function colexRank(sites) {
  let rank = 0n;
  for (let i = 0; i < sites.length; i++) {
    assert(i === 0 || sites[i] > sites[i-1]);
    rank += choose(sites[i], i + 1);
  }
  return rank;
}

/**
 * True lexicographic rank, not complement of the unreflected colex rank.
 * Reflect the zero-based positions across [0,N), then reverse order.
 * @param {number[]} sites
 * @param {number} N
 */
function lexRank(sites, N) {
  const reflected = [...sites].reverse().map(site => N - 1 - site);
  return choose(N, sites.length) - 1n - colexRank(reflected);
}

/**
 * Inverse combinatorial number system, unique increasing k-subset.
 * @param {bigint} rank
 * @param {number} N
 * @param {number} k
 * @returns {number[]}
 */
function unrankColex(rank, N, k) {
  assert(rank >= 0n && rank < choose(N, k));
  const sites = Array(k).fill(-1);
  let upper = N - 1;
  for (let i = k; i >= 1; i--) {
    let lo = i - 1, hi = upper;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (choose(mid, i) <= rank) lo = mid;
      else hi = mid - 1;
    }
    sites[i - 1] = lo;
    rank -= choose(lo, i);
    upper = lo - 1;
  }
  assert.equal(rank, 0n);
  return sites;
}

/** Canonical fixed-width n-byte positive BigInt storage. */
function packed(value, nBytes, endian) {
  assert(value >= 0n && value < (1n << BigInt(8 * nBytes)));
  const hex = value.toString(16).padStart(nBytes * 2, "0");
  const bytes = Buffer.from(hex, "hex");
  return endian === "little" ? bytes.reverse() : bytes;
}

/** Synthesise a GP29 ciphertext whose only within-page doubles are the
 * 86 combinadically selected sites; the encoder's own event stream
 * must recover the exact arbitrary 64-byte planted target. */
function encodeEventMask(lengths, sites) {
  let global = 0;
  const seen = new Set(sites);
  const pages = lengths.map((length, page) => {
    let prior = (page * 11 + 7) % 29;
    const symbols = [prior];
    for (let i = 1; i < length; i++) {
      const event = seen.has(global++);
      if (!event) prior = (prior + 1 + (page + i * 7) % 28) % 29;
      symbols.push(prior);
    }
    return symbols;
  });
  assert.equal(global, lengths.reduce((s, n) => s + n - 1, 0));
  return pages;
}

const pages = corpus.pages.filter(p => p.page <= 55 &&
  p.indices.length > 0).map(page => page.indices);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((n, page) => n + page.length, 0), 12956);
const {N,events} = eventSites(pages);
assert.equal(N, 12901);
assert.equal(events.length, 86);
const total = choose(N, events.length);
const capacityBits = total.toString(2).length - 1;
const colex = colexRank(events), lex = lexRank(events, N);
assert.equal(capacityBits, 740);
assert(colex < total && lex < total);
assert.deepEqual(unrankColex(colex, N, 86), events);
const plantedPages = encodeEventMask(pages.map(page => page.length),
  unrankColex(target, N, 86));
const planted = eventSites(plantedPages);
assert.equal(planted.N, N);
assert.equal(planted.events.length, 86);
assert.equal(colexRank(planted.events), target);
const results = [];
for (const [order, rank] of [["colex", colex], ["lex", lex]]) {
  const longHex = rank.toString(16).padStart(93 * 2, "0");
  const directMatches = {
    exact512bitInteger: rank === target,
    high512bits: (rank >> BigInt(741 - 512)) === target,
    low512bits: (rank & ((1n << 512n) - 1n)) === target
  };
  const digests = [];
  for (const endian of ["big", "little"]) {
    const raw = packed(rank, 93, endian);
    const sha = crypto.createHash("sha512").update(raw).digest("hex");
    digests.push({endian, byteCount: raw.length, sha512: sha,
      isAnEndTarget: sha === targetHex});
  }
  results.push({order, bitLength:rank.toString(2).length,
    93byteHex:longHex, directMatches, digests});
}
assert(results.every(r => Object.values(r.directMatches).every(x => !x) &&
  r.digests.every(d => !d.isAnEndTarget)));
console.log(JSON.stringify({
  question: "Do original LP2 repeated-rune locations directly encode p56's published 64-byte digest, or a preimage of that digest under canonical 86-of-12901 combinatorial rank?",
  physicalOriginal: "55 nonempty LP2 p0..55 (excluding p50), exact within-page predecessor positions",
  candidateMaskLength:N, doubletEventCount:events.length,
  totalMasks:total.toString(), informationCapacityFloorBits:capacityBits,
  sourceDigestHex:targetHex,
  first14Sites:events.slice(0,14), last12Sites:events.slice(-12),
  cases:results,
  plantedTargetExactMaskRoundTrip:true,
  decision: "Canonical rank/direct-512bits/SHA512-packing candidates do not reproduce AN END; this finite transport hypothesis is negative. No unknown key or plaintext recovered.",
},null,2));
