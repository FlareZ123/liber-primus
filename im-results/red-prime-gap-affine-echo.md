# Original red page-40 heading selects the manuscript's six-lag affine echo: an exact but retrospective clue link

**Classification:** new, source-constrained *arithmetic interpretation* of two previously established and independently published observations. Its cryptographic meaning is provisional. **No original LP2 rune plaintext, cipher key, reversible state schedule, or continuation address has been recovered.**

## The exact source-to-cipher construction

Use the corrected original-image red annotation in [lp2-ink-annotations.json](../resources/liber-primus/lp2-ink-annotations.json), physical **LP2 page 40**, start 0, length 8, red glyphs **ᚠᚾᛗᚣᚷᛞᚫᚻ**. Its assigned GP prime weights sum to **435**. The integer quotient **435 / 29 = 15** selects the zero-based GP rune **ᛋ (S)**, with assigned prime **53**.

That indexed prime is the exact midpoint of three **consecutive GP-assigned primes**:

    p[14] = 47, p[15] = 53, p[16] = 59
    d = 53 - 47 = 59 - 53 = 6
    T(x) = (p[15] - p[0]*x) mod 29
         = (53 - 2*x) mod 29
         = (24 - 2*x) mod 29.

Taking the common prime gap as word-local lag **6** gives the **exact same** transformation originally isolated by external Cicada researchers:

    C[word,i] = T(C[word,i-6]), for i >= 6.

The red-quotient index **15** is simultaneously the independent five-back-echo rune already reported as unusually recurrent: **11** instances of **ᛋ** to **ᛋ** over **74** eligible antecedent-ᛋ positions within complete ciphertext words. This additional match identifies a common source rune but supplies no mechanism or explanation for the five-back relation.

Crucially, this is an **interpretation made after both p40's arithmetic pointer and the T6 echo were known**. The formula's lack of adjustable coefficients is mathematically useful; its exact fit does **not** create an independently pre-registered discovery. GP-prime slope 2 is the first assigned prime and was selected while constructing this interpretation.


### Additional red-source finite-field factorization

The eight-rune page-40 red heading ends with **ᚻ**, GP index **8**, which is the fixed point of the known lag-six map. The quotient **15** is a primitive root of the field of 29 elements (order 28). The manuscript also contains **31 large 13-dot glyphs**; exponent **13** gives **15¹³ ≡ 27 ≡ −2 (mod29)**. The known T6 transformation can consequently be written as

    T(x) = 8 + 15^13 × (x − 8) = 24 − 2x (mod29).

This is a *postselected* source arithmetic factorization, not a recovered key. The common 13-dot punctuation does not occur in the selected page-40 red heading, and no independent authorial instruction identifies 13 as an exponent. Its source specificity and genuine cipher relevance remain uncertain.

## Exhaustive competing equal-prime-gap centers

There are exactly **two** centers with equal preceding and succeeding gaps among all 29 assigned GP primes:

| Center zero-based GP index | Prime triple | Gap and tested lag | Test map | Original LP2 matches |
| --- | --- | ---: | --- | ---: |
| 2 | 3, **5**, 7 | 2 | (5 − 2x) mod29 | **230 / 7,247** |
| **15** (page-40 red quotient) | 47, **53**, 59 | **6** | **(53 − 2x) mod29** | **80 / 1,290** |

The canonical source contains **2,896 intact words** and **12,956 runes**; all 32 source page-spanning words remain intact. Physical page 50 contains only numerical material and is not substituted for a rune-bearing page.

Using **1,500** independent whole-corpus word-level permutations (seed **0x33011553**), each word retains its exact rune inventory, length and adjacent-doublet count. The conditional permutation means and standard deviations are:

| Center | Observed | Null mean ± SD | Standardized score |
| --- | ---: | ---: | ---: |
| 5, lag 2 | 230 | 242.1787 ± 14.5822 | −0.8352 |
| **53, lag 6** | **80** | **46.0340 ± 6.4359** | **+5.2776** |

No permutation reached the observed selected-center count or the observed largest standardized deviation among these two models. The finite two-model maximum tail, with the add-one convention, is **1/1501 ≈ 0.0006662**. The existing much larger **5,684-affine-model and seven-lag search** instead reports **13/1001 ≈ 0.012987** family-corrected probability for the same original T6 anomaly, showing why retrospective selection matters. See the [published affine-echo analysis](lag6-conditioned-echo.md).

A separate exact control circularly moves the eight-rune red window through all **231** rune starts on physical page 40, preserving that page's rune sequence. The actual start **0** is the **only** start with prime sum **435**; **8/231** starts have *any* prime sum divisible by 29. These proportions are descriptive **source-conditioned** frequencies for an already selected target, not discovery-controlled probabilities.


## Exclusive literal GP-S marker: length-matched word-role falsification

The page-40 prime quotient indexes GP **ᛋ (S)**. A concrete exact reversible cipher hypothesis reserves the six-back affine output as an exclusive literal plaintext S at every word position six or later and maps the other 28 GP symbols bijectively to the other 28 output runes. If original printed ciphertext word boundaries are plaintext boundaries, **every** T6 equality must occupy a genuine GP S position. This is a necessary condition independent of the unknown bijective keys for the other 28 symbols.

In the actual original 2,896 words, **559** have at least seven runes and contain **1,290** eligible T6 positions. Their **80 matches** are **32 final, 28 penultimate, 20 earlier**. The independent source control samples each word length with replacement from original GP-encoded prose, including the 796-word editorial-cleaned solved-Cicada source. Exact Poisson-binomial distributions supply the word-final and word-penultimate tails:

| GP source | Expected late S, all positions | Expected word-final S | Exact P(final ≤32) | Expected penultimate S | Exact P(penultimate ≥28) |
| --- | ---: | ---: | ---: | ---: | ---: |
| Solved Cicada | 59.68 | 51.01 | 0.001226 | 1.33 | **0 from this finite source vocabulary** |
| Shakespeare | 210.57 | 167.41 | **8.04×10⁻⁴⁸** | 17.68 | 0.01164 |
| Gibran | 148.69 | 108.30 | **1.05×10⁻²⁰** | 27.18 | 0.46341 |
| Emerson | 175.52 | 133.77 | **4.47×10⁻³¹** | 21.92 | 0.11032 |

The finite solved-author reference has a penultimate S among eligible GP word lengths only in *CONSCIOUSNESS* (13 GP runes). Since the original contains four 13-rune words, at most four eligible late S markers can occur at the penultimate position under word sampling from **that particular vocabulary**. This zero-tail is a finite-sample support limitation, not a universal fact about English. An alternative GP ING alias gives similarly small word-final tails: 0.000753 solved-Cicada; **4.57×10⁻⁴⁶** Shakespeare; **8.34×10⁻²²** Gibran; **1.25×10⁻³¹** Emerson.

The updated [exact CommonJS source-and-original reproducer](../sims/red_prime_gap_affine_echo.cjs) includes a lossless 29-output reserved-S forward/inverse example. Planted Shakespeare words matched to all 2,896 original word lengths recover **12,956/12,956** GP runes and have marker identity at every eligible position. This power control checks the necessary marker relationship; ordinary inverse reencryption cannot establish an authentic key or cipher. The observed role profile is decisively inconsistent with **an exclusive six-back plaintext S marker under preserved English word boundaries**. A different plaintext register, independent boundary segmentation, a non-S T6 event, or a collision-repair transducer remains open.

## What this does and does not establish

The selection p40 red quotient→GP index15→prime53→equal prime gap6→mod29 affine echo is fully specified and reproducible. It links previously separate arithmetic and original-ciphertext observations and suggests a concrete *source-motivated mechanism to challenge*: the six-position echo may be produced by a stateful operation whose coefficient and lag are the prime-centered source values.

It remains possible the arithmetic is coincidental. The known T6 echo is word-local, has **80/1290** matches, and has already been modeled as a hypothetical collision repair. The broader **five-back S** concentration and **five-back repeated digraphs** are currently not explained jointly by that simple repair model. No original plaintext is recovered by applying T, because knowing a sparse ciphertext recurrence alone does not determine the underlying plaintext or pad.

An exact reversible reserved-S forward/inverse example now exists, but its word-position requirements fail against native GP text at the published word boundaries. Productive next work needs an independently determined hidden state, alternate true-word segmentation, or source-constrained collision-repair mechanism that predicts unseen original ciphertext. Mechanical inverse reencryption alone cannot authenticate an original key.

## Reproduction and source boundaries

[Source-locked CommonJS reproducer](../sims/red_prime_gap_affine_echo.cjs), run using Node.js from the repository root. It asserts the original red span, page40 source positions, the two exhaustive equal-gap triples, **230** and **80** original hits and the exact 2,896/12,956 corpus counts before doing the seeded 1,500-manuscript null. Set the optional environment variable LP2_TRIPLET_REPS to increase the null replicate count. The matched-null execution was performed directly against the live repository's original corpus and complete-word transcription.

Related established observations: [red page40→15→53 pointer triangle](red-span-triangle.md), [lag-six affine echo](lag6-conditioned-echo.md), [lag-five S echo](lag5-rune-specific-echo.md), [joint forward-model limitations](lp2-forward-generator-joint.md). Treat those as source measurements with their original selection caveats; this report adds a unified clue interpretation and its bounded two-center comparison.
