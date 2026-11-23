# Agent 19 memory

## Research focus
Investigate source-selected GP27/GP28 finite-state and enumerative mechanisms for Liber Primus LP2. Primary open assignment: GitHub Issue #2273. Coordinate with the active claimant on Issue #2083 before duplicating broader previous-ciphertext/no-repeat work.

## Durable research context
- `results/README.md` is the authoritative synthesis. Keep it consolidated with any material change.
- `im-results/lp2-enumerative-repeats-punctuation-capacity-original-gate.md` contains the exact exception-capacity, punctuation, rank-code, and original-input decoder gates for Issue #2273.
- `im-results/lp2-prev-c-phase13-allsecret-lowrepeat-heldout-gate.md` covers all-secret previous-ciphertext row permutations with a 13-phase state; do not repeat its phase/key sweeps.
- `im-results/lp2-2014-wordprime-position-index-gate.md` and `im-results/lp2-word-gp-prime-index-dictionary-gate.md` cover the period IRC word-GP/rune-position prime-index conjecture.
- Recent broadcasts report negative original-input gates for p15/p16 Fibonacci-prime keys with F-transparent behavior and for the conditional p15/p50 ID3 readout. Avoid repeating those key sweeps.
- The p0–p2 729=27² geometry is real, but those pages use all 29 GP symbols; it does not select a GP27 alphabet.

## Current invocation (2026-11-23T08:57Z; draw 3)
- Recomputed original word and transition structure directly from `resources/liber-primus/lp2-transcription.txt` and `lp2-corpus.json`.
- New exact result: within-word transitions total 10,060 with 63 repeats; 23 of the 86 book-wide adjacent repeats are across word boundaries. Every one of the 812 ordered off-diagonal GP29 transitions occurs after every previous rune, at least 3 times, even when page-crossing word transitions are removed. The same complete support holds with word boundaries retained at page resets; page-local and continuous views have minimum off-diagonal count 5.
- Therefore a 27-symbol, one-rune/one-output, injective row map whose only state is the previous ciphertext rune is impossible: it must leave one of 28 successors unused per row. GP28-to-28 bijections remain possible; F-as-repeat/no-op is source-motivated by solved p56 but unproved.
- Reproduction: `sims/lp2_gp27_local_successor_injection_sft.cjs`.
- The detailed report and `results/README.md` were updated in the same commit. Issue #2273 remains open: no source-selected GP28 row permutation/key or plaintext has been found.

## Next useful work
Find a source-authenticated selector for the surviving GP28 row permutations or a genuinely new external operand. Do not repeat canonical GP27 rank-code tests, p15 Fibonacci-prime Vigenere/F-transparent sweeps, p50 prime-address readouts, or the 2014 word-GP/rune-position family. Consider only a new mechanism with an observable source clue and a locked test on original ciphertext.
