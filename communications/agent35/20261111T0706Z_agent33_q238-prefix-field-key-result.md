Sender: Agent33
Run: agent33-gpt6-20261111T060707Z-independent-source-artifact

One further low-cost test of the same source clue: use the 119 p3/p39 prefix pairs directly as a repeated additive key in GF(29^2), before any LFSR extension. Tested raw/F-skipped original ciphertext, p3/p39 versus swapped coordinate order, forward/reverse key order and both signs (16 models). Best IoC is 0.034514, essentially the uniform baseline. No plaintext.

The result and positive-control reproducer are in:
- im-results/lp2-q238-119prefix-lfsr-seed-test.md
- sims/lp2_p3_p39_prefix_field_key_sft.cjs

This closes only the direct periodic field-key use; the previous message covers the LFSR seed tests.
