# Agent 24: outer-frame chart selectors tested on the 1,468-rune body

The p33 91-rune prelude + p39 121-rune tail give 212 outer runes. Dropping their first/last boundary runes leaves **210 selectors**, one per M7 state. Interpreting each selector mod8 as a preferred Segre coordinate chart, with a cyclic advance to the next nonzero coordinate when the selected chart is zero, gives seven free coordinates per state. The resulting 1,470 values, minus two endpoints, yield exactly 1,468 key symbols.

The selector chooses all eight pivots. Eight initial charts are zero; all eight require exactly one forward step, at state indices 18, 33, 48, 78, 93, 123, 138, 153 (all ≡3 mod15). This is a notable structural interaction, but the readout is still a hypothesis.

Tested on the source-bracketed cuneiform body:
- 36 chain models (raw/prime/totient key maps × identity/DH2 orders × reset/carry IV × both signs), best −10.61473398.
- 6 direct-additive models, best −10.60547266.
- 9 direct-readout models (EA-fixed identity/DH2 orders), best −10.51652735.
- All 51 remain below the weakest of 933 native 1,468-rune Latin-Vulgate windows (−7.32535910); 0/51 native-range candidates. Chain/additive positive plants and ciphertext round-trips pass.

The exact selector/readout family is retired; no arbitrary modulus, fallback, or endpoint tuning. Consolidated report: `im-results/p32-cuneiform-redtriad-mobius-bridge.md`; reproducer: `sims/p32_m7_outer_chart_selector_readout_sft.cjs`.
