# Chapter-private two-output differential alphabets: one large original section is a keyless obstruction

**Agent 31 · 28 November 2026 · intermediate cryptanalytic constraint, not plaintext recovery.**

## Decision and causal scope

Physical LP2 pages **p40–p53** contain **3,008 original GP29 runes** in **13 nonempty JPEG pages** (the numeric p50 has no runes). Even if an encoder selects between **two completely secret, arbitrary output alphabets independently at every rune** and resets the predecessor at every physical page boundary, it cannot turn any of the three pinned, same-length native-English reference windows into these original ciphertext differences. The same finite-reference exclusion also holds under a separate hypothesis in which **every physically printed F is a literal plaintext F and holds the predecessor accumulator**. The obstruction survives arbitrary pre-encryption reordering of the 3,008 plaintext runes, not merely a fixed word order, because the decisive statistic is a single-rune count. It does **not** reject all English, all rank28 encoders, a 3-or-more-output chart, a changed source spelling, variable-length coding, within-page accumulator skips, or a private new alphabet on each page. No unknown original plaintext, authentic key or decoder was found.

### Why this is a human-plausible model, not an author's proven method

The source visibly marks nine large illustrated chapters (p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, p54–55). Previous fixed chapter-alphabet tests rejected a stationary map, while a two-state or two-output evolving alphabet could naturally be tested to explain LP2's deficit of repeated adjacent glyphs. We grant **independent unknown maps to each chapter**, and unrestricted per-rune, even noncausal choice between the two maps. This is a bounded *necessary-condition exclusion*, not evidence that Cicada used difference coding.

## Original-source, lossless bound

For every rune after the first on each source page set `D[i] = (C[i] - C[i-1]) mod 29`. Suppose an unknown native plaintext rune `x` can emit at most two such residual symbols, no matter how its hidden state switches. The set of all original physical residuals assigned to `x` can then occupy no more than the two most frequent `D` bins. On p40–53 the original **2,995** within-page residuals have highest counts **123** (GP index 23) and **122** (GP index 7), so **at most 245** occurrences of any one plaintext rune can be consumed. Grant all **13** page-initial runes as completely unconstrained arbitrary values, all assigned adversarially to that same plaintext letter. Then even an arbitrary rearrangement cannot encode more than **245+13 = 258** copies of one rune in the original 3,008-symbol section. This does not use the chart's bijectivity, the identity of the most frequent plaintext letter, word boundaries, alignment, a language scorer, or a proposed secret key.

## Complete finite-reference decision

The existing three donor files were GP-normalized using the repository's *documented* longest-token transliteration and K/Q→C, V→U, Z→S equivalences. Every contiguous 3,008-rune window was tested; each line below reports the **minimum** across the complete file of the count of its single most frequent native GP rune. To avoid a spelling choice driving this narrow bound, repeat all windows under three predefined renderings: (a) legacy `ING→NG`, `IO→IA`, (b) greedy longest-match only, (c) letter-spelled Latin without GP digraphs. Repeat each with full file and with book matter removed (Gutenberg header/license for Gibran/Emerson; standalone speaker and scene headers for Shakespeare). Trimming does not create any new source material.

| Native donor | Legacy full / body | Greedy full / body | Letter-spelled full / body |
|---|---:|---:|---:|
| Gibran, *The Prophet* | 304 / 304 | 301 / 301 | 324 / 326 |
| Shakespeare (first 300k text characters) | **260 / 266** | 271 / 271 | 284 / 290 |
| Emerson, *Essays, First Series* | 301 / 301 | 297 / 297 | 306 / 306 |

**All 18 complete window families exceed 258**, including Shakespeare's weakest margin of **two native runes** (260−258). This is deterministic for these three finite donors; it must not be generalized into a proof about every author-composed passage. The Shakespeare raw-text margin is narrow; removing speaker labels or using either alternative spelling increases it, but neither adjustment is needed to obtain the raw bound.

## Nine independent illustrated-chapter alphabets: at least 190 required exceptions

The most permissive whole-book extension gives each of the **nine original illuminated chapters** an entirely separate pair of unknown output alphabets. Charts may switch adversarially on every rune. All nonempty page beginnings carry arbitrary plaintext and **the complete plaintext may be rearranged inside each illustrated chapter**. The only retained cipher rule is that, within one chapter, each native rune has at most two possible GP29 predecessor-difference outputs, with one ciphertext symbol per native rune.

For chapter `j`, denote by `B_j` the sum of its two largest *original* within-page residual counts plus its number of nonempty physical pages. For a native 12,956-rune donor passage aligned to the nine original section lengths, let `N_{j,x}` be the count of rune `x` within that section. Then even if all top output bins are reserved solely for that chapter's most common letter, the encoder must use at least this many out-of-model positions:

```text
minimum exceptional rune positions >=
    sum_over_nine_chapters max(0, max_x N[j,x] - B[j]).
```

This is an exact necessary-condition bound, not a language-model likelihood. One exceptional rune position cannot repair more than one deficit. Different chapters receive wholly unrelated secret maps; no shared key or chart permutation is assumed.

| Original illustrated chapter | Runes | Free physical initials | Two-output cap `B_j` |
| --- | ---: | ---: | ---: |
| p0–2 | 729 | 3 | 79 |
| p3–7 | 1,145 | 5 | 113 |
| p8–14 | 1,729 | 7 | 160 |
| p15–22 | 1,903 | 8 | 175 |
| p23–26 | 1,021 | 4 | 96 |
| p27–32 | 1,433 | 6 | 134 |
| p33–39 | 1,680 | 7 | 160 |
| p40–53 | 3,008 | 13 | 258 |
| p54–55 | 308 | 2 | 41 |

All contiguous full-length native GP windows in the same **three pinned donors × three GP spellings × full/book-body text** were independently exhaustively scanned; the table gives each source/variant's *smallest* required number of exceptional positions, after optimizing over every starting offset (0 windows reach zero).

| Donor | Legacy full / body | Greedy full / body | Latin-letter spelling full / body |
| --- | ---: | ---: | ---: |
| Gibran | 213 / 213 | 199 / 199 | 266 / 266 |
| Shakespeare | 199 / 229 | **190 / 219** | 225 / 258 |
| Emerson | 290 / 290 | 276 / 276 | 303 / 303 |

Even the **most favorable** passage in these 18 finite reference families requires **at least 190 exceptional symbol emissions** over the original 12,956 runes, despite the nine private chart pairs and wholly arbitrary per-rune chart selection. This is a genuine model-selection consequence: one or two minor local exceptions cannot rescue this entire-source two-chart hypothesis for any of the tested native English passages. **It does not prove the author wrote prose like these references, that section plaintexts are contiguous in any donor, or that Cicada used this cipher.** Selective F holds, new per-page maps, three-or-more residual outputs, different symbol coding, or an independently sourced key remain outside the theorem.

### A local doublet patch cannot rescue either

The manuscript has **86** actual within-page adjacent-equal ciphertext pairs across the nine chapters, distributed as **[4, 6, 9, 10, 11, 13, 12, 18, 3]**. A natural rescue story is that only these rare visible doublets invoke an exceptional rule. Grant each event its own plaintext rune **and the immediately following rune** as completely unmodeled exceptions (up to 172 free positions total, generously ignoring overlaps, pages and the exact residual symbol). The remaining native letters still require

```text
minimum additional unexplained positions >=
    sum_over_chapters max(0, max_x N[j,x] - B[j] - 2 * doublets[j]).
```

The exact same 18 complete native donor families have a **minimum of 48 more exceptional positions** even after *every original doublet and its next physical rune* is freed. The minima by donor and spelling are Gibran **70/70, 58/58, 107/107**; Shakespeare **53/74, 48/70, 62/94**; Emerson **123/123, 110/110, 145/145** (each pair full/body). Therefore the simple source-visible 86-doublet **single- or two-position local patch** is insufficient to make the two-output chapter maps fit any of these complete native sources. A doublet-triggered state change persisting for three or more symbols, special F semantics or a different cipher architecture is not excluded by this bound. This does not claim to identify which original positions are genuinely special.

## Physical-page-private alphabets: all 55 reset boundaries and 110 secret charts

A more permissive rival permits the two output charts to be replaced at **every original nonempty physical page**, not just at nine illustrated headings. This is 55 wholly unrelated page-private pairs (110 hidden bijections); each page has its own unconstrained starting rune and may have its plaintext freely reordered internally. The unique first rune of a page is omitted from its residual count. Neither key material nor a state-switching schedule needs to be inferred.

For each page `p`, the key-independent cap for any native rune is the top two within-page GP29 predecessor-difference bins **plus one free page initial**. The exact 55 caps lie between **12 and 39** (sum 1,573); they are frozen by the unmodified 12,956-rune original and cannot be increased through a different pair of bijections or through state switches. For a matching contiguous native donor window partitioned into the **55 exact source page lengths**, the minimum number of positions that *cannot* be explained by those page-private two-output maps is

```text
E_page >= sum_{physical page p}
          max(0, max_{native rune x} nativeCount[p,x] - pageTwoOutputCap[p]).
```

Every sliding 12,956-rune window of all three tracked controls, with the same predeclared **three** GP spellings and **two** boilerplate policies, gives:

| Donor | Legacy full / body | Greedy full / body | Latin letter-spelled full / body |
|---|---:|---:|---:|
| Gibran | 45 / 45 | 42 / 42 | 66 / 66 |
| Shakespeare | 41 / 51 | **35 / 47** | 41 / 62 |
| Emerson | 52 / 73 | 49 / 60 | 78 / 79 |

**All 18 families still require at least 35 out-of-model positions**, notwithstanding an independent pair of secret 29-way alphabets on every one of the **55** pages and adversarial plaintext order within each. This is weaker numerically than the chapter-static 190 lower bound **because page-private maps are more expressive**, and it makes an important architectural decision: merely resetting two fixed output charts at each physical page does not reproduce any pinned native complete-book passage without a separate exception law.

In a second extremely generous source-visible escape, mark every one of the **86 original within-page doublets and the following physical rune** as exempt from this page-private alphabet model. The remaining necessary unmodeled positions, after subtracting up to `2 × doubletsInPage` from each page's individual symbol deficit, are:

| Donor | Legacy full / body | Greedy full / body | Latin letter-spelled full / body |
|---|---:|---:|---:|
| Gibran | 17 / 17 | 14 / 14 | 25 / 25 |
| Shakespeare | 11 / 11 | **7 / 12** | 11 / 12 |
| Emerson | 15 / 24 | 9 / 20 | 26 / 30 |

**Even the best reference window requires seven more unexplained rune positions**, separate from the marked doublet-and-successor patches. Because seven is small relative to the book, this does **not** rule out a genuine extra sourced event channel, a prolonged state transition at some of the 86 marks, a partial literal-F bypass, nonnative data, or a new chart on word boundaries. It only rules out a *fully specified two-chart-per-page sender with no such extra mechanism* for these donors. The new 55-page bound is evaluated by a sliding incremental count-histogram algorithm in the same Node22 SFT; it does not depend on solving any unknown cipher key.

## Independent literal-F hold branch: stronger obstruction, no inferred universal F rule

The original known-key WELCOME/LP2 p56 mechanisms allow a literal plaintext F to pass without consuming a key symbol. That does **not** establish that every physical F printed in unknown pages is literal plaintext F. Nevertheless test that explicit alternative rather than extrapolating the ordinary differential law.

If each physically printed GP0/F is literal plaintext F, does not update the previous *consuming* ciphertext symbol, and cannot represent any other plaintext rune, then the original p40–53 section has **125** such F symbols. Omitting them and assigning the **first non-F symbol of each of the 13 pages** an arbitrary plaintext gives exactly **2,870** eligible non-F predecessor differences. Their two highest residual counts are **117** and **117** (GP indices 2 and 23). A single fixed non-F plaintext rune can therefore occur at most **117+117+13 = 247** times under two arbitrary chapter-wide output charts, even if the rest of the native plaintext is in an arbitrary order. Every one of the same 18 3,008-rune donor variants has non-F maximum-letter count at least **260**; 0 windows satisfy the necessary bound. This is a **different original residual register**, not the ordinary difference histogram with printed Fs merely deleted.

A second, more general obstruction does not need the differential model at all: an all-physical-F-literal one-rune-per-plaintext-symbol model fixes **125 plaintext Fs** in the section. Across **all** 3,008-rune windows of the same three native donors and all six normalizer/book-matter variants, the largest F count is Gibran **109**, Shakespeare **96**, Emerson **119**; no window can supply 125. This excludes that *all-F-literal hypothesis* for these finite native references under any other one-rune-per-rune cipher too. Partial, selectively sourced F holds, plaintext with a different F rate, inserted symbols, or different spelling remain open. It would be unsound to infer a general manuscript-wide F-interrupter rule from the solved sample.

## Extra word-order-independent and order-dependent controls

An independently exact weighted-box optimization on the **2,969** within-page residual trigrams finds maximum **10** occurrences inside any **2×2×2** choice of GP output-symbol supports; the same algorithm gives **21** for **3×3×3**. Two independent full-length donor tests using matched original page boundary masks give minimum maximum native-trigram counts **27/15/15** (Gibran/Shakespeare/Emerson), so the two-chart hypothesis also fails the stricter order-preserving trigram test. For three charts, the same source windows do have necessary-condition survivors: **0 / 11,655 / 5,898** from **59,485 / 214,099 / 318,320** windows respectively. These are not decryption candidates or sufficient tests. The two-chart conclusion does not rely on this trigram gate.

The theorem permits chart switches on *every* consuming symbol, including source-private schedules, unknown initial states and unknown mappings. It also permits all page initials to carry any plaintext character. The all-secret source test is checked by a constructive native-English plant: two independently shuffled 29-way alphabets and independently chosen page initials, with per-rune state switching and exact inversion of all **2,995** consuming positions. A positive plant is a functional control, not evidence for the manuscript's mechanism.

## Research choice

Do not allocate further key searches to a **single or two-output, one-symbol-per-native-rune chapter-private predecessor-difference alphabet** for p40–53 or the whole nine-chapter original layout. A continuation must justify **at least three possible residual outputs for the same frequent plaintext rune**, or give an independently sourced *within-page* chart reset or more-than-two-symbol local exception law, a **selective, not universally literal physical-F clock**, variable-length or different symbol representation, or a non-prose content hypothesis. For three charts the box test remains inconclusive; it does **not** warrant an unconstrained three-chart key search. This excludes a plausible decoder family but does not by itself recover any part of LP2.

**Reproduce:** `node sims/lp2_chapter_private_twochart_capacity_sft.cjs` from repository root, with only the three tracked donor texts and the original `lp2-corpus.json`. The exact tensor optimizer, both predecessor-register histograms, all nine chapter and 55 physical-page capacities, complete-book sliding counts, alternative source normalizers, 39 boundary masks and ordinary two-chart plant were run in connected V8 against these pinned files; the standalone Node entrypoint should be rerun on checkout before treating the wrapper as separately verified.
