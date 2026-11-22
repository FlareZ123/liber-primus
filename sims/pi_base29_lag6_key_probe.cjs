'use strict';
/**
 * Bounded test of the Pi.Mobi / mathematical-pi keystream hypothesis.
 *
 * This is a false-path audit, not an assertion that the disputed 2016
 * Pi.Mobi episode is an authentic Cicada instruction. It tests the natural
 * mappings suggested by the decimal-pi domain and the 29-symbol GP alphabet:
 * pi's fractional expansion in base 29, decimal digits mod 29, and decimal
 * digit pairs mod 29. Candidate phases are fixed from the archived 2016
 * metadata (0, seed 230, image dimensions 563/569, payload length 1136,
 * and the previously selected 51/57 offsets).
 *
 * The manual/push CI workflow runs this exact probe.
 * Node 22, no external packages:
 *   node sims/pi_base29_lag6_key_probe.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const { parseSharedCorpus } = require('./lp2_word_pages.cjs');
const base = require('./relative_key_english_probe.cjs');
const { trainTrigram } = require('./relative_key_trigram_probe.cjs');

const ROOT = path.resolve(__dirname, '..');
const MOD = x => ((x % 29) + 29) % 29;
const START = 29, END = 30, N = 31, Q = 0.81;
const WIDTH = 563, HEIGHT = 569, OUTGUESS_SEED = 230, PAYLOAD_LENGTH = 1136;

function integerSqrt(n) {
  if (n < 2n) return n;
  let x = 1n << BigInt(Math.ceil(n.toString(2).length / 2));
  for (;;) {
    const y = (x + n / x) >> 1n;
    if (y >= x) return x;
    x = y;
  }
}
function piFixed(decimalDigits) {
  const scale = 10n ** BigInt(decimalDigits);
  let m = 1n, l = 13591409n, x = 1n, k = 6n;
  let sum = m * l * scale / x;
  const terms = Math.ceil(decimalDigits / 14.181647462725477) + 3;
  for (let i = 1; i < terms; i++) {
    const z = BigInt(i);
    m = m * (k * k * k - 16n * k) / (z * z * z);
    l += 545140134n;
    x *= -262537412640768000n;
    k += 12n;
    sum += m * l * scale / x;
  }
  const root = integerSqrt(10005n * scale * scale);
  return { scale, value: 426880n * root * scale / sum, terms };
}
function scorePlain(words, lm) {
  let score = 0, tokens = 0;
  const freq = new Float64Array(29);
  for (const word of words) {
    let a = START, b = START;
    for (const c of [...word, END]) {
      score += lm[(a * N + b) * N + c];
      tokens++;
      a = b; b = c;
      if (c < 29) freq[c]++;
    }
  }
  const total = freq.reduce((a, b) => a + b, 0);
  return { perToken: score / tokens,
    runeIoC: freq.reduce((a, b) => a + b * b, 0) / (total * total) };
}
function inverseCandidates(cipher, pad) {
  const result = [];
  let previous = -1, offset = 0;
  for (const word of cipher) {
    const wordOptions = [];
    for (let j = 0; j < word.length; j++) {
      const c = word[j];
      const t = j >= 6 ? MOD(24 - 2 * word[j - 6]) : -1;
      const literal = MOD(c - pad[offset++]);
      const same = c === previous;
      const unchangedLikelihood = same
        ? (j >= 6 && t === previous ? 1 : 1 - Q)
        : 1;
      const options = [{ c: literal, e: Math.log(unchangedLikelihood) }];
      if (previous >= 0 && !same && (j < 6 || c === t)) {
        options.push({ c: MOD(previous - pad[offset - 1]),
          e: Math.log(j >= 6 ? Q : Q / 28) });
      }
      wordOptions.push(options);
      previous = c;
    }
    result.push(wordOptions);
  }
  if (offset !== pad.length) throw new Error('pad length mismatch');
  return result;
}
function decodeViterbi(cipher, pad, lm) {
  return inverseCandidates(cipher, pad).map(options => {
    let states = new Map([[START * N + START, { s: 0, seq: [] }]]);
    for (const row of options) {
      const next = new Map();
      for (const [state, prior] of states) {
        const a = Math.floor(state / N), b = state % N;
        for (const option of row) {
          const s = prior.s + option.e + lm[(a * N + b) * N + option.c];
          const key = b * N + option.c;
          const old = next.get(key);
          if (!old || s > old.s)
            next.set(key, { s, seq: [...prior.seq, option.c] });
        }
      }
      states = next;
    }
    let best = null;
    for (const candidate of states.values()) {
      const n = candidate.seq.length;
      const a = n > 1 ? candidate.seq[n - 2] : START;
      const b = n ? candidate.seq[n - 1] : START;
      const s = candidate.s + lm[(a * N + b) * N + END];
      if (!best || s > best.s) best = { s, seq: candidate.seq };
    }
    return best.seq;
  });
}
function preview(words, translit) {
  return words.slice(0, 7).map(w => w.map(x => translit[x]).join('')).join(' ');
}
function main() {
  const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
    'resources/liber-primus/lp2-corpus.json'), 'utf8'));
  const source = fs.readFileSync(path.join(ROOT,
    'resources/control/shakespeare_first300k.txt'), 'utf8');
  const parsed = parseSharedCorpus();
  const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
  const cipherWords = parsed.words.map(word => [...word.runes].map(rune => runeIndex.get(rune)));
  const lengths = cipherWords.map(w => w.length);
  const total = lengths.reduce((a, b) => a + b, 0);
  const trainWords = base.corpusWords(source.slice(0, 200000));
  const lm = trainTrigram(trainWords);

  const maxDecimal = PAYLOAD_LENGTH + 2 * total;
  const decimalPrecision = maxDecimal + 100;
  const pi = piFixed(decimalPrecision);
  const decimalString = pi.value.toString().padStart(decimalPrecision + 1, '0')
    .slice(1, 1 + maxDecimal);
  const decimalDigits = decimalString.split('').map(Number);

  const maxBase29 = PAYLOAD_LENGTH + total;
  let fraction = pi.value - 3n * pi.scale;
  const base29Digits = [];
  for (let i = 0; i < maxBase29; i++) {
    fraction *= 29n;
    base29Digits.push(Number(fraction / pi.scale));
    fraction %= pi.scale;
  }

  const decimalDigitKey = decimalDigits.map(x => x % 29);
  const decimalPairKey = [];
  for (let i = 0; i + 1 < decimalDigits.length; i += 2)
    decimalPairKey.push((10 * decimalDigits[i] + decimalDigits[i + 1]) % 29);

  const results = [];
  function test(type, key, phases) {
    for (const phase of phases) {
      for (const sign of [1, -1]) {
        const pad = Array.from({ length: total }, (_, i) =>
          MOD(sign * key[phase + i]));
        const decoded = decodeViterbi(cipherWords, pad, lm);
        results.push({ type, phase, sign, score: scorePlain(decoded, lm),
          preview: preview(decoded, corpus.translit) });
      }
    }
  }
  test('pi-base29-fraction', base29Digits, [0, 51, 57, 230, 563, 569, 1136]);
  test('pi-decimal-digit-mod29', decimalDigitKey, [0, 230, 563, 569, 1136]);
  test('pi-decimal-pair-mod29', decimalPairKey, [0, 115, 281, 284, 568]);

  const direct = [];
  for (const phase of [0, 230, 563, 569, 1136]) {
    for (const sign of [1, -1]) {
      let offset = 0;
      const plain = cipherWords.map(word => word.map(c =>
        MOD(c - sign * base29Digits[phase + offset++])));
      direct.push({ phase, sign, score: scorePlain(plain, lm),
        preview: preview(plain, corpus.translit) });
    }
  }
  results.sort((a, b) => b.score.perToken - a.score.perToken);
  direct.sort((a, b) => b.score.perToken - a.score.perToken);
  return {
    provenance: 'Pi.Mobi is disputed; these are bounded candidate mappings, not an authenticity claim.',
    piGeneration: { method: 'Chudnovsky fixed-point integer arithmetic',
      decimalPrecision, terms: pi.terms,
      base29Prefix: base29Digits.slice(0, 40),
      decimalPrefix: decimalString.slice(0, 60) },
    corpus: { words: cipherWords.length, runes: total },
    t6Inverse: { model: 'T6(x)=24-2x mod29, q=0.81, GP trigram Viterbi',
      candidateCount: results.length, best: results.slice(0, 12) },
    plainAdditiveBase29: { candidateCount: direct.length, best: direct.slice(0, 6) },
    conclusion: 'No tested direct pi-derived key mapping recovers readable LP2. The best T6-inverse score remains far below held-out English; this rejects only these simple mappings.'
  };
}
if (require.main === module)
  process.stdout.write(JSON.stringify(main(), null, 2) + '\n');
module.exports = { main };
