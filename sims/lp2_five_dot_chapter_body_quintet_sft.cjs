'use strict';
/**
 * Five-dot LP2 visual chapter 5-rune / 24-bit binary transport, source-frozen.
 * Pairings: p23 start figure + p23–26 after 16-rune red heading,
 *           p40–53 floral berry motif + p40 after 8-rune red heading.
 * Both body lengths must be divisible by five on original read order.
 *
 * This tests one reversible BASE29 quintet/3-byte serialization with a
 * separately retained 1-bit overflow; no arbitrary start, key or permutation.
 * @module lp2_five_dot_chapter_body_quintet_sft
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const original=name=>JSON.parse(fs.readFileSync(path.join(root,'resources','liber-primus',name),'utf8'));
const d=original('lp2-corpus.json'),ink=original('lp2-ink-annotations.json');
const LIMIT=29**5, CAP=2**24;
const sig=[
 ['GZIP','1f8b08'],['BZIP2','425a68'],['XZ','fd377a585a00'],
 ['PNG','89504e470d0a1a0a'],['ZIP local','504b0304'],['ZIP empty','504b0506'],
 ['PDF','255044462d'],['7ZIP','377abcaf271c'],['RIFF','52494646'],
 ['SQLite','53514c69746520666f726d6174203300']
];
/** @param {number[]} cells @returns {number} */
function encode5(cells){
 assert.equal(cells.length,5);
 return cells.reduce((v,x)=>{assert(Number.isInteger(x)&&x>=0&&x<29);return v*29+x;},0);
}
/** @param {number} n @returns {number[]} */
function decode5(n){
 assert(Number.isInteger(n)&&n>=0&&n<LIMIT);
 const xs=[];
 for(let j=0;j<5;j++){xs.unshift(n%29);n=Math.floor(n/29);}
 return xs;
}
/** @param {number[]} values @returns {{bytes:Buffer,flags:number[],recovered:number[]}} */
function serialize(values){
 assert.equal(values.length%5,0);
 const data=[],flags=[],recovered=[];
 for(let i=0;i<values.length;i+=5){
  const n=encode5(values.slice(i,i+5));
  const q=Math.floor(n/CAP),r=n%CAP;
  assert(q===0||q===1);
  flags.push(q);data.push((r>>>16)&255,(r>>>8)&255,r&255);
  recovered.push(...decode5(q*CAP+r));
 }
 return {bytes:Buffer.from(data),flags,recovered};
}
/** @param {number} start @param {number} end @param {number} heading @returns {number[]} */
function chapter(start,end,heading){
 const first=d.pages.find(p=>p.page===start);
 const red=ink.pages.find(p=>p.page===start).red_spans.find(x=>x.start===0);
 assert.equal(red.length,heading);
 assert.deepEqual(first.indices.slice(0,heading).map(i=>d.runes[i]).join(''),red.runes);
 return d.pages.filter(p=>p.page>=start&&p.page<=end).flatMap(p=>p.indices).slice(heading);
}
/** @param {string} name @param {number[]} values @param {number} expected */
function report(name,values,expected){
 assert.equal(values.length,expected);
 assert.equal(values.length%5,0);
 const b=serialize(values);
 assert.deepEqual(b.recovered,values);
 const prefix=b.bytes.subarray(0,16).toString('hex');
 const trailer=b.bytes.subarray(-16).toString('hex');
 const ascii=[...b.bytes].filter(x=>x>=32&&x<=126).length;
 const headers=sig.filter(([n,hex])=>b.bytes.subarray(0,hex.length/2).toString('hex')===hex).map(x=>x[0]);
 const cmf=b.bytes[0],flg=b.bytes[1];
 const zlib=(cmf&15)===8&& (cmf>>4)<=7 && ((cmf*256+flg)%31===0);
 let utf8Valid=true;
 try{new TextDecoder('utf-8',{fatal:true}).decode(b.bytes);}catch(e){utf8Valid=false;}
 const out={
  name,original_runes:values.length,groups:b.flags.length,bytes:b.bytes.length,
  first16:prefix,last16:trailer,overflow_count:b.flags.reduce((a,x)=>a+x,0),
  flagsFirst40:b.flags.slice(0,40).join(''),flagsLast40:b.flags.slice(-40).join(''),
  printable_ascii:ascii,printable_rate:Number((ascii/b.bytes.length).toFixed(7)),
  utf8Valid,magic:headers,zlibHeader:zlib,
  sha256:crypto.createHash('sha256').update(b.bytes).digest('hex')
 };
 console.log('ORIGINAL '+JSON.stringify(out));
}
function positive(){
 // Exactly preserve three source-shaped bytes and a nonzero 25th overflow bit.
 const sample=[0x1f,0x8b,0x08,0x42,0x5a,0x68,0x50,0x4b,0x03,0x04];
 const bytes=Buffer.from(sample),triples=[...bytes.subarray(0,9)];
 const group=[];
 for(let i=0;i<triples.length;i+=3){
  const n=triples[i]*65536+triples[i+1]*256+triples[i+2];
  group.push(...decode5(n));
 }
 const pack=serialize(group);
 assert.deepEqual(pack.bytes,Buffer.from(triples));
 assert.deepEqual(pack.flags,[0,0,0]);
 assert.deepEqual(pack.recovered,group);
 const top=decode5(LIMIT-1),max=serialize(top);
 assert.deepEqual(max.flags,[1]);assert.deepEqual(max.recovered,top);
 console.log('POSITIVE PASS: fixed 5 GP29 digits preserve original three-byte payload; 25th flag reconstructs largest valid quintet');
}
positive();
const a=chapter(23,26,16),b=chapter(40,53,8);
report('p23-26 five-dot figure after red16',a,1005);
report('p40-53 five-dot floral after red8',b,3000);
