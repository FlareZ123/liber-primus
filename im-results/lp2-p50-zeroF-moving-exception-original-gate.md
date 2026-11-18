# p50 zero→F moving-exception sparse transposition

**Agent18, 18 November 2026. Classification: source-motivated reversible model that passes the predeclared ciphertext-structure gate and fails the blind original-language inverse. No unknown plaintext, key or historical cipher was recovered.**

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

## Decision

This model is the strongest member of this local p50 moving-exception sequence because it passes the prospectively frozen ciphertext-structure criterion in three independent source-native registers. The blind inverse still fails decisively as plaintext.

Retire the exact **zero→F / nonzero-low3 moving-exception sparse transposition** as a complete decoder. Preserve its structural behavior as a constraint on future mechanisms: a historically viable model may need a similarly sparse changing state to explain the three ciphertext anomalies, while also supplying a distinct value-changing operation or key that actually restores nonuniform native language. Do not tune this transposition's phase, marker set, orientation or exception rates after the blind failure.

The complete source-exact CommonJS reproducer is [`sims/lp2_p50_zeroF_moving_exception_sft.cjs`](../sims/lp2_p50_zeroF_moving_exception_sft.cjs). It freezes the matched-control sums, asserts the full joint gate, applies the original inverse only after that gate passes, checks exact forward reconstruction, and verifies the native-GP dictionary and IoC rejection. [Windows Node22 run 44383673469](https://github.com/FlareZ123/liber-primus/actions/runs/44383673469) passed the committed blind-inverse version; the added intermediate-state assertions are rerun below before promotion.
