# All-secret p7 red-polynomial keystreams fail eleven original single-rune word anchors

**Agent1, 22 November 2026. A full-secret-state original-cipher exclusion, not a decipherment.** This is a small exact attack that uses the manuscript's existing printed word boundaries to solve *every* initial key state under two newly explicit source-polynomial linear-stream models. It avoids the huge seed search. All 56 unknown pages remain unsolved.

## The source-constrained candidate key operations

Original p7's five final red whole-word GP29 ordinal products are **[11,26,8,15,2]**. Its earlier independent source analysis defines `P(X)=11+26X+8X²+15X³+2X⁴ mod29`, whose complete fixed-point equation is `Q(X)=P(X)-X=2(X−3)(X−4)(X²−8)`. These offer two compact, algebraically motivated (but *not creator-authenticated*) additive GP29 key generators:

1. The **4-state Q characteristic clock** `11K_t+25K_(t+1)+8K_(t+2)+15K_(t+3)+2K_(t+4)=0 mod29`. Every one of its four basis streams repeats after exactly 56 positions, matching the manuscript's 56 unknown physical pages, because the roots have orders dividing56. Its five literal coefficients are from p7 alone.
2. The **5-state P tap clock** `K_(t+5)=11K_t+26K_(t+1)+8K_(t+2)+15K_(t+3)+2K_(t+4) mod29`; an earlier fixed-seed candidate was studied, but a *fully unrestricted secret initial state* is a different and stronger challenge. Test also the plain reversed source coefficient order for each recurrence; no fitted coefficients.

For each, posit a simple alphabet-preserving continuous additive cipher `C_i=P_i+K_i mod29` over the unaltered original physical p8–14 chapter, including its authentic red p8 opening and page-crossing words, with an arbitrary secret 4- or 5-symbol GF29 initial state. A minus encryption sign is exactly an arbitrary seed sign reversal for a linear homogeneous clock, so adding it would duplicate the same plaintext candidate set.

## Eleven single-word source anchors and exact all-secret elimination

After joining real physical `/` line wraps and `%` page breaks, the original p8–14 section contains **1,729 runes and 383 printed complete words**. Exactly eleven words contain a **single rune**, at chapter-global zero-based positions

`[274,501,554,602,692,785,1128,1221,1348,1401,1473]`

with original unchanged ciphertext GP indices

`[10,3,10,9,6,10,14,26,1,7,11]`.

If word boundaries survive encryption and the underlying language is ordinary English GP, each one-letter whole word must read **A** (GP24) or **I** (GP10); a more generous spelling allowance also admits archaic vocative **O** (GP3). This exact conditional language constraint is independent of ciphertext training. It is *not* a general theorem about non-English/phonemic registers or space-changing ciphers.

Because the stream is linear in its 4/5 unknown initial states, the first 4 or 5 **linearly independent one-letter anchor rows** uniquely determine the state for any assumed A/I(/O) assignment. These are source indices `[274,501,602,692]` (Q, matrix rank4) and `[274,501,554,602,692]` (P, rank5). Enumerating only **2^4=16**, **3^4=81**, **2^5=32**, or **3^5=243** anchor assignments therefore proves results for *all* **29^4 = 707,281** or **29^5 = 20,511,149** possible secret initial states respectively. The remaining unfit original words are an exact holdout.

| Source model | Permitted single words | Initial-key assignments evaluated | Best original one-word constraints satisfied | All eleven satisfied |
| --- | --- | ---: | ---: | ---: |
| Q, ascending printed order | A/I | 16 | 6/11 | 0 |
| Q, ascending printed order | A/I/O | 81 | 8/11 | 0 |
| Q, mirrored order | A/I | 16 | 6/11 | 0 |
| Q, mirrored order | A/I/O | 81 | 8/11 | 0 |
| P, ascending printed taps | A/I | 32 | 7/11 | 0 |
| P, ascending printed taps | A/I/O | 243 | **10/11** | 0 |
| P, mirrored taps | A/I | 32 | 7/11 | 0 |
| P, mirrored taps | A/I/O | 243 | 8/11 | 0 |

The **10/11 near-hit** in the generous P/A/I/O model has all-secret seed `[22,15,22,3,0]`, but decodes the remaining singleton at offset1348 to **EO** (GP index12), outside all three permitted words. Its *entire* original 1,729-rune output has IoC only **0.0343393205**, with nonlinguistic prefix `NGANGTUTHBDAEARAELUCLDTHIA...`. It is not recovered prose, even if a source allowed that one exception. This is a particularly useful warning against trusting a near-perfect small-crib hit without complete plaintext.

## Independent reversible predecessor-rank output (the manuscript's rare doublets)

One stronger alternative for a creator deliberately avoiding repeat glyphs is a **full-information predecessor-exclusion register**. Before subtracting the same p7-derived secret LFSR, convert the unchanged original consecutive ciphertext runes to a 29-symbol rank channel: `U[0]=C[0]`; for `i>0`, `U[i]=0` if `C[i]=C[i−1]`, otherwise `U[i]=1+C[i]−[C[i]>C[i−1]]`. This reversible 0-marker plus 28-rank code is bijective given the predecessor ciphertext and can handle every authentic repeated-glyph exception. The original eleven one-rune plaintext locations have observed `U` values `[11,4,11,9,7,11,15,26,2,8,12]`. The same complete anchor-state inversion now tests `U=P+K mod29`, with all previously frozen Q and P clocks, mirrored source orientations and full 4/5-symbol secret states.

| Rank29 output and all-secret source clock | Highest native A/I site count | Highest native A/I/O site count | Full 11-word key survivors |
| --- | ---: | ---: | ---: |
| Q=P−X, printed / mirrored | **7 / 7** | **8 / 8** | 0 / 0 |
| P five taps, printed / mirrored | **7 / 7** | **8 / 8** | 0 / 0 |

Thus all **744 exact anchor assignments** also reject this materially different, original-doublet-aware keyed emission for ordinary printed native-English word boundaries. The result is more constrained than a language-score seed hunt because it grants *every* source LFSR initial state, yet its failure does **not** rule out any state-dependent *variable keystream clock* or a truly source-selected alphabet. An independent solved-p57-derived 1,729-rune GP-native positive recovers its hidden 4/5-symbol state and reconstructs the entire reversible predecessor-rank ciphertext exactly, including the natural generated repeats. Reproduce using [the complete Windows Node22/CommonJS rank output SFT](../sims/lp2_p7_rank28_singleword_allseed_sft.cjs). The older source polynomial H/G rank29 model is `im-results/lp2-quartic-rankskip-allseed-original-gate.md`; this independent calculation substitutes the **new p7 printed Q/P clock family** and an algebraic word-anchor all-secret method rather than copying its seed-limited result.

## Ciphertext-repeat event clocks: exact chapter-wide secret-key test

The physical p8–14 chapter has exactly **nine** immediately repeated ciphertext runes among 1,729, none at the eleven one-rune whole-word sites. If the original repeat anomaly signals literal keystream skips, it could alter the key position without altering the source-authored printed word boundaries. Let `R_i` be the count of actual adjacent ciphertext repeats through index `i`. Two source-observable, mutually exclusive clock laws are `t_i=i−R_i` (a repeated glyph consumes zero key steps) and `t_i=i+R_i` (it consumes one extra step). Use the otherwise unchanged Q/P field key `K(t_i)` and test both direct ciphertext `C_i` and the preceding full-information `U_i` output-rank values. No repeat location or key phase is tuned.

The same original eleven one-word equations have full GF29 rank4/5 after each clock change. Consequently enumerating **16, 81, 32 or 243** allowed source word assignments still covers *all* 29^4 / 29^5 secret initial register states. All 32 specified (two clocks × two output channels × four source polynomial orientations × two A/I vs A/I/O alphabets) are **original-incompatible**: none admits a secret state satisfying all eleven single-word words. The strongest A/I/O near-hit under `t=i−R_i` is mirrored-Q plus direct original ciphertext, secret seed `[4,26,4,16]`, satisfying ten of eleven; it renders singleton offset1401 as **AE**, and its full 1,729-rune original output still has IoC **0.0346117698** with nonprose opening `IPIOFBBNURIAAEBH...`. No literal phrase or key survives.

The 32 additional source-clock cases passed on [untouched Windows CI run 45053543185](https://github.com/FlareZ123/liber-primus/actions/runs/45053543185), after the independent earlier direct and predecessor-rank source runs. The expanded [rank and duplicate-clock Node22 source test](../sims/lp2_p7_rank28_singleword_allseed_sft.cjs) now prints the 32 exact secret-space decisions in addition to the earlier eight full-state predecessor-rank cases and their independent solved-GP-positive roundtrip. These tests do **not** cover plaintext-dependent arbitrary extra skipping, invisible word separators, or synchronized transposition; those would need a source-written inverse before expansion. The meaningful update is that the manuscript's **actual nine source duplicate positions** do not rescue the p7 Q/P source keys as direct secret LFSRs.

## Decision and reproduction

**Reject these four exact source-rooted linear key generators, with arbitrary 4/5-symbol secret seeds, as the sole direct word-preserving additive GP29, direct reversible predecessor-rank-plus-additive, or literal ciphertext-repeat-skipped additive decoder of p8–14 native-English plaintext.** The contradiction arises from the original printed single-word sites, before applying an English n-gram score. Both plaintext/ciphertext signs are covered by seed negation. Different nonlinear feedback clocks, F-transparent skip semantics, a language with additional one-rune words, or ciphertext-space resegmentation remain unresolved and are not excluded.

Both source tests have completed successfully on unmodified source material in Windows GitHub Actions: [direct all-secret original run 45053209539](https://github.com/FlareZ123/liber-primus/actions/runs/45053209539) and [predecessor-rank all-secret original run 45053213617](https://github.com/FlareZ123/liber-primus/actions/runs/45053213617). The [one-file Windows11/Node22/CommonJS SFT](../sims/lp2_p7_singleword_allseed_sft.cjs) reads the original canonical corpus and transcription, asserts all eleven locations and values, reconstructs the source Q/P recurrences and their mirrored forms, certifies independent GF29 anchor ranks, exhausts **744** initial-state assignments for the four models and two allowed alphabets, and checks exact reencryption and seed recovery on independent 1,729-rune solved-p57-derived positive plants for every case. Original image inputs: `resources/liber-primus/24.jpg` (p7) and `25.jpg` (p8). Prior source arithmetic report: `im-results/lp2-p7-p8-original-red-polynomial-fixedpoint.md`. Earlier p7 five-tap seed-restricted keyskip: `im-results/lp2-p7-p8-five-dot-lfsr-skip-cube-original-gate.md`.
