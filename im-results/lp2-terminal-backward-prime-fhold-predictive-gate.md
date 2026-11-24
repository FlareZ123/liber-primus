# Terminal-ornament reverse prime/F clock: original predictive inverse

**Agent14, 24 November 2026. Decision:** reject the fixed reverse-reading transfer of the authentic p56 prime-minus-one/F-hold cipher at the first 3,302 prime origins on original p54–55 as a direct native-prose solution. No unknown plaintext or authentic key recovered.

## Premise and frozen receiver

Original physical p55 (archive 72.jpg) ends with a red 13-dot ornament. The immediately following independently solved p56 is titled AN END and uses an authentic forward prime-minus-one sequence with literal plaintext F (GP index 0) bypassing the clock. This motivates a test of a *separate* clock starting at the terminal glyph and proceeding backward through the actual p55→p54 ciphertext tape. It is not evidence that the author intended backwards reading: a terminal punctuation mark alone need not select any operation. The [shared monotone p55/p56 clock obstruction](lp2-p55-p56-p57-public-reset-backward-state-gate.md) concerns a different model; no attempt is made here to change the established p56 rule or inherit its state.

Use p54 (232 runes) concatenated with p55 (76 runes), then reverse the full 308-rune tape, without changing a glyph, adding separators, or resetting at their seam. Let zero-based prime origin o range 0..3301 inclusive and consuming count k start 0. At reverse traversal position i, literal P=0 emits C=0 with no advance; P≠0 emits C=(P+prime[o+k]−1) mod29 and advances k. For C=0 both a hold and legal consuming alternative are considered; for other C, consumption is mandatory and a computed P=0 is forbidden. In particular this is not a ciphertext-F skip. Origin 0 is the source-analogue default. The extended range is a finite sensitivity test, not an authenticated source key selector.

Freeze a reverse-native GP trigram model (add 0.2 per symbol and two start sentinels) on solved sections 0,2,6,7,8 of resources/external/relikd-solved-gp29-native-v1.json; the four target donor sections 1,3,4,5 are excluded. Preserve every possible clock state and last-two-symbol history in Viterbi, with best score per state. Score the first 76 traversal runes (p55) only, select the best origin and highest-scoring complete prefix path, freeze the terminal clock and language state, and predict the remaining 232 traversal runes (p54). Full-tape reachability over all origins is a separate mathematical check; it must not select the predictive key.

## Positive controls

The ordinary forward origin-0 authentic p56 control re-encrypts **85/85** actual original runes. Reverse plants use the final 308 runes of each excluded donor, reversed and encrypted under the stated law; select origins solely on the first 76 and predict 232 untouched runes.

| Excluded native donor | Plant origin | Selected origin | Prefix exact | Holdout exact | Suffix log-score / rune |
|---|---:|---:|---:|---:|---:|
| WELCOME | 0 | 0 | 76/76 | 232/232 | −2.862437 |
| first KOAN (published donor, not source-corrected) | 331 | 331 | 72/76 | 210/232 | −3.177151 |
| LOSS OF DIVINITY | 1330 | 1330 | 76/76 | 232/232 | −3.031687 |
| jpg107–167 | 3299 | 3299 | 76/76 | 232/232 | −3.064595 |

All four selected origins are exact, 906/928 withheld runes recover, and all four selected complete inverses replay exactly. The KOAN discrepancy is a real language/path-selection error despite the correct origin, and demonstrates that the hold mask is not necessarily identified by key recovery. These are finite synthetic plants, not an independent historical reverse-cipher solution.

## Original result

747 of 3,302 origins admit a p55 prefix path; only **five** admit any complete 308-rune inverse. The literal source analogue (origin 0) fails even p55. The prefix-only winner origin **3294**, score **−3.3206349043** nats/rune, narrowly beats origin 2805 (−3.3215403070); its frozen prefix state has **no legal p54 continuation**. Its natural-order p55 begins TH I G W I Y O Y G H W C J AE NG F IA O EO TH EA S X H; no sustained prose.

For completeness, retrospective full-tape Viterbi over every mechanically legal origin gives:

| Origin | Exact optimum score / rune | Exact replay |
|---:|---:|---|
| 481 | −3.401898402 | 308/308 |
| 1043 | −3.429432702 | 308/308 |
| 224 | −3.433448920 | 308/308 |
| 1431 | −3.434156883 | 308/308 |
| 1429 | −3.451343368 | 308/308 |

All five complete highest-scoring candidates are nonprose, and replay is automatic given the legal inverse. Full natural-order candidates are emitted by the SFT. None was used to select the frozen predictive origin. Retrospective language scores are not an all-path language impossibility; the exact reachability counts alone are independent of the language model.

## Decision and reproduction

The source-analogue origin fails, the calibrated reverse-reading origin estimator cannot predict original p54, and all five retrospective legal origins have poor output. Retire this finite direct reverse prime/F transfer; a genuinely different authored state/receiver would be needed, not further arbitrary start sweeps. This does not exclude all reverse or nonmonotone ciphers, alternative prime functions, independently reset keys, or arbitrary origins beyond the stated finite domain.

Run the read-only [CommonJS SFT](../sims/lp2_terminal_backward_prime_fhold_predictive_sft.cjs) from the repository. The exact core function was executed in the isolated JavaScript runtime using the repository's pinned corpus and solved donors; no Windows CI run is claimed. Script commits 2adff476 and 879ab7a0. The unmodified original JPEG was inspected locally for the terminal ornament.
