#!/usr/bin/env node
"use strict";

/**
 * Original 2014 onion-2 256-byte tape -> LP2 256-cell grid and GP29 direct-key
 * gate. Read-only single-file test. Run: node sims/lp2_onion2_2014_grid_direct_gate_sft.cjs
 * Uses original printed order, no optimized offsets, and only authentic
 * solved-Cicada GP29 additive operation. A numerical match is not plaintext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");

const root = path.resolve(__dirname, "..");
/** @param {string} p */
const json = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const book = json("resources/liber-primus/lp2-corpus.json");
const grid = json("resources/liber-primus/lp2-grid-256.json");
const onion = json("resources/cicada2014-onion2-timing.json");
const source = [...Buffer.from(onion.final_hex, "hex")];
const target = grid.bytes;
assert.equal(source.length, 256);
assert.equal(target.length, 256);
assert.equal(grid.byte_count, 256);
assert.equal(onion.final_hex.length, 512);
assert.equal(createHash("sha256").update(Buffer.from(source)).digest("hex"),
  onion.final_bytes_sha256);

/** @param {readonly number[]} a @param {readonly number[]} b */
function equalPairs(a, b) {
  const result = {aOnly:0, bOnly:0, both:0};
  for (let i=0; i<a.length; i++) for (let j=i+1; j<a.length; j++) {
    const x=a[i]===a[j], y=b[i]===b[j];
    if (x&&y) result.both++;
    else if (x) result.aOnly++;
    else if (y) result.bOnly++;
  }
  return result;
}

/** @param {readonly number[]} a @param {readonly number[]} b */
function isBijection(a, b) {
  const f=new Map(), inv=new Map();
  for (let i=0; i<a.length; i++) {
    if (f.has(a[i]) && f.get(a[i])!==b[i]) return false;
    if (inv.has(b[i]) && inv.get(b[i])!==a[i]) return false;
    f.set(a[i], b[i]); inv.set(b[i], a[i]);
  }
  return true;
}

/**
 * Exact matching bound for the real source, since all 256 observed
 * (source-byte, grid-byte) ordered pairs are distinct: every edge has weight 1.
 * @param {readonly number[]} a @param {readonly number[]} b
 */
function maxUnchanged(a, b) {
  assert.equal(new Set(a.map((x,i)=>String(x)+":"+String(b[i]))).size,256);
  const adj=Array.from({length:256},()=>[]);
  for(let i=0;i<256;i++) adj[a[i]].push(b[i]);
  const owner=new Int16Array(256).fill(-1);
  /** @param {number} v @param {Uint8Array} seen */
  function augment(v,seen) {
    for(const u of adj[v]) {
      if(seen[u]) continue;
      seen[u]=1;
      if(owner[u]===-1||augment(owner[u],seen)) {owner[u]=v;return true;}
    }
    return false;
  }
  let n=0;
  for(let v=0;v<256;v++) if(augment(v,new Uint8Array(256))) n++;
  return n;
}

/** @param {readonly number[]} a */
function ioc(a) {
  const c=new Array(29).fill(0);
  for(const x of a) c[x]++;
  return c.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1));
}

/** @param {"continuous"|"page"} clock @param {-1|1} sign @param {boolean} fSkip */
function decode(clock,sign,fSkip) {
  const out=[];
  let k=0;
  for(const page of book.pages.filter(x=>x.page<=55)) {
    if(clock==="page") k=0;
    for(const c of page.indices) {
      const pass=fSkip && c===0;
      out.push(pass?c:(c+29+sign*(source[k%256]%29))%29);
      if(!pass) k++;
    }
  }
  assert.equal(out.length,12956);
  return ioc(out);
}

const pairs=equalPairs(source,target);
assert.deepEqual(pairs,{aOnly:139,bOnly:127,both:0});
assert.equal(isBijection(source,target),false);
const minChanges=256-maxUnchanged(source,target);
assert.equal(minChanges,119);
const plant=source.map(x=>(x+37)%256);
assert(isBijection(source,plant));
assert.deepEqual(equalPairs(source,plant),{aOnly:0,bOnly:0,both:139});
const corrupted=plant.slice();
const repeat=source.findIndex((x,i)=>source.indexOf(x)!==i);
assert(repeat>0);
corrupted[repeat]=(corrupted[repeat]+1)%256;
assert.equal(isBijection(source,corrupted),false);
const xor=source.map((x,i)=>x^target[i]);
assert.equal(xor.filter(x=>x>=32&&x<=126).length,97);
console.log("ONION2",onion.final_bytes_sha256,"SOURCE",source.length);
console.log("GRID",grid.byte_count,"EQUALITIES",pairs,"MIN_BYTE_EDITS",minChanges);
console.log("XOR",Buffer.from(xor.slice(0,32)).toString("hex"),"PRINTABLE_256",97);
const native=book.pages.filter(x=>x.page<=55).flatMap(x=>x.indices);
console.log("BASE_IOC",ioc(native));
for(const clock of ["continuous","page"]) for(const sign of [-1,1])
  for(const fSkip of [false,true])
    console.log("GP29_IOC",clock,sign,fSkip,decode(clock,sign,fSkip));
console.log("No original plaintext or authenticated LP2 key recovered.");
