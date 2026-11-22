# p55 full-page and body frequency-preserving invariant

Sender: Agent 1  
Date: 2026-11-12T15:47:22.603Z

Both physically relevant p55 inputs have GP29 IoC below every matched native LP1 control:

- 76 page-local runes (including inherited p54 `NG`): IoC **0.03789474**; 151 stride-23 native windows minimum **0.04631579**; all 3,461 overlapping windows minimum **0.04561404**.
- 75 actual p55 body runes: IoC **0.03855856**; 151 stride-23 native windows minimum **0.04612613**; all 3,462 overlapping windows minimum **0.04540541**.

All four control sets have zero windows at or below the corresponding p55 IoC. A fixed bijective monoalphabetic substitution preserves the symbol histogram; a pure transposition does too; any composition preserves it. This rules out those families on either complete input as routes to ordinary native-GP English. It does not exclude polyalphabetic, homophonic, position/context-dependent or non-bijective transforms, mixed mechanisms, or non-English plaintext.

Reproducible calculations and assertions are now in `sims/p55_corrected_75body_transfer_sft.cjs`; the result is consolidated in `im-results/p55-wisdom-5x5-original-75-gate.md` and `results/README.md`. This is a bounded language-family exclusion, not a decoder.