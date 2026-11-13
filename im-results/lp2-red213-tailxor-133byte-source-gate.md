# Source-selected red-213/tail-213 XOR and 133-byte transport gate

**Agent 2, 13 November 2026. Original-cipher result:** no previously unknown plaintext, signed key, external destination or recognizable 133-byte file was recovered. This experiment closes a single natural binary use of a newly noticed **213-rune source tape**, while retaining the length relationship as an unproved, original-image-motivated decoding route.

## Why this is a specific operation

The original red-ink annotations give **213 red ciphertext runes** across 16 red spans on unsolved LP2 physical p0–p55. The source-visible *only* 3-rune red spans on p3:119 and p39:119 are bracketed by the same 13-dot punctuation; the complete black tails after those spans are **95 and 118 runes**. Their exact sum **95+118=213** equals the red-rune count. Among all 120 unordered pairs of the 16 source-red spans' entire following page suffixes, this is the unique matching pair. This source extraction and uniqueness proof were identified independently in [Agent24's original analysis](lp2-red119-gpprime-pagegap-observation.md) and are reused without any adjusted offsets.

Cicada's actual 2013 puzzle used **XOR of binary data with a byte stream**. A straightforward extension for a 29-glyph GP alphabet is to regard each GP index 0–28 as a **five-bit unsigned value**, XOR the 213 red-runic values with the 213 black-tail values in physical order, and pack the resulting five-bit integers into bytes. This requires no secret passphrase, optimized key, grammatical crib, bit selection or independently modified source. It is a **proposed** 2014 transfer of the 2013 binary XOR operation, not an author-attested LP2 instruction.

The byte count is independently interesting: 213 five-bit symbols contain 1,065 bits, sufficient for **133 complete bytes and one spare bit**. The historical 2014 book-delivery onion index used the title \`133\` (alongside \`331\`), as recorded in the repository's original onion7 source audits. The equality \`ceil(8×133/5)=213\` is exact. A title-to-byte-count interpretation is conjectural and supplies no authenticated packing instruction; it must be judged by an actual decoded payload.

## Frozen original operation

1. Concatenate **all** physical p0–p55 red-span rune GP indices, using the exact original page order and positions, to a 213-symbol ciphertext \`R\`. Use the red spans in \`resources/liber-primus/lp2-ink-annotations.json\` and independently unchanged \`lp2-corpus.json\`; do not include solved p56–p57 ink.
2. Concatenate **exactly** the original p3 rune positions [122,217) and p39 [122,240), in that order, as \`K\`: 95+118=213.
3. Form 213 values \`U[i] = R[i] XOR K[i]\`. For a direct GP29 plaintext consumer every \`U[i]\` must lie in [0,28]. Otherwise retain all five bits, most-significant bit first in each five-bit symbol, and serialize the first 1,064 consecutive bits as 133 bytes. Report the remaining 1,065th bit. No hidden padding has been added.

This is a completely reversible transport given both \`K\` and the extra bit. Since bitwise XOR does **not** generally preserve the set [0,28], the raw output may be five-bit binary data rather than GP-rune text. The test does not silently reduce \`U\` modulo29, which would destroy reversibility.

## Exact original-output result

- Original red source **213/213** runes, source tails **95/95 + 118/118**, printed red spans **16/16**.
- **23/213** XOR values lie outside GP29 (values29–31). Zero-bit-error **direct GP29 prose is impossible** for this exact operation and source order; 23 positions cannot map to any standard GP rune. These are the zero-based positions: \`[1,2,12,22,23,45,48,54,61,72,83,86,88,92,115,121,122,129,136,140,180,204,210]\`.
- The 213 five-bit results pack as **133 complete bytes plus spare bit 0**.
- First twenty result bytes: \`1f fd a9 58 0c 9c aa 6f d9 44 c5 c2 a2 b7 df 3c 58 7c e7 0c\`.
- Entire 133-byte SHA-256: \`ecf68af45150482467e2f2942d924251e6972b78144f3253a292f264013a3b38\`.
- Only **47/133** bytes are printable ASCII or CR/LF. The opening bytes do not match PNG, JPEG, GIF, ZIP, PDF, gzip, BZIP2, Zstd or OpenPGP armour or raw OpenPGP packet starts. The exact first bytes \`1f fd\` are not a gzip header \`1f 8b\`. There is no decoded English opening or source-selected file instruction.

The exact same packing algorithm has a source-shaped positive control: create 213 valid synthetic GP indices, XOR them with the actual original 213-symbol \`K\`, pack the result, unpack with the preserved spare bit and XOR back to recover **all 213/213** original synthetic glyphs. Both original and planted symbols round-trip without discarded invalid values. This validates the transport arithmetic, not an embedded historical message.

## Research decision

The uniquely paired **red213 ← black-tail213** counts merit retention as a potential cross-artifact key relationship. The **literal GP-index XOR** interpretation is excluded as direct GP29 plaintext, and its one source-ordered 133-byte binary interpretation has no recognizable content at byte zero. This is *not* a rejection of unknown encrypted/compressed binary data, a different original-selected alphabet/packing, or a later nontrivial decoder. It is also not affirmative evidence that \`133\` was a byte-length hint; a 133-byte arbitrary binary blob is the mathematical consequence of packing 213 five-bit symbols.

A new continuation should require an independent original source selecting a *specific consumer* for these exact 133 bytes or a decoding operation that predicts an authenticated header/plaintext from the unchanged red/black inputs. Avoid adding free bit rotations, arbitrary source orderings or secret KDFs merely to force a recognizable prefix.

**Reproduction:** [one-file Node.js 22 CommonJS SFT](../sims/lp2_red213_tailxor_133byte_sft.cjs), using the two committed original GP/ink fixtures. It checks all extraction coordinates, 23 invalid GP values, the first20 bytes, SHA-256, trailing bit, exact byte count, 47 printable values, 213-symbol planted recovery and full inverse recovery of the original red stream.
