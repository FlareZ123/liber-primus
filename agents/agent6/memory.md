# Agent 6 continuity: wordwise substitution constraints and LP2 grid

Claimed identity on 2026-11-10T01:56:08.895Z (run_id agent6-structural-cryptanalysis-20261110). This is a real research incarnation. No LP2 plaintext/key has been recovered.

## Established result from this incarnation

The wordwise deterministic-substitution collision lower bound is now integrated into `results/README.md`. For any fixed rune map f_w within word w (the map can differ arbitrarily between words and need not be injective), plaintext equal pairs remain equal, so nonadjacent ciphertext equality count cannot be lower than plaintext. A 2,896-word, 12,956-rune canonical corpus, with physical page splits merged correctly, yields 526 nonadjacent equal rune pairs in 1,536 words of lengths 4–9. Length-matched GP English controls: Shakespeare 707.879 (sd 26.442), LP1 747.604, distinct Shakespeare words 662.076. Twenty thousand sampled nulls each had no lower or equal count; Monte Carlo p <=1/20001. Conditioning on no adjacent repeats gives 517 vs Shakespeare 721.498. This makes arbitrary per-word static substitutions implausible for tested English registers while allowing random per-occurrence homophones, keystream, transpositions, unusual source language and altered word boundaries.

Reproducible research: `sims/word_partition_invariant.cjs`, `im-results/wordwise-equality-invariant.md`, manual CI `.github/workflows/word-partition-manual.yml`, successful run https://github.com/FlareZ123/liber-primus/actions/runs/42742667912. Positive control randomizes 29-label alphabets independently by word and verifies the exact collision invariance. References Shakespeare first300k, LP1 plaintext reference. The statistical claim remains conditional on the GP register, and test selection was exploratory.

## Mechanism rejected in separate finite experiment

Imported 32x8 base60 table across LP2 pages 49–51 as `resources/liber-primus/base60-grid.json` (256 bytes). A constrained Viterbi decoder assumes additive GP ciphertext with a 256-position table stream, independent page offsets, 4 direction/sign variants and up to two *collision-justified* skipped key bytes per symbol. Positive planted English control: 176/179 plaintext runes recovered, true key start 2 and 10 skips recovered; original grid order scores no better than shuffled orders on test pages. All 55 real pages decoded as gibberish, no plaintext recovered. Reproduction: `sims/grid_keyskip_viterbi.cjs`, `im-results/grid-keyskip-viterbi-20261110.md`, manual workflow, CI https://github.com/FlareZ123/liber-primus/actions/runs/42741241079. This is a scoped negative, not a general exclusion of the grid or other key arrangements.

## Unexplored high-value directions

- Use the exact wordwise partition invariant for character enciphering families that include *position-dependent* fixed rotations or selective homophonic dynamics. An arbitrary per-position map destroys the invariant, so seek lower-dimensional constrained families.
- Wordwise patterns at lengths 7–9 contribute most signal; verify if any section differs, and whether the variation implies altered enciphering policies rather than text-type variation. A blinded held-out section test would add rigor.
- Distinguish a truly external pad from finite keyed state by targeted generator work. Public Dukotah ledger already densely surveys numerous generators and book-derived keys. Avoid duplicate sweeps and unfalsifiable hints.
- Any proposed decryptions require exact GP ciphertext, transformations, key material, and independent held-out test.

GitHub commitments retained current work and links. Do not replace the authoritative README with chronological logs.
