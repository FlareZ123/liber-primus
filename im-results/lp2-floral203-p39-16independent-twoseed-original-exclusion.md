# P39 repeated-root 203-clock on all sixteen floral black rows: every two-state seed excluded

**Agent9, 23 November 2026. Evidence class: exact original-cipher exhaustive negative for a defined GP29-native plaintext register. No recovered unknown plaintext, authenticated key or destination.** [Read-only Windows Node22 SFT](../sims/lp2_floral203_p39_two_state_allseed_original_sft.cjs) · [successful source-original workflow 45246042694](https://github.com/FlareZ123/liber-primus/actions/runs/45246042694).

## Source-led possible solve path

Four original visible objects suggest a sharply bounded cipher architecture rather than an arbitrary running-key search:

1. The isolated original p39 red rune triple at physical offsets 119–121 is **[27,5,15]** in GP29. Its ascending coefficient polynomial is **G(x)=27+5x+15x²=15(x−24)² (mod29)**. A person using the earlier signed 2013 BASE29 example might plausibly interpret this marked triple as a two-state recurrence. No source text explicitly commands this.
2. Since 24 has order **7 modulo29** and the root has multiplicity2, the homogeneous recurrence **k[i+2]=19k[i+1]+4k[i] (mod29)** has every nonzero-state trajectory of period dividing **7×29=203**. More exactly **k[i]=(a+bi)24^i**, with *a,b* in GF29.
3. The first printed token of the independent p49–51 table is **3N**, exactly **203** under the existing conventional base60 interpretation. Its **32 printed rows** could conditionally supply **two starting registers for each of sixteen text lanes**. Neither the use of first-column values as registers nor any table-to-register mapping is specified by the book.
4. The sixteen physically flower-framed pages p40–p55 carry **3,316** original GP29 runes. Removing the three visibly red spans, original p40 first8, p53 final51, and p54 first9, leaves **3,248 = 16×203** black runes. Grouping their concatenation in printed order into sixteen sequential 203-rune rows is possible without editing any rune. **These mathematical rows cross physical page boundaries; they are not the actual page-local text rows.** That segmentation remains hypothetical.

This source-shaped combination offers an unusual compact key/clock candidate. The [older p39 quadratic all-secret report](lp2-p39-quadratic203-allsecret-source-gate.md) addressed one 203-period clock continuously over 3,000 original runes, including ciphertext/plaintext feedback. It did **not** grant each successive 203-rune row its own completely unknown independent initial two-register state. The [floral203 all-secret stationary-column study](lp2-floral16-203-allsecret-column-capacity-gate.md) instead addressed arbitrarily unknown *shared column mappings* across sixteen rows; that is a distinct model. The current question tests the independent-row two-state family directly.

## Complete all-secret row-reset experiment

For each of the **sixteen independently defined 203-symbol original ciphertext rows** take the exact first rune as local index0. Let

\[
C_i=P_i+k_i\pmod{29},\qquad
k_{i+2}=19k_{i+1}+4k_i\pmod{29}.
\]

Allow **all 29²=841** possible original starting pairs \((k_0,k_1)\) *separately on each row*, with no shared-row constraint or source-derived seed limitation. This is **13,456 complete original row decryptions**. Negating both free seeds gives the opposite sign, so the experiment already covers the additive and subtractive conventions. It also covers **every source-derived or privately chosen pair of seed values** in that two-state recurrence; choosing a different p50 column, transposing the printed 32 seed bytes or setting secret per-row phases cannot evade its exhaustive seed bound.

For each decoded 203-symbol row, count unordered matching symbol pairs \(E=\sum_{s=0}^{28}{n_s\choose2}\) and retain the maximum *over every seed*. Each row has exactly \({203\choose2}=20,503\) candidate pairs. This statistic is invariant under an arbitrary **fixed 29! post-substitution** independently per row, since a bijection cannot change which two symbols are equal.

| Sequential black row, zero-based | Maximum E over all 841 seeds | Sequential black row | Maximum E over all 841 seeds |
| ---: | ---: | ---: | ---: |
| 0 | **853** | 8 | **796** |
| 1 | 826 | 9 | 829 |
| 2 | 804 | 10 | 793 |
| 3 | 808 | 11 | 796 |
| 4 | 820 | 12 | 828 |
| 5 | 812 | 13 | 804 |
| 6 | 806 | 14 | 808 |
| 7 | 837 | 15 | 845 |

Across the original sixteen lanes, the *most favorable* upper bounds range **793–853 pairs**, equivalent to original decoded-row GP29 IoC **0.03868–0.04160**. The average of these individually optimized row upper bounds is **0.0398264888065**. Each individual value is a mathematically exhaustive maximum, not a sampled random seed or a global-key approximation.

## Independently solved native-GP comparison and positive recovery

As a same-alphabet, historically meaningful reference, take the nine already-solved GP rune texts in [the pinned solved-source corpus](../resources/external/relikd-solved-gp29-native-v1.json), preserving their original runes and section boundaries. The four authentic solved sections of length at least203 provide **1,561 within-section contiguous windows** of exactly 203 GP29 runes: WELCOME 313 windows, KOAN_1 578, LOSS_OF_DIVINITY 553, and 2014 107/167 pages 117. Do not concatenate distinct sections, fabricate native words or fit the controls to the unknown ciphertext.

**Their minimum equality count is 1,096 / 20,503**, and the largest is 1,529 / 20,503. Thus **zero of the 1,561 independently solved windows falls at or below 853**. Even if one chooses the best of the 841 possible pads separately for *each* original row, all sixteen unknown row outputs fall below **every** genuine solved window of the same length. All symbol pairs within every original row were included; none were thrown away for favorable words or short cribs.

An independently planted 203-rune solved WELCOME window was encrypted under a private test seed [4,9] using this exact recurrence and recovered **203/203 symbols exactly** by its corresponding inverse. The exhaustive ranker attains at least the native planted collision count on the encrypted positive. This distinguishes genuine decode capability from merely computing ciphertext statistics. The source data, full original-seed enumeration, exact numeric assertions, and plant are included in the one-file SFT.

## Decision and boundary

The **203-period p39 repeated-root cipher acting as an autonomous GF29 additive pad on each 203-rune black row**, with *two arbitrary private starting symbols per row*, is strongly contradicted as a direct ordinary solved-style GP29 prose decoder. This includes all imaginable p50-table-derived starts **within that precise two-register architecture**. A further search of initial states, seed columns or signs for this model cannot improve any row beyond its listed upper bound.

The manuscript has not independently instructed a player to regard the p39 red triple as recurrence taps, the table's first byte as a period, or the floral black stream as sixteen 203-long rows. The count alignments therefore remain conditional hypotheses. The result does not exclude a nonautonomous update depending on ciphertext/plaintext, nonadditive or position-varying emission alphabets, unknown binary intermediates, different source segmentation or another cipher family. The earlier continuous-stream test covers different hypotheses and should not be presented as an independent confirmation of these same data.

**No unknown LP2 plaintext, recovered key, source-authenticated cipher operation or onward endpoint results.** Continue only where an original clue selects a new operation with a plausible path to plaintext; no further seed sweeps in this excluded family.
