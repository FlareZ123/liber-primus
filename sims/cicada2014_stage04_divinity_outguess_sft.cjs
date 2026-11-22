"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "stage04-divinity-results");
const P03 = path.join(ROOT, "resources/liber-primus/03.jpg");
const P04 = path.join(ROOT, "resources/liber-primus/04.jpg");
const R03 = path.join(ROOT, "resources/external/derived/2014-stage04/03-outguess.asc");
const R04 = path.join(ROOT, "resources/external/derived/2014-stage04/04-outguess.bin");
const OUTGUESS_COMMIT = "24810e14327c2bbeedeaadd3e24491f2a4425c02";

const digest = (alg, b) => crypto.createHash(alg).update(b).digest("hex");
const gitBlobSHA1 = (b) => digest("sha1", Buffer.concat([
  Buffer.from("blob " + b.length), Buffer.from([0]), b
]));
function run(args) {
  const r = spawnSync("outguess", args, {
    encoding: "utf8", timeout: 90000, maxBuffer: 1024 * 1024
  });
  assert.ifError(r.error);
  return {
    status: r.status,
    stdout: (r.stdout || "").trim().slice(0, 1000),
    stderr: (r.stderr || "").trim().slice(0, 1500)
  };
}
function fileType(p) {
  const r = spawnSync("file", ["-b", p], { encoding: "utf8", timeout: 10000 });
  return { status: r.status, description: (r.stdout || "").trim() };
}
function brief(b, p) {
  const counts = new Uint32Array(256);
  let printable = 0, entropy = 0;
  for (const x of b) {
    counts[x]++;
    if (x === 9 || x === 10 || x === 13 || (x >= 32 && x <= 126)) printable++;
  }
  if (b.length) for (const n of counts) if (n) {
    const q = n / b.length; entropy -= q * Math.log2(q);
  }
  const h = b.subarray(0, 16).toString("hex");
  const text = b.toString("utf8");
  const signatures = [];
  for (const [name, sig] of [
    ["JPEG","ffd8ff"],["PNG","89504e470d0a1a0a"],["ZIP","504b0304"],
    ["GZIP","1f8b"],["PDF","25504446"],["BZIP2","425a68"],["XZ","fd377a585a00"]
  ]) if (h.startsWith(sig)) signatures.push(name);
  if (text.startsWith("-----BEGIN PGP ")) signatures.push("ASCII-OPENPGP");
  return {
    bytes: b.length, sha256: digest("sha256", b), sha1: digest("sha1", b),
    gitBlobSHA1: gitBlobSHA1(b), headHex: b.subarray(0, 32).toString("hex"),
    entropyBitsPerByte: entropy, printableRatio: b.length ? printable / b.length : 0,
    signatures, file: p ? fileType(p) : null,
    printableRuns: (text.match(/[\x20-\x7E]{24,}/g) || []).slice(0, 6).map(x => x.slice(0, 240))
  };
}
function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const archived03 = fs.readFileSync(R03), archived04 = fs.readFileSync(R04);

  // Documented page03 default extraction is the positive control.
  const p03out = path.join(OUT, "03-default.asc");
  const p03run = run(["-r", P03, p03out]);
  assert.equal(p03run.status, 0, p03run.stderr);
  const p03bytes = fs.readFileSync(p03out);
  assert.ok(p03bytes.equals(archived03), "page03 default extraction differs from archived control");

  // Reproduce page04's known default payload before testing the source-selected key.
  const p04out = path.join(OUT, "04-default.bin");
  const p04run = run(["-r", P04, p04out]);
  assert.equal(p04run.status, 0, p04run.stderr);
  const p04bytes = fs.readFileSync(p04out);
  assert.ok(p04bytes.equals(archived04), "page04 default extraction differs from archived baseline");

  // Independent positive control for the keyed OutGuess interface.
  const controlText = Buffer.from("CICADA STAGE04 KEYED OUTGUESS CONTROL 2026\n");
  const controlKey = "CICADA-2014-SFT-KEY";
  const plain = path.join(OUT, "control-plain.txt");
  const cover = path.join(ROOT, "resources/liber-primus/17.jpg");
  const stego = path.join(OUT, "control-embedded.jpg");
  const recovered = path.join(OUT, "control-recovered.bin");
  fs.writeFileSync(plain, controlText);
  const embed = run(["-k", controlKey, "-d", plain, cover, stego]);
  assert.equal(embed.status, 0, embed.stderr);
  const extract = run(["-k", controlKey, "-r", stego, recovered]);
  assert.equal(extract.status, 0, extract.stderr);
  const recoveredBytes = fs.readFileSync(recovered);
  assert.ok(recoveredBytes.equals(controlText), "synthetic keyed round trip failed");

  // Only source-selected candidate: literal "divinity", on original page04.
  const keyedPath = path.join(OUT, "04-divinity.bin");
  const keyedRun = run(["-k", "divinity", "-r", P04, keyedPath]);
  const exists = fs.existsSync(keyedPath);
  const keyedBytes = exists ? fs.readFileSync(keyedPath) : null;

  const result = {
    tool: {
      name: "OutGuess", versionFamily: "0.4", sourceCommit: OUTGUESS_COMMIT,
      help: run(["-h"])
    },
    page03PositiveControl: {
      command: "outguess -r 03.jpg 03-default.asc",
      status: p03run.status, exactArchivedMatch: true,
      archived: brief(archived03, R03), extracted: brief(p03bytes, p03out)
    },
    page04DefaultBaseline: {
      command: "outguess -r 04.jpg 04-default.bin",
      status: p04run.status, exactArchivedMatch: true,
      archived: brief(archived04, R04), extracted: brief(p04bytes, p04out)
    },
    keyedInterfaceControl: {
      cover: "original LP1 17.jpg", key: controlKey,
      embedStatus: embed.status, extractStatus: extract.status,
      exactRecovery: true, output: brief(recoveredBytes, recovered)
    },
    sourceSelectedDivinityTest: {
      command: "outguess -k divinity -r 04.jpg 04-divinity.bin",
      status: keyedRun.status, stdout: keyedRun.stdout, stderr: keyedRun.stderr,
      outputExists: exists, output: keyedBytes ? brief(keyedBytes, keyedPath) : null,
      byteIdenticalToDefault: keyedBytes ? keyedBytes.equals(p04bytes) : false
    },
    interpretation: "A nonempty extraction or successful exit is not a positive result. Require an authenticated message, recognizable valid file, or other payload-specific structure."
  };
  fs.writeFileSync(path.join(OUT, "summary.json"), JSON.stringify(result, null, 2) + "\n");
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
}
if (require.main === module) main();
module.exports = { main, brief };
