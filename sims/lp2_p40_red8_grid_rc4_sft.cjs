'use strict';
/**
 * One frozen historical RC4 stream consumer of the original p40 red8
 * one-byte-per-column key and p40 floral eight-GP-to-five-byte bitpack.
 * Cipher mechanism is a hypothesis, not a Cicada-authenticated operation.
 * @module lp2_p40_red8_grid_rc4_sft
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const json=x=>JSON.parse(fs.readFileSync(path.join(root,'resources','liber-primus',x),'utf8'));
const d=json('lp2-corpus.json'),ink=json('lp2-ink-annotations.json'),grid=json('lp2-grid-256.json');
const original=d.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
assert.equal(original.length,3008);
const heading=original.slice(0,8);
const red=ink.pages.find(p=>p.page===40).red_spans.find(s=>s.start===0);
assert.equal(red.length,8);assert.equal(heading.map(v=>d.runes[v]).join(''),red.runes);
const key=Buffer.from(heading.map((r,i)=>grid.bytes[r*8+i]));
assert.equal(key.toString('hex'),'cb4f0e3d56c07f6c');
/** @param {Buffer} buf @param {Buffer} secret @returns {Buffer} */
function rc4(buf,secret){
 const s=Uint8Array.from({length:256},(_,i)=>i);
 let j=0;
 for(let i=0;i<256;i++){
  j=(j+s[i]+secret[i%secret.length])&255;
  [s[i],s[j]]=[s[j],s[i]];
 }
 let i=0; j=0;
 const output=Buffer.alloc(buf.length);
 for(let n=0;n<buf.length;n++){
  i=(i+1)&255;j=(j+s[i])&255;
  [s[i],s[j]]=[s[j],s[i]];
  const k=s[(s[i]+s[j])&255];output[n]=buf[n]^k;
 }
 return output;
}
// Original official RFC 6229, 40-bit RC4 sample, first 32 bytes.
const vectorKey=Buffer.from('0102030405','hex');
const vector=rc4(Buffer.alloc(32),vectorKey);
assert.equal(vector.toString('hex'),'b2396305f03dc027ccc3524a0a1118a86982944f18fc82d589c403a47a0d0919');
const sourceBody=original.slice(8);
assert.equal(sourceBody.length,3000);
const packed=Buffer.alloc(1875);
for(let k=0;k<375;k++){
 let n=0n;for(let t=0;t<8;t++)n=(n<<5n)|BigInt(sourceBody[k*8+t]);
 for(let t=0;t<5;t++)packed[k*5+t]=Number((n>>BigInt((4-t)*8))&255n);
}
const decrypted=rc4(packed,key);
assert.deepEqual(rc4(decrypted,key),packed);
const planted=Buffer.from('THE PRIMES ARE SACRED, ALL TEXT IS HERE!','ascii');
assert.deepEqual(rc4(rc4(planted,key),key),planted);
let utf8=true;try{new TextDecoder('utf-8',{fatal:true}).decode(decrypted);}catch(e){utf8=false;}
const magics={PNG:'89504e470d0a1a0a',GZIP:'1f8b08',ZIP:'504b0304',PDF:'255044462d',BZIP2:'425a68',XZ:'fd377a585a00',RIFF:'52494646'};
const known=Object.entries(magics).filter(([,hex])=>decrypted.subarray(0,hex.length/2).toString('hex')===hex).map(([n])=>n);
const zlib=(decrypted[0]&15)===8&&(decrypted[0]>>4)<=7&&decrypted.readUInt16BE(0)%31===0;
console.log('RFC6229 PASS '+vector.toString('hex'));
console.log('SOURCE '+JSON.stringify({heading,key:key.toString('hex'),originalRunes:sourceBody.length,packBytes:packed.length}));
console.log('ORIGINAL '+JSON.stringify({rc4NoDrop:true,first32:decrypted.subarray(0,32).toString('hex'),last16:decrypted.subarray(-16).toString('hex'),printable:[...decrypted].filter(x=>x>=32&&x<=126).length,utf8,known,zlib,sha256:crypto.createHash('sha256').update(decrypted).digest('hex')}));
console.log('PLANT PASS: 1875 source bytes and independent genuine English exactly re-encrypt under source-proposed eight-byte RC4 key');
