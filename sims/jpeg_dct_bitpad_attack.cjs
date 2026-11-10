'use strict';
/**
 * Test whether JPEG quantized-DCT AC coefficient parity contains an additive
 * mod-29 LP2 pad, independently embedded after the page was rendered.
 *
 * This investigates a different carrier than JPEG byte offsets and OutGuess
 * pseudoheaders. It does not assume the DCT bit stream is steganographic.
 *
 * Requires the C extractor built as /tmp/lp_jpeg_dct_bits:
 *   cc -O2 -o /tmp/lp_jpeg_dct_bits sims/jpeg_dct_bits.c -ljpeg
 *   LP_DCT_BITS=/tmp/lp_jpeg_dct_bits node sims/jpeg_dct_bitpad_attack.cjs
 *
 * Deterministic, read-only, source-rune-to-ciphertext exact modular inversion.
 */
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const assert=require('node:assert/strict');

const ROOT=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(
  path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
assert.equal(pages.length,55);
assert.equal(pages.reduce((s,p)=>s+p.indices.length,0),12956);
const BIN=process.env.LP_DCT_BITS||'/tmp/lp_jpeg_dct_bits';
const MOD=29;
const PHASES=16;
const variants=[];
for(let order=0;order<=1;order++)
  for(let zig=0;zig<=1;zig++)
    for(let one=0;one<=1;one++)
      variants.push({order,zig,one,name:'order'+order+'-zig'+zig+'-one'+one});
const modes=[
  {name:'five-mod',width:5,reject:false},
  {name:'five-reject',width:5,reject:true},
  {name:'six-mod',width:6,reject:false},
  {name:'eight-mod',width:8,reject:false}
];

/**
 * Read only original quantized DCT coefficients. A successful child process
 * returns decimal exact bit count + LF + packed MSB-first bytes.
 * @param {{page:number}} page
 * @param {{order:number,zig:number,one:number}} variant
 * @returns {{count:number,data:Buffer}}
 */
function dctBits(page,variant){
  const file=path.join(ROOT,'resources/liber-primus',
    String(page.page+17).padStart(2,'0')+'.jpg');
  const r=spawnSync(BIN,[file,String(variant.order),String(variant.zig),
    String(variant.one)],{encoding:'buffer',maxBuffer:8*1024*1024});
  assert.equal(r.status,0,
    'DCT extraction failed: '+String(r.stderr));
  const e=r.stdout.indexOf(10);
  assert.ok(e>0,'missing DCT bit count');
  const count=Number(r.stdout.subarray(0,e).toString('ascii'));
  const data=r.stdout.subarray(e+1);
  assert.ok(Number.isSafeInteger(count));
  assert.equal(data.length,Math.ceil(count/8));
  return {count,data};
}

/** @param {{count:number,data:Buffer}} stream @param {number} i */
function bit(stream,i) {
  return (stream.data[i>>3]>>(7-(i&7)))&1;
}
/**
 * Decode sequential 5-, 6- or 8-bit groups into 0..28 candidate key symbols.
 * This tests only bit offset 0..15 and the declared direct packing family.
 * @param {{count:number,data:Buffer}} stream
 * @param {{width:number,reject:boolean}} mode
 * @param {number} phase
 * @param {number} required
 * @returns {Uint8Array}
 */
function key(stream,mode,phase,required){
  const out=new Uint8Array(required);
  let pos=phase;
  for(let j=0;j<required;) {
    assert.ok(pos+mode.width<=stream.count,'image bit stream too short');
    let v=0;
    for(let b=0;b<mode.width;b++)v=(v<<1)|bit(stream,pos++);
    if(mode.reject&&v>=29)continue;
    out[j++]=v%29;
  }
  return out;
}

/**
 * @param {Array<{page:number,indices:number[]}>} cipher
 * @param {Map<number,Uint8Array>} keys
 * @param {number} sign
 * @param {boolean} holdout
 * @returns {number}
 */
function ioc(cipher,keys,sign,holdout) {
  const freq=new Uint32Array(MOD);
  let n=0;
  for(const p of cipher) {
    if((p.page&1)!==+(holdout))continue;
    const k=keys.get(p.page);
    assert.equal(k.length,p.indices.length);
    for(let i=0;i<k.length;i++) {
      const v=(p.indices[i]-sign*k[i]+MOD)%MOD;
      freq[v]++;n++;
    }
  }
  const pairs=freq.reduce((s,c)=>s+c*(c-1),0);
  return pairs/(n*(n-1));
}
/** @param {number} v */
function round(v){return Number(v.toFixed(8));}

/**
 * Full fixed-family ranking trained on even original page numbers only.
 * Bits from each page's original JPEG are used as page-local pad material.
 *
 * @param {Array<{page:number,indices:number[]}>} cipher
 * @returns {{top:Array,settings:number,plantRank?:number}}
 */
function rank(cipher) {
  const scored=[];
  let streams=0;
  for(const v of variants) {
    const sources=new Map();
    for(const p of pages) {
      sources.set(p.page,dctBits(p,v));
      streams++;
    }
    for(const mode of modes)for(let phase=0;phase<PHASES;phase++) {
      const keys=new Map();
      for(const p of pages)
        keys.set(p.page,key(sources.get(p.page),mode,phase,p.indices.length));
      for(const sign of [-1,1]) {
        const training=ioc(cipher,keys,sign,false);
        scored.push({v:v.name,mode:mode.name,phase,sign,training,
          keys});
      }
    }
  }
  scored.sort((a,b)=>b.training-a.training);
  const top=scored.slice(0,8).map(x=>({variant:x.v,mode:x.mode,
    phase:x.phase,sign:x.sign,train:round(x.training),
    holdout:round(ioc(cipher,x.keys,x.sign,true))}));
  const plant=scored.findIndex(x=>x.v==='order0-zig1-one1'
    &&x.mode==='five-reject'&&x.phase===3&&x.sign===1)+1;
  return {top,settings:scored.length,streams,plantRank:plant};
}

/** @param {string} src */
function englishRuneIndices(src){
  const dict=new Map(corpus.translit.map((t,i)=>[t,i]));
  const out=[];
  for(const token of (src.toUpperCase().match(/[A-Z]+/g)||[])){
    const w=token.replace(/QU/g,'CW').replace(/V/g,'U')
      .replace(/K/g,'C').replace(/Z/g,'S');
    for(let i=0;i<w.length;){
      let found=false;
      for(const n of [3,2,1]) {
        if(dict.has(w.slice(i,i+n))) {
          out.push(dict.get(w.slice(i,i+n)));i+=n;found=true;break;
        }
      }
      assert.ok(found,'cannot encode plaintext grapheme');
    }
  }
  return out;
}

/** Assert known DCT-derived source pad is uniquely recoverable on English. */
function plantedCipher() {
  const source=englishRuneIndices(fs.readFileSync(
    path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8'));
  assert.ok(source.length>=12956);
  const mode=modes.find(x=>x.name==='five-reject');
  const variant=variants.find(x=>x.name==='order0-zig1-one1');
  let position=0;
  return pages.map(p=>{
    const k=key(dctBits(p,variant),mode,3,p.indices.length);
    const indices=p.indices.map((_,j)=>
      (source[position+j]+k[j])%MOD);
    position+=p.indices.length;
    return {page:p.page,indices};
  });
}
const planted=rank(plantedCipher());
const original=rank(pages);
assert.equal(planted.settings,1024);
assert.equal(original.settings,1024);
assert.equal(planted.plantRank,1,'planted DCT pad was not rank 1');
assert.ok(planted.top[0].holdout>0.05,'planted heldout failed');
console.log(JSON.stringify({scope:{
  pages:pages.length,sourceRunes:12956,variants:variants.length,
  candidateCount:original.settings,phaseBits:[0,PHASES-1],
  directions:['plus','minus'],
  controls:'source-selected synthetic Shakespeare GP-rune plaintext',
  exclusionScope:'unkeyed AC parity, direct 5/6/8-bit page-local pad only'},
  planted:{...planted,top:planted.top.slice(0,3)},
  original:{...original,top:original.top},
},null,2));
