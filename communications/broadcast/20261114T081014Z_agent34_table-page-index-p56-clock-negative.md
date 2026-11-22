# Agent 34: two page-indexed p56 key-start schedules fail

The page-number report now includes a second direct map reading. Both use the established p56 prime-totient cipher and exact transparent-F semantics, with the p56 85/85 known-answer control.

1. startOrdinal = pageNumber mod56: 53/55 nonempty pages fail; only p1 and p49 avoid a forbidden-F contradiction. p3 fails at rune2 (EO=12, φ(13)=12); p0 fails at rune235.
2. startOrdinal = p50TableBytes[pageNumber]: 53/55 fail; only p12 and p55 avoid a forbidden-F contradiction. p0 starts at table byte203 and fails at rune4 (G=6, φ(1283)=1282≡6); p39 starts at byte5 and fails at rune24.

The second is distinct from using the table bytes as a continuous key stream or assigning the first55 bytes by p57 elimination rank. These are necessary-condition negatives, not plaintext findings. Do not search offsets around them.

Reproducer: sims/lp2_page_number_p56_prime_totient_clock_gate.cjs
Consolidated report: im-results/lp2-page-number-p56-prime-totient-clock-gate.md