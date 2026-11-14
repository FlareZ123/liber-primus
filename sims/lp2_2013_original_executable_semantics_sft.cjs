"use strict";

/**
 * Source-exact 2013 CicadaOS bespoke-executable semantics, read-only SFT.
 * node sims/lp2_2013_original_executable_semantics_sft.cjs
 *
 * This tests the only two puzzle-specific scripts documented in the extracted
 * original rootfs. Generic TinyCore boot/system binaries are out of scope.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.join(__dirname, "..");
const FILES = {
  launcher: "resources/historical/cicada2013-os-original-cicada.sh",
  screen: "resources/historical/cicada2013-os-original-prime-echo.sh",
  message: "resources/historical/cicada2013-os-original-message.txt"
};

/** @param {string} file @returns {string} */
function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8").replace(/\r\n/g, "\n");
}

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  for (let p = 2; p * p <= n; p++) {
    if (n % p === 0) return false;
  }
  return true;
}

/** @param {string} text @returns {string} */
function sha256(text) {
  return crypto.createHash("sha256").update(Buffer.from(text, "utf8"))
    .digest("hex");
}

function main() {
  const launcher = read(FILES.launcher);
  const screen = read(FILES.screen);
  const message = read(FILES.message);
  const expectedLauncher = [
    "#!/bin/ash", "", "clear", "/usr/local/bin/prime_echo", "clear",
    "", "cat /usr/local/bin/message.txt", "", "sleep 10", "",
    "/sbin/reboot", ""
  ].join("\n");
  assert.equal(launcher, expectedLauncher);

  const expectedMessage = [
    "", "", "@1231507051321", "", "The key is all around you.",
    "", "Good luck.", "", "3301", "", "", ""
  ].join("\n");
  assert.equal(message, expectedMessage);

  const lines = screen.trimEnd().split("\n");
  assert.equal(lines[0], "#!/bin/ash ");
  assert.equal(lines[1], "");
  const commands = lines.slice(2);
  const actual = [];
  const pauses = [];
  const newlinePositions = [];
  for (const [index, line] of commands.entries()) {
    const parsed = /^(echo(?: -n)?(?:  | )")(\d+)\t("; sleep )((?:\.05)|2)$/.exec(line);
    assert(parsed, "Unexpected executable statement on index " + index + ": " + line);
    const prime = Number(parsed[2]);
    const delay = Number(parsed[4]);
    actual.push(prime);
    if (delay !== 0.05) pauses.push({prime, delay});
    if (parsed[1] === 'echo  "') newlinePositions.push(index + 1);
    else assert.equal(parsed[1], 'echo -n "', "Unknown output convention");
  }
  const expected = Array.from({length: 3300}, (_, i) => i + 2)
    .filter(isPrime);
  assert.equal(commands.length, 464);
  assert.deepEqual(actual, expected);
  assert.deepEqual(pauses, [
    {prime: 1033, delay: 2}, {prime: 3301, delay: 2}
  ]);
  assert.deepEqual(newlinePositions, Array.from({length: 46}, (_, i) =>
    (i + 1) * 10));
  const terminal = actual.map((n, i) =>
    String(n) + "\t" + ((i + 1) % 10 === 0 ? "\n" : "")).join("");
  assert(terminal.startsWith("2\t3\t5\t7\t11\t13\t17\t19\t23\t29\t\n"));
  assert(terminal.endsWith("3259\t3271\t3299\t3301\t"));
  console.log(JSON.stringify({
    source: FILES, originalSyntax: "tinycore busybox ash script",
    launcherSHA256: sha256(launcher),
    echoSHA256: sha256(screen), messageSHA256: sha256(message),
    expectedControl: "literal 464 primes 2..3301, fixed 1033/3301 pauses",
    primeCount: actual.length, first: actual.slice(0, 10),
    last: actual.slice(-10), pauses, newlineCount: newlinePositions.length,
    directKeyGenerationOrVariableRuntimeState: false,
    runesDecrypted: 0,
    scope: "two puzzle-specific archived rootfs scripts only"
  }, null, 2));
}

if (require.main === module) main();
module.exports = {main, isPrime};
