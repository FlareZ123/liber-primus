"use strict";

/**
 * A historical Cicada PATIENCE key, applied to the 256 original LP2 ink
 * events as a source-derived repeating GP pad across the entire unsolved book.
 *
 * Test only the natural two 256-event serializations (rowwise or columnwise
 * after historical PATIENCE prime-key permutation), two literal event numeric
 * representations, and the existing reversible additive / transparent-EA
 * registers. Every key is frozen before original ciphertext is examined.
 *
 * node sims/red256_patience_original_gp_pad.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {events,transform,ioc} = require("./red_256_event_key_inverse.cjs");
const {historicOrder} = require("./red256_grid_patience_column_gate.cjs");

const ROOT = path.resolve(__dirname,"..");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"),"utf8"));
const reference = fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp1-plaintext-reference.txt"),"utf8");
const original = corpus.pages.filter(p=>p.page<56)
  .flatMap(p=>p.indices);
assert.equal(original.length,12956);
assert.equal(corpus.translit[18],"E");

const historic=historicOrder();
const source=events();
assert.equal(source.length,256);
const order=historic.order;

/** Source-native reference GP text, explicitly independent of unknown LP2. */
function nativePlaintext() {
  const tokens=corpus.translit.map((s,i)=>({s,i}))
    .sort((a,b)=>b.s.length-a.s.length);
  const normalized=reference.split(/\r?\n/)
    .filter(line=>!line.startsWith("#")).join(" ").toUpperCase();
  const result=[];
  for(let word of normalized.match(/[A-Z]+/g)||[]) {
    word=word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");
    const encoded=[];
    for(let i=0;i<word.length;) {
      const candidate=tokens.find(t=>word.startsWith(t.s,i));
      if(!candidate){encoded.length=0;break;}
      encoded.push(candidate.i);
      i+=candidate.s.length;
    }
    result.push(...encoded);
  }
  assert.ok(result.length>=3000);
  return Array.from({length:original.length},
    (_,i)=>result[i%result.length]);
}

/** Fully source-locked PATIENCE positional serialization. */
function sourceKeys() {
  const kinds={
    gpIndex: e=>e.value,
    gpPrimeResidue: e=>e.kind ? corpus.prime[e.value]%29 : 13
  };
  const out=new Map();
  for(const [label,convert] of Object.entries(kinds)) {
    const rowKey=Array.from({length:32},(_,r)=>
      order.map(j=>convert(source[8*r+j]))).flat();
    const columnKey=order.flatMap(j=>
      Array.from({length:32},(_,r)=>convert(source[8*r+j])));
    assert.equal(rowKey.length,256);
    assert.equal(columnKey.length,256);
    out.set(label+"/rowwise",rowKey);
    out.set(label+"/columnwise",columnKey);
  }
  return out;
}

function run() {
  const native=nativePlaintext(), candidates=[];
  let originalRoundtripSymbols=0,plantedRecoveredSymbols=0;
  for(const [sourceKeyName,key] of sourceKeys())
    for(const family of ["add","ea"])
      for(const sign of [-1,1])
        for(const reset of ["book","page"]) {
          const mode={family,sign,reset};
          const decoded=transform(original,key,mode,false);
          const replay=transform(decoded,key,mode,true);
          assert.deepEqual(replay,original);
          originalRoundtripSymbols+=replay.length;
          const synthetic=transform(native,key,mode,true);
          assert.deepEqual(transform(synthetic,key,mode,false),native);
          plantedRecoveredSymbols+=native.length;
          const E=decoded.filter(x=>x===18).length;
          candidates.push({sourceKeyName,...mode,
            ioc:ioc(decoded),E,
            firstGP:decoded.slice(0,35).map(x=>corpus.translit[x]).join("")});
        }
  assert.equal(candidates.length,32);
  assert.equal(plantedRecoveredSymbols,32*original.length);
  assert.equal(originalRoundtripSymbols,32*original.length);
  candidates.sort((a,b)=>b.ioc-a.ioc);
  const mostE=candidates.slice().sort((a,b)=>b.E-a.E)[0];
  assert.ok(candidates[0].ioc<0.036);
  assert.ok(mostE.E<550);
  return {
    originalCipherSource:"All 55 rune-bearing unknown LP2 pages, 12,956 original runes",
    sourceKey:"256 original red-rune/13-dot events, historical PATIENCE GP-prime column order",
    modes:32,sourceKeyFamilies:4,
    trueSourceNativeGPControlIoc:ioc(native),
    strongestIoc:candidates[0],
    highestGP_E:mostE,
    originalRoundtripSymbols,plantedRecoveredSymbols,
    interpretation:"32 historical-source-locked direct register keys fail to reveal native-GP-English ciphertext plaintext; an unconstrained later mixing layer remains open"
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={nativePlaintext,sourceKeys,run};
