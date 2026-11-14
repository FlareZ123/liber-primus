'use strict';
/**
 * Original p40--53 five-rune body and in-chapter p49--51 base60 byte table.
 * One frozen direct (non-PRNG) bytewise table consumption, plus reversible plant.
 * @module lp2_p40_fivedot_grid256_byte_sft
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const path=require('node:path');
const root=path.resolve(__dirname,'..','resources','liber-primus');
const data=JSON.parse(fs.readFileSync(path.join(root,'lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(path.join(root,'lp2-ink-annotations.json'),'utf8'));
const grid=JSON.parse(fs.readFileSync(path.join(root,'lp2-grid-256.json'),'utf8'));
const table=Buffer.from(grid.bytes);
assert.equal(table.length,256);
assert.equal(crypto.createHash('sha256').update(table).digest('hex'),'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const head=ink.pages.find(p=>p.page===40).red_spans.find(s=>s.start===0);
assert.equal(head.length,8);
const original=data.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
assert.equal(original.length,3008);
const body=original.slice(head.length);
assert.equal(body.length,3000);
const overflow=[];
const bytes=Buffer.alloc(1800);
for(let i=0;i<600;i++){
 let n=0;
 for(let j=0;j<5;j++)n=n*29+body[i*5+j];
 overflow.push(n>=16777216?1:0);
 n%=16777216;
 for(let j=0;j<3;j++)bytes[i*3+j]=(n>>(16-j*8))&255;
}
function apply(b,mode){
 const out=Buffer.alloc(b.length);
 for(let i=0;i<b.length;i++)out[i]=mode==='xor'?b[i]^table[i%256]:(mode==='sub'?(b[i]-table[i%256]+256)%256:(b[i]+table[i%256])%256);
 return out;
}
function inverse(b,mode){return apply(b,mode==='sub'?'add':mode==='add'?'sub':'xor');}
const magic={
 gzip:'1f8b08',zip:'504b0304',png:'89504e470d0a1a0a',pdf:'255044462d',
 bzip2:'425a68',xz:'fd377a585a00',sqlite:'53514c69746520666f726d6174203300',RIFF:'52494646',
 sevenzip:'377abcaf271c'
};
function analyse(b,name){
 const signature=Object.entries(magic).filter(([label,hex])=>b.subarray(0,hex.length/2).toString('hex')===hex).map(([label])=>label);
 const cmf=b[0],flg=b[1];
 const zlib=(cmf&15)===8&& (cmf>>4)<=7 && ((cmf*256+flg)%31===0);
 let valid=true;try{new TextDecoder('utf-8',{fatal:true}).decode(b);}catch(e){valid=false;}
 const ascii=[...b].filter(x=>x>=32&&x<=126).length;
 return {name,size:b.length,first16:b.subarray(0,16).toString('hex'),printable:ascii,printable_rate:Number((ascii/b.length).toFixed(5)),validUTF8:valid,magic:signature,zlibHeader:zlib,sha256:crypto.createHash('sha256').update(b).digest('hex')};
}
for(const mode of ['xor','sub','add']){
 const output=apply(bytes,mode);
 assert.deepEqual(inverse(output,mode),bytes);
 // Adversarial planted 24-byte headline under the same original, reused 256-byte table.
 const known=Buffer.from('THE PILGRIM FOLLOWS KEYS!', 'ascii');
 const ciphertext= inverse(known,mode);
 assert.deepEqual(apply(ciphertext,mode),known);
 console.log('SOURCE '+JSON.stringify(analyse(output,mode)));
}
console.log('ORIGINAL '+JSON.stringify({runes:body.length,groupCount:600,low24Bytes:bytes.length,sourceGrid:table.length,overflow:overflow.reduce((a,b)=>a+b,0)}));
console.log('PASS: source p40 heading, complete 600 groups, exact canonical grid256 SHA256 and three reversible planted bytewise table modes');
