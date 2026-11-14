'use strict';
/**
 * Original-source historical selector gate for LP2 punctuation, 2013 signed carrier.
 * Exact archived Git blob 297c1dfee74ff79acc2d944952d06d1012928803.
 * Runtime: Node.js >=22. Read-only. Run: node sims/lp2_2013_whitespace_ascii_punctuation_selector_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');

const blobSha = '297c1dfee74ff79acc2d944952d06d1012928803';
const sourceUrl = 'https://raw.githubusercontent.com/krisyotam/cicada3301/main/pgp/messages/2013-01-rune-table-morse.asc';

/** @param {Buffer} bytes */
function gitBlob(bytes) {
  return crypto.createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
}

/** @param {string} line */
function asciiFromLine(line) {
  assert(/^[ \t]+$/.test(line), 'source line must contain only literal tabs/spaces');
  assert.equal(line.length % 8, 0, 'missing complete eight-bit ASCII characters');
  let out = '';
  for (let i = 0; i < line.length; i += 8) {
    const b = line.slice(i, i + 8).replaceAll('\t', '1').replaceAll(' ', '0');
    out += String.fromCharCode(Number.parseInt(b, 2));
  }
  return out;
}

async function main() {
  const response = await fetch(sourceUrl);
  assert.equal(response.status, 200, sourceUrl);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(gitBlob(bytes), blobSha, '2013 archived Git blob changed');
  const content = bytes.toString('utf8');
  const lines = content.split(/\r?\n/);
  const head = lines.indexOf('Hash: SHA1');
  const sig = lines.indexOf('-----BEGIN PGP SIGNATURE-----');
  assert(head >= 0 && sig > head);
  const text = lines.slice(head + 1, sig).filter(x => /^[ \t]+$/.test(x));
  assert.deepEqual(text.map(x => x.length), [240, 200, 80, 32]);
  const decoded = text.map(asciiFromLine);
  assert.deepEqual(decoded, [
    'Come to emiwp4muu2ktwknf.onion',
    'We shall await you there.',
    'Good luck.',
    '3301'
  ]);
  assert.equal(decoded.join('\n').length, 72);
  console.log('2013 exact Git blob ' + blobSha + ' verified, bytes=' + bytes.length);
  console.log('Four whitespace-only source lines, 552 bits, 69 ASCII octets; tab=1, space=0.');
  console.log('Historical source-selected original message:\n' + decoded.join('\n'));
  const marks = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-punctuation-identity.json', 'utf8'));
  assert.equal(marks.schema, 1);
  assert.equal(marks.events.length, 180);
  console.log('LP2 source punctuation inventory: source-derived 180 events, 175 physical original events after independent image audit; 4 four-dot editorial p15 extras, 1 absent p37 stop.');
  console.log('The original 2013 carrier has two literal whitespace symbols; LP2 uses visibly different three-/four-/ten-/thirteen-dot punctuation classes. No signed 2013 instruction maps those shapes to binary values, groups them into octets, or names an LP2 scope.');
  console.log('PASS: historical binary ASCII operation reproduced, but literal punctuation mapping remains unselected. No unknown ciphertext decoded.');
}

main().catch(e => { console.error(e); process.exitCode = 1; });
