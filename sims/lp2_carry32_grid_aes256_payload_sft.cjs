"use strict";

/**
 * Source-selected 32 cross-page words pick one cell from each row of the
 * original 32x8 sexagesimal table. Test the resulting 32-byte AES key
 * against the remaining 224 bytes as a self-contained encrypted payload.
 *
 * AES, selecting sum(primes) mod 8, and binary serialization are hypotheses,
 * not authenticated Liber Primus instructions.
 *
 * SFT: node sims/lp2_carry32_grid_aes256_payload_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash, createCipheriv, createDecipheriv} = require("node:crypto");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/base60-grid.json"), "utf8"));
const transcript = fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-transcription.txt"), "utf8");

const runePrime = new Map(corpus.runes.map((rune, i) =>
  [rune, corpus.prime[i]]));
assert.equal(runePrime.size, 29);

/**
 * Word parsing is continuous across soft line wraps and physical pages.
 * Only the first 55 rune-bearing transcript sections are unknown LP2.
 * @param {string} raw
 * @returns {{words:number,runes:number,carries:Array<{runes:string,primeSum:number,startPage:number,endPage:number}>}}
 */
function parseCrossPageWords(raw) {
  const unknown = raw.split("%").slice(0, 55).join("%");
  const carries = [];
  let page = 0, startPage = 0, endPage = 0;
  let word = [], primeSum = 0, words = 0, runes = 0;

  function finishWord() {
    if (!word.length) return;
    words++;
    if (startPage !== endPage) {
      carries.push({
        runes: word.join(""), primeSum,
        startPage, endPage
      });
    }
    word = [];
    primeSum = 0;
  }

  for (const rune of unknown) {
    if (runePrime.has(rune)) {
      if (!word.length) startPage = page;
      endPage = page;
      word.push(rune);
      primeSum += runePrime.get(rune);
      runes++;
    } else if (rune === "%") {
      page++;
    } else if (rune === "/" || /\s/u.test(rune)) {
      // Image line wraps and spaces are not word boundaries.
    } else {
      // Visible punctuation, '.', '-' and section marks delimit words.
      finishWord();
    }
  }
  finishWord();
  return {words, runes, carries};
}

/** @param {Buffer} data @returns {string} */
function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

const parsed = parseCrossPageWords(transcript);
assert.equal(parsed.runes, 12956);
assert.equal(parsed.words, 2896);
assert.equal(parsed.carries.length, 32);
assert.deepEqual(grid.page_row_counts, [10, 13, 9]);
assert.equal(grid.alphabet.length, 60);
assert.equal(grid.byte_rows.length, 32);

const table = [];
for (let row = 0; row < 32; row++) {
  assert.equal(grid.rows[row].length, 8);
  assert.equal(grid.byte_rows[row].length, 8);
  for (let col = 0; col < 8; col++) {
    const token = grid.rows[row][col];
    const byte = 60 * grid.alphabet.indexOf(token[0]) +
      grid.alphabet.indexOf(token[1]);
    assert.equal(byte, grid.byte_rows[row][col]);
    assert.ok(byte >= 0 && byte <= 255);
    table.push(byte);
  }
}
assert.equal(sha256(Buffer.from(table)),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const selectedColumns = parsed.carries.map((word) => word.primeSum % 8);
const key = Buffer.from(selectedColumns.map((col, row) =>
  grid.byte_rows[row][col]));
const unselectedRows = grid.byte_rows.map((values, row) =>
  values.filter((_, col) => col !== selectedColumns[row]));
const payloadRowMajor = Buffer.from(unselectedRows.flat());
const payloadColumnMajor = Buffer.from(
  Array.from({length: 7}, (_, col) =>
    unselectedRows.map((row) => row[col])).flat()
);
const entireTable = Buffer.from(table);

assert.equal(selectedColumns.join(""), "41733365273004427417340057065101");
assert.equal(key.toString("hex"),
  "61f9571927499cc41952c1d3de0e3656abf5d2f85294eb807315393300ea909e");
assert.equal(payloadRowMajor.length, 224);
assert.equal(payloadColumnMajor.length, 224);
assert.equal(sha256(payloadRowMajor),
  "ba31bfb8fb5ac631b34208e741552f2659f7e206a664b8c78d4dbf1e24974106");
assert.equal(sha256(payloadColumnMajor),
  "7b77462eb0597b4c0c918a70b4453531805a1c973bfec66efd935ced53e74233");

/**
 * @param {Buffer} input
 * @param {"ecb"|"cbc"|"ctr"} mode
 * @param {"encrypt"|"decrypt"} operation
 * @returns {Buffer}
 */
function aes256(input, mode, operation) {
  const algorithm = "aes-256-" + mode;
  const iv = mode === "ecb" ? null : Buffer.alloc(16);
  const cipher = operation === "encrypt"
    ? createCipheriv(algorithm, key, iv)
    : createDecipheriv(algorithm, key, iv);
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(input), cipher.final()]);
}

/**
 * @param {Buffer} data
 * @returns {{printable:number,longestPrintableRun:number,zeroBytes:number,strings:string[]}}
 */
function inspect(data) {
  let printable = 0, currentRun = 0, longestPrintableRun = 0;
  const strings = [];
  for (const byte of data) {
    if (byte >= 32 && byte <= 126) {
      printable++;
      currentRun++;
      longestPrintableRun = Math.max(longestPrintableRun, currentRun);
    } else {
      currentRun = 0;
    }
  }
  const matches = data.toString("latin1").match(/[\x20-\x7e]{5,}/g);
  if (matches) strings.push(...matches);
  return {printable, longestPrintableRun, zeroBytes: data.filter(b => b === 0).length,
    strings};
}

const payloads = [
  {name: "unselected-row-major", bytes: payloadRowMajor},
  {name: "unselected-column-major", bytes: payloadColumnMajor},
  {name: "entire-original-row-major", bytes: entireTable}
];
const expected = {
  "unselected-row-major": [
    "541907d04fb2213641dc3c20ac1da9b67348a3287384089e80e6dbe419d163c3",
    "8929c3301086983eb4710359f21a4143eb0749e366c00e840cc28885d10c8595",
    "187fddfc334799ae99b2dd546c9c638652b9a7fd549e0c629cfed2207f2b632c"
  ],
  "unselected-column-major": [
    "489bb18b0ab1c9bdbe8889d7c9ba8691aee53ab0f2a183ece77677c4d5c97748",
    "d8b4cda87c3ffa6a3d8fe1872f74e30a6c44daff2aa4711f987151e1f62d33b5",
    "62025f7e09bbc1fb2e803ef9360604b45c1816a411172f6201acfc5b90856be6"
  ],
  "entire-original-row-major": [
    "aa3020da40f67829a29a334323ed490d6d08faae6a5ecb60a04a5f42a6a40a67",
    "01c3dbcdff2f54083426900e8d3086e7a7e0638e843d8a7afd160a20610347fe",
    "5c5c7eb9ec67786943fbf50a27c8061c07633e1e836ea284ed6e8764f639ec70"
  ]
};

const results = [];
for (const entry of payloads) {
  for (const [index, mode] of ["ecb", "cbc", "ctr"].entries()) {
    const decoded = aes256(entry.bytes, mode, "decrypt");
    const digest = sha256(decoded);
    assert.equal(digest, expected[entry.name][index]);

    // Native-text plant validates reversibility for every format/mode.
    const plant = Buffer.alloc(entry.bytes.length, 65);
    Buffer.from("LIBER PRIMUS POSITIVE CONTROL.").copy(plant);
    const recovered = aes256(aes256(plant, mode, "encrypt"),
      mode, "decrypt");
    assert.deepEqual(recovered, plant);
    const output = inspect(decoded);
    results.push({
      source: entry.name, mode: "aes-256-" + mode,
      sourceBytes: entry.bytes.length, sha256: digest,
      ...output, plantRecovered: recovered.length
    });
  }
}


const embeddedIVExpected = {
  "unselected-row-major": [
    "c0a83080dd808e9e26d77eddeeb02ba4c062b084f266226079dc394ace71e0b8",
    "32444b8f60027838cbac5992191323ce2d0db33cae638bd78acd80bb3e6f30b8"
  ],
  "unselected-column-major": [
    "6bad8a62474d97564085d06962115a4226fe663abae220acec4af4e3d0df02a7",
    "6342080ec14dfbea4c465a2721640f7a082f837b321742eaf8a0fd55007a630c"
  ]
};

// The conventional self-contained AES-CBC framing is a source byte IV
// followed by encrypted blocks, with an optional IV-at-tail contrast.
for (const entry of payloads.slice(0, 2)) {
  for (const [index, side] of ["prefix", "suffix"].entries()) {
    const iv = side === "prefix"
      ? entry.bytes.subarray(0, 16)
      : entry.bytes.subarray(entry.bytes.length - 16);
    const ciphertext = side === "prefix"
      ? entry.bytes.subarray(16)
      : entry.bytes.subarray(0, entry.bytes.length - 16);
    assert.equal(ciphertext.length, 208);
    const decipher = createDecipheriv("aes-256-cbc", key, iv);
    decipher.setAutoPadding(false);
    const decoded = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    assert.equal(sha256(decoded), embeddedIVExpected[entry.name][index]);

    // End-to-end control: arbitrary original-looking IV plus 208 source-shape
    // ASCII plaintext bytes, encrypted under the same key and recovered.
    const plant = Buffer.alloc(208, 65);
    Buffer.from("LIBER PRIMUS EMBEDDED IV CONTROL.").copy(plant);
    const encrypter = createCipheriv("aes-256-cbc", key, iv);
    encrypter.setAutoPadding(false);
    const encryptedPlant = Buffer.concat([encrypter.update(plant), encrypter.final()]);
    const plantDecipher = createDecipheriv("aes-256-cbc", key, iv);
    plantDecipher.setAutoPadding(false);
    assert.deepEqual(Buffer.concat([
      plantDecipher.update(encryptedPlant), plantDecipher.final()
    ]), plant);

    const pad = decoded[decoded.length - 1];
    const validPKCS7 = pad > 0 && pad <= 16 &&
      decoded.subarray(decoded.length - pad).every(b => b === pad);
    assert.equal(validPKCS7, false);
    results.push({
      source: entry.name,
      mode: "aes-256-cbc-embedded-iv-" + side,
      sourceBytes: ciphertext.length,
      ivHex: iv.toString("hex"),
      sha256: sha256(decoded),
      ...inspect(decoded),
      validPKCS7, plantRecovered: plant.length
    });
  }
}


// Conventional authenticated AES256-GCM envelope: 12-byte nonce,
// 196-byte ciphertext, and 16-byte authentication tag, packed into 224
// source cells. A failed tag is a cryptographic exclusion independent of
// the plaintext language or binary representation.
const authenticatedContainers = [];
for (const entry of payloads.slice(0, 2)) {
  const nonce = entry.bytes.subarray(0, 12);
  const ciphertext = entry.bytes.subarray(12, entry.bytes.length - 16);
  const tag = entry.bytes.subarray(entry.bytes.length - 16);
  assert.equal(ciphertext.length, 196);

  const genuine = Buffer.from("LIBER PRIMUS AUTHENTICATED POSITIVE CONTROL.");
  const e = createCipheriv("aes-256-gcm", key, nonce);
  const encrypted = Buffer.concat([e.update(genuine), e.final()]);
  const realTag = e.getAuthTag();
  const p = createDecipheriv("aes-256-gcm", key, nonce);
  p.setAuthTag(realTag);
  assert.deepEqual(Buffer.concat([p.update(encrypted), p.final()]), genuine);

  const d = createDecipheriv("aes-256-gcm", key, nonce);
  d.setAuthTag(tag);
  d.update(ciphertext);
  let tagAccepted = false;
  try {
    d.final();
    tagAccepted = true;
  } catch (_authFailure) {
    // The authenticated ciphertext is rejected by Node's AES-GCM final().
  }
  assert.equal(tagAccepted, false);
  authenticatedContainers.push({
    source: entry.name, nonce: nonce.toString("hex"),
    tag: tag.toString("hex"), ciphertextBytes: ciphertext.length,
    mode: "aes-256-gcm-nonce-first-tag-last",
    tagAccepted, controlRecovered: genuine.length
  });
}


/**
 * Historically used OpenPGP CFB framing per RFC 4880, sections 5.7,
 * 5.13 and 13.9. The 16-byte prefix repeats its last two bytes as a
 * 16-bit immediate key check. SEIPD v1 keeps CFB feedback continuous and
 * appends the SHA-1 modification-detection code. Legacy SED resyncs
 * after the 18-byte prefix; either way the first 18 decrypted bytes
 * and their key-check requirement are identical.
 *
 * This exact test is source-motivated by Cicada's historical OpenPGP
 * artifacts; the table has no authenticated OpenPGP SED packet header.
 *
 * @param {Buffer} cipher
 * @returns {{prefixHex:string,keyCheck:boolean,mdcMarker:boolean,mdcValid:boolean,legacyPrefixRecovered:boolean}}
 */
function inspectOpenPGP(cipher) {
  const decrypt = createDecipheriv("aes-256-cfb", key, Buffer.alloc(16));
  const clear = Buffer.concat([decrypt.update(cipher), decrypt.final()]);
  const keyCheck = clear[14] === clear[16] && clear[15] === clear[17];
  const messageSize = clear.length;
  const mdcMarker = clear[messageSize - 22] === 0xd3 &&
    clear[messageSize - 21] === 0x14;
  const expectMDC = createHash("sha1").update(
    clear.subarray(0, messageSize - 20)).digest();
  const mdcValid = mdcMarker &&
    clear.subarray(messageSize - 20).equals(expectMDC);

  const legacyPrefix = cipher.subarray(0, 18);
  const decipher0 = createDecipheriv("aes-256-cfb", key, Buffer.alloc(16));
  const legacyFirst18 = Buffer.concat([
    decipher0.update(legacyPrefix), decipher0.final()
  ]);
  assert.deepEqual(legacyFirst18, clear.subarray(0, 18));
  return {
    prefixHex: clear.subarray(0, 18).toString("hex"),
    keyCheck, mdcMarker, mdcValid, legacyPrefixRecovered: true
  };
}

// Independent OpenPGP SEIPD-v1 source-shaped synthetic positive, with
// faithful initial 18-byte check and full final 22-byte SHA-1 MDC.
const pgpPrefix = Buffer.from(
  "00112233445566778899aabbccddccdd0011", "hex");
assert.equal(pgpPrefix.length, 18);
// Force prefix[16..17] to equal prefix[14..15] exactly.
pgpPrefix[16] = pgpPrefix[14];
pgpPrefix[17] = pgpPrefix[15];
const pgpPayload = Buffer.from(
  "LIBER PRIMUS SOURCE-NATIVE OPENPGP CFB AUTHENTICATED CONTROL.");
const pgpMDCMarker = Buffer.from([0xd3, 0x14]);
const pgpMDCBody = Buffer.concat([
  pgpPrefix, pgpPayload, pgpMDCMarker
]);
const pgpMDCDigest = createHash("sha1").update(pgpMDCBody).digest();
const pgpClear = Buffer.concat([pgpMDCBody, pgpMDCDigest]);
const pgpEncrypter = createCipheriv("aes-256-cfb", key, Buffer.alloc(16));
const pgpCipher = Buffer.concat([
  pgpEncrypter.update(pgpClear), pgpEncrypter.final()
]);
const pgpControl = inspectOpenPGP(pgpCipher);
assert.equal(pgpControl.keyCheck, true);
assert.equal(pgpControl.mdcMarker, true);
assert.equal(pgpControl.mdcValid, true);
const pgpChecks = payloads.slice(0, 2).map(entry => ({
  source: entry.name,
  ciphertextBytes: entry.bytes.length,
  ...inspectOpenPGP(entry.bytes)
}));
for (const item of pgpChecks) {
  assert.equal(item.keyCheck, false);
  assert.equal(item.mdcMarker, false);
  assert.equal(item.mdcValid, false);
}


/**
 * Historical 2012-era Cicada stages also used XOR secret-sharing. Here the
 * source's single selected byte from each of 32 printed rows is a row-wise
 * one-byte XOR pad, applied exactly once to each of the remaining seven
 * cells in that same row. This consumes all 256 source cells and creates
 * seven independent 32-byte messages under one common 32-byte column key.
 *
 * Unlike the AES hypotheses above, no IV, block mode, or KDF is needed.
 */
const xorRows = grid.byte_rows.map((row, r) =>
  row.filter((_, col) => col !== selectedColumns[r])
    .map(byte => byte ^ key[r])
);
const xorPayloads = [
  {name: "row-ordered-seven-xor",bytes: Buffer.from(xorRows.flat())},
  {name: "column-ordered-seven-xor",bytes: Buffer.from(
    Array.from({length:7},(_,col)=>xorRows.map(row=>row[col])).flat())}
];
const expectedXorPrefix64 = {
  "row-ordered-seven-xor":
    "aa86c6db8c1fd6a565270efd4e2d2e9d587631de6c74dfb48f5b949c5455e21177a222191d55af228e05618cb3a7ca37cc3ab25681aeb8f763e6d9de50b075f6",
  "column-ordered-seven-xor":
    "aaa52e745419613a63f64f0f48747f7c62ffaf1fbb64681c737b96bd44801def86659ddf551d8cb2e61dfb159631b9bb18748ed98b704d93e85f3fe8342eba32"
};
const xorResults = xorPayloads.map(entry => {
  assert.equal(entry.bytes.length, 224);
  assert.equal(entry.bytes.subarray(0,64).toString("hex"),
    expectedXorPrefix64[entry.name]);
  const shape = inspect(entry.bytes);
  assert.equal(shape.printable, 85);
  assert.equal(shape.longestPrintableRun, 4);
  return {source:entry.name, sha256:sha256(entry.bytes), ...shape};
});

// Independent exact-size native ASCII control proves column selection and
// selected-cell consumption in every row, followed by rowwise XOR inverse.
const xorPlant = Buffer.alloc(224, 32);
Buffer.from("CICADA THIRTY TWO ROW ORIGINAL XOR CONTROL.").copy(xorPlant);
const xorCipherRows = Array.from({length:32},(_,row)=>
  Array.from({length:7},(_,col)=>xorPlant[7*row+col]^key[row]));
const xorRecovered = Buffer.from(xorCipherRows.flatMap((row,r)=>
  row.map(byte=>byte^key[r])));
assert.deepEqual(xorRecovered, xorPlant);

console.log(JSON.stringify({
  source: "Original 55 unknown physical pages; 32 cross-page words; pp49-51 printed 32x8 table",
  runes: parsed.runes, words: parsed.words, carries: parsed.carries.length,
  carryColumns: selectedColumns.join(""), keyHex: key.toString("hex"),
  results, authenticatedContainers, pgpChecks, pgpControl, xorResults, conclusion: "No ASCII text or recognizable opening signature among the tested exact AES256 key/payload formats; no unknown LP2 plaintext recovered."
}, null, 2));
