'use strict';
const assert = require('node:assert/strict');

// Frozen source: Blake, The Marriage of Heaven and Hell, plate 27, Chorus.
// ASU MHH27/E45 and Jack Lynch's transcription preserve "letchery" and "every thing".
const source = "Let the Priests of the Raven of dawn, no longer in deadly black, with hoarse note curse the sons of joy. Nor his accepted brethren whom, tyrant, he calls free; lay the bound or build the roof. Nor pale religious letchery call that virginity, that wishes but acts not! For every thing that lives is Holy";

// Frozen author output: the quoted Chorus in the clear-signed 2012 Cicada MIDI email.
const signed = "Let the Priests of the Raven of dawn, no longer in deadly black, with hoarse note curse the sons of joy. Nor his accepted brethren, whom, tyrant, he calls free lay the bound or build the roof. Nor pale religious letchery call that virginity, that wishes but acts not! For every thing that lives is Holy.";

const words = s => (s.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g) || []).map(x => x.toLowerCase());
const compact = s => s.replace(/\s+/g, '');

assert.deepEqual(words(source), words(signed), 'word sequence must be identical');
assert.equal(words(source).length, 56, 'frozen source token count');
assert.equal(words(signed).length, 56, 'frozen author-output token count');
assert.match(source, /\bletchery\b/);
assert.match(source, /\bevery thing\b/);

const exactEditScript = compact(source)
  .replace('brethrenwhom', 'brethren,whom') // insert comma
  .replace('free;lay', 'freelay')          // delete semicolon
  + '.';                                   // insert final period

assert.equal(exactEditScript, compact(signed), 'three punctuation edits must explain the entire difference');

console.log(JSON.stringify({
  source_words: words(source).length,
  signed_words: words(signed).length,
  word_sequences_equal: true,
  punctuation_edits: [
    { operation: 'insert', after: 'brethren', character: ',' },
    { operation: 'delete', after: 'free', character: ';' },
    { operation: 'insert', after: 'Holy', character: '.' }
  ],
  source_spellings_preserved: ['letchery', 'every thing'],
  letter_or_word_edits: 0,
  lp2_receiver_selected: false
}, null, 2));
