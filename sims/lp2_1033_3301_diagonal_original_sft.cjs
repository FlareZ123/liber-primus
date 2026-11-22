'use strict';

/**
 * SFT: original cuneiform numerals 1033/3301 as 256-cell diagonal strides.
 * The 32x8 p49-p51 field has 256 cells: 1033 mod256=9=8+1,
 * 3301 mod256=229=-3*9, and 3301+3*1033=25*256.
 * A second original receiver, pp33-39, contains 1680=28*60 runes:
 * 3301 mod1680=-59=1-60. Both numerical correspondences were identified
 * before testing plaintext. The historical work does not prescribe these
 * decoders, so every result is conditional.
 *
 * Uses only pinned original-source derived resources; preserves all indices,
 * page boundaries, and original cipher symbols without any guessed cribs.
 * Windows 11 / Node 22: node sims/lp2_1033_3301_diagonal_original_sft.cjs
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const table = require('../resources/liber-primus/lp2-grid-256.json');

/** @param {number} x @returns {number} */
const mod = x => ((x % 29) + 29) % 29;

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const freq = Array(29).fill(0);
  for (const value of values) freq[value] += 1;
  return freq.reduce((sum, n) => sum + n * (n - 1), 0)
    / (values.length * (values.length - 1));
}

/**
 * @param {number[]} cipher
 * @param {number[]} bytes
 * @param {number} stride
 * @param {'direct'|'chain'} mode
 * @param {-1|1} direction
 * @returns {number[]}
 */
function inverse(cipher, bytes, stride, mode, direction) {
  return cipher.map((value, i) => mod(
    value - (mode === 'chain' && i ? cipher[i - 1] : 0)
    + direction * bytes[(i * stride) % 256]
  ));
}

/**
 * @param {number[]} plain
 * @param {number[]} bytes
 * @param {number} stride
 * @param {'direct'|'chain'} mode
 * @param {-1|1} direction
 * @returns {number[]}
 */
function forward(plain, bytes, stride, mode, direction) {
  const result = [];
  for (let i = 0; i < plain.length; i++) {
    const prev = mode === 'chain' && i ? result[i - 1] : 0;
    result.push(mod(plain[i] + prev
      - direction * bytes[(i * stride) % 256]));
  }
  return result;
}

/**
 * Cyclic additive predecessor/successor transform:
 * C[i] = P[i] + sign * P[(i + stride) % n], sign = +1 or -1.
 * @param {number[]} cipher
 * @param {number} stride
 * @param {-1|1} sign
 * @param {number} initial
 * @returns {number[] | null}
 */
function cyclicInverse(cipher, stride, sign, initial) {
  const n = cipher.length;
  const out = new Array(n);
  out[0] = initial;
  let position = 0;
  for (let j = 0; j < n - 1; j++) {
    const next = (position + stride) % n;
    out[next] = mod(sign * (cipher[position] - out[position]));
    position = next;
  }
  return mod(out[position] + sign * initial) === cipher[position]
    ? out : null;
}

/** @param {number} a @param {number} b @returns {number} */
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

function main() {
  assert.equal(table.alphabet.length, 60);
  assert.equal(table.pages.length, 3);
  assert.deepEqual(table.pages.map(p => p.rows), [10, 13, 9]);
  const tokens = table.pages.flatMap(p => p.tokens);
  assert.equal(tokens.length, 256);
  assert.equal(table.bytes.length, 256);
  assert.deepEqual(table.bytes.slice(0, 8),
    [203, 231, 167, 186, 97, 237, 126, 183]);
  const alphabet59 = table.alphabet.replace('f', '');
  assert.equal(alphabet59.length, 59);
  assert(!tokens.some(token => token.includes('f')));

  const radices = {
    base60: table.bytes,
    base59: tokens.map(token =>
      59 * alphabet59.indexOf(token[0]) + alphabet59.indexOf(token[1]))
  };
  for (const bytes of Object.values(radices)) {
    assert(bytes.every(b => Number.isInteger(b) && b >= 0 && b <= 255));
  }

  assert.equal(1033 % 256, 9);
  assert.equal(3301 % 256, 229);
  assert.equal(3301 + 3 * 1033, 25 * 256);
  assert.equal(gcd(9, 256), 1);
  assert.equal(gcd(229, 256), 1);

  const chapters = [
    { label: 'cuneiform', start: 33, end: 40, expected: 1680 },
    { label: 'floral', start: 40, end: 54, expected: 3008 },
    { label: 'terminal', start: 54, end: 56, expected: 308 }
  ];
  const clear = corpus.pages[57].indices;
  assert.equal(clear.length, 95);
  const summaries = [];

  for (const chapter of chapters) {
    const cipher = corpus.pages.slice(chapter.start, chapter.end)
      .flatMap(page => page.indices);
    assert.equal(cipher.length, chapter.expected);
    const plantedPlain = Array.from({length: cipher.length},
      (_, i) => clear[i % clear.length]);
    const rows = [];
    for (const [radix, bytes] of Object.entries(radices)) {
      for (const stride of [9, 229]) {
        for (const mode of ['direct', 'chain']) {
          for (const direction of [-1, 1]) {
            const decoded = inverse(cipher, bytes, stride, mode, direction);
            const synthetic = forward(plantedPlain, bytes, stride,
              mode, direction);
            assert.deepEqual(inverse(synthetic, bytes, stride, mode,
              direction), plantedPlain);
            rows.push({radix, stride, mode, direction,
              ioc: ioc(decoded), start:
              decoded.slice(0, 24).map(index => corpus.translit[index]).join(' ')});
          }
        }
      }
    }
    rows.sort((a, b) => b.ioc - a.ioc);
    summaries.push({
      chapter: chapter.label,
      runes: cipher.length,
      observedCipherIoc: ioc(cipher),
      minCandidateIoc: rows[rows.length - 1].ioc,
      maxCandidateIoc: rows[0].ioc,
      highestIocCandidate: rows[0],
      plantedControl: '16/16 direct/chained source-key inverses exact'
    });

    if (chapter.label === 'cuneiform') {
      assert.equal(cipher.length, 1680);
      assert.equal(3301 % 1680, 1621);
      assert.equal(gcd(59, 1680), 1);
      for (const stride of [1033, 3301]) {
        assert.equal(gcd(stride, 1680), 1);
        for (const sign of [-1, 1]) {
          const synthetic = plantedPlain.map((x, i) =>
            mod(x + sign * plantedPlain[(i + stride) % 1680]));
          assert.deepEqual(cyclicInverse(synthetic, stride, sign,
            plantedPlain[0]), plantedPlain);
          assert.equal(cyclicInverse(cipher, stride, sign, 0), null);
        }
      }
      summaries[0].selfFeedbackCycle = {
        length: 1680,
        steps: [1033, 3301],
        sumCMod29: mod(cipher.reduce((a,b) => a + b, 0)),
        alternatingSumCMod29: mod(cipher.reduce(
          (a,b,i) => a + (i % 2 ? -b : b), 0)),
        result: 'all four unsalted cyclic sum/difference models contradict source; planted models invert'
      };
    }
  }
  console.log(JSON.stringify({
    sourceGeometry: '1033=4*256+9; 3301=13*256-27; 1680=28*60',
    authenticClearIoc: ioc(clear),
    summaries,
    conclusion: 'No original prose/key/creator-selected decoder'
  }, null, 2));
}

main();
