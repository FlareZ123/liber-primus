# LP2 original chapter-opening words: a five-stop GP29 sum→product navigation to the numeric-table chapter

**Agent8, 28 November 2026. Classification: source-exact structural candidate; discovered retrospectively; not authenticated plaintext, cipher opcode, key or destination.**

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

## Exact composition with the already-established p50 mirror/sink DH readout

The five-stop route is unusually compatible with a second, **previously independently documented** original object. The p40 chapter contains the physical p49–p51 32×8 panel. Once a player reaches it, the original p50 source has a separate source-motivated (but still unauthenticated as payload decryption) operation: the lowercase `f` digit is never printed; remove it from the base60 alphabet to form radix59, interpret each of the 256 cell values as its next address, and follow the resulting fixed pointer to universal sink **189**. Its source row/column `(23,5)`, original eight-column width, reflected tree artwork and original mirrored cell186 `0J=19` give DH `p=23,g=5,A=8,K=2,B=19`, with computed `a=6,b=15,e=3` and the independently observed eight-pointer return path from186 to189. These facts predate the new chapter route; [the prior standalone p50 source circuit](lp2-p50-base59-pointer-sink-reflection.md) remains the correct primary evidence.

The **new integrated readout** of the nine original first-black words and the old p50 circuit produces the following proposed player sequence without viewing a single hypothetical LP2 plaintext word:

```text
p0 IN=15(b)  --23(p)--> p8 IN=23(p)
p8          -- 2(K)--> p27 IN= 2(K), red title length=19(B),
                               red title sum=305 mod29=15(b),
                               following black word OUT=19(B)
p27         --19(B)--> p54 IN=19(B)
p54         --27(-K mod29)--> p40 IN=27(-K mod29)
p40         --3(e)--> no new chapter; numeric panel lies in this chapter
                                      |
                                   base59 32×8 all-to-189 sink
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
## Decision for the solve frontier

This **provisional candidate is materially more operational than a visual theme**: it specifies a finite original-cipher input class, two exact field operations, a deterministic graph, one unique start at book opener p0, five reproducible hops and a plausible final *artifact class*—the numeric table on p50. Unlike a fitted key shell, it requires **no comparison to preselected 2016 signed prose or any guessed LP2 plaintext**. The same route can be checked by a human from original pages.

To promote it beyond a plausible route, require **one independently authored instruction** selecting the `SUM` and `PRODUCT` word functions and `OUT→IN` direction, or a prospective consequence beyond this already-inspected nine-chapter dataset. A decisive next test would be a **source-selected, reversible p50 table consumer** that starts at the route's endpoint and produces native GP plaintext or an independently authenticated continuation; p50 index searches, arbitrary exceptions, and relabelled key-field fits must not be used as rescue. Another way to reject the route is a better independent original-image operation that produces comparable chains under matched nulls with no first-party selector, showing the graph is a streetlight artifact.

**Exact reproduction:** [read-only Node22 CommonJS source test](../sims/lp2_chapter_rubric_sum_product_route_sft.cjs) parses the nine original physical source headings and all whole black words, asserts the table and p0 path, exhaustively tests **all 9! product assignments**, and performs the **100,000** deterministic same-page/length-matched controls. The mathematical core and controls were executed in the live V8 runtime and the complete committed wrapper (including 576 operator/field alternatives, solved p56/p57 holdout, exhaustive 9! product labels and the 100,000 original same-page/length alternatives) **passed independent Node22 Windows GitHub Actions** on 28 November: [successful CI run 46133739556](https://github.com/FlareZ123/liber-primus/actions/runs/46133739556). Reproducibility does not authenticate Cicada authorship.

