# p50 zero→F moving-exception sparse transposition

**Agent18, 18 November 2026. Classification: source-motivated reversible p0–55 surface normalizer that passes a predeclared structural gate, fails the blind original-language inverse, and fails the solved-p56 held-out test as a universal/book-wide outer layer. No unknown plaintext, key or historical cipher was recovered.**

## Source path and frozen rule

The previous leading-zero-identity sparse transposition strongly improved the adjacent-repeat and five-back statistics but overconcentrated repeats at leading-zero cells in one independent English register. The next rule was [frozen on Director issue #1422 before any control evaluation](https://github.com/FlareZ123/liber-primus/issues/1422#issuecomment-6989582416).

The change has an independent source interpretation. A literal leading digit **0** selects **F**, GP index **0**, while F is also independently distinguished by the solved p56 transparent/non-key-advancing behavior. No pass-through probability is introduced.

For each global rune after the first:

1. use the p50 table cell under its predecessor, `(i-1) mod 256`;
2. if the printed token begins with literal `0`, set the moving exception `r_i=F`;
3. otherwise set `r_i=[F,TH,EO,NG,OE,AE,IA,EA][byte mod 8]`;
4. swap only `C[i-1] ↔ r_i` in the current GP29 alphabet and fix the other 27 symbols.

The map is an involution. Decryption uses the same transposition because the previous ciphertext rune is directly visible. There is no searched phase, reset, table rotation, key, marker set or direction.

## Predeclared joint structural gate

The rule had to improve **all three** independent matched-layout GP-native English registers on **all three** source targets before the unknown inverse could be read:

- same-page adjacent equalities toward **86**;
- within-word five-back equalities toward **104/2,105**;
- share of adjacent equalities at literal-leading-zero cells toward **33/86 = 0.38372093**.

Forty-eight complete 12,956-rune books were generated for each reference, preserving every original printed word length. Every plant decrypts exactly.

| Register | Adjacent plain → encoded | Lag5 plain → encoded | Leading-zero repeat share plain → encoded |
| --- | ---: | ---: | ---: |
| Shakespeare | 446.2083 → **139.7292** | 123.5417 → **117.9375** | 0.23586 → **0.39680** |
| Gibran | 431.7708 → **168.6042** | 122.3125 → **117.5833** | 0.24176 → **0.41305** |
| Emerson | 412.6875 → **164.5417** | 132.3958 → **129.6042** | 0.23704 → **0.41672** |
| **Original target** | **86** | **104** | **0.38372** |

Every encoded mean is closer to its corresponding original target than the plaintext mean in every register. The frozen structural gate therefore **passes**. This is a meaningful model-selection result: one simple moving state permutation reproduces the *directions* of the anti-adjacency, five-back and leading-zero-localization anomalies without fitting unknown plaintext.

It does not reproduce the original counts exactly. The encoded controls still retain roughly 140–169 adjacent repeats, and lag5 remains roughly 118–130 rather than 104. Structural proximity alone cannot establish the historical cipher.

## Blind original inverse

Because the gate passed, the exact deterministic inverse was then applied once to the unchanged 12,956-rune original ciphertext.

The result fails ordinary source-native GP English immediately and globally. It also exposes a useful intermediate-state fact: the fixed inverse changes only **549/12,956 = 4.2374%** of rune positions, yet same-page adjacent equalities rise from **86 to 478**. The literal-leading-zero share falls from **33/86 = 0.38372** to **114/478 = 0.23849**, while the within-word five-back count changes only from **104 to 99**. Thus the sparse inverse largely removes the unusual immediate-repeat suppression while preserving the five-back structure, even though it does not recover language.

- original ciphertext IoC: **0.0344783978645**;
- decoded IoC: **0.0345562435052**;
- the inverse therefore remains essentially at the uniform GP29 baseline rather than moving toward native GP prose;
- using the repository's source-calibrated GP encoder and 29,157-word TextBlob English resource, exactly **204/2,896** printed words match any registered word;
- those hits are only **77 one-rune, 105 two-rune, 18 three-rune and 4 four-rune words**;
- **zero** decoded words of GP length 5 or greater match the native dictionary;
- the longest contiguous dictionary run is **three** short words.

The opening twelve decoded words are:

`SHEOGMIAF SYENGC THJGAE FJOE ONN NEWBASOEOEINGU NNGITH HBNIA PBN EOJTH ANGYX BDP`

They do not form prose, and the complete stream's IoC confirms this is not a local opening anomaly. Exact forward encryption reconstructs **12,956/12,956** original runes.

## Solved-p56 held-out test

After #1422 closed, the fixed transform received a stronger untrained check on solved page56. The model was left unchanged: global continuous predecessor-cell p50 clock, literal-leading-zero→F, nonzero low-three-bit special selector, and the same sparse swap.

The authenticated source p56 ciphertext begins at global rune **12,956**, phase **156** of the 256-cell clock. Applying the fixed outer inverse across p0–56 changes exactly **4/85** p56 ciphertext runes, at local positions **16, 18, 25 and 74**.

The repository's complete solved-p56 regression family was then run on that altered 85-rune stream: prime or totient key, both arithmetic signs, starts 0–28, and every legal displayed-F literal/nonconsuming branch. On the untouched source p56 there is exactly one 85/85 historical path, `phi`, sign−, start0, the established literal-F choice. After the zero→F surface inverse there are **zero 85/85 paths**. The best candidate is still the authenticated `phi`, sign−, start0 rule, but it recovers only **81/85** runes; its four mismatches are exactly the four positions changed by the surface inverse.

A layered positive wraps the complete valid p0–56 source stream in the fixed surface encoder, removes that wrapper, and restores the unique authenticated p56 path. Thus the rejection is caused by the original p56 evidence rather than an implementation mismatch.

This **rejects the universal/book-wide outer-layer interpretation** of the zero→F transform. Its p0–55 repeat normalization remains a reproducible statistical/state-model observation, and an unknown-section-local use is logically possible, but the solved adjacent page does not support a common outer layer. [Held-out SFT](../sims/lp2_p50_zeroF_solved_p56_holdout_sft.cjs).

## Printed second-digit value layer: frozen negative

Director #1521 asked for one genuinely new source-selected operation beneath the frozen surface intermediate. The table is visibly printed as two base60 characters per cell, and #1508 independently selected the first-character/lowest-60 class. Before unknown-language scoring, Agent31 therefore froze the complementary visible operand: for cell `i mod256`, let `l_i` be the **second printed base60 digit**, then decode the #1422 intermediate by

`P_i = M_i - (l_i mod29) mod29`

under the unchanged global phase-zero clock. The subtraction sign is inherited from solved p56. No phase, reset, sign, gating, digit recombination or fitted parameter is searched. The predeclared wrong-clue control performs the same subtraction with the **first printed digit** instead.

The candidate is negative. Across the intact 12,956-rune p0-p55 interval it gives IoC **0.0344781834**, **178/2,896** dictionary hits, **zero** hits of GP length >=5, and maximum consecutive dictionary run **8 runes**. The first-digit wrong-clue control is similarly uniform: IoC **0.0344809359**, 190 short hits, zero length>=5 hits, maximum run4. A complete layered positive repeats solved p57 native GP to 12,956 runes, applies the second-digit inner encoder plus the frozen #1422 outer encoder, and recovers **12,956/12,956** exactly.

This closes the exact **second printed digit as additive value operand**. Its source path was stronger than an arbitrary byte mapping, but it does not recover a 150-rune coherent span or separate from its visible-digit control. Do not rescue it with another sign, phase or digit combination. [Director gate #1521](https://github.com/FlareZ123/liber-primus/issues/1521) · [SFT](../sims/lp2_p50_zeroF_second_printed_digit_sft.cjs) · [Windows Node22 PASS 44390311367](https://github.com/FlareZ123/liber-primus/actions/runs/44390311367).

## Decision

This model is the strongest member of this local p50 moving-exception sequence because it passes the prospectively frozen ciphertext-structure criterion in three independent source-native registers. The blind inverse still fails decisively as plaintext.

Retire the exact **zero→F / nonzero-low3 moving-exception sparse transposition** as a complete decoder and as a universal LP2 outer layer. Preserve its p0–55 structural behavior as a bounded statistical constraint: a historically viable unknown-section mechanism may need a similarly sparse changing state to explain the three ciphertext anomalies, while the solved-p56 holdout requires any such mechanism to be section-local or otherwise different at the solved boundary. Do not tune this transposition's phase, marker set, orientation or exception rates after the blind and held-out failures.

The complete source-exact CommonJS reproducer is [`sims/lp2_p50_zeroF_moving_exception_sft.cjs`](../sims/lp2_p50_zeroF_moving_exception_sft.cjs). It freezes the matched-control sums, asserts the full joint gate, applies the original inverse only after that gate passes, checks exact forward reconstruction, and verifies the native-GP dictionary and IoC rejection. [Windows Node22 run 44384599720](https://github.com/FlareZ123/liber-primus/actions/runs/44384599720) passed the updated committed reproducer, including the intermediate-state assertions. The run was dispatched while another agent's concurrent commit was the branch head; its job log prints this script's full zero→F control and inverse output.
