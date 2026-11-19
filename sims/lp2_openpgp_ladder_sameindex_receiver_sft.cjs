'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\r/g, '');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const signed2016 = read('resources/historical/cicada2016-4gq25-outguess.asc');

const GP = {F:0,U:1,TH:2,O:3,R:4,C:5,G:6,W:7,H:8,N:9,I:10,J:11,EO:12,P:13,X:14,S:15,T:16,B:17,E:18,M:19,L:20,NG:21,OE:22,D:23,A:24,AE:25,Y:26,IA:27,EA:28};
const DIGRAPHS = new Set(['TH','EO','NG','OE','AE','IA','EA']);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const parts = transcription.split(/^\s*%\s*$/m);

function mod29(n) { return ((n % 29) + 29) % 29; }

/** @param {number} b @param {number} e @param {number} m */
function powMod(b, e, m) {
  let r = 1;
  while (e > 0) {
    if (e & 1) r = (r * b) % m;
    b = (b * b) % m;
    e = Math.floor(e / 2);
  }
  return r;
}

/** @param {string} word */
function gpValues(word) {
  const s = word.toUpperCase().replaceAll('V', 'U').replaceAll('K', 'C');
  const out = [];
  for (let i = 0; i < s.length;) {
    const pair = s.slice(i, i + 2);
    const sym = DIGRAPHS.has(pair) ? pair : s[i];
    assert.ok(Object.hasOwn(GP, sym));
    out.push(GP[sym]);
    i += sym.length;
  }
  return out;
}

/** @param {string} section */
function words(section) {
  const out = [];
  let vals = [];
  let start = 0;
  let offset = 0;
  const flush = () => {
    if (!vals.length) return;
    out.push({ordinal: out.length + 1, start, end: offset - 1, values: vals.slice()});
    vals = [];
  };
  for (const ch of [...section]) {
    const v = runeIndex.get(ch);
    if (v !== undefined) {
      if (!vals.length) start = offset;
      vals.push(v);
      offset += 1;
    } else if ((ch === '-' || ch === '.') && vals.length) {
      flush();
    }
  }
  flush();
  return out;
}

const begin = signed2016.indexOf('Hello.');
const end = signed2016.indexOf('-----BEGIN PGP SIGNATURE-----');
const raw = signed2016.slice(begin, end).match(/[A-Za-z0-9]+/g) || [];
const parsers = {alpha: raw.filter((x) => /^[A-Za-z]+$/.test(x)), alnum: raw};
const N = 0x7A35090F;
const family = [];

for (const [parser, source] of Object.entries(parsers)) {
  const anchor = source.findIndex((x) => x.toUpperCase() === 'OPENPGP');
  for (const dir of [-1, 1]) {
    for (const radix of [59, 60]) {
      for (const origin of ['zero', 'one']) {
        const ix = [anchor, anchor + 16 * dir, anchor + 32 * dir];
        const chain = ix.every((i) => i >= 0 && i < source.length)
          ? ix.map((i) => source[i].toUpperCase()) : null;
        let residues = null;
        let roles = null;
        if (chain && chain.join('/') === 'OPENPGP/NUMBERS/PRIMUS') {
          residues = [N % 16, N % radix, N % 29];
          const pos = origin === 'zero' ? residues : residues.map((x) => x - 1);
          if (pos.every((i) => i >= 0 && i < source.length)) {
            roles = pos.map((i) => source[i].toUpperCase());
          }
        }
        family.push({parser, dir, radix, origin, residues, roles,
          hit: roles && roles.join('/') === 'WORDS/THEIR/ROAD'});
      }
    }
  }
}

assert.equal(family.length, 16);
const hits = family.filter((x) => x.hit);
assert.equal(hits.length, 1);
assert.deepEqual([hits[0].parser,hits[0].dir,hits[0].radix,hits[0].origin], ['alpha',-1,60,'zero']);
assert.deepEqual(hits[0].residues, [15,19,23]);

const source = parsers.alpha.map((x) => x.toUpperCase());
const [b,B,p] = hits[0].residues;
const gs = [];
for (let g = 1; g < p; g += 1) if (powMod(g,b,p) === B) gs.push(g);
assert.deepEqual(gs, [5]);
const g = gs[0], a = 6, A = powMod(g,a,p), K = powMod(B,a,p), q = B-b;
let e = 0;
for (let x = 1; x < p-1; x += 1) if ((b*x) % (p-1) === 1) e = x;
assert.deepEqual({p,q,g,a,b,A,B,K,e},{p:23,q:4,g:5,a:6,b:15,A:8,B:19,K:2,e:3});

const rows = hits[0].residues.map((r) => {
  const role = source[r];
  const receiver = words(parts[r])[r];
  return {r,role,sourceLength:gpValues(role).length,receiverLength:receiver.values.length,
    ordinal:receiver.ordinal,start:receiver.start,end:receiver.end,
    eligible:gpValues(role).length === receiver.values.length};
});
assert.deepEqual(rows.map((x) => [x.r,x.role,x.sourceLength,x.receiverLength,x.eligible]), [
  [15,'WORDS',5,5,true],[19,'THEIR',4,3,false],[23,'ROAD',4,8,false]
]);

const receiver = words(parts[15])[15];
assert.deepEqual([receiver.ordinal,receiver.start,receiver.end,receiver.values], [16,71,75,[10,13,8,27,17]]);
const plaintext = receiver.values.map((x) => mod29(x-b));
const expected = gpValues('WORDS');
const additionControl = receiver.values.map((x) => mod29(x+b));
assert.deepEqual(plaintext,[24,27,22,12,2]);
assert.deepEqual(expected,[7,3,4,23,15]);
assert.notDeepEqual(plaintext, expected);
assert.deepEqual(plaintext.map((x) => mod29(x+b)), receiver.values);

console.log('PASS negative: sealed OPENPGP-ladder same-index receiver misses WORDS');
console.log(JSON.stringify({
  selector:{count:family.length,survivor:hits[0]},
  state:{p,q,g,a,b,A,B,K,e},
  receiverFamily:rows,
  frozen:{ciphertext:receiver.values,key:b,subtract:plaintext,expectedWORDS:expected,additionControl,forwardExact:true}
}, null, 2));
