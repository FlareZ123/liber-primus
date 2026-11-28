'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const MOD = 29;
const MOD3 = MOD ** 3;
const BASE29 = '0123456789ABCDEFGHIJKLMNOPQRS';
const GRID_SPIRAL = [
  3299, 3298, 3296, 3294,
  3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472,
  1820, 708, 1206, 4516,
];
const EXPECTED_SIGNED_H = [
  ['5', '2', '7OB', '7OA'],
  ['28', 'K', '7MB', '7LE'],
  ['ND', '6Q', '6SI', '6JR'],
  ['-35S', '-H5', '280', '7FE'],
];
const PAIRINGS = {
  outside: [[0, 3], [1, 2]],
  adjacent: [[0, 1], [2, 3]],
  cross: [[0, 2], [1, 3]],
};

function mod(x, m = MOD) {
  return ((x % m) + m) % m;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function loadJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
}

function base29Digits(n, width = 0) {
  let x = Math.abs(n);
  const out = [];
  do {
    out.push(x % MOD);
    x = Math.floor(x / MOD);
  } while (x > 0);
  while (out.length < width) out.push(0);
  return out.reverse();
}

function base29String(n, width = 0) {
  const body = base29Digits(n, width).map((d) => BASE29[d]).join('');
  return n < 0 ? '-' + body : body;
}

function pairTransform(a, pairs = PAIRINGS.outside) {
  const [[a0, a1], [b0, b1]] = pairs;
  return [
    a[a0] - a[a1],
    a[b0] - a[b1],
    a[b0] + a[b1],
    a[a0] + a[a1],
  ];
}

function h4(a) {
  return pairTransform(a, PAIRINGS.outside);
}

function rotate(a, n) {
  return a.slice(n).concat(a.slice(0, n));
}

function blockDigitLengths(seq, pairing) {
  const out = [];
  for (let i = 0; i < 16; i += 4) {
    const transformed = pairTransform(seq.slice(i, i + 4), pairing);
    out.push(transformed.reduce((sum, n) => sum + base29Digits(n).length, 0));
  }
  return out;
}

function isIncreasingRun(a) {
  return a.length === 4 && a.every((x, i) => i === 0 || x === a[0] + i);
}

function staircaseCharge() {
  const hits = [];
  for (const [pairingName, pairing] of Object.entries(PAIRINGS)) {
    for (const reversed of [false, true]) {
      const base = reversed ? [...GRID_SPIRAL].reverse() : [...GRID_SPIRAL];
      for (let rotation = 0; rotation < 16; rotation++) {
        const lengths = blockDigitLengths(rotate(base, rotation), pairing);
        if (isIncreasingRun(lengths)) {
          hits.push({ pairing: pairingName, reversed, rotation, lengths });
        }
      }
    }
  }
  return hits;
}

function encodeFactory(corpus) {
  const translit = corpus.translit
    .map((s, i) => ({ s, i }))
    .sort((a, b) => b.s.length - a.s.length);

  return function encode(input, old = false) {
    let s = input.toUpperCase()
      .replace(/QU/g, 'CW')
      .replace(/[KQ]/g, 'C')
      .replace(/V/g, 'U')
      .replace(/Z/g, 'S');
    if (old) s = s.replace(/ING/g, 'NG').replace(/IO/g, 'IA');

    const out = [];
    for (let i = 0; i < s.length;) {
      const token = translit.find((t) => s.startsWith(t.s, i));
      if (!token) return null;
      out.push(token.i);
      i += token.s.length;
    }
    return out;
  };
}

function pageWords(corpus, transcription, page) {
  const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
  const rawPages = transcription.replace(/\r/g, '').split('%');
  const raw = rawPages[page];
  assert(typeof raw === 'string', 'missing transcription page ' + page);

  const out = [];
  let word = [];
  let offset = 0;
  let start = 0;

  const flush = () => {
    if (word.length) out.push({ start, end: offset, a: word });
    word = [];
  };

  for (const ch of raw) {
    const v = runeIndex.get(ch);
    if (v !== undefined) {
      if (!word.length) start = offset;
      word.push(v);
      offset++;
    } else if (ch !== '/' && !/\s/u.test(ch)) {
      flush();
    }
  }
  flush();

  const pageRecord = corpus.pages.find((p) => p.page === page);
  assert(pageRecord, 'missing corpus page ' + page);
  assert(
    out.flatMap((w) => w.a).join(',') === pageRecord.indices.join(','),
    'transcription/corpus mismatch page ' + page,
  );
  return out;
}

function code(a) {
  return a.map((x) => String.fromCharCode(65 + x)).join('');
}

function buildDictionary(dictText, encode) {
  const set = new Set();
  for (const line of dictText.split(/\r?\n/)) {
    const match = /^([a-z]+)\s+\d+$/.exec(line);
    if (!match) continue;
    for (const old of [false, true]) {
      const encoded = encode(match[1], old);
      if (encoded) set.add(code(encoded));
    }
  }
  return set;
}

function buildKeys() {
  const raw = GRID_SPIRAL.flatMap((n) => base29Digits(n, 3));
  const transformed = [];
  const signedStrings = [];
  const signedBlockKeys = [];

  for (let i = 0; i < GRID_SPIRAL.length; i += 4) {
    const signed = h4(GRID_SPIRAL.slice(i, i + 4));
    signedStrings.push(signed.map((n) => base29String(n)));

    const blockKey = [];
    for (const n of signed) {
      const digits = base29Digits(n);
      for (const d of digits) blockKey.push(n < 0 ? mod(-d) : d);
      transformed.push(...base29Digits(mod(n, MOD3), 3));
    }
    signedBlockKeys.push(blockKey);
  }

  assert(
    JSON.stringify(signedStrings) === JSON.stringify(EXPECTED_SIGNED_H),
    'signed integer H/BASE29 serialization changed',
  );
  assert(raw.length === 48 && transformed.length === 48, 'fixed-width key length');
  assert(
    JSON.stringify(signedBlockKeys.map((k) => k.length)) === JSON.stringify([8, 9, 10, 11]),
    'BASE29 block-length staircase changed',
  );

  return { raw, transformed, signedStrings, signedBlockKeys };
}

function evaluateReceiver(corpus, words, start, key, sign, dictionary) {
  const rows = words
    .filter((w) => w.start >= start)
    .map((w) => {
      const plain = w.a.map((c, j) => mod(c + sign * key[(w.start - start + j) % key.length]));
      return {
        offset: w.start,
        length: w.a.length,
        dictionary: dictionary.has(code(plain)),
        translit: plain.map((x) => corpus.translit[x]).join(''),
      };
    });

  const long = rows.filter((r) => r.length >= 3);
  return {
    words: rows.length,
    dictionary_hits: rows.filter((r) => r.dictionary).length,
    long_words: long.length,
    long_dictionary_hits: long.filter((r) => r.dictionary).length,
    long_dictionary_fraction: long.length
      ? long.filter((r) => r.dictionary).length / long.length
      : 0,
    first_words: rows.slice(0, 12),
    dictionary_examples: rows.filter((r) => r.dictionary).slice(0, 12),
  };
}

function solve() {
  const corpus = loadJson('resources/liber-primus/lp2-corpus.json');
  const ink = loadJson('resources/liber-primus/lp2-ink-annotations.json');
  const transcription = fs.readFileSync(
    path.join(ROOT, 'resources/liber-primus/lp2-transcription.txt'),
    'utf8',
  );
  const dictText = fs.readFileSync(
    path.join(ROOT, 'resources/control/english_wordfreq_textblob.txt'),
    'utf8',
  );
  const lp1 = fs.readFileSync(
    path.join(ROOT, 'resources/liber-primus/lp1-plaintext-reference.txt'),
    'utf8',
  );

  const encode = encodeFactory(corpus);
  const dictionary = buildDictionary(dictText, encode);
  const keys = buildKeys();

  assert(base29String(3301) === '3QO', 'signed 2013 BASE29 control');
  assert(base29String(3299) === '3QM', 'p15 red cell BASE29 control');
  assert(3299 + 2 === 3301, 'p15 K bridge');

  const staircases = staircaseCharge();
  assert(staircases.length === 2, 'unexpected staircase family size');
  const authored = staircases.filter((x) => !x.reversed && x.rotation === 0);
  assert(authored.length === 1 && authored[0].pairing === 'outside', 'authored staircase selector');
  assert(JSON.stringify(authored[0].lengths) === JSON.stringify([8, 9, 10, 11]), 'authored staircase');

  const pageCounts = [8, 9, 10, 11].map((page) => {
    const record = corpus.pages.find((p) => p.page === page);
    assert(record, 'missing page ' + page);
    return record.runic_count;
  });
  assert(JSON.stringify(pageCounts) === JSON.stringify([255, 268, 263, 273]), 'p8-p11 counts');

  const pageCountH = h4(pageCounts);
  const pageCountHBase29 = pageCountH.map((n) => base29String(n));
  assert(
    JSON.stringify(pageCountHBase29) === JSON.stringify(['-I', '5', 'I9', 'I6']),
    'p8-p11 count H/BASE29 packet',
  );
  const pageCountPayloadLength = pageCountH.reduce(
    (sum, n) => sum + base29Digits(n).length,
    0,
  );
  assert(pageCountPayloadLength === 6, 'p8-p11 count payload length');

  const countByPage = new Map(
    corpus.pages
      .filter((p) => p.page >= 0 && p.page <= 55)
      .map((p) => [p.page, p.runic_count]),
  );
  const windowMap = [];
  for (let start = 0; start <= 52; start++) {
    const counts = [0, 1, 2, 3].map((d) => countByPage.get(start + d));
    assert(counts.every((x) => Number.isInteger(x)), 'missing count window ' + start);
    const transformed = h4(counts);
    const payload = transformed.reduce((sum, n) => sum + base29Digits(n).length, 0);
    windowMap.push({ start, payload, counts, transformed });
  }
  const payloadByStart = new Map(windowMap.map((x) => [x.start, x.payload]));
  const twoCycles = [];
  for (const row of windowMap) {
    const back = payloadByStart.get(row.payload);
    if (back === row.start && row.start < row.payload) {
      twoCycles.push([row.start, row.payload]);
    }
  }
  const fixedPoints = windowMap.filter((x) => x.payload === x.start).map((x) => x.start);
  assert(JSON.stringify(twoCycles) === JSON.stringify([[6, 8]]), 'four-page count 2-cycle');
  assert(JSON.stringify(fixedPoints) === JSON.stringify([7]), 'four-page count fixed point');

  const redPages = new Set(
    ink.pages
      .filter((p) => p.page >= 0 && p.page <= 55 && (p.red_spans || []).length > 0)
      .map((p) => p.page),
  );
  const redTriples = [];
  for (let start = 0; start <= 53; start++) {
    if ([start, start + 1, start + 2].every((p) => redPages.has(p))) {
      redTriples.push([start, start + 1, start + 2]);
    }
  }
  assert(JSON.stringify(redTriples) === JSON.stringify([[6, 7, 8]]), 'unique consecutive red triple');

  const p6 = corpus.pages.find((p) => p.page === 6);
  assert(p6 && p6.runic_count === 196 && base29String(196) === '6M', 'p6 6M count');
  const remainder22 = corpus.pages
    .filter((p) => p.page >= 0 && p.page <= 55 && p.runic_count % 29 === 22)
    .map((p) => p.page);
  assert(JSON.stringify(remainder22) === JSON.stringify([6]), 'unique p-1 page-count remainder');

  const nativeWords = (lp1.match(/[A-Z]+/g) || [])
    .map((word) => encode(word))
    .filter(Boolean);
  const nativeHits = nativeWords.filter((word) => dictionary.has(code(word))).length;

  const p15 = pageWords(corpus, transcription, 15);
  const p16 = pageWords(corpus, transcription, 16);
  const directTests = [];

  for (const [keyName, key] of [
    ['base29_raw_spiral_48', keys.raw],
    ['base29_h4_mod29cubed_48', keys.transformed],
  ]) {
    for (const sign of [-1, 1]) {
      directTests.push({
        key: keyName,
        sign,
        p15_body: evaluateReceiver(corpus, p15, 20, key, sign, dictionary),
        p16_page: evaluateReceiver(corpus, p16, 0, key, sign, dictionary),
      });
    }
  }

  const staircasePageTests = [];
  for (let block = 0; block < 4; block++) {
    const page = 8 + block;
    const start = page === 8 ? 12 : 0;
    const words = pageWords(corpus, transcription, page);
    const key = keys.signedBlockKeys[block];

    for (const sign of [-1, 1]) {
      staircasePageTests.push({
        block,
        page,
        start,
        source_strings: keys.signedStrings[block],
        key,
        sign,
        result: evaluateReceiver(corpus, words, start, key, sign, dictionary),
      });
    }
  }

  return {
    classification:
      'source-selected BASE29 plus authored p15 spiral/full-integer outside-H serialization; target-blind structural route with direct additive consumers rejected',
    source: {
      spiral: GRID_SPIRAL,
      signed_h_base29: keys.signedStrings,
      serialized_block_lengths: keys.signedBlockKeys.map((k) => k.length),
      historical_control: { 3299: '3QM', 3301: '3QO', K: 2 },
    },
    presentation_charge: {
      family: '3 perfect matchings x 2 directions x 16 cyclic starts',
      configurations: 96,
      increasing_four_page_staircases: staircases,
      authored_red_origin_hits: authored,
    },
    page_route: {
      addressed_pages: [8, 9, 10, 11],
      runic_counts: pageCounts,
      integer_h: pageCountH,
      base29: pageCountHBase29,
      base29_payload_digits: pageCountPayloadLength,
      four_page_payload_map: windowMap.map((x) => [x.start, x.payload]),
      unique_two_cycle: twoCycles,
      fixed_points: fixedPoints,
      unique_consecutive_red_triple: redTriples,
      p6_count_base29: base29String(196),
      pages_with_remainder_p_minus_1: remainder22,
    },
    fixed_width_keys: {
      raw: keys.raw,
      h4_mod29cubed: keys.transformed,
    },
    dictionary: {
      forms: dictionary.size,
      native_lp1_words: nativeWords.length,
      native_lp1_hits: nativeHits,
      native_lp1_fraction: nativeHits / nativeWords.length,
    },
    direct_tests: directTests,
    staircase_page_tests: staircasePageTests,
  };
}

const result = solve();
const json = JSON.stringify(result, null, 2);
console.log(json);

const outDir = process.env.RUNNER_TEMP || process.cwd();
fs.writeFileSync(path.join(outDir, 'source-test-output.json'), json + '\n');
