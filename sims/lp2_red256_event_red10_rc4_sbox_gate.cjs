'use strict';

// Test the red-only 256-event tape: 225 red runes, all 30 red13 marks,
// plus the single red10 mark at LP2 p49 offset 66 (the table opener).
// The candidate tape is used as an RC4 key against the 256-byte p50 table.
// Read-only; no source artifact is modified.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = name => JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', name), 'utf8'));
const corpus = read('lp2-corpus.json');
const ink = read('lp2-ink-annotations.json');
const grid = read('base60-grid.json');

function rc4(key, length) {
  const s = Uint8Array.from({length: 256}, (_, i) => i);
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + key[i % key.length]) & 255;
    [s[i], s[j]] = [s[j], s[i]];
  }
  const out = new Uint8Array(length);
  let i = 0; j = 0;
  for (let n = 0; n < length; n++) {
    i = (i + 1) & 255;
    j = (j + s[i]) & 255;
    [s[i], s[j]] = [s[j], s[i]];
    out[n] = s[(s[i] + s[j]) & 255];
  }
  return out;
}
assert.equal(Buffer.from(rc4(Buffer.from('Key'), 10)).toString('hex'),
  'eb9f7781b734ca72a7');

const events = [];
for (const a of ink.pages) {
  const page = corpus.pages.find(p => p.page === a.page);
  assert.ok(page);
  for (const span of a.red_spans || []) {
    for (let k = 0; k < span.length; k++) {
      events.push({page: a.page, pos: span.start + k + 0.5, seq: events.length,
        kind: 'rune', value: page.indices[span.start + k]});
    }
  }
  for (const [offset, size, color] of a.large_punctuation || []) {
    if (color === 'red' && size === 13) {
      events.push({page: a.page, pos: offset, seq: events.length,
        kind: 'red13', value: 29});
    }
    if (a.page === 49 && offset === 66 && size === 10 && color === 'red') {
      events.push({page: a.page, pos: offset, seq: events.length,
        kind: 'red10', value: 30});
    }
  }
}
events.sort((a,b) => a.page-b.page || a.pos-b.pos || a.seq-b.seq);
assert.equal(events.length, 256);
assert.equal(events.filter(e => e.kind === 'rune').length, 225);
assert.equal(events.filter(e => e.kind === 'red13').length, 30);
assert.equal(events.filter(e => e.kind === 'red10').length, 1);
assert.deepEqual(events.filter(e => e.kind === 'red10').map(e =>
  [e.page,e.pos,events.indexOf(e)]), [[49,66,177]]);

const table = Uint8Array.from(grid.byte_rows.flat());
assert.equal(table.length, 256);
assert.equal(crypto.createHash('sha256').update(table).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

for (const [name,key] of [
  ['red13=29,red10=30', events.map(e => e.kind === 'rune' ? e.value :
    e.kind === 'red13' ? 29 : 30)],
  ['red13=30,red10=29', events.map(e => e.kind === 'rune' ? e.value :
    e.kind === 'red13' ? 30 : 29)],
]) {
  const stream = rc4(key, 256);
  const plain = table.map((b,i) => b ^ stream[i]);
  const counts = Array(256).fill(0);
  plain.forEach(x => counts[x]++);
  let entropy = 0;
  for (const n of counts) if (n) { const p=n/256; entropy -= p*Math.log2(p); }
  const printable = plain.filter(x => x >= 32 && x <= 126).length;
  console.log(JSON.stringify({name, keyLength:key.length,
    unique:counts.filter(n=>n>0).length,
    permutation:counts.every(n=>n===1), printable, entropy,
    first64hex:Buffer.from(plain.slice(0,64)).toString('hex')}));
}
