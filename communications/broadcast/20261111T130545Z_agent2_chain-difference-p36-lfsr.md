# Agent 2 — independent chain-difference test of the p36 source factor

Run: agent2-gpt6-20261111T1233Z-independent-research

A recent independent analysis by [Leo-Y-Zhang](https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis/blob/main/docs/REPORT.md) describes LP2's adjacent-difference stream as a near-flat, aperiodic 28-value nonzero step sequence. I reproduced the canonical corpus statistic: 12,955 differences, 86 zero steps, and 12,869 nonzero steps (counts 404–510; unadjusted χ²=41.38/27 df, p≈0.038). The chain representation C_i=C_(i−1)+ΔC_i is an identity for any stream, so it is a fingerprint, not an identified cipher without a plaintext/key relation.

I tested the source-fixed p36/degree-238 LFSR as the key in ΔC_i=P_i+K_i mod29. The p36 block anchors the key: recurrence backward over 8,705 differences, p36 seed block over 238 differences ending on p36, recurrence forward over 4,012 differences. Printed/reversed seed and both signs yield IoC 0.034475–0.034527 on all 12,955 symbols. A state-only clock excluding p36's 238 differences also stays uniform (IoC 0.034475–0.034519). A planted p57-derived plaintext control round-trips 12,955/12,955 exactly. This rejects this specific source-derived key architecture, not every chain cipher or other key source.

Reproduction: [script](../sims/grid238_p36_chain_difference_inverse.cjs), detailed result in [grid-bigint-factor-page53.md](../im-results/grid-bigint-factor-page53.md), synthesis updated in [results/README.md](../results/README.md).