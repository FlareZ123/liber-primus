# Thirteen-dot punctuation as a literal every-thirteenth-rune message carrier

**16 November 2026, Agent46. Decision:** The source-visible 13-dot separators do **not** expose one intact GP29-English message by literally extracting every thirteenth rune, under any of 13 phase choices with source-defined book, physical-page, or dot-delimited counting. No unknown plaintext, key, author-selected cipher, or final destination is recovered. This rejects only a direct unary decimation channel under those fixed clocks.

## Why this was a reasonable puzzle operation

The original LP2 images repeatedly print a large 13-dot separator. A 2014 human solver could read the numeral **13** as an instruction to take *every thirteenth rune*, and the layout supplies three natural choices for when to start counting: at the book's first rune, at each original physical page, or immediately after a thirteen-dot separator. Testing **all 13 residue classes** of each fixed clock avoids choosing a phase after seeing a promising output. An additional secret fixed GP29 alphabet or arbitrary rearrangement of the selected lane would leave its symbol counts unchanged, so a language-concentration test can cover those freedoms without any key search.

The original data are the unchanged GP29 indices in `resources/liber-primus/lp2-corpus.json` and original-ink position annotations in `resources/liber-primus/lp2-ink-annotations.json`. They contain **12,956** unknown runes on 55 rune-bearing physical pages p0–55, and **28 source-annotated large 13-dot separators** in that same unsolved range. The first separator is at **p0 rune offset 13**, after the two red title words; a mark at rune offset k starts the next sample clock at k. Page p50 is a runeless numerical table and contributes no source rune.

## Exact result

For each clock, a complete partition of all **12,956 original runes** into **13 ordered lanes** was enumerated. The IoC is `sum_v n_v(n_v-1) / (N(N-1))` for each recovered lane. The maximum original IoC across all phase choices is:

| Visible counting convention | Best phase (zero-based) | Source runes in that lane | Maximum GP29 IoC |
| --- | ---: | ---: | ---: |
| Continuous book | 11 | 996 | **0.0352303687110** |
| Restart at each physical page | 4 | 1,003 | **0.0350047661407** |
| Restart at every thirteen-dot stencil | 8 | 995 | **0.0349352395782** |

All **39** lanes lie between **0.03408 and 0.03524**, near the uniform GP29 coincidence `1/29 = 0.0344827586`. For independent source-language calibration, the reproducer converts Shakespeare, Gibran and Emerson to the same native GP29 lexical register, including **ING→NG** and **IO→IA**. It examines **200 fixed, evenly spaced windows per native source for each of the exact 39 original lane lengths**. Every original lane falls below every language-control minimum for the corresponding length. A simpler separately computed **1,000-window, 975-rune** check produced language-control minima of **0.05393, 0.05680 and 0.05629**, respectively, illustrating the large separation without claiming this simpler window length is the exact matched-length test.

A positive control places an actual length-matched GP-native Shakespeare excerpt into phase zero under each of the three visible clocks and relabels every symbol by the reversible secret affine map `c = 11p + 7 mod29`. The independently computed reverse map recovers **all planted runes**, and the language IoC is invariant to the secret substitution, as required. This positive verifies that the extraction would reveal an intact message even with a secret fixed alphabet; original ciphertext exactly occupies all other lane positions in the plant.

## Interpretation and next decision

The source motif is conspicuous, and literal stride-13 extraction is a human-executable test. It gives no original-source English stream under any original-layout phase, including a 13-dot-reset interpretation. Source-native GP letter frequency remains a meaningful discriminator even if a proposed solver reverses or reorders a candidate lane or applies an arbitrary *single* symbol permutation to it.

A **changing** substitution, cipher mixed into the lane, binary register, selection of an unknown subset of fragments, or separate source-derived keystream could evade this test. Those are distinct mechanisms needing an independent human-readable selector. No broad stride/phase sweep or ad hoc editing of rune positions is warranted by the result.

**Reproducer:** [Original-input read-only CommonJS SFT](../sims/lp2_thirteendot_13lane_original_sft.cjs). It asserts 12,956 source runes, the 28 original dot markers, every phase partition, three independent source controls, and three exact key-blind positive message plants. This is an intermediate exclusion and does not alter the established-results synthesis.
