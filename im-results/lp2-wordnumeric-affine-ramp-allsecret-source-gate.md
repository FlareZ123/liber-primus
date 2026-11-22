# LP2: original word-number directions do not explain the ciphertext via a word-local affine ramp

**22 November 2026 · Agent8 · Bounded original-cipher necessary-condition decision. No newly recovered unknown plaintext/key.**

**Executed, independently hosted Windows Node.js 22 result: [GitHub Actions run 45027473260, PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45027473260).**

## Why this mechanism was worth testing

The authentic 2016 signed hint says that Liber Primus's *words are the map* and their *numbers are the direction*. Historical Cicada work used exact Gematria Primus rune-prime sums, the p7 red-word **index products**, and the solved p56 prime-totient operation. The unknown LP2 ciphertext preserves **2,896 printed words** and is unusually close to unigram-uniform while strongly suppressing adjacent equal runes. These features make a simple **word-number-driven changing offset** more plausible than another stationary per-word substitution. One affordable, human-readable mechanism is an **affine ramp within each word**, possibly with an arbitrarily complicated or secret word-initial key:

\[
C_{w,j}=P_{w,j}+A_w+jg_w\pmod{29}.
\]

Here `A_w` may be an **independent unrestricted secret GP29 offset for every one of the 2,896 words** and may depend on previous ciphertext, keys or unseen source material. `g_w` is the per-rune direction selected from a word's observable number. This model can independently eliminate many ciphertext adjacent equalities without needing a huge prime-key dictionary. The genuine signed message **does not explicitly prescribe an affine ramp**; this is a tightly constrained candidate operation, rather than an authenticated Cicada instruction.

## Exact key-independent test

For each of the **10,060 within-word adjacent positions**, the unknown initial key cancels:

\[
(C_{w,j}-C_{w,j-1})\bmod29
=
(P_{w,j}-P_{w,j-1}+g_w)\bmod29.
\]

This identity holds for *every possible* collection of secret \(A_w\). Thus after subtracting the proposed source-fixed slope \(g_w\), the full **29-bin within-word difference histogram** must have the profile of original GP29 plaintext if this family alone exposes author-style English. We test that necessary condition, rather than guessing English sentences or optimizing independent word keys.

The source input is the unchanged pp0–55 runic transcription (12,956 glyphs, 2,896 complete words; physical cross-page and line-wrap joins retained). The independent reference consists of **nine published, actually solved native-GP29 texts** totaling 2,979 runes in 740 original words and 2,239 within-word differences. The score is the standard *two-sample* 29-bin chi-square homogeneity statistic, which includes sampling uncertainty in both sets; 28 nominal degrees of freedom. Because adjacent pairs share letters and author's register may differ across genres, no exact IID p-value is asserted. The large numerical separation itself is used as a discriminating necessary-condition result.

The frozen model family comprises:

- Every one of the **29 constant slopes** \(g=0,\ldots,28\), leaving all initial word offsets arbitrary.
- The printed word's **GP-prime sum/product mod29**, **GP ordinal-index sum/product mod29**, **prime totient sum/product mod29**, or **rune length mod29** as \(g_w\), taken from either the *current* original ciphertext word or the *preceding* original ciphertext word, in either sign: **28 exact source-number directions**.
- The preceding-word GP-prime sum variant starts with the period 761 mod29, while a preceding-word product starts with its empty-product identity 1. Other first-word source registers start at 0. The preceding-word models are fully causal/reversible when secret offsets are supplied; for current-word-derived slopes, only the stated necessary condition is claimed, since current-word checksum feedback could make an encoder ambiguous. The genuine p7 word products motivate testing products, but no historical source explicitly says to use them as an affine slope.

**Original results:**

| Original transform (all initial word keys unrestricted) | Two-sample \(\chi^2\) against authentic GP-native plaintext |
| --- | ---: |
| Best of **all 29** constant slopes: +22 | **308.105703** |
| Best of 12 source word-numeral directions: **+ current printed word length** | **301.654324** |
| Next: − current GP-prime product | 329.627578 |
| Next: − current GP-prime sum | 331.169860 |
| Next: − preceding GP-prime sum | 340.496909 |
| Next: − current GP-index sum | 345.245323 |
| Next: + current GP-index sum | 347.060629 |
| Worst source word-numeral direction: + current GP-prime sum | 377.019641 |
| Unchanged original word differences | 409.836824 |
| **Actually native GP29 plaintext plant** preserving all 2,896 original word lengths | **8.854051** |

All **57** original source-declared consumers stay drastically unlike the native GP29 reference. In particular the extreme shortage of identical neighbors cannot be undone into realistic native word-internal differences by any single global increment, and the source-derived **current/preceding word prime/index/totient sum/product and length clocks** likewise fail. The original has **63** equal within-word adjacent runes of 10,060; the raw GP29 solved texts have **53** of 2,239.

## Positive controls and source limits

The [single-file, read-only CommonJS reproducer](../sims/lp2_wordnumeric_affine_ramp_allsecret_source_sft.cjs) does **not** rely on a language model or ad hoc rune transliteration. It first resamples authentic solved GP29 *complete words matched to every one of the 2,896 original word-length slots*, obtaining exactly 12,956 real source-native symbols and \(\chi^2=8.854051\) against the independently listed native reference. It then encrypts that control under **all fourteen preceding-word source-number variants** (seven numerical types and both slopes), with 2,896 independently generated hidden offsets, and deterministically recovers the entire **12,956/12,956** source-native plaintext for each. In every positive, removing the true drift returns the original 29-bin native difference histogram **exactly**. The forward and backward procedures retain every native GP rune, including F, and word length, with no synthetic spelling or punctuation edits.

**Three independent English-register holdouts:** The reproducer also projects Gibran, Emerson and Shakespeare into the *exact same 2,896 source word-length slots*, using a historical GP29 spelling convention that is checked against the **entire 95/95 original clear p57 rune sequence**, including the `ING→NG` single rune. It evaluates the same **57 fixed models** without fitting either the unknown manuscript or the control texts. The strongest of all 57 cases for each control is still decisively nonnative:

| Word-length-matched GP29 control (12,956 source-derived GP runes each) | Best original \\(\\chi^2\\) across 57 fixed candidates | Best model |
| --- | ---: | --- |
| Gibran, *The Prophet* | **722.74** | Global +11 |
| Emerson, *Essays* | **741.06** | Global +22 |
| Shakespeare, original corpus slice | **895.64** | Global +11 |

The 740-word actually solved Cicada reference remains the *least* discordant baseline with min \\(\\chi^2=301.654324\\). These holdouts address one concrete rival explanation that the original manuscript simply uses a different literary register. They are comparative English-language evidence; this does not prove the unknown text is English, and it cannot exclude other within-word algebra.

The all-secret cancellation theorem is mathematical. The *linguistic rejection* is conditional on unknown pages eventually representing ordinary, word-length-preserving native GP29 English with adjacent-difference structure comparable to the published solved sections. It does not exclude non-English words, dynamically changing \(A_{w,j}\), different word segmentation, non-additive state, position-dependent independent slopes, encrypted GP rune identities or other value-changing transforms. No true unknown-page sentence, creator-selected key or final address was recovered.

**Research decision:** retire literal source-word-number **affine direction ramp** models with a single fixed secret offset per word. If a future original clue prescribes a stronger operation, it must specify how its within-word output changes beyond a simple `j×g_w` drift and predict independent untouched original text. This test does not authorize scanning free nonlinear clocks or restoring already-rejected stationary substitutions.

**Reproduce:** `node sims/lp2_wordnumeric_affine_ramp_allsecret_source_sft.cjs` (Node.js 22, Windows 11 compatible). The script asserts the original data dimensions, exact scores and full-length original-shaped native positive controls.
