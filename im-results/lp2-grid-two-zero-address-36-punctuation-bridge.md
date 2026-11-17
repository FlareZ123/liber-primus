# Source-addressed p51 zero cells enclose exactly the 36 original LP2 large punctuation events

**17 November 2026, Agent16. Evidence level: exact original-artifact alignment and a negative independent-solved-text consumer. This recovers no unknown LP2 plaintext, historic key or destination.** A new connection places two independently historically meaningful integers at the only two literal zero-valued bytes of the complete original p49–51 numeric table. The 36 intervening bytes equal the count of distinct source-annotated large ink marks. The numerical coincidence is testable; whether its operands or their ordering were author-intended is presently unknown.

## The independently visible numbers and literal grid positions

The signed, verified 2013 Cicada TCP challenge includes the precise numeral operation `BASE29 3301 -> 3QO`. Independently, the original manuscript physical p39 has one red three-rune sequence with GP residues `[27,5,15]`. Its prior-established ascending-power GF29 polynomial is

```text
G(x) = 27 + 5x + 15x² = 15(x - 24)² mod 29.
```

The original pp49–51 numeric table prints exactly **32 rows × 8 columns = 256 base60 two-character numeral cells**. Treating the p39 polynomial's root **24** as a zero-based *row* number selects the first cell of printed row24 at **index 24×8=192**. Treating the actual signed numerical challenge's **3301** as an address in this 256-cell table selects **index 3301 mod256 = 229**. Both original cells are precisely `00`, and a full scan of the original 256 cells shows these are the table's **only** zero bytes.

Both cells occur on original physical p51, `68.jpg`, displayed in 0-based printed grid row24 col0 and row28 col5. They are separated by **37** cell steps, leaving exactly **36 original nonzero cells at indices193–228** between them. This is directly visible in the original JPEG. The original ink-annotation corpus independently records **36 large stops** (31 thirteen-dot, four ten-dot, one twenty-three-dot mark) over p0–57, including **31 marks on the unsolved p0–55** and **five on already solved/clear p56–57**.

Hence the original artifact supports the following exact source-derived relationship, subject to the noted interpretation:

```text
p39 G(x) root = 24;  24 × 8 = 192;  grid[192] = 00
signed 2013 BASE29 operand = 3301;  3301 mod 256 = 229; grid[229] = 00

Number of grid bytes strictly between = 229 - 192 - 1 = 36
Number of original large ink stops        = 36
```

The **36 original base60 byte values**, in fixed printed order with no tuning, are

```text
155 159 89 176 115 105 47 110 74 209 68 194
76 127 21 57 175 6 61 70 150 251 84 142
219 148 59 58 52 51 151 68 52 73 249 144
```

Reduced modulo29, the complete candidate one-per-mark GP key tape reads

```text
I X TH TH EA E E D T G I L E J NG EA U G
O EO C M Y Y T O U F D OE G I D S B EA
```

**The source operands are independently identifiable, but their transfer to table addresses is a hypothesis.** In particular, the 2013 signed message does not instruct modular indexing of the 2014 table, and no manuscript instruction specifies that polynomial root24 addresses row24. Numerical targeting was discovered by inspection of an already-studied table; a chance-corrected probability or authorial intent cannot be inferred from a raw two-zero match alone. Neither `00` byte is typographically highlighted as a special command. The p51 floral side drawings also occur on p50 and do not independently establish the start/stop rule.

## Decisive receiver test from the five already solved marks

A minimally motivated consumer would take the 36 cell values modulo29 and subtract/add one from the rune printed immediately **before** each respective large stop. This is a source-order, position-locked map, not a freely fitted key phase. However, one of the 36 source marks, the p15 chapter-heading mark, is located at local rune offset **0**: **there is no preceding rune**. Furthermore, two distinct p7 black/red marks share the same rune offset194. Therefore the literal one-byte-per-preceding-rune receiver is already **undefined for all 36 events**, unless a new source-selected rule for the first mark and double mark is supplied.

The five marks on solved p56/p57 provide a stronger independent negative without making up a rule for p15. The authentic p56 known prime-totient/plaintext-F-skip inverse gives the actual GP plaintext at its three marked positions; p57 is printed in clear. On these five marker positions, the corresponding trailing five bracket key bytes reduced modulo29 are **[10,23,15,17,28]**. The actual original preceding ciphertext indices are **[4,25,15,18,18]** and the known corresponding plaintext indices are **[23,3,18,18,18]**.

The direct subtractive GP29 receiver recovers the correct known plaintext at **1/5** sites; the additive receiver at **0/5**. Neither provides an authentic source-solved five-symbol bridge. A single chance coincidence among five probes does not justify reconstructing the 31 unknown-mark symbols. The entire 36-byte inner sequence has nonzero GF29 remainder **[14,17,13,27]** on division by the previously established source `H(2013)×G(p39)` degree-four factor, so the bracket is not itself a simple separate four-parity codeword under that polynomial. This does not change the known fact that the **full 256-byte table** is divisible by the same factor.

## Immediate post-table original-rune receiver

A second historically plausible direct consumer uses the 36 delimiter-enclosed GP29 byte residues as a cyclic key on the complete, physically adjacent **170-rune p51–52 post-table sentence**. It fixes the start at the first rune after the table and tries only the two additive directions, without any phase, byte permutation, extra steps or hidden language model. Both complete original sentences round-trip exactly; an independently clear p57 plant also recovers its entire 95 runes under both directions. Their actual post-table output GP29 coincidence values are **0.03369300** (plus sign) and **0.03466759** (minus sign), against **0.06270997** for the authentic clear p57 and **1/29≈0.03448276** for uniform GP29. Both outputs remain ciphertext-like, and neither opens a coherent original language sentence. This retires only direct cyclic additive keying of the printed-following passage, under the two source-fixed signs and phase zero. It does not explain the adjacent-repeat deficit or fifth-back anomalies and does not disprove other source-specified consumers.

## Decision and plausible human solve-path fork

This is a **new finite and source-motivated extraction target**: two independently recognizable puzzle integers address the only two zero-valued cells, and the intervening 36 cells have the precise length of the fully inventoried chapter punctuation events. The two tested direct whole-letter receivers, additive masking at punctuation-adjacent runes and a cyclic additive mask on the complete immediately following sentence, fail their original-source gates. Do **not** assert these 36 bytes are an authentic cipher key, add ad hoc skip symbols, invert arbitrary byte transformations, or promote a hidden plaintext.

A useful successor requires independent evidence that **(i)** polynomial roots are intended as zero-based table rows and 2013 numerical values as cell indices, **and (ii)** an original clue describes how a 36-item byte tape pairs with the 36 stops, including the p15 offset-zero mark and p7 duplicated location. Another legitimate route is a wholly different source-specified use of the zeros as delimiters. The five solved marks give a fixed, unusually affordable correctness gate for any such candidate before touching unknown original text.

**Reproduction:** [read-only CommonJS original-source SFT](../sims/lp2_grid_zero192_229_ink36_knownending_sft.cjs), [successful Windows Node22 original-source run](https://github.com/FlareZ123/liber-primus/actions/runs/44183505379). The signed 2013 fact and the independent original table factorization remain documented at [the existing source-polynomial record](2013-base29-gf29-grid-factor.md); no external source credibility is upgraded by this experiment.
