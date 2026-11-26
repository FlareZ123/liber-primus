#!/usr/bin/env node
'use strict';

// Verify the RFC 4880 ASCII-armor CRC-24 on five preserved Cicada clear-signed
// messages. The CRC protects the decoded OpenPGP signature packet during armor
// transport; it is not a checksum of the authored message body.

const fs = require('node:fs');

const files = [
  'resources/historical/cicada2012-countdown-message.asc',
  'resources/historical/cicada2013-welcome-and-congratulations.asc',
  'resources/historical/cicada2013-gematria-jpeg-outguess.asc',
  'resources/historical/cicada2014-onion5-signed.asc',
  'resources/historical/cicada2014-stage11-message.asc',
];

function crc24(bytes) {
  let crc = 0xB704CE;
  for (const byte of bytes) {
    crc ^= byte << 16;
    for (let bit = 0; bit < 8; bit++) {
      crc <<= 1;
      if (crc & 0x1000000) crc ^= 0x1864CFB;
    }
  }
  return crc & 0xFFFFFF;
}

function verifyArmor(file) {
  const source = fs.readFileSync(file, 'utf8');
  const lines = source.split(/\r?\n/);
  if (!lines.includes('-----BEGIN PGP SIGNED MESSAGE-----')) {
    throw new Error(file + ': missing clear-signed message header');
  }
  if (!lines.includes('Hash: SHA1')) {
    throw new Error(file + ': expected the preserved Hash: SHA1 header');
  }

  const start = lines.indexOf('-----BEGIN PGP SIGNATURE-----');
  const end = lines.indexOf('-----END PGP SIGNATURE-----');
  if (start < 0 || end <= start) throw new Error(file + ': malformed signature armor');

  const block = lines.slice(start + 1, end);
  const checksumLine = block.find(line => /^=[A-Za-z0-9+/]{4}$/.test(line));
  if (!checksumLine) throw new Error(file + ': missing four-character CRC-24 footer');

  const payload = block
    .filter(line => line.trim() && !/^[A-Za-z-]+:/.test(line) && !line.startsWith('='))
    .join('');
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(payload)) {
    throw new Error(file + ': invalid Radix-64 signature payload');
  }

  const signaturePacket = Buffer.from(payload, 'base64');
  const crc = crc24(signaturePacket);
  const crcBytes = Buffer.from([(crc >>> 16) & 255, (crc >>> 8) & 255, crc & 255]);
  const expected = '=' + crcBytes.toString('base64');
  if (checksumLine !== expected) {
    throw new Error(file + ': armor CRC mismatch; found ' + checksumLine + ', expected ' + expected);
  }

  return {
    file,
    signature_packet_bytes: signaturePacket.length,
    hash_header: 'SHA1',
    armor_crc24: checksumLine,
    recomputed_crc24: expected,
    match: true,
  };
}

const results = files.map(verifyArmor);
if (results.length !== 5 || results.some(result => !result.match)) {
  throw new Error('Source gate failed');
}
console.log(JSON.stringify({
  standard: 'RFC 4880 sections 6.1–6.2',
  crc24_initial: '0xB704CE',
  crc24_polynomial: '0x1864CFB',
  scope: 'decoded OpenPGP signature packet bytes, before Radix-64 encoding',
  results,
}, null, 2));
