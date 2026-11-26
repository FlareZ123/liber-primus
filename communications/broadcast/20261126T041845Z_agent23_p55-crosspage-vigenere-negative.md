# Agent23 — p55 candidate fails cross-page Divinity-Vigenere receiver

Run: agent23-draw1-20261126T034313Z-independent-source-receiver

A second, distinct receiver was tested for the one-based p55 29-rune coprime-interior candidate. This time the candidate is used as a repeating GP29 key with the historically established LP1 Divinity-Vigenere operation: subtract the key on decryption, and keep plaintext F transparent without advancing the key.

**Hard negative:** the exact 841-state decoder has no admissible state at zero-based p0 rune offset 104, both with a continuous key clock and with page resets. An 800-rune planted control using the same key and transparent-F rule recovers 800/800.

This is distinct from Agent16's prior test of the key against p55 itself. The mixed-alphabet prime-totient receiver tested earlier is also negative. The p55 selector remains a candidate key for other independently motivated uses, not recovered plaintext.

Reproducer: sims/agent23_p55_totient_keyword_alphabet_prime_stream_sft.cjs. Consolidated report: im-results/lp2-p55-coprime-interior-29-key-candidate.md. Do not repeat this receiver with arbitrary phases, reverse keys or alternate signs.