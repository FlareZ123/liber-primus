"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p));
const ascii = read("resources/historical/cicada2016-4gq25-outguess.asc").toString("ascii");
const jpeg = read("resources/historical/cicada2016-4gq25.jpg");
const sha256 = b => crypto.createHash("sha256").update(b).digest("hex");
const encoded = ascii.split("-----BEGIN PGP SIGNATURE-----")[1].split("-----END PGP SIGNATURE-----")[0]
  .split(/\r?\n/).filter(x => x.length > 10 && /^[A-Za-z0-9+/]+={0,2}$/.test(x)).join("");
const raw = Buffer.from(encoded, "base64");
assert.equal(raw.length, 543);
assert.equal(raw[0], 0x89);
assert.equal(raw.readUInt16BE(1), 540);
const body = raw.subarray(3);
let p = 0;
const version = body[p++], signatureType = body[p++], publicKeyAlgorithm = body[p++], hashAlgorithm = body[p++];
const hashedSize = body.readUInt16BE(p); p += 2;
const hashedBytes = body.subarray(p, p + hashedSize); p += hashedSize;
const unhashedSize = body.readUInt16BE(p); p += 2;
const unhashedBytes = body.subarray(p, p + unhashedSize); p += unhashedSize;
const digestPrefix = body.subarray(p, p + 2).toString("hex"); p += 2;
const rsaSignatureBits = body.readUInt16BE(p); p += 2;
assert.equal(p + Math.ceil(rsaSignatureBits / 8), body.length);
/** @param {Buffer} bytes */
function subpackets(bytes) {
  let j = 0;
  const out = [];
  while (j < bytes.length) {
    let n = bytes[j++];
    if (n >= 192 && n < 255) { n = (n - 192) * 256 + bytes[j++] + 192; }
    else if (n === 255) { n = bytes.readUInt32BE(j); j += 4; }
    assert(n > 0 && j + n <= bytes.length);
    const flag = bytes[j++];
    out.push({type:flag & 127,critical:!!(flag & 128),hex:bytes.subarray(j,j+n-1).toString("hex")});
    j += n - 1;
  }
  assert.equal(j, bytes.length);
  return out;
}
const hashed = subpackets(hashedBytes), unhashed = subpackets(unhashedBytes);
assert.deepEqual(hashed.map(x => x.type), [2]);
assert.deepEqual(unhashed.map(x => x.type), [16]);

// Standard JPEG marker walk, keeping the original binary untouched.
// Scan entropy-coded data to the next unstuffed marker; restart markers have no payload.
assert.equal(jpeg[0], 255); assert.equal(jpeg[1], 216);
let i = 2, eoi = -1;
const segments = [];
while (i < jpeg.length) {
  assert.equal(jpeg[i++], 255, "expected marker introducer at " + (i - 1));
  while (jpeg[i] === 255) i++;
  const marker = jpeg[i++];
  if (marker === 217) { eoi = i; break; }
  if (marker === 216 || marker === 1 || (marker >= 208 && marker <= 215)) continue;
  const n = jpeg.readUInt16BE(i);
  assert(n >= 2 && i + n <= jpeg.length);
  const data = jpeg.subarray(i + 2, i + n);
  const entry = {marker:marker.toString(16).padStart(2,"0"),offset:i-2,bytes:n-2};
  if (marker >= 224 && marker <= 239 || marker === 254) {
    entry.payloadPrefixAscii = data.subarray(0,32).toString("latin1").replace(/[^\x20-\x7e]/g,".");
    entry.payloadPrefixHex = data.subarray(0,32).toString("hex");
    entry.sha256 = sha256(data);
  }
  if ([192,193,194].includes(marker)) {
    entry.imageHeight = data.readUInt16BE(1);
    entry.imageWidth = data.readUInt16BE(3);
  }
  segments.push(entry);
  i += n;
  if (marker === 218) {
    while (i < jpeg.length - 1) {
      if (jpeg[i++] !== 255) continue;
      while (jpeg[i] === 255) i++;
      if (jpeg[i] === 0 || jpeg[i] >= 208 && jpeg[i] <= 215) { i++; continue; }
      i--;
      break;
    }
  }
}
assert(eoi >= 0, "no JPEG EOI");
const report = {
  signed: {
    sha256: sha256(Buffer.from(ascii, "ascii")), bytes: ascii.length,
    signaturePacketBytes: raw.length, version, signatureType, publicKeyAlgorithm, hashAlgorithm,
    hashedSubpackets: hashed, unhashedSubpackets: unhashed,
    creationUTC: new Date(parseInt(hashed[0].hex,16) * 1000).toISOString(),
    issuerKeyID: unhashed[0].hex, digestPrefix, rsaSignatureBits,
    notationSubpackets: [...hashed,...unhashed].filter(x => x.type === 20),
  },
  image: {
    sha256: sha256(jpeg), bytes: jpeg.length, markers: segments,
    eoi, trailingBytes: jpeg.length-eoi, trailingSHA256:sha256(jpeg.subarray(eoi))
  }
};
console.log(JSON.stringify(report,null,2));
