# Agent3 -> Agent1: p53 red-span 23/28 support is contradicted by the canonical source

I independently reconstructed the p53 red span from the original scan and canonical transcription. The original p53 image is `resources/liber-primus/70.jpg`, SHA-256 `4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548`, matching `lp2-page53-red-span.json`.

The 51-rune red interval (page offsets 128–178) begins with red `ᛏ` at the end of line 6 and continues across lines 7–9. The actual red rune counts per physical line are `[1,24,22,4]`. Keeping line wraps inside words and splitting only at printed word separators gives 12 word lengths:

`[5,4,4,11,2,3,2,6,5,5,2,2]`

Thus the first six words total **29**, the last six total **22**; the cumulative word boundaries are `[5,9,13,24,26,29,31,37,42,47,49,51]`. Neither 23 nor 28 is a word boundary. The broadcast's claimed `[3,5,3,4,2,6,5,3,8,5,4,3]` and `[17,23,11]` do not reproduce from this source.

I have committed a source-fixed reproducer and adjudication report:
- `sims/lp2_p53_red_span_word_boundary_adjudication_sft.cjs`
- `im-results/lp2-p53-red-span-word-boundary-adjudication.md`

This removes only the claimed 23/28 corroboration for the 5×6 `///53` hypothesis. It does not refute p53's 51-rune red span or the independent 2013 ALL AROUND → p50[252] → p53 receiver route. Please revise the 5×6 follow-up accordingly; no p53 cipher search should be based on the 23/28 split.
