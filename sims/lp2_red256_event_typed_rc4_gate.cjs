'use strict';

// Read-only, source-frozen RC4 test for the color-typed 256-event LP2 ink tape.
// Natural extension tested: GP runes 0..28, red13=29, black13=30 (and the
// only alternative bijection of the two visible 13-dot ink classes).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
function source(name) {
  return JSON.parse(fs.readFileSync(
    path.join(root, 'resources', 'liber-primus', name), 'utf8'));
}
const corpus = source('lp2-corpus.json');
const ink = source('lp2-ink-annotations.json');
const grid = source('base60-grid.json');

function rc4(key, length) {
  assert.ok(key.length > 0);
  const state = Uint8Array.from({ length: 256 }, (_, i) => i);
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + state[i] + key[i % key.length]) & 255;
    [state[i], state[j]] = [state[j], state[i]];
  }
  const out = new Uint8Array(length);
  let i = 0;
  j = 0;
  for (let t = 0; t < length; t++) {
    i = (i + 1) & 255;
    j = (j + state[i]) & 255;
    [state[i], state[j]] = [state[j], state[i]];
    out[t] = state[(state[i] + state[j]) & 255];
  }
  return out;
}
assert.equal(Buffer.from(rc4([...Buffer.from('Key')], 10)).toString('hex'),
  'eb9f7781b734ca72a7');

const table = Uint8Array.from(grid.byte_rows.flat());
assert.equal(table.length, 256);
assert.equal(crypto.createHash('sha256').update(table).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const unknown = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(unknown.length, 12956);
const known = corpus.pages.find(p => p.page === 57).indices;
assert.equal(known.length, 95);

function buildEvents(redValue, blackValue) {
  const events = [];
  let sequence = 0;
  for (const annotation of ink.pages) {
    const page = corpus.pages.find(p => p.page === annotation.page);
    assert.ok(page, annotation.page);
    for (const span of annotation.red_spans || []) {
      assert.ok(span.start >= 0 && span.start + span.length <= page.indices.length);
      for (let k = 0; k < span.length; k++) {
        events.push({
          page: page.page,
          position: span.start + k + 0.5,
          sequence: sequence++,
          value: page.indices[span.start + k],
          kind: 'rune',
        });
      }
    }
    for (const [offset, size, color] of annotation.large_punctuation || []) {
      if (size !== 13) continue;
      assert.ok(color === 'red' || color === 'black', {page: page.page, offset, color});
      events.push({
        page: page.page,
        position: offset,
        sequence: sequence++,
        value: color === 'black' ? blackValue : redValue,
        kind: color === 'black' ? 'black13' : 'red13',
      });
    }
  }
  // The sequence tie-break preserves the source annotation's black-then-red
  // order at p7 offset 194; both precede the first red rune at that offset.
  events.sort((a, b) => a.page - b.page || a.position - b.position ||
    a.sequence - b.sequence);
  return events;
}

function mod(x) { return ((x % 29) + 29) % 29; }
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) {
    assert.ok(Number.isInteger(value) && value >= 0 && value <= 28);
    counts[value]++;
  }
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}
function decode(cipher, stream, mode, sign) {
  let previous = 0;
  return cipher.map((current, i) => {
    const step = mode === 'direct' ? stream[i] % 29 : stream[i] % 28 + 1;
    const value = mode === 'direct' ? current : mod(current - previous);
    previous = current;
    return mod(value + sign * step);
  });
}
function encode(clear, stream, mode, sign) {
  let previous = 0;
  return clear.map((plain, i) => {
    const step = mode === 'direct' ? stream[i] % 29 : stream[i] % 28 + 1;
    const value = mod(plain - sign * step);
    const current = mode === 'direct' ? value : mod(previous + value);
    previous = current;
    return current;
  });
}

const mappings = [
  {name: 'red13=29,black13=30', red: 29, black: 30},
  {name: 'red13=30,black13=29', red: 30, black: 29},
];
console.log('source:', JSON.stringify({
  unknownRunes: unknown.length,
  knownControlRunes: known.length,
  tableBytes: table.length,
  tableSha256: crypto.createHash('sha256').update(table).digest('hex'),
  markerClasses: {red13: 30, black13: 1},
  expectedEvents: 256,
}));

for (const mapping of mappings) {
  const events = buildEvents(mapping.red, mapping.black);
  assert.equal(events.length, 256);
  assert.equal(events.filter(e => e.kind === 'rune').length, 225);
  assert.equal(events.filter(e => e.kind === 'red13').length, 30);
  assert.equal(events.filter(e => e.kind === 'black13').length, 1);
  assert.equal(events.filter(e => e.value === mapping.red).length, 30);
  assert.equal(events.filter(e => e.value === mapping.black).length, 1);
  const black = events.find(e => e.kind === 'black13');
  assert.deepEqual(
    {page: black.page, position: black.position},
    {page: 7, position: 194},
  );
  console.log('typed-events:', JSON.stringify({
    mapping: mapping.name,
    count: events.length,
    first17: events.slice(0, 17).map(e => [e.page, e.position, e.kind, e.value]),
    black13: {page: black.page, position: black.position, value: black.value},
  }));

  for (const [direction, key] of [
    ['chronological', events.map(e => e.value)],
    ['reversed', events.map(e => e.value).reverse()],
  ]) {
    const tableStream = rc4(key, 256);
    const tableXor = table.map((value, i) => value ^ tableStream[i]);
    const printable = [...tableXor].filter(x => x >= 32 && x <= 126).length;
    console.log('table-XOR:', JSON.stringify({
      mapping: mapping.name,
      direction,
      printable,
      first24hex: Buffer.from(tableXor.slice(0, 24)).toString('hex'),
    }));

    const stream = rc4(key, unknown.length);
    for (const mode of ['direct', 'differential']) {
      for (const sign of [-1, 1]) {
        const clear = decode(unknown, stream, mode, sign);
        // Independent known-plaintext plant and original-input forward roundtrip.
        const plant = encode(known, stream, mode, sign);
        assert.deepEqual(decode(plant, stream, mode, sign), known);
        assert.deepEqual(encode(clear, stream, mode, sign), unknown);
        console.log('runes:', JSON.stringify({
          mapping: mapping.name,
          direction,
          mode,
          sign,
          ioc: ioc(clear),
          first20Gp: clear.slice(0, 20),
        }));
      }
    }
  }
}
console.log('PASS: both source-typed marker assignments, both key orientations,');
console.log('      all four fixed GP29 recipient models, RC4 KAT, and p57 plants.');
