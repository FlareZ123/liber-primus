# Independent literary running keys cannot by themselves explain the LP2 anti-repeat channel

**Current decision (26 November 2026):** neither ordinary all-consuming GP29 addition nor the distinct authentic plaintext-F variable-consumption law reproduces the joint low-doublet/visible-F structure on matched literary controls. These are finite-reference architecture discriminators, not authentic key or plaintext recoveries. The original 12,956-rune tape has 86 adjacent-equal pairs and 458 visible F runes. The existing exact spacing-free F-hold lattice also fails full-pair recovery; see [joint running-key synthesis](lp2-joint-native-running-key-recovery.md). Do not extend independent literary-pad searches without an independently selected dependency or anti-repeat mechanism.

## Original and independent controls

The untouched ciphertext is the exact canonical rune-index concatenation of physical LP2 pp0–55 from [the 2014-image-backed corpus](../resources/liber-primus/lp2-corpus.json). There are 55 rune-bearing pages (p50 is numeric-only) and 12,956 original GP indices. The direct whole-string adjacent-rune identity count is **86 out of 12,955** boundaries. Page joins are included; the already-established separate source census also reports 86 within physical pages. The result is consistent with the original near-exclusion of immediate repeats.

The independent language reference is [the retained original English text of Ralph Waldo Emerson's *Essays: First Series*](../resources/control/emerson_essays_2944.txt), a historical work available before Liber Primus. Its complete source record, including its Project Gutenberg envelope, normalizes to 317,604 GP29 symbols with the same source-known canonical aliases: K→C, V→U, Z→S, QU→CW, ING→NG and IO→IA, taking the longest authentic rune labels where applicable. A deterministic LCG seed `0x33011331` selects **500 pairs** of length-12,956 passages with disjoint source positions. Both components are English literary prose; neither uses the unknown original LP2 key or a fitted LP2 rune.

Freeze the textbook same-index `C_i=(P_i±K_i) mod29` operation, without additional plaintext-dependent alphabet rotation, hidden substitution, ciphertext-dependent key rephasing, rune skips or postprocessing. Every plant is decoded to exactly its original source passage; the exact solved p57 95-GP-rune page is also independently encrypted/decrypted under both signs. The generated key stream is continuous over 12,956 positions. This is an intentionally stronger-than-source-justified **control comparison**, as no author signal chooses Emerson or a direct running-key operation for LP2.

| Exactly reproduced measurement | Add key | Subtract key | Untouched LP2 |
| --- | ---: | ---: | ---: |
| Ciphertext adjacent equal pairs | 404–533 | 437–554 | **86** |
| Mean across 500 disjoint passage pairs | 460.248 | 492.894 | — |
| Control standard deviation across 500 | 21.699 | 21.527 | — |
| Control cases at or below 86 | **0/500** | **0/500** | — |

The full single-file CommonJS SFT [`sims/lp2_runningkey_native_doublet_gate_sft.cjs`](../sims/lp2_runningkey_native_doublet_gate_sft.cjs) contains the original length/count assertions, exact 500-pair RNG selection, no-overlap requirement, reversible `±` encoders, source-native tokenizer and exact expected outputs. No external package or hidden input is required.

## What this changes in the plaintext search

A literal **independent** GP29 prose running key, even as long as the entire manuscript, naturally produces hundreds of adjacent repeats when the plaintext is also ordinary GP29 prose. Original LP2 has roughly one-fifth the repeats of the lowest of 1,000 tested sign/control instances. Earlier external work reached the same architecture-level conclusion: [Dukotah's June 2026 key-hint synthesis](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/KEY-HINT-RESEARCH.md) explicitly uses the low original doublet rate to reject one-stage independent-English additive keystreams. **This is a new exact in-repository reproduction/control, not a novel worldwide exclusion.** Existing source-specific GEB and Cicada book-code running-key exclusions test their proposed historical **key identities**; this control asks a different architectural question: whether a generic unfitted independent English literary key would account for the manuscript's repeat suppression at all.

**Interpretation:** Do not prioritize blind searches for arbitrary literary offsets using an otherwise ordinary one-stage `±` Vigenère model. The actual LP2 generator would need a **distinct anti-repeat layer**, correlated/custom-chosen plaintext and key passages, a changed plaintext register, or a materially different transform to reconcile the original 86. None of those alternatives is ruled out by this experiment, and no original clue fixes one of them. The 500 overlapping-across-trials windows from one writer are **not 500 independent authors or an exact null for the unknown plaintext**; the table is descriptive, with no discovery p-value. Source-selected novel keys are still admissible if they predict independent original plaintext under a complete reversible method. The task remains to identify that key, method and continuation; **zero unknown LP2 plaintext runes have been authenticated by this gate.**


## Native variable-consumption F-hold decision (#3032, Agent6, 26 November 2026)

**This is a different sender from the all-consuming ± law above.** Authentic LP1 WELCOME (515/515 ciphertext runes, 11 holds, 504 consuming steps) and KOAN (319/319, two holds, 317 consuming steps) were forward-replayed against the pinned LP1 ciphertext. For plaintext P_i=0 (F), output C_i=0 and leave key index j unchanged. Otherwise emit C_i=(P_i+K_j) mod29 and increment j. Visible F can therefore mean either a plaintext-F hold or a consuming cancellation. The earlier [exact spacing-free F-hold trigram receiver](../sims/lp2_joint_fhold_spacingfree_trigram_sft.cjs) already implements the two explanations and distinct stream histories without beam pruning; its four native controls recovered only 419/2,074 plaintext indices. Repeating that lattice or the failed all-consuming semantic objective would not constitute new work.

### Independent stationary prediction

Let A(a,b) and B(k,l) be the empirical adjacent-pair probabilities of independently chosen native plaintext and key sources, and p_a and q_k their single-rune marginals. Under independent stationary streams, the key position is a function of plaintext, so the held/nonheld transition types yield the following predictions (indices modulo29):

- Visible F: p_0 + sum over a=1..28 of p_a q_(-a).
- Adjacent equal: A(0,0) + sum over a=1..28 of [A(0,a)+A(a,0)] q_(-a) + sum over nonzero a,b,k,l with l-k=a-b of A(a,b) B(k,l).

The last sum allows **k,l=0..28**; only a,b must be nonzero. The printed-F support is not simply the number of plaintext F holds. Empirical stationarity is a model, not a claim that finite literary passages are iid.

Use the three repository-pinned sources Gibran (47,629 GP runes), Shakespeare (217,106) and Emerson (306,851), word-local greedy authentic transliteration including ING→21 and IO→27, no Gutenberg header/footer where marked. For all six ordered different-author pairs, the exact empirical first/second-order formulas predict F rates 4.334–5.018% and repeat rates 3.594–3.650%. The observed full book rates are 3.535% and 0.664%. Even the latter predicted minimum is over five times the observed rate. This calculation is a descriptive independent-source model, not a universal lower bound.

### Fresh matched-window gate

For each physical geometry, draw 200 deterministic windows from each of six ordered different-author pairs (1,200 native plants per geometry, seed 0x33013032), with independent start offsets and identical lengths to original. Use the same P and key source windows for the wrong all-consuming controls, and an independent uniform consuming pad for the uniform F-hold control. The full terminal interval and its red-heading-excluded 299-rune black body are separately tested; printed word boundaries are unused. Every plant's sender and consuming count are evaluated exactly; inversion conditional on the true F mask and key is checked. The empirical control comparison is frozen and not tuned on original text.

| Geometry | Original runes | Original visible F | Original repeats | Native F-hold visible F range | Native F-hold repeat range | Both ≤ original |
|---|---:|---:|---:|---:|---:|---:|
| p0–55 | 12,956 | 458 | 86 | 486–764 | 398–549 | 0/1,200 |
| p40–53 | 3,008 | 125 | 18 | 95–188 | 78–149 | 0/1,200 |
| p54–55 | 308 | 6 | 3 | 4–28 | 3–24 | 0/1,200 |
| p54–55 black body | 299 | 6 | 3 | 4–29 | 1–21 | 0/1,200 |

At the short terminal black-body length, 19/1,200 native plants individually meet the F count and nine individually meet the repeat count; none meets both. The original full-book and p40–53 have zero or four repeated-F seams as applicable: full book four, p40–53 zero. Native plants produce 13–62 and 1–24 respectively. Uniform F-hold and wrong-clock transparent-but-consuming controls also have zero joint matches in all four geometries. Ordinary consuming addition has 0/1,200 joint matches in either long geometry, three at 308 runes, and two at 299 runes. Those short finite comparisons cannot establish the cipher identity.

The exact all-contiguous-window necessary F-support check is also recorded: an arbitrary consuming pad cannot remove any plaintext F. For the full book every candidate donor window has at most the original 458 F count, so this necessary condition **does not** exclude arbitrary dependent pads; the gap arises when independent cancellation probabilities and repeats are included. At 299 runes, 17,037/47,331 Gibran, 128,254/216,808 Shakespeare and 94,131/306,553 Emerson windows meet the six-F ceiling before encryption. This guards against promoting a sample gap to a deterministic theorem.

[Read-only CJS reproducer](../sims/lp2_native_fhold_running_key_repeat_gate_sft.cjs) and [all offsets, counts, source SHAs and controls](lp2-native-fhold-running-key-repeat-gate-output.json). Actual exact repository-input execution in connected JavaScript; standalone Node/Windows CI not run. The 4,800 native plants and matched controls are overlapping across trials and geometries; do not claim independence of all plants or a calibrated universal p-value.

**Decision:** the source compatibility gate fails on independent native literary keys even with authentic F holds. The previous exact two-stream lattice already establishes failure of weak-model blind pair recovery; no new exact-pair calibration or original plaintext scoring was performed here. Retire this specific unfitted independent literary-pad branch. Correlated plaintext/key selection, an independently sourced collision-avoidance layer, or a different mechanism remains outside scope. No authentic key or unknown plaintext was recovered.
