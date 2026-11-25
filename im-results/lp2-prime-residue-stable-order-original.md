# Whole-chapter stable prime-residue ordering: exact original inverse (#2842)

**Agent42, 25 November 2026. Decision: the frozen stable ordering plus native p56 clock is impossible on both requested original chapters. No unknown plaintext or key.**

The historical transposition and p56 prime-minus-one/F-hold mechanisms are independently real; the proposed composition has no authenticated 2014 instruction. This tests the exact Director #2842 rule only. It is distinct from the [p50 perimeter rank composition](lp2-p50-perimeter-rank-prime-composition.md), the [p15 fixed 16-slot order tests](lp2-p15-spiral-prime-clock-order-gate.md), and [word-local cyclic transport](lp2-native-prime-word-rotation-exact.md).

## Fixed inverse

For a chapter of N printed runes, use zero-based prime index j with s[j]=(prime[j]-1) mod29. Sort physical positions j by (s[j],j) to obtain permutation T. Native encryption emits zero for plaintext F without consuming a prime, otherwise emits (P+s[k]) mod29 and advances k. The hypothetical printed ciphertext is C[t]=E[T[t]], where E is the natural-order native ciphertext. Undo exactly this public permutation: E[T[t]]=C[t], then invert the native prime clock from k=0 with all F ambiguity. No punctuation or word cuts are required, no bucket-order/origin/sign or layer-order variants searched.

The exact dynamic program at each position retains every feasible consumed-prime cursor and counts every distinct legal plaintext path with BigInt. For an incoming cursor k and given E[i], a hold is permitted iff E[i]=0; a consume is permitted iff (E[i]-s[k]) mod29 is nonzero. Zero cannot be emitted as a consuming plaintext zero. The raw output retains the complete reachable inverse DAG for the last feasible prefix, explicit path counts, permutation, representative prefix and first failed position. No English score is needed when the inverse has no path at all.

## Original decision

| Physical source | Runes | Stable-order legal prefix | First failed natural-order index / original printed index | Dead ciphertext / sole cursor / shift | Complete paths | Direct native comparator prefix |
|---|---:|---:|---:|---:|---:|---:|
| p54–55 (first) | 308 | 23 | 23 / 13 | 1 / 23 / 1 | **0** | 105 |
| p0–2 (replication) | 729 | 41 | 41 / 159 | 6 / 41 / 6 | **0** | 235 |

In both stable-order cases there is exactly one feasible cursor at every prefix step, so the failure is independent of F-path choices, lexical register and hidden spacing. In the terminal chapter the 24th prime is 89, whose minus-one residue is 1; the rearranged source cipher rune is 1, so its only consuming inverse would be F while an F hold cannot emit 1. In the opening chapter the analogous 42nd prime is 181, whose minus-one residue is 6. The direct native rival also dies, but at different positions. Both original candidates have zero complete outputs, so the supplied prefix is not plaintext and no further scoring is justified.

## Calibration

Authentic p56 replay: 85/85 original ciphertext runes, 84 consumed primes. For three independent native solved-section plants, use their exact first 308, 729 and 95 runes, apply native encryption then the prescribed stable order, and invert without F-mask knowledge. The true plaintext path is retained for all three (1,132 planted runes); the forward encoder exactly reproduces every plant. The plants have respectively 5,236, 1,646,800 and 20 legal plaintext paths. Thus retention is not unique plaintext identification. Each direct native inverse fails on the reordered plant but succeeds on the corresponding unpermuted plant, a useful discriminatory control rather than another source-key claim. The program enumerates complete outputs when there are at most 10,000 and otherwise represents the exact candidate set through its DAG.

**Director decision:** close #2842 for the exact requested composition, without increasing origins or modifying order. No evidence for an authored stable-bucket layer; no result for arbitrary chapter permutations, alternate clocks or altered layer orders. Preserve independently motivated candidates only if a new source selector appears.

[SFT](../sims/lp2_prime_residue_stable_order_original_sft.cjs) · [Exact output](lp2-prime-residue-stable-order-original-output.json). Run `node sims/lp2_prime_residue_stable_order_original_sft.cjs` from the repository. The original-input experiment function ran in the connected JavaScript runtime and was rerun after a readability-only assertion change; no Windows CI is claimed.
