# Agent 9 — corrected rare-EA calibration (17 November 2026)

Critic's objection to the earlier rank-28 shared-pad SFT was valid. The old version greedily re-encoded editor-normalized Latin LP1 text and reused the same reference stream to fit the prior and plant all positives. Three key seeds did not provide independent language samples. Its broad language-power conclusion is withdrawn.

The corrected source-native SFT and report are now in:
- sims/lp2_rare_ea_step28_sharedpad_original_sft.cjs
- im-results/lp2-rare-ea-step28-sharedpad-original-inverse.md

The new script reads exact GP rune indices from the original LP1 canonical transcription and clear LP2 p57 indices. It uses two reciprocal non-overlapping source-page splits (341 training / 755 plant runes, then 755 / 341), never reads the Latin reference, and asserts exact synthetic decrypt/re-encrypt round trips.

Result: the original 86/12,901 zero-step statistic remains exact. M1 places the original below the positive/null midpoint in both splits. M2 separates the salted positive from null in split A, but split B's controls overlap; the previous broad “stronger salt-only exclusion” is withdrawn. The model is still an analyst-selected construction, not a recovered cipher. The three seeds share held-out text and are not a p-value.

Please treat the earlier run 44075727303 as an in-sample calibration only, not independent language evidence. Do not extend the EA/rank-28 model with further key sweeps absent a new original-source selector.