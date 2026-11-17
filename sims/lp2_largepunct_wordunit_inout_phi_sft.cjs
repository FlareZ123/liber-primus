#!/usr/bin/env node
'use strict';

/**
 * Original LP2 large-punctuation word-unit transposition followed by the
 * authentic p56 prime-totient / plaintext-F-transparent cipher.
 *
 * A source-motivated finite candidate: clear p57's "circumferences" may
 * suggest reading complete printed words from exterior pairs toward the
 * center (or the exact inverse convention). The 36 image-annotated large
 * dot marks fix section boundaries before original ciphertext is scored.
 *
 * No keys, padding, tuned word permutation, learned language parameters,
 * or new plaintext are asserted. Run: node sims/lp2_largepunct_wordunit_inout_phi_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('lp2-corpus.json'));
const transcription = read('lp2-transcription.txt');
const ink = JSON.parse(read('lp2-ink-annotations.json'));
const runeToIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
assert.equal(corpus.runes.length, 29);

const bases = [];
let total = 0;
for (const page of corpus.pages) {
  assert.equal(page.page, bases.length);
  bases.push(total);
  total += page.runic_count;
}
assert.equal(total, 13136);
assert.equal(bases[56], 12956);

const words = [];
const indices = [];
let active = [], begin = -1, runeOffset = 0;
/** @param {number} charEnd */
function flush(charEnd) {
  if (!active.length) return;
  words.push({
    begin: runeOffset - active.length,
    end: runeOffset,
    charBegin: begin,
    charEnd,
    text: transcription.slice(begin, charEnd),
    indices: active.slice()
  });
  begin = -1;
  active = [];
}
for (let charIndex = 0; charIndex < transcription.length; charIndex++) {
  const ch = transcription[charIndex];
  if (runeToIndex.has(ch)) {
    if (!active.length) begin = charIndex;
    const i = runeToIndex.get(ch);
    active.push(i);
    indices.push(i);
    runeOffset++;
  } else if ('-.,&$'.includes(ch)) {
    flush(charIndex);
  }
}
flush(transcription.length);
assert.equal(indices.length, total);
assert.equal(words.length, 2941);
assert.equal(words.filter(w => w.begin < bases[56]).length, 2896);
assert.equal(words.filter(w => w.begin < bases[56] && w.text.includes('%')).length, 32);
for (const page of corpus.pages) {
  assert.deepEqual(indices.slice(bases[page.page], bases[page.page] +
    page.runic_count), page.indices, 'Canonical original page ' + page.page);
}
const frame = [];
let cursor = 0;
for (const word of words) {
  frame.push(transcription.slice(cursor, word.charBegin));
  cursor = word.charEnd;
}
const trailing = transcription.slice(cursor);
/** @param {Array<{text:string}>} arranged */
function render(arranged) {
  assert.equal(arranged.length, frame.length);
  return arranged.map((word, i) => frame[i] + word.text).join('') + trailing;
}
assert.equal(render(words), transcription);

const marks = ink.pages.flatMap(page => (page.large_punctuation || [])
  .map(([offset, count, color]) => ({
    offset: bases[page.page] + offset, count, color
  })));
assert.equal(marks.length, 36);
assert.deepEqual([10,13,23].map(n => marks.filter(m => m.count === n).length),
  [4,31,1]);
for (const mark of marks) assert.ok(!words.some(w => w.begin < mark.offset &&
  mark.offset < w.end), 'Large mark must separate complete source words');
const boundaries = [...new Set([0, total, ...marks.map(m => m.offset)])]
  .sort((a,b) => a-b);
const blocks = [];
for (let i = 1; i < boundaries.length; i++) {
  const a = boundaries[i-1], b = boundaries[i];
  const members = words.filter(w => w.begin >= a && w.end <= b);
  if (members.length) blocks.push({a,b,words:members});
}
assert.equal(blocks.length, 34);
assert.deepEqual(blocks.map(b => b.words.length).filter(n => n===1).length, 3);

/**
 * Interleave first and last word, working toward the center.
 * @template T
 * @param {T[]} a
 * @returns {T[]}
 */
function outsideIn(a) {
  const b = [];
  for (let l=0,h=a.length-1; l<=h; l++,h--) {
    b.push(a[l]);
    if (l!==h) b.push(a[h]);
  }
  return b;
}
/**
 * Exact inverse permutation for complete word objects.
 * @template T
 * @param {T[]} a
 * @returns {T[]}
 */
function insideOut(a) {
  const b = Array(a.length);
  let i=0;
  for (let l=0,h=a.length-1; l<=h; l++,h--) {
    b[l]=a[i++];
    if (l!==h) b[h]=a[i++];
  }
  return b;
}
for (const block of blocks) {
  assert.deepEqual(insideOut(outsideIn(block.words)), block.words);
  assert.deepEqual(outsideIn(insideOut(block.words)), block.words);
}
for (const op of [outsideIn,insideOut]) {
  const changed = blocks.flatMap(b => op(b.words));
  const restored = blocks.flatMap(b => (op===outsideIn ?
    insideOut : outsideIn)(op(b.words)));
  assert.equal(changed.length, words.length);
  assert.equal(restored.length, words.length);
  assert.equal(render(restored), transcription,
    'Inverse restores all punctuation, original JPEG pagination and carries');
}
const flatten = group => group.flatMap(w => w.indices);
const mod29 = x => ((x % 29) + 29) % 29;

/** @param {number} n */
function primeTotients(n) {
  const primes = [], composite = new Uint8Array(200000);
  for (let p=2;p<composite.length && primes.length<n;p++) {
    if (composite[p]) continue;
    primes.push((p-1)%29);
    if (p*p<composite.length) for (let z=p*p;z<composite.length;z+=p)
      composite[z]=1;
  }
  assert.equal(primes.length,n);
  return primes;
}
const key = primeTotients(9000);
/**
 * Exact reachability DP: a ciphertext-F can be transparent literal F or a
 * key-consumed collision; a non-F ciphertext must decode as non-F.
 * @param {number[]} cipher
 * @param {number} start
 */
function furthest(cipher,start) {
  let active=[0];
  for (let i=0;i<cipher.length;i++) {
    const next=[], seen=new Uint8Array(i+2);
    for (const used of active) {
      if (cipher[i]===0 && !seen[used]) {
        next.push(used); seen[used]=1;
      }
      if (mod29(cipher[i]-key[start+used])!==0 && !seen[used+1]) {
        next.push(used+1); seen[used+1]=1;
      }
    }
    if (!next.length) return i;
    active=next;
  }
  return cipher.length;
}
/** @param {number[]} plain */
function encrypt(plain) {
  let used=0;
  return plain.map(p => p===0 ? 0 : mod29(p+key[used++]));
}
const tokens = corpus.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} original */
function gpWord(original) {
  const s=original.toUpperCase().replace(/QU/g,'CW')
    .replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S')
    .replace(/ING/g,'NG').replace(/IO/g,'IA');
  const out=[];
  for(let i=0;i<s.length;) {
    const match=tokens.find(t=>s.startsWith(t.s,i));
    assert.ok(match,'Solved p56 GP rune');
    out.push(match.i);
    i+=match.s.length;
  }
  return out;
}
const p56Known=('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE '+
  'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE')
  .split(' ').flatMap(gpWord);
assert.equal(p56Known.length,85);
assert.deepEqual(encrypt(p56Known),corpus.pages[56].indices);
assert.equal(furthest(corpus.pages[56].indices,0),85);
const p57Words = words.filter(w => w.begin>=bases[57]);
assert.equal(p57Words.length,20);
assert.equal(flatten(p57Words).length,95);
assert.deepEqual(insideOut(outsideIn(p57Words)),p57Words);
const p56Words = words.filter(w => w.begin>=bases[56] && w.end<=bases[57]);
assert.equal(flatten(p56Words).length,85);
assert.deepEqual(insideOut(outsideIn(p56Words)),p56Words);

const chapters = [[0,2],[3,7],[8,14],[15,22],[23,26],
                  [27,32],[33,39],[40,53],[54,55]];
const expected = {
  'outside-in': {
    atZero:[46,5,10,10,0,45,12,112,161],
    max:[643,557,286,429,472,656,548,554,308],
    survivors:[[],[],[],[],[],[],[],[],[545,547,2983]]
  },
  'inside-out': {
    atZero:[29,5,6,10,0,29,132,23,65],
    max:[591,571,604,759,502,420,501,765,308],
    survivors:[[],[],[],[],[],[],[],[],[1459,4522,4523]]
  }
};
const results = [];
for (const [chapterIndex,[first,last]] of chapters.entries()) {
  const a=bases[first],b=bases[last+1];
  const sectionBlocks=blocks.filter(z=>z.a>=a && z.b<=b);
  const untouched=words.filter(w=>w.begin>=a&&w.end<=b);
  assert.deepEqual(sectionBlocks.flatMap(z=>z.words),untouched);
  const row={pages:'p'+first+'–'+last,runes:flatten(untouched).length,
    printedWords:untouched.length,largeMarkBlocks:sectionBlocks.length};
  for (const [name,op] of [['outside-in',outsideIn],
                           ['inside-out',insideOut]]) {
    const changed=flatten(sectionBlocks.flatMap(z=>op(z.words)));
    assert.equal(changed.length,row.runes);
    const maxStarts=5000;
    let farthest=0, survivors=[];
    for (let start=0;start<maxStarts;start++) {
      const reached=furthest(changed,start);
      farthest=Math.max(farthest,reached);
      if (reached===changed.length) survivors.push(start);
    }
    const atZero=furthest(changed,0);
    assert.equal(atZero,expected[name].atZero[chapterIndex]);
    assert.equal(farthest,expected[name].max[chapterIndex]);
    assert.deepEqual(survivors,expected[name].survivors[chapterIndex]);
    row[name]={firstImpossibleAtPrime2:atZero,
      furthestAmong5000:farthest,survivingStarts:survivors};
  }
  results.push(row);
}
assert.equal(results.reduce((sum,row)=>sum+row.runes,0),12956);
console.log(JSON.stringify({
  input:'Canonical original LP2 corpus/transcription plus physical ink mark file',
  sourceRunes:13136,unknownRunes:12956,printedWords:words.length,
  unknownWords:2896,crossPageCarriedWords:32,
  physicalLargeMarks:36,nonemptyMarkedWordBlocks:34,
  sourceControl:'original p56 85/85 prime/F cipher; p57 95/95 clear runes',
  reversibleWordPermutation:'Both directions restore full original transcript with pagination and punctuation',
  candidate:'Large-dot-mark-delimited complete-word circumference order + authentic p56 prime/F cipher',
  testedPrimeStarts:'0..4999 at each original nine-chapter beginning',
  chapters:results,
  decision:'Neither word-pair order gives a legal complete p56-family inverse in the first eight unknown chapters. Three legal starts per order on p54-55 do not identify a key or plaintext. This is a bounded candidate rejection.'
},null,2));
