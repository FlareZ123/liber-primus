'use strict';
/**
 * Source-frozen 11x11 image-geometry payload probe. Node 22 CommonJS.
 *
 * p32's first-row/first-column GP primes partition the authenticated
 * 563x569 signed-image pixels into 121 source-selected tiles.
 * A 2014 human solver knows QR codes from earlier Cicada stages;
 * the minimal Micro QR 11x11 finder is a sharply discriminating
 * prediction, independent of fitting ciphertext or an image threshold.
 *
 * Tested only: the natural row-major tile centers or mean RGB,
 * fixed channel threshold 128, and both black/white bit polarities.
 * Never claim a QR payload without a finder.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const decodeJpeg = require('./vendor/jpeg-js-decoder.cjs');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const page = corpus.pages[32].indices;
assert.equal(page.length, 121);
const jpg = fs.readFileSync(path.join(root,
  'resources/historical/cicada2016-4gq25.jpg'));
const image = decodeJpeg(jpg,
  {useTArray:true, formatAsRGBA:false, maxResolutionInMP:2});
assert.deepEqual([image.width,image.height], [563,569]);
const weights = page.map(i => corpus.prime[i]);
const cumulative = vals => {
  const a=[0]; for(const v of vals)a.push(a.at(-1)+v); return a;
};
const xs=cumulative(weights.slice(0,11));
const ys=cumulative(Array.from({length:11},(_,r)=>weights[11*r]));
assert.deepEqual([xs.at(-1),ys.at(-1)],[563,569]);
const center=[];
const mean=[];
for(let y=0;y<11;y++)for(let x=0;x<11;x++){
  const midx=Math.floor((xs[x]+xs[x+1]-1)/2);
  const midy=Math.floor((ys[y]+ys[y+1]-1)/2);
  const at=(midy*563+midx)*3;
  center.push((image.data[at]+image.data[at+1]+image.data[at+2])/3);
  let sum=0, count=0;
  for(let yy=ys[y];yy<ys[y+1];yy++)
    for(let xx=xs[x];xx<xs[x+1];xx++){
      const q=(yy*563+xx)*3;
      sum+=image.data[q]+image.data[q+1]+image.data[q+2];
      count+=3;
    }
  mean.push(sum/count);
}
assert.equal(center.length,121); assert.equal(mean.length,121);
const finder=Array.from({length:7},(_,y)=>Array.from({length:7},(_,x)=>
  Number(x===0||x===6||y===0||y===6||
    (x>=2&&x<=4&&y>=2&&y<=4))));
assert.equal(finder.reduce((s,r)=>s+r.reduce((a,b)=>a+b,0),0),33);
function bytesOf(bits){
  const out=[];
  for(let i=0;i+8<=bits.length;i+=8){
    let value=0;for(let j=0;j<8;j++)value=(value<<1)|bits[i+j];
    out.push(value);
  }
  return out;
}
function probe(bytes, channel, invert){
  const bits=bytes.map(v=>Number(v<128) ^ Number(invert));
  const matrix=Array.from({length:11},(_,y)=>bits.slice(y*11,(y+1)*11));
  let finderMismatch=0;
  for(let y=0;y<7;y++)for(let x=0;x<7;x++)
    finderMismatch+=Number(matrix[y][x]!==finder[y][x]);
  const data=bytesOf(bits);
  const printable=data.filter(v=>v===9||v===10||v===13||(v>=32&&v<=126)).length;
  return {
    channel, invert, finderMismatch, microQrFinderValid:finderMismatch===0,
    ones:bits.reduce((s,v)=>s+v,0),
    matrix:matrix.map(r=>r.join('')),
    binaryFirst120Hex:Buffer.from(data).toString('hex'),
    printableBytesOf15:printable
  };
}
const cases=[];
for(const [name,bytes] of [['center',center],['mean',mean]])
  for(const invert of [false,true])
    cases.push(probe(bytes,name,invert));
assert.equal(cases.length,4);
assert(cases.every(v=>v.binaryFirst120Hex.length===30));
const plant=Array(121).fill(0);
for(let y=0;y<7;y++)for(let x=0;x<7;x++)plant[11*y+x]=finder[y][x];
const positive=probe(plant.map(v=>v?0:255),'planted-finder',false);
assert.equal(positive.finderMismatch,0);
console.log(JSON.stringify({
  source:'authenticated 2016 signed JPEG original bytes',
  originalPage:32, runeCount:121, image:[563,569],
  gridRows:11,gridCols:11,
  horizontal:weights.slice(0,11),vertical:Array.from({length:11},(_,r)=>weights[11*r]),
  fixedThreshold:128, finderShape:'7x7 Micro QR upper-left',
  candidates:cases, plantedMicroQrFinderRecovered:true,
  status:cases.some(v=>v.microQrFinderValid)?'POSSIBLE-FINDER-REQUIRES-QR-DECODING':'NO-FINDER'
},null,2));
