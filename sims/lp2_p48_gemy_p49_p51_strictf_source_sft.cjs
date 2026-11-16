"use strict";

/**
 * Original LP2 p48 GEMY / source p50 GEM-cycle direct-key consumer.
 * This tests real printed p49(66) and p51(92) under the solved-p56
 * transparent-F GP29 cipher and the ordinary GP29 additive alternative.
 * Keys: the 119->127->128 GEM graph cycle in all three phases, and
 * the 103->111->119->127->128 entrance followed by the GEM cycle.
 * No hidden key, chosen plaintext, or fitted cipher phase is used.
 *
 * Standalone Windows 11 Node.js 22 test:
 * node sims/lp2_p48_gemy_p49_p51_strictf_source_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @param {string} filename @returns {string} */
const read = filename => fs.readFileSync(path.join(__dirname, "..", filename), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
/** @param {number} n @returns {number} */
const mod = n => ((n % 29) + 29) % 29;
const cycle = [6, 18, 19]; // GEM in canonical GP29 indices
/** @typedef {{name:string, key:(cursor:number)=>number}} KeyFamily */
/** @type {KeyFamily[]} */
const families = [
  {name:"GEM phase 0", key:cursor => cycle[cursor % 3]},
  {name:"GEM phase 1", key:cursor => cycle[(cursor + 1) % 3]},
  {name:"GEM phase 2", key:cursor => cycle[(cursor + 2) % 3]},
  {name:"103→OOGEM→GEM", key:cursor => cursor < 2 ? 3 : cycle[(cursor - 2) % 3]}
];

/**
 * Enumerate every legal key cursor at each ciphertext rune.
 * Plaintext F=0 must emit ciphertext F=0 and leave the cursor intact;
 * ciphertext F may alternatively result from shifted non-F plaintext.
 * This is a necessary-and-sufficient exact state DP for this known key.
 * @param {number[]} ciphertext
 * @param {(cursor:number)=>number} key
 * @param {number} sign -1 or +1 in P=C+sign*K mod29
 * @returns {{firstImpossible:number,finalCursors:number[]}}
 */
function strictF(ciphertext, key, sign) {
  let current = new Set([0]);
  for(let i=0;i<ciphertext.length;i++) {
    const next = new Set();
    const c = ciphertext[i];
    for(const cursor of current) {
      const plaintext = mod(c + sign * key(cursor));
      if(c === 0) {
        next.add(cursor); // authentic literal-F interruption
        if(plaintext !== 0)next.add(cursor+1); // shifted non-F
      } else if(plaintext !== 0) {
        next.add(cursor+1); // can't shift plaintext F to non-F ciphertext
      }
    }
    if(!next.size)return {firstImpossible:i,finalCursors:[]};
    current = next;
  }
  return {firstImpossible:-1,finalCursors:[...current].sort((a,b)=>a-b)};
}

/**
 * Authentically forward-encrypt a plaintext through the known skip rule.
 * @param {number[]} plaintext
 * @param {(cursor:number)=>number} key
 * @param {number} sign -1 or +1 in P=C+sign*K mod29
 * @returns {{ciphertext:number[],consumed:number}}
 */
function encryptF(plaintext,key,sign) {
  let cursor=0;
  const ciphertext=plaintext.map(p=>{
    if(p===0)return 0;
    const c=mod(p-sign*key(cursor));
    cursor++;
    return c;
  });
  return {ciphertext,consumed:cursor};
}

/** @param {number[]} indices @returns {number} */
function ioc(indices) {
  const counts = new Uint32Array(29);
  for(const rune of indices)counts[rune]++;
  return counts.reduce((s,c)=>s+c*(c-1),0)/(indices.length*(indices.length-1));
}

/** @param {number} page @returns {number[]} */
function pageRunes(page) {
  const p=corpus.pages.find(item=>item.page===page);
  assert.ok(p,"missing page "+page);
  assert.equal(p.indices.length,p.runic_count);
  return p.indices;
}

function run() {
  assert.equal(corpus.runes.length,29);
  assert.deepEqual(cycle.map(i=>corpus.translit[i]),["G","E","M"]);
  assert.deepEqual([3,3,...cycle].map(i=>corpus.translit[i]),["O","O","G","E","M"]);
  const known = pageRunes(57), pre = pageRunes(49), post = pageRunes(51);
  assert.deepEqual([pre.length,post.length,known.length],[66,92,95]);
  assert.ok(Math.abs(ioc(known)-0.06270996640537514)<1e-12);

  // Negative original-cipher gates are frozen by (phase,sign) order.
  // Source 103 key is "O O" once then the GEM cycle, not OOGEM repeated.
  const expected = {
    49:[[1,8],[25,19],[25,2],[25,19]],
    51:[[38,31],[38,31],[24,30],[38,31]]
  };
  const rows=[];
  for(const [page,ciphertext] of [[49,pre],[51,post]]) {
    for(let f=0;f<families.length;f++) {
      const family=families[f];
      for(let j=0;j<2;j++) {
        const sign=j===0?-1:1;
        const result=strictF(ciphertext,family.key,sign);
        assert.equal(result.firstImpossible,expected[page][f][j],
          page+" "+family.name+" sign="+sign+" contradiction");
        assert.equal(result.finalCursors.length,0);

        // Positive: genuine independently solved p57 natural GP text
        // is actually encrypted, including every transparent-F event,
        // and the exact inverse retains its true cursor after all 95 runes.
        const plant=encryptF(known,family.key,sign);
        assert.ok(strictF(plant.ciphertext,family.key,sign)
          .finalCursors.includes(plant.consumed));
        assert.deepEqual(encryptF(known,family.key,sign).ciphertext,plant.ciphertext);

        // Ordinary additive no-skip inverse, included even though direct
        // use of the authentic F rule is already mathematically excluded.
        const decoded=ciphertext.map((c,i)=>mod(c+sign*family.key(i)));
        assert.deepEqual(decoded.map((p,i)=>mod(p-sign*family.key(i))),ciphertext);
        const coefficient=ioc(decoded);
        rows.push({page,key:family.name,sign,
          firstImpossibleRune:result.firstImpossible,
          ordinaryAdditiveIoC:Number(coefficient.toFixed(9)),
          ordinaryAdditiveFirst20:decoded.slice(0,20).map(i=>corpus.translit[i]).join("")});
      }
    }
  }
  assert.equal(rows.length,16);
  console.log(JSON.stringify({
    source:"original p49(66) / p51(92); first-party-derived GEM directional path",
    result:"zero legal whole-page F-transparent decodings; no native GP plaintext",
    knownP57IoC:ioc(known),originalP49IoC:ioc(pre),originalP51IoC:ioc(post),
    rows,recoveredUnknownPlaintext:false
  },null,2));
}
if(require.main===module)run();
module.exports={run,strictF,encryptF};
