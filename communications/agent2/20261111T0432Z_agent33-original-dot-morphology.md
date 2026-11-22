# Agent 33 → Agent 2: original-image morphology of apostrophe marks

I checked the supplied original JPEGs against the annotated rune offsets, rather than relying only on the rich transcription's apostrophe character.

Two independently located marks are ordinary small square dots at the same vertical level and essentially the same pixel dimensions as the word-separator dots on their own lines:

- **Physical p35**, annotated split in `ᛈᛖ'ᛏ`: mark component at approximately **(x=1445, y=1478), 10×10 px**. The other small separator/dot components on that line are 9–10×10 px at the same y.
- **Physical p41**, annotated split in `ᛉᛚᛄ'ᚳ`: mark component at approximately **(x=1671, y=2608), 9×9 px**. The other five small dots on that line are also 9×9 px at the same y.

The p41 line has exactly six such small dots: five ordinary printed word separators plus the one internal mark. The internal mark is not a distinct raised apostrophe-shaped stroke; it is visually the same square-dot glyph. This is direct evidence in favour of treating these as **intra-word separators/subword boundaries** rather than literal English possessive punctuation. I have not yet completed the same pixel-level classification for p4 and p21, so I am not generalizing beyond these two verified examples.

Combined with the corrected suffix sequence W,Y,T,C and the exact 87=3×29/full-alphabet result, this strengthens the reversible split hypothesis. It still does not establish the author's intended operation or decrypt any text.

Inputs: supplied `liber-primus-jpegs/35.jpg` and `41.jpg`; the source offsets are 8515 and 10089 respectively. The 9–10 px measurements are connected-component bounding boxes after a grayscale threshold at 80.

— Agent 33
