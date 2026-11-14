# LP2 terminal quintet channel: 24-bit overflow and the original ornament

**Evidence classification (14 November 2026, Agent 37): exploratory source-constrained serialization, no recovered plaintext, authentic cipher, secret key or destination.** The exact original-input, reversible implementation is [`sims/lp2_terminal_quintet_overflow_sft.cjs`](../sims/lp2_terminal_quintet_overflow_sft.cjs), using the repository's unchanged [GP29 corpus](../resources/liber-primus/lp2-corpus.json). This is a bounded *binary-payload* test, not another unrestricted English scorer.

## Frozen source alignment and why the construction was attempted

Original physical p55 contains **76 GP29 ciphertext runes**; the first finishes a word carried over from p54. The other **75 runes** therefore form exactly **15 contiguous quintets**. The original p55 floral ornament has **five left positions**, outlined at positions **1 and 4**, and **five right positions**, all filled. That five-position source picture and p27's independently verified **15 wing-membrane faces** motivate checking the natural 15×5 packetization. The source does *not* explicitly prescribe binary byte packing, a high-bit threshold, or a 2014 byte decoder.

For each of the fifteen p55 quintets after the carried rune, interpret the five original GP29 indices as a base-29 big-endian number `v` (0 ≤ v < 29⁵ = 20,511,149). Since `2²⁴ = 16,777,216`, a supposed fixed three-byte payload `v` is **invalid** whenever `v ≥ 2²⁴`. A reversible *candidate* transport instead has the unique quotient/remainder `q=floor(v/2²⁴)` (one bit, 0 or 1), `r=v−q·2²⁴` (exactly three bytes), and reconstructs `v` from `q,r` before base-29 re-encoding. This is mathematically lossless on the selected original ciphertext and on the supported 25-bit positive controls; it is not evidence that the author used it.

## Exact original-input result

The fifteen source packet high flags in normal left-to-right GP29 order are:

```text
10010 00000 00000
```

The first five flags **exactly match the already-documented left ornament's hollow-position mask `10010`**. The next five flags match the five completely filled right positions when a filled dot is coded 0. The last five flags are also zero. The 45 recovered *low-24-bit* bytes are:

```text
15023cbcedd14959802c8aee4d43d09b0ead8f8e12d2f139066f3e8892b6460c27a66059a2e9bc73106377502d
```

All **75/75 source runes reconstruct exactly** when the fifteen flag bits are retained. The source's only overflowing quintets are the **first and fourth**; a flag-free `5 runes → 3 bytes` converter is therefore *not* a lossless original-cipher inverse. The 45-byte output has no obvious ASCII sentence or recognized unencrypted file prefix; 18 of its 45 bytes are printable 7-bit ASCII, consistent with an unstructured/high-entropy sequence. This does not exclude ciphertext, compression or another binary packet format.

An independent source control tested **every possible five-rune start phase (0–4)** at each of the 55 rune-bearing unsolved physical pages, requiring all 75 source runes for fifteen quintets. This gives **267 eligible page/phase windows**; the same exact full fifteen-flag pattern occurs at `(page1,phase0)`, `(page53,phase4)`, and `(page55,phase1)`. For independent uniform GP29 quintets, the probability of this particular fixed flag pattern is `[(29⁵−2²⁴)/29⁵]² · [2²⁴/29⁵]¹³ = 0.00243131845454`. This is **not a discovery-corrected p-value**: selection of p55, the 24-bit radix, quintet grouping and the artwork mask was exploratory, and some original source positions were previously inspected for other reasons. The exact duplicate pattern in multiple page/phase controls makes the source cross-check interesting but nonexclusive.

## Decipherment decision

The source-determined **75-rune body** and original ornament permit a precise, repeatable **15×5** candidate readout; the 24-bit overflow pattern is an exact original-cipher observation. However there is currently **no historical instruction selecting 24-bit byte packets**, and the inferred 45 bytes lack an externally authenticated object/operation. Do not promote the ornament match to a key, plaintext or verified hidden file; do not optimize phases, byte order, masks, transformations or new enciphering layers merely to make the candidate readable.

A decisive successor would need one independent original source clue explicitly selecting the quintet-to-byte transport, its carry convention, and a checksum or other testable interpretation of the 45 bytes. Without that, the finite straightforward three-byte readout has failed and broader binary-payload speculation remains unfounded.