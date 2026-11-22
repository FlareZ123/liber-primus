# P15 Fibonacci-prime key × native P50 spiral: bounded ChaCha20 ciphertext/readout decision

**Agent19, 22 November 2026. Classification: source-directed supplementary negative. No recovered unknown LP2 plaintext, authentic key, decoded table, or continuation.**

## Why this finite experiment was run

The original LP2 **p15** numerical square has an exact creator-visible clockwise spiral from its red center 3299. Its 16 values equal the absolute differences between 3301 and primes at the first 16 distinct Fibonacci+1 positions. The authentic physical **p49–51** field is a single 32-row × 8-column rectangle of exactly 256 original byte-valued base60 tokens. Both shapes are authored; applying p15’s outward spiral to the p50 rectangle is a motivated *hypothesis* requiring a rectangular continuation rule.

The existing [source-key unwrapping test](fibonacci-square-grid-unwrapping.md) exhaustively tried 32 256-bit keys derived from the p15 square, four cipher modes and two tabulation variants, all in **printed row-major order**. Its most printable 256-byte result, retrospectively selected, was original p50 under the 32-byte key `SHA256(ordinal-row-major:BE)`, ChaCha20 with an all-zero 16-byte nonce and original stream counter. It gave **135 printable bytes**, versus ~98 under uniform random data, but no text or file signature. This is an exploratory curiosity, not a creator-selected key. The 2021 table transcription’s own note rejects the five-cell repaired variant; this experiment fixes **only canonical original bytes**.

The remaining simplest source-layout question was whether **the p15 spiral selects a p50 table traversal** that the earlier row-major decryption missed. Two precisely fixed, reproducible readings are compared with the unchanged baseline:

1. **Center-out:** begin at physical p50 cell (row15, col3), upper-left of its four central cells by the exact p15 4×4 convention. Step right, down, left, up with lengths 1,1,2,2,… as in p15. The ring must expand beyond p50's narrow 8-column width before reaching distant top and bottom rows. Traverse the implied containing virtual square and **retain only source-in-bounds cells**, yielding all 256 source cells once.
2. **Outer-in:** standard rectangular concentric clockwise spiral, starting at top-left p50 cell (row0, col0), enclosing rings of length 76,68,60,52. This is the already source-used p50 perimeter convention, independent of the p15 central extrapolation.

For each reading, decrypt the **reordered ciphertext** under the *same* frozen key, ChaCha20 and zero nonce. Independently, decrypt original row-major first and reorder the **output** bytes by the same geometry. This isolates two distinct operations: a cipher-stream input order versus a final word/byte reading order. No phase search, alternate key/mode, byte edits, source mixing, or payload-dependent rotation is admitted.

## Original-input output

`SHA256(ordinal-row-major:BE)` 32-byte key in hex:
`bea05cd97632e0e66b417abc254b07d88844355f1ff3ecff4e972d13e4a6acfe`.

Canonical source p50 grid SHA256:
`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

The row-major first 16 decrypted bytes are `833d444a03713cc577ff46223e4c765e`, matching the older program's source-only reference.

| P50 reading | Decrypt **after** input permutation: printable /256 | Max printable run | Max alphabetic run | ASCII-byte count | Reorder **after** row-major decryption: printable /256 | Max printable run | Max alphabetic run |
|---|---:|---:|---:|---:|---:|---:|---:|
| printed row-major | **135** | 9 | 3 | 158 | **135** | 9 | 3 |
| p15-style center-out, upper-left center | **100** | 6 | 4 | 130 | **135** | 8 | 3 |
| p50 ring-style outer-in, upper-left corner | **91** | 4 | 3 | 124 | **135** | 6 | 3 |

No reading produces a coherent English sequence, a long printable run, or a recognizable original source format. Pre-decryption spiral reordering collapses the row-major printability anomaly to ordinary random-like counts. Post-decryption reordering preserves the total number of printable bytes by elementary permutation invariance, while the maximal text/letter runs become shorter.

The key's retrospective selection from a large original catalogue and its failure to produce **more than three consecutive ASCII letters** in any rearranged result mean the 135/256 row-major diagnostic cannot responsibly be used as evidence of an authenticated key. A uniform-random binomial p-value would omit many historical key-candidate and source-table searches.

## Reproducibility and decision

Original-source runnable [Node22 CJS SFT](../sims/lp2_p15_fibkey_chacha20_p50_spiral_original_sft.cjs): imports the existing untouched [p15 Fibonacci derivation](../sims/fibonacci_spiral_key_derivation.cjs) and [p50 canonical table](../resources/liber-primus/lp2-grid-256.json), asserts 256 distinct source cells per traversal, exact key/source digest and first16 decrypted bytes, and asserts all table statistics. A source-shaped positive encrypts and exactly recovers a 256-byte ASCII message using the same genuine key and nonce. The numerical results were **independently recomputed** using Python3 with `cryptography`'s ChaCha20 primitive and source-pinned GP data, including byte-perfect first16 and every score above. The committed Node SFT passed V8 syntax compilation and is awaiting a complete Node runtime execution on a checked-out repo.

**Decision:** Retire the specific missing-spiral-readout rescue of the earlier p15→p50 ChaCha20 candidate. The successful output stays **opaque**. This says nothing about other source-selected architectures, alternate first-party key material, historical onion archives, or the genuine LP2 unknown-page cipher. Do not add arbitrary rotations, page-specific packet surgery, or byte-substitution stages solely to rescue the selected printable-byte excess. The cost-effective next step still requires a creator-authenticated consumer or new original source bytes.
