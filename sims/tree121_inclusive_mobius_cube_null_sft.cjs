'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const repo=path.resolve(__dirname,'..');
const original=JSON.parse(fs.readFileSync(path.join(repo,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const page32=original.pages.find(x=>x.page===32);
assert.equal(page32.indices.length,121);
const prime=page32.indices.map(i=>original.prime[i]);
const x=prime.slice(0,11).reduce((a,b)=>a+b,0);
const y=Array.from({length:11},(_,r)=>prime[r*11]).reduce((a,b)=>a+b,0);
assert.deepEqual([x,y],[563,569]);

const ring=[];
for(let c=3;c<=7;c++)ring.push(11*3+c);
for(let r=4;r<=7;r++)ring.push(11*r+7);
for(let c=6;c>=3;c--)ring.push(11*7+c);
for(let r=6;r>=4;r--)ring.push(11*r+3);
assert.equal(ring.length,16);

const mod=x=>((x%29)+29)%29;
/** @param {number[]} p @returns {[number,number,number,number]} */
function sides(p){
  const v=ring.map(i=>p[i]);
  return [
    v.slice(0,5).reduce((a,b)=>a+b,0),
    v.slice(4,9).reduce((a,b)=>a+b,0),
    v.slice(8,13).reduce((a,b)=>a+b,0),
    v[0]+v.slice(12).reduce((a,b)=>a+b,0)
  ];
}
const actual=sides(prime);
assert.deepEqual(actual,[275,347,373,339]);
const matrix=actual.map(mod);
assert.deepEqual(matrix,[14,28,25,20]);
const trace=mod(matrix[0]+matrix[3]);
const determinant=mod(matrix[0]*matrix[3]-matrix[1]*matrix[2]);
assert.deepEqual([trace,determinant],[5,15]);
assert.equal(mod(4*matrix[2]*matrix[2]*mod(x)*mod(x)),23);
assert.equal(ring.map(i=>prime[i]).reduce((a,b)=>a+b,0),1136);

// Freeze the first row and first column, preserving the exact 2016
// dimension checksums. Shuffle only the other 100 real GP-prime values.
const free=[];
for(let r=1;r<11;r++)for(let c=1;c<11;c++)free.push(11*r+c);
assert.equal(free.length,100);
const sample=free.map(i=>prime[i]);
const permuted=prime.slice();
const SEED=0x56356929,TRIALS=200000;
let rngState=SEED;
function rand(limit){
  rngState^=rngState<<13;
  rngState^=rngState>>>17;
  rngState^=rngState<<5;
  return (rngState>>>0)%limit;
}
let traceMatches=0,fullCharacteristic=0,fullAndImageWidth=0,ringLength=0,allMatches=0;
for(let t=0;t<TRIALS;t++){
  for(let i=99;i>0;i--){const j=rand(i+1);[sample[i],sample[j]]=[sample[j],sample[i]];}
  for(let i=0;i<100;i++)permuted[free[i]]=sample[i];
  const [a,b,c,d]=sides(permuted).map(mod);
  const tr=mod(a+d),det=mod(a*d-b*c);
  const total=ring.map(i=>permuted[i]).reduce((sum,v)=>sum+v,0);
  if(tr===5)traceMatches++;
  if(total===1136)ringLength++;
  if(tr===5&&det===15){
    fullCharacteristic++;
    // With fixed trace and determinant, discriminant=23, and
    // half the finite-fixed-point separation must equal ±(563 mod29).
    if(c!==0&&mod(4*c*c*mod(x)*mod(x))===23){
      fullAndImageWidth++;
      if(total===1136)allMatches++;
    }
  }
}
assert.deepEqual([traceMatches,fullCharacteristic,fullAndImageWidth,ringLength,allMatches],[6841,246,16,31,0]);
const pathPages=original.pages.filter(p=>p.page<=55);
const stream=pathPages.flatMap(p=>p.indices);
const p32Start=pathPages.filter(p=>p.page<32).reduce((n,p)=>n+p.indices.length,0);
assert.equal(p32Start,7839);
/** @param {number} z @returns {number|null} */
function invariant(z){
  if(z===20)return null;
  const denom=mod(z-20);
  for(let k=1;k<29;k++)if(mod(denom*k)===1)return mod((z-25)*k);
  throw Error('noninvertible denominator');
}
/** @param {number} start @returns {number|null} */
function product(start){
  let val=1;
  for(let j=0;j<4;j++){
    const h=invariant(stream[start+j]);
    if(h===null)return null;
    val=mod(val*h);
  }
  return val;
}
const anchors=Array.from({length:6},(_,i)=>{
  const step=i-1,offset=p32Start+33+step*60;
  return {step,global_offset:offset,physical_page:step>=2?33:step<0?31:32,
    gp_four:stream.slice(offset,offset+4).map(j=>original.translit[j]).join(' '),product:product(offset)};
});
assert.deepEqual(anchors.map(x=>x.product),[18,24,24,24,23,4]);

console.log(JSON.stringify({
  status:'conditional original-source geometry shuffle; retrospective, not a decryption',
  source:{p32Glyphs:121,imageSize:[x,y],ringLength:1136,characteristic:{trace,determinant,discriminant:23},widthResidue:mod(x)},
  null:{seed:'0x56356929',trials:TRIALS,axisFrozenCount:21,shuffledInteriorCount:100,
    traceMatches,fullCharacteristic,fullAndImageWidth,ringLength,allMatches,
    combinedWidthCharacteristicFrequency:(fullAndImageWidth+1)/(TRIALS+1)},
  translatedFourRuneProducts:anchors,
  interpretation:'The cubic-conjugacy plus image-width condition is unusual under this fixed-axis shuffle, but the matrix and feature set were discovered retrospectively; 60-step product-24 continuation fails after three samples and does not authenticate a plaintext rule.'
},null,2));
