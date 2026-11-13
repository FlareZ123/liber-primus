# Original p40–53 GP29 nonzero-step recurrence: an eight-register obstruction

**Status, 13 November 2026, Agent33, Director #693:** No plaintext or authentic key recovered. The first seventeen nonzero ciphertext differences contradict **every single stationary degree-eight linear recurrence over GF(29)** under the exactly specified source-visible start and skip-zero convention. The same frozen operation predicts only **61/1,491** held-out nonzero steps even with the preceding eight actual steps supplied as an oracle. This settles this narrow candidate without searching seed values, signs, permutations or reset positions. The original source's severe adjacent-equal suppression remains unexplained.

## Why test this precise cipher and no variants?

Original LP2 physical p40–p53 form a 3,008-rune visual chapter. The p40 source-original rubric has eight red runes followed by **3,000 black body runes**. The pp49–51 printed number table is eight columns wide. These are two *visible counts*, not authentication of a linear generator. A minimal historical guess is that the eight columns suggest eight registers and the 29-letter GP alphabet selects GF(29).

The original 3,000 body runes have only **18** zero differences between consecutive GP29 symbols. Freeze a source-addressed start: derive the **first body difference from the last p40 heading rune**, then compute all 3,000 differences modulo 29. Interpret the 18 zero differences as exceptional repeated-rune markers that do **not** advance the recurrence's state. Feed the **2,982 remaining differences**, in source order, directly into a linear recursion

\[
s_{t+8} = a_0s_t+a_1s_{t+1}+\dots+a_7s_{t+7}\pmod{29}.
\]

Neither the modulo, order, heading clock, sign, difference direction nor removal rule is selected after viewing the output. Unlike a synthetic plaintext encoder this specific model generates the **observed ciphertext step channel itself**. Therefore a true model predicts exact original step values, without a language recognizer or any candidate plaintext.

## Actual original 3,000-rune test

The original source input is the 58-physical-page, 29-index canonical transcription at [resources/liber-primus/lp2-corpus.json](../resources/liber-primus/lp2-corpus.json), with a body-clock cut after the first eight p40 chapter runes and no reset through runeless p50.

| Frozen item | Original-source measurement |
| --- | --- |
| Physical rune interval | p40–p53 inclusive |
| Red heading / later chapter body | 8 / 3,000 runes |
| Nonzero differences / zero-step exceptions | **2,982 / 18** |
| First eight nonzero source steps | **16,18,1,12,11,4,16,4** |
| Next eight observed nonzero steps | **15,27,5,7,21,19,6,15** |
| Train / held-out nonzero steps | **1,491 / 1,491** |
| Fitted coefficient order \((a_0,\dots,a_7)\) | **0,19,17,25,16,20,13,13** |
| First impossible original prediction | Index **16** (zero-based nonzero-step clock): model **22**, original **27** |
| First-half one-step matches using actual context | **68 / 1,483** |
| Withheld one-step matches using actual context | **61 / 1,491** |

An 8×8 GF29 linear system from nonzero steps 0–15 has **full rank eight** and fixes the eight coefficients uniquely. Already the next equation, at index16, contradicts those coefficients; no alternative secret eight-tap model can satisfy all seventeen observed steps. A recurrence of order below eight cannot rescue this: padding its taps with zero coefficients would produce one of the eight-register possibilities.

This is stronger than a low language score. It is an **algebraic contradiction on exact original symbols**. The 61/1,491 withheld one-step matches show the same obstruction through the chapter's other half. Each withheld prediction is generously given its eight preceding actual steps rather than its own previously predicted state. No unconstrained key/seed choice restores the first contradiction.

## Lossless transport and positive/negative controls

The [complete original-input CJS SFT](../sims/lp2_p40_delta8_nonzero_lfsr_sft.cjs) checks the complete 3,000-rune physical run: from heading rune \(C_{-1}\), integrate all 3,000 original differences by \(C_i=C_{i-1}+d_i\pmod{29}\). **All 3,000 source ciphertext runes round-trip exactly**, including all 18 zero-step markers. This verifies extraction and reinsertion of the exceptional positions, not the candidate cipher's historical validity.

The same SFT plants a true order-eight recurrence with nonzero GP29 steps from the eight fixed prime-derived seed values \(3,5,7,11,13,17,19,23\), repeats the seed as an exact periodic stream, and reinserts the **18 source-positioned zero events without advancing the register clock**. Fitting the same eight equations recovers the true taps \((1,0,0,0,0,0,0,0)\), predicts all **2,974** later nonzero steps, and reconstructs the whole 3,000-rune artificial cipher with its zero markers. An independently corrupted generated step breaks the corresponding two period-eight predictions. The tests demonstrate that the method recognizes a true model while the original does not satisfy it.

## Actionable decision

**Retire only this exact stationary eight-register GF29 linear-recursion model of the original nonzero ciphertext differences, with the actual eight-rune p40 rubric start and skip-zero clock.** This says nothing against a nonlinear recurrence, an arbitrary high-entropy external pad, a recurrence keyed by plaintext, hidden transposition before the recurrence, or a state change at a genuinely marked but independently selected boundary.

A new attempt must supply a distinct original-source instruction selecting one of those extensions and predict an unconsulted original interval. Another coefficient, sign, phase or reset sweep after this contradiction would simply post-select a new architecture.

No unknown Liber Primus plaintext, historical key, or continuation was obtained.
