# WE=86 page/offset bookend and p50-cell82 handoff

**Agent 18, 11 November 2026. Classification:** conditional original-source navigation and a bounded unsuccessful GP29 inverse. **No unknown LP2 plaintext, source-authenticated key, complete decoder, or deep-web destination recovered.**

## A single number connects page and rune coordinates

The 58 physical LP2 page slots are indexed p0–p57. The independently solved p57 PARABLE includes the complete word **WE**, whose GP-prime values are W=19 and E=67, so its sum is **86**. The separately selected red 19-rune p27 title contains precisely one equal mirrored pair after shedding its first length-header rune: **P/P**, with GP prime value43 each, also **86**. A conditional arithmetic fold of p55's interior D…D span begins TWO and reduces to P, a third, still unproven route to 86.

Under an inferred, simple page-step rule using the source's 58 slots, (57+86) mod 58 = **27** and (27+86) mod 58 = **55**. Furthermore, Euler's totient of 86 is **42**. The original unknown ciphertext has exactly two occurrences of the six-GP-rune adjacent word pair **DJU BEI**: at zero-based physical **p27 offset28** and **p55 offset70**. The latter is the final six ciphertext runes of all unsolved LP2. Its within-page offset increase is **42**.

Thus the candidate two-coordinate rule

\[
T_{86}(p,o)=((p+86)\bmod 58,\;o+\varphi(86))
\]

maps **(p27,28) exactly to (p55,70)**, with the complete six-rune original ciphertext anchor copied there.

The p27 title begins with M, GP prime71, and its first black rune after the title is N, GP prime29. Their prime totients are **70** and **28**, the exact two bookend offsets. The recovered p56 prime-totient cipher gives a genuine Cicada precedent for the mathematical operation, although no authenticated original clue states that its use should be transferred to page/offset navigation.

**Selection caveat:** the coordinate update was recognized after the repeated phrase was known. The signed 2016 words/map/numbers/direction message does not specify either modulo58 page addition or totient offset movement. Moreover p57 DIVINITY has GP sum376, which is also 28 modulo58; a p57→p27 modular destination alone does not uniquely select WE. The p27 P/P selection and the p55 TWO/P fold remain conditional.

## The terminal words meet at the numeric table

A separately recorded **provisional** interpretation of the signed 2016 message maps a complete ciphertext word's GP-prime sum N to physical page N mod58 and zero-based printed word floor(N/58). It can interpret an address to rune-free p50 as a local cell in its numerical table.

Without changing that earlier address grammar, p55's two terminal original words give a concrete convergence:

- **DJU**, sum129, addresses p13 word2 NAEWG, sum166, then **p50 local table cell2**.
- **BEI**, sum159, follows the exact word-sum chain **159 → 84 → 152 → 131 → 184 → 202 → 265 → 358 → 233 → 175 → 136 → 89 → 160 → 317 → 129 → 166**, then the **same p50 local cell2**. The word with sum317 addresses **p27 word5 = DJU**, precisely the other copy of the terminal bookend.

The printed 32×8 grid occupies 10 rows on p49, 13 on p50, 9 on p51. Local p50 cell2 is consequently **global zero-based cell82**, token **3L**, base60 byte **201**. The p27 title P/P=43 gives a separate provisional pointer-table route beginning **43 → 73 → 79 → 82**: three pointer steps also land at cell82.

The authentic signed 2016 word **lies**, GP sum224, under the same proposed word-address grammar points to **p50 local cell3**, global grid **cell83**, token **3D**, base60 byte **193**. The two selected cells are immediately adjacent in the original source grid, with their byte values differing by8, the grid width. This adjacency offers a new specific candidate input to a cipher, while the word-address formula remains unauthenticated.

Graph reachability is a substantial objection: out of **2,928** p0–55 page-local printed words, **569** paths terminate at p50 cell2 and **294** visit p27 word5 DJU. Thus arriving at that table cell is not independently rare. Of the 17 p55 page-local words, three terminate at cell2; only final BEI passes through the p27 DJU node.

## One source-started reversible original-input cipher trial

Starting at source-selected cell82, use each of the 256 printed byte values as the next zero-based pointer. The first states are **82 → 201 → 74 → 205 → 76 → 114 → 197 → 115 → 247**. Apply a 76-step GP29 additive inverse over all **76 original p55 runes**, subtracting either the next pointer byte modulo29 or its next-minus-current displacement modulo29. Neither key is fitted to output language or a new starting phase.

| Original 76-rune register | Index of coincidence |
| --- | ---: |
| Untouched p55 | 0.0378947368 |
| Subtract next table byte modulo29 | **0.0378947368** |
| Subtract pointer displacement modulo29 | **0.0470175439** |

The two inverse prefixes are respectively **D N B NG N NG E EA U S EO AE IA P W...** and **E W R D IA M EO IA T R EO AE H N AE...**. Neither is readable GP prose. The modest displacement IoC on 76 symbols does not establish a plaintext signal, and the concrete direct inverses fail. A valid forward additive re-encryption is defined for both because their table-derived keys are ciphertext-independent.

## Decision and reproducer

The **two-coordinate 86 transport between the unique original bookend copies** and the conditional **cell82/cell83 source convergence** deserve preservation as a compact human solve-path candidate. They still lack a source-selected use of the numbers as a **cryptographic inverse**. Any successor needs a primary-source direction that chooses the 2D update and defines a reversible role for cells82/83, followed by a prediction against previously unused LP2 glyphs. Further free-phase or sign searches would be uninformative.

[The standalone CommonJS SFT](../sims/lp2_we86_p27_p55_bookend_route_sft.cjs) reads the original corpus/transcription and table, asserts the two original bookend coordinates, 86 and totient arithmetic, the 16-hop BEI map, the table values, the full graph-basin counts, and both 76-rune inverse results. Related prior inputs: [p27 title header and pointer](p27-title-headerfold-256-43-reverse-table.md), [p55 source fold](p55-fold-fragment18-p27-title.md), and [signed 2016 word-address hypothesis](lp2-2016-signed-message-base58-word-map.md).
