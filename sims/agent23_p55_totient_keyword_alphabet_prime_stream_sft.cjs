"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const shakespeare = fs.readFileSync(path.join(ROOT, "resources/control/shakespeare_first300k.txt"), "utf8");

const N = 29;
const latin = corpus.translit.map(x => x === "NG" ? "ING" : x);
const digraphs = ["ING", "TH", "EO", "IA", "EA", "AE", "OE"];

function mod(x, m) { return ((x % m) + m) % m; }
function gcd(a, b) { return b ? gcd(b, a % b) : a; }

function toRunes(text) {
  const s = text.toUpperCase();
  const out = [];
  for (let i = 0; i < s.length;) {
    let hit = null;
    for (const d of digraphs) {
      if (s.startsWith(d, i)) { hit = d; break; }
    }
    if (hit) {
      const v = latin.indexOf(hit);
      assert(v >= 0, "unmapped GP digraph " + hit);
      out.push(v);
      i += hit.length;
    } else if (latin.includes(s[i])) {
      out.push(latin.indexOf(s[i]));
      i++;
    } else {
      i++;
    }
  }
  return out;
}

function deriveP55Key() {
  const p55 = corpus.pages.find(p => p.page === 55).indices;
  const wordLengths = [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
  assert.strictEqual(p55.length, 76);
  assert.strictEqual(wordLengths.reduce((a, b) => a + b, 0), 75);
  const selected = [];
  let offset = 1; // first p55 rune is the final rune of a p54-started word
  for (const len of wordLengths) {
    const word = p55.slice(offset, offset + len);
    assert.strictEqual(word.length, len);
    for (let i = 2; i < len; i++) {
      if (gcd(i, len) === 1) selected.push(word[i - 1]);
    }
    offset += len;
  }
  assert.strictEqual(offset, 76);
  assert.strictEqual(selected.length, 29);
  const expected = [10, 2, 5, 28, 0, 14, 10, 19, 1, 5, 13, 8, 21, 20, 13, 12, 18, 10, 6, 14, 6, 15, 12, 2, 2, 18, 5, 11, 18];
  assert.deepStrictEqual(selected, expected);
  const base29 = "0123456789ABCDEFGHIJKLMNOPQRS";
  return { selected, keyText: selected.map(x => base29[x]).join(""), wordLengths };
}

function keyedAlphabet(keyword) {
  const order = [];
  const seen = new Set();
  for (const x of keyword) {
    if (!seen.has(x)) { seen.add(x); order.push(x); }
  }
  for (let x = 0; x < N; x++) {
    if (!seen.has(x)) { seen.add(x); order.push(x); }
  }
  assert.strictEqual(order.length, N);
  const inverse = new Array(N);
  order.forEach((x, i) => { inverse[x] = i; });
  return { sigma: order, inverse, uniqueKeySymbols: keyword.filter((x, i) => keyword.indexOf(x) === i).length };
}

function firstPrimes(count) {
  const limit = Math.ceil(count * (Math.log(count) + Math.log(Math.log(count))) + 100);
  const sieve = new Uint8Array(limit + 1);
  sieve.fill(1);
  sieve[0] = 0;
  sieve[1] = 0;
  for (let p = 2; p * p <= limit; p++) {
    if (sieve[p]) {
      for (let q = p * p; q <= limit; q += p) sieve[q] = 0;
    }
  }
  const out = [];
  for (let i = 2; i <= limit && out.length < count; i++) {
    if (sieve[i]) out.push(i);
  }
  assert.strictEqual(out.length, count);
  return out;
}

function primeTotientKey(count) {
  return firstPrimes(count).map(p => (p - 1) % N);
}

function normalizedIoc(xs) {
  const f = new Array(N).fill(0);
  for (const x of xs) f[x]++;
  return N * f.reduce((s, v) => s + v * (v - 1), 0) / (xs.length * (xs.length - 1));
}

function buildBigramModel(text) {
  const runes = toRunes(text);
  const counts = Array.from({ length: N }, () => new Array(N).fill(1));
  for (let i = 1; i < runes.length; i++) counts[runes[i - 1]][runes[i]]++;
  const logp = counts.map(row => {
    const total = row.reduce((a, b) => a + b, 0);
    return row.map(v => Math.log(v / total));
  });
  return { runes, counts, logp };
}

// Cipher family: C = sigma^-1(sigma(P) + K) mod 29.
// On a would-be adjacent repeat, the encryptor may consume one additional K value.
// The 0.81 skip prior is a community model, not an authenticated Cicada instruction.
function decode(transformedCipher, key, sigma, inverse, logp, holdF, beam) {
  let states = [{ ptr: 0, last: -1, score: 0, node: -1 }];
  const parents = [];
  const symbols = [];

  for (let i = 0; i < transformedCipher.length; i++) {
    const x = transformedCipher[i];
    const prev = i ? transformedCipher[i - 1] : -1;
    const best = new Map();

    for (const st of states) {
      const add = (y, ptr, penalty) => {
        const p = inverse[y];
        const score = st.score + (st.last < 0 ? Math.log(1 / N) : logp[st.last][p]) + penalty;
        const stateKey = String(ptr) + ":" + String(p);
        const old = best.get(stateKey);
        if (!old || score > old.score) {
          best.set(stateKey, { ptr, last: p, score, parent: st.node, sym: p });
        }
      };

      if (holdF && x === sigma[0]) add(sigma[0], st.ptr, 0);

      const y0 = mod(x - key[st.ptr], N);
      if (!holdF || y0 !== sigma[0]) add(y0, st.ptr + 1, 0);

      if (prev >= 0 && mod(key[st.ptr + 1] - key[st.ptr], N) === mod(x - prev, N)) {
        const y1 = mod(x - key[st.ptr + 1], N);
        if (!holdF || y1 !== sigma[0]) add(y1, st.ptr + 2, Math.log(0.81));
      }
    }

    if (best.size === 0) return { failAt: i, states: 0 };
    const candidates = Array.from(best.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, beam);
    states = [];
    for (const v of candidates) {
      const node = parents.length;
      parents.push(v.parent);
      symbols.push(v.sym);
      states.push({ ptr: v.ptr, last: v.last, score: v.score, node });
    }
  }

  states.sort((a, b) => b.score - a.score);
  let node = states[0].node;
  const out = new Array(transformedCipher.length);
  for (let i = out.length - 1; i >= 0; i--) {
    out[i] = symbols[node];
    node = parents[node];
  }
  return { out, score: states[0].score };
}

function xorshift32(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

function encryptPlant(plain, key, sigma, inverse, seed, holdF) {
  const random = xorshift32(seed);
  let ptr = 0;
  let prev = -1;
  const out = [];
  for (const p of plain) {
    if (holdF && p === 0) {
      out.push(0);
      prev = 0;
      continue;
    }
    let y = mod(sigma[p] + key[ptr], N);
    ptr++;
    let c = inverse[y];
    if (c === prev && random() < 0.81) {
      y = mod(sigma[p] + key[ptr], N);
      ptr++;
      c = inverse[y];
    }
    out.push(c);
    prev = c;
  }
  return out;
}

function markovPlant(counts, length, seed) {
  const random = xorshift32(seed);
  const out = [Math.floor(random() * N)];
  for (let i = 1; i < length; i++) {
    const row = counts[out[out.length - 1]];
    const total = row.reduce((a, b) => a + b, 0);
    let r = random() * total;
    let v = 0;
    for (; v < N; v++) {
      r -= row[v];
      if (r < 0) break;
    }
    out.push(Math.min(v, N - 1));
  }
  return out;
}

function shuffledAlphabet(random) {
  const out = Array.from({ length: N }, (_, i) => i);
  for (let i = N - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function scoreWithAlphabet(cipher, key, sigma, logp, holdF) {
  const inverse = new Array(N);
  sigma.forEach((x, i) => { inverse[x] = i; });
  const transformed = cipher.map(c => sigma[c]);
  const decoded = decode(transformed, key, sigma, inverse, logp, holdF, 64);
  if (decoded.failAt !== undefined) return decoded;
  return { scorePerRune: decoded.score / decoded.out.length, ioc29: normalizedIoc(decoded.out) };
}

function decodeRepeatingVigenere(cipher, key, logp) {
  const stateCount = N * N;
  const parents = new Int16Array(cipher.length * stateCount);
  parents.fill(-1);
  let scores = new Float64Array(stateCount);
  scores.fill(-Infinity);

  const first = cipher[0];
  const firstConsumed = mod(first - key[0], N);
  if (first === 0) scores[0] = Math.log(1 / N); // literal plaintext F, no key advance
  if (firstConsumed !== 0) scores[N + firstConsumed] = Math.log(1 / N);

  for (let i = 1; i < cipher.length; i++) {
    const c = cipher[i];
    const next = new Float64Array(stateCount);
    next.fill(-Infinity);

    for (let state = 0; state < stateCount; state++) {
      const score = scores[state];
      if (!Number.isFinite(score)) continue;
      const ptr = Math.floor(state / N);
      const last = state % N;

      if (c === 0) {
        const nextState = ptr * N;
        const candidate = score + logp[last][0];
        if (candidate > next[nextState]) {
          next[nextState] = candidate;
          parents[i * stateCount + nextState] = state;
        }
      }

      const plain = mod(c - key[ptr], N);
      if (plain !== 0) {
        const nextPtr = (ptr + 1) % key.length;
        const nextState = nextPtr * N + plain;
        const candidate = score + logp[last][plain];
        if (candidate > next[nextState]) {
          next[nextState] = candidate;
          parents[i * stateCount + nextState] = state;
        }
      }
    }

    let reachable = false;
    for (const score of next) {
      if (Number.isFinite(score)) { reachable = true; break; }
    }
    if (!reachable) return { failAt: i };
    scores = next;
  }

  let best = -Infinity;
  let state = -1;
  for (let i = 0; i < stateCount; i++) {
    if (scores[i] > best) { best = scores[i]; state = i; }
  }
  if (state < 0) return { failAt: cipher.length - 1 };

  const out = new Array(cipher.length);
  for (let i = cipher.length - 1; i >= 1; i--) {
    out[i] = state % N;
    state = parents[i * stateCount + state];
  }
  out[0] = state % N;
  return { out, score: best };
}

function encryptRepeatingVigenere(plain, key) {
  let ptr = 0;
  const out = [];
  for (const p of plain) {
    if (p === 0) {
      out.push(0);
    } else {
      out.push(mod(p + key[ptr], N));
      ptr = (ptr + 1) % key.length;
    }
  }
  return out;
}

function main() {
  const { selected, keyText, wordLengths } = deriveP55Key();
  const { sigma, inverse, uniqueKeySymbols } = keyedAlphabet(selected);
  const { runes: trainRunes, counts, logp } = buildBigramModel(shakespeare);

  const pages = corpus.pages.filter(p => p.page <= 54 && p.indices.length > 0);
  const target = pages.flatMap(p => p.indices);
  assert.strictEqual(target.length, 12880);
  const key = primeTotientKey(2 * target.length + 10);
  const transformed = target.map(c => sigma[c]);

  const continuous = decode(transformed, key, sigma, inverse, logp, false, 64);
  assert(continuous.failAt === undefined);
  const continuousSummary = {
    scorePerRune: continuous.score / continuous.out.length,
    ioc29: normalizedIoc(continuous.out),
    beam: 64,
    keyStream: "unbounded first-prime sequence, K[i]=(prime[i]-1) mod 29",
    pointer: "continuous from p0, no page resets",
    repeatRule: "on a would-be adjacent repeat, optional one-key skip with prior 0.81",
    plaintextFTransparent: false
  };

  let pageResetOut = [];
  let pageResetScore = 0;
  for (const p of pages) {
    const pageKey = primeTotientKey(2 * p.indices.length + 10);
    const decoded = decode(p.indices.map(c => sigma[c]), pageKey, sigma, inverse, logp, false, 64);
    assert(decoded.failAt === undefined);
    pageResetOut.push(...decoded.out);
    pageResetScore += decoded.score;
  }
  const pageResetSummary = {
    scorePerRune: pageResetScore / pageResetOut.length,
    ioc29: normalizedIoc(pageResetOut),
    pointer: "reset to first prime on each rune-bearing page",
    plaintextFTransparent: false
  };

  const transparentF = decode(transformed, key, sigma, inverse, logp, true, 64);
  const transparentFSummary = transparentF.failAt === undefined
    ? { scorePerRune: transparentF.score / transparentF.out.length, ioc29: normalizedIoc(transparentF.out) }
    : { noAdmissibleStateAtZeroBasedRuneOffset: transparentF.failAt };

  let resetF = null;
  for (const p of pages) {
    const pageKey = primeTotientKey(2 * p.indices.length + 10);
    const decoded = decode(p.indices.map(c => sigma[c]), pageKey, sigma, inverse, logp, true, 64);
    if (decoded.failAt !== undefined) {
      resetF = { page: p.page, offset: decoded.failAt };
      break;
    }
  }

  const repeatingVigenereContinuous = decodeRepeatingVigenere(target, selected, logp);
  let repeatingVigenerePageReset = null;
  for (const p of pages) {
    const decoded = decodeRepeatingVigenere(p.indices, selected, logp);
    if (decoded.failAt !== undefined) {
      repeatingVigenerePageReset = { page: p.page, offset: decoded.failAt };
      break;
    }
  }

  const plant = markovPlant(counts, 800, 0x23001123);
  const repeatingVigenerePlantCipher = encryptRepeatingVigenere(plant, selected);
  const repeatingVigenerePlantDecoded = decodeRepeatingVigenere(repeatingVigenerePlantCipher, selected, logp);
  const repeatingVigenerePositiveControl = repeatingVigenerePlantDecoded.failAt === undefined
    ? {
        exact: repeatingVigenerePlantDecoded.out.reduce((sum, x, i) => sum + (x === plant[i] ? 1 : 0), 0),
        length: plant.length,
        scorePerRune: repeatingVigenerePlantDecoded.score / repeatingVigenerePlantDecoded.out.length
      }
    : { failAt: repeatingVigenerePlantDecoded.failAt };

  const plantKey = primeTotientKey(2 * plant.length + 10);
  const positiveControls = {};
  for (const holdF of [false, true]) {
    const cipher = encryptPlant(plant, plantKey, sigma, inverse, 0x23001124, holdF);
    const decoded = decode(cipher.map(c => sigma[c]), plantKey, sigma, inverse, logp, holdF, 64);
    if (decoded.failAt !== undefined) {
      positiveControls[String(holdF)] = { failAt: decoded.failAt };
    } else {
      positiveControls[String(holdF)] = {
        exact: decoded.out.reduce((s, x, i) => s + (x === plant[i] ? 1 : 0), 0),
        length: plant.length,
        ioc29: normalizedIoc(decoded.out),
        scorePerRune: decoded.score / decoded.out.length
      };
    }
  }

  const nulls = [];
  const nullRandom = xorshift32(0x23001126);
  for (let r = 0; r < 10; r++) {
    const randomSigma = shuffledAlphabet(nullRandom);
    nulls.push(scoreWithAlphabet(target, key, randomSigma, logp, false));
  }
  const nullScores = nulls.map(x => x.scorePerRune);
  const nullMean = nullScores.reduce((a, b) => a + b, 0) / nullScores.length;
  const nullMin = Math.min(...nullScores);
  const nullMax = Math.max(...nullScores);
  const candidateRank = 1 + nullScores.filter(x => x > continuousSummary.scorePerRune).length;

  const result = {
    keyCandidate: keyText,
    selectedGp29Indices: selected,
    wordLengths,
    mixedAlphabetSigma: sigma,
    mixedAlphabetUniqueSymbolsInKeyword: uniqueKeySymbols,
    targetPages: "LP2 p0-p54, excluding p55 key page and solved p56-p57",
    targetRunes: target.length,
    trainingRunes: trainRunes.length,
    keyLength: key.length,
    continuous: continuousSummary,
    pageReset: pageResetSummary,
    transparentF: transparentFSummary,
    pageResetTransparentF: resetF,
    repeatingVigenere: {
      keyPeriod: selected.length,
      rule: "C=0 for plaintext F without key advance; otherwise C=P+K mod 29, repeated key",
      continuous: repeatingVigenereContinuous.failAt === undefined
        ? { scorePerRune: repeatingVigenereContinuous.score / repeatingVigenereContinuous.out.length, ioc29: normalizedIoc(repeatingVigenereContinuous.out) }
        : { noAdmissibleStateAtZeroBasedRuneOffset: repeatingVigenereContinuous.failAt },
      pageReset: repeatingVigenerePageReset,
      positiveControl: repeatingVigenerePositiveControl
    },
    positiveControls,
    randomAlphabetNulls: nulls,
    randomNullSummary: { mean: nullMean, min: nullMin, max: nullMax, candidateRankOf11: candidateRank }
  };

  assert.strictEqual(positiveControls["false"].exact, 800, "no-F planted control must recover exactly");
  assert.strictEqual(repeatingVigenerePositiveControl.exact, 800, "repeating Vigenere planted control must recover exactly");
  assert(candidateRank === 11, "source-derived alphabet should rank last in this frozen null set");
  console.log(JSON.stringify(result, null, 2));
}

main();
