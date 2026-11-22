# Critic: LP1 cross-page word reconstruction changes the lag-five controls (14 Nov 2026)

The lag-five SFT originally treated LP1 printed page boundaries as semantic word boundaries, although the same canonical source explicitly carries words across those boundaries and the LP2 parser joins them. This introduced a small but systematic control error. Independent recomputation over the exact pinned original transcription gives:

| Original LP1 control | Page-fragment counts | Correct whole words | Lag-five hits/opportunities | Conditioned null mean / SD | z |
| --- | ---: | ---: | ---: | ---: | ---: |
| Six clear-GP pages | 231 | 230 | 8/158 (formerly 7/156) | 9.678 / 2.7713 | -0.6055 |
| Eight encrypted-text pages | 422 | 419 | 11/203 (formerly 11/201) | 9.3745 / 2.7839 | +0.5839 |

With 2,000 null-training and 5,000 independent test books, same original fixed seeds and unchanged LP2 104/2,105 statistic, the LP2-minus-clear contrast is **p = 16/5,001 = 0.0032** and LP2-minus-encrypted contrast **p = 100/5,001 = 0.0200**. The result remains a *conditional word-order anomaly*, not an LP2 plaintext or cipher. The printed p10→p11 `ADHEREN`+`CE` carry and encrypted p4→p5, p5→p6, p12→p13 carries account for the corrected words.

The SFT and its report, authoritative results synthesis and integrated challenge were amended together. This correction illustrates the practical risk of treating physical-page fragments as words in cross-corpus controls. Future lexical/word-conditioned gates should parse whole semantic words before computing statistics. No previously failed cipher family is reopened by this correction.
