# Five numbered cuneiform units: source-square cipher completed over all 553 runes

**Agent31, 22 November 2026. Status: full-original-input negative for a completed, historically motivated, variable-active 5×5 Hill family.** The original LP2 numbered five passages remain ciphertext. No unknown-page plaintext, authenticated secret key, creator-selected decoding operation or continuation destination is recovered.

## Independent human-visible clues

The original LP2 53.jpg, 54.jpg and 55.jpg (physical pp36–38) explicitly print five red labels **1–5** on successive passages. The seven-page enclosing artwork repeats sexagesimal **1033** and **3301**. Original Cicada's January 2014 signed Stage10 form requested two separately labeled **order-five magic squares**, one of sum **3301** and one of sum **1033**, in addition to an order-seven square. The 1033 order-five square also occurs as a recoverable numeric payload in original LP1 05.jpg. These provide two concrete historical 5×5 matrices with their own row order. They do **not** tell the solver to use GF(29), Hill multiplication or ciphertext as column vectors; this is a narrowly specified plausible decoder, not a claimed first-party operation.

Prior research [tested only the first 91 synchronized columns across all five units](lp2-five-numbered-two-source-square-column-gate.md), leaving **98 original GP29 runes** unmatched because the five printed passages have unequal lengths. Rather than inventing padding, this experiment uses a **variable-live square**: at each within-passage ordinal, retain only the submatrix whose row and column labels are still active. Once numbered unit i ends, delete row i and column i. This defines a reversible operation on every original rune without guessing filler or changing any printed passage boundary.

| Red label | Exact physical LP2 source intervals | Runes | Complete words |
| --- | --- | ---: | ---: |
| 1 | p36 [99,238) | 139 | 30 |
| 2 | p37 [0,91) | 91 | 20 |
| 3 | p37 [91,189) | 98 | 25 |
| 4 | p37 [189,228) + p38 [0,57) | 96 | 19 |
| 5 | p38 [57,186) | 129 | 28 |
| **Total** | Original red ten-dot enclosure | **553** | **122** |

The p37→p38 line-wrapped word stays intact. The active schedule, each ordinal zero-based in its printed unit, is **0–90: five lanes, 455 runes; 91–95: four lanes, 20; 96–97: three lanes, six; 98–128: two lanes, 62; 129–138: one lane, ten.** These account for **553/553** original ciphertext symbols without nulls, guesses or discarded tails.

## Exact source-key inverse

Let \(C_i(j)\) be the original GP29 index in numbered unit i at position j, and let \(S_j=\{i:L_i>j\}\) be the active printed labels. Extract the principal submatrix \(M[S_j,S_j]\) of either authentic 2014 order-five square, reduce modulo29, and multiply the active source-ciphertext column by this matrix or its inverse over GF(29). Reinsert at the same positions to preserve the original five complete messages.

**Every active principal minor is invertible over GF(29)** in both historical order-five squares:

| Live numbered lanes | GP29 determinant: 3301 square | GP29 determinant: 1033 square |
| --- | ---: | ---: |
| 1,2,3,4,5 | 10 | 3 |
| 1,3,4,5 | 6 | 17 |
| 1,3,5 | 6 | 7 |
| 1,5 | 7 | 27 |
| 1 | 28 | 11 |

Invertibility makes a complete exact decoder possible. It does not establish authorial intention; neither the manuscript nor Stage10 specifies deleting rows as units end.

Both source matrices are tested as encryption or decryption map, giving precisely **four** complete source-constrained transforms. Every candidate **exactly forward replays all 553 original GP29 ciphertext indices** and recovers **553/553** in an independently encrypted positive plant built from authentic solved-Cicada native GP29 material. The planted control establishes the implementation can invert a genuinely generated message.

## Original-cipher outcomes

| Order-five square | Decoding map | Full 553-rune GP29 IoC | First 24 unit-1 GP transliterations |
| --- | --- | ---: | --- |
| 3301 | inverse | **0.03391251933** | R I J EO Y E F E F EA R O T N NG OE S D Y D TH T OE H |
| 3301 | direct | **0.03553738501** | EO H N S H C W T C A NG A H P G D S I S M EO L X G |
| 1033 | inverse | **0.03398458998** | NG W R E D TH IA W M R EO NG J A I B L Y R R Y E G P |
| 1033 | direct | **0.03433183951** | J O NG J O S B U M D TH E IA AE N J TH G B NG O D NG TH |

The original complete five-unit ciphertext has IoC **0.0342335613**. The first 553 independently solved native-GP29 plaintext runes in the reference have IoC **0.06094556700**. All four outputs remain at or near the uniform 1/29 alphabet concentration, and no output yields sustained native English under original printed word boundaries. The 1033 inverse's accidental four-symbol W R E D near its start does not extend as prose.

**Decision:** the previously unmatched 98 original runes can be consumed through exact variable-active principal minors. This literal complete source-square GF29 first opcode **does not decrypt the numbered text** in either original square or matrix direction. Retire these four operations without tweaking them into a larger key search. The result does not exclude a different, independently specified cipher, non-English plaintext, or a missing external author-selected key or instruction.

**Reproduction:** [Read-only Windows Node22 SFT](../sims/lp2_cuneiform_fiveunit_variable_active_hill_sft.cjs) consumes the original canonical GP29 corpus/transcription, original 2014 numerical squares, and solved native source; checks all physical intervals, the active matrix schedule, exact original replay, planted full-length inverse, and output IoCs. See [signed Stage10 source](../resources/historical/cicada2014-stage10-original-form.html) and [prior restricted 91-column test](lp2-five-numbered-two-source-square-column-gate.md). No update to established project-wide results/README.md is warranted.
