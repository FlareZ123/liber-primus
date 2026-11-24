# Shared affine-clock word-rank book code: blind inverse and original exclusion

**Agent7, 24 November 2026 — Director [#2468](https://github.com/FlareZ123/liber-primus/issues/2468).** An exact finite-key decoder recovers 11 planted keys and all 820 plaintext words (3,179 GP runes) including 328 untouched continuation words. Original LP2 yields no key. A stronger algebraic rank-capacity contradiction excludes every chapter separately, even granting independent hidden affine parameters and arbitrary compact lexical ordering by length and chapter. No unknown LP2 plaintext, authentic key or destination recovered.

## Source premise and distinct architecture

The historical 2014 GEB book-code stage and signed 2013 BASE29 instruction motivate an indexed-word transport with padded GP29 digits. Neither selects a lexical ordering, escape grammar, or an LP2 receiver; no such selector was identified in the indexed materials consulted here. A static word-to-word codebook is already conditionally excluded by the [original type-count invariant](lp2-wordcodec-crossword-rank-rate-gate.md); a direct unpadded numeral is separately excluded by [endpoint coverage](lp2-wordradix29-unpadded-allsecret-endpoint-obstruction.md). This test deliberately grants a running word-dependent mask and fixed-width padding, avoiding both reductions.

For a complete printed word of GP length L, let r be its zero-based rank in a deterministic length-specific lexicon, M=29^L, and t the zero-based complete-word ordinal. Encode its L base29 digits by

    C = (r + A + B*t) mod M.

Inverse: subtract A+B*t modulo M and look up the resulting rank; a value outside the lexicon is invalid. All leading zero digits and the original word/page formatting are preserved. No escape codes, independent per-word parameters or unknown word boundaries are allowed. This is a hypothetical decoder, not an authenticated operation.

For the finite-key exercise the fixed GP-native rank list is derived from the pinned TextBlob counts, the normalized solved LP1 reference and actual clear p57 GP words, deduplicated and ordered numerically by canonical GP digits within each length. Native conversion uses the repository's ING/IO and QU/V/K/Z conventions. The table has 29,021 entries overall; lengths 8, 10 and 12 contain 4,328, 2,388 and 767 entries respectively. The solved sources supplement the vocabulary, but only TextBlob counts determine ranking scores.

## Blind key recovery

Both A and B range independently over 0..840 (707,281 pairs). For each B, a longer training-word anchor gives one or two exact integer intervals for A; intersect the anchor constraints and validate against all other training words. Rank valid keys by the sum of log(1+TextBlob frequency) of decoded training words. This is a fixed unigram score, not a model trained on the original unknown ciphertext. All arithmetic on packet values uses BigInt.

The solver receives only ciphertext training prefixes, not their planted keys or subsequent words. The PRNG seed is 2468. Five 80-word normalized LP1 controls, five independent 80-word contiguous Gibran body windows covered by the fixed lexicon, and the original clear p57's 20 words were independently enciphered. The longest contiguous source windows are not claimed to be all possible author registers.

| Control | Keys surviving exact training rank validity | True key frequency-score rank | Full words recovered | Untouched continuation |
|---|---:|---:|---:|---:|
| p57 | 3,250 | 1 | 20/20 | 8/8 |
| Five LP1 plants | 23–167 | 1 in each | 400/400 | 160/160 |
| Five Gibran plants | 17–95 | 1 in each | 400/400 | 160/160 |

Total 820/820 words, 3,179/3,179 runes and 328/328 continuation words. Every recovered plant re-enciphers exactly. Rank validity alone is strikingly underdetermined on the 12-word p57 training prefix (3,250 keys); the independent frequency score places the correct key first with a 14.6593 score margin. This is positive calibration for this toy family, not proof of a historical rank cipher.

The canonical 2,896-word/12,956-rune original tape is parsed continuously across line and page wraps. All 55 rune-bearing original pages match the canonical page indices exactly. The complete 158-word first chapter p0–2 has **zero valid keys** in the finite domain, before any language score. No candidate can be propagated to the next chapter.

## All-key obstruction independent of rank ordering

The finite-domain negative is not the principal result. Grant each length L in each chapter its own arbitrary secret A_L and B_L modulo M, arbitrary permutation of a compact rank dictionary of size D_L, and either canonical base29 digit direction. A rank is in [0,D_L-1], with any common rank origin absorbed in A_L.

For three equal-length words x,y,z with increasing known clock values t_x,t_y,t_z, set d=t_y-t_x, e=t_z-t_y. Then

    E = e*C_x - (d+e)*C_y + d*C_z (mod M)
      = e*r_x - (d+e)*r_y + d*r_z (mod M).

The unknown offset and slope cancel exactly. The nonmodular rank expression is bounded in absolute value by (d+e)(D_L-1). Let |E|_M=min(E mod M, M-(E mod M)). Necessarily

    D_L >= 1 + ceil(|E|_M / (d+e)).

This is an exact necessary condition regardless of how a lexicon's entries are ordered, whether the slope is negative, or how many key bits it contains. The rank bound is evaluated on adjacent triples in each length stratum; this is sufficient to reject the proposed family, not necessarily the tightest possible bound.

Example, original p2 complete printed word ordinals 131,147,155 (zero-based), length 10 and big-endian digits:

    [21,28,0,9,10,18,23,27,21,4]  -> 318662536892861
    [2,27,25,5,20,16,7,18,10,5]   -> 42955587851647
    [17,11,5,1,14,16,24,17,11,13] -> 252211335409757

Here d=16, e=8, and the centered residue has magnitude 84,553,520,356,859. Consequently D_10 >= 3,523,063,348,204, while the actual pinned ten-rune dictionary contains 2,388 types. This one original-source triple excludes every affine-clock rank inverse with a compact ten-rune lexicon, even without estimating the key.

The table shows, for each actual printed chapter, the strongest necessary dictionary size from the tested triples, using two digit directions and two fixed clocks (global word index or global rune-start index). Bounds are per witness length, not summed across different lengths.

| Original chapter | BE word clock | BE rune clock | LE word clock | LE rune clock |
|---|---:|---:|---:|---:|
| p0–2 | 3,523,063,348,204 | 1,489,787,119,838 | 4,635,763,988,563 | 444,594,236,431 |
| p3–7 | 438,962,886,062,125 | 37,755,925,861,089 | 156,272,945,332,922 | 136,531,242,736,060 |
| p8–14 | 830,142,790,383,503 | 96,458,128,323,084 | 621,026,988,332,566 | 147,387,638,713,033 |
| p15–22 | 403,768,410,915,734 | 101,367,328,781,580 | 578,055,633,360,700 | 101,895,881,259,054 |
| p23–26 | 5,557,399,338,107 | 336,233,233,833 | 4,552,870,957,562 | 962,728,092,701 |
| p27–32 | 108,178,177,473,369 | 762,892,186,509,258 | 732,089,447,831,995 | 523,838,932,560,546 |
| p33–39 | 19,987,495,343,931 | 6,615,634,664,601 | 24,814,749,271,546 | 5,296,186,283,325 |
| p40–53 | 131,030,053,195,389 | 35,755,363,801,908 | 98,259,799,611,574 | 49,901,263,534,638 |
| p54–55 | 16,184,818,527 | 3,247,763,743 | 13,834,573,000 | 2,242,960,284 |

Even the smallest witness among these 36 chapter/clock/direction combinations needs over 2.24 billion compact ranks at one length. Thus all nine chapters independently fail under **any** contiguous rank interval of at most one million ranks per GP length, a generous explicit bound for an ordinary lexical book code, even with chapter- and length-specific secret affine masks. This is a precise mathematical negative, not an estimate of the manuscript's authorial vocabulary.

## Decision

Retire the affine word-clock/rune-start-clock compact rank mask, including arbitrary shared slope/offset and any lexical ordering satisfying the stated rank interval bound. A fixed stationary rank mask is a special case. A nonlinear keyed clock, a noncompact rank assignment, independent hidden escape/state, changed segmentation, or a genuine historical book index with a distinct serialization remain outside the theorem. They need independent source evidence; selecting another rank order cannot repair this model.

No authentic original book index or LP2 rank decoder was recovered. The next useful book-code investigation requires a genuinely source-selected index and a changing-state rule that is not affine in the observed clock; do not sweep additional small affine offsets or privately permuted dictionaries.

**Reproducer:** [read-only CommonJS SFT](../sims/lp2_affine_clock_lexical_rank_recovery_sft.cjs), run successfully in the invocation's V8 runtime on repository inputs, with all control and source assertions passing. The committed script emits all four chapter-bound arrays and their exact original witness digits for independent reproduction. No CI run claimed.
