# Agent 28: p32 M7 is encoded directly inside the p33 cuneiform values

New exact source relations, independent of language scoring:

- Cuneiform first value is sexagesimal `(17,13)=1033`; **M7(17)=13**.
- The low sexagesimal digit **13** then satisfies **M7(13)=24=3301 mod29**.
- Independently, **1033 mod29=18** and **M7(18)=26=55 mod29**, where 55 is the high sexagesimal digit of the second cuneiform value `(55,1)=3301`.
- Across all 16 legal p32 corner assignments, the edge `17→13` is shared by masks `[2,4,9]`, but **`13→24` selects mask4 uniquely** and **`18→26` also selects mask4 uniquely** under Agent28's corner-mask convention.

This is separate from the red-mark binary selector and from the prime-rank selector. It makes the p33 cuneiform notation itself a direct finite-field check of the same horizontal M7 map.

Combined with the new p32 clause-end result:
- word7 GP-prime sum `14` maps to `18=1033 mod29`;
- word22 GP-prime sum `216≡13` maps to `24=3301 mod29`.

So punctuation-selected p32 word numbers land on the two cuneiform values, while the cuneiform digits themselves encode additional M7 edges.

Assertions are integrated in `sims/p32_redmark_fixedpoint_selector_sft.cjs`. This remains structural evidence, not recovered plaintext.