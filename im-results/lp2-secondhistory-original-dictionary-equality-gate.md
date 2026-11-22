# Two-ciphertext-history GP29 decoder: native dictionary consistency

**Agent 3, 14 November 2026. Classification: original-input necessary-condition test.** No unknown Liber Primus plaintext, original key, or destination recovered. The source-runic ciphertext remains untouched. This test evaluates a distinct constraint from the prior two-history collision-rate and heldout-rank statistics in [the second-order feedback study](lp2-secondorder-feedback-rank-inverse.md).

## Decoder and useful original condition

The unknown LP2 pages contain **12,956 original cipher runes** arranged into **2,896 complete printed words** (55 rune-bearing physical pages, p0–55). The pronounced suppression of adjacent identical runes has motivated ciphertext-feedback substitution models. Earlier one-ciphertext-history state tables have native-English frequency-capacity obstructions; previous second-order studies established that merely granting **841** predecessor-pair states makes those easy capacity obstructions disappear.

Test the fully unknown, fixed, *invertible* two-history model for all eligible positions:

```
C[i] = S[C[i-2], C[i-1]][P[i]]
```

Each of the **841** state rows receives its own arbitrary secret **29-symbol permutation**, reused throughout the book. The first two runes of each physical page are exempt as IVs, giving **12,846** encoded positions. The model is not an authenticated Cicada cipher; this is an all-secret *feasibility* experiment.

For any two positions with the **same observed ciphertext triple**, the plaintext symbol must agree. Within the same observed preceding two-rune state, two **different** succeeding ciphertext symbols must correspond to **different** plaintext symbols. These are key-independent necessary constraints on the unknown plaintext. They can be applied without recovering the secret table.

## Frozen source-native lexical register and algorithm

The sole plaintext dictionary is `resources/control/english_wordfreq_textblob.txt`, containing **29,157** source-English word types. Encode each through the existing source-calibrated GP spelling function (including the independently observed single-rune **ING** and **IO**), and preserve the original exact printed word lengths. This is a finite English register, not a claim about the original author's vocabulary.

For each ciphertext word, enumerate its dictionary candidates of identical GP-rune length. Discard candidates violating repeated-triple equality *inside that word*. Then propagate common candidate-letter **29-bit support masks** for every ciphertext triple appearing in more than one original word. Intersect the support masks across words and repeat until stable. Finally, for each observed two-rune predecessor row, require that all its available third-rune output labels admit a **complete one-to-one matching** to different plaintext GP symbols.

This procedure has a precise interpretation: **any authentic native-dictionary plaintext under the proposed fixed two-history model must survive these necessary conditions**. Surviving the checks does not prove that one global assignment of the 2,896 words and all 841 hidden rows exists.

## Result on original ciphertext

| Original-cipher constraint | Result |
| --- | ---: |
| Original printed whole words | **2,896** |
| Runic ciphertext symbols | **12,956** |
| Original triples repeated across printed words | **2,473** distinct triple labels |
| Observed distinct predecessor-pair → output labels | **9,886** |
| Original predecessor-pair rows represented | **840 / 841** |
| Source-native dictionary word assignments initially compatible within each word | **6,236,512** |
| Candidate assignments remaining after equality propagation | **6,114,176** |
| Eliminated lexical candidates | **122,336** |
| Fixed-point propagation passes | **3** |
| Original words with zero remaining dictionary candidate | **0** |
| Original secret rows failing a necessary perfect-matching test | **0 / 840** |
| Triple variables forced to a single plaintext rune | **0** |

The exact original values are embedded as assertions in the reproducible experiment. They show that an unrestricted two-history alphabet table and finite ordinary-word lexicon are **far too permissive to select original plaintext** through these necessary equality and injectivity constraints alone. This does *not* declare the architecture compatible with a coherent global English passage; its feasibility beyond the local constraints was not established.

## Independent, fully reversible planted control

Populate **every one of the 2,896 original printed word lengths** with an authentic GP-encoded dictionary word, encrypt all **12,846** non-IV symbols with a stationary, invertible predecessor-pair affine permutation, and assert each source symbol is independently inverted exactly. On this genuine model-family positive, all **2,896** planted words survive dictionary propagation:

- **12,846/12,846** original-layout non-IV runes invert exactly.
- **5,908,305** of **6,219,387** dictionary assignments survive.
- **787/787** observed row matching tests pass, with **zero** forced singleton symbols.
- Propagation converges after **five** passes.

The plant confirms that the original test will **not** exclude a genuine word-length-matched native-English ciphertext from the stated family merely because its secret permutations are unknown. It also illustrates that millions of candidates survive even when the generating plaintext is known to be ordinary source-English words.

## Research decision

A brute-force dictionary reconstruction of arbitrary secret predecessor-pair substitution rows, without an independently constrained generator or key, cannot be justified by these original-data equality constraints. Prior heldout conditional-collision measurements already disfavor *random stationary two-history tables* for ordinary English; this separate lexical test supplies **no contradiction** capable of ruling out every secretly chosen two-history mapping. The useful future decision is to locate an authored row-generation mechanism, or a smaller keyed state whose family makes discriminating original-cipher predictions. Adding unconstrained independent rows would only increase the ambiguity.

[Standalone CommonJS original-input test](../sims/lp2_secondhistory_dictionary_ac3_sft.cjs) and [successful CI run 43605234901](https://github.com/FlareZ123/liber-primus/actions/runs/43605234901), 14 November 2026. The manual [workflow](../.github/workflows/agent3-lp2-secondhistory-dictionary-manual.yml) uses Node 22 and makes no external downloads. All observed source counts and the planted inverse check are asserted before publishing output.
