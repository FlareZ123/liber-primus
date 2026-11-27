# GP-prime adaptive rank insertion: original-data gate

Agent 7 — 2026-11-27. Related: [time-dependent insertion](lp2-prime-rank-insert-recency-gate.md). This is a candidate mechanism, not an authenticated Cicada instruction.

For a private bijection S: plaintext rune -> rank and arbitrary initial permutation A of GP29, emit C=A[S(P)], remove C and insert it at R(X)=(GPprime(X)-1) mod 29, with X=C or P. The receiver reverses the same update. In the transparent-F extension P=0 emits literal C=0 without changing A. The motivation is the authenticated prime/totient vocabulary, GP chart and circumference language; none selects this list update.

## Ordinary gate

Immediate repeats imply S(P_i)=R(X_{i-1}); nonrepeats forbid that assignment. In each known-donor alignment the insertion ranks are known, so propagate a bitset of possible positions per ciphertext glyph. At each symbol intersect the selected glyph domain with the static S domain for the aligned plaintext rune, update the position domains, complete the rank assignment and replay initial slots. This refinement recovered both exact secret permutations on four independently keyed full-length controls (two disjoint Gibran windows reused across roles, 51,824 runes total). Earlier rank-completion search hit caps on three controls; the refined solver does not. This is known-donor inversion, not ciphertext-only key recovery.

All 35,129 full-book windows and 45,077 p40–53 windows of the normalized Gibran donor fail the positive repeat anchor for both roles. For ciphertext-driven insertion, the public insertion schedule also permits all-initial-order position-domain bounds independent of a proposed plaintext:

| Scope | Top-two rank counts at most | Minimum donor top-two |
|---|---:|---:|
| Whole book | 1097 | 2555 |
| p40–53, carried state | 256 | 563 |
| p40–53, independent reset | 337 | 563 |

The position domains synchronize at index 372 on whole-book input and 203 on the reset chapter. The fixed private rank chart only permutes frequencies. Canonical A with all 812 affine S per role, fitted p0–2 and scored on carried p40–53, produces nonprose; best held scores -4.9836 (C-driven), -5.0478 (P-driven). Exact encryption replay is necessary but not evidence for the key.

## Transparent F, ciphertext-driven, all private charts and initial permutations

Fix f=S(F). Partition the relaxed state by the exact rank z of ciphertext glyph 0. Initialize each possible z, with other glyph domains excluding z. A visible zero may hold (output rank f) or consume at z if z != f. A nonzero selects a rank different from f; split the selected rank domain at z, so the new position of zero is exact. Apply singleton all-different propagation before and after updating rank domains; merge states only within the same z and fixed f, unioning domains and taking the maximum of each accumulated rank count. Every concrete path is included. Individual count maxima need not share a path, so their two largest sum is a conservative upper bound.

Two independent 3008-rune F controls retain all 174,464 actual glyph positions and correct rank counts under this relaxation. This is containment validation, not key recovery.

On the whole book, 28 of 29 fixed f choices become impossible by offset 534 at latest. Only f=27 survives, one terminal zero-position state with singleton domains, and top-two count <=1126 (donor minimum 2555). On independently reset p40–53, 28 choices die by offset 505 at latest; f=27 survives with top-two <=345 (donor minimum 563). Therefore the C-driven receiver cannot match any tested native donor frequency profile under any initial permutation, rank chart or transparent-F decisions. The relaxed surviving path need not be a concrete path. The P-driven transparent-F arbitrary-chart family is not excluded here. Do not extend finite-donor comparisons to universal claims about English or all adaptive alphabets.

## Reproduction

- [SFT](../sims/lp2_gpprime_rank_insert_sft.cjs)
- [Raw output](lp2-gpprime-rank-insert-output.json)

Executed the identical experiment function in connected V8 using repository-pinned inputs. No separate Node wrapper or CI execution claimed. No unknown LP2 plaintext, authenticated key or original destination recovered.
