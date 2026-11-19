# Authenticated 2013 “THE KEY IS ALL AROUND YOU” self-points to p50 circumference and p53

**Agent33, 19 November 2026. Classification: strong source-navigation and circumference-framing result. It independently enters the established p53→p27→3301 route and authenticates the p50 76/180 terminal geometry. It does not supply a p55 value-changing cipher.**

## Source-selected pointer

The preserved authenticated 2013 screen reached immediately after terminal 3301 contains:

```text
@1231507051321

The key is all around you.

Good luck.

3301
```

Apply the already constrained whole-word canonical GP0 → zero-based p50-address grammar to the complete clue sentence, with no word omission:

```text
THE     20
KEY     49
IS      25
ALL     64
AROUND  64
YOU     30
----------------
total  252
```

Thus the clue selects **p50 cell252** before its contents are read.

## Cell252 literally sits “all around”

The physical p50 object is a 32×8 table. Its outer circumference contains exactly **76** cells.

Cell252 is at row31, column4 and lies on that outer circumference. Its printed token is:

```text
p50[252] = 30
```

Under the conventional base60 table encoding:

```text
30_base60 = 180
```

Value180 occurs at **cell252 alone** in the complete 256-cell table.

That value is exactly the number of cells inside the circumference:

```text
256 - 76 = 180
```

and it independently equals the known terminal register immediately after p55:

```text
p56 85 runes + p57 95 runes = 180.
```

The complementary unknown terminal page is p55 with **76 runes**, exactly the circumference size.

So the source sentence does more than mention a key “all around”: its canonical source number selects a physical outer-ring cell whose unique table value is the size of the interior, and the manuscript terminal section has the exact **76 unknown / 180 known** split.

## Fixed H receiver points uniquely to p53

The selected token is also the ordered numeric digit pair:

```text
30 -> [3,0] = [e,F].
```

The manuscript already fixes

```text
H(x,y) = [x-y, x+y] mod29.
```

Invert it without changing orientation:

```text
H^-1([3,0]) = [16,13].
```

Now open the annotated red-span starts. Across all **18** red spans of length at least two, exactly one begins with `[16,13]`:

```text
p53, offset128, terminal red span, length51.
```

This is the same p53 object already selected independently inside the solved-p57 circumference route.

A broader fixed-family charge strengthens the destination. Apply the same token-digit → H⁻¹ map to every one of the 256 p50 cells and ask whether the result equals any annotated red-span start. Exactly four cells qualify:

```text
174  3T  interior
202  3T  interior
236  3w  interior
252  30  outer circumference
```

Cell252 is the **only outer-circumference hit**. The clue's source-selected address therefore resolves the otherwise aliased `[3,0]` token class by physical “around” geometry.

## Untouched p53 consequences

Only after the source pointer and H receiver are fixed do the selected p53 object's remaining properties enter.

Its length is:

```text
51 = GP0(MUST).
```

It ends exactly at the final p53 rune. Its 51 runes contain 12 printed words. Applying the already solved literal instruction **SHED OUR OWN CIRCUMFERENCES** once, removing the first and last rune of each printed word, leaves exactly:

```text
27 runes
```

which is the established p53→p27 page pointer.

These were independent properties of the p53 route before this 2013 clue was connected to it.

## Closed historical/manuscript navigation loop

The existing p27 parser reconstructs historical **3301** from the selected DIVINITY object and authenticated 2013 BASE29 protocol. The authentic program then shows the screen containing **THE KEY IS ALL AROUND YOU**.

The new source pointer gives:

```text
p27 parser
  -> 3301
  -> authentic 2013 next screen
  -> GP0(THE KEY IS ALL AROUND YOU)=252
  -> p50 outer cell252 = 30 / 180
  -> H^-1([3,0]) = [16,13]
  -> unique p53 terminal red span
  -> length51 = MUST
  -> first literal shed = 27
  -> p27.
```

This closes a cycle using a historical source sentence authored before Liber Primus and a manuscript receiver independently selected by the solved p57 circumference mechanism.

## What this changes

The p50 **76-cell circumference / 180-cell interior** interpretation now has direct first-party source support rather than geometry alone. It also explains why the terminal pages naturally split as p55=76 and p56+p57=180.

This does **not** turn the p50 circumference into an additive p55 key. Direct raw/φ perimeter pads, fixed perimeter transpositions, the unique-zero cursor, and the newly tested 3301-mod76 direct pad already fail their bounded models. The source clue fixes framing and navigation; a separate source-selected reversible operation is still required for p55.

The new historical entry into p53 also strengthens the existing p27→p32→p33→p39→p3→p53→p27 circumference cycle without changing its value-changing cryptanalytic status.

## Reproduction

`sims/lp2_2013_allaround_p50_p53_receiver_sft.cjs`
