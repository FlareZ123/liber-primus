#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const pages = corpus.pages.filter((p) => p.page <= 55);
const C = pages.flatMap((p) => p.indices);
assert.equal(C.length, 12956);
const mod = (x, m = 29) => ((x % m) + m) % m;
const ioc = (a) => {
  const f = Array(29).fill(0);
  for (const x of a) f[x]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
};

// The six exponents are the exact DH 3301 tester-exponent representatives
// preserved in sims/2013_dh3301_tester11_source_sft.cjs. Fifteen is also
// tested because it is the client exponent in the earlier worked DH 23 example.
const privateExponents = [15, 11, 561, 1111, 1661, 2211, 2761];

function gfMul(a, b) {
  return [
    mod(a[0] * b[0] + 8 * a[1] * b[1]),
    mod(a[0] * b[1] + a[1] * b[0] + 3 * a[1] * b[1]),
  ];
}
function gfPow(a, exponent) {
  let out = [1, 0];
  let base = a.slice();
  let e = exponent;
  while (e > 0) {
    if (e % 2) out = gfMul(out, base);
    base = gfMul(base, base);
    e = Math.floor(e / 2);
  }
  return out;
}
function decodeGF841(stream, x, pairing, swap, reverse) {
  const s = reverse ? stream.slice().reverse() : stream.slice();
  const blocks = [];
  if (pairing === "adjacent") {
    for (let i = 0; i < s.length; i += 4) {
      const c1 = swap ? [s[i + 1], s[i]] : [s[i], s[i + 1]];
      const c2 = swap ? [s[i + 3], s[i + 2]] : [s[i + 2], s[i + 3]];
      blocks.push([c1, c2]);
    }
  } else {
    const half = s.length / 2;
    for (let i = 0; i < half; i += 2) {
      const c1 = swap ? [s[i + 1], s[i]] : [s[i], s[i + 1]];
      const c2 = swap ? [s[half + i + 1], s[half + i]] : [s[half + i], s[half + i + 1]];
      blocks.push([c1, c2]);
    }
  }
  const out = [];
  let zeroC1 = 0;
  let subfield = 0;
  for (const [c1, c2] of blocks) {
    if (c1[0] === 0 && c1[1] === 0) {
      zeroC1++;
      out.push(0, 0);
      continue;
    }
    const m = gfMul(c2, gfPow(c1, mod(-x, 840)));
    if (m[1] === 0) subfield++;
    out.push(...m);
  }
  return { x, pairing, coordinateOrder: swap ? "swapped" : "natural", reverse, blocks: blocks.length, zeroC1, subfield, ioc: ioc(out) };
}
const u = [0, 1];
assert.deepEqual(gfPow(u, 840), [1, 0]);
for (const p of [2, 3, 5, 7]) assert.notDeepEqual(gfPow(u, 840 / p), [1, 0]);

const fieldResults = [];
for (const x0 of privateExponents) {
  const x = mod(x0, 840);
  for (const pairing of ["adjacent", "halves"]) {
    for (const swap of [false, true]) {
      for (const reverse of [false, true]) fieldResults.push(decodeGF841(C, x, pairing, swap, reverse));
    }
  }
}
const nonF = C.filter((x) => x !== 0);
const gf29Results = [];
function pow29(a, n) {
  let out = 1;
  let base = a;
  let e = n;
  while (e > 0) {
    if (e % 2) out = mod(out * base);
    base = mod(base * base);
    e = Math.floor(e / 2);
  }
  return out;
}
for (const x0 of privateExponents) {
  const x = mod(x0, 28);
  for (const pairing of ["adjacent", "halves"]) {
    const c1 = [];
    const c2 = [];
    if (pairing === "adjacent") {
      for (let i = 0; i < nonF.length; i += 2) {
        c1.push(nonF[i]);
        c2.push(nonF[i + 1]);
      }
    } else {
      const half = nonF.length / 2;
      for (let i = 0; i < half; i++) {
        c1.push(nonF[i]);
        c2.push(nonF[half + i]);
      }
    }
    const decoded = c1.map((a, i) => mod(c2[i] * pow29(a, mod(-x, 28))));
    gf29Results.push({ x, pairing, blocks: c1.length, zeroC1: c1.filter((v) => v === 0).length, ioc: ioc(decoded) });
  }
}

// Source-native positive controls for both field encodings.
for (const x0 of privateExponents) {
  const x = mod(x0, 840);
  const publicKey = gfPow(u, x);
  for (let i = 0; i < 64; i++) {
    const m = [i % 29, mod(i * 7 + 3)];
    const r = (i * 17 + 5) % 840;
    const c1 = gfPow(u, r);
    const c2 = gfMul(m, gfPow(publicKey, r));
    assert.deepEqual(gfMul(c2, gfPow(c1, mod(-x, 840))), m);
  }
}
for (const x0 of privateExponents) {
  const x = mod(x0, 28);
  const g = 2; // primitive root modulo 29; source value 2 is the DH 23 shared secret.
  const publicKey = pow29(g, x);
  for (let i = 0; i < 64; i++) {
    const m = (i * 7 + 3) % 29;
    const r = (i * 11 + 1) % 28;
    const c1 = pow29(g, r);
    const c2 = mod(m * pow29(publicKey, r));
    assert.equal(mod(c2 * pow29(c1, mod(-x, 28))), m);
  }
}

const bestField = fieldResults.slice().sort((a, b) => b.ioc - a.ioc)[0];
const bestGF29 = gf29Results.slice().sort((a, b) => b.ioc - a.ioc)[0];
console.log(JSON.stringify({
  input: { runes: C.length, originalIoC: ioc(C), fCount: C.filter((x) => x === 0).length },
  sourceExponentCandidates: privateExponents.map((x) => ({ sourceExponent: x, mod840: mod(x, 840), mod28: mod(x, 28) })),
  GF841: {
    polynomial: "u^2 = 3u + 8",
    rootUOrder: 840,
    models: fieldResults.length,
    best: bestField,
    nextBest: fieldResults.slice().sort((a, b) => b.ioc - a.ioc).slice(1, 4),
  },
  FSkipGF29: {
    nonFRunes: nonF.length,
    models: gf29Results.length,
    best: bestGF29,
    nextBest: gf29Results.slice().sort((a, b) => b.ioc - a.ioc).slice(1, 4),
  },
  positiveControls: "exact recovery for every tested exponent",
}, null, 2));
