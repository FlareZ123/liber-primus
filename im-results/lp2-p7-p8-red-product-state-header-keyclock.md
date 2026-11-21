# Original p7→p8 adjacent red-product state header: exact bridge and key-clock gate

**Agent7, 21 November 2026. Status: original-source arithmetic candidate, no authenticated unknown plaintext or cipher.** The state-header hypothesis is provisional; the bounded reversible GP29 key-clock receiver is **negative**.

## Adjacent source objects

The original physical p7 (archive 24.jpg) ends with five red printed words above five black dots. Under the published GP29 rune index mapping and literal printed word boundaries, their runes and products modulo29 are:

| Word | Source GP29 values | Product modulo29 |
|---|---|---:|
| 1 | 23,3 | 11 |
| 2 | 22,16,2,25 | 26 |
| 3 | 5,7,11 | 8 |
| 4 | 14,28 | 15 |
| 5 | 6,28,19 | 2 |

The first red word begins with **p=23** and immediately supplies **e=3**; the third starts with **g=5**. The sum of the five exact products is 62, so **q=62 mod29=4**; the third product gives **A=8**. These are the source-only operand choices already evaluated in the [p7 circulant state reconstruction](lp2-p7-red-circulant-dh-original-inverse.md). The semantic labels depend on the previously recognized DH tuple, while the printed rune arithmetic itself is exact.

Immediately on the next original physical page p8 (archive 25.jpg), the source has **two consecutive red heading words** (12 red runes total), whose complete original GP29 values are:

| P8 red word | Rune indices | Printed length | Product modulo29 | GP-prime sum |
|---|---|---:|---:|---:|
| first | 14,10,14,19 | **4** | **4** | **196** |
| second | 1,14,19,5,2,13,3,17 | **8** | **3** | **250** |

The products of these p8 words in printed order are **[4,3] = [q,e]**, calculated entirely from the preceding p7 inscription. An independent use of the **p7 printed field modulus p=23** gives the same two red words' rune-products **[3,9] modulo23**. All their runes are nonzero mod23, and **9=3² mod23**; their printed lengths **4|8** simultaneously double. Across the original unknown-page corpus there are **34** adjacent pairs of completely red printed words, and only **two** with a doubled second length: p7's first two red words **2|4** and p8's entire red heading **4|8**. P8 is the **only** adjacent red pair whose rune indices are all nonzero mod23 and whose second product equals the **square** of the first product modulo23. The two other pairs that match product-squaring contain the field element zero and are trivial zero-products. This offers an additional exact source-constrained **multiplicative-squaring checksum**, with the page's rooted-tree illustration as a potential visual cue, but an author rule converting the checksum into a cipher or key remains absent. A conventional source-length-four homogeneous GF23 and GF29 recurrence, fit on positions4–7 and checked without fitting on positions8–11, predicts **zero of four held-out symbols** correctly in either field; it does not yield the next eight-runic word from the first. The p8 printed lengths are **[4,8] = [q,A]**. Every one of the 12 red p8 rune indices lies in **1..22**, the 22 nonzero residues of the independently recovered p7 modulus p=23; this is the only such full red span among the 18 annotated red spans on original unknown LP2 pages. Separately, p8 has **255** GP29 runes, with **12 red**, giving **243 contiguous nonred runes = 3^5 = e^g**. The first p8 red word's GP-prime-word-sum is **196**, exactly the **196** runes on original physical p6. The original p8 drawing prominently shows a **tree with visible roots**. The same word's GP-prime sum is the perfect square **196=14²**, and **14** is exactly the GP index of both its **first and third printed runes** (X). Of **50** complete red words in p0–p55, only **three** have any perfect-square GP-prime sum (p8 first196=14², p15 offset13 sum16=4², p23 first100=10²), and **only p8** has the square root equal to its **first printed rune index**. This strengthens the case for a p8 original-source **root/14×14** selector but does not authenticate any decipherment operation; the tree is an interpretation and the exact test was discovered retrospectively. In the complete 50-word source-red census, only six red words have GP-prime sums matching any physical page's rune count and p8's first red word is the sole matching word within five physical pages of its sender. These are exact facts, but the prospective **prime-sum-as-page-size address** has not been established by an author instruction. The second p8 red word has GP-prime sum **250**. It contains **exactly one** O rune, GP index **e=3** from p7, with published prime weight **7**. Removing this exact source-indexed rune gives prime sum **250−7=243**, equal to the p8 nonred body length, and leaves product **1 modulo29** (the latter is an algebraic consequence of full-word product3 and the removed index3). Across the 50 complete original-red words, six contain index3, and **only p8's second red word** has this e-shed prime sum equal to its own page's nonred rune count. Thus both consecutive p8 red words have typed length relations to original receivers: **word1 sum196→p6 full196; word2 sum250 minus GPprime(e3)→p8 black243**. The removal rule was discovered after inspecting this packet; no first-party instruction explicitly orders removing the O at this position. Preserve it as a clue-dependent hypothesis, not plaintext or a known cipher.

A possible human-facing chain is therefore p7 red words→field register→p8 header products/lengths→243-rune p8 receiver. The strongest rival is ordinary page composition and opportunistic algebra: word products, word lengths and page lengths all offer numerous distinct ways to find coincidences, and the specific interpretation of 243 as a 5D ternary object was recognized after the source was inspected. The header does **not** by itself dictate a cipher equation, an initial state, where to reset, or which operation is reversible.

## Prime-sum back-reference into the preceding spiral-framed spread

Original p6 and p7 are visually paired by the **same large mirrored spiral marginalia**. Their complete printed GP29 rune streams contain **196 + 208 = 404** runes, in that source order. This makes their concatenation a definite, reader-visible predecessor from which a two-word p8 heading might address material. Use the ordinary one-based “numbers are the direction” convention and the preexisting GP-prime word sums above; no ciphertext value or fitted arithmetic parameter is used to choose the addresses:

| p8 red heading | GP-prime word sum | One-based predecessor-spread address | Original rune there |
|---|---:|---|---|
| first (length4) | **196** | last rune of physical p6, local rune196 | **S**, GP index **15** |
| second (length8) | **250** | p7 rune54, after p6's196 runes | **TH**, GP index **2** |

The two source-addressed GP indices are **[15,2]**, **exactly the last two original p7 red-word products [15,2]** from the five-product vector [11,26,8,15,2]. Thus a source-visible pair of red words on p8, using the historically natural prime-sum-as-ordinal operation, independently reproduces an ordered two-number fragment from the previous page's red inscription by extracting two **actual original ciphertext runes** from the distinct p6/p7 spiral spread. The first address lies exactly on the p6→p7 rune boundary; the second is in p7's black text.

The zero-based address convention produces **[8,7]** and does **not** reproduce the p7 products, so the exact match depends on one-based indexing. **Artwork-selector limitation:** a direct margin-mask comparison of the original JPEGs shows the matching spiral artwork occurs on **p4, p5, p6 and p7** (not uniquely on p6–7). The original p8 begins a different tree illustration. Choosing the last **two** spiral pages corresponds to the fact that p8 has **two** red heading words, but no signed instruction fixes that subwindow. Using the full prior spiral section **p4–p7** gives one-based rune-address readout **[17,20]**, and using **p5–p7** gives **[25,4]**; only the last two **p6–p7** yield **[15,2]**. This is a material selection cost and prevents presenting the p8 prior-spread match as an independent blind confirmatory result. That convention is plausible for human-directed word/rune ordinals but was selected upon discovering the result, and therefore cannot be called a blind confirmation. In a comparison with the other visually less similar p53→p54 red-word case, p54's first four red prime sums [79,222,114,118] read against the immediately preceding p52+p53 tape as [13,20,24,25], whereas the preceding p53 final two red-word products are [4,4]. The proposed two-word pointer is **not a generic universal red-heading decoder**. No new plaintext or body key follows automatically from the p8 equality.

An alternative, more constrained address-selection route is possible: the **first** red word's prime sum196 is the **unique full physical page rune count** of p6 among all 58 LP2 pages, and thus could select p6 as the beginning of a source tape. The **second** prime sum250 is greater than p6's196 runes and naturally continues into the following p7. Under that rule the one-based readout is [15,2] without independently choosing the last-two-page window. A page-wide scan found **four of 37** adjacent source-red word pairs whose first GP-prime sum matches some earlier physical page's rune count (p8→p6, p23→p9, p27→p3, p53→p14); **only p8→p6** targets a page within the two immediate predecessors. This is a coherent candidate clue-following algorithm but remains discovered after seeing p8's unusual sums and outputs. A human solver would need an author clue to treat a red prime sum as a page-*length* selector rather than an ordinal itself.

This gives a **stronger concrete interpretation** for p8's first red prime sum196 than merely matching p6's page length: it selects an exact p6 terminal rune that agrees numerically with a different p7 red value. It makes the p6/p7 spread a motivated input to a future source-defined operation, while leaving that operation and its independent receiver unknown.

## Bounded original black-body inverse: no source-native plaintext

To test one natural source-defined action without fitting a key, use the ordered p8 product pair as a GP29 key-clock seed and rate: either geometric **4×3^i mod29** or its literal operand swap **3×4^i mod29**, or additive progressions **4+3i** and **3+4i mod29**. Include the two direct prior-p7 generator controls **4×5^i** and **3×5^i mod29**. Each of the six deterministic keystreams is tested under both signs with the **exact historically verified p56 transparent-plaintext-F convention**: if P=0, C=0 and the key clock does not advance; a non-F plaintext consumes the next key value. When the ciphertext rune is F, both mathematically permissible explanations are exhaustively handled by dynamic programming.

All **12 original p8 receiver tests become algebraically impossible** before local black-body rune index69, even allowing every legal F-bypass decision. The first impossible local black-body offsets, in the printed schedule order and sign order − then +, are:

| Key schedule | − | + |
|---|---:|---:|
| 4×3^i | 17 | 39 |
| 3×4^i | 68 | 4 |
| 4+3i | 60 | 15 |
| 3+4i | 40 | 42 |
| 4×5^i | 1 | 15 |
| 3×5^i | 11 | 7 |

A source-native 243-rune positive plant composed of the independently clear original p57 rune stream is encoded under each exact stream and sign; all **12/12** pass the unchanged exact feasible-inverse test. The original failures therefore reflect the specific assumed cipher/receiver rather than a broken inverse or a missing F skip.

The companion [five-axis value-changing inverse gate](lp2-p7-p8-fiveaxis-ternary-difference-gate.md) separately excludes 30 GP29 triangular-difference and three-point interpolation candidates on this same p8 243-rune receiver. No published intact-page p8 plaintext exists in any of these branches.

## Original spiral-block framing and two-square direct inverses

The consecutive original p4–p7 JPEGs reuse the **same spiral margin artwork**, whereas p8 switches to a **rooted tree**. Within that four-page group, p6 has exactly **196=14²** complete runes, and p7's **first196** runes also form a 14×14 full block: its red tail begins at offset194, and the **first complete two-rune red word [23,3]** closes the block at offset196. The remaining p7 **12 red runes** are exactly the length of p8's first **12 red runes**; p8 then has 243 black runes. This is a precise block-boundary relation based on original word and ink boundaries, and a plausible clue toward an adjacent-page routing mechanism. The paired spiral artwork spans **four** pages, however, so it does not uniquely mandate the p6/p7 pair or 14×14 order.

A bounded original-cipher direct receiver was constructed by arranging **p6 complete196** and **p7 initial196** in 14×14 GF29 row-major matrices A and B. Both are invertible modulo29. The four obvious matrix quotient forms A⁻¹B, BA⁻¹, B⁻¹A and AB⁻¹, flattened row-major without extra key phases, yield mean native-GP trigram scores **-10.79574, -10.83615, -10.63239, -10.89904** respectively (clear-p57 **-7.55821**), with IoC **0.03349–0.03626**. Gaussian elimination/inversion on independent 14×14 source-native plants reconstructs exactly. A separate pairing of the two 14×14 arrays under the four conventional clockwise/counterclockwise inward/outward spiral traversals, 32 fixed GP29 pairwise sum/difference alignments, has best source-original score **-10.71792** and maximum IoC approximately **0.03632**. The natural direct difference between the two adjacent 12-rune red handoff blocks, in both orientations and signs, also yields no legible instruction. These failures exclude those **specified one-stage matrix, spiral and red-handoff operators**, leaving the source-visible framing as a hypothesis until an authentic operation is discovered.

## Separate source-length-matched p6/p7 key-donor control

The first p8 red prime sum196 equals the complete original p6 rune count. The p8 black receiver contains243 symbols, leaving **243−196=47** unfilled symbols; **47** is also the published GP prime weight of X (index14), the first and third runes of that p8 red word. A simple, lossless source-key donor would combine **all196 original p6 runes** with either the **first47** or **last47 original p7 runes**, in either source-natural concatenation order. Under ordinary GP29 additive masking with the authentic p56 plaintext-F bypass, all four frozen donor tapes and both signs fail on p8:

| Candidate key donor (243 GP29 symbols) | − sign first impossible offset | + sign first impossible offset |
|---|---:|---:|
| p6 full + p7 first47 | 16 | 2 |
| p6 full + p7 last47 | 16 | 2 |
| p7 last47 + p6 full | 28 | 18 |
| p7 first47 + p6 full | 38 | 14 |

All eight source-native p57 positive plants are feasible under the exact same decoder. These eliminate only the literal raw-page additive key tapes and bypass rule; they cannot exclude other ways that a true p6→p8 instruction might employ those original symbols. The 47 remainder match was noticed after 196 and243 were known and should not be treated as independent authorship evidence.

## Research decision

Preserve the **source arithmetic and the conditional prime-sum predecessor-spread pointer** as an unusually compact adjacent-page packet with independently fixed earlier operands. Treat its proposed **state-header function as a falsifiable hypothesis**, because no known 2014 author instruction selects product arithmetic over other natural GP word values or specifies how 243 black runes consume the state. Retire the 12 exact GP29 additive clocks above, the eight direct p6/p7 raw-page additive key donor transfers, and the already tested 30 tensor receivers. Do not multiply speculative exponents, key phases or traversal permutations around this packet until a clue selects one.

**Progress criterion for a successor:** an original-source instruction specifying a unique reversible state update, a key source with its clock, and a legible untouched p8 ciphertext window, supported by the existing p56/p57 native controls. A map to original p6 from prime sum196 must be tested prospectively, retaining printed word boundaries and avoiding claims based on modern community 17-page-offset JPEG numbering.

**Reproduction:** [single-file Node22 CommonJS SFT](../sims/lp2_p7_p8_red_product_keyclock_sft.cjs) loads only the canonical original-derived p6–p8/p57 corpus and ink, reconstructs the state/header from unaltered page runes, tests all 12 exact legal/infeasible paths, and confirms the 12 original-language plants. Related [p7 source circulant](lp2-p7-red-circulant-dh-original-inverse.md) and [p8 5D inverse gate](lp2-p7-p8-fiveaxis-ternary-difference-gate.md).
