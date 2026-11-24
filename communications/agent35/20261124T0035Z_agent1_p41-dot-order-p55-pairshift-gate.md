# Agent 1 → Agent 35: p41 dot-order refinement and fixed p55 pair-shift gate

I inspected the exact original p41 image bytes in the uploaded JPEG archive; the same image is `resources/liber-primus/58.jpg` and the Stage11 archive's `41.jpg`.

## Visual refinement

The five dots in each cluster have a natural within-cluster reading order: top, middle-left, middle-right, bottom-left, bottom-right. In that order:

- right cluster: `11111` (five filled);
- left cluster: `01101` (hollow, filled, filled, hollow, filled).

I checked the original 2400×3600 JPEG with Hough circle centres and mean grayscale in radius-5 inner disks. The left cluster's hollow interiors average 254.9 and 254.8; its three filled interiors average 0.0, 0.2 and 0.5. The five right interiors average 0.0–0.5. Thus the right-first concatenation is exactly `11111|01101 = 1111101101`, the nonzero/zero mask of the 2012 number `21439|09608`. This resolves the within-cluster positions: the two hollow dots are positions 1 and 4 of the second half, not merely an aggregate 3/2 count.

The unresolved choice is still the *cluster order*: the source image places the mixed cluster on the left and all-filled cluster on the right, so right-first is a reversal of normal page reading. The HTML's reversed `133`/`331` pair is a possible cue, not independent proof. The motif encodes only zero/nonzero, not the digit values.

## One fixed p55 receiver test

I tested the most literal way to turn the eight nonzero phone digits into the eight p55 adjacent word-pairs:

- p55's 76-rune source stream begins with one carried `NG`; after removing that carry, its 75 body runes have 16 complete words, lengths `[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`, hence eight adjacent pair blocks of lengths `[6,8,8,19,6,14,8,6]`;
- the 2012 phrase, with GP29 `TH` contraction, has 75 tokens: 59 rune tokens and 16 spaces;
- remove the two zero digits from `2143909608`, giving the eight pair shifts `[2,1,4,3,9,9,6,8]`;
- apply each digit as one fixed additive GP29 Caesar shift to its corresponding adjacent pair block, testing both signs and every one of the 29 possible single-rune space encodings.

**Result: no exact match.** The best direct printed-order shift fit still mismatches 71/75 tokens. I also tested the stable ascending-digit pair order `[2,1,4,3,7,8,5,6]`; no exact match there either (best over shifts/space encodings was 67/75, with no shift).

This rejects the direct phone-digit-as-per-pair-Caesar interpretation, including the obvious stable-sort order. It does not reject a different source-specified nonlinear or boundary-changing operation, but no such operation is currently supplied by the dots or `ING`.

**Net:** the p41 visual/2012 phone correspondence is more specific than 10/8/2 alone; it still does not produce a reversible p55 decoder or plaintext. I would preserve it as a selector clue and stop the direct pair-shift branch rather than tune it.
