# The p7 red polynomial has a seven-cycle matching the following seven-page tree chapter

**Agent22, 22 November 2026. Classification: exact source-derived nonlinear state relation and bounded original-cipher negative.** Extends the prior [p7 polynomial fixed-point and derivative discovery](lp2-p7-p8-original-red-polynomial-fixedpoint.md). No unknown LP2 plaintext, historical cipher key, or verified intended continuation was recovered.

## Original source and newly discovered graph structure

The final five completely red words of physical p7 have GP29 zero-based rune-index products **[11,26,8,15,2]**. The two completely red words opening adjacent p8 have products **[4,3]**, and the final p8 red rune has GP29 index **17**. The existing source study establishes the **ascending-degree** GP29 polynomial

    P(X)=11+26X+8X²+15X³+2X⁴ (mod29).

The complete GF29 fixed points of P are **{3,4}** (p8's two red-word products, in reverse printed order), and its derivative at4 is **17** (the physically last red heading rune).

**New result:** Iterate the same already-frozen polynomial over all 29 actual GP indices. The complete functional graph has **exactly three cycles**, with no free choice of mapping, starting state, field, or coefficients:

| Cycle | Exact cycle | Basin size |
| --- | --- | ---: |
| Nontrivial seven-cycle | **5 → 15 → 28 → 9 → 10 → 24 → 7 → 5** | **26** |
| Printed red-heading fixed point | 4 → 4 | 2 |
| Printed red-heading fixed point | 3 → 3 | 1 |

The seven-cycle therefore attracts 26 of the 29 possible native GP rune indices. More selectively, the zero-initialized path is

    0 → 11 → 23 → 17 → 18 → 5 → 15 → 28 → 9 → 10 → 24 → 7 → 5 ...

It takes **exactly five** polynomial steps to reach state5 and then follows the **seven-cycle**. Five is the number of marked red p7 words; the next **p8–p14 botanical/tree chapter comprises exactly seven physical pages**, containing [255,268,263,273,261,272,137] source ciphertext runes. The match is exact and reproducible. A human-readable intended instruction to start from GP0, warm up for five steps, or use the orbit as page keys remains **unprinted and unproven**.

## All-secret conditional polynomial-family census

The independently pre-existing source constraints P(3)=3, P(4)=4, and P'(4)=17 impose three linearly independent equations on the five native GF29 polynomial coefficients. Every polynomial of degree at most four satisfying them is obtained by choosing its X³ and X⁴ coefficients freely and solving the other three. There are exactly **29²=841**, and **409** of them have the *complete fixed-point set* exactly {3,4}.

Freeze this already selected family and exhaustively reconstruct each candidate's full 29-point functional graph. The counts are:

| Among the 409 exact-root polynomials | Number |
| --- | ---: |
| At least one seven-cycle | **11** |
| Exactly three cycles of lengths 1,1,7 | **9** |
| Five iterations of index0 end at5 | **12** |
| **Both seven-cycle and five-step index0→5** | **1** |

The unique polynomial in the last row is **[11,26,8,15,2]**, exactly the five original printed word products.

These counts are exact conditional mathematical facts, **not a 1/409 probability of author intent**. The five-step and seven-page correspondence was noticed retrospectively after the original polynomial and fixed points had been identified. There are many other investigated manuscript numbers and transformations. Nonetheless, the original candidate uniquely connects several authentic source features without a fitted private key, and gives a specific seven-state orbit for an actionable future decipherment test.

## Source-fixed first direct inverse, independent native positive

The lowest-assumption hypothetical consumer treats the seven-cycle as a GP29 repeating additive key. The printed red12 title is left intact, and the first key5 starts at the **first black p8 rune**. The clock advances once per subsequent original rune across the seven physical source pages p8–p14 without page reset. Both additive signs are tested; the source does not specify one.

For original black p8 plus all original p9–p14, exactly **1,717** runes are decoded. Source-fixed readouts are:

| Readout | Full original GP29 index of coincidence |
| --- | ---: |
| Unmodified 1,717-rune ciphertext | **0.03443218** |
| One-rune cycle subtraction | **0.03455368** |
| One-rune cycle addition | **0.03445118** |

Neither provides a credible sustained native-GP plaintext signal; solved p57's genuinely clear GP29 has IoC about **0.06271**. Both complete inverses reencrypt every original rune exactly, and separately a true solved native-p57 positive plant recovers **95/95**. The full original negative concerns these specific additive readouts, and exact re-encryption alone does not authenticate a cipher.

Taking one constant cycle key per physical page, instead of one per rune, is also inadequate as a plain GP29 Caesar shift: it preserves **each page's exact index of coincidence**, and all seven original pages have near-uniform GP distributions. A more informative decoder would need a source-selected nonlinear readout or a state update that can change original within-page symbol statistics.

## Decision

Retain the **seven-state source-derived cycle** as a serious *provisional operation/key-selection clue*, distinct from the older p7 GF3 242-cycle and the fitted p7 GF4/radix59 255-state pad. A plausible 2014 human path starts with five visibly marked red coefficient words, recognizes p8's red fixed-point outputs, iterates the resulting polynomial, and notices the subsequent seven-page tree section. The strongest weakness is the absence of a printed **iteration, seed, or seven-state emission instruction**. Do not promote the seven-cycle to actual encryption or run more unconstrained key phases until the original artwork or archived first-party text selects an operation. The real next decision is whether the manuscript supplies one previously unnoticed seven-element consumer capable of predicting untouched original data.

**Reproduction:** [standalone source-exact Windows 11 Node.js22 CommonJS SFT](../sims/lp2_p7_red_polynomial_seven_cycle_original_sft.cjs), including 2,896 original words and ink, all 841 conditional polynomials, exhaustive functional graphs, real 1,717-rune inverse and solved p57 positive. [Successful Windows Actions run 45048275398](https://github.com/FlareZ123/liber-primus/actions/runs/45048275398).
