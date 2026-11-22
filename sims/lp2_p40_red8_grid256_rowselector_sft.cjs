'use strict';
/**
 * P40 original eight-red-GP-rune heading as 32x8 table row selector:
 * for each original heading position col=0..7 choose printed table cell
 * [row=GP29-index, column=col]. This supplies exactly eight source bytes.
 * Test the zero-based, printed-order source-derived key without secret search.
 * @module lp2_p40_red8_grid256_rowselector_sft
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const get=x=>JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus',x),'utf8'));
const d=get('lp2-corpus.json'),ink=get('lp2-ink-annotations.json'),grid=get('lp2-grid-256.json');
const table=Buffer.from(grid.bytes);
assert.equal(table.length,256);
assert.equal(crypto.createHash('sha256').update(table).digest('hex'),'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const chapter=d.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
assert.equal(chapter.length,3008);
const red=ink.pages.find(p=>p.page===40).red_spans.find(s=>s.start===0);
assert.equal(red.length,8);
const heading=chapter.slice(0,8);
assert.deepEqual(heading.map(x=>d.runes[x]).join(''),red.runes);
const original=chapter.slice(8);
assert.equal(original.length,3000);
const addresses=heading.map((row,col)=>({row,col,sourceByte:table[row*8+col]}));
const key=Buffer.from(addresses.map(x=>x.sourceByte));
assert.equal(key.length,8);
assert.equal(key.toString('hex'),'cb4f0e3d56c07f6c');
/** @param {number[]} text @returns {number} */
function ioc(text){const f=Array(29).fill(0);for(const x of text)f[x]++;return f.reduce((n,x)=>n+x*(x-1),0)/(text.length*(text.length-1));}
/** @param {number[]} c @param {'subtract'|'add'} mode @returns {number[]} */
function gp(c,mode){return c.map((x,i)=>(x+(mode==='add'?key[i%8]%29:29-key[i%8]%29))%29);}
/** @param {number[]} t @param {'subtract'|'add'} mode @returns {number[]} */
function gpInverse(t,mode){return gp(t,mode==='add'?'subtract':'add');}
const corpusText=fs.readFileSync(path.join(root,'resources/control/gibran_prophet_58585.txt'),'utf8');
const alphabet=new Map(d.translit.map((s,i)=>[s,i]));
const reference=corpusText.toUpperCase().replace(/[^A-Z]/g,'').slice(0,3000);
assert.equal(reference.length,3000);
const gpPlant=Array.from({length:3000},(_,i)=>i%29); // exact 29-rune positive plant, includes every GP symbol
for(const mode of ['subtract','add']){
 const plain=gp(original,mode);
 assert.deepEqual(gpInverse(plain,mode),original);
 const generated=gpInverse(gpPlant,mode);
 assert.deepEqual(gp(generated,mode),gpPlant);
 console.log('RUNE '+JSON.stringify({mode,runes:3000,keyMod29:[...key].map(v=>v%29),ioc:Number(ioc(plain).toFixed(10)),E:plain.filter(v=>v===18).length,first90:plain.slice(0,90).map(x=>d.translit[x]).join(' ')}));
}
/** @param {number[]} runes @returns {Buffer} */
function pack(runes){
 assert.equal(runes.length%8,0);const out=Buffer.alloc(runes.length*5/8);
 for(let i=0;i<runes.length;i+=8){
  let x=0n;for(let j=0;j<8;j++)x=(x<<5n)|BigInt(runes[i+j]);
  for(let j=0;j<5;j++)out[(i/8)*5+j]=Number((x>>BigInt((4-j)*8))&255n);
 }
 return out;
}
const packed=pack(original);
assert.equal(packed.length,1875);
const magics={PNG:'89504e470d0a1a0a',GZIP:'1f8b08',ZIP:'504b0304',PDF:'255044462d',BZIP2:'425a68',XZ:'fd377a585a00',RIFF:'52494646'};
/** @param {Buffer} values @param {'xor'|'subtract'|'add'} mode @returns {Buffer} */
function byteOp(values,mode){
 return Buffer.from([...values].map((x,i)=>mode==='xor'?x^key[i%8]:mode==='subtract'?(x-key[i%8]+256)%256:(x+key[i%8])%256));
}
for(const mode of ['xor','subtract','add']){
 const inverse=mode==='xor'?'xor':mode==='subtract'?'add':'subtract';
 const output=byteOp(packed,mode);
 assert.deepEqual(byteOp(output,inverse),packed);
 const planted=Buffer.from('THE PRIMES ARE SACRED, NOW!','ascii');
 assert.deepEqual(byteOp(byteOp(planted,inverse),mode),planted);
 let utf8=true;try{new TextDecoder('utf-8',{fatal:true}).decode(output);}catch(e){utf8=false;}
 const printable=[...output].filter(c=>c>=32&&c<=126).length;
 const formats=Object.entries(magics).filter(([,hex])=>output.subarray(0,hex.length/2).toString('hex')===hex).map(([n])=>n);
 const zlib=(output[0]&15)===8&&(output[0]>>4)<=7&&output.readUInt16BE(0)%31===0;
 console.log('BYTE '+JSON.stringify({mode,bytes:output.length,first16:output.subarray(0,16).toString('hex'),printable,utf8,formats,zlib,sha256:crypto.createHash('sha256').update(output).digest('hex')}));
}
console.log('SOURCE '+JSON.stringify({runes:3000,redHeadingIndices:heading,grid32x8:true,addresses,keyHex:key.toString('hex')}));
console.log('PASS original heading and printed table authentic, exact GP and packed-byte inverses, positive plants; no chosen key or offset');
