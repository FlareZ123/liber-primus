# LP2 plaintext-autokey: all-secret original-input exclusion

**Agent 48, 11 November 2026.** Classification: mathematical all-secret frequency invariant, finite original-cipher tests, held-out native-GP-English controls. **No unknown LP2 plaintext, key or destination recovered.** The cipher rule being evaluated is a candidate, not an authenticated Cicada instruction.

## Source-motivated candidate and decisive test

Earlier Cicada used GP29 Vigenère; p15 has a source-authentic Fibonacci-indexed prime spiral; solved p57 mentions the boundaries of words. These motivate examining the direct plaintext-feedback Vigenère rule

\[
C_i \equiv P_i + sP_{i-m}\pmod{29},\quad i\ge m,\quad s\in\{-1,+1\}.
\]

The first m plaintext and ciphertext runes are completely unknown. Candidate lags are the distinct early positive Fibonacci numbers 1,2,3,5,8,13,21,34,55,89. They are hypothesis parameters; **no primary clue instructs using this autokey rule or particular lag**. We test the original 12,956-rune physical LP2 pp0–55 stream, with p50 runeless, under a full-book continuous clock and 55 physical-page reset clocks.

Let Z be the zero-seed reconstruction, Z_i=C_i−sZ_(i−m), and let P be the true plaintext from any secret first m runes. Their difference D_i=Z_i−P_i obeys D_i=−sD_(i−m). If s=+1, D is a constant GP29 alphabet rotation in each class modulo 2m. If s=−1, it is constant in each class modulo m. **No secret initial state can change a class's symbol histogram or index of coincidence.** Exclude the initial m positions per reset segment, calculate ordered equal-symbol pairs within each class, and pool the results. This is an exact seed-independent necessary condition.

The matched plaintext controls are 44 nonoverlapping 12,956-rune windows of repository Shakespeare, Emerson and Gibran text, greedily converted using the repository's established GP29 spelling convention. For page-reset tests, controls are split at exactly the original page lengths. Independent enciphered native-GP plants with unrelated secret prefixes pass the all-seed invariant exactly.

| Clock and lags | GP29 IoC on original | Minimum IoC of 44 English windows | Windows at/below original |
| --- | ---: | ---: | ---: |
| Continuous, all ten lags, both signs (20 variants) | 0.034031–0.034716 | 0.057673 | 0/44 in every variant |
| Page reset, lags 1–55, both signs (18 variants) | 0.032874–0.036205 | 0.055451 | 0/44 in every variant |
| Page reset, lag 89, minus | 0.038090 | 0.053916 | 0/44 |
| Page reset, lag 89, plus | 0.051020 | 0.020408 | **21/44, inconclusive** |

For the last row only 196 ordered within-class pairs remain, too few for a useful exclusion. This is a **bounded exclusion relative to the tested native-GP registers**, not a theorem against another language, non-GP text, hidden state updates, variable-rate output, or additional encryption layers.

## Separate printed-word reset: no secret prefix can repair the mismatch

The source contains **2,896 printed GP29 words**. To test independently reset autokey on every word without needing its key, build a 12,230-entry exact GP-word lexicon from the three independent English controls. Each reference word is encoded by its expected plaintext-autokey ciphertext suffix, ignoring all first m runes; a source ciphertext word matches iff some reference word of the same length gives the suffix **with any starting plaintext/ciphertext prefix whatsoever**. Demand word length at least m+4 to constrain four or more output runes. Each control author was also held out entirely from the training lexicon and its words encrypted under the rule as a planted positive test.

| Lag | Shortest eligible word | Original eligible words | Original compatible words (plus/minus) | Three-author held-out positive coverage |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 5 | 1,132 | **3 / 3** | 62.7–88.3% |
| 2 | 6 | 815 | **1 / 2** | 55.2–85.3% |
| 3 | 7 | 559 | **0 / 2** | 46.5–83.4% |
| 5 | 9 | 187 | **0 / 0** | 36.0–82.4% |
| 8 | 12 | 25 | **0 / 0** | 28.4–77.0% |

Thus a new unknown key **for every original word** cannot make the tested direct GP29 plaintext-autokey rule resemble the native reference vocabulary. Longer per-word lags have too few constraints and are excluded from this decision; rare words or another language remain possible. The dictionary does not prove all imaginable English vocabulary absent.

## Research decision

Retire direct GP29 plaintext-autokey seed guessing for the declared continuous/page clocks and direct English word-reset models. Even unbounded trial of these particular initial runes cannot fix their key-independent obstruction. The live task is identifying a new source-selected symbol-changing operation or authentic key. Do not turn the exact Fibonacci arithmetic into a claim that the authors chose autokey.

**Reproducer:** [single runnable original-input test](../sims/lp2_plaintext_autokey_allseed_gate_sft.cjs), using the unchanged canonical [corpus](../resources/liber-primus/lp2-corpus.json), [word transcription](../resources/lp2-transcription.txt), and the three repository control texts. The test checks 12,956 original runes, 2,896 words, full planted class-shift invariants and every reported result.
