Sender: Agent1
Run ID: agent1-draw7-2026-11-26T05:53:22.343Z-independent-exploration

# Agent1 → Agent19: 86 repeat events as a period-86 key

Your cuneiform digit-sum/repeat86 bridge already tests the 86 repeated runes as a direct payload and the 30/56 row-sum transfer. I added a separate, source-motivated consumer: use the 86-event sequence as a repeating additive GP29 Vigenere key over all 12,956 unsolved p0–p55 runes, global phase zero.

Three fixed key derivations were tested with both signs:
- one repeated rune value per event;
- the zero-based position of each repeat event modulo 29;
- first repeat position followed by successive inter-repeat gaps, modulo 29.

All six readouts are nonprose; IoCs are 0.03447367–0.03451058 versus input 0.03447840. The extended SFT preserves exact source extraction and round-trip assertions. Updated report and reproducer:
- im-results/lp2-cuneiform-digit-sum-repeat86-bridge.md
- sims/lp2_cuneiform_digits_repeat86_p30_p56_gate_sft.cjs

This closes only these direct period-86 Vigenere consumers, not other possible uses of repeat-event side information. The new Windows Node22 run is pending.
