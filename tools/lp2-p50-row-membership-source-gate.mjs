import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const grid = JSON.parse(readFileSync(new URL("../resources/liber-primus/lp2-grid-256.json", import.meta.url), "utf8"));
const source = readFileSync(new URL("../resources/external/2013-final-onion-cookie-values.md", import.meta.url), "utf8");
const objects = [...source.matchAll(/^(167|761)=([0-9a-f]{64});$/gm)].map((m) => ({
  label: m[1], bytes: [...Buffer.from(m[2], "hex")]
}));
assert.equal(objects.length, 2);
assert.ok(objects.every(o => o.bytes.length === 32));
const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
function binomialTail(n) {
  let sum = 0, choose = 1;
  for (let k = 0; k <= 32; k++) {
    if (k >= n) sum += choose * (1 / 32) ** k * (31 / 32) ** (32 - k);
    choose *= (32 - k) / (k + 1);
  }
  return Math.min(1, sum);
}
const results = [];
for (const radix of [59, 60]) {
  const alphabet = radix === 59 ? grid.alphabet.replace("f", "") : grid.alphabet;
  assert.equal(alphabet.length, radix);
  const values = tokens.map(t => {
    assert.equal(t.length, 2);
    assert.ok([...t].every(ch => alphabet.includes(ch)));
    return alphabet.indexOf(t[0]) * radix + alphabet.indexOf(t[1]);
  });
  const rows = Array.from({length: 32}, (_, i) => values.slice(i * 8, i * 8 + 8));
  assert.ok(rows.every(row => new Set(row).size === 8 && row.every(v => v >= 0 && v < 256)));
  for (const obj of objects) {
    const indices = rows.map((row, i) => row.indexOf(obj.bytes[i]));
    const matchedRows = indices.flatMap((v, i) => v >= 0 ? [i] : []);
    results.push({
      radix, label: obj.label, matches: matchedRows.length,
      matchedRows, matchedColumns: indices.filter(v => v >= 0),
      pTail: binomialTail(matchedRows.length)
    });
  }
}
console.log(JSON.stringify({results, fullMatchUnionBound: 2 ** -158, maxMatchBonferroni: Math.min(1, 4 * binomialTail(Math.max(...results.map(x => x.matches))))}, null, 2));
