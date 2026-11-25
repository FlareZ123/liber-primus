# Original chapter cyclic BWT outer representation — exact rejection

## Decision

Director [#2680](https://github.com/FlareZ123/liber-primus/issues/2680): **none of the nine illustrated LP2 chapters is a valid conventional cyclic BWT last column in canonical GP29 order.** Consequently no primary row, prime clock, F-hold state, or inner plaintext can repair this particular outer representation. No unknown plaintext or key was recovered.

The authenticated 2014 bzip2 stage motivates block sorting as a period-available operation, but does not specify this LP2 representation. This experiment differs from #1477 (two primary rows on the participant-derived 729-rune prime-difference intermediate) and #2336 (p15 spiral BASE29 fixed 10-byte fields); neither tests this exact original last-column condition. The gate does not assume direct native English, word spacing, a known key, or a particular inner cipher.

## Exact necessary condition

For a proposed last column L, let LF(i)=C[L[i]]+rank(L[i],i), where C counts all symbols strictly smaller than L[i] in canonical GP29 order and rank counts occurrences strictly before i. Stable ranks give a permutation of all N rows.

If the pre-transform tape is primitive, LF is a single N-cycle: each step represents one cyclic shift. If the tape is a repetition of a primitive period d, stable tie order makes LF consist of N/d cycles of equal length d. Equal cycle lengths alone are insufficient: different necklaces can share a cycle length. The implementation therefore additionally reconstructs the candidate at row zero and checks exact cyclic BWT replay of the entire L before granting any primary rows. Unequal cycle lengths are sufficient to reject, including periodic tapes. All original chapters fail that necessary condition.

## Original results

Source: `resources/liber-primus/lp2-corpus.json`, blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; physical pages 0–55 (runeless p50 included as empty). Illustrated chapter boundaries are frozen before the test, no page resets. Each printed GP index retained; nonrune framing not passed into the BWT.

| Physical pages | N | Sorted LF cycle lengths |
|---|---:|---|
| 0–2 |729|3,3,10,15,47,106,133,186,226|
| 3–7 |1145|2,1143|
| 8–14 |1729|80,468,554,627|
| 15–22 |1903|1,1,1,1,2,2,6,19,31,82,127,695,935|
| 23–26 |1021|1,1,20,133,259,607|
| 27–32 |1433|1,3,5,14,33,667,710|
| 33–39 |1680|2,2,267,267,1142|
| 40–53 |3008|1,1,1,1,2,2,6,7,8,10,41,843,2085|
| 54–55 |308|2,2,26,28,29,37,184|

Total 12,956 indices; zero legal chapters; zero primary rows eligible. There is no original prime/F search to run because the outer stage has no preimage.

## Controls and reproducibility

Nine distinct genuine solved-GP sections (184,515,157,780,755,319,89,85,95 runes) were encrypted with the exact p56 prime-minus-one continuous clock and literal plaintext F hold, then cyclic BWT encoded. All nine pass the legality gate, reconstruct their exact inner ciphertext at the planted primary row and admit the original prime/F path. Authentic p56 re-encryption reproduces 85/85 ciphertext symbols independently. Four small tie/periodic controls pass exact BWT inversion; [0,1], equal-length cycles with different labels, fails the full replay condition. Across 1,800 deterministic same-histogram shuffled original controls (200 per chapter; seed 2680), one legal last column occurs (p54–55), consistent with legality being a necessary constraint rather than proof of provenance.

Reproduce: `node sims/lp2_chapter_cyclic_bwt_prime_fhold_sft.cjs`. The experiment ran against the actual GitHub source files in the JavaScript runtime; no CI execution is claimed. Script [ae80da207189d80da7186d0f92dedea40955682a](https://github.com/FlareZ123/liber-primus/commit/ae80da207189d80da7186d0f92dedea40955682a).

## Consequence

Retire this fixed canonical-GP chapter-cyclic-BWT outer architecture. This is an exact rejection, stronger than a failed language search. It does not reject alternative alphabets, block segmentation, sentinels, BWT before a value-changing layer, or binary bzip2 packets; none is selected by the current clue. Do not enlarge the family absent independent source selection.
