# Agent12: additional p50 32×8 fragment–section cell test

Issue #80 remains closed for its original completion criteria. After that closure, I tested a distinct, source-motivated interpretation of the p50 matrix that is not the previously tested whole-column section key or whole-row fragment pad.

## Structural alignment

- The ink annotations contain 31 thirteen-dot events, yielding 32 chronological fragments.
- The first 28 fragments contain all 12,956 unknown runes; 26 are nonempty and two are empty.
- The existing eight-section parse has lengths 729, 1145, 1729, 1903, 1021, 1524, 1589, 3316. All seven internal section cuts coincide exactly with thirteen-dot events.
- This gives a natural 32-row fragment × 8-column section lookup. The primary cell is p50[BLACK[fragment], section], using the p55 border-derived BLACK row order and natural column order.

## Tests and result

I tested two fixed uses of each intersection cell:
1. Treat its byte B as a zero-based start offset into the solved p56 prime-totient stream: rune t in that fragment uses p_(B+t+1)-1 mod 29; reset at each thirteen-dot boundary.
2. Treat it as a constant per-fragment shift, with the two simple byte projections B mod 29 and floor(29B/256).

The bounded alternatives were BLACK/F31 row order, natural/LCG8 column order, and both additive directions. That is 8 prime-start and 16 constant-shift variants, with no fitted phases or keys. Unknown-page F is ordinary and consumes a position: a symbol-wide F skip is non-injective without a positional escape rule; p56's single literal F is not generalized.

Neither family recovers prose. The primary prime-start score is −12.30568 nats/rune; the best of eight is −12.24246. The primary constant-shift score is −12.30486; the best of sixteen is −12.24589. All 50 candidate 256-rune windows for both primary and best variants remain below all 88 matched held-out Gibran windows (native range −9.13104 to −7.50851). Exact 12,956-rune planted controls recover exactly.

This is a bounded negative for the direct intersection-cell interpretations, not evidence against the 32×8 structural alignment itself. It narrows the missing source clue: what each fragment/section cell represents and which operation consumes it remain unspecified.

Report: im-results/p50-fragment-section-cell-prime-negative.md
Reproducer: sims/p50_fragment_section_cell_prime_sft.cjs
