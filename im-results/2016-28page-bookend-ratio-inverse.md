# LP2 two-half bookend and the 2016 mean-566 correspondence

**Agent 49, 10 November 2026. Evidence class:** exact original-source arithmetic, a source-locked two-stream alignment, and key-cancellation tests with a true-key plant. **No recovered unknown LP2 plaintext, authentic key, cipher, or continuation.**

## The two 28-page halves and the repeated ciphertext

The 56 unsolved LP2 physical pages 0–55 include one numeral-only page 50. Split the physical pages into two equal sets of 28. The canonical original GP rune totals are **6,761** on p0–27 and **6,195** on p28–55. Their difference is **566**.

The archived 2016 Cicada JPEG has original dimensions **563×569 pixels**, as independently checked in [the 2016 source study](2016-image-dimensions-lag6-source-derivation.md) and its archived source. Its arithmetic mean is **(563+569)/2=566**, exactly the original half-book rune-count difference. This is a newly checked cross-source numeric correspondence, with no authenticated instruction to calculate either quantity. The 2016 image postdates the first LP2 publication; resizing, coincidence and retrospective interpretation are live alternatives.

The complete original ciphertext has exactly two occurrences of the six-runic, two-word sequence **ᛞᛄᚢ-ᛒᛖᛁ** (zero-based GP **[23,11,1,17,18,10]**, transliteration **DJU BEI**):

- global zero-based rune offset **6,555**, on physical **p27** at local rune **28**, in the last page of the first 28-page half;
- global offset **12,950**, on physical **p55** at local rune **70**, the last six runes of the entire unsolved manuscript.

Both two-word occurrences are directly present in the [canonical transcription](../resources/lp2-transcription.txt) and original JPEGs. The identical six symbols occur **only twice** among all 12,956 original ciphertext runes.

A precise source-selected two-stream alignment follows: treat the six-rune repeat as a common terminal anchor. The second half's **6,195** runes align with exactly **6,195** first-half runes at first-half offsets **366 through 6,560**. The first half's excluded **366-rune prefix** and **200-rune suffix** total **566**, matching its exact length excess. There is no tunable alignment parameter here. Whether these strings carry a shared key is a separate hypothesis.

## A complete word-inventory rarity certificate

The original text's **2,896 printed words**, using the canonical rule that page and line wraps do not end words, contain **2,731 distinct exact ciphertext word types**. There are **120 word types occurring at least twice**, with maximum word frequency five. Among all **2,895 adjacent two-word positions**, the bookend **DJU BEI** is **the only two-word sequence appearing twice**, at word offsets **1,462** and **2,894**. Its two component words each occur **exactly twice** and both instances are adjacent in the same order. In particular, the **last two printed unsolved words repeat an earlier two-word sequence** across the physical 28-page midpoint.

To calibrate discovery of *any* equally long repeated pair, condition on all 2,896 exact original word tokens, including their lengths and multiplicities, and uniformly shuffle whole-word order. Count unordered collisions between two positions occupied by the **same ordered pair of word types** whose combined length is **at least six GP runes**. Let N=2,896 and n_i be the fixed number of copies of word type i. For distinct i and j, the expected number of repeated nonoverlapping pair collisions equals

\[
\frac{(n_i)_2(n_j)_2}{2N(N-1)}.
\]

For identical i=j, add nonoverlapping \((n_i)_4/[2N(N-1)]\) and overlapping \((n_i)_3/[N(N-1)]\), where \((n)_k=n(n-1)\cdots(n-k+1)\). Sum across **all ordered type pairs whose total length reaches six**, rather than testing only the observed phrase. Direct enumeration over the exact 120 repeated word types gives an expected number of qualifying repeated pairs of **0.00006417045964179009**. Markov's inequality therefore supplies the rigorous **familywide upper bound 6.42×10⁻⁵** for observing *any* repeated adjacent pair of this length under this **specific full-inventory shuffle null**. For the two already selected word types with exactly two copies apiece, the probability that both A copies are followed by B in a shuffled list is exactly **2/[2896×2895] = 2.3855×10⁻⁷**; that narrower value is postselected and must not replace the familywide bound.

**What this supports:** the full duplicated six-rune two-word bookend is a striking and reproducible **sequence-order feature** of the original ciphertext, well outside a uniform whole-word shuffle preserving its unusually diverse word inventory. It makes the repeated opening/ending formula worth pursuing as a prospective real cipher clue. **What it does not establish:** a null for authored prose, text enciphered with stable word-level keys, page-specific punctuation or deliberately constructed repetitions. The six-rune threshold, two-word feature, image mean and half-book framing were selected during broader exploration and carry no discovery-wide adjusted probability. A repeated ciphertext formula alone does not identify its plaintext or its key.

The p27 illustration shows a single insect wing above the beginning of its passage; the last unsolved p55 shows a winged insect beneath a tree. This is a relevant **source-visible thematic correspondence**, not proof that the artwork specifies a 28-page cipher.

## A source-derived 179-word clock, and its direct-key failure

The repeated ciphertext starts at printed word indexes 1,462 and 2,894, a separation of exactly **1,432 = 8 × 179** canonical words. Both the **eight-column** 256-byte grid and the **179-rune p53** inscription are pre-existing, independent manuscript counts (the source grid's integer is also repeatedly divisible by 179). Thus the bookend points to a concrete **179-word** key clock that merits an explicitly fixed inverse. This 8×179 arithmetic was noticed retrospectively; many integer factors could have been selected, and a numerical coincidence is possible. There are **230** exact same-word occurrence pairs in the manuscript; besides the two component words of the repeated formula at separation 1,432, one other three-rune word recurs at separation 895=5×179. This additional recurrence is weak given a 179-way residue choice and is no proof of a cycle.

If a **word-index-period-179 additive GP29 key**, with per-word-rune-position symbols, encrypts both GP-native plaintexts while preserving printed word lengths, then two ciphertext words separated by 179 words **and of equal rune length** cancel the same key at each corresponding rune. The key-free source-English two-message difference likelihood is therefore a necessary fingerprint. The frozen 160,000-GP-rune Shakespeare marginal yields the following exact original data, with no fitted keys:

| Original comparison | Equal-length word pairs | Compared GP runes | Native-English difference score vs uniform |
| --- | ---: | ---: | ---: |
| Word separation **179** | **427** | **1,547** | **−34.962946 nats** |
| Terminal-bookend separation **1,432** | **197** | **758** | **−11.131327 nats** |
| Source-native true-key, shared period-179 additive pad | **427** | **1,547** | **+33.265288 nats** |

At lag1,432 the two deliberately selected exact matching terminal words are excluded from the likelihood, preventing the bookend from confirming itself. The plant creates 2,896 source-disjoint source-native GP pseudo-words in the exact original word lengths from the held-out Shakespeare tail, then masks every word with a seeded unknown 179-phase, position-specific 29-symbol pad. The same inverse cancels the hidden pad **exactly**, scoring +33.265288. The original score is decisively in the opposite direction, weakening this most direct **179-word reused additive keystream under English GP and preserved word boundaries**. A 179-word *permutation, routing, evolving nonlinear cipher, or alternative plaintext register* is not tested. The source phase and true authorial relevance are not established.

## Original-source key-free cryptanalysis

The test fixes all original runes and uses a native-GP English language model trained only on the first **160,000** GP runes of the independent Shakespeare reference. It excludes the final six identical-rune anchors when scoring both aligned streams. A complete circular shift of the second stream supplies a conditional reference distribution for each predeclared observable.

**Direct shared additive key, GP29.** Under the hypothesis that both streams were enciphered at aligned offsets with one additive keystream modulo 29, subtracting their ciphertext symbols exactly cancels the key. The expected distribution then equals a circular difference of two independent native-GP English plaintext distributions. At the exact source-selected original alignment the log-likelihood excess above uniform is **−144.937294 nats**, whereas the source model predicts about **+118.53 nats** for genuine shared-key GP English of this length. The chosen original alignment ranks **6,125th of 6,195** shifts. The natural direct additive shared-pad hypothesis is strongly disfavored.

**Shared multiplicative key on consecutive GP differences.** An alternative reversible architecture would multiply each plaintext consecutive-rune step by the same nonzero per-position key in both messages. Whenever the second ciphertext step is nonzero, their ratio cancels that unknown key without guessing its values. The original aligned six-thousand-symbol source produces a **single-ratio excess +21.457453 nats**, ranking **32nd of 6,194** circular alignments. Conditional on that statistic, this is an unusual original input and a candidate for a higher-order test.

**Decisive missing predictive structure.** Ordinary English also fixes a joint 29×29 law of *consecutive ratios*. Construct it from the same independent English reference's triplet-induced GP step pairs, and compare its serial-dependence likelihood to the product of its marginals. The original aligned ratio stream scores **−7.823304 nats** and ranks **6,113th of 6,194**, near the bottom of this held-out, key-independent structural observable. Thus the marginal peak does not reproduce the source-English pairwise dependence required by this simple common-multiplier model. A different plaintext register or more elaborate changing key remains possible.

| Necessary prediction | Original alignment score | Rank against all circular shifts |
| --- | ---: | ---: |
| Shared additive GP29 ciphertext differences | −144.94 nats | 6,125 / 6,195 |
| Shared multiplicative cipher-step ratio marginal | +21.46 nats | 32 / 6,194 |
| Consecutive step-ratio source-English dependence | −7.82 nats | 6,113 / 6,194 |

**Original-length true-key plant and power limitation.** Two independently held-out **6,195-rune** GP-English Shakespeare excerpts are enciphered with the exact same independently random nonzero multiplicative step key. An 81% soft rewrite of immediately repeated ciphertext, chosen to resemble the manuscript's repeat scarcity, changes **304** output symbols. The same ratio-only test scores the true shared-key alignment **+19.812790 nats**, ranking **210th of 6,194** circular shifts. This is a true-key positive, although the single-ratio statistic is evidently weak and can miss genuine common-key structure. An auxiliary exact-constraint Viterbi decoder recovered only 30/220 and 18/220 runes on a separate planted control, so its superficially fluent original-input outputs were rejected as model artifacts.

The rotation ranks are conditional on this retrospectively identified bookend, input register, and specific cipher model. They do not account for all earlier human exploration and are not discovery-wide probabilities of Cicada's intentions.

## Period-179 and period-1432 word-position substitution gate

The word-start displacement between the two exact occurrences is **1,432 = 8×179**. This invites a broader test than the direct additive-key screen: allow an **arbitrary bijection of all 29 GP symbols for every pair (word-index modulo 179, within-word position)**. If that substitution schedule repeats every 179 words, then any two words 179 apart use the same bijection at each shared position. The same holds at lag 1,432. Consequently, equality of ciphertext symbols at aligned within-word positions is a **key-free invariant** of the plaintext, independent of all 179×word-position substitution keys. This also covers the more general 1,432-word period at the second lag.

I compared every common-prefix position of every word pair at each lag, not only equal-length words. The exact repeated anchor pair at word indexes 1,462/1,463 and 2,894/2,895 is excluded from the lag-1,432 score so it cannot confirm itself.

| Original invariant | Word pairs | Aligned positions | Equal symbols |
| --- | ---: | ---: | ---: |
| Lag **179** | **2,717** | **8,717** | **303** (3.476%) |
| Lag **1,432**, excluding the two anchor words | **1,462** | **4,691** | **154** (3.283%) |

The original is near the uniform 1/29 equality rate, rather than the higher equality rate in native-GP English. To account for the manuscript's **86 within-page adjacent repeats**, I generated source-matched plants from each of three independent reference texts. Each trial takes a random contiguous 12,956-rune GP window, imposes the exact original 2,896-word length vector, applies independent random 29-symbol bijections for all 179 word phases and within-word positions, then rewrites **81%** of within-page adjacent ciphertext repeats by incrementing the repeated symbol modulo 29. The latter is the same soft-repair setting used in the existing bookend true-key plant; the controls retain a mean **84.5–84.8** residual within-page repeats versus the original **86**.

| GP-English reference | 2,000-control mean, lag 179 | Minimum | 2,000-control mean, lag 1,432 | Minimum |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare | **504.1 ± 24.4** | **423** | **268.3 ± 17.1** | **211** |
| Emerson | **513.5 ± 23.3** | **432** | **276.4 ± 16.9** | **210** |
| Gibran | **505.5 ± 23.8** | **434** | **268.9 ± 16.8** | **213** |

**Zero of 2,000** controls from every reference reached or fell below either original count. The add-one lower-tail Monte Carlo bound is **1/2,001 = 0.000500** for each reference and lag. The result is a conditional model test, not a discovery-wide p-value: the 179/1,432 period and English-register assumptions were selected retrospectively, and the repeat repair is one calibrated model rather than an established LP2 operation.

**Decision:** this rules against a 179- or 1,432-word periodic **bijective word-position substitution** on native-GP English, even with the tested 81% within-page repeat repair. It is stronger than the additive-only test but does not exclude a non-bijective map, nonlinear/nonperiodic state, different word segmentation, or another plaintext register. It supplies no key or plaintext.

**Reproducer:** [standalone Node 22 SFT](../sims/bookend_period179_substitution_invariant.cjs), using the original corpus/transcription and the repository's Shakespeare, Emerson, and Gibran controls.

## Research decision

The unique repeated two-word formula, the fixed-inventory rarity certificate, the 566-rune half-book imbalance and the 6,195-rune alignment are real source observations, but none authenticates a shared plaintext or key. Agent 16's independent [word-boundary necessary-condition gate](lp2-bookend-boundary-necessary-condition.md) rejects an unchanged word-segmented double copy of the aligned halves (1,380 versus 1,388 boundaries, only 297 coincident). The new period-179/1,432 invariant above also rejects the natural periodic bijective word-position substitution family, even with the tested repeat repair. Agent 33 reports no affine-reused wing graphic between the p27 isolated wing and p55 moth/tree; their thematic correspondence does not yet select a cipher operation ([image-crop handoff](../communications/agent49/20261110T2206Z_agent33_p27_p55_wing-crop.md)).

The most economical remaining interpretation is a deliberately reused closing formula or terminator, not an unchanged repeated passage. Its plaintext, encryption and authorial purpose remain unknown. Any further work on this lane needs an independently visible/source-stated operation that predicts an adjacent withheld interval; do not resume arbitrary key-period or offset searches.

**Reproducers:** [bookend structure and direct key-cancellation tests](../sims/2016_28page_bookend_ratio_inverse.cjs), [periodic word-position substitution gate](../sims/bookend_period179_substitution_invariant.cjs), and [word-boundary gate](../sims/lp2_bookend_boundary_fingerprint_sft.cjs). Inputs are the unchanged [LP2 corpus](../resources/liber-primus/lp2-corpus.json), [original transcription](../resources/lp2-transcription.txt), and the repository's independent GP-English controls.
