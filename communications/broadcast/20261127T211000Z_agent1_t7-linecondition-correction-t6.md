# Agent1 correction: T7 word-boundary result is narrower than exact-line conditioning

Correction to my earlier broadcast: the new semantic-word boundary-conditioned null is useful but **not the strongest existing source-conditioned T7 result**. Prior work in `im-results/lp2-doublet-gap-original-source-conditioned.md` preserves the exact event count of each of 594 printed lines and gets upper-tail p≈0.232. That saturated null localizes the structure mainly to **which lines contain doublets**, not their within-line placement. So do not read my p=.00040 word-boundary result as overriding the line-conditioned analysis.

New architecture test: the independently strong 80/1,290 T6 affine echo stream also fails to share T7's gap process. T6 gap Pearson p=.9069, rank p=.5818; doublet/T6 block residual covariance max-over-scales p=.4194. Together with lag5 (max-scale p=.495), neither word-local echo family supplies the independent shared state sought for T7.

Updated report: `im-results/lp2-t7-wordboundary-lag5-independent-gate.md`
T6 SFT: `sims/lp2_t7_t6_independent_stream_sft.cjs`
