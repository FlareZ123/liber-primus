'use strict';

/**
 * Return all primes up to max.
 * @param {number} max
 * @returns {number[]}
 */
function primesThrough(max) {
  const composite = new Uint8Array(max + 1);
  const primes = [];
  for (let n = 2; n <= max; n += 1) {
    if (composite[n]) continue;
    primes.push(n);
    if (n * n <= max) {
      for (let k = n * n; k <= max; k += n) composite[k] = 1;
    }
  }
  return primes;
}

/**
 * Reverse decimal digits.
 * @param {number} n
 * @returns {number}
 */
function reverseDecimal(n) {
  return Number(String(n).split('').reverse().join(''));
}

/**
 * Assert exact equality.
 * @param {unknown} actual
 * @param {unknown} expected
 * @param {string} label
 */
function assertEqual(actual, expected, label) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

const translit = [
  'F', 'U', 'TH', 'O', 'R', 'C', 'G', 'W', 'H', 'N',
  'I', 'J', 'EO', 'P', 'X', 'S', 'T', 'B', 'E', 'M',
  'L', 'NG', 'OE', 'D', 'A', 'AE', 'Y', 'IA', 'EA'
];

const primes = primesThrough(10000);
const rank = new Map(primes.map((p, i) => [p, i + 1]));

assertEqual(rank.get(1033), 174, 'rank(1033)');
assertEqual(rank.get(3301), 464, 'rank(3301)');

const low = rank.get(1033) / 29;
const gap = (rank.get(3301) - rank.get(1033)) / 29;
const high = rank.get(3301) / 29;
assertEqual([low, gap, high], [6, 10, 16], '29-normalized rank tuple');
assertEqual([translit[low], translit[gap], translit[high]], ['G', 'I', 'T'], 'GP29 readout');

const reversiblePrimePairs = [];
for (const p of primes) {
  if (p < 1000 || p > 9999) continue;
  const q = reverseDecimal(p);
  if (q < 1000 || q > 9999 || q <= p || !rank.has(q)) continue;
  reversiblePrimePairs.push([p, q]);
}

assertEqual(reversiblePrimePairs.length, 102, 'four-digit non-palindromic reversible-prime pairs');

const bothRanksDivisibleBy29 = reversiblePrimePairs.filter(([p, q]) =>
  rank.get(p) % 29 === 0 && rank.get(q) % 29 === 0
);
assertEqual(bothRanksDivisibleBy29, [[1033, 3301]], 'unique both-ranks-divisible-by-29 pair');

console.log(JSON.stringify({
  ranks: { '1033': 174, '3301': 464 },
  normalized: [low, gap, high],
  gp29: [translit[low], translit[gap], translit[high]].join(''),
  reversiblePrimePairCount: reversiblePrimePairs.length,
  divisiblePair: bothRanksDivisibleBy29[0]
}, null, 2));
