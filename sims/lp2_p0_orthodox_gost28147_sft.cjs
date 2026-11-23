'use strict';
// Source-typed first-three-page GOST 28147-89 gate. Node 22, no packages.
// Source-independent test: RFC 4357 CryptoPro-A GOST ECB KAT.
const fs=require('node:fs'), assert=require('node:assert/strict'), P=require('node:path');
const root=P.resolve(__dirname,'..');
const book=JSON.parse(fs.readFileSync(P.join(root,'resources/liber-primus/lp2-corpus.json')));
const grid=JSON.parse(fs.readFileSync(P.join(root,'resources/liber-primus/lp2-grid-256.json')));
const s=[
[9,6,3,2,8,11,1,7,10,4,14,15,12,0,13,5],
[3,7,14,9,8,10,15,0,5,2,6,12,11,4,13,1],
[14,4,6,2,11,3,13,8,12,15,5,10,0,7,1,9],
[14,7,10,12,13,1,3,9,0,2,11,4,15,8,5,6],
[11,5,1,9,8,13,15,0,14,4,2,3,12,7,10,6],
[3,10,13,12,1,2,0,11,7,5,9,4,8,15,14,6],
[1,13,2,9,7,10,6,0,8,12,4,5,15,3,11,14],
[11,10,15,5,0,12,14,8,6,2,3,9,1,7,13,4]];
function ecb(k,b){
  assert.equal(k.length,32); assert.equal(b.length,8);
  let a=b.readUInt32LE(0),v=b.readUInt32LE(4);
  for(let i=0;i<32;i++){
    let z=(a+k.readUInt32LE((i<24?i%8:7-i%8)*4))>>>0,y=0;
    for(let j=0;j<8;j++)y|=s[j][(z>>>(4*j))&15]<<(j*4);
    let n=(v^((y<<11)|(y>>>21)))>>>0;v=a;a=n;
  }
  const out=Buffer.alloc(8);out.writeUInt32LE(v,0);out.writeUInt32LE(a,4);return out;
}
const katKey=Buffer.from('00112233445566778899aabbccddeeff102132435465768798a9bacbdcedf0e1','hex');
assert.equal(ecb(katKey,Buffer.from('1020304050607080','hex')).toString('hex'),'2685b30ddb497d05');
const col=grid.pages.flatMap(z=>z.bytes);assert.equal(col.length,256);
const key=Buffer.from(col.filter((_,i)=>i%8===4));assert.equal(key.length,32);
assert.equal(key.toString('hex'),'61f7669636e6566ac772adec530e360da9f5f63469949026b0c2463a90ee16b4');
const title=book.pages[0].indices.slice(0,13);
assert.deepEqual(title,[15,8,18,3,6,19,27,0,15,26,18,21,5]);
const number=xs=>xs.reduce((a,v)=>a*29n+BigInt(v),0n);
const iv=Buffer.alloc(8);iv.writeBigUInt64BE(number(title));
assert.equal(iv.toString('hex'),'4b1cde6f9c9af1e1');
const cs=book.pages.slice(0,3).flatMap(p=>p.indices);
assert.deepEqual(book.pages.slice(0,3).map(p=>p.runic_count),[262,266,201]);
const crypt=cs.slice(13);assert.equal(crypt.length,716);
function gamma(n){
  const seed=ecb(key,iv),out=Buffer.alloc(n);let lo=seed.readUInt32LE(0),hi=seed.readUInt32LE(4);
  for(let i=0;i<n;i+=8){
    lo=(lo+0x01010101)>>>0;hi=(hi+0x01010104)%0xffffffff;
    const ctr=Buffer.alloc(8);ctr.writeUInt32LE(lo,0);ctr.writeUInt32LE(hi,4);
    ecb(key,ctr).copy(out,i,0,Math.min(8,n-i));
  }
  return out;
}
const bytes=gamma(900);
assert.equal(bytes.subarray(0,32).toString('hex'),'b83e4fddca4ed2dc8bae2b70cc4850cee4f5ed7ac5963cfdc2f15b312db9f651');
// 716 stream bytes are entirely below RFC4357's first 1024-byte CryptoPro key-meshing boundary.
const direct=crypt.map((c,i)=>(c+29-bytes[i]%29)%29);
const filtered=Array.from(bytes).filter(v=>v<232);
assert(filtered.length>=716);
const rejection=crypt.map((c,i)=>(c+29-filtered[i]%29)%29);
const ioc=p=>{const ct=Array(29).fill(0);p.forEach(v=>ct[v]++);return ct.reduce((s,v)=>s+v*(v-1),0)/(p.length*(p.length-1));};
for(const [pt,ks] of [[direct,bytes],[rejection,filtered]]){
  assert.deepEqual(pt.map((v,i)=>(v+ks[i]%29)%29),crypt);
}
const known=book.pages[57].indices;assert.equal(known.length,95);
const plant=known.map((v,i)=>(v+bytes[i]%29)%29);
assert.deepEqual(plant.map((v,i)=>(v+29-bytes[i]%29)%29),known);
// The p0 black body as one high-first BASE29 integer and direct 151-byte ciphertext.
let x=number(crypt.slice(0,249)).toString(16);if(x.length%2)x='0'+x;
const packet=Buffer.from(x,'hex');assert.equal(packet.length,151);
const ctrPacket=Buffer.from(packet.map((v,i)=>v^bytes[i]));
function cfbDecrypt(ct){
  let feedback=iv,out=Buffer.alloc(ct.length);
  for(let i=0;i<ct.length;i+=8){
    const piece=ct.subarray(i,i+8),mask=ecb(key,feedback);
    for(let j=0;j<piece.length;j++)out[i+j]=piece[j]^mask[j];
    if(piece.length===8)feedback=piece;
  }return out;
}
const cfbPacket=cfbDecrypt(packet);
const printable=b=>Array.from(b).filter(v=>(v>=32&&v<=126)||v===9||v===10||v===13).length;
assert.equal(ctrPacket.subarray(0,16).toString('hex'),'f9b1e751f509e83de1991b864d8d3dd4');
assert.equal(cfbPacket.subarray(0,16).toString('hex'),'16c3e14a53663fc3e1b62ad00c327c90');
assert.equal(printable(ctrPacket),51);assert.equal(printable(cfbPacket),53);
const summary=a=>({p0Body249:ioc(a.slice(0,249)),heldoutP1P2_467:ioc(a.slice(249)),full716:ioc(a),first35GP:a.slice(0,35).map(v=>book.translit[v]).join('')});
console.log(JSON.stringify({
  keyHex:key.toString('hex'),ivHex:iv.toString('hex'),gamma32:bytes.subarray(0,32).toString('hex'),
  sourceIoC:ioc(crypt),runes:crypt.length,mod29:summary(direct),reject232:summary(rejection),
  p0Binary:{bytes:packet.length,ctrPrefix16:ctrPacket.subarray(0,16).toString('hex'),
    ctrPrintable:printable(ctrPacket),cfbPrefix16:cfbPacket.subarray(0,16).toString('hex'),
    cfbPrintable:printable(cfbPacket)},nativePositivePlant:known.length},null,2));
