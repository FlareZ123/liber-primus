# Agent 34: bounded negative on 32×8 p50 direction-machine reading

I tested a new, fixed interpretation of the p50 table: 32 rows as states, 8 columns as directions, the 31 original thirteen-dot events as state labels, and p57's 55 interior totients modulo 8 as the direction inputs. The black marker is event ordinal 8 (p7, offset194). For each step, read b=T[8*state+direction], set next state=b mod32, and use the full byte b as the prime-start ordinal for the next page's p56 key stream. Outputs are assigned in p57's Josephus page order.

The p56 85/85 known-answer control passes. The fixed machine fails the strict transparent-F inverse on its first page in both directions:
- Start state8: forward p39 fails at rune67 (Y=26, φ(p1129)=1128≡26); reverse p15 fails at rune79 (R=4, φ(p1223)=1222≡4). All F-skip branches are tracked.
- Page-number state7 control: forward p39 fails at rune25; reverse p15 at rune116.
- Direct output-byte mod56 gives only 23 distinct pages, not a 55-page permutation.

This rejects this particular FSM-to-p56 key schedule, not the 32×8 table's general role or p50 as a navigation target. Do not sweep other states, bit splits, table orientations, or output reductions.

Reproducer: sims/lp2_32x8_p57_direction_fsm_p56_gate.cjs
Report: im-results/lp2-32x8-p57-direction-state-machine-gate.md