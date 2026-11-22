# p50 moving-exception sparse transposition structural gate

**Agent18, 18 November 2026. Classification: predeclared structural near-miss negative under Director issue #1422. No unknown plaintext, key or historical cipher was recovered.**

## Frozen operation

The model was [specified on issue #1422 before evaluating any source-native controls](https://github.com/FlareZ123/liber-primus/issues/1422#issuecomment-6989520721). It uses the source-natural continuous 256-cell p50 clock and the same predecessor-cell convention as the established leading-zero/doublet association.

Literal-leading-zero cells are identity. At every other position, let the previous ciphertext rune be `a=C[i-1]` and let the controlling table byte select

`r=[F, TH, EO, NG, OE, AE, IA, EA][byte mod 8]`.

The complete GP29 state permutation swaps only `a↔r` and fixes the other 27 symbols. It is an involution, so encryption and decryption use the same exact map once the already-visible previous ciphertext rune and p50 cell are known. There is no searched key, phase, table rotation, page reset, marker set or orientation.

This differs from the already excluded globally fixed repeat-sentinel family because the exceptional rune changes with the source table. It also differs from the earlier eight-special rank-28 emitter: almost the whole alphabet is left untouched at each state.

## Predeclared structural criterion

Before any original inverse language inspection, the model had to improve all three source-native control registers, independently, on all three frozen targets:

1. same-page adjacent repeats toward the original **86**;
2. within-word five-back equalities toward the original **104/2,105**;
3. the fraction of adjacent repeats occurring at literal-leading-zero cells toward the original **33/86 = 0.38372093**.

Each control is a complete 12,956-rune GP-native English book sampled at the exact original 2,896 printed-word lengths. Forty-eight independent books are generated from each of Shakespeare, Gibran and Emerson. Every plant inverts exactly.

| Register | Adjacent plain → encoded | Lag5 plain → encoded | Leading-zero repeat share plain → encoded | Joint pass? |
| --- | ---: | ---: | ---: | --- |
| Shakespeare | 446.2083 → **189.5000** | 123.5417 → **118.8542** | 0.23586 → **0.55465** | **No** |
| Gibran | 431.7708 → **203.7083** | 122.3125 → **117.9167** | 0.24176 → **0.51376** | Yes |
| Emerson | 412.6875 → **194.3750** | 132.3958 → **130.0833** | 0.23704 → **0.50629** | Yes |
| **Original LP2 target** | **86** | **104** | **0.38372** | |

The model materially suppresses adjacent repeats while preserving five-back structure much better than the preceding three-cycle experiment. Under the frozen distance-to-target rule, both statistics improve in all three registers. The leading-zero localization is too strong in Shakespeare: the encoded share overshoots to **0.55465**, farther from the original 0.38372 than the plaintext control's 0.23586. The preregistered all-three-register criterion therefore fails.

Because the gate failed, the deterministic inverse of the unknown LP2 ciphertext was **not inspected for language**. This prevents a structurally selected model from being rescued by a coincidental readable fragment.

## Decision

Retire this exact **leading-zero identity + moving p50 low-three-bit exception swap**. The near miss is still useful: a sparse changing-state permutation can move the anti-adjacency and five-back statistics together in the correct direction, which the preceding three-cycle could not. Its failure is specifically in repeat localization, where treating every leading-zero cell as unrestricted pass-through overconcentrates surviving repeats.

A successor should have an independent source reason for how leading-zero cells select a state rather than simply tuning the pass-through rate. Changing the same marker set, phase, or table orientation after seeing this result would be parameter rescue and is not justified.

The source-exact CommonJS reproducer is [`sims/lp2_p50_moving_exception_sparse_sft.cjs`](../sims/lp2_p50_moving_exception_sparse_sft.cjs). It asserts original corpus geometry, exact planted roundtrips, deterministic source-control sums and the frozen three-register pass/fail decision without printing any original candidate plaintext. [Windows Node22 run 44383197269](https://github.com/FlareZ123/liber-primus/actions/runs/44383197269) passed the committed reproducer.
