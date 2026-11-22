# LP2 red-heading source keys: all 29! outer alphabets with real page holdout

**Agent 47, 2026-11-10 · Source-fixed ciphertext inversion, tested on three untouched original manuscript pages and an exact planted unknown-substitution positive.** No unknown LP2 plaintext or true cipher key recovered. [Successful Node 22 Actions run 42770049571](https://github.com/FlareZ123/liber-primus/actions/runs/42770049571).

## Why this attack differs from direct red-key subtraction

The corrected [225-red-rune / 36-stencil canonical image annotation](../resources/liber-primus/lp2-ink-annotations.json) independently selects nine pages with a red runic heading starting at local offset zero, followed by at least 50 black runes: LP2 pages **0,3,8,15,23,27,33,40,54**. Their source-defined heading lengths are **13,16,12,9,16,19,10,8,9**. The subsequent black text totals **1,905** runes. This data selection requires no English language scoring or posthoc ciphertext match.

One testable hypothesis is that a red heading provides its own repeating cipher key, with an unknown, manuscript-wide one-to-one substitution of ciphertext runes. Such a substitution would defeat direct index subtraction, even under an otherwise correct running pad. The model here is

`C_i = sigma((P_i + s*K_red_heading[i mod L]) mod 29)`,

with fixed additive direction `s` per candidate, a single arbitrary bijection `sigma` shared by all nine pages, and no concealed key skips. From each red heading independently, declare only three raw source-to-key conversions: canonical rune index, associated GP prime modulo29, or rune index plus body position modulo29. Try normal/reversed heading order and initial period phases 0/1. Together with two directions this is **3 × 2 × 2 × 2 = 24** explicitly source-bounded models. All other choices are fixed before evaluating the heldout ciphertext.

### Exact 29! alphabet fit and independent pages

A global 29×29 maximum-weight bipartite assignment (Hungarian algorithm via the existing [outer-permutation solver](../sims/outer_permutation_assignment.cjs)) finds the *optimal one-to-one ciphertext alphabet* for each fixed candidate under an independent 160,000-rune Shakespeare GP-unigram prior. This eliminates the need to enumerate 29! substitutions. Optimize only on the six manuscript pages **0,3,8,15,23,27** (**1,255** black runes). Freeze that exact mapping and source-use rule, then score untouched heldout pages **33,40,54** (**650** black runes). Never adapt the alphabet or key rule to the three heldout pages.

### Original-manuscript result

The best of all 24 candidates, when ranked on the withheld 650 runes, is raw heading GP indices, positive encryption sign, forward reading, phase one. Its average Shakespeare log probability per rune is **−3.802239** on the train pages and **−4.146410** on the holdout. The next original contender scores **−4.158430** heldout (GP prime residues, sign+, forward, phase0). These estimates are extremely far from independently heldout authentic GP-English, which in the same control system scores roughly **−2.95 to −2.99** per rune. In this family, even the *post-selected best* original holdout is not a credible English plaintext recovery.

### Strong planted positive with completely unknown outer alphabet

A separate **1,905-rune withheld Shakespeare sample** is encrypted under the *actual nine red-heading lengths and rune-source keys* with a seeded random unknown 29-symbol permutation. The solver sees only its cipher, the public red headings and the independent training prior. It recovers **all 29/29 substitution labels exactly**, selects the true heading-index / positive sign / forward / phase0 key rule as **first of 24**, and gets training log fit **−2.985458** and heldout **−2.948639** per rune. The next incorrect model has heldout **−3.809859**. This is a powered positive showing that a true red-key, uniform shared outer substitution model of this kind would be detectable.

## Direct authentic p56 totient decoder on the source-printed red headings (Agent 32, 11 November 2026)

A distinct source-channel test asks whether the **known solved p56** prime-totient operation itself can read the nine visually isolated red headings, rather than deriving a red-key pad and fitting an outer permutation to their following black bodies. The exact p56 operation here is, for heading-local index i, plaintext \(P_i=(C_i-(p_{i+1}-1))\bmod29\), where \(p_j\) is the j-th ordinary prime. The runic index order is the original Gematria Primus order. Each heading resets to prime2 at its own first printed glyph. No shift, orientation, phase, key, unknown alphabet or word boundary is fitted. A mask for exceptional literal F symbols is *not* transferred: the established p56 F exception occurs well after its first five heading runes and has no universal selection rule for other pages.

**Source-authentic positive:** the original p56 red first five runes, decoded by the same formula, recover **ANEND** exactly. Applied with the same fixed settings to the nine unknown red heading spans, however, the outputs are:

| Physical LP2 page | Red runes | Direct p56-operation output (GP transliteration) |
| --- | ---: | --- |
| p0 | 13 | XGXYAEWJJOEIABXD |
| p3 | 16 | MNHTHJOESIAOEOSWYOPEA |
| p8 | 12 | PHIPLTHOTNXTHI |
| p15 | 9 | EAEATPXTIRTH |
| p23 | 16 | FOEOSAETHWBBENCCROEO |
| p27 | 19 | EJOEXCLHWSNGBCEAGOYSOC |
| p33 | 10 | OEIIEAMIAHESW |
| p40 | 8 | EAWSLAEJNM |
| p54 | 9 | DBBBBMIANGY |

These are exact direct outputs, with **no recognizable native GP-English section headings or independently actionable instruction**. Source-page-specific ciphers, unknown orthographic registers and layered encodings are outside this result. Taking all **213 colored runes on the 55 nonempty unknown pages** in their documented ink-span order, preserving one uninterrupted prime clock, similarly gives an index of coincidence **0.0334396315** against the original red stream's **0.0338382496**; both are ciphertext-like. This is a bounded failed transfer of a historically verified operation, not an assertion that the red headings contain no information.

The [read-only CommonJS reproducer](../sims/lp2_red_titles_solved_phi_gate_sft.cjs) checks the original 9 heading lengths and texts, the p56 ANEND positive, all 213 image-tagged unknown red rune positions, and both full-red-stream coincidence values. The exact committed SFT passed its assertions on the linked original corpus in the connected JS research runtime on 11 November 2026; no CI run was dispatched. The separate red-heading-as-key/outer-alphabet family above remains the stronger rejection for repeated red-key body encryption.

## Decision, limitations and replication

The corrected image-selected red titles **do not function as ordinary period-repeated GP rune/prime keys with a single shared arbitrary output permutation under these precise page-local variants**. Crucially, this excludes even the best-fit unobserved 29! outer alphabet from explaining the heldout color-selected pages. It does not rule out hidden skips, altered red-key interpretation, a different substitution per page, a key schedule derived from red content by a KDF, red heading runes themselves decrypted by a previous layer, an unusual plaintext register, or a different cipher architecture.

The sole runnable SFT is [`sims/red_header_outer_alphabet_holdout.cjs`](../sims/red_header_outer_alphabet_holdout.cjs), Node.js22, built-ins and existing local solver only. It asserts exact image/corpus agreement, the nine physical-page selection, all 1,905 source/body runes, independent Shakespeare source span, true source-rule rank, and 29-symbol planted alphabet recovery. [Original-input CI evidence](https://github.com/FlareZ123/liber-primus/actions/runs/42770049571). This is an original-source holdout constraint, not a decipherment claim.
