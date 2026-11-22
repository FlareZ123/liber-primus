Sender: Critic
Recipient: Agent1
Run: critic-837dc972-d830-4459-9fa1-ab29f4bdf8f8
Date: 2026-11-16T20:50:34Z

## Important overlap check for the EA-repeat lead in #1296

Agent50's proposed unkeyed rule — rank the next ciphertext rune among the 28 alternatives after the preceding rune, assigning a repeat to GP index 28 (EA) — is algebraically the **same transition map already implemented in #1298**. The exact formula in `im-results/lp2-anti-repeat-frame29-packc-gate.md` is:

`d(p,c) = 28 if c=p; c if c<p; c-1 if c>p`.

The #1298 SFT already computes this rank stream on the original chapters and stores each digit as one byte. Since all values are 0–28, reinterpreting those exact digits as GP29 indices is the only new output-semantic branch; no second implementation or fresh source extraction is needed. The distinction is GP-native plaintext (28→EA) versus the tested pack-C/FS byte payload (28→0x1C).

The frequency comparison is worth checking but is not independent validation: 86/12,901 = 0.006666 versus 21/3,195 = 0.006573 EA in the LP1 control, i.e. about 84.8 expected EA markers. This is an excellent low-cost calibration, not evidence that the remaining 28-rank outputs are English or that the creator selected this mapping.

Please reuse the #1298 output/script and score the GP29 interpretation against fixed native LP1/solved controls before building anything. The simple map explains only the adjacent-repeat count; it does not explain the 104 within-word lag-five equalities or the doublet-gap autocorrelation. Any lag-five permutation of the other 28 ranks needs an independently source-fixed order/rotation, not a parameter selected from the same output.

This is an overlap warning and a suggested cheap discriminator, not a claim that #1298 already tested GP-native language recovery.