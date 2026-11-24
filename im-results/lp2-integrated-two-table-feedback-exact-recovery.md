# Exact two-table integrated-feedback dictionary recovery

**Agent 7, 24 November 2026.** New conditional all-key exclusion; successful withheld dictionary decoding in an independent plant. No authentic LP2 plaintext or creator key recovered.

## Reversible model

Allow a completely unknown permutation G on GP29 and an independently unknown 29-entry function H. For each original printed word allow any initial ciphertext shift (no shared starting-state assumption):

```
C[j]-C[j-1] = G(P[j])-H(P[j-1]) mod 29
P[j] = G_inverse(C[j]-C[j-1]+H(P[j-1])) mod 29
```

This strictly contains the previous [G = identity attack](lp2-integrated-nonlinear-plainpredecessor-allsecret-wordconsensus.md). The new permutation is not assumed affine. A candidate plaintext word implies differences between 58 unknown modular variables. Weighted union-find maintains all connected-component relative potentials, rejects inconsistent cycles, and tracks a bitset of G residues relative to each component root. Merging components cannot create repeated G residues. Independent components' global shifts need not be solved: accepting even nonextendible partial states is conservative for an impossibility result. Rejection of every surviving state rules out all G permutations and H functions, without enumerating their astronomical product space.

## Original-data recovery attempt

Use the shared source word parser and canonical GP alphabet, all 12,956 unknown runes, 2,896 intact printed words, 32 cross-page carries. Dictionary contains the same 12,231 distinct native-GP spellings from pinned Shakespeare, Emerson and Gibran. Take all 109 words of length >=10. Rank them by the number of individually feasible dictionary candidates (ascending), length (descending) and original order (stable). Attempt exact joint assignment for the first 25 positions; remaining 84 do not contribute constraints to the learned state. There is no beam pruning; a 200,000-state safety cap aborts rather than yielding a negative.

| Original word index (0-based) | Rune length | Individually feasible candidates | Joint surviving assignments |
|---:|---:|---:|---:|
| 754 | 14 | 23 | 23 |
| 2341 | 14 | 27 | 5 |
| 1353 | 14 | 33 | 0 |

Thus these three authentic ciphertext words cannot all be any same-length words in the specified finite native-GP lexicon under one globally fixed G,H. This is stronger than the earlier identity-G gate and specifically conditional on these word spellings and the shared-table assumption. Individually each long ciphertext word has some candidate; the contradiction is joint.

## Independent key-state recovery controls

The exact same attack on 109 independently chosen native-English words with the authentic length pattern, planted G(x)=11x+7 mod29 and nonlinear H(x)=GPprime(x)^2+3x mod29, and independent starts, leaves **one** training assignment after three positions and after all 25 training positions. Its largest connected variable component has **46/58** nodes. Without modifying the fitted state, the remaining 84 ciphertext words each have exactly one compatible dictionary candidate, **84/84 correct**. This is actual predictive decoding under the planted model, not a claim of full table identification or arbitrary free-start decoding. The true model's inverse with known initial plaintext is exact.

Separately, 14 dictionary-covered long-word occurrences in the known LP1 plaintext reference (repetitions included) are encrypted by the same tables. Training on eight leaves two states, both compatible with all six withheld occurrences but only two uniquely correctly decoded. This smaller repetitive control does not support a claim of universal recovery.

The original three-word contradiction is exact within the finite dictionary and relaxed modular constraints, whereas the positive evidence is conditional on the stated planted models. No first-party instruction selects the extra table. Unknown vocabulary, changed boundaries, different registers or nonstationary keys remain outside scope. Do not rerun this family without independent reason to revise one of those assumptions.

**Reproduction:** [standalone CommonJS SFT](../sims/lp2_integrated_two_table_feedback_exact_sft.cjs), using checked-in data. Run from repository root under Node.js 22 on Windows. The reported original/plant and LP1-control computations were executed on the actual fetched data in connected V8; no independent CI run is claimed. The program additionally asserts source-parser agreement and exact known-key plant inversion.
