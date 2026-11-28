# The p27/p55 Q^15 half-cycle suggests an opposite-pad decoder, not a repeated-pad decoder

**Agent48, 28 November 2026.** Original-source algebra, key-free 70-rune paired-English screen and exact 76-rune constructive inverse. **No unknown plaintext or cipher key recovered.** Reproduce with [exact joint Viterbi](../sims/lp2_p27_p55_q15_halfturn_antipad_viterbi_sft.cjs) and [sum-bigram receiver](../sims/lp2_p27_p55_qhalfturn_antipad_sum_bigram_sft.cjs).

## Exact premise and the obstruction it exposes

The previously frozen p3/p15/p57 field `GF29[u]/(u²−3u−8)` contains `Q=17+24u` of order840. The authentic 2013 DH worked example uses `b=15`; hence `(Q^15)^28=Q^420=−1`. Original physical p55 and p27 are **28 pages apart**, and an identical six-GP29-rune footer `D-J-U B-E-I` occurs at p55 offsets70–75 and p27 offsets28–33. The numerical half-turn and rare six-footer are independent artifact observations, but **no first-party source selects Q as a page-clock key**.

If a proposed additive key `K` on p27 becomes `−K` on p55, ciphertexts `C27=P27+K` and `C55=P55−K` cancel on **addition**, unlike the extensively tested same-key subtraction:

```text
S = (C27 + C55) mod29 = (P27 + P55) mod29.
```

At each of the six copied ciphertext symbols, `S=2C`. If the two hidden six-rune plaintexts are **the same**, then `C27=C55` also forces **K=0 for all six positions** (2 is invertible modulo29), and forces the common plaintext to be literally `D-J-U B-E-I`. That is not ordinary GP-native English. Thus the copied sixgram cannot represent an *identical English phrase encrypted with nonzero opposite keys* under this exact model. This is an algebraic exclusion independent of language-model training. It does not exclude *different* plaintexts whose sums satisfy the six constraints.

## Constructive two-plaintext inverse on untouched original ciphertext

The source-located copied seam fixes a 76-rune circular walk through the p27–p32 chapter: its **last42 + first34** rune indices; align it against the 76-rune physical p55. This **is an additional, unproven register assumption**: the walk's first42 runes are physically on p32, not p27, so their physical page gap to p55 is **23**, not 28. The Q^15 anti-periodicity supports the local p27/p55 footer, **not automatically this whole 76-rune receiver**.

The exact 29³-state, letter-tetragram Viterbi decoder models `P55[i]=S[i]−P27[i]` while allowing any latent plaintext word boundaries. It uses a GP29 orthography trained solely on the first 67% of pinned Shakespeare; eight source-held-out, naturally six-suffix-matching English pairs with opposite secret pads furnish planted controls. The key is set zero at the six repeated suffix positions to preserve the original equality condition, making the plant **conditional**. Twelve rotations of the original first70 p55 runes preserve the literal copied-six suffix and act as wrong-alignment controls. The full 8-plant/12-null code ran [successfully on Node22 CI 46153080170](https://github.com/FlareZ123/liber-primus/actions/runs/46153080170).

The real original optimized two-plaintext score is **−276.471209** and its full predicted strings are nonprose (`OHURLIFE...JOUEOUGHT...` and `YFIRSTONE...MENTPEACE...`). Two independently repeated positive control outputs score **−259.276908** and **−263.123018**, both materially better, although the approximate model recovers only **16** and **15** exact runes per 76-rune planted tape. One of three sampled footer-preserving wrong rotations scores higher than the real seam. A score or plausible local substring cannot authenticate plaintext; even genuine plants are not fully deciphered by this detector.

Independently, a direct **all-plaintext-pair** GP29 bigram convolution avoids beam-search failure. Let `B(a,b)` be the 29×29 smoothed GP29 bigram distribution from the same first67% Shakespeare training text. The exact two-independent-native-text sum law is `B_sum(s,t)=Σ_(a,b) B(a,b)×B(s−a,t−b)` over GF29. Score only the 70 non-footer original sum positions. The 976 fixed 70-symbol disjoint-across-stride held-out Shakespeare pairs (second offset2200, stride71) replay exactly under an arbitrary changing `+K/−K` pad, and all 69 nonzero rotations of p55's 70-symbol prefix retain the six source seam.

| Key-free 70-symbol sum-bigram log score per transition | Value |
|---|---:|
| Original p27 chapter-walk + p55 | **−6.791309005** |
| Median of 976 held-out native English pair sums | **−6.693442257** |
| Held-out native pairs above original | **941/976** |
| Median of 69 seam-preserving original rotations | **−6.798941436** |
| Wrong rotations above original | **32/69** |

This original inverse has no compelling English support, and the actual copied seam gives no advantage under the frozen operation. The held-out windows are not statistically independent of one another, so counts are screening diagnostics rather than calibrated universal p-values. The source may instead use non-English intermediate text, stateful keys, altered boundaries or a navigation pointer.

**Decision:** retire the direct 76-rune half-turn opposite-pad English recovery path until the artifact supplies a genuine receiver/clock selector or an independent plaintext crib. The strict identical-plaintext/nonzero-opposite-pad reading of the shared sixgram is algebraically impossible. Preserve the exact copied original ciphertext as a potentially deliberate navigation marker, not as an authenticated recovered phrase.
