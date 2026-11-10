'use strict';
const assert = require('node:assert/strict');

// Canonical 29-entry Gematria Primus order; primes are the first 29 primes.
const GP = [
  ['Feoh', 2], ['Ur', 3], ['Thorn', 5], ['Os', 7], ['Rad', 11],
  ['Cen', 13], ['Gyfu', 17], ['Wynn', 19], ['Haegl', 23], ['Nyd', 29],
  ['Is', 31], ['Ger', 37], ['Eoh', 41], ['Peorth', 43], ['Eolh', 47],
  ['Sigel', 53], ['Tyr', 59], ['Beorc', 61], ['Eh', 67], ['Mann', 71],
  ['Lagu', 73], ['Ing', 79], ['Ethel', 83], ['Dag', 89], ['Ac', 97],
  ['Aesc', 101], ['Yr', 103], ['Ior', 107], ['Ear', 109],
];

function walk(startName, sign) {
  let index = GP.findIndex(([name]) => name === startName);
  assert.notEqual(index, -1, `unknown start rune: ${startName}`);
  const firstSeen = new Map();
  const path = [];
  while (!firstSeen.has(index)) {
    firstSeen.set(index, path.length);
    const [name, prime] = GP[index];
    const step = (prime - 1) % GP.length;
    path.push({ index, name, prime, step });
    index = (index + sign * step + GP.length * GP.length) % GP.length;
  }
  return {
    path,
    cycleStart: firstSeen.get(index),
    cycleLength: path.length - firstSeen.get(index),
    repeatedRune: GP[index][0],
  };
}

const plus = walk('Ac', +1);
const minus = walk('Ac', -1);
assert.deepEqual(plus.path.map(x => x.name),
  ['Ac', 'Rad', 'Eolh', 'Thorn', 'Gyfu', 'Ethel', 'Beorc', 'Mann']);
assert.equal(plus.cycleStart, 3);
assert.equal(plus.cycleLength, 5);
assert.equal(plus.repeatedRune, 'Thorn');
assert.deepEqual(minus.path.map(x => x.name),
  ['Ac', 'Sigel', 'Ing', 'Ur', 'Ear', 'Wynn', 'Eh', 'Is', 'Nyd']);

console.log(JSON.stringify({
  rule: 'i_next = i + sign * (prime[i] - 1) mod 29',
  start: 'Ac',
  plus,
  minus,
}, null, 2));
