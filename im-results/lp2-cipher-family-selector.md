# Cipher-only family selection: authentic-control gate (#2822)

**Agent12, 25 November 2026. Decision: failed family selector, no unsolved LP2 family labels generated.** The classifier recognizes clear/monoalphabetic material and the genuine WELCOME cipher, but cannot distinguish the genuine shorter native keyword and prime-clock examples confidently. No unknown plaintext or key.

## Frozen design

Use eight generic, length-normalized ciphertext features: unigram collision Z, GP index-zero excess Z, adjacent-equality Z, modular-difference collision Z, maximum lag 2..20 equality excess relative to the tape's baseline collision rate, maximum q=5..16 equality excess under possible latent zero holds, even/odd rune-distribution chi statistic, and within-word minus seam adjacent-equality contrast. The latent-F feature counts a nonzero endpoint pair for q when its intervening nonzero distance is <=q<=physical distance; it grants arbitrary zero holds and does not decode plaintext or select a key. GP index zero has authenticated special status in native keyword and prime-clock enciphering. No page identity, language fitting, or original LP2 anomaly values enter the score.

For every authentic target's exact complete printed group lengths, draw donor words of corresponding lengths and apply the same punctuation/group mask to every class. Length-matching fallback uses contiguous donor runes when a requested group length is absent; only Gibran PARABLE-mask plants required this (600 fallback groups across all classes/training replicates), and held-out Shakespeare required none. Independent Gibran and Emerson training pools, Shakespeare test pool; genuine solved Cicada plaintexts not used for model fitting. Word sampling is not matched natural connected prose, so the synthetic gate is only a preliminary calibration. Every plant has independently generated key/parameters.

Six balanced training classes: clear or random monoalphabetic relabeling; GP29 additive keyword periods5..16 with native F hold, independently drawn random or donor-word keys; F-hold prime clock with independent nonzero prime origin1..464 and sign; reversible local cross-rune mixing (random invertible Hill2 or additive ciphertext feedback); reversible constrained rank28 escape law with random rank map, fixed rare or moving prime escape; iid additive pad with literal F hold. This is a finite generative class model, not exhaustive families.

Fit diagonal regularized Gaussian feature distributions per length/mask, equal class prior, 100 plants per training source/class (200/class), 80 disjoint Shakespeare plants/class/mask. Accept only winning normalized model likelihood >=.8 and squared standardized distance within the training class's 99th percentile. These normalized likelihoods are model scores, not empirically calibrated probabilities. Predeclared gate: >=48/80 correct accepted per class/mask, <=4/80 confidently wrong, and all four genuine held-out ciphertexts correctly accepted. No LP2 original classification unless both gates pass.

## Source-disjoint synthetic confusion

Aggregate four mask strata (515,319,85,95 runes respectively), 320 held-out plants per class. Full per-mask confusion matrices and fitted parameters are preserved in the JSON output.

| True class | Correct accepted | Abstain | Wrong accepted |
| --- | ---: | ---: | ---: |
| Clear/mono | 318 | 2 | 0 |
| Native keyword | 108 | 205 | 7 |
| Prime clock | 3 | 307 | 10 |
| Cross-rune mixing | 52 | 249 | 19 |
| Constrained | 104 | 211 | 5 |
| IID F-hold pad | 0 | 312 | 8 |

Fails the predeclared synthetic gate, particularly prime/pad and mixing. At the short 85-rune mask no prime, mixing or pad plant is correctly accepted. This is a negative for the declared feature set and classifier, not a theorem of universal family indistinguishability.

## Actual held-out solved ciphertexts

Use actual LP1 Wulfic canonical ciphertext and the corrected LP2 transcription. Before model scoring, replay authenticated labels on complete genuine controls: WELCOME 515/515 literal-F-hold DIUINITY (q8); second KOAN 319/319 literal-F-hold FIRFUMFERENFE (q13); AN END 85/85 literal-F-hold prime-minus-one from prime2; PARABLE 95/95 clear. No authentic keys or solved plaintext used as feature inputs. Exact original group masks used for synthetic sampling. The classifier and calibration outputs were committed before authentic scoring (630e14e94f92f2a0d303cffb9416a7a44b76ee2c, b796a0932d60b4e09772ed60822ab902d2af0aa4).

| Actual ciphertext | True family | Best normalized likelihood | Decision |
| --- | --- | ---: | --- |
| WELCOME | Native keyword | .985829 | Native keyword |
| KOAN | Native keyword | .641217 | Abstain |
| AN END | Prime clock | .321871 | Abstain |
| PARABLE | Clear/mono | .999999984 | Clear/mono |

Every top unthresholded label happens to be correct, but only 2/4 survive the frozen confidence gate and the source-disjoint confusion matrix does not support lowering it. In particular, the fact that AN END's highest score is prime-clock at only .322 is not evidence that this classifier can reliably discover that mechanism. No post-hoc parameter tuning or original unsolved chapter classification.

**Completion/fork:** retire this generic low-dimensional selector; do not use it to rank new original inversion architectures. Specific source-selected inverse operations or a separately justified discriminating feature family remain possible. No successor requested from this test.

[Reproducer](../sims/lp2_cipher_family_selector_sft.cjs): run without options for calibration, then `--authentic` to score the four genuine controls. [Calibration output](lp2-cipher-family-selector-calibration-output.json) · [authentic output](lp2-cipher-family-selector-authentic-output.json). Both actually run in connected V8; no standalone Windows/Node CI claim.
