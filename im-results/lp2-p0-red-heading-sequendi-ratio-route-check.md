# p0 red heading: raw 13-rune geometry, MAP-free first-key narrowing, and the Latin-register blocker

**Agents 28 and 29, 18 November 2026. Classification:** intermediate evidence only. A source-selected 27×27/totient construction reproducibly yields the five-rune sequence `R-A-T-I-O` from the final red group. Agent29 adds a finite MAP-free family that narrows the first-word rectangle to the same `X-N-X-C` geometry once the five-rune output is provisionally treated as an instruction to inspect a ratio. The complete raw candidate becomes `S-E-C-U-E-N-D-I | R-A-T-I-O`, with exact forward reconstruction under both keys. Authenticated solved-LP English spelling would encode the proposed Latin reading in 12 runes, while one coherent direct Latin-letter register encodes exactly these 13 runes. No authenticated runic Latin sample selects that register, and the ratio-to-rectangle interpretation remains inferred, so the full title is still conjectural rather than recovered plaintext.

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

## First eight: a finite MAP-free rectangle family

The original-image punctuation census, `sims/lp2_original_color_dots_census_sft.py`, establishes that all 31 physical 13-dot marks use the same **4-5-4** column stencil. At p0 the two outer columns contain **8** dots total and the center column contains **5**, exactly matching the red title's visible **8+5** grouping.

Provisionally treat the already-derived five-rune output `R-A-T-I-O` as the instruction word `RATIO`. The mark has three columns, so test the smallest integer rectangle aspect ratio it supplies, **3:1**, while retaining the independently source-derived anchor `J=(13,12)`. Across the complete original 27×27 grid, enumerate every axis-aligned 3:1 or 1:3 rectangle for which one opposite-corner pair carries the same original rune and those equal corners are equidistant from J. Admit either diagonal.

Exactly **nine** structural candidates survive, with UL-UR-LR-LL corner runes:

```
U-G-P-G
U-B-IA-B
P-Y-P-S
M-N-A-N
X-N-X-C
AE-W-C-W
N-X-N-EA
G-H-G-OE
B-W-B-L
```

The source does not specify a corner start, traversal direction, ciphertext direction, or arithmetic sign. Exhausting all small choices gives **288 configurations** and **144 distinct eight-rune outputs**. Exactly two symmetry-equivalent configurations produce raw `SECUENDI`; both use rows 6..24, columns 3..9, repeating key `X-N-X-C`, reversed first-word ciphertext, and GP29 subtraction. The duplicate only names the start at the other identical X corner. Forward addition exactly reconstructs the reversed original first word.

The source scalar `13*phi(13)=156` adds a later finite checksum. The five-rune raw output has GP-index sum57, so a full-title sum156 requires first-word sum99. Across all 288 configurations, exactly **eight** satisfy sum99 and every one belongs to the `X-N-X-C` rectangle; all use subtraction. Complete-word recognition then chooses `SECUENDI` from the remaining symmetric orientations.

This removes MAP as a prerequisite for locating the first-key rectangle. It does not authenticate the mechanism. The `RATIO` interpretation, the marker's three columns as a 3:1 instruction, and the 156 checksum were recognized after the candidate heading existed, so they are finite discriminators rather than independent first-party instructions.

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

## Full-title checksum: selective but post hoc

The complete raw 13-rune candidate has GP29 index sum:

```
156 = 13 * phi(13) = 13 * 12
```

This equality was not used to derive the five-rune `J-TH-TH` key. Inside the later MAP-free 3:1 rectangle family it selects the `X-N-X-C` rectangle through the first-word target sum99. Because the equality was noticed after the candidate title and the 3:1 family itself is conditional on a `RATIO` interpretation, it remains an internal checksum rather than independent plaintext validation.

## Current decision

The useful advances are structural:

1. original rubrication uniquely selects the 729-rune p0-p2 square-sized span;
2. original counts plus totient give a selective `J-R-TH` diagonal and exact `R-A-T-I-O` output;
3. a finite MAP-free 3:1 rectangle family narrows the first key to the same `X-N-X-C` geometry, with exact `S-E-C-U-E-N-D-I` output under the complete-word orientation;
4. the older MAP route independently corroborates the same geometry;
5. authenticated solved-LP English orthography rejects the straightforward source-native spelling of the candidate Latin phrase, while one coherent direct Latin-letter register matches all 13 raw runes exactly.

The strongest current object is the **raw 13-rune candidate and its geometry**, not authenticated Latin plaintext. The next causal test should find an independent source for the direct Latin register or make a prospective untouched ciphertext prediction from the title geometry. More retrospective English route continuation does not resolve the register or selector problem.

## Reproduction

Run:

```
node sims/lp2_p0_red_ratio_sourceonly_sft.cjs
node sims/lp2_p0_red_heading_raw13_register_geometry_sft.cjs
node sims/lp2_p0_red_heading_sequendi_ratio_gate_sft.cjs
python sims/lp2_original_color_dots_census_sft.py
```

The first script derives the five-rune raw output and square selector. The new Agent29 script enumerates the MAP-free rectangle family, all 288 orientation/sign choices, the post-hoc checksum gate, the source-native English encoding conflict, the direct Latin-register fit, and exact forward reconstruction. The third preserves MAP-route corroboration. The image census independently establishes the physical 4-5-4 stencil for all 13-dot marks.

External numerical proposal credited for the candidate heading constructions:
https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption

Historical red-heading snapshot inspected: `ca96de9d14a9743cd6d53c612e41f4919a52b3bb` (30 October 2026).
