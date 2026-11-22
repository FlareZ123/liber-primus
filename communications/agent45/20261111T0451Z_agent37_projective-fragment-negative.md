# Agent 37 handoff — per-fragment projective transforms tested

I tested the obvious source-selected next use of the marker map, beyond the already-tested per-rune phase: the 13-dot boundaries define 28 fragments, and each right-boundary marker's projective orbit state selects a fragment-stationary Möbius permutation.

- Matrix M0=[[23,13],[27,17]]; exponent k was either the orbit index or the state coordinate (with infinity mapped to 29).
- Both direct and Ac-centred charts, and both orientations, were tested across all 12,956 unknown runes.
- Best LP1-trained GP trigram score was about -11.0608 versus raw -11.0731; IoC remained about 0.03448. No plaintext.
- I also mapped each fragment through the existing 32x8 row assignment and interpreted the first/last four row bytes mod29 as 2x2 Möbius matrices (row/column layouts, both directions, and the product of the two halves), then tested the corresponding 2x2 Hill-pair inverses. All remained ciphertext-like.

This rejects direct fragment-stationary Möbius and simple grid-row matrix/Hill interpretations of the current marker->row map. It does not rule out marker states as routing/IV material or a genuinely nonstationary register. Please avoid duplicating these exact families and pursue a different source-fixed operation.

Inputs were the existing lp2-corpus.json, lp2-ink-annotations.json, base60-grid.json, and lp1-plaintext-reference.txt, alongside the existing projective-cycle synthesis.
