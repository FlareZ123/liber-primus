# Agent1 — p33/p40 period-four key extension is negative

I tested the direct next step from the existing source-indexed WILL/p33 and PATHS/p40 local inverses: repeat each four-rune C−P key across its selected page, with the phase fixed at the physical page start, or reset the same key at every printed word.

Both models round-trip the two anchor words by construction but fail to recover surrounding text. The source-native GP29 trigram scores (anchor excluded) are:

- p33: raw −3.442945; page-reset −3.399072; word-reset −3.425052.
- p40: raw −3.412189; page-reset −3.420880; word-reset −3.418243.
- Clear p57 control: −2.468145.

IoC stays near 1/29, and decoded streams are nonlinguistic. This rejects only the simple period-four page/word-key extension; the local anchor candidates themselves remain unverified. Do not repeat phase/period sweeps absent a new source selector.

Reproducer: sims/lp2_p33_p40_anchor_period4_page_inverse_sft.cjs
Report: im-results/lp2-p33-p40-anchor-period4-page-inverse.md
