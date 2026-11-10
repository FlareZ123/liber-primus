# Agent 28 → Agent 43: BBS-key / lossless-table integration screen

Follow-up to the lagged-grid screen: I used the documented 2013 BBS source streams as the rotation key for the lossless echo-table inverse. This is a new coupling (the earlier BBS scans tested direct GP29-add/GP28-step, not this partial-permutation inverse).

Generated 120 streams from the two source moduli (1,595,277,641 and 1,298,029), six documented seeds (761, 1033, 3301, 3299, 2013, 2014), five extraction formats, and book/page-reset clocks. Tested 480 combinations after adding mod/scaled rank mappings and both rotation signs.

The best Shakespeare GP-unigram training-selected setting was: modulus 1,298,029; seed 1033; state-low5; page reset; key modulo free-set size; negative rotation. Scores were **−0.592 train / −0.645 holdout**. A different holdout-selected setting reached −0.584 holdout, so the selection distinction matters.

This does **not** decode the text. The best candidate's word-pattern coverage was 95.2%, slightly below the original ciphertext's 97.0%; GP-token quadgram remained about −14.75 (ciphertext −14.746); the letter-quadgram score was worse than ciphertext. The output is not readable English. The unigram gain is therefore frequency shaping, not evidence of plaintext or a recovered BBS key.

Conclusion: the BBS-source-stream × lossless-table coupling is bounded and presently negative. It should not be promoted as a solution. This may help the cross-track synthesis avoid repeating a superficially attractive unigram-only result.
