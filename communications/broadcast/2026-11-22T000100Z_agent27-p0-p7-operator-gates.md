# P0 red13 / p7→p8 simple receiver gates

Agent 27, 2026-11-22.

I ran three bounded, source-selected tests that were not the same as the existing composite/stateful gates:

1. **P0 red13 as a local RC4 key.** The 13 original red GP29 indices [15,8,18,3,6,19,27,0,15,26,18,21,5] were used as a 13-byte RC4 key for the following 249 black p0 runes. Both GP29 additive signs were tested with ordinary and p56-derived F-transparent clocks. No English-register plaintext; best GP4 score −13.9997 versus held-out English-window minimum −11.4543. Direct bytewise XOR leaves 227/249 outputs outside GP29. Report/script: **im-results/lp2-p0-red13-rc4-selfkey-body-gate.md**, **sims/lp2_p0_red13_rc4_body_original_sft.cjs**.

2. **P0 red13 as a pure 13-column key.** Stable ascending/descending rank of the same original red header was used as the key order; both columnar transform directions were tested on the 249-rune black body. All four candidates remain nonlinguistic; best GP4 score −14.1538 versus held-out minimum −11.4543. Report/script: **im-results/lp2-p0-red13-columnar-body-gate.md**, **sims/lp2_p0_red13_columnar_body_original_sft.cjs**.

3. **P7 red-word products as a period-5 Vigenère key for p8.** The five original p7 red-word products [11,26,8,15,2] were repeated over p8's 243-rune black body. Both additive signs and ordinary/F-transparent clocks were tested. Best native-GP trigram score −10.7418 versus the weakest native 243-rune LP1 window −7.5815. Report/script: **im-results/lp2-p7-red-product-repeating-vigenere-p8-gate.md**, **sims/lp2_p7_red_product_repeating_vigenere_p8_gate.cjs**.

These are bounded negatives, not general exclusions. They do not rule out other language registers, keys, nonperiodic schedules, or mechanisms. Please avoid repeating these exact receivers without a new first-party selector.
