'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const https = require('node:https');

const sources = Object.freeze({
  signed: 'https://raw.githubusercontent.com/Dukotah/cicada3301/master/corpus/A-primary-artifacts/pgp/messages/2014-01-onion5-liber-primus.asc',
  mp3: 'https://raw.githubusercontent.com/micheloosterhof/cicada-2014/master/stage08/index.3.mp3'
});

function getBytes(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error('GET ' + url + ' returned HTTP ' + response.statusCode));
        return;
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('error', reject);
      response.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

function extractHexBlocks(text) {
  const blocks = [];
  let current = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (/^[0-9a-f]{2,}$/i.test(line) && line.length % 2 === 0) {
      current.push(line);
      continue;
    }
    if (current.length) {
      blocks.push(current.join(''));
      current = [];
    }
  }
  if (current.length) blocks.push(current.join(''));
  return blocks.filter((hex) => hex.length >= 100).map((hex) => Buffer.from(hex, 'hex'));
}

function readBits(bytes, bitOffset, bitLength) {
  let value = 0;
  for (let i = 0; i < bitLength; i += 1) {
    const bit = bitOffset + i;
    value = (value << 1) | ((bytes[bit >>> 3] >>> (7 - (bit & 7))) & 1);
  }
  return value;
}

function auditStandardAncillary(bytes) {
  const frameSize = 72;
  assert.equal(bytes.length % frameSize, 0);
  const frames = [];
  const mainDataParts = [];
  const channelModes = new Set();
  const modeExtensions = new Set();

  for (let offset = 0; offset < bytes.length; offset += frameSize) {
    const header = bytes.subarray(offset, offset + 4);
    assert.equal(header[0], 0xff);
    assert.equal(header[1] & 0xfe, 0xf2);
    assert.equal(header[2], 0x34);
    const channelMode = (header[3] >>> 6) & 3;
    assert.equal(channelMode, 1, 'Expected joint-stereo channel mode');
    channelModes.add(channelMode);
    modeExtensions.add((header[3] >>> 4) & 3);

    const sideInfo = bytes.subarray(offset + 4, offset + 21);
    const mainData = bytes.subarray(offset + 21, offset + frameSize);
    assert.equal(sideInfo.length, 17);
    assert.equal(mainData.length, 51);
    frames.push({
      mainDataBegin: readBits(sideInfo, 0, 8),
      privateBits: readBits(sideInfo, 8, 2),
      part23Channel0: readBits(sideInfo, 10, 12),
      part23Channel1: readBits(sideInfo, 73, 12)
    });
    mainDataParts.push(mainData);
  }

  assert.equal(frames.length, 129);
  assert.deepEqual(Array.from(channelModes), [1]);
  assert.deepEqual(Array.from(modeExtensions).sort((a, b) => a - b), [0, 2]);

  const mainData = Buffer.concat(mainDataParts);
  const totalMainDataBits = mainData.length * 8;
  const part23Bits = frames.reduce(
    (sum, f) => sum + f.part23Channel0 + f.part23Channel1, 0
  );
  assert.ok(frames.every((f) => f.privateBits === 0));

  let gapBits = '';
  for (let i = 0; i < frames.length - 1; i += 1) {
    const currentStartByte = i * 51 - frames[i].mainDataBegin;
    const nextStartByte = (i + 1) * 51 - frames[i + 1].mainDataBegin;
    assert.ok(currentStartByte >= 0);
    const currentEndBit = currentStartByte * 8 +
      frames[i].part23Channel0 + frames[i].part23Channel1;
    const nextStartBit = nextStartByte * 8;
    assert.ok(nextStartBit >= currentEndBit);
    for (let bit = currentEndBit; bit < nextStartBit; bit += 1) {
      gapBits += String((mainData[bit >>> 3] >>> (7 - (bit & 7))) & 1);
    }
  }
  const expectedGap = Array.from(
    { length: gapBits.length }, (_, i) => (i % 2 === 0 ? '0' : '1')
  ).join('');
  assert.equal(gapBits.length, 443);
  assert.equal(gapBits, expectedGap);

  const lastIndex = frames.length - 1;
  const tailStart = lastIndex * 51 - frames[lastIndex].mainDataBegin;
  const tail = mainData.subarray(tailStart);
  const marker = Buffer.from('LAME3.98.2', 'ascii');
  assert.equal(frames[lastIndex].part23Channel0 + frames[lastIndex].part23Channel1, 0);
  assert.equal(frames[lastIndex - 1].part23Channel0 + frames[lastIndex - 1].part23Channel1, 0);
  assert.equal(tailStart, 6276);
  assert.equal(tail.length, 303);
  assert.ok(tail.subarray(0, 10).equals(marker));
  assert.ok(tail.subarray(48, 58).equals(marker));
  for (let i = 0; i < tail.length; i += 1) {
    if ((i < 10) || (i >= 48 && i < 58)) continue;
    assert.equal(tail[i], 0xaa);
  }

  assert.equal(part23Bits, 49765);
  assert.equal(totalMainDataBits, 52632);
  assert.equal(part23Bits + gapBits.length + tail.length * 8, totalMainDataBits);

  return {
    frameCount: frames.length,
    channelMode: 'joint stereo',
    modeExtensions: Array.from(modeExtensions).sort((a, b) => a - b),
    privateBits: frames.length * 2,
    privateBitsAllZero: true,
    part23Bits,
    interFrameGapBits: gapBits.length,
    interFrameGapPattern: '0101…',
    terminalRegionBytes: tail.length,
    terminalMarkers: ['LAME3.98.2@0', 'LAME3.98.2@48'],
    terminalFill: '0xAA',
    totalMainDataBits
  };
}

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

async function main() {
  const signed = await getBytes(sources.signed);
  const published = await getBytes(sources.mp3);
  const assets = extractHexBlocks(signed.toString('utf8'));

  assert.equal(assets.length, 3);
  assert.deepEqual(assets.map((value) => value.length), [1084, 1635, 9288]);
  assert.equal(assets[0].subarray(0, 2).toString('hex'), 'ffd8');
  assert.equal(assets[1].subarray(0, 2).toString('hex'), 'ffd8');
  assert.equal(assets[2].length, published.length);
  assert.ok(assets[2].equals(published), 'Signed audio differs from original 2014 MP3');

  const audit = auditStandardAncillary(published);
  console.log('SIGNED SOURCE:', sources.signed);
  console.log('2014 AUDIO:', sources.mp3);
  console.log('SIGNED HEX ASSET LENGTHS:', assets.map((b) => b.length).join(', '));
  console.log('SIGNED MP3 SHA256:', sha256(assets[2]));
  console.log('INDEPENDENT MP3 SHA256:', sha256(published));
  console.log('MPEG FRAMES:', audit.frameCount, 'bytes/frame: 72', 'total bytes:', published.length);
  console.log('CHANNEL MODE:', audit.channelMode, 'mode extensions:', audit.modeExtensions.join(','));
  console.log('PRIVATE BITS:', audit.privateBits, 'all zero:', audit.privateBitsAllZero);
  console.log('PART2_3 AUDIO BITS:', audit.part23Bits);
  console.log('INTER-FRAME ANCILLARY BITS:', audit.interFrameGapBits, audit.interFrameGapPattern);
  console.log('TERMINAL REGION:', audit.terminalRegionBytes, 'bytes;', audit.terminalMarkers.join(', '), '; fill:', audit.terminalFill);
  console.log('TOTAL MAIN-DATA BITS:', audit.totalMainDataBits);
  console.log('PASS: exact signed-to-2014 byte identity and complete standard private/ancillary bit accounting.');
  console.log('INTERPRETATION: no payload in standard MP3 private/ancillary channels; spectral coefficient and musical-note encoding remain untested.');
}

main().catch((error) => {
  console.error('FAIL:', error);
  process.exitCode = 1;
});
