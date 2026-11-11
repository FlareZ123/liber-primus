# Original LP2 cross-word adjacency: order-sensitive anti-repeat survives every printed word boundary

**Status (11 November 2026): source-correct original-input permutation observation.** The ciphertext suppresses consecutive identical GP29 symbols *between separately printed words* just as it does inside them. The effect cannot be explained merely by having an unusually balanced ciphertext alphabet or a benign word-length distribution. It is a strong constraint on decoder architectures that treat each word as independently randomized output. It does **not** establish a historical global no-repeat filter, supply an inverse, recover any unknown plaintext, or prove source-authenticated Cicada intent.

## Motivating decision

The unresolved LP2 string has only **86 adjacent equal GP29 symbols in 12,901 within-physical-page adjacencies**, already a known, unexplained anomaly. If an independent output-alphabet state resets on the original printed word boundary, the cross-word adjacent-pair deficit may disappear even when the within-word stream is constrained. Test **original whole-word order** rather than repeating the old continuous-stream or generic iid-symbol tests.

The original source text has **2,896 canonical printed words**, **12,956 runes**, fixed runeless physical p50, nine original text sections, and 55 rune-bearing unknown physical pages. Rune-to-word parsing uses the checked cross-line/page carry convention in [the shared parser](../sims/lp2_word_pages.cjs). Slash wraps, whitespace and page marks do not create word boundaries. The exact resulting GP29 sequence is asserted equal to the canonical physical-page corpus before analysis.

- **Within** the same printed word: **63 / 10,060** adjacent equal rune pairs = **0.62624%**.
- **Across** successive printed words: **23 / 2,895** adjacent equal rune pairs = **0.79447%**.
- Printed physical page boundaries are not forcibly omitted from the word sequence. The 55 rune-bearing pages have 54 inter-page boundaries; source words may continue across a page.

The cross-word equality count is robust under the actual print-word convention: ordinary line breaks are not silently counted as words. No rune, spelling or punctuation normalization was fitted to minimize the repeats.

## Conditional nulls: preserve complete original word contents

For each of three independently declared constraints, perform **20,000 seeded permutations of complete ciphertext words**. Every permutation retains each original rune sequence **within its word** and preserves **the exact word-length slot at every original position**. Consequently, it preserves all within-word adjacent equal events (exactly 63), each source word's full content and length, and original word-length transitions. The two more restrictive tests additionally shuffle *only inside the same original text section* or *the same original physical starting page*. No ciphertext alphabet symbols or keys are altered.

| Original-word shuffle constraint | Distinct shuffle bins | Minimum cross-word equal pairs | Median | 95th percentile | Observed original |
| --- | ---: | ---: | ---: | ---: | ---: |
| Printed word length | 14 | 62 | 100 | 116 | **23** |
| Text section plus printed word length | 101 | 67 | 100 | 116 | **23** |
| Physical starting page plus printed word length | 526 | 60 | 100 | 116 | **23** |

All **60,000** conditional permutations yielded more cross-word repeats than the authentic ordering; add-one empirical lower-tail for each independently fixed family is **1/20,001 ≈ 0.000049998**. This is a conditional-permutation signal of original word *ordering* beyond what is mechanically explained by word inventories, lengths, section or page membership. It is not a p-value for all conceivable natural language genres or cipher mechanisms.

The exact source start/end rune marginals give an expected **99.905** accidental cross-word equal pairs under uniformly randomized whole-word order. The conditional empirical medians (100) are consistent with that independent analytic expectation.

## Native GP-English controls and essential counterexample

Encode the pinned Shakespeare, Gibran and Emerson texts in native GP29 (same runic transliteration conventions as the existing shared controls). The original continuous text has cross-word adjacent equality rates **3.050%, 2.784%, 3.094%** respectively. In **200 samples per author** that replace each original ciphertext word with a separately drawn native word of the *exact same GP-rune length*, cross-word equality counts range:

| Reference | Native original cross-word rate | Min | Median | Max |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare | 3.050% | 94 | 116 | 146 |
| Gibran | 2.784% | 90 | 116 | 142 |
| Emerson | 3.094% | 88 | 115 | 157 |

Every one of the **600** word-length-matched English controls lies above the original LP2 **23**, agreeing with a book-wide anti-repeat mechanism or special source-register effect.

**Critical counterexample:** The solved, unencrypted p57 *PARABLE* is valid GP29 English, with **0 cross-word adjacent equals across 19 printed word boundaries**, and one within-word doublet in its 95 runes. Thus natural and deliberately stylized English can produce local no-repeat passages. The original book-length effect is far stronger evidence than a 19-boundary terminal page. This control prevents the unwarranted conclusion that word-boundary anti-repeat logically proves an encryption state that never resets.

## Cryptanalytic consequence

Any proposed word-by-word mechanism must explain why the authentic **inter-word ordering** suppresses immediate equal symbols about fourfold relative to the same complete words rearranged into same-length/page/section slots. A proposal that independently emits quasi-uniform GP29 outputs at each fresh word start has a measurable failure at printed word boundaries, independent of its ability to fit within-word doublet counts.

A reversible 29-symbol permutation by itself **cannot ban one designated output symbol for every possible plaintext rune**, because it must be surjective. A genuine universal no-repeat rule therefore requires another source-constrained mechanism, such as a restricted input alphabet, state-dependent auxiliary representation, variable consumption, or a constraint that applies only statistically to original prose. None is identified here.

The strongest open question is whether the same suppressed cross-word equality follows from the **intended plaintext register and its word sequence** or from a **source-selected cross-boundary cipher state**. Do not infer a skip-ahead rule, reset schedule, or key solely from this diagnostic. An original-cipher decoder must predict the effect without refitting it.

## Reproduction and verification

- [Single-run original-input SFT](../sims/lp2_word_boundary_antirepeat_sft.cjs) tests source corpus agreement, all boundary counts, 20,000 conditional shuffled words for each of the three frozen constraints, 600 GP-native matched-word samples, and an exact solved p57 plaintext control.
- [Passing manual GitHub Actions run 43112402008](https://github.com/FlareZ123/liber-primus/actions/runs/43112402008).
- [Manual workflow_dispatch definition](../.github/workflows/lp2-boundary-repeat-source-gate.yml).

This report is a contextual original-cipher constraint and explicitly leaves all substantive unknown LP2 plaintext, keys, cipher architecture and destination unresolved.
