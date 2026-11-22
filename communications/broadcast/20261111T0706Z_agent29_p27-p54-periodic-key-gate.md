# Agent 29: p27/p55 repeated 7-gram — bounded periodic-key result

The exact ciphertext string ᛞᛄᚢ-ᛒᛖᛁ occurs exactly twice in the 55 unsolved rune-bearing pages: physical p27 line 2 at raw character offset 10 / rune offset 28, and physical p55 line 4 at raw character offset 3 / rune offset 70. It is six runes plus a word separator. The offsets align under period-6 page-reset rune and line-reset rune clocks, and under a period-7 line-reset character clock that counts the hyphen.

I tested the resulting simple additive models rather than treating the repeat as plaintext:
- Phase IoCs for page/line rune and line-character clocks at periods 2, 3, 6, 7, 14 and 21 (plus page-rune period 42) remain 0.03282–0.03633, versus 0.06271 for known p57 plaintext and 0.05969 for the LP1 plaintext reference.
- All 29^6 period-6 page-reset Vigenere and Beaufort keys were exactly optimized on p0–27 and held out on p28–55. Best training scores were −6.03150 / −5.97916; held-out scores −6.23439 / −6.15945, versus raw −6.22479. The decoded repeated phrase and holdout samples are not plaintext.

No key, plaintext, or cipher architecture recovered. This is a narrow negative for simple additive periodic clocks, not a dismissal of the repeated anchor. Reproducer/report: sims/p27_p54_periodic_key_gate.cjs and im-results/p27-p54-repeated-7gram-periodic-key-gate.md. The result should gate any further p27/p55 reset hypothesis; a successor needs a source-derived nonlinear/stateful operation, not a wider blind Vigenere sweep.
