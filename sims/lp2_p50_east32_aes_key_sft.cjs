"use strict";
/**
 * Original LP2 table east-column AES-256 test (Node.js 22, CommonJS).
 * The physically printed 32x8 table's rightmost 32 cells form a proposed
 * AES-256 key; the remaining 224 cells form 14 complete cipher blocks.
 * SFT: node sims/lp2_p50_east32_aes_key_sft.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
/** @param {Buffer} b @returns {string} */
const hash = b => crypto.createHash("sha256").update(b).digest("hex");
const source = Buffer.from(grid.bytes);
assert.equal(source.length, 256);
assert.equal(hash(source), "3b9b07d9a26e6d55c432d94d2661fdff3c2bdb23184a4b290");
assert.equal(corpus.pages.slice(0, 3).reduce((n, p) => n + p.indices.length, 0), 729);
const rows = Array.from({length: 32}, (_, r) => Array.from(source.subarray(8*r, 8*r+8)));
/** @param {number} column */
function split(column) {
  const key = Buffer.from(rows.map(row => row[column]));
  const rest = rows.map(row => row.filter((_, c) => c !== column));
  const row = Buffer.from(rest.flat());
  const col = Buffer.from(Array.from({length: 7}, (_, c) => rest.map(r => r[c])).flat());
  assert.equal(key.length, 32);
  assert.equal(row.length, 224);
  return {key, row, col};
}
/** @param {Buffer} bytes @param {Buffer} key @param {string} mode @param {Buffer|null} iv */
function inverse(bytes, key, mode, iv) {
  const d = crypto.createDecipheriv("aes-256-" + mode, key, iv);
  d.setAutoPadding(false);
  return Buffer.concat([d.update(bytes), d.final()]);
}
/** @param {Buffer} bytes */
function score(bytes) {
  let n=0, run=0, longest=0;
  for (const b of bytes) {
    if ((b>=32 && b<=126) || b===10 || b===13) n++;
    run=(b>=32 && b<=126)?run+1:0;
    longest=Math.max(longest,run);
  }
  const pad=bytes[bytes.length-1];
  const pkcs7=pad>=1 && pad<=16 && bytes.subarray(-pad).every(x=>x===pad);
  return {printable:n/bytes.length,longest,pkcs7};
}
// Authentic implementation-positive, separate from original ciphertext.
const plantKey=Buffer.from(Array.from({length:32},(_,i)=>i));
const plantIV=Buffer.from(Array.from({length:16},(_,i)=>i+16));
const plain=Buffer.alloc(224,65);
const enc=crypto.createCipheriv("aes-256-cbc",plantKey,plantIV);
enc.setAutoPadding(false);
assert.deepEqual(inverse(Buffer.concat([enc.update(plain),enc.final()]),plantKey,"cbc",plantIV),plain);

const trials=[];
for(const side of [7,0]) {
  const {key,row,col}=split(side);
  for(const reverse of [false,true]) {
    const k=reverse?Buffer.from(key).reverse():key;
    for(const [order,bytes] of [["rows",row],["columns",col]]) {
      const modes=[
        ["ECB","ecb",bytes,null],
        ["CBC-zero","cbc",bytes,Buffer.alloc(16)],
        ["CBC-first-IV","cbc",bytes.subarray(16),bytes.subarray(0,16)],
        ["CBC-last-IV","cbc",bytes.subarray(0,-16),bytes.subarray(-16)],
        ["CTR-zero","ctr",bytes,Buffer.alloc(16)]
      ];
      for(const [title,mode,cipher,iv] of modes) {
        const decoded=inverse(cipher,k,mode,iv);
        trials.push({side:side===7?"east":"west-control",reverse,order,mode:title,
          ...score(decoded),prefix:decoded.subarray(0,8).toString("hex")});
      }
    }
  }
}
assert.equal(trials.length,40);
assert.ok(trials.every(t=>t.printable<0.60 && !t.pkcs7 && t.longest<=12));
const {key,row}=split(7);
console.log(JSON.stringify({
  original_sha256:hash(source),east_key_hex:key.toString("hex"),
  east_key_sha256:hash(key),remaining224_sha256:hash(row),
  case_count:trials.length,pkcs7_count:trials.filter(t=>t.pkcs7).length,
  five_best:trials.sort((a,b)=>b.printable-a.printable).slice(0,5),
  synthetic_control:"224/224 byte AES-256 CBC decrypt matches planted source",
  verdict:"No readable plaintext for these source-fixed table/key operations."
},null,2));
