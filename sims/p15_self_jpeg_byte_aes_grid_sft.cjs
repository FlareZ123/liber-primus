'use strict';
/**
 * Source-fixed p15 16 Fibonacci-prime square values as byte addresses in
 * p15's *own* original JPEG. The resulting 16-byte AES-128 key is tested
 * once on the original p49–51 256-byte table, with an English positive plant.
 * This is a hypothetical direct consumer, not an authenticated LP2 cipher.
 * Run: node sims/p15_self_jpeg_byte_aes_grid_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.join(__dirname,'..');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const JPEG='5543cfce96493b86eece3195b3f5ea6e779ff41551676600b0c2479fc18c0ec5';
const GRID='3b9b07d9a26e6d55c432d94d2661fdff3c2bdb23184a4b290';
const spiral=[3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516];
const jpeg=fs.readFileSync(path.join(root,'resources/liber-primus/32.jpg'));
const grid=Buffer.from(JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-grid-256.json'),'utf8')).bytes);
assert.equal(sha(jpeg),JPEG);
assert.equal(sha(grid),GRID);
assert.equal(grid.length,256);
const key=Buffer.from(spiral.map(n=>jpeg[n]));
assert.equal(key.toString('hex'),'0000000000000000000021d955011400');
/** @param {Buffer} input @param {boolean} decrypt @returns {Buffer} */
function aes(input,decrypt){
  assert.equal(input.length%16,0);
  const c=decrypt?crypto.createDecipheriv('aes-128-ecb',key,null):
    crypto.createCipheriv('aes-128-ecb',key,null);
  c.setAutoPadding(false);
  return Buffer.concat([c.update(input),c.final()]);
}
const plain=aes(grid,true);
assert.deepEqual(aes(plain,false),grid);
// A genuine positive control with this exact key and full-length English.
const planted=Buffer.from('THE NUMBERS ARE THE DIRECTION. '.repeat(9).slice(0,256),'ascii');
assert.equal(planted.length,256);
assert.deepEqual(aes(aes(planted,false),true),planted);
const printable=[...plain].filter(n=>n>=32&&n<=126).length;
let longest=0,run=0;
for(const b of plain){run=b>=32&&b<=126?run+1:0;longest=Math.max(longest,run);}
const magic=['ffd8ff','89504e470d0a1a0a','255044462d','504b0304',
  '1f8b08','47494638','377abcaf271c'].filter(x=>plain.toString('hex').startsWith(x));
assert.equal(printable,99);
assert.equal(longest,7);
assert.deepEqual(magic,[]);
assert.equal(sha(plain),'48e533b1985a896842d3c70dc6b4a710a52ba24bafc9663fd5f37bd22cfcb22c');
console.log(JSON.stringify({source:'p15 original JPEG, 16 zero-based printed spiral addresses',
  key:key.toString('hex'),zeroKeyBytes:[...key].filter(n=>n===0).length,
  consumer:'AES-128-ECB of original p49–51 byte table; no padding',
  exactForwardReplayBytes:256,outputSha256:sha(plain),
  outputHead:plain.subarray(0,16).toString('hex'),
  printableAsciiBytes:printable,longestPrintableRun:longest,magic,
  control:'256/256 English plant recovered',
  verdict:'no recognizable output; no original plaintext or authenticated key'},null,2));
