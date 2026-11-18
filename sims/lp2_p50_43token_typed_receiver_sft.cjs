'use strict';

const fs = require('fs');
const path = require('path');

const grid = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'),
    'utf8'
  )
);

const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace('f', '');

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function assertArrayEqual(actual, expected, label) {
  assertEqual(JSON.stringify(actual), JSON.stringify(expected), label);
}

function decodeToken(token, alphabet) {
  return alphabet.indexOf(token[0]) * alphabet.length + alphabet.indexOf(token[1]);
}

function firstOpenPgpPacket(bytes) {
  const header = bytes[0];
  if ((header & 0x80) === 0) return { validHeader: false };

  if ((header & 0x40) !== 0) {
    const tag = header & 0x3f;
    const firstLength = bytes[1];
    if (firstLength < 192) {
      return {
        validHeader: true,
        format: 'new',
        tag,
        length: firstLength,
        remaining: bytes.length - 2,
        fits: firstLength <= bytes.length - 2,
      };
    }
    if (firstLength <= 223) {
      const length = ((firstLength - 192) << 8) + bytes[2] + 192;
      return {
        validHeader: true,
        format: 'new',
        tag,
        length,
        remaining: bytes.length - 3,
        fits: length <= bytes.length - 3,
      };
    }
    return {
      validHeader: true,
      format: 'new',
      tag,
      length: 'partial-or-five-octet',
      remaining: bytes.length - 2,
      fits: false,
    };
  }

  const tag = (header >> 2) & 0x0f;
  const lengthType = header & 0x03;

  if (lengthType === 0) {
    const length = bytes[1];
    return {
      validHeader: true,
      format: 'old',
      tag,
      length,
      remaining: bytes.length - 2,
      fits: length <= bytes.length - 2,
    };
  }

  if (lengthType === 1) {
    const length = (bytes[1] << 8) | bytes[2];
    return {
      validHeader: true,
      format: 'old',
      tag,
      length,
      remaining: bytes.length - 3,
      fits: length <= bytes.length - 3,
    };
  }

  if (lengthType === 2) {
    const length =
      bytes[1] * 0x1000000 +
      bytes[2] * 0x10000 +
      bytes[3] * 0x100 +
      bytes[4];
    return {
      validHeader: true,
      format: 'old',
      tag,
      length,
      remaining: bytes.length - 5,
      fits: length <= bytes.length - 5,
    };
  }

  return {
    validHeader: true,
    format: 'old',
    tag,
    length: 'indeterminate',
    remaining: bytes.length - 1,
    fits: false,
  };
}

function hasMagic(bytes, signature) {
  return (
    bytes.length >= signature.length &&
    signature.every((value, index) => bytes[index] === value)
  );
}

function hexPrefix(bytes, count) {
  return bytes
    .slice(0, count)
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
}

const bracket = tokens.slice(82, 129);
const interior = tokens.slice(84, 127);

assertEqual(bracket.length, 47, 'full bracket token count');
assertEqual(interior.length, 43, 'interior token count');
assertEqual(bracket[0], '3L', 'left outer token');
assertEqual(bracket[1], '3D', 'left inner token');
assertEqual(bracket.at(-2), '3D', 'right inner token');
assertEqual(bracket.at(-1), '3L', 'right outer token');
assertEqual(interior[21], '13', 'midpoint token');
assertEqual(tokens.filter((token) => token === '13').length, 1, 'global 13 count');

const base60 = interior.map((token) => decodeToken(token, alphabet60));
const base59 = interior.map((token) => decodeToken(token, alphabet59));

assertArrayEqual(
  base60,
  [173,28,111,65,211,220,198,49,236,84,56,35,222,150,72,34,83,229,32,206,122,63,31,218,14,184,32,115,73,143,197,247,54,171,35,184,42,237,86,54,13,20,163],
  'base60 interior bytes'
);
assertArrayEqual(
  base59,
  [170,28,109,64,208,217,195,48,232,83,55,35,218,148,71,34,82,225,32,203,120,62,31,215,14,181,32,113,72,141,194,243,53,168,35,181,41,233,85,53,13,20,160],
  'base59 interior bytes'
);

function mirrorXor(bytes) {
  assertEqual(bytes.length, 43, 'mirror XOR input length');
  const left = bytes.slice(0, 21);
  const right = bytes.slice(22).reverse();
  return left.map((value, index) => value ^ right[index]);
}

const mirrorXor60 = mirrorXor(base60);
assertArrayEqual(
  mirrorXor60,
  [14,8,98,119,133,49,236,137,207,255,14,212,27,25,1,81,115,93,46,20,101],
  'mirror XOR output'
);
assertEqual(mirrorXor60.filter((value) => value >= 32 && value <= 126).length, 8, 'mirror XOR printable count');
assertEqual(mirrorXor60.filter((value) => value < 29).length, 7, 'mirror XOR direct GP29 count');
assertEqual(mirrorXor60.every((value) => value < 29), false, 'mirror XOR full GP29 stream');
assertEqual(firstOpenPgpPacket(mirrorXor60).validHeader, false, 'mirror XOR OpenPGP header');

const plantedMirrorPlain = Array.from(Buffer.from('CICADA-MIRROR-XOR-21!', 'ascii'));
assertEqual(plantedMirrorPlain.length, 21, 'planted mirror plaintext length');
const plantedLeft = Array.from({length: 21}, (_, index) => (index * 37 + 11) & 0xff);
const plantedRightMirrored = plantedLeft.map((value, index) => value ^ plantedMirrorPlain[index]);
const plantedInterior = [
  ...plantedLeft,
  0x13,
  ...plantedRightMirrored.reverse(),
];
assertArrayEqual(mirrorXor(plantedInterior), plantedMirrorPlain, 'planted mirror XOR recovery');

const pgp60 = firstOpenPgpPacket(base60);
const pgp59 = firstOpenPgpPacket(base59);

assertEqual(pgp60.validHeader, true, 'base60 OpenPGP header syntax');
assertEqual(pgp60.format, 'old', 'base60 OpenPGP format');
assertEqual(pgp60.tag, 11, 'base60 OpenPGP tag');
assertEqual(pgp60.length, 7279, 'base60 declared OpenPGP body length');
assertEqual(pgp60.remaining, 40, 'base60 remaining bytes');
assertEqual(pgp60.fits, false, 'base60 packet fit');

assertEqual(pgp59.validHeader, true, 'base59 OpenPGP header syntax');
assertEqual(pgp59.format, 'old', 'base59 OpenPGP format');
assertEqual(pgp59.tag, 10, 'base59 OpenPGP tag');
assertEqual(pgp59.length, 476922064, 'base59 declared OpenPGP body length');
assertEqual(pgp59.remaining, 38, 'base59 remaining bytes');
assertEqual(pgp59.fits, false, 'base59 packet fit');

const signatures = [
  ['bzip2', [0x42, 0x5a, 0x68]],
  ['gzip', [0x1f, 0x8b]],
  ['zip', [0x50, 0x4b]],
  ['png', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  ['jpeg', [0xff, 0xd8]],
];

for (const [name, signature] of signatures) {
  assertEqual(hasMagic(base60, signature), false, `base60 ${name} magic`);
  assertEqual(hasMagic(base59, signature), false, `base59 ${name} magic`);
}

const plantedPgp = [0xac, 0x03, 0x01, 0x02, 0x03];
const plantedPgpParsed = firstOpenPgpPacket(plantedPgp);
assertEqual(plantedPgpParsed.validHeader, true, 'planted OpenPGP header');
assertEqual(plantedPgpParsed.tag, 11, 'planted OpenPGP literal-data tag');
assertEqual(plantedPgpParsed.length, 3, 'planted OpenPGP length');
assertEqual(plantedPgpParsed.fits, true, 'planted OpenPGP fit');
assertEqual(hasMagic([0x42, 0x5a, 0x68, 0x39], signatures[0][1]), true, 'planted bzip2 magic');

console.log('PASS p50 43-token typed-receiver audit');
console.log(`  base60 first8: ${hexPrefix(base60, 8)}; OpenPGP tag ${pgp60.tag}, length ${pgp60.length}, remaining ${pgp60.remaining}, fits=${pgp60.fits}`);
console.log(`  base59 first8: ${hexPrefix(base59, 8)}; OpenPGP tag ${pgp59.tag}, length ${pgp59.length}, remaining ${pgp59.remaining}, fits=${pgp59.fits}`);
console.log('  bzip2/gzip/zip/png/jpeg magic: absent under both byte interpretations');
console.log(`  mirror XOR base60: ${hexPrefix(mirrorXor60, mirrorXor60.length)}; printable=8/21; direct-GP29=7/21`);
console.log('  planted old-format OpenPGP literal packet and bzip2 signature: detected');
