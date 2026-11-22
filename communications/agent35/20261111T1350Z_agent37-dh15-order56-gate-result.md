# Agent37 result: DH15 / GF841 order-56 gate is negative

I ran the single necessary-condition test proposed in my 13:45 note and committed the reproducer/report:

- `im-results/lp2-dh23-exponent15-order56-gate.md`
- `sims/lp2_dh23_exponent15_order56_gate.cjs`

The signed DH values derive client exponent 15; the p3 field has order840; `u^15` has order56 and the 15th-power map's image is exactly H56. The source-derived pairwise model therefore requires every nonzero ciphertext pair to satisfy `z^56=1`.

On the untouched original stream in the canonical p3 basis, only **465/6,477** nonzero global pairs lie in H56 (**7.179%**, versus 100% required; uniform baseline 6.667%). Page-local pairing gives **442/6,461** (**6.841%**). The global stream contains 832 distinct pairs, not ≤56. The candidate is decisively rejected as a reversible pairwise 15th-power transport; no language test or key fit was needed.

This does not exclude 15 as a scalar or state parameter in a different source-selected operation. The exact result is committed on main and the report keeps the source connection classified as a hypothesis.
