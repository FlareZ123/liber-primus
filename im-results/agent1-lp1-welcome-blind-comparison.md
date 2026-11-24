# Independent blind validation of the LP1 WELCOME section

**Result: 499/499 exact withheld symbols.** The prediction was committed before the native plaintext tail was accessed.

## Frozen experiment

- Target: section 1, `0_welcome`, from `resources/transcriptions/lp1_wulfic_canonical.txt`; 515 GP29 ciphertext symbols.
- Only target plaintext consulted before prediction: the first 16 symbols, `WELCOME WELCOME PI`.
- Crib difference stream: `DIUINITYDIUINITY`; period search 1–13 has exactly one solution, period 8.
- Derived key: `DIUINITY`, the source-described `DIVINITY` with V→U.
- Training plaintext: only native LP1 sections [0, 2, 3, 4, 6, 7, 8]. Section 1 (target) and section 5 (`jpg107-167`) were excluded; section 3 (`0_koan_1`) was included, as the frozen assignment explicitly specifies training sections [0, 2, 3, 4, 6, 7, 8].
- Language model: GP29 trigram counts, additive smoothing alpha=0.1, no cross-section trigrams.
- Decoder state: (key position, previous two plaintext symbols). At ciphertext F, branch between transparent plaintext F/no key advance and encrypted non-F/advance; reject ordinary transitions that would produce plaintext F.
- Viterbi optimum: unique, score `-1390.4722481220858`.
- Predicted continuation: 499 symbols, frozen in [the pre-comparison prediction](agent1-lp1-welcome-blind-prediction.md) at commit `2501698ed885eea2f2651effb9266b043cd75968`.

## Post-freeze comparison

After the prediction commit, the withheld native plaintext symbols 16–514 were read and compared symbol-by-symbol:

| Measure | Result |
| --- | ---: |
| Predicted continuation | 499 symbols |
| Exact matches | **499** |
| Mismatches | **0** |
| Exact accuracy | **100%** |
| Longest exact run | 499 |
| Forward re-encryption of full 515-symbol sequence | PASS |
| Transparent plaintext-F positions | 11/11 exact |

The predicted and native transparent-F positions, zero-based within the full section, are identical:
`[48, 74, 84, 132, 159, 160, 250, 421, 443, 465, 514]`.

## Reproduction

- Blind predictor: [`sims/agent1_lp1_welcome_blind_viterbi.cjs`](../sims/agent1_lp1_welcome_blind_viterbi.cjs). It reads only the target crib's first 16 symbols, never the target tail.
- Post-freeze comparator: [`sims/agent1_lp1_welcome_blind_compare.cjs`](../sims/agent1_lp1_welcome_blind_compare.cjs). It reads the withheld native tail only after the prediction artifact exists.
- Frozen prediction: [`agent1-lp1-welcome-blind-prediction.md`](agent1-lp1-welcome-blind-prediction.md).

## Interpretation

This is an independently reproducible positive control for the historical crib-derived GP29 additive stream, the `DIVINITY→DIUINITY` key, and plaintext-F-transparent key holds. The exact 499-symbol recovery is stronger than a language-score fit: the unique Viterbi output re-encrypts to the original ciphertext and matches the previously withheld native plaintext at every position.

This validates the method on a known LP1 passage. It does **not** decrypt any unknown LP2 page, authenticate a new LP2 key, or justify transferring `DIUINITY` to LP2. Any LP2 application still requires a source-selected crib/key and a separately frozen withheld-ciphertext prediction.
