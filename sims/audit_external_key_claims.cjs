"use strict";
/** Replay two externally published LP2 key claims on withheld ciphertext.
 * @see https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md
 * Run: node sims/audit_external_key_claims.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const pages = fs.readFileSync(path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8").split("%");
/** @type {Record<number, number[]>} */
const keys = {
  18: [11,6,1,20,25,20,9,15,24,26,25,7,19,8,10,24,18,9,0,16,9,4,14,22,13,13,3,28,5,21,24,19,5,1,27,14,6,17,24,24,22,8,23,6,22,19,2,11,3,19,25,15,24],
  19: [24,15,2,24,4,21,11,10,20,16,9,19,26,11,7,5,11,6,27,8,22,25,21,16,25,0,27,9,21,7,27,15,21,9,3,16,5,22,18,4,5,18,23,28,28,28,28]
};
/** @param {number[]} a */
function ioc(a) { const h = Array(29).fill(0); for (const c of a) h[c]++; return h.reduce((s,c)=>s+c*(c-1),0)/(a.length*(a.length-1)); }
/** @param {number} pageNo */
function audit(pageNo) {
  const key = keys[pageNo], C = corpus.pages[pageNo].indices;
  assert.equal(key.length,pageNo===18?53:47);
  assert.equal(C.length,pageNo===18?260:271);
  const sign = pageNo===18?-1:1;
  const P = C.map((c,i)=>(c+sign*key[i%key.length]+29)%29);
  let position = 0;
  const decoded = [...pages[pageNo]].map(ch => corpus.runes.includes(ch)?corpus.translit[P[position++]]:ch).join("");
  assert.equal(position,P.length);
  return {page:pageNo,runes:P.length,period:key.length,trainingIoc:ioc(P.slice(0,key.length)),
    heldoutRunes:P.length-key.length,heldoutIoc:ioc(P.slice(key.length)),
    fullIoc:ioc(P),first300:decoded.slice(0,300),last300:decoded.slice(-300)};
}
if (require.main===module) console.log(JSON.stringify([audit(18),audit(19)],null,2));
module.exports={audit};
