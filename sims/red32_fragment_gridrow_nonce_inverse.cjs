"use strict";
/**
 * Original LP2 fragment-reset 32x8 grid IV source + red-run 32-byte key.
 * Tests one cipher architecture: 31 original 13-dot glyphs segment 32 fragments,
 * and each fragment's 8 printed-grid bytes supply a deterministic unique IV.
 * Reproduce with Node.js 22 from repository root. No third-party dependencies.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");

const root=path.resolve(__dirname,"..");
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),"utf8"));
const corpus=read("resources/liber-primus/lp2-corpus.json");
const ink=read("resources/liber-primus/lp2-ink-annotations.json");
const grid=read("resources/liber-primus/base60-grid.json");
const pages=corpus.pages.filter(p=>p.page<56);
const C=pages.flatMap(p=>p.indices);
assert.equal(C.length,12956);
assert.equal(grid.byte_rows.length,32);
assert(grid.byte_rows.every(x=>x.length===8));
const mod=(a,n)=>(a%n+n)%n;

/** @typedef {{page:number,offset:number,kind:number}} Event */
/** @returns {{lengths:number[],bounds:number[],positions:number[]}} */
function originalFragments() {
  /** @type {Event[]} */
  const events=[];
  for(const page of ink.pages) {
    const p=corpus.pages[page.page];
    assert.equal(page.rune_count,p.indices.length);
    for(const span of page.red_spans||[]) {
      for(let i=0;i<span.length;i++) {
        assert.equal(corpus.runes[p.indices[span.start+i]],[...span.runes][i]);
        events.push({page:page.page,offset:span.start+i,kind:1});
      }
    }
    for(const mark of page.large_punctuation||[])if(mark[1]===13)events.push({page:page.page,offset:mark[0],kind:0});
  }
  events.sort((a,b)=>a.page-b.page||a.offset-b.offset||a.kind-b.kind);
  assert.equal(events.length,256);
  let last=0;
  const lengths=[],bounds=[0],positions=[];
  let current=0,red=0,ei=0;
  for(const pg of corpus.pages)for(let i=0;i<=pg.indices.length;i++) {
    while(ei<events.length&&events[ei].page===pg.page&&events[ei].offset===i) {
      if(events[ei].kind===0){lengths.push(red);red=0;bounds.push(current);positions.push(current);}
      else red++;
      ei++;
    }
    if(i<pg.indices.length)current++;
  }
  lengths.push(red);
  assert.equal(current,13136);
  assert.equal(ei,256);
  assert.equal(lengths.length,32);
  assert.equal(bounds.length,32);
  assert.equal(bounds[28],C.length);
  assert.equal(lengths.reduce((a,b)=>a+b,0),225);
  assert.equal(Buffer.from(lengths).toString("hex"),"0d00100003000b00000e0c00090b00100013000a00080003003b090005000700");
  const stops=bounds.slice(1,29);
  assert.equal(stops[stops.length-1],12956);
  assert.equal(stops.reduce((sum,b,i)=>sum+b-(i?stops[i-1]:0),0),12956);
  return {lengths,bounds,positions};
}
const {lengths,bounds}=originalFragments();
const K=Buffer.from(lengths);
const keyOrders=[
  ["raw",K],
  ["reverse",Buffer.from(lengths.slice().reverse())],
  ["sha256",crypto.createHash("sha256").update(K).digest()],
  ["sha256-reverse",crypto.createHash("sha256").update(Buffer.from(lengths.slice().reverse())).digest()]
];
const nonceModes=["row-zero","zero-row","row-row","sha256-row"];
const boundaries=bounds.slice(0,29);
assert.equal(boundaries.length,29);

/** @param {number[]} row @param {string} mode @returns {Buffer} */
function nonce(row,mode) {
  const b=Buffer.from(row);
  if(mode==="row-zero")return Buffer.concat([b,Buffer.alloc(8)]);
  if(mode==="zero-row")return Buffer.concat([Buffer.alloc(8),b]);
  if(mode==="row-row")return Buffer.concat([b,b]);
  return crypto.createHash("sha256").update(b).digest().subarray(0,16);
}
/** @param {Buffer} key @param {string} mode @param {string} algorithm @returns {Buffer} */
function stream(key,mode,algorithm) {
  const output=Buffer.alloc(C.length);
  for(let f=0;f<28;f++) {
    const start=boundaries[f],end=boundaries[f+1],len=end-start;
    if(len===0)continue;
    const iv=nonce(grid.byte_rows[f],mode);
    const cipher=crypto.createCipheriv(algorithm,key,iv);
    const pad=Buffer.concat([cipher.update(Buffer.alloc(len)),cipher.final()]);
    pad.copy(output,start);
  }
  return output;
}
/** @typedef {{family:string, sign:number, projection:string}} Mode */
/**
 * @param {number[]} input
 * @param {Buffer} pad
 * @param {Mode} mode
 * @param {boolean} encode
 * @returns {number[]}
 */
function transform(input,pad,mode,encode) {
  const result=new Array(input.length);
  for(let f=0;f<28;f++){
    let prev=-1;
    for(let i=boundaries[f];i<boundaries[f+1];i++){
      const period=mode.family==="add"?29:28;
      const key=mode.projection==="mod"?pad[i]%period:Math.floor(period*pad[i]/256);
      let value=input[i],next;
      if(mode.family==="add")next=mod(value+(encode?-1:1)*mode.sign*key,29);
      else if(prev<0)next=value;
      else if(encode)next=value===28?prev:mod(prev+1+mod(value+mode.sign*key,28),29);
      else next=value===prev?28:mod(mod(value-prev-1,29)-mode.sign*key,28);
      result[i]=next;
      if(mode.family==="exclude")prev=encode?next:value;
    }
  }
  return result;
}
/** @param {number[]} runes @param {number} a @param {number} b @returns {number} */
function normIoC(runes,a,b){
  const ct=new Uint32Array(29);for(let i=a;i<b;i++)ct[runes[i]]++;
  const n=b-a;let numerator=0;for(const m of ct)numerator+=m*(m-1);
  return 29*numerator/(n*(n-1));
}
const trainStop=boundaries[18];assert.equal(trainStop,6546);
const controls=corpus.pages.find(p=>p.page===57).indices;assert(controls.length===95);
const plant=Array.from({length:C.length},(_,i)=>i%157===27?28:controls[i%controls.length]);
const variants=[];
for(const [keyName,key] of keyOrders)
for(const ivMode of nonceModes)
for(const algorithm of ["aes-256-ctr","chacha20"]){
  const pad=stream(key,ivMode,algorithm);
  for(const family of ["add","exclude"])for(const sign of [-1,1])for(const projection of ["mod","scale"]){
    const mode={family,sign,projection},decoded=transform(C,pad,mode,false);
    assert.deepEqual(transform(decoded,pad,mode,true),C);
    variants.push({key:keyName,iv:ivMode,algorithm,...mode,trainIoC:normIoC(decoded,0,trainStop),heldoutIoC:normIoC(decoded,trainStop,C.length),prefix:decoded.slice(0,45).map(x=>corpus.translit[x]).join("")});
  }
}
const testPad=stream(keyOrders[0][1],"row-zero","aes-256-ctr");
const planted=transform(plant,testPad,{family:"add",sign:-1,projection:"scale"},true);
assert.deepEqual(transform(planted,testPad,{family:"add",sign:-1,projection:"scale"},false),plant);
const secondPad=stream(keyOrders[3][1],"sha256-row","chacha20");
const planted2=transform(plant,secondPad,{family:"exclude",sign:1,projection:"mod"},true);
assert.deepEqual(transform(planted2,secondPad,{family:"exclude",sign:1,projection:"mod"},false),plant);
variants.sort((a,b)=>b.trainIoC-a.trainIoC);
const output={
  classification:"Unresolved original-input source-key hypothesis, not decrypted LP2",
  originalRuneCount:C.length, sourceFragments:32, unsolvedFragments:28, gridRows:32,
  genuineControlsRecovered:2*C.length, sourcePlantIoC:normIoC(plant,0,C.length),
  modelCount:variants.length, trainStop, heldoutRunes:C.length-trainStop,
  sourceBoundaryPositions:boundaries,
  trainTop10:variants.slice(0,10),
  heldoutTop10:variants.slice().sort((a,b)=>b.heldoutIoC-a.heldoutIoC).slice(0,10)
};
console.log(JSON.stringify(output,null,2));
