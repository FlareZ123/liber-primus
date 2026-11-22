"use strict";

/**
 * Source-fixed original LP2 p15 16xuint16 AES-256 candidate key versus
 * source pp49-51 256-byte grid. Distinguishes structured binary payloads
 * from random-looking outputs which fail earlier direct GP/ASCII tests.
 * Node.js 22 CommonJS SFT; read-only, deterministic.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const root = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "base60-grid.json"), "utf8"));
const original = Buffer.from(grid.byte_rows.flat());
assert.equal(original.length, 256);
const hash = buffer => crypto.createHash("sha256").update(buffer).digest("hex");
assert.equal(hash(original),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const square = [
  3258,3222,3152,3038,3278,3299,3298,2838,
  3288,3294,3296,2472,4516,1206,708,1820
];
const spiralOrder = [5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12];
const layouts = ["row", "reverse", "column"];
const modes = ["ecb", "cbc", "ctr"];

/** @param {number[]} values @param {"BE"|"LE"} endian */
function uint16Key(values, endian) {
  const out = Buffer.alloc(32);
  for (let i = 0; i < 16; i++) {
    if (endian === "BE") out.writeUInt16BE(values[i], 2*i);
    else out.writeUInt16LE(values[i], 2*i);
  }
  return out;
}

/** @param {Buffer} bytes @param {string} order */
function tableOrder(bytes, order) {
  if (order === "row") return Buffer.from(bytes);
  if (order === "reverse") return Buffer.from(bytes).reverse();
  const out = Buffer.alloc(256);
  for (let i = 0; i < 256; i++) out[i] = bytes[(i%32)*8+Math.floor(i/32)];
  return out;
}

/** @param {Buffer} source @param {Buffer} key @param {string} mode @param {boolean} decrypt */
function aes(source, key, mode, decrypt) {
  const iv = mode === "ecb" ? null : Buffer.alloc(16);
  const engine = (decrypt ? crypto.createDecipheriv : crypto.createCipheriv)(
    "aes-256-"+mode, key, iv);
  engine.setAutoPadding(false);
  return Buffer.concat([engine.update(source), engine.final()]);
}

/** @param {Buffer} buffer */
function printable(buffer) {
  if (buffer.length < 50) return false;
  let good = 0;
  for (const b of buffer) if ((b >= 32 && b <= 126) ||
    b === 9 || b === 10 || b === 13) good++;
  return good/buffer.length >= .85;
}

/**
 * Strict byte-zero *complete* OpenPGP packet stream; literal data must
 * contain at least 50 mostly readable bytes. Recognizes new/old definite
 * packet bodies, compressed literal packets, and normal signature envelope
 * tags; rejects guessed prefix/trailer, partial and indeterminate lengths.
 * @param {Buffer} data
 * @param {number} depth
 * @returns {Buffer|null}
 */
function openPgpText(data, depth = 0) {
  if (!data.length || depth > 3) return null;
  let p = 0, found = null;
  while (p < data.length) {
    const header = data[p++];
    if (!(header & 0x80)) return null;
    const isNew = !!(header & 0x40);
    const tag = isNew ? header & 63 : (header >> 2) & 15;
    if (![1,2,3,4,5,6,7,8,9,10,11,13,14,17,18,19].includes(tag))
      return null;
    let size;
    if (isNew) {
      if (p >= data.length) return null;
      const a = data[p++];
      if (a < 192) size = a;
      else if (a < 224) {
        if (p >= data.length) return null;
        size = ((a - 192) << 8) + data[p++] + 192;
      } else if (a === 255) {
        if (p+4 > data.length) return null;
        size = data.readUInt32BE(p);
        p += 4;
      } else return null;
    } else {
      const type = header & 3;
      if (type === 3) return null;
      const len = [1,2,4][type];
      if (p+len > data.length) return null;
      size = len === 1 ? data[p] : len === 2 ?
        data.readUInt16BE(p) : data.readUInt32BE(p);
      p += len;
    }
    if (size > data.length - p) return null;
    const body = data.subarray(p, p+size);
    p += size;
    if (tag === 10 && !body.equals(Buffer.from("PGP"))) return null;
    if (tag === 11) {
      if (body.length < 6 || ![98,116,117].includes(body[0])) return null;
      const start = 6+body[1];
      if (start > body.length) return null;
      const text = body.subarray(start);
      if (printable(text)) found = text;
    }
    if (tag === 8) {
      if (body.length < 2) return null;
      let payload;
      if (body[0] === 0) payload = body.subarray(1);
      else if (body[0] === 1 || body[0] === 2) {
        try {
          const options = {maxOutputLength: 1048576, info: true};
          const result = body[0] === 1 ?
            zlib.inflateRawSync(body.subarray(1), options) :
            zlib.inflateSync(body.subarray(1), options);
          if (result.engine.bytesWritten !== body.length-1) return null;
          payload = result.buffer;
        } catch (error) {
          assert(error instanceof Error);
          return null;
        }
      } else return null;
      const inner = openPgpText(payload, depth+1);
      if (inner) found = inner;
    }
  }
  return found;
}

/** @param {Buffer} data @param {"raw"|"gzip"|"zlib"} format */
function decompressExact(data, format) {
  try {
    const option = {maxOutputLength: 1048576, info: true};
    const result = format === "raw" ? zlib.inflateRawSync(data, option)
      : format === "gzip" ? zlib.gunzipSync(data, option)
      : zlib.inflateSync(data, option);
    if (result.engine.bytesWritten !== data.length) return null;
    if (!printable(result.buffer)) return null;
    return result.buffer;
  } catch (error) {
    assert(error instanceof Error);
    return null;
  }
}

/** @param {Buffer} body @param {number} tag */
function packet(body, tag) {
  assert(body.length <= 8383);
  if (body.length < 192)
    return Buffer.concat([Buffer.from([0xc0|tag, body.length]), body]);
  const n = body.length-192;
  return Buffer.concat([Buffer.from([0xc0|tag,192+(n>>8),n&255]),body]);
}

const originalHits = [];
let models = 0, positive = 0;
for (const source of ["raw","difference"]) {
  for (const order of ["printed","spiral"]) {
    const values=(order === "printed" ? square : spiralOrder.map(i=>square[i]))
      .map(n=>source === "raw"?n:Math.abs(3301-n));
    for (const endian of ["BE","LE"]) {
      const key=uint16Key(values,endian);
      for (const orientation of layouts) {
        const sourceBytes=tableOrder(original,orientation);
        for (const mode of modes) {
          const plain=aes(sourceBytes,key,mode,true);
          assert(aes(plain,key,mode,false).equals(sourceBytes));
          models++;
          const name=[source,order,endian,orientation,mode].join("/");
          const pgp=openPgpText(plain);
          if (pgp) originalHits.push({name,kind:"PGP",text:pgp.toString("latin1").slice(0,80)});
          for (const format of ["raw","gzip","zlib"]) {
            const decompressed=decompressExact(plain,format);
            if (decompressed)
              originalHits.push({name,kind:format,text:decompressed.toString("latin1").slice(0,80)});
          }
        }
      }
    }
  }
}
assert.equal(models,72);

// Authentic solved p57 text, embedded inside a *complete* 256-byte
// source-key PGP literal packet, rather than a toy printable prefix.
const authentic=Buffer.from(
  "LIKE THE INSTAR TUNNELING TO THE SURFACE. WE MUST SHED OUR OWN " +
  "CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE.","utf8");
const literalBody=Buffer.concat([
  Buffer.from([98,0,0,0,0,0]),
  Buffer.from((authentic.toString("utf8")+" ").repeat(3).slice(0,247),"utf8")
]);
assert.equal(literalBody.length,253);
const pgpMessage=packet(literalBody,11);
assert.equal(pgpMessage.length,256);
assert(openPgpText(pgpMessage).subarray(0,authentic.length).equals(authentic));
const key=uint16Key(square,"BE");
for (const mode of modes) {
  const ciphertext=aes(pgpMessage,key,mode,false);
  const recovered=aes(ciphertext,key,mode,true);
  assert(openPgpText(recovered).subarray(0,authentic.length).equals(authentic));
  positive++;
}
assert.equal(positive,3);
console.log(JSON.stringify({
  originalTableSha256:hash(original),
  originalAESModels:models,
  completeByteZeroStructuredBinaryHits:originalHits,
  sourceKeyPGPAuthenticPositivePlants:positive,
  unknownPlaintextRecovered:originalHits.length
},null,2));
if(originalHits.length)process.exitCode=2;
