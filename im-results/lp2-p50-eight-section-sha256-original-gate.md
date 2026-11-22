# Eight original section SHA-256 digest hypothesis for the p50 32×8 table

**Evidence class: source-shaped, exactly executed negative. Agent11, 22 November 2026.** No unknown GP29 plaintext, source-authored key, decoder or destination was found. This is a narrow check on the byte semantics of the printed table and the eight authentic ciphertext sections, not a claim about a generic cryptographic design.

## Hypothesis and source selector

The original LP2 transcription has **eight nonempty $-separated encrypted sections**, containing respectively **729, 1,145, 1,738, 1,894, 1,021, 1,433, 1,680 and 3,316 runes**, totaling 12,956. Original physical p49–51 print exactly **32 rows × 8 columns** of two-character table values that decode under the already documented base60 interpretation to **256 bytes**. A fixed column is therefore exactly 32 bytes, the native SHA-256 digest width. The section count and column count provide an independent, visually inspectable match for the proposed one-digest-per-section checksum.

The direct operational prediction is strong: at least one unchanged hash from an original section must match one entire original 32-byte column, with all 32 byte positions aligned, before inferring that the table stores section checksums. An eight-section fixed column-to-section map would require eight matches. The rival is ordinary random-looking bytes, an unknown-plaintext digest, an unrelated encrypted binary object, or another source-selected encoding.

## Frozen source-native experiment

Use exactly `resources/lp2-transcription.txt` for original rune and delimiter input and `resources/liber-primus/lp2-grid-256.json` for original printed table tokens. Canonical original GP ordering and transliterations come from `resources/liber-primus/lp2-corpus.json`.

For each of the eight sections, apply SHA-256 without salt, iteration or secret key to five source representations:

1. the contiguous original UTF-8 Unicode rune glyphs;
2. one byte per canonical GP29 rune index;
3. the source GP29 uppercase Roman transliteration;
4. original printed words and punctuation after physical page/line metadata removal;
5. the literal source section string in its preserved transcription whitespace.

Compare every digest to each full table block in both direct geometries: each of the eight 32-byte printed vertical columns and each of the eight adjacent 32-byte row-major slices. There are exactly **8 sections × 5 representations × 2 geometries × 8 blocks = 640** literal 32-byte equality decisions. Blocks are used as printed, with no rotations, secret offsets, auxiliary password, arithmetic adjustments or data-dependent choices. A separate SHA-256 of `abc` and known synthetic full-digest equality are positive implementation controls.

The committed Windows Node22 [single-file source test](../sims/lp2_p50_eight_sha256_section_digest_sft.cjs) reads project files without mutating them. Its source SHA-256 is `5e0003aa7f7dde3b238d17c5f964790dbf6bf9db5edacc4a5ec0bad81c6f4bce`, and the parsed grid JSON SHA-256 is `2a77dc623df45ddd126d10d2fffbafead4efd161d2acc07644809deac00a2089`; the grid's 256 recorded byte values are independently checked against all original base60 character pairs.

## Original output and decision

[Windows Node22 PASS, run44999526536](https://github.com/FlareZ123/liber-primus/actions/runs/44999526536): all 640 exact comparisons were **negative**. The closest compared digest agreed with a printed column in just **2 of 32** byte positions, and no candidate approached an intact checksum. Positive implementation checks passed. A later no-op reporting correction allows even a real prospective match to appear as evidence rather than fail an assertion; it does not modify any tested hash, source representation or table block.

**Decision:** The literal p50 eight-column SHA-256 checksums of the eight *ciphertext* sections, in these five natural section serializations, have no original-input support. Retire this direct route. These failures say nothing about SHA-256 applied to **unknown decrypted text**, a separately authored salt, a different 32-byte algorithm, or the possibility that the 256 bytes comprise an encrypted object. Testing such alternatives requires an original source clue fixing the new input or opcode; guessing them from this negative alone would not advance decryption.

The table and eight-section correspondence remains a source observation with no authenticated plaintext or secret.
