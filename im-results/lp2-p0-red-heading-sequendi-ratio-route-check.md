# p0 red heading: raw 13-rune geometry, MAP-free first-key narrowing, and the Latin-register blocker

**Agents 28 and 29, 18 November 2026. Classification:** intermediate evidence with a substantially stronger internal checksum structure. A source-selected 27×27/totient construction reproducibly yields the final five raw runes `R-A-T-I-O`. Agent29 found that the physical 13-dot mark's **4-5-4** stencil supplies a length ladder `3,4,5,8,13` matching the second key, first key, second word, first word, and full title. The GP-index sums of those same five objects are `15,42,57,99,156`, an exact additive recurrence, with the final 156 independently closing as `13*phi(13)`. This recurrence selects the same `X-N-X-C` first-key rectangle from a finite anchor-symmetry family without MAP and without a numeric 3:1 aspect guess. Exact forward reconstruction yields the raw 13-rune candidate `S-E-C-U-E-N-D-I | R-A-T-I-O`. The Latin reading remains blocked by source-English GP orthography, although one coherent direct Latin-letter register matches all 13 raw runes. No authenticated runic Latin control yet selects that register, so plaintext status remains unproved.

## Original marked region

The physical p0 red heading is exactly 13 GP29 runes in an 8+5 grouping:

```
S H E O G M IA F | S Y E NG C
```

It is followed by a large red 13-dot delimiter. The canonical p0-p2 corpus begins with those 13 runes.

The first eight runes have the published route-conditional output:

```
S E C U E N D I
```

The final five have the source-derived geometric output:

```
R A T I O
```

These rune sequences are exact arithmetic outputs. Their interpretation as Latin words is a separate claim and is constrained by GP orthography.

## The delimiter system uniquely selects a 27×27 span

Across LP2 there are nine page-start red title spans immediately followed by a red 13-dot mark. Eight have a later red 13-dot mark and therefore define a finite title-start-to-next-red13 span.

Those eight rune counts are:

```
729, 119, 20, 1021, 1433, 91, 308, 85
```

Only the first is a perfect square:

```
p0 title start -> p2 terminal red13 = 729 = 27² runes
```

Thus the manuscript's own rubrication uniquely identifies the p0-p2 span as square-sized among the comparable red-title/red13 sections. Reshaping that selected span row-major is still an interpretive step, but choosing the first three pages after noticing 729 is no longer necessary.

## Source geometry for the final five runes

Let the visible red delimiter count be `n=13`. Solved LP explicitly states that the totient function is sacred, so:

```
phi(13) = 12
```

Use the ordered coordinate `(n,phi(n))=(13,12)` in the 27×27 matrix. The original rune there is **J**.

The final red group has visible length 5. Use 5 as a diagonal stride and test all four sign directions for two equal steps from J. Exactly one direction satisfies the internal relation `phi(rune(middle)) = rune(end)`:

```
J(13,12) -> R(18,17) -> TH(23,22)
              +5,+5            +5,+5

phi(index(R)) = phi(4) = 2 = index(TH)
```

Applying the center-totient operation gives:

```
J - R - TH  ->  J - TH - TH
```

Subtract that repeating key modulo 29 from the untouched final five red ciphertext runes:

```
S  Y  E  NG C
J  TH TH J  TH
--------------
R  A  T  I  O
```

Forward addition exactly reconstructs the source.

The coordinate-order control matters. Swapping the anchor to `(phi(n),n)=(12,13)` also produces a southeast phi-chain, but its derived key outputs `AE-R-AE-TH-EO`. The natural ordered-pair convention therefore remains one assumption.

Reproducer: `sims/lp2_p0_red_ratio_sourceonly_sft.cjs`.

## Orthography and register blocker

The source-calibrated GP spelling gate, `sims/lp2_native_gp_source_orthography_sft.cjs`, reconstructs 181 consecutive authenticated solved LP1 words exactly and independently reconstructs all 95 clear LP2 p57 runes.

Two source-attested conventions matter here. Solved English prints `IO` as the single GP ordinal-27 rune, canonical label `IA` / IOR; the aligned LP1 sample contains nine `IO` occurrences and all nine use that rune. Source English also encodes `QU` as `C-W`; the script's literal `QUESTION` control reconstructs original `C-W-E-S-T-IA-N`.

The demonstrated English register therefore encodes the proposed reading as:

```
SEQUENDI RATIO
S E C W E N D I | R A T IA
```

which is 12 runes. The arithmetic output is:

```
S E C U E N D I | R A T I O
```

which is 13 runes. The mismatch affects both words.

A single coherent alternative register fits exactly: encode Latin letter by letter, retain `U` and separate `I,O`, and map unavailable `Q` to the existing C/K rune. That direct-Latin register maps `SEQUENDI RATIO` to the exact raw 13-rune sequence. This is a falsifiable register hypothesis, not an authenticated rule. No known solved runic Latin sample containing decisive `QU` or `IO` cases currently selects it.

Treat the raw rune output as stronger evidence than its linguistic interpretation. `SEQUENDI RATIO` remains a candidate reading until an independent source selects the Latin register or the same register predicts untouched original ciphertext.

Reproducer: `sims/lp2_p0_red_heading_raw13_register_geometry_sft.cjs`.

## First eight: anchor symmetry plus an additive checksum chain

The original-image punctuation census, `sims/lp2_original_color_dots_census_sft.py`, establishes that every physical 13-dot mark uses the same **4-5-4** column stencil. At p0 that gives five natural counts:

```
3  = number of columns
4  = one outer-column height
5  = center-column height
8  = both outer columns together
13 = all dots
```

Those counts exactly match the primitive object lengths in the candidate construction:

```
3  = J-TH-TH second key
4  = X-N-X-C first key
5  = final red word
8  = first red word
13 = complete red title
```

This correspondence is source-visible and removes the earlier need to interpret `RATIO` as a literal numeric 3:1 rectangle instruction.

Use only the source-derived anchor `J=(13,12)` and the mark's bilateral symmetry. Enumerate every pair of equal original runes that can serve as opposite corners of an axis-aligned rectangle and are at equal squared distance from J. Across the complete 27×27 p0-p2 source grid there are exactly **72** such symmetric rectangles.

The final-five source derivation already fixes two numerical objects before the first word is touched:

```
sum(J-TH-TH) = 15
sum(R-A-T-I-O) = 57
```

The visible title itself has the additive length relation `5+8=13`, so test the corresponding backward additive sum rule. If the second plaintext sum is the sum of the two key sums, the first-key corner sum must be:

```
57 - 15 = 42
```

Only **two of the 72** symmetric rectangles have corner sum42:

```
rows 6..24, cols 3..9   -> X-N-X-C
rows 9..14, cols 5..20  -> G-H-G-OE
```

A useful held-out property appears here: **both** sum42 survivors have exact 3:1 aspect ratios, even though aspect ratio was not used to construct the 72-rectangle family or to select sum42. Only 9 of the 72 symmetric rectangles are 3:1. Thus the earlier `RATIO -> 3:1` observation reappears downstream as a consequence rather than an input.

Continue the same recurrence one term. The first plaintext must then have sum:

```
42 + 57 = 99
```

For those two rectangles, exhaust every corner start, clockwise/counter-clockwise traversal, forward/reversed first ciphertext, and plus/minus GP29 arithmetic. This is 64 configurations. Exactly **eight** have plaintext sum99, and **all eight use the X-N-X-C rectangle with subtraction**. They collapse to four distinct rune sequences:

```
SECUENDI
IDNEUCES
UORDNGXPL
LPXNGDROU
```

Exactly two symmetry-equivalent configurations give `SECUENDI`; both reverse the original first-word ciphertext and use the same repeating `X-N-X-C` key. Forward addition exactly reconstructs the source.

The selection above does **not** use the full-title sum. After selecting X-N-X-C and the sum99 first-word family, the resulting complete candidate closes on:

```
15, 42, 57, 99, 156
    15+42=57
       42+57=99
          57+99=156

156 = 13 * phi(13)
```

Thus `156=13*12` is now a held-out closure of the recurrence rather than the selector that found the rectangle.

The remaining premise is geometric: why should equal-rune opposite corners equidistant from the source anchor define the first key? The symmetric 4-5-4 mark and the already-source-derived J anchor motivate that finite family, while no signed Cicada instruction explicitly states the rule. This is materially stronger than the previous 3:1 interpretation, but it remains intermediate evidence until the same mechanism predicts untouched original ciphertext or a source clue names the symmetry operation.

## Independent MAP corroboration of the same second-key node

The published stage-28 MAP source center is `M=(16,9)`, with endpoint `E=(17,13)`. The affine extrapolation:

```
R = 2E - M = (18,17)
T = 2R - J = (23,22)
```

lands on the same original `R,TH` pair used by the source-only 5-stride construction. Across every eligible prefix endpoint of the frozen first-38 route, 20 extrapolations remain in bounds and exactly one satisfies `phi(rune(R))=rune(T)`: stage 28 MAP at its three-rune endpoint.

Chronology reduces hindsight concerns:

- standalone stage-28 `MAP` first appears on **26 October 2026** at commit `d6d82764bae48db306fd779c0d555f15260f8343`;
- the red-heading report first appears on **30 October 2026**;
- `MAP LIFE` first appears on **4 November 2026** at commit `2f0c928e14d1338ea3f60ff0d19ffbd98900def8`.

Thus MAP and its endpoint predate the red-heading construction. This corroborates the geometry while leaving the route's earlier transition ambiguity unresolved.

## Full-title checksum: held-out recurrence closure

The complete raw candidate has GP29 index sum156. In the strengthened construction, 156 is not used to select a rectangle or first-word sum. The recurrence is driven backward from the independently derived second key and second raw word:

```
K2 = 15
P2 = 57
K1 = P2 - K2 = 42
P1 = K1 + P2 = 99
```

Only after those choices are made does the full title give:

```
P1 + P2 = 156 = 13 * phi(13)
```

The exact closure is therefore a genuine internal cross-check of the declared recurrence family. The recurrence itself was discovered after the candidate heading existed, so it still requires prospective validation before it can authenticate plaintext.

## Current decision

The strongest current chain is:

1. original rubrication uniquely selects the 729-rune p0-p2 square-sized span;
2. original counts plus totient give the selective `J-R-TH` diagonal and exact five-rune output `R-A-T-I-O`;
3. the physical 4-5-4 mark yields the object-length ladder `3,4,5,8,13`;
4. the corresponding objects have sums `15,42,57,99,156`, an exact additive recurrence;
5. inside all 72 equal-rune/equidistant-J rectangle symmetries, the recurrence first reduces the first key to two sum42 rectangles and then uniquely selects the `X-N-X-C` rectangle through the required first-word sum99;
6. complete-word orientation yields exact raw `S-E-C-U-E-N-D-I` and exact forward reconstruction;
7. the full-title sum closes independently at `156=13*phi(13)`;
8. the older MAP route independently lands on the same geometry;
9. source-English GP orthography still rejects the straightforward Latin spelling, while one coherent direct Latin-letter register matches all 13 raw runes exactly.

The raw 13-rune construction is now substantially more constrained and internally self-consistent. The remaining decisive gaps are the geometric symmetry rule and the Latin spelling register. A prospective untouched-cipher prediction or authenticated runic-Latin control is required before calling the title solved.

## Reproduction

Run:

```
node sims/lp2_p0_red_ratio_sourceonly_sft.cjs
node sims/lp2_p0_red_heading_raw13_register_geometry_sft.cjs
node sims/lp2_p0_red_heading_sequendi_ratio_gate_sft.cjs
python sims/lp2_original_color_dots_census_sft.py
```

The first script derives the five-rune raw output and square selector. The Agent29 script now enumerates all 72 source-anchor symmetric rectangles, proves the `15,42,57,99,156` additive chain, selects X-N-X-C without a 3:1 aspect assumption, verifies the held-out `13*phi(13)` closure, checks exact reencryption, and reproduces the source-native/direct-Latin register split. The third preserves MAP-route corroboration. The image census independently establishes the physical 4-5-4 stencil.

External numerical proposal credited for the candidate heading constructions:
https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption

Historical red-heading snapshot inspected: `ca96de9d14a9743cd6d53c612e41f4919a52b3bb` (30 October 2026).
