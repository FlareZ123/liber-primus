"use strict";

/**
 * Single-source 2014 Stage04 keyed OutGuess recovery challenge.
 *
 * Signed 03.jpg OutGuess text says "Let the text guide you." The other
 * archived stage asset, original LP1 04.jpg, yields a yet-unreadable
 * 7,524-byte OutGuess output without a key. Test two literal historical
 * text keys on that exact carrier, before inventing LP2 ciphers.
 *
 * Node.js 22; "outguess" 0.4 executable must be on PATH.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(ROOT, "resources", "liber-primus", "04.jpg");
const SIGNED = path.join(
  ROOT, "resources", "external", "derived", "2014-stage04",
  "03-outguess.asc"
);
const REFERENCE = path.join(
  ROOT, "resources", "external", "derived", "2014-stage04",
  "04-outguess.bin"
);
const OUT = path.join(ROOT, "stage04-textguide-results");

const SHA1 = (buffer) =>
  crypto.createHash("sha1").update(buffer).digest("hex");

/** @param {Buffer} buffer @returns {string} */
const gitBlobSHA1 = (buffer) =>
  SHA1(Buffer.concat([Buffer.from("blob " + buffer.length + "\\0"), buffer]));

/**
 * @param {string[]} args
 * @returns {{status:number|null, stderr:string, stdout:string}}
 */
function outguess(args) {
  const result = spawnSync("outguess", args, {
    encoding: "utf8", timeout: 90000, maxBuffer: 1024 * 1024,
  });
  assert.ifError(result.error);
  return {
    status: result.status,
    stderr: (result.stderr || "").trim().slice(0, 750),
    stdout: (result.stdout || "").trim().slice(0, 500),
  };
}

/** @param {Buffer} payload @returns {string[]} */
function signatures(payload) {
  const hex = payload.subarray(0, 12).toString("hex");
  const text = payload.toString("utf8");
  const formats = [
    ["JPEG", "ffd8ff"], ["PNG", "89504e470d0a1a0a"],
    ["ZIP", "504b0304"], ["GZIP", "1f8b"], ["PDF", "25504446"],
    ["BZIP2", "425a68"], ["XZ", "fd377a585a00"],
  ];
  const found = formats.filter(([, prefix]) => hex.startsWith(prefix))
    .map(([name]) => name);
  if (text.startsWith("-----BEGIN PGP ")) found.push("ASCII-OPENPGP");
  if (text.startsWith("<!DOCTYPE html") || text.startsWith("<html"))
    found.push("HTML");
  return found;
}

/** @param {Buffer} payload */
function brief(payload) {
  const printable = [...payload].filter(b =>
    b === 9 || b === 10 || b === 13 || (b >= 32 && b <= 126)).length;
  const text = payload.toString("utf8");
  const literals = text.match(/[\x20-\x7E]{24,}/g) || [];
  return {
    bytes: payload.length,
    sha1: SHA1(payload),
    headHex: payload.subarray(0, 24).toString("hex"),
    printableRatio: printable / payload.length,
    signatures: signatures(payload),
    printableRuns: literals.slice(0, 3).map(s => s.slice(0, 200)),
  };
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const signed = fs.readFileSync(SIGNED, "utf8");
  assert.ok(signed.startsWith(
    "-----BEGIN PGP SIGNED MESSAGE-----\nHash: SHA1\n\n" +
    "Let the text guide you.\n"
  ));
  const archived = fs.readFileSync(REFERENCE);
  assert.equal(archived.length, 7524);
  assert.equal(gitBlobSHA1(archived), "d738b052bf0548e2f431e231af7ef1514becb4ad");

  const defaultFile = path.join(OUT, "stage04-default.bin");
  const defaultRun = outguess(["-r", SOURCE, defaultFile]);
  assert.equal(defaultRun.status, 0, defaultRun.stderr);
  const defaultBytes = fs.readFileSync(defaultFile);
  assert.ok(defaultBytes.equals(archived),
    "Current OutGuess must reproduce the archived default payload byte for byte");

  // Independent true-password control on a known successful original cover.
  const controlText = Buffer.from("CICADA STAGE04 KEYED OUTGUESS CONTROL 2026\n");
  const controlSecret = "CICADA-2014-SFT-KEY";
  const plain = path.join(OUT, "control-plain.txt");
  const cover = path.join(ROOT, "resources", "liber-primus", "17.jpg");
  const stego = path.join(OUT, "control-embedded.jpg");
  const recovered = path.join(OUT, "control-recovered.bin");
  fs.writeFileSync(plain, controlText);
  const embed = outguess([
    "-k", controlSecret, "-d", plain, cover, stego
  ]);
  assert.equal(embed.status, 0, embed.stderr);
  const extract = outguess(["-k", controlSecret, "-r", stego, recovered]);
  assert.equal(extract.status, 0, extract.stderr);
  assert.ok(fs.readFileSync(recovered).equals(controlText),
    "Known-key OutGuess round trip must recover the exact source text");

  const candidates = [
    { label: "signed-literal-phrase", key: "Let the text guide you." },
    { label: "historical-lp1-text-key", key: "WELCOME PILGRIM TO THE GREAT" },
  ];
  const outcomes = [];
  for (const { label, key } of candidates) {
    const candidateFile = path.join(OUT, label + ".bin");
    const result = outguess([
      "-k", key, "-r", SOURCE, candidateFile
    ]);
    const item = { label, status: result.status, stderr: result.stderr };
    if (fs.existsSync(candidateFile)) {
      item.output = brief(fs.readFileSync(candidateFile));
    }
    outcomes.push(item);
  }

  const report = {
    original: "2014 Stage04 original LP1 04.jpg",
    signedInstruction: "Let the text guide you.",
    defaultExtraction: brief(defaultBytes),
    matchesArchivedDefaultExtraction: true,
    independentlyKnownKeyRoundTrip: true,
    candidates: outcomes,
    interpretation:
      "Only a readable authenticated message or structurally valid file " +
      "can motivate an additional source-led decoding step. An OutGuess " +
      "seed/length header or printable fragment alone is no solution.",
  };
  fs.writeFileSync(path.join(OUT, "summary.json"),
    JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify(report, null, 2));
}

if (require.main === module) main();

module.exports = { main, signatures, brief };
