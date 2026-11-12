'use strict';
/**
 * Finite Cicada RSA key-corpus inventory for the original pp49–51 256-cell table.
 *
 * This is not an RSA attack or a key search. It checks whether the preserved
 * 2012–2016 Cicada source corpus contains a 2048-bit public modulus that can be
 * compared with the 256-byte candidate table, and records bounded wrong-size
 * controls. The base59 alphabet is a deliberately non-authenticated control:
 * remove the sole absent base60 character, lowercase "f".
 *
 * Node.js 22; no third-party dependencies:
 *   node sims/pp49_51_rsa_key_inventory.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {dearmor, parseKeys} = require('./grid_rsa_pgp_signature.cjs');

const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const PUBLIC_KEY_PATH = 'resources/historical/cicada-3301-2012-public-key.asc';
const CONTROL_KEY_PATH = 'resources/control/cicada-3301-public-key.asc';
const EXPECTED_FINGERPRINT = '6D854CD7933322A601C3286D181F01E57A35090F';
const EXPECTED_ISSUER = '181F01E57A35090F';

const SIGNED_ARTIFACTS = Object.freeze([
  'resources/historical/cicada2012-countdown-message.asc',
  'resources/historical/cicada2013-first-onion-hello.asc',
  'resources/historical/cicada2013-forest-clue.asc',
  'resources/historical/cicada2013-second-onion-everything-you-need.asc',
  'resources/historical/cicada2013-second-onion-icmp-echo.asc',
  'resources/external/2013-do-not-share-this-information-2.asc',
  'resources/historical/pklmx-2013/annapolis-md.txt.asc',
  'resources/historical/pklmx-2013/okinawa-japan.txt.asc',
  'resources/historical/pklmx-2013/standby.txt.asc',
  'resources/historical/cicada2014-stage11-message.asc',
  'resources/external/derived/2014-stage04/03-outguess.asc',
  'resources/historical/lp1-outguess-00-02-xor-derived.asc',
  'resources/historical/cicada2016-4gq25-outguess.asc',
  'im-results/2016-forum-witness-extract.asc'
]);

function dearmorBlock(armor, label) {
  const match = armor.match(new RegExp(
    '-----BEGIN PGP ' + label + '-----([\\s\\S]*?)-----END PGP ' + label + '-----'
  ));
  assert.ok(match, 'Missing PGP ' + label + ' armor block');
  const encoded = match[1].split(/\r?\n/).filter(line =>
    /^[A-Za-z0-9+/]+={0,2}$/.test(line)
  ).join('');
  return Buffer.from(encoded, 'base64');
}

function packetLength(raw, offset, newer) {
  if (newer) {
    const first = raw[offset++];
    if (first < 192) return {size:first, end:offset};
    if (first < 224) {
      const second = raw[offset++];
      return {size:(first-192)*256+second+192, end:offset};
    }
    if (first === 255) return {
      size:raw.readUInt32BE(offset), end:offset+4
    };
    throw new Error('Unsupported partial OpenPGP packet length');
  }
  throw new Error('Old packet headers are parsed by parsePackets');
}

function parsePackets(raw) {
  const packets = [];
  let offset = 0;
  while (offset < raw.length) {
    const header = raw[offset++];
    assert.ok(header & 0x80, 'Invalid OpenPGP packet header');
    const newer = Boolean(header & 0x40);
    const tag = newer ? header & 63 : (header >> 2) & 15;
    let size;
    if (newer) {
      const parsed = packetLength(raw, offset, true);
      size = parsed.size;
      offset = parsed.end;
    } else {
      const kind = header & 3;
      if (kind === 3) size = raw.length - offset;
      else {
        const width = [1, 2, 4][kind];
        size = 0;
        for (let i=0; i<width; i++) size = size*256 + raw[offset++];
      }
    }
    const body = raw.subarray(offset, offset+size);
    assert.equal(body.length, size);
    offset += size;
    packets.push({tag, body});
  }
  return packets;
}

function signatureInfo(body) {
  assert.equal(body[0], 4, 'Expected a v4 OpenPGP signature');
  const publicKeyAlgorithm = body[2];
  let offset = 4;
  const hashedLength = body.readUInt16BE(offset);
  offset += 2 + hashedLength;
  const unhashedLength = body.readUInt16BE(offset);
  offset += 2;
  const end = offset + unhashedLength;
  let issuer = null;
  while (offset < end) {
    let length = body[offset++];
    if (length >= 192) {
      if (length < 255) {
        length = ((length-192) << 8) + body[offset++] + 192;
      } else {
        length = body.readUInt32BE(offset);
        offset += 4;
      }
    }
    const type = body[offset++] & 127;
    const data = body.subarray(offset, offset+length-1);
    offset += length-1;
    if (type === 16 && data.length === 8) issuer = data.toString('hex').toUpperCase();
  }
  return {publicKeyAlgorithm, issuer};
}

function readSignature(pathname) {
  const raw = dearmorBlock(read(pathname), 'SIGNATURE');
  const signatures = parsePackets(raw).filter(packet => packet.tag === 2);
  assert.equal(signatures.length, 1, pathname + ': expected one signature packet');
  return signatureInfo(signatures[0].body);
}

function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

function unsignedBigInt(bytes) {
  return BigInt('0x' + bytes.toString('hex'));
}

function summarize(name, bytes, knownModuli) {
  const value = unsignedBigInt(bytes);
  const gcds = knownModuli.map(item => ({
    name:item.name,
    gcd:gcd(value, item.value).toString()
  }));
  assert.ok(gcds.every(item => item.gcd === '1'),
    name + ': candidate unexpectedly shares a factor with a known RSA modulus');
  return {
    name,
    byteLength:bytes.length,
    bitLength:value.toString(2).length,
    odd:Boolean(value & 1n),
    sha256:createHash('sha256').update(bytes).digest('hex'),
    gcds
  };
}

function main() {
  const publicArmor = read(PUBLIC_KEY_PATH);
  assert.equal(publicArmor, read(CONTROL_KEY_PATH),
    'Historical and control public-key armor must be byte-identical');

  const keys = parseKeys(dearmor(publicArmor));
  assert.equal(keys.length, 2);
  assert.equal(keys[0].fingerprint, EXPECTED_FINGERPRINT);
  assert.deepEqual(keys.map(key => key.bits), [4096, 4096]);
  assert.ok(keys.every(key => key.exponent === 65537n));

  const signatureInventory = SIGNED_ARTIFACTS.map(pathname => {
    const signature = readSignature(pathname);
    assert.equal(signature.publicKeyAlgorithm, 1,
      pathname + ': expected RSA signature algorithm');
    assert.equal(signature.issuer, EXPECTED_ISSUER,
      pathname + ': unexpected issuer key ID');
    return {path:pathname, algorithm:'RSA', issuer:signature.issuer};
  });

  const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
  assert.equal(grid.rows.length, 32);
  assert.ok(grid.rows.every(row => row.length === 8));
  const tokens = grid.rows.flat();
  assert.equal(tokens.length, 256);
  const alphabet60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
  const alphabet59 = alphabet60.replace('f', '');
  assert.equal(new Set(tokens.join('')).size, 59);
  assert.ok(!tokens.join('').includes('f'));
  const base60 = Buffer.from(tokens.map(token =>
    alphabet60.indexOf(token[0])*60 + alphabet60.indexOf(token[1])
  ));
  const base59 = Buffer.from(tokens.map(token =>
    alphabet59.indexOf(token[0])*59 + alphabet59.indexOf(token[1])
  ));
  assert.deepEqual([...base60], grid.byte_rows.flat());
  assert.equal(base59.length, 256);
  assert.ok(base59.every(value => value <= 255));

  const columnMajor = bytes => {
    const out = [];
    for (let column=0; column<8; column++) {
      for (let row=0; row<32; row++) out.push(bytes[row*8+column]);
    }
    return Buffer.from(out);
  };

  const candidates = [
    ['base60-row-major', base60],
    ['base60-row-major-reversed', Buffer.from(base60).reverse()],
    ['base60-column-major', columnMajor(base60)],
    ['base60-column-major-reversed', columnMajor(base60).reverse()],
    ['base59-row-major-control', base59],
    ['base59-row-major-reversed-control', Buffer.from(base59).reverse()],
    ['base59-column-major-control', columnMajor(base59)],
    ['base59-column-major-reversed-control', columnMajor(base59).reverse()]
  ];

  const n2012 = 99554414790940424414351515490472769096534141749790794321708050837n *
    104593961812606247801193807142122161186583731774511103180935025763n;
  const n2014 = 97513779050322159297664671238670850085661086043266591739338007321n *
    77506098606928780021829964781695212837195959082370473820509360759n;
  assert.equal(n2012.toString(2).length, 432);
  assert.equal(n2014.toString(2).length, 432);

  const knownModuli = [
    {name:'2012 Cicada OpenPGP primary', value:keys[0].modulus},
    {name:'2012 Cicada OpenPGP encryption subkey', value:keys[1].modulus},
    {name:'2012 Valete P.S. RSA-432 challenge modulus', value:n2012},
    {name:'2014 RSA-432 challenge modulus', value:n2014}
  ];

  const summaries = candidates.map(([name, bytes]) =>
    summarize(name, bytes, knownModuli)
  );
  assert.equal(summaries.find(x => x.name === 'base60-row-major').sha256,
    '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
  assert.equal(summaries.find(x => x.name === 'base59-row-major-control').sha256,
    '511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79');
  assert.equal(summaries.filter(x => x.bitLength === 2048).length, 4);

  const inventory = {
    publicKeyBlobSha1:'d44aec389e2f346c6b9d149d4c61e890f62979c9',
    fingerprint:keys[0].fingerprint,
    issuerKeyId:EXPECTED_ISSUER,
    publicKeyPackets:keys.map((key, index) => ({
      role:index === 0 ? 'primary' : 'encryption subkey',
      algorithm:'RSA',
      modulusBits:key.bits,
      exponent:key.exponent.toString()
    })),
    signedArtifactCount:signatureInventory.length,
    signedArtifacts:signatureInventory,
    otherPreservedChallengeModuli:[
      {name:'2012 Valete P.S.', bits:432, byteLength:54,
        exponent:'65537 assumed in prior direct-reuse tests; not printed in the P.S.'},
      {name:'2014 RSA challenge', bits:432, byteLength:54,
        exponent:'65537'}
    ],
    excludedFromOrganizerKeyCorpus:[
      '2012 participant-specific email modulus: 112 decimal digits in a provenance-qualified mirror; its signature is not verified and it is not the Cicada signing key.',
      '2014 Stage10 form asks participants to generate and upload their own GnuPG public key; no organizer-side participant key is preserved here.'
    ],
    authenticated2048BitCicadaPublicKeys:0
  };
  assert.equal(inventory.authenticated2048BitCicadaPublicKeys, 0);
  const report = {
    decision:'BOUNDED NO-MATCH: no reviewed 2012–2016 Cicada RSA public key has a 2048-bit modulus.',
    inventory,
    candidateStreams:summaries,
    interpretation:'The base60 row-major stream is a conditional 256-byte serialization, not a Cicada-authenticated BASE60 operation. The base59 streams are controls only. No 2048-bit key exists in the reviewed corpus, so no RSA decryption, factorization, private-key recovery, exponent scan, or permutation search is warranted.'
  };
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) main();
module.exports = {main, readSignature, signatureInfo, parsePackets, summarize};
