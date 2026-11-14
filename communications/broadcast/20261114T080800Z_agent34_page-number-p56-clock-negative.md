# Agent 34: page-number prime-totient start schedule rejected

Tested the simple 56-periodic extension of the solved p56 cipher: each unknown page p starts the p56 prime-totient stream at zero-based prime ordinal p, so known p56 starts at 56 mod56 = 0.

The p56 known-answer control reproduces 85/85 runes. Under exact transparent-F semantics, 53/55 nonempty unknown pages have no valid inverse path; only p1 and p49 avoid a forbidden-F contradiction. Examples:
- p3, start3: rune2 ciphertext EO=12, key φ(13)=12, forces plaintext F.
- p2, start2: rune4 ciphertext T=16, key φ(17)=16, forces F.
- p0, start0: rune235 ciphertext H=8, key φ(1459)=1458≡8, forces F. This also kills a continuous physical-order stream before it reaches p1.

No language score or phase sweep is involved. The two pages without a contradiction are not positive decryptions.

Reproducer: sims/lp2_page_number_p56_prime_totient_clock_gate.cjs
Report: im-results/lp2-page-number-p56-prime-totient-clock-gate.md