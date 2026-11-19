# The solved circumference instruction yields a source-selected LP2 page route

**Agent45, 19 November 2026. Classification: source-selected navigation and DH/H state mechanism. The route supplies the exact `[3,27]` parameter pair used by the preferred p28 READ OUT inverse. A separately selected p39 circumference also supplies the numeric READ OUT output coordinates `[55,20]`. Authenticated 2016 source material now selects the GP29 cube operator itself; the main remaining p28-local premise is assigning the fixed power pair separately to the exact center singleton and adjacent five-rune word.**

## Fixed upstream state

This report uses the already reconstructed source state

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2, e=3, q=4
H(x,y)=(x-y,x+y) mod29
```

and the established p50 base60 reading. Every page pointer below is obtained before any ciphertext language score is consulted.

## 1. Solved p57 gives the operation and points to p50

Solved physical p57 says:

```text
... WE MUST SHED OUR OWN CIRCUMFERENCES
FIND THE DIUINITY WITHIN AND EMERGE
```

Interpret “shed our own circumferences” literally at printed-word level. Remove the first and last rune of every selected word. Words of length one or two have empty interiors.

The p57 body after the red **PARABLE** title has 19 words and 88 runes. One literal shed leaves exactly **50** runes:

```text
88 - 2*19 = 50
p57 -> p50
```

Physical p50 is the unique rune-free page and carries the 256-cell table used elsewhere in the route.

## 2. P50/DH selects p33, whose source layout returns WE

The fixed public value `B=19` addresses:

```text
p50[19] = 0X = 33
```

so the table selects physical p33.

P33 independently re-registers the state in typography and geometry. The second red heading begins

```text
[21,2] = [B+K,K]
H(21,2) = [19,23] = [B,p].
```

Those outputs are visible as the decorative M with GP ordinal19 and the first transcribed red title D with GP ordinal23. A second H gives

```text
H(19,23) = [25,13] = [GP0(WE), red title dot count].
```

Thus p33 returns **WE**, the first word of the solved p57 instruction, before the circumference operation is transferred. The complete p33 layout packet is in `im-results/lp2-p33-dh-layout-state-register.md`.

## 3. Shed p33's selected first body and reach p39

P33's first black body is bounded by the first red title and the reused three-dot divider. It has

```text
21 words = p-K
81 runes = e^q = 3^4.
```

One literal shed leaves

```text
81 - 2*21 = 39
p33 -> p39.
```

P39 then supplies independent source holdouts.

The complete original-JPEG inventory establishes p39 as the only other LP2 page with p33's reused three-black-dot divider template. P39's only red three-rune title is

```text
[27,5,15] = [-K,g,b].
```

Repeated frozen H on its first two runes gives

```text
[27,5] -> [22,3]  = [p-1,e]
       -> [19,25] = [B,GP0(WE)]
       -> [23,15] = [p,b].
```

The literal third red rune is already `b=15`.

## 4. P39 continues the state in source geometry and nested shedding

P39's two source sections each occupy `a=6` physical rune lines. Around the p33 base `p*g=115`, its geometry is:

```text
upper section words       = p+e = 26
upper section runes       = p*g+q = 119

lower black words         = p+g = 28 = ord(H)
lower black runes         = p*g+e = 118
lower section runes       = p*g+a = 121
```

Apply the already selected circumference operation repeatedly to the 118-rune lower black body. At state-selected depths

```text
depths [K,e,q,g] = [2,3,4,5]
counts             [23,6,2,0]
                 = [p,a,K,0].
```

The triple `[23,6,2]` at depths `[K,e,q]` occurs on p39 alone among all 15 red-started bodies.

The depth-`e=3` core contains six runes:

```text
[1,5,2,10,5,13]
count = 6
raw GP0 sum = 36.
```

The authenticated 2016 source gives zero-based word indices

```text
FOUND=35, GOOD=36, LUCK=37
```

and `GP0(FOUND)=36`, while the first GP rune of GOOD is `G=6=a`. Therefore the p39 depth-e core has the exact cross-source pair

```text
(count,sum) = (6,36)
            = (GP(G), index(GOOD))
sum         = GP0(FOUND).
```

Across all 15 red-started bodies at fixed depth `e=3`, p39 is the sole body whose `(count,raw sum)` equals `(first GP rune, zero-based index)` of any authenticated 2016 word.

At depth `q=4`, the surviving core is

```text
[10,5]
count = K = 2
sum   = b = 15 = zero-based index(WORDS)
H([10,5]) = [g,b] = [5,15].
```

These are state/checkpoint outputs. No plaintext transform is inferred from the six-rune core.

## 5. P39 selects its structural mate p3, whose body points to p53

The p39 red title's first H output includes `e=3`. In the entire annotated LP2 corpus there are exactly two three-rune red spans, and both begin at page-local rune offset119:

```text
p3  offset119: [13,23,2]
p39 offset119: [27,5,15].
```

Thus the unique other copy of p39's three-rune red-span geometry is physical **p3=e**.

Use the body immediately after that paired p3 span. It has 21 words and 95 runes. One unchanged shed gives

```text
95 - 2*21 = 53
p3 -> p53.
```

This p3-to-p53 output was frozen before the p53 marker semantics below were used.

## 6. P53 answers with MUST and a unique circumference packet

P53 contains one terminal red span. It starts at rune128, spans **51 runes**, and contains 12 printed words.

Canonical GP gives

```text
GP0(MUST) = 51.
```

P53 is the only red span in the annotated corpus with length51. It therefore supplies the second word of the solved instruction after p33 supplied WE.

Its first two red runes are `[16,13]`, and

```text
H(16,13) = [3,0] = [e,F].
```

Repeated literal shedding of the 51-rune red object gives the unique count sequence

```text
depth1  27 = -K mod29
depth2  12 = K*a
depth3   5 = g
depth4   3 = e
depth5   1 = a-g
depth6   0.
```

No other red span has this five-level packet, and p53 is also the sole red span whose first H image is `[e,0]`.

The route has therefore reconstructed, through source features,

```text
WE   -> p33 H output
MUST -> p53 red length
SHED -> solved p57 operation.
```

The p53 packet independently exposes the ordered numerical pair `[e,-K]=[3,27]`. These are the exact exponents used by the preferred p28 READ OUT transform.

## 7. The first shed of MUST points to p27, which answers with the full state

Keeping the same output type, the first shed of the MUST-marked p53 red object leaves 27 runes:

```text
p53 red51 -> 27
p53 -> p27.
```

P27's only red title is a dense held-out state register:

```text
title length            = 19 = B
first rune              = 19 = B
whole-title GP0 mod29   = 15 = b
H(first two)            = [6,3] = [a,e]
nested shed counts      = [13,8,6,4,2]
                        = [A+g,A,a,q,K].
```

The combined p27 length and nested count packet is unique among annotated red spans.

This gives a source path to the p27 `H(19,13)=[a,e]` relation that had previously served only as post-discovery corroboration for the p28 cube exponent.

The selected p27 body continues the same operation. It has 49 words and 215 runes. At the state-selected depths:

```text
depth K=2 -> 57
depth e=3 -> 32
depth q=4 -> 15
depth g=5 -> 4.
```

No other red-started body has the complete `[57,32,15,4]` packet at those four fixed depths.

The first two outputs are physical page numbers:

```text
57 -> solved p57, the source of the SHED CIRCUMFERENCES instruction
32 -> physical p32.
```

The final two values are authenticated 2016 zero-based source-word positions:

```text
15 -> WORDS
4  -> EMPTY.
```

Thus the same selected p27 body gives the typed packet:

```text
[p57, p32, WORDS, EMPTY].
```

This is especially relevant because the existing independent p32 route uses the held-out authenticated source word EMPTY to select the p32 `HOME X` object, then reaches the state-saturated BUDS container and closes READ OUT back to `THE DEVOTED`. The p27 packet therefore supplies a second source-selected route into p32 and independently names the EMPTY label already required there. It does not by itself select the later p32 diagonal orientation.

## 8. The selected circumferences encode FIND, then p39 supplies READ OUT coordinates

The two independently selected 21-word route bodies have a second exact interpretation under the solved instruction.

For p33 first body:

```text
81 total runes
39 interior runes after one shed
42 outer runes removed.
```

For the matched p3 body:

```text
95 total runes
53 interior runes after one shed
42 outer runes removed.
```

Canonical GP gives `GP0(FIND)=42`. Across all 15 red-started bodies, p33 local0 and p3 local119 are the only bodies with a one-layer outer circumference of exactly42 runes. Their interiors independently point to p39 and p53.

This gives a concrete mechanical reading of the next solved clause:

```text
FIND THE DIUINITY WITHIN
outer amount = FIND = 42
inner amount = next page pointer.
```

No claim is made that the removed rune sequence itself spells FIND.

On independently selected p39, apply the already frozen forward H to each word's outer circumference. Preserve a one-rune center. The complete transformed outer stream has:

```text
length = 55
GP0 sum mod29 = 20.
```

Across all 15 red-started bodies, p39 local119 alone has the ordered statistic `[55,20]`.

Only after the numeric pair is obtained do the values correspond to:

```text
GP0(READ)=55
GP0(OUT)=20.
```

The dedicated report and SFT charge this pair against the p28 family:
`im-results/lp2-p39-outer-readout-selector.md` and
`sims/lp2_p39_outer_readout_selector_sft.cjs`.

## 9. P39's numeric pair selects the p28 raw output without language

The p28 center-plus-word object is independently fixed:

```text
[9] + [28,24,10,1,20].
```

Charge every reversible uniform GP29 power pair, both orientations and all five internal output cuts:

```text
12 center exponents
* 12 word exponents
* 2 orientations
* 5 cuts
= 1,440 numeric configurations.
```

Retain only outputs whose left raw GP0 is55 and whose right raw GP0 is20, using the p39 pair above. Exactly two parameter tuples survive:

```text
(3,27),  forward, cut3
(17,27), forward, cut3.
```

Both yield the identical raw six-rune output:

```text
[4,28,23] | [3,1,16].
```

The alias is value-specific because source center rune9 has the same image under exponents3 and17. The authenticated state fixes `e=3`, leaving the intended parameter tuple `(3,27)`.

Only after this numeric selection does the raw output transliterate as:

```text
READ | OUT.
```

This selector does not use the p50 low-digit transition. That distinction matters because a separate blind GOOD to LUCK gate rejected general promotion of the low-digit rule as a universal navigation opcode.

## 10. Relation to the p28 mechanism

Authenticated 2016 word positions now independently select the GP29 cube map `x -> x^3 mod29`. The circumference route independently supplies the ordered p28 parameter pair:

```text
p53 H(first2) -> e=3
p53 first shed -> 27=-K mod29.
```

P39 separately supplies the output coordinates `[55,20]` that select the exact raw READ OUT sequence across all1,440 reversible power/orientation/cut configurations.

The remaining p28-local premise has therefore narrowed further. The unresolved question is why the fixed source-selected pair should be assigned separately to the exact center singleton and adjacent one-based five-rune word. P28's unique center-plus-word geometry and literal DH line are the strongest local selectors for that split.

The chronology remains explicit: p53/p27 and p39 circumference corroborations were recognized after READ OUT was known. They materially compress the intended route and operator parameters, while a fresh source consequence of the separate two-operand application would provide the cleanest prospective promotion.

## Full red-body control

Applying one literal shed to every nonempty red-started body gives 15 outputs. Only four fall in physical page range:

| Source body | Body words | Body runes | One-rune words | Interior runes |
| --- | ---: | ---: | ---: | ---: |
| p3 local119 | 21 | 95 | 0 | **53** |
| p33 local0 | 21 | 81 | 0 | **39** |
| solved p56 local0 | 23 | 80 | 1 | **35** |
| solved p57 local0 | 19 | 88 | 0 | **50** |

P57 is the explicit solved positive control. P33 is independently selected by p50/DH. P3 becomes selected by p39's unique matching three-rune template and `e=3` state. P56-to-p35 remains an unselected census observation.

## Retired immediate plaintext consumers

The mechanism above is navigation and state extraction. Direct value-changing H consumers remain negative:

- forward or inverse H on the 118-rune p39 body is nonlinguistic;
- forward or inverse H on the carried 39-rune p33 interior stream is nonlinguistic;
- all 56 phase/direction variants of the p33 28-word H-power cycle are nonlinguistic.

Do not expand those families with tuned phases or arbitrary keys.

## Research consequence

The strongest current causal route is:

```text
solved p57 “WE MUST SHED OUR OWN CIRCUMFERENCES”
    -> shed p57 body -> p50
    -> B=19 -> p33
    -> p33 H -> WE
    -> shed selected p33 body -> p39
    -> p39 DH/H state and unique 3-rune template
    -> p3=e
    -> shed paired p3 body -> p53
    -> p53 red length = GP0(MUST)
    -> p53 H/shed packet = [3,27] plus state
    -> first shed -> p27
    -> p27 held-out DH/H state register
    -> p27 body sheds at [K,e,q,g] to [p57,p32,WORDS,EMPTY]
    -> independent p32 receiver route
```

The next useful test should exploit this route to choose a receiver before reading new ciphertext values, or prospectively distinguish the p28 center/word split from other placements of the already selected `[3,27]` power pair. Broad low-digit routing and arbitrary cipher layering should remain retired absent a new source selector.

## Reproduction

- SFT: `sims/lp2_shed_circumferences_page_pointer_sft.cjs`
- Historical Windows workflow: `.github/workflows/agent45-shed-circumferences-page-pointer.yml`
- Generic Windows Node22 PASS including the p27 body packet: https://github.com/FlareZ123/liber-primus/actions/runs/44455688899
- Solved p57 source: `resources/external/relikd-solved-gp29-native-v1.json`
- Authenticated 2016 source: `resources/historical/cicada2016-4gq25-outguess.asc`
- Physical transcription: `resources/liber-primus/lp2-transcription.txt`
- Ink annotations: `resources/liber-primus/lp2-ink-annotations.json`
- P50 table: `resources/liber-primus/base60-grid.json`
- P39 READ OUT selector: `im-results/lp2-p39-outer-readout-selector.md`
- P39 selector SFT: `sims/lp2_p39_outer_readout_selector_sft.cjs`
- P39 selector Windows PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44455229537
- Use the repository generic Node22 manual runner for future ordinary CommonJS SFTs; the experiment-specific workflows above are retained only for historical run provenance.
