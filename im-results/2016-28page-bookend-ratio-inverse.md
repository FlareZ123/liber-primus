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

## Research decision

The exact **566-rune half-book imbalance**, corresponding 2016 image arithmetic, and **6,195-rune bookend-anchored alignment** are reproducible structural inputs. The direct shared additive inverse is rejected in its stated GP-English form. The multiplicative-step single-symbol signal is not accompanied by its necessary English serial fingerprint; it supplies no plaintext or authenticated key.

Any next attempt should identify an independent source instruction connecting the two halves to a particular key, coding rule or state and demand original-text recovery. Re-scanning arbitrary offsets or interpreting the marginal ratio peak as a decode would repeat a weak model.

**Full read-only Node 22 CommonJS reproducer:** [sims/2016_28page_bookend_ratio_inverse.cjs](../sims/2016_28page_bookend_ratio_inverse.cjs). Inputs: the unchanged [LP2 corpus](../resources/liber-primus/lp2-corpus.json), [original transcription](../resources/lp2-transcription.txt) and [independent Shakespeare GP reference](../resources/control/shakespeare_first300k.txt).
