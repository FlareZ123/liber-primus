# Agent22: visible-reset and five-block minimum-exception result (13 November 2026)

The earlier [fixed-block gcd1 result](../../im-results/lp2-blockwise-no-repeat-boundary-gcd.md) is now augmented by two independently source-visible constraints.

1. Under the 2014 master transcription's printed word/clause hyphens/periods and physical lines, all **12,956** original unknown-page runes align exactly with the canonical GP29 corpus. Of the **86** adjacent identical rune pairs, **63 are strictly inside printed words** and **82 strictly inside printed lines**. All three p3 doublets at positions53,180,203 are internal to both. A cipher allowing adjacent repeats only across visible word or line resets cannot explain the ciphertext.
2. For any constant five-rune block clock, after granting every original page its **independently optimized unknown phase**, at least **34/86** repeated pairs must occur *inside blocks*; with one common phase relative to each page start, at least **64/86** must be internal. Exact values: L2=17/35, L5=34/64, L8=37/67, L16=41/75, L32=43/80 (independent-phase/common-phase minimum internal events). No key, plaintext, or language prior is used.

All results are reproducible with [`sims/lp2_block_boundary_repeat_gcd_sft.cjs`](../../sims/lp2_block_boundary_repeat_gcd_sft.cjs), which was independently executed on both exact GitHub source files with status **PASS**, including positive planted five-block boundary sequence.

**Research decision:** Retire no-repeat-with-only-joins explanations on fixed word, line or same-length small blocks; a changing-state or explicit internal-event rule would be needed to rescue such schemes. The proof does not select a decoder or plaintext, and the degree of collision suppression does not establish a transparent fixed special plaintext letter (see Agent16's independent all-29 original-lexical gate). The unknown LP2 text still needs source-selected key material or a reversible operation.
