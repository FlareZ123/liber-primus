# P27 title/table fold: reproducible p53 coincidence, unresolved selector

**Evidence class:** exact source arithmetic with a conditional navigation hypothesis and a bounded selector-dependence audit (11 November 2026). No original instruction uniquely selects the proposed p53 word-26/B route. **No unknown LP2 plaintext, key, cipher mechanism or destination has been recovered.**

## Upstream selector

The source-visible route already recorded in `im-results/p55-fold-fragment18-p27-title.md` uses the literal **FOLD** clue on physical p55. Its five-position mismatch mask is `10010₂ = 18`, and one-based thirteen-dot fragment 18 is exactly the 19-rune red title at p27 local 0–18.

This note asks what the same literal operation does to that selected title, without choosing a cipher family.

The canonical title indices are:

`[19,13,26,20,15,3,24,25,8,20,18,12,10,19,20,20,15,5,13]`

Pair the nine positions equidistant from the title centre. Mark a pair with 1 exactly when the two GP indices are equal. There is one equality, at the fourth pair:

`000100000₂`

Read in printed left-to-right order this is **32**; read in the reverse direction it is **8**. Those are exactly the physical dimensions of the printed base-60 byte table: **32 rows × 8 columns**.

This 32/8 result is unique among odd-length original red spans in the current annotation, and p27 is the only 19-rune red span. **It is one event read twice, not two independent hints:** one equality at the fourth of nine mirrored comparisons gives 32 forward and 8 backward automatically. The artifact does not prescribe an equality predicate, nine-bit binary or reading both directions as table dimensions.

## Fold the selected 32x8 table

Use the dimensions literally and fold the 32 table rows top-to-bottom, pairing row 1 with 32, row 2 with 31, ..., row 16 with 17 while preserving columns. This makes **128 paired cells**.

Across those 128 comparisons there is exactly **one byte equality**:

- one-based rows **16 and 17**
- one-based column **3**
- folded row-major cell **123**
- printed token **`1Q`**
- byte value **86**

The other simple geometric folds are less specific: the left/right fold has no equal byte pairs, and the 180° pairing has none.

The 128-cell folded size independently matches physical p53's exact ink boundary: **128 black runes followed by 51 red runes**.

## Fixed p53 alignment

Align the 128 folded cells row-major with p53's 128 black runes, with no phase or offset.

The unique equal table cell is folded index 122 zero-based, so it lands on p53 local rune 122. That position is exactly the final rune of printed **word 26**, whose GP indices are:

`[12,1,17]`

and whose GP-prime sum is:

`41 + 3 + 61 = 105`

The matched grid token closes on that word in several source-native ways:

1. The low base-60 digit of `1Q` is **Q = 26**, exactly the selected p53 word ordinal.
2. The grid match is at one-based **column 3**; p53 word 26 has length **3**, so that column selects its final rune.
3. That selected rune is GP index **17** (B), exactly the lower matched grid row number **17**.
4. The upper/lower row difference is **1**, matching the high base-60 digit of `1Q`; the difference is structurally forced by the collision at adjacent middle rows 16/17.
5. The selected word's GP-prime sum is **105**, and **105 mod 29 = 18**, returning to the upstream p55 fold selector.
6. **86 + 19 = 105**: matched byte plus p27 title length equals the selected p53 word's GP-prime sum. This **entails** point 5: (86+19) mod29 = 18. It is one arithmetic relation rather than two independent checks.

This is a closed, finite navigation relation across the p55 fold, the p27 red title, the physical 32×8 table, and p53's black/red boundary. It identifies a single p53 word and a single rune without language scoring or a fitted cipher phase.

## P27/p55 bookend cross-link

The unique duplicated adjacent two-word pair in the LP2 ciphertext is `DJU-BEI`, at p27 local 28–33 and again at p55 local 70–75.

Those starts differ by **42**, and the matched grid byte satisfies **86 + 42 = 128**, the exact p53 black-prefix length. This arithmetic is retained only as a secondary cross-link because the offset convention is less direct than the word/letter closure above.

Two local p53 boundary facts also overlap that bookend: word 19 begins with GP `J,U`, and selected word 26 ends with `U,B`. A forced seven-word continuation did not recover the remaining bookend material, so no recursive seven-step claim is made.

## Conditional shuffled-table diagnostic

To measure how selective the p53 closure is under a narrow null, preserve the original 256-byte multiset, uniformly Fisher-Yates shuffle the table cells, retain the same 32×8 shape and vertical fold, and keep the p53 words fixed.

For **200,000** deterministic shuffles (xorshift32 seed `0x45f01829`):

- **60,859** shuffles had exactly one vertical-fold byte equality.
- **34** also had the matched cell at a p53 word end, with matched byte modulo 60 equal to that word ordinal and the word's GP-prime sum congruent to 18 mod 29.
- **20** additionally satisfied the coordinate closure: column equals word length, selected rune index equals the lower row number, and byte high digit equals the row difference.

The add-one frequencies are approximately **1.75×10⁻⁴** for the base closure and **1.05×10⁻⁴** for the coordinate closure.

These are **conditional diagnostics, not discovery-wide p-values**. The operation chain was discovered from the available source material, so this test does not quantify the probability that the entire route arose by chance.

## Selector-dependence decision (Issue #92, 11 November 2026)

The reported correspondences remain reproducible, but the next address and decoder are not historically selected by an original instruction.

- **Title mask:** One equality at the fourth of nine mirrored pairs automatically yields both 32 and 8 under bit-order reversal. A 32-by-8 table necessarily yields 128 paired positions after halving; p53's source-authentic 128 black runes supply one independent cardinality match, without fixing a cipher state.
- **Table axis and p53 alignment:** Vertical folding finds the sole equal byte at folded zero-based index122 and original rows16/17 column3. Mapping index122 to p53 rune122 assumes forward zero-offset row-major alignment between different artifacts. A lossless reversed 128-position alignment maps the same cell to local **5**, GP index **1 (U)**; forward maps to local122, GP index **17 (B)**. No source cue chooses either mapping. The **first red rune Tiwaz T** (GP index16, p53 local128) is physically printed at the **end of the final black line**, before the following red line. A native-original scan comparison shows that its 50×114-pixel binary glyph mask (scan `70.jpg`, box x1719–1768/y1650–1763, 1,502 red pixels) is **pixel-identical** to ordinary black Tiwaz at x1107/y1462 and x719/y1650 on the same page (IoU 1.000000 each); a third black Tiwaz in original p54 (scan `71.jpg`, x1712/y2047) overlaps at IoU 0.982213. Thus the red shape is the normal GP letter, **not a separately stylized pointer**. Its first-red-inline position can still intentionally signal a section/ink boundary; a double use as a directional instruction is unproved. Even granting an upward cue, neither its arrowhead nor the printed layout selects a unique column width, line/column order, left/right orientation, start, fold axis, or 128-/256-position permutation. The two forward/reverse p53 endpoint candidates remain unselected. [Original-JPEG SFT](../sims/lp2_p53_tiwaz_source_gate_sft.py).
- **Dependent closures:** The equality's central-row difference1 is fixed geometrically. The 105 mod29 =18 relation follows from 86+19=105 and cannot independently corroborate it. Q=26, the selected word26, column3, length3 and lower row17/B17 remain exact conditional observations. The prior shuffled-table diagnostic fixes the entire post-selected operator/alignment chain and therefore cannot establish its discovery-wide significance.

The [bounded historical operator audit](earlier-cicada-p55-fold-operator-audit.md) found no preserved earlier instruction to convert mirrored rune equality into a binary address or to use a recursive GP arithmetic fold. That audit cannot exclude lost clues, but supplies no independent selector here.

**Decision:** Retire the specific p27-equality-mask to vertical-table-1Q to forward-p53-B17 path as an actionable original-cipher route until a new source instruction fixes the equality rule, fold axis, projection and B17's operational role. The finite source arithmetic remains preserved. There is no independently frozen unknown-text prediction, original key or unknown LP2 plaintext. Previously tested direct folded-table additive inverses are negative; no further unconstrained key sweep is warranted.

**Reproduction:** `sims/p27_title_gridfold_p53_closure_sft.cjs` retains all exact reported finite checks. Reverse alignment is the elementary bijection `local = 127 - foldedIndex`, so the equal cell projects to local5 instead of local122.
