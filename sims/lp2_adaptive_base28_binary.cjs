'use strict';

/**
 * Cryptanalytic inversion of the "28 choices other than previous rune" model.
 * Test whether the no-repeat LP2 ciphertext is a transparent base-28
 * representation of byte data, with fixed 5n base-28 digits -> 3n bytes.
 *
 * Exact byte encodings never overflow 256^(3n). Random base-28 output
 * does overflow with known frequency. Test all group phases, word/page
 * carry conditions and bounded treatments of observed doublet exceptions.
 *
 * Search decoded bytes for recognizable file magic and actual successful
 * decompression; a two-byte header match alone is never accepted.
 *
 * @module lp2_adaptive_base28_binary
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const PAGES = corpus.pages.filter(p => p.page < 56 && p.indices.length)
  .map(p => p.indices);
assert.equal(PAGES.length, 55);
assert.equal(PAGES.reduce((n,p) => n + p.length,0), 12956);

const WIDTHS = [5, 10, 15, 20, 25, 30];
const POW = new Map(WIDTHS.map(k => [k, 1n << BigInt((k/5)*24)]));
const BLOCK = 28n;
const REP_POLICIES = ['drop', 'zero', 'last', 'mod28'];
const MAX_REPORT = 10;

/**
 * @param {number[]} ciphertext.
 * @param {'drop'|'zero'|'last'|'mod28'} doubletPolicy
 * @returns {{digits:number[],doublets:number}}
 */
function unroll(ciphertext, doubletPolicy) {
  const digits = [];
  let previous = -1, doublets = 0;
  for (const x of ciphertext) {
    assert.ok(Number.isInteger(x) && x>=0 && x<29);
    if (previous < 0) { previous = x; continue; }
    if (x === previous) {
      doublets++;
      if (doubletPolicy === 'zero') digits.push(0);
      if (doubletPolicy === 'last') digits.push(27);
      if (doubletPolicy === 'mod28') digits.push(x%28);
    } else digits.push(x < previous ? x : x-1);
    previous = x;
  }
  return {digits, doublets};
}

/**
 * Decode radix-28 base-k groups as m=3*(k/5) big-endian octets.
 * Record impossible fixed-width byte codewords rather than quietly
 * treating their truncated low-order bytes as valid encodings.
 * @param {number[]} digits
 * @param {number} width
 * @param {number} shift
 * @param {boolean} reversedDigits
 */
function unpack(digits,width,shift,reversedDigits) {
  const limit=POW.get(width);
  const bytesPerBlock=3*(width/5);
  const chunks=[];
  let invalid=0, groups=0;
  for (let i=shift;i+width<=digits.length;i+=width) {
    let value=0n;
    for(let k=0;k<width;k++){
      const j=reversedDigits?width-1-k:k;
      value=value*BLOCK+BigInt(digits[i+j]);
    }
    groups++;
    if(value>=limit)invalid++;
    const b=Buffer.alloc(bytesPerBlock);
    for(let j=bytesPerBlock-1;j>=0;j--){
      b[j]=Number(value&255n);value>>=8n;
    }
    chunks.push(b);
  }
  return {bytes:Buffer.concat(chunks),invalid,groups};
}

/** @param {Buffer} data */
function inspect(data) {
  const hits=[];
  const magics=[
    {name:'gzip',hex:'1f8b08'},
    {name:'zip',hex:'504b0304'},
    {name:'pdf',hex:'255044462d'},
    {name:'png',hex:'89504e470d0a1a0a'},
    {name:'bzip2',hex:'425a683'},
    {name:'zlib',hex:'789c'},
    {name:'zlib-fast',hex:'7801'},
    {name:'zlib-best',hex:'78da'},
    {name:'PGP',hex:'2d2d2d2d2d424547494e'},
  ];
  for (const item of magics) {
    // bzip2 has 3 ASCII magic bytes BZh; allow level suffix.
    const marker=Buffer.from(item.name==='bzip2'?'425a68':item.hex,'hex');
    let at=data.indexOf(marker);
    if(at<0)continue;
    let verified=null;
    if(item.name==='gzip'||item.name.startsWith('zlib')){
      try{
        const out=item.name==='gzip'?
          zlib.gunzipSync(data.subarray(at)):
          zlib.inflateSync(data.subarray(at));
        verified={length:out.length,preview:out.subarray(0,80).toString('utf8')};
      }catch(e){
        // Incorrect compressed streams are the expected failure here.
      }
    }
    if(at===0||verified)hits.push({format:item.name,offset:at,verified});
  }
  return hits;
}

/** @param {number[][]} streams */
function probe(streams) {
  const all=[], verified=[], openingMagic=[];
  for(const mode of ['global','page']){
    const texts=mode==='global'?[streams.flat()]:streams;
    for(const policy of REP_POLICIES){
      const digits=texts.map(s=>unroll(s,policy).digits);
      for(const width of WIDTHS)for(let shift=0;shift<width;shift++)
        for(const reverse of [false,true]){
          let overflow=0, groups=0, bytes=0, formatHits=0;
          for(const d of digits){
            const result=unpack(d,width,shift,reverse);
            overflow+=result.invalid;groups+=result.groups;
            bytes+=result.bytes.length;
            const hits=inspect(result.bytes);
            for(const hit of hits){
              formatHits++;
              const record={mode,policy,width,shift,reverse,
                bytes:result.bytes.length,invalid:result.invalid,
                groups:result.groups,...hit};
              if(hit.verified)verified.push(record);
              else openingMagic.push(record);
            }
          }
          all.push({mode,policy,width,shift,reverse,
            groups,overflow,rate:overflow/groups,bytes,formatHits});
        }
    }
  }
  all.sort((a,b)=>a.rate-b.rate);
  verified.sort((a,b)=>b.verified.length-a.verified.length);
  return {settings:all.length,bestOverflow:all.slice(0,MAX_REPORT),
    bestByWidth:WIDTHS.map(width=>all.find(x=>x.width===width)),
    expectedOverflow:WIDTHS.map(width=>({width,
      probability:Number(28n**BigInt(width)-POW.get(width))/
        Number(28n**BigInt(width))})),
    validatedDecompressions:verified.slice(0,MAX_REPORT),
    openingOrUnverifiedMagics:openingMagic.slice(0,MAX_REPORT),
    totalOpeningOrUnverifiedMagics:openingMagic.length};
}

/** Return a radix-28 five-digit encoding of a three-byte integer. */
function encodeThree(bytes) {
  assert.equal(bytes.length,3);
  let v=(bytes[0]<<16)|(bytes[1]<<8)|bytes[2];
  const digits=Array(5).fill(0);
  for(let i=4;i>=0;i--){digits[i]=v%28;v=Math.floor(v/28);}
  assert.equal(v,0);
  return digits;
}

/** Reproduce an exact gzip->5 digits per 3 bytes no-repeat ciphertext. */
function positive() {
  const text='LIBER PRIMUS POSITIVE CONTROL: '+
    'deterministically encoded GZIP data must recover every byte. '.repeat(8);
  const packed=zlib.gzipSync(Buffer.from(text,'utf8'),{mtime:0});
  const padded=Buffer.alloc(Math.ceil(packed.length/3)*3);
  packed.copy(padded);
  const digits=[];
  for(let i=0;i<padded.length;i+=3){
    digits.push(...encodeThree(padded.subarray(i,i+3)));
  }
  let prev=8;
  const cipher=[prev];
  for(const digit of digits){
    const glyph=digit>=prev?digit+1:digit;
    assert.notEqual(glyph,prev);
    cipher.push(glyph);prev=glyph;
  }
  const rank=unroll(cipher,'drop');
  assert.deepEqual(rank.digits,digits);
  const unpacked=unpack(rank.digits,5,0,false);
  assert.equal(unpacked.invalid,0);
  assert.deepEqual(unpacked.bytes,padded);
  const decompressed=zlib.gunzipSync(unpacked.bytes);
  assert.equal(decompressed.toString('utf8'),text);
  return {originalBytes:packed.length,encodedRunes:cipher.length,
    overflowBlocks:unpacked.invalid,decodedText:decompressed.toString('utf8').slice(0,70)};
}

function run(){
  const plant=positive();
  const actual=probe(PAGES);
  return {hypothesis:'Direct 28-way no-repeat alphabet -> fixed radix28 groups of 5n digits -> 3n bytes',
    originalPages:PAGES.length,runes:12956,
    source:'resources/liber-primus/lp2-corpus.json',
    real:actual,positive:plant,
    interpretation:'Every actual overflow invalidates the exact fixed-byte-codeword model for that setting; a complete valid compressed stream was not established solely by header bytes.'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={unroll,unpack,inspect,probe,encodeThree,positive,run};
