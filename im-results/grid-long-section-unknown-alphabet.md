# LP2 longest section: source-grid column keys with independent unknown alphabet and key skips

**Evidence class:** strongly calibrated negative for a finite and exact source-derived key family. Agent 25, 2026-11-10. No authentic LP2 plaintext or key recovered.

## Attack hypothesis and independent use of ciphertext

The LP2 base-60 numeric table offers **eight 32-byte vertical columns**, while the original manuscript has eight substantial '$'-delimited ciphertext groups after merging a single 9-rune bridge. The eight lengths are **729, 1,145, 1,729, 1,903, 1,021, 1,524, 1,589 and 3,316**.

The previous [pooled eight-section experiment](global-grid-sigma-joint-inversion.md) recovered 90.15% of a full-length planted plaintext when a single unknown outer 29-rune permutation was **shared** across every section. It did not directly exclude one independently chosen outer permutation **per section** or an unknown assignment of grid columns.

To close that concrete escape hatch, this test models *one* long section completely independently. It uses the **first 2,400 runes of the eighth and longest group** at original corpus offset **9,640** (0-based; 3,316 total runes in that group), preserving exact rune spellings and visible word boundaries. No neighboring section or shared-alphabet assumption contributes to its inference.

For each actual table column, generate AES-256-CTR or ChaCha20 pad bytes using a zero 16-byte IV, forward or reversed 32-byte key, raw byte mod29 or scaled floor(29×byte/256), and both additive signs: **8 × 2 × 2 × 2 × 2 = 128** directly source-derived candidate pads.

Under each key, the previously developed strict collision-triggered keyskip Viterbi plus exact unknown outer-29-symbol Hungarian alphabet optimizer is applied to the complete 2,400-rune window, with early one-skip initialization widths 60, 100, 160 and 300, up to five alternating refinements, and at most 100 hidden key-pointer skips. The best complete-window log score is the diagnostic. It is a joint decryption attempt, not a key-free distribution test.

## Powered twelve-plant control

Use genuine GP-English word strings held out from the Shakespeare model-training interval and encrypt them with the *actual first vertical column* under AES-256-CTR, zero IV, literal byte mod29 and positive encryption sign. **Independently randomize the 29-way outer alphabet in each of 12 trials** and consume an extra key byte whenever a collision is rejected, with 81% rejection probability.

The solver receives neither true alphabet nor true skip positions. On **all 12** planted ciphertexts, the chosen candidate recovers English-like log scores between **−2.532 and −2.842 per rune** and correctly identifies the final number of extra key draws in **all 12 cases**. Actual extra draws by trial were **[66,60,65,58,58,65,80,72,65,71,65,71]**, all within the 100-skip model cap. This establishes power to detect the precise hidden-alphabet, key-drift, source-correct key model against a realistic long section.

No plant result requires the algorithm to learn an alphabet shared with other sections. This positive therefore directly tests the hypothesis the pooled full-manuscript model could have missed.

## Actual 2,400-rune LP2 test

Of 128 sourced pads, the **best** is a reversed-key ChaCha20 column 7, scaled byte reduction and negative additive sign, with fitted log score **−4.640684 per rune**, drift 49. Other high-ranked candidates score −4.6643, −4.6715 and lower. None yields legible GP-English or approaches any of the twelve planted positive scores; the best real candidate is **1.799 log units/rune worse than even the weakest planted control**.

The strongest artificial control is approximately 2.108 log units per rune ahead of the actual best. Across 2,400 runes these are very large likelihood gaps under the *fixed trained scoring model*, but the literal numbers should not be interpreted as a general p-value without a corresponding null over English-source/register variation. The result is a strong finite-model failure, not mathematical impossibility of another cipher architecture.

**Conclusion:** literal base60 column keys under the sixteen declared AES/ChaCha layouts, even when allowed **any independent 29-way alphabet** and **up to 100 hidden repeat-triggered extra pad draws**, do not produce the expected English-like source from the eighth LP2 text group. This also covers an unknown column-to-section assignment for that particular section because every one of the eight source columns is tested. It does not cover another IV, nonce, hash/KDF of the grid, encrypted/compressed plaintext, arbitrary key consumption unrelated to repeat collisions, other cipher primitives or language sources, or an unknown upstream transposition.

## Reproduce

- Code: [sims/grid_long_section_unknown_sigma.cjs](../sims/grid_long_section_unknown_sigma.cjs).
- Manual GitHub Actions [successful 2,400-rune source/plant run 42756802677](https://github.com/FlareZ123/liber-primus/actions/runs/42756802677).
- Opt-in runner: [.github/workflows/grid-long-unknown-sigma.yml](../.github/workflows/grid-long-unknown-sigma.yml).
- Input fixtures: [corrected base60 grid](../resources/liber-primus/base60-grid.json), [original LP2 GP runes](../resources/lp2-transcription.txt), and the disjoint Shakespeare GP training/control source. No external dependency is required at execution time.

**Next search priority:** the source columns may be encrypted binary rather than usable keys, or the actual keystream may depend on a nonzero clue-derived IV, page/word topology, or an independent secret. Further SHA/AES parameter brute force without new clue constraints is unlikely to recover plaintext.
