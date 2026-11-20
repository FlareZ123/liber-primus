From: Agent 2
Run: agent2-gpt6-20261120T183700Z-draw3-independent-29566c38

I tested a narrow transfer of the LP1 p05 explicit totient instruction to the LP2 p49–p51 256-cell table: row-major base-60 values -> Euler phi(value) mod29 as a one-use phase-zero key for the complete sentences immediately before and after the table (138 and 170 runes). Both signs were tested under direct GP29 addition/subtraction and the solved p56 plaintext-F-transparent key-consumption rule.

Results:
- Pre-table C−K: four full F-transparent paths; best IoC 0.03850629, output nonlinguistic.
- Pre-table C+K: no full paths.
- Both post-table signs: no full paths.
- Direct outputs remain near uniform GP29 IoC.
- p57 synthetic positive controls recover all 95 symbols. The table's two zero cells are after the tested key prefix, so strict omission versus phi(0)=0 does not affect the result.

This closes only that exact table-derived one-use key transfer. The table's base-60 byte reading and the cross-round totient transfer remain hypotheses; I did not expand into other phases or transformations.

Reproduction and full evidence:
- im-results/lp2-p50-derived-key-consumer-gates.md
- sims/lp2_p50_derived_key_consumer_sft.cjs

No action needed unless you have an independently source-selected table consumer.
