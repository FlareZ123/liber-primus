# P28 NEXT→6 yields hexadecimal EOT and closes on GOODBYE

**Agent34, 19 November 2026. Classification: source-constrained semantic loop and strong intended-route candidate. No unknown LP2 plaintext is claimed.**

## Result

The authenticated p28 `BASE29 … GOODBYE` bracket contains the original p28 word45. Literal circumference shedding gives its GP0 sequence:

`74 → 57 → 6 = BASE29 → NEXT → 6`.

The cuneiform body selected by the same p28 route contains five visibly red-numbered passages 1–5. Their numbered enclosure ends at the original red 10-dot mark on physical p38 rune offset186. The next source unit is the 161-rune tail from p38 offset186 through the first p39 `&` section boundary.

Use the already established one-based source ordinal convention on the supplied value6. Two natural readings converge independently:

- the **6th rune** of that next unit is GP index **19 = B**; original p50 cell19 is the printed token **`0X`**;
- the **6th complete word** is `XH`, GP0 **22 = p−1**; original p50 cell22 is the printed token **`0x`**.

Across all 34 ordinals for which both a tail rune and a complete tail word exist, **ordinal6 is the only ordinal for which both routes land on a case-insensitive hexadecimal prefix**. There is no phase, key, radix choice, or language score in this census.

The separate p55→`DJU / BEI` handoff selects physical p27. The already frozen p27 receiver is the red heading of length19 immediately followed by a red **13-dot** mark. Under the independently fixed Hadamard shell operation, `H(19,13)=[6,3]`, selecting the DH private exponent6 and GP29 cube exponent3.

Now read the selected punctuation count13 through the same p50 table:

- `p50[13]` is printed **`04`**;
- the canonical byte value at cell13 is also **4**;
- prefixing the independently selected `0x`/ `0X` gives **`0x04`**;
- ASCII control **0x04 is EOT, End of Transmission**.

That semantic endpoint is exactly the role of authenticated protocol opcode **GOODBYE**, which is the right boundary of the original p28 command bracket.

So the closed source path is:

`p28 BASE29→NEXT→6 → next-after-1..5 tail → {6th rune, 6th word} → {0X,0x}`

`p55→p27 → red13 → p50[13]=04 → 0x04 = EOT → GOODBYE`.

## Why the convergence matters

The weakest interpretive step is reading `NEXT→6` manuscript-natively as “the next source unit after the visibly numbered 1–5 enclosure, ordinal6.” The signed 2013 TCP protocol itself gives NEXT no numeric-argument semantics, so this is not presented as a literal TCP command.

The downstream consequences are unusually discriminating:

1. **Rune/word type robustness.** One-based rune6 and word6 independently give uppercase/lowercase versions of the same `0x` marker.
2. **DH typing.** Rune6 is **19=B** and word6 has GP0 **22=p−1**, independently matching the selected DH23 state.
3. **Local uniqueness.** Ordinal6 is the sole double-hex hit across all 34 comparable tail ordinals.
4. **Punctuation semantics.** The only large-punctuation counts present in the ink annotations are 10, 13, and23. Their p50 tokens are `2a`, `04`, and `1R`; **13 alone** becomes an ASCII control under literal hex, specifically EOT.
5. **Command closure.** EOT is a direct technical synonym for ending the transmission, matching GOODBYE rather than a generic English association.

The result therefore supplies a plausible human-recognizable solve-path checkpoint and strengthens the literal-token interpretation of p50 implied by the independently recovered p28 **READ OUT** candidate. It does not yet identify a reversible decoder for the 1,468-rune cuneiform body.

## Decision

Promote `NEXT→6 → 0x` and `red13 → 04 → EOT → GOODBYE` as a strong navigation/semantic-loop candidate. Do not turn `0x` into an unconstrained hexadecimal key search. The productive next question is whether the loop selects a specific **hexadecimal object already present in the source** or simply serves as an intended-route checksum before exiting the cuneiform branch.

## Reproduction

Run:

`node sims/lp2_p28_next6_hex_eot_goodbye_sft.cjs`

The SFT reconstructs p28 `BASE29→NEXT→6`, the p38 red-10 enclosure boundary, both ordinal6 selections, the complete 34-ordinal double-hex census, the p27 red19+13 selector, the p50 `04` byte, and the punctuation-count control.
