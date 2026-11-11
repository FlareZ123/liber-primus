"use strict";
/**
 * One isolated, source-selected OutGuess candidate:
 *   p57 exploratory all-20-word map -> INSTAR (under both signs);
 *   p55 illustration -> moth / instar semantic cross-check.
 *
 * This is not a dictionary sweep. Only uppercase INSTAR is tested against
 * original physical p55 image72.jpg. Header/length consistency is not accepted
 * as a payload without an independently recognizable structure.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(ROOT, "resources/liber-primus");
const CARRIER = path.join(SOURCE, "72.jpg"); // original physical p55
const CONTROL_CARRIER = path.join(SOURCE, "17.jpg");
const SIGNED_IMAGE = path.join(ROOT, "resources/historical/cicada2016-4gq25.jpg");
const SIGNED_PAYLOAD = path.join(ROOT, "resources/historical/cicada2016-4gq25-outguess.asc");
const OUTPUT = path.join(ROOT, "outguess-results-instar");
const KEY = "INSTAR";

const sha256 = bytes => crypto.createHash("sha256").update(bytes).digest("hex");

function outguess(args, timeout = 120000) {
  const result = spawnSync("outguess", args, {
    encoding: "utf8",
    timeout,
    maxBuffer: 256 * 1024
  });
  assert.ok(!result.error, "OutGuess launch failed: " + String(result.error));
  return result;
}

function recognize(bytes) {
  const flags = [];
  const starts = prefix => bytes.subarray(0, prefix.length).equals(Buffer.from(prefix));
  if (starts("-----BEGIN PGP SIGNED MESSAGE-----") ||
      starts("-----BEGIN PGP MESSAGE-----") ||
      starts("-----BEGIN PGP PUBLIC KEY BLOCK-----")) flags.push("pgp");
  if (starts("504b0304")) flags.push("zip");
  if (starts("1f8b")) flags.push("gzip");
  if (starts("89504e47")) flags.push("png");
  if (starts("%PDF-")) flags.push("pdf");
  if (bytes.length >= 32) {
    const printable = bytes.reduce((n, b) =>
      n + Number(b === 9 || b === 10 || b === 13 || (b >= 32 && b <= 126)), 0);
    if (printable / bytes.length > 0.97) flags.push("printable");
  }
  return flags;
}

function main() {
  assert.ok(fs.existsSync(CARRIER), "original p55 carrier missing");
  assert.ok(fs.existsSync(SIGNED_IMAGE), "authenticated 2016 control image missing");
  assert.ok(fs.existsSync(SIGNED_PAYLOAD), "authenticated 2016 control payload missing");
  fs.mkdirSync(OUTPUT, { recursive: true });
  const lock = path.join(OUTPUT, ".instar.lock");
  const lockFd = fs.openSync(lock, "wx");
  const scratch = path.join(OUTPUT, "extract.incomplete");
  const result = {
    sourceHypothesis: {
      key: KEY,
      p57: "exploratory all-20-word map reaches INSTAR from both source markers under both signs; modulus/sign are not source-fixed",
      p55: "moth illustration supplies an independent semantic association with instar"
    },
    carrier: "resources/liber-primus/72.jpg",
    key: KEY,
    attempts: 1,
    controls: {},
    extraction: null
  };
  try {
    const signed = fs.readFileSync(SIGNED_PAYLOAD);
    const authentic = outguess(["-r", SIGNED_IMAGE, scratch]);
    assert.equal(authentic.status, 0, "authentic 2016 default-key control failed");
    assert.ok(fs.readFileSync(scratch).equals(signed),
      "authentic 2016 control differs from the archived signed payload");
    result.controls.authentic2016 = {
      bytes: signed.length,
      sha256: sha256(signed),
      exactRecovery: true
    };
    fs.rmSync(scratch, { force: true });

    const message = Buffer.from("INSTAR SOURCE-SELECTED OUTGUESS POSITIVE CONTROL\n");
    const plain = path.join(OUTPUT, "plant.incomplete");
    const stego = path.join(OUTPUT, "plant.incomplete.jpg");
    const recovered = path.join(OUTPUT, "plant-recovered.incomplete");
    fs.writeFileSync(plain, message, { flag: "wx" });
    const embed = outguess(["-k", KEY, "-d", plain, CONTROL_CARRIER, stego]);
    assert.equal(embed.status, 0, "INSTAR keyed embedding control failed");
    const retrieve = outguess(["-k", KEY, "-r", stego, recovered]);
    assert.equal(retrieve.status, 0, "INSTAR keyed retrieval control failed");
    assert.ok(fs.readFileSync(recovered).equals(message),
      "INSTAR keyed synthetic control did not recover exactly");
    result.controls.keyedPlant = {
      key: KEY,
      carrier: "resources/liber-primus/17.jpg",
      bytes: message.length,
      sha256: sha256(message),
      exactRecovery: true
    };
    for (const file of [plain, stego, recovered]) fs.rmSync(file, { force: true });

    const run = outguess(["-k", KEY, "-r", CARRIER, scratch]);
    const diagnostic = (run.stdout || "") + "\n" + (run.stderr || "");
    const match = /Steg retrieve:\s*seed:\s*(\d+),\s*len:\s*(\d+)/i.exec(diagnostic);
    const bytes = fs.existsSync(scratch) ? fs.readFileSync(scratch) : Buffer.alloc(0);
    const headerConsistent = run.status === 0 && Boolean(match) &&
      bytes.length > 0 && bytes.length === Number(match[2]);
    const flags = recognize(bytes);
    result.extraction = {
      status: run.status,
      signal: run.signal || null,
      headerSeed: match ? Number(match[1]) : null,
      headerLength: match ? Number(match[2]) : null,
      extractedBytes: bytes.length,
      headerConsistent,
      recognizable: flags,
      sha256: bytes.length ? sha256(bytes) : null,
      first128Hex: bytes.subarray(0, 128).toString("hex"),
      openingLatin1: bytes.subarray(0, 128).toString("latin1")
        .replace(/[^\x20-\x7e]/g, ".")
    };
    if (headerConsistent) {
      fs.writeFileSync(path.join(OUTPUT, "candidate.bin"), bytes);
    }
    const summary = path.join(OUTPUT, "summary.json");
    const staged = summary + ".incomplete";
    fs.writeFileSync(staged, JSON.stringify(result, null, 2) + "\n");
    fs.renameSync(staged, summary);
    console.log("LP2_INSTAR_OUTGUESS_RESULT " + JSON.stringify({
      controls: result.controls,
      extraction: result.extraction,
      decision: flags.length
        ? "candidate requires independent authentication"
        : "no recognizable original payload; header consistency alone is rejected"
    }));
  } finally {
    fs.rmSync(scratch, { force: true });
    fs.closeSync(lockFd);
    fs.rmSync(lock, { force: true });
  }
}

if (require.main === module) main();
module.exports = { main, KEY, recognize };
