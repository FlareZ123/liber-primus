"use strict";
/**
 * 2014 ORIGINAL INTERCONNECTEDNESS BYTE-KEY, no fitted offset/seed.
 *
 * Historical motivation:
 * 2013 Cicada's documented 761.MP3 raw-byte XOR against the Twitter source;
 * 2014 OpenPuff extraction with password 33011033 genuinely recovers the
 * contemporary 745-byte magic-square payload from original Interconnectedness.
 *
 * Original 2014 compressed-MP3 bytes are independently source-pinned to
 * git blob 09fe068192b76a3697c47ec1d604b527703db798 (6,651,873 bytes).
 * 2014 author never selected this LP2 decoder; negative = scoped only.
 *
 * Usage (manual workflow only): node sims/lp2_2014_interconnectedness_bytekey_sft.cjs --network
 * Pure synthetic tests: node sims/lp2_2014_interconnectedness_bytekey_sft.cjs --selftest
 *
 * No downloaded program or MP3 is ever executed.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");

const originalUrl="https://raw.githubusercontent.com/krisyotam/cicada3301/main/media/audio/index.mp3";
const expected={bytes:6651873,gitSha1:"09fe068192b76a3697c47ec1d604b527703db798"};
const corpus=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8"));
const pages=corpus.pages.slice(0,56);
const all=pages.flatMap(p=>p.indices);
assert.equal(pages.length,56);
assert.equal(all.length,12956);
/** @param {number[]} nums */
function ioc(nums){
 const count=Array(29).fill(0);
 for(const x of nums)count[x]++;
 return count.reduce((s,c)=>s+c*(c-1),0)/(nums.length*(nums.length-1));
}
/** @param {number[]} nums */
function preview(nums,len=88){return nums.slice(0,len).map(x=>corpus.translit[x]).join("-");}
/** @param {number[]} cipher @param {Uint8Array} mp3 @param {number} base @param {number} sign @param {"restarting"|"continuous"} clock @param { "mod29"|"scaled" } projection */
function gpTransform(cipher,mp3,base,sign,clock,projection){
 let result=[],cursor=0,absolute=0;
 const toK=b=>projection==="mod29"?b%29:Math.floor(29*b/256);
 for(const p of pages){
  if(clock==="restarting")cursor=0;
  for(let j=0;j<p.indices.length;j++){
   const k=toK(mp3[base+cursor]);
   result.push(((cipher[absolute++]+sign*k)%29+29)%29);
   cursor++;
  }
 }
 assert.equal(cursor>0,true);
 assert.equal(absolute,cipher.length);
 assert.equal(result.length,cipher.length);
 return result;
}
/** @param {number[]} seq @returns {Uint8Array} reversible integer base29->fixed big-endian bytes */
function toFixedBytes(seq){
 let val=0n;for(const x of seq){val=29n*val+BigInt(x);}
 const width=Math.ceil(seq.length*Math.log2(29)/8);
 const out=Buffer.alloc(width);
 for(let i=width-1;i>=0;i--){out[i]=Number(val&255n);val>>=8n;}
 assert.equal(val,0n);
 return out;
}
/** @param {Uint8Array} mp3 @returns {number} original ID3v2 tag boundary */
function id3End(mp3){
 if(Buffer.from(mp3.subarray(0,3)).toString("ascii")!=="ID3")return 0;
 const b=mp3.subarray(6,10);
 assert.ok([...b].every(x=>x<128));
 return 10+((b[0]<<21)|(b[1]<<14)|(b[2]<<7)|b[3])+((mp3[5]&16)?10:0);
}
/** @param {Uint8Array} data */
function summarizeBytes(data){
 const ascii=[...data].filter(x=>x===9||x===10||x===13||(x>=32&&x<=126)).length;
 const printable=[...data].filter(x=>x>=32&&x<=126).length;
 const high=[...data].filter(x=>x>=128).length;
 const n=data.length, start=Buffer.from(data.subarray(0,64));
 return {bytes:n,printableAscii:printable,printableFraction:printable/n,
  whiteSpaceOrPrintable:ascii,bytesHigh:high,
  hexStart:start.subarray(0,24).toString("hex"),
  textStart:start.toString("latin1").replace(/[^ -~]/g,".")};
}
/** @param {Uint8Array} pad @param {number} start */
function xorPageIntegers(pad,start,scope){
 let chunks=[],k=0, decoded=[];
 for(const p of pages){
  if(scope==="restarting")k=0;
  const source=toFixedBytes(p.indices);
  const clear=Buffer.alloc(source.length);
  for(let i=0;i<source.length;i++)clear[i]=source[i]^pad[start+k+i];
  k+=source.length;
  if(source.length)chunks.push(clear);
  decoded.push({page:p.page,...summarizeBytes(clear)});
 }
 return {pageSummaries:decoded,bookSummary:summarizeBytes(Buffer.concat(chunks))};
}
async function getMp3(){
 const r=await fetch(originalUrl,{signal:AbortSignal.timeout(80000)});
 assert.equal(r.status,200);
 const bytes=Buffer.from(await r.arrayBuffer());
 assert.equal(bytes.length,expected.bytes);
 const sha1=crypto.createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex");
 assert.equal(sha1,expected.gitSha1);
 return bytes;
}
function selftest(){
 assert.equal(toFixedBytes([0,1]).toString("hex"),"0001");
 assert.equal(toFixedBytes([28,28]).toString("hex"),"0348");
 const toy=Buffer.from([0,29,255,250,0,127,1,77,17,90,31]);
 assert.equal(id3End(toy),0);
 for(const projection of ["mod29","scaled"])
 for(const clock of ["restarting","continuous"]){
  const padded=Buffer.alloc(20000);for(let i=0;i<padded.length;i++)padded[i]=(17*i+3)%256;
  const input=all;
  const once=gpTransform(input,padded,0,-1,clock,projection);
  const twice=gpTransform(once,padded,0,1,clock,projection);
  assert.deepEqual(twice,input);
 }
 assert.equal(summarizeBytes(Buffer.from("ABCDEFG")).printableFraction,1);
 console.log("PASS 56 original page lengths, 12956 runes, byte-to-GP mapping, all signs and clocks, base29 integer serialization and XOR");
}
if(process.argv.includes("--selftest"))selftest();
else{
 assert.ok(process.argv.includes("--network"));
 (async()=>{
  const mp3=await getMp3();
  const id3=id3End(mp3);
  assert.ok(id3>=0 && id3<mp3.length/2);
  console.log(JSON.stringify({type:"source",url:originalUrl,originalSha1:expected.gitSha1,
   originalBytes:mp3.length,mp3OpeningHex:mp3.subarray(0,32).toString("hex"),
   id3v2End:id3,originalRunes:all.length,sourcePageLengths:pages.map(p=>p.indices.length)}));
  for(const start of [...new Set([0,id3])]){
   for(const projection of ["mod29","scaled"])
   for(const clock of ["restarting","continuous"])
   for(const sign of [-1,1]){
    const output=gpTransform(all,mp3,start,sign,clock,projection);
    const check=gpTransform(output,mp3,start,-sign,clock,projection);
    assert.deepEqual(check,all);
    const r={type:"GP29-source-bytepad",start,projection,clock,sign,
      originalIoC:ioc(all),candidateIoC:ioc(output),first88GP:preview(output)};
    console.log(JSON.stringify(r));
   }
   for(const scope of ["restarting","continuous"]){
    const res=xorPageIntegers(mp3,start,scope);
    console.log(JSON.stringify({type:"source-BASE29-page-integers-XOR-mp3",start,scope,
     book:res.bookSummary,
     firstNonemptyPages:res.pageSummaries.filter(x=>x.bytes).slice(0,3),
     lastPage:res.pageSummaries.at(-1)}));
   }
  }
 })().catch(e=>{console.error(e);process.exitCode=1;});
}
