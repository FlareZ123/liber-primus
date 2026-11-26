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

### Local Futhorc alignment: E at the third position of both red words

The source-fixed p0 red heading is `SHEOGMIAF` (8 GP29 runes) followed by `SYENGC` (5 GP29 runes). In the canonical corpus, the third rune of each word (zero-based offsets 2 and 10 in the 13-rune heading) is **E**. Under the directly relevant Anglo-Saxon Isruna/Hahal-runa order, each 3|3 stave also reads **E**. This gives a precise local correspondence: two staves, two heading words, and E at the third position of each word. It is a stronger local fit than the cross-family 3|3 → TH match.

This may be a title/word-position annotation or a selector for an E-based operation, but the image does not say whether E is plaintext, a key symbol, a transparent hold, or merely a label. The same staves repeat on p1–p2 where there is no red heading, so their repetition is not three independent confirmations. The correlation is a source observation, not recovered plaintext.

### Bounded E-hold receiver tests

A natural operational hypothesis is that the Futhorc Hahal-runa value E selects an E-transparent hold, analogous to the authentic plaintext-F hold in solved Cicada material. I tested the simplest clue-constrained consumers against the original corpus:

- Use the exact 13-rune red heading as a repeating GP29 additive key on p0's 249-rune black body and the 716-rune p0–p2 chapter remainder. When ciphertext E is emitted as plaintext E without consuming a key cell, both arithmetic directions are nonprose.
- Remove the two E cells from the heading to form an 11-rune key; the additive directions and the Beaufort-style `K−C` receiver are also nonprose.
- Transfer the solved p56 prime-minus-one clock, starting at prime 2, to the p0–p2 remainder with E-hold. The 716-rune output consumes 694 shifts, has 25 adjacent equalities and IoC 0.035469; its opening is nonprose. The same implementation with the authentic F-hold on p56 recovers the known opening `AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE...` using 80 consuming shifts, providing a positive control.

Exact inputs, rules, output summaries and the p56 control are reproducible in [the E-hold probe](../sims/lp2_p0_hahalruna_ehold_probe.cjs). These results reject the simple title-key and p56-prime-clock E-hold receivers only; they do not reject every possible E-based marker or an independently sourced key.


### Conditional 13+1+55×13 partition: possible per-page key matrix

The original-image-derived corpus gives p0–p2 a total of **729 runes** (262 + 266 + 201). The p0 red heading occupies 13 runes; the first black rune after it is TH; the remaining p0 black text plus all p1–p2 runes totals **715 = 55 × 13**. Thus, if the TH glyph is a sentinel, the opening material partitions exactly as:

```text
13 red runes + 1 black TH sentinel + 55 rows × 13 runes
```

Together with the 13-dot marker, this suggests a possible 56-row, 13-symbol schedule: the red row for p0 and 55 subsequent rows for p1–p55. It is a coherent human-solve-path hypothesis, but depends on selecting the reversed Younger Futhark 3|3 → TH reading; the more directly relevant Futhorc Hahal-runa convention instead gives E and matches the two third-position E runes in the red title. The row interpretation is not established.

I tested the simplest page-key receivers using the 55 rows read sequentially:

- Treat each 13-symbol row as a repeating Vigenère key for its page. Representative p3/p4/p55 tests under the natural p1–p55 mapping, and p56/p57 under the alternative p3–p57 mapping, fail with index shifts and prime-valued shifts, both arithmetic directions, forward/reversed keys, and no/F/E holds.
- Treat each row as a keyword for a page-specific keyed monoalphabetic alphabet. The red row on p0 and payload rows on representative p3/p4/p55 do not produce language.
- Treat the 715-symbol payload as a one-time pad for the first 715 runes of p3 onward. Row-major and column-major key order, both signs, forward/reversed key, and no/F/E holds all fail.
- A separate 13-column transposition keyed by the raw or decoded red title, combined with the p56 prime-minus-one clock in either layer order, also fails to produce language on the 715-symbol payload. The already documented 13-dot route gives the fixed title-position permutation `[8,0,1,9,2,3,10,4,5,11,6,7,12]` (output `SSHYEOEGMNGIAFC`; see [the existing dot-topology report](lp2-p0-red13-dot-topology-readout.md)). Applying that exact permutation to every 13-symbol matrix row, then using the permuted rows as page-specific Vigenère keys, also fails on p3/p55 under index/prime shifts, both signs, forward/reversed order and no/F/E holds. Flattening the dot-permuted rows as a 715-symbol OTP over the first 715 runes of p3 onward likewise fails. This uses the existing dot-route result as a selector for the new matrix hypothesis; it does not reopen or repeat the already closed standalone dot-key/autokey tests.

The exact partition is real; the simple Vigenère, keyed-alphabet, OTP, and title-keyed transposition receivers are not. This does not exclude a more complex matrix use, but there is currently no source-selected operation that turns the 55×13 payload into an executable key schedule. Do not continue enumerating grid routes without an independent cipher instruction. Reproduction: [13×55 matrix gate](../sims/lp2_p0_13x55_matrix_gate.cjs).


## Decisive next tests

1. Reopen an E-hold or 13×55 matrix receiver only if an independent source supplies the key/state rule; do not repeat the failed title-key, p56-prime-clock, row-key, keyed-alphabet, or OTP tests.
2. Seek a second clean, variable branch-rune symbol or another original clue that independently selects the role of the two E markers or the TH sentinel.
3. Do not use the visible first black TH glyph to choose the Younger Futhark row order and then count the resulting 55×13 divisibility as independent confirmation.
4. Do not repeat the Cistercian/totient arithmetic, broad branch-count scans, or arbitrary grid routes. No receiver or plaintext has been recovered.

**Current conclusion:** the repeated 3|3 branch morphology is compatible with Hahal-runa. The direct Anglo-Saxon Futhorc readout is E and matches the third rune of both p0 red-title words, but the simplest E-hold receivers fail. A reversed Younger Futhark readout gives TH and exposes an exact 13+1+55×13 partition, but the resulting simple page-key, keyed-alphabet, OTP, and transposition receivers fail, and the order is not independently selected. Retain both as unresolved structural clues; no key, reversible receiver, or plaintext has been recovered.
