# Literal 3301 sign-off formula versus the LP2 cuneiform seam (#3228)

**Decision:** the specific first-party signed 2013 closure `Good luck. / 3301` does not supply an independently fixed crib at the original LP2 p33/p34 numeral emblem. The emblem crosses a continuing physical word, not a signed-message terminator. Moreover the numeric signature does not force that formula even in historical cleartext. No original plaintext, key, receiver or nonadjacent prediction is claimed.

## Source-selected formula, not a dictionary search

The archived signed [2013 first-onion message](../resources/historical/cicada2013-first-onion-hello.asc) ends in the exact literal two-line closure `Good luck.` then `3301`. Its 2014 [stage11 counterpart](../resources/historical/cicada2014-stage11-message.asc) independently ends in the same closure. A player noticing the visually readable lower cuneiform numeral 3301 could reasonably test whether it functions as that historical numeric signature. This is a specific completion of an exact known template, not a search for arbitrary eight-rune words. The known formula fixes GP29 GOOD LUCK as [6,3,3,23] [20,1,5,5], with two four-rune words and terminal punctuation immediately before the signature.

The closest possible literal receptor is the first emblem at the **bottom of p33 / original 50.jpg**; the same two-row 1033/3301 sign is repeated as a header on p34–39, not an independently marked textual closing. The existing [raster reuse result](lp2-p33-39-cuneiform-raster-reuse-source-gate.md) already establishes the fixed header identity, so no raster comparison is repeated.

## Original seam gate

Directly inspected native-image crops from the supplied original 50.jpg and 51.jpg (2400×3600); p33 last line and p34 first line show:

```text
p33 final glyphs: ᚱᚪᚱ·ᚫᚪᚷᛟᛞ·ᛒ
                      [cuneiform footer]
                      [cuneiform header]
p34 initial glyphs: ᛗᛒ·ᚾᚻ·ᛇᛞ·...
```

The [canonical transcription](../resources/liber-primus/lp2-transcription.txt) and [rune register](../resources/liber-primus/lp2-corpus.json) give a physical cut at global zero-based offset **8174**, within the three-rune word BMB. The last p33 complete word has length five (indices [25,24,6,22,23]); its predecessor has length three ([4,24,4]). The following fragment is [17] across the seam to [19,17], with the first separator after those two p34 glyphs. Neither the terminal punctuation nor the mandatory 4+4 word geometry of the historical sign-off is present. Under a literal spacing-preserving transfer the fixed receiver is contradicted; with arbitrary hidden segmentation the range is no longer source-determined.

The historical formula is not universally implied by the numeric signature itself: [2013 if-you-followed](../resources/historical/cicada2013-if-you-followed.asc) instead immediately precedes 3301 with `Make sure your GPG key is accessible.`; the [2012 countdown](../resources/historical/cicada2012-countdown-message.asc) uses a dated check-back instruction. Both are actual archived clear-signed examples, not imagined alternatives. They have different mandatory completions conditional on their own surrounding message. No fresh GPG authentication performed in this bounded study; the repository's historical source classifications are used.

## Consequence

Do not use GOOD LUCK as a crib selected by the cuneiform numeral. The emblem may still specify a numerical operand or section role; its literal identification does not select a textual sign-off, exact receiver range, or an inverse. No key fitting, no old p25 GOOD LUCK navigation sweep, no alternate dictionary/source offsets and no repeat of the established cuneiform raster or red10 packet analysis. Reopen only if a distinct source explicitly specifies the closing formula and range, or otherwise supplies an independent typed consumer.

Reproduce the seam via pages 33/34 of the original transcription, stripping slash/newline formatting but preserving word separators across the physical page cut; count corpus indices of pages <34. Exact inputs: corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`; transcript `43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7`; historical first onion `867f15cf3da05d75ff5b1450b571429c1419f656`; alternate closures `2cac85317c8245dfe3bf6509807e7f8308b734ac`, `7229104f48f4a0eeeae69c901eb74cb21baed956`. Physical observations were made directly from the original JPEGs; canonical text used for exact coordinates only.
