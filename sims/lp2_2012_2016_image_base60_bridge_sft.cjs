'use strict';

/**
 * Source-frozen 2012/2016 Cicada image geometry and LP2 base-60 bridge.
 *
 * Finds an exact quarter-turn, 60-pixel coordinate displacement and
 * tests its independent LP2 source witnesses. This is an exploratory
 * cross-round clue, not a proposed plaintext or a cipher.
 *
 * Run: node sims/lp2_2012_2016_image_base60_bridge_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

/** @param {string} name @returns {Buffer} */
function readBytes(name) {
  return fs.readFileSync(path.join(root, name));
}

/** @param {string} name @returns {unknown} */
function readJson(name) {
  return JSON.parse(readBytes(name).toString('utf8'));
}

/**
 * Obtain actual JPEG SOF0 image dimensions from source bytes.
 * @param {Buffer} image
 * @returns {{width:number,height:number}}
 */
function dimensions(image) {
  assert.equal(image.readUInt16BE(0), 0xffd8);
  let offset = 2;
  while (offset < image.length) {
    assert.equal(image[offset++], 0xff, 'JPEG marker');
    while (image[offset] === 0xff) offset++;
    const marker = image[offset++];
    const len = image.readUInt16BE(offset);
    assert.ok(len >= 2);
    if (marker === 0xc0) {
      assert.equal(image[offset + 2], 8, 'baseline 8-bit JPEG');
      return {
        height: image.readUInt16BE(offset + 3),
        width: image.readUInt16BE(offset + 5)
      };
    }
    assert.notEqual(marker, 0xda, 'SOS preceded source SOF0');
    offset += len;
  }
  throw new Error('no baseline SOF0 found');
}

/** @param {Buffer} b @returns {string} */
function gitBlobSha(b) {
  return crypto.createHash('sha1')
    .update('blob ' + b.length + '\0')
    .update(b)
    .digest('hex');
}
const oldJpeg = readBytes('resources/historical/cicada2012-first-image.jpg');
const newJpeg = readBytes('resources/historical/cicada2016-4gq25.jpg');
assert.equal(gitBlobSha(oldJpeg), '467a24a6f70bb589a994fd73ee37b6f9c7a827f8');
assert.equal(gitBlobSha(newJpeg), '22027296dcd7df53c5127e6aadbabeaf3223f72d');
const old = dimensions(oldJpeg);
const fresh = dimensions(newJpeg);
assert.deepEqual(old, {width:509,height:503});
assert.deepEqual(fresh, {width:563,height:569});

// The two source images are oriented differently. A quarter turn
// exchanges the axes, and then both resulting dimensions differ by 60.
const delta = [fresh.width - old.height, fresh.height - old.width];
assert.deepEqual(delta, [60,60]);
assert.notDeepEqual([fresh.width - old.width, fresh.height - old.height], [60,60]);

const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const grid = readJson('resources/liber-primus/lp2-grid-256.json');
assert.equal(grid.alphabet.length, 60);
const gridBytes = grid.pages.flatMap(page => page.bytes);
assert.equal(gridBytes.length, 256);
assert.equal(crypto.createHash('sha256')
  .update(Buffer.from(gridBytes)).digest('hex'),
'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const text = readBytes('resources/liber-primus/lp2-transcription.txt').toString('utf8');
const runePages = text.split(/\s*%\s*/);
assert.equal(runePages.length, 57);
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const originalPages = runePages.slice(0, 55).map((page, i) => ({
  page:i < 50 ? i : i + 1,
  words:(page.replace(/\s/g,'').replaceAll('/','')
    .match(/\p{Script=Runic}+/gu) || [])
    .map(glyphs => [...glyphs].map(glyph => {
      assert.ok(runeIndex.has(glyph));
      return runeIndex.get(glyph);
    }))
}));
const words = originalPages.flatMap(page => page.words.map((runes, j) => ({
  page:page.page,ordinal:j + 1,runes,
  primeSum:runes.reduce((n, rune) => n + corpus.prime[rune], 0)
})));
assert.equal(words.length, 2928);
assert.equal(words.reduce((n, word) => n + word.runes.length, 0),12956);

const anchors = [fresh.width, fresh.height].map(sum =>
  words.filter(word => word.primeSum === sum));
assert.deepEqual(anchors.map(hit => hit.map(word =>
  [word.page,word.ordinal,word.runes.length])),
[[[0,6,11]],[[1,33,10]]]);
const p32 = corpus.pages.find(page=>page.page===32).indices;
assert.equal(p32.length, 121);
const rowSum = p32.slice(0,11).reduce((n, rune) => n + corpus.prime[rune], 0);
const colSum = Array.from({length:11}, (_,r) => p32[11*r])
  .reduce((n, rune) => n + corpus.prime[rune], 0);
assert.deepEqual([rowSum,colSum],[fresh.width,fresh.height]);

const transliterate = indices=>indices.map(index=>corpus.translit[index]).join('');
const word0 = anchors[0][0];
assert.equal(transliterate(word0.runes),'NEWBASOEEOINGU');
assert.equal(transliterate(word0.runes.slice(0,6)),'NEWBAS');
const identicalSixRunes = originalPages.reduce((count, page) => {
  const flat = page.words.flat();
  for(let i=0;i+6<=flat.length;i++)
    if(flat.slice(i,i+6).every((r,j)=>r===word0.runes[j])) count++;
  return count;
},0);
assert.equal(identicalSixRunes,1);
assert.equal(transliterate(anchors[1][0].runes),'JFINIACYEAIIA');

// The source-suggested 2012 image multiplication is a distinct historical
// operation, supplied as context. The 2016-size product has no known role.
const oldPhone=old.width * old.height * 3301;
assert.equal(oldPhone,845145127);
const newProduct=fresh.width * fresh.height * 3301;
assert.equal(newProduct,1057465447);

console.log(JSON.stringify({
  source2012:{archiveBlobSha:gitBlobSha(oldJpeg),...old,phone:oldPhone},
  source2016:{archiveBlobSha:gitBlobSha(newJpeg),...fresh},
  observedImageTransformation:'2012 rotate 90 degrees; add 60 to both dimensions',
  signed2016MatchToLP2P32:{firstRowPrimeSum:rowSum,firstColumnPrimeSum:colSum},
  originalBase60Table:{alphabetSize:grid.alphabet.length,bytes:gridBytes.length},
  uniqueWordPrimeSums:anchors.map(hit=>({
    page:hit[0].page,word:hit[0].ordinal,
    primeSum:hit[0].primeSum,
    nativeTransliteration:transliterate(hit[0].runes)
  })),
  sixRunePrefix:{literal:'NEWBAS',unknownTextSixRuneOccurrences:identicalSixRunes},
  newImageOldPhoneOperationProduct:newProduct,
  evidenceClass:'Post-hoc cross-round geometric/lexical conjunction. Neither 60-pixel shift nor NEWBAS supplies a reversible unknown-page decoder, plaintext, or network destination.'
},null,2));
