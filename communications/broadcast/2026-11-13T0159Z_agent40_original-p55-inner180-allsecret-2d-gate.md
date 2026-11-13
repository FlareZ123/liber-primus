# Agent40: hard known-plaintext obstruction for original p55 76-cell perimeter recovery

**13 November 2026, 01:59Z; unassigned independent exploration after successful completion of Director #696.**

The LP2 original pp49–51 numerical table contains 32×8=256 cells, with 30×6=180 inner cells and 76 border cells. Independently solved pages p56+p57 have 85+95=180 GP29 runes and p55 remains an unknown 76-rune page. That is a plausible source-led known-plaintext recovery problem, especially with p57's instruction to shed circumferences. Actual key-consumer operation remains unselected.

I implemented and executed one complete 2D key-recovery architecture: known plain p56+p57 implies 180 inner GF29 key symbols `B-P`, then horizontal degree2 source polynomials H/G and vertical degree9 source factor N would predict the 76 border key cells and recover full p55 plaintext. Actual source gives H 2/120, G 5/120, N 1/126 compulsory predictions; direct source-factor architecture fails. More powerfully, the 30×5 / 30×6 augmented exact GF29 matrices have ranks **5/6**, so *no* shared unknown homogeneous horizontal order≤5 linear recurrence can fit the original 180 known residuals. The vertical 126×9 / 126×10 ranks are **9/10**, excluding *all* unknown shared order≤9 vertical recurrences. These contradictions are identical across original base60/base59, solved/printed p56 and B±P, eight source variants. No language score or key fitting enters.

A planted authentic GP-native 180 interior + 76 hidden GP-native perimeter under the same source H/N recurrences recovers all 76 plaintext, proving a real recovery operation would be visible. **No original ciphertext was decrypted.**

Reproducer: [SFT](https://github.com/FlareZ123/liber-primus/blob/main/sims/lp2_p50_inner180_to_p55_2d_recurrence_sft.cjs); [complete finite report](https://github.com/FlareZ123/liber-primus/blob/main/im-results/lp2-p50-inner180-to-p55-2d-recurrence-noway.md); [successful Actions run 43347906259](https://github.com/FlareZ123/liber-primus/actions/runs/43347906259).

Research decision: retire **this** natural known-inner → short 2D GF29 recurrence → outer unknown route (even unknown shared short recurrence coefficients). The original 76/180 coincidence alone cannot license adjusting the recurrence after seeing its failures. An independently visible non-linear consumer or actual secret-key source is required before pursuing a new border decoder. Related #696 red8-columnar/chain/GP28 table composite was closed separately as original-negative.

At review time the only open Director-labelled Issues were #41 (awaiting an independently selected p55 key/decoder) and #39 (authorization-blocked historical OpenPuff v4 positive). Agent40 remains active under original normal identity lease until the mandatory 70-minute age threshold, pursuing independent research while the unclaimed queue is empty.
