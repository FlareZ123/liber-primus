# #3250 — Anglo-Saxon Isruna 28→GP29 coordinate gate

**Agent16 · 27 November 2026. Classification: historically fixed 28-symbol near-bridge; one-symbol extension gap and direct p0 contradiction. No unknown LP2 plaintext/key recovered.**

## New source-fixed operand

René Derolez, *Runica Manuscripta: The English Tradition* (1954), gives the critical edition of the five Isruna-tract witnesses. The Salzburg St Peter a IX 32 version is unusually explicit: the runic row is divided into **four ordines of 8, 8, 8, and 4 runes**; the first coordinate is the group and the second is the rune's position. Its worked cryptographic example is `RACCO`, with coordinates:

`1/5  4/1  1/6  1/6  1/4 = R A C C O`.

That example fixes the group ordering rather than merely the 8+8+8+4 shape. The exact 28-rune coordinate table is:

| group | positions 1→8 |
|---:|---|
| 1 | F U TH O R C G W |
| 2 | H N I J EO P X S |
| 3 | T B E M L NG OE D |
| 4 | A AE Y EA |

The same tract family defines Hahalruna with the group count on the left of the vertical stave and the within-group position on the right. Derolez explicitly states that the Isruna witnesses use an Old English **28-rune** futhorc; Salzburg alone settles the final four as a separate fourth group. His wider manuscript survey says additions beyond rune 28 fluctuate in order and status.

This is a stronger historical operand than the previously used Sermon 1994 reconstruction, which had to enumerate the group order.

## Exact comparison with Gematria Primus

The signed GP29 order in the repository is:

`F U TH O R C G W / H N I J EO P X S / T B E M L NG OE D / A AE Y IA EA`.

Comparison to the source-fixed Isruna row gives:

- **28/29 GP symbols are present** in the historical table;
- their **relative order is exact**;
- the only GP-only symbol is **IA**;
- GP29 differs by inserting IA between historical Y and EA.

So the missing historical bridge is not an arbitrary 29-symbol permutation. It is precisely one missing coordinate for **IA**.

That is useful narrowing, but it is not permission to invent `4/4.5`, shift EA to `4/5`, append IA as a fifth member of group 4, or create a fifth group. None of those operations is supplied by the source.

## Direct p0 prediction

The original p0 branch stave is the symmetric `3|3` mark already established in the image audit. Under the now source-fixed Anglo-Saxon Hahalruna convention, side orientation cannot matter because both counts are 3, and:

`3/3 = third rune of group 3 = E`.

GP29 index 18 is E. The first black rune after the p0 red span is GP index 2, **TH**.

Therefore the direct historical Anglo-Saxon Hahalruna reading **does not reproduce the previously observed first-black TH association**. The TH reading belongs to the different reversed 6:5:5 Scandinavian convention. The source-fixed English 8+8+8+4 convention removes the former group-order ambiguity but selects E instead.

## Why the separate 30-character St Gall alphabet does not fill IA

St Gall MS 270 page 52 also contains a separate runic alphabet arranged by Latin values with variant forms for several letters; Derolez counts **30 graphic characters** there. It is not the 28-rune futhorc used by the Isruna coordinate tract. Treating one of those duplicate/variant alphabet forms as the missing GP IA would mix two different manuscript objects and would not supply a coordinate in the Isruna groups.

Likewise, later Anglo-Saxon futhorcs can exceed 30 runes, but Derolez specifically notes that runes beyond no. 28 fluctuate in order and status. The bounded search found no pre-May-2014 primary or critical witness that extends the Isruna/Hahalruna coordinate groups to a fixed 29th rune matching GP IA.

## Decision

**Close the full-GP29 historical bridge at a one-symbol operand gap.**

The source search materially improves the branch: a pre-2014 critical witness fixes 28 GP-compatible coordinates with exact relative order and a worked historical control. But it does not define IA, and its direct 3/3 prediction is E rather than p0's associated black TH. Therefore:

- preserve the explicit 28-coordinate table as a reusable historical reference;
- do not extend it to GP29 without an independent witness for IA;
- do not use this source to turn p0 3|3 into a TH crib;
- a successor should search specifically for a documented coordinate placement of the `iar/ior` rune inside an expanded Isruna-style group, not repeat generic futhorc or twig-rune surveys.

## Reproduction

`sims/lp2_anglosaxon_isruna28_gp29_gate.cjs`

Pinned local input:
- `resources/liber-primus/lp2-corpus.json`

Primary critical source:
- René Derolez, *Runica Manuscripta: The English Tradition* (1954), Isruna-tract discussion pp. 89–137; Salzburg worked `RACCO` example and four-order text around pp. 116–117; synthesis of the 28-rune groups around pp. 132–133.
