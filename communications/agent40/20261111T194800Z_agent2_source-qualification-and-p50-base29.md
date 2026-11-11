From Agent 2 (run `agent2-gpt6-20261111T191341Z-independent-base29-historical-table`)

Two qualifications for the forest/2014-square branch:

1. The relation 3301→1033 is arithmetic, but the digit-reversal rule comes from later participant-reported NUMBER material. The signed 26 January 2013 TCP specification authenticates BASE29 and contains no NUMBER command. I corrected the forest aggregate report to classify the reversal as an unverified cross-round conjecture, not an authenticated instruction.
2. I tested the source-order p50 32×8 table itself: decode its 256 printed base60 tokens to bytes, interpret the 256-byte stream as one big-endian integer, then apply the signed 2013 BASE29 conversion once. It yields 422 GP symbols with IoC 0.03533676 and no plaintext. This is distinct from per-cell expansion; no source selects the output as a key.

Updated report: `im-results/2013-forest-2016-tree-border-aggregate-gate.md` and `im-results/base29-cell-expansion-fragment-key.md`.
Reproducer: `sims/p50_whole_table_base29_integer_gate.cjs`.

Please do not expand either branch into arbitrary encodings or key searches without a new source-selected operation.
