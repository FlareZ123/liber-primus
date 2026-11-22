# Whole-book sparse-edit rune echoes: substitution and indel-aware gates

**Original-ciphertext bounded decision, Agent34, 15 November 2026.** The established six-rune `D-J-U-B-E-I` repetition on physical pp27/55 suggests a targeted question: does the original encrypted manuscript contain a longer reused ciphertext passage with a few changed, missing or inserted glyphs? Such a passage could identify a key-reuse site or author-corrected encrypted text. The test searches the **entire unmodified 12,956-rune stream**, including all physical-page transitions and p49→p51 across the rune-free numeric table. It uses the printed GP29 symbols without any guessed plaintext, source key or fitted dictionary.

## Complete all-stream tests

Each search considers every pair of **nonoverlapping, equal-length n-rune windows** at arbitrary positions. The initial **Hamming** mode counts same-coordinate substitutions (≤k); the separate **Levenshtein** mode allows any ≤k substitutions, insertions or deletions. Both methods are exhaustive for the stated finite inputs: split the earlier n-rune window into k+1 disjoint contiguous chunks. Any pair with ≤k edits must preserve at least one such chunk verbatim. Hamming indexes matching blocks at the same offset; Levenshtein indexes all matching substring positions and allows its relative starting offset to drift by at most k. Finally deduplicate pairs and compute their exact Hamming or banded Levenshtein distance. No heuristic score or truncation rejects a qualifying candidate.

| Original runes per window n | Max edits k | Hamming matching pairs | Levenshtein matching pairs |
| ---: | ---: | ---: | ---: |
| 20 | 4 | not separately screened | **0** |
| 17 | 3 | not separately screened | **0** |
| 15 | 4 | **0** | not separately screened |
| 15 | 3 | not separately screened | **0** |
| 13 | 3 | **0** | not separately screened |
| 13 | 2 | not separately screened | **0** |
| 12 | 3 | **0** | not separately screened |
| 12 | 2 | not separately screened | **0** |
| 11 | 3 | **0** | not separately screened |
| 10 | 2 | not separately screened | **0** |
| 9 | 2 | **0** | not separately screened |
| 8 | 2 | **5** | not separately screened |

The six Hamming source checks are independently reproduced by the first SFT; all six Levenshtein checks by the second. The Levenshtein scanner explicitly retrieves a planted genuine *insertion plus deletion* pair, while the Hamming scanner retrieves a planted four-substitution echo. Both pass their actual source-input scans on Windows Node22. The edit-aware run has zero hits even at n=10,k=2, stronger than an alignment-only Hamming check at the same window size, because every Hamming hit is necessarily a Levenshtein hit.

The 8-rune Hamming scan's five matching pairs, in exact original physical-page and local-rune coordinates:

| Original source sites | Differing positions | Exact GP29 transliterations |
| --- | --- | --- |
| p5:59 ↔ p8:60 | 0,5 | `Y R EO P NG EO P O` ↔ `EA R EO P NG U P O` |
| p5:60 ↔ p8:61 | 4,7 | `R EO P NG EO P O I` ↔ `R EO P NG U P O TH` |
| p17:128 ↔ p46:101 | 1,5 | `AE G IA J I O R TH` ↔ `AE A IA J I A R TH` |
| p43:272 ↔ p52:104 | 2,6 | `J T EA U G TH Y TH` ↔ `J T C U G TH F TH` |
| p27:26 ↔ p55:68 | 0,1 | `B F D J U B E I` ↔ `C X D J U B E I` |

The p43:272 hit crosses p43→p44 and thus disappears from a page-local-only search. The last row extends the previously established exact six-rune bookend, while the first two rows are overlapping windows of essentially the same chance alignment. The five windows do **not** constitute five independent motif families. Under a rough i.i.d.-uniform GP29 baseline the expected number of eight-rune/two-Hamming-error windows is about **3.71**; source anti-doublet and adjacent-window dependencies make this a scale comparison, not a calibrated significance claim.

## Decision and limits

There are **zero 10-rune windows matching within two total edit operations**, **zero 15-rune windows matching within three total edits**, and **zero 20-rune windows matching within four total edits** anywhere in the original unsolved stream. These finite source facts reject a large family of proposed **long near-identical ciphertext echoes with sparse glyph corruption, insertion or deletion** under the frozen equal-window formulation. The short Hamming hits have not revealed an authentic key, ciphertext-reuse clock, or recognizable plaintext.

The result places no bound on **reused plaintext encrypted under distinct keys**, variable-length message correspondences requiring a different window search, a source-guided cipher mapping, reordering of glyphs, or other nonliteral echo operations. Neither p27/p55 bookend is downgraded by the absence of longer echoes.

**Reproduction and positive controls:** [Hamming test](../sims/lp2_wholebook_near_repeat_original_sft.cjs), [passing Windows run 43768096508](https://github.com/FlareZ123/liber-primus/actions/runs/43768096508); [edit-aware test](../sims/lp2_wholebook_indel_echo_original_sft.cjs), [passing Windows run 43768573586](https://github.com/FlareZ123/liber-primus/actions/runs/43768573586). Both read [the exact canonical LP2 source](../resources/liber-primus/lp2-corpus.json) with full 55 rune-bearing physical pages, and both include genuine source-size positives. No unknown LP2 plaintext, author-specified key, verified encryption mechanism or destination was recovered.
