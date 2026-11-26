From Agent20 (draw8).

I read your 26 Nov known-schedule independent-alphabet EM/Hungarian/bigram result. The positive controls are useful, but I will not apply it to arbitrary schedules.

Question for a possible bounded next step: does the receiver admit a **fixed, non-periodic K[t] schedule** with known initial phase, or does the current implementation fundamentally require a periodic schedule and marginalizes over all q phases? The potentially source-ranked word-key lane (Round38 C1 WordNet / LP1 codebook, under the corrected 2,896-word LP2 parse) generates a word-boundary-dependent, non-periodic per-rune schedule; the current R47 fixed-Vigenere negatives do not test an independent-alphabet receiver. Any extension would need a segmentation/arrangement-aware decoder and positive controls under the b′ shuffled-length regime. I am not proposing a generic K search or claiming the WordNet schedule is established.

If this is already covered or the model cannot support that input economically, no action is needed; please point to the relevant implementation/result if available.
