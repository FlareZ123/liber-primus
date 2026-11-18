# p50 leading-zero gated lag1→lag5 reversible cycle gate

**Agent18, 18 November 2026. Classification: predeclared structural negative under Director issue #1422. No unknown plaintext, key or historical cipher was recovered.**

## Why this model was tested

The original p0–55 ciphertext has two independently preserved structural features that a useful low-description-length encoder should explain together: only **86/12,901** same-page adjacent equalities, and **104/2,105** within-word five-back equalities. A separate source-original result now shows that **33/86** adjacent equalities occur at literal-leading-zero cells of the source-natural p50 256-cell clock, with the direction positive across all nine visual chapters and surviving row/column-preserving nulls.

The model below was [frozen on issue #1422 before source-native controls were evaluated](https://github.com/FlareZ123/liber-primus/issues/1422#issuecomment-6989457756). It attempts to turn those observations into one lossless state operation instead of scoring the anomaly after decryption.

## Frozen reversible operation

Use the continuous source-natural p50 clock. The current rune at global index `i` is controlled by the table cell under its predecessor, `(i-1) mod 256`, matching the existing doublet-event convention.

The already published eight-special GP class is fixed as

`[F, TH, EO, NG, OE, AE, IA, EA]`.

At each position `i >= 5`:

1. If the controlling printed token begins with literal `0`, pass the candidate rune through unchanged.
2. Otherwise let `a=C[i-1]`, `b=C[i-5]`, and let `r` be the eight-special rune selected by the controlling table byte's low three bits.
3. Form the distinct-symbol list from ordered `[a,b,r]`. Rotate those listed symbols one place forward and leave every other GP29 symbol fixed. If only two distinct symbols remain, this is a swap. If one remains, it is identity.

The inverse applies the reverse rotation using the already known ciphertext history. It is therefore exact and one-to-one for all 29 symbols at every state. The first five runes pass unchanged. No phase, page reset, table rotation, rune class, cycle direction or hidden parameter is searched.

The intended causal prediction was explicit before language evaluation: at non-leading-zero cells, a base candidate equal to the immediate predecessor maps to the five-back symbol, moving collision mass from lag 1 to lag 5. Leading-zero cells retain ordinary collisions. The special class supplies the third state needed for a lossless permutation.

## Predeclared structural gate

The reproducer generates **48 independent full-length matched-layout GP-native English controls from each of Shakespeare, Gibran and Emerson**, preserving all 2,896 original printed word lengths. Each control encrypts under the exact frozen machine and decrypts byte-for-byte.

| Register | Plain adjacent | Encoded adjacent | Plain lag5 | Encoded lag5 |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare, mean of 48 | 446.2083 | **198.0208** | 123.5417 | **58.2917** |
| Gibran, mean of 48 | 431.7708 | **213.2917** | 122.3125 | **72.3125** |
| Emerson, mean of 48 | 412.6875 | **203.5417** | 132.3958 | **65.2708** |
| **Original LP2 target** | **86** | | **104** | |

The machine does suppress adjacent repeats substantially, but it remains far above the original 86. More decisively, it moves the five-back statistic in the **wrong direction** in every independent language register, reducing the source-native 122–132 baseline to 58–72 instead of approaching the original 104 through the intended lag1→lag5 transport.

The leading-zero pass-through does produce the expected local concentration of surviving repeats, but that partial success cannot rescue the failed joint prediction. Under the predeclared gate, the original deterministic inverse was therefore **not inspected for English**.

## Decision

Retire this exact **leading-zero pass-through + [previous, five-back, eight-special] rotation**. The failure is informative because a direct reversible local permutation can suppress adjacent collisions while simultaneously destroying the five-back structure it was supposed to create. A successor must alter how information is carried across state, rather than changing cycle direction or tuning the special-rune set after seeing this result.

The standalone CommonJS SFT is [`sims/lp2_p50_zero_gated_lag5_cycle_sft.cjs`](../sims/lp2_p50_zero_gated_lag5_cycle_sft.cjs). It reads the canonical original corpus and p50 table, asserts the exact source counts, performs complete planted roundtrips, freezes all deterministic control sums, and stops before original language inspection when the structural gate fails. [Windows Node22 run 44382637846](https://github.com/FlareZ123/liber-primus/actions/runs/44382637846) passed the committed reproducer.
