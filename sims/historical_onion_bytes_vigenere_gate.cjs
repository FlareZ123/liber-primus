'use strict';

/*
 * Test the three archived historical 256-byte onion-service strings as
 * direct GP29 Vigenere/Beaufort key streams against original LP2.
 *
 * Search includes two byte-to-GP reducers, forward/reverse byte order,
 * Vigenere subtraction/addition, Beaufort, each with Atbash, all rotations,
 * page-repeat/global-repeat clocks, and a 256-byte page-one-shot clock.
 *
 * Run from repository root:
 *   node sims/historical_onion_bytes_vigenere_gate.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');
const keyResourceRaw = read('resources/cicada-hiddenservice-256-candidates.json');
const corpusRaw = read('resources/liber-primus/lp2-corpus.json');
const shakeText = read('resources/control/shakespeare_first300k.txt');
const plaintextReference = read('resources/liber-primus/lp1-plaintext-reference.txt');
const keyResource = JSON.parse(keyResourceRaw);
const corpus = JSON.parse(corpusRaw);
const sourceKeys = keyResource.sourceServices.map((x) => ({
  id: x.id,
  hex: x.hex,
  bytes: Array.from({ length: x.hex.length / 2 }, (_, i) => parseInt(x.hex.slice(i * 2, i * 2 + 2), 16))
}));
assert.equal(sourceKeys.length, 3);
assert(sourceKeys.every((x) => x.bytes.length === 256));

const MOD = 29;
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
const pages = corpus.pages.filter((p) => p.page <= 55).sort((a, b) => a.page - b.page);
const trainPages = pages.filter((p) => p.page <= 27 && p.indices.length >= 180);
const holdPages = pages.filter((p) => p.page >= 28 && p.indices.length >= 180);
const globalOffsets = new Map();
let totalOffset = 0;
for (const page of pages) {
  globalOffsets.set(page.page, totalOffset);
  totalOffset += page.indices.length;
}

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
  return { symbols: symbols.length, trigram };
}
const model = trainTrigram(shakeText.slice(0, 240000));
const trigram = model.trigram;

const configs = Array.from({ length: 6 }, (_, i) => ({
  atbash: i >= 3,
  op: i % 3,
  name: (i >= 3 ? 'atbash+' : '') + ['vig-', 'vig+', 'beaufort'][i % 3]
}));
const reducers = [
  { name: 'byte-mod29', apply: (b) => b % MOD },
  { name: 'byte-scaled29', apply: (b) => Math.floor(MOD * b / 256) }
];
const clockModes = [
  { name: 'page-repeat', rotations: 256 },
  { name: 'page-one-shot', rotations: 77 },
  { name: 'global-repeat', rotations: 256 }
];
const keyCache = new Map();
function keyFor(sourceIndex, reverse, reducerIndex, rotation) {
  const id = [sourceIndex, reverse, reducerIndex, rotation].join(':');
  if (keyCache.has(id)) return keyCache.get(id);
  const bytes = reverse ? sourceKeys[sourceIndex].bytes.slice().reverse() : sourceKeys[sourceIndex].bytes;
  const key = bytes.map(reducers[reducerIndex].apply);
  const rotated = key.slice(rotation).concat(key.slice(0, rotation));
  keyCache.set(id, rotated);
  return rotated;
}
function keyIndex(clock, page, i) {
  if (clock === 'page-one-shot') return i;
  if (clock === 'global-repeat') return (globalOffsets.get(page) + i) % 256;
  return i % 256;
}
function decrypt(cipher, key, config) {
  const x = config.atbash ? MOD - 1 - cipher : cipher;
  if (config.op === 0) return (x - key + MOD) % MOD;
  if (config.op === 1) return (x + key) % MOD;
  return (key - x + MOD) % MOD;
}
function scoreTraining(candidate) {
  const key = keyFor(candidate.sourceIndex, candidate.reverse, candidate.reducerIndex, candidate.rotation);
  const config = configs[candidate.configIndex];
  let score = 0;
  let count = 0;
  for (const page of trainPages) {
    let a = 0, b = 0;
    for (let i = 0; i < 90; i++) {
      const ki = keyIndex(candidate.clock, page.page, i);
      const plain = decrypt(page.indices[i], key[ki], config);
      if (i >= 2) {
        score += trigram[(a * MOD + b) * MOD + plain];
        count++;
      }
      a = b;
      b = plain;
    }
  }
  return score / count;
}
function scoreHoldout(candidate) {
  const key = keyFor(candidate.sourceIndex, candidate.reverse, candidate.reducerIndex, candidate.rotation);
  const config = configs[candidate.configIndex];
  let score = 0;
  let count = 0;
  for (const page of holdPages) {
    let a = 0, b = 0;
    for (let i = 0; i < 180; i++) {
      const ki = keyIndex(candidate.clock, page.page, i);
      if (ki >= 256) break;
      const plain = decrypt(page.indices[i], key[ki], config);
      if (i >= 92) {
        score += trigram[(a * MOD + b) * MOD + plain];
        count++;
      }
      a = b;
      b = plain;
    }
  }
  return score / count;
}
function scoreFull(candidate) {
  const key = keyFor(candidate.sourceIndex, candidate.reverse, candidate.reducerIndex, candidate.rotation);
  const config = configs[candidate.configIndex];
  let all = 0, allN = 0, later = 0, laterN = 0;
  const pageScores = [];
  for (const page of pages) {
    let a = 0, b = 0, s = 0, n = 0;
    for (let i = 0; i < page.indices.length; i++) {
      const ki = keyIndex(candidate.clock, page.page, i);
      if (ki >= 256) break;
      const plain = decrypt(page.indices[i], key[ki], config);
      if (i >= 2) {
        const v = trigram[(a * MOD + b) * MOD + plain];
        s += v;
        n++;
        all += v;
        allN++;
        if (page.page >= 28) {
          later += v;
          laterN++;
        }
      }
      a = b;
      b = plain;
    }
    if (n) pageScores.push({ page: page.page, length: n + 2, score: s / n });
  }
  return {
    allPages: all / allN,
    laterPages: later / laterN,
    bestPages: pageScores.sort((a, b) => b.score - a.score).slice(0, 8)
  };
}
function samplePage(candidate, pageNumber) {
  const page = pages.find((p) => p.page === pageNumber);
  const key = keyFor(candidate.sourceIndex, candidate.reverse, candidate.reducerIndex, candidate.rotation);
  const config = configs[candidate.configIndex];
  return page.indices.slice(0, 90).map((c, i) => {
    const ki = keyIndex(candidate.clock, pageNumber, i);
    return ki >= 256 ? '_' : RUNE_NAMES[decrypt(c, key[ki], config)];
  }).join(' ');
}

const candidates = [];
for (let sourceIndex = 0; sourceIndex < sourceKeys.length; sourceIndex++) {
  for (const reverse of [false, true]) {
    for (let reducerIndex = 0; reducerIndex < reducers.length; reducerIndex++) {
      for (let configIndex = 0; configIndex < configs.length; configIndex++) {
        for (const clock of clockModes) {
          for (let rotation = 0; rotation < clock.rotations; rotation++) {
            const candidate = { sourceIndex, reverse, reducerIndex, configIndex, clock: clock.name, rotation };
            candidates.push({ ...candidate, train: scoreTraining(candidate) });
          }
        }
      }
    }
  }
}
assert.equal(candidates.length, 42408);
candidates.sort((a, b) => b.train - a.train);
const top = candidates.slice(0, 10).map((candidate) => ({
  source: sourceKeys[candidate.sourceIndex].id,
  reverse: candidate.reverse,
  mapping: reducers[candidate.reducerIndex].name,
  transform: configs[candidate.configIndex].name,
  clock: candidate.clock,
  rotation: candidate.rotation,
  train: candidate.train,
  holdout: scoreHoldout(candidate)
}));
const best = candidates[0];
const bestFull = scoreFull(best);

const raw = (() => {
  let train = 0, trainN = 0, hold = 0, holdN = 0;
  for (const page of trainPages) {
    const s = page.indices.slice(0, 90);
    for (let i = 2; i < s.length; i++) {
      train += trigram[(s[i - 2] * MOD + s[i - 1]) * MOD + s[i]];
      trainN++;
    }
  }
  for (const page of holdPages) {
    const s = page.indices.slice(90, 180);
    for (let i = 2; i < s.length; i++) {
      hold += trigram[(s[i - 2] * MOD + s[i - 1]) * MOD + s[i]];
      holdN++;
    }
  }
  return { train: train / trainN, holdout: hold / holdN };
})();

const plantText = encodeGP(shakeText.slice(240000));
const plantedPages = Array.from({ length: 8 }, (_, j) => plantText.slice(1000 + j * 600, 1180 + j * 600));
const truth = {
  sourceIndex: 0, reverse: false, reducerIndex: 0, configIndex: 0,
  clock: 'global-repeat', rotation: 37
};
const plantedCipher = plantedPages.map((plain, j) => plain.map((p, i) => {
  const key = keyFor(truth.sourceIndex, truth.reverse, truth.reducerIndex, truth.rotation);
  for (let c = 0; c < MOD; c++) {
    if (decrypt(c, key[(j * 180 + i) % 256], configs[truth.configIndex]) === p) return c;
  }
  throw new Error('No inverse for planted rune');
}));
const plantedCandidates = [];
for (let sourceIndex = 0; sourceIndex < sourceKeys.length; sourceIndex++) {
  for (const reverse of [false, true]) {
    for (let reducerIndex = 0; reducerIndex < reducers.length; reducerIndex++) {
      for (let configIndex = 0; configIndex < configs.length; configIndex++) {
        for (const clock of clockModes) {
          for (let rotation = 0; rotation < clock.rotations; rotation++) {
            const key = keyFor(sourceIndex, reverse, reducerIndex, rotation);
            let score = 0, count = 0;
            for (let j = 0; j < 4; j++) {
              let a = 0, b = 0;
              for (let i = 0; i < 90; i++) {
                const ki = clock.name === 'global-repeat'
                  ? (j * 180 + i) % 256
                  : clock.name === 'page-one-shot' ? i : i % 256;
                const plain = decrypt(plantedCipher[j][i], key[ki], configs[configIndex]);
                if (i >= 2) {
                  score += trigram[(a * MOD + b) * MOD + plain];
                  count++;
                }
                a = b;
                b = plain;
              }
            }
            plantedCandidates.push({
              score: score / count, sourceIndex, reverse, reducerIndex,
              configIndex, clock: clock.name, rotation
            });
          }
        }
      }
    }
  }
}
plantedCandidates.sort((a, b) => b.score - a.score);
const plantedRank = plantedCandidates.findIndex((x) =>
  x.sourceIndex === truth.sourceIndex &&
  x.reverse === truth.reverse &&
  x.reducerIndex === truth.reducerIndex &&
  x.configIndex === truth.configIndex &&
  x.clock === truth.clock &&
  x.rotation === truth.rotation
) + 1;

const output = {
  sources: sourceKeys.map((x) => ({ id: x.id, bytes: x.bytes.length })),
  corpus: {
    unsolvedPages: pages.filter((p) => p.indices.length).length,
    unsolvedRunes: pages.reduce((n, p) => n + p.indices.length, 0),
    trainPages: trainPages.length,
    holdoutPages: holdPages.length,
    trainRunes: trainPages.length * 90,
    holdoutRunes: holdPages.length * 90
  },
  sourceHashes: {
    keyResource: sha256(keyResourceRaw),
    corpus: sha256(corpusRaw),
    languageControl: sha256(shakeText)
  },
  modelTrainingSymbols: model.symbols,
  candidateCount: candidates.length,
  rawCiphertext: raw,
  best: {
    source: sourceKeys[best.sourceIndex].id,
    reverse: best.reverse,
    mapping: reducers[best.reducerIndex].name,
    transform: configs[best.configIndex].name,
    clock: best.clock,
    rotation: best.rotation,
    train: best.train,
    holdout: scoreHoldout(best),
    full: bestFull,
    page28Sample: samplePage(best, 28)
  },
  top10: top,
  plantedControl: {
    candidateCount: plantedCandidates.length,
    rank: plantedRank,
    trueSettings: truth,
    topScore: plantedCandidates[0].score
  }
};
console.log(JSON.stringify(output, null, 2));
