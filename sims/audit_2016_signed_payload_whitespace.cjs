#!/usr/bin/env node
'use strict';

// Compare the original OutGuess extraction with the Jan 19, 2016 forum repost, and
// audit the 2017 signed warning. The parser handles both LF and CRLF cleartext headers.
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
  warning2017: path.join(root, 'resources/historical/cicada2017-yEiTHhvF.asc'),
};

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function parseClearSigned(text, label) {
  const separator = /\r?\n\r?\n/.exec(text);
  const signatureStart = text.indexOf('-----BEGIN PGP SIGNATURE-----');
  if (!separator || signatureStart < 0 || signatureStart <= separator.index) {
    throw new Error(label + ': malformed clear-signed message');
  }
  const body = text.slice(separator.index + separator[0].length, signatureStart);
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

function logicalBodyLines(body) {
  const lines = body.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  return lines;
}

function doubleSpaceRuns(body) {
  return logicalBodyLines(body).flatMap((line, i) =>
    [...line.matchAll(/ {2,}/g)].map(match => ({
      line: i + 1,
      column: match.index + 1,
      length: match[0].length,
      trailing: match.index + match[0].length === line.length,
    }))
  );
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
const warning2017Lines = logicalBodyLines(parsed.warning2017.body);
const warning2017BlankLines = warning2017Lines
  .map((line, i) => line === '' ? i + 1 : null)
  .filter(x => x !== null);
const warning2017Runs = doubleSpaceRuns(parsed.warning2017.body);

const result = {
  byteLengths: Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v.length])),
  rawSha256: Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, sha256(v)])),
  normalizedBodySha256: sha256(originalCanonical),
  normalizedBodiesEqual: originalCanonical.equals(forumCanonical),
  signaturePacketsEqual: parsed.original.signature === parsed.forum.signature,
  whitespace: {
    original: lineAudit(parsed.original.body),
    forum: lineAudit(parsed.forum.body),
  },
  lineEndings: {
    original: lineEndingAudit(text.original),
    forumExtract: lineEndingAudit(text.forum),
  },
  warning2017: {
    byteLength: raw.warning2017.length,
    rawSha256: sha256(raw.warning2017),
    normalizedBodySha256: sha256(canonicalBody(parsed.warning2017.body)),
    bodyLines: warning2017Lines,
    blankLineNumbers: warning2017BlankLines,
    doubleSpaceRuns: warning2017Runs,
    whitespace: lineAudit(parsed.warning2017.body),
    tabs: lineAudit(parsed.warning2017.body).tabs,
    lineEndings: lineEndingAudit(text.warning2017),
  },
};

const expected = {
  originalBytes: 1136,
  forumBytes: 1134,
  originalSha256: 'fe89e77519dfaca998a257ed39c2861303029de2a49183db00eea0fda3a28010',
  forumSha256: '778231d0918da31f8a28ddd727a92527f71487c53097520822085b34aab12e12',
  normalizedBodySha256: '19f5dccb7e188db0ef181eeeb85fef51defdb5667bf0b0393c28e638d871801a',
};
const checks = {
  originalBytes: result.byteLengths.original === expected.originalBytes,
  forumBytes: result.byteLengths.forum === expected.forumBytes,
  originalSha256: result.rawSha256.original === expected.originalSha256,
  forumSha256: result.rawSha256.forum === expected.forumSha256,
  normalizedBodySha256: result.normalizedBodySha256 === expected.normalizedBodySha256,
  normalizedBodiesEqual: result.normalizedBodiesEqual,
  signaturePacketsEqual: result.signaturePacketsEqual,
  twoInternalDoubleSpaces: JSON.stringify(result.whitespace.original.internalDoubleSpaceLines) === '[5,16]'
    && JSON.stringify(result.whitespace.forum.internalDoubleSpaceLines) === '[5,16]',
  trailingSpaceOnlyInOriginal: JSON.stringify(result.whitespace.original.trailingWhitespaceLines) === '[5]'
    && result.whitespace.forum.trailingWhitespaceLines.length === 0,
  warning2017Bytes: result.warning2017.byteLength === 970,
  warning2017CRLFOnly: result.warning2017.lineEndings.crlf === 23
    && result.warning2017.lineEndings.lf === 0 && result.warning2017.lineEndings.cr === 0,
  warning2017DoubleSpaceRuns: JSON.stringify(result.warning2017.doubleSpaceRuns) === JSON.stringify([
    { line: 1, column: 20, length: 2, trailing: false },
    { line: 1, column: 64, length: 2, trailing: true },
  ]),
  warning2017BlankLines: JSON.stringify(result.warning2017.blankLineNumbers) === '[2,4]',
  warning2017Footer: result.warning2017.bodyLines[2] === '3301',
  warning2017NoTabs: result.warning2017.tabs === 0,
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
