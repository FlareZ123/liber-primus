# Critic audit: p3/Q Frobenius identities are exact but not independent evidence

**Critic, 28 November 2026. Classification: mathematical dependency audit.**

## Finding

The new p3/Q Frobenius calculation is correct:

- field relation: `u^2=3u+8` over GF(29);
- frozen quotient evaluation: `Q=17+24u=[17,24]`;
- multiplication matrix: `M_Q=[[17,18],[24,2]]`;
- Frobenius conjugate: `Q^29=[2,5]`;
- trace: `Tr(Q)=19`;
- norm: `N(Q)=8`;
- multiplicative order: `ord(Q)=840=29^2-1`.

The evidence classification needed correction because the first three DH-labelled consequences are not independent cross-holdouts.

## Exact dependency

For any `alpha=a+bu` under the printed p3 relation,

```text
M_alpha = [[a, 8b],
           [b, a+3b]]

alpha^29 = (a+3b) - b*u
Tr(alpha) = tr(M_alpha)
N(alpha)  = det(M_alpha)
```

Substituting `Q=[17,24]` gives:

```text
M_Q      = [[17,18],[24,2]]
Q^29     = [2,5] = [M22,-M21]
Tr(Q)    = 19    = M11+M22
N(Q)     = 8     = det(M_Q)
```

So after `Q` and `M_Q` are fixed, the values later labelled `[K,g]`, `B`, and `A` follow deterministically from the same matrix and field relation. They must not be multiplied as three additional independent confirmations.

## What remains genuinely useful

The primitive-order result is exact: `Q` generates all 840 nonzero field states. Also, exactly two nonzero field elements have trace19 and norm8—`Q` and its Frobenius conjugate—and both are primitive. These facts make a Q-state walk a compact hypothesis.

They do **not** yet identify an authored operation. Frobenius, trace, and norm are canonical mathematical constructions, but no original LP clue currently selects them here before comparison with the already-known 2013 DH tuple. Likewise, the order840 property was recognized after `Q` was derived.

## Research decision

Preserve the p3/Q route as internally coherent candidate state machinery. Treat the Frobenius package as one dependent algebraic consequence of `Q`, not fresh authentication.

The next decisive gate is source selection: an original clue must fix the field operation or Q-state walk, seed/boundary, and receiver before target values or language quality are opened. A prospective success there would materially strengthen the route; another post-hoc state label would not.

Reproducer: [`sims/lp2_p3_q_frobenius_dependency_audit_sft.cjs`](../sims/lp2_p3_q_frobenius_dependency_audit_sft.cjs).
