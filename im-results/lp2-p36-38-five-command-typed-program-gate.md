# Five numbered p36–38 units versus historical command program (#2561)

## Decision

The frozen mapping unit1→BASE29, unit2→KOAN, unit3→DH, unit4→DATA, unit5→NEXT does not define a composable typed program or a reversible GP29 mapping. Stop at the low-cost type audit; no cipher scoring or new private-state search. This decision is narrower than a rejection of historical BASE29 or DH.

The [actual signed 2013 TCP specification](../resources/external/2013-tcp-server-signed-source.md), [preserved participant log](../resources/historical/cicada2013-clientlog-1362290293-9.txt), and [prior p33–39 missing-state counterexample](lp2-p33-39-cuneiform-base29-key-gate.md) suffice. The log's NEXT payload is authenticated, not the surrounding participant-side transcript or its availability to a 2014 solver. #2556's separate availability question remains unresolved at this checkpoint.

## Frozen type audit

| Original unit | Runes | Proposed stage | Exact historical input → output | Missing source binding |
|---|---:|---|---|---|
| 1 | 139 | BASE29 | Integer 1033 → three radix29 digits 16I | No rule assigning 139 runes to the conversion result or its consuming inverse; the radix output is fixed only conditional on this command choice. |
| 2 | 91 | KOAN | Argumentless command → participant-selected dot-terminated text | No typed input from BASE29 and no fixed organizer-authored parable. Four identical participant outputs in the log, not a chain of four new operations. |
| 3 | 98 | DH | Prime modulus 3301, participant-selected base/secret and client public value → participant public share and shared value | Printed modulus alone cannot determine base, exponents or client share. The intact rune unit has no specified field serialization. |
| 4 | 96 | DATA | Server status plus shared integer returned by DH | DATA is a response code, not an independently callable stage. No inverse transformation specified for this unit. |
| 5 | 129 | NEXT | Client-supplied text → participant stores and acknowledges it | No input link from DATA, no organizer-selected LP2 ciphertext receiver; the historical payload is terminal recruitment text. |

The fifth unit cannot be treated as a computed plaintext output of the fourth merely because the operations occur in that order in a log. In particular, BASE29's output has no input slot in KOAN; KOAN text is not a modulus or public share; DATA shares the state of DH rather than defining a new operation; NEXT is a text sink rather than a DH decoder. The historical trace contains intervening unrelated RAND/QUINE requests and four KOAN calls.

## Exact stopping gate

The already-established arithmetic counterexample #2557 fixes modulus, participant base and client public share, yet valid participant secrets 331 and 332 give different shared values 1067 and 195. The historical command types therefore cannot by themselves select a unique numerical output from the LP2 numerals. Even granting the exact archived transcript, the independent source-fixed mapping from five original variable-length rune units to the protocol fields is still missing. The fixed direct BASE29 digits have already failed their declared key/transpose consumers; the [fixed DH tuple table test](https://github.com/FlareZ123/liber-primus/issues/2560) and [prime_echo table comparison](https://github.com/FlareZ123/liber-primus/issues/2563) do not supply missing state.

No planted mapping is constructed because that would require inventing precisely the unknown source binding. No repeat of #2557 arithmetic or prior cipher runs. Reopen only for a new independently source-selected command tag/field serialization, complete role/state binding and reversible original receiver. No plaintext or key.
