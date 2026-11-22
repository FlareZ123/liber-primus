"use strict";

/**
 * Source-selected LP2 causal-polynomial inverse followed by literal raw
 * DEFLATE transport. This extends the prior H/G/HG compressed-file test,
 * which checked headed gzip/zlib formats but did not decode raw DEFLATE.
 *
 * Input: original 55 rune-bearing LP2 physical pages and nine source
 * visual chapters. H = 2013 signed BASE29 example; G = p39 red rune triad.
 * Output: exact original results plus authentic compressed-text plants.
 *
 * SFT: node sims/lp2_dualfactor_raw_deflate_sft.cjs
 * Node.js 22 built-ins only. Read-only and deterministic.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
  "utf8"
));
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
const all = pages.flatMap(p => p.indices);
assert.equal(pages.length, 55);
assert.equal(all.length, 12956);
const cuts = [0, 729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
const units = [{label: "all", symbols: all}];
for (let i = 0; i < cuts.length - 1; i++) {
  units.push({label: "chapter" + i, symbols: all.slice(cuts[i], cuts[i + 1])});
}
for (const p of pages) units.push({label: "p" + p.page, symbols: p.indices});
assert.equal(units.length, 65);

/** @param {number} n */
const mod = n => ((n % 29) + 29) % 29;

/** @param {number} n */
function inverse(n) {
  for (let i = 1; i < 29; i++) if (mod(n * i) === 1) return i;
  throw new Error("Noninvertible GF29 source coefficient");
}

/** @param {number[]} data @param {number[]} taps */
function decode(data, taps) {
  const out = new Array(data.length);
  const inv = inverse(taps[0]);
  for (let i = 0; i < data.length; i++) {
    let x = data[i];
    for (let j = 1; j < taps.length && j <= i; j++) x -= taps[j] * out[i - j];
    out[i] = mod(x * inv);
  }
  return out;
}

/** @param {number[]} plain @param {number[]} taps */
function encode(plain, taps) {
  return plain.map((_, i) => {
    let v = 0;
    for (let j = 0; j < taps.length && j <= i; j++) v += taps[j] * plain[i - j];
    return mod(v);
  });
}

/** @param {number[]} symbols */
function toBytes(symbols) {
  let value = 0n;
  for (const rune of symbols) {
    assert(Number.isInteger(rune) && rune >= 0 && rune < 29);
    value = value * 29n + BigInt(rune);
  }
  if (value === 0n) return Buffer.alloc(0);
  let hex = value.toString(16);
  if (hex.length % 2) hex = "0" + hex;
  return Buffer.from(hex, "hex");
}

/** @param {Buffer} bytes */
function fromBytes(bytes) {
  let value = BigInt("0x" + bytes.toString("hex"));
  const out = [];
  while (value) {
    out.unshift(Number(value % 29n));
    value /= 29n;
  }
  return out;
}

/** @param {Buffer} bytes */
function proseQuality(bytes) {
  if (bytes.length < 64) return false;
  let readable = 0;
  for (const b of bytes) {
    if ((b >= 32 && b <= 126) || b === 9 || b === 10 || b === 13) readable++;
  }
  if (readable / bytes.length < 0.85) return false;
  const text = bytes.toString("latin1").toUpperCase();
  const words = new Set(text.match(/[A-Z]+/g) || []);
  return ["THE","AND","YOU","OUR","WITH","THIS","FROM"].some(w => words.has(w));
}


/**
 * Decode complete RFC4880 packets from the *first* byte, without guessed
 * offsets. Reject implicit old-format EOF lengths because they are not
 * self-delimiting and would accept random data as arbitrary packets.
 * We parse packet framing and extract literal text, including ZIP/ZLIB
 * compressed literal packets. Other well-framed packet types are recorded.
 * @param {Buffer} bytes
 * @param {number} level
 * @returns {object|null}
 */
function parseOpenPGP(bytes, level = 0) {
  if (!bytes.length || level > 3) return null;
  const recognized = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 17, 18, 19]);
  const packets = [];
  let offset = 0;
  let literal = null;
  while (offset < bytes.length) {
    const header = bytes[offset++];
    if ((header & 0x80) === 0) return null;
    const fresh = (header & 0x40) !== 0;
    const tag = fresh ? header & 63 : (header >> 2) & 15;
    if (!recognized.has(tag)) return null;
    const oldType = header & 3;
    if (!fresh && oldType === 3) return null;
    let body, n;
    if (fresh) {
      const chunks = [];
      let first = true;
      do {
        if (offset >= bytes.length) return null;
        let a = bytes[offset++];
        let partial = a >= 224 && a < 255;
        if (a < 192) n = a;
        else if (a < 224) {
          if (offset >= bytes.length) return null;
          n = ((a - 192) << 8) + bytes[offset++] + 192;
        } else if (a < 255) n = 1 << (a & 31);
        else {
          if (offset + 4 > bytes.length) return null;
          n = bytes.readUInt32BE(offset);
          offset += 4;
        }
        if (first && partial && (n < 512 || ![8, 9, 11, 18].includes(tag))) return null;
        first = false;
        if (n > bytes.length - offset) return null;
        chunks.push(bytes.subarray(offset, offset + n));
        offset += n;
        if (!partial) break;
      } while (true);
      body = Buffer.concat(chunks);
    } else {
      if (oldType === 0) {
        if (offset >= bytes.length) return null;
        n = bytes[offset++];
      } else if (oldType === 1) {
        if (offset + 2 > bytes.length) return null;
        n = bytes.readUInt16BE(offset);
        offset += 2;
      } else {
        if (offset + 4 > bytes.length) return null;
        n = bytes.readUInt32BE(offset);
        offset += 4;
      }
      if (n > bytes.length - offset) return null;
      body = bytes.subarray(offset, offset + n);
      offset += n;
    }
    packets.push({tag, length: body.length});
    if (tag === 10 && !body.equals(Buffer.from("PGP"))) return null;
    if (tag === 11) {
      if (body.length < 6 || ![98, 116, 117].includes(body[0])) return null;
      const nameLength = body[1];
      if (body.length < nameLength + 6) return null;
      const content = body.subarray(nameLength + 6);
      literal = {
        bytes: content.length, readable: proseQuality(content),
        hexPrefix: content.subarray(0, 48).toString("hex"),
        textPrefix: content.subarray(0, 125).toString("latin1")
      };
    }
    if (tag === 8) {
      if (body.length < 2 || body[0] > 3) return null;
      let decoded;
      if (body[0] === 0) decoded = body.subarray(1);
      else if (body[0] === 1 || body[0] === 2) {
        try {
          decoded = body[0] === 1 ?
            zlib.inflateRawSync(body.subarray(1), {maxOutputLength: 1048576}) :
            zlib.inflateSync(body.subarray(1), {maxOutputLength: 1048576});
        } catch (_) { return null; }
      } else {
        packets.push({tag: "bzip2-compressed-body-not-natively-decoded"});
        continue;
      }
      const inner = parseOpenPGP(decoded, level + 1);
      if (!inner) return null;
      if (inner.literal) literal = inner.literal;
      packets.push({tag: "nested", packets: inner.packets});
    }
  }
  return {packets, literal};
}

/**
 * Construct valid definite-length RFC4880 old/new packet headers for
 * source-authentic literal/compressed native text positive controls.
 * @param {number} tag
 * @param {Buffer} body
 * @param {boolean} old
 */
function makePacket(tag, body, old = false) {
  if (old) {
    assert(tag <= 15 && body.length < 256);
    return Buffer.concat([Buffer.from([0x80 | (tag << 2), body.length]), body]);
  }
  if (body.length < 192)
    return Buffer.concat([Buffer.from([0xC0 | tag, body.length]), body]);
  if (body.length <= 8383) {
    const v = body.length - 192;
    return Buffer.concat([Buffer.from([0xC0 | tag, 192 + (v >> 8), v & 255]), body]);
  }
  const h = Buffer.from([0xC0 | tag, 255, 0, 0, 0, 0]);
  h.writeUInt32BE(body.length, 2);
  return Buffer.concat([h, body]);
}

const directions = [
  ["H", [3, 26, 24]],
  ["Hr", [24, 26, 3]],
  ["G", [27, 5, 15]],
  ["Gr", [15, 5, 27]],
  ["HG", [23, 21, 11, 17, 12]],
  ["HGr", [12, 17, 11, 21, 23]]
];
const digestTarget = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
const summary = {models: 0, rawInflates: [], pgpZipInflates: [], actualProse: [],
  digestMatches: [], pgpPacketMatches: [], positiveRawPlants: 0, positivePgpZipPlants: 0, positivePgpPacketPlants: 0};
for (const [name, taps] of directions) {
  for (const unit of units) {
    const candidate = decode(unit.symbols, taps);
    assert.deepEqual(encode(candidate, taps), unit.symbols);
    const bytes = toBytes(candidate);
    summary.models++;
    const pgp = parseOpenPGP(bytes);
    if (pgp) summary.pgpPacketMatches.push({
      key: name, unit: unit.label, packets: pgp.packets, literal: pgp.literal
    });
    const kinds = [["raw", bytes]];
    // RFC 4880 ZIP compressed packet body: algorithm octet 1, then
    // raw DEFLATE. No discretionary skip offsets.
    if (bytes[0] === 1) kinds.push(["pgp-zip-body", bytes.subarray(1)]);
    for (const [kind, input] of kinds) {
      try {
        const out = zlib.inflateRawSync(input, {maxOutputLength: 1048576});
        const item = {key: name, unit: unit.label, bytesIn: input.length,
          bytesOut: out.length, prefix: out.subarray(0, 70).toString("hex")};
        if (kind === "raw") summary.rawInflates.push(item);
        else summary.pgpZipInflates.push(item);
        if (proseQuality(out)) summary.actualProse.push({
          ...item, textPrefix: out.subarray(0, 180).toString("latin1")
        });
        for (const algorithm of ["sha512", "sha3-512", "blake2b512"]) {
          if (crypto.createHash(algorithm).update(out).digest("hex") === digestTarget)
            summary.digestMatches.push({key: name, unit: unit.label, kind, algorithm});
        }
      } catch (err) {
        assert(err instanceof Error);
      }
    }
  }

  // Actual solved p57 vocabulary, compressed as true RFC1951 DEFLATE.
  const prose = Buffer.from(
    "LIKE THE INSTAR TUNNELING TO THE SURFACE. " +
    "WE MUST SHED OUR OWN CIRCUMFERENCES. " +
    "FIND THE DIVINITY WITHIN AND EMERGE.",
    "utf8"
  );
  const compressed = zlib.deflateRawSync(prose);
  const digitSource = fromBytes(compressed);
  assert(digitSource.length < 200);
  const plant = Array(200 - digitSource.length).fill(0).concat(digitSource);
  const recovered = toBytes(decode(encode(plant, taps), taps));
  assert.deepEqual(zlib.inflateRawSync(recovered), prose);
  summary.positiveRawPlants++;
  const pgpZipBody = Buffer.concat([Buffer.from([1]), compressed]);
  const pgpDigits = fromBytes(pgpZipBody);
  assert(pgpDigits.length < 200);
  const pgpPlant = Array(200 - pgpDigits.length).fill(0).concat(pgpDigits);
  const recoveredPgp = toBytes(decode(encode(pgpPlant, taps), taps));
  assert.equal(recoveredPgp[0], 1);
  assert.deepEqual(zlib.inflateRawSync(recoveredPgp.subarray(1)), prose);
  summary.positivePgpZipPlants++;

  // A complete RFC4880 compressed OpenPGP message containing a literal
  // text packet. Verify both old- and new-format packet framing.
  for (const old of [false, true]) {
    const literalBody = Buffer.concat([Buffer.from([98, 0, 0, 0, 0, 0]), prose]);
    const inner = makePacket(11, literalBody, old);
    const compressedPacket = makePacket(8,
      Buffer.concat([Buffer.from([1]), zlib.deflateRawSync(inner)]), old);
    const digits = fromBytes(compressedPacket);
    assert(digits.length < 250);
    const encoded = encode(Array(250 - digits.length).fill(0).concat(digits), taps);
    const decodedBytes = toBytes(decode(encoded, taps));
    const found = parseOpenPGP(decodedBytes);
    assert(found && found.literal);
    assert(found.literal.readable);
    assert.equal(found.literal.bytes, prose.length);
    assert.equal(found.literal.textPrefix, prose.toString("utf8").slice(0, 125));
    summary.positivePgpPacketPlants++;
  }
}
assert.equal(summary.models, 390);
assert.equal(summary.positiveRawPlants, 6);
assert.equal(summary.positivePgpZipPlants, 6);
assert.equal(summary.positivePgpPacketPlants, 12);
console.log(JSON.stringify({
  model: "source causal H/G/HG -> GP29 integer -> RFC1951 raw DEFLATE",
  status: summary.actualProse.length ? "PLAINTEXT CANDIDATE REQUIRES VERIFICATION" : "no qualifying original plaintext",
  ...summary
}, null, 2));
if (summary.actualProse.length || summary.pgpPacketMatches.some(p => p.literal?.readable)) process.exitCode = 2;
