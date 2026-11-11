# Original LP2 28-page shared-key holdout: direct and all-secret page-Caesar obstruction

**11 November 2026, Agent 11. Classification:** source-motivated, finite original-input **negative** conditional on a repeated 28-page page-local additive keystream and an ordinary native-GP plaintext register. This study recovers **no unknown LP2 plaintext, authentic key, or destination**. Reproducer: [`sims/lp2_28page_samepad_holdout_sft.cjs`](../sims/lp2_28page_samepad_holdout_sft.cjs).

## The explicit source hypothesis

The 29-rune Gematria Primus alphabet has multiplicative totient `φ(29)=28`. The 56 unsolved physical LP2 pages comprise exactly two 28-page groups, although **physical p50 is rune-free**. The actual unique repeated two-word ciphertext `ᛞᛄᚢ ᛒᛖᛁ` appears on physical p27 and p55, **28 pages apart**, at the section opening and manuscript end. The repeated phrase's selection is retrospective, and its page-conditioned shuffle significance is only about 0.025, as documented in [the original repeated-bigram report](lp2-repeated-wordpair-structure.md). This motivates, without independently authenticating, a candidate cipher in which each page p and p+28 shares the same page-local keystream.

**Test deliberately excludes the motivating p27↔p55 pair.** Freeze physical page orientation and zero-based rune offsets. Compare p0↔p28 through p26↔p54, with p22↔p50 yielding no aligned runes. Use all published original runes from [the canonical corpus](../resources/liber-primus/lp2-corpus.json). Do not alter word order, select a shift, align repeats, or fit a language model to the tested ciphertext.

## Necessary invariants of the proposed architecture

For direct GP29 addition `C[p,i]=(P[p,i]+K[i]+a[p]) mod 29`, with **any common hidden page-local key** `K[i]` and optional **arbitrary secret per-page Caesar offset** `a[p]`, subtraction across paired pages cancels the key:

`(C[p,i]-C[p+28,i]) mod 29 = (P[p,i]-P[p+28,i]+a[p]-a[p+28]) mod 29.`

Without page offsets, equality of two ciphertext symbols implies equality of the corresponding plaintext symbols. Even with each page's unknown constant, the **maximum bin** of the 29-bin aligned difference histogram is unchanged: the unknown offset merely cyclically rotates that histogram. Each of the 26 nonempty page pairs is permitted its own independent best offset, a deliberately generous all-secret comparison.

Also test the alternative **GP28 predecessor-exclusion** register, `r[i]=C[i]-1(C[i]>C[i-1])` on nonrepeated positions, with both first runes and all adjacent repeated-runic positions excluded. The same exact cancellation and maximum-bin invariants then apply over 28 residues if both pages share the page-local GP28-rank pad and have arbitrary page Caesar offsets in that rank register. The model does not infer unknown skipped keys at repeat sites, and this qualification matters.

For source-native language calibration, the script converts fixed Shakespeare, Gibran, and Emerson texts to GP (longest-match rune encoding with documented historical letter folds); its GP28 alternative removes F/GP index0 to define a 28-symbol source alphabet. It samples independent GP windows of each aligned original pair's **exact source-observed length**, 300 manuscripts per author and model. These controls are language-register benchmarks, not claims that the plaintext necessarily uses these three books.

## Results on never-fitted original page pairs

| Test and hidden-key allowances | Original matches / positions | Original rate | Result |
| --- | ---: | ---: | --- |
| Same direct GP29 page pad; no per-page offset | **194 / 5,587** | **0.0347234652** | Native GP29 source samples: **0/900** this low |
| Same GP28 predecessor-rank page pad; no offset | **200 / 5,489** | **0.0364365094** | Native GP28 source samples: **0/900** this low |
| Same direct GP29 pad; **arbitrary different unknown Caesar offset on every page** | **338 / 5,587**, sum of independently optimized 29-bin maxima | **0.0604975837** | Native GP29 controls, each similarly optimized: **0/900** this low |
| Same GP28 predecessor-rank pad; **arbitrary different hidden page offsets** | **343 / 5,489**, sum of independently optimized 28-bin maxima | **0.0624886136** | Native GP28 controls, each similarly optimized: **0/900** this low |

The all-offset sample maxima run **at least 0.06569** (GP29) and **0.06564** (GP28) for the selected three authors; these are minimum tested native-window values across 900 samples, not universal lower bounds for English or all possible runic plaintext. The native-source comparison is intentionally generous to the cipher: the page offsets are independently and optimally fitted per pair for *every* original and control sample.

A separate matched null retains **every original cipher glyph, complete individual page, page length, and original local ordering**, but randomly permutes which second-half page accompanies each first-half page (10,000 frozen seeded assignments). Under the all-offset model, the genuine physical +28 assignment is actually **below** most arbitrary re-pairings: about **8.6th percentile** of optimized GP29 rates and **19.0th percentile** of optimized GP28 rates. Thus the source's actual +28 correspondence offers **no unusual high within-pair agreement**, even after fully fitting per-page shifts. The zero-offset version likewise sits around the 59th/60th percentiles of its matched assignment distribution, inconsistent with any obvious shared pad signal.

The SFT also constructs secret shared pads and arbitrary page offsets for independent native GP plants, checks the additive-difference identity symbol-by-symbol, checks exact GP28 predecessor rank recovery, and uses solved p57 as a native-GP collision benchmark. These are implementation controls. The original matched-null experiment is not a likelihood ratio for all cipher families.

## Decision and clear scope

**Retire the simplest 28-page periodic page-local additive-key model and its per-page-Caesar extension** for unaltered native-GP text under the stated physical page-alignment and GP29/GP28 alphabets. They have no recoverable shared-key/plaintext equality fingerprint at authentic original locations even with all 29/28 possible offset bins tested independently per page pair.

This result **does not exclude** a changing feedback register, independent page keystreams, a global continuous key instead of a page-local one, changed start offsets, non-GP intermediary/plaintext, a nonlinear substitution after pad addition, arbitrary page-specific alphabet permutations, alternate rune consumption at doublets, or a different mapping between pages. Nor does the repeated 3+3-rune phrase prove a common key or a known-plaintext crib.

The clue-to-model connection was chosen after the bigram was noticed; the native windows and page permutations are *conditional controls* and are not globally selection-corrected proof of creator intention. No new speculative follow-up branch is justified by these negative data without independent source instructions choosing a **specific additional transform**.

## Reproduce

The standalone CommonJS script loads the canonical original corpus and all three checked-in text controls from the repository. Node.js 22, no dependencies, no file writes. It asserts all four original numerator/denominator pairs, holds out p27/p55, runs 10,000 deterministic assignments per model and 300 fixed native controls per author/model, and prints measured ranges and empirical tails. Its frozen positive controls verify an actual repeated-key construction but cannot authenticate such a key on unknown LP2.
