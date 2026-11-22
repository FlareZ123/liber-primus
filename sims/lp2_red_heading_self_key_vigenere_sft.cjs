"use strict";

/**
 * Test the simplest source-visible self-key hypothesis on original LP2:
 * each of the nine red titled units is the repeating GP29 key for its own
 * following body, with phase reset at the title. No offsets, key transforms,
 * extra skips, or fitted parameters are admitted.
 *
 * Run: node sims/lp2_red_heading_self_key_vigenere_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const MOD = 29;
const mod = x => (x % MOD + MOD) % MOD;

const DIGRAPHS = { TH: 2, NG: 21, EO: 12, OE: 22, AE: 25, IA: 27, EA: 28 };
const LETTERS = {
  A:24, B:17, C:5, D:23, E:18, F:0, G:6, H:8, I:10, J:11, K:5,
  L:20, M:19, N:9, O:3, P:13, Q:5, R:4, S:15, T:16, U:1, V:1,
  W:7, X:14, Y:26, Z:15
};

function encode(text) {
  const s = text.toUpperCase().replace(/[^A-Z]/g, "");
  const out = [];
  for (let i = 0; i < s.length; i++) {
    const pair = DIGRAPHS[s.slice(i, i + 2)];
    if (pair !== undefined) {
      out.push(pair);
      i++;
    } else {
      out.push(LETTERS[s[i]]);
    }
  }
  return out;
}

function train(text) {
  const symbols = encode(text);
  const unigramCounts = new Uint32Array(MOD);
  const bigramCounts = new Uint32Array(MOD * MOD);
  const trigramCounts = new Uint32Array(MOD * MOD * MOD);
  for (let i = 0; i < symbols.length; i++) {
    unigramCounts[symbols[i]]++;
    if (i > 0) bigramCounts[symbols[i - 1] * MOD + symbols[i]]++;
    if (i > 1) {
      trigramCounts[(symbols[i - 2] * MOD + symbols[i - 1]) * MOD + symbols[i]]++;
    }
  }

  const unigram = new Float64Array(MOD);
  const bigram = new Float64Array(MOD * MOD);
  const trigram = new Float64Array(MOD * MOD * MOD);
  for (let c = 0; c < MOD; c++) {
    unigram[c] = Math.log((unigramCounts[c] + 1) / (symbols.length + MOD));
  }
  for (let a = 0; a < MOD; a++) {
    for (let c = 0; c < MOD; c++) {
      const p = (bigramCounts[a * MOD + c] + 12 * Math.exp(unigram[c])) /
        (unigramCounts[a] + 12);
      bigram[a * MOD + c] = Math.log(p);
    }
  }
  for (let a = 0; a < MOD; a++) {
    for (let b = 0; b < MOD; b++) {
      for (let c = 0; c < MOD; c++) {
        const ix = (a * MOD + b) * MOD + c;
        const p = (trigramCounts[ix] + 9 * Math.exp(bigram[b * MOD + c])) /
          (bigramCounts[a * MOD + b] + 9);
        trigram[ix] = Math.log(p);
      }
    }
  }
  return { symbols: symbols.length, unigram, bigram, trigram };
}

function score(sequence, model) {
  assert.ok(sequence.length >= 2);
  let total = model.unigram[sequence[0]] +
    model.bigram[sequence[0] * MOD + sequence[1]];
  for (let i = 2; i < sequence.length; i++) {
    total += model.trigram[
      (sequence[i - 2] * MOD + sequence[i - 1]) * MOD + sequence[i]
    ];
  }
  return total / sequence.length;
}

function decrypt(cipher, key, sign) {
  return cipher.map((c, i) => mod(c + sign * key[i % key.length]));
}

function encrypt(plain, key, sign) {
  return plain.map((p, i) => mod(p - sign * key[i % key.length]));
}

function ioc(sequence) {
  const counts = new Uint32Array(MOD);
  for (const value of sequence) counts[value]++;
  let numerator = 0;
  for (const count of counts) numerator += count * (count - 1);
  return numerator / (sequence.length * (sequence.length - 1));
}

function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

function shuffled(values, random) {
  const out = values.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function main() {
  const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
  const shakespeare = read("resources/control/shakespeare_first300k.txt");
  assert.equal(shakespeare.length, 300000);

  // Original-image title positions. p33:0 is a distinct 10-rune titled
  // interlude; p33:91 begins the following cuneiform-linked unit.
  const headings = [
    { page: 0, start: 0, length: 13 },
    { page: 3, start: 0, length: 16 },
    { page: 8, start: 0, length: 12 },
    { page: 15, start: 9, length: 11 },
    { page: 23, start: 0, length: 16 },
    { page: 27, start: 0, length: 19 },
    { page: 33, start: 0, length: 10 },
    { page: 33, start: 91, length: 8 },
    { page: 40, start: 0, length: 8 }
  ];

  const pageByNumber = new Map(corpus.pages.map(page => [page.page, page]));
  const inkByNumber = new Map(ink.pages.map(page => [page.page, page]));
  const pageBase = new Map();
  const stream = [];
  for (let page = 0; page < 56; page++) {
    const sourcePage = pageByNumber.get(page);
    assert.ok(sourcePage, `missing original page ${page}`);
    pageBase.set(page, stream.length);
    stream.push(...sourcePage.indices);
  }
  assert.equal(stream.length, 12956);
  assert.equal(pageByNumber.get(50).indices.length, 0);

  const sections = headings.map((heading, index) => {
    const sourcePage = pageByNumber.get(heading.page);
    const inkPage = inkByNumber.get(heading.page);
    const red = inkPage.red_spans.find(span =>
      span.start === heading.start && span.length === heading.length);
    assert.ok(red, `heading is not an original-image red span: ${JSON.stringify(heading)}`);
    assert.equal([...red.runes].length, heading.length);

    const key = sourcePage.indices.slice(
      heading.start, heading.start + heading.length
    );
    assert.equal(key.length, heading.length);
    assert.equal(key.map(value => corpus.runes[value]).join(""), red.runes);
    const bodyStart = pageBase.get(heading.page) + heading.start + heading.length;
    const bodyEnd = index + 1 < headings.length
      ? pageBase.get(headings[index + 1].page) + headings[index + 1].start
      : stream.length;
    const body = stream.slice(bodyStart, bodyEnd);
    assert.ok(body.length >= 2);
    return { heading, key, body };
  });

  assert.deepEqual(sections.map(section => section.body.length),
    [716, 1129, 1726, 1883, 1005, 1414, 81, 1581, 3308]);
  const headingRunes = headings.reduce((sum, heading) => sum + heading.length, 0);
  const bodyRunes = sections.reduce((sum, section) => sum + section.body.length, 0);
  assert.equal(headingRunes, 113);
  assert.equal(bodyRunes, 12843);
  assert.equal(headingRunes + bodyRunes, stream.length);

  // Use the same GP-English mapping/smoothing as the repository's
  // grid_keyskip_viterbi.cjs, trained on the first 200,000 Shakespeare chars.
  const model = train(shakespeare.slice(0, 200000));
  const heldout = encode(shakespeare.slice(200000));
  assert.equal(model.symbols, 144611);
  assert.equal(heldout.length, 72263);

  const bodyOnly = sections.flatMap(section => section.body);
  const scoreForSign = sign => sections.reduce((sum, section) => {
    const plain = decrypt(section.body, section.key, sign);
    assert.deepEqual(encrypt(plain, section.key, sign), section.body);
    return sum + score(plain, model) * plain.length;
  }, 0) / bodyRunes;

  const rawScore = sections.reduce((sum, section) =>
    sum + score(section.body, model) * section.body.length, 0) / bodyRunes;
  const subtractScore = scoreForSign(-1);
  const addScore = scoreForSign(1);
  const bestScore = Math.max(subtractScore, addScore);
  const subtractPlain = sections.flatMap(section =>
    decrypt(section.body, section.key, -1));
  const addPlain = sections.flatMap(section =>
    decrypt(section.body, section.key, 1));

  // Matched key-order null: independently shuffle each title's rune order,
  // retain its length and assigned section, and select the better global sign.
  const random = xorshift32(0x12ab3301);
  const nullScores = [];
  for (let trial = 0; trial < 1000; trial++) {
    const sums = [0, 0];
    for (const section of sections) {
      const key = shuffled(section.key, random);
      const minus = decrypt(section.body, key, -1);
      const plus = decrypt(section.body, key, 1);
      sums[0] += score(minus, model) * minus.length;
      sums[1] += score(plus, model) * plus.length;
    }
    nullScores.push(Math.max(...sums) / bodyRunes);
  }
  const nullSorted = nullScores.slice().sort((a, b) => a - b);
  const nullExceed = nullScores.filter(value => value >= bestScore).length;

  // Independent native-GP windows are drawn only from the held-out final
  // 100,000 Shakespeare characters, with the nine exact section lengths.
  const nativeScores = [];
  for (let trial = 0; trial < 2000; trial++) {
    const start = Math.floor(random() * (heldout.length - bodyRunes - 1));
    let offset = start;
    let sum = 0;
    for (const section of sections) {
      const sample = heldout.slice(offset, offset + section.body.length);
      assert.equal(sample.length, section.body.length);
      sum += score(sample, model) * sample.length;
      offset += section.body.length;
    }
    nativeScores.push(sum / bodyRunes);
  }
  nativeScores.sort((a, b) => a - b);
  const nativeMean = nativeScores.reduce((sum, value) => sum + value, 0) /
    nativeScores.length;
  const nativeSD = Math.sqrt(nativeScores.reduce((sum, value) =>
    sum + (value - nativeMean) ** 2, 0) / nativeScores.length);

  // Positive controls: both signs encrypt/decrypt held-out native GP exactly.
  const positive = [-1, 1].map(sign => {
    let offset = 0;
    let recovered = 0;
    for (const section of sections) {
      const plain = heldout.slice(offset, offset + section.body.length);
      offset += section.body.length;
      const cipher = encrypt(plain, section.key, sign);
      const back = decrypt(cipher, section.key, sign);
      recovered += back.filter((value, i) => value === plain[i]).length;
    }
    return { sign, recovered, total: bodyRunes };
  });
  assert.deepEqual(positive.map(result => result.recovered),
    [bodyRunes, bodyRunes]);

  const sectionScores = sections.map(section => ({
    page: section.heading.page,
    offset: section.heading.start,
    keyLength: section.key.length,
    bodyLength: section.body.length,
    raw: score(section.body, model),
    subtract: score(decrypt(section.body, section.key, -1), model),
    add: score(decrypt(section.body, section.key, 1), model)
  }));

  const result = {
    hypothesis: "Nine source-titled units; each raw red heading repeats as the GP29 key for its following body; reset at each title; no fitted phase",
    source: {
      unknownRunes: stream.length,
      headingRunes,
      bodyRunes,
      sections: sectionScores.map(({ page, offset, keyLength, bodyLength }) =>
        ({ page, offset, keyLength, bodyLength }))
    },
    model: {
      trainingCharacters: 200000,
      trainingGPRunes: model.symbols,
      heldoutGPRunes: heldout.length,
      score: "smoothed GP trigram log-likelihood, nats per rune"
    },
    original: {
      raw: rawScore,
      subtract: subtractScore,
      add: addScore,
      best: bestScore,
      bestSign: subtractScore >= addScore ? "subtract" : "add",
      rawBodyIoC: ioc(bodyOnly),
      subtractBodyIoC: ioc(subtractPlain),
      addBodyIoC: ioc(addPlain),
      sections: sectionScores
    },
    keyOrderNull: {
      trials: nullScores.length,
      seed: "0x12ab3301",
      equalOrBetter: nullExceed,
      upperTail: (1 + nullExceed) / (nullScores.length + 1),
      median: nullSorted[500],
      minimum: nullSorted[0],
      maximum: nullSorted[nullSorted.length - 1]
    },
    nativeHeldout: {
      trials: nativeScores.length,
      mean: nativeMean,
      standardDeviation: nativeSD,
      minimum: nativeScores[0],
      fifthPercentile: nativeScores[99],
      median: nativeScores[1000],
      maximum: nativeScores[nativeScores.length - 1],
      lowerTailAtOriginalBest:
        (1 + nativeScores.filter(value => value <= bestScore).length) /
        (nativeScores.length + 1)
    },
    positiveControls: positive,
    conclusion: "Both direct GP29 Vigenere signs remain ciphertext-like; no unknown plaintext or key recovered."
  };
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
}

if (require.main === module) main();
