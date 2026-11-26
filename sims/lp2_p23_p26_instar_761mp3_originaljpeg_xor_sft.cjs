"use strict";
/**
 * Source-constrained extension of the authenticated 2013 761.MP3 XOR operation.
 * Human-visible selector: LP2 p23–26 carry the four-page cicada/instar illustration sequence;
 * the 2013 Cicada OS track is explicitly titled "The Instar Emergence" and its ID3 poem
 * supplies the repeated "instar ... shed ... emerge" wording.
 *
 * Fetches the exact historical 761.MP3 from rtkd/iddqd commit
 * f2267b0c2f1e1d2662806b90b9c3a2953b3a7023, checks its SHA-256, then delegates
 * to the existing positive-control SFT with the unchanged offset-zero XOR and
 * original LP2 pages 23, 24, 25, 26. No offsets, keys, KDFs, or other transforms.
 *
 * Run via .github/workflows/manual-node22-sft-runner.yml:
 *   sft = sims/lp2_p23_p26_instar_761mp3_originaljpeg_xor_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const SOURCE_URL =
  "https://raw.githubusercontent.com/rtkd/iddqd/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/2013/02/761.MP3";
const SOURCE_SHA256 =
  "83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460";
const SOURCE_BYTES = 4010732;
const PAGES = [23, 24, 25, 26];

async function main() {
  const response = await fetch(SOURCE_URL, { redirect: "follow" });
  assert.ok(response.ok, `Pinned 761.MP3 download failed: HTTP ${response.status}`);
  const audio = Buffer.from(await response.arrayBuffer());
  assert.equal(audio.length, SOURCE_BYTES, "Unexpected pinned 761.MP3 length");
  const digest = crypto.createHash("sha256").update(audio).digest("hex");
  assert.equal(digest, SOURCE_SHA256, "Pinned 761.MP3 SHA-256 mismatch");

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "lp2-instar-761-xor-"));
  try {
    const audioPath = path.join(tempDir, "761.MP3");
    fs.writeFileSync(audioPath, audio);
    const sft = path.join(__dirname, "lp2_p27_761mp3_originaljpeg_xor_sft.cjs");
    const run = spawnSync(process.execPath, [sft, audioPath, ...PAGES.map(String)], {
      stdio: "inherit",
    });
    if (run.error) throw run.error;
    assert.equal(run.status, 0, `Original-image XOR SFT exited ${run.status}`);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
