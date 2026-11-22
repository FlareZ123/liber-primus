'use strict';

/**
 * Bounded candidate "WORDS are the map; NUMBERS the direction" consumer:
 * Source-selected p0 black249 -> p50 table -> one original printed word
 * -> GP0 sum -> p50 table -> ..., until the first repeated table address.
 *
 * This is a canonical, fully typed original-word-map experiment; it uses
 * no guessed plaintext, trained cipher, keys, or output-dependent parameters.
 * The original transcript has page 50 as runeless, as in lp2_word_pages.cjs.
 * Windows Node22:
 * node sims/lp2_p0_count249_p50_word_gp0_chase_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseLP2Words} = require('./lp2_word_pages.cjs');
const root = path.resolve(__dirname,'..');
const read = pathName => fs.readFileSync(path.join(root,pathName),'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const words = parseLP2Words(read('resources/liber-primus/lp2-transcription.txt')).words;
const runeMap = new Map(corpus.runes.map((r,i)=>[r,i]));
const firstChapterWords = parseLP2Words(
  read('resources/liber-primus/lp2-transcription.txt'),3).words;
const p0 = corpus.pages[0].indices;
const p0Red=13;
const T=grid.bytes;
assert.equal(p0.length-p0Red,249);
assert.equal(firstChapterWords.length,158);
assert.equal(words.length,2896);
assert.equal(T[249],158);
assert.equal(T[158],249);

/** @param {{runes:string}} word @returns {number} */
function GP0(word) {
  return [...word.runes].reduce((sum,r)=>sum+runeMap.get(r),0);
}
assert.equal(GP0(firstChapterWords.at(-1)),104);
assert.equal(GP0(words[157]),104);

/**
 * @param {number} firstAddress
 * @param {0|1} origin One-based or zero-based p50 numeric-to-word convention
 * @returns {{firstAddress:number,wordOrigin:number,precycle:number,cycle:number,entry:number|null,edges:Array<{address:number,word:number,GP0:number,page:number,wordLength:number}>}}
 */
function chase(firstAddress,origin) {
  const visited=new Map();
  const edges=[];
  let address=firstAddress;
  while(address>=0&&address<T.length&&!visited.has(address)) {
    visited.set(address,edges.length);
    const printedNumber=T[address];
    const w=words[printedNumber-origin];
    if(!w)break;
    const wordNumber=printedNumber-origin+1;
    const next=GP0(w);
    edges.push({address,word:wordNumber,GP0:next,
      page:w.startPage>=50?w.startPage+1:w.startPage,wordLength:w.length});
    address=next;
  }
  const precycle=visited.get(address);
  return {firstAddress,wordOrigin:origin,
    precycle:precycle??-1,cycle:precycle===undefined?0:edges.length-precycle,
    entry:precycle===undefined?null:address,edges};
}

const oneBased=chase(249,1);
const zeroBased=chase(249,0);
assert.deepEqual(oneBased.edges.slice(0,5).map(x=>[x.address,x.word,x.GP0]),[
  [249,158,104],[104,122,1],[1,231,109],[109,184,39],[39,5,14]]);
assert.equal(oneBased.edges.length,25);
assert.equal(oneBased.precycle,11);
assert.equal(oneBased.cycle,14);
assert.equal(oneBased.entry,63);
assert.equal(zeroBased.edges.length,9);
assert.equal(zeroBased.precycle,5);
assert.equal(zeroBased.cycle,4);
assert.equal(zeroBased.entry,83);

// A simple GP0 lookup never decrypts the original words: all visited values
// are structural pointers to existing unreadable ciphertext word strings.
const selectedOneBasedGP=oneBased.edges.map(step=>GP0(words[step.word-1]));
assert.deepEqual(selectedOneBasedGP,oneBased.edges.map(step=>step.GP0));

console.log(JSON.stringify({
  status:'source-typed count249 -> T249=158 -> word158 GP0=104 -> T104=122 word-pointer route; no plaintext',
  firstChapterOriginalWordCount:158,
  terminalWord158OriginalGP0:104,
  oneBased,zeroBased,
  conclusion:'one-based source pointer enters a 14-cycle after 11 steps; printed rune words remain encrypted, and source lacks a rule selecting this chase/stop/readout'
},null,2));
