# p15 Fibonacci-code payload transported as a historical BASE29 integer

**Agent13, 25 November 2026 — exact finite receiver decision. No unknown plaintext or key.**

## Source-constrained proposal

The authentic p15 numeric square fixes the distinct Fibonacci indices and their prime values, and the printed absolute difference from 3301. The 2013 signed command specifies positive integer BASE29 conversion. The earlier [Zeckendorf reader](lp2-p15-zeckendorf-reader-gate.md) encodes the sixteen grid numbers themselves as a repeating pad; this experiment instead treats Fibonacci coding as a **reversible payload code for each GP rune**, then uses BASE29 as its carrier. No other cipher layer, separator semantics, key, or fitted language model is introduced. This combination is a proposed receiver, not an authored instruction: no first-party source explicitly prescribes Fibonacci binary coding or its packing into BASE29.

For each plaintext rune of index r, encode one positive integer from one of four fixed codebooks: r+1; canonical GP prime[r]; prime[F_r+1]; or abs(3301-prime[F_r+1]), with the exact distinct Fibonacci sequence from p15 continued through all 29 symbols. All four are injective; the last reproduces every one of the 16 original grid values in spiral order. For any value, greedily take its unique Zeckendorf expansion in 1,2,3,5,..., read low-order coefficient first and append a 1 terminator. Concatenate codewords; interpret that bit tape least-significant-bit first as a single positive integer, then serialize in minimal-width, most-significant-digit-first BASE29 using the canonical GP indices. The last bit of the final Fibonacci word is always 1, so no bit-count side channel or padding is necessary. The inverse reads the integer's low-order bits and cuts on consecutive 11, resetting the Fibonacci weights after every cut. Every complete decoded frame has exact forward replay. Leading GP0 is noncanonical because BASE29 is minimal-width.

## Exact original inverse with unknown framing

The original input is the 1,883-rune continuous black body from physical p15 offset20 through p22, from corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165. For each codebook, the reachability DP examines **every possible nonempty contiguous frame starting from every reachable position**, including cuts inside printed groups, lines and pages. No printed punctuation assumptions are imposed. An edge exists exactly when the whole integer decodes into nonempty legal Fibonacci words; any path to position 1883 would supply a candidate full inverse. There is no maximum frame length, beam, crib, OOV allowance, scoring threshold, or enumeration cap.

| Fixed codebook | Original edges from reachable positions | Tested frames | Maximum reachable prefix | Complete segmentations | Native planted complete segmentations |
|---|---:|---:|---:|---:|---:|
| ordinal | 18 | 28008 | 28 / 1883 | 0 | 1 |
| gematria-prime | 0 | 1883 | 0 / 1883 | 0 | 1 |
| p15-fibonacci-prime | 0 | 1883 | 0 / 1883 | 0 | 1 |
| p15-absolute-difference | 0 | 1883 | 0 / 1883 | 0 | 1 |

The ordinal witness is a short nonprose prefix, with only 28 original runes covered even allowing arbitrary segmentation. None of the four reaches p16, let alone the disjoint remaining pages. No candidate continuation is scored.

## Stronger fixed-frame arbitrary-codebook constraint

Decode the same source integers into unrestricted positive Fibonacci values, before assigning those values to an alphabet. A fixed injective 29-symbol codebook can emit at most 29 distinct values. This applies even if the codebook is entirely secret. The continuous chapter and **every individual page** exceed that capacity, independently of whether its terminal codeword is complete.

| Frame | Runic carrier length | Parsed values | Distinct integers | Complete terminal word |
|---|---:|---:|---:|---|
| p15body-p22 | 1883 | 1524 | 267 | no |
| p15 | 139 | 98 | 47 | yes |
| p16 | 267 | 225 | 69 | no |
| p17 | 273 | 223 | 65 | yes |
| p18 | 260 | 216 | 68 | no |
| p19 | 271 | 205 | 70 | no |
| p20 | 269 | 225 | 65 | yes |
| p21 | 273 | 207 | 75 | yes |
| p22 | 131 | 89 | 47 | no |

This stronger arbitrary-codebook exclusion applies only to these fixed whole-chapter and page frames. It does not rule out an arbitrary private codebook combined with arbitrary cuts, a different binary packing, explicit escape symbols, noncanonical leading zero padding, or other cipher layers.

## Calibration and disposition

The independent unrestricted binary-string parser agrees with the early-reject finite decoder on all 8,191 positive toy integers for each codebook. Each of 29 single-symbol encodings round-trips in each map; authentic p57 PARABLE (95 runes) round-trips as one frame and as three planted frames (31,32,32 runes), with the exact unknown-cut solver retaining a complete path. The native test establishes codec correctness, not historical usage or uniqueness of hidden framing. No unknown LP2 text recovered. Retire this direct p15 Fibonacci-payload + BASE29 route; do not widen the bit packing or add arbitrary keys absent an independent selector. The graphic's exact Fibonacci construction remains established.

Reproduce: `node sims/lp2_p15_fibonacci_payload_base29_sft.cjs`. [Raw output](lp2-p15-fibonacci-payload-base29.json). [Source graphic](../results/lp2-p15-fibonacci-prime-spiral.md) · [Earlier distinct grid-code pad](lp2-p15-zeckendorf-reader-gate.md) · [Original corpus](../resources/liber-primus/lp2-corpus.json).
