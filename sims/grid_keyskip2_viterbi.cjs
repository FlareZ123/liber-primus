"use strict";
/**
 * Exact pair-consuming ciphertext-rejection inverse for the original LP2
 * 256-byte p49-51 base60 table.
 *
 * A rejected candidate consumes TWO key positions (j += 2): the first
 * candidate must produce the preceding emitted ciphertext rune; the second
 * position is unconstrained/burned. The same plaintext rune is retried.
 * This is not keyskip1 and not two consecutive collision skips.
 *
 * Search: byte mod29, row-major/reversed, signs +/-1, page-reset clock,
 * all 256 initial offsets per page, at most 4 rejected pairs per rune
 * (maximum key advance 8).
 *
 * Run: node sims/grid_keyskip2_viterbi.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const { train, encode } = require("./grid_keyskip_viterbi.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");
const MOD = 29, WIDTH = 256, MAX_REJECT_PAIRS = 4, R = MAX_REJECT_PAIRS + 1;
const RUNE_NAMES = ["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
const mod = (x) => (x % MOD + MOD) % MOD;

function trainLatin(data) {
  assert.equal(data.sourceLanguage, "Latin");
  assert.equal(data.n, 203357);
  const b = new Uint32Array(MOD * MOD);
  const t = new Uint32Array(MOD * MOD * MOD);
  for (const [i, count] of data.b) b[i] = count;
  for (const [i, count] of data.t) t[i] = count;
  const unigram = new Float64Array(MOD);
  const bigram = new Float64Array(MOD * MOD);
  const trigram = new Float64Array(MOD * MOD * MOD);
  for (let c = 0; c < MOD; c++)
    unigram[c] = Math.log((data.u[c] + 1) / (data.n + MOD));
  for (let a = 0; a < MOD; a++) for (let c = 0; c < MOD; c++) {
    const p = (b[a * MOD + c] + 12 * Math.exp(unigram[c])) / (data.u[a] + 12);
    bigram[a * MOD + c] = Math.log(p);
  }
  for (let a = 0; a < MOD; a++) for (let v = 0; v < MOD; v++) {
    for (let c = 0; c < MOD; c++) {
      const i = (a * MOD + v) * MOD + c;
      const p = (t[i] + 9 * Math.exp(bigram[v * MOD + c])) / (b[a * MOD + v] + 9);
      trigram[i] = Math.log(p);
    }
  }
  return { unigram, bigram, trigram };
}

/**
 * MAP/Viterbi inverse for a fixed periodic key.
 * If previous accepted key index is j, r rejected pairs imply the next
 * accepted index j+1+2r. For each pair k, only j+1+2k must produce the
 * previous ciphertext; j+2+2k is unconstrained.
 */
function solvePair(cipher, key, sign, lm, suppression) {
  assert.ok(cipher.length >= 3);
  assert.equal(key.length, WIDTH);
  const n = cipher.length, count = WIDTH * R;
  const back = new Int32Array(n * count);
  back.fill(-1);
  let previous = new Float64Array(count);
  previous.fill(-Infinity);
  const decode = (i, j) => mod(cipher[i] + sign * key[j & 255]);
  const logReject = Math.log(suppression);
  const logAcceptCollision = Math.log(1 - suppression);

  // State (j1, r1) uniquely determines the initial page offset j0.
  for (let j1 = 0; j1 < WIDTH; j1++) for (let r = 0; r <= MAX_REJECT_PAIRS; r++) {
    const j0 = (j1 - 1 - 2 * r) & 255;
    const p0 = decode(0, j0), p1 = decode(1, j1);
    let valid = true;
    for (let k = 0; k < r; k++) {
      if (mod(p1 - sign * key[(j0 + 1 + 2 * k) & 255]) !== cipher[0]) {
        valid = false; break;
      }
    }
    if (!valid) continue;
    const filterLog = r * logReject + (cipher[1] === cipher[0] ? logAcceptCollision : 0);
    previous[j1 * R + r] = lm.unigram[p0] + lm.bigram[p0 * MOD + p1] + filterLog;
  }

  for (let i = 2; i < n; i++) {
    const next = new Float64Array(count);
    next.fill(-Infinity);
    for (let j = 0; j < WIDTH; j++) for (let priorRejects = 0; priorRejects <= MAX_REJECT_PAIRS; priorRejects++) {
      const state = j * R + priorRejects;
      const base = previous[state];
      if (!Number.isFinite(base)) continue;
      const j2 = (j - 1 - 2 * priorRejects) & 255;
      const p2 = decode(i - 2, j2);
      const p1 = decode(i - 1, j);
      for (let r = 0; r <= MAX_REJECT_PAIRS; r++) {
        const jNew = (j + 1 + 2 * r) & 255;
        const p = decode(i, jNew);
        let valid = true;
        for (let k = 0; k < r; k++) {
          if (mod(p - sign * key[(j + 1 + 2 * k) & 255]) !== cipher[i - 1]) {
            valid = false; break;
          }
        }
        if (!valid) continue;
        const filterLog = r * logReject + (cipher[i] === cipher[i - 1] ? logAcceptCollision : 0);
        const score = base + lm.trigram[(p2 * MOD + p1) * MOD + p] + filterLog;
        const destination = jNew * R + r;
        if (score > next[destination]) {
          next[destination] = score;
          back[i * count + destination] = state;
        }
      }
    }
    previous = next;
  }

  let best = -Infinity, state = -1;
  for (let i = 0; i < count; i++) if (previous[i] > best) {
    best = previous[i]; state = i;
  }
  assert.ok(state >= 0, "No valid pair-skip path");
  const plaintext = new Array(n);
  const rejectedPairs = new Uint8Array(n);
  let start = -1, totalPairs = 0, maxPairs = 0;
  for (let i = n - 1; i >= 1; i--) {
    const j = Math.floor(state / R), r = state % R;
    plaintext[i] = decode(i, j);
    rejectedPairs[i] = r;
    totalPairs += r;
    maxPairs = Math.max(maxPairs, r);
    if (i >= 2) {
      state = back[i * count + state];
      assert.ok(state >= 0, "Broken Viterbi traceback");
    } else {
      start = (j - 1 - 2 * r) & 255;
      plaintext[0] = decode(0, start);
    }
  }

  // Exact forward replay of every rejected collision, burned draw and output.
  let cursor = start, previousCipher = -1;
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < rejectedPairs[i]; k++) {
      const rejected = mod(plaintext[i] - sign * key[cursor]);
      assert.equal(rejected, previousCipher, "First draw of rejected pair must collide");
      cursor = (cursor + 2) & 255; // second draw is deliberately unconstrained
    }
    const emitted = mod(plaintext[i] - sign * key[cursor]);
    assert.equal(emitted, cipher[i], "Accepted draw must reproduce original ciphertext");
    cursor = (cursor + 1) & 255;
    previousCipher = emitted;
  }
  return {
    scorePerRune: best / n, start, pairs: totalPairs,
    extraKeyDraws: 2 * totalPairs, maxPairsOnOneRune: maxPairs,
    plaintext, rejectedPairs: Array.from(rejectedPairs),
    exactForwardRoundTrip: true
  };
}

function xorshift(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

function plantPair(plain, key, start, seed, suppression, sign = -1) {
  const random = xorshift(seed);
  const cipher = [], rejectedPairs = [];
  let cursor = start, previousCipher = -1, pairs = 0, maxPairs = 0;
  for (const p of plain) {
    let r = 0, emitted;
    for (;;) {
      emitted = mod(p - sign * key[cursor]);
      if (previousCipher >= 0 && emitted === previousCipher && random() < suppression) {
        cursor = (cursor + 2) & 255;
        r++; pairs++;
        assert.ok(r <= MAX_REJECT_PAIRS, "Plant exceeded decoder's fixed rejection cap");
        continue;
      }
      break;
    }
    cipher.push(emitted);
    rejectedPairs.push(r);
    maxPairs = Math.max(maxPairs, r);
    previousCipher = emitted;
    cursor = (cursor + 1) & 255;
  }
  return { cipher, rejectedPairs, pairs, maxPairs };
}

function scan(pages, baseKey, lm, suppression, language) {
  const configs = [
    { orientation: "row-major", sign: -1, key: baseKey },
    { orientation: "row-major", sign: 1, key: baseKey },
    { orientation: "reversed-row-major", sign: -1, key: baseKey.slice().reverse() },
    { orientation: "reversed-row-major", sign: 1, key: baseKey.slice().reverse() }
  ];
  const byConfig = configs.map(() => []);
  const pageBest = [];
  const totalRunes = pages.reduce((s, p) => s + p.indices.length, 0);
  for (const page of pages) {
    const found = configs.map((config, index) => {
      const result = solvePair(page.indices, config.key, config.sign, lm, suppression);
      byConfig[index].push({ score: result.scorePerRune, pairs: result.pairs });
      return { config, result };
    });
    let best = found[0];
    for (const candidate of found.slice(1))
      if (candidate.result.scorePerRune > best.result.scorePerRune) best = candidate;
    pageBest.push({
      page: page.page, length: page.indices.length,
      score: best.result.scorePerRune, start: best.result.start,
      pairs: best.result.pairs, orientation: best.config.orientation,
      sign: best.config.sign,
      preview: best.result.plaintext.slice(0, 42).map(x => RUNE_NAMES[x]).join(" ")
    });
  }
  const global = configs.map((config, i) => {
    const rows = byConfig[i];
    const weightedMean = rows.reduce((s, row, j) => s + row.score * pages[j].indices.length, 0) / totalRunes;
    return {
      orientation: config.orientation, sign: config.sign,
      weightedMeanPerRune: weightedMean,
      totalRejectedPairs: rows.reduce((s, row) => s + row.pairs, 0)
    };
  });
  const bestGlobal = global.reduce((a, b) => b.weightedMeanPerRune > a.weightedMeanPerRune ? b : a);
  pageBest.sort((a, b) => b.score - a.score);
  return { language, global, bestGlobal, topPages: pageBest.slice(0, 15) };
}

function main() {
  const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
  const bytes = grid.byte_rows.flat();
  assert.equal(grid.alphabet, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx");
  assert.equal(grid.rows.length, 32);
  assert.equal(bytes.length, WIDTH);
  for (let r = 0; r < 32; r++) for (let c = 0; c < 8; c++) {
    const token = grid.rows[r][c];
    assert.equal(bytes[r * 8 + c], 60 * grid.alphabet.indexOf(token[0]) + grid.alphabet.indexOf(token[1]));
  }
  const gridSha256 = crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex");
  assert.equal(gridSha256, "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
  const key = bytes.map(x => x % MOD);

  const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length >= 3);
  const totalRunes = pages.reduce((s, p) => s + p.indices.length, 0);
  const transitions = pages.reduce((s, p) => s + p.indices.length - 1, 0);
  const doubles = pages.reduce((s, p) => s + p.indices.slice(1).filter((x, i) => x === p.indices[i]).length, 0);
  assert.equal(pages.length, 55);
  assert.equal(totalRunes, 12956);
  assert.equal(transitions, 12901);
  assert.equal(doubles, 86);
  const q = 1 / MOD, observedDoubletRate = doubles / transitions;
  const suppression = (q - observedDoubletRate) / (q * (1 - observedDoubletRate));

  const english = train(read("resources/control/shakespeare_first300k.txt"));
  const latinData = JSON.parse(read("resources/control/latin-vulgate-gp-trigrams.json"));
  const latin = trainLatin(latinData);

  // Positive control: solved LP1 English, genuine grid key, true j+=2 plant.
  const reference = read("resources/liber-primus/lp1-plaintext-reference.txt");
  const from = reference.indexOf("BELIEVE NOTHING"), to = reference.indexOf("### 3");
  assert.ok(from >= 0 && to > from);
  const positivePlain = encode(reference.slice(from, to)).slice(0, 180);
  assert.equal(positivePlain.length, 179);
  let planted = null, trueStart = -1;
  for (let start = 0; start < WIDTH; start++) {
    const candidate = plantPair(positivePlain, key, start, 0x3301ad42, suppression, -1);
    if (candidate.pairs >= 4 && candidate.pairs <= 12) {
      planted = candidate; trueStart = start; break;
    }
  }
  assert.ok(planted && trueStart >= 0);
  const positive = solvePair(planted.cipher, key, -1, english, suppression);
  const correctRunes = positive.plaintext.reduce((s, x, i) => s + (x === positivePlain[i] ? 1 : 0), 0);
  assert.equal(correctRunes, positivePlain.length);
  assert.equal(positive.start, trueStart);
  assert.equal(positive.pairs, planted.pairs);

  return {
    source: {
      pages: pages.length, runes: totalRunes,
      withinPageTransitions: transitions, withinPageDoublets: doubles,
      gridBytes: bytes.length, gridSha256
    },
    model: {
      name: "ciphertext-side soft rejection with pair consumption",
      transition: "on a repeated tentative ciphertext, reject with probability s and advance j by 2; first skipped candidate must collide with prior ciphertext, second position is unconstrained; keep the same plaintext rune",
      q, observedDoubletRate, suppression,
      pageClock: "reset per physical page",
      key: "row-major base60 bytes reduced modulo 29; forward/reversed",
      signs: [-1, 1], startsPerPage: WIDTH,
      maximumRejectedPairsPerRune: MAX_REJECT_PAIRS
    },
    positiveControl: {
      length: positivePlain.length, trueStart, recoveredStart: positive.start,
      actualRejectedPairs: planted.pairs, inferredRejectedPairs: positive.pairs,
      maximumPairsOnOneRune: planted.maxPairs,
      correctRunes, recovery: correctRunes / positivePlain.length,
      scorePerRune: positive.scorePerRune,
      exactForwardRoundTrip: positive.exactForwardRoundTrip
    },
    englishOriginal: scan(pages, key, english, suppression, "Shakespeare English GP trigrams"),
    latinOriginal: scan(pages, key, latin, suppression, "Latin Vulgate GP trigrams"),
    limitations: [
      "No original plaintext or key recovered.",
      "Finite direct byte-mod29 key, row-major/reverse, sign, page-reset and four-pair-per-rune family only.",
      "Latin is an alternate scoring screen using a pinned Vulgate model; only the English model has the solved-LP1 positive plant.",
      "No key-permutation null was run; top-page scores are descriptive, not global significance claims."
    ]
  };
}

if (require.main === module) process.stdout.write(JSON.stringify(main(), null, 2) + "\n");
module.exports = { solvePair, plantPair, trainLatin, scan, main };
