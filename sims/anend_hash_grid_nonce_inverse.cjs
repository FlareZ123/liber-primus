"use strict";

/**
 * Independently sourced AN END hash -> LP2 grid-column AES/ChaCha nonce test.
 *
 * The exact published 64-byte hash printed on solved LP2 p56 determines
 * eight section-specific 16-byte IVs by three fully specified, frozen rules.
 * Eight authentic 32-byte LP2 p49-51 grid columns are candidate stream keys.
 * Compare original unknown text against independent native GP English/Latin
 * source controls, same-source planted ciphertext, and seven rotated-hash
 * wrong-source controls under the *same* 32-mode / 8! assignment search.
 *
 * Source-only hypothesis; no plaintext, key, clock or cipher identification
 * is assumed by this experiment. Node 22, CommonJS, no network or writes.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const {originalKeys, originalBodies} = require("./grid_stream_collision_viterbi.cjs");
const {search, plant} = require("./red_title_nonce_grid_viterbi.cjs");
const {latinModel, latinPlant, plainScore} = require("./grid_latin_register_inverse.cjs");
const {train, encode} = require("./grid_keyskip_viterbi.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const manifest = JSON.parse(read("resources/cicada2014-archive-hash-manifest.json"));
const originalHash = Buffer.from(manifest.targetHex, "hex");
assert.equal(originalHash.length, 64);
assert.equal(originalHash.toString("hex"), manifest.targetHex.toLowerCase());

/**
 * Three fixed layouts tied to the eight source grid columns. The first two
 * retain the printed digest bytes, while the third uses SHA-256 domain
 * separation with an explicitly specified 1-byte section index.
 *
 * @param {Buffer} hash 64-byte genuine (or wrong-source) hash.
 * @param {"double8"|"overlap16"|"sha256-index"} rule Source nonce serialization.
 * @returns {Buffer[]} One 128-bit IV per source-annotated section.
 */
function ivsFromHash(hash, rule) {
  assert.equal(hash.length, 64);
  return Array.from({length: 8}, (_, section) => {
    if (rule === "double8") {
      const h = hash.subarray(8 * section, 8 * section + 8);
      return Buffer.concat([h, h]);
    }
    if (rule === "overlap16") {
      return Buffer.from(Array.from({length: 16}, (_, j) =>
        hash[(8 * section + j) % 64]));
    }
    assert.equal(rule, "sha256-index");
    return crypto.createHash("sha256")
      .update("Liber Primus AN END LP2 IV\0", "utf8")
      .update(hash).update(Buffer.from([section])).digest().subarray(0, 16);
  });
}

/** Source-independent wrong hash: circularly rotate all 64 input bytes. */
function rotateHash(hash, bytes) {
  return Buffer.concat([hash.subarray(bytes), hash.subarray(0, bytes)]);
}


function run() {
  const keys = originalKeys();
  const bodies = originalBodies();
  const english = train(read("resources/control/shakespeare_first300k.txt").slice(0, 200000));
  const latin = latinModel();
  const latinReference = JSON.parse(read("resources/control/latin-vulgate-heldout-gp.json")).runes;
  const englishReference = encode(read("resources/control/shakespeare_first300k.txt").slice(205000)).slice(0,2400);
  assert.equal(bodies.length, 8);
  assert.equal(bodies.reduce((s,x)=>s+x.length,0),2400);
  assert.equal(englishReference.length,2400);
  assert.equal(latinReference.length,2400);
  const references = {
    englishGP: plainScore(englishReference, english),
    latinGP: plainScore(latinReference, latin),
  };
  const output = [];
  for (const rule of ["double8","overlap16","sha256-index"]) {
    const ivs = ivsFromHash(originalHash, rule);
    for (const [register, lm] of [["englishGP",english],["latinGP",latin]]) {
      const genuine = search(keys, bodies, ivs, lm);
      const planted = register === "englishGP"
        ? plant(keys, ivs, lm)
        : latinPlant(keys, ivs, lm);
      const wrongSource = [];
      for (let shift=1;shift<=7;shift++) {
        const wrong = ivsFromHash(rotateHash(originalHash,8*shift),rule);
        wrongSource.push({shiftBytes:8*shift,
          bestScorePerRune:search(keys,bodies,wrong,lm).best.perRune});
      }
      const exceed = wrongSource.filter(x=>x.bestScorePerRune>=genuine.best.perRune).length;
      output.push({
        nonceRule:rule,register,
        originalScorePerRune:genuine.best.perRune,
        sourceReferenceTrigramPerRune:references[register],
        bestOriginalMode:{
          algo:genuine.best.algo,reverseKey:genuine.best.reverseKey,
          reducer:genuine.best.reducer,sign:genuine.best.sign,
          columns:genuine.best.columns,
          recoveredOriginalGpPrefix:genuine.best.bodyEvidence.map(x=>x.gpPrefix)
        },
        planted:{
          correct:planted.correct,
          total:2400, modeRecovered:register==="englishGP"
            ?planted.modeRecovered:planted.originalGridModeRecovered,
          assignmentRecovered:register==="englishGP"
            ?planted.assignmentRecovered:planted.originalGridColumnsRecovered,
        },
        wrongSource: {
          trials:wrongSource.length,
          exceed, empiricalUpperP:(exceed+1)/(wrongSource.length+1),
          scores:wrongSource,
        },
      });
    }
  }
  return {
    evidenceClass:"Original-source fixed nonce hypothesis; negative or positive conditional decoder test",
    p56HashHex:originalHash.toString("hex"),
    originalCipherRunes:2400,
    originalSectionCount:8,
    sourceGridKeyCount:8,
    candidateCipherModes:32,
    wrongSourceRule:"Rotate 64-byte AN END hash by 8,16,...,56 bytes before same per-section nonce derivation",
    sourceControls:"Source-independent Shakespeare English GP and independent Latin Vulgate GP",
    noAuthenticityFromRoundTrip:true,
    results:output,
  };
}
if (require.main === module) process.stdout.write(JSON.stringify(run(),null,2)+"\n");
module.exports = {ivsFromHash,rotateHash,run};
