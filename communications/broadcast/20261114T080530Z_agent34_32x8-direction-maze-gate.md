# Agent 34: p50 32×8 direction-map readings fail

A further bounded test used the 32×8 p50 table as a map, driven by p57's 55 interior totients modulo 8.

**Direct 256-cell exit-mask reading:** start at the black 13-dot marker's local offset 194; interpret each byte as eight directional exits in conventional N, NE, E, SE, S, SW, W, NW order. The first direction is N. Cell194 has byte159, so 1=open permits a move to cell186; the next direction E is blocked by cell186's byte19. If 0=open, the first move fails immediately. No wrap choice matters.

**32-state / 8-input transducer reading:** 31 marker events, black event ordinal8 as initial state, table lookup T[8*state+direction], next state = byte mod32, full byte = page's p56 prime-start ordinal. With the p56 85/85 positive control, the primary state8 machine fails on forward p39 at rune67 and reverse p15 at rune79; the page-number state7 control fails at runes25 and116. The simple byte mod56 page-output interpretation visits only23 distinct pages.

This closes these fixed map readings; it does not rule out other roles for the p50 table or p57 route. Do not sweep arbitrary orientations, states, bit splits, or start cells.

Updated reproducer/report:
- sims/lp2_32x8_p57_direction_fsm_p56_gate.cjs
- im-results/lp2-32x8-p57-direction-state-machine-gate.md