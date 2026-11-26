'use strict';
/**
 * Extracts the public 2012 "The leaked email.docx" artifact without changing it.
 * Verifies the pinned Git blob before reading OOXML. Email addresses and IPs are
 * redacted in displayed text; long numeric tokens and surrounding context remain.
 * Node.js 22, built-in modules only.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const zlib = require('node:zlib');

const source = {
  url: 'https://raw.githubusercontent.com/cijhho123/cicada3301/d360ad97d39c4719e42dc88b0cbbb81ed54aa02c/2012/additional%20docs/The%20Leaked%20Email/The%20leaked%20email.docx',
  bytes: 24079,
  gitBlobSha1: '2362e1a3073d0f5025e96c140f1366986977a8f2'
};

function gitBlobSha1(buf) {
  return crypto.createHash('sha1')
    .update(Buffer.from('blob ' + buf.length + '\0', 'ascii'))
    .update(buf).digest('hex');
}
function zipEntries(buf) {
  let eocd = -1;
  for (let i = Math.max(0, buf.length - 65557); i <= buf.length - 22; i++) {
    if (buf.readUInt32LE(i) === 0x06054b50) eocd = i;
  }
  assert.notEqual(eocd, -1, 'ZIP end-of-central-directory not found');
  const count = buf.readUInt16LE(eocd + 10);
  let pos = buf.readUInt32LE(eocd + 16);
  const entries = new Map();
  for (let n = 0; n < count; n++) {
    assert.equal(buf.readUInt32LE(pos), 0x02014b50, 'bad central-directory signature');
    const method = buf.readUInt16LE(pos + 10);
    const compressedSize = buf.readUInt32LE(pos + 20);
    const uncompressedSize = buf.readUInt32LE(pos + 24);
    const nameLength = buf.readUInt16LE(pos + 28);
    const extraLength = buf.readUInt16LE(pos + 30);
    const commentLength = buf.readUInt16LE(pos + 32);
    const localOffset = buf.readUInt32LE(pos + 42);
    const name = buf.toString('utf8', pos + 46, pos + 46 + nameLength);
    pos += 46 + nameLength + extraLength + commentLength;

    assert.equal(buf.readUInt32LE(localOffset), 0x04034b50, 'bad local-file signature');
    const localNameLength = buf.readUInt16LE(localOffset + 26);
    const localExtraLength = buf.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = buf.subarray(dataStart, dataStart + compressedSize);
    let data;
    if (method === 0) data = Buffer.from(compressed);
    else if (method === 8) data = zlib.inflateRawSync(compressed);
    else throw new Error('unsupported ZIP compression method ' + method + ' for ' + name);
    assert.equal(data.length, uncompressedSize, 'uncompressed length mismatch for ' + name);
    entries.set(name, data);
  }
  return entries;
}
function xmlText(xml) {
  return xml
    .replace(/<w:tab\b[^>]*\/>/g, '\t')
    .replace(/<w:br\b[^>]*\/>/g, '\n')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}
function redact(s) {
  return s
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email redacted]')
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[IP redacted]');
}
async function main() {
  const response = await fetch(source.url);
  assert.equal(response.status, 200, 'HTTP ' + response.status);
  const raw = Buffer.from(await response.arrayBuffer());
  assert.equal(raw.length, source.bytes, 'source byte count');
  const sha = gitBlobSha1(raw);
  assert.equal(sha, source.gitBlobSha1, 'source Git blob SHA-1');
  const entries = zipEntries(raw);
  console.log('SOURCE VERIFIED ' + JSON.stringify({bytes:raw.length,gitBlobSha1:sha,entries:entries.size}));

  const textParts = [];
  for (const name of ['word/document.xml','word/header1.xml','word/footer1.xml','word/footnotes.xml','word/endnotes.xml','word/comments.xml']) {
    if (entries.has(name)) textParts.push('--- ' + name + ' ---\n' + xmlText(entries.get(name).toString('utf8')));
  }
  const extracted = textParts.join('\n');
  console.log('--- REDACTED OOXML TEXT ---\n' + redact(extracted));
  const nums = [...new Set([...extracted.matchAll(/\b\d{8,}\b/g)].map(m=>m[0]))];
  console.log('--- LONG NUMERIC TOKENS (context redacted) ---');
  for (const n of nums) {
    const i = extracted.indexOf(n);
    console.log(n + ' :: ' + redact(extracted.slice(Math.max(0,i-100),Math.min(extracted.length,i+n.length+100)).replace(/\s+/g,' ')));
  }
  console.log('--- EMBEDDED MEDIA ---');
  for (const [name,data] of entries) {
    if (/^word\/media\//.test(name)) {
      console.log(JSON.stringify({name,bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex'),base64:data.toString('base64')}));
    }
  }
  console.log('--- PACKAGE PARTS ---');
  for (const [name,data] of entries) console.log(name + ' ' + data.length);
}
main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
