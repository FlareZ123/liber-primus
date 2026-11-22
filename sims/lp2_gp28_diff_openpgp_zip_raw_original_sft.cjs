'use strict';

/**
 * A source-constrained original LP2 transport check.
 *
 * Predecessor differences between unequal GP29 runes have exactly 28
 * possible values. Directly map these to positional base-28 digits, then
 * attempt to read a complete raw RFC1951 DEFLATE packet, as used by the
 * original 2013 OpenPGP ZIP compressed-data format.
 *
 * This tests the previously uncombined original-GP28-difference and
 * source-native raw-DEFLATE interpretations. It does not invent a
 * password, skip an arbitrary byte prefix or optimize a plaintext score.
 *
 * Windows 11 / Node.js 22; CommonJS and built-in modules only.
 * Input is unchanged resources/liber-primus/lp2-corpus.json.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((s,p) => s + p.indices.length, 0), 12956);
assert.equal(corpus.pages.find(p => p.page === 50).indices.length, 0);
const chapters = [[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]];
const units = [{name:'book', tape:pages.flatMap(p=>p.indices)}];
for (const [lo,hi] of chapters)
  units.push({name:'chapter'+lo+'-'+hi,
    tape:pages.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices)});
for (const p of pages) units.push({name:'p'+p.page, tape:p.indices});
assert.equal(units.length,65);
assert.deepEqual(units.slice(1,10).map(u=>u.tape.length),
  [729,1145,1729,1903,1021,1433,1680,3008,308]);

/**
 * @param {number[]} c Original GP29 ciphertext ordinals
 * @param {number} sign +1 or -1
 * @returns {{digits:number[], zeros:number}}
 */
function differences(c,sign) {
  const digits=[];
  let zeros=0;
  for(let i=1;i<c.length;i++) {
    const d=(29+sign*(c[i]-c[i-1]))%29;
    if(d===0) zeros++;
    else digits.push(d-1);
  }
  return {digits,zeros};
}

/** @param {number[]} digits @param {boolean} fixed @returns {Buffer} */
function toBytes(digits,fixed) {
  let n=0n;
  for(const digit of digits) {
    assert(Number.isInteger(digit) && digit>=0 && digit<28);
    n=28n*n+BigInt(digit);
  }
  let hex=n.toString(16);
  if(hex.length%2)hex='0'+hex;
  const width=fixed?Math.ceil(digits.length*Math.log2(28)/8):0;
  if(fixed) hex=hex.padStart(width*2,'0');
  return Buffer.from(hex,'hex');
}

/** @param {Buffer} bytes @returns {number[]} */
function fromBytes(bytes) {
  assert(bytes.length>0);
  let n=BigInt('0x'+bytes.toString('hex'));
  const digits=[];
  do {digits.push(Number(n%28n));n/=28n;}while(n);
  return digits.reverse();
}

/** @param {number[]} digits @returns {number[]} */
function toCipher(digits) {
  const out=[0];
  for(const digit of digits)out.push((out[out.length-1]+digit+1)%29);
  return out;
}

/** @param {Buffer} b @returns {number} */
function printable(b) {
  if(!b.length)return 0;
  let yes=0;
  for(const x of b)if((x>=32&&x<=126)||x===9||x===10||x===13)yes++;
  return yes/b.length;
}

const solvedP57=corpus.pages.find(p=>p.page===57).indices
  .map(i=>corpus.translit[i]).join('');
assert.equal(corpus.pages.find(p=>p.page===57).indices.length,95);
const specimen=Buffer.from([solvedP57,solvedP57,solvedP57].join(' '),'utf8');
const packet=zlib.deflateRawSync(specimen);
const synthetic=toCipher(fromBytes(packet));
const recovered=toBytes(differences(synthetic,+1).digits,false);
assert.deepEqual(recovered,packet);
const proven=zlib.inflateRawSync(recovered,{info:true,maxOutputLength:1048576});
assert.deepEqual(proven.buffer,specimen);
assert.equal(proven.engine.bytesWritten,packet.length);
const withTail=zlib.inflateRawSync(Buffer.concat([packet,Buffer.from('unselected-tail')]),
  {info:true,maxOutputLength:1048576});
assert.equal(withTail.engine.bytesWritten,packet.length);
assert(withTail.engine.bytesWritten < packet.length+'unselected-tail'.length);
const pgp=Buffer.concat([Buffer.from([1]),packet]);
assert.deepEqual(zlib.inflateRawSync(pgp.subarray(1)),specimen);
console.log('CONTROL PASS: raw RFC1951 exactly recovers genuine solved-p57 text; OpenPGP ZIP algorithm-one body recovers; bogus suffix detected');

const hits=[];
let candidateCount=0, completeRaw=0, completeZip=0, printableComplete=0;
const invalids={};
function check(bytes,unit,sign,style,kind) {
  let out;
  try {
    out=zlib.inflateRawSync(bytes,{info:true,maxOutputLength:1048576});
  }catch(e) {
    if(['Z_DATA_ERROR','Z_BUF_ERROR','ERR_BUFFER_TOO_LARGE'].includes(e.code)){
      invalids[e.code]=(invalids[e.code]||0)+1;
      return;
    }
    throw e;
  }
  const consumed=out.engine.bytesWritten;
  const full=consumed===bytes.length;
  const fraction=printable(out.buffer);
  if(full) {
    if(kind==='raw')completeRaw++;
    else completeZip++;
    if(out.buffer.length>=32&&fraction>=0.8)printableComplete++;
  }
  hits.push({unit,sign,style,kind,bytes:bytes.length,consumed,full,
    decodedBytes:out.buffer.length,printable:Number(fraction.toFixed(4)),
    hexPrefix:out.buffer.subarray(0,32).toString('hex'),
    textPrefix:out.buffer.subarray(0,96).toString('utf8')});
}
const unitStats=[];
for(const unit of units) {
  for(const sign of [+1,-1]) {
    const {digits,zeros}=differences(unit.tape,sign);
    const distinct=new Set();
    for(const [style,fixed] of [['minimal',false],['fixed',true]]) {
      const b=toBytes(digits,fixed);
      const sig=b.toString('hex');
      if(distinct.has(sig))continue;
      distinct.add(sig);
      candidateCount++;
      check(b,unit.name,sign,style,'raw');
      if(b[0]===1)check(b.subarray(1),unit.name,sign,style,'openpgp-zip-alg1');
    }
    unitStats.push({unit:unit.name,sign,
      symbols:unit.tape.length,zeroDifferences:zeros,
      radix28Digits:digits.length,uniqueWidths:distinct.size});
  }
}
assert.equal(unitStats.length,130);
assert.equal(unitStats.find(x=>x.unit==='book'&&x.sign===1).zeroDifferences,86);
console.log('ORIGINAL SUMMARY',JSON.stringify({
  originalRunes:12956,units:65,orientationAndUnitCases:130,
  uniqueWithinUnitCandidateBytes:candidateCount,completeRaw,completeZip,
  printableComplete,invalids,hits,unitStats
}));
if(printableComplete>0)console.log('AUTHENTIC CANDIDATE ALERT: independently inspect full complete packet');
console.log('END: unmodified GP29-original → GP28 delta → source-typed raw DEFLATE gate');
