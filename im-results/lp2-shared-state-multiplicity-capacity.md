# Shared finite-state direct-output block capacity (Agent 49, 2026-11-26)

## Necessary condition
A common deterministic, synchronous, length-preserving transducer with q total internal states maps any fixed plaintext block of length L to at most q different ciphertext blocks. The initial state can be assigned arbitrarily at EVERY occurrence, allowing a much more permissive model than an actual clock. This includes shared q-phase substitutions, arbitrary phase tables, conjugated cycles, and transparent plaintext-F holds. A state must encode everything influencing future output; e.g. a previous-ciphertext-dependent model has additional states and cannot count only its phase.

Count only within-word plaintext blocks in a native-rune literary window; arbitrary intact-word permutation preserves these occurrences. Grant B=(number of rune-bearing pages−1)(L−1) arbitrary destroyed occurrences to account for resets or cuts at page boundaries. Count all contiguous original ciphertext blocks INCLUDING page and word seams; this enlarges the available capacity. Let P_r and C_s be prefix sums of descending block multiplicities for plaintext and ciphertext respectively, extending the sum by zero beyond the number of distinct blocks. The r most frequent distinct plaintext blocks have at most qr possible output block types in total. The remaining occurrences must occupy distinct actual ciphertext block positions. Thus P_r−C_(qr) ≤ B for every r. No output alphabet or invertibility is assumed. Checking the last rank of every equal-count plaintext class is exact: between class endpoints P_r is linear, C_(qr) is concave, so their difference is convex.

## Results
All contiguous reference windows are tested, L=2,3,4,5. For full LP2 p0–55, N=12956, 55 nonempty pages, B=54,108,162,216 respectively. For L3, original has maximum single block multiplicity 5 and 3580 collision pairs.

| Control | Windows | q8 minimum L3 deficit | Joint q5 survivors | Joint q8 survivors | Joint q13 survivors | Joint q16 survivors | Joint q29 survivors |
|---|---:|---:|---:|---:|---:|---:|---:|
| Gibran | 49537 | 584 | 0 | 0 | 0 | 0 | 3577 |
| Shakespeare | 204151 | 398 | 0 | 0 | 270 | 64036 | 199680 |
| Emerson | 308372 | 192 | 0 | 0 | 235154 | 294186 | 301544 |

All 562060 full-length windows violate the L3 bound at q8 alone (allowance 108). This is stronger than phase-conditioned coincidences because it survives arbitrary assignment of start state at every occurrence, arbitrary word order, and arbitrary shared state-dependent alphabets or state transitions. It does not show that unknown plaintext belongs to the finite donor windows, nor rule out q>8 or a chapter-private receiver.

Largest individual chapter p40–53: N=3008, 13 rune-bearing pages, B=12,24,36,48. Original L3 maximum block multiplicity 3. Joint survivors:

| Control | Windows | q5 | q8 | q13 | q16 | q29 |
|---|---:|---:|---:|---:|---:|---:|
| Gibran | 59485 | 0 | 683 | 9047 | 25053 | 59485 |
| Shakespeare | 214099 | 2622 | 124243 | 196396 | 207331 | 214029 |
| Emerson | 318320 | 6507 | 292699 | 309733 | 312537 | 318320 |

Do not use the global result to close chapter-local common-cycle work. It does remove the need to search a whole-book shared q≤8 direct receiver on these donor controls, even with arbitrary intact-word transport. Reproducer: `node sims/lp2_shared_state_multiplicity_capacity_sft.cjs` from repository root. Synthetic repeated-word q8 plant with literal F hold, random phase maps, two reset points: deficits 0 at all four L, under budgets 2,4,6,8. The actual corpus runs were executed in connector V8, not CI. No unknown plaintext or key recovered.
