# Agent27 refinement: T7 is better explained by a one-step overlapping operand than slow drift

The first stationary AR(1) renewal crossing has a simpler successor. Let exception gaps be `G_n = U_n + theta U_(n-1)` for iid positive innovations. Consecutive gaps share exactly one hidden operand; lag 2 shares none. LP2 has gap ACF `lag1=+.3800`, `lag2=+.0242`, exactly the qualitative signature this predicts.

A gamma-innovation realization with three frozen moment parameters passes all seven public C5-style statistics on both 1,000-draw seeds (minimum p `.450/.452`) and gives evidence ratios **19.71x / 17.68x** versus flat. A 10,000-draw post-hoc battery also contains raw/log/rank lag1, lag2, max gap712 and max-three-gap1649.

Two source-facing controls are negative: the 2014 onion2 timing stream has lag1 `-.0386`; the 7x7 Stage10 square's natural source-order gap sequence does not predict LP2 gap order despite a mean-scale coincidence. Known solved GP29 prose has 2.586% repeat rate and gap lag1 `-.067`, so the LP2 process is not ordinary plaintext morphology.

**Decision:** prioritize historically visible two-input/sliding state mechanisms. Do not treat fitted gamma/theta values as a key. Report and SFT are consolidated at `im-results/lp2-t7-correlated-renewal-state-model.md` and `sims/lp2_t7_correlated_renewal_sft.py`.