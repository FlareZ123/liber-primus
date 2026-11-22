# A five-page GP29 jet signature at source-selected root24 and DH secret2

**Agent15, 22 November 2026. Classification: new exact original-cipher cross-page selector; author intent and plaintext recovery unestablished.** The first complete source-typed five-share consumer is negative. This is a single compact decision, rather than a new cipher architecture or proof that any encryption method has been identified.

## Why these two field parameters are worth testing

Two independently documented manuscript relationships already fix a meaningful **root** and a **value** before this new cross-page census.

* Original p39 prints the red GP ordinals **[27,5,15]**. Taking them as ascending powers gives
  \[
  G(X)=27+5X+15X^2=15(X-24)^2\pmod{29}.
  \]
  Original p29's **277-rune** polynomial and original p50's **256-byte** conventional-base60 polynomial share this exact double root. This repeated-root/source-orientation relationship and its retrospective 2016 message-index packet were established separately in the [p29/p50 report](lp2-p29-p50-double-root-signed-index-packet.md).
* On physical p28, the only manuscript line beginning literal **DH** combines with the historical outer-pair operation, its five visible fragments, and its one-based line number six to reconstruct a finite DH exchange \((p,g,a,b,A,B,K)=(23,5,6,15,8,19,2)\). Bob's inverse exponent is \(e=15^{-1}\bmod22=3\). This is the pre-existing [p28 source state](lp2-p28-dh-line6-source-reconstruction.md); its reconstruction, while mathematically exact, depends on the separately inferred outer-pair operation.

These are *conditional human solve-path clues*. **The manuscript does not explicitly instruct the solver to treat all original pages as GF29 polynomials or use their derivatives as a selector.** The test therefore examines a new, specific consequence rather than declaring a Cicada-authored operation.

## Complete original-page selector

For each of the **55** original rune-bearing unknown physical pages p0–55 (p50 is the runeless numeric table), retain every source rune in original order as GP ordinal coefficient \(c_i\) of the descending polynomial
\[
P_j(X)=\sum_{i=0}^{n_j-1}c_iX^{n_j-1-i}\pmod{29}.
\]
Evaluate the first formal derivative \(P'_j(24)\) and select **exactly** those pages for which it equals the independent source DH shared secret **\(K=2\)**. This gives:

| Physical LP2 page | Runes | \(P_j(24)\) | \(P'_j(24)\) | Source-state retrospective reading |
| ---: | ---: | ---: | ---: | --- |
| 16 | 267 | **24** | **2** | \((-g,K)\) |
| 28 | 269 | **12** | **2** | \((aK,K)\) |
| 33 | 214 | **12** | **2** | \((aK,K)\) |
| 34 | 261 | **24** | **2** | \((-g,K)\) |
| 38 | 228 | **24** | **2** | \((-g,K)\) |

**All 50 other original unknown rune pages fail this precise derivative criterion.** Consequently the five source-selected pages have just **two distinct value/derivative states**: \((24,2)\) on three pages and \((12,2)\) on two. The separate fact that \(24=-g\bmod29\) and \(12=aK\bmod29\) is a compact DH interpretation recognized *after* the values were printed; it is **not independent confirmation** of author intent.

An exhaustive **29 roots × 29 possible derivative markers = 841** inspection on the *same unchanged original 55-page corpus* finds **only one** root/derivative pair with at least five pages and no more than two distinct function values: **(24,2)**, with the exact five pages above. A different root, **21**, also has six pairwise *full-jet collisions* but spread across six different derivative markers; it does not reproduce the five-page/two-state cluster.

### Entire repeated-jet inventory at this particular root: a source 5-of-10 subset

The original runeless physical **p50** can also be evaluated as the polynomial of its 256 original-derived conventional-base60 table bytes modulo29, retaining the printed 32×8 read order. Its original jet is **[0,0]**, exactly equal to p29's independent rune-page jet. Therefore the full original **55 cipher-page plus one number-table** inventory has **five** multiply occupied jet states:

| Jet \([P(24),P'(24)]\) | Original cipher pages and table | Page/table pairs |
| --- | --- | ---: |
| \([4,12]\) | p3, p23 | 1 |
| \([24,2]\) | p16, p34, p38 | 3 |
| \([12,2]\) | p28, p33 | 1 |
| \([0,0]\) | p29, **p50 numeric table** | 1 |
| \([28,3]\) | p46, p49 | 1 |
| **Total** | **10 cipher pages + one original numeric table** | **7** |

This original-source state tag identifies exactly **ten cipher-bearing pages** in increasing physical order: **3,16,23,28,29,33,34,38,46,49**. The derivative-\(K=2\) filter selects **five of these ten**: **16,28,33,34,38**. The count aligns superficially with Cicada 2013's historical five-share secret-sharing operation, but the polynomial-page-tagging grammar is inferred after the observation, and there is no author-supplied rule mapping these rune pages to those historical binary shares. This is a newly specified experiment, not evidence of successful reconstruction.

Among the repeated states *on rune-bearing pages only*, derivative labels are exactly **2, 3, 12**, equal to \(K\), the reconstructed DH inverse exponent \(e\), and \(aK\), respectively. These source-tuple interpretations were recognized after observing the collisions; they cannot count as independent confirmation.


Under a deliberately simplified iid-uniform GF29 *jet-pair* null with root and derivative marker fixed in advance, a five-page 3+2 partition of the type observed has probability **0.00001161454805**; allowing five or more pages with at most two different values gives **0.00001783981378**. The union upper bound over all **841** field root/marker choices is **0.01500328**, but this is **only a reference model**. It does not account for original ciphertext dependence, the project's enormous wider family of hypotheses, historical selector choice, or this discovery's post hoc interpretation. It must not be reported as the probability of deliberate Cicada construction.

## Complete direct five-share plaintext receivers on the ten tagged pages

A natural causal follow-through, conditional on the five-page selector being a real cue, is the **five-share threshold cryptography already present in Cicada's 2013 puzzle**. Test its simplest GP29 analog without tuning a plaintext crib:

1. Use exactly the selected **p16, p28, p33, p34, p38** as the five shares in that order, with **their actual zero-based physical page numbers mod29** as distinct share coordinates **[16,28,4,5,9]**.
2. Preserve the first **214** original rune positions, the shortest source page, and interpolate the unique degree-at-most-four GF29 polynomial at **x=0** at every position. Its forced Lagrange weights are **[18,5,14,11,11]**. No plaintext or external key selects these weights.
3. Hold out the other five jet-tagged original cipher pages **p3,p23,p29,p46,p49**, and test the full available rune-coordinate predictions at their own page-number field addresses. Independently hold out the numeric table p50 at **x=21** (physical page50 modulo29), with exact weights **[17,9,5,27,1]**.
4. Because physical p55 has exactly **76** runes and precedes solved p56, also test the first 76 interpolated symbols as an additive and subtractive GP29 key on all 76 original p55 ciphertext runes.

| Entire untouched receiver | Exact result |
| --- | --- |
| Direct 214-symbol reconstructed zero-share stream | GP29 IoC **0.0335220043**, unreadable |
| Proposed p29 holdout | **9/214** equal predictions; iid expected **7.3793**, no full share consistency |
| **All five tagged rune-page holdouts** | p3 **6/214**; p23 **8/213**; p29 **9/214**; p46 **8/214**; p49 **3/66**. **Total 34/921**, uniform-reference expectation **31.76**; no full-shared polynomial consistency |
| Proposed p50 numeric-table holdout | **8/214** equal predictions; iid expected **7.3793**, no full share consistency |
| P55 original ciphertext minus 76-symbol interpolated key | IoC **0.0382456140**, no coherent native GP plaintext |
| P55 original ciphertext plus the same key | IoC **0.0378947368**, no coherent native GP plaintext |
| Genuinely solved p57 76-rune secret planted into five polynomial shares | **76/76** source-native GP symbols exactly recovered; p55-style additive inverse plant also **76/76** |

The exact subtractive p55 output is:

```text
EFDXIASRHTLCRCSCXUFNTXOEMYIAJIEOIAIAEANMBHSOEHGHIAEOPIEATHEOEEDSLOSSHCNGEOWOECEANHTHTHIIAMEOWXOEWH
```

It is **not** authenticated plaintext. An exact interpolation into a secret always exists for five arbitrary GF29 shares, so the synthetic round-trip establishes implementation accuracy alone. All **five** independently tagged rune-page holdout streams and the sixth numerical-table holdout reject the *specific* direct **degree-four common share-polynomial** architecture under original indexed, unshifted page alignment. **34/921** rune symbols agree with the complete original five-of-ten reconstruction, near the iid coincidence expectation. This does not rule out a historically typed share format with a separately supplied nontrivial decoding of rune pages into equal-width GF(2^n) records.

## The 252-entry combinatorial table: an exact five-of-ten source-inversion test

A second numerical consequence connects three original/source-precedent structures.

* The root24 repeated-jet classifier tags exactly **ten** original encrypted rune pages and selects precisely **five** by the original p28 DH secret K2.
* Cicada's actual **2013** challenge used a five-of-ten Shamir secret-sharing threshold, a historically recognizable operation. The currently tagged LP2 pages are **not** shown to be those secret shares.
* The original p50 has **256** printed two-character base60 numerical cells. Two existing source quadratic polynomials H(X)=24X²+26X+3 (2013 signed BASE29 source) and G(X)=15X²+5X+27 (p39 red triad) divide its high-first GF29 polynomial exactly. Their combined degree is **four**; the original table quotient T/(HG) contains **252 field coefficients**, exactly C(10,5)=252.

This offers a deterministic complete **252-value** potential table readout. Enumerate all size-five subsets of the *ten tagged original page numbers* **[3,16,23,28,29,33,34,38,46,49]** in ordinary lexicographic order, zero-based. Take each page's original field address x=page mod29; the ten addresses are distinct. For a subset of five, interpolate the unique fourth-degree GF29 polynomial through the **five original P_page(24) values**, then read the predicted secret at x=0. The corresponding **252 original quotient coefficients** supply an untouched full-length holdout. Repeat independently with the actual **first-derivative** P'_page(24) values as the five input shares. No ciphertext edits, guessed external keys, sentence fitting, offsets, or secret phases are used.

The independently selected five pages **[16,28,33,34,38]** occupy lexicographic subset rank **171** of252. The original table quotient's coefficient at rank171 is GP29 ordinal **4**, the letter **R**. Its unsegmented assignment is one arbitrary rune and cannot be treated as a plaintext word. The **all-252** result is decisive for the direct reconstruction:

| Entire original 252-entry prediction | Matching coefficients | Generated prediction IoC | Original quotient IoC |
| --- | ---: | ---: | ---: |
| Interpolate original ten page **values** P_page(24) | **6/252** | **0.2694618352** | **0.0363308670** |
| Interpolate original ten page **derivatives** P'_page(24) | **6/252** | **0.2732561816** | **0.0363308670** |

The predicted five-of-ten field data have severe repeat concentration because the source has only five repeated jet states. The table quotient includes all29 field symbols and is near-uniform, so **no coherent full-length relationship** exists under the straightforward 2013-style interpolation. There are **246 mismatches** for each complete 252-element codeword.

**Decision:** the C(10,5) length equality and original five-page selector deserve preservation as a concrete historical design-path hypothesis, yet the obvious **interpolate five source jets into one GP29 secret for each table cell** mechanism is excluded. Building an alternative combinatorial decoder requires an independent first-party rule for page-to-share mapping, a different secret field, or meaningful table projection before searching. The rank171 single rune R alone is not a key. The subsequent source-selected EA|R pair, described below, is an independent composite clue candidate that still lacks a plaintext-producing decoder.

## New selected two-rune readout: EA|R = EAR, a historically meaningful target word

The complete original-input 252-subset analysis has a **single, sharper source-selected outcome** that does not follow from ordinary Shamir correctness:

* The derivative-K2 rule selected the five original pages **[16,28,33,34,38]** before reading a table-symbol plaintext. Their position among ten tagged page numbers is the unique zero-based **lexicographic 5-subset rank 171**.
* The original *jet-value* interpolation of those five (original physical page IDs mod29; no fitted key) yields **28**, the final GP rune **EA**. Its independently reconstructed *jet-derivative* secret is2, the p28 DH secret already used to select those pages. The latter self-agreement is algebraically trivial because all five input derivatives are2.
* The **original p50/(HG) quotient at fixed index171** is ordinal **4**, the GP rune **R**. In natural secret-then-lookup order, the two independently computed runes form **EA|R**, the historically attested name **EAR** of the last Anglo-Saxon rune ᛠ. Across all **252** enumerated original five-page subsets, **this exact EA|R pair appears only once, at the previously selected rank171**.
* Independently of this calculation, the original physical **p22 picture depicts a corpse**, matching the Old English Rune Poem stanza for EAR. Its only adjacent-equal rune pair is **EA EA** at original page-local positions100–101, in the original four-rune fragment **OE|EA|EA|A**, GP-index sum **102**. The real p50 table byte at **original zero-based offset102 is32**, equal to **EA28+R4**, the 32 visible source p22 rune-fragments, and the numeric table's **32 rows**. This physical/semantic association, including its nonuniqueness across other pages, was established *before this new share readout* in the independent [p22 EAR image/source report](lp2-p22-ear-name-unique32-p50-row-gate.md).
* Original physical p32 has exactly **121=11²** runes. Its second 11×11 Chebyshev ring is exactly **32 rune cells**, matching EAR's GP ordinal sum32. Its untouched GP-prime sum is **1,539=9×171**, where 171 is the same selected five-of-ten subset rank. The factor nine matches an existing nine-chapter manuscript grouping, **recognized only after the numerical equality**. The ring sum was already established in the original independent [p32 ring report](p32-two-clause-concentric-ring-checksum.md); this new divisor/rank match remains retrospective.

A bounded direct **EAR-as-repeat-key** GP29 additive inverse was applied with exact original printed rune order to p22, p32, and terminal p55, both signs, no offset or key search:

| Original physical page | Raw IoC | Subtract EAR | Add EAR |
| --- | ---: | ---: | ---: |
| p22, 131 runes | 0.03581914 | **0.03464474** | **0.03628890** |
| p32, 121 runes | 0.03415978 | **0.03429752** | **0.03663912** |
| p55, 76 runes | 0.03789474 | **0.03473684** | **0.03719298** |

All six candidates remain nonlinguistic. Literal EAR is therefore **a sharply source-selected interpretive key/word candidate** with no demonstrated plaintext use. It could be a designed check or a retrospective coincidence; the origin of the global whole-page-derivative rule remains inferential, and independent human source evidence does not specify how to use EAR as a cipher key.

**Conditional caution:** the quotient has five R-valued cells and the 252 source-subset interpolations yield EA on six subsets. Under a fixed six-spot EA mask and randomly permuted original quotient retaining its five R symbols, the chance that *some* subset spells EA|R is about **11.44%**; the probability that the independently selected rank171 specifically holds one of those five R values is **5/252≈1.98%**. Neither accounts for the project's full exploratory hypothesis family. Unique spelling within 252 is suggestive but is not an authorship p-value.

**Next decisive action:** locate a dated/first-party instruction using EAR, the p22 corpse-rune stanza, or p32's 32-cell ring as a **specific cryptographic operation**. A successful claimant must recover an original plaintext interval and reproduce its encryption. Direct two-rune additive EAR has already failed; unbounded new phase/cipher combinations would overfit this one short token.

## Decision and executable next route

The **five-page/two-state selector**, and its precise extension to a **five-of-ten encrypted-page subset plus the numeric table**, are exact original-data structural results. They offer a concrete way to choose five original pages without a language fit. The DH interpretation, despite its compact arithmetic, remains conditional because the cross-page polynomial/derivative operator is nowhere printed as a first-party cipher instruction.

The first GP29 five-share readout **fails all five held-out tagged rune pages, the numeric table, and p55 as a direct key consumer**. The separate all-252 choose-five original-table reconstruction also fails. The **exact EA|R=EAR two-rune cross-source readout** is more specific but its direct GP29 additive receiver fails. Do not rescue it with secretly rephased page offsets, fitted field-coordinate origins, new polynomial degrees, or a second arbitrary cipher. The useful next decision is whether an **independent original image or dated Cicada operation actually types five page numbers as a key/route/state**, and if so whether it produces an exact *prospective* symbol or decryptor prediction on untouched p16/p28/p33/p34/p38 data. Absent such an operation, keep this cluster as provisional structural evidence.

**Reproducer and run:** [Windows Node22 CommonJS SFT](../sims/lp2_root24_dh2_fivepage_jet_selector_sft.cjs) · [GitHub Actions PASS 44994803296, ten-page holdout](https://github.com/FlareZ123/liber-primus/actions/runs/44994803296). [GitHub Actions PASS 44995618747, EAR key and original p22 EAEA link](https://github.com/FlareZ123/liber-primus/actions/runs/44995618747). A newer run including the p32 second-ring checksum should be cited when it completes. It asserts the source p39 red triad, p29 and table double-root inputs, p28 DH equations, the complete 841-case census, five repeated-jet states and ten original rune-page tags including the numeric table, original five-of-ten GP29 Shamir heldouts and p55 readouts, and source-native positive-control recovery.