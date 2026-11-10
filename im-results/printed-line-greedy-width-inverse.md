# LP2 printed-line greedy-wrap inversion: held-out recovery of a stable visual-width code

**Evidence status, 2026-11-10, Agent 47:** original-transcript source-layout inference, independently evaluated on physical pages not used to fit widths, with an exact per-page rune-inventory null and native-JPEG page check. This recovers a **predictive relative glyph-width profile and approximate line-ending rule**, not an original LP2 cipher key or any unknown plaintext. It develops a new mechanism for the already observed line-initial rune bias in [printed-line investigations](printed-line-phase-invariant.md).

## Mechanism and source-locked experiment

The original Liber Primus images lay out many runic lines against a nearly fixed right margin even while rune counts vary. A greedy fixed-pixel-width line wrapper is a candidate explanation: for glyph-advance widths \`w[0..28]\` and visible word separators \`w[-]\`, \`w[.]\`, with line capacity \`W\`, a physical line ending before the next glyph must satisfy

\`\`\`text
sum(w[token] for token on printed line) <= W
sum(w[token] for token on printed line) + w[first token of next line] > W
\`\`\`

This **necessary one-step inequality** permits direct inversion of relative glyph widths using known original ciphertext runes and their *printed line breaks*, without guessing a plaintext or cipher. The 29 width values have no cryptographic interpretation by themselves. The model permits page text to continue across graphic line breaks and does not assume that a displayed line is a whole word.

Use the exact \`resources/lp2-transcription.txt\` 55 rune-bearing unsolved pages, 12,956 runes, preserving each printed slash-delimited line and page. Map all 29 GP glyphs to individual tokens, with \`-\` and \`.\` given two extra non-rune advance widths. Other transcription section markers are omitted; only a pair of consecutive lines containing **at least 18 runes on both sides** is eligible. This freezes **501** of the 539 original page-internal line joins. Split *physical pages*, with 245 joins on pages 0–25 for one fit and 256 on pages 26–55 (rune-free page 50 absent) for the independent reverse fit.

The encoder chooses nonnegative relative widths and one shared line capacity to minimize **squared violations** of the two inequalities over training lines, with fixed 0.005 ridge regularization, a gentle width-scale anchor and 2,500 deterministic Adam steps. Training is fully source-indexed; no GP-English model, word dictionary, hidden plaintext guesses or held-out line positions influence fitted parameters. The null shuffles the **29 rune identities within each actual physical test page**, preserving that page's exact rune multiset, each original line's rune count, every separator's location, and every break location. Fitted widths remain frozen in all nulls.

## Held-out predictions and controls

Two complementary tests apply to every previously unseen line. The **exact greedy feasibility** criterion accepts a line iff its actual sum lies between \`W-w[next]\` and \`W\`. The stricter practical test starts at the true beginning of an unseen printed line, follows the *actual subsequent ciphertext tokens*, and uses frozen widths to choose the greedy break; report how many glyph positions separate predicted and printed breaks. Because starts are provided for evaluation, this is **local prediction of line termination**, not an end-to-end reflow of an entire page.

| Held-out test | Learned widths | Equal-width rune baseline | Rune-shuffled null mean |
|---|---:|---:|---:|
| Later 256 joins: exactly correct break | **125/256 = 48.83%** | 66/256 = 25.78% | near 25% (not separately recorded) |
| Later 256 joins: within one glyph | **89.06%** | 56.64% | **50.19%** |
| Later 256 joins: mean greedy-constraint violation | **0.30689** | 0.91309 | **0.98442** |
| Earlier 245 joins: exactly correct break | **120/245 = 48.98%** | 84/245 = 34.29% | near 25% (not separately recorded) |
| Earlier 245 joins: within one glyph | **87.35%** | 66.53% | **51.90%** |
| Earlier 245 joins: mean greedy-constraint violation | **0.27036** | 0.70776 | **0.86675** |

The equal-width baseline has identical widths for all 29 runes, fixed separator widths 0.35 and one **training-selected scalar line capacity**; it does not get 29 separate free widths. Both held-out runs had zero of **1,000** exact page-preserving rune permutations attain the observed smaller mean violation or greater within-one-glyph accuracy, giving the plus-one empirical upper tail **1/1001 = 0.000999** *per frozen direction and statistic*. These are conditional, post-hypothesis tests, not a discovery-wide multiple-search correction.

The 29 relative rune widths inferred **independently from the two physical halves correlate Pearson \`r=0.84617\`**. The first/last partitions both rank \`ᛠ\` as the widest inferred rune (1.4763 / 1.50 in their own relative scale), and \`ᛁ\` as the narrowest (0.4765 / roughly 0.25). These are source-inferred *advance-width parameters*, not direct micrometer measurements of black pixels.

### An independent prediction of the puzzling first-rune bias

A fixed-width wrapper tends to defer a wide next glyph to the *following* line, rather than squeezing it into the remaining pixel budget. This directly predicts a disproportionate frequency of **larger-width glyphs** at printed line starts. With widths frozen from early pages, the later 242 eligible rune starts have **mean estimated advance 0.98482**, compared with **0.91566** over 1,000 exact-page-inventory shuffled manuscripts (no exceedances, p=0.000999). Reverse-heldout first-rune means are **0.90309 observed** versus **0.86492** shuffled, with **three** nulls at least as high (p=0.003996). Both comparisons use independent source pages, preserving original page glyph counts and punctuation slots.

This provides a source-grounded mechanism for the conspicuous [first printed rune collision excess](printed-line-phase-invariant.md), where \`ᛠ\` was overrepresented and \`ᛁ\` underrepresented. It does not demonstrate that *all* line-start frequency bias is caused by typesetting; a residual cipher effect might coexist.

## Native page-image contact and limits

On original JPEG \`resources/liber-primus/18.jpg\` (LP2 physical page 1), all **12** regular print lines start near native image x=601–604 and have measured dark-pixel horizontal extents **1,139–1,192 pixels** (mean **1,163.17**), even though the transcript counts vary from **21 to 24 runes**. The source image is 2,400×3,600 pixels. The [native-image geometry utility](../sims/printed_line_source_span.py) gives the exact threshold, crop, row-peak, and per-line segmentation for that check; this measures **whole-line ink spans**, not each separate glyph's advance.

Important limitations: the line-width fit is regularized and is not a unique reconstruction of the original font or its kerning; around half of line endings miss the exact one-step inequality, so a perfectly fixed-capacity wrapper alone does not explain every line. Section rubrics, intentional stanza breaks, long red initials, kerning, multiple fonts, manual adjustment, and omitted print markers can produce differences. The null preserves original line boundaries but scrambles rune labels, so it tests a particular source identity-to-break link and does not distinguish every typographic mechanism.

**Cryptanalytic implication:** the strong printed-line-first-letter marginal is now partially explained by a independently predictive *visual layout* mechanism. Treat it cautiously as a proposed key or acrostic channel unless it survives a width-conditioned null. None of the 12,956 unknown rune plaintexts, their real cipher keys, or the external puzzle destination has been recovered from this model.

## Reproduce

- Exact CommonJS inference, reverse physical-page holdout, equal-width baseline, 1,000 original-inventory null permutations and line-start test: [\`sims/printed_line_greedy_width_inverse.cjs\`](../sims/printed_line_greedy_width_inverse.cjs). Node 22 built-ins only; deterministic seeds 0x47a1f34b and its XOR with 0x92538253.
- Combined manual-only [printed-line workflow](../.github/workflows/printed-line-phase-manual.yml), [successful original run 42776323182](https://github.com/FlareZ123/liber-primus/actions/runs/42776323182), contains the full numeric widths and both 1,000-shuffle control distributions.
- Independent page-image crop and runic-line extent measurement: [\`sims/printed_line_source_span.py\`](../sims/printed_line_source_span.py), using original \`18.jpg\` with Pillow, NumPy and SciPy.
