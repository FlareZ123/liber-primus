# Original LP2 numeric table: truncated xorshift32 hidden-state inversion

**Result:** Zero generator states recovered from the authentic 256-byte original numeric table, across 2,859,936 exhaustive xorshift32 native-byte specifications. A separate arbitrary affine LCG32 low-byte test also has zero matches. These are specific finite weak-generator exclusions; no original LP2 plaintext, key, cipher, or continuation recovered. Agent 24, 11 November 2026.

## Independent starting evidence and potential solve path

The LP2 table on original pp49–51 presents 32 rows by 8 columns, each entry encoding an 8-bit byte in printed base-60 notation. An author might generate 256 table bytes from consecutive observations of a small 32-bit pseudorandom generator, then use the recovered or extended generator to derive a running manuscript key. This would turn the original printed bytes into an independently reproducible cipher state without guessing an English key. The source itself gives no historical instruction to use xorshift32.

The [source reproduction](../sims/grid_truncated_xorshift32_sft.cpp) pins the original row-major table's 256 exact bytes. Their SHA-256 is **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**, matching the original printed-grid resource.

Twelve source-visible table readings are frozen: row-major, alternating-row snake, full-column-major, alternating-column snake, original-image-page-local columns, image-page-local column snake, and the reverse of each. The physical table has ten, thirteen, then nine rows on its three original pages. These are interpretations of printed coordinates rather than optimizations fitted to ciphertext.

## Complete exact hidden-state recovery

For every table reading, allow **either** three-step xorshift32 direction (left/right/left or right/left/right), with every triple of shifts a,b,c independently ranging **1 through 31** and all four eight-bit output lanes (bits 0–7, 8–15, 16–23, 24–31). Use an arbitrary unknown 32-bit initial state. Since the generator is linear over GF(2), the code constructs exact binary equations for each of the first six 8-bit outputs, solves the unknown seed by GF(2) Gaussian elimination and checks every remaining output against the complete source. If six bytes do not determine all state bits, the code extends the equation system to all 256 bytes. This permits arbitrary starting state, so the offset at which observations begin is immaterial within these generator families.

**Original outcome:** 2 × 31³ × 12 × 4 = **2,859,936** combinations tested; **0/2,859,936** recover a state reproducing all original bytes.

**Positive state recovery:** A genuinely planted stream under xorshift32(13,17,5), left/right/left direction, byte lane 16 and unknown to the solver seed **0x3301** recovers that exact seed and predicts **256/256** planted bytes. The observed null therefore does not result from a broken seed inversion.

**Distinct low-byte LCG32 test:** The low eight bits of any affine 32-bit generator satisfy an exact affine recurrence modulo256, regardless of hidden upper bits. For every one of twelve source readings, test all 256 possible low-byte multipliers; the first two observed bytes fix the additive increment, and all subsequent bytes must match. The original has **0/3,072** exact matches. A planted affine 256-byte output sequence with multiplier73 and increment41 passes the same detector.

## Decision and limits

These results exclude only **consecutive native-byte outputs** from the full three-shift xorshift32 family and the **low-byte projection** of an arbitrary 32-bit affine LCG under the tested original grid traversals. Higher-byte LCG outputs with carry, skipped generator steps, byte scramblers, bit-misaligned projections, PCG, Mersenne Twister, stream ciphers and arbitrary encrypted binary payloads are outside the finite claim. A larger generator catalog would need an independently visible clue before consuming research resources.

This was a source-first attempt to obtain original key material. Since no compatible generator state exists in this family, there is no source-recovered key to apply to the unsolved runes.

## Reproduce

Compile [sims/grid_truncated_xorshift32_sft.cpp](../sims/grid_truncated_xorshift32_sft.cpp) as C++17 and execute. The zero-dependency single-file program includes the pinned original table values, both planted positive controls and the complete finite search. Local g++ -O3 execution output:

    CONTROL pass: planted xorshift32(13,17,5), lane2, seed 0x3301, 256/256 recovered.
    source triple tests=2859936, complete 256-byte matches=0
    CONTROL pass: planted affine low8 LCG a=73 b=41, 256/256 recovered.
    source LCG-low8 tests=3072, exact matches=0
    SOURCE NEGATIVE in exact declared family; no original plaintext or key.
