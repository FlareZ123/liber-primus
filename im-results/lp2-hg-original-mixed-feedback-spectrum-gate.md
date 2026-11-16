# Source-anchored H/G hybrid feedback: full original-LP2 inverse and key-independent digram test

**Classification:** finite, bounded negative on original encrypted LP2. Tested 16 November 2026, Agent18. **No previously unknown LP2 plaintext, key, or destination has been recovered.** This is an additional, distinct possible consumer of the original-source H/G coefficients, not a claim that Cicada selected the consumer.

## Clue and exact reversible model

The signed original 2013 BASE29 example \`3301=3QO\` supplies GP29 coefficient triad **H = [3,26,24]**. Original p39 prints the red GP triad **G = [27,5,15]**. Their product divides the original p49–51 grid polynomial over GF29 exactly, as independently established by [the full factorization](lp2-grid-complete-gf29-factorization.md). The cryptanalytically useful question is whether those two *actually source-derived* triples could describe a compact cipher state.

A distinct state model worth a single frozen test is a joint ciphertext/plaintext recurrence

\[
C_i=C_{i-1}+aP_i+bP_{i-1}+c\pmod{29},\qquad a\ne0.
\]

The inverse is \`P_i=a^-1(C_i-C_(i-1)-bP_(i-1)-c) mod29\`. It uses the preceding **ciphertext** and the previously recovered **plaintext**; previous all-secret tests of ciphertext-only two-tap feedback, plaintext-only first-order feedback and literal difference-to-symbol lookups have different state laws. The two coefficient triples above and their two literal reverse orders give **four** fixed choices. We allow a completely unknown one-rune plaintext initialization at every model reset (**all 29** values), and test three boundaries separately: one whole-book state, each of **55 actual rune-bearing physical pages**, or the **nine original illustrated/red-headed visual chapters**. Every variant consumes and reproduces the unchanged source runes; no padding or rune edits are allowed.

**Causal limitation:** H and G are authentic numbers, but **no source says to treat them as these particular three recurrence parameters**, use a previous-plaintext state, or choose this initialization/reset rule. Successful re-encryption alone would not establish a decipherment.

## What the original rune tape says

The input is the exact **12,956** GP ciphertext indices from physical LP2 pp0–55, retaining every page, word and rune. The directly measured ciphertext difference histogram contains **86 zero increments** among 12,955 whole-stream rune transitions. Literal forward/inverse passes exactly recover **12,956/12,956** original ciphertext indices for all four source triples and all three resets when the decoder's initial values are used.

For **all 29 possible initialization values for each of the 12 defined coefficient/clock cases**, the maximum recovered plaintext GP29 index of coincidence is **0.03454227823793121**, achieved by forward G with uninterrupted global state and initial value 9. The same source cipher applied to genuine, unchanged Gibran text with the identical 12,956-rune length has plaintext IoC **0.06012609969032139**, and the exact inversion restores every original native GP token. Every one of the 12 source-coefficient inverse cases produces effectively uniform marginal runes; no readable unknown-page original plaintext emerges. Independently permitting one source triad and seed per original visual chapter gives maximum IoCs **0.03565, 0.03572, 0.03484, 0.03488, 0.03512, 0.03497, 0.03493, 0.03470, 0.03697** respectively, still with no authentic plaintext or selected state.

## Key-independent gate on the entire affine triple family

An even stronger necessary condition avoids fitting or guessing plaintext output. Under this recurrence, the *observed* original increment distribution must match the native plaintext digram distribution after the fixed mapping \`D_i=aP_i+bP_(i-1)+c mod29\`. The unknown first-rune value cancels; coefficient \`a\` has **28** legal values, and \`b,c\` each have **29**, yielding exactly **23,548** distinct combinations. The test exhausts all of them independently against three GP29-encoded native English sources with historical \`ING\`/\`IO\` contraction and established Latin-letter normalization.

| Independent native reference | Native GP runes | Best possible source-shape Pearson chi-squared (29 bins) | Best triple (a,b,c) | Expected zero steps for this best fit |
| --- | ---: | ---: | --- | ---: |
| Gibran, *The Prophet* | 62,492 | **501.176417** | (14,12,28) | 275.31 |
| Emerson, *Essays* | 321,327 | **497.315825** | (14,12,28) | 297.14 |
| Shakespeare sample | 217,106 | **482.136498** | (14,12,28) | 285.65 |
| **Untouched LP2** | **12,956** | | | **86 observed** |

These are minimized *after searching the entire affine triple class* on each source, and the actual original increments are compared without fitting a ciphertext key. At the literal **2013 H** coefficients, the native references instead predict **371.50–406.24 zero increments**; at **2014 G**, **634.16–687.54**, all compared with the original 86. The exhaustive best triples remain far from the original even with free coefficient selection.

A complete **positive** uses the first 12,956 real GP-native Gibran symbols, enciphers with **H=(3,26,24)** and uses the exact same full 23,548-triple scan and reference distribution. The recovered best key is **exactly H** (global rank one), Pearson chi-squared **66.60573141008082**. The inverse also recovers every planted rune exactly. This checks that the statistic can identify an independently known true member of the family rather than merely produce a null due to a flawed implementation.

The chi-squared values are **descriptive distances**: real-language digrams are dependent, the reference books are finite and not assured to match the author's plaintext language, and searches over many triples alter conventional null calibration. These values are not quoted as calibrated p-values. The 23,548-triple spectrum test assumes continuous output increments; a page- or chapter-start IV may change the ≤54 or ≤8 seam increments, so the separate inverse tests address those resets directly. A changing coefficient or non-native plaintext alphabet is outside the finite family.

## Decision and reuse

**Retire this explicitly tested hybrid H/G recurrence and the complete continuous affine-digram class as direct, single-rune-per-rune GP-English inverses of the present original ciphertext.** The original table factorization remains exact; this test leaves it intact, without inferring a decrypting consumer. Do not optimize hidden starts, adjust the triads to language, or append another unmotivated second layer. A successor should require an independently authored transition or a genuine original unknown-page plaintext anchor.

[Standalone Windows Node22 CJS reproducer](../sims/lp2_hg_mixed_cipher_plain_feedback_sft.cjs) reads the existing original corpus and three pinned native reference texts, searches the complete finite coefficient space, round-trips the source and positive-control ciphertext, and asserts the numerical output.
