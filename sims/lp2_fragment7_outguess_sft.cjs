"use strict";
/**
 * Test the 11-rune Ac fragment selected by the 2014 199 -> empty fragment 6 /
 * Ac fragment 7 bridge as a historically plausible OutGuess passphrase.
 *
 * Fixed candidates:
 *   ATXBMGIASBXEO — exact GP transliteration of fragment 7
 *   OAK            — English meaning of the Ac rune that begins fragment 7
 *
 * The only carrier is original LP2 page 6, image 23.jpg: the two 13-dot
 * boundaries at normalized offsets 71 and 82 delimit the 11-rune fragment.
 * This is a two-reading, one-carrier test, not a password sweep.
 *
 * Run after building the pinned OutGuess version:
 *   node sims/lp2_fragment7_outguess_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(ROOT, "resources/liber-primus");
const HISTORICAL = path.join(ROOT, "resources/historical");
const OUTPUT = path.join(ROOT, "outguess-fragment7-results");
const CARRIER = path.join(SOURCE, "23.jpg"); // LP2 page 6
const VARIANTS = [
  { key: "ATXBMGIASBXEO", reading: "exact GP transliteration of fragment 7" },
  { key: "OAK", reading: "English meaning of the Ac rune anchoring fragment 7" }
];
const SHA = bytes => crypto.createHash("sha256").update(bytes).digest("hex");

function readFrozen(relative, expectedBlobSha) {
  const bytes = fs.readFileSync(path.join(ROOT, relative));
  const actual = crypto.createHash("sha1")
    .update(Buffer.concat([Buffer.from("blob " + bytes.length + "\0"), bytes]))
    .digest("hex");
  assert.equal(actual, expectedBlobSha, relative + " source version");
  return JSON.parse(bytes.toString("utf8"));
}
function outguess(args, timeout = 30000) {
  return spawnSync("outguess", args, {
    encoding: "utf8", timeout, maxBuffer: 256 * 1024
  });
}
function entropy(bytes) {
  if (!bytes.length) return 0;
  const counts = new Uint32Array(256);
  for (const b of bytes) counts[b]++;
  let h = 0;
  for (const n of counts) if (n) {
    const p = n / bytes.length;
    h -= p * Math.log2(p);
  }
  return h;
}
function indicators(bytes) {
  const flags = [];
  if (bytes.subarray(0, 2).toString("ascii") === "--") {
    const opening = bytes.subarray(0, 80).toString("ascii");
    if (opening.startsWith("-----BEGIN PGP ")) flags.push("pgp-armor");
  }
  if (bytes.subarray(0, 4).equals(Buffer.from("504b0304", "hex"))) flags.push("zip");
  if (bytes.subarray(0, 2).equals(Buffer.from("1f8b", "hex"))) flags.push("gzip");
  if (bytes.subarray(0, 4).equals(Buffer.from("89504e47", "hex"))) flags.push("png");
  if (bytes.subarray(0, 5).toString("ascii") === "%PDF-") flags.push("pdf");
  const printable = bytes.reduce((n, b) =>
    n + Number(b === 9 || b === 10 || b === 13 || (b >= 32 && b <= 126)), 0);
  const printableFraction = bytes.length ? printable / bytes.length : 0;
  if (bytes.length >= 48 && printableFraction >= 0.97) flags.push("printable");
  return { flags, printableFraction };
}
function diagnostic(file) {
  const f = spawnSync("file", ["-b", file], { encoding: "utf8", maxBuffer: 64 * 1024 });
  const g = spawnSync("gpg", ["--batch", "--list-packets", file], {
    encoding: "utf8", maxBuffer: 64 * 1024
  });
  return {
    file: { status: f.status, stdout: (f.stdout || "").trim(), stderr: (f.stderr || "").trim() },
    gpg: {
      status: g.status, stdout: (g.stdout || "").slice(0, 2000),
      stderr: (g.stderr || "").slice(0, 2000)
    }
  };
}
function main() {
  const corpus = readFrozen("resources/liber-primus/lp2-corpus.json",
    "054f2a0f780b7d46901acbe3d9bf4f0ac1801165");
  const ink = readFrozen("resources/liber-primus/lp2-ink-annotations.json",
    "3c52f209ce6bd7b138eaa2d4a9323526952ba9f9");
  const page6 = ink.pages.find(p => p.page === 6);
  assert.ok(page6, "missing physical LP2 page 6 annotation");
  const p6Marks = (page6.large_punctuation || [])
    .filter(mark => mark[1] === 13).map(mark => mark[0]);
  assert.ok(p6Marks.includes(71) && p6Marks.includes(82),
    "source no longer places the two 13-dot boundaries at offsets 71 and 82");

  // Rebuild the red stream exactly as the source-fragment gate does.
  const events = [];
  for (const page of ink.pages) {
    const source = corpus.pages.find(p => p.page === page.page);
    for (const span of page.red_spans || []) {
      for (let j = 0; j < span.length; j++) {
        events.push({ page: page.page, offset: span.start + j, kind: 1,
          rune: source.indices[span.start + j] });
      }
    }
    for (const mark of page.large_punctuation || []) {
      if (mark[1] === 13) events.push({ page: page.page, offset: mark[0], kind: 0 });
    }
  }
  events.sort((a, b) => a.page - b.page || a.offset - b.offset || a.kind - b.kind);
  const fragments = [[]];
  let eventIndex = 0;
  for (const page of corpus.pages) {
    for (let offset = 0; offset <= page.indices.length; offset++) {
      while (eventIndex < events.length &&
        events[eventIndex].page === page.page && events[eventIndex].offset === offset) {
        const event = events[eventIndex++];
        if (event.kind === 0) fragments.push([]);
        else fragments[fragments.length - 1].push(event.rune);
      }
    }
  }
  assert.equal(eventIndex, events.length);
  assert.equal(fragments.length, 32);
  const fragment7 = fragments[6];
  assert.deepEqual(fragment7, [24, 16, 14, 17, 19, 6, 27, 15, 17, 14, 12]);
  const translit = fragment7.map(i => corpus.translit[i]).join("");
  assert.equal(translit, "ATXBMGIASBXEO");
  assert.equal(corpus.translit[fragment7[0]], "A"); // Ac anchor
  assert.equal(VARIANTS[0].key, translit);
  assert.equal(VARIANTS[1].key, "OAK");

  fs.mkdirSync(OUTPUT, { recursive: true });
  const lock = path.join(OUTPUT, ".fragment7.lock");
  const lockFd = fs.openSync(lock, "wx");
  const scratch = path.join(OUTPUT, "extract.incomplete");
  const messageFile = path.join(OUTPUT, "plant.incomplete");
  const stegoFile = path.join(OUTPUT, "plant.incomplete.jpg");
  const recoveredFile = path.join(OUTPUT, "recover.incomplete");
  const authenticImage = path.join(HISTORICAL, "cicada2016-4gq25.jpg");
  const authenticPayload = path.join(HISTORICAL, "cicada2016-4gq25-outguess.asc");
  const result = {
    hypothesis: "the source-selected 11-rune Ac fragment is an OutGuess passphrase for its own physical carrier",
    source: {
      bridge: "2014 stage04 cell 6 Rad -> cell 7 Ac (199); phi(199) mod 32 = empty fragment 6; 199 mod 32 = fragment 7",
      carrier: "original LP2 p6 / 23.jpg",
      boundaries: [71, 82],
      fragment7RuneIndices: fragment7,
      fragment7Transliteration: translit
    },
    candidates: VARIANTS,
    controls: {},
    attempts: []
  };
  try {
    // Authenticate the extractor against the independently signed 2016 image.
    const authentic = outguess(["-r", authenticImage, scratch], 120000);
    assert.equal(authentic.status, 0, "2016 OutGuess positive control failed: " + authentic.stderr);
    const authenticBytes = fs.readFileSync(scratch);
    assert(authenticBytes.equals(fs.readFileSync(authenticPayload)),
      "2016 payload differs from the authenticated source bytes");
    result.controls.authentic2016 = {
      exact: true, bytes: authenticBytes.length, sha256: SHA(authenticBytes)
    };
    fs.rmSync(scratch, { force: true });

    const plantedText = Buffer.from("FRAGMENT7 SOURCE-SELECTED OUTGUESS POSITIVE CONTROL\n");
    fs.writeFileSync(messageFile, plantedText, { flag: "wx" });
    for (const variant of VARIANTS) {
      fs.rmSync(stegoFile, { force: true });
      fs.rmSync(recoveredFile, { force: true });
      const embedded = outguess(["-k", variant.key, "-d", messageFile, CARRIER, stegoFile], 120000);
      assert.equal(embedded.status, 0, "plant embed failed for " + variant.key + ": " + embedded.stderr);
      const recovered = outguess(["-k", variant.key, "-r", stegoFile, recoveredFile], 120000);
      assert.equal(recovered.status, 0, "plant retrieve failed for " + variant.key + ": " + recovered.stderr);
      assert(fs.readFileSync(recoveredFile).equals(plantedText),
        "same-key p6 positive plant did not recover for " + variant.key);
      result.controls[variant.key] = { exact: true, bytes: plantedText.length, carrier: "23.jpg" };
    }
    fs.rmSync(messageFile, { force: true });
    fs.rmSync(stegoFile, { force: true });
    fs.rmSync(recoveredFile, { force: true });

    for (const variant of VARIANTS) {
      fs.rmSync(scratch, { force: true });
      const run = outguess(["-k", variant.key, "-r", CARRIER, scratch], 120000);
      const combined = (run.stdout || "") + "\n" + (run.stderr || "");
      const match = /Steg retrieve:\s*seed:\s*(\d+),\s*len:\s*(\d+)/iu.exec(combined);
      const bytes = fs.existsSync(scratch) ? fs.readFileSync(scratch) : Buffer.alloc(0);
      const consistent = Boolean(match && bytes.length > 0 && bytes.length === Number(match[2]));
      const item = {
        key: variant.key, reading: variant.reading,
        status: run.status, signal: run.signal || null,
        error: run.error ? String(run.error) : null,
        header: match ? { seed: Number(match[1]), length: Number(match[2]) } : null,
        bytes: bytes.length, headerConsistent: consistent,
        sha256: bytes.length ? SHA(bytes) : null,
        entropyBitsPerByte: bytes.length ? entropy(bytes) : null,
        ...indicators(bytes),
        opening: bytes.length ? bytes.subarray(0, 80).toString("latin1")
          .replace(/[^\x20-\x7e]/g, ".") : ""
      };
      if (consistent) {
        item.diagnostics = diagnostic(scratch);
        const saved = path.join(OUTPUT, "fragment7_" + (variant.key === "OAK" ? "oak" : "gp") + ".bin");
        fs.copyFileSync(scratch, saved);
        item.artifact = path.basename(saved);
      }
      result.attempts.push(item);
      fs.rmSync(scratch, { force: true });
    }
    result.summary = {
      attempts: result.attempts.length,
      headerConsistent: result.attempts.filter(x => x.headerConsistent).length,
      recognizable: result.attempts.filter(x => x.flags.length > 0 ||
        x.diagnostics?.gpg.status === 0).length,
      exactPositiveControls: Object.values(result.controls).every(x => x.exact)
    };
    fs.writeFileSync(path.join(OUTPUT, "summary.json"), JSON.stringify(result, null, 2) + "\n");
    process.stdout.write("FRAGMENT7_OUTGUESS_RESULT " + JSON.stringify(result.summary) + "\n");
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  } finally {
    for (const file of [scratch, messageFile, stegoFile, recoveredFile]) fs.rmSync(file, { force: true });
    fs.closeSync(lockFd);
    fs.rmSync(lock, { force: true });
  }
}
if (require.main === module) main();
module.exports = { main, VARIANTS };
