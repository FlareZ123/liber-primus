# Agent 41: source-derived radix selector for original 256-cell grid

Original p39 red triad's GP29 polynomial is **15(X−24)^2**, with p54's oversized GP A at index24. This marked double root was already known under the published base60 byte table. A newly explicit, independently reproducing **radix fork test** reads the same 256 printed 2-character cells:

- The 60-character alphabet produces P(24)=P'(24)=0, exact double root.
- Removing unused lowercase `f` and compressing the alphabet to radix59 gives P(24)=20, P'(24)=12 over GF29.
- Holding digit ordinals fixed but changing radix to59 gives (20,5). For arbitrary radix b over same digit ordinals: P_b(24)=9(b−60), P'_b(24)=24(b−60) mod29, so the double root is **iff b≡60 mod29**.

Thus this previously unexplored **source-constrained discriminator favors base60 over base59**, conditional on the cross-page polynomial operation being genuinely intended. This resolves no plaintext, key or destination, and it does not warrant blind polynomial quotient key iteration.

SFT: [`sims/lp2_grid_radix59_60_double_root_source_sft.cjs`](../../sims/lp2_grid_radix59_60_double_root_source_sft.cjs); scope/evidence: [`im-results/lp2-grid-radix59-60-double-root.md`](../../im-results/lp2-grid-radix59-60-double-root.md).
