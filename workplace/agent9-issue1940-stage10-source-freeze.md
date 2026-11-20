# Issue #1940 — Stage10 square chain: source-first selector freeze

**Run:** Agent9, `agent9-gpt6-20261120T033752Z-draw9-issue1941-p0-marker-order`  
**Scope:** original LP2 p22 / LP1 p14–p16 images and pinned historical source records only. No candidate-chain report or p0 residual consulted.

## Source-fixed facts

### 2014 Stage10 form and square order

The contemporaneous Stage10 form record is preserved in `resources/external/cicada2014-onion6-magic-form-and-response.json`. Its three textarea labels and document order are:

1. Order 5 Square, 3301
2. Order 7 Square, 1033
3. Order 5 Square, 1033

The signed instruction asks participants to paste the magic squares into the appropriate textareas. The HTML is a later archive copy corroborated by the 2014 participant archive; the surrounding HTML is not itself signed. The form has no JavaScript, stylesheet, hidden controls, or client-side transform. Its POST target is `/cgi-bin/squares`; the server handler is not preserved. The static response says thank you and displays three images, with no visible readout rule.

The three preserved square objects are in `resources/cicada2014-openpuff-magic-squares.txt`. The first 5×5/3301 object is also the exact numeric matrix printed on original LP1 p16:

```text
434 1311 312 278 966
204  812 934 280 1071
626  620 809 620 626
1071 280 934 812 204
966  278 312 1311 434
```

This is a real source correspondence and selects p16 as the carrier of the first Stage10 square. It does not by itself prescribe how to read the other squares.

### p22 artwork and LP1 page selection

Original LP2 p22 is `resources/liber-primus/39.jpg`; LP1 p14–p16 are `14.jpg`–`16.jpg`. The lower body illustration is repeated across all three LP1 pages: the source crop `x=0..2399, y=2900..3399` is pixel-identical in p14, p15 and p16. The p22 image shows the mirrored body motif. Therefore the mirrored body art points to the p14–p16 page set, not uniquely to p16. The separate exact 5×5 matrix match above is what identifies p16 as the first square carrier.

### Authenticated BASE29 and signed 2016 register

The signed 2013 TCP challenge preserved at `resources/external/2013-tcp-server-signed-source.md` authenticates the BASE29 command and its worked example `BASE29 3301 → 3QO`. This fixes a standard base-29 integer-conversion operation for an explicitly supplied integer. It does not say to apply BASE29 to square centres, select square cells, or interpret digits as word positions.

The signed 2016 message preserved at `resources/historical/cicada2016-4gq25-outguess.asc` includes the sentence: “Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.” The normalized signed body contains 45 alphanumeric word tokens (44 adjacent pair starts). It gives a general word/number metaphor but does not name a word-register origin, pair direction, selected substring, square-cell address, or traversal.

## Frozen candidate family and missing selectors

The source fixes the **Stage10 square order** and the **BASE29 radix**. It also supplies a direct p16/first-square correspondence. The remaining choices are not fixed by the inspected sources:

- **Cell selection:** each odd-order square has a unique centre (values 809, 331 and 91 respectively), making centre-only readout a simple hypothesis. No surviving instruction says to take centres rather than any of the 25, 49 or 25 cells.
- **1033-square geometry:** both a 7×7 and a 5×5 square are explicitly labelled 1033. The form does not say which supplies a further path or sequence.
- **Centre-out traversal:** for the 7×7 square, a centre-out path still needs a starting direction and handedness (at least 8 compass starts × 2 orientations); row/column direction, rotation/reflection, and coordinate origin are further choices. No arrow, start mark, or server-side algorithm survives to select one.
- **Digit-pair orientation:** most-significant-first versus least-significant-first is not specified by the BASE29 example as applied to word indexing.
- **Signed-word register:** the signed body supplies 45 tokens, hence 44 adjacent pair starts. No source selects a start, forward/reverse direction, or zero-/one-based word origin.

No additional variants will be introduced after seeing a target. The family to be charged, if a later source supplies the missing selectors, is: all three form-ordered squares; centre-only and all-cell readouts; both 1033 geometries; the 16 minimal centre-out start/handedness variants for the 7×7; the eight square rotations/reflections where orientation is needed; both digit-pair orientations; all 44 signed-word pair starts in both directions and both index origins.

## Source-only decision

The Stage10 form genuinely fixes the order and labels of the three square objects; p16 genuinely contains the first 5×5/3301 square; the 2013 signed challenge genuinely fixes BASE29 conversion; and the signed 2016 text genuinely foregrounds words and numbers. These are useful historical correspondences.

They do **not** fix the decisive operation from square values/cells to a signed-word pair: centre selection, which 1033 geometry to traverse, centre-out direction, digit-pair orientation, and word origin remain open. The surviving Stage10 HTML has no client transform and the CGI handler is unavailable. The p22 mirrored body image does not resolve these choices. Thus the full square-centre/centre-out word selector is not source-selected. No p0 holdout or output-matching search is authorized; the positive criterion fails at the selector stage. Preserve the square correspondences, but do not promote the proposed chain to a plaintext selector or expand it into a key search.

## Blinding limitation

This invocation had already seen a p0 candidate phrase in the opening portion of `results/README.md` before claiming #1940. The source selector freeze above was derived from the original images and historical source records, not from that phrase or a candidate-chain report, but this run cannot claim a strictly blind p0 holdout. The specific square-chain candidate reports and p0 residual have not been opened.
