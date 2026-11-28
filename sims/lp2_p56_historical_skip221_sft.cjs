'use strict';
const assert = require('node:assert/strict');

const RUNES = new Set([...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᛡᛠᚣ']);

// Historical Uncovering-Cicada formatting, preserved in the 2018 snapshot.
// Keep punctuation/newlines because "Skip index 221" is a raw formatted index.
const historical = `ᚫᛄ-ᛟᛋᚱ.ᛗᚣᛚᚩᚻ-ᚩᚫ-ᚳᚦᚷᚹ-ᚹᛚᚫ.ᛉ/
ᚩᚪᛈ-ᛗᛞᛞᚢᚷᚹ-ᛚ-ᛞᚾᚣᛄ-ᚳᚠᛡ-ᚫᛏ/
ᛈᛇᚪᚦ-ᚳᚫ./
&
36367763ab73783c7af284446c/
59466b4cd653239a311cb7116/
d4618dee09a8425893dc7500b/
464fdaf1672d7bef5e891c6e227/
4568926a49fb4f45132c2a8b4/
&
ᚳᛞ-ᚠᚾ-ᛡᛖ-ᚠᚾᚳᛝ-ᚱᚠ-ᚫᛁᚱᛞᛖ-ᛋᚣᛄᛠᚢ/
ᛝᚹ-ᛉᚩ-ᛗᛠᚹᚠ-ᚱᚷᛡ-ᛝᚱᛒ-ᚫᚾᚢᛋ./`;

const rawF = [];
for (let i = 0; i < historical.length; i++) {
  if (historical[i] === 'ᚠ') rawF.push(i);
}
assert.deepEqual(rawF, [47, 209, 215, 221, 245]);

const mapping = rawF.map((rawIndex) => ({
  rawIndex,
  runeOffset: [...historical.slice(0, rawIndex)].filter((ch) => RUNES.has(ch)).length,
}));
assert.deepEqual(mapping, [
  { rawIndex: 47, runeOffset: 35 },
  { rawIndex: 209, runeOffset: 47 },
  { rawIndex: 215, runeOffset: 51 },
  { rawIndex: 221, runeOffset: 56 },
  { rawIndex: 245, runeOffset: 74 },
]);

const skip = mapping.find((entry) => entry.rawIndex === 221);
assert.deepEqual(skip, { rawIndex: 221, runeOffset: 56 });

console.log(JSON.stringify({
  historicalPrintedFMapping: mapping,
  documentedSkipRawIndex: 221,
  selectedRuneOffset: skip.runeOffset,
  decision: '"Skip index 221" is exactly the known authentic hold at p56 rune offset 56; it is a coordinate for the selected branch, not a source-side derivation of that branch.',
}, null, 2));
