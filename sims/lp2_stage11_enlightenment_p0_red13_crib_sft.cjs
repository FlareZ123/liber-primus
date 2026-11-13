"use strict";
/**
 * Original 2014 Stage11 signed ENLIGHTENMENT to p0 red13 crib gate.
 * Standalone SFT, Windows Node.js 22: node sims/lp2_stage11_enlightenment_p0_red13_crib_sft.cjs
 * Tests exactly source-visible 13-rune title and whole following 0-2 chapter
 * with an ordinary 13-period historical GP29 additive cipher, with a separate
 * source-known literal-F no-key-advance variant. No parameter fitting.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname,"..");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"),"utf8"));
const signed = fs.readFileSync(path.join(ROOT,
  "resources/historical/cicada2014-stage11-message.asc"),"utf8");
assert.match(signed,/Your enlightenment awaits you\./);
const alpha = corpus.translit;
const order = alpha.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
const candidate = "ENLIGHTENMENT";
const gp = [];
for(let i=0;i<candidate.length;) {
  const found=order.find(x=>candidate.startsWith(x.s,i));
  assert(found, "bad GP29 token");
  gp.push(found.i);
  i+=found.s.length;
}
assert.equal(gp.length,13);
const first=corpus.pages[0].indices;
assert.equal(first.length,262);
const heading=first.slice(0,13);
assert.deepEqual(heading,[15,8,18,3,6,19,27,0,15,26,18,21,5]);
const key=heading.map((x,i)=>(x-gp[i]+29)%29);
assert.deepEqual(key,[26,28,27,22,0,11,11,11,6,7,0,12,18]);
const segment=corpus.pages.slice(0,3).flatMap(p=>p.indices);
assert.equal(segment.length,729);
/** @param {number[]} input @param {number} sign @param {boolean} fSkip */
function apply(input,sign,fSkip,literalMask) {
  let k=0;
  return input.map((x,pos)=>{
    if(fSkip&&literalMask[pos]) {assert.equal(x,0);return 0;}
    const result=(x+sign*key[k%key.length]+29)%29;
    k++;
    return result;
  });
}
/** @param {number[]} a */
function ioc(a) {
  const freq=Array(29).fill(0);
  for(const x of a)freq[x]++;
  return freq.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1));
}
const variants=[];
const body=segment.slice(13);
const bodyFMask=body.map(x=>x===0);
for(const fSkip of [false,true]) {
  const output=apply(body,-1,fSkip,bodyFMask);
  // Reconstruct original under the source-visible F positions.
  const roundTrip=apply(output,1,fSkip,bodyFMask);
  assert.deepEqual(roundTrip,body);
  const control=corpus.pages[57].indices;
  const plantMask=control.map(x=>x===0);
  const ciphertextPlant=apply(control,1,fSkip,plantMask);
  assert.deepEqual(apply(ciphertextPlant,-1,fSkip,plantMask),control);
  variants.push({fSkip,
    targetRunes:body.length,
    ioc:ioc(output),
    first60:output.slice(0,60).map(i=>alpha[i]).join(" "),
    plantedSolved57RunesRecovered:control.length});
}
assert(Math.abs(variants[0].ioc-0.03414462632339727)<1e-12);
assert(Math.abs(variants[1].ioc-0.03647302418252139)<1e-12);
assert.deepEqual(apply(heading,-1,false,heading.map(x=>x===0)),gp);
console.log(JSON.stringify({source:"2014 PGP-signed Stage11 handoff and LP2 p0 red13",
  signedClue:candidate,
  headingCipher:heading.map(i=>alpha[i]).join(""),
  inferredModulo29Key:key,
  inferredKeyGp:key.map(i=>alpha[i]).join(""),
  targetRawIoC:ioc(body),
  variants,
  outcome:"13-rune crib fits by construction, but neither original chapter continuation is plaintext; hypothesis not validated."},null,2));
}

