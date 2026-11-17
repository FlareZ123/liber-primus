# LP2 opening 156-word map: 23-cycle-derived F-transparent key gate

**Decision, 17 November 2026:** Twelve finite, source-derived **direct GP29 additive key** interpretations of the p0–p2 23-cycle have no complete legal inverse on the original 716-rune black opening. They also have no legal complete inverse on the independently held-back 3,008 original runes in pp40–53. All twelve 95-rune p57-derived English plaintext plants admit legal complete inverses. **No new LP2 plaintext, key, mechanism, or destination was recovered.** The underlying 156-word pointer graph remains a provisional clue; this excludes only the exact direct-key consumers defined here.

## First-party operand and causal proposal

The original p0–p2 729-rune opening has **158 complete printed words**, the first two being the 13 red heading runes (8+5). Removing these gives 156 body words, a possible 13×12 word map. The 2016 signed Cicada instruction says that words are the map and numbers are the direction. Assign each body word its Gematria Primus **prime sum** `S`, with address `S mod 156`. The red heading sums 347 and 315 select zero-based addresses **35 and 3**. As in [Agent47's source graph](lp2-13x12-wordmap-23cycle-source-gate.md), the first seed runs through cells 36→56→113 into a unique 23-cycle; the second red seed is already on that cycle, beginning at cell 4. The 23-cycle contains the original words with sums 563/569, but its link to the p32 source and the 2016 563×569 signed graphic remains unselected.

This offers a small candidate key alphabet without searching arbitrary numbers: for each selected word, use either `K=S mod 29` (GP29 directly) or the Euclidean quotient `K=floor(S/156)`, interpreting the remainder as the address and the quotient as the key/direction value. Exactly three source-visible key clocks were frozen:

- **FirstFull:** start from the first red seed, emit its three transient words, then repeat its 23-cycle.
- **FirstCycle:** start at the first red seed's 23-cycle entry, omitting its transient.
- **SecondCycle:** start on the second red seed's cell 4, following the same cycle in that rotation.

For each clock and key representation, test both usual GP29 addition signs. These 3×2×2 = **12 specified candidates** do not include arbitrary key rotations, keyword additions, unknown tables, changes of reading order, or language-optimized parameters.

## Exact original-cipher condition

The known authentic p56 cipher permits **plaintext F (GP index 0) to pass through without advancing the key**. For a given source ciphertext rune `C`, key symbol `K`, and sign ±1, a consumed symbol must decode to `P=(C±K) mod 29` with `P != 0`, advancing the key cursor. If `C=0`, an alternative branch may instead decode to literal plaintext F and leave the cursor unchanged. Exhaustive dynamic programming retains **every legal cursor path** at every rune, so it neither assumes skip locations nor fits a plaintext language score.

The p0 opening receiver starts exactly after the source-correct red 13-rune title and its 13-dot marker, then consumes the **716 unchanged black/body ciphertext runes across physical pages 0–2**. A separate original test starts at physical p40 and follows pp40–53 through all **3,008** runes. Both use a reset key cursor at their start. The independent positive encrypts the source's 95 genuinely clear p57 runes under each candidate with the authentic F bypass, and asks the same DP to recover at least one legal complete path.

| Clock | Key | p0 first impossible rune, sign − / + | p40 first impossible rune, sign − / + |
| --- | --- | ---: | ---: |
| FirstFull | Sum mod29 | 21 / 25 | 16 / 94 |
| FirstFull | Quotient | 0 / 113 | 39 / 95 |
| FirstCycle | Sum mod29 | 27 / 162 | 102 / 88 |
| FirstCycle | Quotient | 7 / 59 | 64 / 83 |
| SecondCycle | Sum mod29 | 100 / 126 | 130 / 71 |
| SecondCycle | Quotient | 108 / 113 | 64 / 83 |

Offsets are **zero-based within each tested original stream**, and indicate the first rune after which no legal key-clock state remains. Every p57-derived positive is legally invertible under its corresponding key and sign (12/12). Thus the direct historically documented F-skip receiver fails mathematically on authentic inputs before subjective language scoring.

## Independent check on the four-direction interpretation

All 156 opening body-word prime sums are below **624=4×156**, with maximum **618**. The quotients therefore happen to lie in `{0,1,2,3}`, which might tempt a four-way compass or base-four key interpretation. That bounded range alone is weak evidence: **326 of 2,741** possible 156-word windows through the untouched 2,896-word original unknown manuscript have all their prime sums below 624. In a separate length-conditioned comparison, the remaining manuscript words of the same lengths would predict **1.968** values ≥624 in a 156-word draw, with approximate independent zero-event probability **0.1063**. Neither comparison authenticates four-way directions; they are diagnostic baselines, and the unselected coordinate readout has not been found.

## Evidence and next decision

- **Executable original-input SFT:** [`sims/lp2_156word_cycle_twoheading_ftransparent_gate_sft.cjs`](../sims/lp2_156word_cycle_twoheading_ftransparent_gate_sft.cjs). It constructs the graph from the canonical `resources/lp2-transcription.txt` and `resources/liber-primus/lp2-corpus.json`, pins the two red seeds, enumerates every legal F-skip path, tests both original sources, independently generates all 12 native-GP plants, and asserts the complete failure-offset vector.
- **Native Windows Node22 run:** [manual workflow #44088313209](https://github.com/FlareZ123/liber-primus/actions/runs/44088313209), dispatched on 17 November. Check its conclusion before treating CI as passed.
- **Related p55 gate:** Agent6's [source-23-cycle p55 replay](../communications/broadcast/20261117T1257Z_agent6_wordmap23_parser_fix_and_original_replay.md) already showed that one separate p55 direct-key variant admits a nonprose inverse. **Do not repeat that p55 experiment.**

The failing premise is **turn the 23-cycle's original word sums or quotients into a direct historically familiar GP29 F-transparent additive key for other text**. The graph's existence, its two red-seed entry points, and the intriguing p32/2016 numerical links remain open to a genuinely sourced **different receiver**. No new key catalog, permutation hunt, or period/offset sweep is justified by this negative.
