"use strict";
/**
 * Fixed cross-source LP2 candidate: the 32 13-dot-delimited red-run lengths
 * are an AES-256-CTR key; the first 16 bytes of the printed 32x8 grid are its
 * public IV. One book-wide stream is reduced modulo GP29 or GP28.
 *
 * Evidence class: a predeclared source-specific inverse, not a solved cipher.
 * Node.js 22 CommonJS SFT: node sims/red32_grid_iv_joint_inverse.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {events,keyTables,transform,ioc} =
  require("./red_256_event_key_inverse.cjs");

const root = path.resolve(__dirname,"..");
const load = name => JSON.parse(fs.readFileSync(path.join(root,name),"utf8"));
const corpus = load("resources/liber-primus/lp2-corpus.json");
const grid = load("resources/liber-primus/base60-grid.json").byte_rows;
const c = corpus.pages.filter(p=>p.page<=55 && p.indices.length)
  .flatMap(p=>p.indices);
assert.equal(c.length,12956);
const sourceEvents = events();
assert.equal(sourceEvents.length,256);
const runLengths = keyTables(sourceEvents).get("redRun32/forward");
assert.equal(runLengths.length,32);
assert.equal(runLengths.reduce((a,b)=>a+b,0),225);
const key = Buffer.from(runLengths);
const gridBytes = Buffer.from(grid.flat());
assert.equal(gridBytes.length,256);
const iv = gridBytes.subarray(0,16);

/** @param {number} length @returns {Buffer} */
function keystream(length) {
  const ctx = crypto.createCipheriv("aes-256-ctr",key,iv);
  const data = Buffer.concat([ctx.update(Buffer.alloc(length)),ctx.final()]);
  assert.equal(data.length,length);
  return data;
}

/** GP-rune source-native English positive control from already-solved LP1. */
function nativeControl(length) {
  const raw = fs.readFileSync(path.join(root,
    "resources/liber-primus/lp1-plaintext-reference.txt"),"utf8");
  const labels = corpus.translit.map((t,i)=>({t,i}))
    .sort((a,b)=>b.t.length-a.t.length);
  const result=[];
  for(let line of raw.split(/\r?\n/).filter(t=>!t.startsWith("#"))) {
    for(let word of (line.toUpperCase().match(/[A-Z]+/g)||[])) {
      word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C")
        .replace(/Z/g,"S").replace(/ING/g,"NG");
      const indices=[];
      for(let i=0;i<word.length;) {
        const token=labels.find(t=>word.startsWith(t.t,i));
        if(!token){indices.length=0;break;}
        indices.push(token.i);
        i+=token.t.length;
      }
      result.push(...indices);
    }
  }
  assert.ok(result.length>=3000);
  return Array.from({length},(_,i)=>result[i%result.length]);
}

function run() {
  const native=nativeControl(c.length);
  const data=keystream(c.length);
  const variants=[];
  for(const family of ["add","ea"]) {
    const mode={family,sign:1,reset:"book"};
    const sourcePad=Uint8Array.from(data,x=>x%(family==="add"?29:28));
    const recovered=transform(c,sourcePad,mode,false);
    assert.deepEqual(transform(recovered,sourcePad,mode,true),c);
    const positive=transform(native,sourcePad,mode,true);
    assert.deepEqual(transform(positive,sourcePad,mode,false),native);
    variants.push({family,originalIoC:ioc(recovered),
      originalE:recovered.filter(x=>x===18).length,
      first40Runes:recovered.slice(0,40).map(i=>corpus.translit[i]).join(""),
      exactReplay:c.length,plantRecovered:native.length});
  }
  return {
    classification:"fixed 32-red-run key plus first-16-grid-byte IV hypothesis",
    keyHex:key.toString("hex"),ivHex:iv.toString("hex"),
    clock:"continuous",stream:"AES-256-CTR, byte modulo29/modulo28",
    originalRunes:c.length,sourceIoC:ioc(native),
    ciphertextIoC:ioc(c),variants,
    caveat:"A wrong source-derived invertible key reencrypts too. " +
      "Original language statistics, not roundtrip alone, discriminate."
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run};
