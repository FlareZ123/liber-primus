# p49–51 directional graph: canonical base60 structure and false-path controls

**Status: structural navigation hypothesis only. No unknown LP2 plaintext, key, or complete inverse has been recovered.**

## Source objects and codec

The original p49–51 table contains 256 two-character cells in a 32×8 row-major layout (80 + 104 + 72 cells on the three physical pages). The canonical byte interpretation is base60, as implemented in `sims/p50_miracl_base60_alphabet_match_sft.cjs`; that implementation matches the independent external `canon_256.hex` stream at **256/256 positions**. The table uses 59 distinct printed characters because lowercase `f` does not occur. Removing `f` therefore creates a tempting 59-symbol countermodel, but observed-character coverage alone does not override the independently matched base60 byte stream.

For each canonical byte (B), split (B=29q+r), with (q=lfloor B/29\rfloor) and (0\leq r<29). The remainder (r) names a Gematria Primus rune. A candidate direction channel interprets (q+1) as a standard 3×3 numeric keypad (1=SW, 2=S, 3=SE; 4=W, 5=stay, 6=E; 7=NW, 8=N, 9=NE), with no wrapping at the 32×8 boundary.

The 2016 signed message says “their numbers are the direction,” and the original p49–51 artwork contains repeated bilateral dot ornaments. However, the artwork's geometry has received conflicting readings (an eight-position bilateral motif versus a four-corner plus five-mark/centre interpretation); the five-mark cluster is not a clean regular plus in the raw page coordinates. It does **not** unambiguously specify a numbered keypad, its rotation, or a centre state. Treat (q+1) as a testable investigator convention, not an established author instruction.

Historical context is consistent with caution: the 2014 `#cicadaops` log records participants noticing dots in `liber.jpg`, then dismissing them as an OutGuess payload after comparison with known OutGuess images. This is solver discussion, not author confirmation; it shows that dot/steganography interpretations were already considered, not that the later direction hint selects a keypad. [Original 2014 IRC log](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs/%23cicadaops.freenode.log).

## Canonical base60 graph

The 2016 image is 563×569 pixels; these dimensions are the 103rd and 104th primes. Under the candidate (q+1) mapping:

- Start 103 (width prime ordinal) emits **O → O → G → E → M**, then enters the unique three-cycle **G → E → M** at cells 119 → 127 → 128 → 119.
- Start 104 (height prime ordinal) enters the two-cycle **O ↔ G** at cells 96 and 104.
- The base60 graph has 49 cycles: 29 self-loops, 19 two-cycles, and one three-cycle (GEM). Across all 256 starts, 60 trajectories leave the finite grid and 196 reach cycles; the longest transient is six moves and no cycle exceeds length three. It is therefore **not a long keystream generator**. At most it supplies a short navigation marker.
- The GEM cycle's reverse basin has 11 nodes (eight in-tree nodes, five leaves, maximum depth four). This resembles a tree structurally, but the shape is a property of the selected graph, not independent evidence of creator intent.
- A shuffle calibration found the fixed cell-103-to-GEM event in 2/100,000 global shuffles, 61/100,000 row-preserving shuffles, and 19/100,000 column-preserving shuffles. These are controls for the fixed experiment, **not p-values**: the graph mapping and start were noticed after exploration, so selection effects remain.

The earlier 2012 image dimensions (503×509; prime ordinals 96 and 97) provide controls: 96 enters the O/G two-cycle, while 97 reaches a Y self-loop. The 2016 dimension pair selects a different local structure, but prime-ordinal indexing is itself a hypothesis.

## The signed-message word “lies”: a useful false-path control

The frozen base58 word map gives (operatorname{primeSum}(	ext{lies})=224=58\times3+50), selecting physical p50 and zero-based local word index 3. Because p50 is rune-free, interpreting that index as a table-cell index is a **new semantic extension**, not part of the established rune-word map. Under the row-major 256-cell layout, local index 3 is global one-based cell 84, token `3D`.

Under canonical base60, cell 84 is (193=29\times6+19) (M), followed by cell 75 (205=29\times7+2) (TH), then cell 67 (25=29\times0+25) (AE). If hollow-corner directions (q=0,8) are treated as stops, the conditional readout is **M–TH–AE**, terminating at cell 67. Without that stop rule, the path continues into a short NG/IA cycle.

A noncanonical base59 `f`-skip fork changes the same cells: 84→75→66 emits T–EA–M, which concatenates as **TEAM**, and stops only if (q=8) is declared hollow. This attractive English word is **not a decryption**: it depends on the noncanonical radix, an unverified keypad mapping, a selected hollow-stop rule, and transliteration rather than the rune meanings emphasized by the signed message. The base60 canonical stream gives no such word. Retain TEAM only as an example of the false paths warned about in the 2016 text.

A second candidate marker is cell 81, the first p50 table cell. Its token `2M` is base60 byte 142, so (142=29\times4+26): the candidate keypad maps (q=4) to stay and (r=26) to Y, producing a Y self-loop. Agent5 identified two word-map-derived paths converging on p50 word 0/cell 81 (2014 div331 and 2016 image height569); this is a candidate source convergence, not a validated address rule. The 2016 word “direction” has prime sum 337, which also selects cell 81 under one-based modulo-256 indexing, but that modulus/offset is another analyst choice.

## Decision and next work

The q/r graph is a bounded navigation hypothesis, not a cipher inverse. The 2016 “numbers are direction” phrase motivates testing directionality, but does not authenticate the q+1 keypad, the orientation, the centre/stay state, the hollow-corner stop rule, or the prime-ordinal starts. The base59 TEAM readout is rejected as plaintext because it does not use the canonical byte stream. The base60 GEM cycle is a structural observation, not recovered text; rune meanings may matter more than transliteration.

Do not continue arbitrary keypad rotations, wrap rules, start offsets, or language scoring. A worthwhile successor must supply an independent source selector and a locked prediction on original unknown ciphertext, or explain how a short marker such as GEM/Y leads to such a prediction.

## Reproduction and related evidence

- Canonical base60 cross-check: [`p50_miracl_base60_alphabet_match_sft.cjs`](../sims/p50_miracl_base60_alphabet_match_sft.cjs).
- Base59/base60 comparison: [`p50_radix59_vs60_factor_gate_sft.cjs`](../sims/p50_radix59_vs60_factor_gate_sft.cjs).
- Earlier sequential keypad-trail negative: [`p50_base29_high_digit_keypad_sft.cjs`](../sims/p50_base29_high_digit_keypad_sft.cjs) and [source gate](p50-base29-high-digit-radix9-source-gate.md).
- Signed-message address and p50 “lies” pointer: [full word-map report](lp2-2016-signed-message-base58-word-map.md) and [source script](../sims/lp2_2016_message_base58_word_map.cjs).
- Short-period bound: [Agent5's graph analysis](../communications/agent6/20261114T1245Z_agent5-directional-graph-6step-short-period-bound.md).
- Shuffle calibration: [Agent1's control](../communications/agent6/20261114T1256Z_agent1-p50-gem-shuffle-calibration.md).
- The 2013 missing-prime 180-position family is already covered by [the existing terminal-180 gate](2013-telnet-missing-primes-terminal-180-76.md); do not repeat it.
