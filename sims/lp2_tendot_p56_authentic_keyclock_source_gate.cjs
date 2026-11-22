'use strict';

/**
 * First-party original p56 ten-dot source-gate for claims that red-ten
 * punctuation always resets a GP29 cipher clock. The authentic p56 prime/
 * totient cipher continues across its ten-dot at rune offset 45.
 *
 * Reproduce: node sims/lp2_tendot_p56_authentic_keyclock_source_gate.cjs
 * Node.js 22, CommonJS, no external dependencies.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
/** @param {string} filename */
const load = filename => fs.readFileSync(path.join(root, filename), 'utf8');
const gp = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(load('resources/liber-primus/lp2-ink-annotations.json'));
const reference = load('resources/liber-primus/lp1-plaintext-reference.txt');
const original = gp.pages.find(p => p.page === 56).indices;
const marks = ink.pages.flatMap(p => (p.large_punctuation || [])
  .filter(m => m[1] === 10)
  .map(m => ({page:p.page,afterRunes:m[0],color:m[2]})));
assert.deepEqual(marks, [
  {page:36,afterRunes:99,color:'red'},
  {page:38,afterRunes:186,color:'red'},
  {page:49,afterRunes:66,color:'red'},
  {page:56,afterRunes:45,color:'red'}
]);
assert.equal(original.length, 85);
assert.equal(original[56], 0, 'plaintext F bypass at rune56');
const sourceText = reference.match(/### 56\n([\s\S]*?)\n### 57/)[1];
const expectedLatin = sourceText.split('\n')
  .filter(line => !/^[0-9a-f]{40,}$/i.test(line.trim())).join('')
  .toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
  .replace(/K/g, 'C').replace(/Z/g, 'S')
  .replace(/[^A-Z]/g, '');
assert.equal(expectedLatin.length, 91);
const primeList = [];
for (let n=2; primeList.length<85; ++n) {
  let prime=true;
  for (let d=2;d*d<=n;d++) if(n%d===0){prime=false;break;}
  if(prime) primeList.push(n);
}
/** @param {number} n */
function m29(n) {return ((n%29)+29)%29;}
/**
 * @param {number[]} cipher
 * @param {number} restart
 * @returns {number[]}
 */
function decode(cipher, restart=-1) {
  let k=0;
  return cipher.map((c,i)=>{
    if(i===restart)k=0;
    if(i===56)return c; // Known plaintext F is literal; does not consume key
    return m29(c-(primeList[k++]-1));
  });
}
/** @param {number[]} plain */
function encryptContinuous(plain) {
  let k=0;
  return plain.map((p,i)=>i===56?p:m29(p+primeList[k++]-1));
}
const clear = decode(original);
assert.equal(clear.length,85);
assert.equal(clear.map(x=>gp.translit[x]).join(''), expectedLatin);
assert.deepEqual(encryptContinuous(clear),original);
const tenDotAt = 45;
const rekeyed = decode(original, tenDotAt);
const sameAfter = rekeyed.slice(tenDotAt)
  .filter((r,i)=>r===clear[tenDotAt+i]).length;
assert.equal(sameAfter,3);
assert.notDeepEqual(rekeyed.slice(tenDotAt), clear.slice(tenDotAt));
assert.equal(primeList[45],199);
console.log(JSON.stringify({
  source:'Original LP2 p56, authenticated prime-totient/F-bypass inverse and original LP1/LP2 clear reference',
  red10_marks:marks,
  original_p56:{runes:original.length, normalizedLetters:expectedLatin.length,
    verifiedFullClearAndExactReencrypt:true},
  tenDot:{markedAfterRune:tenDotAt, originalClockNextPrime:primeList[45],
    continuesWithoutRestart:true},
  ifForcedRestart:{correctRunesAfterMark:sameAfter,
    testedRunesAfterMark:original.length-tenDotAt,
    first15:rekeyed.slice(tenDotAt,tenDotAt+15).map(x=>gp.translit[x]).join(' ')},
  originalFirst15AfterMark:clear.slice(tenDotAt,tenDotAt+15)
    .map(x=>gp.translit[x]).join(' '),
  decision:'A ten-dot mark does not universally instruct a totient/prime cipher-clock reset. No author-supplied p49 ten-dot to 256-byte GP29 changing-state receiver has been identified.'
}, null, 2));
