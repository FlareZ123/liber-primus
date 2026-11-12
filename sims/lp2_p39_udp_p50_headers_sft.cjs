'use strict';
/**
 * Original red UDP clue -> eight-byte RFC768 p49-51 grid row discriminator.
 * Frozen network-byte-order row-major parse; no key, phase or endian sweep.
 * Run: node sims/lp2_p39_udp_p50_headers_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const resource = name => JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus',name),'utf8'));
const corpus = resource('lp2-corpus.json');
const annotations = resource('lp2-ink-annotations.json');
const grid = resource('base60-grid.json');
const atbash = indices => indices.map(x => corpus.translit[28-x]).join('');

/** @param {number[]} row */
function udpHeader(row) {
  assert.equal(row.length,8);
  /** @param {number} offset */
  const uint16 = offset => row[offset] * 256 + row[offset+1];
  return {
    sourcePort:uint16(0),
    destinationPort:uint16(2),
    datagramLength:uint16(4),
    checksum:uint16(6)
  };
}

/** @param {number[][]} rows */
function summary(rows) {
  const headers = rows.map(udpHeader);
  const distinct = key => new Set(headers.map(h=>h[key])).size;
  return {
    headers:headers.length,
    distinctSourcePorts:distinct('sourcePort'),
    distinctDestinationPorts:distinct('destinationPort'),
    completeBare8ByteDatagrams:headers.filter(h=>h.datagramLength===8).length,
    lengthAtMost256:headers.filter(h=>h.datagramLength<=256).length,
    lengthLessThan8:headers.filter(h=>h.datagramLength<8).length,
    sourceOrDestinationPort7Or17:headers.filter(h=>
      [7,17].includes(h.sourcePort)||[7,17].includes(h.destinationPort)).length,
    minimumLength:Math.min(...headers.map(h=>h.datagramLength)),
    maximumLength:Math.max(...headers.map(h=>h.datagramLength)),
    firstThreeHeaders:headers.slice(0,3)
  };
}
assert.equal(corpus.translit.length,29);
const p39 = corpus.pages.find(p => p.page===39);
const p39red = annotations.pages.find(p=>p.page===39).red_spans
  .find(span=>span.start===119&&span.length===3);
assert.ok(p39red);
assert.deepEqual([...p39red.runes],p39.indices.slice(119,122).map(i=>corpus.runes[i]));
assert.equal(atbash(p39.indices.slice(119,122)),'UDP');
assert.equal(grid.byte_rows.length,32);
assert.ok(grid.byte_rows.every(row=>row.length===8));
const bytes = grid.byte_rows.flat();
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

// Positive control: RFC768 eight-octet empty datagram headers on service UDP/7.
const planted = Array.from({length:32},(_,i)=>[
  0x80, i, 0,7, 0,8, 0,0 // 8-byte header; checksum unused for IPv4.
]);
const plant = summary(planted);
assert.equal(plant.completeBare8ByteDatagrams,32);
assert.equal(plant.lengthAtMost256,32);
assert.equal(plant.distinctDestinationPorts,1);
assert.equal(plant.sourceOrDestinationPort7Or17,32);

const original = summary(grid.byte_rows);
assert.deepEqual(original,{
  headers:32,
  distinctSourcePorts:32,
  distinctDestinationPorts:32,
  completeBare8ByteDatagrams:0,
  lengthAtMost256:0,
  lengthLessThan8:0,
  sourceOrDestinationPort7Or17:0,
  minimumLength:3348,
  maximumLength:63236,
  firstThreeHeaders:[
    {sourcePort:52199,destinationPort:42938,datagramLength:25069,checksum:32439},
    {sourcePort:23801,destinationPort:40158,datagramLength:63236,checksum:47060},
    {sourcePort:31178,destinationPort:3873,datagramLength:26249,checksum:15191}
  ]
});
if(require.main===module)console.log(JSON.stringify({
  source:'original p39 red119 Atbash UDP; original p49-51 32x8 conventional-base60 values',
  rule:'RFC768 big-endian complete 8-byte UDP header at each printed table row',
  positiveControl:plant,
  original,
  interpretation:'No self-contained length-8 datagrams, no printed-length-bounded packets, no common port; longer datagrams require unavailable payload/address state. No key or plaintext recovered.',
  status:'PASS'
},null,2));
module.exports={udpHeader,summary};
