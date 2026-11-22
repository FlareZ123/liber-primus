'use strict';
/*
 * Source-locked 31 thirteen-dot-marker / 225 red-rune run-length key.
 * No unknown plaintext, arbitrary password tuning or image alterations.
 * Original-source input: 2014 LP2 JPEG adjudicated red spans/dots.
 * Test: node sims/lp2_red13dot_base60_openpuff_key_sft.cjs [--password-only]
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const ink = JSON.parse(fs.readFileSync(path.join(root, 'lp2-ink-annotations.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'base60-grid.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every(row => row.length === 8));
assert.equal(grid.alphabet, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
const events = [];
let red = 0, dots = 0, black = 0;
for (const page of ink.pages) {
  const actual = corpus.pages.find(p => p.page === page.page);
  assert.ok(actual, 'missing physical page');
  for (const span of page.red_spans ?? []) {
    const runes = Array.from(span.runes);
    assert.equal(runes.length, span.length, 'red span length');
    for (let i = 0; i < runes.length; i++) {
      assert.equal(runes[i], corpus.runes[actual.indices[span.start + i]], 'red source rune');
      events.push({page:page.page, pos:span.start + i + 0.5, type:'r'});
      red++;
    }
  }
  for (const mark of page.large_punctuation ?? []) {
    const [offset, count, color] = mark;
    if (count !== 13) continue;
    events.push({page:page.page, pos:offset, type:'d'});
    if (color === 'black') black++;
    dots++;
  }
}
events.sort((a,b) => a.page-b.page || a.pos-b.pos ||
  (a.type === 'r' ? -1 : 1));
assert.equal(red, 225);
assert.equal(dots, 31);
assert.equal(black, 1);
assert.equal(events.length, 256);
const lengths = [];
let count = 0;
for (const event of events) {
  if (event.type === 'r') count++;
  else {lengths.push(count); count=0;}
}
lengths.push(count);
assert.equal(lengths.length, 32);
assert.equal(lengths.reduce((a,b)=>a+b,0), 225);
assert.ok(lengths.every(x => Number.isInteger(x) && x >= 0 && x < 60));
const frozenLengths = [13,0,16,0,3,0,11,0,0,14,12,0,9,11,0,16,
  0,19,0,10,0,8,0,3,0,59,9,0,5,0,7,0];
assert.deepEqual(lengths, frozenLengths);
const password = lengths.map(n => grid.alphabet[n]).join('');
assert.equal(password, 'D0G030B00EC09B0G0J0A08030x905070');
assert.equal(password.length, 32);
if (process.argv.includes('--password-only')) {
  process.stdout.write(password+'\n');
} else {
  console.log(JSON.stringify({
    key_source:'225 original physical red runes + all 31 original physical 13-dot marks',
    original_event_total:events.length,
    natural_divisions:lengths.length,
    base60_alphabet:grid.alphabet,
    lengths,
    derived_A_only_password:password,
    password_sha256:crypto.createHash('sha256').update(password).digest('hex'),
    carrier_order:'original 2014 LP2 pages p0..p57, files 17.jpg..74.jpg',
    status:'candidate only; no source selects OpenPuff or its bit level, no plaintext claimed'
  },null,2));
}
