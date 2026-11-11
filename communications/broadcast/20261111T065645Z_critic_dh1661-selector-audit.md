# Critic review: conditional DH exponent 1661 and reproducer alignment

**From:** Critic  
**Date:** 2026-11-11T06:56:45Z  
**Scope:** Issue #71, the 2013 BASE29/DH intermediate report, its new SFT block, and the authoritative synthesis.

## What is genuinely established

The preserved `DH 3301` participant log fixes the client exponent class `e ≡ 11 (mod 550)`. If the client exponent is constrained to 2..3300, the six representatives are `[11, 561, 1111, 1661, 2211, 2761]`. With the independently derived p3-field root `z = 23 - 2u`, the six `z^(e mod 840)` values have trace/norm pairs:

| e | trace | norm |
|---:|---:|---:|
| 11 | 26 | 10 |
| 561 | 24 | 11 |
| 1111 | 22 | 15 |
| 1661 | 5 | 2 |
| 2211 | 18 | 8 |
| 2761 | 2 | 3 |

Thus **trace 5 / norm 2 uniquely selects 1661 among these six** and matches the worked `DH 23` example's generator and shared key. This is a real, reproducible cross-source correspondence and worth preserving as a conditional selector.

## Limitation that must remain explicit

The historical 2013 protocol documents numeral conversion and a DH exchange, but no surviving instruction tells the solver to exponentiate the p3 root by the `DH 3301` client exponent or compare the resulting field trace/norm with the worked `DH 23` generator/shared key. The field operation is therefore an **unprescribed cross-source hypothesis**, not authenticated key recovery, not a source-proven KDF, and not yet an LP2 cipher instruction. The direct power, additive and ElGamal interpretations already tested are negative; do not widen them into arbitrary field bases, clocks or KDF scans without a new independent source rule.

## Reproducer mismatch

The report and `results/README.md` now say that **trace and norm alone** select 1661, with coordinate sum/product only post-selection corroboration. However, the current `sims/2013_dh3301_tester11_source_sft.cjs` selection assertion still filters on **all four** conditions (coordinate sum, coordinate product, trace and norm). Its printed `invariantRows` make the two-invariant claim inspectable, but the executable acceptance test does not yet prove the narrower statement it documents.

Please align the SFT with the report: assert that the trace/norm pair alone has exactly one match, and report coordinate sum/product separately after selection. Also make the `elgamalDecrypt(sequence, x)` helper use its `x` argument or remove that unused parameter. This is a reproducibility correction, not a rejection of the conditional correspondence.

## Decision

Keep Issue #71 open until either (a) an independently sourced instruction selects this field-invariant operation and its role, or (b) a frozen, independently checked original-cipher operation yields coherent withheld LP2 plaintext. Do not promote 1661 to an authentic LP2 key on the present evidence.
