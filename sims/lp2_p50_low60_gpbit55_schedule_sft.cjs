'use strict';

const fs = require('fs');
const path = require('path');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));

function assertEq(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(\`\${label}: expected \${expected}, got \${actual}\`);
  }
}

function assertNear(actual, expected, tol, label) {
  if (Math.abs(actual - expected) > tol) {
    throw new Error(\`\${label}: expected \${expected}, got \${actual}\`);
  }
}

function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value] += 1;
  const n = values.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

function firstPrimes(count) {
  const primes = [];
  for (let candidate = 2; primes.length < count; candidate += 1) {
    let prime = true;
    for (const p of primes) {
      if (p * p > candidate) break;
      if (candidate % p === 0) {
        prime = false;
        break;
      }
    }
    if (prime) primes.push(candidate);
  }
  return primes;
}

const low = [];
for (let cell = 0; cell < grid.bytes.length; cell += 1) {
  const value = grid.bytes[cell];
  if (value < 60) {
    low.push({
      cell,
      value,
      q: Math.floor(value / 2),
      bit: value & 1,
    });
  }
}
assertEq(low.length, 60, 'leading-zero cell count');

const sentinels = low.filter((entry) => entry.q === 29);
const schedule = low.filter((entry) => entry.q < 29);
assertEq(sentinels.length, 5, 'q=29 sentinel count');
assertEq(schedule.length, 55, 'GP29+bit schedule count');
assertEq(sentinels.map((x) => x.cell).join(','), '22,51,81,219,220', 'sentinel cell indices');
assertEq(sentinels.map((x) => x.value).join(','), '59,59,58,59,58', 'sentinel values');

const pages = corpus.pages.filter((page) => page.page <= 55 && page.runic_count > 0);
assertEq(pages.length, 55, 'rune-bearing unknown page count');
assertEq(pages.reduce((sum, page) => sum + page.runic_count, 0), 12956, 'unknown rune count');

const primes = firstPrimes(500);

function p56Feasible(indices, startOrdinal, sign) {
  let states = new Set([startOrdinal]);
  for (let pos = 0; pos < indices.length; pos += 1) {
    const cipher = indices[pos];
    const next = new Set();
    for (const ptr of states) {
      if (cipher === 0) next.add(ptr);
      const key = (primes[ptr] - 1) % 29;
      const plain = ((cipher - sign * key) % 29 + 29) % 29;
      if (plain !== 0) next.add(ptr + 1);
    }
    if (next.size === 0) return false;
    states = next;
  }
  return true;
}

function p56FeasiblePages(polarity) {
  let total = 0;
  for (let i = 0; i < pages.length; i += 1) {
    const key = schedule[i];
    const sign = polarity * (key.bit ? 1 : -1);
    if (p56Feasible(pages[i].indices, key.q, sign)) total += 1;
  }
  return total;
}

const feasiblePositivePolarity = p56FeasiblePages(1);
const feasibleNegativePolarity = p56FeasiblePages(-1);
assertEq(feasiblePositivePolarity, 2, 'p56 transfer feasible pages, polarity +1');
assertEq(feasibleNegativePolarity, 3, 'p56 transfer feasible pages, polarity -1');

function collisionInverse(indices, special, bit, polarity) {
  const output = [indices[0]];
  const reverse = (bit ^ polarity) === 1;
  for (let pos = 1; pos < indices.length; pos += 1) {
    const delta = (indices[pos] - indices[pos - 1] + 29) % 29;
    if (delta === 0) {
      output.push(special);
      continue;
    }
    const rank = reverse ? 28 - delta : delta - 1;
    output.push(rank >= special ? rank + 1 : rank);
  }
  return output;
}

function collisionBookIoc(polarity) {
  const decoded = [];
  for (let i = 0; i < pages.length; i += 1) {
    decoded.push(...collisionInverse(pages[i].indices, schedule[i].q, schedule[i].bit, polarity));
  }
  return ioc(decoded);
}

const collisionIoc0 = collisionBookIoc(0);
const collisionIoc1 = collisionBookIoc(1);
assertNear(collisionIoc0, 0.034532793295337164, 1e-15, 'collision inverse IoC polarity0');
assertNear(collisionIoc1, 0.03451239351930573, 1e-15, 'collision inverse IoC polarity1');

function rampBookIoc(polarity, keySign) {
  const decoded = [];
  for (let i = 0; i < pages.length; i += 1) {
    const key = schedule[i];
    const direction = polarity * (key.bit ? 1 : -1);
    for (let pos = 0; pos < pages[i].indices.length; pos += 1) {
      const stream = ((key.q + direction * pos) % 29 + 29) % 29;
      decoded.push(((pages[i].indices[pos] - keySign * stream) % 29 + 29) % 29);
    }
  }
  return ioc(decoded);
}

const rampIocs = [];
for (const polarity of [1, -1]) {
  for (const keySign of [1, -1]) rampIocs.push(rampBookIoc(polarity, keySign));
}
const rampMin = Math.min(...rampIocs);
const rampMax = Math.max(...rampIocs);
assertNear(rampMin, 0.03446240691857451, 1e-15, 'ramp IoC minimum');
assertNear(rampMax, 0.034486881883509415, 1e-15, 'ramp IoC maximum');

function tableWalkBookIoc(polarity, keySign) {
  const decoded = [];
  for (let i = 0; i < pages.length; i += 1) {
    const anchor = schedule[i];
    const direction = polarity * (anchor.bit ? 1 : -1);
    for (let pos = 0; pos < pages[i].indices.length; pos += 1) {
      const cell = ((anchor.cell + direction * pos) % 256 + 256) % 256;
      const key = grid.bytes[cell] % 29;
      decoded.push(((pages[i].indices[pos] - keySign * key) % 29 + 29) % 29);
    }
  }
  return ioc(decoded);
}

const walkIocs = [];
for (const polarity of [1, -1]) {
  for (const keySign of [1, -1]) walkIocs.push(tableWalkBookIoc(polarity, keySign));
}
const walkMin = Math.min(...walkIocs);
const walkMax = Math.max(...walkIocs);
assertNear(walkMin, 0.034484868120571735, 1e-15, 'table-walk IoC minimum');
assertNear(walkMax, 0.0344983567575271, 1e-15, 'table-walk IoC maximum');

console.log('PASS p50 leading-zero base60 factorization');
console.log(\`  low cells: \${low.length}; GP29+bit entries: \${schedule.length}; sentinels: \${sentinels.length}\`);
console.log(\`  sentinel cells: \${sentinels.map((x) => x.cell).join(', ')}\`);
console.log(\`  p56 page-start transfer feasible pages: \${feasiblePositivePolarity}/55 and \${feasibleNegativePolarity}/55\`);
console.log(\`  collision-code inverse IoC: \${collisionIoc0.toFixed(12)}, \${collisionIoc1.toFixed(12)}\`);
console.log(\`  cyclic-ramp inverse IoC range: \${rampMin.toFixed(12)}..\${rampMax.toFixed(12)}\`);
console.log(\`  anchored table-walk inverse IoC range: \${walkMin.toFixed(12)}..\${walkMax.toFixed(12)}\`);
