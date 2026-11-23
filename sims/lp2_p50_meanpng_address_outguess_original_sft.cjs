#!/usr/bin/env node
'use strict';

/**
 * Source-fixed LP2 p50 Bitcoin vanity address as a historical OutGuess key.
 *
 * The exact 32-byte fifth-column scalar is recomputed from the pinned
 * original-grid data by the existing independent secp256k1 producer.
 * One frozen full 34-character address is tried on all 58 original 2014 LP2
 * JPEGs. A real original LP1 OutGuess payload is an independent positive.
 * OutGuess's forced FF header on LP2 scans is never evidence of a payload.
 *
 * Windows 11: node sims/lp2_p50_meanpng_address_outguess_original_sft.cjs
 * Needs Python3, a C compiler/libjpeg development headers and repository's
 * sims/outguess_extract.py as on the manual OutGuess GitHub runner.
 */

const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

const proof = spawnSync(process.execPath, [
  'sims/lp2_p50_missingl_bitcoin_vanity_source_sft.cjs'
], { encoding: 'utf8', maxBuffer: 1024 * 1024 });
assert.equal(proof.status, 0, proof.stderr);
assert.match(proof.stdout, /PASS: original p50 printed column/);
const [proofJson] = proof.stdout.split(/\nPASS:/);
const { p2pkh } = JSON.parse(proofJson);
assert.equal(p2pkh, '1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK');

const python = String.raw`
import hashlib
import json
import pathlib
import sys

sys.path.insert(0, 'sims')
from outguess_extract import build_bitmap, extract, header_is_source_forced

password = sys.argv[1]
assert password == '1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK'
root = pathlib.Path('resources/liber-primus')
known = root / '03.jpg'
positive, _ = extract(*build_bitmap(known), 'Default key')
assert len(positive) == 31809
assert positive.startswith(b'-----BEGIN PGP SIGNED MESSAGE-----')
print('ORIGINAL_2014_LP1_OUTGUESS_POSITIVE', len(positive),
      hashlib.sha256(positive).hexdigest(), flush=True)

candidates = []
accepted = 0
for image in range(17, 75):
    path = root / f'{image:02d}.jpg'
    bitmap, bits = build_bitmap(path)
    assert header_is_source_forced(bitmap, bits)
    try:
        payload, metadata = extract(bitmap, bits, password)
    except ValueError as error:
        print('ORIGINAL_LP2_OUTGUESS', path.name, 'invalid_header_or_iterator',
              str(error)[:120], flush=True)
        continue
    accepted += 1
    recognized = (
        bool(metadata.get('magic')) or bool(metadata.get('possible_openpgp_armor'))
        or (len(payload) >= 32 and metadata.get('printable_fraction', 0) >= 0.8)
    )
    event = {
        'scan': path.name, 'length': len(payload),
        'sha256': hashlib.sha256(payload).hexdigest(),
        'magic': metadata.get('magic'),
        'possible_openpgp_armor': metadata.get('possible_openpgp_armor'),
        'printable_fraction': round(metadata.get('printable_fraction', 0), 6),
        'prefix_hex': payload[:32].hex(),
        'recognized': recognized,
    }
    if recognized:
        candidates.append(event)
    print('ORIGINAL_LP2_OUTGUESS', json.dumps(event, sort_keys=True), flush=True)

print('SOURCE_ADDRESS_OUTGUESS_SUMMARY', json.dumps({
    'method': 'OutGuess 0.4 historical JPEG bitmap, A-only password',
    'source': 'original p50 column4 conventional base60 secp256k1 compressed P2PKH',
    'address': password,
    'positive_original': True, 'original_scans': 58,
    'headers_accepted': accepted,
    'independently_recognizable_candidates': candidates
}, sort_keys=True), flush=True)
`;
const run = spawnSync('python3', ['-c', python, p2pkh], {
  encoding: 'utf8',
  maxBuffer: 8 * 1024 * 1024,
  timeout: 20 * 60 * 1000,
});
process.stdout.write(run.stdout || '');
process.stderr.write(run.stderr || '');
assert.equal(run.status, 0, `OutGuess source test failed: ${run.error || run.stderr}`);
assert.match(run.stdout, /SOURCE_ADDRESS_OUTGUESS_SUMMARY/);
console.log('PASS: original source-only OutGuess receiver evaluated all 58 LP2 JPEGs.');
