# LP2 original chapter-opening words: a five-stop GP29 sum→product navigation to the numeric-table chapter

**Agent8 + Agent3 + Agent13, 28 November 2026. Classification: source-exact structural candidate. The first-black + SUM selector has a chronological p23 holdout; PRODUCT now has a common independent original-artifact cue from exact frame-start spacing, while the route itself remains a provisional navigation grammar. No authenticated plaintext, cipher inverse or key is recovered here.**

## Explicit, reversible-to-a-human page-selection proposal

The original manuscript has **nine** physical red chapter beginnings, on unknown LP2 pages **0, 3, 8, 15, 23, 27, 33, 40, 54** (previous original-image chapter map). Read **only the first complete black word immediately following the contiguous opening red rubric** of each page. Treat each native Gematria Primus rune as its integer position `0..28`. For that **physically selected word** calculate two simple GP29 values:

```text
IN(page)  = [sum of all its original rune indices] mod 29
OUT(page) = [product of all its original rune indices] mod 29

Starting with physical p0, follow the unique other chapter page whose
IN equals the current page's OUT. Stop when no chapter has that IN.
```

This is an **unambiguous, exactly executable original-source graph rule** after the operations are stipulated; it does **not** require reading any guessed plaintext or selecting a secret key. It is **not**, however, a first-party authored instruction: the source says neither `sum→product` nor `first black word`, and these were selected after inspecting the corpus. Cicada's already-solved LP1 use of GP29 values and p57's *words/numbers/direction* clue make a numerical page itinerary plausible but do not determine this particular two-operator grammar.

| Chapter opening | First black word rune count | IN: sum mod29 | OUT: product mod29 | Unique next chapter |
| --- | ---: | ---: | ---: | --- |
| **p0** | 4 | **15** | **23** | **p8** |
| p3 | 4 | 9 | 11 | none |
| **p8** | 3 | **23** | **2** | **p27** |
| p15 | 4 | 22 | 13 | none |
| p23 | 8 | 25 | 16 | none |
| **p27** | 7 | **2** | **19** | **p54** |
| p33 | 2 | 5 | 3 | none |
| **p40** | 5 | **27** | **3** | **stop** |
| **p54** | 8 | **19** | **27** | **p40** |

The **unique** path beginning at the original page0 is

```text
p0 --23--> p8 --2--> p27 --19--> p54 --27--> p40 [stop at OUT=3]
```

These are links by integer values, **not consecutive physical page numbers**. This terminates at **p40**, whose chapter extends through p53 and contains the original **256-cell numerical table on physical p50**. This is a substantive way that original words could function as a literal *map* and *numeric direction*. The route does **not yet tell a player what to do with the p50 table**, how to recover any plaintext, whether to look up p40's OUT=3 elsewhere, or whether the source meant a different control scheme. Five chapter openings are not used by the p0 path, and four of the nine headings have no outgoing match; there is no requirement that every chapter participate.

**Source-typing details:** p15 has two *adjacent* red heading spans at local0–8 and local9–19; those are treated as **one contiguous 20-rune opening**, and the first following black word is local20 onward. Other intra-chapter red spans on p3, p6, p33 and p39 are excluded because the receiver class is fixed to the **nine chapter openings**, not all 16 red spans. The physical p50 has **zero runes**; source transcript segments shift by one after p50 and must not be mislabelled. The literal ruby-and-black boundary is visible in the original JPEGs; source GP indices, red annotations and exact printed group boundaries are pinned in the reproducer. The p6→p27 red-singleton M locator and repeated seven-rune GP0 sum2 provide **another, distinct and retrospective** source route to the same p27 ([separate image-first packet](lp2-p6-p27-original-red-rubric-link.md)). It does not establish the sum/product rule.

## How distinguishable is this route from source-internal coincidences?

The graph rule was noticed **after searching original relationships**; all numbers below are **conditional null diagnostics, not discovery-adjusted p-values or evidence of author intent**. Three deliberately distinct adversarial controls are now available:

**Finite operator-vocabulary challenge.** Fix these nine conventional human-plausible word functions before the *evaluation*: rune count; sum, product; prime-index sum and product; first rune, last rune, first+last and first×last (all numeric values modulo29 except count). Charge **all 72 ordered pairs of distinct input/output operations** on the **same nine real first post-heading words**. Exactly **two** operator pairs make any original five-chapter simple path: the reported **rune-sum IN / rune-product OUT** path starting at book p0, and its **exact reverse**, rune-product IN / rune-sum OUT, which walks **p40→p54→p27→p8→p0** instead. These are **not two independent coincidences**: transposing the IN and OUT functions necessarily reverses every directed equality edge in the same graph. The book's opening p0 is the explicit starting point that distinguishes the reported orientation; the original page does not itself provide a separate printed arrow. Thus the reported `sum→product` is the **only** member of that nine-function fixed original-word vocabulary that builds *any* five-page path from book opener p0 or reaches the numeric chapter p40 from it. This comparison constrains the obvious alternatives but is **not an author-selection test**: choosing these nine plausible operators after seeing the chain and allowing other encodings/fields means the complete exploratory search space is not enumerated.

The two independent and precisely reproducible numeric source controls are:

1. **Exact 362,880-way permutation of the observed nine products.** Keep the actual nine chapter IN values and the exact multiset of nine OUT values (including duplicated product3) fixed, but permute which page holds which OUT. A simple path containing five or more chapters occurs anywhere in **14,400/362,880 = 3.9683%**; starting specifically at book opener **p0**, **2,880/362,880 = 0.7937%**; one starting at p0 and reaching the unique p40 numeric-table chapter at depth at least five, **720/362,880 = 0.1984%**. There is **no** six-chapter simple path in this constrained exact null.
2. **Original-image chapter-page and word-length-matched control.** For each of the nine pages, replace only the first post-red heading word with **a genuine all-black word of the same rune length on that same original page**. This keeps page-specific rune morphology and required word sizes but breaks the special *immediately after rubric* location. In **100,000** independently seeded runs (`xorshift32 0xAE74172B`), a five-chapter path occurs anywhere in **1,009** cases (1.009%); from p0 in **170** cases (0.170%); and from p0 reaching p40 at depth at least five in **35** cases (0.035%). Ties in the randomly sampled IN values are not arbitrarily broken: the control admits *all* matching directed edges, making it more permissive than the original uniqueness constraint.

**Exact integrated-state specificity charge (post-discovery).** After the route was composed with the pre-existing p50/p28/p29 state system, its five OUT labels became a much stricter frozen packet: p0,p8,p27,p54,p40 carry `[23,2,19,27,3] = [p,K,B,-K,e]`. The first three labels are direct values from the historical DH23 worked exchange; `-K=27 mod29` and `e=b^-1 mod22=3` are **derived operands already present in the repository's 19 November p28/p29 route**, not standard DH fields. Reusing the exact 9! fixed-marginal product permutation above, only **48/362,880 = 0.0132275% = 1/7,560** labelled assignments place that complete five-value packet on those five page slots. This is stronger than merely reaching p40, but the DH interpretation was known when the chain was recognized, so it is a **conditional specificity diagnostic, not a discovery-adjusted probability of authorship**.

The same integrated state packet also charges the typographic operand choice without inventing synthetic words. On each of the five route pages, enumerate every genuine all-black word having the **same rune length on the same original page** as the first post-rubric word. Pool sizes in route order p0,p8,p27,p54,p40 are `[11,10,5,5,8]`. For every page, exactly **one** pool member has the route's complete `(IN,OUT)` pair—respectively `(15,23),(23,2),(2,19),(19,27),(27,3)`—and in all five cases that unique member is the first post-rubric word itself. Thus independent uniform replacement within those source-matched pools reproduces all five exact pairs with charge **1/(11×10×5×5×8) = 1/22,000**. This does not authenticate `first black word`: the route pages, pair values and comparison were fixed only after the integrated pattern was visible. It does show that the five state-linked pairs are not generic consequences of same-page word length.
**Solved-heading holdout (an unsearched independent page-class check).** The original book includes two further **already-decrypted** red-headed physical pages, p56 `AN END` and p57 `PARABLE`. Add them as candidate destinations and apply **the identical frozen first-black-whole-word rule**. Their words are `MYLOH` (p56, five GP runes, IN sum18/OUT product16) and `LICE` (p57, four GP runes, IN sum24/OUT product20). Neither receives or emits an edge to the original nine-chapter graph: the p0→p8→p27→p54→p40 route, its unique recipient at each hop and its terminal stop all **survive** adding the solved pages. Retesting the **same 72 fixed word-operator pairs** across all eleven headings still finds **only one** five-chapter route beginning at p0: sum→product. The solved pages were known to exist before this analysis but this explicit extension was tested only **after** the route was discovered, so it is a bounded scope/robustness control rather than a prospective prediction of authorship. It prevents silently excluding the solved pages simply because their inclusion might spoil the itinerary.

The second control's per-page candidate pool counts are `[11,6,10,7,2,5,13,8,5]` in the chapter order above. Results are fully deterministic for the recorded seed. Overlapping words, source-conditioned punctuation, nonuniform GP rune frequencies, the ability to try alternate checksum operations and the post hoc recognition of p40 as a destination mean the small conditional counts **cannot be interpreted as the probability that a real author intentionally encoded this route**. The exact fixed-marginal permutation gives a different null and deliberately prevents hiding the selection issue behind one deceptively small rate.

## Independent PRODUCT source gate (#3445)

The p23 chronological holdout distinguishes two questions that were previously bundled together. The **first adjacent black word** and its **rune-index SUM** have an independent causal check: the p23 first-black SUM is 25, matching the already-established `THE ONE RISE -> +2 -> p25` destination fixed before this chapter grammar existed. PRODUCT has no corresponding pre-existing prediction.

Hold `IN = rune SUM mod29` fixed and charge only the already-declared nine-function word vocabulary as candidate OUT statistics. The longest simple path from book opener p0 is:

```text
OUT statistic       longest p0 path
length              1
rune PRODUCT         5   p0 -> p8 -> p27 -> p54 -> p40
prime SUM            1
prime PRODUCT        1
first rune           3   p0 -> p27 -> p3
last rune            2   p0 -> p23
first+last           2   p0 -> p40
first*last           1
```

So, **conditional on the independently strengthened SUM input**, PRODUCT is the sole natural statistic in that frozen family that recreates the five-page route. This is useful discrimination, but still retrospective route scoring.

A second, source-only charge asks whether each black descriptor field directly copies a raw visible primitive of its opening red rubric. The predeclared primitive set is: total red-rune length, first rune, last rune, center rune when defined, and each printed red-word length. No derived arithmetic is allowed in this test. On the consecutive route-tail pages p27, p54 and p40:

```text
field       p27       p54       p40       direct primitive matches
LENGTH      no        yes       yes       2/3
SUM         no        yes       no        1/3
PRODUCT     yes       yes       yes       3/3
first rune  no        yes       no        1/3
last rune   no        yes       yes       2/3
```

The PRODUCT matches are exact but **page-specific**:

```text
p27 PRODUCT 19 = red total length 19 = red first rune 19
p54 PRODUCT 27 = red center rune 27
p40 PRODUCT  3 = first red-word length 3
```

Across all nine chapter openings, PRODUCT directly matches at least one such primitive on 5/9 pages; LENGTH does so on 4/9, SUM on 2/9, first rune on 1/9 and last rune on 2/9.

That #3445 conclusion has now changed because a genuinely common source-side cue was found in a different original-artifact register. A decoded-pixel census of all 75 original JPEGs fixes the six non-singleton LP2 outer-frame starts at `p1,p4,p15,p27,p40,p56`, with forward spacings `[3,11,12,13,16]`. No chapter value was used to choose those boundaries.

Take the union of the independently supported chapter `IN=SUM` values with those exact frame spacings. Within the **same frozen #3445 OUT family**, rune PRODUCT is the **only** statistic whose entire distinct nine-chapter output vocabulary is covered: PRODUCT is **8/8**, versus length 3/6, prime SUM 3/7, prime PRODUCT 3/8, first 5/8, last 4/8, first+last 4/8 and first×last 2/8.

The order relation is stronger. The five PRODUCT-dead-end chapter operands in printed chapter order are `p3,p15,p23,p33,p40`, with outputs

```text
[11,13,16,3,3].
```

Start the six non-singleton frame boundaries cyclically at p4, the first one immediately after p3. Their exact 58-page cyclic start spacings are

```text
[11,12,13,16,3,3].
```

Deleting the single independently established state value `12=u=aK` yields **exactly** the five PRODUCT-dead-end outputs in chapter order. Charge every other member of the frozen OUT family with the identical rule—any cyclic rotation of the six frame gaps, delete exactly one value, require equality to that statistic on the same five dead-end chapters—and **only rune PRODUCT has any match**; its match is unique at rotation0/delete12.

This supplies the **common source cue #3445 was missing**. It does not prove that SUM→PRODUCT is an authored navigation program, and the visual tape does not say what action to take when an OUT value is represented by a frame spacing. Therefore do not reinterpret a dead-end PRODUCT as a physical-page pointer or revive the rejected `OUT=3→p3` fallback.

**Decision:** upgrade PRODUCT from “best retrospective OUT statistic” to a **source-supported OUT/state statistic**. The exact p0→p8→p27→p54→p40 itinerary is correspondingly stronger as a human-solve-path candidate, while its navigation semantics and downstream payload consumer remain unproven. PRODUCT-dependent p3/Vieta work remains conditional on the separate, still-negative p3 pointer bridge.

Reproducers: `sims/lp2_chapter_product_independent_gate_sft.cjs` for the original #3445 family and `sims/lp2_frame_gap_chapter_product_gate_sft.cjs` for the independent visual-frame register and ordered charge. [Full frame-spacing gate](lp2-frame-gap-chapter-product-gate.md).

## P40 is a mirrored-section switch, not a p40-only STOP marker

The original-scan geometry supplies an important terminal discriminator independent of the rejected p3 field route. A pixel-exact census of all 75 original JPEGs finds that the fixed outer crops

```text
left  x=0..379,    y=600..2999
right x=2020..2399,y=600..2999
```

from archive `57.jpg` are reproduced **exactly** on archive images **57 through 72 and nowhere else**. Since LP2 p0 is archive17, this is exactly **LP2 p40 through p55**, the manuscript's final 16 unsolved pages. The frame ends exactly before solved p56–p57 (archive73–74), which form a different shared outer-frame run. The preceding exact long frame run is p27–p39 (13 pages), so p27 and p40 are successive route nodes that begin the two longest late-unsolved frame runs. The 16 p40–p55 center-body crop hashes are all distinct, so the equality is the reused mirrored foliage frame rather than duplicated page images.

This changes the p40 dead-end interpretation. The border cannot mean “STOP at p40”: p54 is a live predecessor in the route and carries the same exact frame, as do the p49–p51 numeric-panel pages. Instead, p40 is the **first page of a source-visible mirror-framed section**, and the p50 panel is embedded inside that section. Reflection is therefore present as a section-level operation cue before the p50 sink/mirror circuit is consulted.

The local operand grammar independently sharpens the switch. P40's visible red word lengths are `[3,5]=[e,g]`; its adjacent black descriptor is `[5,27,3]=[g,-K,e]`. After `IN=27` is consumed by the incoming p54 hop, the remaining endpoints `[length,OUT]=[5,3]=[g,e]` **exactly reverse the visible red pair `[e,g]`** at the first page of the mirror-framed section. They are simultaneously in physical row/column order for p50's independently fixed ROAD row5 / MAP column3. Their intersection is cell43, whose base59 successor is72, the exact midpoint of the pre-existing mirror186→sink189 return path; cell43 itself is exactly five pointer edges from sink189, equal to `g=5`, and successor72 is four edges away, equal to `q=4`.

Thus #3435's strongest visual alternative is resolved as **operation switch rather than terminal STOP**:

```text
chapter route arrives at p40
  -> exact mirrored border begins and persists through p55
  -> terminal local [length,OUT]=[g,e]
  -> p50 ROAD(g) x MAP(e) = cell43
  -> base59: 43 -> 72 -> 161 -> 214 -> 247 -> 189
                     4 edges = q          sink
       5 total edges from43 = g
```

The switch remains post-discovery synthesis, not authenticated plaintext recovery, but it is source-visible and stays inside the reached chapter; it does not invent a physical-page fallback. Reproducer: `sims/lp2_p40_mirrored_section_artwork_sft.cjs` for the 75-scan border census and `sims/lp2_chapter_terminal_p50_midpoint_bridge_sft.cjs` for the typed p50 consequence.

## Exact composition with the already-established p50 mirror/sink DH readout

The five-stop route is unusually compatible with a second, **previously independently documented** original object. The p40 chapter contains the physical p49–p51 32×8 panel. Once a player reaches it, the original p50 source has a separate source-motivated (but still unauthenticated as payload decryption) operation: the lowercase `f` digit is never printed; remove it from the base60 alphabet to form radix59, interpret each of the 256 cell values as its next address, and follow the resulting fixed pointer to universal sink **189**. Its source row/column `(23,5)`, original eight-column width, reflected tree artwork and original mirrored cell186 `0J=19` give DH `p=23,g=5,A=8,K=2,B=19`, with computed `a=6,b=15,e=3` and the independently observed eight-pointer return path from186 to189. These facts predate the new chapter route; [the prior standalone p50 source circuit](lp2-p50-base59-pointer-sink-reflection.md) remains the correct primary evidence.

A direct terminal handoff now avoids the rejected `OUT=3→physical p3` type switch. The terminal p40 first-black word has complete descriptor

```text
[length, IN=sum, OUT=product] = [5,27,3] = [g,-K,e].
```

Its `IN=27` has already been consumed to enter p40, leaving the typed pair `[length,OUT]=[5,3]`. Independently, the p50 strict prime-support geometry already fixes exactly one horizontal support, **ROAD row5**, and three vertical supports including **MAP column3**. Thus the terminal pair selects the physical MAP/ROAD intersection **cell43** without reinterpreting 3 as a page number. Charging the same `[length,OUT]` grammar across all nine chapter operands leaves p40 as the **only** word whose first coordinate is the strict support row and whose second coordinate is one strict support column.

The selected original token is `1D`. Its hexadecimal pun is unnecessary. Under the already-live missing-`f` base59 pointer codec, `1D=72`; node72 is exactly the midpoint of the pre-existing horizontally reflected return path

```text
186 -> 19 -> 33 -> 112 -> 72 -> 161 -> 214 -> 247 -> 189.
```

That path has eight edges and 72 is four edges from either endpoint. The full strict ROAD/support crossing charge is discriminating: cell42 `0S→28` and cell46 `3J→196` do not enter this mirror path, while cell43 alone maps to midpoint72. Globally 72 has four p50 predecessors, so the evidence comes from the independently selected line intersection rather than token rarity. The base60 reading `1D=73` does not enter midpoint72 or sink189 and instead enters a cycle in the fixed table graph.

### Cell43 `1D` does not itself authenticate base59

A new local count charge separates the **address** evidence from the **radix** evidence. The intact punctuation-delimited prose immediately around the table is independently fixed at 138 runes / 33 words before and 170 runes / 40 words after, with the pretable sentence contributing 72 runes on p48 and 66 on p49.

The selected token has three exact conventional readings:

```text
hex(1D)    = 29 = GP alphabet size
base59(1D) = 72 = p48 rune contribution to the intact pretable sentence
base60(1D) = 73 = 33+40 complete words in the two intact flanking sentences
```

The base60 `73` equality is a fresh source-local connection to the flanking-sentence problem, but it prevents using `1D→72` as an independent radix proof: each obvious reading lands on a nearby manuscript quantity. The existing base59 midpoint/sink circuit remains a **codec-specific downstream consequence** once base59 is assumed; the printed token alone does not choose that assumption. [Three-radix stalemate](lp2-p40-cell43-1d-local-radix-stalemate.md) · [reproducer](../sims/lp2_p40_cell43_1d_local_radix_stalemate_sft.cjs).

### The dual-radix edge uniquely reproduces the authenticated DIRECTION/SEEK boundary

The radix stalemate has a stronger use that does **not** require choosing one codec. Treat the selected p50 cell as the source of a natural pointer-table displacement `value-cell`. At cell43:

```text
base59: 72-43 = 29
base60: 73-43 = 30.
```

The p6/authenticated-source corridor independently fixes zero-based source word29 as **DIRECTION** and word30 as **SEEK**, the first word of the 13-word `SEEK ... OPENPGP` tail. Charging every p50 cell readable under both radices finds exactly **one** ordered forward-displacement pair `[29,30]`: cell43/`1D` itself.

Under the authenticated DIRECTION modulus29 this boundary pair becomes `[0,1]=[F,1]`, the two scalar constants used by the p6 grid program; the residue pair alone has one table rival (cell225), so the evidence is the literal `[29,30]` uniqueness rather than `[F,1]` by itself.

This supplies a new cross-artifact loop from the final-section switch back to the first-party source corridor, but it remains post-discovery mechanism evidence. It does not choose base59 versus base60 or specify a new plaintext receiver. [Dual-radix boundary report](lp2-p40-cell43-dual-radix-source-boundary.md).
The most literal text consumer of the `72/73` endpoint/count reading is now prospectively negative. Before opening any flanking-word length, Agent44 froze zero-based cell43 as zero-based word43 in the 73-word pre+post corpus and preserved p40's typed row field by requiring that receiver word to have length `g=5`. The selected posttable word has **8** runes, so the direct consumer fails exactly; no one-based/reversed/reset/nearby-word rescue is allowed. The `[29,30]=DIRECTION/SEEK` table/source convergence is independent of this failed text receiver. [Frozen holdout](lp2-p40-cell43-flanking-word43-pretarget.md).
This is still post-discovery synthesis: the chapter grammar, support-line labels and mirror return path were all already visible when the connection was noticed. But it materially repairs the route's terminal handoff while preserving source type: **reach p40 → use the terminal word's remaining [length,OUT] pair → MAP/ROAD cell43 → base59 midpoint of the existing mirror/sink circuit**. No p3 fallback and no hexadecimal interpretation are required. Reproducer: `sims/lp2_chapter_terminal_p50_midpoint_bridge_sft.cjs`.

The **new integrated readout** of the nine original first-black words and the old p50 circuit produces the following proposed player sequence without viewing a single hypothetical LP2 plaintext word:

```text
p0 IN=15(b)  --23(p)--> p8 IN=23(p)
p8          -- 2(K)--> p27 IN= 2(K), red title length=19(B),
                               red title sum=305 mod29=15(b),
                               following black word OUT=19(B)
p27         --19(B)--> p54 IN=19(B)
p54         --27(-K mod29)--> p40 IN=27(-K mod29)
p40         --3(e)--> no new chapter; numeric panel lies in this chapter
                     terminal [length,OUT]=[5,3]=[g,e]
                                      |
                              ROAD row5 × MAP col3
                                      |
                                 cell43 = 1D
                                      |
                              base59 1D -> 72
                                      |
                  midpoint of mirror186 -> sink189 return path
                                      |
                    72 -> 161 -> 214 -> 247 -> 189
                                      |
                          sink (p,g)=(23,5), width A=8
                                      |
                         mirror (23,5) -> (23,2) = K
                                      |
                          cell186 original 0J = B=19
                                      |
                         discrete logs => a=6,b=15,e=3
```

The chapter **path outputs** `[23,2,19,27,3]` therefore coincide with the pre-existing state sequence `[p,K,B,-K,e]`, with `p0 IN=15=b`, and the special p27 red/black rubric supplies a separate `(B,b,K)` numeric panel. Evidence classes must stay separate: `p,K,B` are historical DH values; `-K` and `e` are independently pre-existing derived operands from the earlier p28/p29 constructions, not fields of the DH protocol itself. This is a **new cross-artifact synthesis** but is strongly *postselected*: the DH field names were known before this chain was noticed, `27` admits multiple interpretations, and the original author did not write `SUM→PRODUCT` or `pointer-to-next-cell` explicitly. It establishes neither a ciphertext inverse nor any previously unknown plaintext. Its best use is to define a human-executable *candidate* route **to known DH state** and a precise **missing last dependency**: a first-party source-selected GP29 payload consumer/serializer after the p50 mirror/sink circuit.

[Single deterministic integrated source-code SFT](../sims/lp2_chapter_map_p50_dh_integrated_sft.cjs) asserts the whole original p0→p40 itinerary, numeric panel's membership in the p40–53 chapter, all 256 radix59 pointers to sink189, mirror186, exact DH state, 8-edge return route and original p27 rubric readouts. This is a composite assertion, not an independent statistical control or a new decryption.

## Historical arithmetic register check: exact precedent does not reproduce the route

A source-history check distinguishes the broad arithmetic motif from the actual numeric register used by this candidate. The public `neuroretransmit/cicada` archive preserves a reconstructed 2013 first-onion TCP server and explicitly labels that program a recreation from publicly known behavior, not recovered Cicada source. In that reconstruction, `count <phrase>` sums the standard Gematria Primus **prime weights** (the first 29 primes assigned in rune order); period reports such as `count the instar emergence -> 761+` agree with that behavior. The same archive also preserves a 2012 phone-audio object whose community transcript instructs solvers to multiply three discovered primes. These are useful historical-operation priors, with the archive qualification above; they are not first-party instructions to apply those operations to LP2 chapter words.

The route's already-frozen nine-operation census contains the direct GP-prime analogues `prime_sum` and `prime_product` alongside zero-based `rune_sum` and `rune_product`. Across all 72 ordered distinct operator pairs on the same nine original chapter operands, only **two** pairs produce any simple path of at least five chapters; only **one** produces a p0 path of that depth; and it is exactly `rune_sum -> rune_product`. No prime-weight pair produces the p0 route. Because the graph values must address the 0..28 residue register, the prime-weight controls are reduced modulo29; the historical `count` service itself returned the unreduced integer, so a literal transfer is even less compatible with this chapter-address graph.

**Decision:** historical Cicada material supports sums and products as operations in the creators' general toolbox, but it does **not** source-select this route's GP0 index register or its sum-to-product direction. Preserve the route as a specific structural candidate and its post-discovery state matches as conditional evidence; do not cite the 2012/2013 arithmetic precedents as authentication of the chapter rule.

Archive qualification and pinned public-mirror objects: `resources/external/2012-2013-arithmetic-operation-register-note.md`.
## Chronological p40 cross-holdout: the route names both p6-rejected residues

A new cross-analysis check has asymmetric discovery order. The p6 all-block receiver checksum was committed at `59f78d11810630de64cee1924478f5fe33c0b9f2` on **2026-11-28 10:00:11Z**, before this chapter route's first commit `4d25c98a774f5da4561fc11b9895efea80ce1303` at **10:04:11Z**. The earlier p6 analysis fixed a p40 residue/arity candidate set with GP0 values `{3,25,27}` at starts `{13,71,216}` and independently selected start71 / GP0=25 from its four-block checksum.

The later chapter route terminates on p40's first post-rubric black word `APXYH = [24,13,14,26,8]`, whose frozen `(IN,OUT)` is `(27,3)`. Thus its two terminal values are **exactly the two p6 receiver residues rejected before the route existed**, leaving the p6-selected residue25 as the complement.

This is not a loose same-length coincidence. P40 contains **53 genuine black words** after the red opener. Recompute GP0 sum and product for every one: exactly **one** has unordered pair `{3,27}`, and it is the first post-rubric word at start8. There are eight length-5 black words, so it is also unique inside the route's earlier same-length control pool. Conditional on a target unordered pair of distinct GP29 residues fixed in advance, the full residue-pair space is `C(29,2)=406`; the observed complement is one member. These figures are conditional diagnostics only—do not multiply them into an authorship probability.

**Consequence:** this is the route's strongest chronological cross-holdout so far. It independently couples the terminal chapter selector to a p6 p40 receiver decision that predates the navigation hypothesis. It still does not provide the missing ordered rune-key serializer or recover unknown plaintext, so promotion to a decipherment mechanism remains gated on a source-selected receiver operation.

Reproducer: `sims/lp2_p40_route_rejected_residue_crossholdout_sft.cjs`.
## Fixed H-route tape on p40 is a calibrated additive negative

The strengthened p15 result makes the repository's outside-in H transform a more serious cross-page operation, so test the cheapest reversible consumer without opening a family. The route itself fixes the six linked state values

`[b,p,K,B,-K,e] = [15,23,2,19,27,3]`.

Apply the already canonical outside-in H split once to this six-vector. It gives the fixed tape

`[12,25,12,21,21,18] = [aK,-q,aK,-A,-A,B-1]`.

Because the route lands on p40, freeze the same ordinary solved-p56-style additive inverse used in the other bounded receiver gates: subtract this six-rune tape cyclically from the **3,008 original runes on p40–53**, zero phase, no resets, no sign choice, no F exception. The implementation round-trips a clear-p57 arithmetic control exactly.

Original p40–53 bigram score is `-1.5919034279` nats/rune; the decoded tape scores **`-1.5951001646`**, with IoC **0.0345928207**. Against 1,000 deterministic random period-6 GP29 keys on the identical chapter, the frozen tape ranks **134/1001** (random median `-1.5506516920`; higher is better). The output is nonprose.

**Decision:** retire exactly `H([b,p,K,B,-K,e])` as a cyclic additive key on route-selected p40–53. Do not retune sign, phase, reset or destination. This does not reject H as a structural operation—the p15 visual result and p6 corridor still motivate H—but it closes this direct short-key consumer.

Reproducer: `sims/lp2_chapter_route_h6_p40_additive_sft.cjs`.
## P7 inverse row addresses chapter spans and reproduces a p15 packet

An independent p7/p15 cross-holdout now gives the chapter graph a typed upstream consumer. P7's older printed-order red-product circulant inverse row is `[23,2,5,2,19]=[p,K,g,K,B]`; p15 now derives those state fields from original LP2 alone. Each number is also a unique chapter-IN label, so the row addresses `[p8,p27,p33,p27,p54]`. Their physical chapter lengths are `[7,6,7,6,2]`, and canonical outside-in H5 gives

`[5,0,7,12,9] = [g,F,K+g,aK,q+g]`,

exactly the packet independently fixed by p15 lower red11. The same itinerary's first post-rubric word lengths are `[3,7,2,7,8]`; H5 gives `[24,0,2,14,11]=[-g,F,K,-b,A^-1]`, a second independently fixed state row. Only original p7 printed order among the 10 cyclic/reversal orientations passes **both** rows on the actual chapter map. Preserving the nine observed IN labels and permuting whole observed `(chapter span, first-black length)` records among them gives **240/362,880 = 1/1,512** span-row passes and **120/362,880 = 1/3,024** joint passes.

This materially strengthens the chapter-IN register as a typed address layer and supplies a concrete `p7 inverse row -> chapter addresses -> chapter spans -> H5 packet` path. It remains post-discovery evidence and does not by itself authenticate the p7 circulant opcode or recover body plaintext. Full integrated reproducer: `sims/lp2_p15_to_p7_circulant_crossholdout_sft.cjs`.
## Chronological causal holdout: p23 ONE RISE independently predicts this grammar's SUM

P23 supplies a human-readable test of the chapter operand grammar that predates the grammar itself. Commit `2586e187a1b24197e1123576fb7b364ea71ad8c5` fixed **THE ONE RISE → one existing +2 RISE → physical p25** on 19 November 2026. The chapter SUM→PRODUCT route did not first appear until `4d25c98a774f5da4561fc11b9895efea80ce1303` on 28 November.

On original p23 the contiguous red instruction ends at rune offset16. The **immediately following complete black word**, selected by the later chapter grammar with no reference to the older destination, is the eight-rune vector `[28,6,15,25,13,7,19,28]`. Its raw GP0-index sum is141, hence `141 mod29 = 25`, exactly the independently fixed ONE RISE destination **p25**. The same word has product16, so its chapter fields remain `(IN,OUT)=(25,16)`.

This is specifically an adjacency/first-word result. P23 has42 black words; three have sum25 somewhere on the page. Only two black words have length8, and **only the immediate first one** has sum25. The independently developed four-word-red-span bridge also describes this same word as `(length,sum,product)=(8,25,16)=[A,-q,AK]`.

The control matters: the other repeated RISE pages do not obey a generic “first black SUM = page+2” rule (p33 gives5 rather than35 mod29=6; p40 gives27 rather than42 mod29=13). The evidence is tied to p23's explicit **THE ONE RISE** instruction.

**Consequence:** this directly supports two previously retrospective choices in the chapter hypothesis—take the **first complete black word after the red rubric**, and read its **GP0 SUM** as an address/state field. It does **not** independently select PRODUCT, prove every chapter uses the same semantics, or recover unknown plaintext.

Reproducer: `sims/lp2_p23_one_rise_firstblack_sum25_crossholdout_sft.cjs`.

## Independent red→black boundary authentication on the route tail

A source-exact audit of all 13 original red spans that are immediately followed by a complete black word now gives three different, individually unique boundary grammars on consecutive route-tail pages:

```text
p27: black [7,2,19] = [g+K,K,B]
     black length = first+last red-word lengths = 3+4
     black PRODUCT = red length = red first rune = 19

p54: black [8,19,27] = [A,B,-K]
     black descriptor = [red PRODUCT, red last rune, red center rune]

p40: red word lengths [3,5] = [e,g]
     black [5,27,3] = [second length, first-second, first]
```

Each exact predicate has one hit in the full 13-span eligible family: its stated page. P8 already had an independent full red-H/DH state reconstruction with a manuscript-unique adjacent `[e,p,K]=[3,23,2]` operand. Thus four of the five route nodes now have local manuscript structure typing the exact adjacent black word and its elementary fields. P0 remains weaker: its red first rune `b=15` equals black SUM15, but no complete boundary grammar was found.

This does not make the page-specific red relations a universal decoder. It materially strengthens the route's **first-black selection and PRODUCT/SUM operand usage**, leaving p0's start grammar and terminal3→physical-p3 as the main remaining weak assumptions. Full finite charge: [route-tail red→black boundary grammars](lp2-chapter-route-red-black-boundary-grammars.md), reproduced by `sims/lp2_chapter_route_red_black_boundary_sft.cjs`.

## Conditional p3-field q-translation reaches the independently marked p33:91 rubric

**Terminal-pointer audit (Agent13, #3421): the chapter route does not source-select physical p3.** Its established address type is OUT→matching chapter-IN: the four live hops are `23→p8, 2→p27, 19→p54, 27→p40`; uniform physical-page addressing matches none of them, even though 23 and 27 are themselves valid chapter page numbers. At `p40 OUT=3`, natural continuations remain non-identifiable: stop, physical p3, zero-based chapter ordinal p15, one-based chapter ordinal p8, state value `e`, or word index3. All three page-valued destinations are red-marked chapter pages. A rule “use IN matching, then fall back to physical page only on failure” is an extra unsignaled opcode; five of nine chapter nodes are dead ends with valid physical-page-valued outputs, and both p33 and p40 have OUT3. Therefore **the established route stops at p40**. The field/Vieta/q-translation results below remain exact only conditional on adding that extra physical-page fallback. Reproducer: `sims/lp2_chapter_terminal3_pointer_semantics_sft.cjs`.

A field-level continuation had materially narrowed the earlier PRODUCT caveat **under that conditional fallback**. The five actual route operands have complete `(length,sum,product)` descriptors `[4,15,23],[3,23,2],[7,2,19],[8,19,27],[5,27,3]`; each triple occurs exactly once among all 2,941 canonical printed groups in the full transcription including solved p56/p57.

If the unlicensed physical-page fallback is assumed, terminal p40 OUT=`3=e` lands on physical p3, which independently carries the marked red triad `[13,23,2]`, already established as the primitive GF(29^2) relation `u^2=3u+8`. Treat route `(SUM,PRODUCT)=(S,P)` as Vieta coefficients of `x^2-Sx+P` in that field. P54 `(19,27)` and p40 `(27,3)` have the same discriminant21, and the p40 roots are exactly the p54 roots translated by `q=4`: `x -> x+q`. A complete nine-chapter charge shows this is the **only equal-discriminant chapter pair**: exhausting all ordered chapter pairs and all 29 pure translations yields only p54→p40 by `+q` and its reverse p40→p54 by `-q`. Repeating `+q` gives the marked p33:91 receiver; repeating `-q` gives `(11,25)` and zero red-word hits.

Repeating that already-forced translation once gives the locked next pair `(6,11)`. It occurs in two unsolved page-local words, but among all **50 complete red words** on p0-p55 it occurs exactly once: the first word of the second p33 red rubric at **p33:91**, with full descriptor `[3,6,11]=[e,a,A^-1]` and raw runes `[21,2,12]=[B+K,K,aK]`. Canonical H3 maps that word to `[9,2,4]=[q+g,K,q]`.

The marked receiver also supplies a direct arithmetic self-check. Its two red-word lengths are `[3,5]=[e,g]`, its first-word SUM is `6=a`, its first-word PRODUCT is `11=A^-1`, and the entire red span is `8=A` runes, so `11*8 = 1 mod29`. Across all **50 complete red words** on unsolved p0-p55, p33:91 is the **sole** word whose nonzero PRODUCT has a GP29 inverse equal to its containing red-span length. The SUM simultaneously equals the independently counted six physical lines of the lower p33 unit. This is receiver-side source evidence for the same SUM/PRODUCT arithmetic, although it still does not prove that the original chapter graph was the creator's intended grammar.

This receiver is independently source-marked: prior work had already shown that solved-2014 suffix `9133` uniquely addresses p33 offset91, and that p33:91 and p40:0 are the only two complete red spans with word lengths `[3,5]=[e,g]`. One further predeclared `+q` translation predicts `(14,22)` and has **zero red-word hits**, so the marked continuation stops at p33 rather than extending indefinitely.

Conditional on the extra p3 fallback, this is a source-marked algebraic continuation that uses PRODUCT inside a reversible object. It still does not authenticate the original SUM/PRODUCT grammar, recover body plaintext, or authorize free GF(841) affine searches. The two explicit weak assumptions are reading terminal value3 as a pointer to physical p3 and repeating the observed `+q` translation once. The `(6,11)` value was derived before its location was inspected during this invocation, but it was not repository-precommitted.

Full derivation, field roots, exhaustive base-field affine maps and marked-word controls: [p3-field q-translation handoff](lp2-chapter-route-gf29-qtranslate-p33.md), reproduced by `sims/lp2_chapter_route_gf29_qtranslate_p33_sft.cjs`.

The p33 landing is now operationally important because it hits the **lower red heading already decoded as RISE** by a pre-existing p33 layout serializer. That older branch consumes the literal body rise `115-81=34` to select signed/physical p34=`BE`, then predicts p34 offsets4..5 exactly and decrypts them to the strong local plaintext candidate **BE**. This downstream machinery predates the present chapter route, so the new route reaches an independently existing plaintext-bearing branch rather than inventing a consumer after the p33 hit. See `lp2-p33-their-rise-body34-be-handoff.md` and `lp2-p34-be-same-index-transfer-gate.md`.

## Decision for the solve frontier

This **provisional candidate is materially more operational than a visual theme**: it specifies a finite original-cipher input class, two exact field operations, a deterministic graph, one unique start at book opener p0, five reproducible hops and a plausible final *artifact class*—the numeric table on p50. Unlike a fitted key shell, it requires **no comparison to preselected 2016 signed prose or any guessed LP2 plaintext**. The same route can be checked by a human from original pages.

The established navigation currently ends at **p40**. Do not use terminal `OUT=3` as a physical-p3 pointer in a causal solve path unless a new first-party/local cue selects that address-type switch. The p3-field/q-translation/p33 branch is preserved as a conditional algebraic extension, not evidence that the chapter route itself reaches p3.

To promote it beyond a plausible route, require **one independently authored instruction** selecting the `SUM` and `PRODUCT` word functions and `OUT→IN` direction, or a prospective consequence beyond this already-inspected nine-chapter dataset. A decisive next test would be a **source-selected, reversible p50 table consumer** that starts at the route's endpoint and produces native GP plaintext or an independently authenticated continuation; p50 index searches, arbitrary exceptions, and relabelled key-field fits must not be used as rescue. Another way to reject the route is a better independent original-image operation that produces comparable chains under matched nulls with no first-party selector, showing the graph is a streetlight artifact.

**Exact reproduction:** [read-only Node22 CommonJS source test](../sims/lp2_chapter_rubric_sum_product_route_sft.cjs) parses the nine original physical source headings and all whole black words, asserts the table and p0 path, exhaustively tests **all 9! product assignments**, and performs the **100,000** deterministic same-page/length-matched controls. The mathematical core and controls were executed in the live V8 runtime and the complete committed wrapper (including 576 operator/field alternatives, solved p56/p57 holdout, exhaustive 9! product labels and the 100,000 original same-page/length alternatives) **passed independent Node22 Windows GitHub Actions** on 28 November: [successful CI run 46133739556](https://github.com/FlareZ123/liber-primus/actions/runs/46133739556). Reproducibility does not authenticate Cicada authorship.

