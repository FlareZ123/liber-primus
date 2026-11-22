"use strict";
/**
 * #341, source-printed p49-p51 32x8 BASE60 grid: 32 whole-row
 * minimal unsigned big-endian byte records.
 *
 * Run: node sims/lp2_grid32_row_minimal_byte_sft.cjs
 *
 * Historical base59 (alphabet with omitted lowercase f) is the sole
 * sensitivity control. No row/column reordering, offset search, key fit
 * or post-hoc decoder is applied to original source.
 *
 * @module lp2_grid32_row_minimal_byte_sft
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const {TextDecoder} = require("node:util");
const ROOT = path.resolve(__dirname, "..");
const GRID = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const SOURCE = GRID.pages.flatMap(p => p.tokens);
const BASE60 = GRID.alphabet;
const BASE59 = BASE60.replace("f", "");
const MAGIC = new Map([
  ["GIF87a", Buffer.from("GIF87a")],
  ["GIF89a", Buffer.from("GIF89a")],
  ["PNG", Buffer.from("89504e470d0a1a0a", "hex")],
  ["ZIP", Buffer.from("504b0304", "hex")],
  ["ZIP-empty", Buffer.from("504b0506", "hex")],
  ["JPEG", Buffer.from("ffd8ff", "hex")],
  ["PDF", Buffer.from("%PDF")],
  ["gzip", Buffer.from("1f8b", "hex")],
  ["bzip2", Buffer.from("BZh")],
  ["7z", Buffer.from("377abcaf271c", "hex")],
  ["ELF", Buffer.from("7f454c46", "hex")],
  ["Ogg", Buffer.from("OggS")],
  ["FLAC", Buffer.from("fLaC")],
  ["SQLite", Buffer.from("SQLite format 3\u0000")],
  ["ID3", Buffer.from("ID3")],
  ["RIFF", Buffer.from("RIFF")],
  ["SQLite WAL", Buffer.from("377f0682", "hex")]
]);
/** @param {Buffer} b @returns {string} */
const sha256 = b => crypto.createHash("sha256").update(b).digest("hex");
/** @param {string} digits @param {string} alphabet @returns {bigint} */
function numberFromDigits(digits,alphabet) {
  const radix = BigInt(alphabet.length);
  let n = 0n;
  for (const ch of digits) {
    const d = alphabet.indexOf(ch);
    assert.ok(d >= 0, "Unrecognized original grid digit: " + ch);
    n = n*radix + BigInt(d);
  }
  return n;
}
/** @param {bigint} n @returns {Buffer} */
function minimalBigEndian(n) {
  assert.ok(n>=0n);
  const a=[];
  do {
    a.unshift(Number(n & 255n));
    n >>= 8n;
  } while (n>0n);
  return Buffer.from(a);
}
/**
 * @param {Buffer} bytes @param {string} alphabet @param {number} digits
 * @returns {string}
 */
function digitsFromBytes(bytes, alphabet, digits) {
  let n=0n;
  for(const b of bytes) n=n*256n+BigInt(b);
  const radix=BigInt(alphabet.length);
  const symbols=[];
  for(let i=0;i<digits;i++) {
    symbols.unshift(alphabet[Number(n%radix)]);
    n /= radix;
  }
  assert.equal(n,0n, "Original record does not fit fixed printed width");
  return symbols.join("");
}
/** @param {Buffer} buffer @returns {string[]} */
function signatures(buffer) {
  return [...MAGIC].filter(([,bytes]) =>
    buffer.subarray(0, bytes.length).equals(bytes)).map(([name])=>name);
}
/** @param {Buffer} b @returns {number} */
function printableRate(b) {
  return [...b].filter(x=>x>=32&&x<=126).length/b.length;
}
/** @param {Buffer} b @returns {number} */
function entropy(b) {
  const hist=new Uint32Array(256);
  for(const x of b)hist[x]++;
  return [...hist].reduce((sum,c)=>{
    if(!c)return sum;
    const p=c/b.length;
    return sum-p*Math.log2(p);
  },0);
}
/** @param {Buffer} b @returns {boolean} */
function validUTF8(b) {
  try {
    new TextDecoder("utf-8",{fatal:true}).decode(b);
    return true;
  } catch(e) {
    return false;
  }
}
/** @param {string} alphabet @param {string} name @returns {object} */
function test(alphabet,name) {
  assert.equal(SOURCE.length,256);
  assert.equal(alphabet.length,name==="radix60"?60:59);
  const rows=[];
  const bytes=[];
  for(let r=0;r<32;r++) {
    const tokens=SOURCE.slice(r*8,r*8+8);
    assert.equal(tokens.length,8);
    const literal=tokens.join("");
    assert.equal(literal.length,16);
    const number=numberFromDigits(literal,alphabet);
    const record=minimalBigEndian(number);
    assert.equal(digitsFromBytes(record,alphabet,16),literal,
      "Reversibility of original row "+r);
    bytes.push(record);
    rows.push({row:r,originalTokens:tokens,byteLength:record.length,
      rowSHA256:sha256(record),firstFourHex:record.subarray(0,4).toString("hex"),
      magic:signatures(record)});
  }
  const all=Buffer.concat(bytes);
  assert.equal(rows.length,32);
  assert.ok(!validUTF8(all));
  assert.equal(signatures(all).length,0);
  // Exact internal positive control: the fixed parser recognizes a real
  // GIF header and converts its source byte record without loss.
  const synthetic=Buffer.from("GIF89a","ascii");
  const plantedDigits=digitsFromBytes(synthetic,alphabet,16);
  const restored=minimalBigEndian(numberFromDigits(plantedDigits,alphabet));
  assert.deepEqual(restored,synthetic);
  assert.deepEqual(signatures(restored),["GIF89a"]);
  // Rows are genuine source units, so the shuffled-row control cannot change
  // marginal byte frequencies; it checks only container-prefix sensitivity.
  let seed=0x00503301, shuffledMagic=0;
  for(let trial=0;trial<1024;trial++) {
    seed ^= seed<<13;seed ^= seed>>>17;seed ^= seed<<5;
    const lead=bytes[(seed>>>0)%32];
    if(signatures(lead).length)shuffledMagic++;
  }
  return {
    reading:name,originalPageNumbers:[49,50,51],
    sourceRowCount:32,sourceColumnCount:8,
    rows,concatenatedBytes:all.length,
    streamSHA256:sha256(all),first16Hex:all.subarray(0,16).toString("hex"),
    printableBytes:[...all].filter(x=>x>=32&&x<=126).length,
    printableRate:printableRate(all),entropyBitsPerByte:entropy(all),
    utf8Valid:validUTF8(all),wholeStreamMagic:signatures(all),
    zeroBytes:[...all].filter(x=>x===0).length,
    printableControlShuffledRows:1024,
    shuffledRowStartsWithMagic:shuffledMagic,
    plantedGIFHeaderPassed:true,
    originalRowsReencodedExactly:true
  };
}
function run() {
  assert.equal(BASE60,
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx");
  assert.equal(BASE59,
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx");
  assert.equal(SOURCE.filter(s=>s.includes("f")).length,0);
  const a=test(BASE60,"radix60");
  const b=test(BASE59,"radix59");
  assert.equal(a.concatenatedBytes,381);
  assert.equal(b.concatenatedBytes,380);
  assert.equal(a.streamSHA256,
    "6a059e2a69a772c71dafcb2ac9da19fe26677da93e36eeb449e3ab6c9508e9dd");
  assert.equal(b.streamSHA256,
    "e6dec489d3d666d5765184d603383d75946478915b696c791b67a58809ad6fda");
  console.log(JSON.stringify({radix60:a,radix59:b},null,2));
}
if(require.main===module) run();
module.exports={run,numberFromDigits,minimalBigEndian,digitsFromBytes,signatures};
