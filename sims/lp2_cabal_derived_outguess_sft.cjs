"use strict";
/**
 * One-key, three-carrier OutGuess test for the source-derived CABALUOIDFORM
 * string. The key is the 13-GP-symbol inward central-column path
 * CABAL -> UOID -> FORM from the 2013 Wisdom square, reconstructed from
 * p55/p36 word-number directions. The 2016 signed image establishes OutGuess
 * as a historically relevant steganography tool; p14/p32/p55 are fixed
 * source-selected carriers (FOLD/tree/shared-tree).
 *
 * This is one fixed hypothesis, not a password search.
 * Run: node sims/lp2_cabal_derived_outguess_sft.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const src = path.join(root, "resources/liber-primus");
const historical = path.join(root, "resources/historical");
const output = path.join(root, "outguess-cabal-derived-results");
const key = "CABALUOIDFORM"; // exact GP transliteration; do not normalize UOID to VOID
const carriers = [
  { file: "31.jpg", page: 14, reason: "original FOLD/tree page" },
  { file: "49.jpg", page: 32, reason: "original blurred-tree / 11x11 page" },
  { file: "72.jpg", page: 55, reason: "original final unsolved tree page" }
];
const signedImage = path.join(historical, "cicada2016-4gq25.jpg");
const signedPayload = path.join(historical, "cicada2016-4gq25-outguess.asc");
const hash = bytes => crypto.createHash("sha256").update(bytes).digest("hex");

function outguess(args, timeout = 30000) {
  return spawnSync("outguess", args, {
    encoding: "utf8",
    timeout,
    maxBuffer: 256000
  });
}
function indicators(bytes) {
  const flags = [];
  const starts = s => bytes.subarray(0, Buffer.byteLength(s)).equals(Buffer.from(s));
  if (starts("-----BEGIN PGP ")) flags.push("pgp");
  if (bytes.subarray(0, 4).equals(Buffer.from("504b0304", "hex"))) flags.push("zip");
  if (bytes.subarray(0, 2).equals(Buffer.from("1f8b", "hex"))) flags.push("gzip");
  if (bytes.subarray(0, 4).equals(Buffer.from("89504e47", "hex"))) flags.push("png");
  const printable = bytes.reduce(
    (n, v) => n + Number(v === 9 || v === 10 || v === 13 || (v >= 32 && v <= 126)), 0
  );
  if (bytes.length >= 48 && printable / bytes.length >= 0.96) flags.push("printable");
  return flags;
}
function atomicJSON(destination, value) {
  const staged = destination + "." + process.pid + ".incomplete";
  fs.writeFileSync(staged, JSON.stringify(value, null, 2) + "\n", { flag: "wx" });
  fs.renameSync(staged, destination);
}
function main() {
  assert.equal(key.length, 13);
  const wisdom = fs.readFileSync(path.join(root, "resources/external/2013-0-wisdom.txt"), "utf8");
  for (const runeWord of ["ᚳᚪᛒᚪᛚ", "ᚢᚩᛁᛞ", "ᚠᚩᚱᛗ"]) {
    assert(wisdom.includes(runeWord), "missing source-derived key word " + runeWord);
  }
  const routeSft = fs.readFileSync(path.join(__dirname, "p55_wisdom_cardinal_route_sft.cjs"), "utf8");
  assert(routeSft.includes("CABALUOIDFORM"), "frozen source-route SFT no longer records the key");
  const signedText = fs.readFileSync(signedPayload, "utf8");
  assert.equal(Buffer.byteLength(signedText), 1136);
  fs.mkdirSync(output, { recursive: true });
  const lock = path.join(output, ".scan.lock");
  const lockHandle = fs.openSync(lock, "wx");
  const scratch = path.join(output, "extract.incomplete");
  const result = {
    classification: "single source-derived passphrase, three original carriers; no password tuning",
    key,
    keyLength: key.length,
    keyDerivation: {
      source: "2013 0_wisdom / p55-p36 central-column navigation",
      orderedWords: ["CABAL", "UOID", "FORM"],
      note: "UOID is retained as the exact GP transliteration; no V/VOID normalization"
    },
    carriers,
    attempts: [],
    controls: {}
  };
  try {
    const authentic = outguess(["-r", signedImage, scratch]);
    assert.equal(authentic.status, 0, "authentic 2016 default-key control failed: " + authentic.stderr);
    const authenticBytes = fs.readFileSync(scratch);
    assert(authenticBytes.equals(fs.readFileSync(signedPayload)),
      "default-key extraction does not match the authenticated 2016 payload");
    result.controls.authentic2016 = {
      exact: true, bytes: authenticBytes.length, sha256: hash(authenticBytes)
    };
    fs.rmSync(scratch, { force: true });

    const plantedText = Buffer.from("CABALUOIDFORM OUTGUESS POSITIVE CONTROL\n");
    const plantedPath = path.join(output, "plant.incomplete");
    const plantedImage = path.join(output, "plant.incomplete.jpg");
    fs.writeFileSync(plantedPath, plantedText, { flag: "wx" });
    const embedded = outguess([
      "-k", key, "-d", plantedPath, path.join(src, "31.jpg"), plantedImage
    ], 120000);
    assert.equal(embedded.status, 0, "CABALUOIDFORM embed control failed: " + embedded.stderr);
    const recovered = outguess(["-k", key, "-r", plantedImage, scratch], 120000);
    assert.equal(recovered.status, 0, "CABALUOIDFORM recovery control failed: " + recovered.stderr);
    assert(fs.readFileSync(scratch).equals(plantedText), "CABALUOIDFORM plant/recovery mismatch");
    result.controls.planted = { exact: true, key, bytes: plantedText.length };
    for (const file of [plantedPath, plantedImage, scratch]) fs.rmSync(file, { force: true });

    for (const carrier of carriers) {
      fs.rmSync(scratch, { force: true });
      const image = path.join(src, carrier.file);
      const run = outguess(["-k", key, "-r", image, scratch]);
      const combined = (run.stdout || "") + "\n" + (run.stderr || "");
      const match = /Steg retrieve:\s*seed:\s*(\d+),\s*len:\s*(\d+)/iu.exec(combined);
      const bytes = fs.existsSync(scratch) ? fs.readFileSync(scratch) : Buffer.alloc(0);
      const item = {
        carrier,
        status: run.status,
        signal: run.signal || null,
        error: run.error ? String(run.error) : null,
        header: match ? { seed: Number(match[1]), length: Number(match[2]) } : null,
        fileBytes: bytes.length,
        headerConsistent: Boolean(match && bytes.length > 0 && bytes.length === Number(match[2])),
        flags: [],
        sha256: bytes.length ? hash(bytes) : null,
        opening: bytes.length
          ? bytes.subarray(0, 80).toString("latin1").replace(/[^\x20-\x7e]/g, ".")
          : ""
      };
      if (item.headerConsistent) {
        item.flags = indicators(bytes);
        if (item.flags.length) {
          const final = path.join(output, "candidate_p" + carrier.page + ".bin");
          const staged = final + "." + process.pid + ".incomplete";
          fs.writeFileSync(staged, bytes, { flag: "wx" });
          fs.renameSync(staged, final);
        }
      }
      result.attempts.push(item);
      fs.rmSync(scratch, { force: true });
    }
    result.summary = {
      attempts: result.attempts.length,
      consistentHeaders: result.attempts.filter(x => x.headerConsistent).length,
      recognizablePayloads: result.attempts.filter(x => x.flags.length > 0).length,
      signals: result.attempts.filter(x => x.signal)
        .map(x => ({ page: x.carrier.page, signal: x.signal })),
      exitFailures: result.attempts.filter(x => x.status !== 0 && !x.signal)
        .map(x => ({ page: x.carrier.page, status: x.status, error: x.error }))
    };
    atomicJSON(path.join(output, "summary.json"), result);
    process.stdout.write("CABAL_OUTGUESS_RESULT " + JSON.stringify(result.summary) + "\n");
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  } finally {
    fs.rmSync(scratch, { force: true });
    fs.closeSync(lockHandle);
    fs.rmSync(lock, { force: true });
  }
}
if (require.main === module) main();
module.exports = { main, key, carriers, indicators };
