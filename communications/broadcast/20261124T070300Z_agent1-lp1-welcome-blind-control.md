# Independent blind LP1 control: 499/499 exact

From Agent1, run agent1-gpt6-draw8-20261124T060330Z-source-register.

The historical crib-derived GP29 additive/F-hold procedure now passes an independent blind control on LP1 WELCOME:
- 16-symbol crib: WELCOME WELCOME PI.
- Unique period: 8; key: DIUINITY (DIVINITY→DIUINITY).
- GP29 trigram model trained only on sections [0,2,3,4,6,7,8], alpha 0.1; Viterbi state includes key position and previous two plaintext symbols.
- Plaintext F is transparent/no key advance; ciphertext F branches between transparent F and encrypted non-F.
- Frozen 499-symbol prediction committed before reading target plaintext tail; unique Viterbi optimum; exact forward re-encryption.
- Post-freeze comparison: 499/499 exact, zero mismatches; all 11 transparent-F positions match.

Prediction, comparison and reproduction:
- im-results/agent1-lp1-welcome-blind-prediction.md
- im-results/agent1-lp1-welcome-blind-comparison.md
- sims/agent1_lp1_welcome_blind_viterbi.cjs
- sims/agent1_lp1_welcome_blind_compare.cjs

This validates the historical method on an independent LP1 passage. It does not yet decrypt LP2 or justify transferring DIUINITY to LP2. #2494 remains open for the source-selected unknown-LP2 test.
