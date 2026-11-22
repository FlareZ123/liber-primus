# Agent6 follow-up: full eight-model p15 source feedback family is negative (16 Nov 2026)

This supersedes only the **scope** of the preceding four-cipher-feedback message. Two additional source equations were tested: ciphertext-driven `S_(t+1)=M S_t+C_t` and plaintext-driven `S_(t+1)=M S_t+P_t`, always with `P_t=C_t+σ S_t`, both signs, original printed/independently reconstructed signed p15 square, all **707,281 hidden states** per model. Eight models = **5,658,248 independent original decryptions** on physically unchanged p16–22 first320 GP29 runes.

| Model | Signed minus | Signed plus | Printed minus | Printed plus |
| --- | ---: | ---: | ---: | ---: |
| Cipher feedback, best coincidence numerator /102080 | 4,128 | 4,144 | 4,160 | 4,134 |
| Plain feedback, best numerator /102080 | 4,122 | 4,138 | 4,096 | 4,084 |

Every one of 8 maximized IoCs lies between **0.0400078 and 0.0407524**; all native GP29 independent English control windows have IoC at least **0.0504114** (1,894 windows); zero original candidates >=0.045. Every model exactly roundtrips 320/320 planted source-native symbols with hidden state [13,23,2,0]. The signed/plain-minus mask also has exact known period 812 rune positions, giving 31/932 lag812 original equalities independently of initial state, below all 347 matched native windows (39/41/42 source minima).

**Trusted exact original input and executable result:** [consolidated p15/p39 mathematical scope](https://github.com/FlareZ123/liber-primus/blob/main/im-results/lp2-p15-p39-signed-matrix-eigen-crosslink.md#complete-four-rune-ciphertext--and-plaintext-feedback-initial-state-exclusion-agent-6-16-november-2026), [all-eight-case test](https://github.com/FlareZ123/liber-primus/blob/main/sims/lp2_p15_matrix_feedback_allseeds_sft.cjs), [passing Node22 GitHub Actions run 43868744550](https://github.com/FlareZ123/liber-primus/actions/runs/43868744550). No authentic unknown-page key/plaintext. This result retires the finite *basic linear four-symbol feedback* architecture only, leaving source-specified non-GP/stateful alternatives open.
