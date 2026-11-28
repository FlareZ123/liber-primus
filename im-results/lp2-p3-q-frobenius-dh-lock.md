# P3 quotient Frobenius lock reconstructs the authenticated DH state

**Agent45, 28 November 2026. Classification after Critic audit: exact algebraic identities on the source-derived field object, with an authenticated historical interpretation. They strengthen internal coherence of the p3/p15/p57 route but do not independently authenticate the route, recover unknown LP2 plaintext, or establish a body cipher.**

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

Once Frobenius/trace/norm are chosen, the standard field trace and norm yield the two public DH values. No numeric parameter is fitted in these calculations, but the manuscript has not independently selected these operations before comparison with the known DH state:

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

Frobenius, trace and norm are canonical field operations, and the arithmetic below is exact. However, canonical does not mean source-selected: every field element has these invariants, and the LP source has not yet instructed the solver to apply them here. They therefore should not be counted as independent evidence on top of the already-frozen `Q`/`M_Q` object.

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

## Dependency audit (Critic, 28 November 2026)

The identities above are exact, but they are algebraically dependent on the same already-frozen multiplication matrix. For any `alpha=a+bu` in the printed basis with `u^2=3u+8`,

```text
M_alpha = [[a, 8b],
           [b, a+3b]]

alpha^29 = (a+3b) - b*u
Tr(alpha) = tr(M_alpha)
N(alpha)  = det(M_alpha)
```

For `Q=[17,24]`, this means directly:

```text
M_Q      = [[17,18],[24,2]]
Q^29     = [M22,-M21] = [2,5]
Tr(Q)    = M11+M22    = 19
N(Q)     = det(M_Q)   = 8
```

Thus `[K,g]`, `B`, and `A` are not three new independent confirmations after the matrix is fixed; they are deterministic transforms of that same object under the p3 field relation. The primitive order `840` is a separate exact property of `Q`, but it too was recognized after `Q` was available and does not by itself select a historical consumer.

The useful research consequence is narrower: `Q` remains a compact primitive candidate state map worth testing, but a stronger cipher claim now requires an original clue to select Frobenius/trace/norm or a Q-state walk, plus a prospectively frozen seed/boundary and untouched receiver. Do not multiply these dependent identities as separate authentication factors.

Independent reproduction of the algebraic dependency is in [`sims/lp2_p3_q_frobenius_dependency_audit_sft.cjs`](../sims/lp2_p3_q_frobenius_dependency_audit_sft.cjs).

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

The Frobenius calculation tightens the route's algebraic coherence but does not remove the source-selection weakness. The source-derived Q is now simultaneously:

1. a field element whose multiplication matrix spells **THE MAP / AND PATH** in the authenticated 2016 numbering;
2. a **primitive** generator of the complete nonzero GF(29^2) path;
3. an element whose canonical conjugate is exactly **[K,g]**;
4. an element whose canonical norm and trace are exactly **A** and **B**;
5. a map whose characteristic polynomial is therefore `lambda^2-B lambda+A`.

That makes a changing-state Q-path consumer newly motivated. It does not authorize arbitrary phase searches: the next decoder must use a source-selected seed/boundary and one of the canonical field operations, then succeed prospectively on an untouched receiver.

## DIRECTION29 + Q gives a sparse original-red navigation chain

The clue-selected Frobenius can be composed with the already fixed Q multiplication:

```text
T(x) = Frobenius(Q*x).
```

This is a canonical semilinear map once **THE MAP / AND PATH** and **DIRECTION29** are accepted; it has no fitted scalar or phase. Because Frobenius is an involution and `F(Q)*Q=N(Q)=A`,

```text
T^2(x) = A*x = 8*x.
```

Charge T against the complete set of 18 original red spans, comparing their full two-coordinate p3-field residues. There are only three red→red edges at all:

```text
p3 marked triad -> itself       [0,0] -> [0,0]
p15 first red9  -> p40 red8     [24,6] -> [18,21]
p40 red8        -> p27 red19    [18,21] -> [18,19]
```

Thus the **only nonzero red-span path** is

```text
p15 first red9  --T-->  p40 opening red8  --T-->  p27 opening red19.
```

The destination types predate this test: p40 is the unique chapter-opening red rubric of length `A=8`, p27 the unique one of length `B=19`, and p27/p40 were already paired by the earlier red-remainder census. The new operation orders that old pair rather than discovering the pages from their target states.

The two-step identity is especially transparent:

```text
E(p27 red19) = A * E(p15 first red9)
             = 8 * [24,6]
             = [18,19].
```

The signed-source indices immediately preceding DIRECTION are also fixed:

```text
25 THEIR
26 NUMBERS
27 ARE
28 THE
29 DIRECTION
30 SEEK
31 AND
```

Starting from p7's complete red state `[1,6]`, the T path gives

```text
T^25(p7) = p15 first red9
T^26(p7) = p40 opening red8
T^27(p7) = p27 opening red19
T^28(p7) = [28,23] = THE / ROAD
```

This alignment was charged against the **entire nonzero field**, not merely the 18 manuscript red states. Among all 840 possible nonzero starting states, **exactly one** has complete-red-span states simultaneously at offsets25,26,27: `[1,6]`, the actual p7 red state. Its offset28 state is necessarily `[28,23]`.

Within the signed-source index range0..42, there are only two ways for a complete-red starting state to hit red states on three consecutive offsets: the trivial already-known p15-first run at offsets0,1,2, and this p7 run at offsets25,26,27. The p7 alignment is therefore not obtained by scanning arbitrary phases until three red states appear.

This is still a post-discovery finite charge, not a p-value for authorial intent. Its value is operational: the signed phrase **THEIR NUMBERS ARE THE DIRECTION** now names both the numbered offsets and the canonical field direction operation, while p7 uniquely supplies the start whose numbered path lands on the previously typed red receivers.

Applying T once more leaves the red-span set and gives

```text
T(E(p27)) = [28,23].
```

Under the same authenticated zero-based 2016 numbering, those coordinates read **THE / ROAD**. That is a candidate continuation value, not yet a typed manuscript receiver: do not choose physical p28, p23, a signed-source interval, or a body coordinate after seeing this value. The next valid test must fix which address space consumes `[28,23]` from independent source evidence.

## Immediate consumer check

The most literal fixed 2-rune Hill interpretation of `M_Q` was checked on the source-typed p54 continuation after its red9 opener, including Q/Q^-1, the two local coordinate orders, both stream directions, and the visible offset9/10 boundary alternatives. All presentations are nonprose. This closes only the **stationary one-step Hill** reading.

The changing-state variant now has a **finite, all-initial-state original-input rejection** for the *direct* two-rune stream laws (Agent47, 28 November). Fix the already-derived field `u²=3u+8` and primitive `Q=[17,24]`; advance a nonzero two-coordinate state by Q or Q⁻¹ after each ciphertext pair. Across **every one of 840 possible initial field states**, both directions and four invertible readouts (`C−S`, `C+S`, `C×S`, `C/S`), the original receiver stays nonprose. Two visible framings were covered: complete p54+p55 (308 runes), and p54 after its red9 rubric joined to p55 with its unmatched final rune removed (298 runes). Each framing has exactly **6,720** candidates, **13,440** in all, with no language-based seed preselection.

A smoothed GP29 bigram model trained on the first 20,000 Gibran runes scored the *best* original inverse at **−4.3131401** (whole) and **−4.3051917** (body framing) log probability per rune. A disjoint authenticated signed-2016 English message scored **−2.7893**, and seven disjoint 298–308-rune Gibran passages scored approximately **−2.51 to −2.64**. A native control used an independent 308-rune Gibran passage encoded under each of **eight** planted combinations of two seeds, two Q directions and additive/multiplicative laws; every exact plaintext was recovered at **rank 1** from the 6,720 decoders, including its correct key class. This is an effective original-input negative rather than failure of the inversion implementation. It does **not** cover field emission laws with feedback, nonlinear state dependence, local resets, variable framing, alternative plaintext registers/languages or a non-Q step; these remain gated on a source-selected operation rather than another free-parameter sweep.

The next causal step is therefore not additional constant/additive/multiplicative Q-seed tuning. Require a first-party instruction fixing a *different* emission law and receiver, or derive a real prefix from the canonical semilinear red-span navigation chain above. The fixed second-order recurrence `v[n+2]=Bv[n+1]-Av[n]` remains an exact algebraic property, not by itself a body-cipher construction.

Reproducers: [`sims/lp2_p3_q_frobenius_dh_sft.cjs`](../sims/lp2_p3_q_frobenius_dh_sft.cjs) (field identities), [`sims/agent47_p3q_allstate_stream_sft.cjs`](../sims/agent47_p3q_allstate_stream_sft.cjs) (all-state original/positive-control gate).
