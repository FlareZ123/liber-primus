'use strict';
/**
 * Source-native LP2 p49–51 dual-radix whole-integer factorization.
 * Read-only, Windows 11 / Node.js 22 CommonJS single-file test.
 * Uses the original 256 printed table cells, without fitting any original cell.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const grid = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
assert.equal(grid.alphabet, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
assert(tokens.every(t => t.length === 2 && !t.includes('f')));
const alphabet59 = grid.alphabet.replace('f', '');
const b60 = grid.bytes;
const b59 = tokens.map(t => 59 * alphabet59.indexOf(t[0]) + alphabet59.indexOf(t[1]));
assert.deepEqual(tokens.map(t => 60 * grid.alphabet.indexOf(t[0]) + grid.alphabet.indexOf(t[1])), b60);
assert(b59.every(v => v >= 0 && v <= 255));
assert(b60.every((v,i) => v - Math.floor(v / 60) - Number(v % 60 > 41) === b59[i]));
/** @param {number[]} b @returns {bigint} */
const integer = b => BigInt('0x' + Buffer.from(b).toString('hex'));
const n60 = integer(b60), n59 = integer(b59);
const f60 = 2n ** 4n * 3n ** 3n * 7n * 13n * 29n * 179n ** 2n;
const f59 = 3n ** 2n * 41n * 61n * 109n;
assert.equal(f60, 36528277968n);
assert.equal(f59, 2453481n);
assert.equal(n60 % f60, 0n);
assert.equal(n59 % f59, 0n);
assert.equal((n60/f60).toString(2).length, 2013);
assert.equal((n59/f59).toString(2).length, 2027);
const sha256 = v => crypto.createHash('sha256').update(Buffer.from(v)).digest('hex');
assert.equal(sha256(b60), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.equal(sha256(b59), '511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79');
console.log('Source 256 tokens, base60 SHA256:', sha256(b60));
console.log('Omitted-f base59 bytes SHA256:', sha256(b59));
console.log('Original both representations: 2048 bits; quotients: 2013 and 2027 bits');

/** @param {bigint} input @param {number} limit */
function factorBelow(input, limit) {
  const sieve = new Uint8Array(limit + 1);
  sieve.fill(1, 2);
  for (let p=2; p*p<=limit; p++) {
    if (!sieve[p]) continue;
    for (let j=p*p; j<=limit; j+=p) sieve[j] = 0;
  }
  let n=input;
  const factors=[];
  for(let p=2;p<=limit;p++) {
    if(!sieve[p]) continue;
    let e=0;
    const bp=BigInt(p);
    while(n%bp===0n) {n/=bp;e++;}
    if(e) factors.push([p,e]);
  }
  return {factors,cofactor:n};
}
const f60scan=factorBelow(n60,1000000);
const f59scan=factorBelow(n59,1000000);
assert.deepEqual(f60scan.factors,[[2,4],[3,3],[7,1],[13,1],[29,1],[179,2]]);
assert.deepEqual(f59scan.factors,[[3,2],[41,1],[61,1],[109,1]]);
assert.equal(f60scan.cofactor,n60/f60);
assert.equal(f59scan.cofactor,n59/f59);
console.log('Base60 small factors:',JSON.stringify(f60scan.factors));
console.log('Base59 small factors:',JSON.stringify(f59scan.factors));

// Exact paired-cell permutation null: same shuffle under both interpretations.
let state=0x3301B059;
/** @returns {number} */
function random32() {
  state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
  return state >>> 0;
}
const order=Array.from({length:256},(_,i)=>i);
const trials=1000000;
let hit60=0,hit59=0,hitBoth=0;
const m60=Number(f60),m59=Number(f59);
assert(m60*256+255<Number.MAX_SAFE_INTEGER);
for(let k=0;k<trials;k++) {
  for(let i=255;i>0;i--) {
    const j=random32()%(i+1);
    const tmp=order[i];order[i]=order[j];order[j]=tmp;
  }
  let r60=0,r59=0;
  for(const i of order) {
    r60=(r60*256+b60[i])%m60;
    r59=(r59*256+b59[i])%m59;
  }
  const ok60=r60===0,ok59=r59===0;
  hit60+=Number(ok60);hit59+=Number(ok59);hitBoth+=Number(ok60&&ok59);
}
console.log('Paired-token shuffle (postselected divisors):',JSON.stringify({seed:'0x3301B059',trials,hit60,hit59,hitBoth}));
console.log('PASS original source arithmetic and exact-token shuffled comparison. No plaintext claimed.');
