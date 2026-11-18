# p50 low60-even exact additive key-hold discriminator

**Agent 19 independent exploration, 18 November 2026. Evidence class: bounded original-input architecture exclusion. No unknown plaintext or key recovered.**

## Question

The established p50 clock places unusually many adjacent-equal ciphertext transitions under cells whose printed token begins with `0`. Agent 13 subsequently found that, within this low60 class, conventional base60 second-character bit 0 is predictive: the even state carries 29 repeats in 1,809 opportunities while the complement carries 57 in 11,092.

A natural reversible interpretation is an additive running key whose state is **held** at those low60-even opportunities:

[
C_i = P_i + K_i pmod{29}, qquad K_{i+1}=K_i
]

at the selected transitions. If that is true, every selected ciphertext difference must equal the corresponding plaintext GP29 difference, independent of the secret key. This predicts the complete 29-residue difference law, rather than only the discovered equality count.

## Frozen test

The selector is fixed before this test:

- continuous global p0-p55 row-major p50 clock at phase zero;
- same-page adjacent transitions only;
- printed token begins with `0`;
- conventional base60 value of the second printed character is even.

This selects 36 physical p50 cells and 1,809 original transitions. Their observed difference-zero count is 29.

A source-native GP29 plaintext difference law is calibrated from the pinned Shakespeare control using the repository's solved-source orthography encoder and Jeffreys 0.5 smoothing. The original selected 29-way histogram is scored against that fixed law and against uniform GP29 differences. Independent matched controls use every 12,956-rune window available from pinned Gibran and Emerson source-native encodings, with the exact original page geometry and selected p50 mask.

## Result

The original selected histogram is strongly unlike the source-native difference law:

- native-vs-uniform log-likelihood ratio: **-67.867702 nats**, or **-0.0375167 nats/transition**;
- deviance from the fixed native law: **191.527909**;
- 56 matched independent native-GP windows have per-transition native-vs-uniform LLR from **+0.0287218** through **+0.0780573**;
- **0/56** matched controls score at or below the original selected LLR;
- matched-control deviances range **23.5174–98.7503**;
- **0/56** matched controls have deviance at least as large as the original.

A planted positive encrypts source-native Gibran GP29 under an arbitrary deterministic additive key that is forced to hold at the same selected transitions. The selected ciphertext-difference histogram then equals the plaintext-difference histogram **exactly**, as required.

The observed selected repeat rate is 29/1,809 = **1.60310%**. Pinned source-native controls have overall repeat rates around 2.8–3.3%; even the solved p57 sample is 1/94 = 1.0638%. The complete histogram test avoids depending on this single component.

## Decision

Reject the exact interpretation **"low60-even means hold an additive GP29 keystream/state"** for the source-native English register. The selected transitions retain the repeat enrichment relative to the heavily repeat-suppressed complement, while their broader difference law is anti-native. The parity state therefore behaves like a narrow self-transition permission/suppression signal under any viable mechanism, rather than exposing plaintext differences through a held additive key.

This extends two nearby results without reopening them: Agent 25's concurrent broad-low60 key-hold test rejects holding at all 60 low cells, and Agent 13's nonzero-difference consequence test found no transferable plaintext-like law after excluding repeats. The present test closes the stronger parity-refined exact-hold hypothesis using the full fixed 29-way invariant.

Reproduction: `sims/lp2_p50_low60_even_keyhold_discriminator_sft.cjs`. Windows Node 22 PASS: Actions run **44398956207**.
