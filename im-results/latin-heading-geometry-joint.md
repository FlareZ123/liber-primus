# LP2 red heading: exact proposed Latin inverse with a coupled geometric key chain

**Agents 24 and 14, 10 November 2026. Classification: two-stage original-source key coupling, retrospectively derived root/product circuit, cross-page candidate linkage with literal word-boundary counterexample, independent Latin-ranked candidate check, and matched conditional nulls. No authenticated LP2 plaintext, actual encryption mechanism, or continuation key has been recovered.**

The first two plaintext guesses, their keys and the underlying first-729-rune geometry originated in [an external 27×27-route proposal](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/main/Start-reading-here/red-heading-SEQUENDI-RATIO.md). We independently reconstructed the literal original-input inverse, identified a **new simple coupling from the first source key into the second**, and calibrated its complete two-word key production against **1,000,000** inventory-preserving null squares. The coupler is *hypothesized after inspecting the proposed source key* and receives no independent-authentication status from its rare null score.

## Proposed plaintext and exact original-input inverse

The first physical LP2 page starts with two red words of **8 and 5 original rune cells**. The first 13 ciphertext indices in the original Gematria Primus order are:

```text
First eight: [15,8,18,3,6,19,27,0]     read right-to-left
Last five:   [15,26,18,21,5]           read left-to-right
```

Applying mod-29 subtraction with repeated four-rune key `[14,9,14,5]` to the **reversed first eight**, and with repeated three-rune key `[11,2,2]` to the **forward second five**, returns original-register GP sequences:

```text
[15,18,5,1,18,9,23,10] → SECUENDI
[4,24,16,10,3]         → RATIO
```

The GP `C/K` rune of index 5 in `SECUENDI` is read as Latin Q, yielding the conjectural **SEQUENDI RATIO**, approximately *method of following*. Both inferred GP plaintext strings **re-encipher to all 13 original ciphertext indices exactly** under those two keys, with original directions and word-boundary reset preserved. The Latin reading was chosen in the independent earlier proposal, so this by itself only confirms its arithmetic.

Build the 27×27 key square from precisely the **729 consecutive original runes on LP2 physical pages 0, 1 and 2** with page lengths `[262,266,201]`. The opening root is the external route's `J=11` at one-based **(13,12)**. GP values here are **rune indices**, not assigned prime values.

## Exact original geometries and new coupled pointer rule

The selected four-rune key is the four corners of an axis-aligned rectangle in clockwise order from the upper left:

| Source corner | Cell | Original GP index |
|---|---|---:|
| NW | (6,3) | X = 14 |
| NE | (6,9) | N = 9 |
| SE | (24,9) | X = 14 |
| SW | (24,3) | C/K = **5** |

The NW and SE X corners have **equal squared Euclidean distances** from the opening root J at (13,12). Across every possible nondegenerate rectangle satisfying these values and the fixed-root equal-distance constraint, the original 729-rune matrix has **one** instance: this exact rectangle.

The formerly independently selected three-rune key source is `J(13,12)–R(18,17)–TH(23,22)` with original indices `[11,4,2]`. Transform only its center by Euler's totient, **φ(4)=2**, to get `[11,2,2]`. Of every rooted equally spaced three-rune line across eight directions and radius1–13, the original square also has exactly **one** literal J–R–TH match.

**New, simpler source-derived coupling conjecture:** Treat the final (SW) rune index of the four-corner key as the movement step `s=5`. Use the **NW→SE orientation of the rectangle's two equal X corners** to choose the southeast direction. Starting at the external J root, take exactly one and two steps of that size along the southeast grid diagonal:

```text
step = last_rune_index(K4) = 5
center = (13+step, 12+step)   = (18,17) = R, index4
last   = (13+2*step,12+2*step) = (23,22) = TH, index2
K3     = [index(J), phi(index(center)), index(last)]
       = [11,2,2]
```

The second key is therefore recoverable **directly from the first rectangle and opening root** without independently searching for J–R–TH triples. With this *now frozen* explicit rule, the second red word decrypts to RATIO, and both proposed words reverse exactly. The link is conspicuous but postselected: the external route did **not** derive this two-stage key chain in advance, no manuscript instruction establishes `s=last key symbol`, and the rectangle direction and fixed root were also chosen retrospectively.

## Self-rooted key circuit without a fixed J anchor (Agent 14)

The fixed-root argument above is conditional on the externally supplied J coordinate. A distinct **postselected source-only selector** instead starts from every *unlabelled* axis-aligned rectangle whose NW and SE cells have the **same GP index**. Let its four clockwise corner values be `K4=[a,b,a,d]`. Set `q=(2a+b+d) mod29`, then derive the root coordinate `R=(q,φ(q))`, treating the two numbers as one-based grid row and column and requiring them within 1–27. Require the repeated-label NW/SE corners to be equidistant from R. Continue southeast from R in one and two diagonal steps of length d; the middle glyph must equal `(a*b*a*d) mod29` and the last glyph must equal φ(middle).

The selector does **not** use a target Latin phrase, required key labels, the published J(13,12) root, or the location of any intended output ciphertext. It enumerates all 29 possible repeated-corner labels in the original 729-symbol grid. The five successive survivor counts are **4,187 equal-corner rectangles**, **3,913 with a valid sum/totient root**, **15 equidistant-root rectangles**, **3 with in-bounds southeast endpoints**, and **one** satisfying both glyph arithmetic checks. That sole circuit yields `K4=[14,9,14,5]`, root (13,12) glyph 11, middle (18,17) glyph 4 = product(K4) mod29, and terminal (23,22) glyph 2 = φ(4). It therefore independently *selects* the keys `[14,9,14,5]` and `[11,2,2]` from the now-declared rule, reproducing the candidate title's exact mod29 inverse and re-encryption.

The name **source-only** refers to the *enumerator's inputs*. The sum-to-root, totient-column, geometric radius, product check and diagonal step are **all retrospectively constructed using the original proposed K4/K3 locations**. They are not independent predictions or authenticated original authorial rules. Such algebraic search has a large unrecorded selection history, and exact source re-encryption follows mechanically from a chosen additive key.

A new full-search null applies all gates identically to every random source grid, with no fixed K labels or root. [The single-file original-source reproducer](../sims/latin_heading_source_closed_loop.cjs) ran on [successful manual Windows CI 42814349132](https://github.com/FlareZ123/liber-primus/actions/runs/42814349132), using exactly 20,000 samples per declared ensemble and xorshift32 seed `0x14132729`. Its conditional circuit-existence results are:

| Matched source-grid null | ≥1 circuit among 20,000 | Add-one conditional tail |
| --- | ---: | ---: |
| Shuffle all 729 original GP indices, retain complete inventory | **51** | **52/20,001 = 0.00259987** |
| Keep first 13 red title indices fixed, shuffle other 716 positions | **50** | **51/20,001 = 0.00254987** |
| Independently circularly rotate each whole original physical p0, p1, p2 | **125** | **126/20,001 = 0.00629969** |
| Preserve first 13 p0 title cells, circularly rotate the rest of p0 and both other original pages | **136** | **137/20,001 = 0.00684966** |

The rotation controls preserve almost all original within-page cipher adjacency and each page's histogram. An additional bounded out-of-sample *architecture test* applied the complete unchanged selector to the first 729 concatenated ciphertext runes beginning at physical page **3, 8, 15, 23, 27, 33 and 40**. Every one produced **zero** circuits; the final section beginning p54 contains only 308 available unsolved runes. Thus this exact detector is a p0-specific candidate, with no demonstrated cross-section continuation.

## Source-root cross-page body linkage and punctuation constraint (Agent 14)

The original source self-rooted circuit yields J(13,12), from which a further **retrospectively hypothesized** path links a **different original ciphertext span** that the external route had already read as `AS I GO THE`. This is a coupling of previously proposed readings, not a newly decrypted passage.

The original rectangle NW(6,3) to NE(6,9) has **inclusive width 7**, also equal to the vertical gap **13−6=7** between its upper row and the derived root. Set the cipher start at `(rootRow,rootColumn+rootRow)=(13,25)` and read exactly that seven-rune width in original row-major source order, crossing the row boundary after its third rune. That location is physical p1 zero-based rune offsets **86–92**, global offsets **348–354**, with exact ciphertext GP indices `[20,25,9,2,13,1,14]`. Read the root's three immediate horizontal source neighbors `g(13,11..13)=[25,11,28]`; totient-transform its middle to 10 and use the external model's Möbius-signature phase 0, deriving key `[25,10,28]`. Mod29 subtraction returns `[24,15,10,6,3,2,18]`, GP `ASIGOTHE`. The actual seven ciphertext indices re-encrypt exactly.

The original physical transcript also defines precisely four *whole* ciphertext words at this location, `ᛚᚫ.ᚾ-ᚦᛈ-/ᚢᛉ-` (slash signifies a printed-line wrap). Their lengths are **2, 1, 2, 2**, the same GP rune-word segmentation as the proposed `AS I GO THE`. An exhaustive punctuation-aware scan of all **2,896 complete rune words and 12,956 original GP runes** found **exactly one occurrence of the consecutive length profile [2,1,2,2]**, namely this p1 span. It is therefore a genuine source-side segmentation coincidence. **However**, the punctuation after the first 2-rune word is a printed **full stop**. Preserving exact original punctuation would read `AS. I GO THE`, which is grammatically inconsistent with the proposed continuous phrase unless punctuation has its own unproved transformation. That limitation is part of the evidence, not a detail to silently discard.

The cell `(13,25)`, length7 and source-neighbor choices were inferred **after** the external phrase `AS I GO THE` and its coordinates were public. The unique whole-word length pattern is a useful structural constraint on any future solution, but it has no discovery-wide probabilistic calibration and does not independently select a genuine plaintext. The previously published `WEATHER` example, likewise on p1, is a different region and is not a contiguous continuation of this span: it begins at p1 rune offset102, with **nine intervening original rune cells** after the seven-rune block, and stops one rune short of its six-rune original ciphertext word. This gap/partial-word issue requires an independently explained geometric route.

Source exactness, inverse plus forward regeneration, punctuation profile and uniqueness are asserted in [the same original-source SFT](../sims/latin_heading_source_closed_loop.cjs), with [updated successful Windows CI 42816929475](https://github.com/FlareZ123/liber-primus/actions/runs/42816929475). No further unseen cipher passage is recovered.

## Independent Latin-ranked unlabelled key search (Agent 24)

The complementary [unlabelled Latin source inverse](../sims/latin_heading_unlabeled_inverse.cjs) keeps the historically proposed J root at (13,12) but removes the target K4 corner labels, enumerating every equal-NW/SE-rune rectangle at that root and generating the linked second key. The original square yields **six** candidate source keys. A frozen Latin Vulgate GP trigram model, trained outside the manuscript, ranks the previously proposed `SECUENDI RATIO` candidate first at **−1.91946023 nats/rune**, separated from its runner-up by over 1.9 nats/rune. When all six-choice selection is repeated in **100,000** original-title/root-preserving source shuffles, **one** shuffled candidate reaches the original Latin score (add-one conditional tail **2/100,001**, [CI 42810875668](https://github.com/FlareZ123/liber-primus/actions/runs/42810875668)). Applied to the independent red title starting p8, the same root/key decoder yields ten candidates, and even its best scores below −5 nats/rune. This remains a retrospectively chosen Latin-oriented model whose independent-p8 continuation fails to produce a convincing plaintext. It does supply a genuine all-key-family score rather than selecting only the published reading.

## Matched complete key-chain randomization

Fix the **first 13 original red ciphertext rune cells** and the published J root at (13,12). Uniformly permute by seeded Fisher–Yates the remaining **715** source cells, preserving the complete 729-rune multiset and source heading values. For each shuffled 27×27 square, independently enumerate every matching equidistant-root X–N–X–C rectangle. For the original earlier *uncoupled* model, also scan all rooted J–R–TH straight lines across eight directions and radii1–13. For the **new coupled model**, derive each candidate second key by the rectangle's southwest source rune step, take the southeast axis and apply the center totient, then ask whether the complete source-generated key is **[11,2,2]**. Accept the center's original index as any of **3, 4, or 6**, since all three have totient2. This correctly tests the **derived key**, rather than requiring the previously selected raw center letter R.

A fixed 32-bit xorshift32 seed **0x24131329**, 1,000,000 independent pseudorandom shuffles and the same complete model-selection family for every null produced:

| Frozen source property | Original square | Randomized squares passing /1,000,000 | Add-one empirical upper tail |
|---|---:|---:|---:|
| Any matching X–N–X–C rectangle | 1 | **1,731** | **1732/1000001 ≈ 0.001731998** |
| Any J–R–TH straight source | 1 | **59,557** | **59558/1000001 ≈ 0.059557940** |
| **Both independently sourced structures** | yes | **116** | **117/1000001 ≈ 0.0001169999** |
| **One first-key rectangle generates second key through the coupled step rule** | yes | **9** | **10/1000001 ≈ 0.00000999999** |

The selection of the already-proposed Latin plaintext, specific rectangle labels, source root, equal-distance test, last-rune step rule and southeast direction used **the same original square**. As a result the conditional rarity, including the 9/1,000,000 coupled observations, is **not a discovery-wide significance level or probability that this is Cicada's actual cipher**. The null preserves source-symbol inventories while destroying page words, line spacing and adjacent rune relationships; results do not generalize automatically to other input distributions. The 32-bit PRNG and modulo choice are fully specified for reproduction, not a mathematically exact uniform random permutation sampler.

**Reproducibility:** [original-source CommonJS script](../sims/latin_heading_geometry_joint_null.cjs) with run argument `1000000`, containing all GP inputs, both forward/inverse tests, exact location assertions and full model-family null; [manual Windows Node 22 workflow](../.github/workflows/latin-heading-geometry-joint.yml); [successful completed 1,000,000-shuffle CI run 42809328896](https://github.com/FlareZ123/liber-primus/actions/runs/42809328896). The earlier [100,000-shuffle run 42808098193](https://github.com/FlareZ123/liber-primus/actions/runs/42808098193) independently confirms the initial uncoupled calculation at an older commit.

## Cryptanalytic consequence and decisive remaining experiment

This identifies a **compact two-stage, source-derived candidate decoder for the entire first 13-rune red heading**, in which one geometric key generates the next. It remains a *postselected fit*, however, and does **not** disclose an authenticated plaintext, a general page key, or a continuation cipher. The newer self-root circuit can choose the first rectangle and J coordinate internally using original source glyphs, and a Latin scorer also selects the historical keys within its six-candidate family. Both complete selectors were built after seeing the proposed original plaintext and its source geometry, so neither supplies an independently justified authorial key or a predictive next-span decoder. The proposed Latin phrase was already available before the source geometry was searched.

A credible breakthrough would require that this now-frozen coupling **predict another previously uninterpreted original LP2 span** and its source keys, recover readable GP plaintext and reproduce the ciphertext exactly without choosing source geometry or vocabulary after seeing that span. Until such a holdout works, preserve this report in `im-results/`, with no promotion to the authoritative `results/` solved-plaintext index.
