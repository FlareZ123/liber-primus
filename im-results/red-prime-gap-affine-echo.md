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

## What this does and does not establish

The selection p40 red quotient→GP index15→prime53→equal prime gap6→mod29 affine echo is fully specified and reproducible. It links previously separate arithmetic and original-ciphertext observations and suggests a concrete *source-motivated mechanism to challenge*: the six-position echo may be produced by a stateful operation whose coefficient and lag are the prime-centered source values.

It remains possible the arithmetic is coincidental. The known T6 echo is word-local, has **80/1290** matches, and has already been modeled as a hypothetical collision repair. The broader **five-back S** concentration and **five-back repeated digraphs** are currently not explained jointly by that simple repair model. No original plaintext is recovered by applying T, because knowing a sparse ciphertext recurrence alone does not determine the underlying plaintext or pad.

The next useful test is a **complete reversible forward-and-inverse cipher** whose gap, index, and coefficients are frozen from the page-40 red source, combined with an independently motivated, recoverable key. It must reconstruct previously unfitted original LP2 runes and re-encrypt them exactly. Re-scoring more affine maps on these same fitted positions would add little.

## Reproduction and source boundaries

[Source-locked CommonJS reproducer](../sims/red_prime_gap_affine_echo.cjs), run using Node.js from the repository root. It asserts the original red span, page40 source positions, the two exhaustive equal-gap triples, **230** and **80** original hits and the exact 2,896/12,956 corpus counts before doing the seeded 1,500-manuscript null. Set the optional environment variable LP2_TRIPLET_REPS to increase the null replicate count. The matched-null execution was performed directly against the live repository's original corpus and complete-word transcription.

Related established observations: [red page40→15→53 pointer triangle](red-span-triangle.md), [lag-six affine echo](lag6-conditioned-echo.md), [lag-five S echo](lag5-rune-specific-echo.md), [joint forward-model limitations](lp2-forward-generator-joint.md). Treat those as source measurements with their original selection caveats; this report adds a unified clue interpretation and its bounded two-center comparison.
