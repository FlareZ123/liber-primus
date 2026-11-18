"use strict";

/**
 * Original Liber Primus JPEG carrier gate for Westfeld's period-available F5
 * algorithm (2001), using pinned Java F5 source and source-selected passwords.
 *
 * A valid extraction requires a complete claimed-length result and a
 * recognizable, independently checkable payload. A decoded F5 length alone
 * is not authentic evidence: wrong passwords have random 23-bit lengths.
 *
 * Run with Node.js 22 after compiling the pinned F5 Java source.
 * F5_ROOT: absolute path to compiled historical Java F5 source tree.
 * F5_ALL: set to "1" to cover all 58 original LP2 JPEGs.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const f5Root = path.resolve(process.env.F5_ROOT || path.join(root, "external-f5"));
const jpgRoot = path.join(root, "resources", "liber-primus");
const corpus = JSON.parse(fs.readFileSync(path.join(jpgRoot, "lp2-corpus.json"), "utf8"));
const all = process.env.F5_ALL === "1";
const scans = all
  ? Array.from({ length: 58 }, (_, i) => i + 17)
  : [17, 20, 32, 40, 56, 66, 67, 68, 69, 72, 73, 74];
const passwords = [
  "abc123",              // Original F5 Java default.
  "Default key",         // Historical Cicada OutGuess default.
  "CIRCUMFERENCE",       // Historical author-chosen 2014 LP1 stage key.
  "DIVINITY",            // Historical author-chosen LP1 Vigenere key.
  "3301",                // Author's visible signature.
  "LIBER PRIMUS",        // Book's printed title.
  "The Instar Emergence" // Author-published 2013 puzzle title.
];

function hash(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Execute historical Java F5 without shell expansion or Unix operators.
 * @param {string} className
 * @param {string[]} args
 * @returns {{stdout:string,stderr:string,ok:boolean}}
 */
function java(className, args) {
  try {
    const stdout = execFileSync(
      "java",
      ["-Djava.awt.headless=false", "--add-exports=java.base/sun.security.provider=ALL-UNNAMED", "-Xmx1024m", "-cp", f5Root, className, ...args],
      { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 120000 }
    );
    return { stdout, stderr: "", ok: true };
  } catch (e) {
    return {
      stdout: typeof e.stdout === "string" ? e.stdout : e.stdout?.toString("utf8") || "",
      stderr: typeof e.stderr === "string" ? e.stderr : e.stderr?.toString("utf8") || String(e),
      ok: false
    };
  }
}

function classify(data) {
  if (data.length === 0) return "empty";
  const h = data.subarray(0, 12).toString("hex");
  if (data.subarray(0, 15).toString("ascii").includes("-----BEGIN PGP")) return "pgp";
  if (h.startsWith("1f8b08")) return "gzip";
  if (h.startsWith("425a68")) return "bzip2";
  if (h.startsWith("504b0304")) return "zip";
  if (h.startsWith("89504e470d0a1a0a")) return "png";
  if (h.startsWith("ffd8ff")) return "jpeg";
  if (h.startsWith("255044462d")) return "pdf";
  const text = data.subarray(0, Math.min(data.length, 4096)).toString("utf8");
  if (/LIBER PRIMUS|CICADA 3301|BEGIN PGP SIGNED MESSAGE|AN END\b/i.test(text)) return "recognizable-text";
  if (data.length > 80 && /^[\x20-\x7e\r\n\t]+$/.test(text)) return "ascii-text";
  return "unidentified";
}

/**
 * Decode one actual carrier through the original Java F5 implementation.
 * @param {string} carrier
 * @param {string} password
 * @param {string} destination
 */
function extract(carrier, password, destination) {
  const res = java("Extract", [carrier, "-p", password, "-e", destination]);
  const log = res.stdout + "\n" + res.stderr;
  const m = /Length of embedded file:\s*(\d+)\s*bytes/.exec(log);
  const claimed = m ? Number(m[1]) : null;
  const output = fs.existsSync(destination) ? fs.readFileSync(destination) : Buffer.alloc(0);
  const incomplete = /Incomplete file:|Exception|Error:|error:/i.test(log);
  const complete = res.ok && !incomplete && claimed !== null &&
    claimed > 0 && output.length === claimed;
  return {
    claimed,
    extracted: output.length,
    complete,
    k: /\(1,\s*\d+,\s*(\d+)\)\s*code used/.exec(log)?.[1] || "default",
    signature: classify(output),
    sha256: output.length > 0 ? hash(output) : "",
    prefixHex: output.subarray(0, 16).toString("hex"),
    error: res.ok && !incomplete ? "" : log.slice(-320)
  };
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "lp2-f5-"));
const records = [];
const outputDir = path.join(root, "im-results", "generated-f5");
fs.mkdirSync(outputDir, { recursive: true });
try {
  // Genuine original solved-p57 rune bytes, artificially embedded to prove
  // this extractor/encoder pipeline works for a known 2014 JPEG carrier.
  const p57 = corpus.pages.find((p) => p.page === 57);
  assert(p57 && p57.indices.length === 95);
  const payload = Buffer.from("F5 SOURCE-POSITIVE; " +
    p57.indices.map((v) => corpus.runes[v]).join("") + "\n", "utf8");
  const payloadPath = path.join(tmp, "f5-positive-payload.bin");
  const plantedJpeg = path.join(tmp, "f5-positive.jpg");
  fs.writeFileSync(payloadPath, payload);
  const embed = java("Embed", [
    path.join(jpgRoot, "17.jpg"), plantedJpeg,
    "-e", payloadPath, "-p", "abc123", "-q", "83"
  ]);
  assert(embed.ok && fs.existsSync(plantedJpeg),
    "F5 positive JPEG embedding failed: " + embed.stdout + " " + embed.stderr);
  const plantedOut = path.join(tmp, "planted-recovered.bin");
  const planted = extract(plantedJpeg, "abc123", plantedOut);
  assert(planted.complete && fs.readFileSync(plantedOut).equals(payload),
    "Actual JPEG F5 embed/extract positive must exactly recover the p57 rune bytes: " +
    JSON.stringify(planted));
  console.log("POSITIVE PASS: original LP2 p0 JPEG F5-embedded solved-p57 GP bytes " +
    "recover exactly (" + payload.length + " bytes), SHA256 " + hash(payload));

  for (const scan of scans) {
    const name = String(scan).padStart(2, "0") + ".jpg";
    const carrier = path.join(jpgRoot, name);
    assert(fs.existsSync(carrier), "missing original JPEG " + name);
    for (let keyNo = 0; keyNo < passwords.length; keyNo++) {
      const destination = path.join(tmp, "candidate.bin");
      if (fs.existsSync(destination)) fs.unlinkSync(destination);
      const outcome = extract(carrier, passwords[keyNo], destination);
      const result = { scan, page: scan - 17, keyNo, key: passwords[keyNo], ...outcome };
      records.push(result);
      console.log("scan " + name + " key#" + keyNo + " expected=" + outcome.claimed +
        " actual=" + outcome.extracted + " complete=" + outcome.complete +
        " kind=" + outcome.signature + " sha=" + outcome.sha256.slice(0, 12));
    }
  }

  const hits = records.filter((r) => r.complete &&
    !["unidentified", "empty"].includes(r.signature));
  const result = {
    source: "Westfeld 2001 F5, Java source pinned to matthewgao/F5-steganography d08b5f83dd6794e4081dacaf92bae7ed2f6ea232",
    originalImages: all ? "LP2 physical pp0-57 all original images" : "twelve original LP2 image sentinels",
    scans, passwords, positive: { recovered: payload.length, sha256: hash(payload) },
    total: records.length,
    complete: records.filter((r) => r.complete).length,
    typedHits: hits,
    records
  };
  const jsonFile = path.join(outputDir, "lp2-f5-original-source-results.json");
  // Atomic replacement of intermediate output, which has no claimed proof.
  const stage = jsonFile + ".temporary-" + process.pid;
  fs.writeFileSync(stage, JSON.stringify(result, null, 2) + "\n");
  fs.renameSync(stage, jsonFile);
  console.log("FINAL " + JSON.stringify({
    images: scans.length, passes: records.length, complete: result.complete,
    typedHits: hits.length, hitPreviews: hits.map((r) =>
      ({ scan: r.scan, key: r.key, kind: r.signature, prefix: r.prefixHex }))
  }));
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
