'use strict';

/**
 * SFT: the solved p57 "shed our own circumferences" instruction applied
 * literally to the complete original p54->p55 crossing word, rather than
 * treating all ten p54 page-tail symbols as p55's missing word endpoints.
 *
 * Uses original 86 GP29 values and source-authenticated 17 p55 fragments,
 * with the printed cross-page word joined. Node 22, no dependencies.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const transcription = fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-transcription.txt'),
  'utf8'
).replace(/\r\n/g, '\n');
const page = n => corpus.pages.find(x => x.page === n).indices;
const last10 = page(54).slice(-10);
const on55 = page(55);
const fragments = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(last10.length, 10);
assert.equal(on55.length, 76);
assert.equal(fragments.reduce((a,b)=>a+b, 0), 76);
assert.equal(on55[0], corpus.translit.indexOf('NG'));
assert.deepEqual(last10.map(i=>corpus.translit[i]),
  ['G', 'O', 'T', 'TH', 'X', 'E', 'EA', 'R', 'G', 'Y']);
assert(transcription.includes('ᚷᚩᛏᚦᛉᛖᛠᚱᚷᚣ/\n%\nᛝ-'),
  'The original page break must be inside the one 11-rune word');

function cutByLengths(data, lengths) {
  let offset = 0;
  return lengths.map(length=>{
    const w = data.slice(offset, offset + length);
    assert.equal(w.length, length);
    offset += length;
    return w;
  });
}
function peel(words) {
  const inner = [], outer = [];
  for(const word of words) {
    if(word.length===1) outer.push(word[0]);
    else {
      outer.push(word[0],word[word.length-1]);
      inner.push(...word.slice(1,-1));
    }
  }
  return {inner,outer};
}
function reconstruct(words, peeled) {
  let inner=0,outer=0;
  const restored=[];
  for(const word of words) {
    if(word.length===1) restored.push(peeled.outer[outer++]);
    else {
      restored.push(peeled.outer[outer++]);
      for(let t=2;t<word.length;t++)restored.push(peeled.inner[inner++]);
      restored.push(peeled.outer[outer++]);
    }
  }
  assert.equal(inner,peeled.inner.length);
  assert.equal(outer,peeled.outer.length);
  return restored;
}
function printedP55Peel() {
  const words=cutByLengths(on55,fragments);
  const p=peel(words);
  assert.equal(p.inner.length,43);
  assert.equal(p.outer.length,33);
  return {words,peeled:p};
}
const p55=printedP55Peel();
const source86=[...last10,...on55];
const joinedWords=[
  [...last10,...p55.words[0]],
  ...p55.words.slice(1)
];
assert.equal(joinedWords.length,17);
assert.equal(joinedWords[0].length,11);
const canonical = peel(joinedWords);
assert.equal(canonical.inner.length,52);
assert.equal(canonical.outer.length,34);
assert.deepEqual(reconstruct(joinedWords,canonical),source86);

const B=[...last10,...p55.peeled.outer];
const A=p55.peeled.inner;
assert.equal(A.length,43);
assert.equal(B.length,43);
assert.equal(B.length+A.length,86);
// The *nine* symbols that shift group when the seam's complete word
// is respected are exactly original p54 tail offsets 1 through 9.
assert.deepEqual(canonical.inner.slice(0,9),last10.slice(1));
assert.deepEqual(canonical.outer.slice(0,2),[last10[0],on55[0]]);

function wordValues(word) {
  return [...word].map(r=>corpus.runes.indexOf(r));
}
const p57=transcription.slice(transcription.lastIndexOf('ᛈᚪᚱᚪᛒᛚᛖ.'));
const source57=p57.replace(/\/\r?\n/g,'').replace(/[\r\n§]/g,'').trim();
const words57=source57.split(/[.\-]/).filter(Boolean).map(wordValues);
assert.equal(words57.length,20);
assert.deepEqual(words57.flat(),page(57));
const pos57=peel(words57);
const body57=peel(words57.slice(1));
assert.equal(pos57.inner.length,55);
assert.equal(pos57.outer.length,40);
assert.equal(body57.inner.length,50);
assert.equal(body57.outer.length,38);
assert.deepEqual(reconstruct(words57,pos57),page(57));

console.log(JSON.stringify({
  source:'original physical 71.jpg->72.jpg and 74.jpg',
  source86Count:source86.length,
  crossingWord:joinedWords[0].map(i=>corpus.translit[i]).join('-'),
  completeWords:joinedWords.length,
  strictOriginal86:{interior:canonical.inner.length,exterior:canonical.outer.length},
  pageLocalP55:{interior:A.length,exterior:p55.peeled.outer.length},
  proposedBalancedTapes:{A:A.length,B:B.length},
  neededInteriorToShellReclassification:last10.length-1,
  reclassifiedActualInterior:last10.slice(1).map(i=>corpus.translit[i]).join('-'),
  genuineSolvedP57:{sourceLength:page(57).length,allWordInterior:pos57.inner.length,
    blackBodyInterior:body57.inner.length,allWordExterior:pos57.outer.length},
  exact86Reconstruction:'PASS',
  exact95SolvedReconstruction:'PASS'
},null,2));
