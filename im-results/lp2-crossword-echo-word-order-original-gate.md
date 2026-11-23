# Original LP2 word-boundary echo coupling: exact conditional result

**Classification:** new, reproducible original-input cipher constraint; **no recovered plaintext, source-selected key, or proven encryptor**. This study isolates a specific consequence of the already established book-wide 86-adjacent-equal-rune anomaly. It does not rebrand the global anomaly as a new independent clue.

## Original reading and independent premise

Read the actual LP2 physical pages p0–p55, skipping the runeless numerical p50. The source is `resources/liber-primus/lp2-transcription.txt` with the exact per-physical-page rune strings checked against `resources/liber-primus/lp2-corpus.json`. Actual printed `-` and `.` separate source word units; slash/newline denotes page-image line geometry, not a space. Each page is read separately, so a complete word continued across a page edge contributes two *page-local units*. This yields **55 original rune-bearing pages, 12,956 original runes, 2,928 page-local units** (compare 2,896 complete words across pages).

Of the **12,901 same-physical-page adjacent rune pairs**:

| Original position | Eligible adjacent pairs | Identical runes | Rate |
|:--|--:|--:|--:|
| Inside an original printed word unit | 10,028 | 63 | 0.62824% |
| Across two adjacent original printed units | 2,873 | 23 | 0.80056% |
| Combined | 12,901 | 86 | 0.66662% |

Both positions carry the remarkable repeat suppression. A word-local encryptor that resets to a fresh, independent 29-symbol ciphertext state at every printed boundary would usually lose the inhibition there, unless it incorporates an additional boundary-specific rule, a constrained ordering, or already-correlated word initials/finals. The exact conditional comparisons below distinguish some of these alternatives.

## Exact word-order experiment

Freeze *all 2,928 actual source units, including every internal rune and original page*, and permute their placement within each page. Any copied word stays intact and all original multiset counts and word lengths survive. The exact mean number of equal boundary pairs is

\[
\mathbb E[D]=\sum_{p}\frac{\sum_{r=0}^{28} n_{\mathrm{first},p,r}n_{\mathrm{last},p,r}-n_{\mathrm{samefirstlast},p}}{n_{\mathrm{units},p}}=99.08374289405.
\]

The numerator excludes assigning a physical word to itself as its own immediate predecessor. This exact expectation is close to `2873/29 = 99.06897`, but uses the actual glyph distributions, individual words, and page sizes.

| Source-conditioned null | Boundary repeats expected | Actual | Outcome |
|:--|--:|--:|:--|
| Shuffle complete original units within each source page | 99.08374 (exact) | 23 | 20,000 frozen-seed randomized manuscripts: no equally low result |
| Shuffle only within each original page **and word length** | approximately 98.3 | 23 | 20,000 frozen-seed randomized manuscripts: no equally low result |
| Shuffle only within each original page, word length **and first rune** | **35.66666666667 (exact)** | 23 | **Exact** lower-tail probability **0.00000180763508594** |

The last null has no free choice of page, first rune, or printed word-length slot. Each source word is assigned to a slot within its equal-(page,length,first-rune) group, with original word endings and interior runes carried unchanged. Only its last-rune placement can change the equality at the immediately subsequent boundary.

There are **2,567 groups** under that conditioning, with maximum size **four**. Exactly **32 groups** have a variable echo count at all. Exhaustively enumerate every allocation of words in each group (at most 4! assignments) and convolve their independent integer-valued distributions, producing an exact total-pair distribution, with no sampling error. The absolute mathematical minimum is **21 boundary repeats** and the original produces **23**, just **two extra above the minimum**. The exact conditional mean is 35⅔, SD ≈2.8987545. `P(D<=23 | fixed page, length, initial-rune, original word multiset)=1.8076350859363091e-6`.

This extreme tail is **conditional on a very specific random-order null**. It is not a global discovery-adjusted probability for the author's cipher design, and a language with unusual word ordering could cause other dependencies. The manuscript-wide repeat deficit was known beforehand. The new and more discriminating fact is that conditioning on every *printed word-initial rune and word-length slot* still leaves the observed sequence near the combinatorial no-echo optimum.

## Source-native control and explicit constrained-emitter positive

The exact random-order tail is compelling **only relative to its stated word-permutation null**. For a causal comparison, the [second original-input SFT](../sims/lp2_crossword_echo_native_controls_sft.cjs) checks two independent mechanisms while preserving actual physical page sizes, the 2,928 page-local word-length slots, and 2,873 source boundary locations.

* **Native-GP readable text:** Thirteen disjoint 2,928-word windows from the committed 39,835-word source-native, word-preserved **Latin Vulgate GP29** control, placed in those same original 55 page word-count shapes, have observed/conditioned-expected boundary-echo ratios **0.9270–1.0020**. In these unencrypted natural-language GP word streams the first-rune-and-length-controlled permutation expectation mostly explains genuine word-edge matching. This is a source-native Latin control, not a claim to sample every possible English orthography or the unknown LP2 plaintext.
* **Continuous near-no-repeat emitter:** Generate 1,000 entirely new 55-page GP29 rune streams using the authentic word-length slots and original page lengths. Choose exactly **86** of the **12,901** legal within-page rune transitions as exceptional *repeat* transitions, uniformly without replacement; all other transitions move by an independently uniform element of `{1,…,28}` modulo 29. At each physical page start, choose a fresh rune uniformly. This emitter needs **no knowledge of the actual original rune values**. It yields mean **19.191** cross-word equalities and a mean source-conditioned expectation of **28.96783**. The model's mean observed/expected ratio is **0.660737**, SD **0.082640**; the original **0.644860** is entirely ordinary within the model (**424/1,000** simulated ratios are at most the original).

| Independent input / model | Boundary echo ratio observed / exact conditioned expectation |
|:--|--:|
| Original unknown LP2 ciphertext | **0.644860** |
| Source-native, readable Latin GP29: 13 windows | **0.927002–1.001800** |
| Uniform nonrepeat-transition GP29 emitter with 86 source-sized escapes | **0.660737** mean |

The gap between the original ciphertext and natural-language control therefore has a **constructive, simple causal explanation**: a previous-rune-constrained *continuous* ciphertext producer with sparse escapes. The native-GP control weakens the rival that ordinary human language word order **alone** causes the strong first-rune-conditioned anomaly. This is a mechanism-class consistency test, not a demonstration that Cicada selected the exact model. Specifically the emitter requires **extra plaintext and escape-location information** to be a full lossless cipher, and its sampled ranks are independently random rather than decoded original English. It does not supply the original author’s sidecar, key, or plaintext. A source-authenticated reversible receiver remains the decisive next input.

Both the original word-order exact SFT and the causal control SFT passed source-read-only Windows Node22 ([source-native and emitter positive run 45088682633](https://github.com/FlareZ123/liber-primus/actions/runs/45088682633)).

## Mechanism implications and next discriminating decision

Three materially different routes remain:

1. The cipher applies a **previous-ciphertext-rune exclusion/avoidance** continuously over printed spaces, allowing a small explicit exception channel. A continuation from each prior word's final glyph to the next word's first glyph predicts simultaneous within- and across-word suppression.
2. The creator **chooses or changes printed boundaries after encrypting** a constrained whole-book stream. This also preserves the cross-boundary deficit, but has different predictions about original line wraps, punctuation and whether plausible source words are reconstructed.
3. The ciphertext words are selected or permuted with **end-to-next-initial compatibility**, perhaps under source instructions, while a separate high-entropy cipher generates their interiors.

A candidate that claims independent per-word keys now needs an explicit **source-authenticated cross-boundary matching mechanism**, or it fails this original-book necessary feature. A proposed reversible inverse should specify the previous-rune state across every original `-` and `.`, its true page-reset clock, how the 86 repeat exceptions are carried, and a held-out original-page plaintext prediction. Mere synthetic roundtrips or fitting an arbitrary 29! alphabet cannot choose its true key.

The source-local p50 exit **W-W** doublet observed by Agent1 is an independently visible possible state-reset site, but one doublet cannot select an opcode; do not relabel it as proof of a reset. The existing LP2 rank28/GP26/GP27 constrained-coding proposals cover different source capacities and should be evaluated against this **additional boundary-coupling** fact rather than re-run from scratch.

## Independent reproduction

[Exact original SFT](../sims/lp2_crossword_echo_wordshuffle_original_sft.cjs) reads two committed canonical source files, asserts all 55 per-page rune strings, verifies the 86=63+23 partition, computes the exact unrestricted expectation, evaluates the exact fixed-first-rune class distribution, and runs three deterministic 20,000-book whole-word randomizations. The script uses only Node 22 standard libraries. Run with the existing manual read-only CommonJS Windows workflow (no new CI setup).

**Interpretation limit:** the experiment gives a constraint on a viable encoder. It produces **no authentic unknown LP2 plaintext**. The exact p-value refers solely to the stated finite randomization model.
