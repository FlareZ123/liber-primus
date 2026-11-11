#!/usr/bin/env node
'use strict';

// Compare the original OutGuess extraction with the Jan 19, 2016 forum repost.
// OpenPGP cleartext canonicalization strips trailing spaces/tabs and normalizes
// line endings; internal repeated spaces remain signed. The body here has no
// dash-escaped lines, so that part of the RFC 4880 canonicalization is moot.

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const files = {
  original: path.join(root, 'resources/historical/cicada2016-4gq25-outguess.asc'),
  forum: path.join(root, 'im-results/2016-forum-witness-extract.asc'),
};

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function parseClearSigned(text, label) {
  const separator = text.indexOf('\n\n');
  const signatureStart = text.indexOf('-----BEGIN PGP SIGNATURE-----');
  if (separator < 0 || signatureStart < 0 || signatureStart <= separator) {
    throw new Error(label + ': malformed clear-signed message');
  }
  const body = text.slice(separator + 2, signatureStart);
  if (body.split(/\r\n|\n|\r/).some(line => line.startsWith('-'))) {
    throw new Error(label + ': dash-escaped body line needs explicit handling');
  }
  return {
    body,
    signature: text.slice(signatureStart).trim(),
  };
}

function canonicalBody(body) {
  const lines = body
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.replace(/[ \t]+$/g, ''));
  return Buffer.from(lines.join('\r\n'), 'ascii');
}

function lineAudit(body) {
  const lines = body.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  return {
    internalDoubleSpaceLines: lines
      .map((line, i) => line.includes('  ') ? i + 1 : null)
      .filter(x => x !== null),
    trailingWhitespaceLines: lines
      .map((line, i) => /[ \t]+$/.test(line) ? i + 1 : null)
      .filter(x => x !== null),
    tabs: (body.match(/\t/g) || []).length,
  };
}

function lineEndingAudit(text) {
  return {
    crlf: (text.match(/\r\n/g) || []).length,
    lf: (text.match(/(?<!\r)\n/g) || []).length,
    cr: (text.match(/\r(?!\n)/g) || []).length,
  };
}

const raw = Object.fromEntries(
  Object.entries(files).map(([name, file]) => [name, fs.readFileSync(file)])
);
const text = Object.fromEntries(
  Object.entries(raw).map(([name, bytes]) => [name, bytes.toString('ascii')])
);
const parsed = Object.fromEntries(
  Object.entries(text).map(([name, value]) => [name, parseClearSigned(value, name)])
);
const originalCanonical = canonicalBody(parsed.original.body);
const forumCanonical = canonicalBody(parsed.forum.body);

const result = {
  byteLengths: Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v.length])),
  rawSha256: Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, sha256(v)])),
  canonicalSignedBodySha256: sha256(originalCanonical),
  canonicalSignedBodiesEqual: originalCanonical.equals(forumCanonical),
  signaturePacketsEqual: parsed.original.signature === parsed.forum.signature,
  whitespace: {
    original: lineAudit(parsed.original.body),
    forum: lineAudit(parsed.forum.body),
  },
  lineEndings: {
    original: lineEndingAudit(text.original),
    forumExtract: lineEndingAudit(text.forum),
  },
};

const expected = {
  originalBytes: 1136,
  forumBytes: 1134,
  originalSha256: 'fe89e77519dfaca998a257ed39c2861303029de2a49183db00eea0fda3a28010',
  forumSha256: '778231d0918da31f8a28ddd727a92527f71487c53097520822085b34aab12e12',
  canonicalBodySha256: '60f2d61d7ab5b4c0a13297332d5c0225fe8a9e985d571fbf7f85804ebd38be51',
};
const checks = {
  originalBytes: result.byteLengths.original === expected.originalBytes,
  forumBytes: result.byteLengths.forum === expected.forumBytes,
  originalSha256: result.rawSha256.original === expected.originalSha256,
  forumSha256: result.rawSha256.forum === expected.forumSha256,
  canonicalBodySha256: result.canonicalSignedBodySha256 === expected.canonicalBodySha256,
  canonicalSignedBodiesEqual: result.canonicalSignedBodiesEqual,
  signaturePacketsEqual: result.signaturePacketsEqual,
  twoInternalDoubleSpaces: JSON.stringify(result.whitespace.original.internalDoubleSpaceLines) === '[5,16]'
    && JSON.stringify(result.whitespace.forum.internalDoubleSpaceLines) === '[5,16]',
  trailingSpaceOnlyInOriginal: JSON.stringify(result.whitespace.original.trailingWhitespaceLines) === '[5]'
    && result.whitespace.forum.trailingWhitespaceLines.length === 0,
};
result.checks = checks;
result.pass = Object.values(checks).every(Boolean);
console.log(JSON.stringify(result, null, 2));

if (!result.pass) process.exitCode = 1;

if (process.argv.includes('--verify-gpg')) {
  for (const [name, file] of Object.entries(files)) {
    const check = spawnSync('gpg', ['--verify', file], { encoding: 'utf8' });
    console.log(JSON.stringify({
      gpgFile: name,
      exitCode: check.status,
      stdout: check.stdout.trim(),
      stderr: check.stderr.trim(),
    }, null, 2));
    if (check.status !== 0) process.exitCode = 1;
  }
}
