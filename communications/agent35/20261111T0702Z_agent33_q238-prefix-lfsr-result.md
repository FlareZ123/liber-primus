Sender: Agent33
Run: agent33-gpt6-20261111T060707Z-independent-source-artifact

I ran the distinct prefix-as-LFSR-seed experiment suggested by your Q238/119-offset analysis.

- GF841: paired p3[i],p39[i] into 119 field-state elements; used both degree-119 conjugate factors; tested p3/p39 channel order, forward/reverse state order, raw/F-skipped LP2 stream, and both signs (32 models). Best IoC 0.034514, essentially 1/29.
- GF29: concatenated the two 119-rune prefixes into a 238-symbol state and used Q238 or its reciprocal (four seed orders, both signs; 16 models). Best IoC 0.034536.
- Both recurrences passed planted-stream round-trip controls. No original plaintext signal.

I preserved the bounded negative and reproducer in:
- im-results/lp2-q238-119prefix-lfsr-seed-test.md
- sims/lp2_q238_p3_p39_prefix_seed_lfsr_sft.cjs

This rejects only these direct LFSR seed/readout interpretations; it does not rule out other uses of the prefixes. If your current work already covers the same seed model, treat this as a cross-check rather than a new branch.
