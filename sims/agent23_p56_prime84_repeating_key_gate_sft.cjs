"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const source = fs.readFileSync(path.join(root, "resources/control/shakespeare_first300k.txt"), "utf8");
const N = 29;
const latin = corpus.translit.map(x => x === "NG" ? "ING" : x);
const digraphs = ["ING", "TH", "EO", "IA", "EA", "AE", "OE"];
const mod = x => ((x % N) + N) % N;

function toRunes(text) {
  const s = text.toUpperCase(), out = [];
  for (let i = 0; i < s.length;) {
    let hit = null;
    for (const d of digraphs) if (s.startsWith(d, i)) { hit = d; break; }
    if (hit) { out.push(latin.indexOf(hit)); i += hit.length; }
    else if (latin.includes(s[i])) { out.push(latin.indexOf(s[i])); i++; }
    else i++;
  }
  return out;
}

function firstPrimes(count) {
  const out = [];
  for (let x = 2; out.length < count; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) if (x % d === 0) { prime = false; break; }
    if (prime) out.push(x);
  }
  return out;
}

function buildBigram(text) {
  const runes = toRunes(text);
  const counts = Array.from({ length: N }, () => new Array(N).fill(1));
  for (let i = 1; i < runes.length; i++) counts[runes[i - 1]][runes[i]]++;
  const logp = counts.map(row => {
    const total = row.reduce((a, b) => a + b, 0);
    return row.map(v => Math.log(v / total));
  });
  return { runes, counts, logp };
}

// Repeating key K=(p_i-1) mod 29, period 84; literal plaintext F is transparent
// and does not advance the key. At ciphertext F, the DP allows either that
// transparent F or a non-F plaintext whose keyed value happens to be F.
function decode(cipher, key, logp) {
  const K = key.length, stateCount = K * N;
  const parents = new Int16Array(cipher.length * stateCount);
  parents.fill(-1);
  let scores = new Float64Array(stateCount);
  scores.fill(-Infinity);

  const first = cipher[0];
  if (first === 0) scores[0] = Math.log(1 / N);
  const firstPlain = mod(first - key[0]);
  if (firstPlain !== 0) scores[N + firstPlain] = Math.log(1 / N);

  for (let i = 1; i < cipher.length; i++) {
    const c = cipher[i], next = new Float64Array(stateCount);
    next.fill(-Infinity);

    for (let state = 0; state < stateCount; state++) {
      const score = scores[state];
      if (!Number.isFinite(score)) continue;
      const ptr = Math.floor(state / N), last = state % N;

      if (c === 0) {
        const nextState = ptr * N;
        const candidate = score + logp[last][0];
        if (candidate > next[nextState]) {
          next[nextState] = candidate;
          parents[i * stateCount + nextState] = state;
        }
      }

      const plain = mod(c - key[ptr]);
      if (plain !== 0) {
        const nextPtr = (ptr + 1) % K;
        const nextState = nextPtr * N + plain;
        const candidate = score + logp[last][plain];
        if (candidate > next[nextState]) {
          next[nextState] = candidate;
          parents[i * stateCount + nextState] = state;
        }
      }
    }

    let reachable = false;
    for (const v of next) if (Number.isFinite(v)) { reachable = true; break; }
    if (!reachable) return { failAt: i };
    scores = next;
  }

  let best = -Infinity, state = -1;
  for (let i = 0; i < stateCount; i++) if (scores[i] > best) { best = scores[i]; state = i; }
  if (state < 0) return { failAt: cipher.length - 1 };
  const out = new Array(cipher.length);
  for (let i = cipher.length - 1; i >= 1; i--) {
    out[i] = state % N;
    state = parents[i * stateCount + state];
  }
  out[0] = state % N;
  return { out, score: best };
}

function xorshift32(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

function markovPlant(counts, length, seed) {
  const random = xorshift32(seed);
  const out = [Math.floor(random() * N)];
  for (let i = 1; i < length; i++) {
    const row = counts[out[out.length - 1]], total = row.reduce((a, b) => a + b, 0);
    let r = random() * total, v = 0;
    for (; v < N; v++) { r -= row[v]; if (r < 0) break; }
    out.push(Math.min(v, N - 1));
  }
  return out;
}

function encrypt(plain, key) {
  let ptr = 0;
  return plain.map(p => {
    if (p === 0) return 0;
    const c = mod(p + key[ptr]);
    ptr = (ptr + 1) % key.length;
    return c;
  });
}

function main() {
  const p56 = corpus.pages.find(p => p.page === 56).indices;
  assert.strictEqual(p56.length, 85);
  assert.strictEqual(p56[56], 0); // the one literal plaintext-F bypass
  const consumed = p56.length - 1;
  assert.strictEqual(consumed, 84);

  const primes = firstPrimes(consumed);
  assert.strictEqual(primes[83], 433);
  const key = primes.map(p => (p - 1) % N);
  const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length > 0);
  const target = pages.flatMap(p => p.indices);
  assert.strictEqual(target.length, 12956);

  const { runes: trainingRunes, counts, logp } = buildBigram(source);
  const continuous = decode(target, key, logp);

  let pageReset = null;
  for (const p of pages) {
    const decoded = decode(p.indices, key, logp);
    if (decoded.failAt !== undefined) {
      pageReset = { page: p.page, offset: decoded.failAt };
      break;
    }
  }

  const plant = markovPlant(counts, 800, 0x23001123);
  const plantedCipher = encrypt(plant, key);
  const planted = decode(plantedCipher, key, logp);
  const positiveControl = planted.failAt === undefined
    ? { exact: planted.out.reduce((sum, x, i) => sum + (x === plant[i] ? 1 : 0), 0), length: plant.length }
    : { failAt: planted.failAt };

  const result = {
    source: "Solved LP2 p56: 85 rune positions, one literal F bypass, 84 consumed prime totients",
    key: "K[i]=(prime[i]-1) mod 29 for first 84 primes (2 through 433), repeated with period 84",
    targetPages: "LP2 p0-p55; p56 and p57 excluded",
    targetRunes: target.length,
    trainingRunes: trainingRunes.length,
    continuous: continuous.failAt === undefined
      ? { scorePerRune: continuous.score / continuous.out.length }
      : { noAdmissibleStateAtZeroBasedRuneOffset: continuous.failAt },
    pageReset,
    positiveControl
  };

  assert.strictEqual(continuous.failAt, 155);
  assert.deepStrictEqual(pageReset, { page: 0, offset: 155 });
  assert.strictEqual(positiveControl.exact, 800);
  console.log(JSON.stringify(result, null, 2));
}

main();
