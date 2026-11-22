'use strict';

/**
 * Exact all-secret p33 49-word 2014-square additive word-checksum gate.
 *
 * Necessary condition tested: there exists a stationary, completely unknown
 * assignment f of 29 GP rune values to GF29 such that every complete p33
 * printed word, interpreted through f and summed, equals its cell in the
 * authentic Cicada 2014 7x7 magic square modulo29.
 *
 * Enumerates all 8 D4 square orientations. Matrix row reduction proves
 * whether ANY such assignment exists, even non-injective values.
 *
 * Windows 11 / Node.js 22: node sims/lp2_p33_49word_allsecret_square_check_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const load = relative => fs.readFileSync(path.join(root, relative), 'utf8').replace(/\r/g, '');
const corpus = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const page = load('resources/liber-primus/lp2-transcription.txt').split('\n%\n');
const matrices = load('resources/cicada2014-openpuff-magic-squares.txt').trim().split(/\n\s*\n/);
const square = matrices[1].trim().split(/\n/).flatMap(s => s.trim().split(/\s+/).map(Number));

assert.equal(page.length, 57);
assert.equal(square.length, 49);
for (let i = 0; i < 7; i++) {
  assert.equal(square.slice(i * 7, i * 7 + 7).reduce((a, b) => a + b, 0), 1033);
  assert.equal(Array.from({length:7}, (_, j) => square[j * 7 + i]).reduce((a,b)=>a+b,0), 1033);
}

const parts = page[33].replace(/[\s/]/g, '').split('&');
assert.equal(parts.length, 2);
const wordGroups = parts.map(s => s.slice(s.indexOf('.') + 1).split(/[-.]/).filter(Boolean));
assert.deepEqual(wordGroups.map(x => x.length), [21,28]);
const words = wordGroups.flat();
assert.equal(words.length, 49);
assert.equal(words[48], 'ᛒ');
assert.ok(page[34].replace(/[\s/]/g, '').startsWith('ᛗᛒ-'));
words[48] += 'ᛗᛒ';
assert.equal(words.reduce((n,word)=>n+[...word].length,0),198);

const index = new Map(corpus.runes.map((r,i) => [r,i]));
const rows = words.map(word => {
  const counts = Array(29).fill(0);
  for (const rune of word) {
    assert.ok(index.has(rune));
    counts[index.get(rune)]++;
  }
  return counts;
});

const mod = n => ((n % 29) + 29) % 29;

/**
 * Field-GF29 Gauss-Jordan solve, with explicit contradiction count.
 * The coefficient assignment is unrestricted: 29^29 possible f maps.
 * @param {number[][]} coefficients
 * @param {number[]} targets
 */
function checkLinearSystem(coefficients, targets) {
  assert.equal(coefficients.length, targets.length);
  const n=29, m=targets.length;
  const a=coefficients.map((r,i) => {
    assert.equal(r.length, 29);
    return [...r.map(mod),mod(targets[i])];
  });
  let rank=0;
  for(let column=0;column<n&&rank<m;column++){
    let pivot=rank;
    while(pivot<m&&a[pivot][column]===0)pivot++;
    if(pivot===m)continue;
    [a[rank],a[pivot]]=[a[pivot],a[rank]];
    let inverse=1;
    while((a[rank][column]*inverse)%29!==1)inverse++;
    for(let j=column;j<=n;j++)a[rank][j]=mod(a[rank][j]*inverse);
    for(let i=0;i<m;i++){
      if(i===rank)continue;
      const factor=a[i][column];
      for(let j=column;j<=n;j++)a[i][j]=mod(a[i][j]-factor*a[rank][j]);
    }
    rank++;
  }
  const contradictions=a.filter(row=>row.slice(0,n).every(x=>x===0)&&row[n]!==0).length;
  return {rank, contradictions, consistent:contradictions===0};
}

/**
 * Source-visible square rotations/reflections, not fitted word permutations.
 * @param {number} transform 0..7, vertical flip, horizontal flip, transpose.
 */
function targetSquare(transform){
  return Array.from({length:49},(_,i)=>{
    const r=Math.floor(i/7),c=i%7;
    const x=(transform&1)?6-r:r, y=(transform&2)?6-c:c;
    return mod(square[(transform&4)?y*7+x:x*7+y]);
  });
}

const authenticValue = corpus.prime.map(mod);
const synthetic = rows.map(row => mod(row.reduce((sum,v,i)=>sum+v*authenticValue[i],0)));

assert.equal(checkLinearSystem(rows,synthetic).consistent,true,
  'Original 49 word shapes admit native-true GP prime-sum plant');
assert.equal(checkLinearSystem(rows.slice(0,29),synthetic.slice(0,29)).consistent,true);
console.log('Original p33 21+28 black words: 49 complete source words, including 2 carried p34 runes.');
console.log('Actual original Stage7 7x7/1033 magic square, 8 D4 fixed orientations.');
console.log('Unknown f: every possible assignment of 29 ciphertext rune values to GF29, even nonbijective.');

let early=0;
for(let t=0;t<8;t++){
  const target=targetSquare(t);
  const full=checkLinearSystem(rows,target);
  let firstConflict=0;
  for(let k=1;k<=49;k++){
    if(!checkLinearSystem(rows.slice(0,k),target.slice(0,k)).consistent){
      firstConflict=k;
      break;
    }
  }
  assert.equal(full.rank,29);
  assert.equal(full.consistent,false);
  assert.ok(firstConflict>=29&&firstConflict<=31);
  early=Math.max(early,firstConflict);
  console.log(`D4 ${t}: 49-word rank=${full.rank}; exact contradictions=${full.contradictions}; first contradictory original word=${firstConflict}`);
}
assert.equal(early,31);
console.log('PASS: source-native positive consistent, 8/8 source-square orientations impossible for ANY stationary secret rune→GF29 value map.');
