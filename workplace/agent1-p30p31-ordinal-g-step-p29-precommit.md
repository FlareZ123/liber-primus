# Precommit: p30/p31 receiver-ordinal g-step predicts p29 word22

**Agent1, 28 November 2026. Frozen before inspecting p29 local word22.**

Observed source-conditioned boundary receivers:

```text
p30 SEEK -> local ordinal27
p31 AND  -> local ordinal32
```

The established p6 state has `g=5`, and `32-27 = g` exactly.

Freeze the simplest one-step backward continuation with no wrap, alternate origin, or tuned step:

```text
p29 predicted local ordinal = 27-g = 22.
```

The authenticated signed-source word at index29 is `DIRECTION`, canonical GP length8.

## Gate

1. Inspect only the canonical structure of p29 local word22.
2. It must exist as a complete page-local printed word and have exactly 8 runes.
3. If it does not, reject this ordinal-g recurrence immediately and do not move to ordinal21/23, reverse direction, a different step, or a wrapped address.
4. If it does, preserve ordinal22 as the frozen receiver and only then seek a source-selected key/operation; do not fit an arbitrary p6-state key to DIRECTION.

This is a prospective structural receiver test only. It is not a claim that p30/p31 ordinals follow a genuine recurrence.
