'use strict';

// Source: tweqx/LibrePuff librepuff/src/chain.rs blob eb0d9b284a54256c888b983e64399ab6897c8bd6.
// These are the fixed IV-decryption constants, NOT an extracted carrier IV.
const assert = require('node:assert/strict');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const iv = Buffer.from(
  'cda011e58382e5b284639ec64954ddd72ff48b6658f74b661910f20586510764' +
  '0e81a10719d19e9651c75af3ca724a4375d357c7629726b407853ff499f48871' +
  'a78766d767c48774dc851fc2f8a274c498747be0b10049c0ce46a834eed04746' +
  '85e78bd1baa198048fe2101659a32c76cd64904694d50a8500564a961af216e2' +
  'a6d1fe45e0d665101842b297e16652e22da3b3643ec34f5269c746819462b575' +
  'd830ee85d021bd24e1443cc473770ad23ac063d1a122589013369df0980607f1' +
  '1c4355f5f6f721d0402709252f71d231a5226ac6914766c3e725c62617e17af3' +
  'd7d5c006a921f6147e1464831c15ab32c066b823c0f6df62a7c7603788d1ef95', 'hex');
assert.equal(iv.length, 256);
const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);

/** @param {number[]} x @param {number[]} y */
function compare(x, y) {
  const hist = a => Array.from({length:256}, (_, i) => a.filter(n => n === i).length);
  const a = hist(x), b = hist(y);
  const overlap = a.reduce((s,n,i) => s + Math.min(n,b[i]), 0);
  const blocks = Array.from({length:16}, (_,i) => x.slice(i*16,i*16+16));
  return {
    alignedEqual:x.filter((n,i) => n === y[i]).length,
    minimumReplacements:256-overlap,
    exactBlockAnywhere:blocks.filter(block => Array.from({length:16}, (_,j) => j)
      .some(j => block.every((n,k) => n === y[j*16+k]))).length
  };
}
const reference = [...iv];
assert.deepEqual(compare(reference,reference),
  {alignedEqual:256,minimumReplacements:0,exactBlockAnywhere:16});
assert.equal(compare([...reference].reverse(), reference).minimumReplacements,0);
const mutated = [...reference]; mutated[0] = (mutated[0]+1)%256;
assert.equal(compare(mutated,reference).minimumReplacements,1);
for(const alphabet of [grid.alphabet,grid.alphabet.replace('f','')]){
  const bytes=tokens.map(t=>alphabet.length*alphabet.indexOf(t[0])+alphabet.indexOf(t[1]));
  assert(bytes.every(n=>Number.isInteger(n)&&n>=0&&n<=255));
  assert(tokens.every((t,i)=>alphabet[Math.floor(bytes[i]/alphabet.length)]+alphabet[bytes[i]%alphabet.length]===t));
  if(alphabet.length===60) assert.deepEqual(bytes,grid.bytes);
  const result=compare(bytes,reference);
  assert.deepEqual(result,{alignedEqual:0,minimumReplacements:alphabet.length===60?136:133,exactBlockAnywhere:0});
  console.log(JSON.stringify({radix:alphabet.length,...result}));
}
