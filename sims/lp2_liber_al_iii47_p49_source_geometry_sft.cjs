#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));

const tablePage = grid.pages.find((page) => page.page === 49);
const p55Page = corpus.pages.find((page) => page.page === 55);
assert.ok(tablePage && p55Page, 'required p49 table and p55 corpus page');
assert.equal(tablePage.rows, 10);
assert.equal(tablePage.cols, 8);
assert.equal(tablePage.tokens.length, 80);
assert.equal(p55Page.indices.length, 76);

const tokens = tablePage.tokens;
const p55 = p55Page.indices;
const translit = corpus.translit;
const BASE60 = grid.alphabet;
const BASE59 = BASE60.replace('f', '');

function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n += 1) {
    let prime = true;
    for (let d = 2; d * d <= n; d += 1) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) out.push(n);
  }
  return out;
}

// The archived 2013 OS prime_echo script prints 464 primes; the first 300
// cover every p49 byte used below (maximum prime ordinal is 255).
const PRIME_ECHO = firstPrimes(300);

const mod = (n, m) => ((n % m) + m) % m;
const decodeToken = (token, alphabet) => alphabet.length * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1]);
const render = (values) => values.map((value) => translit[value]).join(' ');

// The OTO scan labels columns a-h and rows 1-10. The diagonal is read
// approximately from b1 to e7; its four labelled coordinate points are
// b1, c3, d5, e7. The circled plus/cross is separately at d7.
// Source: https://lib.oto-usa.org/libri/images/liber0031/60.jpg
const lineCoords = [[0, 1], [2, 2], [4, 3], [6, 4]];
const lineLabels = ['b1', 'c3', 'd5', 'e7'];
const lineIndices = [1, 18, 35, 52];
const circleCoord = [6, 3];
const circleLabel = 'd7';
const circleIndex = 51;
const oldMaskIndices = [0, 17, 34, 51]; // a1,b3,c5,d7: prior one-column-left candidate

assert.deepEqual(lineCoords.map(([r, c]) => r * 8 + c), lineIndices);
assert.ok(!lineIndices.includes(circleIndex));
assert.ok(oldMaskIndices.includes(circleIndex));

function buildShearedKey(tableValues) {
  const sheared = Array(80);
  for (let r = 0; r < 10; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      // Anchor the slope-2 line at b1: r' = r - 2(c - 1) mod 10.
      const targetRow = mod(r - 2 * (c - 1), 10);
      sheared[targetRow * 8 + c] = tableValues[r * 8 + c];
    }
  }

  const lineTargets = lineCoords.map(([r, c]) => mod(r - 2 * (c - 1), 10) * 8 + c);
  const circleTarget = mod(circleCoord[0] - 2 * (circleCoord[1] - 1), 10) * 8 + circleCoord[1];
  assert.deepEqual(lineTargets, [1, 2, 3, 4]);
  assert.equal(circleTarget, 19);

  const keep = Array.from({ length: 80 }, (_, i) => i).filter((i) => !lineTargets.includes(i));
  const start = keep.findIndex((i) => i > circleTarget);
  assert.ok(start >= 0);
  const order = keep.slice(start).concat(keep.slice(0, start));
  const keyBytes = order.map((i) => sheared[i]);

  const spiralOrder = spiralFromCircle(sheared);
  const spiralKey = spiralOrder.map((i) => mod(sheared[i], 29));
  const spiralMinus = p55.map((value, i) => mod(value - spiralKey[i], 29));
  const spiralPlus = p55.map((value, i) => mod(value + spiralKey[i], 29));
  assert.equal(keyBytes.length, 76);
  return { sheared, lineTargets, circleTarget, order, keyBytes, spiralOrder };
}

function shearP55(directionValues) {
  const source = Array(80).fill(null);
  let j = 0;
  for (let i = 0; i < 80; i += 1) {
    if (!lineIndices.includes(i)) source[i] = p55[j++];
  }
  assert.equal(j, 76);

  const target = Array(80).fill(null);
  for (let r = 0; r < 10; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      const targetRow = mod(r - 2 * (c - 1), 10);
      target[targetRow * 8 + c] = source[r * 8 + c];
    }
  }

  const built = buildShearedKey(directionValues);
  return built.order.map((i) => target[i]);
}


function columnarDecrypt(ciphertext, key) {
  const n = key.length;
  const rows = Math.ceil(ciphertext.length / n);
  const full = Math.floor(ciphertext.length / n);
  const rem = ciphertext.length % n;
  const lengths = Array.from({ length: n }, (_, i) => full + (i < rem ? 1 : 0));
  const order = key.map((value, i) => ({ value, i }))
    .sort((a, b) => a.value - b.value || a.i - b.i)
    .map((item) => item.i);
  const columns = Array(n);
  let offset = 0;
  for (const col of order) {
    columns[col] = ciphertext.slice(offset, offset + lengths[col]);
    offset += lengths[col];
  }
  const out = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < n; col += 1) {
      if (row < columns[col].length) out.push(columns[col][row]);
    }
  }
  return { out, order };
}

function columnarEncrypt(plaintext, key) {
  const n = key.length;
  const columns = Array.from({ length: n }, (_, col) => plaintext.filter((_, i) => i % n === col));
  const order = key.map((value, i) => ({ value, i }))
    .sort((a, b) => a.value - b.value || a.i - b.i)
    .map((item) => item.i);
  return order.flatMap((col) => columns[col]);
}

function spiralFromCircle(sheared) {
  // The corrected line is the sheared top row at cells 1..4; the circle d7
  // maps to row2/column3 (index19). Start there and spiral outward clockwise,
  // initially moving toward the straightened line.
  const removed = new Set([1, 2, 3, 4]);
  const seen = new Set();
  const order = [];
  let row = 2;
  let col = 3;
  const add = () => {
    if (row >= 0 && row < 10 && col >= 0 && col < 8) {
      const index = row * 8 + col;
      if (!removed.has(index) && !seen.has(index)) {
        seen.add(index);
        order.push(index);
      }
    }
  };
  add();
  const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
  let step = 1;
  let direction = 0;
  while (order.length < 76 && step < 40) {
    for (let repeat = 0; repeat < 2; repeat += 1) {
      const [dr, dc] = directions[direction % 4];
      for (let k = 0; k < step; k += 1) {
        row += dr;
        col += dc;
        add();
      }
      direction += 1;
    }
    step += 1;
  }
  assert.equal(order.length, 76);
  assert.equal(seen.size, 76);
  return order;
}

const outputs = [];
for (const [radix, alphabet] of [['base60', BASE60], ['base59', BASE59]]) {
  const tableValues = tokens.map((token) => decodeToken(token, alphabet));
  const built = buildShearedKey(tableValues);
  const keyBytes = built.keyBytes;
  const key = keyBytes.map((value) => mod(value, 29));

  // Source-constrained alternative: treat each p49 byte as a 1-based prime
  // ordinal, then apply the LP2 prime-totient operation and BASE29 reduction.
  assert.ok(keyBytes.every((value) => value >= 1 && value <= PRIME_ECHO.length));
  const primeIndexTotientKey = keyBytes.map((value) => mod(PRIME_ECHO[value - 1] - 1, 29));
  const primeIndexTotientMinus = p55.map((value, i) => mod(value - primeIndexTotientKey[i], 29));
  const primeIndexTotientPlus = p55.map((value, i) => mod(value + primeIndexTotientKey[i], 29));

  const minus = p55.map((value, i) => mod(value - key[i], 29));
  const plus = p55.map((value, i) => mod(value + key[i], 29));
  const xorMod29 = p55.map((value, i) => mod(value ^ key[i], 29));
  const rawXor = p55.map((value, i) => value ^ keyBytes[i]);
  const printable = rawXor.filter((value) => value >= 32 && value <= 126).length;

  const rank = keyBytes
    .map((value, i) => i)
    .sort((a, b) => keyBytes[a] - keyBytes[b] || a - b);
  const rankDirect = rank.map((i) => p55[i]);
  const rankInverse = Array(76);
  for (let i = 0; i < 76; i += 1) rankInverse[rank[i]] = p55[i];

  // Positive control: the additive-pad inverse must recover a planted GP29 stream.
  const synthetic = Array.from({ length: 76 }, (_, i) => i % 29);
  const syntheticCipher = synthetic.map((value, i) => mod(value + key[i], 29));
  const recovered = syntheticCipher.map((value, i) => mod(value - key[i], 29));
  assert.deepEqual(recovered, synthetic);

  outputs.push({
    radix,
    lineTokens: lineIndices.map((i) => tokens[i]),
    circleToken: tokens[circleIndex],
    lineValues: lineIndices.map((i) => tableValues[i]),
    circleValue: tableValues[circleIndex],
    lineValuesMod29: lineIndices.map((i) => mod(tableValues[i], 29)),
    circleValueMod29: mod(tableValues[circleIndex], 29),
    lineTargetsAfterShear: built.lineTargets,
    circleTargetAfterShear: built.circleTarget,
    keyLength: key.length,
    keyText: render(key),
    spiralOrder,
    spiralKeyText: render(spiralKey),
    spiralPadMinus: render(spiralMinus),
    spiralPadPlus: render(spiralPlus),

    spiralTranspositionForward: (() => {
      const sourceCells = Array.from({ length: 80 }, (_, i) => i).filter((i) => !lineIndices.includes(i));
      const sourceIndexBySheared = new Map(Array.from({ length: 80 }, (_, i) => {
        const row = Math.floor(i / 8);
        const col = i % 8;
        return [mod(row - 2 * (col - 1), 10) * 8 + col, i];
      }));
      const permutation = spiralOrder.map((shearedIndex) => sourceCells.indexOf(sourceIndexBySheared.get(shearedIndex)));
      assert.equal(new Set(permutation).size, 76);
      return render(permutation.map((i) => p55[i]));
    })(),
    spiralTranspositionInverse: (() => {
      const sourceCells = Array.from({ length: 80 }, (_, i) => i).filter((i) => !lineIndices.includes(i));
      const sourceIndexBySheared = new Map(Array.from({ length: 80 }, (_, i) => {
        const row = Math.floor(i / 8);
        const col = i % 8;
        return [mod(row - 2 * (col - 1), 10) * 8 + col, i];
      }));
      const permutation = spiralOrder.map((shearedIndex) => sourceCells.indexOf(sourceIndexBySheared.get(shearedIndex)));
      const inverse = Array(76);
      permutation.forEach((sourcePosition, outputPosition) => { inverse[sourcePosition] = outputPosition; });
      assert.equal(new Set(inverse).size, 76);
      return render(inverse.map((i) => p55[i]));
    })(),
    primeIndexTotientKeyText: render(primeIndexTotientKey),
    primeIndexTotientMinus: render(primeIndexTotientMinus),
    primeIndexTotientPlus: render(primeIndexTotientPlus),
    directPadMinus: render(minus),
    directPadPlus: render(plus),
    xorMod29: render(xorMod29),
    rawXorPrintableCount: printable,
    rawXorPrintableRatio: printable / 76,
    rawXorAscii: rawXor.map((value) => value >= 32 && value <= 126 ? String.fromCharCode(value) : '.').join(''),
    rankDirect: render(rankDirect),
    rankInverse: render(rankInverse),
    p55GridShear: render(shearP55(tableValues)),
    positiveControl: true
  });
}


const pointKeyCandidates = [];
for (const [radix, alphabet] of [['base60', BASE60], ['base59', BASE59]]) {
  const tableValues = tokens.map((token) => decodeToken(token, alphabet));
  const lineValues = lineIndices.map((i) => tableValues[i]);
  const circleValue = tableValues[circleIndex];
  const pointOrders = [
    { name: 'line-then-circle', values: lineValues.concat(circleValue) },
    { name: 'circle-then-line', values: [circleValue].concat(lineValues) },
    { name: 'reverse-line-then-circle', values: lineValues.slice().reverse().concat(circleValue) }
  ];
  for (const candidate of pointOrders) {
    const pointKey = candidate.values.map((value) => mod(value, 29));
    const vigenereMinus = p55.map((value, i) => mod(value - pointKey[i % pointKey.length], 29));
    const vigenerePlus = p55.map((value, i) => mod(value + pointKey[i % pointKey.length], 29));
    const columnar = columnarDecrypt(p55, pointKey);
    const columnarForward = columnarEncrypt(p55, pointKey);
    const synthetic = Array.from({ length: 76 }, (_, i) => i % 29);
    assert.deepEqual(columnarDecrypt(columnarEncrypt(synthetic, pointKey), pointKey).out, synthetic);
    pointKeyCandidates.push({
      radix,
      order: candidate.name,
      lineTokens: lineIndices.map((i) => tokens[i]),
      circleToken: tokens[circleIndex],
      keyValues: candidate.values,
      keyText: render(pointKey),
      vigenereMinus: render(vigenereMinus),
      vigenerePlus: render(vigenerePlus),
      columnarDecrypt: render(columnar.out),
      columnarEncrypt: render(columnarForward),
      columnarOrder: columnar.order,
      positiveControl: true
    });
  }
}

const summary = {
  sourceUrl: 'https://lib.oto-usa.org/libri/images/liber0031/60.jpg',
  sourceGeometry: {
    line: lineLabels,
    lineIndices,
    circle: circleLabel,
    circleIndex,
    supersededMaskIndices: oldMaskIndices,
    shear: "r' = (r - 2(c - 1)) mod 10",
    lineComplementLength: 80 - lineIndices.length,
    p55RuneCount: p55.length
  },
  primeEchoPrimeCount: PRIME_ECHO.length,
  outputs,
  pointKeyCandidates
};

console.log(JSON.stringify(summary, null, 2));
