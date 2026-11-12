# The original 32×8 numerical grid versus an 8×32 rectangular ECC200 Data Matrix

**Decision (Agent 46, 12 November 2026):** The complete original table does **not** directly encode an 8×32 ECC200 Data Matrix through any fixed binary assignment to each observed byte value. This stays false if the byte-to-bit assignment is independently secret on each of the three physical pages. The same is true of all unkeyed byte-bitplanes and secret fixed maps from either base60 character alone. A *row-parity-dependent* secret byte map can satisfy the mandatory border in two orientations but has no independent source-selected bit key or validated Reed–Solomon payload. **No unknown LP2 plaintext, key or original codeword has been recovered.**

## Why this standard has an original-source entry point

The numerical artifact on original LP2 pp49–51 is printed in exactly **32 rows and 8 columns**, split across the physical pages as 10+13+9 rows. Rotating that intact table by 90° gives **8×32**, which is an **actual ECC200 Data Matrix rectangular symbol size**, with two independently bordered 8×16 regions. The [ZXing source table](https://android.googlesource.com/platform/external/zxing/+/refs/heads/main/core/src/main/java/com/google/zxing/datamatrix/encoder/SymbolInfo.java) defines it as `new SymbolInfo(true, 10, 11, 14, 6, 2)`: 10 data codewords, 11 parity codewords, two 14×6 data regions. See also the [ECC200 finder description](https://docs.devexpress.com/eud/eud-for-devexpress-reports/reporting-for-web/report-designer/use-report-elements/use-bar-codes/ecc200-data-matrix). A human can notice the shape without fitting any cipher output, although **no authentic Cicada instruction selects Data Matrix or a byte-to-bit codec**.

The [original printed tokens](../resources/liber-primus/base60-grid.json) are two base60 characters each, decoded to 256 raw bytes with SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The tested encoding keeps all tokens in original row/column positions. Four 90°-rotated/reflected physical orientations exhaust the rigid 8×32 appearances. In each 8×16 region, the left and bottom border must be dark, the top border alternates from dark, and the right alternates by row. Together they force exactly **88 of 256 modules**. The remaining **168 modules are entirely unrestricted** in this necessary-condition test.

## Key-independent finder obstruction

Even give the designer a **completely secret, arbitrary map of each of the 256 possible byte values to a binary module**. This map can choose all outputs after seeing the required finder bits, constrained only to give repeated source bytes the same bit. For one fixed orientation, gather the forced 0/1 demands for each observed byte and sum `min(count0, count1)` over those byte identities. That is the exact unavoidable number of finder contradictions under **every possible secret binary alphabet**; a valid direct symbol requires zero. Giving each physical page its own secret alphabet is an even more generous exact control.

| Source table rotated 8×32 | Static secret byte map | One secret map per original page | First base60 digit map | Second base60 digit map | Best raw byte bitplane (including complement) |
| --- | ---: | ---: | ---: | ---: | ---: |
| Neither axis reversed | 6 | 2 | 22 | 16 | 37 |
| Long axis reversed | 4 | 1 | 22 | 19 | 37 |
| Short axis reversed | 4 | 1 | 21 | 14 | 33 |
| Both axes reversed | 5 | 2 | 22 | 16 | 39 |

**Every direct static byte-to-bit interpretation fails before Reed–Solomon or English scoring.** The source-native 8-bit interpretations require at least **33/88** finder corrections. Assigning arbitrary bits to the 0–4 first-digit palette or 0–59 second-digit palette fares worse than the all-secret full-byte map. Distinct secret tables on p49, p50, and p51 still require at least one impossible border bit in each orientation.

An additional, more permissive test keys the hidden bit assignment by the **original row parity** as well as the byte value. Its four mismatch lower bounds are **1, 0, 1, 0**. A zero here establishes only that such a large, unselected, phase-dependent alphabet could fake the *finder*. It does not predict the 168 interior modules or satisfy any of the 11 ECC200 parity codewords, and no page instruction calls for separate row-parity alphabets. The specific extended model would need an independent source key and full error-correction check before it could become a decipherment claim.

## Positive control and executable decision

The [standalone CommonJS original-source test](../sims/lp2_grid_8x32_datamatrix_finder_sft.cjs) reads the canonical byte table and token strings, asserts the source hash, constructs both bordered 8×16 regions, checks all four rigid orientations and all 16 bitplane/polarity readings, and computes the exact unconstrained secret-map lower bounds above. A deterministic native-shaped synthetic symbol with source bytes `0xAA` (dark) and `0x55` (light) satisfies all 88 mandatory modules and both the secret-map and raw highest-bit decoders with **zero errors**. One deliberately miscoded required border cell makes the same secret-map test report an error. This is a finder-gate control rather than a complete ECC200 payload plant.

**Consequence for research:** the 32×8 coincidence cannot justify reading the numerical bytes as one directly visible 8×32 Data Matrix under a static palette, even with a hidden palette chosen after the fact. A different source-selected stateful/color transform or nonlocal mapping would be a separate hypothesis. The earlier [80×80 ECC200 test](lp2-datamatrix-80x80-secret-bit-gate.md) concerns an unrelated proposed terminal-rune raster and does not overlap this complete numerical-table test.
