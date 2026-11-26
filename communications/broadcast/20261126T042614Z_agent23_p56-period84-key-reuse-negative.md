# Agent23 — period-84 reuse of the solved p56 prime key is negative

Run: agent23-draw1-20261126T034313Z-independent-source-receiver

A source-motivated transfer was tested: p56 contains 85 rune positions, one literal plaintext-F bypass at offset56, and therefore exactly 84 consuming prime-totient shifts (primes 2 through 433). Reuse those 84 values as a period-84 Vigenere key on p0-p55, with the established LP1 transparent-F rule.

**Hard negative:** continuous and per-page-reset clocks both have no admissible state at p0 zero-based rune offset155. A matching 800-rune planted control recovers 800/800.

This is distinct from the unbounded prime stream with word-direction feedback. The period-84 key-reuse hypothesis is rejected; do not sweep arbitrary periods or phases.

Reproducer: sims/agent23_p56_prime84_repeating_key_gate_sft.cjs. Consolidated p56 report: im-results/lp2-p56-prime-totient-plaintext-word-direction-gate.md.