'use strict';
/**
 * Director #2206. Decode the exact original LP2 pp49-51 final eight
 * printed 8-token rows as two 8×64 one-bit rasters or an 8×8 grayscale
 * image, with all 24 earlier eight-row windows as original-source controls.
 *
 * Read only: node sims/lp2_p50_final8_raster_source_sft.cjs
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const source=JSON.parse(fs.readFileSync(
 path.resolve(__dirname,'../resources/liber-primus/lp2-grid-256.json'),'utf8'));
const alphabet60='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alphabet59=alphabet60.replace('f','');
const tokens=source.pages.flatMap(page=>page.tokens);
assert.equal(tokens.length,256);
assert.equal(source.alphabet,alphabet60);
assert.equal(tokens[192],'00');
assert.equal(tokens[229],'00');
/** @param {string} token @param {string} alphabet */
function decode(token,alphabet){
 assert.equal(token.length,2);
 const hi=alphabet.indexOf(token[0]),lo=alphabet.indexOf(token[1]);
 assert.ok(hi>=0&&lo>=0);
 const v=hi*alphabet.length+lo;
 assert.ok(v>=0&&v<=255);
 return v;
}
const vectors=[
 {radix:60,bytes:tokens.map(t=>decode(t,alphabet60))},
 {radix:59,bytes:tokens.map(t=>decode(t,alphabet59))}
];
assert.deepEqual(vectors[0].bytes,source.bytes);
const expected='3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290';
assert.equal(createHash('sha256').update(Buffer.from(source.bytes)).digest('hex'),expected);
/**
 * Expanded bitplane is 8 printed source rows of 8 bytes each, every
 * source byte becoming a horizontal run of eight pixels.
 * @param {number[]} input 64 source bytes
 * @param {"MSB"|"LSB"} bitOrder
 * @returns {number[][]}
 */
function expand(input,bitOrder){
 assert.equal(input.length,64);
 return Array.from({length:8},(_,y)=>
  Array.from({length:64},(_,x)=>{
   const byte=input[y*8+Math.floor(x/8)];
   const shift=bitOrder==='MSB'?7-x%8:x%8;
   return (byte>>>shift)&1;
  }));
}
/** @param {number[][]} image @param {"MSB"|"LSB"} bitOrder */
function pack(image,bitOrder){
 assert.equal(image.length,8);
 const output=[];
 for(const row of image){
  assert.equal(row.length,64);
  for(let group=0;group<8;group++){
   let byte=0;
   for(let bit=0;bit<8;bit++){
    const value=row[group*8+bit];
    assert.ok(value===0||value===1);
    byte|=value<<(bitOrder==='MSB'?7-bit:bit);
   }
   output.push(byte);
  }
 }
 return output;
}
/** @param {number[][]} image */
function metrics(image){
 const ones=image.flat().reduce((a,b)=>a+b,0);
 let horizontal=0,vertical=0,emptyCols=0,fullCols=0,glyphPadEmpty=0;
 for(let y=0;y<8;y++)for(let x=0;x<63;x++)horizontal+=+(image[y][x]===image[y][x+1]);
 for(let y=0;y<7;y++)for(let x=0;x<64;x++)vertical+=+(image[y][x]===image[y+1][x]);
 for(let x=0;x<64;x++){
  const sum=Array.from({length:8},(_,y)=>image[y][x]).reduce((a,b)=>a+b,0);
  emptyCols+=+(sum===0);
  fullCols+=+(sum===8);
  if(x%8===7)glyphPadEmpty+=+(sum===0);
 }
 return {ones,density:ones/512,
  horizontalAgree:horizontal/504,verticalAgree:vertical/448,
  emptyCols,fullCols,glyphPadEmpty};
}
function grayscale(bytes){
 assert.equal(bytes.length,64);
 const n=bytes.reduce((a,b)=>a+b,0);
 const means=n/64;
 const variance=bytes.reduce((a,b)=>a+(b-means)**2,0)/64;
 return {mean:means,stdDev:Math.sqrt(variance),min:Math.min(...bytes),max:Math.max(...bytes)};
}
/** A source-independent planted L glyph makes bit direction inspectable. */
const plantedL=[
 '10000000','10000000','10000000','10000000',
 '10000000','10000000','11111100','00000000'
].map(s=>[...s].map(Number));
const synthetic=Array.from({length:8},(_,y)=>[
 ...plantedL[y],...Array.from({length:56},()=>0)]);
const syntheticPacked=pack(synthetic,'MSB');
assert.deepEqual(expand(syntheticPacked,'MSB'),synthetic);
assert.ok(syntheticPacked[0]===128&&syntheticPacked[48]===252);
const outcomes=[];
for(const {radix,bytes} of vectors){
 const contexts=[];
 for(let startRow=0;startRow<=24;startRow++){
  const block=bytes.slice(startRow*8,startRow*8+64);
  assert.equal(block.length,64);
  const outcome={startRow,grayscale:grayscale(block)};
  for(const order of ['MSB','LSB']){
   const raster=expand(block,order);
   assert.deepEqual(pack(raster,order),block);
   outcome[order]=metrics(raster);
   if(startRow===24)outcome['final'+order]=raster.map(row=>row.map(v=>v?'#':'.').join(''));
  }
  contexts.push(outcome);
 }
 const last=contexts[24];
 const ranks={};
 for(const key of ['ones','horizontalAgree','verticalAgree','emptyCols','glyphPadEmpty']){
  for(const dir of ['MSB','LSB']){
   const values=contexts.map(v=>v[dir][key]);
   ranks[dir+key]={value:last[dir][key],
    rankLE:values.filter(x=>x<=last[dir][key]).length,
    controlMin:Math.min(...values.slice(0,24)),
    controlMax:Math.max(...values.slice(0,24))};
  }
 }
 for(const key of ['mean','stdDev']){
  const values=contexts.map(v=>v.grayscale[key]);
  ranks['gray'+key]={value:last.grayscale[key],
   rankLE:values.filter(x=>x<=last.grayscale[key]).length,
   controlMin:Math.min(...values.slice(0,24)),
   controlMax:Math.max(...values.slice(0,24))};
 }
 outcomes.push({radix,lastSquare:bytes.slice(192),ranks,
  finalMSBRaster:last.finalMSB,finalLSBRaster:last.finalLSB,
  contextMetrics:contexts.map(c=>({startRow:c.startRow,
   gray:c.grayscale,MSB:c.MSB,LSB:c.LSB}))});
}
console.log(JSON.stringify({
 originalSourceSHA256:expected,originalRows:32,originalColumns:8,
 finalSquareRows:[24,31],sourceFirstZero192:true,sourceSecondZero229:true,
 originalFramedWindowsPerRadix:25,
 supportedBitOrders:['MSB','LSB'],
 syntheticLPositive:'PASS',
 finding:'No stable clearly authored glyph, opcode, or grayscale picture in either strict bit orientation and either source-compatible radix. Source itself does not supply a byte-to-rune receiver.',
 outcomes
},null,2));
