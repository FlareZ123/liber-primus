# P50 higher BASE29 digit channel: radix-nine and additive-use gates

**Decision:** original-image-derived direct readout is nonlinguistic. No unknown Liber Primus ciphertext has been decrypted, and no key or hidden destination is recovered.

## Why this operation is specifically motivated

The original 32 × 8 numeric table on physical p49–51 contains 256 source-verified byte values. Their residues modulo 29 obey two exact source-linked quadratic constraints: the 2013 BASE29 example supplies H and the manuscript's marked p39 red triad supplies G. These reproduce the established **[256,252,3] four-constraint linear block-code relation** in GF(29) residues; this is a global polynomial-divisibility fact, not by itself a standard length-256 cyclic/BCH code or a local LFSR recurrence. The code alone cannot determine byte values because adding 29 leaves every residue unchanged.

That mathematical blind spot gives a concrete, separate candidate payload. Each byte B has a unique Euclidean decomposition

`B = 29q + r`, with `r ∈ [0,28]` and `q ∈ [0,8]`.

The original table order fixes 256 higher digits `q`. Because nine distinct q values occur, **base 9** is the smallest uniform radix capable of representing this channel without ambiguity. Read all 256 higher digits in printed row-major, most-significant-first order as one base-9 integer and render its minimal big-endian byte string. The use of radix conversion is historically motivated by the authenticated 2013 BASE29 instruction, although no source explicitly tells a player to split LP2 bytes or decode the high digits as base 9.

## Original-input result

The resulting 256 higher digits have counts, for digit 0 through 8:

`[22, 33, 38, 22, 29, 32, 34, 21, 25]`.

The nine-bin Pearson chi-square against equal frequencies is **10.765625**, descriptive upper-tail p approximately **0.2153** (8 degrees of freedom). The higher digits exhibit no clear concentration or omission. In particular, digit 8 occurs **25** times, so a naive octal reinterpretation would lose information.

The fixed base-9 integer yields exactly **102 bytes**, SHA-256:

`69302374af14825a3552f40507104f453505c9e7cbf0e45c9de990e1c4377bc1`

First 16 bytes (hex): `09 df 17 9a 31 59 d6 a1 aa c6 14 0c 89 73 6e 8b`.

Only **35/102** bytes are printable ASCII, consistent with unscripted binary data at this length. Empirical byte entropy is **6.24585892036 bits/byte**; this estimate is sample-size-limited. The result begins with none of the tested PDF, armored PGP, ZIP, gzip, PNG, JPEG, BMP or SQLite headers. It is neither readable text nor an immediately recognizable container.

The original ordered 256-byte table continues to satisfy the exact H and G zero-remainder assertions. A planted, 256-digit base-9 serialization of independent ASCII text round-trips exactly. The same table was also tested as a direct linear-recurrence output, which is a distinct claim from polynomial divisibility. The [single-file CJS](../sims/p50_base29_high_digit_radix9_sft.cjs) was run successfully in [GitHub Actions 43038348425](https://github.com/FlareZ123/liber-primus/actions/runs/43038348425), using the `p50-base9` source-only probe.

## 3×3-dot quotient-channel tests

The original p49 text ends at a red **3×3 dot cluster** immediately before the numeric table; the same 3×3 motif recurs in the p49–51 margins. This is a plausible nine-state selector for `q∈[0,8]`, but it does not itself specify an arithmetic operation. To test the simplest use without fitting offsets or resets, the fixed row-major base60 bytes were decomposed as `B=29q+r` and only the two natural additive directions were tried.

1. **Recombine the two channels inside the table:** `P=(r−q) mod29` and `P=(r+q) mod29` over all 256 cells. The raw residue stream scores **−7.37528989** mean English-quadgram log10 frequency per quadgram; `r−q` scores **−7.29330844** and `r+q` **−7.52358030**. Neither yields readable text.
2. **Use q as a Gronsfeld stream on the flanking runic text:** concatenate p49's 66 runes and p51's 92 runes in source order (158 total), align the first 158 q digits from the table to p49 local rune 0, and continue without a reset across p51. Base60 subtraction/addition score **−7.50012991 / −7.32724813**, against raw **−7.48337804**. The corresponding base59 controls score **−7.47006507 / −7.39694117**. No direction produces words; the 98 unused q digits and lack of an explicit key-to-text instruction remain objections.

The score model is the same Duko Round27 English quadgram table used by the reproducer, with mean `log10((count or 0.01)/total)`. These are bounded, source-motivated probes, not an authenticated cipher selection. The modest score changes are not plaintext evidence; all candidates remain far below the solved p56 positive control (**−4.46164858** under the same model).

## Impact on the solve path

This retires three literal higher-channel interpretations: (a) `q` as one big-endian base-9 integer yielding a standalone binary payload; (b) direct within-cell `r±q` recombination into a GP29 stream; and (c) the first 158 q digits as a continuous Gronsfeld key for the adjacent p49/p51 text. The 3×3 dots make the nine-valued quotient channel a reasonable thing to notice, but they do not select addition, subtraction, or a key-to-flanking-text relationship. No unknown LP2 plaintext, key, URL or destination is recovered. The direct H/G recurrence interpretation of the table itself is also retired; other stateful H/G consumers remain open.

The higher digits are not thereby proved meaningless. Further uses require a new source-native instruction that selects an operation, alignment and target; do not expand this into offsets, resets, multipliers, or alternate packing searches. The separate 252 GF(29) polynomial-division quotient remains a different register and must not be confused with the per-byte `floor(B/29)` channel. The authoritative overall LP2 solution status remains unchanged.


## Direct H/G recurrence test of the 256 table (bounded negative)

A natural interpretation of the source-linked quadratics is that the 256 table residues themselves are a short LFSR sequence. This is not implied by the global polynomial divisibility, so it was tested directly. Reduce the original historical and LP2-canonical table values modulo 29; evaluate every complete window using
`r_i = Σ_j f_j s_(i+j) mod 29`
for H=[3,26,24], G=[27,5,15], and H·G=[23,21,11,17,12], in both coefficient orientations. The four source-natural layouts are historical row-major, historical column-major, canonical row-major, and canonical column-major.

| Layout | H zero residuals (forward/reverse) | G (forward/reverse) | H·G (forward/reverse) |
| --- | ---: | ---: | ---: |
| Historical row-major | 7/254 · 13/254 | 10/254 · 7/254 | 13/252 · 8/252 |
| Historical column-major | 5/254 · 7/254 | 7/254 · 8/254 | 9/252 · 8/252 |
| Canonical row-major | 8/254 · 14/254 | 11/254 · 9/254 | 12/252 · 9/252 |
| Canonical column-major | 6/254 · 9/254 | 7/254 · 6/254 | 7/252 · 4/252 |

Every residual stream contains **all 29 residues**. No layout or orientation satisfies a sustained H, G, or H·G recurrence; the observed zero counts are small and fluctuate around the 1/29 random-residual baseline. The 256-entry p50 table is therefore **not itself a direct H/G LFSR output** in the source-natural orders. This does not reject the established global H/G polynomial divisibility, the high-digit channel, or separate feedback-state/quotient consumers. The ordinary length-256 cyclic-code interpretation is independently excluded: (X^{256}-1 \bmod H=19+19X\), so H does not divide (X^{256}-1) and H·G cannot generate a cyclic/BCH code of length 256. In characteristic 29, (X^{840\cdot29}-1=(X^{840}-1)^{29}); H's root order 840 and G=15(X−24)² therefore give a repeated-root closure at length **24,360**. No source selects that length or a shortening/interleaving from the 256 table or 12,956-rune stream. The fixed test is reproducible with [the recurrence gate](../sims/p50_hg_direct_recurrence_gate.cjs).
