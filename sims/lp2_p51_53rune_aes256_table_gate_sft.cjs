'use strict';
/**
 * LP2 p51 "shed circumference" 53-rune base29 key -> AES-256 on original
 * 256-byte p49/p50/p51 numeral table. Source-selected bounded direct inverse.
 * Windows Node22: node sims/lp2_p51_53rune_aes256_table_gate_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const book = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const rawPages = read('resources/liber-primus/lp2-transcription.txt')
  .split('%').filter(s=>/[ᚠ-ᛡ]/u.test(s));
const idx = new Map(book.runes.map((r,i)=>[r,i]));
const page51 = rawPages[50].replace(/[\r\n/]/g,'').split(/[-.]/)
  .map(s=>(s.match(/[ᚠ-ᛡ]+/gu)||[]).join('')).filter(Boolean)
  .map(w=>[...w].map(r=> {
    const n=idx.get(r);
    assert.notEqual(n,undefined);
    return n;
  }));
assert.equal(page51.length,20);
assert.equal(page51.flat().length,92);
const interior=page51.flatMap(w=>w.slice(1,-1));
assert.equal(interior.length,53);
assert.equal(grid.bytes.length,256);
assert.deepEqual(grid.bytes.slice(0,8),[203,231,167,186,97,237,126,183]);
const base=29n;
const keyNumber=interior.reduce((x,n)=>base*x+BigInt(n),0n);
assert.ok(keyNumber < (1n << 256n),'the source bigint must fit a 256-bit key');
assert.ok(keyNumber >= (1n << 255n),'the source bigint uses exactly 256 bits');
const hex=keyNumber.toString(16).padStart(64,'0');
assert.equal(hex,'c2f2cdb6341367422f55819750712e129c3664442b162d65a2670099f1b64ee5');
const key=Buffer.from(hex,'hex');
const ciphertext=Buffer.from(grid.bytes);
const decipher=(mode,ct,iv,autopadding=false)=>{
  const d=crypto.createDecipheriv(mode,key,iv);
  d.setAutoPadding(autopadding);
  return Buffer.concat([d.update(ct),d.final()]);
};
const enc=crypto.createCipheriv('aes-256-ecb',key,null);
enc.setAutoPadding(false);
const planted=Buffer.from(book.pages[57].indices.slice(0,80));
assert.equal(planted.length,80);
const plantedCipher=Buffer.concat([enc.update(planted),enc.final()]);
assert.deepEqual(decipher('aes-256-ecb',plantedCipher,null),planted);
/** @param {Buffer} decoded */
function describe(decoded) {
  const ascii=[...decoded].map(b=>b>=32&&b<=126?String.fromCharCode(b):'.').join('');
  const gp29=Array.from(decoded,b=>b%29);
  const gpStr=gp29.map(i=>book.translit[i]).join('');
  const count29=[...decoded].filter(b=>b<29).length;
  const printable=[...decoded].filter(b=>b>=32&&b<=126).length;
  const zero=[...decoded].filter(b=>b===0).length;
  const runCount=Array(29).fill(0);
  for(const x of gp29)runCount[x]++;
  const ioc=runCount.reduce((a,b)=>a+b*(b-1),0)/(gp29.length*(gp29.length-1));
  const words=ascii.match(/[A-Za-z]{4,}/g)||[];
  return {
    length:decoded.length,sha256:crypto.createHash('sha256').update(decoded).digest('hex'),
    printableBytes:printable,validGpIndexBytes:count29,zeroBytes:zero,
    longestAsciiWord:words.sort((a,b)=>b.length-a.length).slice(0,6),
    gp29ReducedIoc:ioc,
    firstHex:decoded.subarray(0,64).toString('hex'),
    asciiPreview:ascii.slice(0,256),
    reducedGp29Preview:gpStr.slice(0,180)
  };
}
const cbcZero=decipher('aes-256-cbc',ciphertext,Buffer.alloc(16));
const ecb=decipher('aes-256-ecb',ciphertext,null);
const ctrZero=decipher('aes-256-ctr',ciphertext,Buffer.alloc(16));
const cbcPrefixIV=decipher('aes-256-cbc',ciphertext.subarray(16),ciphertext.subarray(0,16));
const output={
  hypothesis:'Whole printed word circumference removal, 53 GP29-digit base29 big-endian 256-bit key, original contiguous 256-byte table',
  source:{firstWord:page51[0].map(i=>book.translit[i]).join(''),
    printedWords:page51.length,runicCount:92,interiorRunes:interior.length,
    extractedKeyHex:hex,keyBits:keyNumber.toString(2).length,originalTableBytes:ciphertext.length,
    originalTableSHA256:crypto.createHash('sha256').update(ciphertext).digest('hex')},
  nativePlantedAES256ECB:'PASS',
  originalCandidates:{
    aes256EcbNoPadding:describe(ecb),
    aes256CbcZeroIvNoPadding:describe(cbcZero),
    aes256CtrZeroCounter:describe(ctrZero),
    aes256CbcFirst16BytesAsIvNoPadding:describe(cbcPrefixIV)
  },
  caution:'AES and the mode/IV are not specified by original art. Output must be independently plaintext or a cryptographically identified structured payload; bytes which merely fit a 256-bit key are not an authenticated AES key.'
};
console.log(JSON.stringify(output,null,2));
