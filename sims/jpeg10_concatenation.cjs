"use strict";
/**
 * Detect exact nested JPEG-file concatenation in original LP1 scan 10.jpg.
 * The 10.jpg archive member contains its displayed JPEG followed byte-for-byte
 * by the separate files 11.jpg, 12.jpg, and 13.jpg. This is an archive-structure
 * observation, not a recovered LP2 key, ciphertext, or hidden passage.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const root = path.join(__dirname, "..", "resources", "liber-primus");
const image = (id) => fs.readFileSync(path.join(root, `${String(id).padStart(2, "0")}.jpg`));
const marker = Buffer.from([0xff, 0xd9]);

/** @param {Buffer} bytes @returns {{starts:number[],lengths:number[],sha256:string}} */
function inspect(bytes) {
  const starts = [], lengths = [];
  let pos = 0;
  for (let n = 0; n < 4; n++) {
    assert.deepEqual(bytes.subarray(pos, pos + 2), Buffer.from([0xff, 0xd8]));
    const endMarker = bytes.indexOf(marker, pos + 2);
    assert.ok(endMarker >= 0, "Each embedded JPEG must have an EOI marker");
    starts.push(pos);
    lengths.push(endMarker + 2 - pos);
    pos = endMarker + 2;
  }
  assert.equal(pos, bytes.length, "Exactly four JPEG segments with no extra padding");
  assert.deepEqual(starts, [0, 754662, 1467395, 2170823]);
  assert.deepEqual(lengths, [754662, 712733, 703428, 2070134]);
  return {starts, lengths, sha256: crypto.createHash("sha256").update(bytes).digest("hex")};
}

function run() {
  const source = image(10);
  const layout = inspect(source);
  assert.equal(layout.sha256, "12ebfe421c129f2ef78d527c1630e358963da8d8dfdf9620eb977980d7967376");
  for (let i = 1; i <= 3; i++) {
    const original = image(10 + i);
    const start = layout.starts[i], end = start + layout.lengths[i];
    assert.deepEqual(source.subarray(start, end), original, `Embedded JPEG ${i} differs from ${10 + i}.jpg`);
  }
  const result = {
    file: "10.jpg", bytes: source.length, sha256: layout.sha256,
    segments: layout.lengths.map((length, i) => ({
      offset: layout.starts[i], length,
      identicalToSeparateFile: i ? `${10 + i}.jpg` : null
    }))
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}
if (require.main === module) run();
module.exports = {inspect, run};
