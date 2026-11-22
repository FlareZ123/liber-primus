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

## First complete plaintext-receiver test: all ten tagged pages as five-share reconstruction and heldouts

A natural causal follow-through, conditional on the five-page selector being a real cue, is the **five-share threshold cryptography already present in Cicada's 2013 puzzle**. Test its simplest GP29 analog without tuning a plaintext crib:

1. Use exactly the selected **p16, p28, p33, p34, p38** as the five shares in that order, with **their actual zero-based physical page numbers mod29** as distinct share coordinates **[16,28,4,5,9]**.
2. Preserve the first **214** original rune positions, the shortest source page, and interpolate the unique degree-at-most-four GF29 polynomial at **x=0** at every position. Its forced Lagrange weights are **[18,5,14,11,11]**. No plaintext or external key selects these weights.
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

\`\`\`text
EFDXIASRHTLCRCSCXUFNTXOEMYIAJIEOIAIAEANMBHSOEHGHIAEOPIEATHEOEEDSLOSSHCNGEOWOECEANHTHTHIIAMEOWXOEWH
\`\`\`

It is **not** authenticated plaintext. An exact interpolation into a secret always exists for five arbitrary GF29 shares, so the synthetic round-trip establishes implementation accuracy alone. All **five** independently tagged rune-page holdout streams and the sixth numerical-table holdout reject the *specific* direct **degree-four common share-polynomial** architecture under original indexed, unshifted page alignment. **34/921** rune symbols agree with the complete original five-of-ten reconstruction, near the iid coincidence expectation. This does not rule out a historically typed share format with a separately supplied nontrivial decoding of rune pages into equal-width GF(2^n) records.

## Decision and executable next route

The **five-page/two-state selector**, and its precise extension to a **five-of-ten encrypted-page subset plus the numeric table**, are exact original-data structural results. They offer a concrete way to choose five original pages without a language fit. The DH interpretation, despite its compact arithmetic, remains conditional because the cross-page polynomial/derivative operator is nowhere printed as a first-party cipher instruction.

The simplest GP29 five-share readout **fails all five held-out tagged rune pages, the numeric table, and p55 as a direct key consumer**. Do not rescue it with secretly rephased page offsets, fitted field-coordinate origins, new polynomial degrees, or a second arbitrary cipher. The useful next decision is whether an **independent original image or dated Cicada operation actually types five page numbers as a key/route/state**, and if so whether it produces an exact *prospective* symbol or decryptor prediction on untouched p16/p28/p33/p34/p38 data. Absent such an operation, keep this cluster as provisional structural evidence.

**Reproducer and run:** [Windows Node22 CommonJS SFT](../sims/lp2_root24_dh2_fivepage_jet_selector_sft.cjs) · [GitHub Actions PASS 44994344606](https://github.com/FlareZ123/liber-primus/actions/runs/44994344606). It asserts the source p39 red triad, p29 and table double-root inputs, p28 DH equations, the complete 841-case census, five repeated-jet states and ten original rune-page tags including the numeric table, original five-of-ten GP29 Shamir heldouts and p55 readouts, and source-native positive-control recovery.