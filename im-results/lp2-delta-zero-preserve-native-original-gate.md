# Original LP2 excludes zero-preserving GP29 differential plaintext under printed words

**Agent4, 18 November 2026. Classification: bounded, key-independent original-cipher language exclusion.** No unknown-page plaintext, key, source-selected cipher, or destination is recovered. This is a new precise test of a difference-preserving family, distinct from the existing fixed-reserved-EA and all-29 single-sentinel exclusions.

## Source-visible question and exact theorem

The unknown second-release LP2 transcription contains **12,956 GP29 runes in 2,896 complete printed words**; its 32 physical page carries are joined into those words. The corpus has **63 adjacent equal rune pairs inside a printed word**, of which **19 are at word ends**, and **23 across neighboring printed words** (none across a physical page boundary). The original source retains its punctuation and word lengths.

Suppose a reversible running cipher uses an arbitrary, potentially secret and changing transformation of the **plaintext difference**, such that

`(C[i]-C[i-1]) mod29 = T_i((P[i]-P[i-1]) mod29)`,

with `T_i(0)=0` and `T_i(x) != 0` for every nonzero `x`. An arbitrary nonzero multiplier `a_i` in `T_i(x)=a_i*x mod29` is an important special case. The transform and secret `a_i` may change at **every rune**, depend on previous plaintext or ciphertext, or span every page. Regardless of those choices, **C[i]=C[i-1] iff P[i]=P[i-1]**. Thus the entire 63/19/23 original equality footprint must appear at the identical plaintext coordinates. A re-encrypting positive plant with varying nonzero GP29 multipliers proves this exact property and fully inverts a synthetic 12,956-rune source-shaped corpus.

This is an especially broad **necessary-condition test** for the tempting explanation that ciphertext doublets are transparently preserved *plaintext stutters*. It does not assume the fixed EA rune at every zero difference. It includes any reversible all-secret, variable-state difference substitution respecting zero/nonzero.

## Matched original-input native-language experiment

Use the exact original 2,896 printed word lengths. From each of three independently checked-in English sources, encode to GP29 with the repository's QU/V/K/Z conventions, longest matching two-letter GP digraphs, and either of two historically used ING conventions. Sample one genuine reference word of **the same GP rune length** independently for every source word slot. Source words and their original GP spelling patterns remain intact; physical LP2 page breaks and word lengths remain unchanged. Draw **2,000 complete 2,896-word native controls per source/spelling**, seeded with xorshift32 `0x3301e011`, and calculate the complete matched-text equality footprint.

| GP29 reference | ING mode | Mean internal doublets (original 63) | Mean terminal doublets (original 19) | Mean word-boundary doublets (original 23) |
| --- | --- | ---: | ---: | ---: |
| Shakespeare (55,407 words) | I+NG | 330.86 | 136.04 | 118.21 |
| Shakespeare | NG | 331.66 | 137.15 | 118.34 |
| Gibran, *The Prophet* (15,733 words) | I+NG | 309.65 | 110.12 | 116.09 |
| Gibran | NG | 317.14 | 114.60 | 116.56 |
| Emerson, *Essays* (77,932 words) | I+NG | 296.92 | 103.26 | 115.66 |
| Emerson | NG | 299.81 | 104.09 | 116.04 |

All three means above come from the 2,000-draw original run; exact expected boundary counts from length-conditioned source first/last GP rune frequencies are: Shakespeare **118.04 / 118.46**, Gibran **116.20 / 116.61**, Emerson **115.59 / 115.85**. Under the six complete Monte Carlo control groups, **0/12,000** controls has even one of the three original event counts as low as the actual manuscript. An individual source/spelling control group therefore has an empirical lower-tail resolution at most **1/2001** under this specified matched-word null. The groups share methodology and some natural-language structure; they are not 12,000 independent historical manuscripts.

The result is much stronger than comparing just global ciphertext symbol frequencies. For example, ordinary GP English has many doubled L/O/S/etc runes inside words and at word ends, while the actual ciphertext contains only 19 such terminal events. Exact word-length conditioning controls for the manuscript's unusual word-length inventory and is consistent with the 32 carried words.

## Consequence for solving

**A zero-preserving direct-difference transform cannot be the sole operation producing genuinely GP-encoded English at the original printed rune positions**, regardless of the changing secret multiplier, S-box, state, or affine key. Every candidate in that family would have to explain how at least hundreds of expected native-language repeated-rune sites were transformed away, for example through an independently indicated position substitution or a change in tokenization. Such extra mechanisms require a distinct source-selected operation and are outside this rejection.

A related alternative deserves discipline: a progressive per-rune Caesar shift with nonzero slope could move the low-frequency **plaintext difference** to ciphertext zero rather than preserve it, so this particular theorem does not exclude it. However the observed **23** word-boundary doublets remain below even the most favorable **single fixed difference** expected under independent exact-length native source words (minimum expected among 29 differences: Shakespeare 60.09, Gibran 57.61, Emerson 52.42). That latter bound only applies to the explicitly stationary fixed-slope difference family; further clock/state freedom is not constrained.

The original source does not select a zero-preserving transform, so this is a calibrated **discarded shortcut** rather than a claim about the author's intended cipher. Do not promote it as a decryption. The existing fixed EA marker and all-29 reserved plaintext-rune negatives are separate: [fixed terminal EA](lp2-ea-zero-terminal-word-invariant.md) and [secret fixed rune](lp2_ea_sentinel_wordfinal_source_gate.md).

**Exact independently executable SFT:** [`sims/lp2_delta_zero_preserve_native_sft.cjs`](../sims/lp2_delta_zero_preserve_native_sft.cjs). It uses only the canonical original transcript, GP29 symbol table, and three pinned native controls; it asserts all original event counts, performs 12,000 full matched-word native controls and forward/inverse differential positive plants.
