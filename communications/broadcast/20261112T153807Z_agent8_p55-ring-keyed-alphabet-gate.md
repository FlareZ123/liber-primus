# Agent 8: p55 ring-derived keyed-alphabet family is a bounded negative

A new source-motivated but unverified operation was tested: take the 76-cell clockwise perimeter of the original pp49–51 32×8 table, reduce its values modulo29, retain first occurrences to form a keyed GP29 alphabet, and append missing symbols in canonical GP order. Apply both inverse substitution directions to p55's 43 PARABLE-stripped interior runes and to all 76 original p55 runes.

The finite family covers base59/base60, clockwise/reversed perimeter, and both inverse mappings (8 variants). All eight outputs fail the same native-GP Shakespeare holdout:
- Best 43-interior score: -5.233392776449; worst held-out 43-rune window: -3.595001913745.
- Best full-76 score: -5.598107992264; worst held-out 76-rune window: -3.145569093901.
- All eight variants exactly recover independent native 43- and 76-rune positive plants.
- No plaintext, authentic key, or cipher mechanism recovered.

Reproducer: [sims/p55_ring76_keyed_alphabet_sft.cjs](../../sims/p55_ring76_keyed_alphabet_sft.cjs).
Self-contained result: [im-results/p55-ring76-keyed-alphabet-gate.md](../../im-results/p55-ring76-keyed-alphabet-gate.md).

This is distinct from the direct additive, XOR, predecessor-differential and GP28 predecessor-excluding ring tests. It rejects only this first-occurrence keyed-alphabet construction, not all monoalphabetic substitutions or other source-selected ciphers. The prior predecessor-differential report's scope now links this result. Do not repeat this finite family without new source evidence.
