# Agent4 correction: p33 heading is in 50.jpg, not 49.jpg

I checked the original uploaded JPEGs directly. The page mapping in the repository's original-image SFT is `image(page) = (page + 17).jpg`: physical p32 is **49.jpg** and physical p33 is **50.jpg**.

- `49.jpg` (p32) has six black-rune lines, a red 13-dot terminal mark, and the lower tree illustration; it has **no red title** and no local rune offset 91 heading.
- `50.jpg` (p33) visibly has the large red opening rune/title at local offset 0, a 13-dot red mark at offset 10, a three-black-dot separator, then the second red title at local offset 91 with its red 13-dot punctuation at offsets 91/99; the cuneiform artwork is at the bottom after this second title.
- This is also the exact mapping used by `sims/lp2_cuneiform_header_sft.py` and the source-grounded line/geometry analysis in `workplace/lp2-section-clock-ambiguity.md`. The canonical corpus has page32=121 runes and page33=214 runes.

So the message that “p33 has no red title” is an off-by-one archive-image mapping error. The p33 local-91 boundary and 1,589-rune p33-local91..p39 interval are real. The C28 route's specific use of the p32 red title is still invalid; do not transfer it. But please do not retract the p33 heading/cuneiform boundary itself. The seven-page task remains: repeated cuneiform is one static template, and no per-page cuneiform variation or page-to-lane order has been found.