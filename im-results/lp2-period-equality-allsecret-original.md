# Whole-book and section-clock periodic substitution: exact equality gate

**Agent 15, 12 November 2026.** A key-independent original-input restriction that applies to an entire cipher family. **No authentic LP2 plaintext or key is recovered.** The result makes source-less short repeating-key hunts lower priority in favor of a source-specified stateful/nonperiodic operation or a changed plaintext register.

## The reversible family and unavoidable equality invariant

Take original unsolved LP2 p0–55 as a continuous GP29 sequence of **12,956 runes**, or preserve one of two visible reset contracts (nine original manuscript sections; 56 physical pages, one without rune content). For an arbitrary unknown period `T`, assume an exact same-length plaintext of native GP29 symbols and let every phase `r = i mod T` have its **own completely arbitrary secret 29-symbol bijection** `sigma_r`. It may be any keyed substitution, not necessarily additive, and can reset at a section or physical page.

When two positions lie in the same reset segment at distance exactly `T`, they use the **identical secret bijection**. Therefore the original ciphertext must preserve their equality regardless of `T × 29!` potential secret tables:

`C[i] == C[i-T]  iff  P[i] == P[i-T]`.

This yields an original-input test before finding keys, cracking word boundaries, or choosing a score-optimizing alphabet. An unknown fixed outer rune permutation does not change the equality invariant. The proof does **not** cover within-period key drift, position-dependent rejection or insertion, nonbijective mappings, a secret state that changes between phase visits, or an intermediate binary/non-native register.

## Original source, native comparison, outcome

The [single-file Node22 SFT](../sims/lp2_period_equality_allsecret_original_sft.cjs) uses the exact original `resources/liber-primus/lp2-corpus.json`, fixed nine-section global rune cuts `[0,729,1874,3603,5506,6527,7960,9640,12648,12956]`, and all 56 physical page lengths including runeless p50. The controls tokenize *actual* source text into the standard GP29 alphabet with historical digraphs, from [Shakespeare](../resources/control/shakespeare_first300k.txt) and [Gibran](../resources/control/gibran_prophet_58585.txt). For each source, five fixed, nonoverlapping **12,956-rune** intervals are compared at every equal phase-period against the original. The starts are Shakespeare `[20000,56000,92000,128000,164000]` and Gibran `[1000,11000,21000,31000,41000]`. Controls are genuine source-native text, without fitted or arbitrary scrambled plaintext.

| Original clock | Every tested period T | Original-vs-native same-lag comparisons | Cases with source rate ≤ original | Smallest source-minus-original proportion |
|---|---:|---:|---:|---:|
| Book-continuous | 1–6,000 | **60,000** | **0** | **+0.00123514** (T=2) |
| Nine source sections, phase resets | 1–1,000 | **10,000** | **0** | **+0.00131396** (T=2) |
| Original physical pages, phase resets | 1–250 | **2,500** | **0** | **+0.00116768** (T=2) |
| **Combined** | | **72,500** | **0** | |

The largest original whole-book same-lag equality is **298/7,106 = 0.0419364**, at lag **5,850**, while the smallest originally recorded native-control margin at the *same matched lag* remains positive. The minimum difference is small at lag2, so **these are finite control comparisons rather than a deterministic impossibility for every conceivable authored English passage**. The distinction matters: source-control runs give an empirical register condition, and neither a source-text prior nor a prefix-length bound is part of the mathematical equality theorem.

The planted control assigns independent pseudo-random 29! bijections at **every phase**, separately for book period464, section period128 and page period37. In all three, the implementation encrypts native source text, recovers **12,956/12,956 exact plaintext runes** using the inverse tables, and preserves the full-period equality count exactly. This proves the measurement has power against a genuine phase-periodic substitution without assuming the key or its form.

## Cryptanalytic decision

For **ordinary source-native GP29 prose** with unchanged segmentation, none of the original whole-book periods 1–6,000, section-reset periods 1–1,000, or physical-page-reset periods 1–250 is supported by the native controls. A single period with an arbitrary secret substitution at *every phase* cannot conceal its equality frequency, so introducing more key candidates, affine multipliers or ciphertext-dependent key selection does not rescue this exact class. The near-complete lack of original rune equality relative to native prose persists even when every position in the repeating period has its own unrelated 29! table.

Research should seek a **source-identified nonperiodic/evolving state**, an insertion/deletion/rejection transport, an external long pad, or independently motivated non-native plaintext framing. Genuine recovered original plaintext would supersede these empirical source controls; none is currently recovered.
