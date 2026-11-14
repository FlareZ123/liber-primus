'use strict';

/**
 * Fully reversible, genuinely variable-bit arithmetic prefix transport:
 * a 28-symbol predecessor-excluding alphabet with a rare 29th repeated-rune
 * symbol. A fixed 7-bit 1/128 escape probability is chosen independently
 * of LP2 ciphertext statistics; no key, byte header or phase is fitted.
 *
 * Historical inputs: authenticated 2013 BASE29 and gzip-era coding practice.
 * Intended LP2 use is a hypothesis. Exact source-native positive tests use
 * gzip-compressed original-era signed 2013 prose.
 *
 * Run: node sims/lp2_gp29_nonrepeat_range_transport_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} pathName @returns {string} */
const read = pathName => fs.readFileSync(path.join(ROOT,pathName),'utf8');
const source = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));

// 28 ordinary rank symbols each weigh127, one repeated-rune/escape
// rank28 weighs28, total 28*128 =3584, exactly 1/128 escape.
const NORMAL = 127n;
const ESCAPE = 28n;
const NORMAL_TOTAL = 28n*NORMAL;
const TOTAL = NORMAL_TOTAL+ESCAPE;
assert.equal(TOTAL, 3584n);
/** @param {number} previous @param {number} rank */
function symbol(previous,rank) {
  return rank===28 ? previous : (rank>=previous ? rank+1 : rank);
}
/** @param {number} previous @param {number} current */
function rank(previous,current) {
  return current===previous ? 28 : (current>previous ? current-1 : current);
}
for(let previous=0;previous<29;previous++)for(let d=0;d<29;d++)
  assert.equal(rank(previous,symbol(previous,d)),d);

/** @param {number} rankDigit @returns {[bigint,bigint]} */
function bucket(rankDigit) {
  return rankDigit===28 ? [NORMAL_TOTAL,ESCAPE]
    : [BigInt(rankDigit)*NORMAL,NORMAL];
}
/**
 * Exact cumulative interval of source runes on a fixed-length 29-symbol
 * predecessor-conditioned alphabet. Initial rune is a source-visible IV.
 * @param {number[]} stream
 * @param {number} seed
 * @returns {{start:bigint,width:bigint,total:bigint}}
 */
function interval(stream,seed) {
  const total=TOTAL**BigInt(stream.length);
  let width=total,start=0n,previous=seed;
  for(const current of stream) {
    const [prefix,weight]=bucket(rank(previous,current));
    const cell=width/TOTAL;
    start+=prefix*cell;
    width=cell*weight;
    previous=current;
  }
  assert.ok(start>=0n && width>=1n && start+width<=total);
  return {start,width,total};
}

/**
 * Canonical shortest dyadic prefix wholly inside the arithmetic interval.
 * For k bits, find [m/2^k,(m+1)/2^k) inside [start/total,end/total).
 * The prefix is uniquely sufficient to recover every original rune.
 * @param {{start:bigint,width:bigint,total:bigint}} intervalInfo
 * @returns {{bits:bigint,length:number}}
 */
function shortestPrefix(intervalInfo) {
  const {start,width,total}=intervalInfo;
  let length=Math.max(1,total.toString(2).length-width.toString(2).length);
  while(true) {
    const power=1n<<BigInt(length);
    const min=((start*power)+total-1n)/total;
    const max=(((start+width)*power)/total)-1n;
    if(min<=max) return {bits:min,length};
    length++;
  }
}
/**
 * Exact inverse of arithmetic coding using a dyadic prefix as the known
 * fraction. This code decodes at most 'count' digits and reproduces every
 * source symbol, including all 86 original doublet locations.
 * @param {bigint} number
 * @param {bigint} denominator
 * @param {number} count
 * @param {number} seed
 * @returns {number[]}
 */
function decodeFraction(number,denominator,count,seed) {
  assert.ok(number>=0n && number<denominator);
  const total=TOTAL**BigInt(count);
  const target=number*total/denominator;
  let start=0n,width=total,previous=seed;
  const result=[];
  for(let i=0;i<count;i++) {
    const cell=width/TOTAL;
    const position=(target-start)/cell;
    const digit=position<NORMAL_TOTAL ? Number(position/NORMAL) : 28;
    assert.ok(digit>=0 && digit<29);
    const [offset,weight]=bucket(digit);
    start+=offset*cell;
    width=cell*weight;
    const current=symbol(previous,digit);
    result.push(current);
    previous=current;
  }
  assert.ok(target>=start && target<start+width);
  return result;
}

/** @param {{bits:bigint,length:number}} code @returns {Buffer} */
function prefixBytes(code) {
  const count=Math.floor(code.length/8);
  if(!count)return Buffer.alloc(0);
  const full=code.bits>>BigInt(code.length-8*count);
  const out=Buffer.alloc(count);
  let number=full;
  for(let i=count-1;i>=0;i--) {
    out[i]=Number(number&255n);
    number>>=8n;
  }
  return out;
}

/**
 * Encode known compressed bytes directly as a fractional binary prefix,
 * continued through source-shaped arithmetic GP runes. The bit prefix is
 * provably recoverable without an external sidecar or fitted byte offset.
 * @param {Buffer} payload
 * @param {number} seed
 * @returns {{symbols:number[],code:{bits:bigint,length:number}}}
 */
function encodeBytes(payload,seed) {
  assert.ok(payload.length>0);
  const bitLength=payload.length*8;
  const number=BigInt('0x'+payload.toString('hex'));
  const denom=1n<<BigInt(bitLength);
  let n=Math.ceil(bitLength/4.65)+8;
  for(let attempt=0;attempt<16;attempt++) {
    const symbols=decodeFraction(number,denom,n,seed);
    const code=shortestPrefix(interval(symbols,seed));
    if(code.length>=bitLength) {
      const leading=code.bits>>BigInt(code.length-bitLength);
      if(leading===number)return {symbols,code};
    }
    n+=16;
  }
  throw new Error('failed to construct exact known-binary positive');
}

/** @param {number[]} indices @param {string} name */
function runOriginal(indices,name) {
  assert.ok(indices.length>300);
  const seed=indices[0];
  const body=indices.slice(1);
  const coded=shortestPrefix(interval(body,seed));
  const recovered=decodeFraction(coded.bits,1n<<BigInt(coded.length),body.length,seed);
  assert.deepEqual(recovered,body);
  const bytes=prefixBytes(coded);
  const hex=bytes.subarray(0,24).toString('hex');
  const headers=[
    ['gzip','1f8b08'],['bzip2','425a68'],['xz','fd377a585a00'],
    ['zip','504b0304'],['pdf','255044462d'],['png','89504e470d0a1a0a']
  ];
  const matches=headers.filter(([,magic])=>hex.startsWith(magic))
    .map(([kind])=>kind);
  let gunzip=false;
  if(matches.includes('gzip')) {
    try{zlib.gunzipSync(bytes);gunzip=true;}catch{}
  }
  return {
    name, sourceRunes:indices.length, seed, originalDoublets:body
      .filter((v,i)=>v===indices[i]).length,
    rankDigits:body.length, decodedBits:coded.length,
    exactPrefixByteLength:bytes.length, lastPartialBits:coded.length%8,
    openingHex:hex, matchingSourceHeaders:matches, gunzipValid:gunzip,
    symbolsRecovered:recovered.length
  };
}
function main() {
  const eraText=read('resources/external/2013-tcp-server-signed-source.md');
  assert.ok(eraText.includes('BASE29'));
  const authenticGzip=zlib.gzipSync(Buffer.from(eraText.slice(0,720),'utf8'),{mtime:0});
  assert.equal(authenticGzip.subarray(0,3).toString('hex'),'1f8b08');
  const planted=encodeBytes(authenticGzip,0);
  const payload=prefixBytes(planted.code).subarray(0,authenticGzip.length);
  assert.deepEqual(payload,authenticGzip);
  assert.equal(zlib.gunzipSync(payload).toString('utf8'),eraText.slice(0,720));
  const plantedInverse=decodeFraction(planted.code.bits,
    1n<<BigInt(planted.code.length),planted.symbols.length,0);
  assert.deepEqual(plantedInverse,planted.symbols);
  const pages=source.pages;
  const section=(lo,hi)=>pages.filter(p=>p.page>=lo&&p.page<=hi)
    .flatMap(p=>p.indices);
  const tested=[
    runOriginal(section(33,39),'source-visual-p33-39'),
    runOriginal(section(40,53),'source-visual-p40-53'),
    runOriginal(section(54,55),'source-visual-p54-55')
  ];
  assert.deepEqual(tested.map(x=>x.sourceRunes),[1680,3008,308]);
  console.log(JSON.stringify({
    event:'original_lowrepeat_29rank_fixed_range_prefix',
    transport:'static arithmetic 28-symbol predecessor exclusion, '+
      'repeat escapes with fixed probability 1/128, seed = source first rune',
    sourceEvidence:'historical 2013 signed BASE29 plus 2014 gzip practice, '+
      'without authorial instruction for this prefix law',
    historicalPositive:{source:'2013 signed BASE29 prose compressed via gzip',
      gzipBytes:authenticGzip.length,
      emittedGPRunes:planted.symbols.length,
      arithmeticBits:planted.code.length,
      roundtripGzipBytes:payload.length,
      decompressedSourceRecovered:true},
    original:tested,
    result:'No original plaintext claimed; only byte-exact source framing '+
      'and a fully lossless non-fixed-width transport are tested'
  }));
}
main();
