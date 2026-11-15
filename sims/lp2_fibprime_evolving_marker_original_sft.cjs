'use strict';
/**
 * A source-frozen, reversible 16-state evolving-marker hypothesis.
 * Page 15 supplies the distinct Fibonacci-indexed primes; this code tests
 * whether those public numbers could specify the *plaintext marker* whose
 * ciphertext output repeats its predecessor.
 *
 * No Cicada source authenticates this cipher or its phase rule. This is a
 * finite original-cipher rejection against native GP-English controls.
 *
 * Run: node sims/lp2_fibprime_evolving_marker_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} file @returns {string} */
function read(file) {
  return fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
}

/** @type {{pages:Array<{page:number,indices:number[]}>,translit:string[]}} */
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const primes = [2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817];
const printed = [3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516];
const chapter = (low, high) => corpus.pages
  .filter(page => page.page >= low && page.page <= high)
  .flatMap(page => page.indices);
const primary = chapter(16, 22);
const holdout = chapter(54, 55);
const native = chapter(57, 57);
assert.equal(primary.length, 1744);
assert.equal(holdout.length, 308);
assert.equal(native.length, 95);

/** @param {number} x @param {number} n @returns {number} */
function mod(x, n) { return (x % n + n) % n; }

/**
 * The first chapter rune is an open IV; each later rune consumes one
 * 16-step public prime index. A literal marker P_i=m_i repeats C_(i-1).
 * All 28 other GP rune values have a bijection onto the 28 nonzero
 * ciphertext differences, using the corresponding printed square value.
 *
 * @param {number[]} plain
 * @param {number} markerOffset 0 for prime, -1 for prime totient
 * @returns {number[]}
 */
function encrypt(plain, markerOffset) {
  const out = [plain[0]];
  for (let i = 1; i < plain.length; i++) {
    const clock = (i - 1) % 16;
    const marker = mod(primes[clock] + markerOffset, 29);
    const shift = mod(printed[clock], 28);
    const p = plain[i];
    if (p === marker) {
      out.push(out[i - 1]);
    } else {
      const alphabet = Array.from({length: 29}, (_, k) => k)
        .filter(k => k !== marker);
      const rank = alphabet.indexOf(p);
      assert.ok(rank >= 0 && rank < 28);
      out.push(mod(out[i - 1] + 1 + mod(rank - shift, 28), 29));
    }
  }
  return out;
}

/**
 * @param {number[]} cipher
 * @param {number} markerOffset
 * @returns {number[]}
 */
function decrypt(cipher, markerOffset) {
  const out = [cipher[0]];
  for (let i = 1; i < cipher.length; i++) {
    const clock = (i - 1) % 16;
    const marker = mod(primes[clock] + markerOffset, 29);
    const shift = mod(printed[clock], 28);
    const delta = mod(cipher[i] - cipher[i - 1], 29);
    if (delta === 0) {
      out.push(marker);
    } else {
      const alphabet = Array.from({length: 29}, (_, k) => k)
        .filter(k => k !== marker);
      out.push(alphabet[mod(delta - 1 + shift, 28)]);
    }
  }
  return out;
}

/** @param {number[]} values @returns {number} */
function repeats(values) {
  let n = 0;
  for (let i = 1; i < values.length; i++)
    if (values[i] === values[i - 1]) n++;
  return n;
}

/** @param {number[]} seq @returns {number} */
function ioc(seq) {
  const n = seq.length;
  const counts = Array(29).fill(0);
  for (const x of seq) counts[x]++;
  return counts.reduce((sum, ct) => sum + ct * (ct - 1), 0) / (n * (n - 1));
}

/** @param {number[]} plain @param {number} markerOffset @returns {number} */
function markerCount(plain, markerOffset) {
  let total = 0;
  for (let i = 1; i < plain.length; i++)
    if (plain[i] === mod(primes[(i - 1) % 16] + markerOffset, 29))
      total++;
  return total;
}
const tokens = corpus.translit.map((token, code) => ({token, code}))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {string} text @returns {number[]} */
function encodeEnglish(text) {
  const output = [];
  for (const match of text.toUpperCase().match(/[A-Z]+/g) || []) {
    const word = match.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/K/g, 'C').replace(/Z/g, 'S')
      .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
    for (let offset = 0; offset < word.length;) {
      const found = tokens.find(t => word.startsWith(t.token, offset));
      assert.ok(found, 'unencoded source word ' + word);
      output.push(found.code);
      offset += found.token.length;
    }
  }
  return output;
}

/**
 * @param {string} file
 * @param {number} markerOffset
 * @returns {{source:string,offset:number,windows:number,min:number,max:number,
 *   mean:number,atOrBelow:number}}
 */
function nativeMarkerGate(file, markerOffset) {
  const data = encodeEnglish(read(file));
  let windows = 0;
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let atOrBelow = 0;
  const target = repeats(primary);
  for (let start = 0; start + primary.length <= data.length; start += 17) {
    const count = markerCount(data.slice(start, start + primary.length),
      markerOffset);
    windows++;
    min = Math.min(min, count);
    max = Math.max(max, count);
    sum += count;
    if (count <= target) atOrBelow++;
  }
  return {source: file, offset:markerOffset, windows, min, max,
    mean:sum/windows, atOrBelow};
}

assert.equal(repeats(primary), 10);
assert.equal(repeats(holdout), 3);
for (const offset of [0,-1]) {
  // Preserve all source runes in the cipher and 29-alphabet native controls.
  for (const original of [primary, holdout]) {
    const candidate = decrypt(original, offset);
    assert.deepEqual(encrypt(candidate, offset), original);
    console.log(JSON.stringify({
      interval:original===primary?'p16-22':'p54-55', markerOffset:offset,
      symbols:original.length, repeats:repeats(original),
      plaintextIoC:ioc(candidate),
      originalIoC:ioc(original),
      first40: candidate.slice(0,40).map(x=>corpus.translit[x]).join(' ')
    }));
  }
  for (const length of [primary.length,holdout.length]) {
    const planted = Array.from({length},(_,i)=>native[i%native.length]);
    const ct = encrypt(planted,offset);
    assert.deepEqual(decrypt(ct,offset),planted);
    assert.equal(repeats(ct),markerCount(planted,offset));
  }
  for (const file of [
    'resources/control/shakespeare_first300k.txt',
    'resources/control/gibran_prophet_58585.txt'
  ]) {
    const result = nativeMarkerGate(file, offset);
    assert.ok(result.windows>3000);
    assert.equal(result.atOrBelow,0);
    console.log(JSON.stringify(result));
  }
}
console.log('PASS: original complete roundtrips, native-GP plants, and source marker gate');
