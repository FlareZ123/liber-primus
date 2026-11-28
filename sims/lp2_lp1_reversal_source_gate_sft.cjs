'use strict';
/**
 * Source-fixed LP1 reversal transfer gate for LP2 p33 and p49-p56.
 *
 * 1) Reproduce LP1 05.jpg: hex -> nibble swap -> digit-reversed 5x5
 *    square, plus exact byte-reversed JPEG suffix.
 * 2) Transfer only decimal digit reversal to the authentic 2014 order-7
 *    /1033 square and test exact GP-prime word-sum capacity on p33.
 * 3) Transfer only whole-byte reverse / nibble-swap operations to p49-51
 *    literal/base59/base60 streams and test SHA-512 against p56.
 *
 * Whirlpool is runner-dependent in Node; the report records a KAT-checked
 * OpenSSL-3 legacy-provider run for the same fixed variants.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p));
const readText = p => read(p).toString('utf8');
const TARGET = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const sha512 = b => crypto.createHash('sha512').update(b).digest('hex');
const blake2b512 = b => crypto.createHash('blake2b512').update(b).digest('hex');
const nibbleSwap = b => Buffer.from(Uint8Array.from(b, x => ((x & 0x0f) << 4) | (x >>> 4)));
const reverseDigits = n => Number(String(n).split('').reverse().join(''));

// LP1 05.jpg source operation.
const jpg = read('resources/liber-primus/05.jpg');
const eoi = jpg.indexOf(Buffer.from([0xff, 0xd9]));
assert.ok(eoi > 0, 'first JPEG EOI');
const jpeg = jpg.subarray(0, eoi + 2);
const trailer = jpg.subarray(eoi + 2);
assert.equal(jpeg.length, 336353);
assert.equal(trailer.length, 336713);
assert.equal(trailer[0], 0x0a);
assert.equal(trailer[1], 0x0a);
const hexText = trailer.subarray(2, 360).toString('ascii');
assert.match(hexText, /^[0-9a-f]{358}$/);
const hidden = nibbleSwap(Buffer.from(hexText, 'hex')).toString('ascii');
const hiddenRows = hidden.trim().split(/\r?\n/).map(row => row.trim().split(/\s+/));
assert.deepEqual(hiddenRows.map(r => r.length), [5,5,5,5,5]);
const numeric = hiddenRows.map(r => r.map(s => Number([...s].reverse().join(''))));
const sums = [
  ...numeric.map(r => r.reduce((a,b)=>a+b,0)),
  ...Array.from({length:5},(_,c)=>numeric.reduce((a,r)=>a+r[c],0)),
  numeric.reduce((a,r,i)=>a+r[i],0),
  numeric.reduce((a,r,i)=>a+r[4-i],0),
];
assert.deepEqual(sums, Array(12).fill(1033));
const reversedJpeg = trailer.subarray(360);
assert.equal(reversedJpeg.length, jpeg.length);
assert.deepEqual(Buffer.from(reversedJpeg).reverse(), jpeg);

// p33 exact word-sum capacity under demonstrated digit reversal.
const gp = JSON.parse(readText('resources/liber-primus/lp2-corpus.json'));
const squares = readText('resources/cicada2014-openpuff-magic-squares.txt')
  .trim().split(/\r?\n\s*\r?\n/).map(s => s.trim().split(/\s+/).map(Number));
const sq = squares[1];
assert.equal(sq.length, 49);
const pages = readText('resources/liber-primus/lp2-transcription.txt').replace(/\r/g,'').split('\n%\n');
const groups = pages[33].replace(/[\s/]/g,'').split('&')
  .map(s => s.slice(s.indexOf('.')+1).split(/[-.]/).filter(Boolean));
assert.deepEqual(groups.map(g=>g.length), [21,28]);
const words = groups.flat();
assert.equal(words[48], 'ᛒ');
assert.ok(pages[34].replace(/[\s/]/g,'').startsWith('ᛗᛒ-'));
words[48] += 'ᛗᛒ';
const lengths = words.map(w => [...w].length);
assert.equal(lengths.reduce((a,b)=>a+b,0), 198);
assert.equal(lengths[24], 3);
assert.equal(sq[24], 331);
assert.equal(reverseDigits(sq[24]), 133);
const dp = [new Set([0])];
for (let n=1; n<=Math.max(...lengths); n++) {
  const next = new Set();
  for (const v of dp[n-1]) for (const p of gp.prime) next.add(v+p);
  dp.push(next);
}
const reachable = (v,n) => dp[n].has(v);
assert.ok(reachable(133, 3));
const d4Bad = [];
for (let t=0; t<8; t++) {
  const bad = [];
  for (let i=0; i<49; i++) {
    const r=Math.floor(i/7), c=i%7;
    let a=(t&4)?c:r, b=(t&4)?r:c;
    if (t&1) a=6-a;
    if (t&2) b=6-b;
    const target = reverseDigits(sq[a*7+b]);
    if (!reachable(target, lengths[i])) bad.push(i+1);
  }
  d4Bad.push(bad);
}
assert.deepEqual(d4Bad.map(x=>x.length), [15,18,18,15,16,17,17,16]);

// Fixed per-word additive readout using digit-reversed cells mod 29.
const runeMap = new Map(gp.runes.map((r,i)=>[r,i]));
const parts = words.map(w => [...w].map(ch => {
  const v=runeMap.get(ch);
  assert.notEqual(v, undefined);
  return v;
}));
const keys = sq.map(reverseDigits).map(v => ((v%29)+29)%29);
const mod = v => (v%29+29)%29;
const shift = sign => parts.map((part,i)=>part.map(v=>mod(v+sign*keys[i])));
const ioc = a => {
  const c=Array(29).fill(0);
  for(const v of a)c[v]++;
  return c.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
};
const plus = shift(+1), minus=shift(-1);
const plusIoc=ioc(plus.flat()), minusIoc=ioc(minus.flat());
assert.ok(plusIoc < 0.04 && minusIoc < 0.04);

// p49-51 -> p56 exact source-transform SHA-512 gate.
const grid = JSON.parse(readText('resources/liber-primus/lp2-grid-256.json'));
const tokens = grid.pages.flatMap(p=>p.tokens);
assert.equal(tokens.length, 256);
const literal = Buffer.from(tokens.join(''), 'ascii');
assert.equal(literal.length,512);
const A60='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const A59=A60.replace('f','');
const decode = alphabet => Buffer.from(tokens.map(t => {
  const a=alphabet.indexOf(t[0]), b=alphabet.indexOf(t[1]);
  assert.ok(a>=0 && b>=0);
  const v=a*alphabet.length+b;
  assert.ok(v>=0 && v<=255);
  return v;
}));
const b60=decode(A60), b59=decode(A59);
assert.deepEqual([...b60], grid.bytes);
assert.equal(Math.max(...b59),251);
const perTokenReverse = Buffer.from(tokens.map(t=>t[1]+t[0]).join(''), 'ascii');
const variants = [];
for (const [family,b] of [['base60',b60],['base59',b59],['literal',literal]]) {
  for (const [op,x] of [
    ['raw',b],
    ['whole_reverse',Buffer.from(b).reverse()],
    ['nibble_swap',nibbleSwap(b)],
    ['whole_reverse+nibble_swap',nibbleSwap(Buffer.from(b).reverse())],
  ]) variants.push({family,op,sha512:sha512(x),blake2b512:blake2b512(x)});
}
variants.push({family:'literal',op:'per_token_character_reverse',sha512:sha512(perTokenReverse),blake2b512:blake2b512(perTokenReverse)});
for(const v of variants) {
  assert.notEqual(v.sha512,TARGET, `${v.family}/${v.op} SHA-512 unexpectedly matches p56`);
  assert.notEqual(v.blake2b512,TARGET, `${v.family}/${v.op} BLAKE2b-512 unexpectedly matches p56`);
}

console.log(JSON.stringify({
  lp1_05:{jpegBytes:jpeg.length,trailerBytes:trailer.length,hiddenBytes:Buffer.from(hexText,'hex').length,magicSums:sums},
  p33:{centerReversed:133,d4FailureCounts:d4Bad.map(x=>x.length),plusIoc,minusIoc},
  p50_p56:{target:TARGET,sha512Variants:variants},
  decision:'NO_PLAINTEXT_OR_P56_MATCH_UNDER_EXACT_LP1_REVERSAL_TRANSFERS'
},null,2));
