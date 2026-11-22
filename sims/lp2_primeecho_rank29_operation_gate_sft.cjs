'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'historical', 'cicada2013-os-original-prime-echo.sh'),
  'utf8'
);

const entries = [];
for (const line of source.split(/\r?\n/)) {
  const match = line.match(/echo(?: -n)?\s+"(\d+)\s*";\s*sleep\s+([.\d]+)/);
  if (!match) continue;
  entries.push({prime:Number(match[1]), sleep:Number(match[2])});
}

assert.equal(entries.length, 464);
assert.equal(entries[0].prime, 2);
assert.equal(entries.at(-1).prime, 3301);

const longPauses = entries
  .map((entry, index) => ({...entry, ordinal:index + 1}))
  .filter((entry) => entry.sleep === 2);

assert.deepEqual(longPauses, [
  {prime:1033, sleep:2, ordinal:174},
  {prime:3301, sleep:2, ordinal:464}
]);
assert.ok(entries.every((entry) => entry.sleep === 0.05 || entry.sleep === 2));

const quotientA = longPauses[0].ordinal / 29;
const quotientB = longPauses[1].ordinal / 29;
const difference = quotientB - quotientA;

assert.deepEqual([quotientA, quotientB, difference], [6,16,10]);
assert.equal(174, 6 * 29);
assert.equal(464, 16 * 29);

console.log(JSON.stringify({
  sourceSemantics:{
    entries:entries.length,
    ordinarySleepSeconds:0.05,
    longPauses,
    actionsAtLongPauses:['print prime','sleep 2 seconds']
  },
  derivedOrdinalArithmetic:{
    ranks:[174,464],
    gp29Quotients:[6,16],
    quotientDifference:10
  },
  decision:
    '6,16,10 are exact derived ordinal arithmetic; prime_echo itself supplies no GP29 receiver, shift, index clock, key update, or state transition for them'
}, null, 2));
