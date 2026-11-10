"use strict";
/**
 * Original-LP2 prime-clause discriminator for already enumerated full
 * 256-byte-grid RC4 and derived AES-CTR/ChaCha20 key streams.
 *
 * Uses the exact printed-clause source layout and the known solved-Cicada
 * habit of prime-valued GP clause sums. Evaluates direct GP29 and an exact
 * reversible GP28 predecessor-step alphabet with EA as a zero step.
 *
 * No original cipher or key is assumed. A hidden planted source-native
 * GP stream is recovered under the same entire candidate search.
 *
 * Reproduce: node sims/base60_source_prime_clause.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");
const {keys, keyPads} = require("./base60_fullkey_stream.cjs");
const {primeClauseSource} = require("./affine_156_native_prime_clause.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const GP = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = GP.pages.filter(p => p.status === "unsolved" && p.indices.length);
const original = pages.flatMap(p => p.indices);
assert.equal(original.length, 12956);
const runeMap = new Map(GP.runes.map((rune, i) => [rune, i]));
const transcription = read("resources/lp2-transcription.txt").split("%").slice(0, 55).join("%");
const clauseOf = new Uint16Array(original.length);
let cursor = 0;
let nClauses = 0;
for (const char of transcription) {
  if (runeMap.has(char)) {
    assert.equal(original[cursor], runeMap.get(char));
    clauseOf[cursor++] = nClauses;
  } else if (char === ".") {
    nClauses++;
  }
}
assert.equal(cursor, original.length);
assert.equal(nClauses, 175);
const sieve = new Uint8Array(100000).fill(1);
sieve[0] = sieve[1] = 0;
for (let i = 2; i * i < sieve.length; i++) {
  if (!sieve[i]) continue;
  for (let j = i * i; j < sieve.length; j += i) sieve[j] = 0;
}
const pageLengths = pages.map(p => p.indices.length);
const GP_PRIMES = GP.prime;

/**
 * @param {number[]} cipher
 * @param {Uint8Array[]} pads
 * @param {number} sign
 * @param {"direct"|"step"} mode
 * @param {"page"|"continuous"} reset
 * @param {boolean} savePlain
 */
function score(cipher, pads, sign, mode, reset, savePlain = false) {
  const totals = new Uint32Array(nClauses);
  const plain = savePlain ? [] : null;
  let at = 0, previous = -1;
  for (let page = 0; page < pageLengths.length; page++) {
    if (reset === "page") previous = -1;
    for (let j = 0; j < pageLengths[page]; j++) {
      const c = cipher[at];
      const k = pads[page][j];
      let p;
      if (mode === "direct") {
        p = (c + sign * k + 29) % 29;
      } else if (previous < 0) {
        p = c;
      } else if (c === previous) {
        p = 28;
      } else {
        const nonzeroStep = (c - previous + 29) % 29 - 1;
        p = (nonzeroStep + sign * (k % 28) + 28) % 28;
      }
      totals[clauseOf[at]] += GP_PRIMES[p];
      if (plain) plain.push(p);
      previous = c;
      at++;
    }
  }
  assert.equal(at, original.length);
  let train = 0, heldout = 0;
  for (let clause = 0; clause < nClauses; clause++) {
    const value = totals[clause];
    assert.ok(value < sieve.length);
    if (sieve[value]) {
      if (clause < 88) train++;
      else heldout++;
    }
  }
  return {train, heldout, total: train + heldout, ...(plain ? {plain} : {})};
}

/**
 * @param {number[]} plain
 * @param {Uint8Array[]} pads
 * @param {number} sign
 * @param {"direct"|"step"} mode
 * @param {"page"|"continuous"} reset
 */
function encrypt(plain, pads, sign, mode, reset) {
  const cipher = [];
  let at = 0, previous = -1;
  for (let page = 0; page < pageLengths.length; page++) {
    if (reset === "page") previous = -1;
    for (let j = 0; j < pageLengths[page]; j++) {
      const p = plain[at];
      const k = pads[page][j];
      let c;
      if (mode === "direct") {
        c = (p - sign * k + 29) % 29;
      } else if (previous < 0) {
        c = p;
      } else if (p === 28) {
        c = previous;
      } else {
        const step = 1 + ((p - sign * (k % 28) + 28) % 28);
        c = (previous + step) % 29;
      }
      cipher.push(c);
      previous = c;
      at++;
    }
  }
  assert.equal(at, original.length);
  return cipher;
}

/** All source-grid key streams and their exactly reversible emissions. */
function scan(cipher) {
  let models = 0;
  let best = null;
  let maxTotal = 0;
  const top = [];
  for (const key of keys()) {
    for (const engine of ["rc4", "aes-256-ctr", "chacha20"]) {
      if (key.rc4Only && engine !== "rc4") continue;
      for (const align of ["global", "page"]) {
        for (const iv of align === "global" || engine === "rc4"
          ? ["zero"] : ["zero", "last-le", "last-be", "first-le"]) {
          for (const drop of engine === "rc4" ? [0, 256, 3072] : [0, 256]) {
            for (const map of ["mod", "scale", "reject"]) {
              const pads = keyPads(engine, key.key, iv, align, drop, map);
              for (const sign of [-1, 1]) {
                for (const [mode, reset] of [
                  ["direct", "page"],
                  ["step", "page"],
                  ["step", "continuous"]
                ]) {
                  const result = score(cipher, pads, sign, mode, reset);
                  const candidate = {
                    key: key.name, engine, align, iv, drop, map,
                    sign, mode, reset, ...result
                  };
                  models++;
                  maxTotal = Math.max(maxTotal, result.total);
                  if (best === null || result.train > best.train ||
                    (result.train === best.train && result.heldout > best.heldout)) {
                    best = candidate;
                  }
                  top.push(candidate);
                }
              }
            }
          }
        }
      }
    }
  }
  top.sort((a, b) => b.train - a.train || b.heldout - a.heldout);
  return {models, best, maxTotal,
    top: top.slice(0, 8),
    topTrainTied: top.filter(x => x.train === best.train).length};
}

/** Construct a positive with an author-prime-valued source, not random GP. */
function plant() {
  const source = primeClauseSource();
  const gridKey = keys().find(k => k.name === "table256");
  assert.ok(gridKey);
  const pads = keyPads("rc4", gridKey.key, "zero", "global", 256, "reject");
  const setting = {
    key: "table256", engine: "rc4", align: "global", iv: "zero",
    drop: 256, map: "reject", sign: -1, mode: "step", reset: "page"
  };
  const encrypted = encrypt(source.plain, pads, setting.sign, setting.mode,
    setting.reset);
  const recovered = score(encrypted, pads, setting.sign, setting.mode,
    setting.reset, true);
  assert.deepEqual(recovered.plain, source.plain);
  assert.equal(recovered.total, source.primeAfter);
  return {cipher: encrypted, setting, source: {
    edits: source.edits, primeBefore: source.primeBefore,
    primeAfter: source.primeAfter
  }};
}

function main() {
  const actual = scan(original);
  const positive = plant();
  const planted = scan(positive.cipher);
  const same = candidate =>
    Object.entries(positive.setting).every(([k, v]) => candidate[k] === v);
  const success = same(planted.best);
  assert.ok(success, "The planted source key was not recovered as first");
  assert.equal(planted.best.total, positive.source.primeAfter);
  console.log(JSON.stringify({
    source: "LP2 printed 256-byte table, 175 printed clauses, original 12,956 runes",
    provenance: {
      corpusSha256: createHash("sha256").update(
        read("resources/liber-primus/lp2-corpus.json")).digest("hex"),
      clauseSplit: "printed full-stop marks, 88 train / 87 heldout",
      testFamily: "source-table RC4 or SHA-derived AES-CTR/ChaCha20 direct GP29 and transparent-EA GP28-step"
    },
    original: actual,
    positive: {
      setting: positive.setting, source: positive.source,
      scan: planted, correctKeyTop: success
    },
    interpretation: "Only a source-bound original-key candidate with convincing untouched plaintext would authenticate a decryption; a planted source recovery is a power test."
  }, null, 2));
}

if (require.main === module) main();
module.exports = {score, scan, encrypt, plant, main};
