"use strict";
/**
 * Read-only original 2013 Cicada OS initramfs inventory.
 * Input: directory extracted from pinned original boot/3301.img; no networking.
 * Usage: node sims/cicada2013_os_full_rootfs_inventory_sft.cjs DIRECTORY
 * The source archive is identified by the workflow's Git blob-SHA guard.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(process.argv[2]);
const expected = {
  "tmp/folly": "62b1b949a1e4e4a346e75b1c34101000d3c53220",
  "tmp/wisdom": "62b1b949a1e4e4a346e75b1c34101000d3c53220",
  "usr/local/bin/cicada": "d4798f10c44efc34cdf651d5054d2a7663c8e8a4",
  "usr/local/bin/prime_echo": "65a569cf1b3eecb0f7c17ffc569a54ed8ecdf649",
  "usr/local/bin/message.txt": "93484d6a3612eb8032d4c38bf7ff3da0d358e9ac",
  "usr/local/bin/message.txt.asc": "2efa3c9fbf1e15742899ac35672ad56f91e9e9d4"
};
/** @param {Buffer} b @returns {string} */
function gitBlob(b) {
  return crypto.createHash("sha1")
    .update(Buffer.from("blob " + b.length + "\0"))
    .update(b).digest("hex");
}
/** @type {string[]} */
const paths = [];
/** @type {string[]} */
const symlinks = [];
/** @param {string} rel */
function walk(rel) {
  const full = path.join(root, rel);
  for (const entry of fs.readdirSync(full, {withFileTypes: true}).sort((a,b)=>a.name.localeCompare(b.name))) {
    const next = path.posix.join(rel, entry.name);
    if (entry.isDirectory()) walk(next);
    else if (entry.isSymbolicLink()) symlinks.push(next);
    else if (entry.isFile()) paths.push(next);
  }
}
walk("");
const verified = [];
for (const [rel, sha] of Object.entries(expected)) {
  assert.ok(paths.includes(rel), "Missing original file " + rel);
  const bytes = fs.readFileSync(path.join(root, rel));
  assert.equal(gitBlob(bytes), sha, "Original byte drift: " + rel);
  verified.push({path: rel, bytes: bytes.length, git_blob_sha1: sha,
    sha256: crypto.createHash("sha256").update(bytes).digest("hex")});
}
const script = fs.readFileSync(path.join(root, "usr/local/bin/prime_echo"), "utf8");
const entries = [];
for (const line of script.split(/\r?\n/)) {
  const m = line.match(/^echo(?:\s+-n)?\s+"(\d+)\s*";\s*sleep\s+([\d.]+)/);
  if (m) entries.push({prime: Number(m[1]), wait: Number(m[2])});
  else assert.ok(!line.trim() || line.startsWith("#!"), "Unexpected command: " + line);
}
const actual = entries.map(x => x.prime);
const primes = [];
for (let n = 2; n <= 3301; n++) {
  let isPrime = true;
  for (let d = 2; d*d <= n; d++) if (n%d===0) {isPrime=false; break;}
  if (isPrime) primes.push(n);
}
assert.deepEqual(actual, primes);
assert.equal(entries.length, 464);
assert.deepEqual(entries.filter(x=>x.wait!==0.05),
  [{prime:1033,wait:2},{prime:3301,wait:2}]);
const starter = fs.readFileSync(path.join(root,"usr/local/bin/cicada"),"utf8");
assert.match(starter, /\/usr\/local\/bin\/prime_echo/);
assert.match(starter, /cat \/usr\/local\/bin\/message\.txt/);
assert.match(starter, /\/sbin\/reboot/);
const message = fs.readFileSync(path.join(root,"usr/local/bin/message.txt"),"utf8");
assert.match(message, /@1231507051321/);
assert.match(message, /The key is all around you\./);
const candidateName = /cicada|prime.?echo|wisdom|folly|message\.txt|3301|1033|761|instar|onion|puzzle|rune|gematria|parable/i;
const candidatePaths = paths.filter(p => candidateName.test(p));
const sourceReferences = [];
for (const rel of paths) {
  if (!/^(etc\/|opt\/|home\/|root\/|usr\/local\/)/.test(rel)) continue;
  const full = path.join(root, rel), size = fs.statSync(full).size;
  if (size > 262144) continue;
  const b = fs.readFileSync(full);
  if (b.includes(0)) continue;
  const lines = b.toString("utf8").split(/\r?\n/);
  const hits = lines.map((line,i)=>({line:i+1,text:line.trim().slice(0,250)}))
    .filter(x => /prime_echo|\/usr\/local\/bin\/cicada|@1231507051321|The key is all around you|(^|\W)1033(\W|$)|(^|\W)3301(\W|$)/.test(x.text));
  if (hits.length) sourceReferences.push({path:rel,hits:hits.slice(0,6),hit_count:hits.length});
}
console.log(JSON.stringify({
  source:"neuroretransmit/cicada@ade9a02889ef8acbc8cde8edbfd0a785c369f4c3",
  original_initramfs_git_blob_sha1:"d4dba9a6d3c0d6ed751d71cdc484e4b7efe1ee0a",
  file_count:paths.length,
  symlink_count:symlinks.length,
  custom_name_candidates:candidatePaths,
  relevant_source_references:sourceReferences,
  original_source_blobs:verified,
  prime_echo:{prime_count:entries.length,first:actual[0],last:actual[actual.length-1],
    special_delays:entries.filter(x=>x.wait!==0.05)},
  interpretation:"Whole initramfs source inventory, fixed unmodified bytes. Filename and text matches are leads, not proof of a key or decoder."
},null,2));
