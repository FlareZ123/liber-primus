# All-secret shifted multiplicative GP29 cipher: fixed-symbol original word-role gate

**Intermediate, conditional negative.** 22 November 2026. Original unknown LP2 plaintext or key has **not** been recovered. This investigation tests one necessary algebraic feature of a broad nonstationary cipher and compares it with source-native English; it does not prove that the unknown prose uses the sampled authors' word distribution.

## A reversible family that cannot hide one symbol

Consider every GP29 encryption satisfying

\[
C_i = y + a_i(P_i - x)\pmod{29}, \qquad a_i\in\{1,\ldots,28\}
\]

for **any** secret multiplicative stream \(a_i\), including completely independent high-entropy multipliers at every rune. The plaintext anchor \(x\) and ciphertext anchor \(y\) are constant throughout the original source, but both are unknown. An optional stationary output permutation merely changes the name of \(y\). Because all \(a_i\) are invertible modulo the prime29,

\[
C_i=y \iff P_i=x.
\]

This *exactly* preserves one rune's complete occurrence mask across the 2,896 source words. A correct decoder given the secret \((x,y,a_i)\) is \(P_i=x+a_i^{-1}(C_i-y)\pmod{29}\). No assumptions on keystream entropy, period, page reset, indexing, glyph F, or secret multiplier generator are required for the fixed-point invariant.

The source clue "the primes are sacred" makes operations in GP29 a conceivable exploration; the manuscript **does not specify this affine multiplicative encryption**. The family is separate from [the earlier only-zero fixed-point bound](../sims/lp2_gp29_multiplicative_zero_allsecret_sft.cjs), which excludes native plaintext F (index0), and from [the prior ciphertext-difference reserved-marker test](../sims/lp2_fixed_reserved_rune_doublet_gate_sft.cjs). Here **all 29 plaintext anchor choices × all29 ciphertext anchor choices** are tested under the direct-output invariant, with no finite limit on secret multiplier lengths.

## Original data and native calibration

The original physical LP2 p0–55 contains **12,956 ciphertext runes** and **2,896 complete source-printed rune words** (including **32 actual cross-page words**; the text source omits the runeless numeric p50). The original word lengths reach14 GP29 runes. There are **83 one-rune words**, and their ciphertext glyphs cover28 of29 symbol names; the only absent singleton is **C**. These are exact source-corpus observations, independent of any cipher theory.

For each candidate \((x,y)\), the script compares seven word-position counts for cipher glyph \(y\) with the expected counts for original-GP-spelled plaintext glyph \(x\) under the exact2,896 observed whole-word lengths:

1. Total rune occurrences.
2. Word-initial occurrences.
3. Non-singleton word-final occurrences.
4. Word-internal occurrences.
5. Words containing the rune at least twice.
6. Words containing the rune at least three times.
7. One-rune words containing it.

Three **independent authors' English sources** are used separately for model calibration: 300k Shakespeare characters (55,407 eligible word tokens), Emerson essays (77,911 tokens) and Gibran *The Prophet* (15,730 tokens). GP text normalization includes author-attested DIGRAPHS, **ING→NG**, **IO→IA**, QU→CW, V→U and K/Q/Z merges. Each source's expected count and standard deviation are calculated directly from its length-matched token pools. A candidate score is its largest standardized residual (max absolute \(z\)) among seven features, minimized across the three separate source models. **The best source is chosen post hoc**, making this an exploratory calibrated classifier rather than a prespecified hypothesis-test \(p\)-value. Do not translate it into a mathematical universal impossibility claim.

## Exhaustive observed decision

| Candidate source-native anchor \(x\to y\) | Best comparison model | Best max-\(|z|\) | Shakespeare max-\(|z|\) | Emerson max-\(|z|\) |
|---|---|---:|---:|---:|
| C→E | Gibran | 3.58677 | 6.93262 | 6.28593 |
| C→EO | Gibran | 4.02304 | 7.93842 | 6.78493 |
| M→EO | Emerson | 4.45482 | far higher | 4.45482 |
| C→F | Gibran | 4.45931 | 7.96949 | 7.28314 |

**Zero of841 original anchor pairs scored below3.0 standard deviations** on all seven features under even their most favourable of the three native models. The best x=C, y=E fails word-role agreement under every comparison source; fitting all pairs cannot identify a credible shared fixed-symbol mapping. The original’s best score lies within the range produced by a null stream of independent GP29 glyphs. This is a bounded *evidence against English-like direct fixed-anchor multiplication*, not evidence that LP2 uses an unconstrained random pad.

### Distinct controls and inverse recovery

Every planted control uses original authentic word-length positions, a sample of GP29-encoded words from one of the three literary sources, and a **new independent secret nonzero multiplier at every rune**. For each of the29 possible plaintext anchor names, a different fixed ciphertext anchor is chosen; 3×29 = **87 planted 12,956-rune ciphertexts**. Each plant independently encrypts and exactly decrypts every rune under the actual secret multipliers, including literal F and rune alphabet edge cases. On the 87 native plants:

- **86/87** true anchors scored below3.0.
- **80/87** true anchors ranked first among all841 pairs; every true anchor ranked in the top3.
- True-anchor median best-source max-\(|z|\) was **1.31168**; the sole model-based miss at threshold3 was **3.28537**.

A complementary **24-source-length matched iid-flat ciphertext control** gave minimum candidate scores from **2.42339 to4.89558**, median **4.03551**. The observed original best score **3.58677** lies within that negative-control range.

The [complete, original-GP29, read-only Windows Node22 SFT](../sims/lp2_gp29_allsecret_anchor_wordrole_sft.cjs) builds all841 candidates, tests exactly 87 known-plaintext source-length plants and24 flat negatives, computes seven source-native features, and verifies exact multiplicative forward/inverse. Its original-cipher arithmetic uses each original rune in reading order. It has no recovered key and does not reinterpret line wrapping as word breaks.

### Whole-word half-book transfer: can the closest anchor recover plaintext?

To check whether the full-corpus **C→E** resemblance contains a genuine, geographically stable plaintext marker, split the **2,896 original whole words** deterministically into first1,448 and last1,448 (no word is split). Fit each half independently using only its own source-native whole-word length counts; freeze the best pair and inspect the *other* half. This is an out-of-sample computation, although the anchor family was explored on the full corpus first and it is **not an externally blinded discovery**.

| Population | First half's best \((x,y)\), max-\(|z|\) | Second half's best \((x,y)\), max-\(|z|\) | First winner's rank in second half | Fixed C→E rank, first / second |
|---|---|---|---:|---|
| Original LP2 ciphertext | C→F, **2.09465** | C→EO, **2.09745** | **9** (score4.19985) | 2 / 4 |
| True C→E Shakespeare plant | C→E, **1.36546** | C→E, **1.84599** | **1** | 1 / 1 |
| True C→E Emerson plant | C→E, **1.29774** | C→E, **1.49627** | **1** | 1 / 1 |
| True C→E Gibran plant | C→E, **2.85647** | C→E, **0.92670** | **1** | 1 / 1 |

The original's first-half fitted cipher glyph **F** does not transfer to the second half, which independently favours **EO**. The full-corpus favourite **C→E** is comparatively near in both halves but never wins; its second-half fit reaches max-\(|z|=3.58637\). All three genuine anchored source-native controls chose **the same correct pair as the first-ranked option in both independent halves**. Therefore the candidate is insufficient to authenticate **any** original plaintext C at the positions of ciphertext E. Under this complete model, declaring those439 occurrences to be recovered plaintext would be unjustified.

## What changes next

A short unknown LP2 decryption by a changing multiplicative GP29 cipher with **one shared unshifted fixed point or affine anchor** is disfavored under plausible native-English word-preserving semantics. Any future candidate of this form should first show which genuine original clue selects \(x\) and \(y\), and why the original anchor's 2,896-word positional mask fails established English references. Work that replaces \(a_i\) with a secret high-entropy stream, varies its period, or permits page resets cannot repair this exact invariant. By contrast, changing the anchor from rune to rune, using a nonmultiplicative permutation, transposing symbols or changing word segmentation changes the model and remains untested here.

**Next decision:** prioritize an original-source-selected key or invertible operation whose symbol correspondences genuinely vary; use existing negative results before exploring unrelated arithmetic constants. No claim of an original LP2 plaintext fragment, authenticated historical key, or actual Cicada method follows from this experiment.
