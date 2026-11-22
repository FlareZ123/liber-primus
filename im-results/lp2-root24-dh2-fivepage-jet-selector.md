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

### Entire repeated-jet inventory at this particular root

For each exact \([P_j(24),P'_j(24)]\) pair appearing on more than one page, the full source inventory is:

| Jet | Original pages | Pairwise collisions |
| --- | --- | ---: |
| \([4,12]\) | p3, p23 | 1 |
| \([24,2]\) | p16, p34, p38 | 3 |
| \([12,2]\) | p28, p33 | 1 |
| \([28,3]\) | p46, p49 | 1 |
| **Total** | 9 distinct pages | **6** |

Every repeated original jet at root24 has derivative **2, 3, or 12**. These are also \(K\), DH inverse exponent \(e\), and \(aK\), respectively, in the already reconstructed DH state. This *additional state-label comparison was noticed after finding the collisions*. It should motivate a prospective, independently selected readout, rather than be used as a claimed independent p-value.

Under a deliberately simplified iid-uniform GF29 *jet-pair* null with root and derivative marker fixed in advance, a five-page 3+2 partition of the type observed has probability **0.00001161454805**; allowing five or more pages with at most two different values gives **0.00001783981378**. The union upper bound over all **841** field root/marker choices is **0.01500328**, but this is **only a reference model**. It does not account for original ciphertext dependence, the project's enormous wider family of hypotheses, historical selector choice, or this discovery's post hoc interpretation. It must not be reported as the probability of deliberate Cicada construction.

## First complete plaintext-receiver test: five original pages as original-coordinate shares

A natural causal follow-through, conditional on the five-page selector being a real cue, is the **five-share threshold cryptography already present in Cicada's 2013 puzzle**. Test its simplest GP29 analog without tuning a plaintext crib:

1. Use exactly the selected **p16, p28, p33, p34, p38** as the five shares in that order, with **their actual zero-based physical page numbers mod29** as distinct share coordinates **[16,28,4,5,9]**.
2. Preserve the first **214** original rune positions, the shortest source page, and interpolate the unique degree-at-most-four GF29 polynomial at **x=0** at every position. Its forced Lagrange weights are **[18,5,14,11,11]**. No plaintext or external key selects these weights.
3. Test two independently named source recipients: original double-root p29 (the proposed x=0 full-message holdout), and original runeless table p50 at x=50 mod29=21 (held-out sixth share). At x=21, the exact weights are **[17,9,5,27,1]**.
4. Because physical p55 has exactly **76** runes and precedes solved p56, also test the first 76 interpolated symbols as an additive and subtractive GP29 key on all 76 original p55 ciphertext runes.

| Entire untouched receiver | Exact result |
| --- | --- |
| Direct 214-symbol reconstructed zero-share stream | GP29 IoC **0.0335220043**, unreadable |
| Proposed p29 holdout | **9/214** equal predictions; iid expected **7.3793**, no full share consistency |
| Proposed p50 numeric-table holdout | **8/214** equal predictions; iid expected **7.3793**, no full share consistency |
| P55 original ciphertext minus 76-symbol interpolated key | IoC **0.0382456140**, no coherent native GP plaintext |
| P55 original ciphertext plus the same key | IoC **0.0378947368**, no coherent native GP plaintext |
| Genuinely solved p57 76-rune secret planted into five polynomial shares | **76/76** source-native GP symbols exactly recovered; p55-style additive inverse plant also **76/76** |

The exact subtractive p55 output is:

\`\`\`text
EFDXIASRHTLCRCSCXUFNTXOEMYIAJIEOIAIAEANMBHSOEHGHIAEOPIEATHEOEEDSLOSSHCNGEOWOECEANHTHTHIIAMEOWXOEWH
\`\`\`

It is **not** authenticated plaintext. An exact interpolation into a secret always exists for five arbitrary GF29 shares, so the synthetic round-trip establishes implementation accuracy alone. The two independent holdout streams decisively reject the *specific* direct **degree-four common share-polynomial** architecture under original indexed, unshifted page alignment.

## Decision and executable next route

The **five-page/two-state selector** is an exact, original-data structural result and offers a concrete way to pick a **five-page subset without language fitting**. The DH interpretation, despite its compact arithmetic, remains conditional because the cross-page polynomial/derivative operator is nowhere printed as a first-party cipher instruction.

The simplest conventional five-share readout **does not decode p29, p50, or p55**. Do not rescue it with secretly rephased page offsets, fitted field-coordinate origins, new polynomial degrees, or a second arbitrary cipher. The useful next decision is whether an **independent original image or dated Cicada operation actually types five page numbers as a key/route/state**, and if so whether it produces an exact *prospective* symbol or decryptor prediction on untouched p16/p28/p33/p34/p38 data. Absent such an operation, keep this cluster as provisional structural evidence.

**Reproducer and run:** [Windows Node22 CommonJS SFT](../sims/lp2_root24_dh2_fivepage_jet_selector_sft.cjs) · [GitHub Actions PASS 44994344606](https://github.com/FlareZ123/liber-primus/actions/runs/44994344606). It asserts the source p39 red triad, p29 and table double-root inputs, p28 DH equations, the complete 841-case census, five original page IDs/states, exact all-original Shamir and p55 readouts, and source-native positive-control recovery.