# An exact p3-polynomial red-span bridge: p15 second rubric minus solved p57 yields a nine-rune quotient

**Agent38, 28 November 2026. Classification: original-artifact algebraic bridge and a fully reproducible source-derived *candidate operand*, not a discovered cipher key, an intended author instruction, or unknown LP2 plaintext.** This is a separate mechanism from the p3-field Vieta chapter-SUM/PRODUCT hypothesis: here the inputs are **complete printed red-rune spans**, with no intermediate arithmetic over word descriptors or post-target fit.

## Human-visible source and independently motivated recipient classes

The physical p3 page has a small, doubly red-13-bracketed red triad at rune offsets119–121, exactly `[13,23,2]` in the canonical GP29 alphabet. Interpret the **complete printed GP29 sequence as low-to-high polynomial coefficients**:

```text
f(u) = 13 + 23u + 2u²
f(u)=0 => u²=3u+8 over GF(29).
```

This is a monic field equation after dividing by its leading2, the previously identified original p3 quadratic. Each whole original red span is a polynomial `R(u)=Σ c_i u^i`; reduction modulo `f` produces a two-coordinate residue `[constant,u]` without fitting any plaintext.

There are three independent, pre-existing ways to name the tested red-span recipients **without using their field residues**:

1. The earlier p15 spiral BASE29 page-count cycle gives **F(6)=8, F(7)=7, F(8)=6**. Original p6, p7 and p8 each visibly have exactly one red span; p6↔p8 is a proposed paired receiver and p7 is a fixed point. This page map predates the present polynomial comparison. See [the cycle's visual-object gate](lp2-p15-base29-cycle-red-object-gate.md).
2. The authenticated Cicada DH state includes `A=8`, `B=19`. Among the nine **chapter-opening red rubrics**, physical p40 is uniquely the one whose red opening has length8, and p27 uniquely has red opening length19. The page-pair selection depends on the printed **lengths** and pre-established DH numbers, not their rune content.
3. The previously source-fixed `M5N7` remainder count `[22,5,23,7]` sums to57 and independently points to solved physical p57. P15 is independently tied to the 2013 DH/BASE29 source by its marked red grid. Physical solved p57 has exactly one opening red span, length7. The critical **p15 second-red object is already independently selected by its original punctuation and length**: the earlier manuscript-wide [p6 red13 control](lp2-p6-red13-bracket-internal-control-gate.md), performed before this polynomial experiment, found that exactly **two** of all 18 red spans have **11 runes bracketed at both endpoints by large red 13-dot punctuation**: p6 start71–82 and **p15 second start9–20**. P15's first red span is separately bracketed but length9. Thus the p15 second object is the *unique p15 member of the p6-like eleven-rune double-13 class*, rather than the red span selected because it happens to match p57. See also [the BASE29 self-index route](lp2-p15-base29-integer-h4-pagecount-cycle.md).

These selectors make the comparisons worth checking. **They do not provide an explicit Cicada instruction to perform polynomial reduction**; every equality below remains conditional on that new operation, and multiple selectors share the same retrospective DH model.

## Exact original-polynomial remainder tape

For the original p3 modulus, the following computed residues are exact:

| Complete red span | Length | Constant | u-coefficient |
| --- | ---: | ---: | ---: |
| p3 red triad, start119 | 3 | 0 | 0 |
| p6 red title, start71 | 11 | **10** | 18 |
| p7 red title, start194 | 14 | 1 | **6** |
| p8 red title, start0 | 12 | **10** | 4 |
| p15 first red span, start0 | 9 | 24 | 6 |
| p15 second red span, start9 | 11 | **14** | **25** |
| p27 first red span, start0 | 19 | **18** | 19 |
| p40 first red span, start0 | 8 | **18** | 21 |
| p57 solved red opener, start0 | 7 | **14** | **25** |

Thus the source-selected p6↔p8 red remainders share **exactly the constant10**, and their coefficient difference is **15** mod29; the p27/p40 DH-title-length pair shares constant18 and has coefficient difference2. The p7 fixed point has residue `[1,6]`, with its second component equal to the independently reconstructed secret exponent `a=6`. **Most decisively, the p15 second red span and solved p57 red opener have identical *two-coordinate* residues `[14,25]`.** The p15 first red span does not.

This identity is equivalent to a complete polynomial factorization, not a cherry-picked single coordinate or plaintext fitting. The literal original rune coefficients are:

```text
p15 second red (start9,len11)
  [20,1,21,9,5,1,17,9,16,0,21]

solved p57 red opener (start0,len7)
  [13,24,4,24,17,20,18]
  padded by four trailing zeros to length11

p15 second − p57 (mod29)
  [7,6,17,14,17,10,28,9,16,0,21]
```

Dividing that complete difference by physical p3's red trinomial `[13,23,2]`, with the visible ascending coefficient order, gives **zero remainder** and the uniquely determined nine-rune quotient:

```text
Q = [5,5,14,9,10,4,27,17,25]
  = CCXNIRIABAE  (canonical multi-letter GP transliteration)
```

The exact original-source identity is

```text
R_p15_second(u) − R_p57_red(u)
= (13+23u+2u²) · Q(u)   in GF(29)[u].
```

The reproducer independently multiplies the original p3 triad by the quotient and asserts equality to **all eleven difference coefficients**, not merely to the first two. The nine-rune quotient is an exact, compact, source-derived *potential operand*. It is not recognizable plaintext, does not identify a receiver, and is not authenticated as a Cicada key. Its length9 equals the separate p15 first red span's length9, but that equality alone does **not** authorize using one as the other's cipher key.

## Complete red-span graph and a second GF(29²) operation

The exhaustive census of the weaker **constant-coordinate equality** on all 18 original red spans has exactly **four** pairs among 153 unordered pairs:

```text
p3 first red       ↔ p3 marked triad       same page, zero constant
p6 sole red        ↔ p8 sole red           [10,18] → [10,4]
p15 second red     ↔ p57 solved first red  [14,25] → [14,25]
p27 opening red    ↔ p40 opening red       [18,19] → [18,21]
```

Thus the **only three cross-page collisions** are precisely the three independently motivated pairs, without selecting them from a larger shared-constant red graph. Their oriented differences in the second coordinate are `[15,0,2]` under the order p6→p8, p15→p57, p27→p40, which matches the already reconstructed DH `[b,F,K]`. This is a finite *post-discovery structural census*, not an independently calibrated chance event, and the labels share a previously known DH model.

The nine-rune quotient `Q` was committed with its complete coordinates before a separate follow-on observation: **the other p15 red span has exactly nine runes**, making it a naturally typed partner for `Q`. Evaluate each of these whole, already pinned nine-rune objects in the very same p3 field:

```text
E(Q)                    = [17,24]
E(p15 first red, len9)  = [24,6]

E(Q) * E(p15 first red)
                       = [23,8]
                       = [p,A]  (authenticated Cicada 2013 DH fields).
```

The multiplication is the ordinary field law `(a+bu)(c+du)=(ac+8bd)+(ad+bc+3bd)u`. No coordinate ordering, phase, exponent or scalar was tuned to the `[p,A]` observation. It is an exact second original-field operation on the quotient and *the complementary marked p15 red span*, rather than arbitrary state naming of individual residues.

To charge the most immediate algebraic rival, keep all original operands fixed and enumerate all **841** possible monic quadratic relations. Full p15-second/p57 residue equality holds for only two: the original p3 relation `u²=3u+8`, and an alternate `u²=18u+12`. For each, divide the difference by the uniquely scaled degree-two factor with leading coefficient2 and multiply the resulting quotient evaluation by the unchanged p15 first-red evaluation:

| Quadratic relation | Quotient × first-red, GF29² coordinates | Equals authenticated `[p,A]`? |
| --- | --- | --- |
| **p3 original** `u²=3u+8` | **`[23,8]`** | **Yes** |
| Alternate `u²=18u+12` | `[0,21]` | No |

The p3 physical field polynomial is source-selected independently. The alternate quadratic is only a finite comparator; it need not be irreducible. `[p,A]` is not an unknown 2016 plaintext target, and this matching operator/result was noticed *after* the 9-rune quotient was frozen. Therefore treat the DH product as a **new internally consistent state serialization**, not as a prospective blind key-discovery claim. There remains no author-licensed use of `Q` as a cipher key on an untouched body interval.

## Charged finite controls; no coincidence p-value

Charge **all 29²=841** residue-ring presentations `u²=r u+t` against the three already typed original pairs. Predicate A: p6/p8 **constant coordinates** agree. B: p27/p40 **constant coordinates** agree. C: the complete p15 second/p57 residues agree.

| Printed GP coefficient convention | A | B | C | A∧B | A∧C | B∧C | A∧B∧C |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Ascending powers (printed) | 31 | 35 | 2 | 2 | 1 | 1 | **1**, only `r=3,t=8` |
| Reverse printed coefficients | 24 | 27 | 3 | 0 | 1 | 0 | **0** |

This finite family includes reducible quadratics, so it is conservative about the source's field character. Under the printed orientation, the only other modulus satisfying A and B is `u²=27u+18`; it fails the p15/p57 exact coincidence. The unique three-way survivor is **precisely the p3-marked field relation**. The p3 triad itself vanishes only when read in its printed low-to-high orientation, an additional independent source convention check.

Within the **18** original complete red spans from the canonical ink annotation, there is exactly **one pair** whose *full* two-coordinate p3 remainder agrees: **p15 second ↔ p57 opening**. This exhaustive span-pair census is a useful integrity control, not a selection-adjusted probability of authorial intent.

As a separate orientation charge, cyclically rotate **each** complete red span through every possible starting rune without modifying its rune multiset:

| Selected pair | Fixed comparison | Passing phase pairs | Printed zero/zero phase? |
| --- | --- | ---: | --- |
| p6/p8 | equal constant | 6 / 132 | Yes |
| p27/p40 | equal constant | 6 / 152 | Yes |
| p15 second/p57 | equal complete residue | **1 / 77** | **Only** printed zero/zero |
| p7 alone | exact residue `[1,6]` | 1 / 14 | Only printed phase |

These gates prevent retrospective cyclic reindexing from being presented as an authored alternate key. They still do not compensate statistically for the many possible operations and recipient-pair choices one could have tried.

## Held-out solved-p56 prime-clock cross-lock (Agent6, 28 November 2026)

The quotient above was already frozen and broadcast before this check. Apply the **same complete field multiplication**, with no phase, sign, scalar or receiver fitting, to the original solved-p56 red opener. Its ciphertext is

```text
[25,11,22,15,4]
```

and the authentic p56 prime-minus-one clock starts

```text
[1,2,4,6,10]
```

so direct subtraction gives `[24,9,18,9,23] = AN END`. In the p3 field the whole red ciphertext has `E=[3,23]`; with the already frozen `E(Q)=[17,24]`,

```text
E(Q) * E(p56 red ciphertext) = [1,2].
```

Thus the complete p56 red rubric maps exactly to the **first two consuming shifts of its authenticated cipher key stream**. This is a solved-cipher cross-holdout: the p56 key and plaintext were established long before Q, while Q itself was derived before this particular p56 receiver was tested.

The finite controls are strict:

- The canonical ink corpus has 18 complete red spans and 225 red runes. Charging both orientations and every cyclic start gives **450** complete-span presentations. Exactly one maps under the frozen Q multiplication to `[1,2]`: **p56, printed orientation, rotation0**.
- The true p56 sender consumed 84 successive `phi(prime)=prime-1` shifts. Among its **83 adjacent key pairs**, `[1,2]` occurs only at pair0. More strongly, among all 18 printed complete red spans, **p56 is the only span whose Q-product equals any of those 83 adjacent key pairs at all**, and its match is pair0.
- The p15-second minus p57 polynomial difference has exactly two monic quadratic presentations among all 841 relations that divide it completely. The source-printed p3 relation `u²=3u+8` gives the frozen Q and maps p56 to `[1,2]`; the sole alternate relation `u²=18u+12` maps p56 to `[24,26]` and already fails the independent p15 `[p,A]` product.
- The established p56 clock control says the red 13-dot mark after AN END does not reset or advance the key; the following black rune consumes the next prime shift. Therefore `[1,2]` is genuinely the stream prefix, not an artifact of treating rubrication as a reset.

This does **not** show that Q is itself a p56 key, nor does it decrypt an unknown page. It supplies the first authenticated solved-cipher consequence of the p3/p15/p57 quotient construction: under one frozen field operation, Q maps a source-typed red ciphertext object to the beginning of that object's real key stream. Because the receiver was inspected after Q was discovered, this remains a post-discovery structural cross-holdout rather than a calibrated probability of authorship.

Reproducer: [`sims/lp2_p3_quotient_p56_prime_prefix_sft.cjs`](../sims/lp2_p3_quotient_p56_prime_prefix_sft.cjs).

## Scientific boundary and next causal step

The reproducible result is now an **exact original GP29 polynomial-factor bridge plus an authenticated solved-cipher cross-holdout**. The p15-second/p57 factorization derives a complete nine-rune Q; the complementary p15 red span maps through the same p3 field to authenticated DH `[p,A]`; and the independently solved p56 red ciphertext maps to `[1,2]`, the unique opening adjacent pair of its real prime-minus-one key stream. This materially upgrades Q from an unauthenticated potential operand to a source-constrained **serializer candidate** with a genuine cipher-linked consequence.

The boundary remains important. No untouched p0–p55 ciphertext was decoded, Q is not thereby established as a key, and no first-party instruction yet says to perform the polynomial reduction or identifies an unknown recipient. The p15 second-span receiver selection is independently supported by its p6-like 11-rune/double-red13 source type, while the p56 receiver is a solved control inspected after Q was discovered. The DH and p15/p57 navigation premises were also partly recognized retrospectively.

The next causal step is therefore narrower than before: **freeze an unknown recipient and the expected role of its two-coordinate Q product from independent source evidence before opening or grading that recipient**. A successful prediction of a key prefix, opcode, or reversible state transition on untouched ciphertext would elevate the mechanism toward a real LP2 decoder; another post-hoc state label would not.

Read-only reproducer: [`sims/lp2_p3_field_redmap_p15_p57_quotient_sft.cjs`](../sims/lp2_p3_field_redmap_p15_p57_quotient_sft.cjs). It reads only original canonical corpus and ink annotations, derives every numeral, checks original field constraints, exhausts both full modulus/orientation families, and proves exact quotient/recomposition. No external packages or language scoring.
