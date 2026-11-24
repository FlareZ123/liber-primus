# LP2 displaced common GP29 stream: end-aligned complete marked passages

**Decision:** This finite source-boundary family does not recover an unknown plaintext or key. Retire end-aligned additive reuse across the tested intervals; arbitrary shifts, other source clocks, distinct keys, transposition and nonlinear ciphers remain outside scope. Director issue [#2451](https://github.com/FlareZ123/liber-primus/issues/2451).

## Mechanism and predeclared alignment

For two unequal-length complete printed passages A and B, suppose their key streams share the same ending. With the rune sequences reversed, use `C_A[i]=P_A[i]+K[i]` and `C_B[i]=P_B[i]+K[i]` mod29. Then `D[i]=(C_A[i]-C_B[i]) mod29=(P_A[i]-P_B[i]) mod29`. The corresponding relative forward origins differ by the original passage length difference. The test does not fit an unknown origin to observed English. Start from the 15 nonempty ampersand-delimited source-transcript intervals of >=91 runes; all 105 unequal-length pairs are evaluated. Each comparison covers the final min(180, lengthA, lengthB) original runes. The rival is independent keys or a different operation. This is distinct from same-origin page/chapter pad resets and the 138/170 table flanks.

The follow-up switches to actual 13-dot ink annotations (28 original marks at 26 distinct offsets), using their genuine complete-word boundaries. Twelve intervals qualify. Exclude 36 previously evaluated signatures with identical two global end offsets and tested length; the 30 remaining signatures are new. Together the experiments cover **135** source-nominated distinct pair/signatures. No arbitrary lag sweep. Source word tape is checked rune-for-rune against the canonical 12,956 original GP29 indices; line/page wraps do not end words. Physical 13-dot boundaries are all exact word boundaries.

## Joint inference

Independent TextBlob/Norvig word-frequency data, normalized by the repository's native GP spelling convention, gives 29,060 distinct GP rune-word types. Reverse each word and build separate tries by rune length. At each original position the two plaintext symbols must satisfy `y=(x-D[i]) mod29`; both printed word lengths are hard constraints. Each trie node pair is a sufficient dynamic-programming state. At coincident original word boundaries the two automata reset. The first decoder is exact within its dictionary model; it maximizes joint conditional word frequency and records feasible blocks between simultaneous boundaries. If a block fails, both messages cannot be entirely in the finite vocabulary in that block. Partial final words are treated as prefixes.

The second decoder allows whole unknown words with an explicit 2% escape prior per word and uniform GP29 rune emission. The in-dictionary 98% component uses conditional prefix mass, so the per-edge log ratios telescope to the conditional word frequency. A 96-state beam plus guaranteed escape state bounds compute; it is an approximate MAP decoder, not an exact soft-model exclusion. Score is joint log path score per aligned rune, including both plaintexts. It can always return two sequences satisfying the difference, so dictionary coverage and replay alone cannot authenticate them.

## Results

| Experiment | Best original | Weakest shared-pad plant | Matched independent-pad comparator |
|---|---:|---:|---:|
| Exact lexical, 105 transcript pairs | 54/121 = .4463 feasible-block fraction | 51/95 = .5368 | each of 10 plants exceeds its own 12 negatives |
| Exact lexical, 30 novel physical 13-dot pairs | 49/118 = .4153 | .5368 | max .3786 (one per pair) |
| Escape beam, 105 transcript pairs | -3.947952 log score/rune | -3.179308 | best -3.855706 (one per pair) |
| Escape beam, 30 novel physical 13-dot pairs | -3.958669 | -3.179308 | best -3.961194 (one per pair) |

All 135 hard tests have at least one incompatible joint lexical block. The escape beam's best score over all original alignments is below all ten planted pairs and below the best of the 135 layout-matched random differences. The original 105-pair mean is -4.096933 versus -4.069468 for their independent differences. These maxima are descriptive family-level comparisons, not a calibrated familywise p-value; the paired negative draws do not model all cross-pair dependencies.

Controls are four known solved LP1 editor-normalized passages (p3 welcome, p6 koan, p10 consumption, p14 koan) encoded using the declared GP normalization, and exact native p57 runes/word divisions. A seeded random key is planted from the end of each unequal-length pair, with independent stream differences as controls. All ten shared-key plants outrank their individual null maxima in both models. In the six long LP1-only plants (180 aligned runes), the escape beam recovers **91.1–99.4%** of the 360 plaintext symbols; in the four shorter p57-containing controls it recovers 67.4–75.8%, reflecting native spelling/lexicon omissions. The exact hard model gives 336–356/360 correct on the five fully feasible long LP1-only controls (one long pair contains a failed terminal block and recovers 296/360). The hard result is susceptible to OOV words; the escape result addresses that limitation empirically. The field `matched` in original JSON rows is coincidental equality to ciphertext, not accuracy.

No original ranking reaches the finite plant regime, hence no candidate pad was nominated for sealed adjacent extension. Perfect re-encryption could be produced for any guessed A satisfying the difference and is not evidence of a shared original pad. A separate credible source-selected non-end origin would be needed for further displaced-key work.

## Reproduction

- [Exact lexical CJS](../sims/lp2_displaced_endaligned_dual_lexical_sft.cjs), [escape beam CJS](../sims/lp2_displaced_endaligned_dual_softlex_sft.cjs).
- Run either with Node; append `--physical13` to test only the novel physical-marker family. No dependencies beyond Node standard library and pinned repo inputs.
- Outputs: [105 hard](lp2-displaced-endaligned-dual-lexical-output.json), [105 escape](lp2-displaced-endaligned-dual-softlex-output.json), [30 physical hard](lp2-displaced-physical13-dual-lexical-output.json), [30 physical escape](lp2-displaced-physical13-dual-softlex-output.json).
- Executed against repository inputs in the available V8 tool runtime. No Windows CI run claimed.
