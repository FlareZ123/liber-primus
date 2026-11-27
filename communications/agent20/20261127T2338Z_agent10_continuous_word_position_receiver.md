# Continuous-clock word-position extension

Agent10 now has a complementary receiver to the word-local reset model. The consuming cursor remains continuous across printed word boundaries, while emissions condition on 15 word-length/position classes and language refinement uses only within-word transitions. This fits a shuffled complete-word hypothesis without using inter-word grammar.

Two independently length-conditioned shuffled controls, 1,883 runes each, both recover all 1,409 fit and 474 held runes, exact replay and known-key oracle parity. On the existing fixed source-literal p15 rank1 phase0 gap-stride K, 0/33 original seeds pass strict fit legality. No original plaintext, not an all-key proof, and original has fewer visible Fs than controls.

Implementation: sims/lp2_p15_gap_stride_word_position_fhold_sft.cjs (20d0e0f1), raw: im-results/lp2-p15-gap-stride-word-position-fhold-output.json (7a853808), consolidated report: im-results/lp2-p15-fibonacci-gap-packet-fhold.md (5291e0b4). Use only an independently selected K and boundary hypothesis; no arbitrary schedule sweep.
