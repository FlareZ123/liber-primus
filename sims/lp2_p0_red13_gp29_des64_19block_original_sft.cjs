'use strict';

/**
 * Original p0 source-shape bridge: 13 red GP29 title digits = 63.15 bits,
 * a complete 8-byte DES key; 249 remaining black GP29 runes =1209.64 bits
 * in 152 bytes =19 DES blocks. Try one printed-register whole-integer
 * packing with this literal source key, as DES-EDE3(K,K,K) ECB or zero-IV CBC.
 *
 * The source does not say DES/ECB/CBC/byte packing; this is a falsifiable
 * bounded original-cipher consumer, not authenticated plaintext.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const db=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'));
const original=db.pages[0].indices;
assert.deepEqual(original.slice(0,13),[15,8,18,3,6,19,27,0,15,26,18,21,5]);
assert.equal(original.length,262);
const title=original.slice(0,13);
const body=original.slice(13);
assert.equal(body.length,249);
const POW=29n**249n;
assert(POW>0n && POW<(1n<<1216n));

/** @param {number[]} digits @returns {Buffer} */
function pack(digits) {
  let n=0n;
  for(const x of digits){assert(Number.isInteger(x)&&x>=0&&x<29);n=29n*n+BigInt(x);}
  const nbytes=digits.length===13?8:152;
  const s=n.toString(16).padStart(2*nbytes,'0');
  assert.equal(s.length,nbytes*2);
  return Buffer.from(s,'hex');
}
/** @param {Buffer} buf @param {number} nDigits */
function unpack(buf,nDigits) {
  let n=BigInt('0x'+buf.toString('hex'));
  const digits=Array(nDigits);
  for(let i=nDigits-1;i>=0;i--){digits[i]=Number(n%29n);n/=29n;}
  return {overflow:n!==0n, digits};
}
/** @param {Buffer} block @param {Buffer} key @param {'ecb'|'cbc'} mode @param {boolean} decrypt */
function apply(block,key,mode,decrypt) {
  const k=Buffer.concat([key,key,key]);
  const iv=mode==='ecb'?null:Buffer.alloc(8);
  const state=decrypt?crypto.createDecipheriv((mode==='ecb'?'des-ede3':'des-ede3-cbc'),k,iv):
    crypto.createCipheriv((mode==='ecb'?'des-ede3':'des-ede3-cbc'),k,iv);
  state.setAutoPadding(false);
  return Buffer.concat([state.update(block),state.final()]);
}
const testKey=Buffer.from('133457799bbcdff1','hex');
assert.equal(apply(Buffer.from('85e813540f0ab405','hex'),testKey,'ecb',true).toString('hex'),
  '0123456789abcdef');
const titleKey=pack(title);
assert.equal(titleKey.toString('hex'),'4b1cde6f9c9af1e1');
const sourceNative=db.pages[57].indices;
assert.equal(sourceNative.length,95);
for(const dir of ['forward','reverse']) {
  const bodyDigits=dir==='forward'?body:body.slice().reverse();
  const sourceBytes=pack(bodyDigits);
  assert.deepEqual(unpack(sourceBytes,249).digits,bodyDigits);
  const key=dir==='forward'?titleKey:Buffer.from(titleKey).reverse();
  for(const mode of ['ecb','cbc']) {
    const decoded=apply(sourceBytes,key,mode,true);
    assert.deepEqual(apply(decoded,key,mode,false),sourceBytes);
    const parsed=unpack(decoded,249);
    // Positive: solved p57 native GP rune stream with original p0 body length
    // exactly recovers under the same DES mode; also pack/unpack native.
    const plant=Array.from({length:249},(_,i)=>sourceNative[i%95]);
    const pBytes=pack(plant);
    const plantedCipher=apply(pBytes,key,mode,false);
    assert.deepEqual(apply(plantedCipher,key,mode,true),pBytes);
    assert.deepEqual(unpack(apply(plantedCipher,key,mode,true),249).digits,plant);
    const hist=Array(29).fill(0);
    for(const x of parsed.digits)hist[x]++;
    const ioc=hist.reduce((s,v)=>s+v*(v-1),0)/(249*248);
    const printable=[...decoded].filter(b=>b>=32&&b<=126).length;
    console.log(JSON.stringify({dir,mode,bodyRunes:249,bodyBytes:152,
      decodedCanonicalGp29:!parsed.overflow,
      decryptedIoC:ioc,printableASCII:printable,
      bytePrefix:decoded.subarray(0,24).toString('hex'),
      gpPrefix:parsed.digits.slice(0,30).map(x=>db.translit[x]).join(' ')}));
  }
}
console.log('PASS original p0 red13/base29 DES64 19block gate: every original byte roundtrips and solved-p57 GP control roundtrips');
