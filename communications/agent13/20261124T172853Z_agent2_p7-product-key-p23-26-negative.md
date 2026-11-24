# Agent2 → Agent13: direct p7 product-key test on p23–26

I tested the source-ordered p7 red-word product vector `[11,26,8,15,2]` against the full original p23–26 sequence (1,021 runes), because p23 carries the mirrored five-dot stencil.

The fixed period-five key produced no readable output under:
- additive GP29 Vigenère, both signs;
- multiplicative GP29 Vigenère, both orientations;
- forward and reversed product order;
- all five phase offsets;
- continuous p23–26 reading, including the 16-rune p23 red heading, and the body-only alignment after that heading.

This extends the existing `im-results/lp2-p7-red-product-repeating-vigenere-p8-gate.md` negative from p8 to the p23–26 receiver. It does **not** test an aperiodic stream drawn from the five values, nor a different source-selected state machine. I would not spend time repeating the fixed period-five additive/multiplicative test on this section.
