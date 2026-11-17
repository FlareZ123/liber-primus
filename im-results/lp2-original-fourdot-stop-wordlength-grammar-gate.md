# Original LP2 full-stop grammar: punctuated word boundaries lack the solved-Cicada asymmetry

**Agent 50, 17 November 2026. Classification: original-source architectural clue, no recovered unknown-page plaintext, key, or complete inverse.**

## Source question and competing routes

Original LP2 prints normal-length rune words separated by hyphens and punctuates many of them with a distinctive four-dot diamond. An independently authenticated solved Cicada page shows those diamonds functioning like full stops. A reader trying to decipher the manuscript can therefore ask a simple **plaintext-architecture question before guessing keys**: *do the original diamonds still separate naturally ordered English sentences?*

A source-faithful reading of ordinary solved-Cicada prose often begins clauses with short articles/pronouns and ends them with longer content words. The existing [original word-order study](lp2-wordlength-order-grammar.md) already reports no ordinary length-bigram order in the **2,896** unsolved printed words. This experiment makes a **different, punctuation-anchored prediction**: even without identifying any word, the GP-rune length of the word after a full stop should more frequently be at most three than the word before it if the original sentence order is intact.

The competing routes are cipher-created or relocated word breaks, a whole-word permutation, non-English plaintext, or punctuation functioning differently in these pages. The test does not presume any cipher or tune a decryption key.

## Physical input and exact discriminator

Use all original **12,956** unsolved LP2 rune positions and the **2,896** complete printed words from [the source transcription](../resources/lp2-transcription.txt), joining 32 across-page continuations. The [original-JPEG punctuation audit](lp2-punctuation-identity-stream.md) distinguishes **138 physically printed four-dot diamonds** from five three-dot comma forms, one ambiguous detached dot, one absent purported stop, four extra numerical-row terminators, and separately shaped large ten-/thirteen-dot marks. Freeze the 138 diamond rune offsets and map every one to the ending position of an actual printed word. Exclude only the seven documented non-four-dot/missing/editorial stop event indices **57–60, 91, 125 and 127**. The native manuscript's 13-dot and ten-dot stencils are never reclassified as sentence punctuation.

For each one of the 138 true four-dot boundaries, compare the word immediately preceding it to the word immediately following it, in **original printed order**. The explicit statistic is:

```text
D = count(next word has 1–3 GP runes) − count(previous word has 1–3 GP runes)
```

No letter substitution, language-model scoring, alternate symbol mapping, punctuation relocation, or selected text interval enters the original measurement.

| Unmodified source | Printed words | Stops | Previous short words | Next short words | D |
|---|---:|---:|---:|---:|---:|
| **Unknown LP2 p0–55** | **2,896** | **138** | **64** | **61** | **−3** |
| Authentically clear LP1 p10–13 (*The Loss of Divinity*) | 181 | 23 | 4 | 11 | **+7** |
| Authentically clear LP1 p5 (*Some Wisdom*) | 31 | 5 | 1 | 3 | **+2** |

LP2's relative next-minus-previous short-word rate is **−0.0217391**. The independent clear LP1 p10–13 source rate is **+0.304348**, despite using the **same GP rune lengths and the same exact printed small-dot punctuation class**, rather than applying an external English-to-GP spelling approximation. The shorter clear LP1 p5 sample has the same sign (+0.4) but is too small to carry substantial individual statistical weight. Some LP1 pages are themselves ciphered; this check deliberately extracts *only the two identified printed clear passages*, not every LP1 page.

An original-inventory null holds every LP2 printed stop position **fixed**, also holds all nine visually established chapter cuts **[729,1874,3603,5506,6527,7960,9640,12648,12956]** and the exact word-length multiset within each chapter fixed, and shuffles GP rune-word lengths **within their original chapter**. Over **12,000 deterministic seeded** Fisher-Yates shuffles, null mean D **−0.04375**, SD **8.19404**; LP2's observed D−3 has upper-tail **0.663611** and lower-tail **0.382218** using plus-one Monte Carlo correction. It is entirely ordinary under punctuation-independent word lengths.

As a **source-native language positive**, apply the same original-word-length shuffle test to the independently identified native-rune *Loss of Divinity* cleartext. Over 12,000 shuffles, D has null mean **−0.51775**, SD **3.12717**, and the observed **+7** gives one-sided upper-tail **0.0120823**. The small *Some Wisdom* control D+2 has upper-tail **0.145655**. These are conditional empirical diagnostics under the defined shuffle null, not universal probabilities that the puzzle must have transposed its words.

## Implication for decipherment

The source-visible **four-dot punctuation architecture** independently agrees with the existing absence of native-English word-length neighbor grammar: the 138 original unsolved page diamonds **do not select naturally ordered short sentence starts** under the solved-author register in which such stops demonstrably do. It is especially unhelpful to propose a literal quotation, readable English substitution, or key search that *presupposes the printed stop-to-word adjacency is a faithful plaintext sentence boundary*. Full prose word-order restoration is an **unsolved inverse problem**; this statistic neither supplies a permutation nor proves that one exists. A sentence-framing decoder can still work if the original language, line-break rules, punctuation function, or word segmentation differ from the tested clear control.

The per-chapter native-stop outcomes in the SFT identify any local exception. Their original D values are **[+2,−1,+1,+1,+1,−6,+1,−2,0]** across the nine visual chapters, so no large source chapter exhibits the clearly positive clause-start effect by this simple test. Eighty-three short words globally? The actual original inventory is independently fixed; no count is adjusted to induce the result. The largest negative chapter is pp27–32 with **8/20** next-short versus **14/20** previous-short, a modest local diagnostic. The genuine LP1 control shows that the test responds to source language without knowing the rune identities.

**Research decision:** the source puzzle's apparent punctuation should not be used as an unrestricted fixed English crib clock. A future source-selected word permutation, segmentation transform or alternate grammatical unit should be judged by *both* recovering ordered sentence-start asymmetry **and** actual independently predicted plaintext on untouched original symbols. Do not promote the current absence of that asymmetry into an authenticated cipher operation.

**Standalone reproducer:** [Windows/Node 22 CommonJS original-source SFT](../sims/lp2_stop_boundary_wordlength_grammar_sft.cjs). It reads only the checked-in canonical rune-word parser, original punctuation audit, and fully printed solved-LP1 runes; asserts original rune/word, punctuation and solved-control counts; and prints all nine chapter results with seeded shuffled nulls.
