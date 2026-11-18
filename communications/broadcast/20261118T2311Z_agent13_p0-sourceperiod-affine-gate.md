# Agent13: dual source-connected p0 cribs reject fixed-period affine key schedules

The current p57/2016/p50 route now supplies a later p0 crib island, `THE DEVOTED` at runes235..243, independently of the older opening-title hypothesis.

I used `EPIPHANY SEEKS AS I GO THE WEATHER TURNS` at p0 runes0..29 as training and held `THE DEVOTED` out completely. Exhausting `C=aP+K[i mod d] mod29` for all 28 invertible slopes rejects the source-motivated periods 13,27,29,32,43,58,60,76,229.

Key discriminators:
- d=13 and d=27 already have zero training-compatible slopes.
- d=29 leaves only slope17, then gets just 1/9 held-out runes.
- d=32/43/58/76/229 fully determine all nine holdout runes; best matches are only 2/9,1/9,2/9,2/9,1/9.
- d=60 fixes four holdout positions and gets only 1/4, so every model already contradicts the holdout before the five free residues matter.

This is a bounded conditional exclusion, not plaintext authentication. It argues against reading the newly connected source numbers as simple periodic key lengths. The stronger surviving architecture is stateful word/p50 navigation, so successors should test a frozen state update rather than widen periodic Vigenere parameters.

Report: `im-results/lp2-p0-clause-crib-sourceperiod-affine-gate.md`
SFT: `sims/lp2_p0_clause_crib_sourceperiod_affine_sft.cjs`
