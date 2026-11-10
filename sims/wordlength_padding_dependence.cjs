'use strict';
/**
 * Independent one-rune-per-word insertion test of LP2 word-length dependence.
 * Canonical LP2 words remain contiguous across printed page/line wraps.
 * Includes literary controls and deterministic fixed-seed random windows.
 * No external modules, network calls or file writes.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const RUNES = new Set([...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ']);
const SOURCES = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt'
];
const PROBABILITIES = [0, 0.2, 0.45, 0.6, 0.75, 1];
const REPS = 1200;
const SEED = 0x50998abc;

/** @param {string} content @returns {number[]} */
function lp2Lengths(content) {
  const pages = content.split('%');
  if (pages.length !== 57) throw new Error('Unexpected LP2 transcript page count');
  const cipher = pages.slice(0, 55).join('%');
  const runeCount = [...cipher].filter(ch => RUNES.has(ch)).length;
  const words = cipher.split(/[-.&$§]/u)
    .map(part => [...part].filter(ch => RUNES.has(ch)).length).filter(Boolean);
  if (runeCount !== 12956 || words.length !== 2896)
    throw new Error('Unexpected LP2 length or runes; inspect source changes');
  return words;
}

/** @param {string} raw @returns {number} */
function gpLength(raw) {
  const word = raw.toUpperCase().replace(/ING/g, 'NG').replace(/QU/g, 'CW')
    .replace(/[VKZ]/g, ch => ({V:'U', K:'C', Z:'S'})[ch]);
  let length = 0;
  for (let i = 0; i < word.length; length++) {
    i += ['TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA'].includes(word.slice(i, i + 2)) ? 2 : 1;
  }
  return length;
}

/** @param {string} content @returns {number[]} */
function englishLengths(content) {
  const start = /\*{3}\s*START OF[^\n]*/i.exec(content);
  const end = /\*{3}\s*END OF[^\n]*/i.exec(content);
  const body = start && end ? content.slice(start.index + start[0].length, end.index) : content;
  return (body.match(/[A-Za-z]+/g) || []).map(gpLength);
}

/** @param {number[]} lengths @returns {number} */
function chiSquare(lengths) {
  const count = new Uint32Array(9), a = new Uint32Array(3), b = new Uint32Array(3);
  const cls = n => n <= 2 ? 0 : n <= 5 ? 1 : 2;
  let previous = cls(lengths[0]);
  for (let i = 1; i < lengths.length; i++) {
    const next = cls(lengths[i]);
    count[3 * previous + next]++;
    a[previous]++;
    b[next]++;
    previous = next;
  }
  let value = 0, n = lengths.length - 1;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const expected = a[i] * b[j] / n;
    value += (count[3 * i + j] - expected) ** 2 / expected;
  }
  return value;
}

/** @param {number} seed @returns {() => number} */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * @param {number[]} source
 * @param {number} width
 * @param {number} p
 * @param {number} observed
 * @param {() => number} random
 */
function simulate(source, width, p, observed, random) {
  if (source.length < width) throw new Error('Insufficient literary words');
  const scores = [];
  for (let trial = 0; trial < REPS; trial++) {
    const start = Math.floor(random() * (source.length - width + 1));
    const lengths = source.slice(start, start + width);
    if (p) for (let i = 0; i < lengths.length; i++)
      if (random() < p) lengths[i]++;
    scores.push(chiSquare(lengths));
  }
  scores.sort((a, b) => a - b);
  return {
    p, mean: scores.reduce((a, b) => a + b, 0) / REPS,
    min: scores[0], q05: scores[Math.floor(REPS * 0.05)],
    lowerTail: (1 + scores.filter(score => score <= observed).length) / (REPS + 1)
  };
}

function run() {
  const cipher = lp2Lengths(read('resources/lp2-transcription.txt'));
  const observed = chiSquare(cipher);
  const random = rng(SEED);
  const controls = SOURCES.map(file => {
    const text = read(file), lengths = englishLengths(text);
    return {
      source: file,
      sha256: crypto.createHash('sha256').update(text).digest('hex'),
      words: lengths.length,
      samples: PROBABILITIES.map(p => simulate(lengths, cipher.length, p, observed, random))
    };
  });
  const result = {
    hypothesis: 'Independent Bernoulli 0/1 rune added inside each ordinary-English word, preserving word order and all boundaries',
    lp2Words: cipher.length, lp2ChiSquare: observed,
    categories: ['1-2', '3-5', '6+'], repetitions: REPS,
    seed: '0x' + SEED.toString(16), controls
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}
if (require.main === module) run();
module.exports = {lp2Lengths, gpLength, englishLengths, chiSquare, simulate, run};
