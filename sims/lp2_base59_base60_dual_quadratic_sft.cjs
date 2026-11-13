'use strict';

/**
 * Original pp49–51 base59/base60 exact polynomial-source selection.
 * Node 22 CommonJS, no external dependencies, no file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const base = path.join(__dirname, '..', 'resources', 'liber-primus');
const grid = JSON.parse(fs.readFileSync(path.join(base, 'base60-grid.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(base, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(base, 'lp2-ink-annotations.json'), 'utf8'));
const alpha60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alpha59 = alpha60.replace('f', '');
const tokens = grid.rows.flat();

/** @param {number} n @returns {number} */
const mod = n => ((n % 29) + 29) % 29;

/** @param {number} x @returns {number} */
function inv(x) {
  for (let k = 1; k < 29; k++) if (mod(x*k) === 1) return k;
  throw Error('Noninvertible polynomial leading term');
}

/**
 * Polynomial remainder in GF29 with high-degree first.
 * @param {number[]} coefficients
 * @param {number[]} polynomial
 * @returns {number[]}
 */
function rem(coefficients, polynomial) {
  const work = coefficients.map(mod);
  const k = polynomial.length - 1;
  const invLead = inv(polynomial[0]);
  for (let i = 0; i < work.length-k; i++) {
    const a = mod(work[i] * invLead);
    for (let j = 0; j <= k; j++) {
      work[i+j] = mod(work[i+j] - a*polynomial[j]);
    }
  }
  return work.slice(-k);
}

/** @param {string} alphabet @returns {number[]} */
function decode(alphabet) {
  assert.ok(alphabet.length === 59 || alphabet.length === 60);
  return tokens.map(t => {
    assert.match(t, /^[0-9A-Za-z]{2}$/);
    const x = alphabet.indexOf(t[0]);
    const y = alphabet.indexOf(t[1]);
    assert.ok(x >= 0 && y >= 0);
    const val = alphabet.length*x+y;
    assert.ok(val >= 0 && val <= 255);
    return val;
  });
}
/** @param {number[]} a @returns {string} */
function sha256(a) {
  return crypto.createHash('sha256').update(Buffer.from(a)).digest('hex');
}

/** @param {number[]} a @returns {number} */
const high252 = a => a.filter(v => v >= 252).length;
const H = [1,18,11];               // 2013 signed 3QO = 3 + 26X + 24X² = 24 H
const G = [1,10,25];               // p39 red: 27 + 5X + 15X² = 15 G
const HG = [1,28,13,9,14];        // H G
const P3 = [2,23,13];              // p3 red, independent nondividing comparator

assert.equal(grid.alphabet, alpha60);
assert.equal(tokens.length,256);
assert.equal(grid.rows.length,32);
assert.ok(grid.rows.every(r=>r.length===8));
assert.ok(tokens.every(t => !t.includes('f')));
assert.deepEqual(corpus.pages.find(p=>p.page===39).indices.slice(119,122),[27,5,15]);
assert.deepEqual(corpus.pages.find(p=>p.page===3).indices.slice(119,122),[13,23,2]);
const b59 = decode(alpha59);
const b60 = decode(alpha60);
assert.equal(sha256(b60), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.deepEqual(b60,grid.byte_rows.flat());
assert.equal(b59.filter((v,i)=>v!==b60[i]).length,220);
assert.equal(Math.max(...b59),251);
assert.equal(Math.max(...b60),255);
assert.equal(high252(b59),0);
assert.equal(high252(b60),4);
assert.equal(b59[0],200);
assert.equal(b60[0],203);
assert.equal(mod(b59[0]),26);
assert.equal(mod(b60[0]),0);

const r59 = {H:rem(b59,H),G:rem(b59,G),HG:rem(b59,HG),P3:rem(b59,P3)};
const r60 = {H:rem(b60,H),G:rem(b60,G),HG:rem(b60,HG),P3:rem(b60,P3)};
assert.deepEqual(r59,{H:[17,20],G:[12,22],HG:[7,1,19,8],P3:[10,22]});
assert.deepEqual(r60,{H:[0,0],G:[0,0],HG:[0,0,0,0],P3:[26,18]});

// An independently constructed 252-slot quotient exactly passes all four
// parity constraints, while corrupting its last coefficient fails.
const arbitrary252 = Array.from({length:252},(_,i)=>(11*i+7)%29);
const plant = Array(256).fill(0);
for(let i=0;i<252;i++)for(let j=0;j<5;j++) {
  plant[i+j] = mod(plant[i+j]+arbitrary252[i]*HG[j]);
}
assert.deepEqual(rem(plant,HG),[0,0,0,0]);
const broken = plant.slice();broken[255] = mod(broken[255]+1);
assert.notDeepEqual(rem(broken,HG),[0,0,0,0]);

// Every original 18 red passage spans, both printed-source orientations.
const runeOrdinal = new Map(corpus.runes.map((r,i)=>[r,i]));
const pageByN = new Map(corpus.pages.map(p=>[p.page,p]));
/** @type {Array<{page:number,start:number,length:number,direction:string,base59:boolean,base60:boolean}>} */
const checks = [];
for (const page of ink.pages) {
  const indexedPage=pageByN.get(page.page);
  assert.ok(indexedPage);
  for (const span of (page.red_spans||[])) {
    const red = Array.from(span.runes,r=>runeOrdinal.get(r));
    assert.equal(red.length,span.length);
    assert.deepEqual(indexedPage.indices.slice(span.start,span.start+span.length),red);
    for (const direction of ['forward','reverse']) {
      const printed = direction==='forward'?red:red.slice().reverse();
      const poly=printed.slice().reverse(); // descending form of printed ascending coefficients
      checks.push({
        page:page.page,start:span.start,length:span.length,direction,
        base59:rem(b59,poly).every(x=>x===0),
        base60:rem(b60,poly).every(x=>x===0)
      });
    }
  }
}
assert.equal(checks.length,36);
assert.deepEqual(checks.filter(x=>x.base59),[]);
assert.deepEqual(checks.filter(x=>x.base60),[
  {page:39,start:119,length:3,direction:'forward',base59:false,base60:true}
]);

const highTokens = tokens.map((token,i)=>({i,token,byte:b60[i]}))
  .filter(x=>x.byte>=252);
assert.deepEqual(highTokens,[
  {i:48,token:'4D',byte:253},
  {i:56,token:'4E',byte:254},
  {i:65,token:'4F',byte:255},
  {i:170,token:'4E',byte:254}
]);
console.log(JSON.stringify({
  originalTokens:256,alternativeAlphabets:[59,60],
  base59:{sha256:sha256(b59),firstByte:b59[0],max:251,high252:0,remainders:r59},
  base60:{sha256:sha256(b60),firstByte:b60[0],max:255,high252:4,remainders:r60},
  differentBytes:220,highTokens,originalRedSpans:18,redReadings:checks.length,
  redDivisors59:0,redDivisors60:checks.filter(x=>x.base60),plant:'PASS',
  conclusion:'Under original descending GF29 polynomialization, full base60 satisfies independent 2013 H and p39 G; missing-f base59 satisfies neither.'
},null,2));
