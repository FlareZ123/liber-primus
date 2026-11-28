# Director #3462: DIRECTION does not uniquely source-select the semilinear F(Qx) transition

**Agent5, 28 November 2026. Classification: source-control operator adjudication; negative for authored semilinear transition.**

## Decision

The attractive red chain

```text
p15 first -> p40 -> p27
```

under `T(x)=Frobenius(Qx)` is exact, but it is **not selected by the strongest independent solved/source-typed control**.

The minimal no-fitted-constant operation family induced by the frozen Q map and DIRECTION=29 was charged as:

```text
Qx
Q^-1 x
F(x)
F(Qx)
Q F(x)
F(Q^-1 x)
Q^-1 F(x)
Q^29 x
Q^-29 x
```

The last two are necessary rivals because the signed source may mean “take the Q path 29 steps” rather than “apply Frobenius to the current state.”

## Independent solved control: p56

Solved p56 supplies a pre-existing typed output: its red state under the frozen Q multiplication gives `[1,2]`, the first adjacent pair of its real prime-minus-one stream.

For p56 red `[3,23]`, the complete family gives:

| operation | output |
|---|---:|
| Qx | **[1,2]** |
| Q^-1x | [7,0] |
| F(x) | [14,6] |
| F(Qx) | [7,27] |
| QF(x) | [27,0] |
| F(Q^-1x) | [7,0] |
| Q^-1F(x) | [19,7] |
| Q^29x | [27,0] |
| Q^-29x | [11,22] |

Thus **plain Q multiplication is the unique family member preserving the independently established solved-p56 consequence**.

This comparison does not use p40, p27, or the older p27→p32 route to choose the operation.

## Freeze Qx, then reveal red-state behavior

After Qx is selected by p56:

```text
Q * E(p40 red) = [17,10] = THE / PRIMUS
Q * E(p8 red)  = [10,16] = PRIMUS / ARE
```

Neither output is another printed red state.

In fact, over **all 18 printed red spans**, plain Q multiplication has **zero nontrivial red→red one-step edges**.

By comparison, `F(Qx)` has the familiar two nonzero edges

```text
p15 first -> p40
p40       -> p27
```

but it loses the independent p56 control that uniquely chose Qx.

## Scientific consequence

This is exactly the causal gap the Director issue asked to adjudicate.

- `DIRECTION=29` genuinely motivates Frobenius and 29-step Q operations.
- The phrase order can motivate `F(Qx)`, but source prose order is weaker evidence than the solved-p56 typed cryptographic consequence.
- Once the complete simple family is charged, **the operation that wins the solved control is not the operation that creates the desired red chain**.

Therefore the semilinear p15→p40→p27 navigation should remain **conditional/post-discovery structure**. It must not be counted as independent authentication of Q or of the p40 dual-route convergence unless a new original clue selects the semilinear composition without using its target hits.

Reproducer: [`sims/lp2_p3_q_direction_operation_adjudication_sft.cjs`](../sims/lp2_p3_q_direction_operation_adjudication_sft.cjs).
