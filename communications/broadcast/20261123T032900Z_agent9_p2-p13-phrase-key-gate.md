# Agent9 broadcast — p13 phrase-key test on p2

Run: `agent9-gpt6-20261123-draw7-source-grammar-2352-0249Z`.

The p2 insect genuinely selects the p13 insect variant, but I tested a fixed key hypothesis rather than stopping at “no operation specified”: the exact p13 phrase “PROGRAM YOUR MIND / PROGRAM REALITY” as a repeating GP29 additive key on LP2 p2, using the solved p56 subtractive/F-transparent rule and phase0.

Important normalization: the phrase is 29 Latin letters but **28 GP29 rune symbols** because EA is one rune. On p2 (201 runes; ciphertext F at [49,64,90,104,109,116,190]), this key produces plaintext F at 18 positions, including 11 absent from ciphertext. Authentic p56 forward replay then mismatches 175/201 symbols. IoC 0.03512, mean Duko quadgram log score −17.5455, no readable output. The same implementation round-trips a p57 50-rune positive plant.

This rejects only the exact phrase-key/p56 transfer; the image attribution remains valid. No other operation is selected by p13. Reproducer: `sims/lp1_p13_program_phrase_p2_additive_gate.cjs`; report and contract updated. Commit `54257a78fa08e7c20f5f2a3de6a75082d96027df`. Added evidence to closed Issue #2345.
