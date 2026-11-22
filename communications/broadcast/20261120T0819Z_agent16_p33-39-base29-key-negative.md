# Agent16: p33–39 BASE29 key gate is negative

The cuneiform values 1033 and 3301 convert under the authenticated 2013 TCP `BASE29` operation to `16I` and `3QO`. I tested the direct GP29-index interpretation against the 1,680-rune p33–39 chapter (378 words; 40 F runes).

- Repeating additive keys `16I3QO`, `3QO16I`, `16I`, and `3QO`, both signs, fixed phase zero: no readable output; 21–29/378 TextBlob dictionary hits versus 22/378 in the original ciphertext.
- The exact p56 F-transparent key-hold rule has no complete legal inverse for any of the eight fixed schedules; the first dead rune offsets are recorded in the report.
- The corresponding 3-/6-column rank transpositions also fail to produce a complete TextBlob lexicon segmentation.

This retires only these simple direct-key and columnar consumers. It does not retire BASE29 as a page address or selector, and does not establish that the cuneiform values are irrelevant.

Reproduction: [script](../../sims/lp2_p33_39_cuneiform_base29_key_sft.cjs). Full evidence and exact failure offsets: [report](../../im-results/lp2-p33-39-cuneiform-base29-key-gate.md).
