'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const signed = fs.readFileSync(path.join(ROOT, 'resources/historical/cicada2016-4gq25-outguess.asc'), 'utf8');
const tokens = grid.tokens ?? grid.pages.flatMap((page) => page.tokens);
const BASE60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const GP = {F:0,U:1,TH:2,O:3,R:4,C:5,G:6,W:7,H:8,N:9,I:10,J:11,EO:12,P:13,X:14,S:15,T:16,B:17,E:18,M:19,L:20,NG:21,OE:22,D:23,A:24,AE:25,Y:26,IA:27,EA:28};
const DIGRAPHS = new Set(['TH','EO','NG','OE','AE','IA','EA']);

/** @param {string} word */
function gp0(word) {
  const s = word.toUpperCase().replaceAll('V', 'U').replaceAll('K', 'C');
  let total = 0;
  for (let i = 0; i < s.length;) {
    const pair = s.slice(i, i + 2);
    const sym = DIGRAPHS.has(pair) ? pair : s[i];
    total += GP[sym];
    i += sym.length;
  }
  return total;
}

/** @param {number} address */
function low60(address) {
  const token = tokens[address];
  return {token, value: BASE60.indexOf(token[1])};
}

const begin = signed.indexOf('Hello.');
const end = signed.indexOf('-----BEGIN PGP SIGNATURE-----');
const source = (signed.slice(begin, end).match(/[A-Za-z]+/g) || []).map((x) => x.toUpperCase());
assert.equal(source[39], 'FALSE');
assert.equal(source[40], 'PATHS');

assert.equal(gp0('READ'), 55);
assert.equal(gp0('OUT'), 20);
assert.deepEqual(low60(55), {token:'1K', value:20});

assert.deepEqual(low60(36), {token:'0s', value:54});
assert.deepEqual(low60(54), {token:'2a', value:36});

assert.equal(gp0('GOOD'), 35);
assert.equal(gp0('LUCK'), 31);
assert.deepEqual(low60(35), {token:'0d', value:39});
assert.notEqual(low60(35).value, gp0('LUCK'));

assert.equal(gp0('FALSE'), 77);
assert.equal(gp0('PATHS'), 54);
const holdout = low60(77);
assert.deepEqual(holdout, {token:'2O', value:24});
assert.notEqual(holdout.value, gp0('PATHS'));

console.log('PASS negative: typed page-anchored p39 low-digit holdout misses PATHS');
console.log(JSON.stringify({
  knownPositiveP28:{from:gp0('READ'),token:low60(gp0('READ')).token,to:low60(gp0('READ')).value,target:gp0('OUT')},
  knownPositiveP35:{a:36,aToken:low60(36).token,aTo:low60(36).value,b:54,bToken:low60(54).token,bTo:low60(54).value},
  priorNegative1787:{from:gp0('GOOD'),token:low60(gp0('GOOD')).token,to:low60(gp0('GOOD')).value,target:gp0('LUCK')},
  holdout:{sourceIndex39:source[39],partnerIndex40:source[40],from:gp0('FALSE'),token:holdout.token,to:holdout.value,target:gp0('PATHS'),hit:false}
}, null, 2));
