'use strict';
/**
 * SFT: historically attested full BASE29 integer bytes XOR AES256-CTR stream
 * under four source-derived red-rune/13-dot 256-bit keys, not a claimed Cicada cipher.
 * Original LP2 unchanged. Node.js 22, CommonJS built-ins, read-only.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createCipheriv,createHash}=require('node:crypto');
const base=path.join(__dirname,'..','resources','liber-primus');
/** @param {string} name @returns {any} */
const read=name=>JSON.parse(fs.readFileSync(path.join(base,name),'utf8'));
const gp=read('lp2-corpus.json'), ann=read('lp2-ink-annotations.json');
const table=read('lp2-grid-256.json').pages.flatMap(p=>p.bytes);
assert.equal(table.length,256);
const pages=gp.pages.filter(p=>p.page<=55&&p.indices.length);
const index=new Map(gp.runes.map((r,i)=>[r,i]));
const events=[];
for(const p of ann.pages){
 for(const span of p.red_spans||[]) [...span.runes].forEach((r,j)=>{
  assert(index.has(r));events.push({page:p.page,pos:span.start+j,mark:false,value:index.get(r)});
 });
 for(const mark of p.large_punctuation||[])if(mark[1]===13)
  events.push({page:p.page,pos:mark[0],mark:true,value:0});
}
events.sort((a,b)=>a.page-b.page||a.pos-b.pos||(a.mark===b.mark?0:a.mark?-1:1));
assert.equal(events.length,256);
const keyRules=[
 ['redParity_dot1',events.map(e=>e.mark?1:e.value&1)],
 ['redParity_dot0',events.map(e=>e.mark?0:e.value&1)],
 ['redHigh_dot1',events.map(e=>e.mark?1:Number(e.value>=15))],
 ['redHigh_dot0',events.map(e=>e.mark?0:Number(e.value>=15))]
];
const keys=keyRules.map(([id,bits])=>({
 id,key:Buffer.from(Array.from({length:32},(_,i)=>bits.slice(i*8,i*8+8).reduce((x,b)=>(x<<1)|b,0)))
}));
assert.deepEqual(keys.map(x=>x.key.toString('hex')),[
'969e9985ec6e7c78636fa82fe7b244f3413f22709fd99b92e10a3e36dde3eb89',
'96989984606e0c78436e280fe4b244334139221087199b92e10a3e36d9e26888',
'a6f7134baf6e7b42e2439ff457524deed9e704705dcda280e95c142507e3db5f',
'a6f1134a236e0b42c2421fd454524d2ed9e10410450da280e95c142503e2585e']);
const ivs=[
 {id:'zeroIV',value:Buffer.alloc(16)},
 {id:'p50First16',value:Buffer.from(table.slice(0,16))}
];
const starts=new Set([0,3,8,15,23,28,32,40,54]);
const packets=[{id:'whole',indices:pages.flatMap(x=>x.indices)}];
let chapter=[];
for(const page of pages){
 if(starts.has(page.page)&&chapter.length){packets.push({id:'chapter_'+chapter[0].page,indices:chapter.flatMap(x=>x.indices)});chapter=[];}
 chapter.push(page);
}
packets.push({id:'chapter_'+chapter[0].page,indices:chapter.flatMap(x=>x.indices)});
for(const page of pages)packets.push({id:'page_'+page.page,indices:page.indices});
assert.equal(packets.length,65);
assert.equal(packets[0].indices.length,12956);
const magic=[
 ['gzip','1f8b08'],['bzip2','425a68'],['zip','504b0304'],['png','89504e470d0a1a0a'],
 ['xz','fd377a585a00'],['pdf','255044462d'],['7zip','377abcaf271c'],['jpeg','ffd8ff'],
 ['gif','474946383961'],['sqlite','53514c69746520666f726d6174203300'],
 ['elf','7f454c46'],['riff','52494646'],['ogg','4f676753'],['id3','494433'],
 ['pgpAscii','2d2d2d2d2d424547494e20504750'],['base64png','6956424f5277304b47676f']
];
/** @param {number[]} digits @returns {{minimal:Buffer,fixed:Buffer}} */
function base29(digits){
 let n=0n;
 for(const d of digits){assert(d>=0&&d<29);n=n*29n+BigInt(d);}
 let hex=n.toString(16);if(hex.length%2)hex='0'+hex;
 const minimal=Buffer.from(hex,'hex');
 const fixed=Buffer.alloc(Math.ceil(digits.length*Math.log2(29)/8));
 minimal.copy(fixed,fixed.length-minimal.length);
 return {minimal,fixed};
}
/** @param {Buffer} input @param {Buffer} key @param {Buffer} iv @returns {Buffer} */
function aesCtrXor(input,key,iv){
 const enc=createCipheriv('aes-256-ctr',key,iv);
 return Buffer.concat([enc.update(input),enc.final()]);
}
let originalTests=0,correctPlants=0;const hits=[],maxPrint=[];
for(const packet of packets){
 const numbers=base29(packet.indices);
 for(const [mode,plain] of Object.entries(numbers)){
  for(const key of keys)for(const iv of ivs){
   const x=aesCtrXor(plain,key.key,iv.value);
   assert.deepEqual(aesCtrXor(x,key.key,iv.value),plain);
   originalTests++;
   for(const [id,hex] of magic){
    if(x.subarray(0,hex.length/2).toString('hex')===hex)hits.push({packet:packet.id,mode,key:key.id,iv:iv.id,signature:id});
   }
   const readable=x.subarray(0,Math.min(x.length,128));
   const printable=[...readable].filter(n=>n>=32&&n<=126||n===9||n===10||n===13).length/readable.length;
   maxPrint.push({packet:packet.id,mode,key:key.id,iv:iv.id,first16:x.subarray(0,16).toString('hex'),printable});
   const planted=Buffer.from('LIBER PRIMUS SOURCE-NATIVE TEST ENGLISH PAYLOAD AND PNG SIGNATURE');
   const y=aesCtrXor(planted,key.key,iv.value);
   assert.deepEqual(aesCtrXor(y,key.key,iv.value),planted);
   correctPlants++;
  }
 }
}
for(const key of keys)for(const iv of ivs){
 const plain=Buffer.from(table);
 const x=aesCtrXor(plain,key.key,iv.value);
 assert.deepEqual(aesCtrXor(x,key.key,iv.value),plain);
 originalTests++;
 for(const [id,hex] of magic){
  if(x.subarray(0,hex.length/2).toString('hex')===hex)hits.push({
   packet:'original_p50_table',mode:'printed256bytes',key:key.id,iv:iv.id,signature:id});
 }
 const printable=[...x].filter(n=>n>=32&&n<=126||n===9||n===10||n===13).length/x.length;
 maxPrint.push({packet:'original_p50_table',mode:'printed256bytes',key:key.id,iv:iv.id,
  first16:x.subarray(0,16).toString('hex'),printable});
 const planted=Buffer.from('LIBER PRIMUS SOURCE-NATIVE TEST ENGLISH PAYLOAD AND PNG SIGNATURE');
 const y=aesCtrXor(planted,key.key,iv.value);
 assert.deepEqual(aesCtrXor(y,key.key,iv.value),planted);
 correctPlants++;
}
// Simpler, physically motivated separate consumer: table has 32 rows x 8 columns,
// bit-packed red-event key has 32 bytes. Repeat each 32-byte key for eight slices.
const xorCandidates=[];
for(const [orientation,source] of [
 ['printedRowMajor',Buffer.from(table)],
 ['eightColumns32Rows',Buffer.from(Array.from({length:256},(_,i)=>
   table[8*(i%32)+Math.floor(i/32)]))]
]){
 for(const key of keys){
  const output=Buffer.from(source.map((v,i)=>v^key.key[i%32]));
  assert.deepEqual(Buffer.from(output.map((v,i)=>v^key.key[i%32])),source);
  const signatures=magic.filter(([id,hex])=>
    output.subarray(0,hex.length/2).toString('hex')===hex).map(([id])=>id);
  const printable=[...output].filter(n=>n>=32&&n<=126||n===9||n===10||n===13).length;
  const GP29=[...output].filter(n=>n<29).length;
  xorCandidates.push({orientation,key:key.id,signatures,printable,GP29,
    first16:output.subarray(0,16).toString('hex')});
 }
}
assert.equal(xorCandidates.length,8);
assert.equal(originalTests,1048);
assert.equal(correctPlants,1048);
const all=maxPrint.sort((a,b)=>b.printable-a.printable);
console.log(JSON.stringify({
 packetCount:packets.length,sourceRunes:packets[0].indices.length,
 widths:packets.slice(0,10).map(p=>({id:p.id,GP:p.indices.length,
  min:base29(p.indices).minimal.length,fixed:base29(p.indices).fixed.length})),
 keys:keys.map(k=>k.id),IVs:ivs.map(v=>v.id),
 tests:originalTests,fullPositiveControls:correctPlants, repeatedXorCases:xorCandidates,
 signatures:hits,highestPrintRatio:all.slice(0,12),
 sourceWholeChecksum:createHash('sha256').update(Buffer.from(packets[0].indices)).digest('hex')
},null,2));
