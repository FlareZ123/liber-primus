'use strict';
/**
 * LP2 p51 original-cipher doublet ordinal and table receiver.
 * Source-exact single runnable test: node sims/lp2_p51_doublet_ordinal_81_sft.cjs
 * No external dependencies. Original 86 same-page equality events are enumerated
 * without fitting a cipher, and all 55 rune-page first words are retained.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const text = read('resources/liber-primus/lp2-transcription.txt');
const physical = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const rawPages = text.split('%').filter(t => /[ᚠ-ᛡ]/u.test(t));
const runeIndex = new Map(corpus.runes.map((g, i) => [g, i]));
const rx = new RegExp('[' + corpus.runes.join('') + ']+', 'gu');
const words = text.split('%').slice(0, 55).join('%')
  .replace(/\/\r?\n/g, '').replace(/[\r\n%]/g, '').match(rx) || [];
assert.equal(rawPages.length, 57);
assert.equal(physical.length, 55);
assert.equal(words.length, 2896);
const gp = w => Array.from(w, g => {
  const i = runeIndex.get(g);
  assert.notEqual(i, undefined, 'unknown rune');
  return i;
});
const starts = [];
let offset = 0;
for (const w of words) {starts.push(offset); offset += w.length;}
assert.equal(offset, 12956);
function wordAt(globalRune) {
  let lo = 0, hi = starts.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if (starts[mid] <= globalRune) lo = mid + 1;
    else hi = mid - 1;
  }
  assert.ok(hi >= 0);
  return words[hi];
}
const pageOpeners = [];
const events = [];
let global = 0, order = 0;
for (const p of physical) {
  const local = rawPages[order++];
  const opener = (local.match(rx) || [])[0];
  assert.ok(opener);
  const ids = gp(opener);
  const gpPrime = ids.reduce((sum, i) => sum + corpus.prime[i], 0);
  const preceding = events.length;
  pageOpeners.push({page:p.page,preceding,opener:ids.map(i => corpus.translit[i]).join(''),
    prime:gpPrime,firstDoublet:p.indices[0] === p.indices[1]});
  for (let i = 1; i < p.indices.length; i++) {
    if (p.indices[i] !== p.indices[i-1]) continue;
    const pos = global + i - 1;
    const w = wordAt(pos);
    events.push({rank:events.length,page:p.page,pos,word:gp(w).map(x => corpus.translit[x]).join(''),
      prime:gp(w).reduce((s, x) => s + corpus.prime[x], 0),
      firstInPage:i === 1});
  }
  global += p.indices.length;
}
assert.equal(global, 12956);
assert.equal(events.length, 86);
const headDoubletPages = pageOpeners.filter(p => p.firstDoublet);
const exactEvent = events.filter(e => e.rank === e.prime);
const exactPage = pageOpeners.filter(e => e.preceding === e.prime);
assert.deepEqual(headDoubletPages.map(p => p.page), [51]);
assert.deepEqual(exactEvent.map(p => [p.rank, p.page, p.word, p.prime]),
  [[81,51,'WWP',81]]);
assert.deepEqual(exactPage.map(p => [p.page, p.opener, p.prime, p.preceding]),
  [[51,'WWP',81,81]]);
const p51 = events.find(e => e.page === 51);
assert.equal(p51.rank, 81);
assert.equal(p51.pos, 12114);
assert.equal(p51.firstInPage, true);

const f = grid.bytes;
let state = 81;
for (let i = 0; i < 19; i++) state = f[state];
assert.equal(state, 32);
state = f[state];
assert.equal(state, 115);
assert.equal(grid.pages[1].tokens[1], '0w'); // zero-based global cell 81
assert.equal(f[81], 58);
assert.equal(grid.pages[1].bytes[1],58);

function xorshift(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}
function shuffle(a, random) {
  for (let i=a.length-1;i>0;i--) {
    const j=Math.floor(random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
}
const N = 200000;
const random = xorshift(0x81c1cada);
const eventPrimeValues = events.map(e => e.prime);
const pagePrimeValues = pageOpeners.map(e=>e.prime);
const simulated = {anyEventRankHit:0,observedP51EventRankHit:0,anyPageOpenerRankHit:0,observedP51PageRankHit:0};
for (let r=0;r<N;r++){
  const candidateEvents=eventPrimeValues.slice();
  shuffle(candidateEvents, random);
  let any=false;
  for(let i=0;i<86;i++) if(candidateEvents[i]===i) {any=true;break;}
  simulated.anyEventRankHit+=Number(any);
  simulated.observedP51EventRankHit+=Number(candidateEvents[81]===81);
  const candidateOpener=pagePrimeValues.slice();
  shuffle(candidateOpener, random);
  let anyPage=false;
  for (let i=0;i<55;i++) if(candidateOpener[i]===pageOpeners[i].preceding) {anyPage=true;break;}
  simulated.anyPageOpenerRankHit+=Number(anyPage);
  simulated.observedP51PageRankHit+=Number(candidateOpener[50]===81);
}
console.log(JSON.stringify({
  sources: {ciphertextRunes:global,printedWords:words.length,adjacentEqualEvents:events.length,
    firstSameRunePageCount:headDoubletPages.length,firstSameRunePages:headDoubletPages,
    allEventIndexPrimeMatches:exactEvent,allPageOpeningPrimePrecedingMatches:exactPage},
  p51: {eventOrdinalZeroBased:p51.rank,eventOrdinalOneBased:p51.rank+1,
    globalZeroBasedEventPosition:p51.pos,firstWordPrimeSum:p51.prime,
    tableAddress:p51.rank,tableToken:grid.pages[1].tokens[1],firstSuccessor:f[81],
    afterWPrime19Steps:32,afterOwn20WordsSteps:115},
  conditionalMultisetNull:{N,seed:0x81c1cada,simulated,
    rates:Object.fromEntries(Object.entries(simulated).map(([k,v])=>[k,v/N]))},
  caution:'All event-rank statistics are discovered post hoc; the event words, page openers and table are not independent random processes. No plaintext/key/inverse recovered.'
},null,2));
