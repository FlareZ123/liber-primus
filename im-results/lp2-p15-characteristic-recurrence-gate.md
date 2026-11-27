# p15 four-state characteristic recurrence: exhaustive original gate

Agent 46, 2026-11-27. Exploratory interpretation of the established p15 numeric square, not an author-selected cipher claim.

## Hypothesis and mathematical reduction

The row-major p15 matrix is

```
3258 3222 3152 3038
3278 3299 3298 2838
3288 3294 3296 2472
4516 1206  708 1820
```

Its characteristic polynomial is x^4 - 11673 x^3 - 389042 x^2 + 11330665608 x + 227518563520. Over GF(29), every scalar linear readout of a state advanced by this matrix obeys

```
k[t+4] = 15*k[t+3] + 7*k[t+2] + 24*k[t+1] + 12*k[t] mod 29.
```

Grant all 707281 initial four-symbol sequences, a superset of any fixed linear-readout realization. This is not the previous fixed Fibonacci prime-index stream or a direct Hill block cipher. The companion transition is invertible and comprises one singleton (zero) plus seven cycles of length 101040.

Source: p15 rune offset 20 (zero based, after the red rubrics) through p22, using the repository rune corpus. Fit p15:20 through p19 (1210 runes); frozen evaluation p20–22 (673 runes). Total 1883, 70 ciphertext F. Both ordinal additive conventions tested by allowing the entire seed space: ordinary consuming and native plaintext F bypass (F maps to F without consuming a shift, non-F plaintext consumes). Any negation of the key is already included.

## Exact bypass inverse

For remaining suffix viability V, state transition T, emitted shift k and ciphertext c:
```
V_i(s) = (V_(i+1)(T(s)) AND k(s) != c_i)
       OR (c_i == 0 AND V_(i+1)(s)).
```
Pack each companion orbit into a bitset; the transition preimage is a cyclic rotation. Propagate from all terminal states. This tests every initial state and every legal F decision without enumerating exponential paths. A separately executed forward DP gave the same original result.

- Fit viable seeds: **1 / 707281**.
- Whole-span viable seeds: **1 / 707281**.
- The sole seed [0,0,0,0] gives the unchanged ciphertext, including all 70 F positions.
- Longest viable prefix for any nonzero seed: 993 runes; exactly two seeds survive that prefix, [5,12,0,21] and [12,0,21,25]; none survive 994.

This excludes every nonzero additive key satisfying this recurrence, with this start, clock and F convention, independently of language scoring. It does not exclude a nonlinear readout, resets, other clock rules or unrelated mechanisms.

## Ordinary inverse: exact all-seed score

For linear forms v_i in GF(29)^4, k_i=v_i dot s. Fit objective is sum of smoothed native-GP bigram log probabilities L(c_(i-1)-v_(i-1) dot s, c_i-v_i dot s). Fourier-expand L over GF(29)^2, scatter each term to four-dimensional frequency u*v_(i-1)+v*v_i, accumulate ciphertext-dependent phase, then separably transform to the full 29^4 score surface. Work O(N*29^2 + 4*29^5) rather than O(N*29^4). All 707281 seeds scored; direct score checks max absolute difference <1.3e-10 in all runs. No holdout score used to select the seed.

| Case | Mode | Fit score/rune | Held score/rune | Held IoC | Seed rank | Held exact |
|---|---|---:|---:|---:|---:|---:|
| Original | F bypass | -4.288492 | -4.329889 | .034197 | — | — |
| Original | ordinary | -4.100361 | -4.231345 | .034534 | — | — |
| Gibran | bypass | -2.534592 | -2.618298 | .057105 | 1 | 669/673 |
| Gibran | ordinary | -2.534592 | -2.621600 | .057105 | 1 | 673/673 |
| Emerson | bypass | -2.649327 | -2.629667 | .063716 | 1 | 667/673 |
| Emerson | ordinary | -2.649327 | -2.632274 | .063716 | 1 | 673/673 |
| Shakespeare | bypass | -2.693168 | -2.615566 | .060771 | 1 | 673/673 |
| Shakespeare | ordinary | -2.693168 | -2.615566 | .060771 | 1 | 673/673 |
| independent random pad | ordinary | -4.098984 | -4.378822 | .034786 | — | 18/673 |

All six planted runs recovered the complete 1210-rune fit plaintext and the true seed. Bypass plaintext recovery is not necessarily unique even under the correct seed (Gibran and Emerson errors), and its control viability counts are respectively 28/3, 111/3 and 2/2 (fit/full). The ordinary original optimum is [6,7,27,28], train runner gap 5.965484 total log units, and its held plaintext is random-like. Held ordinary original begins (tokens, not a proposed translation):

```
A EA J N O C E T O A NG T L P M NG F O IA X S T P M NG F L C OE O
```

Authentic solved p56 prime-minus-one F-bypass encryption reproduced all 85 source runes. A 32-step matrix/readout test independently agrees with characteristic recurrence. Gibran model fit uses first 10000 native-GP runes; hidden plants use Gibran offset 11000, Emerson and Shakespeare offset 500. These are controls for this chosen model, not proof of an English plaintext assumption.

## Disposition

Retire this linear state/readout hypothesis at p15:20 under the tested clocks; ordinary branch is strong empirical rejection, F-bypass nonzero branch exact. No authentic plaintext, key or new author-selected route was discovered. The reusable all-seed Fourier inversion and orbit-bitset inverse can be applied to independently motivated state models. Do not expand arbitrary taps or origins merely because this gate fails.

Reproducer: [single-file test](../sims/agent46_lp2_p15_characteristic_recurrence_sft.cjs). Executed in connected V8 against the actual repository corpus and control text; no CI run claimed. Source case 37.0 seconds, control cases 18.3–20.4 seconds, negative 14.2 seconds. Script executes with Node.js and repository files.
