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

**Solved-heading holdout (an unsearched independent page-class check).** The original book includes two further **already-decrypted** red-headed physical pages, p56 `AN END` and p57 `PARABLE`. Add them as candidate destinations and apply **the identical frozen first-black-whole-word rule**. Their words are `MYLOH` (p56, five GP runes, IN sum18/OUT product16) and `LICE` (p57, four GP runes, IN sum24/OUT product20). Neither receives or emits an edge to the original nine-chapter graph: the p0→p8→p27→p54→p40 route, its unique recipient at each hop and its terminal stop all **survive** adding the solved pages. Retesting the **same 72 fixed word-operator pairs** across all eleven headings still finds **only one** five-chapter route beginning at p0: sum→product. The solved pages were known to exist before this analysis but this explicit extension was tested only **after** the route was discovered, so it is a bounded scope/robustness control rather than a prospective prediction of authorship. It prevents silently excluding the solved pages simply because their inclusion might spoil the itinerary.

The second control's per-page candidate pool counts are `[11,6,10,7,2,5,13,8,5]` in the chapter order above. Results are fully deterministic for the recorded seed. Overlapping words, source-conditioned punctuation, nonuniform GP rune frequencies, the ability to try alternate checksum operations and the post hoc recognition of p40 as a destination mean the small conditional counts **cannot be interpreted as the probability that a real author intentionally encoded this route**. The exact fixed-marginal permutation gives a different null and deliberately prevents hiding the selection issue behind one deceptively small rate.

## Decision for the solve frontier

This **provisional candidate is materially more operational than a visual theme**: it specifies a finite original-cipher input class, two exact field operations, a deterministic graph, one unique start at book opener p0, five reproducible hops and a plausible final *artifact class*—the numeric table on p50. Unlike a fitted key shell, it requires **no comparison to preselected 2016 signed prose or any guessed LP2 plaintext**. The same route can be checked by a human from original pages.

To promote it beyond a plausible route, require **one independently authored instruction** selecting the `SUM` and `PRODUCT` word functions and `OUT→IN` direction, or a prospective consequence beyond this already-inspected nine-chapter dataset. A decisive next test would be a **source-selected, reversible p50 table consumer** that starts at the route's endpoint and produces native GP plaintext or an independently authenticated continuation; p50 index searches, arbitrary exceptions, and relabelled key-field fits must not be used as rescue. Another way to reject the route is a better independent original-image operation that produces comparable chains under matched nulls with no first-party selector, showing the graph is a streetlight artifact.

**Exact reproduction:** [read-only Node22 CommonJS source test](../sims/lp2_chapter_rubric_sum_product_route_sft.cjs) parses the nine original physical source headings and all whole black words, asserts the table and p0 path, exhaustively tests **all 9! product assignments**, and performs the **100,000** deterministic same-page/length-matched controls. The mathematical core and control counts were executed in the live V8 runtime; the filesystem wrapper itself has not been separately executed in CI.

