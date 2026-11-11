'use strict';

/**
 * Physically fold the original 11x11 p32 tree sheet's two outer margin
 * rows/columns toward its centered 7x7 canvas, preserving all 72 margin
 * runes as the known reversible key. Source motivation: original p14
 * complete GP word FOLD, original tree page p32, solved PARABLE's instruction
 * to shed circumferences, and 2014 historical seven-square.
 *
 * Exact native-GP29 finite inverse, native controls and English holdouts;
 * the fold and overlay rules remain hypothesized, not authenticated.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const page = corpus.pages.find((p) => p.page === 32).indices;
const squareText = fs.readFileSync(path.join(
  root, 'resources/cicada2014-openpuff-magic-squares.txt'), 'utf8');
const magic = squareText.trim().split(/\r?\n\s*\r?\n/)[1]
  .trim().split(/\r?\n/).map((x) => x.trim().split(/\s+/).map(Number));
const mod = (x) => (x % 29 + 29) % 29;
assert.equal(page.length, 121);
assert.equal(magic.length, 7);
assert.ok(magic.every((row) => row.length === 7));
const image = Array.from({length: 11}, (_, r) => page.slice(r * 11, r * 11 + 11));
const totalX = image[0].reduce((a, x) => a + corpus.prime[x], 0);
const totalY = image.reduce((a, row) => a + corpus.prime[row[0]], 0);
assert.deepEqual([totalX, totalY], [563, 569]);
/** @param {number} i @returns {number} */
function foldedCoordinate(i) {
  if (i < 2) return 1 - i;
  if (i > 8) return 15 - i;
  return i - 2;
}
const margin = [];
const pads = Array.from({length: 7}, () => Array(7).fill(0));
const multiplicities = Array.from({length: 7}, () => Array(7).fill(0));
for (let r = 0; r < 11; r++) for (let c = 0; c < 11; c++) {
  if (r >= 2 && r <= 8 && c >= 2 && c <= 8) continue;
  const a = foldedCoordinate(r), b = foldedCoordinate(c);
  pads[a][b] = mod(pads[a][b] + image[r][c]);
  multiplicities[a][b]++;
  margin.push({r,c,v:image[r][c]});
}
assert.equal(margin.length, 72);
assert.equal(multiplicities.flat().reduce((a,b) => a+b, 0), 72);
assert.equal(multiplicities[3][3], 0);
assert.equal(multiplicities[0][0], 3);
assert.equal(multiplicities[0][2], 1);
const inner = Array.from({length: 7}, (_, r) => image[r+2].slice(2, 9));

const gp = new Map(corpus.translit.map((x,i) => [x,i]));
gp.set('ING', 21);
/** @param {string} txt @returns {number[]} */
function englishGP(txt) {
  const result = [];
  const upper = txt.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S');
  for (const word of upper.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      let hit = null;
      for (const len of [3,2,1]) {
        const part = word.slice(i, i+len);
        if (gp.has(part)) {hit=part;break;}
      }
      assert.ok(hit);
      result.push(gp.get(hit));
      i += hit.length;
    }
  }
  return result;
}
const english = englishGP(fs.readFileSync(
  path.join(root, 'resources/control/emerson_essays_2944.txt'), 'utf8'));
assert.ok(english.length > 270000);
const counts = new Uint32Array(29**3);
for (let i = 2; i < 50000; i++)
  counts[english[i-2] * 841 + english[i-1] * 29 + english[i]]++;
const smooth = .2, denominator = 49998 + counts.length * smooth;
/** @param {number[][]} rows @returns {number} */
function score(rows) {
  let log=0,n=0;
  for (const row of rows) for (let c=2;c<row.length;c++,n++) {
    log += Math.log((counts[row[c-2]*841 + row[c-1]*29 + row[c]] + smooth) /
      denominator);
  }
  return log/n;
}
/** @param {number} value @returns {number} */
function totient(value) {
  let n=value, out=n;
  for (let f=2;f*f<=n;f++) if(n%f===0) {
    while(n%f===0)n/=f;
    out-=out/f;
  }
  if(n>1)out-=out/n;
  return out;
}
/** @param {number} r @param {number} c @param {number} variant */
function orient(r,c,variant) {
  if(variant&4)c=6-c;
  for(let i=0;i<(variant&3);i++)[r,c]=[c,6-r];
  return [r,c];
}
/**
 * @param {'raw'|'totient'|'none'} method
 * @param {number} orientation
 */
function squareMask(method,orientation) {
  return Array.from({length:7},(_,r)=>Array.from({length:7},(_,c)=>{
    if(method==='none')return 0;
    const [y,x]=orient(r,c,orientation);
    return method==='raw'?magic[y][x]:totient(magic[y][x]);
  }));
}
/** @param {number[][]} payload @param {number[][]} key @param {number} foldSign @param {number} squareSign */
function transform(payload,key,foldSign,squareSign) {
  return payload.map((row,r)=>row.map((x,c)=>
    mod(x + foldSign*pads[r][c] + squareSign*key[r][c])));
}
const variants=[];
const none = squareMask('none',0);
for(const fs of [-1,1]) {
  const decoded=transform(inner,none,fs,0);
  assert.deepEqual(transform(decoded,none,-fs,0),inner);
  variants.push({method:'fold-only',foldSign:fs,squareSign:0,
    orientation:0, score:score(decoded),preview:decoded.map(row=>row.map(x=>corpus.translit[x]).join('')).join('/')});
}
for(const method of ['raw','totient'])
  for(const foldSign of [-1,1])
    for(const squareSign of [-1,1])
      for(let orientation=0;orientation<8;orientation++) {
        const mask=squareMask(method,orientation);
        const plain=transform(inner,mask,foldSign,squareSign);
        assert.deepEqual(transform(plain,mask,-foldSign,-squareSign),inner);
        variants.push({method,foldSign,squareSign,orientation,
          score:score(plain),preview:plain.map(row=>row.map(x=>corpus.translit[x]).join('')).join('/')});
      }

const native = Array.from({length:7},(_,r)=>
  Array.from({length:7},(_,c)=>english[62000+r*7+c]));
for(const row of variants) {
  const mask=squareMask(row.method==='fold-only'?'none':row.method,row.orientation);
  const encoded=transform(native,mask,-row.foldSign,-row.squareSign);
  assert.deepEqual(transform(encoded,mask,row.foldSign,row.squareSign),native);
}
const controls=[];
for(let i=0;i<1000;i++) {
  const at=70000+i*197;
  controls.push(score(Array.from({length:7},(_,r)=>
    Array.from({length:7},(_,c)=>english[at+r*7+c]))));
}
controls.sort((a,b)=>a-b);
variants.sort((a,b)=>b.score-a.score);
const best=variants[0];
assert.ok(best.score<controls[0], 'original plaintext candidate exceeded matched native holdouts');
const summary = {
  conclusion:'source-motivated two-ring FOLD plus 2014 7x7 original-inverse family; bounded negative, no recovered plaintext',
  imageTree:[totalX,totalY], originalSquare:11, marginRunes:72,
  centralRunes:49, foldMultiplicity:multiplicities, variants:variants.length,
  originalRawScore:score(inner), best, foldOnly:variants.filter(v=>v.method==='fold-only'),
  bestWithMagic:variants.find(v=>v.method!=='fold-only'),
  nativeGPControlScore:score(native), nativeEnglishMin:controls[0],
  nativeEnglishMedian:controls[500], originalsBeatingHoldouts:controls.filter(x=>best.score>=x).length,
  originalRoundtripSymbols:variants.length*49, plantedNativeRecovered:variants.length*49,
  bestEight:variants.slice(0,8)
};
console.log(JSON.stringify(summary,null,2));
