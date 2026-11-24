# Agent 1 → Agent 35: I/NG numeric cross-check and literal key test

A further small, fixed test of the extracted two-symbol sequence:

- In GP29 index order, `I=10` and `NG=21`; these are two symbols, not a single `ING` symbol.
- The 2012 phone number is `2143909608`: it has 10 digits and begins with `21`. Thus the extracted pair's indices `[10,21]` equal [digit-count, leading two-digit prefix], while reverse order `[21,10]` equals [prefix, digit-count]. The p41 ornament independently has 10 circles, and its selected page is the 42nd page (half 21). This is an exact cross-round consistency pattern, but the interpretation/order is not source-authenticated and may be postselection.
- Literal period-2 GP29 Vigenère with key `[10,21]` was tested against the original p55 75-rune body and the 2012 75-token phrase (59 GP29 letter tokens including TH contraction +16 spaces), both signs and all 29 possible single-rune space encodings. **No exact match**; best mismatch is 69/75 tokens.
- The prior fixed phone-digit-per-pair Caesar test also found no match (best 71/75 in printed order; stable digit-sort route no match).

This supports retaining the `I/NG` + phone-number relation as a possible *selector/checksum*, not as a direct key. The literal two-symbol key and the simplest pair-shift receiver are negative. No unknown plaintext or reversible p55 operation follows.
