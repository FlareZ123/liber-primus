'use strict';

/*
 * Two source-derived interpretations of the 2014 onion-2 byte/timing channel.
 *
 * A timing cell at position p is the inter-arrival interval (in 5-minute units)
 * between bytes p-1 and p. The first model holds byte p-1 for that interval.
 * The second uses cumulative elapsed units as a sampling index into the 256-byte
 * source string. Both are tested as additive GP29 keys against original LP2.
 *
 * Run: node sims/onion2_timing_byte_interleavings.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');
const timingRaw = read('resources/cicada2014-onion2-timing.json');
const corpusRaw = read('resources/liber-primus/lp2-corpus.json');
const shakespeare = read('resources/control/shakespeare_first300k.txt');
const plaintextReference = read('resources/liber-primus/lp1-plaintext-reference.txt');
const timing = JSON.parse(timingRaw);
const corpus = JSON.parse(corpusRaw);

const MOD = 29;
const SEGMENT = 90;
const MIN_PAGE = 180;
const DIGRAPHS = { TH: 2, NG: 21, EO: 12, OE: 22, AE: 25, IA: 27, EA: 28 };
const LETTERS = {
  A:24, B:17, C:5, D:23, E:18, F:0, G:6, H:8, I:10, J:11, K:5,
  L:20, M:19, N:9, O:3, P:13, Q:5, R:4, S:15, T:16, U:1, V:1,
  W:7, X:14, Y:26, Z:15
};
const RUNE_NAMES = [
  'F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X',
  'S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'
];
const CONFIGS = Array.from({ length: 6 }, (_, i) => ({
  atbash: i >= 3,
  op: i % 3,
  name: (i >= 3 ? 'atbash+' : '') + ['vig-', 'vig+', 'beaufort'][i % 3]
}));
const MAPPINGS = [
  { name: 'byte-mod29', fn: (b) => b % MOD },
  { name: 'byte-scaled29', fn: (b) => Math.floor(MOD * b / 256) }
];

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
function mod29(x) {
  return (x % MOD + MOD) % MOD;
}
function decodeSymbol(cipher, key, cfg) {
  const c = cfg.atbash ? 28 - cipher : cipher;
  if (cfg.op === 0) return mod29(c - key);
  if (cfg.op === 1) return mod29(c + key);
  return mod29(key - c);
}
function encodeSymbol(plain, key, cfg) {
  for (let c = 0; c < MOD; c++) {
    if (decodeSymbol(c, key, cfg) === plain) return c;
  }
  throw new Error('non-invertible test transform');
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
function scorePageRange(pages, start, length, trigram) {
  let score = 0;
  let count = 0;
  for (const page of pages) {
    const seq = page.indices.slice(start, start + length);
    const s = scoreSequence(seq, trigram);
    score += s.score * s.count;
    count += s.count;
  }
  return { score: score / count, count };
}

assert.equal(timing.final_hex.length, 512, 'expected 256-byte historical string');
const sourceBytes = Array.from(
  { length: 256 },
  (_, i) => parseInt(timing.final_hex.slice(i * 2, i * 2 + 2), 16)
);
const intervalByPosition = new Map(timing.interval_cells.map((x) => [x.pos, x.k_5min]));
assert.equal(timing.interval_cells.length, 112, 'attested interval count changed');
assert.deepEqual(timing.bounded_bridge.variants_k, [
  [1,5], [2,4], [3,3], [4,2], [5,1]
]);

function intervalSequence(bridge) {
  const out = [];
  for (let p = 143; p <= 256; p++) {
    const k = intervalByPosition.get(p) ??
      (p === 190 ? bridge[0] : p === 191 ? bridge[1] : null);
    assert(Number.isInteger(k) && k >= 1 && k <= 7, 'missing or invalid timing cell at ' + p);
    out.push(k);
  }
  assert.equal(out.length, 114);
  assert.equal(out.reduce((a, b) => a + b, 0), 240);
  return out;
}

function buildTimeExpandedStream(ks) {
  // During the interval before byte p arrives, byte p-1 is the latest byte.
  const out = [];
  for (let i = 0; i < ks.length; i++) {
    const p = 143 + i;
    const heldByte = sourceBytes[p - 2]; // 1-based byte position p-1
    for (let j = 0; j < ks[i]; j++) out.push(heldByte);
  }
  assert.equal(out.length, 240);
  return out;
}
function buildCumulativeSampleStream(ks) {
  // Advance through the source string by each elapsed 5-minute unit count.
  let cursor = 0;
  const out = [];
  for (const k of ks) {
    cursor += k;
    assert(cursor < sourceBytes.length);
    out.push(sourceBytes[cursor]);
  }
  assert.equal(cursor, 240);
  assert.equal(out.length, 114);
  return out;
}

const bridgeVariants = timing.bounded_bridge.variants_k;
const expandedStreams = bridgeVariants.map((v) => buildTimeExpandedStream(intervalSequence(v)));
const sampledStreams = bridgeVariants.map((v) => buildCumulativeSampleStream(intervalSequence(v)));
const pagesAll = corpus.pages.filter((p) => p.page <= 55).sort((a, b) => a.page - b.page);
const pages = pagesAll.filter((p) => p.indices.length > 0);
const trainPages = pages.filter((p) => p.page <= 27 && p.indices.length >= MIN_PAGE);
const holdPages = pages.filter((p) => p.page >= 28 && p.indices.length >= MIN_PAGE);
assert.equal(pages.reduce((n, p) => n + p.indices.length, 0), 12956);
assert.equal(trainPages.length, 25);
assert.equal(holdPages.length, 22);

const globalOffsets = new Map();
let globalOffset = 0;
for (const page of pagesAll) {
  globalOffsets.set(page.page, globalOffset);
  globalOffset += page.indices.length;
}

const language = trainTrigram(shakespeare.slice(0, 240000));
const trigram = language.trigram;
const keyCache = new Map();
function mappedKey(stream, reverse, mappingIndex) {
  const id = [stream, reverse, mappingIndex].join(':');
  if (keyCache.has(id)) return keyCache.get(id);
  const raw = reverse ? stream.slice().reverse() : stream.slice();
  const key = raw.map(MAPPINGS[mappingIndex].fn);
  keyCache.set(id, key);
  return key;
}
function keyIndex(clock, pageNumber, i, rotation, keyLength) {
  if (clock === 'global-repeat') return (globalOffsets.get(pageNumber) + rotation + i) % keyLength;
  if (clock === 'page-one-shot') return rotation + i;
  return (rotation + i) % keyLength;
}

function clockModes(kind, keyLength) {
  if (kind === 'time-expanded') {
    return [
      { name: 'page-repeat', rotations: keyLength },
      { name: 'page-one-shot-suffix>=180', rotations: keyLength - 179 },
      { name: 'global-repeat', rotations: keyLength }
    ];
  }
  return [
    { name: 'page-repeat', rotations: keyLength },
    { name: 'global-repeat', rotations: keyLength }
  ];
}

function searchOriginal(kind, streams) {
  const keyLength = streams[0].length;
  const clocks = clockModes(kind, keyLength);
  const rows = [];
  for (let si = 0; si < streams.length; si++) {
    for (let reverse = 0; reverse < 2; reverse++) {
      for (let mapping = 0; mapping < MAPPINGS.length; mapping++) {
        const key = mappedKey(streams[si], reverse, mapping);
        for (let ci = 0; ci < CONFIGS.length; ci++) {
          for (const clock of clocks) {
            for (let rotation = 0; rotation < clock.rotations; rotation++) {
              let score = 0;
              let count = 0;
              for (const page of trainPages) {
                let a = 0;
                let b = 0;
                for (let i = 0; i < SEGMENT; i++) {
                  const ki = keyIndex(clock.name, page.page, i, rotation, keyLength);
                  const p = decodeSymbol(page.indices[i], key[ki], CONFIGS[ci]);
                  if (i >= 2) {
                    score += trigram[(a * MOD + b) * MOD + p];
                    count++;
                  }
                  a = b;
                  b = p;
                }
              }
              rows.push({
                train: score / count, si, reverse, mapping, config: ci,
                clock: clock.name, rotation
              });
            }
          }
        }
      }
    }
  }
  rows.sort((a, b) => b.train - a.train);
  const top = rows.slice(0, 20).map((x) => {
    const key = mappedKey(streams[x.si], x.reverse, x.mapping);
    let score = 0;
    let count = 0;
    for (const page of holdPages) {
      let a = 0;
      let b = 0;
      for (let i = 0; i < SEGMENT * 2; i++) {
        const ki = keyIndex(x.clock, page.page, i, x.rotation, keyLength);
        if (ki >= keyLength) break;
        const p = decodeSymbol(page.indices[i], key[ki], CONFIGS[x.config]);
        if (i >= SEGMENT + 2) {
          score += trigram[(a * MOD + b) * MOD + p];
          count++;
        }
        a = b;
        b = p;
      }
    }
    return { ...x, holdout: score / count, holdoutCount: count };
  });
  const best = top[0];
  const bestKey = mappedKey(streams[best.si], best.reverse, best.mapping);
  let allScore = 0;
  let allCount = 0;
  let laterScore = 0;
  let laterCount = 0;
  for (const page of pages) {
    let a = 0;
    let b = 0;
    let pageScore = 0;
    let pageCount = 0;
    for (let i = 0; i < page.indices.length; i++) {
      const ki = keyIndex(best.clock, page.page, i, best.rotation, keyLength);
      if (ki >= keyLength) break;
      const p = decodeSymbol(page.indices[i], bestKey[ki], CONFIGS[best.config]);
      if (i >= 2) {
        const v = trigram[(a * MOD + b) * MOD + p];
        allScore += v;
        allCount++;
        pageScore += v;
        pageCount++;
        if (page.page >= 28) {
          laterScore += v;
          laterCount++;
        }
      }
      a = b;
      b = p;
    }
  }
  const samplePage = pagesAll.find((p) => p.page === 28);
  const sample = [];
  for (let i = 0; i < Math.min(120, samplePage.indices.length); i++) {
    const ki = keyIndex(best.clock, samplePage.page, i, best.rotation, keyLength);
    if (ki >= keyLength) break;
    sample.push(RUNE_NAMES[decodeSymbol(samplePage.indices[i], bestKey[ki], CONFIGS[best.config])]);
  }
  return {
    candidateCount: rows.length,
    best: {
      ...best,
      bridge: bridgeVariants[best.si],
      mappingName: MAPPINGS[best.mapping].name,
      configName: CONFIGS[best.config].name,
      allPagesFullScore: allScore / allCount,
      laterPagesFullScore: laterScore / laterCount,
      samplePage28: sample.join(' ')
    },
    top20: top.map((x) => ({
      train: x.train,
      holdout: x.holdout,
      bridge: bridgeVariants[x.si],
      reverse: !!x.reverse,
      mapping: MAPPINGS[x.mapping].name,
      config: CONFIGS[x.config].name,
      clock: x.clock,
      rotation: x.rotation
    }))
  };
}

function searchPlant(kind, streams, planted) {
  const keyLength = streams[0].length;
  const plantSymbols = encodeGP(shakespeare.slice(240000));
  const plainPages = Array.from({ length: 8 }, (_, j) =>
    plantSymbols.slice(1000 + j * 600, 1180 + j * 600)
  );
  assert(plainPages.every((p) => p.length === 180));
  const trueKey = mappedKey(streams[planted.si], planted.reverse, planted.mapping);
  const cipherPages = plainPages.map((p) => p.map((v, i) =>
    encodeSymbol(v, trueKey[(planted.rotation + i) % keyLength], CONFIGS[planted.config])
  ));
  for (let j = 0; j < cipherPages.length; j++) {
    for (let i = 0; i < cipherPages[j].length; i++) {
      assert.equal(
        decodeSymbol(cipherPages[j][i], trueKey[(planted.rotation + i) % keyLength], CONFIGS[planted.config]),
        plainPages[j][i]
      );
    }
  }
  const clocks = clockModes(kind, keyLength);
  const rows = [];
  for (let si = 0; si < streams.length; si++) {
    for (let reverse = 0; reverse < 2; reverse++) {
      for (let mapping = 0; mapping < MAPPINGS.length; mapping++) {
        const key = mappedKey(streams[si], reverse, mapping);
        for (let ci = 0; ci < CONFIGS.length; ci++) {
          for (const clock of clocks) {
            for (let rotation = 0; rotation < clock.rotations; rotation++) {
              let score = 0;
              let count = 0;
              for (let j = 0; j < 4; j++) {
                let a = 0;
                let b = 0;
                for (let i = 0; i < SEGMENT; i++) {
                  const ki = clock.name === 'global-repeat'
                    ? (j * 180 + rotation + i) % keyLength
                    : clock.name === 'page-one-shot' ? rotation + i : (rotation + i) % keyLength;
                  if (ki >= keyLength) break;
                  const p = decodeSymbol(cipherPages[j][i], key[ki], CONFIGS[ci]);
                  if (i >= 2) {
                    score += trigram[(a * MOD + b) * MOD + p];
                    count++;
                  }
                  a = b;
                  b = p;
                }
              }
              rows.push({
                train: score / count, si, reverse, mapping, config: ci,
                clock: clock.name, rotation
              });
            }
          }
        }
      }
    }
  }
  rows.sort((a, b) => b.train - a.train);
  const rank = rows.findIndex((x) =>
    x.si === planted.si && x.reverse === planted.reverse &&
    x.mapping === planted.mapping && x.config === planted.config &&
    x.clock === 'page-repeat' && x.rotation === planted.rotation
  ) + 1;
  const top = rows[0];
  const topKey = mappedKey(streams[top.si], top.reverse, top.mapping);
  let holdScore = 0;
  let holdCount = 0;
  for (let j = 4; j < 8; j++) {
    let a = 0;
    let b = 0;
    for (let i = 0; i < SEGMENT * 2; i++) {
      const ki = top.clock === 'global-repeat'
        ? (j * 180 + top.rotation + i) % keyLength
        : top.clock === 'page-one-shot' ? top.rotation + i : (top.rotation + i) % keyLength;
      if (ki >= keyLength) break;
      const p = decodeSymbol(cipherPages[j][i], topKey[ki], CONFIGS[top.config]);
      if (i >= SEGMENT + 2) {
        holdScore += trigram[(a * MOD + b) * MOD + p];
        holdCount++;
      }
      a = b;
      b = p;
    }
  }
  const trueRow = rows.find((x) =>
    x.si === planted.si && x.reverse === planted.reverse &&
    x.mapping === planted.mapping && x.config === planted.config &&
    x.clock === 'page-repeat' && x.rotation === planted.rotation
  );
  return {
    candidateCount: rows.length,
    rank,
    best: {
      bridge: bridgeVariants[top.si],
      reverse: !!top.reverse,
      mapping: MAPPINGS[top.mapping].name,
      config: CONFIGS[top.config].name,
      clock: top.clock,
      rotation: top.rotation,
      trainScore: top.train,
      holdoutScore: holdScore / holdCount
    },
    planted: {
      bridge: bridgeVariants[planted.si],
      reverse: !!planted.reverse,
      mapping: MAPPINGS[planted.mapping].name,
      config: CONFIGS[planted.config].name,
      rotation: planted.rotation,
      trainScore: trueRow.train
    }
  };
}

function sectionText(n) {
  const marker = '## ' + n;
  const start = plaintextReference.indexOf(marker);
  if (start < 0) return '';
  const end = plaintextReference.indexOf('\n## ', start + marker.length);
  return plaintextReference.slice(start + marker.length, end < 0 ? undefined : end);
}

const randomSymbols = [];
let seed = 0x5a17c0de;
for (let i = 0; i < 5000; i++) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  randomSymbols.push(seed % MOD);
}
const rawTrain = scorePageRange(trainPages, 0, SEGMENT, trigram);
const rawHold = scorePageRange(holdPages, SEGMENT, SEGMENT, trigram);
const calibration = {
  p56KnownPlaintext: scoreSequence(encodeGP(sectionText(56)), trigram).score,
  p57KnownPlaintext: scoreSequence(encodeGP(sectionText(57)), trigram).score,
  random5000Symbols: scoreSequence(randomSymbols, trigram).score,
  rawCipherTrain: rawTrain.score,
  rawCipherHoldout: rawHold.score,
  shakespeareHeldout: scoreSequence(encodeGP(shakespeare.slice(240000, 260000)), trigram).score
};

const expandedPlant = {
  si: 2, reverse: 1, mapping: 1, config: 5, rotation: 37
};
const sampledPlant = {
  si: 2, reverse: 0, mapping: 0, config: 4, rotation: 37
};
const expandedResult = searchOriginal('time-expanded', expandedStreams);
const sampledResult = searchOriginal('cumulative-sampled', sampledStreams);
const expandedControl = searchPlant('time-expanded', expandedStreams, expandedPlant);
const sampledControl = searchPlant('cumulative-sampled', sampledStreams, sampledPlant);
assert.equal(expandedControl.rank, 1, 'time-expanded planted key was not recovered');
assert.equal(sampledControl.rank, 1, 'cumulative-sampled planted key was not recovered');

const output = {
  source: {
    timingResourceSha256: sha256(timingRaw),
    corpusResourceSha256: sha256(corpusRaw),
    historicalStringSha256: sha256(timing.final_hex),
    bytes: sourceBytes.length,
    exactIntervals: timing.interval_cells.length,
    intervalPositions: [143, 256],
    bridgeVariants,
    intervalSum: 240
  },
  corpus: {
    unsolvedPages: pages.length,
    unsolvedRunes: pages.reduce((n, p) => n + p.indices.length, 0),
    trainingPages: trainPages.map((p) => p.page),
    holdoutPages: holdPages.map((p) => p.page),
    trainRunesScored: trainPages.length * SEGMENT,
    holdoutRunesScored: holdPages.length * SEGMENT,
    languageModelTrainingSymbols: language.trainingSymbols
  },
  calibration,
  timeExpanded: {
    keyLength: expandedStreams[0].length,
    candidateCount: expandedResult.candidateCount,
    best: expandedResult.best,
    top20: expandedResult.top20,
    plantedControl: expandedControl
  },
  cumulativeSampled: {
    keyLength: sampledStreams[0].length,
    candidateCount: sampledResult.candidateCount,
    best: sampledResult.best,
    top20: sampledResult.top20,
    plantedControl: sampledControl
  }
};
console.log(JSON.stringify(output, null, 2));
