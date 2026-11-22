# LP2 differential reserved-rune original-cipher test

**Decision, 22 November 2026.** A word-local, reversible GP29 differential decoder with one reserved global plaintext rune has an exact key-independent marker. On the unchanged original 12,956-rune ciphertext, the marker has 63 occurrences. No source-selected plaintext, key, state schedule or historical cipher has been recovered. Candidate anchors matching that low frequency fail exact lexical masks under the fixed 29,157-entry native English wordlist, while a common-rune anchor admits radically different full-book dictionary assignments with independent secret keys.

**Reproducer:** [Node22 CommonJS source SFT](../sims/lp2_differential_reserved_rune_allsecret_sft.cjs), [Windows GitHub Actions PASS 45005333870](https://github.com/FlareZ123/liber-primus/actions/runs/45005333870). It reads canonical original transcriptions, all three native English donors, the independent solved p57 positive and a fixed spelling lexicon. It emits all 29 anchors, not only the favored examples.

## Cipher and its exact necessary-and-sufficient marker

For each complete original printed word, including words carried across original physical page seams, posit
\[
C_{w,0}=P_{w,0}+v_w\pmod {29},\qquad
C_{w,j}=C_{w,j-1}+k_{w,j}(P_{w,j}-x)\pmod {29},\quad j\ge1,
\]
where \(x\in GF(29)\) is a single globally fixed plaintext rune, every word-initial offset \(v_w\) is unknown, and every independently unknown multiplier \(k_{w,j}\in GF(29)^\times\) is nonzero. For a known key, \(P_{w,j}=x+k_{w,j}^{-1}(C_{w,j}-C_{w,j-1})\). This gives the exact invariant
\[
C_{w,j}=C_{w,j-1}\iff P_{w,j}=x.
\]
The manuscript therefore reveals every occurrence position of a hypothetical fixed plaintext rune, regardless of the otherwise arbitrary keys. Conversely, for any candidate plaintext word with exactly that event mask, set \(v_w=C_{w,0}-P_{w,0}\); for every nonzero step the unique compatible multiplier is \(k_{w,j}=(C_{w,j}-C_{w,j-1})/(P_{w,j}-x)\). For zero steps, set \(k=1\). Every assigned key is valid and the original is reencrypted exactly. The SFT checks these claims for all original runes.

**Important historical limitation:** BASE29 is genuine source arithmetic, but no first-party clue selects the above difference equation, its word resets, the plaintext anchor, or the per-rune multipliers. The model is a testable cipher family rather than an identified LP2 mechanism.

## Exact corpus, language controls and results

The source has **55 rune-bearing unknown pages, 12,956 GP29 runes, 2,896 whole printed words**, yielding **10,060 internal word transitions**. Exactly **63** ciphertext doublets appear in **62** of these words. This differs from 86 source physical-page-local adjacent-equal events because the counting boundaries differ. The source parser asserts exact equality of all joined printed words and canonical physical-page rune arrays.

The original word-length slots were held fixed. Original-attested English GP encoding normalizes QU→CW, V→U, K→C and Z→S and uses solved-LP1-calibrated ING/IO contractions. For each possible reserved rune, a length-conditioned native-English donor draws a word independently for each original slot. The expected internal anchor count and SD are calculated analytically from *per-word* occurrence-count distributions. A separate literal test requires each complete original word's 0/1 doublet mask to occur in at least one donor word of exactly its printed GP rune length. Three independent donor corpora and a 29,157-entry TextBlob-derived spelling lexicon are included.

| Candidate reserved rune | Shakespeare mean ± SD | Gibran mean ± SD | Emerson mean ± SD | Original words with no matching mask in 29,157-word lexicon |
| --- | ---: | ---: | ---: | ---: |
| IA | 63.10 ± 7.27 | 66.13 ± 7.53 | 90.36 ± 8.95 | 3 |
| B | 70.13 ± 8.24 | 74.60 ± 8.07 | 64.65 ± 8.00 | 3 |
| F | 129.97 ± 11.74 | 166.78 ± 12.85 | 176.03 ± 13.49 | 3 |
| E | 1490.76 ± 33.07 | 1479.79 ± 31.95 | 1491.03 ± 32.26 | 0 |

The observed value is **63**. IA and B are count-compatible under some English donors, yet each has **three original masks absent** even from the broader 29,157-word dictionary. The historically tempting F anchor is below the donor means by 5.7–8.4 nominal standard deviations, with three lexical gaps. The eight common anchors C/N/S/T/E/L/D/A each satisfy all dictionary masks, but expected occurrence frequencies are much too high under the specified English-donor assumptions. Anchor choice after inspecting these original counts is retrospective, so no postselected rank is an authenticated clue or an independent discovery probability.

One discriminating original: global zero-based word **1476** begins on physical p27 at local rune offset **79**. It is 12 runes long, source GP29 indices [12,4,9,15,3,3,5,24,18,26,18,18]. It has doublets at local zero-based indices **5 and 11**, the exact marker mask **00001000001**. No source-native dictionary 12-rune word matches that mask for IA, B or F. This is a **finite-vocabulary exclusion**, not a proof against unknown proper nouns, other source orthographies, other languages, or independently inserted symbols.

## Independent original word-boundary clock decision

The whole original flattened GP29 stream has exactly **86** adjacent-equal ciphertext steps: **63** inside authentic printed words and **23** exactly across word boundaries (2,895 such boundaries, including across physical page locations). This separation is fixed before choosing any plaintext. Under a **continuous, no-reset** version of the same stationary-anchor differential equation, all 86 equality steps must mark the same plaintext rune x. Its 23 cross-boundary events therefore require **23 plaintext words to begin with x**, while the 63 internal events require exactly 63 occurrences of that x at positions 1 onward.

The new SFT calculates two independent count diagnostics for *every one of the 29 anchors* under each exact original-word-length source-native donor: the expected internal occurrences and the expected first-rune occurrences in the 2,895 post-initial words. The smallest possible, over all x, of the larger of those two absolute standardized residuals is:

| Donor | Best globally fixed x after inspecting data | Smallest possible max(abs internal z, abs boundary z) | Predicted first-word x occurrences vs 23 original markers |
| --- | --- | ---: | --- |
| Shakespeare | G | **7.2339** | 86.88 vs 23 |
| Gibran | EA | **4.5254** | 10.76 vs 23 |
| Emerson | EA | **4.3374** | 9.61 vs 23 |

For example, B is an attractive *within-word* frequency anchor: it predicts 70.13/74.60/64.65 internal occurrences for Shakespeare/Gibran/Emerson (actual 63). But a **continuous** B sentinel also predicts **152.63/115.69/118.73 first-position occurrences** (actual23). Native-register IA fits within-word counts for two donors, but cannot fix the substantial first-position discrepancy. These diagnostics include the full 29-anchor retrospective-selection choice and exact native word-length slots; they are **conditional source-language residuals**, not calibrated postselection p-values or algebraic exclusions for all unknown plaintext languages.

A second independent and much stronger **plaintext-language-free** gate concerns *random fresh word resets*. Suppose the first cipher rune of each new word is masked with an **independent uniform GP29 offset**, as in a natural reset model. Whatever the plaintext or the within-word cipher, equality with the previous word's last cipher rune is then iid Bernoulli(1/29) at the **2,895** original word boundaries. Such a reset predicts **99.827586** boundary doublets; the authentic count is **23**. The exact binomial lower-tail probability under that explicitly defined null is **7.442546358383232×10⁻²¹**. The SFT directly reconstructs that tail from a stable binomial recurrence, with no language or guessed key. This decisively rejects *independent uniformly random per-word initializers*, although a correlated, nonuniform, state-carrying, or sender-selected initializer remains mathematically possible.

The unchanged source GP29 **difference** histograms provide an independent channel check. Conditional on a nonzero hop, there are 28 possible modular differences. The word-interior histogram of **9,997 nonzero differences** has Pearson \(\chi^2=33.556767\) on 27 degrees of freedom against a uniform 28-step distribution (SciPy survival p=**0.1793**). The word-boundary histogram of **2,872 nonzero differences** has \(\chi^2=33.136490\), 27 degrees of freedom (p=**0.1926**). The original within-word versus between-word nonzero-step 2×28 homogeneity test has \(\chi^2=24.952063\), 27 degrees of freedom (p=**0.5771**). These do not establish exact uniformity or prove that all positions share one cipher. They show **no detected reset signature in the 28 nonzero modular hops**, alongside the extremely strong rejection of random full-alphabet word IVs. The SFT outputs both exact 29-bin histograms and all three chi-square statistics; the reported p-values use the standard chi-square distribution.

This makes the word reset a **material mechanism decision**. A continuous, globally stationary sentinel with no boundary-specific exception is strongly inconsistent with every tested native-English control. A model that **resets at printed word boundaries**, treats boundary transitions with a distinct source-specified state/escape symbol, or changes its plaintext register is not excluded by the no-reset gate. The observed original delimiters alone do not establish which such mechanism the author used. The separately solved p57 is synthetically planted and exactly decoded under both word-reset and continuous clock modes to guard the implementation.

## Full-book non-identifiability witness

For anchor E, the full 29,157-word dictionary offers at least one GP-native matching whole-word mask for **every original word**. Choosing the first versus the last matching dictionary token at every original slot produces **two complete alternative candidate plaintext streams of 12,956 runes each**. They differ at **all 2,896 words**. Deriving separate valid GF29 multipliers and word IVs from each candidate and the *unchanged* source ciphertext gives two full decoders whose forward replay equals all **12,956 of the original cipher runes** exactly. Both are contrived synthetic assignments, not authentic recovered plaintext.

At p27 word1476, E is at positions5 and11 in six matching dictionary entries. The SFT demonstrates two incompatible candidates, **BUSINESSLIKE** and **UNACCEPTABLE**, with independent fitted keys, for that identical original ciphertext word. This proves that exact ciphertext replay and valid native-dictionary words alone do not identify the keys or authorial plaintext under this high-entropy family. E itself is very inconsistent with normal native English anchor frequencies: its original count of63 is over43 donor SDs below the nominal Shakespeare/Gibran/Emerson means.

As a genuine source-native positive input, the separately solved LP2 p57 original cleartext is segmented into its 20 authenticated words, totaling **95 runes**. Three deterministically planted independent-sentinel versions (B, E, IA) each recover all **95/95** plaintext runes, preserve every zero-step marker, and reencrypt exactly. This checks the reversible implementation only.

## Decision and next causal fork

A stationary reserved-plaintext-rune differential model with **unrestricted position-specific multipliers** does not produce genuine LP2 plaintext. Under the declared native English word-length/orthography assumption, rare anchors suffer specific missing full-word masks while common anchors require severe lexical selection. The broader family cannot be eliminated for all possible plaintext languages or dictionaries. Its many full original-cipher inverse solutions make further arbitrary key enumeration pointless.

Continue this route only with an independent first-party clue fixing a *recoverable multiplier schedule and global anchor before original plaintext is scored*, or a direct source-visible state update whose held-out long original-text predictions would distinguish real language from these synthetic full-book fits. Earlier direct-output anchored affine and lag1/5/6 predecessor-feedback exclusions concern different equations; this source-level experiment should retain its precise scope. No change to the authoritative results synthesis is warranted.

**Overall research state remains unchanged:** all 56 unknown physical LP2 pages p0–p55 lack authenticated new plaintext, an author-selected decoder and a confirmed destination.
