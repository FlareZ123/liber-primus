'use strict';

/**
 * Source-identified additional Cicada audio metadata crib gate.
 *
 * 2014 Stage 07 onion q4utgdi2n4m4uim5 originally served a PGP-signed
 * hex-encoded audio resource (contemporaneous Stage07 README), recovered as
 * index.mp3. This independent historical artifact may have an original
 * authored ID3 plaintext frame like 2013 AUDIO/761.MP3. Probe its *actual*
 * original bytes, not renamed re-encodes or community audio.
 *
 * Node 22. Read only. argv[2] must be pinned stage07/index.mp3.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const ROOT = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const mp3Path = process.argv[2];
assert.ok(mp3Path, 'original stage07/index.mp3 file path required');
const file = fs.readFileSync(mp3Path);
assert.equal(file.length, 6651873);
const gitBlob = crypto.createHash('sha1')
  .update(Buffer.from('blob ' + file.length + '\0'))
  .update(file).digest('hex');
assert.equal(gitBlob, '09fe068192b76a3697c47ec1d604b527703db798');
const sha256 = crypto.createHash('sha256').update(file).digest('hex');

/** @param {Buffer} data @param {number} offset */
function synchsafe(data, offset) {
  let n = 0;
  for (let i = 0; i < 4; i++) {
    const b = data[offset + i];
    assert.ok(b < 128, 'ID3 syncsafe length byte invalid');
    n = n * 128 + b;
  }
  return n;
}

/**
 * @param {Buffer} data
 * @param {number} offset
 * @param {number} length
 * @param {number} encoding
 */
function decodedText(data, offset, length, encoding) {
  const payload = data.subarray(offset, offset + length);
  if (encoding === 0) return payload.toString('latin1');
  if (encoding === 3) return payload.toString('utf8');
  if (encoding === 1 || encoding === 2) {
    const bom = payload[0] === 0xff && payload[1] === 0xfe;
    const start = encoding === 1 && (payload[0] === 0xfe || payload[0] === 0xff) ? 2 : 0;
    const swap = Buffer.alloc(payload.length - start);
    for (let i = 0; i + 1 < swap.length; i += 2) {
      swap[i] = payload[start+i+(bom ? 1:0)];
      swap[i+1] = payload[start+i+(bom ? 0:1)];
    }
    return swap.toString('utf16le');
  }
  return '[unknown text encoding]';
}

/** @param {Buffer} data */
function id3(data) {
  if (data.subarray(0, 3).toString('ascii') !== 'ID3') return {present:false,frames:[],end:0};
  const major = data[3], minor = data[4], flags = data[5];
  assert.ok(major === 3 || major === 4, 'Unexpected ID3 major version');
  const size = synchsafe(data, 6), end = 10 + size;
  assert.ok(end <= data.length);
  const frames = [];
  let cursor = 10;
  while (cursor + 10 <= end) {
    const id = data.subarray(cursor, cursor+4).toString('ascii');
    if (id === '\0\0\0\0') break;
    assert.match(id, /^[A-Z0-9]{4}$/);
    const bodyLength = major === 4 ? synchsafe(data, cursor+4) : data.readUInt32BE(cursor+4);
    const frameFlags = data.readUInt16BE(cursor+8);
    const bodyStart = cursor + 10;
    assert.ok(bodyStart+bodyLength <= end);
    const payload = data.subarray(bodyStart, bodyStart+bodyLength);
    const frame = {
      id, offset:cursor, length:bodyLength, flags:frameFlags,
      sha256:crypto.createHash('sha256').update(payload).digest('hex')
    };
    if (id[0] === 'T' && payload.length > 0) {
      const text = decodedText(data, bodyStart+1, bodyLength-1, payload[0]);
      frame.encoding = payload[0];
      frame.value = text.slice(0, 1600);
    } else if (id === 'COMM' && payload.length > 4) {
      frame.encoding = payload[0];
      frame.value = decodedText(data, bodyStart+4, bodyLength-4,payload[0]).slice(0, 1600);
    }
    frames.push(frame);
    cursor = bodyStart + bodyLength;
  }
  return {present:true,major,minor,flags,size,end,frames,unparsedPadding:end-cursor};
}

/**
 * Derive a canonical GP token count per source English word without trying
 * arbitrary quote aliases or ciphertext substitutions.
 * @param {string} text
 * @returns {number[]}
 */
function normalizedLengths(text) {
  const tokenMap = corpus.translit.map((token, index) => ({token,index}))
    .sort((a,b) => b.token.length-a.token.length);
  const lengths = [];
  for (const word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    const clean = word.replace(/K/g,'C').replace(/V/g,'U').replace(/Q/g,'C');
    let count = 0;
    for (let i = 0; i < clean.length;) {
      const found = tokenMap.find(v => clean.startsWith(v.token, i));
      assert.ok(found, 'English text not representable by source GP tokens');
      i += found.token.length;
      count++;
    }
    lengths.push(count);
  }
  return lengths;
}

const metadata = id3(file);
const footer = file.subarray(file.length-128,file.length-125).toString('ascii') === 'TAG'
  ? file.subarray(file.length-128).toString('latin1') : null;
const apeFooter = file.subarray(file.length-32,file.length-24).toString('ascii') === 'APETAGEX';
const textFrames = metadata.frames.filter(f => typeof f.value === 'string');
const candidates = [];
for (const frame of textFrames) {
  const value = frame.value.replaceAll('\0',' ');
  const lengths = normalizedLengths(value);
  if (lengths.reduce((n,x)=>n+x,0) >= 40) candidates.push({frame:frame.id,words:lengths.length,
    runes:lengths.reduce((n,x)=>n+x,0),value:value.slice(0,1600),lengths});
}

/** @param {Buffer} bytes */
function positive(bytes) {
  const framePayload = Buffer.concat([Buffer.from([0]),bytes]);
  const frameHeader = Buffer.alloc(10);
  frameHeader.write('TIT2',0,'ascii');
  frameHeader.writeUInt32BE(framePayload.length,4);
  const tag = Buffer.alloc(10);
  tag.write('ID3',0,'ascii');
  tag[3] = 3;tag[4] = 0;tag[5] = 0;
  const sz = frameHeader.length+framePayload.length;
  for(let j=0;j<4;j++)tag[9-j]=(sz >>> (j*7))&0x7f;
  return id3(Buffer.concat([tag,frameHeader,framePayload,Buffer.alloc(1)]));
}
const plant = positive(Buffer.from(
  'Like the instar tunneling to the surface. We must shed our own circumferences. '+
  'Find the divinity within and emerge.','ascii'));
assert.equal(plant.frames.length,1);
assert.equal(plant.frames[0].id,'TIT2');
assert.ok(plant.frames[0].value.startsWith('Like the instar'));
assert.ok(normalizedLengths(plant.frames[0].value).reduce((a,b)=>a+b,0)>40);

console.log(JSON.stringify({
  source:'2014 independently attested signed-onion Stage07 index.mp3, original archived bytes',
  sourceGitBlob:gitBlob, sha256, fileBytes:file.length,
  id3:metadata, id3v1:footer, apeFooter,
  textFrameCount:textFrames.length,
  substantialCandidateCount:candidates.length,
  substantialCandidates:candidates,
  positive:'Synthetic 2013 Parable ID3v2.3 text frame recovered and GP-tokenized',
  conclusion:candidates.length
    ? 'Inspect substantial original stage07 metadata for an LP2 unknown-page word-shape crib'
    : 'No original stage07 ID3 text candidate of forty or more GP runes'
}, null, 2));
