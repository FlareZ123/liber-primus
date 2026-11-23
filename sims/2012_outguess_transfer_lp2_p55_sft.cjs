"use strict";

// One source-selected transfer test: run the exact historical 2012 OutGuess
// read operation on LP2 p55 only. The 75-token book-code/p55 alignment is the
// selector; no password, flag, page sweep, or alternate configuration is used.
// Run via manual-outguess-source-runner.yml (pinned OutGuess 0.4 source).

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { spawnSync, execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const EXPECTED_2012 = fs.readFileSync(
  path.join(ROOT, "im-results", "2012-first-image-1CcV1-outguess.txt")
);

const IMAGE_2012 =
  "https://raw.githubusercontent.com/scream314/cicada3301/10733feb487bb8beb9966d534727ee5897aa54fc/assets/2012/1CcV1.jpg";
const PAYLOAD_2012 =
  "https://raw.githubusercontent.com/scream314/cicada3301/10733feb487bb8beb9966d534727ee5897aa54fc/assets/2012/1CcV1.jpg.out";
const IMAGE_P55 =
  "https://raw.githubusercontent.com/micheloosterhof/cicada-2014/6c3421a4d245596e403c88e037509d162a2afd17/stage11/ky2khlqdf7qdznac.onion/55.jpg";

const P55_BYTES = 614928;
const P55_GIT_BLOB_SHA1 = "ee00cd34013fe3a5c6808650abb6d3206b6f1b13";
const OUTGUESS_SOURCE_COMMIT =
  "24810e14327c2bbeedeaadd3e24491f2a4425c02";

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function gitBlobSha1(bytes) {
  const header = Buffer.from("blob " + bytes.length + "\0", "utf8");
  return crypto
    .createHash("sha1")
    .update(Buffer.concat([header, bytes]))
    .digest("hex");
}

function download(url, destination) {
  execFileSync(
    "curl",
    [
      "--fail",
      "--location",
      "--retry",
      "3",
      "--retry-delay",
      "2",
      "--silent",
      "--show-error",
      "--output",
      destination,
      url,
    ],
    { stdio: "inherit" }
  );
}

function runOutguess(imagePath, outputPath) {
  const result = spawnSync("outguess", ["-r", imagePath, outputPath], {
    encoding: "utf8",
  });
  const exists = fs.existsSync(outputPath);
  const bytes = exists ? fs.readFileSync(outputPath) : Buffer.alloc(0);
  const transcript = (result.stdout || "") + "\n" + (result.stderr || "");
  return { result, exists, bytes, transcript };
}

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "lp2-p55-outguess-transfer-"));
try {
  // Positive control: this exact pinned OutGuess build must reproduce the
  // known 2012 535-byte output before the p55 result is interpreted.
  const oldImage = path.join(temp, "1CcV1.jpg");
  const oldPayload = path.join(temp, "1CcV1.jpg.out");
  const oldExtracted = path.join(temp, "2012-positive-control.out");
  download(IMAGE_2012, oldImage);
  download(PAYLOAD_2012, oldPayload);
  const oldRun = runOutguess(oldImage, oldExtracted);
  assert.equal(oldRun.result.status, 0, oldRun.transcript);
  assert.deepEqual(oldRun.bytes, EXPECTED_2012);
  assert.deepEqual(fs.readFileSync(oldPayload), EXPECTED_2012);
  assert.match(oldRun.transcript, /seed:\s*228,\s*len:\s*535/);

  // The exact May 2014 Stage11 p55 source image is selected by the 75-token
  // crib. Verify its historical Git blob before attempting extraction.
  const p55Path = path.join(temp, "55.jpg");
  const p55OutputPath = path.join(temp, "55.jpg.out");
  download(IMAGE_P55, p55Path);
  const p55 = fs.readFileSync(p55Path);
  assert.equal(p55.length, P55_BYTES);
  assert.equal(gitBlobSha1(p55), P55_GIT_BLOB_SHA1);

  // One exact transfer: historical read/extract mode, no password, no flags.
  const p55Run = runOutguess(p55Path, p55OutputPath);
  const p55Bytes = p55Run.bytes;
  const printable = p55Bytes.filter(
    (byte) => byte === 9 || byte === 10 || byte === 13 || (byte >= 32 && byte <= 126)
  ).length;
  const p55Text = p55Bytes.toString("utf8");
  const p55Summary = {
    command: "outguess -r 55.jpg 55.jpg.out",
    exit_code: p55Run.result.status,
    signal: p55Run.result.signal,
    spawn_error: p55Run.result.error ? p55Run.result.error.message : null,
    output_file_created: p55Run.exists,
    output_bytes: p55Bytes.length,
    output_sha256: sha256(p55Bytes),
    printable_ratio: p55Bytes.length ? printable / p55Bytes.length : 0,
    first_64_hex: p55Bytes.subarray(0, 64).toString("hex"),
    first_256_utf8: p55Text.slice(0, 256),
    contains_2012_payload: p55Bytes.equals(EXPECTED_2012),
    contains_2012_phrase:
      p55Text.includes("CALL US AT US TELE PHONE NUMBER TWO ONE FOUR THREE NINE OH NINE SIX OH EIGHT"),
    transcript: p55Run.transcript.trim().slice(0, 2000),
  };
  if (p55Bytes.length > 0 && p55Bytes.length <= 4096) {
    p55Summary.output_base64 = p55Bytes.toString("base64");
  }

  console.log(
    JSON.stringify(
      {
        result: "PASS: source identity and 2012 positive control verified; p55 extraction reported",
        outguess_version: "0.4",
        outguess_source_commit: OUTGUESS_SOURCE_COMMIT,
        p55_source_commit: "6c3421a4d245596e403c88e037509d162a2afd17",
        p55_source_path: "stage11/ky2khlqdf7qdznac.onion/55.jpg",
        p55_bytes: p55.length,
        p55_git_blob_sha1: gitBlobSha1(p55),
        p55_sha256: sha256(p55),
        positive_control_bytes: oldRun.bytes.length,
        positive_control_sha256: sha256(oldRun.bytes),
        positive_control_transcript: oldRun.transcript.trim(),
        p55_outguess: p55Summary,
      },
      null,
      2
    )
  );
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
