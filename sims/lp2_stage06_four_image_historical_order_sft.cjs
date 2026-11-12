'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
/** @param {Buffer} b @returns {string} */
const sha = b => crypto.createHash('sha1').update(Buffer.from('blob ' + b.length + '\0')).update(b).digest('hex');
function main() {
  // Pinned 2014 source: krisyotam/cicada3301 at 76d3ee8c762f60025822c8c05edbf31351636469,
  // puzzles/2014/assets/stage06/index.{1,2,3,4}.jpg[.rev].
  const stages = [
    [1,6,'596ae8f80ada7657f77f342d38d05ed0f997cae7',null],
    [2,7,'1ce21df6a0b8013615c2fd98a57a32021f55e4e1',null],
    [3,9,'fa928ae55ac841a795b5c12eead3e14efc8c419b','0fdd57c40ece99eaeec71bdf11641d01004737f6'],
    [4,8,'426124114b6209475778c6ec7e02bf341c92157b','7f5cacee030c68e5ea8fcb64d9917cc5e2260ed4']
  ];
  const source = [];
  for (const [stage,lp1,identity,reversed] of stages) {
    const bytes = fs.readFileSync(path.join(root, String(lp1).padStart(2,'0')+'.jpg'));
    assert.equal(sha(bytes), identity);
    if (reversed) {
      const reverse = Buffer.from(bytes).reverse();
      assert.equal(sha(reverse), reversed);
      assert.deepEqual(Buffer.from(reverse).reverse(), bytes);
    }
    source.push({ stage, lp1, originalBytes:bytes.length,
      sourceSha:reversed || identity, directSha:identity, byteReversed:!!reversed });
  }
  const lp2 = new Set();
  for (let p=17;p<=74;p++) lp2.add(sha(fs.readFileSync(
    path.join(root, String(p).padStart(2,'0')+'.jpg'))));
  assert.equal(source.filter(x=>lp2.has(x.directSha)).length,0);
  console.log(JSON.stringify({source, exactWholeJpegMatchesLP2:0,
    conclusion:'Original Stage06 yields LP1 pages 6,7,9,8 in that source order. The last two were byte-reversed in the archived stream. This source supplies no direct LP2 inverse.'},null,2));
}
if (require.main===module) main();
module.exports={main,sha};
