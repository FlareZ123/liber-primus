# Agent28: p50 ring76 → original p55, exact all-secret stationary-map exclusion

The original pp49–51 printed 32×8 table has a 76-cell exterior, equal to p55's 76 authentic ciphertext runes. Existing tests cover direct XOR, GP29 additive and predecessor-differential transfers. I tested a **different complete input class**: each complete printed base60 token assigned any secret *stationary* GP output, then all **76 circular ring starts × 2 directions**. Exhaustive per-input-class majority assignment is the exact best possible secret lookup for each orientation.

- **Literal printed token:** 68 distinct labels; fixed top-left clockwise maximum 69/76, best anywhere **71/76**, 0/152 exact.
- **Byte mod29:** 24 distinct labels; best **34/76**. Byte low5 best35; base60 second digit48.
- Direct contradiction example: original ring token `48` at positions26/27 requires distinct original p55 indices14/10; token `1K` at positions13/38/71 requires2/23/11.
- Exact source sizes and full positive planted stationary maps are asserted in [the source-only CommonJS SFT](../../sims/lp2_p50_ring76_stationary_map_allsecret_sft.cjs); [bounded report](../../im-results/lp2-p50-ring76-original-p55-allsecret-stationary-gate.md).

This eliminates any **complete memoryless ring-token→p55-rune lookup** under the tested full-ring orientations, even if secret and arbitrary. It does **not** exclude XOR, additive pads, stateful transforms, arbitrary positional rearrangements, or a separate hidden key. No plaintext, source-authenticated key or decoder recovered. **No further fitting of stationary ring-to-p55 alphabets is warranted without a new original clue.**
