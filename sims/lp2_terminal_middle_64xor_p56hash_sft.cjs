'use strict';
/**
 * LP2 original table → solved p56 64-byte digest, bounded two-lane XOR test.
 * Four rectangular shells have lengths 76, 68, 60 and 52. The two middle
 * shells' 128 positions permit exactly two 64-position edge/corner ribbons.
 * Test both corner assignments and eight directed starts for each ribbon.
 * Also test XOR of the four physical 8x8 blocks. Genuine in-memory plants
 * verify both 64-byte source-shaped decoders. No persistent writes.
 * Node.js 22 CJS, Windows-compatible.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const source=JSON.parse(fs.readFileSync(path.join(__dirname,'..',
  'resources/liber-primus/lp2-grid-256.json'),'utf8'));
const bytes=Buffer.from(source.bytes);
const target=Buffer.from(
  '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8'+
  '425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4','hex');
assert.equal(bytes.length,256);
assert.equal(target.length,64);
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
/** @param {number} row @param {number} col @returns {number} */
const cell=(row,col)=>8*row+col;
/** @param {number} depth @returns {number[]} Four corners NW,NE,SE,SW */
function corners(depth){
  return [[depth,depth],[depth,7-depth],[31-depth,7-depth],[31-depth,depth]]
    .map(([y,x])=>cell(y,x));
}
/** @param {number} d @returns {number[][]} Clockwise noncorner edges */
function edges(d){
  const sides=[[],[],[],[]],right=7-d,bottom=31-d;
  for(let x=d+1;x<right;x++)sides[0].push(cell(d,x));
  for(let y=d+1;y<bottom;y++)sides[1].push(cell(y,right));
  for(let x=right-1;x>d;x--)sides[2].push(cell(bottom,x));
  for(let y=bottom-1;y>d;y--)sides[3].push(cell(y,d));
  return sides;
}
const eo=edges(1),ei=edges(2),co=corners(1),ci=corners(2);
assert.deepEqual(eo.map(a=>a.length),[4,28,4,28]);
assert.deepEqual(ei.map(a=>a.length),[2,26,2,26]);
/** @param {number} mode @returns {number[][]} 64 cells in four sides */
function augmented(mode){
  return ei.map((edge,s)=>mode===0
    ? [co[s],...edge,ci[(s+1)%4]]
    : [ci[s],...edge,co[(s+1)%4]]);
}
/** @param {number[][]} blocks @param {number} start @param {number} dir */
function ribbon(blocks,start,dir){
  const out=[];
  for(let k=0;k<4;k++){
    const block=blocks[(start+4+dir*k)%4];
    out.push(...(dir===1?block:[...block].reverse()));
  }
  assert.equal(out.length,64);
  assert.equal(new Set(out).size,64);
  return out;
}
/** @param {Buffer} b @param {number[]} left @param {number[]} right */
function xor(b,left,right){
  return Buffer.from(left.map((p,i)=>b[p]^b[right[i]]));
}
/** @param {Buffer} b */
function squareFold(b){
  return Buffer.from(Array.from({length:64},(_,i)=>
    b[i]^b[64+i]^b[128+i]^b[192+i]));
}
/** @param {Buffer} a @param {Buffer} b */
function hits(a,b){
  return a.reduce((s,x,i)=>s+(x===b[i]),0);
}
/** @param {Buffer} a */
function digestEquals(a){
  return crypto.createHash('sha512').update(a).digest().equals(target);
}
const sourceMiddle=new Set(eo.flat().concat(co,ei.flat(),ci));
assert.equal(sourceMiddle.size,128);
const tests=[];
for(const mode of [0,1])
for(let aStart=0;aStart<4;aStart++)for(const aDir of [-1,1])
for(let bStart=0;bStart<4;bStart++)for(const bDir of [-1,1]){
  const a=ribbon(eo,aStart,aDir),b=ribbon(augmented(mode),bStart,bDir);
  assert.equal(new Set(a.concat(b)).size,128);
  for(const p of a.concat(b))assert.ok(sourceMiddle.has(p));
  const result=xor(bytes,a,b);
  tests.push({mode,aStart,aDir,bStart,bDir,hashBytes:hits(result,target),
    equalsTarget:result.equals(target),sha512Match:digestEquals(result),
    prefix:result.subarray(0,12).toString('hex')});
}
assert.equal(tests.length,128);
const canonical=tests.find(t=>t.mode===0&&t.aStart===0&&t.aDir===1
  &&t.bStart===0&&t.bDir===1);
const best=[...tests].sort((a,b)=>b.hashBytes-a.hashBytes)[0];
assert.equal(canonical.hashBytes,0);
assert.equal(best.hashBytes,2);
assert.equal(tests.filter(t=>t.equalsTarget).length,0);
assert.equal(tests.filter(t=>t.sha512Match).length,0);
// Full independent source-shaped XOR plant: encode the real digest in-memory.
const planted=Buffer.from(bytes),pa=ribbon(eo,0,1),pb=ribbon(augmented(0),0,1);
for(let i=0;i<64;i++)planted[pb[i]]=planted[pa[i]]^target[i];
assert.equal(hits(xor(planted,pa,pb),target),64);
// Four contiguous 8x8 squares also partition the 32x8 original exactly.
const square=squareFold(bytes);
assert.equal(hits(square,target),2);
assert.ok(!square.equals(target));
assert.ok(!digestEquals(square));
const plantSquare=Buffer.from(bytes);
for(let i=0;i<64;i++)plantSquare[192+i]=
  target[i]^plantSquare[i]^plantSquare[64+i]^plantSquare[128+i];
assert.equal(hits(squareFold(plantSquare),target),64);
console.log(JSON.stringify({
  original:'original 256 grid bytes, published p56 SHA512 hash',
  middleRibbons:{sides:[4,28,4,28],cases:tests.length,canonical,best,
    exactTarget:0,sha512Preimages:0,positive64Of64:true},
  fourSquares:{size:[4,8,8],exactHashBytes:2,sha512Preimage:false,
    positive64Of64:true},
  interpretation:'Both literal source-shaped XOR constructions fail on the original. No plaintext or genuine key recovered.'
},null,2));
