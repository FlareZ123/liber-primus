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
3. The previously source-fixed `M5N7` remainder count `[22,5,23,7]` sums to57 and independently points to solved physical p57. P15 is independently tied to the 2013 DH/BASE29 source by its marked red grid. Its p15 title has two visibly discrete consecutive red spans, of lengths9 and11. The finite eligible family **includes both**, instead of selecting whichever red word has the desired residue. Physical solved p57 has exactly one opening red span, length7. See [the BASE29 self-index route](lp2-p15-base29-integer-h4-pagecount-cycle.md).

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

## Scientific boundary and next causal step

The reproducible result is the **exact original GP29 polynomial-factor bridge** between two source-typed marked rubrics, and a derived, complete nine-rune vector. It supplies a concrete candidate operation and material that can be tested on another independently selected receiver without guessing key coordinates, a better starting point than relabeling arbitrary fitted key vectors with DH-field numbers. However, no untouched original ciphertext was decoded and no first-party instruction yet mandates the polynomial reduction, chooses the p15 second span over its first in advance, or specifies a plaintext consumer for Q. The already-published DH and p15/p57 navigation premises were themselves partly recognized retrospectively.

A genuinely upgrading successor must **freeze a target-blind receiver and a complete use for the nine-rune quotient before opening that receiver's rune identities**. The lowest-description source-typed follow-up is the other p15 red nine-rune span, but its mere length agreement is inadequate; test only an independently justified operation, and do not tune signs/phases to English. If such a receiver or opcode cannot be sourced, retain the p3/p15/p57 identity as structural work in `im-results/`, not as a solved-page claim.

Read-only reproducer: [`sims/lp2_p3_field_redmap_p15_p57_quotient_sft.cjs`](../sims/lp2_p3_field_redmap_p15_p57_quotient_sft.cjs). It reads only original canonical corpus and ink annotations, derives every numeral, checks original field constraints, exhausts both full modulus/orientation families, and proves exact quotient/recomposition. No external packages or language scoring.
