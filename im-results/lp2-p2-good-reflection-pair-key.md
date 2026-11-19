# Exact reflection-pair key candidate for p2 GOOD

**Agent12, 18 November 2026. Classification: exact reversible candidate, still post-hoc.** Four independently source-derived state values, combined by the source-selected horizontal reflection into outer/inner sum-difference pairs, reproduce the exact four-rune additive key that decrypts the prospective p2 receiver `U TH H Y` to `G O O D`. The slot ordering was recognized after GOOD was known, so this is not authenticated plaintext.

## Frozen source values

The candidate uses four values already selected elsewhere without reference to the p2 rune values:

- **K=2**, the reconstructed DH23 shared value and two-peel p50 state;
- **NG=21**, the original-rune center of the source-selected `H-NG-C` TURNS key node;
- **V=4**, the vertical component magnitude of the authenticated `LIES / EMPTY / EPIPHANY` +29 direction ray, invariant under the p50 tree reflection;
- **p=23**, the reconstructed 2013 DH modulus.

The p50 tree artwork independently selects horizontal reflection as a valid geometric operation. For a four-rune key `[k0,k1,k2,k3]`, that reflection naturally pairs outer positions `(k0,k3)` and inner positions `(k1,k2)`.

## Exact candidate

Over GP29, impose the pair invariants

```text
outer sum:        k0 + k3 = -K = -2
outer difference: k0 - k3 = NG = 21

inner sum:        k1 + k2 = V = 4
inner difference: k1 - k2 = p = 23
```

Since `2^-1 mod29 = 15`, the system has the unique solution

```text
k0 = (-2 + 21)/2 = 24
k3 = (-2 - 21)/2 = 3
k1 = ( 4 + 23)/2 = 28
k2 = ( 4 - 23)/2 = 5

key = [24,28,5,3] = A EA C O
```

The original prospective p2 word9 ciphertext is

```text
U TH H Y = [1,2,8,26]
```

and direct GP29 subtraction gives

```text
[1,2,8,26] - [24,28,5,3]
= [6,3,3,23]
= G O O D
```

Forward addition reconstructs all four original runes exactly.

## Assignment audit

The reflection-pair transform itself fixes four algebraic slots: outer sum, outer difference, inner sum, inner difference.

Using exactly the four selected residues `{2,21,4,23}`, exhaustive permutation and independent sign choice gives

```text
24 permutations * 16 sign patterns = 384 assignments
exact GOOD hits = 1
```

The sole hit is

```text
(-2, +21, +4, +23)
```

in the four slots above.

A broader source-state pool

```text
{2,3,4,5,6,8,12,15,19,21,23}
```

covering shared2, both signed-ray component magnitudes, DH `g/a/A/b/B/p`, `phi(NG)=12`, and NG itself gives `11P4 * 16 = 126,720` signed assignments. Four hit GOOD, but they are the same GP29 residue solution: `-8=21 mod29` may replace `+21`, and `-6=23 mod29` may replace `+23`.

This is a search audit, not a p-value. The target GOOD and the algebraic slot family were available when the candidate was formulated.

## Strongest objection

The unresolved assumption is **which state value belongs in which sum/difference slot, and with which sign**. Reflection motivates symmetric pairing, and sum/difference is the canonical reversible coordinate change for a reflected pair, but no first-party clue yet says “outer sum is -K, outer difference is NG, inner sum is the direction component, inner difference is p.”

Therefore this candidate is a genuine exact inverse, but still vulnerable to post-hoc assignment.

A naive continuation also fails to authenticate it: repeating the same four-rune key on the following p2 word does not produce LUCK. The key should be treated as local unless another source instruction supplies a state transition.

## Promotion criterion

Promote this mechanism only if one of the following occurs:

1. an original clue independently orders the four state values into these reflection-pair slots; or
2. the same frozen slot assignment predicts a fresh four-rune receiver selected before its plaintext is inspected.

Reproducer: `sims/lp2_p2_good_reflection_pair_key_sft.cjs`.
