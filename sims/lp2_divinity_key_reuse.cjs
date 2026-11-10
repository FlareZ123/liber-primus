'use strict';

/*
 * Test reuse of the authentic LP1 pages 03-04 Vigenere key on unsolved LP2.
 * The key and literal-F convention are taken from the repository's
 * authentic_lp1_p03_p04_vigenere_recovery.cjs.
 *
 * Run from repository root:
 *   node sims/lp2_divinity_key_reuse.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');
const corpusRaw = read('resources/liber-primus/lp2-corpus.json');
const shakeText = read('resources/control/shakespeare_first300k.txt');
const reference = read('resources/liber-primus/lp1-plaintext-reference.txt');
const sourceScript = read('sims/authentic_lp1_p03_p04_vigenere_recovery.cjs');
const corpus = JSON.parse(corpusRaw);

const KEY = [23, 10, 1, 10, 9, 10, 16, 26]; // GP indices for DIVINITY (V represented by U)
const MOD = 29;
const SEGMENT = 90;
const MIN_PAGE = 180;
const RUNE_NAMES = [
  'F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X',
  'S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'
];
const DIGRAPHS = { TH: 2, NG: 21, EO: 12, OE: 22, AE: 25, IA: 27, EA: 28 };
const LETTERS = {
  A:24, B:17, C:5, D:23, E:18, F:0, G:6, H:8, I:10, J:11, K:5,
  L:20, M:19, N:9, O:3, P:13, Q:5, R:4, S:15, T:16, U:1, V:1,
  W:7, X:14, Y:26, Z:15
};

assert(sourceScript.includes('const key = [23, 10, 1, 10, 9, 10, 16, 26]'));
function sha256(s) {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
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
function trainTrigram(text) {
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
  return { trigram, trainingSymbols: symbols.length };
}
function scoreSequence(seq, trigram) {
  let score = 0;
  let count = 0;
  for (let i = 2; i < seq.length; i++) {
    score += trigram[(seq[i - 2] * MOD + seq[i - 1]) * MOD + seq[i]];
    count++;
  }
  return { score: count ? score / count : null, count };
}
function decryptPage(cipher, phaseStart, literalF) {
  let phase = phaseStart;
  const plain = [];
  for (const c of cipher) {
    if (literalF && c === 0) {
      plain.push(0);
      continue;
    }
    plain.push((c - KEY[phase] + MOD) % MOD);
    phase = (phase + 1) % KEY.length;
  }
  return { plain, nextPhase: phase };
}
function run(clock, phaseStart, literalF, pages, trigram) {
  let globalPhase = phaseStart;
  let trainScore = 0, trainCount = 0;
  let holdScore = 0, holdCount = 0;
  let allScore = 0, allCount = 0;
  let laterScore = 0, laterCount = 0;
  const pageScores = [];
  const samples = {};
  for (const page of pages) {
    const start = clock === 'page-reset' ? phaseStart : globalPhase;
    const decoded = decryptPage(page.indices, start, literalF);
    if (clock === 'global') globalPhase = decoded.nextPhase;
    const full = scoreSequence(decoded.plain, trigram);
    if (full.count) {
      allScore += full.score * full.count;
      allCount += full.count;
      if (page.page >= 28) {
        laterScore += full.score * full.count;
        laterCount += full.count;
      }
      pageScores.push({ page: page.page, length: decoded.plain.length, score: full.score });
    }
    if (page.page <= 27 && decoded.plain.length >= MIN_PAGE) {
      const s = scoreSequence(decoded.plain.slice(0, SEGMENT), trigram);
      trainScore += s.score * s.count;
      trainCount += s.count;
    }
    if (page.page >= 28 && decoded.plain.length >= MIN_PAGE) {
      const s = scoreSequence(decoded.plain.slice(SEGMENT, SEGMENT * 2), trigram);
      holdScore += s.score * s.count;
      holdCount += s.count;
    }
    if (page.page === 0 || page.page === 28) {
      samples[page.page] = decoded.plain.slice(0, 90).map((x) => RUNE_NAMES[x]).join(' ');
    }
  }
  return {
    clock, phaseStart, literalF,
    train: trainScore / trainCount,
    holdout: holdScore / holdCount,
    allPages: allScore / allCount,
    laterPages: laterScore / laterCount,
    pageScores: pageScores.sort((a, b) => b.score - a.score).slice(0, 8),
    samples
  };
}

const model = trainTrigram(shakeText.slice(0, 240000));
const trigram = model.trigram;
const pages = corpus.pages.filter((p) => p.page <= 55).sort((a, b) => a.page - b.page);
assert.equal(pages.filter((p) => p.indices.length > 0).reduce((n, p) => n + p.indices.length, 0), 12956);
const configs = [];
for (const literalF of [true, false]) {
  for (const clock of ['global', 'page-reset']) {
    for (let phase = 0; phase < KEY.length; phase++) {
      configs.push(run(clock, phase, literalF, pages, trigram));
    }
  }
}
configs.sort((a, b) => b.train - a.train);

const trainPages = pages.filter((p) => p.page <= 27 && p.indices.length >= MIN_PAGE);
const holdPages = pages.filter((p) => p.page >= 28 && p.indices.length >= MIN_PAGE);
const rawTrain = (() => {
  let s = 0, n = 0;
  for (const p of trainPages) {
    const x = scoreSequence(p.indices.slice(0, SEGMENT), trigram);
    s += x.score * x.count; n += x.count;
  }
  return s / n;
})();
const rawHold = (() => {
  let s = 0, n = 0;
  for (const p of holdPages) {
    const x = scoreSequence(p.indices.slice(SEGMENT, SEGMENT * 2), trigram);
    s += x.score * x.count; n += x.count;
  }
  return s / n;
})();
const random = [];
let seed = 0x5a17c0de;
for (let i = 0; i < 5000; i++) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  random.push(seed % MOD);
}
const p56Start = reference.indexOf('## 56');
const p57Start = reference.indexOf('## 57');
const p56 = reference.slice(p56Start + 5, p57Start);
const p57 = reference.slice(p57Start + 5);
const output = {
  source: {
    key: KEY,
    keyTransliteration: 'D I U I N I T Y',
    sourceScriptSha256: sha256(sourceScript),
    corpusSha256: sha256(corpusRaw),
    languageModelSymbols: model.trainingSymbols
  },
  corpus: {
    unsolvedPages: pages.filter((p) => p.indices.length > 0).length,
    unsolvedRunes: pages.reduce((n, p) => n + p.indices.length, 0),
    trainPages: trainPages.length,
    holdoutPages: holdPages.length,
    trainRunes: trainPages.length * SEGMENT,
    holdoutRunes: holdPages.length * SEGMENT
  },
  calibration: {
    rawTrain,
    rawHoldout: rawHold,
    random5000Symbols: scoreSequence(random, trigram).score,
    knownPage56: scoreSequence(encodeGP(p56), trigram).score,
    knownPage57: scoreSequence(encodeGP(p57), trigram).score,
    shakespeareHeldout: scoreSequence(encodeGP(shakeText.slice(240000, 260000)), trigram).score
  },
  testedConfigurations: configs.length,
  best: configs[0],
  allConfigurations: configs.map((x) => ({
    train: x.train, holdout: x.holdout, allPages: x.allPages, laterPages: x.laterPages,
    clock: x.clock, phaseStart: x.phaseStart, literalF: x.literalF
  }))
};
console.log(JSON.stringify(output, null, 2));
