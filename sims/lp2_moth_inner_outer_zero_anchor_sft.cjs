'use strict';

/**
 * Original-image-selected p53/p55 moth pair vs 32x8 table:
 * exact 180-interior/76-perimeter event census, zero anchors,
 * and frozen source-key plaintext tests.
 *
 * Node.js 22, read-only, standalone CommonJS SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const get = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = get('resources/liber-primus/lp2-corpus.json');
const grid = get('resources/liber-primus/lp2-grid-256.json');
const ink = get('resources/liber-primus/lp2-ink-annotations.json');
const transcript = fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-transcription.txt'), 'utf8').split('%');
const wordsAt = segment => [
  ...transcript[segment].replace(/\/\s*/g, '').replace(/\s/g, '')
    .matchAll(/[\u16A0-\u16FF]+/gu)
].map(m => m[0]);
const p53Words = wordsAt(52); // original p50 table is a runeless page
const p55WordFragments = wordsAt(54);
assert.equal(p53Words.length, 40);
assert.equal(p55WordFragments.length, 17);
assert.equal(p55WordFragments[0], 'ᛝ');
assert.equal(p53Words.length + p55WordFragments.length - 1, 56);
const runesIn = group => group.reduce((n,w)=>n+[...w].length,0);
const blackWords = p53Words.slice(0,28);
const redWords = p53Words.slice(28);
const completeP55Words = p55WordFragments.slice(1);
assert.equal(blackWords.length,28);
assert.equal(redWords.length+completeP55Words.length,28);
assert.equal(redWords.length,12);
assert.equal(completeP55Words.length,16);
assert.equal(runesIn(blackWords),128);
assert.equal(runesIn(redWords),51);
assert.equal(runesIn(completeP55Words),75);
assert.equal(runesIn(redWords)+runesIn(completeP55Words)+2,128);


const alphabet = grid.alphabet;
const tokens = grid.pages.flatMap(page => page.tokens);
assert.equal(tokens.length, 256);
const bytes = tokens.map(t =>
  60 * alphabet.indexOf(t[0]) + alphabet.indexOf(t[1]));
assert.ok(bytes.every(v => v >= 0 && v <= 255));

const page = n => corpus.pages.find(p => p.page === n);
const p53 = page(53).indices;
const p55 = page(55).indices;
assert.equal(p53.length, 179);
assert.deepEqual(ink.pages.find(p=>p.page===53).red_spans.map(s=>[s.start,s.length]),[[128,51]]);

assert.equal(p55.length, 76);
assert.equal(p55[0], 21); // NG: carried final glyph of a word from p54
const p55Body = p55.slice(1);
assert.equal(p55Body.length, 75);
for (const [number, runes] of [[53, 179], [55, 76]]) {
  const annotation = ink.pages.find(p => p.page === number);
  assert.equal(annotation.rune_count, runes);
  assert.deepEqual(annotation.large_punctuation, [[runes, 13, 'red']]);
}
const fullPages = corpus.pages.slice(0, 56).filter(p => p.indices.length);
const exactPairs = [];
for (let i = 0; i < fullPages.length; i++) {
  for (let j = i + 1; j < fullPages.length; j++) {
    if (fullPages[i].indices.length + fullPages[j].indices.length === 255) {
      exactPairs.push([fullPages[i].page, fullPages[j].page]);
    }
  }
}
assert.deepEqual(exactPairs, [[53, 55]]);

const outer = [], inner = [];
// Reading-order top-left start, clockwise perimeter of 32 rows x 8 columns.
for (let col = 0; col < 8; col++) outer.push(col);
for (let row = 1; row < 32; row++) outer.push(row * 8 + 7);
for (let col = 6; col >= 0; col--) outer.push(31 * 8 + col);
for (let row = 30; row >= 1; row--) outer.push(row * 8);
// Ordinary left-right, top-bottom interior of rows 1..30, columns 1..6.
for (let row = 1; row < 31; row++) {
  for (let col = 1; col < 7; col++) inner.push(row * 8 + col);
}
assert.equal(outer.length, 76);
assert.equal(inner.length, 180);
assert.equal(new Set([...outer, ...inner]).size, 256);
const zeros = bytes.flatMap((value, i) => value === 0 ? [i] : []);
assert.deepEqual(zeros, [192, 229]);
assert.equal(outer.includes(192), true);
assert.equal(inner.includes(229), true);
assert.equal(outer.includes(229), false);
assert.equal(inner.includes(192), false);

// A terminal 13-dot marker is a structural event with no GP rune index.
// Under this explicit conjectural reading, each marker occupies the unique
// 00 cell of its selected table region. This selects a cycle start immediately
// after the zero for each region; the manuscript does NOT state this rule.
const cycleAfter = (order, stop) => {
  const n = order.indexOf(stop);
  assert.ok(n >= 0);
  return [...order.slice(n + 1), ...order.slice(0, n), stop];
};
const treatments = [
  {name:'p53-inner', runes:p53, order:cycleAfter(inner, 229), stop:229},
  {name:'p55-outer', runes:p55Body, order:cycleAfter(outer, 192), stop:192}
];
const ioc = digits => {
  const counts = new Array(29).fill(0);
  for (const d of digits) counts[d]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (digits.length * (digits.length - 1));
};
const mod = v => (v % 29 + 29) % 29;
const gp = text => text.map(x => corpus.translit[x]).join('');
/** A repeated numeric byte must have a repeated rune under any secret,
 * deterministic, position-independent lookup from that byte to GP29. */
const lookupContradictions = records => {
  const seen = new Map();
  let repeats = 0, conflicts = 0;
  for (const t of records) {
    const events = [...t.runes, -1]; // -1 = 13-dot mark, distinct from GP runes
    assert.equal(events.length, t.order.length);
    for (let i = 0; i < events.length; i++) {
      const byte = bytes[t.order[i]];
      const event = events[i];
      if (seen.has(byte)) {
        repeats++;
        if (seen.get(byte) !== event) conflicts++;
      } else {
        seen.set(byte, event);
      }
    }
  }
  return {distinctBytes:seen.size,repeats,conflicts};
};
const byteLookup = {
  inner:lookupContradictions([treatments[0]]),
  outer:lookupContradictions([treatments[1]]),
  joint:lookupContradictions(treatments)
};
assert.deepEqual(byteLookup, {
  inner:{distinctBytes:127,repeats:53,conflicts:50},
  outer:{distinctBytes:68,repeats:8,conflicts:8},
  joint:{distinctBytes:161,repeats:95,conflicts:90}
});
// Picture+ink-split two 128-event potential ciphertext shares.
// No original instruction selects a numeric value for 13-dot marks.
const paired128 = {
  first:p53.slice(0,128),
  rest:[...p53.slice(128),13,...p55Body,13]
};
assert.equal(paired128.first.length,128);
assert.equal(paired128.rest.length,128);
const folds128 = [];
for (const markerValue of [0,13]) {
  const event = [...paired128.rest];
  event[51]=markerValue;
  event[127]=markerValue;
  for (const reverse of [false,true]) {
    const right = reverse?[...event].reverse():event;
    for (const sign of [-1,1]) {
      const decoded = paired128.first.map((v,i) =>
        mod(v+sign*right[i]));
      const reconstructed = decoded.map((v,i) =>
        mod(v-sign*right[i]));
      assert.deepEqual(reconstructed,paired128.first);
      folds128.push({markerValue,reverse,sign,
        decoded_ioc:ioc(decoded),first80_gp:gp(decoded.slice(0,80))});
    }
  }
}
assert.ok(folds128.every(f => f.decoded_ioc<0.04));
const solvedText = fs.readFileSync(path.join(root,
  'resources/liber-primus/lp1-plaintext-reference.txt'),'utf8');
const shaSection = solvedText.split('### 56')[1].split('### 57')[0];
const targetHash = shaSection.split('THAT HASHES TO')[1]
  .split('IT IS THE DUTY')[0].replace(/[^0-9a-f]/g,'');
assert.equal(targetHash.length,128);
const knownHexRunes = [...targetHash].map(ch=>parseInt(ch,16));
assert.ok(knownHexRunes.every(v=>v>=0 && v<16));
// Same-secret known plaintext against the two naturally split 128-event
// registers. Two physically unencoded red 13-dot stops are modelled 0/13.
// One shared secret GP29 additive pad, both algebraic directions and source
// assignments. This is exact key cancellation; no search over 29^128 pads.
const knownHashPad = [];
for (const hashRegister of ['first','second']) {
  for (const marker of [0,13]) {
    const b=[...paired128.rest];
    b[51]=marker;b[127]=marker;
    for (const keySign of [-1,1]) {
      const plain = knownHexRunes.map((hashValue,i)=>
        mod(hashValue+keySign*(hashRegister==='first'
          ?b[i]-paired128.first[i]
          :paired128.first[i]-b[i])));
      knownHashPad.push({hashRegister,marker,keySign,
        decoded_ioc:ioc(plain),first80_gp:gp(plain.slice(0,80))});
    }
  }
}
assert.equal(knownHashPad.length,8);
assert.ok(knownHashPad.every(x=>x.decoded_ioc<0.045));
// Independent historical XOR pad operation and a typed original known
// 128-ASCII-byte hash. The 32x8 table halves are 128 bytes each.
const asciiHash=Buffer.from(targetHash,'ascii');
const xorKnownHash=asciiHash.map((plain,i)=>plain^bytes[i]^bytes[i+128]);
const printableXor=[...xorKnownHash].filter(v=>v>=32&&v<=126).length;
assert.equal(printableXor,55);

const outcomes = [];
for (const t of treatments) {
  assert.equal(t.order.length, t.runes.length + 1);
  assert.equal(t.order.at(-1), t.stop);
  assert.equal(bytes[t.stop], 0);
  assert.ok(t.order.slice(0, -1).every(cell => bytes[cell] !== 0));
  const k = t.order.slice(0, -1).map(cell => bytes[cell] % 29);
  const rawIc = ioc(t.runes);
  for (const sign of [-1, 1]) {
    const decoded = t.runes.map((symbol, i) => mod(symbol + sign * k[i]));
    const reencoded = decoded.map((value, i) => mod(value - sign * k[i]));
    assert.deepEqual(reencoded, t.runes);
    outcomes.push({
      page_zone:t.name, sign, runes:t.runes.length,
      ciphertext_ioc:rawIc, decoded_ioc:ioc(decoded),
      first80_gp:gp(decoded.slice(0, 80))
    });
  }
}
assert.ok(outcomes.every(x => x.decoded_ioc < 0.05));
console.log(JSON.stringify({
  source:'LP2 original page-counts, 13-dot physical annotations, p50 table',
  independent_art_selector:'p53/p55 repeated moth, source-pixel match documented separately',
  unique_255_rune_page_pair:exactPairs,
  structured_event_counts:{p53:180,p55_body:76,combined:256},
  donor_words:{p53:40,p55_complete:16,total:56,coverage:'physical p0..p55'},
  natural_color_cut:{black_28_words_128_runes:128,
    other_28_words_126_runes_plus_2_marks:128,
    black_red_boundary:128,red_word_count:12,red_rune_count:51},
  paired_128_event_direct_folds:folds128,
  known_plaintext_p56_sha512_hex128:{
    same_pad_GP29_pair:knownHashPad,
    p50_two_half_byte_XOR: {
      total:128,ascii_printable:printableXor,
      first32_hex:xorKnownHash.subarray(0,32).toString('hex')
    }
  },
  table:{shape:[32,8],perimeter:outer.length,interior:inner.length,
    zero_positions:zeros.map(i=>({index:i,row:Math.floor(i/8),col:i%8,
      zone:outer.includes(i)?'outer':'inner'}))},
  marker_receiver:'conjectural zero-anchored cycle, NOT an authored opcode',
  any_static_byte_to_rune_lookup:byteLookup,
  tests:outcomes,
  conclusion:'No original plaintext under direct +/- table-byte GP29 pads'
}, null, 2));
