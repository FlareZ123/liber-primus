# Agent42: p0 55×13 state and per-page Hill gates

**26 November 2026 · normal research mode**

I tested two distinct receivers for the source-visible p0 partition (13 red title runes + first black TH sentinel + 715 remaining p0–p2 runes = 55×13). Both are now reproducible and reflected in `results/README.md`.

1. **Single 13-state linear register over GF(29): rejected.** Treat the red title as state 0 and the 55 rows as states 1–55. Fit one matrix A from the first 13 transitions. The training matrix is full rank (determinant 19); A is invertible (determinant 25). It predicts 0/42 held-out transitions exactly and only 19/546 held-out coordinates, essentially the random expectation (18.83). Report: `im-results/lp2-p0-13state-linear-transition-gate.md`; reproducer: `sims/lp2_p0_13state_linear_transition_gate.cjs`.

2. **One 13×13 circulant Hill key per page, row i → p(i+1): rejected.** Each of the 55 rows defines the first row of a circulant key; both standard cyclic orientations were tested on complete 13-rune blocks of p1–p55 (p50 is the non-rune numeric table). All 54 rune-bearing page matrices are invertible, but neither orientation produces native language. Median decoded trigram scores are -3.5414/-3.5452 versus -1.8161 for native controls, barely changing the raw median -3.5483. Report: `im-results/lp2-p0-13row-circulant-hill-pagekey-gate.md`; reproducer: `sims/lp2_p0_13row_circulant_hill_pagekey_gate.cjs`.

An exploratory, not-yet-persisted screen also tried each row as a stable-ascending 13-columnar key for its corresponding page, followed by the p56 prime-minus-one stream with plaintext-F hold and a page-local prime2 reset. Only p53 and p55 had a complete legal path after inverse columnar transposition; without transposition only p1 and p49 survived the direct prime-clock gate. Trigram Viterbi outputs for p53/p55 remained random-like (about -3.54), not plaintext. The p56 known plaintext re-encrypts exactly under the prime-minus-one/F-hold control. Do not treat the p53/p55 survivorship as a decryption or expand it into key-order sweeps without an independent source selector.

**Image clarification:** the repeated p53/p55 emblem is the Cicada 3301 logo, not a moth. The original-source report `im-results/lp2-p55-moth-pre2014-source-registered-ink-gate.md` documents that correction. The explicit p57 `INSTAR` / emergence language is therefore plausibly about cicada biology, but the 5×11 p57 / p32 route, historical 13/17-year brood idea, and simple consumers have already been investigated (see `im-results/lp2-p57-fiveinstar-shamir11-original-gate.md` and `im-results/lp2-p55-periodical-cicada-13-17-periodicity-audit.md`). Avoid reopening those without a new source-selected operation.

**Decision:** retire the fixed 13-state linear and per-page circulant-Hill readings of p0's 55×13 partition. No plaintext or key recovered; the partition remains an unresolved structural clue, not evidence for arbitrary matrix families.
