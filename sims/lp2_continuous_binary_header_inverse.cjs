'use strict';
/**
 * Global, unpacketized GP28 -> binary header gate with an arbitrary hidden
 * 28-way alphabet. Tests both predecessor ranks and both stream directions.
 * The gate uses exact base28 numerical intervals, never a fitted alphabet.
 *
 * Run: node sims/lp2_continuous_binary_header_inverse.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const gp=JSON.parse(fs.readFileSync(path.resolve(__dirname,
  '../resources/liber-primus/lp2-corpus.json'),'utf8'));
const pages=gp.pages.filter(p=>p.page<56&&p.indices.length);
assert.equal(pages.length,55);
assert.equal(pages.reduce((s,p)=>s+p.indices.length,0),12956);
const M=28n,N=12815,UPPER=M**BigInt(N),LOWER=UPPER/M;
const SIZE=Array.from({length:15},(_,i)=>7694+i);

/** @param {number[][]} pp @param {'cyclic'|'sorted'} rule */
function ranks(pp,rule){
  const out=[];let repeats=0;
  for(const a of pp)for(let i=1;i<a.length;i++){
    const q=a[i-1],v=a[i];
    if(q===v){repeats++;continue;}
    out.push(rule==='cyclic'?(v-q+29)%29:v-Number(v>q));
  }
  return {out,repeats};
}
const source=pages.map(p=>p.indices);
const C=ranks(source,'cyclic'),S=ranks(source,'sorted');
assert.equal(C.out.length,N);assert.equal(S.out.length,N);
assert.equal(C.repeats,86);assert.equal(S.repeats,86);
const observed={
  cyclic:C.out,sorted:S.out,
  'cyclic-reversed':C.out.slice().reverse(),
  'sorted-reversed':S.out.slice().reverse()
};
/**
 * All base28 integers having the declared binary prefix lie in the byte
 * interval [h*256^(B-p), (h+1)*256^(B-p)-1].
 * Intersect with integers having exactly N significant base28 digits.
 * Return every leading digit fixed across the entire intersection.
 * @param {number[]} prefix
 * @param {number} B
 * @returns {number[]|null}
 */
function fixedDigits(prefix,B){
  if(prefix.length>B)return null;
  let h=0n;for(const v of prefix)h=h*256n+BigInt(v);
  const bits=BigInt(8*(B-prefix.length));
  let a=h<<bits,b=((h+1n)<<bits)-1n;
  if(a>=UPPER||b<LOWER)return null;
  if(a<LOWER)a=LOWER;if(b>=UPPER)b=UPPER-1n;
  const fixed=[];
  for(let i=1;i<=24;i++){
    const q=M**BigInt(N-i);
    if(a/q!==b/q)break;
    fixed.push(Number(a/q%M));
  }
  return fixed;
}
/**
 * A secret bijection preserves each equality and inequality among labels.
 * The first violated pair refutes every one of 28! fixed alphabets.
 * @param {number[]} expected
 * @param {number[]} actual
 */
function conflict(expected,actual){
  for(let i=1;i<expected.length;i++)for(let j=0;j<i;j++)
    if((expected[i]===expected[j])!==(actual[i]===actual[j]))
      return {positions:[j,i],expected:[expected[j],expected[i]],
        observed:[actual[j],actual[i]]};
  return null;
}
/** @param {number[]} prefix */
function evaluate(prefix){
  const output=[];
  for(const B of SIZE){
    const d=fixedDigits(prefix,B);
    if(d===null)continue;
    output.push({bytes:B,fixed:d.length,digits:d,
      conflicts:Object.fromEntries(Object.entries(observed).map(
        ([name,seq])=>[name,conflict(d,seq)]))});
  }
  return output;
}
/** XXH32 for the two-byte LZ4 FLG,BD descriptor; seed zero. */
function lz4HC(flg,bd){
  const rol=(v,k)=>(v<<k)|(v>>>(32-k));
  let h=(0x165667b1+2)>>>0;
  for(const byte of [flg,bd])
    h=Math.imul(rol((h+Math.imul(byte,0x165667b1))>>>0,11),
      0x9e3779b1)>>>0;
  h^=h>>>15;h=Math.imul(h,0x85ebca77)>>>0;
  h^=h>>>13;h=Math.imul(h,0xc2b2ae3d)>>>0;h^=h>>>16;
  return (h>>>8)&255;
}
assert.equal(lz4HC(0x40,0x40),192);
assert.equal(lz4HC(0x60,0x70),115);
const lz4Head=(f,b)=>[4,34,77,24,f,b,lz4HC(f,b)];
const headers=[
  ['gzip-magic', [31,139,8]],
  ['gzip-FLG-zero', [31,139,8,0]],
  ['7zip-version-0.4', [55,122,188,175,39,28,0,4]],
  ['XZ', [253,55,122,88,90,0]],
  ['ZIP', [80,75,3,4]],
  ['zlib-78-9c', [120,156]],
  ['LZ4', [4,34,77,24]],
  ['PNG', [137,80,78,71,13,10,26,10]],
  ['PDF', [...Buffer.from('%PDF-')]],
  ['JPEG', [255,216,255]]
];
for(let n=1;n<=9;n++)
  headers.push(['bzip2-'+n,[...Buffer.from('BZh'+n+'1AY&SY')]]);
const headerResults=headers.map(([name,prefix])=>({name,
  possible:evaluate(prefix)}));

/**
 * Single-block LZ4 frames with neither optional content size nor dictionary
 * ID. Header FLG bits cover block independence, block checksum and content
 * checksum; BD covers all four legal maximum block sizes. Include compressed
 * and raw-block storage. Given total source-byte length, the encoded four-byte
 * little-endian block size is uniquely determined in every case.
 */
const modes=Object.keys(observed);
const lz4={tested:0,
  headerSurvivors:Object.fromEntries(modes.map(name=>[name,0])),
  oneBlockSurvivors:Object.fromEntries(modes.map(name=>[name,0])),
  firstConflicts:[]};
for(const flg of [0x40,0x60,0x50,0x44,0x70,0x64,0x54,0x74])
  for(const bd of [0x40,0x50,0x60,0x70]){
    const head=lz4Head(flg,bd);
    const baseline=evaluate(head);
    assert.equal(baseline.length,1);
    for(const name of modes)
      if(baseline[0].conflicts[name]===null)lz4.headerSurvivors[name]++;
    const B=baseline[0].bytes;
    const payload=B-7-4-4-Number(Boolean(flg&0x10))*4
      -Number(Boolean(flg&0x04))*4;
    assert(payload>0&&payload<65536);
    for(const uncompressed of [false,true]){
      const block=payload+(uncompressed?0x80000000:0);
      const size=[0,8,16,24].map(s=>(block>>>s)&255);
      const a=evaluate([...head,...size]);
      assert.equal(a.length,1);
      lz4.tested++;
      for(const name of modes)
        if(a[0].conflicts[name]===null)lz4.oneBlockSurvivors[name]++;
      if(lz4.firstConflicts.length<2)
        lz4.firstConflicts.push({flg,bd,uncompressed,
          digits:a[0].digits,conflict:a[0].conflicts.cyclic});
    }
  }
assert.equal(lz4.tested,64);
assert(Object.values(lz4.oneBlockSurvivors).every(x=>x===0));
assert(headerResults.find(x=>x.name==='gzip-FLG-zero')
  .possible[0].conflicts.cyclic!==null);

/*
 * Source-shaped positive: an actual valid uncompressed one-block LZ4 frame,
 * unknown secret 28-label permutation, all 55 manuscript page IVs and all
 * 86 original repeat positions. Decode the complete synthetic frame and
 * compare all 7701 source bytes, not merely the recognized header.
 */
const head=lz4Head(0x60,0x40),PAYLOAD=7701-7-4-4;
const raw=Buffer.alloc(PAYLOAD);
for(let i=0;i<PAYLOAD;i+=32){
  const ctr=Buffer.alloc(4);ctr.writeUInt32BE(i/32);
  crypto.createHash('sha256').update('GP28 positive').update(ctr).digest()
    .copy(raw,i,0,Math.min(32,PAYLOAD-i));
}
const size=Buffer.alloc(4);size.writeUInt32LE(PAYLOAD+0x80000000);
const bytes=Buffer.concat([Buffer.from(head),size,raw,Buffer.alloc(4)]);
assert.equal(bytes.length,7701);
let value=BigInt('0x'+bytes.toString('hex'));
assert(value>=LOWER&&value<UPPER);
const digits=Array(N);
for(let i=N-1;i>=0;i--){digits[i]=Number(value%M);value/=M;}
assert.equal(value,0n);
const secret=Array.from({length:28},(_,i)=>((11*i+7)%28)+1);
assert.equal(new Set(secret).size,28);
let pos=0;
const generated=source.map(p=>{
  let previous=p[0];const emitted=[previous];
  for(let i=1;i<p.length;i++){
    if(p[i]!==p[i-1])previous=(previous+secret[digits[pos++]])%29;
    emitted.push(previous);
  }
  return emitted;
});
assert.equal(pos,N);
const rank=ranks(generated,'cyclic');
assert.equal(rank.repeats,86);
const unmap=Array(29).fill(-1);
for(let i=0;i<28;i++)unmap[secret[i]]=i;
const recovered=rank.out.map(x=>unmap[x]);
assert.deepEqual(recovered,digits);
let number=0n;for(const d of recovered)number=number*M+BigInt(d);
const restored=Buffer.from(number.toString(16).padStart(15402,'0'),'hex');
assert(restored.equals(bytes));
assert.equal(conflict(evaluate([...head,...size])[0].digits,rank.out),null);

console.log(JSON.stringify({architecture:'continuous GP28 integer with hidden fixed alphabet',
  input:{runes:12956,pageIVs:55,removedRepeats:86,digits:N},
  fileByteLengthsConsidered:[SIZE[0],SIZE.at(-1)],
  signatures:headerResults,lz4,
  positive:{sourceFileBytes:restored.length,rankDigits:recovered.length,
    recoveredFullSyntheticCiphertext:generated.flat().length,exact:true},
  originalRecoveredPlaintext:false},null,2));
