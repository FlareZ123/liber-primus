'use strict';

/*
 * Exact bigram-Viterbi search for the unknown literal-F skip mask under the
 * authentic LP1 Vigenere keys DIVINITY and FIRFUMFERENFE.
 *
 * The positive controls reconstruct the source LP1 sections and assert that
 * the DP recovers their exact known plaintext and literal-F masks. LP2 is then
 * tested with global key phase over all pages and over prime-numbered pages.
 *
 * Run from repository root:
 *   node sims/lp2_historical_vigenere_skip_viterbi.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');
const corpusRaw = read('resources/liber-primus/lp2-corpus.json');
const shakeText = read('resources/control/shakespeare_first300k.txt');
const lp1Text = read('resources/transcriptions/lp1_wulfic_canonical.txt');
const plaintextReference = read('resources/liber-primus/lp1-plaintext-reference.txt');
const sourceRegression = read('sims/authentic_decryption_regression.cjs');
const corpus = JSON.parse(corpusRaw);

const MOD = 29;
const PREV_STATES = 30; // 0..28 plus sentinel 29 at page/word start
const DIGRAPHS = { TH:2, NG:21, EO:12, OE:22, AE:25, IA:27, EA:28 };
const LETTERS = {
  A:24, B:17, C:5, D:23, E:18, F:0, G:6, H:8, I:10, J:11, K:5,
  L:20, M:19, N:9, O:3, P:13, Q:5, R:4, S:15, T:16, U:1, V:1,
  W:7, X:14, Y:26, Z:15
};
const RUNE_NAMES = [
  'F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X',
  'S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'
];
const RUNE_MAP = new Map(corpus.runes.map((r, i) => [r, i]));
const GP_MAP = new Map(corpus.translit.map((x, i) => [x, i]));
GP_MAP.set('ING', 21);

function sha256(s) {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}
function plaintextWords(text) {
  const tokens = text.toUpperCase().match(/[A-Z]+/g) || [];
  return tokens.map((token) => {
    const s = token.replace(/QU/g, 'CW').replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S');
    const out = [];
    for (let i = 0; i < s.length;) {
      let found = false;
      for (const n of [3, 2, 1]) {
        const part = s.slice(i, i + n);
        if (part.length === n && GP_MAP.has(part)) {
          out.push(GP_MAP.get(part));
          i += n;
          found = true;
          break;
        }
      }
      assert(found, 'unknown GP phoneme in ' + token + ' at ' + i);
    }
    return out;
  });
}
function ciphertextWords(source) {
  return source.split(/[-.&$§]/)
    .map((part) => [...part].filter((ch) => RUNE_MAP.has(ch)).map((ch) => RUNE_MAP.get(ch)))
    .filter((word) => word.length > 0);
}
function encodeGP(text) {
  const s = text.toUpperCase().replace(/[^A-Z]/g, '');
  const out = [];
  for (let i = 0; i < s.length; i++) {
    const d = DIGRAPHS[s.slice(i, i + 2)];
    if (d !== undefined) {
      out.push(d);
      i++;
    } else {
      out.push(LETTERS[s[i]]);
    }
  }
  return out;
}
function trainModels(text) {
  const symbols = encodeGP(text);
  const u = new Uint32Array(MOD);
  const b = new Uint32Array(MOD * MOD);
  const t = new Uint32Array(MOD * MOD * MOD);
  for (let i = 0; i < symbols.length; i++) {
    u[symbols[i]]++;
    if (i) b[symbols[i - 1] * MOD + symbols[i]]++;
    if (i > 1) t[(symbols[i - 2] * MOD + symbols[i - 1]) * MOD + symbols[i]]++;
  }
  const unigram = new Float64Array(MOD);
  const bigram = new Float64Array(MOD * MOD);
  const trigram = new Float64Array(MOD * MOD * MOD);
  for (let c = 0; c < MOD; c++) unigram[c] = Math.log((u[c] + 1) / (symbols.length + MOD));
  for (let a = 0; a < MOD; a++) {
    for (let c = 0; c < MOD; c++) {
      bigram[a * MOD + c] = Math.log(
        (b[a * MOD + c] + 12 * Math.exp(unigram[c])) / (u[a] + 12)
      );
    }
  }
  for (let a = 0; a < MOD; a++) {
    for (let v = 0; v < MOD; v++) {
      for (let c = 0; c < MOD; c++) {
        const ix = (a * MOD + v) * MOD + c;
        trigram[ix] = Math.log(
          (t[ix] + 9 * Math.exp(bigram[v * MOD + c])) / (b[a * MOD + v] + 9)
        );
      }
    }
  }
  return { unigram, bigram, trigram, trainingSymbols: symbols.length };
}

const model = trainModels(shakeText.slice(0, 240000));
const { unigram, bigram, trigram } = model;

/*
 * State = (key phase, previous plaintext rune). At ciphertext F, branch:
 *   - literal F: emit 0, do not advance key;
 *   - ordinary Vigenere: decrypt with current key symbol and advance.
 * A null token is a page boundary: carry key phase, reset language context.
 */
function runDP(tokens, key, startPhase) {
  const keyLength = key.length;
  const stateCount = keyLength * PREV_STATES;
  const n = tokens.length;
  let current = new Float64Array(stateCount);
  current.fill(-Infinity);
  current[startPhase * PREV_STATES + 29] = 0;
  const back = new Int16Array((n + 1) * stateCount);
  back.fill(-1);
  const choice = new Uint8Array((n + 1) * stateCount);

  for (let i = 0; i < n; i++) {
    const next = new Float64Array(stateCount);
    next.fill(-Infinity);
    const c = tokens[i];
    for (let state = 0; state < stateCount; state++) {
      const base = current[state];
      if (base === -Infinity) continue;
      const phase = Math.floor(state / PREV_STATES);
      const previous = state % PREV_STATES;
      if (c === null) {
        const ns = phase * PREV_STATES + 29;
        if (base > next[ns]) {
          next[ns] = base;
          back[(i + 1) * stateCount + ns] = state;
          choice[(i + 1) * stateCount + ns] = 2;
        }
        continue;
      }
      const branches = c === 0
        ? [[0, phase, 0], [(c - key[phase] + MOD) % MOD, (phase + 1) % keyLength, 1]]
        : [[(c - key[phase] + MOD) % MOD, (phase + 1) % keyLength, 1]];
      for (const [plain, nextPhase, kind] of branches) {
        const add = previous === 29 ? unigram[plain] : bigram[previous * MOD + plain];
        const nextState = nextPhase * PREV_STATES + plain;
        const value = base + add;
        if (value > next[nextState]) {
          next[nextState] = value;
          back[(i + 1) * stateCount + nextState] = state;
          choice[(i + 1) * stateCount + nextState] = kind;
        }
      }
    }
    current.set(next);
  }

  let best = -Infinity;
  let state = -1;
  for (let i = 0; i < stateCount; i++) {
    if (current[i] > best) {
      best = current[i];
      state = i;
    }
  }
  const output = new Array(n);
  const skips = [];
  for (let i = n; i > 0; i--) {
    const previousState = back[i * stateCount + state];
    const kind = choice[i * stateCount + state];
    const c = tokens[i - 1];
    if (c === null) output[i - 1] = null;
    else {
      output[i - 1] = state % PREV_STATES;
      if (kind === 0) skips.push(i - 1);
    }
    state = previousState;
    assert(state >= 0, 'Viterbi backtrace failed');
  }
  const runeCount = tokens.reduce((n, x) => n + (x === null ? 0 : 1), 0);
  return {
    output,
    skipPositions: skips.reverse(),
    bigramScore: best / runeCount,
    finalPhase: Math.floor(state / PREV_STATES)
  };
}

function scoreSequence(seq) {
  let score = 0;
  let count = 0;
  for (let i = 2; i < seq.length; i++) {
    score += trigram[(seq[i - 2] * MOD + seq[i - 1]) * MOD + seq[i]];
    count++;
  }
  return { score: count ? score / count : null, count };
}
function scorePages(decodedPages) {
  let sum = 0;
  let count = 0;
  const perPage = [];
  for (const [page, seq] of decodedPages) {
    const s = scoreSequence(seq);
    if (!s.count) continue;
    sum += s.score * s.count;
    count += s.count;
    perPage.push({ page, length: seq.length, score: s.score });
  }
  return {
    trigramScore: sum / count,
    scoredRunes: count,
    topPages: perPage.sort((a, b) => b.score - a.score).slice(0, 6)
  };
}
function globalDecode(pages, key, startPhase) {
  const tokens = [];
  const spans = [];
  for (const page of pages) {
    const start = tokens.length;
    tokens.push(...page.indices);
    const end = tokens.length;
    spans.push({ page: page.page, start, end });
    tokens.push(null);
  }
  const dp = runDP(tokens, key, startPhase);
  const decoded = spans.map((span) => [
    span.page, dp.output.slice(span.start, span.end)
  ]);
  return {
    bigramScore: dp.bigramScore,
    skipCount: dp.skipPositions.length,
    finalPhase: dp.finalPhase,
    decoded,
    summary: scorePages(decoded)
  };
}
function samplePage(decoded, pageNumber) {
  const row = decoded.find((x) => x[0] === pageNumber);
  return row ? row[1].slice(0, 90).map((x) => RUNE_NAMES[x]).join(' ') : null;
}
function resetDecode(pages, key, startPhase) {
  const decoded = [];
  let skipCount = 0;
  let bigramSum = 0;
  let runeCount = 0;
  for (const page of pages) {
    if (!page.indices.length) {
      decoded.push([page.page, []]);
      continue;
    }
    const dp = runDP(page.indices, key, startPhase);
    decoded.push([page.page, dp.output]);
    skipCount += dp.skipPositions.length;
    bigramSum += dp.bigramScore * page.indices.length;
    runeCount += page.indices.length;
  }
  return {
    bigramScore: bigramSum / runeCount,
    skipCount,
    decoded,
    summary: scorePages(decoded)
  };
}
function positiveControl(lp1, vector) {
  const source = lp1.split('$')[vector.segment];
  const words = ciphertextWords(source);
  const expectedWords = plaintextWords(vector.english);
  const usedWords = words.slice(0, expectedWords.length);
  assert.equal(usedWords.length, expectedWords.length);
  expectedWords.forEach((word, i) => assert.equal(usedWords[i].length, word.length));
  const cipher = usedWords.flat();
  const expected = expectedWords.flat();
  const key = plaintextWords(vector.keyText).flat();
  const expectedSkips = expected.flatMap((x, i) => x === 0 ? [i] : []);
  const dp = runDP(cipher, key, 0);
  assert.deepEqual(dp.output, expected, vector.name + ' exact plaintext');
  assert.deepEqual(dp.skipPositions, expectedSkips, vector.name + ' exact F mask');
  return {
    name: vector.name,
    segment: vector.segment,
    cipherRunes: cipher.length,
    key,
    expectedLiteralFSkips: expectedSkips,
    recoveredLiteralFSkips: dp.skipPositions,
    exactPlaintext: true,
    bigramScore: dp.bigramScore
  };
}

const vectors = [
  {
    name: 'DIVINITY',
    segment: 1,
    keyText: 'DIVINITY',
    english: 'WELCOME WELCOME PILGRIM TO THE GREAT JOURNEY TOWARD THE END OF ALL THINGS IT IS NOT AN EASY TRIP BUT FOR THOSE WHO FIND THEIR WAY HERE IT IS A NECESSARY ONE'
  },
  {
    name: 'FIRFUMFERENFE',
    segment: 5,
    keyText: 'FIRFUMFERENFE',
    english: 'A KOAN DURING A LESSON THE MASTER EXPLAINED THE I THE I IS THE VOICE OF THE CIRCUMFERENCE HE SAID WHEN ASKED BY A STUDENT TO EXPLAIN WHAT THAT MEANT'
  }
];
const positiveControls = vectors.map((v) => positiveControl(lp1Text, v));
const keys = Object.fromEntries(vectors.map((v) => [v.name, plaintextWords(v.keyText).flat()]));
const allPages = corpus.pages.filter((p) => p.page <= 55).sort((a, b) => a.page - b.page);
const primeNumbers = new Set([2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53]);
const primePages = allPages.filter((p) => primeNumbers.has(p.page));

const results = {};
for (const [name, key] of Object.entries(keys)) {
  const allPhases = Array.from({ length: key.length }, (_, phase) => ({
    phase,
    all: globalDecode(allPages, key, phase),
    prime: globalDecode(primePages, key, phase)
  }));
  allPhases.sort((a, b) => b.all.summary.trigramScore - a.all.summary.trigramScore);
  const wrongKey = key.slice();
  wrongKey[0] = (wrongKey[0] + 1) % MOD;
  const wrong = {
    all: globalDecode(allPages, wrongKey, 0),
    prime: globalDecode(primePages, wrongKey, 0)
  };
  const exactPhase = allPhases.find((x) => x.phase === 0);
  const best = allPhases[0];
  results[name] = {
    key,
    exactSourcePhase0: {
      all: {
        ...exactPhase.all,
        samplePage0: samplePage(exactPhase.all.decoded, 0),
        samplePage28: samplePage(exactPhase.all.decoded, 28)
      },
      prime: {
        ...exactPhase.prime,
        samplePage2: samplePage(exactPhase.prime.decoded, 2),
        samplePage29: samplePage(exactPhase.prime.decoded, 29)
      }
    },
    bestOfAllStartingPhases: {
      phase: best.phase,
      all: {
        ...best.all,
        samplePage0: samplePage(best.all.decoded, 0),
        samplePage28: samplePage(best.all.decoded, 28)
      },
      prime: {
        ...best.prime,
        samplePage2: samplePage(best.prime.decoded, 2),
        samplePage29: samplePage(best.prime.decoded, 29)
      }
    },
    wrongKeyPhase0: wrong
  };
}

const rawAll = scorePages(allPages.map((p) => [p.page, p.indices]));
const rawPrime = scorePages(primePages.map((p) => [p.page, p.indices]));
const output = {
  source: {
    corpusSha256: sha256(corpusRaw),
    lp1SourceSha256: sha256(lp1Text),
    regressionScriptSha256: sha256(sourceRegression),
    keySources: vectors.map((v) => v.name)
  },
  corpus: {
    allPages: allPages.filter((p) => p.indices.length).length,
    allRunes: allPages.reduce((n, p) => n + p.indices.length, 0),
    primePages: primePages.map((p) => p.page),
    primeRunes: primePages.reduce((n, p) => n + p.indices.length, 0),
    languageModelTrainingSymbols: model.trainingSymbols
  },
  positiveControls,
  rawCiphertext: { all: rawAll, prime: rawPrime },
  results
};
console.log(JSON.stringify(output, null, 2));
