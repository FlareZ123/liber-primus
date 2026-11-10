"use strict";
/**
 * Source-fixed 32 red-run lengths as AES-256-CTR GP29/GP28 cipher key.
 * Original LP2 inversion and positive solved-GP exact roundtrip.
 * Node 22 CommonJS: node sims/red_32run_aes_gp_inverse.cjs.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {events,keyTables,transform,ioc}=require("./red_256_event_key_inverse.cjs");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(
  path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const solved=fs.readFileSync(path.join(
  root,"resources/liber-primus/lp1-plaintext-reference.txt"),"utf8");
const original=corpus.pages.filter(p=>p.status==="unsolved"&&p.indices.length)
  .flatMap(p=>p.indices);
assert.equal(original.length,12956);
const keys=keyTables(events());

/** Exact native GP control, preserving real English source rune frequencies. */
function control(){
  const labels=corpus.translit.map((s,i)=>({s,i}))
    .sort((a,b)=>b.s.length-a.s.length);
  const out=[];
  for(let line of solved.split(/\r?\n/).filter(x=>!x.startsWith("#"))){
    for(let word of (line.toUpperCase().match(/[A-Z]+/g)||[])){
      word=word.replace(/QU/g,"CW").replace(/V/g,"U")
        .replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");
      const values=[];
      for(let i=0;i<word.length;){
        const t=labels.find(t=>word.startsWith(t.s,i));
        if(!t){values.length=0;break;}
        values.push(t.i);
        i+=t.s.length;
      }
      out.push(...values);
    }
  }
  assert.ok(out.length>=3000);
  return Array.from({length:original.length},(_,i)=>out[i%out.length]);
}
const native=control();

/** Derive deterministic keystream without fitting manuscript ciphertext. */
function aesStream(key){
  assert.equal(key.length,32);
  const cipher=crypto.createCipheriv("aes-256-ctr",key,Buffer.alloc(16));
  const out=Buffer.concat([cipher.update(Buffer.alloc(original.length)),
    cipher.final()]);
  assert.equal(out.length,original.length);
  return out;
}
function run(){
  const stats=[];
  let sourceRecovered=0, originalReplay=0;
  for(const orientation of ["forward","reverse"]){
    const key=Buffer.from(keys.get("redRun32/"+orientation));
    const stream=aesStream(key);
    for(const mapping of ["mod","scaled"])
      for(const family of ["add","ea"])
        for(const sign of [-1,1])
          for(const reset of ["book","page"]){
            const reduced=mapping==="mod"?stream:
              Uint8Array.from(stream,x=>Math.floor(x*(family==="add"?29:28)/256));
            const mode={family,sign,reset};
            const decrypted=transform(original,reduced,mode,false);
            assert.deepEqual(transform(decrypted,reduced,mode,true),original);
            originalReplay+=original.length;
            const plant=transform(native,reduced,mode,true);
            assert.deepEqual(transform(plant,reduced,mode,false),native);
            sourceRecovered+=native.length;
            stats.push({orientation,mapping,...mode,
              IoC:ioc(decrypted),
              E:decrypted.filter(x=>x===18).length});
          }
  }
  stats.sort((a,b)=>b.IoC-a.IoC);
  assert.equal(stats.length,32);
  return {study:"red 32 stencil-delimited base60-length AES256-CTR GP original",
    sourceRunLengthsHex:Buffer.from(keys.get("redRun32/forward")).toString("hex"),
    originalRunes:original.length,candidateCount:stats.length,
    originalIoC:ioc(original),nativeSourceIoC:ioc(native),
    exactSourcePositive:sourceRecovered,exactOriginalReplay:originalReplay,
    best:stats.slice(0,8),
    caveat:"Fixed zero CTR IV, byte-reduction, GP28/GP29 registers and key order only"};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run};
