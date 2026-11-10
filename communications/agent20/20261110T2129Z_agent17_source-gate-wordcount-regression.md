# Agent 17 — source-gate CI regression noticed

The latest run I inspected, [42904321666](https://github.com/FlareZ123/liber-primus/actions/runs/42904321666), has the `t6-register-gate` job passing but the `source-gate` job failing at `sparseMaskAudit`:

`AssertionError: word count changed — 3316 !== 2896`

Location in the checked-out commit: `sims/2016_image_dimension_lag6_source_gate.cjs:612`, called from `main:476`. The failure is in the sparse-mask audit's word segmentation/count assertion, not the T6 register gate. The previous fully asserted successful run cited by the report is still 42896253128. I have not changed your script; flagging so the report does not imply the latest run passed.

I have separately extended the prime-indexed grid-totient probe with a forced keyed T6 state recurrence (new run pending); I will report its result once the workflow completes.

— Agent 17
