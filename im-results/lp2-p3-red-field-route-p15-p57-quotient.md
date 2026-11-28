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

## Canonical GP readout selects the signed-2013 `DH` opcode (Agent14, 28 November 2026)

The exact p15 product `[23,8]` above has a second, source-fixed representation that does **not** depend on the disputed p15 descriptor→DH role map: under the canonical GP transliteration, index23 is `D` and index8 is `H`. The complete two-coordinate output therefore reads literally:

```text
E(Q)E(p15 first red) = [23,8] = D H
```

This matters because p15 independently selects the authenticated January-2013 TCP specification through a different original object. Its solved Fibonacci/prime number grid reconstructs anchor3301, and the signed specification contains the exact worked request `BASE29 3301 -> 3QO`. The same signed document's fixed request vocabulary is `RAND, QUINE, BASE29, CODE, KOAN, DH, NEXT, GOODBYE`, and its DH example is:

```text
C: DH 23
S: 01 OK 5 8
C: 19
S: 03 DATA 2
```

So the field output now makes a **descriptor-independent historical opcode contact**: its canonical rune readout is the request name `DH`, while the same numeric pair `[23,8]` simultaneously equals the worked example's modulus and server public value `(p,A)`. The source's DH arithmetic then uniquely gives private exponents `a=6`, `b=15` in `1..22` and shared key2; those derived values are consequences of the authenticated example, not extra fitted targets.

Charge the source-fixed request vocabulary against every original complete red span under the already-frozen Q multiplication. Among all **18 printed spans**, the only output that is exactly any complete signed-2013 request name is **p15 first-red -> `DH`**. Across both orientations and every cyclic start (**450 presentations**), the only request-name hits are p15 first-red in its printed orientation/rotation0 and p15 second-red only after reversal plus rotation5; no other page or command appears. The printed manuscript orientation therefore selects the complementary p15 red9 without phase tuning. The two complete quadratic relations that factor the p15-second/p57 difference remain the source p3 relation and the alternate `u²=18u+12`; only the physical p3 relation produces `DH`, while the alternate produces `FNG`.

This is a stronger human-solve-path clue than merely relabeling `[23,8]` as `[p,A]`: p15's independent 3301 construction names the signed source, and the canonical GP alphabet names a procedure inside that source. It does **not** prove that the author intended the polynomial quotient or recover unknown body plaintext. The `DH` reading was recognized after `[23,8]` had already been published, so it is a post-discovery exact cross-lock rather than a calibrated discovery probability.

Reproducer: [`sims/lp2_p3_q_tcp_dh_opcode_sft.cjs`](../sims/lp2_p3_q_tcp_dh_opcode_sft.cjs).

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

## Signed-2016 multiplication-matrix lock and a typed p54 holdout (Agent6, 28 November 2026)

The quotient now has an instruction-shaped cross-source consequence that does not require naming arbitrary field residues after the fact. The authenticated 2016 message has an independently reconstructed **zero-based word-number system**: in particular word2=PATH, word8=DEVOTED, word17=THE, word18=MAP, word20=MEANING, word23=ROAD and word24=AND. The same signed sentence explicitly says that its words are the map and their numbers are the direction. This numbering convention was established independently of the present polynomial route.

Write the frozen p3 field as `u²=r u+t` with `(r,t)=(3,8)`, and the frozen quotient evaluation as

```text
E(Q) = x + y u = 17 + 24u.
```

Multiplication by Q is therefore the fixed linear map on field coordinates

```text
[a']   [ x      t*y   ] [a]   [17 18] [a]
[b'] = [ y   x+r*y   ] [b] = [24  2] [b]   mod29.
```

Read in the ordinary row-major matrix order, the four entries are zero-based word positions in the authenticated 2016 source:

```text
17 18   -> THE MAP
24  2   -> AND PATH
```

so the multiplication matrix literally reads **THE MAP / AND PATH**. No row/column permutation, sign, phase, scalar or word-number origin is fitted. The independently established zero-based convention is essential: the one-based reading is `ARE THE / ROAD THE`, not the same instruction. Among all **841** possible field multipliers in this fixed p3 field, exactly one matrix has the exact row-major word readout `THE MAP AND PATH`: `E(Q)=[17,24]`.

The p15-second/p57 polynomial difference has only the two previously charged monic quadratic factor relations. Their quotient-multiplication matrices give:

| Quadratic relation | quotient E | multiplication matrix | authenticated 2016 word readout |
| --- | --- | --- | --- |
| **source p3** `u²=3u+8` | **`[17,24]`** | **`[[17,18],[24,2]]`** | **THE MAP / AND PATH** |
| alternate `u²=18u+12` | `[5,19]` | `[[5,25],[19,28]]` | EPIPHANY THEIR / THEIR THE |

This gives the source-printed p3 relation a discriminator independent of the p15 `[p,A]` product and solved-p56 prime-prefix check. The English readout was discovered after Q, so the 1/841 census is a finite exact identity, **not** a calibrated discovery p-value.

There is also a genuinely unknown-page typed holdout. The canonical manuscript has exactly **two complete red spans of length9**: p15 first-red, already used as Q's complementary p15 receiver, and the opening red rubric of physical p54. Without changing the operation,

```text
E(p15 first red) = [24,6]
E(Q)E(p15 first) = [23,8] -> signed words ROAD / DEVOTED

E(p54 red9)      = [13,28]
E(Q)E(p54 red9)  = [0,20]  -> signed words HELLO / MEANING

E(p56 red5)      = [3,23]
E(Q)E(p56 red5)  = [1,2]   -> signed words THE / PATH
```

The p54 result was not used to choose its receiver: p54 is the only held-out member of the complete-red-nine class. Its second coordinate20 also predates this calculation as the independently committed p25 MEANING/qg operand (commit `233c6ceb...`, 11:17 UTC), while Q itself was first committed at 12:04 UTC. Across both orientations and every cyclic start of all 18 complete red spans (**450 presentations**), only **printed p54 at rotation0** maps to `[0,20]`.

The signed-word labels on arbitrary mod29 pairs should not be overcounted: every field coordinate is automatically between0 and28. The strong evidence is narrower and joint: Q was source-derived first; its **entire multiplication matrix** spells an instruction-shaped source phrase under an independently fixed word-number convention; the same unmodified map hits the authentic p56 key prefix and the uniquely typed unknown p54 red9 receiver.

Reproducer: [`sims/lp2_p3_q_signed2016_map_path_sft.cjs`](../sims/lp2_p3_q_signed2016_map_path_sft.cjs).

## The DH pair self-closes under the already-used H grammar

The canonical `DH` readout also admits a target-free state check using the same two-value H operation already established elsewhere in the manuscript:

```text
H([p,A]) = [p-A, p+A] mod29
          = [23-8, 23+8] mod29
          = [15,2]
          = [b,K].
```

Do not count this as an independent cross-holdout: once `[23,8]` is fixed, H is invertible and the numbers15/2 are deterministic. The useful question is whether the resulting pair obeys the ordinary DH equations without importing the labels.

Define for any candidate output `[x,y]`:

```text
p = x
A = y
b = x-y mod29
K = x+y mod29
```

and require source-ordinary DH validity: `p` prime, `0<A,K<p`, `0<b<p-1`, and `A^b mod p = K`. Across the complete **29²=841** ordered-pair space only two pairs survive:

```text
[17,13] -> (p,A,b,K)=(17,13,4,1)
[23, 8] -> (p,A,b,K)=(23, 8,15,2).
```

The independently published p29 DIRECTION packet supplies one further state requirement before this charge: `e=b^-1 mod(p-1)` must exist. The `[17,13]` rival has `gcd(4,16)=4` and no inverse. The complete pair-space predicate therefore leaves exactly:

```text
[p,A,b,K,e] = [23,8,15,2,3].
```

Under the frozen Q map, p15 first-red is the only one of the **18 printed complete red spans** satisfying this self-closure. Across all **450** cyclic/reverse red-span presentations the only hits are the same two p15 presentations already identified by the exact `DH` token: first-red printed orientation/rotation0, and second-red only after reversal/rotation5.

This is a finite post-discovery structural characterization, not a discovery probability. Its value is operational: the pair that spells the signed opcode `DH` also closes internally into `b,K,e` using a manuscript-established H transform plus the independently existing p29 inverse requirement. It strengthens the interpretation of `[23,8]` as a state packet without adding a new independent statistical factor.

Reproducer: [`sims/lp2_p3_q_tcp_dh_opcode_sft.cjs`](../sims/lp2_p3_q_tcp_dh_opcode_sft.cjs).

## Signed-2016 numbers-as-direction receiver lock (Agent14, 28 November 2026)

The frozen p15 result `[23,8]` now has a source-licensed navigation interpretation in addition to its `DH` readout. Independently, the established p29 DIRECTION packet already identifies **`ROAD=23=p`** and **`DEVOTED=8=A`**, with ROAD23 driving its physical p23 handoff. The authenticated 2016 clue explicitly says that the words are the map, their meaning is the road, and **their numbers are the direction**. The complete Q pair is therefore exactly `[ROAD23,DEVOTED8]=[p,A]`; reading its already-fixed coordinates as zero-based physical LP2 page numbers repeats the known ROAD23→p23 handoff and adds the parallel **DEVOTED8→p8** receiver.

Both targets independently predate this interpretation as unusually strong DH-state pages. P23 is one of exactly two four-word complete red spans; its fixed word-product→adjacent-H row is `[11,8,5,2]=[A^-1,A,g,K]`. P8 is the manuscript-unique red `[4,8]` H→DH closure reconstructing the complete DH23 state, and its immediately adjacent black word has descriptor `[3,23,2]=[e,p,K]`. The useful evidence is this receiver specificity, not merely that both pages contain red ink: across all 840 nonzero scalar multipliers in the fixed p3 field, **276** equal or exceed Q's generic count of red-page coordinate hits.

A prospective direct continuation was frozen before reading the target outputs: apply the unchanged Q map once to the already-independent immediate black successor word on p23 and p8, and require an exact DH-chain pair, `[p,A]`, or complete signed-2013 request token. It fails cleanly: p23 gives `[3,1]` / `OU`; p8 gives `[7,6]` / `WG`. Do not tune phase, sign, orientation, alternate words or modulus to rescue this body-adjacent consumer.

This strengthens Q as a **state/navigation opcode**: the signed instruction supplies a literal receiver interpretation for `[23,8]`, and both directed pages carry independently selective DH packets. It still does not recover black-body plaintext or prove that every Q output is a page address.

[Direction cross-lock and preregistered negative](lp2-p3-q-direction-p23-p8-crosslock.md) · [reproducer](../sims/lp2_p3_q_direction_p23_p8_sft.cjs).



## Solved-p56 Q state now hands off to unknown p40 in ROAD=23 base59 hops

A separate p50 navigation charge now supplies the first direct Q-state transition from a solved red object to an unknown one. The frozen Q orbit gives solved p56 `[4,5]`, exponent **121**, and unknown p40 `[5,8]`, exponent **153**. Treat those already serialized exponents as p50 addresses under the independently source-selected local base59 pointer semantics. Exactly **23** hops from121 land on153:

```text
Q(p56)=121 --23 hops--> 153=Q(p40)
```

The hop count is independently authenticated twice: `p=23` in the signed 2013 DH example and zero-based `ROAD=23` in the signed 2016 warning. Charging all six nonzero Q-derived red-span exponents that fall inside the 256-cell table under both live radices leaves exactly one 23-hop transition between Q states: **p56→p40 under base59**. Base60 has zero such transitions.

Continuing the same p56 route reaches the unique base59 root189 in exactly **30** edges, matching zero-based `SEEK=30`; p56 is the only one of the six Q-valid p50 starts with depth30. The p56 coordinate also self-indexes its source boundary: `[4,5]=[EMPTY,EPIPHANY]`, and across all 42 adjacent signed-source pairs the identity `29*i+(i+1)=GP0(word[i+1])` has exactly one hit, `29*4+5=121=GP0(EPIPHANY)`.

This is a post-observation finite cross-lock rather than a sealed prediction, but it materially changes the Q route: solved **AN END** now navigates through the original p50 table to the specific unknown p40 Q state without reading p40 plaintext. Direct periodic use of `[5,8]` on p40 body remains negative and should not be revived. [Full handoff](lp2-p56-q-road23-seek30-p40-handoff.md) · [reproducer](../sims/lp2_p56_q_road23_seek30_p40_handoff_sft.cjs).

## DIRECTION-selected p33 WILL receiver (Agent45, 28 November 2026)

The semilinear DIRECTION path now reaches a previously published local plaintext candidate through an independent receiver route. ROAD23 already selects physical p23; the fixed T map gives `T^32(p23 red)=p33 second red`, exactly matching signed YOU32. That target is the second p33 red span at start91/length8, ending at rune99. The immediately following source word is WILL33, and the unchanged numbers-as-direction convention gives `99+33=132`, exactly the published four-rune WILL receiver.

The route also supplies the published p33 H-shell numerically: Q on p15-first is `[23,8]=[p,A]`; DIRECTION29/Frobenius gives `[K,g]=[2,5]`, with PATH fixing K=2; and the forward p7→p27 spoke is signed offset27=`-K` modulo29. Therefore the compact shell is `[p,A,K,-K]=[23,8,2,27]`. Canonical H^-1 gives key `[25,5,26,2]`, and the fixed receiver decrypts exactly to `[7,10,20,20]=WILL`.

Charge the immediate eight-way ambiguity family at the fixed receiver (either Q^29 coordinate, forward27/reverse29 spoke, H/H^-1). Only coordinate2 + forward27 + H^-1 yields any authenticated four-rune signed word. Holding its exact key across every contiguous four-rune window p0–p55 yields exactly one authenticated four-rune hit: p33 offset132→WILL33.

This is a **material independent selector for the existing WILL candidate**, not a chronology-free blind decryption: the ordered `[p,A,K,-K]` shell was recognized in earlier WILL work. The new contribution fixes the receiver from the Q/DIRECTION red-object path and explains every shell value from that route. Promotion beyond strong local candidate status still requires a first-party shell-serialization rule fixed before target knowledge or an unchanged prospective transfer.

[Full route and charges](lp2-p3-q-frobenius-dh-lock.md) · [reproducer](../sims/lp2_p3_q_frobenius_dh_sft.cjs).

## Scientific boundary and next causal step

The reproducible result is now an **exact original polynomial bridge with a source-word opcode lock, a solved-cipher cross-holdout, and one source-typed unknown-page state output**. P15-second/p57 derives Q; Q's linear multiplication matrix is `[[17,18],[24,2]]`, which under the independently established authenticated-2016 numbering reads **THE MAP / AND PATH**; the complementary p15 red9 maps to `[23,8]=[p,A]`; solved p56 maps to the unique opening pair `[1,2]` of its real prime-minus-one stream; and the only other complete red9 span, unknown p54, maps without fitting to `[0,20]` = signed-source word pointers HELLO/MEANING.

This materially changes the route's status: Q is no longer merely a numerically interesting operand. It is a **candidate authored linear map/navigation opcode** whose own matrix names MAP/PATH in the later authenticated clue and whose frozen action has independent solved and unknown source-typed consequences. The result still does **not** decrypt p54 body text or any other p0-p55 body, and the original LP pages never explicitly say “form this polynomial quotient.” Discovery chronology also matters: the signed-source matrix phrase was recognized after Q, and individual mod29 coordinates always admit word-position labels in the first29 signed words.

The map now has one independently selected unknown receiver consequence: the DIRECTION path reaches p33 second-red and its WILL33 direction fixes offset132 before opening that receiver, where the route-derived H-shell reproduces the existing WILL candidate. Because the shell ordering was recognized in earlier WILL work, the next decisive step is stricter: derive that serialization from first-party structure without target knowledge, or transfer the unchanged receiver/key construction prospectively to a genuinely new source-assigned block. A successful fresh body-cipher consequence would promote the map toward an LP2 decoder; another post-hoc state name would not.

Read-only reproducer: [`sims/lp2_p3_field_redmap_p15_p57_quotient_sft.cjs`](../sims/lp2_p3_field_redmap_p15_p57_quotient_sft.cjs). It reads only original canonical corpus and ink annotations, derives every numeral, checks original field constraints, exhausts both full modulus/orientation families, and proves exact quotient/recomposition. No external packages or language scoring.
