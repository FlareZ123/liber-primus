"use strict";

/**
 * Finite source-derived section nonce: every original red heading interpreted
 * as one base-29 Gematria Primus integer, left-zero-padded to exactly sixteen
 * bytes, with either big-endian or little-endian byte serialization.
 *
 * This is an independent original-rune cipher inversion under the previously
 * validated AES/ChaCha keyskip Viterbi, 8! grid-column assignments and planted
 * source-English controls, not a search for a numerological match.
 *
 * Run: node sims/red_title_base29_grid_iv.cjs
 * @module red_title_base29_grid_iv
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {train} = require("./grid_keyskip_viterbi.cjs");
const {originalKeys,originalBodies} =
  require("./grid_stream_collision_viterbi.cjs");
const {redTitles,search,plant,nulls} =
  require("./red_title_nonce_grid_viterbi.cjs");

const ROOT=path.resolve(__dirname,"..");
const RUNES=[..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
const DIGIT=new Map(RUNES.map((r,i)=>[r,i]));

/**
 * A heading with L runes is an unsigned L-digit base29 numeral, and never
 * overflows 128 bits for these eight source-marked headings.
 *
 * @param {string} heading Canonical actual original red heading.
 * @returns {Buffer} Sixteen-byte big-endian numeral.
 */
function base29BE(heading) {
  let value=0n;
  for(const rune of heading) {
    const digit=DIGIT.get(rune);
    assert.notEqual(digit,undefined,"Unexpected original rune");
    value=value*29n+BigInt(digit);
  }
  assert.ok(value<(1n<<128n),"Heading IV exceeds AES block");
  return Buffer.from(value.toString(16).padStart(32,"0"),"hex");
}

/**
 * The same source integer in an alternate machine byte order.
 * @param {string} heading Canonical original heading.
 * @param {"BE"|"LE"} order Network or reversed byte order.
 * @returns {Buffer} Sixteen-byte IV/nonce.
 */
function base29IV(heading,order) {
  const b=base29BE(heading);
  assert.ok(order==="BE"||order==="LE");
  return order==="BE"?b:Buffer.from(b).reverse();
}

/** @returns {object} Complete, source-locked original/positive/null test. */
function main() {
  const words=redTitles();
  assert.deepEqual(words.map(x=>[...x].length),
    [13,16,12,11,16,19,8,8]);
  const keys=originalKeys();
  const bodies=originalBodies();
  assert.equal(keys.length,8);
  assert.equal(bodies.length,8);
  assert.equal(bodies.flat().length,2400);
  const training=fs.readFileSync(path.join(ROOT,
    "resources/control/shakespeare_first300k.txt"),"utf8");
  const lm=train(training.slice(0,200000));
  const result=[];
  for(const order of ["BE","LE"]) {
    const ivs=words.map(w=>base29IV(w,order));
    const actual=search(keys,bodies,ivs,lm);
    const controls=plant(keys,ivs,lm);
    const randomized=nulls(keys,bodies,ivs,lm,actual,20);
    assert.ok(controls.recoveryRate>0.85);
    result.push({order,
      ivHex:ivs.map(iv=>iv.toString("hex")),
      original:actual,englishSourcePlant:controls,
      originalGridShuffledNull:randomized});
  }
  return {
    model:"Original red titles interpreted as 29-base integers and zero-padded to 128-bit IVs",
    sourceSHA256:crypto.createHash("sha256").update(fs.readFileSync(path.join(
      ROOT,"resources/liber-primus/lp2-ink-annotations.json"))).digest("hex"),
    titlesGP:words.map(w=>[...w].map(c=>DIGIT.get(c))),
    lengths:words.map(x=>[...x].length),
    sourceUnsolvedCipherRunes:bodies.flat().length,
    keyCandidates:"8 exact original grid columns x 8! assignments",
    generatorModes:"2 AES/ChaCha x 2 reverse-key x 2 byte reductions x 2 signs",
    sourceDerivedNonceVariants:2,
    tests:result,
    status:"No original plaintext claimed by numerical nonce serialization alone",
  };
}
if(require.main===module) console.log(JSON.stringify(main(),null,2));
module.exports={base29BE,base29IV,main};
