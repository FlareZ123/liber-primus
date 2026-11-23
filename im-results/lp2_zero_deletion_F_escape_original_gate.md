# Period zero-elision clue against a literal F-as-repeat-escape decoder

**Agent35, 23 November 2026. Classification: one original-input, source-motivated grammar exclusion; not recovered key/plaintext.**

## Human solve-path premise and deterministic decoder

The authenticated 2014 magic-square targets **1033** and **3301** become the visibly preserved original Onion7 delivery-index `<title>133</title>` and `<div id="331">` when their *zero digits are removed*. A contemporaneous 28 April 2014 participant independently noticed that correspondence, before the May release; no first-party signed text orders the elision as a cipher operation ([historical HTML source gate](lp2-2014-html133-red119-crosslink.md)). A second visible source motif is **F**, Gematria Primus symbol zero, which the solved p56 `AN END` text can use as an uninterpreted interrupter under its *known distinct* prime-totient cipher. The historically motivated, cheapest first operation to test on unknown LP2 is therefore to **remove literal cipher rune F/GP0** and ask whether it was inserted between otherwise equal runes to avoid doublets.

This is a *strict, reversible insertion-only* candidate in which a non-F plaintext/rune stream is changed **only** by inserting F between adjacent equal symbols, retaining all other symbol identities and printed page boundaries. It predicts an original visible `X F X` for every escaped duplicate, and deleting F must recover the underlying repeats. No arbitrary key, score-tuned affine map, changed spaces, symbol substitution, or recursive second layer is allowed. The exact inverse is `runes.filter(rune => rune !== F)` page by page.

## Original-source result and exact planted-positive gate

Input is the existing canonical original ciphertext `resources/liber-primus/lp2-corpus.json`, 55 original **rune-bearing** pages p0–55 (rune-free numeric p50 excluded), with all 12,956 GP29 runes and original page boundaries. Counts are derived from each original rune-index array without changing the transcript or inferring words:

| Original statistic | Exact count |
| --- | ---: |
| Original rune count / adjacent within-page edges | **12,956 / 12,901** |
| Literal F / index zero | **458** |
| Equal original adjacent runes | **86**, including **4 F–F** |
| Literal `X–F–X`, X≠F | **12** |
| After deleting **all** F: surviving runes / edges | **12,498 / 12,443** |
| After deleting all F: equal adjacent non-F runes | **94** |
| Newly exposed equal non-F runes | **12** |

The absence of abundant `X–F–X` is a necessary-condition contradiction for a simple repeated-letter insertion interpretation: even treating **all 458 Fs** as potential deletions reveals **only 12** newly equal non-F neighbors. There is no hidden glut of repeats being rescued by stripping zero-symbol escapes. A planted non-F source stream with multiple doublets is encoded by inserting exactly one F between any two identical consecutive symbols; the same inverse recovers **every original plant symbol**, and the plant visibly creates exactly one `X–F–X` per inserted F. All original counts, assertions and this synthetic positive are reproducible in [the read-only Node22 test](../sims/lp2_zero_deletion_F_escape_original_gate_sft.cjs).

**Interpretation:** the original anti-doublet fingerprint (86/12,901) persists after the simplest historical zero-deletion operation (94/12,443). The 12 newly exposed duplicates are much too few to turn the original tape into ordinary native GP English by this operation alone; a source-English baseline has substantially more equal adjacent letters. This is **not** a statistical claim that 12 `X–F–X` patterns are unusually few under a random-tape null; it is a structural contradiction only for the **specific F-as-inserted-duplicate-escape** model. It does **not** exclude literal F as a separate key-clock interrupter, a rule that *replaces* repeated symbols rather than inserting F, an altered alphabet, changing-state encipherment, a full-length pad, or a second cipher layer. Those require their own first-party operation and proper original inverse before investing more compute. No new unknown LP2 plaintext or key resulted.
