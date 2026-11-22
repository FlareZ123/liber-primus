'use strict';

/**
 * Original-source literal-English candidate crib at both LP2 quote heads.
 * This is a falsifiable crib proposal, NOT recovered unknown plaintext.
 * Run read-only on Windows with Node.js 22.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const load = name => fs.readFileSync(path.join(root, name), 'utf8');
const source = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const raw = load('resources/lp2-transcription.txt');
const quotes = JSON.parse(load('resources/liber-primus/lp2-quote-punctuation-spans.json'));
const signed = load('resources/historical/cicada2016-4gq25-outguess.asc')
  .split('-----BEGIN PGP SIGNATURE-----')[0];
const runes = new Set(source.runes);
const original = source.pages.filter(x => x.page <= 55).flatMap(x => x.indices);
assert.equal(original.length, 12956);
const text = raw.split('%').slice(0,55).join('%');
const words = [];
let pending = '';
let first = 0;
let offset = 0;
/** Commit a printed word while preserving its true global rune coordinate. */
function finish() {
  if (!pending) return;
  words.push({start:first,length:[...pending].length,runes:pending});
  pending = '';
}
for (const letter of text) {
  if (runes.has(letter)) {
    if (!pending) first=offset;
    pending+=letter;
    offset++;
  } else if (letter === '%' || letter === '/' || /\s/u.test(letter)) {
    // Actual physical page and line wraps do not terminate words.
  } else {
    finish();
  }
}
finish();
assert.equal(offset,12956);
assert.equal(words.length,2896);
assert.ok(words.every(x=>x.length > 0 && x.length <= 14));

const five=[5,7,2,3,4];
const originalMatches=words.flatMap((w,i) =>
  i+5<=words.length && five.every((len,j)=>words[i+j].length===len)
    ? [w.start] : []);
assert.deepEqual(originalMatches,[9811,12522]);
for (const start of originalMatches) {
  assert.ok(quotes.quotes.some(q=>q.start===start),'unmatched original raised-quote start');
  const span=words.findIndex(x=>x.start===start);
  const fiveRuneWords=words.slice(span,span+5);
  const joined=fiveRuneWords.flatMap(x=>Array.from(x.runes));
  assert.equal(joined.length,21);
  assert.deepEqual(joined.map(x=>source.runes.indexOf(x)),original.slice(start,start+21));
}
const canonical=signed.replace(/\s+/g,' ').toUpperCase();
const phrase='THEIR MEANING IS THE ROAD';
assert.ok(canonical.includes('THEIR MEANING IS THE ROAD'));
const signedWords=(canonical.match(/[A-Z]+/g)||[]);
const signedMatches=signedWords.flatMap((w,i)=>
  i+5<=signedWords.length && five.every((len,j)=>signedWords[i+j].length===len)
    ? [signedWords.slice(i,i+5).join(' ')] : []);
assert.deepEqual(signedMatches,[phrase]);
const plaintext=Array.from(phrase.replace(/ /g,'')).map(s=>{
  const pos=source.translit.indexOf(s);
  assert.ok(pos>=0,'single-letter GP mapping missing: '+s);
  return pos;
});
assert.equal(plaintext.length,21);
assert.equal(plaintext.includes(0),false);
// Solved GP29 spelling commonly contracts TH, ING and EA. Under those
// native rules the signed phrase has DIFFERENT runic word lengths.
const groups=['ING','TH','NG','EO','OE','AE','EA','IA'];
const gpLengths=phrase.split(' ').map(w=>{
  let i=0,n=0;
  while(i<w.length) {
    const token=groups.find(t=>w.startsWith(t,i));
    i+=(token||w[i]).length;
    n++;
  }
  return n;
});
assert.deepEqual(gpLengths,[4,4,2,2,4]);

const mod=x=>(x%29+29)%29;
const keys=originalMatches.map(start=>{
  const observed=original.slice(start,start+21);
  return observed.map((v,j)=>mod(v-plaintext[j]));
});
// A stationary substitution on even one quote cannot realize this crib:
// repeated plaintext T at indices 0 and 14 has unlike ciphertext on each.
for (const start of originalMatches)
  assert.notEqual(original[start],original[start+14]);
assert.notDeepEqual(keys[0],keys[1]);
for (const key of keys) {
  assert.notEqual(key[0],key[19],'nineteen-symbol key period invalid');
  assert.notEqual(key[1],key[20],'nineteen-symbol second repeat invalid');
}
// For a direct original solved p56 cipher, no plaintext F occurs in the
// proposed crib, so F-skips do not enter its 21-symbol known-key test.
const shifts=[];
for(let n=2;shifts.length<14000;n++) {
  let prime=true;
  for(let d=2;d*d<=n;d++) if(n%d===0) {prime=false;break;}
  if(prime)shifts.push(mod(n-1));
}
const primeMatches=[];
for(let j=0;j<keys.length;j++) {
  const row=keys[j];
  const hits=[];
  for(let start=0;start+row.length<=shifts.length;start++) {
    for(const sign of [1,-1]) {
      if(row.every((v,i)=>v===mod(sign*shifts[start+i])))
        hits.push({primeIndex:start+1,sign});
    }
  }
  primeMatches.push(hits);
}
assert.deepEqual(primeMatches,[[],[]]);
const output={source:'Original 2014 LP2 quote heads + authenticated 2016 signed prose',
  candidate:phrase,originalGPWords:words.length,originalRunes:offset,
  fiveWordLengthPattern:five,
  matchingUnknownSourceOffsets:originalMatches,
  bothMatchingStartsAreAuthenticQuoteStarts:true,
  literalLatin2016PhraseMatches:signedMatches,
  sourceNativeGPContractionLengths:gpLengths,
  literalLetterCribGP29Length:plaintext.length,
  p40RequiredGP29AdditiveKeys:keys[0],
  p53RequiredGP29AdditiveKeys:keys[1],
  samePlaintextDifferentCiphertextKeySchedules:true,
  eachQuoteDisagreesWithStationaryOneAlphabet:true,
  exactKnownP56PhiPrimeWindowHitsFirst14000Primes:primeMatches,
  authenticatedOriginalUnknownPlaintext:false,
  interpretation:'Source-specific prospective crib; special spelling rule and an independently selected key still missing.'};
console.log(JSON.stringify(output,null,2));
