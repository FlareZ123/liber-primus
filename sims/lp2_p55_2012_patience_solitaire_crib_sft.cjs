'use strict';

/**
 * One frozen original-source curiosity, NOT an authenticated cipher handoff:
 * the 2012 signed 'Patience is a virtue' phrase and its identical LP2 p55 emblem
 * select a candidate named after the patience card game: Schneier Solitaire.
 * Exact 1999 deck/key/stream; ONLY changed layer is GP29 addition instead of
 * the standard Latin 26 alphabet. Full phrase deck key is literal A-Z.
 *
 * Run from repository root on Windows Node22:
 * node sims/lp2_p55_2012_patience_solitaire_crib_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources/liber-primus/lp2-corpus.json'),'utf8'));
const p55=corpus.pages.find(x=>x.page===55).indices;
const p57=corpus.pages.find(x=>x.page===57).indices;
assert.equal(p55.length,76);
assert.equal(p57.length,95);

/** @param {number[]} deck @param {number} joker @returns {void} */
function moveOne(deck,joker){
  const position=deck.indexOf(joker);
  assert(position>=0);
  deck.splice(position,1);
  deck.splice(position===53?1:position+1,0,joker);
}
/** @param {number[]} deck @returns {number[]} */
function tripleCut(deck){
  let first=deck.indexOf(53),second=deck.indexOf(54);
  if(first>second)[first,second]=[second,first];
  return [...deck.slice(second+1),...deck.slice(first,second+1),...deck.slice(0,first)];
}
/** @param {number[]} deck @param {number} length @returns {number[]} */
function countCut(deck,length){
  assert(length>=0&&length<=53);
  return [...deck.slice(length,53),...deck.slice(0,length),deck[53]];
}
/**
 * Returns the un-reduced card value 1..54 (jokers 53,54).
 * @param {{deck:number[]}} state @returns {number}
 */
function cycle(state){
  moveOne(state.deck,53);
  moveOne(state.deck,54);
  moveOne(state.deck,54);
  state.deck=tripleCut(state.deck);
  state.deck=countCut(state.deck,Math.min(state.deck[53],53));
  const output=state.deck[Math.min(state.deck[0],53)];
  assert.equal(state.deck.length,54);
  return output;
}
/**
 * Standard keyed-deck method #3 from the 1999 published specification.
 * Output card 27..52 maps to 1..26. Jokers are discarded.
 * @param {number} n @param {string} phrase @returns {{letters:number[],cards:number[]}}
 */
function solitaire(n,phrase){
  const state={deck:Array.from({length:54},(_,i)=>i+1)};
  for(const ch of phrase){
    assert(/^[A-Z]$/.test(ch));
    cycle(state);
    state.deck=countCut(state.deck,ch.charCodeAt(0)-64);
  }
  const letters=[],cards=[];
  while(letters.length<n){
    const card=cycle(state);
    cards.push(card);
    if(card<=52)letters.push(card>26?card-26:card);
  }
  return {letters,cards};
}
const unkeyed=solitaire(10,'');
assert.deepEqual(unkeyed.cards,[4,49,10,54,24,8,51,44,6,4,33]);
const foo=solitaire(15,'FOO');
assert.deepEqual(foo.cards,[8,19,7,25,20,53,9,8,22,32,43,5,26,17,53,38,48]);
const fooCipher=foo.letters.map(v=>'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[v%26]).join('');
assert.equal(fooCipher,'ITHZUJIWGRFARMW');

/** @param {number} n @returns {number} */
const mod29=n=>((n%29)+29)%29;
/** @param {number[]} runes @returns {number} */
function ioc(runes){
  const h=Array(29).fill(0);
  for(const rune of runes)h[rune]++;
  return h.reduce((sum,n)=>sum+n*(n-1),0)/(runes.length*(runes.length-1));
}
const phrase='PATIENCEISAVIRTUE';
const keystream=solitaire(p55.length,phrase).letters;
assert.deepEqual(keystream.slice(0,20),[11,1,4,6,7,15,22,22,10,9,13,17,18,6,23,23,1,17,3,15]);
// Explicit GP29 adaptation: the official stream remains 1..26, but the
// manuscript uses a 29-rune index alphabet. No F skip is assumed.
const decoded=p55.map((c,i)=>mod29(c-keystream[i]));
assert.deepEqual(decoded.map((p,i)=>mod29(p+keystream[i])),p55);
const plainPlant=p57.slice(0,76);
const cipherPlant=plainPlant.map((p,i)=>mod29(p+keystream[i]));
assert.deepEqual(cipherPlant.map((c,i)=>mod29(c-keystream[i])),plainPlant);
const wrong=solitaire(76,'PATIENCE').letters;
const wrongDecoded=cipherPlant.map((c,i)=>mod29(c-wrong[i]));
assert(wrongDecoded.some((p,i)=>p!==plainPlant[i]));
const latin=decoded.map(v=>corpus.translit[v]).join(' ');
console.log(JSON.stringify({
  status:'PASS: official 1999 Solitaire samples reproduced, first-party phrase key does not recover original p55 prose',
  source:'2012 Cicada signed PATIENCE IS A VIRTUE + 2012 cicada logo reused on LP2 p55',
  mode:'unmodified Solitaire 1..26 key letters, GP29 additive lift, page55 local rune0, unskipped F',
  phrase,unknownPage55Length:76,first20Key:keystream.slice(0,20),
  decodedLatinRunes:latin,decodedIoc:ioc(decoded),authenticP57First76Ioc:ioc(plainPlant),
  originalForwardExact:true,nativePlantExact:76,wrongPhraseNativePlantExact:false,
  limitation:'No source selects Solitaire over ordinary waiting, a key deck over other keys, or the GP29 lift; no authentic p55 plaintext or key.'
},null,2));
