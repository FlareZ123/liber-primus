# Physical p49–51 prose/table crossing: 10|13|9 framing and missing in-band opcode

**Agent32, 22 November 2026; response to Director #2269. Classification: original-source framing and a concrete cipher dependency, without a recovered in-band decipherment.** An exact physical three-page arrangement supports a small number of typed navigation hypotheses, but the unknown prose does not specify how the intervening bytes transform a recoverable state. The evidence supports neither a plaintext claim nor a key-search campaign.

## What a contemporary solver would encounter

The original artwork and text occur in strict physical order across LP2 scans [66.jpg](../resources/liber-primus/66.jpg), [67.jpg](../resources/liber-primus/67.jpg), and [68.jpg](../resources/liber-primus/68.jpg). The canonical original-derived numeric corpus [base60-grid.json](../resources/liber-primus/base60-grid.json) explicitly records source pages `[49,50,51]` and physical `page_row_counts=[10,13,9]`; the entire 256-token object has **32 rows × 8 columns**.

| Physical LP2 page | Source order | Original rune flank | Printed table | Visual clue |
| --- | --- | --- | --- | --- |
| **p49** (scan66) | 3 runic lines, then table | **66 runes**, line lengths **23,22,21** | **10 rows** (global rows0–9) | after rune66: **10 red dots** |
| **p50** (scan67) | table only | 0 runes | **13 rows** (global rows10–22) | mirrored botanical artwork |
| **p51** (scan68) | table, then 4 runic lines | **92 runes**, lengths **24,21,23,24** | **9 rows** (global rows23–31) | no distinct rune initiation header |

The final original printed word on p49 ends in a **full stop** and the curated transcription then closes a paragraph (`.` followed by editorial `&`). The p51 rune flank begins a new word. Its last printed three-rune fragment `ᛈᛚᚠ` carries into the opening rune `ᛈ` on p52, where that word ends. The panel therefore sits between **a completed p49 paragraph and the start of a p51 paragraph which naturally continues onto p52**. There is no original word split across the 256 numeral tokens and no visible source command saying “continue the same rune-key clock” across the inserted object.

This is a positive causal constraint. A putative in-band mechanism cannot infer that p49 and p51 runes form a single 158-rune continuous key clock solely because the book places them on opposite sides of the table. Any such clock, in either direction, is an algorithmic assumption still requiring an original textual selector.

## Bounded visual numerology and the exact table boundary

The original large punctuation annotations [lp2-ink-annotations.json](../resources/liber-primus/lp2-ink-annotations.json) show p49 `[rune offset66,10 red dots]`. On independently solved final p57, the first heading mark is **13 red dots**, and the terminal mark is **23 red dots**. Those counts coincide with p49's **10** numerical rows, p50's **13** numerical rows, and their cumulative boundary **10+13=23**. Source row **23** (zero-based) is the **first original p51 numeral row**.

Under the separately **hypothetical** drop-unused-`f` base59 zero-address grammar, original cell **189** (`189=23×8+5`) is a unique whole-table fixed point, physically row23, column5 in this same zero-based grid. The [explicit prior table-route report](lp2-p57-red13-p50-outerring-lp3-source-gate.md) additionally shows a 13-cell path from p57 red13's selected outer position13, ending via solved word GP0(SURFACE)=67 to root189. The source intersection *proposes* a navigation from the p57 punctuation into the start of p51's numeric block. It does not instruct how to change the unknown GP29 rune sequence.

The red punctuation values **are reused elsewhere**: the original annotation registry has 31 large marks of size13, four of size10, and one of size23. Their correspondence to printing capacity and to a retrospectively selected graph fixed point is therefore a **conditional structural observation**, not a calibrated evidence probability. Likewise, the p50 13-row fill may simply reflect page typography.

## In-band solve gate and the missing source input

A genuine p49→table→p51 algorithm would need all of these source-defined quantities: an unambiguous **state initializer from the unknown original p49 paragraph**, a choice of numeral grammar and byte serialization (original printed base60 or inferred base59), an actual **state-update and rune-symbol transform**, a defined **paragraph reset or carry at the table**, and a p51/p52 whole-word plaintext check under the same untouched rule. The printed cells and red markers fix geometry, offsets and select some coordinates; they do **not** supply the state-update and inverse operator. Earlier [TEA/XTEA/AES bounds](../im-results/lp2-p50-selfcontained-key-schedule-and-64bit-roundtrace-original-gate.md), stationary table transforms and repeating direct-key tests do not fill this missing input, and their negatives are local to those tested operators.

The closest finite, source-constrained consumer from the related red13→SURFACE→189 route was the **known solved p56 prime-minus-one/totient inverse** on untouched physical p55, with prime-index start189, GP29 subtraction, and the three original Fehu positions15,25,41 treated as literal nonconsuming interruptions. It roundtrips on a solved p56 positive reference, but original p55 remains nonlinguistic (original IoC0.0378947; trial IoC0.0350877). This is a **negative of that exact direct decoder**, not a rejection of all descendants of the numeric coordinate. Its reproducibility is in [the amended source SFT](../sims/lp2_p50_lp3_pointer_b59_b60_cycles_sft.cjs), Windows Node22 hosted CI [run45029869628](https://github.com/FlareZ123/liber-primus/actions/runs/45029869628).

**Decision:** without a real decrypted p49 setup paragraph, signed in-band state opcode, or an independently typed p51 receiver key, a complete reversible decoder cannot yet be selected from the original printing. Independent p49 paragraph recovery is a prerequisite worth prioritizing. Preserve the new physical framing as a constraint; avoid treating arbitrary byte-pointer walks as a substitute for an in-band cipher. No unknown LP2 rune was recovered.
