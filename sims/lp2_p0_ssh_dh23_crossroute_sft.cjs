/** Original LP2 p0 dot-routed SSH suffix / historical DH23 shared-secret crosscheck. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const first = corpus.pages.find((p) => p.page === 0).indices;
const p0 = ink.pages.find((p) => p.page === 0);
const raw = first.slice(0, 13);
assert.deepEqual(raw, [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);
assert(p0.red_spans.some((x) => x.start === 0 && x.length === 13));
assert(p0.large_punctuation.some((x) => x[0] === 13 && x[1] === 13 && x[2] === 'red'));
const b29 = (digits) => digits.reduce((n, x) => n * 29n + BigInt(x), 0n);
const powmod = (a, exponent, modulus) => {
  let result = 1n;
  for (let i = 0n; i < exponent; i++) result = (result * a) % modulus;
  return result;
};
const fullNumber = b29(raw);
const b = first.slice(13, 20);
assert.deepEqual(b, [2, 11, 6, 25, 0, 11, 22]);
const firstBlack = b29(b);
const a = fullNumber % 22n;
const B = firstBlack % 23n;
const A = powmod(5n, a, 23n);
const secret = powmod(B, a, 23n);
assert.equal(fullNumber, 5412445423142629857n);
assert.equal(fullNumber % 23n, 0n);
assert.equal(a, 7n);
assert.equal(firstBlack, 1420123033n);
assert.equal(B, 16n);
assert.equal(A, 17n);
assert.equal(secret, 18n);

// P0 word one (8 runes) is filled into outer positions; word two (5)
// into the center of standard 3x9 alternating 13-dot stencil.
const outer = raw.slice(0, 8);
const middle = raw.slice(8);
const route = [];
for (let row = 0; row < 9; row++) {
  if (row % 2 === 0) route.push(middle[row / 2]);
  else route.push(outer[row - 1], outer[row]);
}
assert.deepEqual(route, [15, 15, 8, 26, 18, 3, 18, 6, 19, 21, 27, 0, 5]);
assert.deepEqual(route.slice(0, 3).map((x) => corpus.translit[x]), ['S', 'S', 'H']);
const suffix = route.slice(3);
const suffixInteger = b29(suffix);
assert.equal(suffixInteger, 386252824294711n);
assert.equal(suffixInteger % 23n, secret);
assert.equal(b29(raw.slice(3)) % 23n, 14n);
assert(suffixInteger >= (1n << 48n)); // Not a plain IPv4+16-bit-port packet.

// Compare a finite set of orientation choices; 16 construction variants
// yield eight distinct rune strings because full inversion duplicates one.
const variants = [];
for (const reverseOuter of [false, true])
  for (const reverseMiddle of [false, true])
    for (const reverseRows of [false, true])
      for (const flipLR of [false, true]) {
        const o = reverseOuter ? [...outer].reverse() : outer;
        const m = reverseMiddle ? [...middle].reverse() : middle;
        const rows = Array.from({length:9},(_,i)=>i%2===0?[m[i/2]]:[o[i-1],o[i]]);
        if (flipLR) for (let i=1;i<9;i+=2) rows[i].reverse();
        if (reverseRows) rows.reverse();
        const seq = rows.flat();
        variants.push({route:seq.join(','), first3:seq.slice(0,3).map((x)=>corpus.translit[x]).join(''),
          restModulo23:Number(b29(seq.slice(3))%23n)});
      }
const unique = [...new Map(variants.map((v)=>[v.route,v])).values()];
assert.equal(unique.length, 8);
assert.equal(unique.filter((v)=>v.first3==='SSH'&&v.restModulo23===18).length,1);
assert.equal(unique.filter((v)=>v.restModulo23===18).length,1);
console.log(JSON.stringify({
  source:'Original LP2 p0 red13, 13-dot and first seven black runes',
  DH23:{N:fullNumber.toString(),exponent:Number(a),clientShare:Number(B),
    publicValue:Number(A),secret:Number(secret)},
  dotRoute:route.map((x)=>corpus.translit[x]).join(' '),
  suffixNumber:suffixInteger.toString(),
  suffixMod23:Number(suffixInteger%23n),
  rawTailMod23:Number(b29(raw.slice(3))%23n),
  orientationCandidates:unique.map((x)=>({first3:x.first3,restModulo23:x.restModulo23})),
  secretAgreement:'exact; no plaintext or source-command selection'
},null,2));
