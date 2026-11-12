"use strict";
/**
 * Independent creator-visible route: the 16 numbers in the printed p15 prime
 * spiral are absolute indexes into the full source rune stream. Extract 16
 * symbols, interpret them as eight frozen AES-128 keys, and directly invert
 * both the complete 256-byte grid and a GP29 stream on original LP2 pages.
 * No key, offset or plaintext is optimized; two index origins and two source
 * reading orders are granted. This is a bounded hypothesized book code.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(
  path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const table=JSON.parse(fs.readFileSync(
  path.join(root,"resources/liber-primus/base60-grid.json"),"utf8"));
assert.equal(corpus.pages.slice(0,56).reduce((n,p)=>n+p.indices.length,0),12956);
assert.equal(table.byte_rows.length,32);
assert.ok(table.byte_rows.every(row=>row.length===8));
const all=corpus.pages.slice(0,56).flatMap(p=>p.indices);
const spiral=[3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516];
const printed=[3258,3222,3152,3038,3278,3299,3298,2838,
  3288,3294,3296,2472,4516,1206,708,1820];
const numbers=[3258,3222,3152,3038,3278,3299,3298,2838,
  3288,3294,3296,2472,4516,1206,708,1820];
assert.deepEqual([...spiral].sort((a,b)=>a-b),[...printed].sort((a,b)=>a-b));
assert.deepEqual(printed,numbers);
assert.ok(Math.max(...numbers)<all.length);
const phases=[];
for(const [order,vals] of [["spiral center out",spiral],["printed rows",printed]])
  for(const origin of [0,1]){
    const read=vals.map(v=>all[v-origin]);
    for(const [representation,values] of [
      ["GP index",read],["GP prime",read.map(i=>corpus.prime[i])]
    ])phases.push({order,origin,representation,indices:read,key:Buffer.from(values)});
  }
assert.equal(phases.length,8);
assert.ok(phases.every(s=>s.key.length===16));
const zero=Buffer.alloc(16);
const row=table.byte_rows.flat();
const col=Array.from({length:8},(_,j)=>table.byte_rows.map(x=>x[j])).flat();
const snaking=table.byte_rows.flatMap((v,j)=>j%2?[...v].reverse():v);
const presentations=[
  ["printed rows",row],["columns",col],
  ["reversed printed rows",[...row].reverse()],["snake rows",snaking]
];
assert.equal(row.length,256);
/** @param {number[]} bytes @param {Buffer} key @param {string} mode */
function decrypt(bytes,key,mode){
  const cipher=crypto.createDecipheriv("aes-128-"+mode,key,mode==="ecb"?null:zero);
  if(["cbc","ecb"].includes(mode))cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(Buffer.from(bytes)),cipher.final()]);
}
/** @param {Buffer | number[]} source */
function printable(source){return [...source].filter(c=>c>=32&&c<=126||[9,10,13].includes(c)).length;}
/** @param {Buffer | number[]} source */
function gpbyte(source){return [...source].filter(c=>c<29).length;}
/** @param {Buffer | number[]} source */
function longestPrintable(source){
  let best=0,n=0;
  for(const v of source){n=v>=32&&v<=126?n+1:0;if(n>best)best=n;}
  return best;
}
const cases=[];
for(const state of phases)for(const [order,bytes] of presentations)
  for(const mode of ["ecb","cbc","ctr","cfb","ofb"]){
    const plain=decrypt(bytes,state.key,mode);
    cases.push({
      order:state.order,origin:state.origin,representation:state.representation,
      tableOrder:order,mode,printable:printable(plain),gpbyte:gpbyte(plain),
      longestPrintable:longestPrintable(plain),
      prefixHex:plain.subarray(0,20).toString("hex")
    });
  }
assert.equal(cases.length,8*4*5);
// A complete byte-roundtrip under the same selected key, IV and cipher mode.
const plantedText=Buffer.from("Liber Primus is the way. Its words are the map.", "utf8");
const enc=crypto.createCipheriv("aes-128-ctr",phases[0].key,zero);
const seeded=Buffer.concat([enc.update(plantedText),enc.final()]);
assert.deepEqual(decrypt(seeded,phases[0].key,"ctr"),plantedText);
/** @param {number[]} data */
function ioc(data){
 const c=new Array(29).fill(0);
 for(const v of data)c[v]++;
 return c.reduce((s,n)=>s+n*(n-1),0)/(data.length*(data.length-1));
}
const region=corpus.pages.slice(16,23).flatMap(p=>p.indices);
const streams=[];
for(const state of phases){
  const zeros=Buffer.alloc(all.length);
  const keyStream=decrypt(zeros,state.key,"ctr");
  for(const sign of [-1,1]){
    const decode=(input,offset)=>input.map((c,i)=>(c+29+sign*(keyStream[i+offset]%29))%29);
    const allOut=decode(all,0);
    const regionStart=corpus.pages.slice(0,16).reduce((s,p)=>s+p.indices.length,0);
    const afterSquare=decode(region,regionStart);
    streams.push({order:state.order,origin:state.origin,
      representation:state.representation,sign,
      allIoC:ioc(allOut),pages16to22IoC:ioc(afterSquare),
      plaintextPrefix:allOut.slice(0,32).map(x=>corpus.translit[x]).join(""),
      regionPrefix:afterSquare.slice(0,32).map(x=>corpus.translit[x]).join("")});
  }
}
const witness=corpus.pages[57].indices;
const mask=decrypt(Buffer.alloc(witness.length),phases[0].key,"ctr");
const ciphertext=witness.map((x,i)=>(x+mask[i]%29)%29);
assert.deepEqual(ciphertext.map((c,i)=>(c+29-mask[i]%29)%29),witness);
// Additional low-step, source-count-motivated 16-byte book-code consumers:
// 256 grid cells = 16 × 16 and square supplies exactly sixteen indexed runes.
// No AES or external IV is needed to try repeating the indexed 16-byte key.
const direct=[];
for(const state of phases)for(const [tableOrder,bytes] of presentations)
  for(const operation of ["xor","subtract","add"]){
    const plain=bytes.map((v,i)=>{
      const k=state.key[i%16];
      return operation==="xor"?(v^k):
        operation==="subtract"?(v-k+256)%256:(v+k)%256;
    });
    direct.push({order:state.order,origin:state.origin,
      representation:state.representation,tableOrder,operation,
      printable:printable(plain),gpbyte:gpbyte(plain),
      longestPrintable:longestPrintable(plain)});
  }
assert.equal(direct.length,8*4*3);
// Direct additive GP29 inverse also consumes just the 16 rune identities,
// without the unsupported additional stream-cipher assumption.
const simpleRuna=[];
for(const state of phases)for(const sign of [-1,1]){
  const key=state.indices;
  const decoded=all.map((v,i)=>(v+29+sign*key[i%16])%29);
  const regionStart=corpus.pages.slice(0,16).reduce((n,p)=>n+p.indices.length,0);
  const afterSquare=region.map((v,i)=>
    (v+29+sign*key[(i+regionStart)%16])%29);
  const encryptCheck=decoded.map((p,i)=>(p+29-sign*key[i%16])%29);
  assert.deepEqual(encryptCheck,all);
  simpleRuna.push({order:state.order,origin:state.origin,
    representation:state.representation,sign,
    allIoC:ioc(decoded),pages16to22IoC:ioc(afterSquare)});
}
assert.equal(simpleRuna.length,16);
console.log(JSON.stringify({
  original:"p15 center-highlighted 4x4 printed square absolute manuscript rune positions",
  gridBytes:row.length,wholeRunes:all.length,p15Numbers:printed,
  firstSpiralSelected:phases[0].indices,
  interpretations:phases.map(p=>({order:p.order,origin:p.origin,
    representation:p.representation,keyHex:p.key.toString("hex")})),
  fixedAESVariants:cases.length,completePrintable:cases.filter(x=>x.printable===256).length,
  completeGPBytes:cases.filter(x=>x.gpbyte===256).length,
  highestPrintable:[...cases].sort((a,b)=>b.printable-a.printable)[0],
  highestGPBytes:[...cases].sort((a,b)=>b.gpbyte-a.gpbyte)[0],
  highestRun:[...cases].sort((a,b)=>b.longestPrintable-a.longestPrintable)[0],
  runicCTRAlternatives:streams.length,
  strongestGP29IoC:[...streams].sort((a,b)=>b.allIoC-a.allIoC)[0],
  strongestSectionIoC:[...streams].sort((a,b)=>b.pages16to22IoC-a.pages16to22IoC)[0],
  directRepeatVariants:direct.length,completeRepeatPrintable:direct.filter(x=>x.printable===256).length,
  completeRepeatGPBytes:direct.filter(x=>x.gpbyte===256).length,
  bestRepeatPrintable:[...direct].sort((a,b)=>b.printable-a.printable)[0],
  bestRepeatGPBytes:[...direct].sort((a,b)=>b.gpbyte-a.gpbyte)[0],
  repeatGP29Alternatives:simpleRuna.length,
  bestRepeatGP29IoC:[...simpleRuna].sort((a,b)=>b.allIoC-a.allIoC)[0],
  bestRepeatSectionIoC:[...simpleRuna].sort((a,b)=>b.pages16to22IoC-a.pages16to22IoC)[0],
  bytePositiveRecovered:true,runePositiveRecovered:true,
  authenticatedOriginalPlaintext:false
},null,2));
