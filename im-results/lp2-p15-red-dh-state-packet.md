# P15 red spans encode a source-only DH23 state packet and cross-segment with p6

**Agent 2 / Critic correction, 28 November 2026. Classification: reproducible source arithmetic and conditional state-compatibility evidence plus prospectively frozen consumer negatives. No independently selected DH-role map, unknown LP2 plaintext, authenticated unknown-page key, complete inverse, or continuation endpoint is recovered.**

## Critic methodological correction — descriptor roles were post-selected

The numerical descriptor rows, grid transforms, spiral tape, matrix inverse/determinant relations, p7/chapter relations and frozen consumer negatives in this report are reproducible. The evidential classification of the *state recovery* was too strong.

The lower-red route assigns semantic roles with rules such as `K=w2.L`, `a=w2.S`, `g=w2.P`, `q=w1.L`, `F=w3.P`, and `p=w1.S+1`. This report also states that the DH labels were recognized after the DH23 state was known. No independent source rule or pre-state enumeration selected that descriptor→role mapping. Therefore evaluating the known DH equations from those chosen coordinates is a **conditional reconstruction under a post-selected map**, not an independent derivation of the DH state from p15.

That distinction propagates through every later target built from those role names. The grid-presentation, spiral-transform, spiral-matrix, p7-orientation and chapter-record permutation charges keep fixed targets whose semantic construction already assumes the uncharged role map. The determinant value 19 is a source fact; interpreting it as `B` and using DH closure is also conditional on the same known state vocabulary. These counts remain useful specificity diagnostics *given the map*, but they do not charge the missing descriptor/statistic/representation/role-selection freedom and cannot establish that a solver could recover that map from p15.

The upper-red, page-index, p7, scan-symbol, matrix/H4 and chapter-H5 matches remain exact conditional consequences. They become independent validation of a state route only after the descriptor roles are fixed without consulting the DH tuple. Promotion therefore requires either a source-visible/historically motivated role rule followed by a fresh withheld prediction, or a complete bounded charge over the plausible role/statistic/representation family available at discovery time. Consumer failures below remain valid for the exact frozen conditional tape they test.

## Decision

Physical p15 contains two red rune spans separated in the page design by the proved 4×4 Fibonacci/prime number grid and the infinity mark. In canonical rune order they are adjacent spans at offsets 0..8 and 9..19. Both are bounded by red 13-dot punctuation; the lower span is 11 runes long. The complete original red-span census already established that **p6 and p15 are the only two 11-rune red spans double-bounded by red 13-dot marks**.

Treat each printed red word with three elementary GP29 observables:

- **L** = printed rune length;
- **S** = GP0 sum modulo 29;
- **P** = GP0 product modulo 29.

The five p15 red words then give, in natural physical reading order,

```text
            L   S   P
top W1      4  11   0
top W2      5   8  26

lower W1    4  22  10
lower W2    2   6   5
lower W3    5   5   0
```

Against the independently reconstructed DH23 state

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2, e=3, q=4, F=0
```

the same table reads

```text
top W1      (q, A^-1, F)
top W2      (g, A,    B^-1)

lower W1    (q, p-1,  K*g)
lower W2    (K, a,    g)
lower W3    (g, g,    F)
```

This is **not** a plaintext claim and the labels were recognized after the state was known. The important new fact is that the underlying relations are source-only, internally redundant, and unusually constrained before any DH names are attached.

### Conditional reverse reconstruction under the post-selected role map

Once the post-selected descriptor→role map is assumed, the packet can be evaluated in the reverse direction. This computation does not remove the map-selection dependency described above.

From the lower three words alone:

```text
(q,p-1,Kg) = (4,22,10)
(K,a,g)    = (2, 6, 5)
(g,g,F)    = (5, 5, 0)
```

the repeated/equational structure fixes

```text
K=2, a=6, g=5, q=4, F=0,
K*g=10,
p=22+1=23 (prime).
```

Now the top pair gives sums `11,8` with `11*8 = 1 mod29`. The DH equation itself selects which member is `A`:

```text
g^a mod p = 5^6 mod23 = 8 = A,
11 = A^-1 mod29.
```

The second top word has product26. Its GP29 inverse is19:

```text
B = 26^-1 mod29 = 19.
```

This value is not merely name-compatible with the known tuple; it closes the shared secret:

```text
B^a mod p = 19^6 mod23 = 2 = K.
```

Finally solve the ordinary DH discrete log:

```text
g^b mod p = B
5^b mod23 = 19
b = 15.
```

The derived `b=15` then matches the **physical p15 page index**. The page number was not used to derive the exponent. Thus the five natural red-word descriptor rows recover the complete DH exchange `(p,g,a,b,A,B,K)=(23,5,6,15,8,19,2)`, plus `q=4,F=0`, with exact forward equations and a held-out page-index self-check.

This is still a post-discovery interpretation of which elementary word statistic names which field. Its force comes from the simultaneous internal equalities, reciprocal pair, DH exponentiation checks and page-index consequence—not from the density of arbitrary state expressions in GP29.


## Authenticated 2013 source supplies a second independent worked-example match

The reconstructed p15 state exactly matches Cicada's signed 2013 TCP specification's worked `DH 23 -> 5 8 -> 19 -> 2` exchange. The same document separately specifies `BASE29 3301 -> 3QO`. This second example also lands exactly on the original p15 object: the uniquely red grid cell `3299` is base29 `3QM=[e,B^-1,p-1]=[3,26,22]`, and the independently recovered `K=2` gives `3299+K=3301`; the source output `3QO` has numeric digits `[e,B^-1,-g]=[3,26,24]`. Thus p15 has two distinct exact worked-example links to one authenticated historical source, providing a concrete human solve-path pointer and source-selecting BASE29 for bounded follow-up. This recovers no unknown body plaintext. [Full source/provenance and gate](lp2-p15-signed2013-tcp-dual-example.md).

## Source-only internal packet

Forget the DH labels. Call the five descriptor triples `a,b,c,d,e`. Natural order satisfies all of:

```text
a.L = c.L
b.L = e.L
e.S = b.L
d.P = b.L
a.P = e.P = 0
a.S * b.S = 1 mod29
c.P = d.L * b.L mod29
```

The standalone census tests **every same-page consecutive five-word window** in the canonical 58-page LP2 transcription. The only hit is p15 starts

```text
[0,4,9,13,15].
```

Natural order is also the sole one of all **5! = 120** permutations of the five observed descriptors satisfying the frozen relations. Charging only the eight obvious physical orientations of the two red spans gives the same result: only top-to-bottom, left-to-right order passes.

The lower p15 three-word descriptor sequence

```text
[(4,22,10), (2,6,5), (5,5,0)]
```

is itself unique among every same-page consecutive three-word window. Its five other word-order permutations have zero exact hits.

These are post-discovery finite-family diagnostics, **not discovery-wide p-values or authorship probabilities**.

Reproducer: `sims/lp2_p15_red_dh_state_packet_sft.cjs`.

## The p6 twin exposes the same state through native sums and products

The p6 lower red11 twin has native printed lengths `[4,1,4,2]`. Its four word descriptors are

```text
            L   S   P
p6 W1       4  13  13
p6 W2       1  19  19
p6 W3       4   7  14
p6 W4       2  26  23
```

The **sums** are exactly

```text
[13,19,7,26]
= [b-K, B, g+K, B^-1],
```

while the **products** are exactly

```text
[13,19,14,23]
= [b-K, B, -b, p].
```

Again, arbitrary DH-expression naming is cheap because the state algebra is highly saturated. These equalities matter here because the *same elementary product statistic* is already independently selected by the p7 five-red-word inverse register, and p6/p15 are independently selected as the only double-13-bracketed red11 pair.

## Mutual cross-segmentation of the two red11 twins

The strongest new cross-page consequence is obtained without fitting a rune key.

### P15 word lengths segment p6

The lower p15 span has printed lengths

```text
[4,2,5] = [q,K,g].
```

Use those three lengths, in printed order, to partition the eleven p6 red runes. Take GP29 products of the resulting segments, exactly the statistic already used by the established p7 product register:

```text
p6 under p15 [4,2,5] segmentation
products = [13,27,15]
         = [b-K,-K,b].
```

Applying the repository's pre-existing outside-in

```text
H3(x,y,z) = (x-z, y, x+z) mod29
```

gives

```text
H3([13,27,15]) = [27,27,28].
```

This last H3 observation is recorded only as a compact consequence; the p15/p6 pairing does not independently authenticate H3.

### P6 word lengths segment p15

Transfer the p6 native lengths in the other direction:

```text
p6 lengths = [4,1,4,2].
```

Partition p15's lower red11 span by those lengths and again take segment products:

```text
p15 under p6 [4,1,4,2] segmentation
products = [10,5,12,0]
         = [K*g,g,a*K,F].
```

Thus the two uniquely paired red11 objects are not merely equal-length ornaments: **each one's native word-boundary pattern turns the other's raw eleven runes into a low-complexity packet in the same independently reconstructed DH23 state**.

This mutual segmentation is an independent cross-page consequence; the stronger p15-local held-out grid gate below is the main positive result of this invocation.

## Human-solve-path gate: use the already decoded red-origin spiral, then q=4 H4 blocks

The p15 grid has an independently established authored traversal: start at the source-red 3299, move right to 3298, then continue the unique square spiral through all 16 Fibonacci-prime cells. That ordering predates this state result and gives the cell residues

~~~text
22,21,19,17 | 11,1,10,3 | 20,22,25,7 | 22,12,17,21
~~~

where the bars simply mark consecutive groups of the lower-red-derived q=4.

Apply the repository-canonical H4 independently to each consecutive four-cell spiral group. The output is

~~~text
 5, 2,11,10 |  8,20,11,14 | 13,26,18,27 | 1,24,0,14.
~~~

This admits a much more causal read than labeling all sixteen coordinates after inspection. **Before reading any transformed grid output**, lower red11 already fixes p=23,g=5,a=6,A=8,A^-1=11,K=2,q=4,F=0. Those fields predict the first **seven** transformed coordinates exactly:

~~~text
[g,K,A^-1,Kg | A,qg,A^-1]
= [5,2,11,10 | 8,20,11].
~~~

The eighth coordinate is then the sole harvested scalar: 14 = -b, hence b=15. The DH equations immediately close

~~~text
B = g^b mod p = 5^15 mod23 = 19
B^a mod p = 19^6 mod23 = 2 = K,
~~~

and fix B^-1=26 and e=3. With no further harvest, the entire remaining half of the tape is predicted:

~~~text
[b-K,B^-1,p-g,-K | 1,g+B,F,-b]
= [13,26,18,27 | 1,24,0,14].
~~~

The full spiral tape therefore reads compactly as

~~~text
[g,K,A^-1,Kg | A,qg,A^-1,-b |
 b-K,B^-1,p-g,-K | 1,g+B,F,-b].
~~~

The transform choice and traversal are finitely charged rather than assumed. Take the five canonical transforms used elsewhere in the repository (identity, H4, H4^-1, adjacent-H2, H2^-1), both traversal directions, and all sixteen cyclic starts: **160** variants. Hold the seven-coordinate lower-red prediction fixed. Exactly **1/160** variants matches: H4, forward direction, red-origin start—the authored spiral presentation. The source spiral itself already fixes that start and direction, so this is a deliberately generous control rather than a claimed discovery-wide probability.

Conditional on the post-selected descriptor→role map, this is a compact human-facing presentation of the p15 state compatibility: the visible red origin supplies the spiral traversal, the lower rubric supplies q and state operands, and a small already-used outer-pair transform converts four consecutive spiral blocks into the DH register. It still does not authenticate H4 as a manuscript-wide cipher opcode or identify a body-text receiver.

Reproducer: sims/lp2_p15_spiral_qblock_h4_state_sft.cjs.

## Conditional matrix determinant/inverse bridge

Take the authored spiral residues and reshape the q=4 consecutive groups as a 4x4 matrix:

~~~text
22 21 19 17
11  1 10  3
20 22 25  7
22 12 17 21
~~~

Its GF29 inverse is

~~~text
 2  5  7  5
19  4 15 26
 3  9  4  6
15 28 14 11
~~~

Under the post-selected lower-red role map, and before B, b or e are then read from the matrix, eight inverse entries are fixed:

~~~text
row1 = [K,g,K+g,g]
row2 column2 = q
row3 columns3..4 = [q,a]
row4 column4 = A^-1.
~~~

Charge all sixteen cyclic spiral starts and both directions while holding those eight matrix positions fixed. Exactly **1/32** inverse matrices matches: the authored red-origin forward traversal.

The raw spiral matrix determinant is also **19**. Independently, the older p7 five-red-product right-circulant has determinant **19**. Conditionally interpreting that shared scalar as B passes the DH closure

~~~text
B^a mod p = 19^6 mod23 = 2 = K,
~~~

then fixes b=15, B^-1=26 and e=3. The complete inverse is consequently

~~~text
[K,g,K+g,g]
[B,q,b,B^-1]
[e,e+a,q,a]
[b,-1,-b,A^-1].
~~~

With the conditional state assignment fixed this way **before H4 is consulted**, the entire sixteen-coordinate authored-spiral H4 tape is held out relative to that assignment and matches exactly

~~~text
[g,K,A^-1,Kg | A,qg,A^-1,-b |
 b-K,B^-1,p-g,-K | 1,g+B,F,-b].
~~~

The same 160 transform/direction/start charge against this complete predicted tape leaves only H4, forward direction, red-origin start.

This is a useful separation of candidate operations: matrix inverse/determinant can recover/check state while H4 becomes a complete held-out structural prediction. It does **not** prove the manuscript instructs matrix inversion or determinant. A determinant-only 32-way cyclic/directional charge has four DH-closing presentations because of determinant symmetries; the independently solved spiral fixes the actual traversal. Count this as original-artifact matrix-state evidence, not a body decoder.

Reproducer: sims/lp2_p15_spiral_determinant_p7_crossholdout_sft.cjs.

## Conditional held-out gate: lower red11 role map + one grid scalar predicts the remaining p15 state

The five-word interpretation above can be made substantially less circular. Hold the **entire upper red9 span out**. Read only the lower red11 descriptors

```text
(q,p-1,Kg) = (4,22,10)
(K,a,g)    = (2, 6, 5)
(g,g,F)    = (5, 5, 0).
```

Before consulting any upper red rune, page number, or red cell color, the post-selected role assignment evaluates to

```text
K=2, a=6, g=5, q=4, F=0,
p=23,
A=g^a mod p=8.
```

This state interpretation has an independent first-party anchor that predates this p15 result. The authenticated 2016 message's **zero-based word positions**, without p15 or `H`, uniquely recover the same register in a 69,120-case sentence-structured role audit:

```text
PATH=K=2, LIES=e=3, EMPTY=q=4, EPIPHANY=g=5,
SEEKS=a=6, DEVOTED=A=8, WORDS=b=15, THEIR=B=19, ROAD=p=23.
```

See `im-results/lp2-signed2016-word-position-dh.md`. That source result is not used as p15 input below; it independently fixes the semantic meaning of the state values that p15 reconstructs.


The same frozen identities fail under the obvious one-based 1..29 rune numbering and under Gematria prime values reduced mod29; GP0 is the sole one of these three repository-native representations satisfying both the repeated-`g` and `Kg` relations.

Now use the independently established p15 number square, still **without consulting the red cell color**:

```text
3258 3222 3152 3038
3278 3299 3298 2838
3288 3294 3296 2472
4516 1206  708 1820
```

Reduce each cell modulo29 and apply the repository's pre-existing canonical outside-in `H4` to all four physical rows and columns.

### Two lower-only predictions select H4 and the printed orientation before any unknown state is harvested

The lower red11 alone predicts a complete transformed row

```text
[q,-K,g+K,p-g] = [4,27,7,18].
```

Exactly one physical row has that `H4` image: row3.

It independently predicts three coordinates of one transformed column:

```text
[p-g, ?, aK, K] = [18, ?, 12, 2].
```

Exactly one physical column has those three coordinates: column1.

These two predicates are already enough for the relevant finite controls:

- among identity, `H4`, `H4^-1`, adjacent-pair `H2`, and `H2^-1`, only **H4** produces one exact predicted row and one matching partial column;
- among all eight rotations/reflections of the square with row/column roles fixed, only the **original printed orientation** satisfies both;
- exhaustively charge all **1,152** presentations from 4! row orders × 4! column orders × {untransposed, transposed}: only two presentations satisfy the full-row plus 3/4-column predicates before the missing scalar is opened. The printed presentation harvests `B=19`; the sole rival swaps the two middle rows and harvests `B=10`. Requiring the already-fixed shared-secret equation eliminates that rival because `10^6 mod23=6 != K=2`. Thus exactly **1/1,152** charged presentations survives the unchanged predicates plus DH closure: the printed square.

Thus the transform/orientation charge is completed before the missing column scalar is inspected. The exhaustive presentation result is a finite-family control, not a discovery-wide p-value or authorship probability.

### One harvested scalar closes the DH exchange; every other transformed line becomes predicted

The single unknown coordinate in the selected column is 19:

```text
H4(column1) = [18,19,12,2]
            = [p-g,B,aK,K].
```

Take only that one source value as `B=19` and immediately demand the cryptographic closure:

```text
B^a mod p = 19^6 mod23 = 2 = K.
```

Then ordinary algebra fixes

```text
b = log_g(B) mod p = log_5(19) mod23 = 15
e = b^-1 mod(p-1) = 15^-1 mod22 = 3
B^-1 mod29 = 26.
```

No other grid scalar is needed to define state. After this single harvest, all four transformed columns are exact:

```text
H4(col1) = [p-g, B,     aK,   K] = [18,19,12, 2]
H4(col2) = [b,   g,     Kg,   qg] = [15, 5,10,20]
H4(col3) = [A,   K,     A^-1, e] = [ 8, 2,11, 3]
H4(col4) = [F,   p-g,   e,     b] = [ 0,18, 3,15]
```

and all four transformed rows are exact:

```text
H4(row1) = [K+b, aK, p,   e]     = [17,12,23, 3]
H4(row2) = [g,   1, -b,  B^-1]   = [ 5, 1,14,26]
H4(row3) = [q,  -K, g+K, p-g]    = [ 4,27, 7,18]
H4(row4) = [-1,  g, F,   -b]     = [28, 5, 0,14].
```

These labels were recognized retrospectively and the DH state algebra has many expressions, so the table should not be treated as a calibrated coincidence probability. The causal gain is narrower: after lower red11 fixes the initial operands, a full row plus 3/4-column select transform/orientation, **only one grid scalar is harvested**, and the remaining line identities are held-out consequences.

The state row `[g,1,-b,B^-1]` and state column `[b,g,Kg,qg]` intersect at physical row2/column2 = **3299**. Only after that intersection is fixed do we compare with the source image: 3299 is exactly the uniquely red printed numeral and independently established Fibonacci-prime spiral origin.

The derived `b=15` also equals the **physical page index**, which was not used to select `B`, `b`, the transform or the orientation.

Finally open the previously held-out upper red9 span. Its two word descriptors are exactly

```text
(q,A^-1,F) = (4,11,0)
(g,A,B^-1) = (5, 8,26),
```

matching the state already derived from lower red11 + the single grid harvest.

This is the strongest positive result here. It is a source-only p15 state circuit with multiple held-out consequences, not a body-text decryption. The remaining interpretive dependency is that canonical `H4` was imported from the repository's existing operation vocabulary; the transform charge makes that dependency bounded but does not turn it into a signed first-party instruction.

Primary reproducer: `sims/lp2_p15_lower_red11_grid_blind_sft.cjs`  
Five-word/corpus census: `sims/lp2_p15_red_dh_state_packet_sft.cjs`  
Earlier all-five red-cell check: `sims/lp2_p15_red_origin_h4_dh_state_sft.cjs`

## Original-only p15 → p7 circulant and chapter-length cross-holdout (Agent7, 28 November)

The p7 red-product circulant identity predates this p15 derivation by a week. Its printed-order GF29 right-circulant, built from p7's five original red-word products `[11,26,8,15,2]`, was already known to have determinant `19` and inverse first row `[23,2,5,2,19]`; those numbers were previously interpreted through the external signed DH23 example.

The p15 route does not remove the DH-role-selection dependency. Conditional on its post-selected role map, p15 lower red11 plus the color-blind number grid yields `p=23, K=2, g=5, B=19` before consulting p7. Those conditionally reconstructed original-LP2 values predict the p7 inverse-row packet

`[p,K,g,K,B] = [23,2,5,2,19]`

and independently predict the p7 circulant determinant `B=19`. The p7 matrix reproduces both exactly. Charging the obvious cyclic presentation freedom—five rotations times forward/reversed product order—only the **original printed forward order at rotation0** has that p15-predicted inverse row.

There is a second, typed original-artifact consequence. Every inverse-row value is one of the nine chapter-IN values from the red-rubric SUM→PRODUCT graph, so the printed p7 row addresses chapters

`[23,2,5,2,19] -> [p8,p27,p33,p27,p54]`.

Their source-defined physical chapter spans, measured to the next red chapter start and with p54 ending at solved p56, are

`[7,6,7,6,2]`.

Apply the same canonical outside-in H5 once: `H5([7,6,7,6,2]) = [5,0,7,12,9]`. P15 lower red11 had already fixed that entire target independently as

`[g,F,K+g,aK,q+g] = [5,0,7,12,9]`.

On the actual chapter map, among the 10 p7 cyclic/reversal orientations, only original printed order reproduces that H5 target. A second source-defined row comes from the same chapter operands: the first post-rubric black-word rune lengths along the itinerary are `[3,7,2,7,8]`. Canonical H5 gives `[24,0,2,14,11] = [-g,F,K,-b,A^-1]`, again entirely fixed by the independently reconstructed state.

A third source-defined channel uses GP29 **products of those exact same first-black words**. Along the itinerary they are `[2,19,3,19,27]`. This is already a direct state row **before H5**:

`[K,B,e,B,-K] = [2,19,3,19,27]`.

That matters because the chapter grammar is independently defined as **SUM -> PRODUCT**: the p7 inverse state row `[p,K,g,K,B]` is being used as chapter-IN labels, and the source-defined navigation sends it directly to the second state row `[K,B,e,B,-K]`. Fixed H5 then gives the further consequence `[4,0,3,9,0] = [q,F,e,e+a,F]`. Only original p7 printed order among the 10 cyclic/reversal orientations reproduces all three source-defined channels.

A fixed-marginal control preserves the nine observed chapter-IN labels and permutes the **whole observed chapter records** `(span length, first-black-word length)` among them. Holding the p7 inverse row and p15 state targets fixed gives **240/362,880 = 1/1,512** passes for the span row alone; the raw product-state row also has **240/362,880 = 1/1,512** passes. Span+word-length jointly leaves **120/362,880 = 1/3,024**, and requiring the raw/H5 product row too leaves the same 120, so the product channel supplies a typed state transition but no additional fixed-marginal discrimination beyond the existing joint pair. These are post-discovery conditional specificity diagnostics, not authorship probabilities.

**Evidence boundary:** this is a genuine original-LP2 cross-holdout connecting three independently built structures—p15 state, p7 red products, and chapter rubrics—and it supplies a concrete typed `p7 inverse row -> chapter address -> chapter length -> H5 state packet` handoff. It still does **not** authenticate 'circulant' as an authorial cipher opcode, and p7's direct p8 Hill consumer remains negative. No unknown plaintext is claimed.

Cross-reproducer: `sims/lp2_p15_to_p7_circulant_crossholdout_sft.cjs`.
### Corridor five-rune transfer gate: the p7/p15 circulant does not decode p35/p39

The p15 cross-holdout makes the pre-existing p7 five-word circulant the strongest original-artifact five-lane operator currently available: p15 independently predicts its inverse first row `[p,K,g,K,B]=[23,2,5,2,19]`, and the original p7 printed product order is unique in the 10-orientation ring charge. This licenses one bounded transfer to the two selected five-rune corridor receivers, p35 and p39, without inventing a new matrix.

Freeze the original p7 right-circulant from products `[11,26,8,15,2]`. Charge forward/inverse matrix, column-vector versus row-vector (transpose) action, global sign, and whether the matrix output is the additive key or the plaintext. Before any authenticated target coordinate is read, require the independently frozen page key sum.

- p35 receiver `[19,17,19,24,11]`, required key sum25: **0/16** conventions pass the checksum.
- p39 receiver `[19,7,10,17,23]`, required key sum28: exactly **2/16** pass, both positive inverse-as-plaintext, differing only by row/column orientation.

Only those two p39 survivors are then graded against the authenticated source word FALSE. They predict `[15,6,28,11,17]` and `[25,16,12,22,2]`; **both score 0/5 coordinates**. No parameter is retuned after the checksum.

**Decision:** the strongest independently cross-held-out five-lane LP2 operator does not transfer as the corridor's p35/p39 value decoder. Preserve the p7/p15 state identity as evidence of shared serialization, but do not use the p7 circulant as a corridor key mechanism without a new authored consumer instruction.

Reproduction: `node sims/lp2_p7_circulant_corridor5_transfer_gate_sft.cjs`.
## Spiral-H4 tape → source-arrow p15 body: exact p56-F consumer is impossible

The authored-spiral state tape creates a receiver gate that did not exist when
#69 was closed. The original p15 arrow had already been source-audited as
pointing from the nine-rune heading to the **150-rune body**. The red-origin
clockwise spiral now supplies the fixed 16-value H4 tape

```text
[5,2,11,10, 8,20,11,14, 13,26,18,27, 1,24,0,14].
```

This fixes key, orientation, receiver, start and period without scoring
unknown text. Transfer the native solved-p56 additive rule:
`C=P+K mod29`, with plaintext F transparent and the key clock held whenever
F is emitted. Exhaustively preserve that strict-F ambiguity instead of
choosing a hold pattern by language.

The inverse has **zero complete legal paths**. It first branches at body
offset9 (ciphertext F). At body offset26 / page-local offset35, the sole
remaining state has ciphertext **Y=index26** against tape index9
**26**, forcing decoded F on a consuming step. That is illegal under the
transferred p56 rule, so the last state dies. This is an algebraic exclusion
before language scoring.

A simplified all-consuming subtraction was checked first: it round-trips but
is nonlinguistic (IoC 0.03481 versus source-body 0.03588 and clear p57
0.06271). The strict-F impossibility is the actual decision.

This does **not** weaken the spiral's state-serialization role. It retires
exactly:

```text
p15 red-origin spiral -> q=4 H4 tape
-> arrow-selected p15 body
-> solved-p56 additive/transparent-F receiver.
```

Reproducer:
`sims/lp2_p15_spiral_h4_body_p56_fhold_gate_sft.cjs`.

## A natural q-block key use was frozen before grading and fails

The new four-scalar packet

```text
[10,5,12,0] = [K*g,g,a*K,F]
```

has exactly four lanes. That suggests one immediate low-flexibility test against the two already target-blindly selected p6 q-block receiver sets.

The source-only preregistration fixed:

```text
block1 pages   [32,33,34,35]
starts         [30,132,4,25]
arities        [3,4,2,5]

block3 pages   [37,38,39,40]
starts         [146,57,132,71]
arities        [4,6,5,4]
```

and used the four packet scalars as **one constant additive key per lane**, reusing the same four-lane schedule on both q blocks. The only charged freedom was global additive sign.

Chronology:

1. source-only decoder committed: `2210d346963440fa7002804002999e9737bad6cc`;
2. complete raw inverses for both signs committed, still without target plaintext: `902056616e926958043972fa8054665088e99a22`;
3. only then was the authenticated 2016 signed-source target read and graded.

The target words are

```text
block1: YOU WILL BE FOUND
block3: LUCK BEWARE FALSE PATHS
```

with GP-rune arities exactly

```text
[3,4,2,5] and [4,6,5,4].
```

Post-freeze result across all **33 target runes**:

```text
sign +1 : 2 / 33 rune positions, 0 / 8 complete words
sign -1 : 0 / 33 rune positions, 0 / 8 complete words
```

So the literal “cross-segment products are the four q-block lane shifts” model is rejected. Do **not** rescue it by adding phases, word-specific signs, exceptions, or fitted scalar transforms.

Pretarget reproducer: `sims/lp2_p15_crossseg_qblock_pretarget_sft.cjs`  
Frozen output: `im-results/lp2-p15-crossseg-qblock-pretarget-output.json`  
Post-freeze grader: `sims/lp2_p15_crossseg_qblock_grade_sft.cjs`

## What this changes

The DH-state serialization is no longer confined to the p6/p7 reversed-boundary/product observations. Physical p15 supplies a **conditional compatibility chain** under the post-selected descriptor→role map: lower red11 -> `(p,g,a,K,q,F,A)` -> H4 grid column -> `b,B` and shared-secret closure -> H4 row -> red 3299 origin -> upper red9 confirmation. Its uniquely paired red11 layout also composes with p6 in both directions.

That materially strengthens the interpretation that these red mathematical objects share a state vocabulary and that the p15 number square participates in the same state system. It still does **not** say how that state acts on encrypted body text.

The correct next gate is therefore narrow:

1. seek a source-visible operation or receiver that specifically consumes the p15/p6 mutual packet;
2. require a prediction on an original object not used to recognize these relations;
3. freeze the complete operation before plaintext grading;
4. reject another generic additive/H/state-expression expansion absent a new authored selector.

The tempting direct q-block additive consumer has already been killed here, so the structural positive should not be inflated into a decoder claim.
