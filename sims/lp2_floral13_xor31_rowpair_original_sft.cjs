"use strict";
/**
 * Original p40-p55 floral-mask XOR page-clock SFT.
 * Windows 11, Node 22: node sims/lp2_floral13_xor31_rowpair_original_sft.cjs
 * Compares the source 13/31 and 22/31 masks without fitted secrets.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..","resources","liber-primus");
const c=JSON.parse(fs.readFileSync(path.join(root,"lp2-corpus.json"),"utf8"));
const t=JSON.parse(fs.readFileSync(path.join(root,"base60-grid.json"),"utf8"));
assert.equal(t.rows.length,32);
assert.ok(t.rows.every(row=>row.length===8));
const bytes=t.rows.map(row=>row.map(token=>{
  const a=t.alphabet.indexOf(token[0]),b=t.alphabet.indexOf(token[1]);
  assert.ok(token.length===2&&a>=0&&b>=0);
  const v=a*60+b;
  assert.ok(v<=255);
  return v;
}));
const ps=c.pages.slice(40,56);
assert.deepEqual(ps.map(p=>p.page),Array.from({length:16},(_,i)=>40+i));
assert.equal(ps.reduce((s,p)=>s+p.indices.length,0),3316);
assert.equal(ps[10].indices.length,0);
const pairs=(a,b)=>Array.from({length:16},(_,i)=>[a^i,b^i]);
for(let a=0;a<32;a++)for(let b=0;b<32;b++){
  assert.equal(new Set(pairs(a,b).flat()).size,(a&16)!==(b&16)?32:16);
}
assert.deepEqual(pairs(13,31).slice(0,4),[[13,31],[12,30],[15,29],[14,28]]);
assert.deepEqual(pairs(22,31).slice(0,4),[[22,31],[23,30],[20,29],[21,28]]);
const record=(pair,form)=>form==="concat16"?
  bytes[pair[0]].concat(bytes[pair[1]]):
  bytes[pair[0]].map((v,i)=>v^bytes[pair[1]][i]);
/** Invertible GP29 or solved-F-preserving GP28 byte-key transform. */
function run(input,key,ring,sign){
  let clock=0;
  return input.map(v=>{
    if(ring===28&&v===0)return 0;
    const rank=v-(ring===28?1:0);
    const delta=key[clock++%key.length]%ring;
    return (rank+sign*delta%ring+ring)%ring+(ring===28?1:0);
  });
}
function ioc(v){
  const hist=Array(29).fill(0);
  for(const x of v)hist[x]++;
  return hist.reduce((s,n)=>s+n*(n-1),0)/(v.length*(v.length-1));
}
const control=c.pages[57].indices;
assert.equal(control.length,95);
const tests=[];
for(const a of [13,22]){
  const walk=pairs(a,31);
  const distinct=new Set(walk.flat()).size;
  assert.equal(distinct,a===13?32:16);
  const sourceXor=walk.flatMap(p=>record(p,"xor8"));
  const printable=sourceXor.filter(v=>(v>=32&&v<=126)||[9,10,13].includes(v)).length;
  assert.equal(printable,a===13?53:50);
  const models=[];
  for(const form of ["concat16","xor8"])for(const ring of [29,28])for(const sign of [-1,1]){
    const decoded=[];
    for(let i=0;i<16;i++){
      const key=record(walk[i],form);
      const original=ps[i].indices;
      const proposed=run(original,key,ring,sign);
      assert.deepEqual(run(proposed,key,ring,-sign),original);
      const sourceNativePlant=Array.from({length:original.length},(_,k)=>control[k%control.length]);
      assert.deepEqual(run(run(sourceNativePlant,key,ring,sign),key,ring,-sign),sourceNativePlant);
      decoded.push(proposed);
    }
    const output=decoded.flat();
    const value=ioc(output);
    assert.ok(value>0.033&&value<0.036);
    models.push({form,ring,sign,ioc:value,p40to53:ioc(decoded.slice(0,14).flat()),
      p54to55:ioc(decoded.slice(14).flat()),
      start:output.slice(0,20).map(j=>c.translit[j]).join(" ")});
  }
  tests.push({mask:[a,31],bitwiseXorDelta:a^31,distinctRows:distinct,
    firstFour:walk.slice(0,4),lastFour:walk.slice(-4),printableXor:printable,
    xorFirst16:sourceXor.slice(0,16).map(n=>n.toString(16).padStart(2,"0")).join(""),models});
}
assert.equal(tests[0].xorFirst16,"0ba1b33cba9c9d234e1b62f445dde60e");
assert.ok(tests.flatMap(x=>x.models).every(x=>x.ioc<0.036));
console.log(JSON.stringify({source:"p40-p55, 3316 original GP29 runes; original 32x8 table",
  baselineIoc:ioc(ps.flatMap(p=>p.indices)),tests,
  result:"13/31 XOR page-index clock covers all rows, 22/31 covers only half; sixteen original receivers fail to recover plaintext."},null,2));
