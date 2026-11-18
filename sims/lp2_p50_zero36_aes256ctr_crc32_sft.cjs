'use strict';
/**
 * Original p50 zero-bracket 32+4 typed-packet and AES-256-CTR original-cipher gate.
 * Read only. Run on Node.js >=22.2: node sims/lp2_p50_zero36_aes256ctr_crc32_sft.cjs
 *
 * The source selects the 36-byte zero-bounded tape, but NOT the speculative
 * 32+4 split, CTR nonce convention, modulo29 projection or encryption clock.
 * Failures below reject precisely this frozen family, not every AES key use.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash,createCipheriv}=require('node:crypto');
const {crc32}=require('node:zlib');
const root=path.resolve(__dirname,'..');
/** @param {string} p @returns {unknown} */
const read=p=>JSON.parse(fs.readFileSync(path.resolve(root,p),'utf8'));
const grid=read('resources/liber-primus/base60-grid.json');
const corpus=read('resources/liber-primus/lp2-corpus.json');
const bytes=grid.byte_rows.flat();
assert.equal(bytes.length,256);
assert.deepEqual(bytes.flatMap((v,i)=>v===0?[i]:[]),[192,229]);
const tape=Buffer.from(bytes.slice(193,229));
assert.equal(tape.length,36);
assert.equal(createHash('sha256').update(tape).digest('hex'),
 '9205dc9d0d6071448dd91876e1211becd2b4ef224445030e11b08b63acbdd86b');
const first32=tape.subarray(0,32);
const last32=tape.subarray(4);
const first4=tape.subarray(0,4);
const last4=tape.subarray(32);
const crcToBig=number=>number.toString(16).padStart(8,'0');
const crc32Header=crcToBig(crc32(first32));
const crc32Trailer=crcToBig(crc32(last32));
assert.equal(last4.toString('hex'),'3449f990');
assert.equal(first4.toString('hex'),'9b9f59b0');
assert.equal(crc32Header,'44747632');
assert.equal(crc32Trailer,'f0009772');
assert.notEqual(crc32Header,last4.toString('hex'));
assert.notEqual(Buffer.from(last4).reverse().toString('hex'),crc32Header);
assert.notEqual(crc32Trailer,first4.toString('hex'));
assert.notEqual(Buffer.from(first4).reverse().toString('hex'),crc32Trailer);

const p51=corpus.pages[51].indices;
const p52=corpus.pages[52].indices;
const p55=corpus.pages[55].indices;
const p56=corpus.pages[56].indices;
const p57=corpus.pages[57].indices;
assert.deepEqual([p51.length,p52.length,p55.length,p56.length,p57.length],[92,263,76,85,95]);
const targets=[
 {name:'post-table p51 plus initial p52',value:p51.concat(p52.slice(0,78))},
 {name:'terminal unknown p55',value:p55},
 {name:'known-cipher p56',value:p56},
];
/** @param {number[]} a @returns {number} */
function coincidence(a){
 const h=Array(29).fill(0);
 for(const x of a){assert(x>=0&&x<29);h[x]++;}
 return h.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
/** @param {Buffer} iv @param {number} n @returns {Buffer} */
function stream(iv,n){
 const c=createCipheriv('aes-256-ctr',first32,iv);
 return Buffer.concat([c.update(Buffer.alloc(n)),c.final()]);
}
/** @param {number[]} a @param {Buffer} k @param {number} sign @returns {number[]} */
function runes(a,k,sign){
 return a.map((v,i)=>(v+sign*(k[i]%29)+29)%29);
}
const result=[];
for(const side of ['nonce-first','nonce-last']){
 const iv=side==='nonce-first'?Buffer.concat([last4,Buffer.alloc(12)]):
  Buffer.concat([Buffer.alloc(12),last4]);
 const keystream=stream(iv,170);
 for(const target of targets)for(const sign of [-1,1]){
  const transformed=runes(target.value,keystream,sign);
  assert.deepEqual(runes(transformed,keystream,-sign),target.value);
  result.push({nonce:side,source:target.name,sign,coincidence:coincidence(transformed),
   first12:transformed.slice(0,12).map(v=>corpus.translit[v]).join(' ')});
 }
 // Positive control: real solved p57 source, no guessed plaintext.
 const plant=runes(p57,keystream,1);
 assert.deepEqual(runes(plant,keystream,-1),p57);
}
assert.equal(result.length,12);
const expected=[
 ['nonce-first','post-table p51 plus initial p52',-1,0.0333449356],
 ['nonce-first','post-table p51 plus initial p52',1,0.0350852767],
 ['nonce-first','terminal unknown p55',-1,0.0385964912],
 ['nonce-first','terminal unknown p55',1,0.04],
 ['nonce-first','known-cipher p56',-1,0.0322128852],
 ['nonce-first','known-cipher p56',1,0.0364145658],
 ['nonce-last','post-table p51 plus initial p52',-1,0.0339714584],
 ['nonce-last','post-table p51 plus initial p52',1,0.0336233902],
 ['nonce-last','terminal unknown p55',-1,0.0298245614],
 ['nonce-last','terminal unknown p55',1,0.0371929825],
 ['nonce-last','known-cipher p56',-1,0.0288515406],
 ['nonce-last','known-cipher p56',1,0.0299719888]
];
for(let i=0;i<result.length;i++){
 const x=result[i],y=expected[i];
 assert.deepEqual([x.nonce,x.source,x.sign],y.slice(0,3));
 assert.ok(Math.abs(x.coincidence-y[3])<1e-10);
}
console.log(JSON.stringify({
 status:'Typed 32+CRC4 format fails; candidate AES-256-CTR GP29 transforms nonprose; no original plaintext',
 source:{firstZero:192,secondZero:229,interiorBytes:tape.length,
  sha256:createHash('sha256').update(tape).digest('hex')},
 crc32:{first32:crc32Header,last4:last4.toString('hex'),
  last32:crc32Trailer,first4:first4.toString('hex'),match:false},
 candidate:{keyBytes:32,nonceBytes:4,ivLayouts:2,signs:2,
  targetLengths:targets.map(x=>x.value.length),
  baselineClearP57IoC:coincidence(p57),fullNativePlant:true},
 original:result
},null,2));
