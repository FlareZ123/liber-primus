'use strict';

/**
 * Source-bound AES-256 gate for LP2 p15's sixteen decimal cells and the original
 * pp49-51 256-byte numeric table. Run: node sims/lp2_p15_16bit_aes256_grid_original_sft.cjs
 * Scope: 2 key reading orders x 2 uint16 byte orders x 2 table orders
 * x 2 documented table radices x 3 standard direct AES modes = 48 models.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const raw = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'
));
const alphabet60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alphabet59 = alphabet60.replace('f', '');
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
assert.equal(raw.rows.length, 32);
assert(raw.rows.every((row) => row.length === 8));
assert(!raw.rows.flat().some((token) => token.includes('f')));

/** @param {string[]} tokens @param {string} alphabet @returns {Buffer} */
function parseTokens(tokens, alphabet) {
  return Buffer.from(tokens.map((token) => {
    assert.equal(token.length, 2);
    const a = alphabet.indexOf(token[0]);
    const b = alphabet.indexOf(token[1]);
    assert(a >= 0 && b >= 0);
    const value = a * alphabet.length + b;
    assert(value >= 0 && value <= 255);
    return value;
  }));
}

/** @param {Buffer} bytes @returns {string} */
function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

const g60 = parseTokens(raw.rows.flat(), alphabet60);
const g59 = parseTokens(raw.rows.flat(), alphabet59);
assert.equal(sha256(g60), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.equal(sha256(g59), '511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79');
assert(g60.equals(Buffer.from(raw.byte_rows.flat())));

// Exact sixteen original p15 decimal cells. The red 3299 fixes the spiral's start.
const row = [3258, 3222, 3152, 3038, 3278, 3299, 3298, 2838,
             3288, 3294, 3296, 2472, 4516, 1206, 708, 1820];
const spiral = [3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
                3152, 3038, 2838, 2472, 1820, 708, 1206, 4516];
assert.deepEqual([...row].sort((a, b) => a - b), [...spiral].sort((a, b) => a - b));

/** @param {number[]} values @param {'BE'|'LE'} order @returns {Buffer} */
function keyFromValues(values, order) {
  const key = Buffer.alloc(32);
  for (let i = 0; i < 16; i++) {
    if (order === 'BE') key.writeUInt16BE(values[i], 2 * i);
    else key.writeUInt16LE(values[i], 2 * i);
  }
  return key;
}

/** @param {Buffer} src @returns {Buffer} */
function columns(src) {
  const out = Buffer.alloc(256);
  for (let col = 0; col < 8; col++) {
    for (let line = 0; line < 32; line++) out[col * 32 + line] = src[line * 8 + col];
  }
  return out;
}

/** @param {Buffer} src @param {Buffer} key @param {'ecb'|'cbc'|'ctr'} mode @param {boolean} encrypt @returns {Buffer} */
function aes(src, key, mode, encrypt) {
  const iv = mode === 'ecb' ? null : Buffer.alloc(16);
  const cipher = encrypt
    ? crypto.createCipheriv('aes-256-' + mode, key, iv)
    : crypto.createDecipheriv('aes-256-' + mode, key, iv);
  if (mode !== 'ctr') cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(src), cipher.final()]);
}

/** @param {Buffer} buf @param {(x:number)=>boolean} predicate @returns {number} */
function longestRun(buf, predicate) {
  let best = 0;
  let run = 0;
  for (const byte of buf) {
    run = predicate(byte) ? run + 1 : 0;
    if (run > best) best = run;
  }
  return best;
}
const isPrintable = (x) => (x >= 32 && x <= 126) || x === 9 || x === 10 || x === 13;
const isGP29 = (x) => x < 29;

let models = 0;
let maxPrintable = 0;
let maxPrintableRun = 0;
let maxGP29 = 0;
let maxGP29Run = 0;
for (const [radix, grid] of [['60', g60], ['59', g59]]) {
  for (const [keyOrder, values] of [['row', row], ['spiral', spiral]]) {
    for (const endian of ['BE', 'LE']) {
      const key = keyFromValues(values, endian);
      for (const [tableOrder, data] of [['row', grid], ['column', columns(grid)]]) {
        for (const mode of ['ecb', 'cbc', 'ctr']) {
          const out = aes(data, key, mode, false);
          const printable = out.filter(isPrintable).length;
          const gp29 = out.filter(isGP29).length;
          const prRun = longestRun(out, isPrintable);
          const gpRun = longestRun(out, isGP29);
          maxPrintable = Math.max(maxPrintable, printable);
          maxPrintableRun = Math.max(maxPrintableRun, prRun);
          maxGP29 = Math.max(maxGP29, gp29);
          maxGP29Run = Math.max(maxGP29Run, gpRun);
          assert.equal(out.length, 256);
          assert(aes(out, key, mode, true).equals(data));
          console.log(
            ['original', radix, keyOrder, endian, tableOrder, mode,
             'printable=' + printable, 'print-run=' + prRun,
             'gp29=' + gp29, 'gp29-run=' + gpRun].join('\t')
          );
          models++;
        }
      }
    }
  }
}
assert.equal(models, 48);
assert.equal(maxPrintable, 118);
assert.equal(maxPrintableRun, 8);
assert.equal(maxGP29, 46);
assert.equal(maxGP29Run, 4);

// Independent exact inverse plants: no original ciphertext is altered.
const key = keyFromValues(spiral, 'BE');
const english = Buffer.from(('THE TOTIENT FUNCTION IS SACRED. ALL THINGS SHOULD BE ENCRYPTED. ')
  .repeat(5).slice(0, 256).padEnd(256, ' '), 'ascii');
assert.equal(english.length, 256);
const plantedEnglish = aes(english, key, 'cbc', true);
assert(aes(plantedEnglish, key, 'cbc', false).equals(english));
assert.equal(longestRun(aes(plantedEnglish, key, 'cbc', false), isPrintable), 256);
const gp = Buffer.from(Array.from({ length: 256 }, (_, i) => (i * 11 + 7) % 29));
const plantedGP = aes(gp, key, 'ctr', true);
assert(aes(plantedGP, key, 'ctr', false).equals(gp));
assert.equal(longestRun(aes(plantedGP, key, 'ctr', false), isGP29), 256);
console.log('PASS: 48/48 original input models binary-looking; '+ 
  'max printable count/run='+maxPrintable+'/'+maxPrintableRun+
  ', GP29 byte count/run='+maxGP29+'/'+maxGP29Run+
  '; 256/256 printable and GP29 controlled plants recover exactly.');
