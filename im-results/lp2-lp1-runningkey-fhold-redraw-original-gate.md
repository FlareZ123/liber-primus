# LP1 finite running-key inverse with authentic F holds and unlimited collision redraws

**Agent 2, 25 November 2026.** Direct additive LP1 source reuse was previously rejected under ordinary and authentic F-hold clocks; the additional collision-only redraw clock was not covered by that test. Here the exact unknown-origin inverse covers both clocks jointly and produces actual best plaintexts on all nine original chapter openings. No unknown plaintext or authentic key recovered.

## Frozen source and receiver

Two source registers: the 2,797-rune source-corrected solved first release and 2,797 printed original-order LP1 runes. Source correction of the two WHO/WHAT discrepancies is inherited from the [direct-key report](lp2-lp1-solved-plaintext-direct-runningkey-original-gate.md). Test GP index and authentic GP-prime mod29 encodings, both signs, every finite origin; no wrap, internal reset, word boundaries or adjustable key values. This omits the known-discrepant edited register intentionally. The historic source makes the LP1 running key human-plausible but does not select it.

For non-F plaintext, C=P+sign*K[j] mod29. If tentative C equals the immediately preceding physical emitted ciphertext, the draw can be rejected with fixed s=.81288 and the same P retried with next key. Any number of consecutive rejections is legal. P=F emits literal C=F and holds key position; that emitted zero becomes the next collision comparator. This combination is not authenticated as the actual LP2 cipher.

The exact Viterbi state is (absolute finite key cursor, last two P runes). Initialize every possible origin at score zero; merge only identical future-sufficient states. For C different from preceding C, a redraw is possible precisely when the first different key after the current equal-key run has the required delta; for equal C, any accepted key inside that run is possible. Thus all skip lengths are represented without a cap. Viterbi scores the native GP29 trigram log likelihood plus exact redraw/accept log weights, with target-excluded sections [0,2,3,4,6] for the LM. No beam. Source corrected LP1 excludes the planted target section in each control. Printed source remains available as a competing variant; it is ciphertext, not the target solved text.

Prefix-only selection uses all eight variants and every offset. Freeze winning variant, origin, terminal clock and final two plaintext runes. Decode withheld suffix without revising the prefix. Separately optimize over the complete window, allowing retrospective selection among all variants/offsets, for an exact finite-objective diagnostic. Recover actual plaintext and every latent consumption count by fixed-origin traceback; replay all emissions, rejection conditions and holds on the original ciphertext.

## Native calibration

| Target | Planted variant/origin | Redraws / F holds | Prefix exact | Untouched suffix exact | Suffix score (nats/rune) |
|---|---|---:|---:|---:|---:|
| WELCOME | corrected index +, 451 | 14 / 11 | 260/260 | 255/255 | −2.672963 |
| second KOAN | corrected prime −, 821 | 7 / 2 | 179/180 | 139/139 | −2.496446 |
| PARABLE | corrected index −, 1117 | 5 / 3 | 53/55 | 40/40 | −2.144492 |

All three hidden keys/origins and 434/434 withheld runes recovered; 492/495 prefix runes exact. All emitted ciphertext replays. These are constructed source-native controls, not decryptions of the historic LP1 ciphertext with this new combined law.

## Original exact inverse

Same first-729-rune chapter openings used in the earlier direct-key report (complete final 308-rune window), with p0 split at 262 and p54 at 232; remaining seven use 486/243. Source-fixed variant and offset chosen on prefix only.

| Physical chapter | Best prefix score | Frozen suffix | Exact retrospective full-window maximum |
|---|---:|---|---:|
| p0–2 | −4.610540 | dies at suffix index 23 | −4.841830 |
| p3–7 | −4.822688 | dies at 108 | −4.920427 |
| p8–14 | −4.931612 | dies at 11 | −5.027757 |
| p15–22 | −4.905919 | dies at 4 | −4.959624 |
| p23–26 | −4.809398 | dies at 11 | −5.003717 |
| p27–32 | −4.868166 | dies at 149 | −4.955296 |
| p33–39 | −4.907464 | dies at 16 | −5.079139 |
| p40–53 | −4.924045 | dies at 69 | −4.970267 |
| p54–55 | −4.819339 | −5.176817, nonprose | −4.846095 |

Unlike the no-redraw exact-support result, every one of the 72 variant/chapter full-window domains retains some legal path; the collision branch creates substantial extra support. The result is therefore an exact finite trigram-plus-coin objective bound and predictive failure, not a general nonexistence proof. All nine best retrospective inverses are nonprose and much worse than the native controls. For example p0 starts N E M M P OE H F Y G TH TH L B L H S D E O X E E T NG Y J TH C A W; p54 starts A R O U S P A D G C Y A C O W Y R IA TH N O EO J E H D. No reason to tune the receiver or re-score the same offsets.

**Decision:** retire this precise source-fixed, physical-predecessor, unlimited-redraw + latent-F clock under the tested native likelihood and source windows. It does not cover other source streams, a consuming-only collision comparator, arbitrary non-native language, a different coin model, internal resets, or other ciphers. No unknown LP2 plaintext or key.

## Reproduction

[Exact SFT](../sims/lp2_lp1_runningkey_fhold_redraw_exact_sft.cjs), commit 1e2399db2624bbb4400d81e5eaaa4a15bf5ad900. Run `node sims/lp2_lp1_runningkey_fhold_redraw_exact_sft.cjs controls` or chapter index 0–8 or all. Core was executed in V8 against corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, native blob 1b064ef6d85819b7d96adaff31a82d1ec551598f, printed blob 37c96b816495c5f93ca658a01c9918bf92598316. The standalone CJS filesystem wrapper was not separately executed. Raw [WELCOME](lp2-lp1-runningkey-fhold-redraw-control-welcome.json), [KOAN/PARABLE](lp2-lp1-runningkey-fhold-redraw-controls-koan-parable.json), nine chapter records [0](lp2-lp1-runningkey-fhold-redraw-ch0.json), [1](lp2-lp1-runningkey-fhold-redraw-ch1.json), [2](lp2-lp1-runningkey-fhold-redraw-ch2.json), [3](lp2-lp1-runningkey-fhold-redraw-ch3.json), [4](lp2-lp1-runningkey-fhold-redraw-ch4.json), [5](lp2-lp1-runningkey-fhold-redraw-ch5.json), [6](lp2-lp1-runningkey-fhold-redraw-ch6.json), [7](lp2-lp1-runningkey-fhold-redraw-ch7.json), [8](lp2-lp1-runningkey-fhold-redraw-ch8.json). All contain actual GP plaintext indices and consumption paths where legal.
