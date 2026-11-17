"use strict";
/**
 * Source-locked OutGuess-0.4 calibration and one original p51 extraction.
 *
 * The only candidate password is the exact 72 printed characters from
 * p51 table cells 193..228. Before judging the original extraction, create
 * a three-component RGB JPEG from the original grayscale p51 pixels, embed
 * a known payload with the same native OutGuess build, and verify:
 *   1. correct-key extraction exactly recovers the planted payload;
 *   2. wrong-key extraction from that embedded carrier is recorded;
 *   3. correct-key extraction from the clean converted cover is recorded.
 * Then extract the untouched original p51 exactly once with the candidate key.
 *
 * OutGuess source is pinned by the companion manual workflow to commit
 * 24810e14327c2bbeedeaadd3e24491f2a4425c02 (historical 0.4 source).
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const {spawnSync} = require("node:child_process");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "outguess-grid36-source-results");
const OUTGUESS_SOURCE_COMMIT = "24810e14327c2bbeedeaadd3e24491f2a4425c02";
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
assert.deepEqual(grid.bytes.flatMap((n, i) => n === 0 ? [i] : []), [192, 229]);
const chosen = tokens.slice(193, 229);
assert.equal(chosen.length, 36);
assert.ok(chosen.every(x => x.length === 2));
const key = chosen.join("");
assert.equal(key.length, 72);
assert.equal(key, "2Z2d1T2u1t1j0l1o1E3T183E1G270L0v2t06111A2U4B1O2M3d2S0x0w0q0p2V180q1D492O");
const wrongKey = key.split("").reverse().join("");

function run(command, args, timeout = 120000) {
  const result = spawnSync(command, args, {
    encoding: "utf8", timeout, maxBuffer: 2 * 1024 * 1024
  });
  assert(!result.error, command + ": " + String(result.error));
  return result;
}
function sha(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
function writeAtomic(file, value) {
  const temp = file + "." + process.pid + ".tmp";
  fs.writeFileSync(temp, value, { flag: "wx" });
  fs.renameSync(temp, file);
}
function stats(bytes) {
  if (!bytes.length) {
    return {
      entropyBitsPerByte: null, printableAsciiFraction: null,
      distinctByteValues: 0, magic: []
    };
  }
  const counts = new Uint32Array(256);
  for (const b of bytes) counts[b]++;
  let entropy = 0;
  for (const n of counts) if (n) {
    const p = n / bytes.length;
    entropy -= p * Math.log2(p);
  }
  let printable = 0;
  for (const b of bytes) {
    if (b === 9 || b === 10 || b === 13 || (b >= 32 && b <= 126)) printable++;
  }
  const signatures = [
    ["PNG", "89504e470d0a1a0a"], ["JPEG", "ffd8ff"],
    ["GIF87a", "474946383761"], ["GIF89a", "474946383961"],
    ["ZIP", "504b0304"], ["GZIP", "1f8b08"], ["PDF", "255044462d"],
    ["PGP armor", "2d2d2d2d2d424547494e2050475020"],
    ["ELF", "7f454c46"], ["SQLite", "53514c69746520666f726d6174203300"],
    ["7z", "377abcaf271c"], ["RAR", "526172211a07"]
  ];
  const magic = signatures.filter(([, hex]) => {
    const sig = Buffer.from(hex, "hex");
    return bytes.subarray(0, sig.length).equals(sig);
  }).map(([name]) => name);
  return {
    entropyBitsPerByte: Number(entropy.toFixed(6)),
    printableAsciiFraction: Number((printable / bytes.length).toFixed(6)),
    distinctByteValues: counts.reduce((n, x) => n + (x ? 1 : 0), 0),
    magic
  };
}
function headerOf(text) {
  const match = /Steg retrieve:\s*seed:\s*(\d+),\s*len:\s*(\d+)/i.exec(text);
  return match ? { seed: Number(match[1]), len: Number(match[2]) } : null;
}
function classify(filePath, bytes) {
  if (!bytes.length) return { file: "no output file", openpgp: "not tested" };
  const file = run("file", ["-b", filePath]);
  const gpg = run("gpg", ["--batch", "--no-options", "--list-packets", filePath]);
  return {
    file: (file.stdout || file.stderr).trim(),
    openpgpExitCode: gpg.status,
    openpgpOutput: (gpg.stdout + "\n" + gpg.stderr).trim().slice(0, 1200)
  };
}
function extract(label, carrier, password) {
  const destination = path.join(output, label + ".bin");
  fs.rmSync(destination, { force: true });
  const args = password === null ? ["-r", carrier, destination] : ["-k", password, "-r", carrier, destination];
  const result = run("outguess", args);
  const bytes = fs.existsSync(destination) ? fs.readFileSync(destination) : Buffer.alloc(0);
  const transcript = result.stdout + "\n" + result.stderr;
  const header = headerOf(transcript);
  if (bytes.length && header) {
    // The native extractor's declared length is a framing field, not a checksum.
    // Preserve both values so the original and controls can be compared exactly.
  }
  return {
    exitCode: result.status,
    signal: result.signal,
    header,
    recoveredBytes: bytes.length,
    declaredLengthMatchesOutput: header ? header.len === bytes.length : null,
    prefixHex: bytes.subarray(0, 64).toString("hex"),
    payloadSha256: bytes.length ? sha(bytes) : null,
    stats: stats(bytes),
    classification: classify(destination, bytes),
    stdout: result.stdout.slice(0, 1200),
    stderr: result.stderr.slice(0, 1200),
    bytes
  };
}
function main() {
  fs.mkdirSync(output, { recursive: true });
  const lock = path.join(output, ".lock");
  const lockFd = fs.openSync(lock, "wx");
  const originalJpg = path.join(root, "resources/liber-primus/68.jpg");
  const convertedJpg = path.join(output, "p51-grayscale-as-rgb-clean-cover.jpg");
  const embeddedJpg = path.join(output, "p51-grayscale-as-rgb-embedded-positive.jpg");
  const expectedPath = path.join(output, "known-positive-expected.bin");
  const scratchPath = path.join(output, "known-positive-recovered.bin");
  const priorJpg = path.join(root, "resources/historical/cicada2016-4gq25.jpg");
  const priorPayload = path.join(root, "resources/historical/cicada2016-4gq25-outguess.asc");
  const originalHashBefore = sha(fs.readFileSync(originalJpg));
  try {
    const historical = extract("historical-signed-2016-positive", priorJpg, null);
    assert.equal(historical.exitCode, 0, historical.stderr);
    assert.deepEqual(historical.bytes, fs.readFileSync(priorPayload));
    fs.rmSync(path.join(output, "historical-signed-2016-positive.bin"), { force: true });

    // Convert the unchanged original p51 grayscale pixels to a 3-component
    // RGB JPEG. Dimensions, nominal 400 dpi and neutral grayscale content stay fixed.
    const conversion = run("magick", [
      originalJpg, "-colorspace", "sRGB", "-type", "TrueColor",
      "-sampling-factor", "2x2", "-quality", "92",
      "-units", "PixelsPerInch", "-density", "400x400", convertedJpg
    ]);
    assert.equal(conversion.status, 0, conversion.stderr);
    const identify = run("identify", [
      "-format", "%w %h %[colorspace] %[channels] %x %y", convertedJpg
    ]);
    assert.equal(identify.status, 0, identify.stderr);
    const jpegFile = run("file", ["-b", convertedJpg]);
    const jpegDescription = (jpegFile.stdout || jpegFile.stderr).trim();
    assert.match(jpegDescription, /2400x3600/i);
    assert.match(jpegDescription, /components 3/i);
    assert.match(identify.stdout, /^2400 3600 sRGB/i);
    assert.match(identify.stdout, /400 400$/);
    const convertedHash = sha(fs.readFileSync(convertedJpg));

    // A short, fixed, unmistakably typed test object is embedded with the
    // exact candidate key using the same native OutGuess binary.
    const expected = Buffer.from(
      "LP2-GRID36-OUTGUESS-CALIBRATION-v1\n" +
      "This payload is a known positive control, not a Liber Primus claim.\n" +
      "sha256 framing is checked by exact byte equality.\n", "ascii");
    writeAtomic(expectedPath, expected);
    const embed = run("outguess", [
      "-k", key, "-d", expectedPath, convertedJpg, embeddedJpg
    ]);
    assert.equal(embed.status, 0, embed.stderr);
    const embeddedHash = sha(fs.readFileSync(embeddedJpg));

    const positive = extract("known-positive-recovered", embeddedJpg, key);
    assert.equal(positive.exitCode, 0, positive.stderr);
    assert.deepEqual(positive.bytes, expected);
    assert.equal(positive.recoveredBytes, expected.length);

    const wrong = extract("wrong-key-on-embedded-cover", embeddedJpg, wrongKey);
    const clean = extract("correct-key-on-clean-cover", convertedJpg, key);
    const original = extract("p51-original-candidate", originalJpg, key);
    writeAtomic(path.join(output, "p51-original-candidate.bin"), original.bytes);
    const originalHashAfter = sha(fs.readFileSync(originalJpg));
    assert.equal(originalHashAfter, originalHashBefore, "Original p51 JPEG was modified");

    const outguessHelp = run("outguess", ["-h"]);
    const report = {
      outguessSourceCommit: OUTGUESS_SOURCE_COMMIT,
      outguessHelp: (outguessHelp.stdout + "\n" + outguessHelp.stderr).slice(0, 2400),
      keyLength: key.length,
      keySha256: sha(Buffer.from(key, "utf8")),
      wrongKeySha256: sha(Buffer.from(wrongKey, "utf8")),
      sourceBracketCells: { startInclusive: 193, endExclusive: 229, count: 36 },
      sourceCarrier: {
        path: "resources/liber-primus/68.jpg",
        sha256Before: originalHashBefore,
        sha256After: originalHashAfter,
        unchanged: originalHashBefore === originalHashAfter
      },
      matchedCalibrationCover: {
        derivation: "same original p51 grayscale pixels, converted to 3-component sRGB JPEG",
        dimensions: "2400x3600",
        identify: identify.stdout,
        file: jpegDescription,
        sha256: convertedHash
      },
      embeddedPositiveCarrier: { sha256: embeddedHash },
      expectedPositivePayload: {
        bytes: expected.length, sha256: sha(expected),
        exactContent: expected.toString("ascii")
      },
      positive: {
        exitCode: positive.exitCode, header: positive.header,
        recoveredBytes: positive.recoveredBytes,
        exactByteMatch: positive.bytes.equals(expected),
        recoveredSha256: positive.payloadSha256,
        stdout: positive.stdout, stderr: positive.stderr
      },
      wrongKeyControl: {
        exitCode: wrong.exitCode, header: wrong.header,
        recoveredBytes: wrong.recoveredBytes,
        declaredLengthMatchesOutput: wrong.declaredLengthMatchesOutput,
        payloadSha256: wrong.payloadSha256, stats: wrong.stats,
        classification: wrong.classification,
        prefixHex: wrong.prefixHex, stdout: wrong.stdout, stderr: wrong.stderr
      },
      cleanCoverControl: {
        exitCode: clean.exitCode, header: clean.header,
        recoveredBytes: clean.recoveredBytes,
        declaredLengthMatchesOutput: clean.declaredLengthMatchesOutput,
        payloadSha256: clean.payloadSha256, stats: clean.stats,
        classification: clean.classification,
        prefixHex: clean.prefixHex, stdout: clean.stdout, stderr: clean.stderr
      },
      originalP51: {
        exitCode: original.exitCode, header: original.header,
        recoveredBytes: original.recoveredBytes,
        declaredLengthMatchesOutput: original.declaredLengthMatchesOutput,
        payloadSha256: original.payloadSha256, stats: original.stats,
        classification: original.classification,
        prefixHex: original.prefixHex, stdout: original.stdout, stderr: original.stderr
      }
    };
    writeAtomic(path.join(output, "summary.json"), JSON.stringify(report, null, 2) + "\n");
    process.stdout.write("GRID36_OUTGUESS_CALIBRATION " + JSON.stringify(report) + "\n");
  } finally {
    fs.closeSync(lockFd);
    fs.rmSync(lock, { force: true });
  }
}
if (require.main === module) main();
module.exports = { main };
