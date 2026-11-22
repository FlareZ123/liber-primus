"use strict";

/**
 * Director #1545: source-pinned census of preserved 2013 DH records.
 *
 * Companion workflow checks out cicada-solvers/neuroretransmit-cicada at
 * ade9a02889ef8acbc8cde8edbfd0a785c369f4c3 as external-cicada.
 *
 * Run:
 *   node sims/lp2_2013_dh_session_census_sft.cjs external-cicada
 *
 * Node.js 22, CommonJS, standard library only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {TextDecoder} = require("node:util");

const root = path.resolve(process.argv[2] || "external-cicada");
assert.ok(fs.existsSync(root), "pinned external archive checkout missing");
const decoder = new TextDecoder("utf-8", {fatal: true});

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

/** @param {string} line @returns {string | null} */
function timestamp(line) {
  const iso = line.match(/^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d(?:\.\d+)?)/u);
  if (iso) return iso[1];
  const human = line.match(/^(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+\w+\s+\d+\s+\d\d:\d\d:\d\d\s+\d{4}/u);
  return human ? human[0] : null;
}

/**
 * Parse the complete server-side participant log format.
 * @param {string[]} lines
 * @param {number} i
 */
function parseClientLog(lines, i) {
  const window = lines.slice(i, i + 7);
  const selected = window.join("\n").match(/Selected base (\d+) and secret (\d+)/u);
  const ok = window.join("\n").match(/Sending line: '01 OK (\d+) (\d+)'/u);
  const client = window.join("\n").match(/Received line: '(\d+)\\r\\n'/u);
  const shared = window.join("\n").match(/Sending line: '03 DATA (\d+)'/u);
  assert(selected && ok && client && shared, "complete clientlog exchange expected");
  assert.equal(Number(selected[1]), Number(ok[1]), "base mismatch");
  return {
    base: Number(selected[1]),
    serverSecret: Number(selected[2]),
    serverPublic: Number(ok[2]),
    clientPublic: Number(client[1]),
    shared: Number(shared[1])
  };
}

/**
 * Parse the preserved invitation input trace. The transcript records the
 * client command and later client public share, but not the server parameters.
 * @param {string[]} lines
 * @param {number} i
 */
function parseInvitationTrace(lines, i) {
  for (let j = i + 1; j < Math.min(lines.length, i + 6); j++) {
    const m = lines[j].match(/^(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+\w+\s+\d+\s+\d\d:\d\d:\d\d\s+\d{4}\t(\d+)\s*$/u);
    if (m) return {clientPublic: Number(m[1]), clientTimestamp: timestamp(lines[j])};
  }
  throw new Error("invitation client share missing");
}

function modPow(base, exponent, modulus) {
  let result = 1n;
  let b = BigInt(base) % BigInt(modulus);
  let e = BigInt(exponent);
  const m = BigInt(modulus);
  while (e > 0n) {
    if (e & 1n) result = (result * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return result;
}

function modInverse(value, modulus) {
  let oldR = BigInt(value);
  let r = BigInt(modulus);
  let oldS = 1n;
  let s = 0n;
  while (r !== 0n) {
    const q = oldR / r;
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  assert.equal(oldR, 1n, "modular inverse requires coprime values");
  return ((oldS % BigInt(modulus)) + BigInt(modulus)) % BigInt(modulus);
}

function discreteLogBsgs(base, target, modulus, order) {
  const g = BigInt(base);
  const h = BigInt(target);
  const p = BigInt(modulus);
  const n = BigInt(order);
  const m = BigInt(Math.ceil(Math.sqrt(Number(n))));
  const baby = new Map();
  let value = 1n;
  for (let j = 0n; j < m; j += 1n) {
    baby.set(value.toString(), j);
    value = (value * g) % p;
  }
  const giantFactor = modPow(modInverse(g, p), m, p);
  let gamma = h;
  for (let i = 0n; i <= m; i += 1n) {
    const j = baby.get(gamma.toString());
    if (j !== undefined) {
      const candidate = i * m + j;
      if (candidate < n && modPow(g, candidate, p) === h) return Number(candidate);
    }
    gamma = (gamma * giantFactor) % p;
  }
  throw new Error("discrete logarithm not found within asserted group order");
}

function isPrime(n) {
  if (!Number.isSafeInteger(n) || n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) {
    if (n % d === 0) return false;
  }
  return true;
}

const files = walk(root).filter(full => {
  const rel = path.relative(root, full).replaceAll("\\", "/");
  return rel.startsWith("2013/") || /^irc-logs\/clientlog-.*\.txt$/u.test(rel);
});

const hits = [];
for (const full of files) {
  const stat = fs.statSync(full);
  if (stat.size > 35_000_000) continue;
  let text;
  try {
    text = decoder.decode(fs.readFileSync(full));
  } catch {
    continue;
  }
  const rel = path.relative(root, full).replaceAll("\\", "/");
  const lines = text.split(/\r?\n/u);
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/\bDH\s+(\d+)\b/iu);
    if (!match) continue;
    const modulus = Number(match[1]);
    let recordType;
    let fields = {};
    if (/^irc-logs\/clientlog-/u.test(rel)) {
      recordType = "complete-participant-exchange";
      fields = parseClientLog(lines, i);
    } else if (rel === "2013/008-invitation/Nj8gDqFG") {
      recordType = "partial-client-trace";
      fields = parseInvitationTrace(lines, i);
    } else if (rel === "2013/007-fourth-onion/README.md" && /\bexecuting 'dh /iu.test(lines[i])) {
      recordType = "status-only-execution";
    } else if (rel === "2013/007-fourth-onion/README.md" && /C:\s*DH\s+/iu.test(lines[i])) {
      recordType = "protocol-example";
      const block = lines.slice(i, i + 5).join("\n");
      const server = block.match(/S:\s*01 OK (\d+) (\d+)/u);
      const client = block.match(/C:\s*(\d+)<CRLF>/u);
      const shared = block.match(/S:\s*03 DATA (\d+)/u);
      assert(server && client && shared, "protocol example fields");
      fields = {
        base: Number(server[1]),
        serverPublic: Number(server[2]),
        clientPublic: Number(client[1]),
        shared: Number(shared[1])
      };
    } else {
      recordType = "unclassified-textual-hit";
    }
    hits.push({
      path: rel,
      line: i + 1,
      timestamp: timestamp(lines[i]),
      modulus,
      recordType,
      ...fields
    });
  }
}

hits.sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line);

const complete = hits.filter(hit => hit.recordType === "complete-participant-exchange");
const partial = hits.filter(hit => hit.recordType === "partial-client-trace");
const status = hits.filter(hit => hit.recordType === "status-only-execution");
const examples = hits.filter(hit => hit.recordType === "protocol-example");
const unclassified = hits.filter(hit => hit.recordType === "unclassified-textual-hit");

assert.equal(unclassified.length, 0);
assert.equal(hits.length, 9);
assert.equal(examples.length, 1);
assert.equal(status.length, 3);
assert.equal(partial.length, 2);
assert.equal(complete.length, 3);
assert.deepEqual(
  complete.map(hit => [hit.modulus, hit.base, hit.serverSecret, hit.serverPublic, hit.clientPublic, hit.shared]),
  [
    [118818811, 65551251, 65974449, 76477436, 123, 8686271],
    [5, 3, 3, 2, 3, 2],
    [3301, 2757, 331, 1264, 2800, 1067]
  ]
);
assert.deepEqual(partial.map(hit => hit.clientPublic), [3034, 3034]);

const fileSizeExchange = complete.find(hit => hit.modulus === 118818811);
assert.ok(fileSizeExchange, "January 118818811 DH exchange missing");
assert.deepEqual(
  [
    fileSizeExchange.base,
    fileSizeExchange.serverSecret,
    fileSizeExchange.serverPublic,
    fileSizeExchange.clientPublic,
    fileSizeExchange.shared
  ],
  [65551251, 65974449, 76477436, 123, 8686271]
);

const pFile = 118818811;
const gFile = 65551251;
const bFile = 65974449;
const clientPublicFile = 123;
const sharedFile = 8686271;
assert.ok(isPrime(pFile), "file-size modulus must be prime");
const pMinusOneFactors = [2, 3, 5, 11, 257, 467];
const factorProduct = 2n * 3n ** 2n * 5n * 11n * 257n * 467n;
assert.equal(factorProduct, BigInt(pFile - 1), "p-1 factorization");
for (const q of pMinusOneFactors) {
  assert.notEqual(
    modPow(gFile, BigInt((pFile - 1) / q), pFile),
    1n,
    "base must have full multiplicative order"
  );
}
const fileBaseOrder = pFile - 1;
const clientExponentFile = discreteLogBsgs(
  gFile,
  clientPublicFile,
  pFile,
  fileBaseOrder
);
assert.equal(clientExponentFile, 44073865);
assert.equal(modPow(gFile, clientExponentFile, pFile), BigInt(clientPublicFile));
assert.equal(modPow(gFile, bFile, pFile), BigInt(fileSizeExchange.serverPublic));
assert.equal(modPow(clientPublicFile, bFile, pFile), BigInt(sharedFile));

const explicitClientShares = [...complete, ...partial].map(hit => hit.clientPublic);
assert.equal(explicitClientShares.filter(value => value === 2800).length, 1);

console.log(JSON.stringify({
  archiveCommit: "ade9a02889ef8acbc8cde8edbfd0a785c369f4c3",
  scannedCandidateFiles: files.length,
  textualDhRecords: hits.length,
  census: {
    protocolExamples: examples.length,
    statusOnlyExecutions: status.length,
    partialClientTraces: partial.length,
    completeParticipantExchanges: complete.length,
    explicitClientShareRecords: explicitClientShares.length,
    clientShare2800Records: explicitClientShares.filter(value => value === 2800).length
  },
  complete,
  partial,
  status,
  protocolExamples: examples,
  fileSizeDhDerivation: {
    modulus: pFile,
    modulusIsPrime: true,
    pMinusOneFactorization: "2 × 3^2 × 5 × 11 × 257 × 467",
    base: gFile,
    baseOrder: fileBaseOrder,
    clientPublic: clientPublicFile,
    uniqueClientExponent: clientExponentFile,
    serverSecret: bFile,
    serverPublic: fileSizeExchange.serverPublic,
    sharedValue: sharedFile,
    verified: true
  },
  conclusion: "2800 is unique among preserved explicit client-share records; the January 118818811 session also yields a unique client exponent because its participant-selected base is a primitive root modulo the file-size prime"
}, null, 2));
