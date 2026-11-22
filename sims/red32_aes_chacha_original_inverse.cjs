"use strict";
/**
 * Original LP2 source-only 32-length key AES256-CTR/ChaCha20 inversion.
 * Source: 31 13-dot stencils delimit 32 red-rune runs, 225 red runes total.
 * The 13/31 tree ornament supplies a provisional source linkage, not a key proof.
 * Run from repository root under Node.js 22. No external packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const src = read("resources/liber-primus/lp2-corpus.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const grid = read("resources/liber-primus/base60-grid.json").byte_rows.flat();
const C = src.pages.filter(p => p.page < 56).flatMap(p => p.indices);
const pages = src.pages.filter(p => p.page < 56 && p.indices.length);
const N = C.length;
assert.equal(N, 12956);
const mod = (x, n) => (x % n + n) % n;
/** @typedef {{page:number, offset:number, kind:number}} Event */
/** @returns {number[]} */
function sourceRunLengths() {
  /** @type {Event[]} */
  const ev = [];
  for (const p of ink.pages) {
    const pg = src.pages[p.page];
    assert.equal(p.rune_count, pg.indices.length);
    for (const span of p.red_spans || []) {
      for (let i = 0; i < span.length; i++) {
        assert.equal(src.runes[pg.indices[span.start + i]], [...span.runes][i]);
        ev.push({page:p.page, offset:span.start + i, kind:1});
      }
    }
    for (const mark of p.large_punctuation || []) {
      if (mark[1] === 13) ev.push({page:p.page, offset:mark[0], kind:0});
    }
  }
  ev.sort((a,b) => a.page-b.page || a.offset-b.offset || a.kind-b.kind);
  assert.equal(ev.filter(e=>e.kind===1).length,225);
  assert.equal(ev.filter(e=>e.kind===0).length,31);
  const lengths=[],sum=0;
  let run=0;
  for (const e of ev) {
    if (e.kind===1) run++;
    else {lengths.push(run);run=0;}
  }
  lengths.push(run);
  assert.equal(lengths.length,32);
  assert.equal(lengths.reduce((a,b)=>a+b,0),225);
  assert.equal(Math.max(...lengths),59);
  assert.equal(Buffer.from(lengths).toString("hex"),
    "0d00100003000b00000e0c00090b00100013000a00080003003b090005000700");
  return lengths;
}
const lengths=sourceRunLengths(),sourceKey=Buffer.from(lengths);
const keys=[
  ["raw", sourceKey],
  ["reversed", Buffer.from(lengths.slice().reverse())],
  ["sha256", crypto.createHash("sha256").update(sourceKey).digest()],
  ["sha256-reversed", crypto.createHash("sha256").update(Buffer.from(lengths.slice().reverse())).digest()]
];
const ivs=[
  ["zero", Buffer.alloc(16)],
  ["all13", Buffer.alloc(16,13)],
  ["all31", Buffer.alloc(16,31)],
  ["13-31", Buffer.from(Array.from({length:16},(_,i)=>i%2?31:13))],
  ["grid-head", Buffer.from(grid.slice(0,16))],
  ["grid-tail", Buffer.from(grid.slice(-16))]
];
assert(keys.every(x=>x[1].length===32)&&ivs.every(x=>x[1].length===16));

/** @param {string} algorithm @param {Buffer} key @param {Buffer} iv @param {number} n @returns {Buffer} */
function stream(algorithm,key,iv,n) {
  const cipher=crypto.createCipheriv(algorithm,key,iv);
  return Buffer.concat([cipher.update(Buffer.alloc(n)),cipher.final()]);
}

/** @param {string} algorithm @param {Buffer} key @param {Buffer} iv @param {string} reset @returns {Buffer} */
function fullStream(algorithm,key,iv,reset) {
  if(reset==="book")return stream(algorithm,key,iv,N);
  const blocks=pages.map(p=>stream(algorithm,key,iv,p.indices.length));
  return Buffer.concat(blocks);
}
/** @param {number[]} input @param {Buffer} pad @param {{family:string,sign:number,projection:string}} mode @param {boolean} encode @returns {number[]} */
function transform(input,pad,mode,encode) {
  assert.equal(input.length,N);
  const out=new Array(N); let at=0;
  for(const page of pages) {
    let prev=-1;
    for(let j=0;j<page.indices.length;j++) {
      const i=at+j,byte=pad[i];
      const period=mode.family==="add"?29:28;
      const k=mode.projection==="mod"?byte%period:Math.floor(period*byte/256);
      const v=input[i];
      let value;
      if(mode.family==="add")value=mod(v+(encode?-1:1)*mode.sign*k,29);
      else if(prev<0)value=v;
      else if(encode)value=v===28?prev:mod(prev+1+mod(v+mode.sign*k,28),29);
      else value=v===prev?28:mod(mod(v-prev-1,29)-mode.sign*k,28);
      out[i]=value;
      if(mode.family==="exclude")prev=encode?value:v;
    }
    at+=page.indices.length;
  }
  assert.equal(at,N);
  return out;
}
/** @param {number[]} x @param {number} start @param {number} stop @returns {number} */
function ioc(x,start,stop) {
  const count=new Uint32Array(29);
  for(let i=start;i<stop;i++)count[x[i]]++;
  let s=0;
  for(const k of count)s+=k*(k-1);
  const n=stop-start;
  return 29*s/(n*(n-1));
}
function solvedPlant() {
  const t=src.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  const reference=fs.readFileSync(path.join(root,"resources/liber-primus/lp1-plaintext-reference.txt"),"utf8");
  const out=[];
  for(let word of reference.split(/\r?\n/).filter(s=>!s.startsWith("#")).join(" ").toUpperCase().match(/[A-Z]+/g)||[]) {
    word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");
    const symbols=[];
    for(let j=0;j<word.length;) {
      const hit=t.find(x=>word.startsWith(x.s,j));
      if(!hit){symbols.length=0;break;}
      symbols.push(hit.i);j+=hit.s.length;
    }
    out.push(...symbols);
  }
  assert(out.length>3000);
  return Array.from({length:N},(_,i)=>out[i%out.length]);
}
const plant=solvedPlant();assert(ioc(plant,0,6000)>1.2);
const variants=[];
for(const [keyName,key] of keys)for(const [ivName,iv] of ivs)
for(const algorithm of ["aes-256-ctr","chacha20"])for(const reset of ["book","page"]) {
  const pad=fullStream(algorithm,key,iv,reset);
  for(const family of ["add","exclude"])for(const projection of ["mod","scale"])for(const sign of [-1,1]) {
    const mode={family,projection,sign};
    const decoded=transform(C,pad,mode,false);
    const reen=transform(decoded,pad,mode,true);
    assert.deepEqual(reen,C);
    variants.push({key:keyName,iv:ivName,algorithm,reset,...mode,
      trainIoC:ioc(decoded,0,6000),heldoutIoC:ioc(decoded,6000,N),
      prefix:decoded.slice(0,40).map(x=>src.translit[x]).join("")});
  }
}
const plantedKey=keys[0][1],plantedIv=ivs[3][1],plantedPad=fullStream("aes-256-ctr",plantedKey,plantedIv,"book");
const plantMode={family:"exclude",projection:"mod",sign:1};
const plantedCipher=transform(plant,plantedPad,plantMode,true);
assert.deepEqual(transform(plantedCipher,plantedPad,plantMode,false),plant);
assert.deepEqual(transform(transform(plant,plantedPad,plantMode,true),plantedPad,plantMode,false),plant);
variants.sort((a,b)=>b.trainIoC-a.trainIoC);
console.log(JSON.stringify({
  verdict:"candidate source key only; do not call any unseen text decrypted without independent evidence",
  sourceRunLengths:lengths,originalRunes:N,
  testedConfigurations:variants.length,sourcePlantIoC:ioc(plant,0,N),
  authenticControlsRecovered:N,originalModelsRoundtripped:variants.length,
  trainTop10:variants.slice(0,10),
  heldoutTop10:variants.slice().sort((a,b)=>b.heldoutIoC-a.heldoutIoC).slice(0,10)
},null,2));
