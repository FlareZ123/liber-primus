'use strict';

// Bounded p55-inner23 -> authenticated DH(23) worked-example -> p56 cipher test.
// Run from any working directory with Node.js 22:
//   node sims/lp2_p55_inner23_dh23_shared2_gate.cjs
//
// The p55 inner register is independently reproduced from the original
// continuous transcript. The DH example's server values are illustrative
// participant values, not a Cicada-fixed LP2 key.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const raw = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8'
);

function parseOriginalUnsolvedWords() {
  const source = raw.split('%').slice(0, 55).join('%');
  const runeId = new Map(corpus.runes.map((ch, i) => [ch, i]));
  const words = [];
  let indices = [];
  let page = 0;
  function finish() {
    if (indices.length) words.push(indices);
    indices = [];
  }
  for (const character of source) {
    const rune = runeId.get(character);
    if (rune !== undefined) {
      indices.push(rune);
    } else if (character === '%') {
      page++;
    } else if (character === '/' || /\s/u.test(character)) {
      // Original line wraps and page separators do not break words.
    } else {
      finish();
    }
  }
  finish();
  assert.equal(words.length, 2896);
  assert.equal(words.reduce((n, word) => n + word.length, 0), 12956);
  return words;
}

function layer(wordArrays, n) {
  return wordArrays.flatMap(word => word.slice(n, Math.max(n, word.length - n)));
}

function base29Number(digits) {
  return digits.reduce((n, digit) => n * 29n + BigInt(digit), 0n);
}

function modPow(base, exponent, modulus) {
  let b = BigInt(base);
  let e = BigInt(exponent);
  const m = BigInt(modulus);
  let out = 1n;
  while (e > 0n) {
    if (e & 1n) out = (out * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return Number(out);
}

function firstPrimes(count) {
  const out = [];
  for (let candidate = 2; out.length < count; candidate++) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor++) {
      if (candidate % divisor === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(candidate);
  }
  return out;
}

// The solved p56 inverse: subtract (prime - 1) mod29 for each encrypted
// non-F rune. Literal plaintext F emits F and does not consume a prime.
// A ciphertext F can instead be an encrypted non-F, so branch both ways.
function decodeWithMask(cipher, fPositions, mask, primes) {
  let clock = 0;
  const plain = [];
  for (let i = 0; i < cipher.length; i++) {
    const fIndex = fPositions.indexOf(i);
    if (fIndex !== -1 && (mask & (1 << fIndex))) {
      plain.push(0);
      continue;
    }
    const p = primes[clock++];
    const value = ((cipher[i] - (p - 1)) % 29 + 29) % 29;
    if (value === 0) return null; // encrypted plaintext F is forbidden
    plain.push(value);
  }
  return { plain, consumedPrimes: clock };
}

function toGpRunes(words) {
  const alphabet = corpus.translit
    .map((token, index) => ({ token, index }))
    .sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (const word of words.split(' ')) {
    for (let i = 0; i < word.length;) {
      const match = alphabet.find(({ token }) => word.startsWith(token, i));
      assert.ok(match, 'No GP spelling for ' + word.slice(i));
      out.push(match.index);
      i += match.token.length;
    }
  }
  return out;
}

function main() {
  // Reproduce the p55 second-peel 23-rune register from the original source.
  const words = parseOriginalUnsolvedWords();
  const terminalWords = words.slice(-16);
  assert.deepEqual(terminalWords.map(w => w.length),
    [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
  const core = layer(terminalWords, 2);
  // Freeze the two removed circumference layers in reading order:
  // outermost layer first, then the next layer; within each word take left
  // edge before right edge. A one-rune residual contributes only once.
  const firstPeelWords = terminalWords.map(w =>
    w.slice(1, Math.max(1, w.length - 1)));
  const outerLayer1 = terminalWords.flatMap(w => [w[0], w[w.length - 1]]);
  const outerLayer2 = firstPeelWords.flatMap(w =>
    w.length === 1 ? [w[0]] :
    w.length > 1 ? [w[0], w[w.length - 1]] : []);
  const outer = [...outerLayer1, ...outerLayer2];
  assert.equal(outerLayer1.length, 32);
  assert.equal(outerLayer2.length, 20);
  assert.equal(outer.length, 52);
  const gpString = runes => runes.map(i => corpus.translit[i]).join(' ');
  assert.equal(gpString(outerLayer1),
    'AE W S B X M S AE F U W R B EO M F B C EO E EA S E S TH OE C X D U B I');
  assert.equal(gpString(outerLayer2),
    'M I EO TH IA C EA L S P H EO E G S E EA C J E');
  assert.deepEqual(core, [
    6, 23, 24, 17, 0, 14, 10, 19, 1, 5, 13, 8,
    21, 23, 27, 10, 6, 14, 12, 2, 2, 10, 19
  ]);
  assert.equal(core.length, 23);
  assert.equal(core.filter(x => x === 0).length, 1);

  // Authenticated 2013 BASE29: treat the 23 GP digits as one integer.
  const n = base29Number(core);
  assert.equal(n, 1015521743086949888934587058926666n);

  // Conditional DH role: use n mod (23-1) as a client exponent.
  const modulus = 23;
  const base = 5;
  const serverPublic = 8; // illustrative worked-example server share
  const clientExponent = Number(n % BigInt(modulus - 1));
  const clientPublic = modPow(base, clientExponent, modulus);
  const shared = modPow(serverPublic, clientExponent, modulus);
  assert.equal(clientExponent, 4);
  assert.equal(clientPublic, 4);
  assert.equal(shared, 2);

  // Recheck the signed example's values. Exponents 4 and 15 agree against
  // public share 8 because 8 has order 11 modulo 23 (8^11 = 1).
  assert.equal(modPow(5, 6, 23), 8);
  assert.equal(modPow(5, 15, 23), 19);
  assert.equal(modPow(8, 15, 23), 2);
  assert.equal(modPow(19, 6, 23), 2);
  assert.equal(modPow(8, 11, 23), 1);
  assert.equal(modPow(8, 4, 23), modPow(8, 15, 23));

  // Apply the established p56 prime-totient inverse to the inner23 and
  // to the two circumference layers serialized outer-first (52 runes).
  const primes = firstPrimes(100);
  const fPositions = core.map((r, i) => r === 0 ? i : -1)
    .filter(i => i >= 0);
  assert.deepEqual(fPositions, [4]);
  const candidates = [];
  for (let mask = 0; mask < (1 << fPositions.length); mask++) {
    const decoded = decodeWithMask(core, fPositions, mask, primes);
    if (decoded) candidates.push({
      mask,
      consumedPrimes: decoded.consumedPrimes,
      gp: decoded.plain.map(i => corpus.translit[i]).join(' ')
    });
  }
  assert.deepEqual(candidates, [
    {
      mask: 0,
      consumedPrimes: 23,
      gp: 'C NG L J M TH D U H G EO U I I I T G EO R M B M A'
    },
    {
      mask: 1,
      consumedPrimes: 22,
      gp: 'C NG L J F R IA O EO EO X W X EO X OE EO X I D M AE EA'
    }
  ]);

  const outerFPositions = outer.map((r, i) => r === 0 ? i : -1)
    .filter(i => i >= 0);
  assert.deepEqual(outerFPositions, [8, 15]);
  const outerCandidates = [];
  for (let mask = 0; mask < (1 << outerFPositions.length); mask++) {
    const decoded = decodeWithMask(outer, outerFPositions, mask, primes);
    if (decoded) outerCandidates.push({
      mask,
      consumedPrimes: decoded.consumedPrimes,
      gp: gpString(decoded.plain)
    });
  }
  assert.deepEqual(outerCandidates, [{
    mask: 0,
    consumedPrimes: 52,
    gp: 'A C J J R W EA W W TH G Y G EA TH G B O R G X A D X OE N M A TH C W AE EA B N Y T B W OE J W NG D AE J H EA C N J EO'
  }]);

  // Positive control: the same inverse recovers the independently known
  // p56 plaintext with its established start and literal-F mask.
  const p56Cipher = corpus.pages.find(page => page.page === 56).indices;
  const expectedWords =
    'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
  const expected = toGpRunes(expectedWords);
  assert.equal(p56Cipher.length, 85);
  assert.equal(expected.length, 85);
  const p56F = p56Cipher.map((r, i) => r === 0 ? i : -1)
    .filter(i => i >= 0);
  assert.deepEqual(p56F, [35, 47, 51, 56, 74]);
  const p56Decoded = decodeWithMask(p56Cipher, p56F, 8, primes);
  assert.ok(p56Decoded);
  assert.deepEqual(p56Decoded.plain, expected);

  console.log(JSON.stringify({
    p55CoreRunes: core.map(i => corpus.translit[i]).join(' '),
    p55CoreBase29: n.toString(),
    dh23ClientExponent: clientExponent,
    dh23ClientPublic: clientPublic,
    dh23SharedWithExampleServerPublic8: shared,
    dh23ExampleEquivalence: '8^4 = 8^15 = 2 (mod 23); 8^11 = 1',
    p56TotientStart: primes[0],
    p55CoreCiphertextFPositions: fPositions,
    p55CoreInverseCandidates: candidates,
    p55Outer52Runes: gpString(outer),
    p55Outer52FPositions: outerFPositions,
    p55Outer52InverseCandidates: outerCandidates,
    p56KnownPlaintextPositiveControl: 'PASS',
    verdict: 'No readable p55 inner23 or outer52 plaintext under this fixed p56 transfer'
  }, null, 2));
}

main();
