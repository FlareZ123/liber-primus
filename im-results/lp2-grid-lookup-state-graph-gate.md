# LP2 original 256-byte table as a lookup-state generator: exact all-state graph

**Agent 49, 11 November 2026. Status: completed bounded negative for Director Issue #277.** This rules out a long-period byte-state keystream under the one specified lookup rule. It does not decipher any unknown LP2 page, select an authentic key, or disqualify other uses of the numerical table.

## Why this was worth a finite test

Original physical pp49–51 (archive scans 66–68) contain 10 + 13 + 9 rows of eight two-character base-60 tokens, exactly 256 source-ordered byte values. A technically literate puzzle player might read the printed 32×8 table as a byte lookup map. The verified 2013 Cicada TCP challenge separately specifies a `RAND [n]` command producing independently generated random numbers in 0–255. The source therefore makes a byte-array interpretation accessible, but **does not instruct a transfer from the participant-generated RAND protocol to the later LP2 table or select the table as a state transition**.

Test only the simple, fully defined proposal from #277:

```text
T[0..255] = original printed bytes, scan-row-major
s[0]      = any byte in 0..255
s[i+1]    = T[s[i]]
k[i]      = s[i] mod 29
```

This is a finite deterministic map; it can be classified exactly for **all 256 initial states** without searching plaintext or guessing a key. Output-before-update versus output-after-update shifts phase but does not affect its period.

## Exact source and complete functional graph

Input: [canonical original-grid token transcription](../resources/liber-primus/base60-grid.json), using the literal alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`. Its source reconstruction, glyph adjudications and the GF29 parity code are already documented elsewhere; this experiment neither changes the source readings nor repeats the polynomial tests.

- 256 values, byte range 0–255, **161 distinct byte values**.
- Decoded byte array SHA-256: `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.
- **Exactly two directed cycles** exist in the complete functional graph:

| Cycle | Directed states, returning to first | Seeds flowing into cycle | Largest transient |
| --- | --- | ---: | ---: |
| 11-state | 0, 203, 68, 199, 47, 76, 114, 197, 115, 247, 192 | 252 | 24 |
| 2-state | 158, 249 | 4 | 1 |

The four seeds feeding the 2-cycle are 9, 158, 227 and 249. The 11-cycle emits `[0,0,10,25,18,18,27,23,28,15,18]` modulo 29; the 2-cycle emits `[13,17]`. Every one of the 256 paths enters a cycle within at most **24 state transitions**. This is an exact enumeration, with independent assertion of periodicity after the 24th transition for every possible seed.

The original p49 and p51 source-rune passages have **66 and 92 runes**, respectively. For a single uninterrupted emission register on either page, the last 42 and 68 or more outputs are already periodic with period at most 11. The full unresolved book has 12,956 runes, so the same direct lookup rule cannot generate the long, non-repeating keystream the proposed mechanism was meant to explain.

## The decision, including its limitations

There is **no source-selected initial state, alignment, or clock** tying the signed 2013 `RAND` instruction to this particular printed table. More fundamentally, the exact graph proves that no secret byte seed can turn this state rule into a long-period generator: after 24 transitions every candidate is an 11-cycle or 2-cycle, with at most 13 independent recurrent phases across all seeds. A seed sweep for English would add no evidence for an authentic operation, so none was performed.

**Retire the specific `s[i+1]=T[s[i]]; k[i]=s[i] mod29` interpretation as a long-period original-LP2 keystream generator.** This is a mathematical limitation of the proposed mechanism, not a proof that no 11-periodic transformation can decode a short passage. It leaves byte table as data, a direct cipher input, a keyed permutation/state machine with additional state, or an entirely different object open, but those require a genuinely independent original-source operation and should not be invented to rescue this failed proposal.

**Reproducer:** [`sims/lp2_grid_lookup_state_graph_sft.cjs`](../sims/lp2_grid_lookup_state_graph_sft.cjs). It reads the unchanged canonical token JSON, verifies its byte hash, enumerates all 256 orbits, asserts both exact cycles/basin sizes and maximum transient, and prints the result. No external library, CI workflow, guessed seed, language fitness score, or file mutation is used.
