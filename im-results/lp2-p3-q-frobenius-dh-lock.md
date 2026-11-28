# P3 quotient Frobenius lock reconstructs the authenticated DH state

**Agent45, 28 November 2026. Classification: exact source-derived field identity with an authenticated historical cross-lock. This strengthens the p3/p15/p57 route materially, but it is not yet unknown LP2 plaintext or a body cipher.**

## Result

The existing p3/p15/p57 construction fixes all of the following before this check:

- physical p3 marked red trinomial `[13,23,2]`, read as low-to-high coefficients;
- the irreducible relation `u^2 = 3u + 8` over GF(29);
- p15 second-red minus solved p57 red opener, divided exactly by that trinomial;
- quotient `Q=[5,5,14,9,10,4,27,17,25]`;
- field evaluation `E(Q)=17+24u=[17,24]`;
- multiplication matrix `M_Q=[[17,18],[24,2]]`, whose zero-based authenticated-2016 word readout is **THE MAP / AND PATH**.

The p3 quadratic has discriminant 12, a nonsquare modulo29, so it genuinely defines GF(29^2). Its two roots sum to3. Therefore the field's unique nontrivial Frobenius automorphism is

```text
u -> u^29 = 3-u.
```

Apply that canonical operation to the already frozen quotient evaluation:

```text
Q       = 17 + 24u
Q^29    = 17 + 24(3-u)
        =  2 +  5u
        = [2,5].
```

The authenticated 2013 TCP-server DH example is

```text
p=23, g=5, A=8, B=19, K=2.
```

Thus the Frobenius image is exactly

```text
Q^29 = [K,g].
```

The standard field trace and norm then recover the two public DH values with no fitted operation or parameter:

```text
Tr(Q) = Q + Q^29   = [19,0] = B
N(Q)  = Q * Q^29   = [ 8,0] = A.
```

The physical p3 trinomial itself has middle coefficient23, the historical DH modulus. Taken together, the source-derived field object reconstructs the historical tuple as

```text
p3 middle coefficient       -> p = 23
Frobenius(Q), second coord   -> g = 5
Norm(Q)                      -> A = 8
Trace(Q)                     -> B = 19
Frobenius(Q), first coord    -> K = 2
```

and standard DH then has the unique exponent `a=6` in `5^a mod23 = 8`.

This is qualitatively different from assigning state names to arbitrary residues after discovery: **Frobenius, trace and norm are the canonical automorphism and invariants of the exact source-fixed GF(29^2) object.** No phase, sign, scalar, row ordering, or target plaintext is selected.

## Authenticated 2016 DIRECTION29 selects the Frobenius step

The authenticated 2016 warning's zero-based numbering was fixed independently of this field construction. Its central sentence ends

```text
... THEIR NUMBERS ARE THE DIRECTION
                         25 26 27 28 29
```

so **DIRECTION is word29**. That is exactly the base-field size and therefore exactly the canonical Frobenius exponent of GF(29^2).

This gives a direct human-clue reading of the already frozen path:

```text
multiplication matrix words -> THE MAP / AND PATH
DIRECTION word number       -> 29
take the Q path 29 steps    -> Q^29 = [2,5] = [K,g]
one further step / norm     -> Q^30 = [8,0] = A
field trace                 -> [19,0] = B
```

The exponent29 is not inferred from the DH target: it is simultaneously the GP alphabet size, the field characteristic, and the independently established word number of **DIRECTION** in the signed source. This makes `Q^29` a clue-selected operation rather than an arbitrary power search.

It also explains why primitive order840 matters operationally: multiplication by Q is a complete path through the 840 nonzero field states, and the signed source supplies the first distinguished stride on that path.

## The same map has the DH characteristic polynomial

For the already frozen multiplication matrix

```text
M_Q = [[17,18],
       [24, 2]]
```

the invariant trace and determinant are

```text
tr(M_Q)  = 19 = B
det(M_Q) =  8 = A.
```

Hence

```text
chi_M(lambda) = lambda^2 - B lambda + A.
```

Equivalently, every state on the Q path satisfies the fixed second-order recurrence

```text
v[n+2] = B*v[n+1] - A*v[n]    (mod 29).
```

This supplies a precise algebraic meaning for the already discovered **THE MAP / AND PATH** matrix phrase: the map is a maximum-period field multiplication whose characteristic coefficients are the authenticated DH public state.

## Maximum-period path

`Q` has multiplicative order

```text
29^2 - 1 = 840.
```

So multiplication by Q visits every nonzero state in GF(29^2) exactly once before repeating. In particular,

```text
Q^29 = [K,g] = [2,5]
Q^30 = A     = [8,0].
```

There are 192 primitive nonzero field elements. Only two elements have `trace=B` and `norm=A`: Q and its Frobenius conjugate; both are primitive. Frobenius is bijective, so exactly one field element maps to the ordered coordinate pair `[K,g]`, namely the already source-derived Q.

These are finite exact identities, not calibrated discovery probabilities.

## Why this materially advances the route

Before this check, the p3 quotient had an instruction-shaped 2016 matrix phrase plus solved-p56 and typed-p54 consequences, but its DH-state interpretation was still largely a collection of output labels.

The Frobenius lock removes that weakness. The source-derived Q is now simultaneously:

1. a field element whose multiplication matrix spells **THE MAP / AND PATH** in the authenticated 2016 numbering;
2. a **primitive** generator of the complete nonzero GF(29^2) path;
3. an element whose canonical conjugate is exactly **[K,g]**;
4. an element whose canonical norm and trace are exactly **A** and **B**;
5. a map whose characteristic polynomial is therefore `lambda^2-B lambda+A`.

That makes a changing-state Q-path consumer newly motivated. It does not authorize arbitrary phase searches: the next decoder must use a source-selected seed/boundary and one of the canonical field operations, then succeed prospectively on an untouched receiver.

## Immediate consumer check

The most literal fixed 2-rune Hill interpretation of `M_Q` was checked on the source-typed p54 continuation after its red9 opener, including Q/Q^-1, the two local coordinate orders, both stream directions, and the visible offset9/10 boundary alternatives. All presentations are nonprose. This closes only the **stationary one-step Hill** reading.

A second exploratory check used the typed p54 output `[0,20]` as the initial state and advanced it by Q or Q^-1 while applying additive or multiplicative field consumers to the black body. The tested outputs are likewise nonprose under the existing GP29 fourgram diagnostic. Because that exploratory family has not yet received a matched native-control calibration, it is **not** promoted as an exclusion here.

The causal next step is narrower: exploit the newly fixed recurrence `v[n+2]=Bv[n+1]-Av[n]` only where another original clue fixes the seed and consumption boundary before ciphertext scoring.

Reproducer: [`sims/lp2_p3_q_frobenius_dh_sft.cjs`](../sims/lp2_p3_q_frobenius_dh_sft.cjs).
