"use strict";

/**
 * Source-only, reversible 64-byte LP2-p56 digest-to-historical Freenet CHK
 * address hypothesis, not a recovered page or established Cicada instruction.
 * Original p56 numerals appear as five ASCII hex lines in the pinned transcript.
 *
 * Node.js 22: node sims/lp2_p56_freenet_chk_uri_sft.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

const TRANSCRIPT = path.resolve(__dirname, "..", "resources",
  "external", "Liber Primus 57.txt");
const EXPECTED =
  "36367763ab73783c7af284446c" +
  "59466b4cd653239a311cb7116" +
  "d4618dee09a8425893dc7500b" +
  "464fdaf1672d7bef5e891c6e227" +
  "4568926a49fb4f45132c2a8b4";

/**
 * Read only the five source-printed hexadecimal lines on solved physical p56.
 * @param {string} transcript
 * @returns {{lines:string[],digest:string}}
 */
function readDigest(transcript) {
  const section = transcript.split(/^%56\s*$/mu)[1].split(/^%57\s*$/mu)[0];
  const lines = section.split(/\r?\n/u).filter(s=>/^[0-9a-f]{20,40}$/u.test(s));
  assert.equal(lines.length,5);
  const digest = lines.join("");
  assert.equal(digest, EXPECTED);
  assert.match(digest,/^[0-9a-f]{128}$/u);
  return {lines,digest};
}

/** @param {Buffer} bytes @returns {string} */
function freenetB64(bytes) {
  return bytes.toString("base64").replace(/\+/gu,"-")
    .replace(/\//gu,"~").replace(/=+$/u,"");
}

/** @param {string} text @returns {Buffer} */
function decodeFreenetB64(text) {
  assert.match(text,/^[A-Za-z0-9~-]+$/u);
  const ordinary=text.replace(/-/gu,"+").replace(/~/gu,"/");
  return Buffer.from(ordinary+"=".repeat((4-(ordinary.length%4))%4),"base64");
}

/**
 * Split the verbatim 64-byte printed value into the two 32-byte fields of
 * a historical Freenet 0.7 CHK URI. No cryptographic hash is calculated here.
 *
 * @param {string} digest
 * @param {boolean} swap
 * @param {string} extra Modified base64 encoding of five bytes. The source
 *   does not supply this field; using a common literal is a hypothesis.
 * @returns {string}
 */
function candidate(digest,swap,extra) {
  const bytes=Buffer.from(digest,"hex");
  assert.equal(bytes.length,64);
  const first=bytes.subarray(0,32);
  const second=bytes.subarray(32,64);
  assert.equal(decodeFreenetB64(extra).length,5);
  const route=swap?second:first,secret=swap?first:second;
  return "freenet:CHK@"+freenetB64(route)+","+freenetB64(secret)+","+extra;
}

function main() {
  const raw=fs.readFileSync(TRANSCRIPT,"utf8");
  const {lines,digest}=readDigest(raw);
  const bytes=Buffer.from(digest,"hex");
  const route=bytes.subarray(0,32),secret=bytes.subarray(32);
  assert.equal(freenetB64(route).length,43);
  assert.equal(freenetB64(secret).length,43);
  assert.ok(decodeFreenetB64(freenetB64(route)).equals(route));
  assert.ok(decodeFreenetB64(freenetB64(secret)).equals(secret));
  assert.equal(Buffer.concat([route,secret]).toString("hex"),digest);
  const commonExtras=["AAIC--8","AAMC--8"];
  assert.deepEqual(commonExtras.map(x=>decodeFreenetB64(x).toString("hex")),
    ["000202fbef","000302fbef"]);

  const candidates=[];
  for(const swap of [false,true]) for(const extra of commonExtras) {
    const uri=candidate(digest,swap,extra);
    const fields=uri.slice("freenet:CHK@".length).split(",");
    assert.equal(fields.length,3);
    assert.equal(decodeFreenetB64(fields[0]).length,32);
    assert.equal(decodeFreenetB64(fields[1]).length,32);
    assert.equal(decodeFreenetB64(fields[2]).length,5);
    const recombined=Buffer.concat([decodeFreenetB64(fields[swap?1:0]),
      decodeFreenetB64(fields[swap?0:1])]);
    assert.ok(recombined.equals(bytes));
    candidates.push({swappedFieldOrder:swap,assumedFiveByteExtra:extra,uri});
  }
  console.log(JSON.stringify({
    claim:"Syntactically constructed CHK candidates only. No payload retrieved, historically intended source interpretation unverified.",
    source:{page:56,printedLineLengths:lines.map(s=>s.length),
      originalDigest:digest,bytes:bytes.length,
      transcriptSha256:crypto.createHash("sha256").update(raw).digest("hex")},
    reconstructedFields:{routingKeyCandidate:freenetB64(route),
      decryptionKeyCandidate:freenetB64(secret)},
    missingOriginalInput:"A historical Freenet CHK also requires five bytes of extra algorithm/flags data, absent from p56. Third-field examples below are unverified.",
    candidates
  },null,2));
}

if(require.main===module) main();
module.exports={readDigest,freenetB64,decodeFreenetB64,candidate,main};
