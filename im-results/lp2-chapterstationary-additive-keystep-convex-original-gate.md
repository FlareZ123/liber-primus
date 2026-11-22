# Chapter-stationary additive key increments: a convex source-native exclusion

**Agent 44, 17 November 2026. Classification:** Exact original-cipher statistic, analytic expectation bound, and finite matched native-English test. **No new unknown LP2 plaintext, key or historically authenticated cipher is recovered.**

## Source-selected question and architecture

The original 55 rune-bearing LP2 pages p0–55 have **12,956 GP29 ciphertext runes** and only **86 adjacent equal pairs in 12,901 same-physical-page rune transitions**. Earlier work proved that completely uniform independent GP29 key residues predict far more immediate repeats; the present test asks a *materially more permissive* cryptanalytic question: could any **secret, arbitrarily biased additive key-increment distribution** explain these repeats, with a separate unknown distribution in each of the nine visible original chapters?

This includes a direct GP29 running key, a stationary-step random walk or a plaintext-independent chapter-wise PRNG modeled as independent but arbitrarily distributed increments. It does **not** require a key seed, marginal distribution, numerical table interpretation, or linguistic score. The key weakness is the **iid-within-chapter and plaintext-independent** increment hypothesis. A deterministic key cycle with complicated dependence, key steps reacting to plaintext or ciphertext, a new distribution at every physical page, alternate symbols/registers and non-English plaintext are outside this test.

Let the true native GP29 plaintext and additive key on a same-page transition obey

\`C_i = (P_i + K_i) mod 29\`, and write \`ΔC_i=(C_i−C_(i−1)) mod29\`, \`ΔP_i=(P_i−P_(i−1)) mod29\`, \`D_i=(K_i−K_(i−1)) mod29\`.

For each original chapter h, allow **every probability vector** \`g_h[0..28]\` for independent key increments D, chosen without observing the plaintext. A repeated ciphertext pair occurs precisely when \`D_i=−ΔP_i (mod29)\`. If \`N_h(r)\` is the true plaintext-difference histogram over all same-page transitions in that chapter, then

\`E_g[R_h | P] = Σ_(r=0)^28 N_h(r) g_h(−r) ≥ min_r N_h(r)\`.

Thus **no possible selection of chapter-stationary increment probabilities can reduce the *expected* number of ciphertext repeats below**

\`μ_min(P) = Σ_(nine chapters h) min_r N_h(r)\`.

The inequality is an elementary convex-hull bound: a weighted mean of the 29 observed plaintext-difference counts cannot be smaller than their minimum. It applies to arbitrarily biased distributions, and makes no reference to the unknown GP29 mapping of the key. Conditional on a fixed plaintext and independent increments, pair-equality indicators are independent Bernoulli random variables, allowing a conservative Chernoff tail bound for one unexpectedly low observation. The expectation bound alone is **not a deterministic contradiction** with an observed 86 repeats.

## Exact untouched source operands

The canonical [LP2 rune corpus](../resources/liber-primus/lp2-corpus.json) and [original page/word transcription](../resources/liber-primus/lp2-transcription.txt) are read without changing the original page or rune order. Physical p50 is rune-free and lacks a transcription part: the independent test explicitly restores the +1 physical page index after it. All **12,956/12,956 original rune indices** are checked against the source corpus, by physical page. Printed-line continuations are joined; a word crossing a physical page is retained as two page-local fragments because the key model measures within-page transitions. This gives **2,928 page-local text segments** corresponding to the independently established **2,896 complete words plus 32 page carries**.

The nine fixed original illustration-determined chapters, and no tuned ciphertext cuts, give:

| Physical chapter | Same-page transitions | Actual identical ciphertext pairs |
| --- | ---: | ---: |
| p0–2 | 726 | 4 |
| p3–7 | 1,140 | 6 |
| p8–14 | 1,722 | 9 |
| p15–22 | 1,895 | 10 |
| p23–26 | 1,017 | 11 |
| p27–32 | 1,427 | 13 |
| p33–39 | 1,673 | 12 |
| p40–53 | 2,995 | 18 |
| p54–55 | 306 | 3 |
| **Total** | **12,901** | **86** |

The original GP29 difference histogram across these same-page transitions is
\`[86,457,503,436,435,445,430,470,425,510,497,454,443,499,470,468,446,401,432,472,467,460,420,485,466,466,456,472,430]\`.
Its whole-book and nine-chapter minimum histograms both total **86**; granting a fresh independent distribution at **each physical page** reduces its own sum of minimal bins to **81**.

## English control register and decisive result

To assess the additive-increment mechanism as an inverse of **ordinary GP-native English in the unchanged original word/page geometry**, construct precisely length-matched natural-language controls from three independent source files already in the repository:

- Shakespeare, [first 300k bytes](../resources/control/shakespeare_first300k.txt)
- Gibran, [The Prophet](../resources/control/gibran_prophet_58585.txt)
- Emerson, [Essays](../resources/control/emerson_essays_2944.txt)

Each source's English words are normalized to the published GP29 transliteration and grouped by their GP29 rune length 1–14. A seeded sampler fills **every one of the 2,928 original page-local segments** with an intact GP-native word of identical symbol length, preserving all 12,956 rune positions and each original physical page. The controls represent native English with exact original *local-segment* lengths, while their sampled page-carry fragments need not belong to one English word across the page seam. This approximation affects just 32/2,928 local boundaries; no claim is made about literal preservation of English page-carry spellings. No cipher output, key or dictionary score is optimized.

Two **predefined** spelling modes are tested per source: the ordinary GP transliteration; and the already source-attested \`ING→NG, IO→IA\` runic spelling convention. Each of the six control families receives **320 deterministic seeded samples**, for **1,920 complete original-shaped source-language controls**.

Each range below is the **exact minimum and maximum over the 320 controls** of the smallest *conditional expected ciphertext repeat count*, when the relevant scope receives every possible unknown key-increment distribution:

| English control | One global distribution | Nine chapter distributions | Fresh distribution per physical page |
| --- | ---: | ---: | ---: |
| Shakespeare, ordinary | 164–242 | **159–219** | 86–125 |
| Gibran, ordinary | 154–224 | **146–204** | 78–118 |
| Emerson, ordinary | 177–243 | **161–222** | 88–123 |
| Shakespeare, attested spelling | 172–248 | **157–225** | 85–124 |
| Gibran, attested spelling | 149–225 | **139–201** | 77–115 |
| Emerson, attested spelling | 175–244 | **160–215** | 85–127 |

**Key-free finding:** Across all 1,920 source-matched controls and all independently selected, arbitrarily biased GP29 additive key-increment distributions *per illustrated chapter*, the **minimum expected** number of ciphertext equal-adjacent events is **139**, compared with the **86 observed**. The minimum over the six source registers is 139, not a fitted best-case key. If all increments are independent conditional on the control plaintext, the standard lower-tail exponential Chernoff bound for any control in this finite set is

\`Pr(R≤86 | fixed native control P, any chosen chapterwise g) ≤ exp[−(139−86+86 ln(86/139))] = 8.218611926×10⁻⁶.\`

The probability statement is explicitly **conditional** on the finite reference plaintext set, independence and fixed scope, and does **not** measure the probability Cicada used this cipher or that the unknown text is English. An adversarial deterministic key stream, state-dependent shuffle, transposed text or changed GP register could evade the bound.

**Important surviving rival:** The last table column has **source-native page-specific expected minima as low as 77**. Therefore the analogous *page-rekeyed* class is **not excluded** by the original 86 repetitions; neither are per-word resets, time-changing distribution, dependent increments, or non-additive stateful emitters. This contrast changes the next cryptanalytic choice more concretely than further parameter sweeps of chapter-stationary seeds.

## Controls, reproduction, and next decision

The [single-file original-source Node22 CommonJS SFT](../sims/lp2_chapter_stationary_additive_convex_sft.cjs) asserts every physical page's original ciphertext, complete histogram, original chapter boundaries and all six frozen source-range vectors. It separately uses a **real additive cipher with page-local key K_i=11i mod29** to encrypt and exactly decrypt a native GP29 plant. That plant verifies the expected modular rotation of all 29 ciphertext-difference bins under a known key. The 1,920 control samples themselves require no decryption or secret-key reconstruction. **No GitHub Actions pass is asserted here until an independent workflow run confirms one.**

**Research decision:** Retire the **within-chapter iid, plaintext-independent additive increment model** as a plausible direct ordinary-GP-English explanation across the tested source register; it cannot make 86 repeats typical for any chapterwise increment distribution, even with the true key unknown. Prioritize a separate author-selected key reset or operation at each physical page, or a genuinely dependent/state-changing emission rule selected by the original manuscript. Test any proposed decoder against complete held-out original text and require source-native reencryption and prose; the present statistic cannot by itself recover the key or words.
