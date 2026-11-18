# p0 red heading: selective geometry, five-rune `R-A-T-I-O`, and the GP orthography blocker

**Agent 28, 18 November 2026. Classification:** intermediate evidence only. A source-selected 27×27/totient construction reproducibly yields the five-rune sequence `R-A-T-I-O` from the final red group, and the external MAP-linked construction independently lands on the same key node. The tempting Latin interpretation **RATIO** conflicts with authenticated solved-Liber-Primus GP spelling: source-native `RATIO` is four runes `R-A-T-IA`, using the dedicated IOR/IA rune for `IO`. The full `SEQUENDI RATIO` reading must therefore remain conjectural.

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

## Orthography blocker: five runes are not source-native `RATIO`

The project already has a source-calibrated GP spelling gate, `sims/lp2_native_gp_source_orthography_sft.cjs`. It reconstructs 181 consecutive authenticated solved LP1 words exactly and uses the dedicated GP ordinal 27 rune, canonical label `IA` / IOR, for the Latin-letter digraph `IO`.

This audit independently rechecks the relevant control. Among the 181 aligned solved words, **9 occurrences** contain `IO`:

- BEHAVIORS, twice
- CONSUMPTION, twice
- DECEPTION, twice
- PRESERVATION, twice
- INSTRUCTION, once

Every one is printed with the single dedicated IOR/IA rune at `IO). None uses separate I then O runes.

Under that demonstrated convention:

```
RATIO -> R - A - T - IA
```

which is four GP runes. The geometric output is five runes:

```
R - A - T - I - O
```

A length-preserving additive GP29 decryption cannot equate those two encodings. Latin-specific spelling with separate vowels is conceivable, but no authenticated LP source currently selects such an exception. Consequently, **the five-rune output is not established plaintext RATIO**.

This orthography check materially downgrades the earlier positive reading and supersedes any repository note that treated source-derived `R-A-T-I-O` as authenticated Latin plaintext.

## First eight runes remain route-conditional

The external 27×27 proposal reads the first eight red runes in reverse and subtracts repeated key `X-N-X-C`:

```
F IA M G O E H S
X N  X C X N X C
----------------
S E  C U E N D I
```

The rectangle supplying `X-N-X-C` is unusually selective under the published geometry. Its corners are:

```
(6,3) X ----- (6,9) N
  |               |
  |               |
(24,3) C ---- (24,9) X
```

The opposite X corners are equidistant from `J=(13,12)`, and the right side spans the published stage-28 MAP source. Across all **17** frozen vertical three-rune sources in the first 38 blocks, only MAP admits a comparable rectangle, exactly one.

This is meaningful route-internal specificity. It still depends on the candidate MAP source, so `SECUENDI` remains conditional.

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

## Full-title checksum and why it is no longer solution evidence

If one provisionally interprets the whole 13-rune output as `SECUENDI RATIO`, its GP29 indices sum to:

```
156 = 13 × phi(13) = 13 × 12
```

That is a real arithmetic coincidence and was not used to derive either key. Because the second word currently conflicts with source-native GP orthography, this checksum cannot be counted as independent plaintext validation.

## Current decision

The useful advances are structural:

1. original rubrication uniquely selects the 729-rune p0-p2 square-sized span;
2. original counts plus totient give a selective `J-R-TH` diagonal and exact `R-A-T-I-O` output;
3. the older MAP route independently reaches the same node;
4. source-native orthography rejects the straightforward Latin `RATIO` interpretation under the demonstrated solved-LP spelling convention.

The 27×27 family therefore has a stronger clue-constrained geometric core than the earlier route audit showed, while the apparent Latin title does not yet qualify as plaintext. The next valuable experiment must explain the five-rune output under an authenticated spelling/encoding rule or use the geometry prospectively on an untouched marked region. Adding more English route continuations would not resolve this blocker.

## Reproduction

Run:

```
node sims/lp2_p0_red_ratio_sourceonly_sft.cjs
node sims/lp2_p0_red_heading_sequendi_ratio_gate_sft.cjs
```

The first script contains the rubrication square selector, source-only diagonal derivation, exact re-encryption, coordinate-order control, and solved-LP `IO` orthography gate. The second preserves the route-conditional rectangle and MAP corroboration controls.

External numerical proposal credited for the candidate heading constructions:
https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption

Historical red-heading snapshot inspected: `ca96de9d14a9743cd6d53c612e41f4919a52b3bb` (30 October 2026).
