'use strict';
/**
 * Original-input conditional WWP -> 0w/58 -> p57 PARABLE
 * -> strip first and last WWP runes -> W19 -> p32 tree navigation.
 * Run: node sims/lp2_p51_wwp_p57_p32_conditional_handoff_sft.cjs
 *
 * This is an exact clue-chain test, not a decryption. Conditions are explicitly
 * enumerated so a human can reject any unauthenticated input convention.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root,f), 'utf8');
const book = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const pages = read('resources/liber-primus/lp2-transcription.txt').split('%')
  .filter(s => /[ᚠ-ᛡ]/u.test(s));
const ix = new Map(book.runes.map((r,i) => [r,i]));
const runePattern = /[ᚠ-ᛡ]+/gu;
/** @param {string} s @returns {number[][]} */
function words(s) {
  return s.replace(/[\r\n/]/g, '').split(/[-.]/)
    .map(part => (part.match(runePattern) || []).join(''))
    .filter(Boolean).map(w => [...w].map(r => {
      const index = ix.get(r);
      assert.notEqual(index,undefined);
      return index;
    }));
}
const p51 = words(pages[50]);
const p57 = words(pages[56]);
const roman = word => word.map(x => book.translit[x]).join('');
assert.equal(book.pages.length, 58);
assert.equal(p51.length, 20);
assert.equal(p57.length, 20);
assert.deepEqual(p51[0], [7,7,13]);
assert.equal(roman(p51[0]), 'WWP');
const sumPrime = w => w.reduce((s,i)=>s+book.prime[i],0);
const address = sumPrime(p51[0]);
assert.equal(address,81);
const tableTokens=grid.pages.flatMap(p=>p.tokens);
const token = tableTokens[address];
assert.equal(token,'0w');
assert.equal(grid.alphabet.indexOf('w'),58);
const value = grid.bytes[address];
assert.equal(value,58);
const possiblePhysicalPage = value - 1; // unauthenticated 1-based page-address reading
assert.equal(possiblePhysicalPage,57);
assert.equal(book.pages[57].status,'solved');
const sentence = p57.map(roman).join(' ');
assert.ok(sentence.includes('SHED OUR OWN CIRCUMFERENCES'));
const interior=p51[0].slice(1,-1);
assert.deepEqual(interior,[7]);
assert.equal(roman(interior),'W');
const steps=sumPrime(interior);
assert.equal(steps,19);
let state=address;
const route=[state];
for(let i=0;i<steps;i++){state=grid.bytes[state];route.push(state);}
assert.equal(state,32);
assert.equal(book.pages[32].runic_count,121);
state=grid.bytes[state];
assert.equal(state,115);
const identicalGridTokens = tableTokens.flatMap((t,i)=>t===token?[i]:[]);
assert.deepEqual(identicalGridTokens,[81,220]);
assert.equal(grid.bytes[220],58);
// Both 0w preimages have the identical 19-step output.
let second=220;
for(let i=0;i<19;i++)second=grid.bytes[second];
assert.equal(second,32);
console.log(JSON.stringify({
  source:{lp2PhysicalPages:58,p51:'original 68.jpg',p57:'original 74.jpg',
    p32:'original 49.jpg',p51First:roman(p51[0]),
    p51Words:p51.length,p57Words:p57.length},
  conditionalNavigation:{
    sourceOpeningPrime:address,originalGridCellIndex:address,originalPrintedToken:token,
    base60Value:value,oneBasedPage58IfAdopted:'physical p57',
    p57PrintedClue:'SHED OUR OWN CIRCUMFERENCES',
    firstP51WordAfterShavingOuterRunes:roman(interior),
    sourceGPprimeOfInnerRune:steps,
    exactWalkT19:route,originalDestinationPhysicalPage32Runes:121,
    cycleEntryT20:grid.bytes[state],bothPrinted0wCellIndices:identicalGridTokens},
  limitations:[
    'Original p50 artifact does not explicitly choose radix60 rather than59.',
    'Original p50 grid does not explicitly select a byte-as-one-based-page navigation mode.',
    'P57 parable describes instars: applying SHED to p51 word WWP is a hypothesis.',
    'No original instruction specifies the 19-fold successor iteration or a p32 decryption.',
    'The p32 tree association is visual, not an independently predicted ciphertext inverse.',
    'No plaintext recovered.'
  ]
}, null,2));
