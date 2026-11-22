# LP2 original punctuation and canonical 2,896-word token contract

**Corrected source conclusion (15 November 2026):** unsolved LP2 comprises **12,956 GP29 runes in 2,896 original whole words**, with **four genuine, raised word-internal apostrophe strokes**. The earlier assertion that the original images lacked these four marks was incorrect. The marks select four original ciphertext-word locations for conditional morphological cribs, while **2,900 tokens** remains an optional, unestablished *additional word-splitting interpretation*. The two contracts should stay separate in analysis; no unknown-page plaintext or key has been recovered.

## Exact original-source image observations

The combined archive includes 17 first-release scans before the second release: original LP2 physical page `N` is image `N+17.jpg`. An early negative audit examined incorrect image numbers 04/21/35/41 as though they identified LP2 physical pp4/21/35/41. A later audit of correct scans counted only tiny **6–12-pixel square separator dots** and found no *additional square dot*. The decisive omission was that the four source apostrophes are **tall narrow strokes, 12×40 pixels**, outside that dot-only component class. They are plainly visible within the words at these exact original 2400×3600 scan coordinates:

| Physical LP2 page | Actual scan | Raised stroke top-left | Global GP29 cut | Original printed word, with restored apostrophe |
| ---: | --- | --- | ---: | --- |
| 4 | `21.jpg` | (1400,2014) | 1,110 | `ᛗᛉᛁ'ᚹ` |
| 21 | `38.jpg` | (1258,884) | 5,138 | `ᚫᚩ'ᚣ` |
| 35 | `52.jpg` | (1195,1261) | 8,515 | `ᛈᛖ'ᛏ` |
| 41 | `58.jpg` | (1304,2390) | 10,089 | `ᛉᛚᛄ'ᚳ` |

Each source stroke has 379 thresholded dark pixels in a 12×40 bounding box. Same-line normal word dots are 9×9 or 9×10 pixels. These readings were **fully reproduced** on source JPEGs in the [original-image ROI SFT](../sims/lp2_apostrophe_original_pixel_geometry_sft.py), [passing Windows Python3.12 CI](https://github.com/FlareZ123/liber-primus/actions/runs/43688681314). A prior “no additional separator-sized component” test is compatible with this observation precisely because the apostrophes are **40 pixels high**.

**Independent historically solved positive control:** first-release original LP1 physical p14 has an identical 12×40 source stroke at scan `14.jpg`, x1051/y2122, in the cipher `I-RWN'B`. Original rune transcription has `ᛁ-ᚱᚹᚾᛒ`; verified plaintext is **I DON'T**, within the solved Koan. Its original Vigenère key `FIRFUMFERENFE` gives five consecutive key residues **FIRFU**, at source runes 145–149 after two known preceding plaintext-F bypasses: `145−2=143`, exactly divisible by 13. This original apostrophe does not advance the rune cipher key. Both this [cipher-key control](../sims/lp2_apostrophe_fourcrib_original_sft.cjs) and the ink geometry SFT passed independent Windows Actions runs. The original LP1 model supports reading the same LP2 marks as punctuation-preserving English-contraction boundaries; it does not establish any individual unknown plaintext word.

The source-normalized 2017 and current compact GP transcription omit the apostrophe glyphs entirely. Their absence in **rune-only text** cannot establish their absence in the original JPEG ink.

## Printed-word accounting and optional split sensitivity

The genuine printed-word contract remains **2,896**: source apostrophes are internal punctuation, rather than the ordinary midline square word separator. They introduce no GP29 rune and no extra whole word. This is also how the solved LP1 `DON'T` contraction is treated.

If a hypothetical cipher instruction later required **promoting each apostrophe to a new whole-word boundary**, the resulting alternative would have exactly **2,900** tokens, including **87** one-rune tokens and a complete alphabet of 29 singleton GP symbols. Its added tokens occur after zero-based canonical word indices **242, 1158, 1912, 2265**; all later token ordinals shift by +1/+2/+3/+4 as those boundaries are crossed. The exact `2,900 = 100×29` and `87 = 3×29` identities are source-position-driven **conditional numerical consequences**, with no demonstrated author-specified rule requiring that split. The [arithmetical reproducer](../sims/apostrophe_quote_29_accounting.cjs) and [documented 100×29 optional word transposition](wordlength-apostrophe-29x100-transposition.md) preserve the associated negative cipher tests.

## Reproducible source constraints and research decision

- [Original JPEG apostrophe pixel and solved LP1 positive-control SFT](../sims/lp2_apostrophe_original_pixel_geometry_sft.py) detects exactly five genuine 12×40 vertical strokes, alongside their same-line tiny separator dots.
- [Earlier original dot-only and 2,896 canonical-token SFT](../sims/lp2_visual_token_contract_sft.py) still validates rune totals, archived JPEG identity and the count of ordinary square word separators. Its expected **6/4/7/5 tiny square components** on the four LP2 target lines do not detect or negate the raised 40-pixel apostrophes.
- [Original rune and finite contraction cipher SFT](../sims/lp2_apostrophe_fourcrib_original_sft.cjs) verifies all four complete unknown cipher words and the authentically solved LP1 punctuation/key-clock baseline. Sixteen frozen prime/totient direct key variants and the specified exact plaintext-F pointer models recover no listed contraction at those locations.
- [Source quote/29 accounting synthesis](apostrophe_quote_29_accounting.md) preserves the hypothetical 2,900/87 arithmetic without promoting it to the canonical word contract.

**Decision:** use 2,896 printed words for normal word-address work, retain the four genuine original apostrophes as high-value held-out morphological crib locations, and test alternative 2,900-token interpretations only when a separate clue specifies the different tokenization or operation. Nothing about the mere existence of source punctuation makes an unknown cipher key or whole-word transposition authentic.
