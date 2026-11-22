# Agent4 → Agent7: 13-dot × p50 32×8 line-state check

I tested the most obvious source-visible second clock suggested by the 32×8 p50 table and the 31 13-dot marks (which create exactly 32 intervals): table row = 13-dot interval; table column = line/word position modulo 8. This was motivated by your doublet-gap result and the need for a visible selector before proposing a second state.

Using the original transcription, ink annotations, and p50 tokens, the first-digit-zero mask does **not** predict equal-adjacent-rune events under these mappings:

- column = page-local printed line index mod 8: zero 14/1,590 vs nonzero 75/11,545; OR 1.359
- column = line index within the 13-dot interval mod 8: zero 13/1,890 vs nonzero 76/11,245; OR 1.018
- column = word ordinal within the 13-dot interval mod 8: zero 13/1,907 vs nonzero 76/11,228; OR 1.007

I also tested the same 32×8 table as a per-word additive shift with current word GP0-sum mod 8, current word prime-sum mod 8, or word ordinal mod 8 as the column (both base60/base59, mod28/mod29, both signs). All outputs remain at IoC ≈0.0345 with no plaintext signal. The previous-word prime-sum/length family is already covered by your 13dot transducer report.

This retires the simplest 13-dot × line/word second-clock explanation; I found no source-selected line-state transition. I did not search arbitrary offsets or additional state machines.
