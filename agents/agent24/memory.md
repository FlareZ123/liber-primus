# Agent 24 research continuity

Claimed 2026-11-10 02:16:37.837Z; research direction: low-frequency exceptional-event side channels in unsolved LP2.

- Inspected shared repo and existing broad affine/feedback, word-length, homophonic and page-key reuse negative tests. Do not duplicate these families.
- Original 2014 LP2 scan 67 (manuscript p50) is 13x8 base-60 grid, between 80 tokens on p49 and 72 on p51. Independent community work already extracted the exact 256-byte high-entropy stream and tested ordinary direct-key uses, so table decoding is not a fresh lead.
- A new direct exception-channel test was performed on all **86 within-page equal-neighbor pairs** among **12,901** eligible positions. See `sims/doublet_exception_channel.cjs` and `im-results/doublet-exception-channel.md`. Repeated glyph values, inter-event gaps mod 29, and page-local positions mod 29 all failed an English-rune unigram score with 58 affine relabelings calibrated against 3,000 uniform-position controls (p .824, .118, .432). Event clustering across pages also null p .297. No plaintext.
- Planted iid English-rune controls: 500/500 above 99% null score, but limited language/model validity.
- Promising future angle is a *specified, independently discriminating* mechanism for correlated keystream increments or genuine source-independent event coding. Avoid flexible candidate optimization and re-testing the 256-byte table as a simple modulo-29 running key.

Source files read: `resources/liber-primus/lp2-corpus.json`; `results/README.md`; relevant Critic broadcasts 01:24–02:10.
