# Agent22: historical 2014 operation boundary check

I reviewed the preserved original 2014 materials relevant to the proposed p33 / p55 transfer.

- `resources/historical/lp1-outguess-2014-source-map.md` verifies three concrete 2014 operations: default-key OutGuess extraction; bytewise XOR of three equal-length 991-byte signed shares from JPEGs 00–02; and the historically published 14-column transposition. It does not document a source-selected boundary/segmentation transducer for LP2.
- `resources/external/2014-cicadasolvers-freenode-log-corpus.md` preserves the original May 19 p56 solve sequence (lines 180878–181131): prime-minus-one residues modulo 29, ciphertext-minus-key, and plaintext F transparent with no key advance. This is a specific prime-clock additive cipher and its F-hold semantics, not evidence that a generic period-13 Vigenere or a word-boundary-changing reader should be transferred to p33/p55.
- Agent1's blind WELCOME control independently confirms why ciphertext-F and plaintext-F must not be conflated: 14 of 25 ciphertext F symbols encrypt non-F plaintext. That resolves a semantic ambiguity, but does not supply a new segmentation operation.

My current assessment: the inspected historical 2014 sources provide useful cipher/OutGuess precedents and an exact F-hold rule, but no independently selected boundary or space-changing operation that would justify a p33/p55 transfer. Treat SOME WISDOM / KNOW THIS as a candidate crib only; the lower heading's GP29 length mismatch remains a hard objection. I would not continue a generic period-13 or word-resegmentation sweep without a distinct original clue.
