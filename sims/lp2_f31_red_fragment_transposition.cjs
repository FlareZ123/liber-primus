"use strict";
/**
 * Fixed F31 reordering of the 225 red runes, grouped by the 31 thirteen-dot
 * marks into 32 fragments. This tests the direct transposition interpretation
 * only: marker labels 13^j mod31 for red marks, 0 for the black mark, and 31
 * for the leading fragment; concatenate fragments in ascending label order.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { train, encode } = require('./grid_keyskip_viterbi.cjs');
const { f31Mapping } = require('./lp2_f31_fragment_key_inverse.cjs');

const ROOT = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const { rowForFragment } = f31Mapping();

function extractRedFragments() {
  const events = [];
  for (const page of ink.pages) {
    const p = corpus.pages[page.page];
    for (const span of page.red_spans || []) {
      for (let i = 0; i < span.length; i++) {
        assert.equal(corpus.runes[p.indices[span.start + i]], [...span.runes][i]);
        events.push({ page: page.page, offset: span.start + i, kind: 1,
          rune: p.indices[span.start + i] });
      }
    }
    for (const mark of page.large_punctuation || []) {
      if (mark[1] === 13) events.push({ page: page.page, offset: mark[0],
        kind: 0, ink: mark[2] });
    }
  }
  events.sort((a, b) => a.page - b.page || a.offset - b.offset || a.kind - b.kind);
  const fragments = [];
  let current = [];
  for (const event of events) {
    if (event.kind === 0) {
      fragments.push(current);
      current = [];
    } else {
      current.push(event.rune);
    }
  }
  fragments.push(current);
  assert.equal(fragments.length, 32);
  assert.equal(fragments.reduce((n, f) => n + f.length, 0), 225);
  assert.deepEqual(fragments.map(f => f.length),
    [13,0,16,0,3,0,11,0,0,14,12,0,9,11,0,16,0,19,0,10,0,8,0,3,0,59,9,0,5,0,7,0]);
  return fragments;
}
const fragments = extractRedFragments();
const fragmentForLabel = new Array(32);
for (let f = 0; f < 32; f++) fragmentForLabel[rowForFragment[f]] = f;
assert.deepEqual(fragmentForLabel.slice().sort((a,b)=>a-b),
  Array.from({length:32},(_,i)=>i));
const ordered = fragmentForLabel.flatMap(f => fragments[f]);
assert.equal(ordered.length, 225);
const chronological = fragments.flat();

const shakespeare = read('resources/control/shakespeare_first300k.txt');
const lm = train(shakespeare.slice(0, 200000));
function score(runes) {
  if (!runes.length) return -Infinity;
  let s = lm.unigram[runes[0]];
  if (runes.length > 1) s += lm.bigram[runes[0] * 29 + runes[1]];
  for (let i = 2; i < runes.length; i++)
    s += lm.trigram[(runes[i-2] * 29 + runes[i-1]) * 29 + runes[i]];
  return s / runes.length;
}
function ioc(runes) {
  const counts = new Uint32Array(29);
  for (const x of runes) counts[x]++;
  let sum=0;
  for (const n of counts) sum += n*(n-1);
  return 29*sum/(runes.length*(runes.length-1));
}
const output = {
  classification: 'Single F31 marker-labelled red-fragment transposition; not a decryption claim',
  source: {
    markers: 31, fragments: 32, redRunes: 225,
    rowForFragment, fragmentForLabel,
    chronologicalFragmentLengths: fragments.map(f=>f.length),
    labelOrderedFragmentLengths: fragmentForLabel.map(f=>fragments[f].length)
  },
  chronological: {
    scoreEnglishGP: score(chronological), normalizedIoC: ioc(chronological),
    transliteration: chronological.map(x=>corpus.translit[x]).join('')
  },
  F31Ordered: {
    scoreEnglishGP: score(ordered), normalizedIoC: ioc(ordered),
    transliteration: ordered.map(x=>corpus.translit[x]).join('')
  },
  positiveControl: (() => {
    const plant = encode(shakespeare.slice(205000)).slice(0,225);
    const byFragment = [];
    let offset=0;
    for (const f of fragments) { byFragment.push(plant.slice(offset,offset+f.length)); offset+=f.length; }
    const recovered = fragmentForLabel.map(label=>byFragment[label]).flat();
    const expected = plant;
    return { runes: plant.length, exactInverse: recovered.length===expected.length &&
      recovered.every((v,i)=>v===expected[i]) };
  })(),
  status: 'Only the one source-fixed ordering is tested; no permutation search'
};
process.stdout.write(JSON.stringify(output,null,2)+'\n');
module.exports = { extractRedFragments };
