# LP2 p0 staves: Cistercian rejected; 3|3 branch-rune readout is convention-dependent

**Current status: the Cistercian 1133/3311 interpretation is not supported by independent visual audit. The three-member 3|3 morphology is compatible with Hahal-runa/branch-rune writing, but its value is convention-dependent: the Anglo-Saxon Isruna-tradition Futhorc order gives 3|3 → E, while the reversed Younger Futhark 6:5:5 convention gives 3|3 → TH. The latter matches p0's first black ciphertext glyph, but is a cross-family choice not selected by the image. No plaintext has been recovered.**

## Established visual observations

The two wood-like marginal stave motifs on original LP2 images `resources/liber-primus/17.jpg`–`19.jpg` are repeated essentially identically across pages 0–2 and are 180-degree counterparts. The repeated-crop test is reproducible with `sims/lp2_p0_stave_repetition_sft.py`.

Agent4's independent audit (`communications/agent2/20261126T0416Z_agent4_p0-stave-visual-audit.md`) identifies **three genuine transverse members** crossing the upright, each protruding on both sides: a 3|3 branch pattern. The audit does not find a defensible four-quadrant Cistercian stroke assignment. In particular, the proposed 1133/3311 readings require assigning or ignoring an ambiguous central member and should not be treated as observed numerals.

## Why the Cistercian arithmetic is not evidence

The previous manual hypothesis read the pair as 1133 and 3311, yielding 3311=7×11×43, φ-factor values 6,10,42, and a conditional gcd of the two totients equal to 60. Those arithmetic identities are correct **if the manual numbers are assumed**. The visual premise is not established, however, and the resulting 6/10/42 page partition, (17,42) section address, and gcd-60/base-60 connection are therefore numerical coincidences until an independent glyph reading supports the numbers.

Do not use these calculations to support the old p0/base-60 address hypothesis. The conditional arithmetic reproducer `sims/lp2_p0_cistercian_staves_totient_partition_sft.cjs` is retained only to document what follows from the rejected manual assignment; it is not an image recognizer or evidence for the assignment.

## Live but non-unique: Hahal-runa / branch-rune morphology

The three transverse members on both sides of the upright give a 3|3 branch count. This is compatible with the historical Hahal-runa form: branches on the left encode the rune group/row, and branches on the right encode the rune's position within that row. The geometry therefore supports a *candidate cipher-rune family*, but it does not by itself select which runic alphabet or row order supplies the lookup.

### Direct Anglo-Saxon Futhorc comparator

The closest historical comparator to the manuscript's 29-symbol GP29 alphabet is the Anglo-Saxon Futhorc, not the reduced Younger Futhark. R. Derolez's *Runica Manuscripta: The English Tradition* (1954), chapter II, examines the Isruna tract preserved in five manuscripts, including St Gallen MS 270. The tract describes Hahal-runa as using the left side for the group/row and the right side for the letter's position. Its Futhorc cipher is organized in three groups of eight, with an additional group for later runes; the first 24 runes follow:

```text
1: f u þ o r c g w
2: h n i j eo p x s
3: t b e m l ng oe d
```

The first 24 entries match the corresponding opening of the canonical GP29 order in [the corrected source map](../results/2013-original-gp29-source-map.md). Under this source-matched Hahal-runa layout, **3|3 = E**, not TH. Derolez gives the underlying group/position rule and the Hahal-runa definition in chapter II, pp. 89–122 (especially pp. 89 and 119–121): [digitized text](https://old.katab.asia/special/Rene_Derolez_-_Runica_Manuscripta.pdf).

### Cross-family Younger Futhark candidate

The Uppsala University Rune Blog describes a cryptic Younger Futhark ordering with the ættir reversed:

```text
tbmlʀ / hnias / fuþork
```

In that 6:5:5 order, group 3, position 3 is **þ / TH**. Menota §18.3.13 independently describes the usual branch-rune coordinate convention and notes that rows are counted from bottom to top and positions from left to right: [Menota handbook](https://www.menota.org/HB4_ch18.xml#18.3.13); [Uppsala discussion](https://www.runforum.nordiska.uu.se/blog/cryptic-runes/).

That gives a real alternative, but it is a cross-family import: LP2's 29-rune alphabet follows Anglo-Saxon Futhorc, while the 3|3 → TH result uses a reversed 16-rune Younger Futhark order. The first black p0 rune after the red heading is indeed TH, but that is a visible ciphertext glyph, not an independently known plaintext crib. Choosing the Younger order because it returns the already-visible TH is post hoc unless another source clue selects that order. The two staves' 180° relationship may suggest reversal in some sense, but does not uniquely prescribe reversing the ættir rather than some other orientation or traversal.

| Lookup convention | Third group (counted from the bottom) | 3|3 result |
| --- | --- | --- |
| Isruna/Hahal-runa Futhorc, 3×8 | t b **e** m l ng oe d | **E** |
| Younger Futhark, ordinary 6:5:5 | t b **m** l ʀ | **M** |
| Younger Futhark, reversed cipher order | f u **þ** o r k | **TH** |

Thus the p0 match is possible, but not uniquely selected by the 3|3 geometry. The 180° pair and the first visible TH do not establish the required alphabet/order independently.

## Decisive next tests

1. Reopen the TH readout only if an independent original clue selects the reversed Younger Futhark order or otherwise fixes the relevant alphabet and orientation.
2. Seek a second clean, variable branch-rune symbol whose value makes a prediction on an independently anchored ciphertext position. The repeated p0–p2 ornament is not three independent symbols.
3. Do not use the visible first black TH glyph to choose the row order and then count that same match as independent confirmation.
4. Do not repeat the Cistercian/totient arithmetic or broad branch-count scans. No receiver, key schedule, or page-level instruction follows from the 3|3 observation alone.

**Current conclusion:** the repeated 3|3 branch morphology is compatible with Hahal-runa, but the most directly relevant Anglo-Saxon Futhorc convention reads it as E. The TH result requires a separate reversed Younger Futhark convention and is not selected by the current source evidence. Retain the motif as an unresolved clue; no key, reversible receiver, or plaintext has been recovered.
