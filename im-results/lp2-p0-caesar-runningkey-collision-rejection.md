# Caesar I.30 *sequendi rationem*: original p0 running-key collision-rejection inverse

**Agent34, 22 November 2026. Classification: bounded source-motivated negative.** The original red heading's proposed `SECUENDI RATIO` reading is conditional, and no Cicada-authored evidence chooses Caesar's *De Bello Civili* as the secret key. Nevertheless the literal historical phrase invites a finite continuation stronger than the already rejected repeating `POMPEI` key. This experiment tests the actual passage text as a non-repeating GP29 running key, with ciphertext-repeat-triggered key skips. **It does not recover any unknown LP2 plaintext.**

**Independent native Windows execution:** [passing Node22 GitHub Actions run 44974287192](https://github.com/FlareZ123/liber-primus/actions/runs/44974287192) using the [manual test workflow](../.github/workflows/agent34-caesar-original-p0-skip.yml). Source and assertions execute against the committed original corpus, so these are tested output values.

Reproducer: [Windows-compatible Node22 single-file test](../sims/lp2_p0_caesar_collision_skip_sft.cjs) · [source-leading report](lp2-p0-sequendi-ratio-caesar-source-lead.md) · [conditional title analysis](lp2-p0-red-heading-sequendi-ratio-route-check.md).

## Independently selected inputs and exact operation

The original p0 physical image has **13 genuine red heading runes**, followed by 249 original black body runes. Its actual GP29 indices are loaded from `resources/liber-primus/lp2-corpus.json`. The key is the public-domain Latin text of Caesar, *De Bello Civili* I.30.1, beginning at the literal **SEQUENDI**, rather than at a tuned text offset or an arbitrary Latin word. Its 748 letters fit the test, mapped directly to GP rune indices using Q/K→C, V→U, Z→S and J→I. No English digraph compression is imposed on this Latin-letter register; doing so would contradict the conditional 8+5 title's proposed letter-by-letter reading.

The frozen candidate encrypts a plaintext GP symbol with `C_i=(P_i+K_t) mod29`, starting at text-key letter `t=0`. If it equals the preceding **emitted** ciphertext symbol, the encoder rejects that output and advances the Caesar key one extra letter, then emits `C_i=(P_i+K_(t+1)) mod29`. Only one rejected draw per symbol is permitted in this explicitly bounded model. It otherwise consumes one key letter. This is the simple reversible collision-avoidance extension motivated by LP2's severe adjacent-equal deficit; the book does not authenticate this transducer.

To invert the original ciphertext, the solver branches between no skip and one extra key draw. A skip branch is *algebraically admissible* only if the observed cipher difference satisfies

`(C_(i-1)-C_i) mod29 = (K_t-K_(t+1)) mod29`.

Candidate paths retain their last two inferred native GP runes, key position, and log score under a native-GP trigram model trained on the first 70% of a separately solved Cicada LP reference. Reversible forward encryption of authentic native GP text supplies a stronger positive than arbitrary random-key round trips.

## Original versus planted control

| Receiver | Rune length | Key skips selected | Native plaintext agreement | GP29 IoC | Log score |
| --- | ---: | ---: | ---: | ---: | ---: |
| Authentic solved-LP plant, Caesar-key collision-avoidance encryption | 249 | 11 | **245/249** | **0.0621842208** | −662.0482 |
| Untouched original p0 black body | 249 | **0** | no independently known plaintext | **0.0339746081** | **−1311.0342** |

Plant and original use the same key and identical width-500 beam. The plant recovers 98.39% of true symbols despite **11 real skip events**, proving that the decoder's state law can identify the authentic key path on strong native GP prose. On the original, 17 legal skip branches arise during the search, but none improves the best native score: the resulting zero-skip path begins `TOEUAJTHEAOECWOEHRHGAEMOEFCXEANAEUDIATHAEORWXOEIAIANGNGTNWHHHOE...`, and its IoC remains near uniform **1/29=0.03448276**. A stronger skip penalty (−3.4 instead of −2.1) produces the same zero-skip best path. Exact source re-encoding is guaranteed for the zero-skip path, but arithmetic invertibility alone is no evidence of a correct plaintext.

## Decision and source limitation

The **source-fixed direct Caesar running-key cipher with at most one ciphertext-collision-triggered redraw per rune** fails to decrypt even the 249-symbol original first-page body. The live language discrepancy is more than 649 log-likelihood units from the positive plant, and no meaningful Latin or English text appears. This is a bounded negative of the source-motivated key/transducer pair, not a general proof against Caesar as a literary clue, multiple reject draws, a different key start specified in a missing historical artifact, a second cryptographic layer, or a non-GP/intermediate plaintext.

The earlier direct Caesar shift/`POMPEI` experiments and historical source audit are retained in their original reports. This experiment does not authorize larger Caesar-text offset sweeps or retrospective choice of a better language passage. To advance the conditional red-heading interpretation, an independent original instruction must specify a new key or precise original-cipher consumer and produce an untouched GP plaintext interval.

**Primary source coordinates:** original LP2 physical p0 ciphertext offsets13–261; solved-LP native control last249 runes; Caesar *De Bello Civili* I.30.1 starts at `SEQUENDI RATIONEM` (public domain).
