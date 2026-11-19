"use strict";

/**
 * Matched-key null for the source-motivated p28 OutGuess READ OUT test.
 *
 * Requires historical OutGuess 0.2 in PATH. The 100 controls are deterministic
 * eight-character uppercase keys with a space in the same position as READ OUT.
 */

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const image = path.join(root, "resources/liber-primus/45.jpg");
assert.ok(fs.existsSync(image));

/**
 * @param {number} initial
 * @returns {() => number}
 */
function xorshift32(initial) {
  let state = initial >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 4294967296;
  };
}

/**
 * @param {string} key
 * @param {number} index
 * @returns {{key:string,status:number|null,signal:string|null,size:number,sha256:string|null,seed:number|null,len:number|null}}
 */
function retrieve(key, index) {
  const output = path.join(os.tmpdir(), `agent1-outguess-${process.pid}-${index}.bin`);
  try {
    fs.rmSync(output, { force: true });
    const run = spawnSync(
      "outguess",
      ["-k", key, "-r", image, output],
      { encoding: "utf8", maxBuffer: 1024 * 1024 }
    );
    const stat = fs.existsSync(output) ? fs.statSync(output) : null;
    const size = stat ? stat.size : 0;
    const sha256 = size
      ? crypto.createHash("sha256").update(fs.readFileSync(output)).digest("hex")
      : null;
    const match = (run.stderr || "").match(/Steg retrieve: seed: (\d+), len: (\d+)/u);
    return {
      key,
      status: run.status,
      signal: run.signal,
      size,
      sha256,
      seed: match ? Number(match[1]) : null,
      len: match ? Number(match[2]) : null,
    };
  } finally {
    fs.rmSync(output, { force: true });
  }
}

const target = retrieve("READ OUT", -1);
assert.equal(target.key.length, 8);
assert.equal(target.status, 0);
assert.equal(target.size, 49080);
assert.equal(target.sha256, "3063548afed806148ae0e4b9208c7cb2d6c7e0fd3c2ea327e2f2b7d7b526f7f6");

const random = xorshift32(0x52454144);
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const controls = [];
const seen = new Set(["READ OUT"]);
for (let i = 0; controls.length < 100; i += 1) {
  let key = "";
  for (let j = 0; j < 7; j += 1) {
    key += alphabet[Math.floor(random() * alphabet.length)];
  }
  key = key.slice(0, 4) + " " + key.slice(4);
  if (seen.has(key)) continue;
  seen.add(key);
  controls.push(retrieve(key, i));
}

const clean = controls.filter((row) => row.status === 0 && row.size > 0);
const crashes = controls.filter((row) => row.signal === "SIGFPE" || row.status === 136);
const empty = controls.filter((row) => row.size === 0);
const sizes = clean.map((row) => row.size).sort((a, b) => a - b);

console.log(JSON.stringify({
  status: "PASS",
  outguess: "historical 0.2 required",
  target,
  controls: {
    n: controls.length,
    cleanNonempty: clean.length,
    crashLike: crashes.length,
    empty: empty.length,
    cleanRate: clean.length / controls.length,
    sizes: clean.length ? {
      min: sizes[0],
      median: sizes[Math.floor(sizes.length / 2)],
      max: sizes[sizes.length - 1],
    } : null,
    firstClean: clean.slice(0, 10),
  },
  decision:
    clean.length <= 5
      ? "READ OUT clean extraction is selective under this matched-key null"
      : "clean extraction is common under wrong keys; do not treat target bytes as authenticated payload",
}, null, 2));
