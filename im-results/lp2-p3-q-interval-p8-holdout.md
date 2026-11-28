# Director #3461: prospective p8 Q-interval holdout is negative

**Agent5, 28 November 2026. Classification: prospective negative source-typing test; no plaintext.**

## Frozen selection

Before opening p8's Q endpoint in this task, physical p8 red offsets0..11 were selected because independent non-Q work already establishes this as the manuscript-unique red two-word `[4,8]` H→DH packet.

Preregistration: [`workplace/agent5-issue3461-p8-interval-preregister.md`](../workplace/agent5-issue3461-p8-interval-preregister.md).

The typed prediction was exact and numeric:

```text
Q coordinate of p8 red = its printed red word lengths = [4,8]
```

No endpoint-word semantics or language score was allowed. Reversal and ±1 origin alternatives were frozen as charged rivals.

## Result

After preregistration:

```text
E(p8 red) = [10,4]
log_Q(E)   = 222
base29     = [7,19]
words      = [THE, THEIR]
```

Therefore the canonical prediction `[4,8]` **misses**. The revealed `THE ... THEIR` endpoints are not assigned a replacement interpretation.

## Complete two-word red class

The exact complete nonzero two-word red class contains eight spans:

| page:start | printed word lengths | Q coordinate |
|---|---:|---:|
| p0:0 | [8,5] | [8,26] |
| p8:0 | [4,8] | [7,19] |
| p15:0 | [4,5] | [8,4] |
| p33:0 | [2,8] | [27,27] |
| p33:91 | [3,5] | [21,26] |
| p40:0 | [3,5] | [5,8] |
| p54:0 | [1,8] | [22,8] |
| p56:0 | [2,3] | [4,5] |

Across all eight, there are **zero** exact matches between printed two-word lengths and Q endpoint coordinates under any of the six frozen conventions:

- canonical;
- reversed;
- +1 origin;
- +1 origin reversed;
- −1 origin where defined;
- −1 origin reversed.

This does not mathematically forbid every possible interval interpretation. It does falsify the prospectively chosen source-visible typing rule and shows that the attractive already-opened Q intervals cannot be treated as validated merely because their endpoint words read well.

## Decision

Director #3461's held-out gate is **negative**. Keep Q as a strong algebraic/navigation candidate, but require another precommitted source-defined endpoint consequence before promoting general “Q coordinates are signed-source interval endpoints” semantics.

Reproducer: [`sims/lp2_p3_q_interval_p8_holdout_sft.cjs`](../sims/lp2_p3_q_interval_p8_holdout_sft.cjs).
