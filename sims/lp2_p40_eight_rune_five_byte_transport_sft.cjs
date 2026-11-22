'use strict';
/**
 * Fixed 5-bit GP29 to 8-source-rune/5-byte original chapter transport:
 * source-printed five-site artwork and source-printed eight table columns.
 * P40 red heading is eight runes and exactly five bytes; both the complete
 * source chapter and its visually isolated body are byte aligned.
 * @module lp2_p40_eight_rune_five_byte_transport_sft
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const json=n=>JSON.parse(fs.readFileSync(path.join(root,'resources','liber-primus',n),'utf8'));
const data=json('lp2-corpus.json'),ink=json('lp2-ink-annotations.json'),table=json('lp2-grid-256.json');
const source=data.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
const red=ink.pages.find(p=>p.page===40).red_spans.find(s=>s.start===0);
assert.equal(source.length,3008);
assert.equal(red.length,8);
assert.deepEqual(source.slice(0,8).map(x=>data.runes[x]).join(''),red.runes);
assert.equal(table.bytes.length,256);
/** @param {number[]} original @returns {Buffer} */
function pack(original){
 assert.equal(original.length%8,0);
 const b=Buffer.alloc(original.length*5/8);
 for(let i=0;i<original.length;i+=8){
  let total=0n;
  for(let j=0;j<8;j++){
   const value=original[i+j];assert(Number.isInteger(value)&&value>=0&&value<29);
   total=(total<<5n)|BigInt(value);
  }
  for(let j=0;j<5;j++)b[i*5/8+j]=Number((total>>BigInt(32-j*8))&255n);
 }
 return b;
}
/** @param {Buffer} b @returns {number[]} */
function unpack(b){
 assert.equal(b.length%5,0);
 const out=[];
 for(let i=0;i<b.length;i+=5){
  let x=0n;for(let j=0;j<5;j++)x=(x<<8n)|BigInt(b[i+j]);
  for(let j=7;j>=0;j--)out.push(Number((x>>BigInt(j*5))&31n));
 }
 return out;
}
const magics=[['PNG','89504e470d0a1a0a'],['ZIP','504b0304'],['GZIP','1f8b08'],['BZIP2','425a68'],['XZ','fd377a585a00'],['PDF','255044462d'],['7Z','377abcaf271c'],['RIFF','52494646'],['SQLite','53514c69746520666f726d6174203300']];
/** @param {Buffer} b @param {string} label @returns {object} */
function report(b,label){
 let utf8=true;try{new TextDecoder('utf-8',{fatal:true}).decode(b);}catch(e){utf8=false;}
 const print=[...b].filter(v=>v>=32&&v<=126).length;
 return {
  label,byteLength:b.length,
  initial16:b.subarray(0,16).toString('hex'),
  last16:b.subarray(-16).toString('hex'),
  printable:print,asciiFraction:Number((print/b.length).toFixed(6)),
  utf8,magic:magics.filter(([,x])=>b.subarray(0,x.length/2).toString('hex')===x).map(([s])=>s),
  zlib:b.length>2&&(b[0]&15)===8&&(b[0]>>4)<=7&&(b.readUInt16BE(0)%31)===0,
  sha256:crypto.createHash('sha256').update(b).digest('hex')
 };
}
const body=source.slice(8);
assert.equal(body.length,3000);
const full=pack(source),packedHead=pack(source.slice(0,8)),packedBody=pack(body);
assert.deepEqual(unpack(packedBody),body);
assert.deepEqual(unpack(full),source);
assert.equal(full.length,1880);assert.equal(packedHead.length,5);assert.equal(packedBody.length,1875);
assert.deepEqual(full.subarray(0,5),packedHead);
assert.deepEqual(full.subarray(5),packedBody);
const controls=[
  ['raw body',packedBody],
  ['raw red8+body',full]
];
const tableBytes=Buffer.from(table.bytes);
function apply(buf,operation){
 const b=Buffer.alloc(buf.length);
 for(let i=0;i<buf.length;i++){
  const k=tableBytes[i%256],v=buf[i];
  b[i]=operation==='xor'?(v^k):operation==='subtract'?(v-k+256)%256:(v+k)%256;
 }
 return b;
}
function inverse(out,operation){return apply(out,operation==='subtract'?'add':operation==='add'?'subtract':'xor');}
for(const op of ['xor','subtract','add']){
 const transformed=apply(packedBody,op);
 assert.deepEqual(inverse(transformed,op),packedBody);
 const known=Buffer.from('THE PRIMES ARE SACRED, NOW!','ascii');
 assert.deepEqual(apply(inverse(known,op),op),known);
 controls.push(['body fixed table '+op,transformed]);
}
for(const [label,b] of controls)console.log('ORIGINAL '+JSON.stringify(report(b,label)));
const sample=Array.from({length:8},(_,i)=>i===0?28:i*2);
assert.deepEqual(unpack(pack(sample)),sample);
console.log('POSITIVE PASS: literal 8x5-bit GP29 stream, exact 5-byte source red heading and 1875-byte body, all original rune values round trip, three original-table inverse plants');
