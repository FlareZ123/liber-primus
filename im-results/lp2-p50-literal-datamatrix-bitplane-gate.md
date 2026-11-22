# Original p49–51 256-cell bitmap as an ECC200 Data Matrix

**Decision, 22 November 2026:** The 32×8 256-cell numerical carrier on LP2 physical p49–p51 **does not contain a literal bitplane Data Matrix ECC200 finder** under either printed base60 or source-studied base59-without-f reading, the native 8×32 rectangular geometry, or three natural folds to 16×16. This is a **finite source-typed negative**, with no new ciphertext decryption, keys, or plaintext.

## Why this operation is historically plausible and bounded

The source visibly prints **32 rows of eight two-character numerical cells** across three consecutive physical pages, with original row counts 10+13+9. Interpreting the codes as bytes produces a 256-cell array. A rotated **8×32** rectangle and a folded **16×16** square are both standard ECC200 Data Matrix symbol sizes. A puzzle player can recognize such a barcode because ECC200's marker is structurally specified: one solid dark L edge and alternating edges on the other sides. The marker is an unusually strong exact source-driven test. Requiring an *exact border* removes any need for image recognizer confidence thresholds, arbitrary cipher passwords, or encoded-content guesses.

The two numeric readings use an unchanged original 32×8 token table in `resources/liber-primus/base60-grid.json`: base60 alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`, and the already studied base59 alternative deleting `f`. The table's derived bytes are explicitly distinguished from the source's printed glyphs. The test examines each of eight **literal byte bitplanes** without synthesizing any new bit combinations. The three square folds are adjacent 8-cell row pairing, adjacent 32-cell column pairing, and side-by-side first/last 16 rows. Each arrangement is tested through its eight rotations/reflections and black/white polarity, exactly **1,024 bounded variants** across both byte interpretations.

Source: ECC200 finder scheme in ISO/IEC 16022 and the GS1 DataMatrix technical overview; practical source dimensional cue: the 32×8 printed LP2 table itself. Reproducible single-file program: [`sims/lp2_p50_literal_bitplane_datamatrix_source_sft.cjs`](../sims/lp2_p50_literal_bitplane_datamatrix_source_sft.cjs).

## Measured original-source results

| Original numeric reading | Geometry and candidate count | Maximum correct exact border cells | Exact source finder matches |
| --- | --- | --- | --- |
| base60 | 8×32 rectangular, 128 | 48 / 76 | **0** |
| base60 | 16×16, three fixed folds, 384 | 39 / 60 | **0** |
| base59 without `f` | 8×32 rectangular, 128 | 48 / 76 | **0** |
| base59 without `f` | 16×16, three fixed folds, 384 | 39 / 60 | **0** |

A successful ECC200 finder must match **every** fixed border cell. Both synthetic source-native planted positives were found perfectly: a 32×8 code embedding the 8×32 symbol's required border yields 76/76, and a folded 16×16 embed yields 60/60, while retaining the same 256-cell size. Original cells fail well before considering Reed–Solomon or decoding payload words.

**Reproduction:** [GitHub Actions Windows/Node.js 22 run 45003724224](https://github.com/FlareZ123/liber-primus/actions/runs/45003724224) passed with the full 1,024-candidate result, two authentic base readings, planted positives and exact recognition assertions.

## What this changes

A literal bitmap readout was a discriminable original-source alternative to more exhausted hypothesis classes such as p50 AES-key material, raw RSA modulus, OpenPGP packet, RC4 state or hash schedule. The exact ECC200 finder is absent in the natural original-carrier bitplane forms. Do not commission follow-on arbitrary offsets, bit-linear combinations, guessed masks, or all-case reserializations simply to force a barcode. The conclusion is confined to literal ECC200 bitplanes, their two stated token readings, and the three specified square folds. It does not exclude arbitrary image steganography, other barcodes, or a cipher key hidden by a clue-selected different representation.

**Evidence class:** original-source bounded negative with two positive planted controls. **Recovered unknown LP2 plaintext:** none.
