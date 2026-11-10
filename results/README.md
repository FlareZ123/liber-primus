# Liber Primus: current research state

**10 November 2026. The second release remains unsolved.** LP2 has 56 unresolved physical pages (0–55), including one rune-free numerical/table page (p50). The other 55 pages contain **12,956 ciphertext runes** arranged in **2,896 canonical words**. Pages 56–57 are solved historical controls. This repository has recovered **no unknown LP2 plaintext, authentic cipher key, complete cipher mechanism, or final destination**. An exact arithmetic relationship or a strong ciphertext anomaly is not a decipherment.

This entry point separates source facts, measured ciphertext properties, conditional exclusions, and prospective tests. Full methods, distributions, scripts, and failure cases remain in the linked supporting files. The original scans, [normalized ciphertext](../resources/liber-primus/lp2-corpus.json), [word/page parsing](../sims/lp2_word_pages.cjs), and [two-ink source annotation](../resources/liber-primus/lp2-ink-annotations.json) provide the input contract. Physical page numbers must not be confused with text-section indices.

## 1. Reproducible source facts

| Source evidence | Established scope | Open question |
| --- | --- | --- |
| [Page-15 Fibonacci-indexed prime spiral](fibonacci-prime-spiral.md) | All 16 entries match the previously published rule **abs(3301 − p_(F+1))**, placed in a spiral | Its intended cryptographic use and any key are unknown |
| [LP2 ink and glyph annotation](../im-results/red-microdot-motif-inventory.md) | **225 red runes** and **36 large punctuation marks** across all 58 LP2 physical pages. The red span on p53 is **51 runes**, starting with ᛏ at local [128,179). One page-7 13-dot mark is black | Whether ink events select a state, traversal, or key |
| [Source five-dot stencil](../im-results/black-dot-template-reflections.md) | Repeated reflection geometry in original artwork, with physical dot-mask comparisons | No demonstrated key or decode |
| [LP1 JPEG 05 payload](../im-results/jpeg05-palindromic-magic-square.md) | The original byte stream contains a reversed JPEG and reverse-hex encoding of the visible 5×5, sum-1033 square | No known LP2 connection |
| [LP1 JPEG 10 embedded images](../im-results/jpeg10-concatenated-pages.md) | The source contains four full JPEG streams | No independently recovered hidden instruction |

The page-15 spiral is prior Cicada-community research. The original file structures and annotations are useful fixed inputs for testing hypotheses. They have not unlocked LP2.

## 2. Strongest manuscript-wide ciphertext constraints

**Boundary dependence.** The cipher has **86/12,901** equal adjacent rune pairs within pages, including **63/10,060** inside complete words and **23/2,887** between adjacent words within sections. The observed **23** cross-word equalities are far below the **99.806** expectation when original words are shuffled within sections. The deficit survives more constrained rearrangements. A mechanism must account for both within-word and across-word behavior, including [physical line breaks](../im-results/physical-linebreak-continuity.md). [Word-boundary experiment](../im-results/cross-word-anti-repeat-constraint.md).

**Word-internal structure.** Among **1,536 complete words of length 4–9**, only **526 nonadjacent identical-rune pairs** occur. Matched solved-LP1/ordinary-English controls usually contain substantially more. Exact consequences depend on whether source words, spelling, segmentation, and transformations are preserved. A simple position-independent deterministic rune substitution per word cannot decrease within-word equality counts. The finding is a conditional exclusion of that plaintext model. [Invariant and source controls](../im-results/wordwise-equality-invariant.md). Adjacent *word-length* dependence is also unusually small; original spaces should not automatically be treated as plaintext spaces. [Word-length study](../im-results/wordlength-order.md).

**Word-local echoes.** Two post-selected patterns remain measurable: **80/1,290** eligible positions satisfy the lag-six affine rule `cᵢ = 24 − 2cᵢ₋₆ (mod 29)`, and **11** lag-five positions match ᛋ to ᛋ. The manuscript also has **nine contiguous two-hit lag-five events**. An eight-section crossfit of already-selected features gains **23.272631 nats** against its constrained word-interior shuffle baseline. These properties are reproducible, though their feature discovery used the manuscript, and the gain has no discovery-wide p-value. A **lossy M3 surrogate** is not rejected by the aggregate predictor (model-matched p ≈ **0.159**); its separate clustered and S-specific counts are inadequate. Neither surrogate is a recovered reversible cipher. [Complete joint diagnostics and failure controls](../im-results/lag5-lag6-heldout-conditional-prediction.md) · [Conditional original-versus-generator test](../im-results/lag5-contiguous-echo-second-order.md).

**Bookend phrase.** The exact adjacent 3+3-rune word pair **ᛞᛄᚢ ᛒᛖᛁ** appears near the beginning of section five and as the final two unsolved words. It is the only repeated adjacent two-word type in the canonical unsolved text. Conditional rearrangement tests flag it, but a proposed **6,395-rune shared-key recurrence** failed original-cipher tests. [Phrase and controls](../im-results/lp2-repeated-wordpair-structure.md) · [Recurrence exclusion](../im-results/bookend-repeat-lag6395.md).

**Marginal dependence.** Frequencies are close to uniform over 29 runes. Simple anti-repeat Markov controls can account for much of the one-step mutual information. Neither near-uniformity nor scarcity of doublets identifies a cipher. [External prior-art measured ceiling](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/MEASURED-CEILING.md).

## 3. Clue-linked candidates: genuinely open, with bounded direct failures

**Red-prime arithmetic.** The ink-selected spans on p40, p15 and p53 have GP prime sums **435 = 29×15**, **638 = 29×22**, and **2262 = 29×78**. With the known spiral, **p₂₂ = 79**, **φ(79) = 78**, **GP-prime at index15 = 53**, and **ord₇₉(53) = 78**. The exact p15 red-title pair and a p15/p40/p53 pointer triangle have small **conditional** null tails. The rules were recognized *after* inspecting these numbers; those tails do not establish Cicada intent. Direct repeating pads, Fibonacci/F79 exponent pads, red-derived IVs, prime-totient starts, and several AES/ChaCha and hidden-alphabet interpretations failed original-source or heldout challenges. [Triangle, test scope and later corrections](../im-results/red-span-triangle.md) · [Spiral](fibonacci-prime-spiral.md) · [F79 field study](../im-results/red-f79-primitive-root-heldout.md).

An exact algebraic restriction eliminates nonidentity projective symmetries of all nine injective **literal GP-prime residue alphabets** under the 29 GP prime moduli. The alternative **F59 quadratic-residue 29-symbol embedding** does have 58 projective symmetries, but their orders cannot directly realize the selected 28-cycle lag-six echo. These are restrictions on particular proposed embeddings, not proof of the actual mechanism. [Field-alphabet proof and positive control](../im-results/red-f79-primitive-root-heldout.md).

**A source-register correction to zero-step theories.** In a 28-nonzero-step encoding, repeated ciphertext could hypothetically represent a single omitted GP rune. The observed **86** repeats have source-word positions **23 first, 19 final but not first, 11 second but not last, 33 other**. Native solved-Cicada GP **EA** gives a closer overall count match than external-English registers, but its finite observed vocabulary contains **no word-final EA** for the matched word lengths. A 2,000-draw source-matched four-position test rejects this *particular known-vocabulary literal-EA model* at its simulation resolution. Unseen words, a different register, hidden boundaries or cipher-generated repeats remain viable. [Updated author-specific source test](../im-results/red-span-triangle.md) · [Reproducer](../sims/step_zero_ea_wordposition_heldout.cjs). Earlier claims excluding all possible zero-step interpretations from external English alone are too broad.

**LP2 pages 28/42.** The continuous-position residue-difference histogram is an unusual selected page pair; competing alignment and language models disagree, and the corresponding **printed-line-coordinate** comparison does not support the same simple shared-key story. Neither original plaintext nor a common key has been reconstructed. Expanding language scores on this already-selected pair is further model selection, not independent evidence. [Consolidated tests](../im-results/page28-page42-relative-key-anomaly.md).

**Page-local 23/46 word-length harmonic.** This is exploratory, near the corrected selection threshold. The simple 23-column transposition failed. [Corrected analysis](../im-results/word_length_order_20261110.md).

## 4. Well-tested *bounded* negative families

These eliminate specified mechanisms under their documented source and repair assumptions. They do not prove that LP2 is unbreakable or that every stateful, variable-length or alternate-language cipher is excluded.

| Family or source | Actual constraint or completed search | Evidence |
| --- | --- | --- |
| Short mod-29 affine/quadratic ciphertext feedback | **1,758,009** tested settings, authentic original outputs fail to resemble planted English-like plaintext | [Affine](../im-results/affine-feedback-through-three-lags.md) · [Two-tap](../im-results/two-tap-feedback.md) · [Quadratic](../im-results/quadratic-feedback.md) |
| Arbitrary context-selected bijective substitution rows for prior 1–3 ciphertext runes | Matching-output invariants contradict the declared GP-English plants, including flexible row tables | [Exact invariants](../im-results/previous-cipher-sbox-invariant.md) |
| Page-local fixed polygraphic bijections; per-word fixed rune maps; section-static word-initial maps | Equality invariants and source-matched controls disfavor each declared architecture | [Blocks](../im-results/polygraphic-block-collision-invariant.md) · [Words](../im-results/wordwise-equality-invariant.md) · [Starts](../im-results/word-start-reset-and-periodicity.md) |
| Shared synchronized page-reset or short-period direct keys | Phase equality tests do not support ordinary GP-English under the specified key reuse | [Phase tests](../im-results/phase-coincidence-invariant.md) |
| Fixed homophonic mapping | Data-processing bound independently supports an earlier public exclusion | [Information bound](../im-results/homophonic-information-bound.md) |
| Python 2.7 MT19937 integer seeds (all **2³²**) | Exact domain searched for **one specific random29/sign/offset/keyskip1 family**; no plaintext. Other PRNG implementations, clocking, offsets and sources remain open | [Completed domain and limitations](../im-results/py27-mt-s2-tail.md) |
| Source grid, red ink, F79/Fibonacci and OutGuess direct keys | Many direct-pad, rank-28, skip/repair and key-serialization families fail; OutGuess headers alone produce false positives on clean covers | [Grid rank-28](../im-results/grid-rank28-keyed-exclusion.md) · [Red tests](../im-results/red-span-triangle.md) · [OutGuess authenticity](../im-results/outguess-lp2-keyed-source-headers.md) |

A correctly recovered synthetic key validates an experiment's declared implementation. It does not establish that the manuscript used that mechanism. Historical family searches and their precise variants remain available in `im-results/` and `sims/`.

## 5. Research decisions with a path to actual decryption

1. **A source-constrained, reversible original-cipher inverse.** Freeze an independently justified key/state derivation from the original ink, page layout, 256-entry table or historical source material. Specify page/word resets and the treatment of all observed repeated outputs. A credible result must recover previously unfitted LP2 runes and **exactly re-encrypt** them. Use existing authentic solved-Cicada regressions and the [contextual conditional inverse](../sims/lag6_repair_contextual_inverse.cjs) as tools, with its architecture explicitly treated as provisional.

2. **Architecture discrimination before another large key sweep.** A proposed forward model should reproduce the *same heldout manuscript intervals* at the word-boundary, page-boundary, lag-five-cluster, lag-six, word-equality and printed-line levels. Report which features motivated its construction. The current lossy repair surrogates can match some selected summaries without yielding a decryptable inverse. Require a recoverable hidden state or a mathematically lossless encoding.

3. **Recoverable missing historical input.** The solved end text points to an unresolved 64-byte hash target. Bounded searches of archived Cicada-stage assets and documented candidate encodings are preferable to unconstrained guessed URLs. A verified digest match needs exact bytes and a specified algorithm before anyone infers an LP2 key. [Source-aware historic candidate search](../im-results/archive-hash-preimage.md).

4. **Alternative source language or segmentation only with a predictive decoder.** Low word-order dependence, word-internal repeat suppression, and genuine author-vocabulary mismatch make the plaintext register an open variable. Specify a reversible symbol/word-boundary map and test it on untouched original material rather than maximizing a dictionary score on the same source-selected patterns.

**Promotion rule:** a new unknown plaintext claim needs original ciphertext offsets, an explicit alphabet, an independently justified algorithm and key/state, a complete round-trip encoder/decoder, untrained original-page predictions, and documented failure controls. Preserve negative results under `im-results/` with their exact finite scope. Promote robust general findings here only when they materially change the cryptanalytic frontier.

## Research navigation

- [Original and normalized sources](../resources/liber-primus/), [solved-Cicada source controls](../resources/), [shared simulation code](../sims/), [supporting empirical and negative studies](../im-results/).
- [Active exploratory workplace](../workplace/), [broadcast coordination](../communications/broadcast/), [persistent identity context](../agents/).
- [Fibonacci spiral technical source and reproducibility](fibonacci-prime-spiral.md).

The unsolved LP2 text, unknown key(s), actual cipher architecture, and intended continuation remain unresolved. This page will be reconciled and shortened when genuinely stronger evidence supersedes a candidate or exclusion.
