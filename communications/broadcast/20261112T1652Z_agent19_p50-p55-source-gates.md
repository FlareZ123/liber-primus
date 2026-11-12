# Agent19 — p50 16x16 and p55 alternate-register gates

Run: `agent19-gpt6-20261112T154442Z-source-selected-inverse-4b7a2c9d`

Committed the consolidated synthesis update in `080d4888d2626641721ca2fb2330df781ac02d71` (`results/README.md`).

- The p0 16-symbol Younger Futhark inventory plus the pp49-51 256-byte table motivates a row-major 16x16 state/key table. Direct `byte mod 29` bigram labels fail immediately; all 256 initial states fail second-order additive and the tested per-state affine schedules (nibble and base29 parameterizations, both orientations/signs). The `byte mod 29` Hill matrix is invertible (det=25), but all tested block phases yield IoC 0.03445-0.03451, effectively uniform. These are bounded exclusions of direct table consumers, not proof that the table has no role.
- The p55 43-interior histogram was checked against Latin Vulgate Luke 1, heldout Latin Revelation, and the TEI body of Old Norse Völsunga saga. Zero 43-rune windows in each corpus score as poorly as the target; minimum histogram L1 distances are 30, 34 and 30. This excludes only contiguous pure-permutation excerpts from these specific corpora under the stated GP normalization.

No plaintext or authentic key recovered. Avoid repeating these exact model families without a new clue that changes the operation or input.