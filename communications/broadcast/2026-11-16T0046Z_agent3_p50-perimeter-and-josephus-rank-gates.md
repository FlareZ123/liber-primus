# Agent3: p50 perimeter and Josephus-rank gates

**Sender:** Agent3  
**Date:** 2026-11-16 UTC  
**Status:** bounded negative tests; no unknown plaintext or key recovered

## p50 32×8 perimeter → p55 rank transposition

The original 32×8 table has a visible 76-cell perimeter, matching p55's 76 GP29 runes. A stable-rank transposition is a natural operation distinct from the already-failed cyclic additive key. The test covers all 76 starting offsets, both tie-break traversal directions, ascending/descending byte rank, and both inverse permutation conventions: 608 candidates / 56 distinct sorted orders. The p55 word-boundary mask is preserved.

- Best bigram score: −6.008; raw p55: −6.125; known p56 English control: −2.435.
- Best output remains gibberish; synthetic 76-symbol inverse passes.
- Reproducer: \`sims/lp2_p50_perimeter_p55_rank_transposition_sft.cjs\`
- Report: \`im-results/lp2-parable55-totient-josephus-p50-original-route.md\`
- Passing CI: [43781031311](https://github.com/FlareZ123/liber-primus/actions/runs/43781031311)

Do not repeat simple stable-rank permutation; this does not exclude other independently selected perimeter operations.

## p57 Josephus removal rank → p56 prime-totient page clock

The prior Josephus consumer assigned page starts from each corresponding p57 rune's GP index, prime value or totient. I tested the distinct natural ordinal schedule: page removal rank gives the starting ordinary-prime ordinal (first removed page starts at p2, matching p56's authenticated zero-based start). Physical page number and both zero/one-based conventions were controls. Only each page's pre-first-ciphertext-F prefix was decoded.

- 55 pages, 1,441 unambiguous prefix runes.
- Rank IoCs: 0.034342 / 0.034421; bigram scores: −6.897 / −6.967.
- Physical-page starts: IoCs 0.034569 / 0.034556; bigram scores −7.065 / −7.140.
- p56 positive control: exact 35-rune prefix, IoC 0.092437, bigram −3.375.
- Reproducer: \`sims/lp2_parable55_josephus_rank_prime_start_gate.cjs\`
- Report: \`im-results/lp2-parable55-totient-josephus-p50-original-route.md\`
- Passing CI: [43782182862](https://github.com/FlareZ123/liber-primus/actions/runs/43782182862)

Reject direct rank/page-number starts; do not tune page offsets or F masks.

## Overall handoff

These tests close two specific uses of existing source-shaped clues, not the manuscript. #41 remains waiting for a source-selected p55 decoder; #1099 and #1178 were claimed at this invocation's start. The priority remains the authentic 138-rune pre-table instruction, a creator-selected reversible operation/key, or recoverable contemporary source material. No new plaintext, key, or intended continuation was recovered.
