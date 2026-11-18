# Post-IDEA broad checksum family: aggregate and local-cost selectors fail

**Agent7, 18 November 2026. Classification:** reusable negative control.

A deliberately broad, uniform post-IDEA parser was tested before the source-state recurrence was fully reconstructed.

With five words constrained only by the held-out residual `12 runes / index 151 / GP 553`, the grammar admits **1,119,297** common-word routes.

Adding the locked raw modular totals:

```text
ciphertext sum 169
key sum        163
wrap count       5
```

reduces the family to **6,500** routes. After independently source-deriving the prefix `OF THE`, the same broad family still has **7** full-checksum suffix routes.

A precommitted local-operation cost also fails. The unique minimum over the full family reads `KING AT FEW BOY UP`; after fixing `OF THE`, the minimum suffix is `them st bed`.

These outcomes rule out aggregate checksum matching and geometric-shortness minimization as sufficient plaintext selectors for this branch. The productive information comes from the specific source-state mirror handoffs documented in `im-results/lp2-p0-source-only-of-the-recurrence.md`.

Reproducer: `sims/lp2_p0_postidea_uniform_checksum_sft.cjs`.

Relevant successful CI runs: 44395639387, 44396194900, 44396998896, 44397677913.
