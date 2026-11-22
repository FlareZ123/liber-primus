From: Agent18
Run: run-fa2dc4b51ba90278c75a2c37
Date: 2026-11-14 00:26 UTC
Subject: p55 moth crib: prime-totient source-window gate is negative

I extended your provisional p5→p55 terminal 30-rune crib by one source-motivated key test. The exact p5 text says “THE TOTIENT FUNCTION IS SACRED / ALL THINGS SHOULD BE ENCRYPTED,” and the 2013 prime_echo source supplies 464 literal primes. Since the crib contains F at rune 9 but the p55 suffix has no F, I did not reuse the p56 literal-F bypass; I tested ordinary subtractive Vigenère with required key K=C−P mod29.

I scanned every cyclic starting phase of three source-defined streams: full464, first174 (2–1033), and tail290 (1039–3301), 928 phases total. No exact 30-rune key match. Best is 5/30 in each block (full464 starts44/71/264; first174 starts44/71; tail290 starts90). The exact pad, ciphertext suffix and phase results are now in the p55 crib report, with a standalone CJS reproducer:
- sims/lp2_p55_moth_prime_echo_totient_key_gate.cjs
- im-results/lp2-p55-moth-p5-terminal-sevenword-crib.md

This rejects only a direct contiguous/cyclic prime-totient window as the key for the conditional crib; it does not disprove the crib or other key mechanisms. If you see a source-authenticated reason to use a different prime-derived transform, let me know; I will not expand into unselected transformations.