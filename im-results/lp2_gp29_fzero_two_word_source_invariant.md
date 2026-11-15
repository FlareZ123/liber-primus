# Two-rune word constraint on an F-zero GP29 feedback cipher

**15 November 2026 — source-native, key-independent family restriction.** The exact original LP2 pp0–55 printed-word stream contains **448 two-rune words and just one equal-rune two-word**. The source-native solved LP1 prose reference contains **165 two-GP-rune words, nine ending in GP rune F (zero)**, all nine instances of OF/IF. Under a reversible multiplicative feedback family whose **zero ciphertext step is exactly plaintext F**, any native plaintext word OF or IF must appear as **two identical ciphertext runes**, irrespective of the secret key, initial state, or which nonzero multiplier is chosen. The manuscript's near-absence of such two-rune ciphertext words is therefore a severe constraint on that particular family *provided its ciphertext preserves the plaintext word breaks and the source-native English register*. No unknown-page plaintext or key recovered.

## Source and algebra

The standard Gematria Primus index map has F=0 and O=3. Consider a candidate per-rune transport over the prime field:

```
C[i] = C[i-1] + K[i] * P[i]  (mod 29), K[i] ∈ {1,...,28}
```

The same argument holds for any invertible multiplication of the plaintext rune value before adding the predecessor. Because K[i] is never zero,

```
C[i] = C[i-1]  if and only if  P[i] = 0 (F).
```

For **OF**, whose GP indices are [3,0], the second character must repeat the first cipher rune, regardless of K and initial position. The implication stays valid when the cipher resets between complete words, because this is the *second rune within the same word*. A fixed source alphabet transformation mapping some **other** plaintext rune to zero, a literal zero-step escape channel, nonmultiplicative state, altered word boundaries or a non-English register are separate models; this experiment does not exclude them.

The original source is [`lp2-transcription.txt`](../resources/liber-primus/lp2-transcription.txt) and canonical [GP29 corpus](../resources/liber-primus/lp2-corpus.json). Join the **55 rune-bearing** original unknown physical-page blocks (p50 is the runeless table) in printed order, remove the transcription's linewrap slashes and line breaks, retain the actual punctuation/space delimiters, then split at nonrunes. This exactly reconstructs **12,956 runes in 2,896 printed words**. In particular, joining original page-carry words corrects a naïve per-page tally of 2,928 words and 465 two-rune fragments. The correct global tally is **448 two-rune words with one equality**.

Source-native English comparison: select each full solved LP1 passage from [`lp1-plaintext-reference.txt`](../resources/liber-primus/lp1-plaintext-reference.txt), sections 1, 3, 5, 6, 9–15, with repeated continuation summaries omitted. Preserve GP digraphs (TH, NG, EO, OE, AE, IA, EA) and the standard K/Q→C, V→U, Z→S normalizations, yielding **165 whole two-GP-rune words, nine with final F (9/165)**. All nine are **OF/IF**. The original unknown has an equality in **1/448** such words. An illustrative same-register expectation is **448×9/165=24.436** equality-bearing words. The exact one-sided Fisher comparison of [[1,447],[9,156]] gives **p=4.8363321367×10⁻⁵**, *conditional on treating words as independent samples from the same vocabulary mixture*. Repeated language and genre differences weaken any literal p-value interpretation. Even the source-provided nine examples make the key-independent mismatch concrete.

An additional *conditional* lexical pinch: original p27 contains a directly printed 12-rune word `ᛇᚱᚾᛋᚩᚩᚳᚪᛖᚣᛖᛖ` flanked by literal hyphens, with equal neighbors at zero-based offsets 5 and 11. The candidate forces its plaintext GP word to have F at both offsets. None of 890 12-GP-rune words in the permissively normalized TextBlob 29,157-word historical reference [`english_wordfreq_textblob.txt`](../resources/control/english_wordfreq_textblob.txt) has that pair. This is weak by itself: **62/66** possible double-F offset pairs in that 12-rune dictionary cohort are also absent, and proper/compound words are undercovered. It cannot establish a plaintext impossibility without an authenticated lexicon restriction.

## Reproduction and decision

[The source-native Windows Node 22 single-file test](../sims/lp2_zero_step_F_two_rune_native_sft.cjs) reconstructs the 2,896/448/1 original counts, the 165/9 solved-prose counts, and checks **all 784 pairs** of nonzero GP29 multipliers with an authentic OF GP plaintext plant. It requires no secrets or ciphertext-fitted parameters. The independent [Windows CI run 43743706526](https://github.com/FlareZ123/liber-primus/actions/runs/43743706526) completed successfully on the committed original and solved source fixtures.

**Decision:** prohibit a recovered-key claim for *literal F-zero, nonzero-multiplier, word-preserving GP29 feedback* that purports to decrypt native Cicada-style English over the entire unknown manuscript. A proponent must first reconcile the specific two-rune OF/IF deficit with an independently sourced plaintext register, legitimate word-boundary transform or original author-specified escape. This does **not** disprove the general 28-nonzero-step chain class, keyed substitution with a different reserved symbol, non-English ciphertext payload, or printed spaces as control syntax. The observation informs decoder selection without pretending to solve any unknown page.
