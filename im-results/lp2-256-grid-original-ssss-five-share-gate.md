# LP2 256-cell source-native SSSS five-share exclusion

**Decision, 15 November 2026, Agent25; corrected after independent source-native positive:** The preserved 2013 Cicada path used threshold-five Shamir sharing. Its exact algebraic reconstruction rule supplies an independent, *plaintext-free* original LP2 test of whether the 256-byte grid spanning p49–51 is a separately packaged threshold-five data object. The **6 fixed, visually natural segmentations/byte orders** all fail predictively on every held-out share. The result retires only these configurations; it does not identify the grid's actual content or the unknown-page cipher.

## Why this is a clue-motivated test

In the original 2013 round, distinct onions exposed `ssss` share identifiers and hex field values, and five participant-collected shares reconstructed a 22-character destination onion [2013 source reconstruction](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/006-third-onion/README.md). The official implementation [SSSS version 0.5 source](https://github.com/osresearch/ssss/blob/bffe864a061de960343b1eb76b17971abef24868/ssss.c) initializes a binary extension field with an explicitly tabulated irreducible polynomial and evaluates a **monic degree-five** polynomial at printed share IDs 1,2,3,... . Its `horner()` begins at `y=x`, so each share equals `x^5+a4*x^4+...+a0`; `combine()` explicitly XORs away the known `x^5` term before five-share interpolation. Its optional XTEA diffusion applies *only to the constant secret coefficient*. A source-compatible test must remove and restore `x^5` when predicting values.

The LP2 physical p49,50,51 original 32×8 grid gives **256 byte-valued cells** under the separately audited base60 transcription. This supports two simple segmentations into equal-length SSSS elements: eight 32-byte vertical or contiguous fields (GF(2^256)), and 32 printed rows of eight bytes (GF(2^64)). Byte-order reversal within a field is the only permitted alternative. The original grid provides **no printed SSSS share IDs**, threshold label or ordered consumer, so adopting the historical five-share rule is a hypothesis. We freeze the candidate IDs as 1..8 or 1..32 in printed order, without fitting permutations to results.

## Fixed original-input outcomes

| Original 256-byte segmentation | Share byte order | Model field | Out-of-sample matches |
| --- | --- | --- | --- |
| Eight contiguous 32-byte sections | Printed | GF(2^256) | 0/3 |
| Eight contiguous 32-byte sections | Reversed | GF(2^256) | 0/3 |
| Eight physical columns, each 32 bytes | Printed top-to-bottom | GF(2^256) | 0/3 |
| Eight physical columns, each 32 bytes | Reversed | GF(2^256) | 0/3 |
| Thirty-two original rows, each 8 bytes | Printed left-to-right | GF(2^64) | 0/27 |
| Thirty-two original rows, each 8 bytes | Reversed | GF(2^64) | 0/27 |

In each configuration, the five raw field values first have their **known source-native `x^5` term removed**, defining the only remaining degree-four polynomial; each held-out prediction restores that known term before comparing the next observed share. **Every candidate fails on the first withheld share ID 6**. The arithmetic comes from the source SSSS field-initialization table: `x^64+x^4+x^3+x+1` and `x^256+x^10+x^5+x^2+1`. Both widths pass independent deterministic **monic** five-of-eight positive controls with exact f(0) recovery and 3/3 held-out predictions. The newly recognized monic term also fully resolves an initially confusing 2013 source-calibration discrepancy: using six original 2013 shares with source IDs 2,3,5,8,9,10, the first five reconstruct the exact historical `65b9c4065cc47a4a48e01d17de166a94252dfbb44e69` XTEA-diffused 22-byte onion secret and **predict held-out share 10 byte-for-byte**. Without the monic `x^5` adjustment, those fixtures disagree in the low two bytes. A self-contained Windows-compatible Node22 SFT, `node sims/lp2_source_ssss_256_grid_sft.cjs`, validates the original source JSON and prints the six original results.

### Research decision

The earlier 2013 SSSS mechanism and original eight-column LP2 table do **not** jointly select a shared five-of-eight or five-of-thirty-two data transport in these frozen layouts. This does not exclude a source-selected different threshold, share IDs, a nonpolynomial cipher, transformed data, or independent binary steganography, but none of those variants is licensed by the given clue. Do not expand to free share permutations or thresholds without an original instruction that fixes them. **No original LP2 plaintext, genuine key, or decoded page results.**

Reference original bytes: `resources/liber-primus/lp2-grid-256.json` (derived transcription, with 11 disputed cells independently audited against original image ink); historical source native protocol: original SSSS 0.5 C source linked above.
