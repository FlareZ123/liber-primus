'use strict';
/**
 * Exact original LP1 p05 mirror-center -> historical 2014 five-by-five square.
 * Source: im-results/lp1-p05-central-block.txt (360 bytes from 05.jpg).
 * Independent comparison: resources/cicada2014-openpuff-magic-squares.txt.
 * Run from the repository root: node sims/lp1_p05_magic_square_nibble_inverse_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..');
const preserved=fs.readFileSync(path.join(ROOT,'im-results','lp1-p05-central-block.txt'),'utf8');
// The repository transcription carries one editorial final CRLF. The original
// 360 JPEG bytes contain exactly two leading LF and 358 lowercase hex digits.
assert(preserved.replace(/\r\n/g,'\n').startsWith('\n\n'));
const hex=preserved.trim();
assert.equal(Buffer.byteLength('\n\n'+hex,'ascii'),360);
assert.match(hex,/^[0-9a-f]{358}$/);
const payload=Buffer.from(hex,'hex');
assert.equal(payload.length,179);
assert.equal(crypto.createHash('sha256').update(payload).digest('hex'),
 '82c135148b6cf85e9b550afdbc6204be075ff67717356a8ae18b76f9cc3af5fa');
/** @param {number} v @returns {number} */
const swapNibble=v=>((v&15)<<4)|(v>>>4);
const readable=Buffer.from(payload.map(swapNibble)).toString('ascii');
assert.match(readable,/^\n(?:[\d ]+\n){4}[\d ]+$/);
const lines=readable.trim().split('\n');
assert.equal(lines.length,5);
assert(lines.every(line=>line.trim().split(/\s+/).length===5));
/** @param {string} text @returns {string} */
const unmirrorDigits=text=>text.replace(/\d+/g,word=>word.split('').reverse().join(''));
const revealed=unmirrorDigits(readable);
/** @param {string} text @returns {string[][]} */
const matrix=text=>text.trim().split(/\r?\n/).map(line=>line.trim().split(/\s+/));
const decoded=matrix(revealed);
assert.deepEqual(decoded,decoded.slice().reverse().map(r=>r.slice().reverse()));
// This independent stage source explicitly prints three matrices, of which
// the recovered original p05 hidden matrix must be the third, word-for-word.
const historical=fs.readFileSync(path.join(ROOT,'resources','cicada2014-openpuff-magic-squares.txt'),'utf8');
const blocks=historical.trim().split(/(?:\r?\n){2,}/).map(matrix);
assert.equal(blocks.length,3);
assert.deepEqual(decoded,blocks[2]);
assert.notDeepEqual(matrix(readable),blocks[2]);
// Exact byte-level reversible recovery (no loss from numeric leading zero).
const reconstructed=Buffer.from([...Buffer.from(unmirrorDigits(revealed),'ascii')].map(swapNibble));
assert.deepEqual(reconstructed,payload);
assert.equal(reconstructed.toString('hex'),hex);
const output=decoded.map(r=>r.join(' ')).join('\n');
console.log(JSON.stringify({
 status:'PASS',source:'original LP1 05.jpg central 179-byte object',
 operation:'ASCII hex -> swap 8-bit nibbles -> reverse digits of each decimal token',
 sourceBytes:179,sourceSha256:crypto.createHash('sha256').update(payload).digest('hex'),
 target:'2014 OpenPuff magic squares, independently preserved third 5x5 square',
 exactSquare:true,rotationallySymmetric:true,exactByteReencoding:true,
 matrix:output,unknownLP2PlaintextRecovered:false
},null,2));
