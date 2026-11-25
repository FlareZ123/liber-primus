# Stationary plaintext function: exact physical-repeat gate

Agent 45 · 2026-11-25 · **Conditional exhaustive obstruction, not plaintext recovery.**

## Family and certificate

For consumed plaintext index i, let C_i = sigma_page(a(P_i + f(P_{i-q})) + b_page) mod 29 (affine argument taken modulo 29 before permutation). Here a is nonzero, f is an arbitrary stationary function from 29 symbols to 29 symbols, not necessarily a permutation, and each physical page gets arbitrary primer values and independent output relabeling/offset. Test q=8 and q=13 under ordinary consumption and literal Fehu holds. Holds emit F unchanged, never consume/update feedback. Within-page adjacent pairs with two consumed symbols after the primer repeat iff f(x)-f(y)=P_next-P_current modulo 29, where x,y are the delayed plaintexts. If x=y the repeat is forced iff the current plaintexts agree. F/F holds are forced. Omit all cross-page, primer-touching and mixed hold/consume pairs, yielding a conservative lower bound.

For each unordered x,y accumulate W[x,y,d], the number of retained pairs that repeat when f(x)-f(y)=d. Subtract min over ALL 29 differences (including zero) from each edge. The resulting nonnegative residual objective has a constant base. Fix one anchor's output to zero using global translation invariance. At any partial assignment the exact assigned/assigned residual plus, for each unassigned variable, its minimum possible cost against the assigned variables is a lower bound; all remaining unassigned/unassigned costs are nonnegative. Enumerate all 29 possibilities for every free variable, pruning only when this bound exceeds 86. No injectivity constraint. Thus failure certifies that every function in the modeled family produces more than 86 repeats on the given plaintext.

## Executed result

Original: 12,956 ciphertext runes, 86 within-physical-page adjacent equalities. Canonical Shakespeare, Emerson and Gibran normalized streams: 32 equally spaced full-length windows per author, sliced using exact original page lengths. Normalization and paths are fixed in the runnable script. All 96 windows at each of the four lag/clock combinations exhaust below depth six, with at most 12,516 visited search nodes; **384/384 UNSAT, zero caps**. Four forward nonbijective plants with arbitrary page primers and output permutations pass: actual/retained repeats 484/467, 480/440, 450/424, 449/402, respectively. Each known map's prefix path passes at its exact retained objective; no false pruning in these controls.

The bound is stronger than a permutation-only search and deliberately allows page restarts. It does not certify impossibility for unrestricted English, other languages, varying f, varying lag or plaintext coefficients, nonadditive combination, or other architectures. It does not identify plaintext or source-derived key. This is an independent rival-model gate, not an explanation of the low-repeat anomaly or a missing sidecar.

- [Runnable CJS](../sims/lp2_stationary_plaintext_function_repeat_gate_sft.cjs)
- [Full executed JSON](lp2-stationary-plaintext-function-repeat-gate-output.json)
- [Constructive permutation marginal inverse and frozen original failure](lp2-q8-permutation-marginal-inverse.md)

The exact JS computation ran on canonical repository contents; the committed Node wrapper reads the same inputs. No CI execution claimed.
