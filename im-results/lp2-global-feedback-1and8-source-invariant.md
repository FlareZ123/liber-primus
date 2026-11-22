# LP2 global and eight-clock ciphertext-feedback S-box: original-source exclusion

**Agent26, 22 November 2026. Experimental cryptanalytic constraint, not recovered plaintext or a solved key.** This is one bounded, invertible cipher architecture with a strong original-source control. It deliberately avoids retesting ordinary Vigenère, period search, common pads, p50 graph or p55 transfer. [Exact read-only Windows Node22 reproducer](../sims/lp2_global_feedback_1and8_sbox_original_sft.cjs).

## What an original solver could propose

The original manuscript retains rune boundaries and nearly eliminates adjacent identical ciphertext runes: only **86 of 12,901 within-page adjacent transitions** repeat. Its printed numeric artifact has **eight columns**, and Gematria Primus has **29 possible runes**. A simple explanation is a feedback alphabet wheel which maps a rare plaintext rune to the same output as the last ciphertext and permutes the remaining 28 letters around that output. To a reader this may look like a 28-step no-repeat cipher while still being an exactly invertible 29-symbol cipher.

Test a globally fixed, freely chosen permutation for each state:

`C[t] = S[phase(t)][C[t-1]][P[t]]`.

Here each of the 29 symbols in `S[phase][previous]` occurs once, but **its key is otherwise completely unconstrained**. The permitted state clocks are one global wheel or eight simultaneous wheels selected by `rune position mod 8`. Eight-lane positions were independently defined by book-wide, page-local and the source-visible nine-section chapter-local counters. At page first runes the previous ciphertext state may be initialized anew; evaluation begins at each page's second rune, so the first-state key is irrelevant.

The experiment is **key-independent**. Within a fixed exact state `(phase, previous ciphertext)`, a secret alphabet permutation cannot change the empirical proportion of equal output pairs. In the following statistic `n[s,c]` counts output symbol `c` observed in state `s`:

```
T = sum_s sum_c n[s,c] * (n[s,c] - 1)
    / sum_s N[s] * (N[s] - 1)
```

Therefore, *any* candidate secret wheel within this model must preserve the source plaintext collision concentration in every state. The author could choose all 232 eight-lane 29-symbol permutations arbitrarily; no key enumeration is necessary.

## Reversible native-GP positive and original observations

Original input is the 55 rune-bearing unknown physical pages p0–p55, including their exact separate page lengths, **12,956 GP rune indices** total. The native-GP control is an untouched **12,956-rune** window of the checked-in English Shakespeare text beginning at rune10,000 of the 218,800-rune source. This control window has **85** literal `EA` (index28) runes. For every secret row we force the single mapping `S[phase][previous][EA] = previous`, and randomly permute the other 28 outputs, with fixed Xorshift seed **0x33012629**. Thus every positive plant contains real English plaintext, is invertible **exactly 12,956/12,956 runes**, and reproduces **85** ciphertext adjacent repeats, effectively matching the manuscript's **86**. The rare-repeat count alone cannot reject this cipher.

The following are exact test outputs. Each row compares unchanged original page ciphertext with **64 independent source-native secret-wheel plants** and **64 matched diagonal-suppressed Markov nulls**; all use the original page boundaries.

| Fixed clock | Original `T` | Native-English planted `T` (min–median–max) | Markov null `T` (min–median–max) |
| --- | ---: | ---: | ---: |
| Single global feedback wheel | **0.035368** | 0.062303–0.063180–0.064155 | 0.035068–0.035283–0.035535 |
| Eight lanes, book-wide clock | **0.035225** | 0.062374–0.063024–0.064443 | 0.034661–0.035244–0.036066 |
| Eight lanes, page-local clock | **0.035541** | 0.062394–0.063332–0.064631 | 0.034444–0.035212–0.035795 |
| Eight lanes, nine-section clock | **0.035334** | 0.062313–0.063180–0.064175 | 0.034278–0.035173–0.036132 |

The original's invariant tracks the memoryless 28-way random-next-symbol null across all four independently defined clocks. Every one of the 256 English-keyed plants lies **more than 0.019 above its original counterpart**, even after exactly matching the rare-repeat mechanism. Because secret row permutations leave `T` invariant, searching more secret 29-way tables in this exact feedback family cannot improve the discrepancy.

## Cryptanalytic decision

**Retire the proposed globally reused, plaintext-symbol-bijective 29-state feedback S-box and the p50-eight-column motivated eight-lane version under the specified natural clocks as English-to-GP29 decipherment routes.** This is a stronger exclusion than inspecting the 86 repeated glyphs alone: all positive plants can reproduce those doublets, and every plant remains exactly invertible, yet they retain source-English collision structure missing from the real ciphertext.

This **does not rule out** a one-time/stream key, a genuinely evolving hidden wheel, page-private random S-boxes, word-local or unknown phase resets, non-bijective mappings, different plaintext languages, different native GP ligature conventions, or multilayer schemes. The controls preserve original page lengths, while their Shakespeare words do not reproduce the manuscript's exact printed word-length sequence. This is a conditional family exclusion, **not a statistical proof that LP2 uses an OTP**. No unknown rune has been decrypted. A useful positive next move would need a first-party selector for a state/key mechanism capable of concealing the English per-state concentration, then a complete original-cipher inverse and independent untouched-page plaintext.

The reader-facing authoritative overall research status remains [results/README.md](../results/README.md). This result belongs in the intermediate exclusion archive, not the solved-results registry.
