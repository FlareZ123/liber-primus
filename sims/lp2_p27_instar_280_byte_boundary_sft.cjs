"use strict";
/**
 * Resolve p27 scalar 280 against only the byte structures selected by the
 * historical 2013 Instar XOR chain. No shifted origins or arbitrary offsets.
 *
 * Run: node sims/lp2_p27_instar_280_byte_boundary_sft.cjs /path/761.MP3 /path/gematria.jpg
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p));
const mp3Path = process.argv[2];
const jpegPath = process.argv[3];
assert.ok(mp3Path && jpegPath, "Pass the exact original 761.MP3 and gematria.jpg paths");
const mp3 = fs.readFileSync(mp3Path);
const jpeg = fs.readFileSync(jpegPath);
const gitBlobSha1 = b => crypto.createHash("sha1")
  .update(Buffer.from("blob " + b.length + "\0", "utf8"))
  .update(b).digest("hex");
const sha256 = b => crypto.createHash("sha256").update(b).digest("hex");

assert.equal(mp3.length, 4010732);
assert.equal(sha256(mp3), "83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460");
assert.equal(gitBlobSha1(mp3), "7e2bd299fbc7b96283219cf15e2904641daf631f");
assert.equal(jpeg.length, 64167);
assert.equal(gitBlobSha1(jpeg), "65ded13617196f0fd5d210855a75452ff2e7a340");

const records = read("resources/cicada2013-twitter-hex-stream.txt").toString("utf8").trim()
  .split(/\r?\n/).map((line, index) => {
    const m = /^([0-9a-fA-F]+):\s*([0-9a-fA-F]+)\s*$/.exec(line);
    assert.ok(m, "Malformed Twitter hex record at line " + (index + 1));
    return {offset: parseInt(m[1], 16), data: Buffer.from(m[2], "hex")};
  }).sort((a, b) => a.offset - b.offset);
assert.equal(records.length, 988);
const twitterLength = records[records.length - 1].offset + records[records.length - 1].data.length;
const twitter = Buffer.alloc(twitterLength);
let cursor = 0;
for (const record of records) {
  assert.equal(record.offset, cursor, "Twitter source offsets must tile from byte zero");
  record.data.copy(twitter, record.offset);
  cursor += record.data.length;
}
assert.equal(cursor, 64167);
assert.equal(gitBlobSha1(twitter), "ba1866f89b31a7bd816eb6307eda56bdbd083674");
assert.ok(records.every(r => r.offset % 65 === 0));
assert.ok(records.slice(0, -1).every(r => r.data.length === 65));
assert.equal(records[records.length - 1].offset, 64155);
assert.equal(records[records.length - 1].data.length, 12);
const twitterOffsets = records.map(r => r.offset);
assert.equal(twitterOffsets.includes(280), false);
assert.equal(twitterOffsets.filter(x => x <= 280).at(-1), 260);
assert.equal(twitterOffsets.find(x => x > 280), 325);

// Exact historical operation: source xor.py starts at i=0 and stops at min length.
const historicalOutput = Buffer.alloc(Math.min(twitter.length, mp3.length));
for (let i = 0; i < historicalOutput.length; i++) historicalOutput[i] = twitter[i] ^ mp3[i];
assert.equal(historicalOutput.length, 64167);
assert.deepEqual(historicalOutput, jpeg, "Offset-zero original XOR must recover the exact pinned Gematria JPEG");

// Parse ID3v2.3.0 frame structure from the original MP3 bytes.
assert.equal(mp3.toString("ascii", 0, 3), "ID3");
assert.equal(mp3[3], 3);
assert.equal(mp3[4], 0);
assert.equal(mp3[5], 0);
const id3PayloadBytes = ((mp3[6] & 0x7f) << 21) |
  ((mp3[7] & 0x7f) << 14) | ((mp3[8] & 0x7f) << 7) | (mp3[9] & 0x7f);
const id3End = 10 + id3PayloadBytes;
assert.equal(id3PayloadBytes, 196);
assert.equal(id3End, 206);
let p = 10;
const frames = [];
let txxx = null;
while (p + 10 <= id3End) {
  const id = mp3.toString("ascii", p, p + 4);
  assert.match(id, /^[A-Z0-9]{4}$/);
  const payloadSize = mp3.readUInt32BE(p + 4);
  const end = p + 10 + payloadSize;
  assert.ok(end <= id3End);
  const frame = {id, start:p, headerEnd:p+10, payloadStart:p+10,
    payloadSize, end, totalLength:end-p};
  if (id === "TXXX") {
    assert.equal(mp3[p + 10], 0, "TXXX text encoding is ISO-8859-1");
    const descriptionStart = p + 11;
    const descriptionTerminator = mp3.indexOf(0, descriptionStart);
    assert.ok(descriptionTerminator >= descriptionStart && descriptionTerminator < end);
    const valueStart = descriptionTerminator + 1;
    const description = mp3.toString("latin1", descriptionStart, descriptionTerminator);
    const value = mp3.toString("latin1", valueStart, end);
    assert.equal(description, "Parable 1,595,277,641");
    assert.equal(value, "Like the instar, tunneling to the surface\\nWe must shed our own circumferences;\\nFind the divinity within and emerge.");
    frame.descriptionStart = descriptionStart;
    frame.descriptionTerminator = descriptionTerminator;
    frame.valueStart = valueStart;
    frame.valueEnd = end;
    frame.description = description;
    frame.valueBytes = end - valueStart;
    txxx = frame;
  } else if (id === "TIT2") {
    assert.equal(mp3.toString("latin1", p + 11, end), "The Instar Emergence");
  } else if (id === "TPE1") {
    assert.equal(mp3.toString("latin1", p + 11, end), "3301");
  }
  frames.push(frame);
  p = end;
}
assert.equal(p, id3End);
assert.deepEqual(frames.map(f => [f.id, f.start, f.headerEnd, f.payloadSize, f.end, f.totalLength]), [
  ["TXXX",10,20,140,160,150],
  ["TIT2",160,170,21,191,31],
  ["TPE1",191,201,5,206,15]
]);
assert.deepEqual([txxx.descriptionStart, txxx.descriptionTerminator, txxx.valueStart, txxx.valueEnd, txxx.valueBytes],
  [21,42,43,160,117]);
const id3Boundaries = [0,10,20,21,42,43,160,170,191,201,206];
assert.equal(id3Boundaries.includes(280), false);

// The first MPEG-1 Layer III frame begins immediately after the ID3 tag.
const mpegHeader = mp3.readUInt32BE(id3End);
const sync = mpegHeader >>> 21;
const versionId = (mpegHeader >>> 19) & 3;
const layerId = (mpegHeader >>> 17) & 3;
const bitrateIndex = (mpegHeader >>> 12) & 15;
const sampleRateIndex = (mpegHeader >>> 10) & 3;
const padding = (mpegHeader >>> 9) & 1;
const mpeg1Layer3Bitrates = [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320];
const sampleRates = [44100,48000,32000];
assert.equal(sync, 0x7ff);
assert.equal(versionId, 3);
assert.equal(layerId, 1);
const bitrateKbps = mpeg1Layer3Bitrates[bitrateIndex];
const sampleRate = sampleRates[sampleRateIndex];
assert.equal(bitrateKbps, 192);
assert.equal(sampleRate, 44100);
const firstFrameLength = Math.floor(144 * bitrateKbps * 1000 / sampleRate) + padding;
const firstMpegFrame = {start:id3End, end:id3End + firstFrameLength, length:firstFrameLength,
  bitrateKbps, sampleRate, padding, headerHex:mp3.subarray(id3End,id3End+4).toString("hex")};
assert.deepEqual(firstMpegFrame, {
  start:206,end:832,length:626,bitrateKbps:192,sampleRate:44100,padding:0,headerHex:"fffbb064"
});
assert.ok(280 > firstMpegFrame.start && 280 < firstMpegFrame.end);
assert.equal([firstMpegFrame.start, firstMpegFrame.end].includes(280), false);

// Parse JPEG header marker segments and the internal DHT table extents.
function parseJpegHeader(buffer) {
  assert.equal(buffer.readUInt16BE(0), 0xffd8);
  const segments = [];
  const dhtTables = [];
  let pos = 2;
  let sosStart = null;
  while (pos < buffer.length) {
    const start = pos;
    assert.equal(buffer[pos], 0xff, "Expected JPEG marker prefix at " + pos);
    while (buffer[pos] === 0xff) pos++;
    const marker = buffer[pos++];
    if (marker === 0xda) { sosStart = start; break; }
    if (marker === 0xd9) { segments.push({marker,start,end:pos}); break; }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      segments.push({marker,start,end:pos});
      continue;
    }
    const lengthOffset = pos;
    const length = buffer.readUInt16BE(lengthOffset);
    const end = lengthOffset + length;
    assert.ok(end <= buffer.length);
    segments.push({marker,start,end,length});
    if (marker === 0xc4) {
      let q = lengthOffset + 2;
      while (q < end) {
        const tableStart = q;
        const info = buffer[q++];
        const counts = buffer.subarray(q, q + 16);
        assert.equal(counts.length, 16);
        q += 16;
        const symbols = counts.reduce((a, b) => a + b, 0);
        q += symbols;
        assert.ok(q <= end);
        dhtTables.push({start:tableStart,end:q,tableClass:info >>> 4,tableId:info & 15,symbols});
      }
      assert.equal(q, end);
    }
    pos = end;
  }
  return {segments,dhtTables,sosStart};
}
const jpegLayout = parseJpegHeader(jpeg);
assert.deepEqual(jpegLayout.segments.map(s => [s.marker,s.start,s.end]), [
  [0xe0,2,20],[0xdb,20,89],[0xdb,89,158],[0xc0,158,177],
  [0xc4,177,210],[0xc4,210,393],[0xc4,393,426],[0xc4,426,609]
]);
assert.deepEqual(jpegLayout.dhtTables.map(t => [t.start,t.end]), [
  [181,210],[214,393],[397,426],[430,609]
]);
assert.equal(jpegLayout.sosStart, 609);
const jpegBoundaries = jpegLayout.segments.flatMap(s => [s.start,s.end])
  .concat(jpegLayout.dhtTables.flatMap(t => [t.start,t.end]), [jpegLayout.sosStart]);
assert.equal(jpegBoundaries.includes(280), false);
const jpegSegmentAt280 = jpegLayout.segments.find(s => s.start <= 280 && 280 < s.end);
const jpegTableAt280 = jpegLayout.dhtTables.find(t => t.start <= 280 && 280 < t.end);
assert.equal(jpegSegmentAt280.marker, 0xc4);
assert.deepEqual([jpegSegmentAt280.start,jpegSegmentAt280.end], [210,393]);
assert.deepEqual([jpegTableAt280.start,jpegTableAt280.end], [214,393]);

const xorBoundaries = [0, historicalOutput.length, mp3.length];
assert.equal(xorBoundaries.includes(280), false);
const result = {
  sourceCommit:"ade9a02889ef8acbc8cde8edbfd0a785c369f4c3",
  exactInputs:{
    mp3:{bytes:mp3.length,gitBlobSha1:gitBlobSha1(mp3),sha256:sha256(mp3)},
    twitter:{bytes:twitter.length,gitBlobSha1:gitBlobSha1(twitter),records:records.length},
    gematriaJpeg:{bytes:jpeg.length,gitBlobSha1:gitBlobSha1(jpeg)}
  },
  historicalXor:{startOffset:0,outputBytes:historicalOutput.length,exactGematriaJpeg:true},
  id3:{version:"2.3.0",tagPayloadBytes:id3PayloadBytes,tagRange:[0,id3End],
    frames:frames.map(f => ({id:f.id,start:f.start,headerEnd:f.headerEnd,payloadSize:f.payloadSize,end:f.end,totalLength:f.totalLength})),
    txxx:{descriptionRange:[21,42],descriptionTerminator:42,valueRange:[43,160],valueBytes:117,
      description:txxx.description,value:txxx.value}},
  firstMpegFrame,
  twitterRecords:{count:records.length,allStartsMultiplesOf65:true,finalRecord:{offset:64155,bytes:12},
    previousStart:260,nextStart:325,offset280Present:false},
  jpeg:{segments:jpegLayout.segments.map(s=>({marker:"0x"+s.marker.toString(16),start:s.start,end:s.end})),
    dhtTables:jpegLayout.dhtTables,segmentContaining280:{start:jpegSegmentAt280.start,end:jpegSegmentAt280.end},
    dhtTableContaining280:{start:jpegTableAt280.start,end:jpegTableAt280.end}},
  scalar280:{id3Boundary:false,mpegFrameBoundary:false,twitterRecordOffset:false,
    jpegMarkerOrDhtBoundary:false,xorOperandBoundary:false},
  conclusion:"280 is not a source-defined byte offset, field boundary, frame boundary, record start, JPEG marker/DHT boundary, or XOR operand boundary in the original 2013 Instar chain."
};
assert.ok(Object.values(result.scalar280).every(v => v === false));
console.log(JSON.stringify(result,null,2));
