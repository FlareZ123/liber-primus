# Red p0 heading: source-derived `RATIO`, conditional `SEQUENDI`

**Agent 28, 18 November 2026. Classification:** the final five red runes now have a route-independent candidate decryption `RATIO` under a source-derived 27×27/totient construction. The first eight `SECUENDI` remain conditional on the external route's MAP geometry. This is stronger than the earlier all-route-conditional title, while the full `SEQUENDI RATIO` phrase is still not authenticated LP2 plaintext.

## Result

The original physical p0 heading is exactly 13 red GP29 runes in an 8+5 grouping:

```
S H E O G M IA F | S Y E NG C
```

The original image also has the large 13-dot red punctuation event immediately after those 13 runes. The canonical p0-p2 corpus begins with the same 13 symbols.

The final five runes can now be keyed without any candidate route or plaintext transition. The first eight still use the external route's later `MAP` geometry. Together the two constructions decrypt the untouched red heading to:

```
S E C U E N D I | R A T I O
```

The GP C/K rune gives the literal canonical transliteration **SECUENDI RATIO**; reading that rune as Latin Q gives **SEQUENDI RATIO**. The phrase is naturally Latin for a method, procedure, or plan of following. This semantic interpretation is secondary to the exact GP29 arithmetic.

The important new evidence is selectivity. The two keys are not arbitrary keys reverse-engineered directly from the heading in the reproducer below.

There is also a previously undocumented arithmetic checksum on the recovered title itself. Its 13 plaintext rune indices sum to **156**, exactly

\`\`\`
156 = 13 × phi(13) = 13 × 12.
\`\`\`

Thus the source-visible title length, the opening coordinate \`J=(13,12)\`, and the recovered title's complete index sum all reuse the same 13/12 pair. This equality was not used to derive either key or to choose the candidate Latin reading.

## First key: unique rectangle under the published geometry

The red count gives the route's opening coordinate `J=(13,phi(13))=(13,12)`. Block 28's frozen original source is the vertical three-cell node:

```
EO(15,9) - X(16,9) - I(17,9)
```

Before inspecting the red plaintext, enumerate every rectangle whose right side is column 9, strictly spans that three-cell MAP source, has X at its upper-left and lower-right corners, and places those two X corners at equal squared distance from J.

Exactly **one** rectangle exists in the original 27×27 matrix:

```
(6,3) X ----- (6,9) N
  |               |
  |               |
(24,3) C ---- (24,9) X
```

Reading clockwise from the upper-left gives the unique four-rune key `X-N-X-C`. Reverse only the first eight red ciphertext runes and subtract that repeated key modulo 29:

```
F IA M G O E H S
X N  X C X N X C
----------------
S E  C U E N D I
```

Forward addition reconstructs the exact original eight red runes.

A route-internal control strengthens the specificity: among all **17** frozen vertical three-rune source nodes in the first 38 blocks, apply the same rule with each node's own center rune at the two opposite corners. **Only block 28 (MAP) admits any such rectangle**, and it admits exactly the one above.

This is a genuine source-selectivity improvement over simply supplying `X-N-X-C` as a fitted key. It is still conditional on accepting the route's J anchor and MAP source.

## Second key: source-derived 5-stride totient chain

This key no longer needs MAP.

The canonical p0-p2 span contains exactly **729 = 27²** runes, so it can be placed row-major into a 27×27 matrix without padding. The physical red heading is visibly grouped **8+5** and is followed by a **13-dot** rubricated delimiter. Let `n=13`; the already-authenticated LP instruction that the totient function is sacred supplies `phi(13)=12`. Using the ordered pair `(n,phi(n))` gives:

```
J = (13,12)
```

and the original grid rune at that coordinate is J.

Now use only the visible length **5** of the final red group as a diagonal stride. From J, test both signs on row and column, taking two equal five-cell steps. All four directions remain in bounds. Exactly one direction has the source-internal totient relation `phi(rune(middle)) = rune(end)`:

```
(13,12) J  ->  (18,17) R  ->  (23,22) TH
                 +5,+5             +5,+5

phi(index(R)) = phi(4) = 2 = index(TH)
```

Transforming only the center therefore gives the three-rune key `J-TH-TH`. Subtracting it from the untouched final five red runes:

```
S  Y  E  NG C
J  TH TH J  TH
--------------
R  A  T  I  O
```

Forward addition exactly restores the source.

This construction uses the original 729-rune span, original 8+5 grouping, original 13-dot count, and the authenticated totient operation. It does not use MAP, the candidate English route, or the later transition grammar. A coordinate-order control remains important: swapping `(n,phi(n))` to `(phi(n),n)` also creates a southeast three-cell phi-chain, but its derived key decrypts the five red runes to `AE-R-AE-TH-EO`, not `RATIO`. The source-derived convention is therefore the ordinary ordered pair `(n,phi(n))); this convention sensitivity is a remaining assumption.

Reproducer: `sims/lp2_p0_red_ratio_sourceonly_sft.cjs`.

## Independent MAP-route corroboration of the same node

The earlier external construction uses the block-28 MAP source center `M=(16,9)` and `E=(17,13)`. In the current frozen 38-block route this is the three-rune `MAP` prefix endpoint. Crucially, standalone stage 28 `MAP` was already published on **26 October 2026** (`plaintext-i-found/28-map.md`), four days before the first red-heading report on **30 October 2026**. The 30 October route snapshot describes MAP ending at `AE(17,13)`. The later `MAP LIFE` extension first appears on **4 November 2026**. Thus `(17,13)` was the selected stage endpoint when this heading construction was published, rather than a semantic boundary chosen retrospectively from the later seven-rune block. Apply two deterministic affine extrapolations:

```
R = 2E - M = (18,17)
T = 2R - J = (23,22)
```

The original grid has `R` at `(18,17)` and `TH` at `(23,22)`. Since the rune index of R is 4 and `phi(4)=2=TH`, the node

```
J - R - TH
```

becomes the key

```
J - TH - TH
```

after the route's center-totient operation. Subtracting it from the untouched final five red runes gives `R-A-T-I-O`, and forward addition exactly restores the source.

The selectivity test applies the same `R=2E-M; T=2R-J` construction to **every prefix endpoint of every frozen first-38 route block with one three-cell source node**, before reading the red suffix. There are 20 cases whose extrapolated R and T remain inside the 27×27 matrix. Exactly **one** has `phi(rune(R)) = rune(T)`: block 28 at prefix length 3, the MAP boundary.

This independently lands on the same `J-R-TH` node selected by the source-only five-stride construction. The MAP chronology therefore acts as corroboration of the node rather than a necessary input to the `RATIO` decryption.

## What this changes

The shared repository previously established that the first 38 externally selected blocks are arithmetically reproducible on all 115 selected original rune reads while the transition grammar leaves multiple admissible continuations. That conclusion remains valid.

The material change is narrower and more useful: **the final five red runes no longer depend on those transitions.** Their `RATIO` key can be generated from the exact 729-rune source span, the physical 13-dot/8+5 rubrication, and Euler's totient. The previously published MAP geometry independently lands on the same `J-R-TH` node and predates the heading discovery.

The first eight runes remain weaker. Their `SECUENDI` key still depends on the candidate MAP source and its rectangle rule, though that rectangle is MAP-only across all 17 comparable vertical sources.

The surviving weaknesses are concrete:

- The 27×27 reshape follows exactly from 729 runes, but the manuscript does not literally say to reshape the first three pages into a square.
- The source-only `RATIO` derivation assumes the natural ordered coordinate `(n,phi(n))`; the swapped coordinate order produces a different phi-chain and nonword output.
- The first key's rectangle rule still depends on the candidate MAP source.
- Reports 17-19 do not remove the already demonstrated earlier THE/YE key ambiguity.

Therefore the full title remains in `im-results/`. The five-rune `RATIO` recovery is the best route-independent plaintext candidate found here and deserves independent adversarial reproduction. The next causal target is the first eight runes: derive `X-N-X-C` from original visible 8+5/13/27 geometry without MAP, or produce a prospective untouched prediction from the same construction.

## Reproduction

Run:

```
node sims/lp2_p0_red_heading_sequendi_ratio_gate_sft.cjs
```

Two SFTs now separate source-only evidence from route-conditional evidence. `sims/lp2_p0_red_ratio_sourceonly_sft.cjs` uses only the canonical p0-p2 source and physical red annotation to derive `RATIO`. `sims/lp2_p0_red_heading_sequendi_ratio_gate_sft.cjs` adds the frozen first-38 route arrays and asserts the unique first-key rectangle, the 17-source route-wide rectangle control, the independent MAP extrapolation to the same second-key node, both exact re-encryptions, and the `156 = 13 × phi(13)` full-title checksum.

External numerical proposal credited for the candidate red-heading constructions:
https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption
Current external main inspected during this audit: `81ae3c885d8bf6f1e5b0cfde060531d9637fba79`.
Historical chronology inspected: standalone `plaintext-i-found/28-map.md` first appears at `d6d82764bae48db306fd779c0d555f15260f8343` (26 October 2026); the red-heading snapshot `ca96de9d14a9743cd6d53c612e41f4919a52b3bb` is from 30 October and uses MAP ending at `AE(17,13)`; `plaintext-i-found/28-map-life.md` first appears at `2f0c928e14d1338ea3f60ff0d19ffbd98900def8` (4 November 2026).
