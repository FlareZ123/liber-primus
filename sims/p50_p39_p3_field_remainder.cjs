#!/usr/bin/env node
'use strict';

// Reproduce the p50 / p39 / p3 finite-field quotient.
// Input coefficients are the 256 base60-grid bytes in descending polynomial order.

const fs = require('fs');
const path = require('path');

const gridPath = path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json');
const grid = JSON.parse(fs.readFileSync(gridPath, 'utf8'));
const P = grid.byte_rows.flat().map(x => mod(x));

function mod(x) { return ((x % 29) + 29) % 29; }

if (P.length !== 256) throw new Error('expected 256 table coefficients');

function divideByRoot(desc, root) {
  const q = [mod(desc[0])];
  for (let i = 1; i < desc.length - 1; i++) {
    q.push(mod(desc[i] + root * q[i - 1]));
  }
  const remainder = mod(desc[desc.length - 1] + root * q[q.length - 1]);
  return { quotient: q, remainder };
}

// F39(X) = 27 + 5X + 15X^2 = 15(X - 24)^2.
// Divide by (X - 24)^2, then by the scalar 15 (15^-1 = 2 mod 29).
const d1 = divideByRoot(P, 24);
const d2 = divideByRoot(d1.quotient, 24);
if (d1.remainder !== 0 || d2.remainder !== 0) {
  throw new Error('p39 repeated-root division was not exact');
}
const quotientByF39 = d2.quotient.map(x => mod(2 * x));

// F3(X) = 13 + 23X + 2X^2. In the quotient field, u^2 = 3u + 8.
function reduceModuloP3(desc) {
  const a = desc.slice().reverse().map(mod); // ascending coefficients
  for (let i = a.length - 1; i >= 2; i--) {
    const factor = mod(15 * a[i]); // inverse of leading coefficient 2
    a[i] = 0;
    a[i - 1] = mod(a[i - 1] - 23 * factor);
    a[i - 2] = mod(a[i - 2] - 13 * factor);
  }
  return [mod(a[0]), mod(a[1])];
}

const reduced = reduceModuloP3(quotientByF39);
const constant = reduced[0];
const uCoefficient = reduced[1];
const g = constant + 29 * uCoefficient; // constant + uCoefficient*u

function mulGF841(x, y) {
  const a = x % 29, b = Math.floor(x / 29);
  const c = y % 29, d = Math.floor(y / 29);
  return mod(a * c + 8 * b * d) +
    29 * mod(a * d + b * c + 3 * b * d);
}

let order = 1;
let value = g;
while (value !== 1 && order <= 840) {
  value = mulGF841(value, g);
  order++;
}

const result = {
  polynomial: {
    degree: 255,
    coefficient_order: 'descending',
    p39: '27 + 5X + 15X^2 = 15(X - 24)^2',
    p3: '13 + 23X + 2X^2',
    field_relation: 'u^2 = 3u + 8'
  },
  division_remainders: [d1.remainder, d2.remainder],
  quotient_degree: quotientByF39.length - 1,
  remainder_mod_p3: [constant, uCoefficient],
  field_element: String(constant) + ' + ' + String(uCoefficient) + 'u',
  integer_encoding: g,
  multiplicative_order: order,
  primitive: order === 840
};

if (constant !== 19 || uCoefficient !== 13 || order !== 840) {
  throw new Error('unexpected result: ' + JSON.stringify(result));
}

console.log(JSON.stringify(result, null, 2));
