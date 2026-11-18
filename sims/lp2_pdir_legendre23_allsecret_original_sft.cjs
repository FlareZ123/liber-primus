"use strict";

/**
 * SFT for Issue #1329: 2013 signed-DH p=23 Legendre character as an
 * independent, 2016-hint-compatible word-number direction selector.
 * This is an ORIGINAL-CIPHERTEXT all-secret capacity gate, not a key claim.
 * Run with Node.js 22 on Windows 11:
 * node sims/lp2_pdir_legendre23_allsecret_original_sft.cjs
 */
const assert = require("node:assert/strict");
const {originalWords, trace, GP, N, Q, KEY_STATES} =
  require("./lp2_pdir_cyclic256_allsecret_capacity_sft.cjs");

const mod = (x, n) => ((x % n) + n) % n;
const powMod = (x, exponent, prime) => {
  let result = 1, base = mod(x, prime);
  for (let e = exponent; e > 0; e = Math.floor(e / 2)) {
    if (e % 2) result = result * base % prime;
    base = base * base % prime;
  }
  return result;
};

/** Signed 2013 example fixes p=23, so Euler's criterion uses exponent 11. */
const symbol23 = (sum, zeroSign) => {
  const r = mod(sum, 23);
  if (r === 0) return zeroSign;
  return powMod(r, 11, 23) === 1 ? 1 : -1;
};

/** A word's printed numeric value is its GP prime-value sum. */
const wordDirections = (sections, source, zeroSign) =>
  sections.map((words) => words.map((word, i) =>
    symbol23(source === "previous" ? (i ? words[i - 1].G : 0) : word.G, zeroSign)));

/**
 * A full source-shaped causal encryption positive, for PREVIOUS ciphertext
 * word sum and no extra pointer movement or equality skip.
 */
function positivePlant(original) {
  const control = GP.pages.find((p) => p.page === 57).indices;
  assert.equal(control.length, 95);
  const key = Array.from({length: KEY_STATES}, (_, i) => mod(7 * i + 11, Q));
  let j = 0;
  const planted = original.map((words) => {
    let pointer = 0, prevSum = 0;
    return words.map((word, wi) => {
      const dir = symbol23(wi ? prevSum : 0, 1);
      const r = word.r.map(() => {
        const plain = control[j++ % control.length];
        const cipher = mod(plain + key[mod(pointer, KEY_STATES)], Q);
        pointer += dir;
        return cipher;
      });
      prevSum = r.reduce((sum, value) => sum + GP.prime[value], 0);
      return {...word, r, G: prevSum};
    });
  });
  assert.equal(j, N);
  const dirs = wordDirections(planted, "previous", 1);
  const actual = trace(planted, dirs, {h:0,m:0,c:0,flip:0,skip:0}, true);
  const got = planted.flatMap((section) => section.flatMap((word) => word.r))
    .map((cipher, i) => mod(cipher - key[actual.phases[i]], Q));
  const expected = Array.from({length:N}, (_, i) => control[i % control.length]);
  assert.deepEqual(got, expected);
  return {symbols:N,exactInverse:true,exactReencryption:true,
    maximumSecretIoC:actual.maximumIoC};
}

function main() {
  const original = originalWords();
  const rows = [], zeroCounts = {};
  for (const source of ["previous", "current"]) {
    for (const zeroSign of [-1, 1]) {
      const dirs = wordDirections(original, source, zeroSign);
      zeroCounts[source + ":" + zeroSign] = original.flat()
        .filter((w, i) => w.G % 23 === 0).length;
      for (const flip of [0, 1]) {
        for (const h of [0, 1]) {
          for (const m of [0, 1, 2]) {
            for (const c of [0, 1, 2]) {
              for (const skip of [0, 1]) {
                const config = {h,m,c,flip,skip};
                const stat = trace(original, dirs, config);
                rows.push({source,zeroSign,...config,
                  maxOne:stat.maxOne,maxPair:stat.maxTwo,
                  maximumIoC:stat.maximumIoC,
                  numerator:stat.maximumIoCNumerator,active:stat.active});
              }
            }
          }
        }
      }
    }
  }
  assert.equal(rows.length, 288);
  rows.sort((a,b)=>b.maximumIoC-a.maximumIoC);
  const maximum = rows[0];
  const maximumE = rows.reduce((best, r) => Math.max(best,r.maxOne),0);
  // Independently established same-length GP-native control minima from
  // lp2_pdir_cyclic256_allsecret_capacity_sft.cjs.
  const nativeIoCFloor = 0.057816420842613;
  const nativeEFloor = 1397;
  const plant = positivePlant(original);
  const report = {
    originalRunes:N,
    originalWords:original.flat().length,
    source:"2013 signed worked DH modulus p=23; 2016 word/number/direction hint",
    decodingAssumption:"word GP-prime sum's Legendre sign mod23; zero mapped +/-1",
    candidateModels:rows.length,
    highestPossibleAllSecretIoC:maximum,
    highestPossibleE:maximumE,
    nativeReferenceMinimumIoC:nativeIoCFloor,
    nativeReferenceMinimumE:nativeEFloor,
    frequencyGatePass:maximum.maximumIoC>=nativeIoCFloor,
    eGatePass:maximumE>=nativeEFloor,
    positivePlant:plant,
    scope:"cyclic 256 source-section-reset GP29 stationary pointer alphabets; no latent retries or changing section keys",
    recoveredOriginalUnknownPlaintext:false
  };
  console.log(JSON.stringify(report,null,2));
  return report;
}
if (require.main===module) main();
module.exports={main,wordDirections,symbol23};
