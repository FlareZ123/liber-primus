"use strict";
/**
 * Original-source MP3Stego decoder test for Cicada 2014 Stage 7.
 *
 * Hypothesis: the original Stage 7 Interconnectedness MP3 carries a second
 * MP3Stego layer under the already source-recovered OpenPuff password 33011033.
 * This is deliberately one password, one pinned original carrier, and one
 * independently generated positive control. It is not a password sweep.
 *
 * Run through .github/workflows/manual-node22-sft-runner.yml.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const { execFileSync, spawnSync } = require("node:child_process");

const STAGE7_URL =
  "https://raw.githubusercontent.com/cijhho123/cicada3301/d360ad97d39c4719e42dc88b0cbbb81ed54aa02c/assets/2014/stage07/index.mp3";
const STAGE7_BLOB = "09fe068192b76a3697c47ec1d604b527703db798";
const STAGE7_SIGNED_URL =
  "https://raw.githubusercontent.com/cijhho123/cicada3301/d360ad97d39c4719e42dc88b0cbbb81ed54aa02c/assets/2014/stage07/q4utgdi2n4m4uim5.onion/index.html";
const STAGE7_SIGNED_BLOB = "afb1ae7b8ffe2def6d1cd7a2f7ce961e550331b9";
const INSTAR_URL =
  "https://raw.githubusercontent.com/rtkd/iddqd/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/2013/02/761.MP3";
const INSTAR_BLOB = "7e2bd299fbc7b96283219cf15e2904641daf631f";
const INSTAR_SHA256 = "83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460";
const MP3STEGO_REPO = "https://github.com/Charleswyt/MP3Stego.git";
const MP3STEGO_COMMIT = "9818638a1203853efdfa631006b96acca43efc58";

function sha256(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}
function gitBlobSha1(buf) {
  return crypto.createHash("sha1")
    .update(Buffer.from("blob " + buf.length + "\0", "ascii"))
    .update(buf)
    .digest("hex");
}
async function download(url) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error("Download failed " + response.status + " " + url);
  return Buffer.from(await response.arrayBuffer());
}
function parseSignedHex(buf) {
  const text = buf.toString("ascii");
  const match = text.match(
    /-----BEGIN PGP SIGNED MESSAGE-----\r?\nHash: [^\r\n]+\r?\n\r?\n([\s\S]*?)\r?\n-----BEGIN PGP SIGNATURE-----/
  );
  assert.ok(match, "2014 signed source must contain a clear-signed hexadecimal body");
  const hex = match[1].replace(/\s+/g, "");
  assert.equal(hex.length % 2, 0, "signed hexadecimal body must have even length");
  return Buffer.from(hex, "hex");
}
function synchsafe32(b, p) {
  return ((b[p] & 127) << 21) | ((b[p + 1] & 127) << 14) |
    ((b[p + 2] & 127) << 7) | (b[p + 3] & 127);
}
function inspectMp3(buf) {
  let start = 0;
  const frames = {};
  if (buf.toString("ascii", 0, 3) === "ID3") {
    const size = synchsafe32(buf, 6);
    start = 10 + size + ((buf[5] & 16) ? 10 : 0);
    let p = 10;
    while (p + 10 <= start) {
      const id = buf.toString("ascii", p, p + 4);
      const n = buf.readUInt32BE(p + 4);
      if (!/^[A-Z0-9]{4}$/.test(id) || n === 0 || p + 10 + n > start) break;
      const data = buf.subarray(p + 10, p + 10 + n);
      if ((id === "TIT2" || id === "TPE1") && data.length > 1) {
        frames[id] = data.subarray(1).toString("latin1").replace(/\0+$/g, "");
      }
      p += 10 + n;
    }
  }
  const bitrate = [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320,0];
  const rates = [44100,48000,32000,0];
  let first = null;
  for (let p = start; p + 4 <= Math.min(buf.length, start + 65536); p++) {
    const h = buf.readUInt32BE(p);
    if ((h >>> 21) !== 2047 || ((h >>> 19) & 3) !== 3 || ((h >>> 17) & 3) !== 1) continue;
    const bi = (h >>> 12) & 15, ri = (h >>> 10) & 3;
    if (bi === 0 || bi === 15 || ri === 3) continue;
    first = {
      offset: p,
      bitrateKbps: bitrate[bi],
      sampleRate: rates[ri],
      channelMode: (h >>> 6) & 3,
      headerHex: buf.subarray(p, p + 4).toString("hex")
    };
    break;
  }
  const ascii = buf.toString("latin1");
  const markers = ["LAME", "8hz", "MP3Stego", "Xing", "Info"]
    .map(marker => ({ marker, offset: ascii.indexOf(marker) }))
    .filter(x => x.offset >= 0);
  return { id3Bytes: start, id3TextFrames: frames, firstMpegFrame: first, encoderMarkers: markers };
}
function locateExe(root, basename) {
  const found = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== ".git") walk(full);
      } else if (entry.name.toLowerCase() === basename.toLowerCase()) {
        found.push(full);
      }
    }
  }
  walk(root);
  return found[0] || null;
}
function run(exe, args, cwd, timeout = 600000) {
  const result = spawnSync(exe, args, {
    cwd, encoding: "buffer", timeout, maxBuffer: 16 * 1024 * 1024,
    windowsHide: true
  });
  return {
    status: result.status,
    signal: result.signal,
    error: result.error ? String(result.error) : null,
    stdout: result.stdout ? result.stdout.toString("utf8") : "",
    stderr: result.stderr ? result.stderr.toString("utf8") : ""
  };
}
function summarizeOutput(dir, inputName) {
  const expected = path.join(dir, inputName + ".txt");
  const candidates = fs.existsSync(expected) ? [expected] :
    fs.readdirSync(dir).filter(x => /\.txt$/i.test(x) && x !== "payload.txt")
      .map(x => path.join(dir, x));
  if (!candidates.length) return { exists: false };
  const file = candidates[0], data = fs.readFileSync(file);
  const printable = data.length ? data.filter(x => x === 9 || x === 10 || x === 13 || (x >= 32 && x <= 126)).length / data.length : 0;
  return {
    exists: true, filename: path.basename(file), bytes: data.length,
    sha256: sha256(data), printableRatio: Number(printable.toFixed(4)),
    first64Hex: data.subarray(0, 64).toString("hex"),
    utf8Preview: data.length <= 4096 ? data.toString("utf8").slice(0, 1000) : null
  };
}

(async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "lp2-mp3stego-"));
  const stage7 = await download(STAGE7_URL);
  const signed = await download(STAGE7_SIGNED_URL);
  assert.equal(stage7.length, 6651873, "Stage7 original byte length");
  assert.equal(gitBlobSha1(stage7), STAGE7_BLOB, "Stage7 original Git blob identity");
  assert.equal(signed.length, 13526359, "signed Stage7 source length");
  assert.equal(gitBlobSha1(signed), STAGE7_SIGNED_BLOB, "signed Stage7 source Git blob identity");
  const signedDecoded = parseSignedHex(signed);
  assert.deepEqual(signedDecoded, stage7, "signed original hex body must reproduce index.mp3 byte-for-byte");
  fs.writeFileSync(path.join(root, "stage7.mp3"), stage7);

  const sourceDir = path.join(root, "MP3Stego");
  execFileSync("git", ["clone", "--no-checkout", MP3STEGO_REPO, sourceDir], { stdio: "pipe" });
  execFileSync("git", ["-C", sourceDir, "fetch", "--depth=1", "origin", MP3STEGO_COMMIT], { stdio: "pipe" });
  execFileSync("git", ["-C", sourceDir, "checkout", "--detach", "FETCH_HEAD"], { stdio: "pipe" });
  const checkedOut = execFileSync("git", ["-C", sourceDir, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  assert.equal(checkedOut, MP3STEGO_COMMIT, "pinned MP3Stego source commit");

  const vswhere = path.join(process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)",
    "Microsoft Visual Studio", "Installer", "vswhere.exe");
  let msbuild = null;
  if (fs.existsSync(vswhere)) {
    const found = execFileSync(vswhere, [
      "-latest", "-products", "*", "-requires", "Microsoft.Component.MSBuild",
      "-find", "MSBuild\\**\\Bin\\MSBuild.exe"
    ], { encoding: "utf8" }).trim().split(/\r?\n/).filter(Boolean);
    msbuild = found[0] || null;
  }
  if (!msbuild) {
    const found = spawnSync("where.exe", ["msbuild"], { encoding: "utf8" });
    if (found.status === 0) msbuild = found.stdout.trim().split(/\r?\n/)[0];
  }
  assert.ok(msbuild, "Visual Studio MSBuild must be present on windows-latest");
  const decoderProject = path.join(sourceDir, "MP3Stego", "Decoder", "Decode.vcxproj");
  const build = run(msbuild, [
    decoderProject, "/m", "/p:Configuration=Release", "/p:Platform=Win32",
    "/p:PlatformToolset=v143", "/v:minimal"
  ], path.join(sourceDir, "MP3Stego", "Decoder"), 600000);
  assert.equal(build.status, 0, "MP3Stego decoder build failed: " + build.stdout + "\n" + build.stderr);
  const decoder = locateExe(sourceDir, "Decode.exe");
  assert.ok(decoder, "built Decode.exe");

  const sampleMp3 = fs.readFileSync(path.join(sourceDir, "MP3Stego", "Encoder", "stego.mp3"));
  const sampleExpected = fs.readFileSync(path.join(sourceDir, "MP3Stego", "Encoder", "Release", "hidden_text.txt"));
  const samplePasswordBytes = fs.readFileSync(path.join(sourceDir, "MP3Stego", "Encoder", "Release", "msg.txt"));
  const samplePassword = samplePasswordBytes.toString("ascii").trim();
  assert.equal(gitBlobSha1(sampleMp3), "e17ee74b532bf72c668093f6a3ac3adb27ce7212", "MP3Stego sample MP3 identity");
  assert.equal(gitBlobSha1(sampleExpected), "4f886bcff121e85eb82fc03841c756a755d5e19c", "MP3Stego sample plaintext identity");
  assert.equal(gitBlobSha1(samplePasswordBytes), "790be1ca56e82d6a297f325ed4eef67f06a77740", "MP3Stego sample password identity");
  const controlDir = path.join(root, "positive-control");
  fs.mkdirSync(controlDir);
  fs.writeFileSync(path.join(controlDir, "sample.mp3"), sampleMp3);
  const decodeControl = run(decoder, ["-X", "-P", samplePassword, "sample.mp3"], controlDir);
  const positive = summarizeOutput(controlDir, "sample.mp3");
  assert.ok(positive.exists, "MP3Stego sample positive-control output exists: " + decodeControl.stdout + decodeControl.stderr);
  assert.deepEqual(fs.readFileSync(path.join(controlDir, positive.filename)), sampleExpected,
    "MP3Stego decoder must recover the repository's known sample plaintext exactly");

  const instar = await download(INSTAR_URL);
  assert.equal(instar.length, 4010732, "2013 761.MP3 original byte length");
  assert.equal(gitBlobSha1(instar), INSTAR_BLOB, "2013 761.MP3 original Git blob identity");
  assert.equal(sha256(instar), INSTAR_SHA256, "2013 761.MP3 original SHA-256 identity");

  function decodeCandidate(label, bytes, password, index) {
    const dir = path.join(root, label + "-candidate-" + index);
    fs.mkdirSync(dir);
    const filename = label + ".mp3";
    fs.writeFileSync(path.join(dir, filename), bytes);
    const result = run(decoder, ["-X", "-P", password, filename], dir);
    return {
      label, password, status: result.status, error: result.error,
      stdout: result.stdout.slice(-2500), stderr: result.stderr.slice(-2500),
      output: summarizeOutput(dir, filename)
    };
  }
  const stage7Candidates = ["33011033", "3301", "Interconnectedness"]
    .map((password, i) => decodeCandidate("stage7", stage7, password, i));
  const instarCandidates = ["3301", "The Instar Emergence", "Parable 1,595,277,641"]
    .map((password, i) => decodeCandidate("761", instar, password, i));
  const allCandidates = stage7Candidates.concat(instarCandidates);

  console.log(JSON.stringify({
    sources: {
      stage7: {
        url: STAGE7_URL, gitBlobSha1: gitBlobSha1(stage7), bytes: stage7.length,
        sha256: sha256(stage7), signedHexBlobSha1: gitBlobSha1(signed),
        signedHexBytes: signed.length, signedHexRoundTrip: true, mp3: inspectMp3(stage7)
      },
      instar761: {
        url: INSTAR_URL, gitBlobSha1: gitBlobSha1(instar), bytes: instar.length,
        sha256: sha256(instar), mp3: inspectMp3(instar)
      }
    },
    decoder: {
      repository: MP3STEGO_REPO, commit: checkedOut, msbuild,
      positiveControl: {
        buildStatus: build.status, decodeStatus: decodeControl.status,
        samplePassword: samplePassword, sampleMp3Bytes: sampleMp3.length,
        output: positive, exactRecovery: true
      }
    },
    sourceSelectedPasswordTests: {
      stage7: stage7Candidates,
      instar761: instarCandidates
    },
    interpretation: allCandidates.some(x => x.output.exists && x.output.bytes > 0)
      ? "At least one source-selected password produced non-empty decoder output. Inspect its bytes and plaintext before classifying it as a payload."
      : "No non-empty MP3Stego output was recovered from either original audio under the six source-selected passwords. This does not exclude an unlocated password or other steganography."
  }, null, 2));
})().catch(err => {
  console.error(err && err.stack ? err.stack : String(err));
  process.exitCode = 1;
});
