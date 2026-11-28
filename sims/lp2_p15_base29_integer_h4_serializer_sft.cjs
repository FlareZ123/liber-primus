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

function mod(x, m = MOD) {
  return ((x % m) + m) % m;
}

function h4(a) {
  return [a[0] - a[3], a[1] - a[2], a[1] + a[2], a[0] + a[3]];
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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function loadJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
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

  for (let i = 0; i < GRID_SPIRAL.length; i += 4) {
    const signed = h4(GRID_SPIRAL.slice(i, i + 4));
    signedStrings.push(signed.map((n) => base29String(n)));

    for (const n of signed) {
      transformed.push(...base29Digits(mod(n, MOD3), 3));
    }
  }

  assert(
    JSON.stringify(signedStrings) === JSON.stringify(EXPECTED_SIGNED_H),
    'signed integer H/BASE29 serialization changed',
  );
  assert(raw.length === 48 && transformed.length === 48, 'key length');

  return { raw, transformed, signedStrings };
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
    first_words: rows.slice(0, 12),
    dictionary_examples: rows.filter((r) => r.dictionary).slice(0, 12),
  };
}

function solve() {
  const corpus = loadJson('resources/liber-primus/lp2-corpus.json');
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

  const nativeWords = (lp1.match(/[A-Z]+/g) || [])
    .map((word) => encode(word))
    .filter(Boolean);
  const nativeHits = nativeWords.filter((word) => dictionary.has(code(word))).length;

  const p15 = pageWords(corpus, transcription, 15);
  const p16 = pageWords(corpus, transcription, 16);
  const tests = [];

  for (const [keyName, key] of [
    ['base29_raw_spiral_48', keys.raw],
    ['base29_h4_mod29cubed_48', keys.transformed],
  ]) {
    for (const sign of [-1, 1]) {
      tests.push({
        key: keyName,
        sign,
        p15_body: evaluateReceiver(corpus, p15, 20, key, sign, dictionary),
        p16_page: evaluateReceiver(corpus, p16, 0, key, sign, dictionary),
      });
    }
  }

  return {
    classification:
      'source-selected BASE29 plus authored p15 spiral/full-integer H4 serialization; direct additive consumers only',
    source: {
      spiral: GRID_SPIRAL,
      signed_h_base29: keys.signedStrings,
      historical_control: { 3299: '3QM', 3301: '3QO', K: 2 },
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
    tests,
  };
}

const result = solve();
const json = JSON.stringify(result, null, 2);
console.log(json);

const outDir = process.env.RUNNER_TEMP || process.cwd();
fs.writeFileSync(path.join(outDir, 'source-test-output.json'), json + '\n');
