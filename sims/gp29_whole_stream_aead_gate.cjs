#!/usr/bin/env node
"use strict";

// Test one source-motivated binary representation: the complete LP2 rune stream
// interpreted as a base-29 integer in published Gematria Primus order. The
// resulting byte string is tested as [12-byte nonce | ciphertext | 16-byte tag]
// for AES-256-GCM and ChaCha20-Poly1305 under a finite, documented family of
// source-derived keys. No unconstrained password/KDF search is performed.

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
const readJSON = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const sha256 = (b) => crypto.createHash("sha256").update(b).digest();
const hex = (b) => b.toString("hex");

function base29Bytes(digits, padTo = 0) {
  let n = 0n;
  for (const d of digits) {
    if (!Number.isInteger(d) || d < 0 || d >= 29) throw new Error("invalid GP29 digit");
    n = n * 29n + BigInt(d);
  }
  let h = n.toString(16);
  if (h.length & 1) h = "0" + h;
  let out = Buffer.from(h, "hex");
  if (padTo) {
    if (out.length > padTo) throw new Error(`base29 integer exceeds ${padTo} bytes`);
    if (out.length < padTo) out = Buffer.concat([Buffer.alloc(padTo - out.length), out]);
  }
  return out;
}

function addKey(map, label, key) {
  key = Buffer.from(key);
  if (key.length !== 32) return;
  const id = key.toString("hex");
  if (!map.has(id)) map.set(id, { label, key });
}

function buildKeys() {
  const grid = readJSON("resources/liber-primus/base60-grid.json");
  const hidden = readJSON("resources/cicada-hiddenservice-256-candidates.json");
  const witness = readJSON("resources/cicada2014-anend-binary-witness.json");
  const corpus = readJSON("resources/liber-primus/lp2-corpus.json");
  const redSpan = readJSON("resources/liber-primus/lp2-page53-red-span.json");

  const rows = grid.byte_rows.map((r) => Buffer.from(r));
  const rowMajor = Buffer.concat(rows);
  const colMajor = Buffer.concat(Array.from({ length: 8 }, (_, c) =>
    Buffer.from(rows.map((r) => r[c]))
  ));
  const keyMap = new Map();

  // The 32-byte columns are the natural AES-256 slices of the 32x8 grid.
  for (let c = 0; c < 8; c++) {
    const col = Buffer.from(rows.map((r) => r[c]));
    addKey(keyMap, `base60-grid-column-${c + 1}`, col);
    addKey(keyMap, `base60-grid-column-${c + 1}-reversed`, Buffer.from(col).reverse());
  }
  addKey(keyMap, "sha256(base60-grid-row-major)", sha256(rowMajor));
  addKey(keyMap, "sha256(base60-grid-column-major)", sha256(colMajor));
  addKey(keyMap, "sha256(base60-grid-reversed)", sha256(Buffer.from(rowMajor).reverse()));

  // Historical 256-byte onion-service excerpts: aligned 32-byte chunks and
  // whole-source SHA-256 derivations only; no sliding-window key search.
  for (const service of hidden.sourceServices) {
    const raw = Buffer.from(service.hex, "hex");
    if (raw.length !== 256) continue;
    for (let i = 0; i < 8; i++) {
      const chunk = raw.subarray(i * 32, (i + 1) * 32);
      addKey(keyMap, `${service.id}-chunk-${i + 1}`, chunk);
      addKey(keyMap, `${service.id}-chunk-${i + 1}-reversed`, Buffer.from(chunk).reverse());
    }
    addKey(keyMap, `sha256(${service.id})`, sha256(raw));
    addKey(keyMap, `sha256(${service.id}-reversed)`, sha256(Buffer.from(raw).reverse()));
    addKey(keyMap, `sha256(grid||${service.id})`, sha256(Buffer.concat([rowMajor, raw])));
    addKey(keyMap, `sha256(${service.id}||grid)`, sha256(Buffer.concat([raw, rowMajor])));
  }

  // The AN END SHA-512 witness: natural 32-byte halves and whole-digest hashes.
  const digest = Buffer.from(witness.target_hex, "hex");
  if (digest.length !== 64) throw new Error("AN END witness is not 64 bytes");
  addKey(keyMap, "AN-END-digest-first32", digest.subarray(0, 32));
  addKey(keyMap, "AN-END-digest-last32", digest.subarray(32));
  addKey(keyMap, "AN-END-digest-first32-reversed", Buffer.from(digest.subarray(0, 32)).reverse());
  addKey(keyMap, "AN-END-digest-last32-reversed", Buffer.from(digest.subarray(32)).reverse());
  addKey(keyMap, "sha256(AN-END-digest)", sha256(digest));
  addKey(keyMap, "sha256(AN-END-digest-reversed)", sha256(Buffer.from(digest).reverse()));
  addKey(keyMap, "sha256(grid||AN-END-digest)", sha256(Buffer.concat([rowMajor, digest])));
  addKey(keyMap, "sha256(AN-END-digest||grid)", sha256(Buffer.concat([digest, rowMajor])));

  // The visually confirmed 51-rune red span on LP2 page 53, converted as
  // a base-29 integer and padded to 256 bits. Four simple orientations.
  const page53 = corpus.pages.find((p) => p.page === 53);
  const start = redSpan.red_text.start_rune_inclusive;
  const end = redSpan.red_text.end_rune_exclusive;
  const red = page53.indices.slice(start, end);
  if (red.length !== 51 || red.length !== redSpan.red_text.rune_count) {
    throw new Error("red-span source mismatch");
  }
  const redVariants = [
    ["red51-forward", red],
    ["red51-reversed", [...red].reverse()],
    ["red51-atbash", red.map((x) => 28 - x)],
    ["red51-atbash-reversed", [...red].reverse().map((x) => 28 - x)],
  ];
  for (const [label, ds] of redVariants) addKey(keyMap, label, base29Bytes(ds, 32));

  return { keys: [...keyMap.values()], sourceCounts: {
    gridColumns: 8,
    onionSources: hidden.sourceServices.length,
    redSpanRunes: red.length,
    digestBytes: digest.length,
  }};
}

function entropy(bytes) {
  const counts = new Array(256).fill(0);
  for (const b of bytes) counts[b]++;
  let h = 0;
  for (const n of counts) if (n) {
    const p = n / bytes.length;
    h -= p * Math.log2(p);
  }
  return h;
}

function decryptAead(algorithm, key, nonce, ciphertext, tag) {
  try {
    const d = crypto.createDecipheriv(algorithm, key, nonce, { authTagLength: 16 });
    d.setAuthTag(tag);
    return Buffer.concat([d.update(ciphertext), d.final()]);
  } catch (_) {
    return null;
  }
}

function testEnvelope(label, bytes, keys, hits) {
  if (bytes.length !== 7868) {
    return { label, length: bytes.length, compatible: false, attempts: 0, hits: 0 };
  }
  const nonce = bytes.subarray(0, 12);
  const ciphertext = bytes.subarray(12, bytes.length - 16);
  const tag = bytes.subarray(bytes.length - 16);
  let attempts = 0;
  for (const candidate of keys) {
    for (const algorithm of ["aes-256-gcm", "chacha20-poly1305"]) {
      attempts++;
      const plain = decryptAead(algorithm, candidate.key, nonce, ciphertext, tag);
      if (plain !== null) {
        const hit = {
          variant: label, algorithm, keyLabel: candidate.label,
          plaintextBytes: plain.length, plaintextHex: hex(plain),
          plaintextUtf8: plain.toString("utf8").slice(0, 500),
        };
        hits.push(hit);
      }
    }
  }
  return {
    label, length: bytes.length, compatible: true,
    nonceHex: hex(nonce), ciphertextBytes: ciphertext.length, tagHex: hex(tag),
    attempts, hits: hits.filter((h) => h.variant === label).length,
  };
}

function selfTest() {
  const key = crypto.randomBytes(32);
  const nonce = crypto.randomBytes(12);
  const plain = Buffer.from("Liber Primus AEAD positive control");
  const c = crypto.createCipheriv("aes-256-gcm", key, nonce, { authTagLength: 16 });
  const ciphertext = Buffer.concat([c.update(plain), c.final()]);
  const tag = c.getAuthTag();
  const back = decryptAead("aes-256-gcm", key, nonce, ciphertext, tag);
  if (!back || !back.equals(plain)) throw new Error("AES-GCM positive control failed");
  const cc = crypto.createCipheriv("chacha20-poly1305", key, nonce, { authTagLength: 16 });
  const cciphertext = Buffer.concat([cc.update(plain), cc.final()]);
  const ctag = cc.getAuthTag();
  const cback = decryptAead("chacha20-poly1305", key, nonce, cciphertext, ctag);
  if (!cback || !cback.equals(plain)) throw new Error("ChaCha20-Poly1305 positive control failed");
  return true;
}

function main() {
  selfTest();
  const corpus = readJSON("resources/liber-primus/lp2-corpus.json");
  const digits = corpus.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
  if (digits.length !== 12956) throw new Error(`unexpected LP2 rune count: ${digits.length}`);
  const natural = base29Bytes(digits);
  const variants = [
    ["GP29-big-endian", natural],
    ["GP29-reversed-stream", base29Bytes([...digits].reverse())],
    ["GP29-atbash", base29Bytes(digits.map((x) => 28 - x))],
    ["GP29-atbash-reversed", base29Bytes([...digits].reverse().map((x) => 28 - x))],
    ["GP29-little-endian-bytes", Buffer.from(natural).reverse()],
  ];
  const { keys, sourceCounts } = buildKeys();
  const hits = [];
  const tests = variants.map(([label, bytes]) => testEnvelope(label, bytes, keys, hits));
  const result = {
    schema: 1,
    method: "whole-stream GP29 integer -> big-endian bytes -> 12-byte nonce | ciphertext | 16-byte AEAD tag",
    inputRunes: digits.length,
    alphabetSize: 29,
    payloadBytes: natural.length,
    payloadSha256: hex(sha256(natural)),
    payloadEntropyBitsPerByte: entropy(natural),
    payloadFirst12Hex: hex(natural.subarray(0, 12)),
    payloadLast16Hex: hex(natural.subarray(-16)),
    candidateKeyCount: keys.length,
    sourceCounts,
    positiveControls: { aes256Gcm: "PASS", chacha20Poly1305: "PASS" },
    tests,
    totalAttempts: tests.reduce((s, x) => s + x.attempts, 0),
    hits,
    interpretation: hits.length
      ? "At least one source-derived key authenticated; inspect plaintext and independently reproduce."
      : "No authentication under this finite source-derived key family. This rejects only the tested envelope/key/orientation combinations, not arbitrary AEAD or other LP2 mechanisms.",
  };
  fs.mkdirSync(path.join(ROOT, "im-results"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "im-results/gp29-whole-stream-aead-gate.json"),
    JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result, null, 2));
}

main();
