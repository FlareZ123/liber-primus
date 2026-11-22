'use strict';
/**
 * Exact source-side linear-membership gate for the 32 red-rune runs bounded
 * by 31 thirteen-dot stencils, versus the 32 printed numeric-grid rows.
 *
 * Test both published numeral interpretations and every 32-row cyclic/reverse
 * alignment. Every grid column has a freely unknown affine coefficient.
 *
 * Reproduction: node sims/red_run_grid_affine_membership.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const ink = read('resources/liber-primus/lp2-ink-annotations.json');
const grid = read('resources/liber-primus/base60-grid.json');
const alphabet60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alphabet59 = alphabet60.replace('f', '');
const runFingerprint = [13,0,16,0,3,0,11,0,0,14,12,0,9,11,0,16,
  0,19,0,10,0,8,0,3,0,59,9,0,5,0,7,0];

/** @returns {number[]} */
function redRunLengths() {
  /** @type {{page:number, offset:number, type:number}[]} */
  const events = [];
  for (const page of ink.pages) {
    for (const span of page.red_spans || []) {
      const runes = [...span.runes];
      assert.equal(runes.length, span.length);
      for (let k = 0; k < runes.length; k++)
        events.push({page:page.page, offset:span.start+k, type:1});
    }
    for (const [offset, dots] of page.large_punctuation || [])
      if (dots === 13)
        events.push({page:page.page, offset, type:0});
  }
  events.sort((a,b) => a.page-b.page || a.offset-b.offset || a.type-b.type);
  const lengths = [0];
  for (const event of events) {
    if (event.type === 0) lengths.push(0);
    else lengths[lengths.length-1]++;
  }
  assert.equal(events.length, 256);
  assert.deepEqual(lengths, runFingerprint);
  assert.equal(lengths.reduce((sum,x)=>sum+x,0), 225);
  return lengths;
}

/** @param {string} alphabet @param {number} radix @returns {number[][]} */
function table(alphabet, radix) {
  assert.equal(grid.rows.length, 32);
  return grid.rows.map((row) => {
    assert.equal(row.length, 8);
    return row.map((token) => {
      assert.equal(token.length, 2);
      const hi = alphabet.indexOf(token[0]);
      const lo = alphabet.indexOf(token[1]);
      assert.ok(hi >= 0 && lo >= 0);
      const value = radix*hi+lo;
      assert.ok(value >= 0 && value <= 255);
      return value;
    });
  });
}

/** @param {number} a @param {number} b */
function aesMul(a, b) {
  let result = 0;
  while (b > 0) {
    if (b & 1) result ^= a;
    a = (a << 1) ^ ((a & 128) ? 0x11b : 0);
    b >>>= 1;
  }
  return result;
}
/** @param {number} a @param {number} exp @param {(a:number,b:number)=>number} mul */
function power(a, exp, mul) {
  let result = 1;
  while (exp > 0) {
    if (exp & 1) result = mul(result,a);
    a = mul(a,a);
    exp = Math.floor(exp/2);
  }
  return result;
}
/**
 * @param {number} field Either a prime, or 256 for GF(2^8) with AES polynomial.
 */
function arithmetic(field) {
  const mod = (x) => (x%field+field)%field;
  if (field === 256) {
    return {reduce:(x)=>x, add:(a,b)=>a^b, mul:aesMul,
      neg:(x)=>x, inv:(x)=>power(x,254,aesMul)};
  }
  const mul = (a,b) => mod(a*b);
  return {reduce:mod, add:(a,b)=>mod(a+b), mul,
    neg:(x)=>mod(-x), inv:(x)=>power(x,field-2,mul)};
}
/**
 * Exact finite-field row rank. Input is copied before elimination.
 * @param {number[][]} original
 * @param {ReturnType<typeof arithmetic>} op
 */
function rank(original, op) {
  const x = original.map(row=>row.map(op.reduce));
  let r = 0;
  for (let col=0;col<x[0].length && r<x.length;col++) {
    let pivot=r;
    while (pivot<x.length && x[pivot][col]===0) pivot++;
    if (pivot===x.length) continue;
    [x[r],x[pivot]]=[x[pivot],x[r]];
    const reciprocal=op.inv(x[r][col]);
    for (let j=col;j<x[r].length;j++)
      x[r][j]=op.mul(x[r][j],reciprocal);
    for (let i=r+1;i<x.length;i++) {
      const v=x[i][col];
      if (!v) continue;
      for (let j=col;j<x[i].length;j++)
        x[i][j]=op.add(x[i][j],op.neg(op.mul(v,x[r][j])));
    }
    r++;
  }
  return r;
}
/** @param {number[][]} rows @param {number[]} lengths @param {number} field */
function probe(rows, lengths, field) {
  const op=arithmetic(field);
  const x=rows.map(row=>[1,...row.map(op.reduce)]);
  const baseRank=rank(x,op);
  assert.equal(baseRank,9);
  const knownKey=[3,1,4,1,5,9,2,6,5].map(op.reduce);
  const synthetic=x.map(row=>row.reduce((sum,value,j)=>
    op.add(sum,op.mul(value,knownKey[j])),0));
  assert.equal(rank(x.map((row,i)=>[...row,synthetic[i]]),op),baseRank);
  const corrupted=synthetic.slice();
  corrupted[31]=op.add(corrupted[31],1);
  assert.equal(rank(x.map((row,i)=>[...row,corrupted[i]]),op),baseRank+1);
  const fits=[];
  let canonicalAugmentedRank=0;
  let canonicalFirstConflict=0;
  for (const direction of [1,-1]) {
    for (let phase=0;phase<32;phase++) {
      const y=x.map((_,i)=>op.reduce(lengths[(phase+direction*i+3200)%32]));
      const z=x.map((row,i)=>[...row,y[i]]);
      const augmentedRank=rank(z,op);
      if (augmentedRank===baseRank) fits.push({phase,direction});
      if (phase===0 && direction===1) {
        canonicalAugmentedRank=augmentedRank;
        for (let n=1;n<=32;n++) {
          if (rank(z.slice(0,n),op)>rank(x.slice(0,n),op)) {
            canonicalFirstConflict=n;
            break;
          }
        }
      }
    }
  }
  assert.equal(canonicalAugmentedRank,10);
  assert.equal(fits.length,0);
  return {field:field===256?'GF(2^8)-AES':String(field),
    baseRank, canonicalAugmentedRank, canonicalFirstConflict,
    affineFitsAcross64Alignments:fits.length,
    syntheticExact:true,syntheticSingleMutationRejected:true};
}
function main() {
  const lengths=redRunLengths();
  const report=[];
  for (const [radix,alphabet] of [[60,alphabet60],[59,alphabet59]]) {
    const rows=table(alphabet,radix);
    if(radix===60)assert.deepEqual(rows,grid.byte_rows);
    for(const field of [2,29,59,257,256])
      report.push({radix,...probe(rows,lengths,field)});
  }
  const output={classification:'conditional exact source-to-source exclusion',
    observedRed:225,observedThirteenDots:31,
    sourceIntervalLengths:lengths,gridDimensions:[32,8],
    fieldModels:report.length,totalOriginalAlignments:report.length*64,
    positiveControls:report.length,
    tests:report,
    interpretation:'No fixed affine checksum from eight grid bytes to each red-run length under either source numeral codec and any cyclic/reversed 32-row pairing. No plaintext or original key recovered.'};
  console.log(JSON.stringify(output,null,2));
}
if (require.main===module) main();
module.exports={redRunLengths,table,arithmetic,rank,probe};
