"use strict";

/**
 * Original Cicada PGP signature-subpacket source gate.
 * Inspects the hashed and unhashed subpackets a 2012–2017 player could read
 * with gpg --list-packets, including private notation, policy URI and unknown
 * types, without guessing a password or rewriting any signed source bytes.
 *
 * SFT: node sims/lp2_cicada_original_pgp_subpackets_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const resourceRoot = path.join(root, "resources");
const paths = fs.readdirSync(resourceRoot, { recursive: true })
  .filter((name) => typeof name === "string" && name.endsWith(".asc"))
  .sort();

/** @param {Buffer} bytes @param {number} offset */
function read16(bytes, offset) {
  assert(offset + 2 <= bytes.length, "truncated 16-bit length");
  return bytes.readUInt16BE(offset);
}

/**
 * @param {Buffer} bytes
 * @returns {Array<{type:number,critical:boolean,length:number,hex:string,text?:string,notation?:string,notationValue?:string}>}
 */
function parseSubpackets(bytes) {
  const result = [];
  let p = 0;
  while (p < bytes.length) {
    const marker = bytes[p++];
    let length;
    if (marker < 192) length = marker;
    else if (marker < 224) {
      assert(p < bytes.length, "truncated 2-octet subpacket length");
      length = (marker - 192) * 256 + bytes[p++] + 192;
    } else if (marker === 255) {
      assert(p + 4 <= bytes.length, "truncated 5-octet subpacket length");
      length = bytes.readUInt32BE(p);
      p += 4;
    } else {
      throw Error("unexpected partial-length encoding in signature subpacket");
    }
    assert(length >= 1 && p + length <= bytes.length, "malformed signature subpacket");
    const header = bytes[p++];
    const value = bytes.subarray(p, p + length - 1);
    p += length - 1;
    const item = {
      type: header & 127,
      critical: Boolean(header & 128),
      length,
      hex: value.toString("hex")
    };
    if (item.type === 20) {
      assert(value.length >= 8, "truncated signature notation");
      const nameLength = read16(value, 4);
      const valueLength = read16(value, 6);
      assert(8 + nameLength + valueLength === value.length, "bad notation lengths");
      item.notation = value.subarray(8, 8 + nameLength).toString("utf8");
      item.notationValue = value.subarray(8 + nameLength).toString("utf8");
    } else if ([24, 26, 28].includes(item.type)) {
      item.text = value.toString("utf8");
    }
    result.push(item);
  }
  return result;
}

/**
 * @param {Buffer} bytes OpenPGP armor-decoded packet stream
 */
function signatures(bytes) {
  const sigs = [];
  let p = 0;
  while (p < bytes.length) {
    const header = bytes[p++];
    assert(header & 128, "packet header not OpenPGP");
    const modern = Boolean(header & 64);
    const tag = modern ? header & 63 : (header >> 2) & 15;
    let length;
    if (modern) {
      const n = bytes[p++];
      if (n < 192) length = n;
      else if (n < 224) length = (n - 192) * 256 + bytes[p++] + 192;
      else if (n === 255) {
        assert(p + 4 <= bytes.length, "truncated new packet length");
        length = bytes.readUInt32BE(p);
        p += 4;
      } else throw Error("unexpected partial packet in OpenPGP signature armor");
    } else {
      const n = header & 3;
      if (n === 0) length = bytes[p++];
      else if (n === 1) {
        length = read16(bytes, p);
        p += 2;
      } else if (n === 2) {
        assert(p + 4 <= bytes.length, "truncated old packet length");
        length = bytes.readUInt32BE(p);
        p += 4;
      } else length = bytes.length - p;
    }
    assert(length >= 1 && p + length <= bytes.length, "malformed OpenPGP packet");
    const packet = bytes.subarray(p, p + length);
    p += length;
    if (tag !== 2) continue;
    assert(packet[0] === 4, "unexpected non-v4 original signature format");
    const hashedLength = read16(packet, 4);
    assert(6 + hashedLength + 2 <= packet.length, "truncated hashed subpacket data");
    const hashed = parseSubpackets(packet.subarray(6, 6 + hashedLength));
    const uPos = 6 + hashedLength;
    const unhashedLength = read16(packet, uPos);
    assert(uPos + 2 + unhashedLength + 2 <= packet.length, "truncated unhashed subpacket data");
    const unhashed = parseSubpackets(packet.subarray(uPos + 2, uPos + 2 + unhashedLength));
    sigs.push({ version: packet[0], signatureType: packet[1],
      publicKeyAlgorithm: packet[2], hashAlgorithm: packet[3], hashed, unhashed });
  }
  return sigs;
}

/** @param {string} text */
function signatureBlocks(text) {
  const blocks = [...text.matchAll(/-----BEGIN PGP SIGNATURE-----([\s\S]*?)-----END PGP SIGNATURE-----/g)];
  return blocks.map((match) => {
    const lines = match[1].split(/\r?\n/).map((line) => line.trim());
    const separator = lines.indexOf("");
    assert(separator >= 0, "missing signature armor header separator");
    const b64 = lines.slice(separator + 1)
      .filter((line) => /^[A-Za-z0-9+/]{4,}={0,2}$/.test(line))
      .join("");
    assert(b64.length > 0, "missing signature armor base64");
    return Buffer.from(b64, "base64");
  });
}

// A synthetic v4 signature subpacket with private notation proves the parser
// finds an actual payload. This is deliberately not asserted to be Cicada's.
const notationName = Buffer.from("research.example", "ascii");
const notationValue = Buffer.from("SOURCE-DERIVED-KEY", "ascii");
const note = Buffer.alloc(8 + notationName.length + notationValue.length);
note.writeUInt16BE(notationName.length, 4);
note.writeUInt16BE(notationValue.length, 6);
notationName.copy(note, 8);
notationValue.copy(note, 8 + notationName.length);
const notePacket = Buffer.concat([Buffer.from([note.length + 1, 20]), note]);
const sigBody = Buffer.concat([
  Buffer.from([4, 1, 1, 2, 0, notePacket.length]),
  notePacket,
  Buffer.from([0, 0, 0, 0])
]);
const planted = signatures(Buffer.concat([
  Buffer.from([0x89, sigBody.length >> 8, sigBody.length & 255]), sigBody
]));
assert.equal(planted[0].hashed[0].notation, "research.example");
assert.equal(planted[0].hashed[0].notationValue, "SOURCE-DERIVED-KEY");
console.log("POSITIVE: synthetic version-4 notation name and value recovered exactly");

const records = [];
const special = [];
const benign = new Set([2, 3, 4, 5, 6, 7, 9, 11, 12, 16, 21, 22, 23, 25, 27, 30, 32, 33]);
for (const name of paths) {
  const full = path.join(resourceRoot, name);
  if (!fs.statSync(full).isFile()) continue;
  const raw = fs.readFileSync(full, "utf8");
  const blocks = signatureBlocks(raw);
  let count = 0;
  for (const block of blocks) {
    for (const item of signatures(block)) {
      count++;
      const sub = [...item.hashed, ...item.unhashed];
      records.push({
        file: name.replaceAll("\\", "/"),
        hashAlgorithm: item.hashAlgorithm,
        hashed: item.hashed.map((s) => s.type),
        unhashed: item.unhashed.map((s) => s.type)
      });
      for (const s of sub) {
        if (!benign.has(s.type)) {
          special.push({ file: name, type: s.type, critical: s.critical,
            notation: s.notation, notationValue: s.notationValue, text: s.text, hex: s.hex });
        }
      }
    }
  }
  if (blocks.length > 0) assert(count > 0, "unparsed original PGP signature in " + name);
  console.log("SOURCE " + name.replaceAll("\\", "/") + " armor=" + blocks.length +
    " signatures=" + count);
}
assert(records.length >= 15, "source corpus unexpectedly incomplete");
console.log("SIGNATURE_TYPES " + JSON.stringify(records));
console.log("SPECIAL_SUBPACKETS " + JSON.stringify(special));
console.log("FINAL " + JSON.stringify({
  ascFiles: paths.length, signedPackets: records.length,
  specialSubpackets: special.length
}));
