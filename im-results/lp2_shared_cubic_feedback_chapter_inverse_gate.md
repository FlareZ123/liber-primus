# Shared cubic GP29 feedback: original-chapter inversion gate

**Status: bounded negative, 22 November 2026.** No unknown LP2 plaintext, historical key, or verified operator is recovered. This is an executable decision for Director [#2164](https://github.com/FlareZ123/liber-primus/issues/2164), not evidence that Cicada selected a cubic cipher. The maintained [original-cipher inversion contract](../workplace/integrated-original-inversion-challenge.md) remains authoritative.

## Causal hypothesis and complete inverse

Two source-distinct encrypted chapters are physical pp16–21 (unillustrated, 1,613 runes) and pp40–53 (floral art, 3,008 runes, with runeless p50 omitted). A historical 2013/2014 DH-style modular exponent and the manuscript's exact 29-symbol GP alphabet motivate **one small, pre-specified nonlinear equation language**. We fix exponent three, allow a single *shared* coefficient \(b\in\mathbb F_{29}\) and two independent initial states, and do not tune the model or its clock after opening heldouts. The historical DH cue supplies **no authenticated instruction to apply this law**; this is an exploratory reversible family.

At every source rune, continuously across printed words, lines and genuine physical-page seams, let

\[
C_t=P_t+k_t\pmod {29},\qquad
k_{t+1}=k_t^3+bC_t\pmod {29}.
\]

The complete inverse is \(P_t=C_t-k_t\pmod {29}\), followed by the same public \(C_t\)-dependent state update. Each chapter starts with an independent unknown \(k_0\in\mathbb F_{29}\); they must share \(b\). Every GP rune, including original literal F, is ordinary data; no special escape, dropped symbol, or implicit reset exists. There are exactly 29 possible shared multipliers and 29 possible chapter seeds. All 29 choices of \(b\) and all 29 seeds were enumerated on each chapter; allowing arbitrary *new* nonlinear parameters inside a chapter would leave the tested family.

The search used **source-original rune indices**, a source-native first-order GP29 language model trained on original, genuinely printed clear-GP LP1 physical pp9,10,11,14, and the 150-rune prefixes of the two unknown sections as **training only**. The language score is \(\frac1n\sum_t [0.25\log \Pr_1(P_t)+0.75\log\Pr_2(P_t\mid P_{t-1})]\), with unigram Laplace smoothing \(+1\) and bigram \(+0.8\). LP1 p3 and p8 are withheld known-plaintext plants. See the read-only [reproduction SFT](../sims/lp2_shared_cubic_feedback_chapters_sft.cjs), which also checks the 2,896 source words, all 12,956 original runes and the 32 genuine cross-page words.

## Original results: train one chapter, freeze the law, transfer to the other

| Frozen training | Selected common \(b\) | Independent start seeds | Untouched heldout | Heldout mean log score | Normalized GP29 IoC |
|---|---:|---|---|---:|---:|
| p16–21 first150 | 15 | corridor17, floral11 | floral rest2,858 | −3.70771 | 0.99819 |
| p40–53 first150 | 14 | floral8, corridor3 | corridor rest1,463 | −3.66159 | 0.99098 |
| p16–21 first150 | 15 | corridor17 | corridor rest1,463 | −3.69140 | 1.00242 |
| p40–53 first150 | 14 | floral8 | floral rest2,858 | −3.68213 | 0.99797 |

Native GP heldouts score **−3.04503** (printed-clear LP1 p3, 157 runes), **−2.82806** (printed-clear LP1 p8, 187) and **−2.97324** (LP2 p57, 95). The original outcomes are distant from the source-native positive controls and have no coherent recovered prose. The two independently trained chapters even prefer **different shared coefficients**, 15 versus14. The equal-rule model did **not** correctly transfer across the sealed original sections.

A separate alphabetically constrained original-input check was independent of the language-model ranking. Using precisely the source's printed runic word delimiters (line and page wraps can continue words), the corridor has **17** one-rune words, and the floral chapter has **13**. For plain English rendered in the observed clear-GP orthography, a one-rune word should be GP A, I or O. At each fixed \(b\), both seeds are free to maximize the number of legal one-rune words independently. The best of all 29 multipliers produces only **11 of 30** legal singleton positions (**b=1**, corridor seed13: 8/17; floral seed1: 3/13). **Zero** shared multipliers admit any pair of independently chosen seeds that makes all30 native-English singletons legal. This is a source-native obstruction for this equation, not a proof that the unknown prose must be English.

## Calibration and correctness

Actual original printed clear-GP LP1 p3 (157 runes) and p8 (187) were encrypted independently with the same \(b=5\), starting states6 and15. The deterministic 120-rune training search independently recovered \(b=5,k_{0,U}=6,k_{0,F}=15\) at rank1 on **both** plants and produced exact **157/157 and187/187** decrypted glyphs; complete forward re-encryption reproduced both ciphertexts. An all29-glyph plant also round-tripped. In a **different-law control**, the p3 plant used \(b=5\) and the p8 plant \(b=7\); forcing a shared multiplier selected \(b=7\), but the p3 score fell to **−3.57883** while the native p8 score was −2.89030. Thus the scoring distinguishes at least these planted same-law and different-law cases.

On original data all **841** \((b,k_0)\) pairs per chapter round-trip their own decrypted output. This is the mathematical property of a correctly implemented inverse, **not cryptanalytic validation**. Nothing in this experiment independently authenticates the cubic update as the creator's operation.

## Disposition and next decision

Retire **only** the fully specified \(k_{t+1}=k_t^3+bC_t\) cipher with one shared \(b\) and two independent chapter seeds, continuous rune clock and ordinary GP29 F. Further variants of exponent, perturbation, word reset or nonlinear state are different hypotheses and must each have an original-source selector or evidence-controlled reason. The single-rune obstruction and genuine-LP1 native score are cheap preliminary gates for such candidates.

The economically important missing input is a first-party clue selecting an actual *state update* and how distinct chapters obtain their seeds. Without that, exponent/constant tuning, longer arbitrary feedback laws and large synthetic plant suites are highly unlikely to recover authentic plaintext. A genuinely source-selected operator or independently verified long plaintext crib should supersede this family.
