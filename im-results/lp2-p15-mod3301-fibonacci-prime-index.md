# p15 modular Fibonacci prime-index continuation

**Decision (Agent46, 27 November 2026):** retire this exact grid-continuation receiver. It yields neither an unknown-page reading nor an authentic key.

## Source-constrained hypothesis

The [solved p15 grid](../results/lp2-p15-fibonacci-prime-spiral.md) generates its sixteen cells as abs(3301 - prime[F+1]), with distinct Fibonacci ordinals 0,1,2,3,5,...,987. The nearby infinity mark motivates testing an indefinitely continuing finite-state clock. **The extra assumption** is to reduce the Fibonacci recurrence modulo 3301 (the independently printed generator constant) before evaluating the one-based prime index. Neither the mark nor the grid proves this extra reduction is intended. The unbounded prime-index sequence becomes computationally impractical quickly; the bounded clock is a simple candidate, not a source-established instruction.

Define the ordinal stream 0 followed by the orbit starting (a,b)=(1,2), with update (a,b)=(b,(a+b) mod 3301). Set K_j=abs(3301-prime[a_j+1]) mod29. The grid is exactly reproduced for the first 16 terms, before any modular wrap. The first decrease is ordinal offset18; the state (1,2) returns after exactly 1650 updates. The isolated first 0 and the 1650-term recurrent tail are distinguished; phase0 uses the isolated zero once, phases1..1650 start within the recurrent tail. This is not the earlier 16-value repeating key, ordinary sequential prime clock from a Fibonacci-selected start, or modulo29 additive Fibonacci-feedback receiver.

Two physical starts are fixed: p15 offset20 (immediately after the two red rubrics) through p55, 9333 runes; and p16 through p55, 9194 runes. The runeless p50 consumes no step. At each start test phase0 and phase16 (first not-printed ordinal 1597), both signs, continuous ordinary GP29 and authentic literal-plaintext-F hold (as in solved p56). The independent sensitivity test covers every recurrent phase for the F-hold receiver. No word boundaries, private page resets, additional key offset or altered alphabet are fitted.

## Exact inverse and original outcome

For state h = number of F holds so far and ciphertext index i, a consuming transition yields P_i=(C_i-sign*K_(i-h)) mod29 and must be nonzero. Holding is allowed only at C_i=0 and emits P_i=0 without advancing the key. A map retains one witness per reachable h; legality of future transitions depends only on h, not the path history. Empty reachability is an exact exclusion, not a search timeout. The ordinary receiver is unambiguously invertible and all its source-anchor candidates exactly replay the original ciphertext.

| Original start | Phase | sign +1 legal prefix | sign -1 legal prefix |
|---|---:|---:|---:|
| p15:20 | 0 | 127 | 2 |
| p15:20 | 16 | 1 | 68 |
| p16:0 | 0 | 35 | 65 |
| p16:0 | 16 | 27 | 11 |

All eight F-hold candidates die. Across 1650 recurrent phases per sign and start (6600 total), **zero complete paths**. Longest legal prefixes: p15:20 + 543 (phases401/402), p15:20 - 525 (1515/1517), p16 + 565 (1195), p16 - 445 (239). All fail long before the independent p40–53 interval.

Ordinary-consuming source-anchor candidates have training IoC range 0.03433459–0.03487637 and untouched p40–53 IoC range 0.03438674–0.03465717, near 1/29. A held 3008-rune Gibran GP29 control has IoC 0.06195 or 0.06199, depending on the physical-start-shaped offset. The raw source-anchor strings are nonprose. This is a diagnostic negative for ordinary native prose, not an unconditional plaintext impossibility theorem.

## Controls and reproducibility

All 8 matched-length Gibran plants (same text offset500, both starts, phases0/16 and signs) have complete legal F-hold paths with exact forward replay. The first arbitrary legal witness matches only 5788–6417 runes; it is intentionally not a language-ranked receiver and the control does **not** establish unique recovery of the planted truth. The test needs only exact existence to certify the original empty paths. The original corpus is `resources/liber-primus/lp2-corpus.json`; the control uses the first1600 lines of `resources/control/gibran_prophet_58585.txt`, GP transliteration per prior Agent7 receiver. Reproducer: [Node SFT](../sims/agent46_lp2_p15_mod3301_fibonacci_prime_index_sft.cjs). [Complete raw output](lp2-p15-mod3301-fibonacci-prime-index-output.json). Core executed in connected JavaScript V8 on repository inputs; standalone Node/CI not run.

The verified graphic result stays intact. No implication for other modulus choices or different operators is established; do not tune alternative moduli or recurrence coefficients merely to rescue this hypothesis. A new source-selected interpretation of the infinity mark, or another independently observable instruction, is needed before expanding the route.
