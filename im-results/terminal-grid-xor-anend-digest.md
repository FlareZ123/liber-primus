# Terminal grid/rune 256-byte digest gate

**Status, 11 November 2026:** a source-motivated bytewise composition of the original 32×8 table and the terminal 256 published LP2 runes does **not** reproduce the literal AN END digest under the frozen encodings, operations, and 64-byte digest families below. This is a bounded negative, not a decryption or a proof that the table/rune correspondence is unintended.

## Human-solve-path hypothesis

The solved *PARABLE* text says to “shed our own circumferences” and “find the divinity within.” The original 32×8 table has a 76-cell outer perimeter and a 30×6 interior of 180 cells. Independently, the final three rune-bearing LP2 pages have lengths:

- p55: **76** runes (unsolved)
- p56: **85** runes (AN END; solved)
- p57: **95** runes (PARABLE; solved)

Thus p55 + p56 + p57 contains **256** published runes, and the final two pages contain **180**. A plausible human experiment is to pair the 76-cell table perimeter with p55 and the 180-cell interior with p56+p57, then test whether the 256-byte result is the object committed to by the p56 digest.

The correspondence is an exact count match, not evidence by itself that these cells and pages are meant to be combined.

## Frozen source extraction

Inputs are the canonical resources/liber-primus/lp2-grid-256.json, resources/liber-primus/lp2-corpus.json, and resources/cicada2014-anend-binary-witness.json.

1. Interpret the printed 32×8 table in its canonical base60-derived byte representation.
2. Extract the **76-cell perimeter clockwise**: top row left-to-right, right edge downward, bottom row right-to-left, left edge upward.
3. Extract the remaining **30×6 = 180 interior cells** in row-major order.
4. Concatenate perimeter then interior. This aligns the first 76 table bytes with p55 and the remaining 180 with p56+p57.
5. Preserve the original published rune order for p55, p56, p57. Test three natural byte encodings of each rune: its GP index, its GP prime weight, and φ(GP prime) = prime−1.
6. Combine the table byte and rune byte positionwise by XOR, addition modulo 256, or subtraction modulo 256.
7. Hash each resulting 256-byte object with SHA-512, SHA3-512, BLAKE2b-512, and SHAKE256 with a 64-byte output. Compare the complete digest against the 128-hex-character value printed on p56:

    36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4

## Result

<badge color="warning">Bounded negative</badge>

- The perimeter and interior contain exactly **76 + 180 = 256** distinct table cells.
- The terminal pages contain exactly **76 + 85 + 95 = 256** published runes.
- All **36** frozen combinations (3 rune encodings × 3 byte operations × 4 digest families) were evaluated.
- **0/36** candidate digests match the printed AN END target.

The deterministic reproducer is sims/terminal_grid_xor_anend_digest_sft.cjs. Run from the repository root with Node.js 22:

~~~sh
node sims/terminal_grid_xor_anend_digest_sft.cjs
~~~

It reconstructs the partition from the source JSON files, asserts the 76/180 and 256/256 dimensions, prints every candidate digest, and asserts that no candidate equals the target.

## Decision and scope

Retire this **direct source-aligned bytewise composition** as an AN END preimage candidate. In particular, the exact 76/180 geometry does not, by itself, turn GP indices, GP primes, or prime totients into a byte codec for the table.

This test is distinct from the earlier four-aligned-64-byte-share XOR test of the table alone: it combines the entire terminal 256-rune stream with the table using the source-derived perimeter/interior alignment. It also differs from the raw-grid serialization comparisons in the AN END hash audit.

The result does **not** exclude:
- a different, independently specified traversal or alignment;
- a different byte encoding, stateful transform, or additional source-forced layer;
- a digest algorithm outside the four tested 64-byte families;
- another role for the 76/180 correspondence that does not produce the AN END preimage.

The grid resource retains a radix-59/base60 transcription caveat and is not a full independent adjudication of every printed cell. The AN END digest algorithm and canonical target bytes remain unknown. No LP2 plaintext, key, destination, or target-page content was recovered.

**Repository placement:** intermediate source-gated evidence only; not promoted to results/README.md because this finite negative does not change the overall established solution status.
