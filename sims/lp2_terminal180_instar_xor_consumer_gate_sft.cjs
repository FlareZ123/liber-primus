'use strict';

const fs = require('node:fs');
const crypto = require('node:crypto');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const grid = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-grid-256.json', 'utf8'));
const gp = corpus.translit;
const tokenEntries = gp.map((token, index) => ({ token, index })).sort((a, b) => b.token.length - a.token.length);
const digraphs = ['TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA'];

function toGP(text) {
  const out = [];
  // Word boundaries are not GP symbols: tokenize each word separately so
  // digraphs such as EA cannot be formed across a printed space.
  for (const word of text.toUpperCase().trim().split(/\s+/u)) {
    for (let i = 0; i < word.length;) {
      const digraph = digraphs.find((token) => word.startsWith(token, i));
      const token = digraph || word[i];
      const entry = tokenEntries.find((item) => item.token === token);
      if (!entry) throw new Error('No GP29 token for ' + token + ' at offset ' + i);
      out.push(entry.index);
      i += token.length;
    }
  }
  return out;
}

function gpText(indices) {
  return indices.map((index) => gp[index]).join('');
}

function ioc(indices) {
  const counts = new Array(29).fill(0);
  for (const index of indices) counts[index]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (indices.length * (indices.length - 1));
}

function shannonEntropy(bytes) {
  const counts = new Array(256).fill(0);
  for (const byte of bytes) counts[byte]++;
  return counts.reduce((sum, count) => {
    if (!count) return sum;
    const p = count / bytes.length;
    return sum - p * Math.log2(p);
  }, 0);
}

// Established p56 plaintext in the canonical GP transliteration.
// V and K are absent from GP29, hence the source spellings EUERY and SEEC.
const p56Plaintext = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const p56 = toGP(p56Plaintext);
const p57 = corpus.pages.find((page) => page.page === 57).indices;
const terminal180 = [...p56, ...p57];

const bytes = grid.bytes;
const inner180 = Array.from({ length: 30 }, (_, row) =>
  Array.from({ length: 6 }, (_, col) => bytes[(row + 1) * 8 + col + 1])
).flat();

const p55 = corpus.pages.find((page) => page.page === 55).indices;
if (bytes.length !== 256 || inner180.length !== 180 || p56.length !== 85 ||
    p57.length !== 95 || terminal180.length !== 180 || p55.length !== 76) {
  throw new Error(JSON.stringify({
    bytes: bytes.length, inner180: inner180.length, p56: p56.length,
    p57: p57.length, terminal180: terminal180.length, p55: p55.length
  }));
}
if (grid.shape !== '32 rows by 8 columns across LP2 pages 49, 50, 51') {
  throw new Error('Unexpected p50 grid shape: ' + grid.shape);
}

// The 2013 Instar operation is offset-zero bytewise XOR, truncated to the
// shorter input. Here the source-shaped candidate operands are both 180 bytes:
// p50's 30x6 interior and the solved p56+p57 GP29 ordinal-byte stream.
const xor180 = inner180.map((byte, i) => byte ^ terminal180[i]);
const xorMod29 = xor180.map((byte) => byte % 29);

// Test the natural 76-byte prefix as a p55 key because original p55 has 76 runes.
// These are bounded consumers, not claims that the source specifies a KDF.
const prefix76 = xor180.slice(0, 76);
const reducedKey = prefix76.map((byte) => byte % 29);
const consumers = [
  {
    name: 'GP29 additive subtraction; key byte reduced modulo 29',
    plaintext: p55.map((c, i) => (c - reducedKey[i] + 29) % 29)
  },
  {
    name: 'GP29 additive addition; key byte reduced modulo 29',
    plaintext: p55.map((c, i) => (c + reducedKey[i]) % 29)
  },
  {
    name: 'raw byte XOR; then reduce result modulo 29',
    plaintext: p55.map((c, i) => (c ^ prefix76[i]) % 29)
  },
  {
    name: 'reduce key modulo 29, XOR; then reduce result modulo 29',
    plaintext: p55.map((c, i) => (c ^ reducedKey[i]) % 29)
  }
].map((item) => ({
  name: item.name,
  plaintext_gp29: gpText(item.plaintext),
  ioc: ioc(item.plaintext)
}));

const printable = xor180.filter((byte) => byte >= 32 && byte <= 126).length;
const result = {
  hypothesis: 'p50 inner180 XOR solved p56+p57 terminal180, then inspect direct output and its first76-byte p55 consumers',
  source_inputs: {
    p50_grid_shape: grid.shape,
    p50_byte_rule: grid.byte_rule,
    p50_inner_cells: inner180.length,
    p56_plaintext_runes: p56.length,
    p57_clear_runes: p57.length,
    terminal_runes: terminal180.length,
    p55_ciphertext_runes: p55.length,
    caveat: 'p50 base60 byte interpretation is conventional but not creator-authenticated; drop-f base59 remains open'
  },
  operation: 'xor180[i] = p50_inner180[i] XOR terminal180_GP_ordinal_index[i], i=0..179',
  xor180: {
    sha256: crypto.createHash('sha256').update(Buffer.from(xor180)).digest('hex'),
    hex: Buffer.from(xor180).toString('hex'),
    printable_ascii_count: printable,
    printable_ascii_fraction: printable / 180,
    shannon_entropy_bits_per_byte: shannonEntropy(xor180),
    ascii_diagnostic: xor180.map((byte) => byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.').join(''),
    modulo29_gp_diagnostic: gpText(xorMod29)
  },
  p55_first76_byte_consumers: consumers
};

console.log(JSON.stringify(result, null, 2));
