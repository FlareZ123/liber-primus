'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = process.env.CICADA_ARCHIVE_ROOT || '/tmp/cicada';
const target = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const pinnedCommit = 'ade9a02889ef8acbc8cde8edbfd0a785c369f4c3';
const results = [];

function add(name, bytes, sourceClass) {
  const digest = crypto.createHash('sha512').update(bytes).digest('hex');
  results.push({
    name,
    source_class: sourceClass,
    byte_length: bytes.length,
    sha512: digest,
    matches_p56_target: digest === target
  });
}

function decodeWhitespace(raw) {
  const text = raw.toString('utf8');
  const marker = text.indexOf('Hash: SHA1');
  const bodyStart = text.indexOf('\n\n', marker) + 2;
  const bodyEnd = text.indexOf('-----BEGIN PGP SIGNATURE-----');
  if (marker < 0 || bodyStart < 2 || bodyEnd < 0) throw new Error('Could not locate cleartext-signed body');
  const body = text.slice(bodyStart, bodyEnd);
  const lines = body.split(/\r?\n/).filter((line) => line.length > 0);
  const decodedLines = lines.map((line, index) => {
    const bits = Array.from(line, (ch) => {
      if (ch === ' ') return 0;
      if (ch === '\t') return 1;
      throw new Error('Non-space/tab byte in whitespace line ' + index);
    });
    if (bits.length % 8 !== 0) throw new Error('Line ' + index + ' is not byte-aligned');
    const bytes = [];
    for (let i = 0; i < bits.length; i += 8) {
      let value = 0;
      for (let j = 0; j < 8; j++) value = (value << 1) | bits[i + j];
      bytes.push(value);
    }
    return Buffer.from(bytes);
  });
  return {
    body,
    lines,
    decodedLines,
    joined: Buffer.concat(decodedLines),
    lf: Buffer.concat(decodedLines.flatMap((line, i) => i ? [Buffer.from('\n'), line] : [line])),
    crlf: Buffer.concat(decodedLines.flatMap((line, i) => i ? [Buffer.from('\r\n'), line] : [line]))
  };
}

function canonicalCleartextBody(raw) {
  const text = raw.toString('utf8');
  const marker = text.indexOf('Hash: SHA1');
  const bodyStart = text.indexOf('\n\n', marker) + 2;
  const bodyEnd = text.indexOf('-----BEGIN PGP SIGNATURE-----');
  const lines = text.slice(bodyStart, bodyEnd).split(/\r?\n/).map((line) => line.replace(/[ \t]+$/g, ''));
  while (lines.length && lines[lines.length - 1] === '') lines.pop();
  return Buffer.from(lines.join('\r\n') + '\r\n', 'utf8');
}

const gematriaAscPath = path.join(root, '2013/003-twitter/gematria.jpg.asc');
const gematriaAsc = fs.readFileSync(gematriaAscPath);
const whitespace = decodeWhitespace(gematriaAsc);
add('2013 gematria.jpg.asc raw armor', gematriaAsc, 'original archived file');
add('2013 gematria whitespace plaintext, no line breaks', whitespace.joined, 'derived source decoding');
add('2013 gematria whitespace plaintext, LF line breaks', whitespace.lf, 'derived source decoding');
add('2013 gematria whitespace plaintext, CRLF line breaks', whitespace.crlf, 'derived source decoding');

const invitationDir = path.join(root, '2013/008-invitation');
for (const [file, sourceClass] of [
  ['invitation.asc', 'original archived PGP attachment'],
  ['Nj8gDqFG', 'original archived invitation-stage file'],
  ['rn4gTF1Z', 'original archived invitation-stage file'],
  ['README.md', 'participant archive transcript, not original HTTP response']
]) {
  const raw = fs.readFileSync(path.join(invitationDir, file));
  add('2013 invitation stage ' + file + ' raw', raw, sourceClass);
  if (file === 'invitation.asc') {
    add('2013 invitation.asc canonical cleartext body', canonicalCleartextBody(raw), 'derived OpenPGP cleartext canonicalization');
  }
}

console.log(JSON.stringify({
  target_sha512: target,
  external_repository: 'neuroretransmit/cicada',
  pinned_commit: pinnedCommit,
  whitespace_decode: {
    rule: 'space=0, tab=1, MSB-first; decode each nonempty line independently',
    line_lengths_bits: whitespace.lines.map((line) => line.length),
    decoded_line_lengths_bytes: whitespace.decodedLines.map((line) => line.length),
    message: whitespace.lf.toString('ascii')
  },
  comparisons: results.length,
  matches: results.filter((item) => item.matches_p56_target),
  results
}, null, 2));
