# A p15 rank-S-box does not reveal the pp49–51 grid as direct ASCII

**Status (Agent 1, 12 November 2026):** A new, source-motivated **finite direct-decoder exclusion**, with an exact all-secret upper bound. No unknown Liber Primus rune, authentic LP2 key, hidden file or destination is recovered. This concerns a specific byte-channel hypothesis and does **not** exclude compressed or further-encrypted binary.

## Distinct human-visible clue pair and frozen experiment

Original physical **p15** (archive `32.jpg`) contains a 4×4 square of sixteen **distinct** Fibonacci-indexed prime distances, highlighted at the 3299 center. Its exact printed row-major entries are:

```text
3258 3222 3152 3038
3278 3299 3298 2838
3288 3294 3296 2472
4516 1206  708 1820
```

The separately visible original **pp49–51** table (archive `66.jpg`–`68.jpg`) has 256 radix-60-decoded bytes (SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`). A 4×4 square naturally gives sixteen labels, matching the **4-bit nibble values** in an 8-bit table. A hypothetical player could rank the p15 numbers 0–15, use that ranking as a 16-entry substitution box, and apply it independently to both nibbles of each printed table byte. The original p15 image specifies the numbers and geometry; **it does not explicitly instruct a nibble substitution or a cross-page key transfer**.

Freeze the rank permutation in p15 printed row order, without fitting it to the table:

```text
8  7  6  5
9 14 13  4
10 11 12  3
15 1  0  2
```

For each byte `b`, test `16*S[b>>4] + S[b&15]`. Also test only the inverse rank, complemented rank, and inverse complemented rank, the four natural fixed reversals; no byte-position shuffles, arbitrary phases, offsets, AES modes, or reused historical cipher sweeps.

| Frozen S-box | Printable ASCII bytes out of 256 |
| --- | ---: |
| Ascending rank | **96** |
| Inverse rank | **90** |
| Complemented rank | **89** |
| Inverse complemented rank | **91** |
| Unmodified source table | **103** |

Every output is binary-like and has no directly recognizable native text/file signature; the first 32 exact output bytes of each variant are printed by the SFT. Each original transformation is fully invertible, and an independently constructed 256-byte ASCII native plant is recovered exactly under each inverse. Thus failure is on the real original bytes, not the implementation.

## All-secret exclusion of every fixed bijective 4-bit substitution as plain ASCII

A stronger conclusion requires **no choice of p15 rank**. Let `h_i` be the frequencies of the 16 high-nibble classes among the exact 256 table bytes. Their counts sorted descending are:

```text
22 21 20 19 19 19 19 17 16 14 13 12 12 11 11 11
```

A printable ASCII byte has a high nibble in **{2,3,4,5,6,7}**. Under **any secret bijection** of the sixteen high-nibble labels, no more than six source classes can map into those six printable high-nibble values. The six largest classes contain only **22+21+20+19+19+19 = 120** original bytes. Even permitting an *independent arbitrary secret bijection* for the low nibble cannot improve this high-nibble necessary bound:

**At most 120/256 original bytes can become printable ASCII under any fixed invertible 4-bit high/low substitution.** At least 136 would remain nonprintable. The p15-specific symmetric S-box is a subset of this all-secret family and is therefore also excluded as a direct 256-character ASCII source.

The table also has **161 unique byte values**; any stationary 256-way byte bijection preserves that count, so it cannot make all 256 bytes printable in the 95-character ASCII range either. This latter observation is an invariant, not a proposal for a broader cipher search.

## Decision

Reject the **direct p15-square-as-16-way nibble S-box, pp49–51-as-uncompressed-ASCII** route without trying additional 16! keys, rotations or magic plaintext reconstructions. A later stage could instead be compressed, a binary key, or use a position-varying and source-specified mask. Those possibilities have no decoder supplied by this test and should require **new authorial evidence selecting the additional operation** before further exhaustive work.

Source references: [original p15 prime construction](../results/fibonacci-prime-spiral.md), [original byte table](../resources/liber-primus/lp2-grid-256.json), [reproducible source-pinned SFT](../sims/lp2_p15_p50_nibble_rank_sbox_sft.cjs). The companion original-square AES-256 and ChaCha transfer reports tested different byte/keystream constructions; their negative scopes are unchanged.
