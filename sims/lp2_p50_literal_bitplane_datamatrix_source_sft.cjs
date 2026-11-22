'use strict';

/**
 * Original LP2 p49–p51 printed 32x8 table; test a human-visible Data Matrix
 * ECC 200 bitmap with a *standard* L finder, not a cryptographic key sweep.
 *
 * Source: ISO/IEC 16022:2006 §4.3.1, GS1 DataMatrix technical overview.
 * ECC200 border has solid dark left+bottom edges, alternating top+right.
 * 32x8 itself rotates to the valid 8x32 ECC200 rectangle. 256 cells can
 * also fold into a valid 16x16 ECC200 square in only three natural ways.
 *
 * Fixed byte readings base60 and base59-without-f; 8 literal bitplanes,
 * the 8 square symmetries and color inversion. No offsets, KDFs, added
 * padding, searched keys, arbitrary bit permutations or JPEG pixel edits.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(path.resolve(
  __dirname, '../resources/liber-primus/base60-grid.json'), 'utf8'));
assert.deepEqual(source.page_row_counts, [10,13,9]);
assert.equal(source.rows.length, 32);
assert.ok(source.rows.every(row => row.length === 8));
const fullAlphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
assert.equal(fullAlphabet.length, 60);
const readingAlphabets = {
  base60: fullAlphabet,
  base59_without_f: fullAlphabet.replace('f','')
};

/**
 * @param {string} alphabet
 * @returns {number[][]}
 */
function readBytes(alphabet) {
  const radix = alphabet.length;
  return source.rows.map(row => row.map(s => {
    assert.equal(s.length, 2);
    const a = alphabet.indexOf(s[0]), b = alphabet.indexOf(s[1]);
    assert.ok(a >= 0 && b >= 0);
    const v = a * radix + b;
    assert.ok(v >= 0 && v <= 255);
    return v;
  }));
}

/** @param {number[][]} m @returns {number[][]} */
function rotate(m) {
  const h=m.length, w=m[0].length;
  return Array.from({length:w}, (_,y) =>
    Array.from({length:h}, (_,x) => m[h-1-x][y]));
}

/** @param {number[][]} m @returns {number[][]} */
function mirror(m) { return m.map(r=>r.slice().reverse()); }

/**
 * Exact ECC200 perimeter, corners counted once.
 * @param {number[][]} m
 * @returns {{hits:number,required:number}}
 */
function finder(m) {
  const h=m.length,w=m[0].length;
  let hits=0, required=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    if(x!==0 && x!==w-1 && y!==0 && y!==h-1)continue;
    const ideal=x===0||y===h-1?1:y===0?(1-(x&1)):(y&1);
    required++;
    if(m[y][x]===ideal)hits++;
  }
  assert.equal(required, 2*h+2*w-4);
  return {hits,required};
}

/**
 * @param {number[][]} original
 * @param {number} bit
 * @param {'rectangle'|'pairRows'|'pairColumns'|'sideBySide'} form
 * @returns {number[][]}
 */
function formBits(original,bit,form){
  const b=original.map(row=>row.map(v=>(v>>bit)&1));
  if(form==='rectangle')return b;
  if(form==='pairRows'){
    const flat=b.flat();
    return Array.from({length:16},(_,y)=>flat.slice(y*16,y*16+16));
  }
  if(form==='pairColumns'){
    const flat=Array.from({length:8},(_,x)=>b.map(row=>row[x])).flat();
    return Array.from({length:16},(_,y)=>flat.slice(y*16,y*16+16));
  }
  return Array.from({length:16},(_,y)=>[...b[y],...b[y+16]]);
}

/** @param {number[][]} bytes @returns {object[]} */
function test(bytes){
  const candidates=[];
  for(let bit=0;bit<8;bit++)for(const form of
    ['rectangle','pairRows','pairColumns','sideBySide']){
    let m=formBits(bytes,bit,form);
    for(let quarter=0;quarter<4;quarter++){
      for(const flip of [false,true]){
        const t=flip?mirror(m):m;
        for(const inverse of [false,true]){
          const o=inverse?t.map(row=>row.map(v=>1-v)):t;
          const res=finder(o);
          candidates.push({form,bit,quarter,flip,inverse,...res});
        }
      }
      m=rotate(m);
    }
  }
  assert.equal(candidates.length, 512);
  return candidates;
}

function plant(original,kind) {
  const src=original.map(row=>row.slice());
  let ideal;
  if(kind==='rectangle'){
    // An 8x32 ECC200 symbol is the printed 32x8 matrix rotated 90°.
    ideal=rotate(src.map(row=>row.map(v=>v&1)));
  } else {
    ideal=Array.from({length:16},(_,i)=>src.flat().slice(i*16,i*16+16).map(v=>v&1));
  }
  const h=ideal.length,w=ideal[0].length;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    if(x===0||x===w-1||y===0||y===h-1)
      ideal[y][x]=x===0||y===h-1?1:y===0?(1-(x&1)):(y&1);
  }
  let result;
  if(kind==='rectangle'){
    result=ideal;
    for(let i=0;i<3;i++)result=rotate(result);
  }else{
    const flat=ideal.flat();
    result=Array.from({length:32},(_,i)=>flat.slice(i*8,i*8+8));
  }
  return src.map((row,y)=>row.map((v,x)=>(v&254)|result[y][x]));
}

const reports={};
for(const [reading,alphabet] of Object.entries(readingAlphabets)){
  const bytes=readBytes(alphabet);
  if(reading==='base60')assert.deepEqual(bytes,source.byte_rows);
  const combos=test(bytes);
  const out={};
  for(const kind of ['rectangle','square']){
    const sub=combos.filter(c=>kind==='rectangle'?c.form==='rectangle':c.form!=='rectangle');
    sub.sort((a,b)=>b.hits-a.hits);
    const best=sub[0];
    const exact=sub.filter(c=>c.hits===c.required);
    out[kind]={
      candidates:sub.length, bestHits:best.hits, required:best.required,
      bestProgram:{form:best.form,bit:best.bit,rotateQuarterTurns:best.quarter,
        mirror:best.flip,reverseBlackWhite:best.inverse},
      exactFinderCount:exact.length
    };
    assert.equal(exact.length,0,'unexpected authentic ECC200 finder; investigate');
  }
  reports[reading]=out;
}

const original=readBytes(fullAlphabet);
const plantedRect=test(plant(original,'rectangle')).filter(c=>c.form==='rectangle');
const plantedSquare=test(plant(original,'square')).filter(c=>c.form==='pairRows');
assert.ok(plantedRect.some(c=>c.hits===76 && c.required===76));
assert.ok(plantedSquare.some(c=>c.hits===60 && c.required===60));

console.log(JSON.stringify({
 source:'original LP2 physical p49–51 32 x 8 base60 written cells',
 barcode:'Data Matrix ECC200 8x32 rectangular or 16x16 square',
 validation:'official fixed L/alternating-edge finder, exact perimeter',
 sourceReadingVariants:Object.keys(readingAlphabets),
 familywiseCandidateCount:1024,
 independentSyntheticPlants:{originalSize:256,rectangularFinderRecovered:true,
   squareFinderRecovered:true},
 reports,
 decision:'No authentic complete finder. The visible 32x8 byte grid is not a literal bitplane ECC200 Data Matrix under these two source readings and natural folds. This does not constrain other ciphertext objects or hidden keys.'
},null,2));
