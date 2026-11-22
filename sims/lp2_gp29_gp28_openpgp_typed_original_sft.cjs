'use strict';

/**
 * Source-locked typed-binary packet hypothesis for Liber Primus LP2.
 *
 * A player of the original 2014 game saw OpenPGP-signed messages, and the
 * authentic 2013 Cicada BASE29 instruction demonstrated radix conversion.
 * This finite test asks whether plain GP29 rune digits, or 28-way nonrepeating
 * predecessor-exclusion step digits, directly encode an OpenPGP packet.
 *
 * Scope: whole book, nine illustrated chapters, 55 physical rune pages;
 * both directions, minimal/fixed unsigned big-endian byte serialization;
 * cyclic/sorted predecessor-exclusion for GP28; no secret mask, phase,
 * reordering, key, skipped page, invented "escape", or payload search.
 *
 * A packet counts as a typed hit only with a complete RFC 4880 length and
 * tag-appropriate body invariant. Mere MSB header matches are noise.
 * Source-boundary and authentic 95-rune p57 integrity assertions included.
 *
 * Windows 11 / Node.js >=20; from repo root:
 * node sims/lp2_gp29_gp28_openpgp_typed_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const chapters = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],
  [33,39],[40,53],[54,55]];
assert.equal(pages.length,55);
assert.equal(pages.reduce((s,p)=>s+p.indices.length,0),12956);
assert.equal(corpus.pages[56].indices.length,85);
assert.equal(corpus.pages[57].indices.length,95);

/** @param {number[]} stream @param {'cyclic'|'sorted'} mode */
function stepRanks(stream,mode) {
  const out=[];
  for(let i=1;i<stream.length;i++){
    const prev=stream[i-1], cur=stream[i];
    if(prev===cur) continue;
    out.push(mode==='cyclic'?(cur-prev+29)%29-1:cur-(cur>prev?1:0));
  }
  return out;
}

/** @param {number[]} digits @param {number} base @param {boolean} fixed */
function decodeInteger(digits,base,fixed) {
  let n=0n;
  for(const d of digits){
    assert(Number.isInteger(d)&&d>=0&&d<base);
    n=BigInt(base)*n+BigInt(d);
  }
  let hex=n.toString(16);
  if(hex.length%2) hex='0'+hex;
  const bytes=Buffer.from(hex,'hex');
  if(!fixed)return bytes;
  const width=Math.ceil(digits.length*Math.log2(base)/8);
  return Buffer.concat([Buffer.alloc(Math.max(0,width-bytes.length)),bytes]);
}

/** @param {Buffer} bytes @returns {null|object} */
function packet(bytes){
  if(bytes.length<7 || (bytes[0]&0x80)===0)return null;
  const octet=bytes[0];
  let offset=1,tag,length;
  if(octet&0x40) {
    tag=octet&0x3f;
    const first=bytes[offset++];
    if(first<192) length=first;
    else if(first<224) length=((first-192)<<8)+bytes[offset++]+192;
    else if(first===255) {
      if(offset+4>bytes.length)return {tag,complete:false};
      length=bytes.readUInt32BE(offset);
      offset+=4;
    } else return {tag,partial:true};
  } else {
    tag=(octet>>2)&0x0f;
    const lenType=octet&3;
    if(lenType===3)return {tag,indeterminate:true};
    const octets=[1,2,4][lenType];
    if(offset+octets>bytes.length)return {tag,complete:false};
    length=0;
    for(let i=0;i<octets;i++)length=256*length+bytes[offset++];
  }
  if(length>bytes.length-offset)return {tag,length,complete:false};
  const body=bytes.subarray(offset,offset+length);
  const v=body[0];
  let valid=false;
  switch(tag){
    case 1: valid=length>=11 && [3,6].includes(v);break;
    case 2: valid=length>=20 && [3,4,5,6].includes(v);break;
    case 3: valid=length>=4 && [4,5,6].includes(v);break;
    case 4: valid=length>=13 && [3,6].includes(v);break;
    case 5: case 6: case 7: case 14:
      valid=length>=10 && [3,4,5,6].includes(v);break;
    case 8: valid=length>=2 && [0,1,2,3].includes(v);break;
    case 9: valid=length>=16;break;
    case 10: valid=length===3 && body.equals(Buffer.from('PGP'));break;
    case 11: valid=length>=6 && [98,116,117].includes(v) &&
      body.length>=6+body[1];break;
    case 18: valid=length>=20 && [1,2].includes(v);break;
    case 19: valid=length===20;break;
    case 20: valid=length>=8 && [1,2].includes(v);break;
    default: valid=false;
  }
  return {tag,length,complete:true,valid};
}

/** Encode known bytes into radix digits, then decode through same reader. */
function digitsOf(bytes,base) {
  let value=BigInt('0x'+bytes.toString('hex'));
  const digits=[];
  while(value>0n) {
    digits.push(Number(value%BigInt(base)));
    value/=BigInt(base);
  }
  return digits.reverse();
}
const literalPacket=Buffer.concat([
  Buffer.from([0xcb,11,0x62,0,0,0,0,0]),Buffer.from('HELLO')]);
assert.equal(literalPacket.length,13);
assert.equal(packet(literalPacket).valid,true);
for(const base of [28,29]){
  const digits=digitsOf(literalPacket,base);
  assert.deepEqual(decodeInteger(digits,base,false),literalPacket);
  if(base===28){
    let prev=17;
    const runes=[prev];
    for(const d of digits) {
      const cur=(prev+d+1)%29;
      runes.push(cur);
      prev=cur;
    }
    assert.deepEqual(stepRanks(runes,'cyclic'),digits);
  }
}

const groupings=[
  {name:'book', pages},
  ...chapters.map(([first,last])=>({
    name:'chapter'+first+'-'+last,
    pages:pages.filter(p=>p.page>=first&&p.page<=last)
  })),
  ...pages.map(p=>({name:'page'+p.page,pages:[p]}))
];
assert.equal(groupings.length,65);

/** @param {29|28} radix */
function scan(radix){
  const modes=radix===29?['raw']:['cyclic','sorted'];
  const result={radix,groups:65,candidates:0,packetHeaders:0,
    completeLengths:0,typedPackets:0,completed:[]};
  for(const group of groupings)for(const mode of modes){
    const digits=group.pages.flatMap(p=>radix===29
      ?p.indices:stepRanks(p.indices,mode));
    for(const reverse of [false,true])for(const fixed of [false,true]){
      const sequence=reverse?[...digits].reverse():digits;
      const bytes=decodeInteger(sequence,radix,fixed);
      const found=packet(bytes);
      result.candidates++;
      if(found){
        result.packetHeaders++;
        if(found.complete){
          result.completeLengths++;
          if(found.valid)result.typedPackets++;
          result.completed.push({group:group.name,mode,reverse,fixed,
            tag:found.tag,length:found.length,typed:found.valid});
        }
      }
    }
  }
  return result;
}
const gp29=scan(29);
const gp28=scan(28);
assert.deepEqual([gp29.candidates,gp29.packetHeaders,
  gp29.completeLengths,gp29.typedPackets],[260,26,5,0]);
assert.deepEqual([gp28.candidates,gp28.packetHeaders,
  gp28.completeLengths,gp28.typedPackets],[520,35,8,0]);
assert.equal(gp29.completed.length,5);
assert.equal(gp28.completed.length,8);
console.log(JSON.stringify({
  status:'finite original-source negative; no unknown LP2 plaintext',
  originalUnknownRunes:12956,runeBearingPages:55,groupings:65,
  candidateCount:gp29.candidates+gp28.candidates,
  typedHits:gp29.typedPackets+gp28.typedPackets,
  gp29,gp28,
  genuineOpenPGPLiteralPositive:'PASS radix28 and radix29 exact 13-byte HELLO literal packet',
  limitation:'Does not exclude keyed/whitened radix text, shifted packet phases, unknown packet formats, hidden endpoints or independently selected source commands.'
},null,2));
