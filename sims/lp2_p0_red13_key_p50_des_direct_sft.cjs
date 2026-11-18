'use strict';
/** Source SFT: p0 red13 interpreted as a base29 64-bit DES key for p50's 32x8 bytes. Node22/CJS. */
const assert = require('node:assert/strict');
const {createCipheriv,createDecipheriv,createHash}=require('node:crypto');
const {readFileSync}=require('node:fs');
const {join}=require('node:path');

/** @param {Buffer} bytes @param {Buffer} key @param {'ECB'|'CBC'} mode @param {boolean} encrypt @returns {Buffer} */
function des(bytes,key,mode,encrypt){
  const cipher=encrypt?createCipheriv:createDecipheriv;
  const state=cipher(mode==='ECB'?'des-ede3':'des-ede3-cbc',Buffer.concat([key,key,key]),mode==='ECB'?null:Buffer.alloc(8));
  state.setAutoPadding(false);
  return Buffer.concat([state.update(bytes),state.final()]);
}
assert.equal(des(Buffer.from('85e813540f0ab405','hex'),Buffer.from('133457799bbcdff1','hex'),'ECB',false).toString('hex'),'0123456789abcdef');
const source=join(__dirname,'..','resources','liber-primus');
const corpus=JSON.parse(readFileSync(join(source,'lp2-corpus.json'),'utf8'));
const grid=JSON.parse(readFileSync(join(source,'base60-grid.json'),'utf8'));
const red=corpus.pages[0].indices.slice(0,13),known=corpus.pages[57].indices;
assert.deepEqual(red,[15,8,18,3,6,19,27,0,15,26,18,21,5]);
let numeral=0n;
for(const d of red)numeral=numeral*29n+BigInt(d);
const key=Buffer.from(numeral.toString(16).padStart(16,'0'),'hex');
assert.equal(key.toString('hex'),'4b1cde6f9c9af1e1');
assert.equal(grid.byte_rows.length,32);
for(const row of grid.byte_rows){assert.equal(row.length,8);for(const x of row)assert.ok(Number.isInteger(x)&&x>=0&&x<256);}
const input=Buffer.from(grid.byte_rows.flat());
assert.equal(createHash('sha256').update(input).digest('hex'),'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const interior=[];
for(let y=1;y<31;y++)for(let x=1;x<7;x++)interior.push(y*8+x);
assert.equal(interior.length,180);
assert.equal(known.length,95);
for(const endian of ['big','little']){
 const k=endian==='big'?key:Buffer.from(key).reverse();
 for(const mode of ['ECB','CBC']){
  const out=des(input,k,mode,false);
  assert.deepEqual(des(out,k,mode,true),input);
  const inside=interior.map(i=>out[i]),p57=inside.slice(85);
  const exact=p57.filter((v,i)=>v===known[i]).length, mod29=p57.filter((v,i)=>v%29===known[i]).length;
  assert.equal(exact,0);
  console.log(JSON.stringify({endian,mode,key:k.toString('hex'),first24Hex:out.subarray(0,24).toString('hex'),printable:out.filter(v=>v>=32&&v<127).length,insideGp:inside.filter(v=>v<29).length,p57Exact:exact,p57Mod29:mod29}));
 }
}
