# P15 prime-difference DH-role gate: direct transcript values anchor K/g/p, but no coherent role traversal survives

**Agent4, 28 November 2026. Director task #3469. Classification: bounded original-artifact role-provenance audit. The Fibonacci/prime generator and authenticated 2013 DH transcript are established inputs; no descriptor→DH map, unknown body plaintext, or fitted key is used.**

## Decision

The established p15 generator is

```text
N(n) = |3301 - prime(distinctFibonacci[n] + 1)|
```

with authored red-origin forward lanes

```text
Fibonacci inputs: 0,1,2,3,5,8,13,...
selected primes:   2,3,5,7,13,23,43,...
printed cells:  3299,3298,3296,3294,3288,3278,3258,...
```

The independently authenticated 2013 worked DH example fixes the public/state values and order

```text
p=23 -> g=5, A=8 -> B=19 -> K=2.
```

The prime prefix therefore contains three **literal** transcript values:

```text
2  = K
5  = g
23 = p.
```

Those equalities are source-anchored and need no p15 descriptor-role fit. But they do **not** make the full prime prefix a DH-role serialization.

## Transcript-order charge across both generator lanes

Take only exact public-value matches, with no derived expressions.

The Fibonacci lane contains `K=2, g=5, A=8`. Projecting the authenticated transcript onto those present roles gives

```text
g -> A -> K.
```

Across all 32 cyclic/reversal presentations of the 16-term Fibonacci lane, that projected order is realized only in the **forward** direction.

The selected-prime lane contains `K=2, g=5, p=23`. Its transcript projection is

```text
p -> g -> K.
```

Across all 32 cyclic/reversal presentations of the selected-prime lane, that projected order is realized only in the **reversed** direction.

Because each printed grid cell is one fixed Fibonacci-input → selected-prime pair and the already solved red-origin spiral supplies one authored direction for both lanes, there is **no single cyclic start/direction** that makes both lanes respect the authenticated DH order. Exhaustive joint charge: **0/32**.

This rejects the simplest claim that the generator itself tells a player how to attach protocol roles by transcript order.

## Low-description arithmetic role charge

The previously published state-compatible prime labels were

```text
[2,3,5,7,13,23]
= [K,e,g,K+g,b-K,p].
```

Only `K=2`, `g=5`, and `p=23` are direct authenticated DH values. To test whether the other labels are forced, derive the unique DH secrets from the same worked example (`a=6,b=15`) and charge a deliberately small expression language over

```text
{F=0, 1, K=2, g=5, a=6, A=8, b=15, B=19, p=23}
```

with either a direct atom or one modular-29 `+` / `-` operation.

Minimum-description results for the first six selected primes are:

```text
2  : K                                      (unique direct atom)
3  : 1+K, K+1, g-K, A-g                    (4 equal-cost forms)
5  : g                                      (unique direct atom)
7  : 1+a, 1-p, K+g, g+K, a+1, A-1, b-A   (7 equal-cost forms)
13 : g+A, A+g, b-K, B-a, B+p, p+B          (6 equal-cost forms)
23 : p                                      (unique direct atom)
```

So the source can name three literal values, but the derived labels `e`, `K+g`, and `b-K` are not selected by this low-description family. In particular, `e=3` is not a role present in the authenticated DH transcript at all.

## Later-generator role holdout

Before evaluating a state label for the next generator difference, keep the same expression grammar fixed and reduce the already established next selected prime `43` to GP29:

```text
43 mod29 = 14.
```

Its minimum one-operation interpretations are again non-unique:

```text
-b, a+A, A+a, A-p, b-1, B-g.
```

Thus the later cell does **not** validate a unique continuation of the published role sequence. No extra operation, preferred sign, or descriptor-derived role is introduced after reveal.

The same ambiguity persists on later primes: `79 mod29=21` has seven minimum one-op forms; `149 mod29=4` has five.

## What remains established

The generator itself remains exact and unusually structured:

- the red-origin forward sequence is uniquely selected among its cyclic/reversal presentations;
- its first six prime offsets are exactly `[2,3,5,7,13,23]`;
- three of those are literal authenticated DH values `K,g,p`;
- the corresponding Fibonacci lane contains literal `K,g,A`;
- the 3301 anchor remains a strong independent link to the authenticated `BASE29 3301 -> 3QO` example.

What #3469 rejects is the stronger causal wording that the generator **fixes the DH role packet**. The two lanes demand opposite directions under direct transcript ordering, and the derived prime labels have multiple equally simple state expressions.

## Issue decision

Retain the generator/DH relation as a **conditional state compatibility plus three direct public-value anchors**, not as a source-selected role decoder. Do not use the prime sequence to validate the disputed p15 descriptor→role map or to seed a body cipher.

A positive successor would need a new original-artifact instruction that chooses one arithmetic expression or one lane direction before inspecting the DH labels.

Reproducer: [`sims/lp2_p15_prime_difference_dh_role_gate_sft.cjs`](../sims/lp2_p15_prime_difference_dh_role_gate_sft.cjs).
