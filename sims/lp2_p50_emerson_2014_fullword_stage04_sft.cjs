'use strict';

/**
 * Full source-word key, historical 2014 Stage04 GP29 Vigenere transfer.
 * SFT: node sims/lp2_p50_emerson_2014_fullword_stage04_sft.cjs
 * One experimental decoder, two specified historical normalization policies,
 * two independent original receivers and two untouched longer originals.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = name => JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const essay = read('resources/external/2014-emerson-firstfive-word60-source.json');
const grid = read('resources/liber-primus/base60-grid.json');
const lp2 = read('resources/liber-primus/lp2-corpus.json');
const getPage = page => lp2.pages.find(x => x.page === page).indices;
assert.equal(essay.source_blob_sha1, '12a6bc018047a1276e77f2b7f633d5905732fff9');
assert.equal(grid.rows.flat().length, 256);
const words = grid.rows.flat().map(cell =>
  essay.first_sixty_words[grid.alphabet.indexOf(cell[0])][grid.alphabet.indexOf(cell[1])]);
assert.equal(words.length, 256);
assert.equal(words.map(x => x.length).reduce((s,x) => s+x,0),1181);

/**
 * Original 2014 Stage04 key-to-shifts *corrected* GP tokenization:
 * two-letter pairs consume two letters; shift is GP ordinal+1, and the
 * historical cipher-to-plaintext operation is P=(C+shift) mod29.
 * Unmatched input letters are silently skipped by archive implementation.
 * @param {boolean} nativeNormalization
 * @returns {{stream:number[], skipped:Record<string,number>}}
 */
function makeFullWordKey(nativeNormalization) {
  const native = new Map(lp2.translit.map((x,i)=>[x,i]));
  native.set('IO',native.get('IA'));
  /** @type {number[]} */
  const stream = [];
  /** @type {Record<string,number>} */
  const skipped={};
  for(const word of words) {
    let w=word.toUpperCase().replace(/[^A-Z]/g,'');
    if(nativeNormalization) w=w.replace(/Q/g,'CW').replace(/V/g,'U')
      .replace(/K/g,'C').replace(/Z/g,'S');
    for(let i=0;i<w.length;) {
      if(native.has(w.slice(i,i+2))) {
        stream.push(native.get(w.slice(i,i+2))+1); i+=2;
      } else if(native.has(w[i])) {
        stream.push(native.get(w[i])+1);i++;
      } else {
        skipped[w[i]]=(skipped[w[i]]||0)+1;i++;
      }
    }
  }
  return {stream,skipped};
}

/**
 * @param {number[]} data
 * @returns {number}
 */
function ioc(data) {
  const h=Array(29).fill(0);
  for(const n of data)h[n]++;
  return h.reduce((sum,n)=>sum+n*(n-1),0)/(data.length*(data.length-1));
}
const original=[
  ['originalPrePostP50', [...getPage(49), ...getPage(51)]],
  ['originalP16',getPage(16)],
  ['originalP16to21',Array.from({length:6},(_,i)=>getPage(i+16)).flat()],
  ['originalP40to53',Array.from({length:14},(_,i)=>getPage(i+40)).flat()]
];
assert.deepEqual(original.map(x=>x[1].length),[158,267,1613,3008]);
const cases=[
  {
    policy:'literal-original-archive-skips-unrepresented-letters',
    ...makeFullWordKey(false),
    expectedLength:1087,
    expectedSkipped:{V:30,Q:1,K:1},
    expected:[0.03362089816979763,0.034045788628875556,
      0.034375629769906116,0.03448535863127879]
  },
  {
    policy:'normalized-native-GP-with-Q-as-CW',
    ...makeFullWordKey(true),
    expectedLength:1120,
    expectedSkipped:{},
    expected:[0.03539466258163348,0.035003238433161554,
      0.03418179524613139,0.034623555675056074]
  }
];
for(const test of cases) {
  assert.equal(test.stream.length,test.expectedLength);
  assert.deepEqual(test.skipped,test.expectedSkipped);
  for(let j=0;j<original.length;j++) {
    const [label,cipher]=original[j];
    const decrypted=cipher.map((c,i)=>(c+test.stream[i%test.stream.length])%29);
    const reconstructed=decrypted.map((p,i)=>
      (p-test.stream[i%test.stream.length]+29)%29);
    assert.deepEqual(reconstructed,cipher);
    assert.ok(Math.abs(ioc(decrypted)-test.expected[j])<1e-14,label);
    const positive=Array.from({length:cipher.length},(_,i)=>
      getPage(57)[i%getPage(57).length]);
    const encrypted=positive.map((p,i)=>
      (p-test.stream[i%test.stream.length]+29)%29);
    assert.deepEqual(encrypted.map((c,i)=>
      (c+test.stream[i%test.stream.length])%29),positive);
    console.log('EXACT_2014_FULL_WORD_SOURCE',JSON.stringify({
      keyPolicy:test.policy,sourceWords:words.length,keyLength:test.stream.length,
      skipped:test.skipped,originalReceiver:label,runes:cipher.length,
      gpIoC:ioc(decrypted),
      first24GP:decrypted.slice(0,24).map(x=>lp2.translit[x]).join(' ')
    }));
  }
}
console.log('PASS eight original full-cipher runs, eight authentic solved-native positive plants, two first-party source normalizations. No original LP2 plaintext, full-key Vigenere fails.');
