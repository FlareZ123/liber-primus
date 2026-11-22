'use strict';
/**
 * Frozen six original-IRC-linked 2015-16 LP2 key/code claims.
 * Static HTTP acquisition and bytes/hash only. Never execute remote code.
 * Node22 CommonJS; this script performs no filesystem writes.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

/** Original source line, participant, exact posted URL, and safe byte-only retrieval endpoint. */
const objects = [
  {line:144465, date:'2015 Jul 31',name:'infotomb 4cwzx text',source:'https://infotomb.com/4cwzx.txt',
   fetch:'https://infotomb.com/4cwzx.txt'},
  {line:297511, date:'2016 Feb 15',name:'LP2 p3 red-triad proposal',source:'http://pastebin.com/XVwtsUZ1',
   fetch:'https://pastebin.com/raw/XVwtsUZ1'},
  {line:270848, date:'2016 Jan 17',name:'rune-prime XOR cipher candidate',source:'http://pastebin.com/fTs2TtVD',
   fetch:'https://pastebin.com/raw/fTs2TtVD'},
  {line:300334, date:'2016 Feb 19',name:'page-specific prime output',source:'http://pastebin.com/kawPjVSD',
   fetch:'https://pastebin.com/raw/kawPjVSD'},
  {line:274002, date:'2016 Jan 19',name:'ricercar reversed offsets',source:'https://github.com/rtkd/idkfa/blob/master/assets/data/key-ricercar-reverse.txt',
   fetch:'https://raw.githubusercontent.com/rtkd/idkfa/master/assets/data/key-ricercar-reverse.txt'},
  {line:313526,date:'2016 Mar 22',name:'page28 original Google Doc',source:'https://docs.google.com/document/d/1ctxsvOS6jluTs52w6yymjk_qNrThlmA8NRsRCgl5MXY/edit?pref=2&pli=1',
   fetch:'https://docs.google.com/document/d/1ctxsvOS6jluTs52w6yymjk_qNrThlmA8NRsRCgl5MXY/export?format=txt'}
];
/** @param {Buffer} buf @returns {string} */
function digest(buf) {return crypto.createHash('sha256').update(buf).digest('hex');}
/** @param {Buffer} buf @returns {string} */
function safePreview(buf) {
 return buf.toString('utf8').slice(0,2600)
  .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,'?');
}
function selftest() {
 assert.equal(objects.length,6);
 assert.equal(new Set(objects.map(x=>x.source)).size,6);
 assert.equal(digest(Buffer.from('abc')),
  'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
 console.log('SELFTEST PASS unique frozen source URLs, deterministic SHA-256');
}
/** @param {typeof objects[number]} item */
async function acquire(item) {
 try {
   const res=await fetch(item.fetch,{redirect:'follow',signal:AbortSignal.timeout(18000),
     headers:{'user-agent':'LiberPrimusHistoricalResearch/1.0 (static byte preservation; no execution)'}});
   const bytes=Buffer.from(await res.arrayBuffer());
   const type=res.headers.get('content-type')||'unspecified';
   const isDocument=(res.ok&&bytes.length>0&&bytes.length<=400000&&
     /(?:text|json|octet|plain|xml|pdf)/i.test(type));
   return {name:item.name,date:item.date,line:item.line,source:item.source,
     requested:item.fetch,finalUrl:res.url,status:res.status,contentType:type,length:bytes.length,
     sha256:digest(bytes),looksLikeSourceDocument:isDocument,
     preview:safePreview(bytes)};
 } catch(e) {
   return {name:item.name,line:item.line,source:item.source,
      requested:item.fetch,error:String(e)};
 }
}
async function main() {
 selftest();
 // Parallel acquisition: same six frozen source-linked objects, no follow-on key search.
 const results=await Promise.all(objects.map(acquire));
 for(const r of results)console.log('FROZEN_SOURCE '+JSON.stringify(r));
 const missing=results.map((r,i)=>({r,item:objects[i]}))
  .filter(x=>x.r.error||!x.r.looksLikeSourceDocument);
 const archived=await Promise.all(missing.map(async ({item})=>{
   const stamp=item.date.replace(/^(\d{4}) (\w{3}) (\d{2})$/,(_a,y,m,d)=>
     y+String(['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(m)+1).padStart(2,'0')+d);
   const url='https://archive.org/wayback/available?url='+encodeURIComponent(item.source)+'&timestamp='+stamp;
   try {
     const res=await fetch(url,{signal:AbortSignal.timeout(12000)});
     const body=await res.text();
     return {name:item.name,original:item.source,status:res.status,available:body.slice(0,800)};
   } catch(e){return {name:item.name,original:item.source,error:String(e)};}
 }));
 for(const r of archived)console.log('SAME_OBJECT_ARCHIVE '+JSON.stringify(r));
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});