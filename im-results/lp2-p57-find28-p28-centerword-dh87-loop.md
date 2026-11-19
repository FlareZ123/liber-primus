# p57 FIND→28 selects a centered p28 word and an original DH23 center line

**Agent42 + Agent11 + Agent50, 18 November 2026. Classification: source-constrained intended-route hypothesis. The physical p28 layout selects a complete DH23 instance, and a reversible GP29 shell transform now reads the remaining DH fields directly from the selected source object. The earlier DH151/DH87 loop is retained as a secondary arithmetic closure. No unknown LP2 plaintext is claimed.**

## New blind consequence on physical p28

The existing solved-p57/p50 graph fixes `FIND=42 → p50 cell42 = 0S → 28`, and the original 2014 LP2 files are numbered 0.jpg through 57.jpg. That already selects physical page28 before inspecting its internal word structure.

Physical p28 contains **269 runes in 59 printed words**. Its exact center is zero-based rune offset134. The **28th printed word begins at offset135**, immediately after that center, and spans offsets135..139:

```
runes:   EA  A  I  U  L
GP0:      28 24 10  1 20
sum:                   83
```

The sum **83 is exactly GP0(EMERGE)** from the solved p57 instruction.

This page-numbered placement is selective across the available unknown book. Among the 48 physical pages p1..p55 whose p-th printed word exists, **p28 alone** has its p-th word begin immediately after the exact center, and **p28 alone** has that p-th word sum to83. The two tests therefore converge on the same already selected page and word.

The source-exact reproduction is `sims/lp2_p57_find28_p28_centerword_dh87_sft.cjs`.


## Physical center line directly selects DH23

The original p28 image has **12 physical rune lines**. The already selected 28th word is the final word of **line6**, and line6 is exactly **23 runes** long. The word occupies one-based line positions **19 through23**, so its length is **5**. The first visible fragment on that same line is literally the two-rune transliteration **DH**.

A complete census over the **604** physical rune lines on p0..p55 (excluding rune-free p50) finds exactly one line whose first visible fragment is `DH`: **p28 line6**. The operation family is therefore present on the same source-selected physical line before any modular arithmetic is applied.

That single line supplies four standard Diffie-Hellman fields directly from layout:

| field | source-visible value |
|---|---:|
| operation | line-start fragment `DH` |
| modulus `p` | line length **23** |
| generator `g` | selected word length **5** |
| private exponent `a` | line number **6** |
| peer public share `B` | selected word start position **19** |

Standard DH has no remaining parameter search. Five has full order22 modulo23, the unique discrete logarithm satisfying `5^b mod23 = 19` is **b=15**, `A=5^6 mod23=8`, and `K=19^6 mod23=2`. A later reversible source relation now obtains `b,K,A,B,p` directly from the p28 rune pairs as well, so the discrete logarithm is a validation rather than the only source of `b`.

The p50 table width is independently **8**, matching `A`. More importantly, the selected five-rune word implements the clear p57 circumference language under the same modulus. Its outer shell is `EA/L = 28+20 = 48 ≡ 2 (mod23)`; its inner shell is `A/U = 24+1 = 25 ≡ 2 (mod23)`. Thus **both literal nested circumferences equal the DH shared secret K=2**. Across all **318** five-rune words on p0..p55, **p28 word28 is the only word** whose outer and inner shell sums both equal2 modulo23. Shedding the two shells leaves the central `I`, which has the independent p50 link to CIRCUMFERENCES below.

The p50 bracket center also gains a direct continuation. `DIUINITY=105` selects the unique literal token `13`; using the already selected prime-count family in the inverse direction gives the 13th prime **41**, and p50 cell41 `1O` decodes under base59 to **83 = GP0(EMERGE)**. Treat this as a route closure rather than a familywise probability claim.

Finally, `B=19` paired with the source-visible red-13 motif predicts a receiver. Among original red spans immediately followed by a red 13-dot mark, exactly one has length19: the p27 red heading. Its residual `19−13=6` reproduces the same private exponent as p28 line number6. The p28 object therefore supplies a direct manuscript-side handoff into the independently established p27 red13/DH23 circuit.

This changes the historical interpretation. The exact toy tuple predates Cicada in pedagogical material, so the 2013 example is not Cicada-specific provenance. It is now a semantic control rather than the only reason to import DH23 into LP2, because p28 itself selects the operation and tuple.

Focused reproducer: `sims/lp2_p28_centerline_dh23_sft.cjs`.

## Reversible circumference transform reads the complete DH state

The solved instruction **SHED OUR OWN CIRCUMFERENCES** fixes a natural two-point operation on an ordered shell pair. For GP29 values `(x,y)`, define

```
H(x,y) = (x-y, x+y) mod29.
```

This is reversible because its determinant is2, with `2^-1=15 mod29`. The phrase order **OUR OWN** fixes the orientation: among the eight sign/order variants of the natural difference/sum family, only `(x-y,x+y)` sends the selected word's literal outer circumference `[28,20]` to

```
H(28,20) = [8,19] = [GP0(OUR), GP0(OWN)] = [A,B].
```

With that operation frozen, three local consequences read the rest of the DH state:

```
literal line-start DH:     H([23,8])  = [15,2]  = [b,K]
selected word inner shell: H([24,1])  = [23,25] = [p,GP0(WE)]
immediate successor:       H([24,25]) = [28,20] = selected outer shell
```

The already selected geometry supplies `g=5` from word length and `a=6` from line number. Thus the same original p28 object directly contains the complete standard tuple `(p,g,a,b,A,B,K)=(23,5,6,15,8,19,2)`, while also typing the clear instruction values **WE / OUR / OWN**. Standard DH independently validates all fields: `5^6 mod23=8`, `5^15 mod23=19`, and `19^6 mod23=2`.

The transform has two additional algebraic locks. Its determinant is **2=K**, the determinant inverse is **15=b**, and the matrix `[[1,-1],[1,1]]` has exact order **28 modulo29**, equal to the already selected physical page number.

The independently selected p27 red receiver supplies a cross-object operation selector. Its red heading has length **19=B** and is immediately followed by the literal red **13**-dot mark. Applying the already frozen H gives

```
H(19,13) = [6,3].
```

The first output is the known DH exponent **a=6**. The second is exactly **e=3**, where `e=g-K=5-2=a/K`. Exponent3 gives the reversible GP29 cube permutation `x -> x^3 mod29`, which sends `K=2 -> A=8 -> B=19 -> b=15`. Across all **16** original red spans immediately followed by a red 13-dot mark, p27 is the only object whose `H(length,13)` output is `[6,3]`. This is strong source-frozen corroboration, with a chronology limit: the cube bridge was committed at 23:46:47 UTC and `READ OUT` at 23:52:08 UTC; the first p27 `[6,3]` cube-link commit followed at 23:53:38 UTC. The p27 receiver and H pre-existed, while this particular target/application did not. It therefore strengthens exponent3 after discovery rather than serving as a prospective cube-direction prediction.

The immediate-successor relation is selective. Across all **42** within-page original LP2 adjacencies in which a five-rune word is followed by a two-rune word, **p28 word28→word29 is the only pair** satisfying `H(successor)=current outer shell`. In the page-numbered successor family only p28 satisfies it; p38 is the only other length-eligible page and fails. This is a structural control rather than a discovery-adjusted p-value. Director #1690 later charged the complete authenticated 2013 command family and found the numeric `NEXT→p28 DH` landing unique, yet also confirmed that the real 2013 NEXT operation stores client-supplied text and does not advance a manuscript cursor. Therefore this adjacency is retained as local H consistency; the historical NEXT opcode no longer source-selects it.

The same operation was tested without tuning as a manuscript-wide wordwise shell decoder on all **12,956** unknown original runes. It does not recover prose: source-native LP1 trigram score changes only from **−3.41742255** raw to **−3.41475036**, far from solved p57 **−2.46814471**, and the independently predicted p0 opening decodes to `SSIGEAHYN / ILCEE` rather than `EPIPHANY / SEECS`. The source-selected H→cube composition also misses that p0 holdout. Therefore H is currently a **local reversible field/instruction decoder**, not the global LP2 cipher inverse.

Reproducer: `sims/lp2_p28_hadamard_shell_decoder_sft.cjs`; Windows Node22 PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44423919852.

## DH23 state predicts p50, p27 DIVINITY, and the signed BASE29 modulus

The direct DH23 state does more than reproduce the historical toy tuple. It predicts a typed p50 object from quantities already fixed on p28.

Shedding both literal circumferences from p28 word28 leaves the central `I`, whose GP prime value is **31**. Using the independently printed table width `A=8` and the line-number exponent `a=6` as the row and column gives zero-based cell

```
31×8 + 6 = 254.
```

Cell254 is token `39`. Its base59 reading is **186 = 23×8+2 = (p,K)**, while its base60 reading is **189 = 23×8+5 = (p,g)**. Independently, `GP-prime(FIND)=151`, and cell151 is the only other copy of token `39` in the 256-cell table. Their address gap is therefore fixed:

```
254 - 151 = 103.
```

The already selected p27 carrier `EORNSOOCAEYEE` begins at zero-based rune offset **79**. Shedding its two outer rune pairs leaves `NSOOCAEY`, whose GP0 sum is exactly **103**. P50 cell103 is the literal token `3Q`. The p28 exponent `a=6` selects the sixth rune of that interior, GP index24, which is digit `O` in the signed 2013 BASE29 alphabet. The source-selected object therefore serializes as

```
p50[103] || BASE29(interior[6]) = 3Q || O = 3QO = 3301.
```

This creates an LP2-native `DH 3301` operation/modulus pair. It does **not** authorize importing the preserved 2013 live-session base2757, server share1264, client share2800, shared1067, or any session exponent. Those values remain participant/session-specific.

The same p28 tuple predicts the previously observed p50 pointer structure. Cell186 is `0J` and decodes to **B=19** under both candidate radices. Under base59, exactly **A=8** pointer steps first reach cell189, which is a base59 self-pointer; base60 does not reach189 at eight steps. The exact base59 path is `186→19→33→112→72→161→214→247→189`. This gives the mixed-radix transition a DH-state role without turning the graph into an unknown-page cipher.

The p27 red object closes the state again: its heading has length19, its red 13-dot mark follows immediately, the 13th heading rune is `I` with prime31, and `19−13=6`. Thus the p28 values `B=19`, center `I=31`, and `a=6` are all reproduced by the source-selected p27 receiver before the 103/3QO serialization.

Focused reproducer: `sims/lp2_p28_dh23_onion_factor_selector_sft.cjs`.

## Line6 numerically self-encodes the DH server state

A later complete physical-line census strengthens the source-native DH interpretation. The literal line-start runes `D H` have GP indices **23,8**. Line6 itself has **23 runes** and exactly **5 visible rune fragments**, and its one-based page line number is6. Therefore its source-visible values satisfy the standard DH server equation

```
p = 23
g = 5
a = 6
A = 8
5^6 mod23 = 8
```

This makes the visible word `DH` simultaneously an operation label and a numerical encoding of `p=23,A=8`. The five-fragment count independently repeats the selected word's length5, so generator5 is present twice before any discrete logarithm. The independently selected word's local start19 then supplies peer public `B=19`; its two nested shell sums both supply shared `K=2`.

Across all604 physical p0..p55 rune lines,594 contain at least two runes. Twenty-four have first GP index equal to line length; six satisfy the prime-line relation `second = fragment_count^line_number mod line_length`; **p28 line6 is the only line satisfying both**. Its tuple is exactly `(23,5,6,23,8)` and its first fragment is literally `DH`.

This census is mechanistic reinforcement rather than a discovery-adjusted significance claim. It compresses the already selected p28 geometry into the same standard DH equation. See `lp2-p28-dh-line-selfencoding.md` and `../sims/lp2_p28_dh_line_selfencoding_sft.cjs`.

## Shedding the selected word's circumferences

The same solved instruction says to shed our own circumferences. Applying the literal minimal peel to the selected five-rune word removes its two outer runes:

```
EA A I U L  →  A I U
```

The remaining GP0 sum is **24+10+1 = 35**. One further peel leaves the single rune **I**.

The removed outer pair is itself instruction-bearing. Its values are **28 and20**. Their absolute difference is **8 = GP0(OUR)** and their sum modulo29 is **19 = GP0(OWN)** in this sentence context. Those two symmetric equations have the unique unordered GP29 solution {20,28}, so the literal circumference selects OUR/OWN before the DH exponents are chosen. In the original p28 scan the selected word is also the final word on physical line6 of12, placing it at the page's visual half as well as immediately after its exact rune midpoint.

The three-rune interior carries three additional exact instruction values under standard Gematria measures:

- interior GP1 is **38 = GP0(WITHIN)**;
- interior GP-prime is **131 = GP0(CIRCUMFERENCES)**;
- with interior length3, **35+3=38 = WITHIN** and **35×3=105 = DIUINITY**.

Together with whole-word GP0 **83 = EMERGE**, this gives a nested signature tied directly to the wording that selected the operation. Across every printed LP2 word through p55, **only physical p28 word28 satisfies all three conditions at once**. The individual marginal counts are retained only as diagnostics in the SFT because the joint source-selected signature is the relevant test.

This matters because the existing p57/p50 DH151 hypothesis had a valid primitive-root candidate **g=35**, previously obtained only through `MUST=186 mod FIND=151`. The p28 route now supplies **35 independently from a blind-selected original ciphertext object**.

The twice-peeled center I adds a direct table link. Its GP prime value is31; p50 cell31 is `2D`, whose only other occurrence is cell38, exactly GP0(WITHIN). Under base59, both copies decode to **131 = GP0(CIRCUMFERENCES)**. Base60 gives133 and breaks that target.

A solved LP1 koan states that “THE I IS THE UOICE OF THE CIRCUMFERENCE.” Here the central I literally addresses a table token whose base59 value is CIRCUMFERENCES, while the token's duplicate sits at WITHIN. This is now an executable cross-round correspondence rather than only thematic wording.

## Secondary DH151/DH87 arithmetic construction from p57

The construction below remains exact, but it is no longer the primary operation selector. The physical center line now supplies DH23 fields directly from layout, whereas this branch derives its modulus, generator and exponents from several Gematria measures after the DH family is already in view. Preserve it as a secondary closure and possible cross-check.

Use only values now selected by the solved instruction and the p28 peel:

- modulus `p = GP-prime(FIND) = 151`;
- generator `g = 35`, from the p28 word interior;
- private exponent `a = GP-prime(OUR) = 21`;
- private exponent `b = GP-prime(OWN) = 55`.

The adjacent words **OUR OWN** supply the two exponents without choosing another p57 word after seeing the output. The group is valid: 35 has full order150 modulo151.

The resulting values are:

```
A = 35^21 mod151 = 107
B = 35^55 mod151 = 66
K = 35^(21*55) mod151 = 87
```

Two exact vocabulary checks make this construction unusually constrained.

First, among the six distinct p57 words whose GP-prime sums lie in 1..150, only **OWN=55** exponentiates to the GP-prime sum of another solved p57 word:

```
35^55 mod151 = 66 = GP-prime(TO)
```

Second, among all 15 unordered pairs of those six eligible words, only **OUR/OWN** yields a shared value equal to the prime ordinal of a p57 word whose GP-prime sum is prime:

```
K = 87 = pi(449)
449 = GP-prime(PARABLE)
```

This is a finite exact check over the frozen solved-p57 vocabulary. It is still a post-discovery diagnostic, so I do not present it as a discovery-adjusted p-value.

## The DH outputs address p50 and close the loop

Treat the three DH outputs as zero-based p50 addresses, matching the already established table-address convention. Under base59:

| DH value | p50 token | base59 | solved p57 target |
|---:|---|---:|---|
| A=107 | `3c` | **215** | GP-prime(AND)=215 |
| B=66 | `0P` | **25** | GP0(WE)=25 |
| K=87 | `15` | **64** | GP0(SHED)=64 |

Base60 gives 218, 25 and65, so it destroys the A→AND and K→SHED matches. This supplies a new route-internal discriminator for the previously provisional base59 reading. In the exact base59 table multiset, values215,25,64 occur 1,2,1 times respectively.

Read in DH output order, the three p50 targets are **AND / WE / SHED**. That is a coherent instruction fragment and supplies a natural reason to continue the literal shedding operation to the central I.

The shared secret then rejoins the previously fixed p50 word graph:

```
K87
  → p50[87] base59 = 64 = SHED
  → p50[64] base59 = 120 = PARABLE
  → p50[120] base60 = 42 = FIND
  → p50[42] = 28
  → physical p28
  → centered word EA-A-I-U-L
  → shed outer runes
  → g35
  → DH(OUR=21, OWN=55; p=FIND=151)
  → K87
```

This creates a closed, reproducible route through the solved instruction, the original numeric table, a blind-selected unknown page, and the historically authenticated Diffie-Hellman operation family. It also makes the p28 word's `EMERGE=83` sum functional: the selected word announces the final instruction verb at the point where the route exits the page center.

The route still does not expose unknown plaintext. Its present value is selecting an operation and its parameters from source-visible objects with substantially less freedom than the prior DH73 construction.

## Center-I continuation and p28–p31 block

A second peel leaves the central **I**, whose GP prime value is31. Treating31 as a p50 address gives token `2D`; that token occurs only at cells31 and38, where38 is GP0(WITHIN), and base59 decodes both copies to131=GP0(CIRCUMFERENCES). This gives the earlier LP1 koan, "the I is the voice of the circumference," an executable table correspondence.

The same31 also supplies a natural opposite page endpoint to the already selected p28. Physical p28–p31 have prime rune counts `[269,277,263,269]`, exactly12 printed lines each and period counts `[3,4,5,6]`. The four pages contain1078 runes, and `pi(1078)=180`. One literal peel of the 32×8 p50 table leaves a30×6 interior of exactly180 cells. This creates a source-selected 180-to-180 frontier: prime-position runes of p28–p31 against the once-shed p50 interior.

Several direct consumers are closed. A row-major additive pad from the 180 p50 values fails native-GP language. The route-supplied DH151 family
`key_i = base^(tableValue_i) mod151 mod29`, with `base ∈ {35,107,66,87}`, both table radices and both additive signs, also fails. Its best trigram score is **−3.3751244733**, versus **−2.4681447142** for solved p57 and **−2.4541132344** for a planted control. The 12 p57 instruction words align naturally with the 12 physical lines of each p28–p31 page, but direct per-line Caesar shifts fail under both canonical GP0 values and the mechanism-derived 12-number schedule; the best mechanism-derived score is **−3.3884247610**. Direct periodic GP29 keys from the full centered word, its shed interior [24,10,1], or scalar35 also fail; best score is **−3.3964782482**. Preserve the alignment while rejecting these exact formulas.

A separate p31-only p56 transfer is also closed. Because `K=87=pi(449)` and p31's exact center is F, I tested the authentic p56 F-transparent mechanism starting at prime449 on the whole page and the source-natural center-out rays, under both signs. Every automaton becomes impossible before finishing its input.

## Decision

Promote the **FIND→28 → p28 word28 / line6 DH23 → p50 token39 → p27 red19+13 / DIVINITY103 → 3QO=3301** construction as a leading intended-navigation hypothesis.

The decisive new source facts are all on the already selected original p28 object: line6 uniquely begins with `DH` across all604 physical LP2 rune lines; it has23 runes; the five-rune selected word occupies positions19..23; and the line number is6. These values directly instantiate `p=23, g=5, a=6, B=19`, which uniquely gives `b=15, A=8, K=2`. Both nested circumferences of the selected word independently sum to2 modulo23, and no other five-rune LP2 word does so twice.

This materially demotes the earlier DH151/DH87 construction from primary operation evidence to a secondary arithmetic loop. It remains reproducible, including its p50 word hits, but it is no longer needed to explain why a solver should try Diffie-Hellman or which canonical worked group to use.

The next receiver is also source-typed: `B=19` plus the already selected literal `13` identifies the unique p27 red19+13 object, where `19−13=6` repeats the p28 private exponent and the existing p27 transducer reconstructs the same DH23 tuple.

No unknown ciphertext has yet been converted to authenticated plaintext. The productive next step is therefore to consume a source-selected DH23/p27 output in a reversible way on untouched ciphertext. Do not reopen arbitrary DH groups, p31 prime phases or broad p28 cipher menus.

Reproducers: `sims/lp2_p28_centerline_dh23_sft.cjs` for the direct DH23 selector and `sims/lp2_p57_find28_p28_centerword_dh87_sft.cjs` for the retained DH151/DH87 loop.
